import { workspaceFetch, workspaceStorage } from "@/features/local-testing/sandbox";
import type { LearningProgress, SaveLearningInput, StudentWorkspace, TeacherConversation } from "@/contracts/workspace";
import { canImportGuestLearning, GUEST_LEARNING_KEY, hasGuestLearning, readGuestLearning, writeGuestLearning, type GuestStorage } from "./guest-learning";
import { decodeProgress } from "@/features/theory/progress";

type SnapshotKey = "demoSnapshot" | "studySnapshot";
export type LearningRecovery = { uid: string; revision: number; baseVersion: number; local: Partial<Pick<SaveLearningInput, SnapshotKey>>; remote: LearningProgress | null };
export type WorkspaceState = {
  conflict?: LearningRecovery | null;
  status: "loading" | "ready" | "error" | "unauthenticated";
  workspace: StudentWorkspace | null;
  saving: boolean;
  error: string;
  notice: string;
  generation: number;
  guestLearning?: LearningProgress | null;
};
type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;
const initialState: WorkspaceState = { conflict: null, status: "loading", workspace: null, saving: false, error: "", notice: "", generation: 0 };
const cacheKey = (uid: string, revision: number) => `basedspeak.learning.${encodeURIComponent(uid)}.${revision}`;

async function payload(response: Response) {
  const value = await response.json().catch(() => null);
  if (!response.ok) throw new Error(typeof value?.error === "string" ? value.error : "Não foi possível conectar ao seu espaço. Tente novamente.");
  return value;
}

/** Account snapshots are authoritative. Guest work is separate and can only be imported explicitly into an empty account. */
export function createWorkspaceStore(fetcher: Fetcher, storage?: () => GuestStorage, recoveryStorage: () => GuestStorage | undefined = () => typeof window === "undefined" ? undefined : window.sessionStorage) {
  let state = initialState;
  let loadPromise: Promise<void> | null = null;
  let writePromise: Promise<void> | null = null;
  let importPromise: Promise<void> | null = null;
  let resetCheckPromise: Promise<void> | null = null;
  const recoveryKey = "basedspeak.learning.conflict.v1";
  let pending: Partial<Pick<SaveLearningInput, SnapshotKey>> = {};
  let timer: ReturnType<typeof setTimeout> | undefined;
  let ticket = 0;
  let edits = 0;
  let contactEdits = 0;
  let editing = false;
  let draftEdits = 0;
  let importing = false;
  let tweaking = false;
  let activeControl: object | null = null;
  const listeners = new Set<() => void>();
  const guest = () => { try { return readGuestLearning(storage?.()); } catch { return readGuestLearning(); } };
  const permitted = (status: string) => status === "active" || status === "pending";
  const emit = (patch: Partial<WorkspaceState>) => { state = { ...state, ...patch }; listeners.forEach(listener => listener()); };
  const clearCache = (workspace: StudentWorkspace | null) => {
    if (!workspace) return;
    try { storage?.().removeItem(cacheKey(workspace.account.id, workspace.learning.revision)); } catch { /* Cache is optional. */ }
  };
  const clearRecovery = () => { try { recoveryStorage()?.removeItem(recoveryKey); } catch { /* Memory remains isolated. */ } };
  const keepRecovery = (conflict: LearningRecovery) => { try { recoveryStorage()?.setItem(recoveryKey, JSON.stringify(conflict)); } catch { /* Before-unload warning still protects this page. */ } };
  const readRecovery = (): LearningRecovery | null => {
    try {
      const raw = recoveryStorage()?.getItem?.(recoveryKey);
      if (!raw) return null;
      if (raw.length > 850_000) throw new Error("Invalid recovery");
      const value = JSON.parse(raw);
      if (!value || typeof value.uid !== "string" || !Number.isSafeInteger(value.revision) || value.revision < 0 || !Number.isSafeInteger(value.baseVersion) || value.baseVersion < 0 || !value.local || typeof value.local !== "object" || Array.isArray(value.local)) throw new Error("Invalid recovery");
      for (const [key, snapshot] of Object.entries(value.local)) if (!["demoSnapshot", "studySnapshot"].includes(key) || (snapshot !== null && typeof snapshot !== "string")) throw new Error("Invalid recovery");
      return { uid: value.uid, revision: value.revision, baseVersion: value.baseVersion, local: value.local, remote: null };
    } catch { clearRecovery(); return null; }
  };
  const forgetPending = () => { clearTimeout(timer); pending = {}; editing = false; clearCache(state.workspace); };
  const replace = (workspace: StudentWorkspace, notice = "", control?: object) => {
    const previous = state.workspace;
    const changed = previous?.account.id !== workspace.account.id || previous.learning.revision !== workspace.learning.revision || previous.account.status !== workspace.account.status;
    const contentChanged = previous?.learning.demoSnapshot !== workspace.learning.demoSnapshot || previous?.learning.studySnapshot !== workspace.learning.studySnapshot;
    const approved = previous?.account.id === workspace.account.id && previous.account.status === "pending" && workspace.account.status === "active";
    if (changed) {
      forgetPending(); clearRecovery(); ticket++;
      // Old requests may still finish, but cannot block or mutate the new epoch.
      loadPromise = null; writePromise = null; importPromise = null; resetCheckPromise = null; importing = false;
      if (activeControl !== control) { activeControl = null; tweaking = false; }
    }
    emit({ conflict: changed ? null : state.conflict, workspace, guestLearning: guest(), status: "ready", saving: false, error: "", notice: notice || (approved ? "Seu cadastro foi aprovado pelo professor." : previous && changed ? "Seu acesso ou progresso foi atualizado. O estado atual já está carregado." : state.notice), generation: state.generation + (changed || contentChanged ? 1 : 0) });
  };
  const read = () => fetcher("/api/student/workspace", { credentials: "same-origin", cache: "no-store" });
  const deny = (response: Response) => {
    if (response.status !== 401) return false;
    if (state.status === "unauthenticated" && state.guestLearning) return true;
    forgetPending(); clearRecovery(); ticket++;
    emit({ conflict: null, workspace: null, guestLearning: guest(), status: "unauthenticated", saving: false, error: state.workspace ? "Sua sessão terminou. Entre novamente para acessar seu painel." : "", generation: state.generation + 1 });
    return true;
  };

  async function preserveConflict(owner: StudentWorkspace, local: Partial<Pick<SaveLearningInput, SnapshotKey>>, remote?: StudentWorkspace) {
    const conflict: LearningRecovery = { uid: owner.account.id, revision: owner.learning.revision, baseVersion: owner.learning.saveVersion, local: { ...local, ...pending }, remote: null };
    forgetPending(); ticket++;
    keepRecovery(conflict);
    emit({ conflict, saving: false, error: "", notice: "Outro salvamento foi encontrado. Seu percurso desta aba foi preservado; escolha como continuar." });
    const conflictTicket = ticket;
    try {
      if (!remote) { const response = await read(); if (conflictTicket !== ticket || deny(response)) return; remote = await payload(response) as StudentWorkspace; }
      if (conflictTicket !== ticket) return;
      if (remote.account.id !== conflict.uid || remote.learning.revision !== conflict.revision || !permitted(remote.account.status)) {
        clearRecovery(); emit({ conflict: null }); replace(remote, "Seu acesso ou progresso foi atualizado. Carregamos o estado atual."); return;
      }
      const refreshed = { ...conflict, remote: remote.learning };
      keepRecovery(refreshed); emit({ conflict: refreshed });
    } catch { if (conflictTicket === ticket) emit({ error: "Seu percurso foi preservado. Conecte-se para conferir a versão salva na conta." }); }
  }

  async function load(background = false) {
    if (importPromise) await importPromise.catch(() => {});
    if (state.conflict && state.workspace) return preserveConflict(state.workspace, state.conflict.local);
    if (loadPromise) return loadPromise;
    if (writePromise) { await writePromise; if (state.status !== "ready") return; }
    // Never replace unsent work with an older GET. flush validates its owner/revision first.
    if (Object.keys(pending).length) return flush();
    const currentTicket = ticket;
    const currentEdits = edits;
    const currentContactEdits = contactEdits;
    if (!background || (state.status !== "ready" && !state.guestLearning)) emit({ status: "loading", error: "" });
    const loading = (async () => {
      try {
        const response = await read();
        if (currentTicket !== ticket || deny(response)) return;
        const workspace = await payload(response) as StudentWorkspace;
        if (currentTicket === ticket) {
          // A navigation refresh may overlap editing or saving. An older GET
          // cannot replace newer work from this same account and revision.
          if (permitted(workspace.account.status) && state.workspace?.account.id === workspace.account.id && state.workspace.learning.revision === workspace.learning.revision
            && (editing || edits !== currentEdits || Object.keys(pending).length || writePromise)) workspace.learning = state.workspace.learning;
          // A background read started before a confirmed send must not erase it.
          if (state.workspace?.account.id === workspace.account.id && state.workspace.learning.revision === workspace.learning.revision && contactEdits !== currentContactEdits) workspace.conversations = state.workspace.conversations;
          const recovered = readRecovery();
          replace(workspace);
          if (recovered?.uid === workspace.account.id && recovered.revision === workspace.learning.revision && permitted(workspace.account.status)) {
            await preserveConflict(workspace, recovered.local, workspace);
          } else if (recovered) clearRecovery();
          if (currentTicket === ticket && (Object.keys(pending).length || writePromise)) emit({ saving:true });
        }
      } catch (error) {
        if (currentTicket === ticket) {
          if (!state.workspace) emit({ status: "unauthenticated", guestLearning: guest(), saving: false, error: "", notice: "Não foi possível conectar sua conta. Você pode explorar a demo com o avanço salvo apenas neste navegador.", generation: state.generation + 1 });
          else emit({ status: "error", saving: false, error: error instanceof Error ? error.message : "Não foi possível carregar seu espaço." });
        }
      }
    })();
    loadPromise = loading;
    try { await loading; } finally { if (loadPromise === loading) loadPromise = null; }
  }

  /** Owner controls can reset another device while its old save is still in flight. */
  async function checkForReset() {
    const owner = state.workspace;
    if (!owner?.account.canTest) return;
    if (resetCheckPromise) return resetCheckPromise;
    const currentTicket = ticket;
    const currentEdits = edits;
    const currentContactEdits = contactEdits;
    const checking = (async () => {
      try {
        const response = await read();
        if (currentTicket !== ticket || deny(response)) return;
        const remote = await payload(response) as StudentWorkspace;
        if (currentTicket !== ticket || state.workspace?.account.id !== owner.account.id) return;
        if (remote.account.id !== owner.account.id || remote.learning.revision !== owner.learning.revision || remote.account.status !== owner.account.status) {
          replace(remote, "O estado da sua conta foi atualizado noutro aparelho. Carregamos o percurso atual.");
          return;
        }
        // Ordinary saves must keep the current editing base and any form draft.
        if (state.conflict) { await preserveConflict(state.workspace, state.conflict.local, remote); return; }
        if (editing || edits !== currentEdits || Object.keys(pending).length || writePromise || importPromise || tweaking) remote.learning = state.workspace.learning;
        if (contactEdits !== currentContactEdits) remote.conversations = state.workspace.conversations;
        const saving = Boolean(Object.keys(pending).length || writePromise || importPromise || tweaking);
        replace(remote);
        if (currentTicket === ticket && saving) emit({ saving: true });
      } catch {
        // A failed background check is not a reset and must not hide the controls.
      }
    })();
    resetCheckPromise = checking;
    try { await checking; } finally { if (resetCheckPromise === checking) resetCheckPromise = null; }
  }

  async function refresh() {
    if (loadPromise) await loadPromise;
    if (Object.keys(pending).length || writePromise) await flush();
    if (state.status === "ready" || state.guestLearning) await load(true);
  }

  async function flush() {
    clearTimeout(timer);
    if (state.conflict) return;
    if (writePromise) { await writePromise; if (Object.keys(pending).length && state.status === "ready") return flush(); return; }
    const owner = state.workspace;
    if (!owner || !Object.keys(pending).length || !permitted(owner.account.status)) return;
    const currentTicket = ticket;
    emit({ saving: true, error: "" });
    const writing = (async () => {
      let submitted: typeof pending = {};
      try {
        // Check identity again before every write: an open tab may outlive a login/logout.
        const verification = await read();
        if (currentTicket !== ticket || deny(verification)) return;
        const verified = await payload(verification) as StudentWorkspace;
        if (currentTicket !== ticket) return;
        if (verified.account.id !== owner.account.id || verified.learning.revision !== owner.learning.revision || !permitted(verified.account.status)) {
          forgetPending(); replace(verified, "Seu acesso ou progresso mudou. Carregamos o estado atual da sua conta."); return;
        }
        if (verified.learning.saveVersion !== owner.learning.saveVersion) {
          await preserveConflict(owner, pending, verified); return;
        }
        submitted = pending; pending = {};
        const submittedDraftEdits = draftEdits;
        const response = await fetcher("/api/student/learning", {
          method: "PUT", credentials: "same-origin", headers: { "Content-Type": "application/json", "X-Workspace-Uid": owner.account.id },
          body: JSON.stringify({ revision: owner.learning.revision, saveVersion: owner.learning.saveVersion, ...submitted }),
        });
        if (currentTicket !== ticket || deny(response)) return;
        if (response.status === 409) {
          const failure = await response.clone().json().catch(() => null);
          if (failure?.code === "LEARNING_SAVE_CONFLICT") { await preserveConflict(owner, submitted); return; }
          // Drop ALL old-epoch work, including edits made while this request was in flight.
          forgetPending(); clearRecovery(); ticket++;
          emit({ workspace: null, status: "loading", saving: false, generation: state.generation + 1, notice: "Seu progresso foi reiniciado pelo professor. Carregando o estado atual…" });
          const resetTicket = ticket;
          try {
            const fresh = await read();
            if (resetTicket !== ticket || deny(fresh)) return;
            const workspace = await payload(fresh) as StudentWorkspace;
            if (resetTicket === ticket) replace(workspace, "Seu progresso foi reiniciado pelo professor. Você pode começar novamente.");
          } catch {
            if (resetTicket === ticket) emit({ status: "error", error: "O progresso anterior foi descartado. Tente atualizar para carregar o estado atual." });
          }
          return;
        }
        const result = await payload(response) as { learning: LearningProgress };
        if (currentTicket !== ticket || !state.workspace) return;
        const workspace = { ...verified, learning: { ...result.learning, ...pending } };
        if (draftEdits === submittedDraftEdits) editing = false;
        edits++;
        emit({ workspace, status: "ready", saving: false, error: "" });
        clearCache(owner);
      } catch (error) {
        if (currentTicket !== ticket) return;
        pending = { ...submitted, ...pending };
        emit({ status: "error", saving: false, error: error instanceof Error ? error.message : "Não foi possível salvar. Tente novamente." });
      }
    })();
    writePromise = writing;
    await writing;
    if (writePromise !== writing) return;
    writePromise = null;
    if (state.status === "ready" && Object.keys(pending).length) return flush();
  }

  function beginEdit(generation: number) {
    if (state.conflict || tweaking || importing || state.generation !== generation || state.status !== "ready" || !state.workspace || !permitted(state.workspace.account.status)) return false;
    // Some study answers stay in the mounted form until checked. Their editing
    // base must also survive reads that finish before a snapshot is staged.
    editing = true; draftEdits++; edits++; return true;
  }
  function endEdit(generation: number) {
    if (state.generation === generation && !state.conflict && !writePromise && !Object.keys(pending).length) editing = false;
  }

  function stage(key: SnapshotKey, value: string | null, generation: number) {
    if (state.conflict || tweaking || importing || state.generation !== generation) return false;
    const workspace = state.workspace;
    if (state.status === "unauthenticated" && !workspace && state.guestLearning) {
      const learning = { ...state.guestLearning, [key]: value, updatedAt: new Date().toISOString() };
      if (key === "studySnapshot") learning.studyCompleted = decodeProgress(value).completed.length;
      let notice = "";
      try { writeGuestLearning(storage?.(), learning); } catch { notice = "O navegador não permitiu salvar o avanço. Ele ficará disponível enquanto esta página estiver aberta."; }
      edits++;
      emit({ guestLearning: learning, saving: false, error: "", notice });
      return true;
    }
    if (state.status !== "ready" || !workspace || !permitted(workspace.account.status)) return false;
    if (workspace.learning[key] === value) return true;
    edits++;
    pending[key] = value;
    const learning = { ...workspace.learning, [key]: value };
    emit({ workspace: { ...workspace, learning }, saving: true, error: "", notice: "" });
    try { storage?.().setItem(cacheKey(workspace.account.id, learning.revision), JSON.stringify({ uid: workspace.account.id, revision: learning.revision, demoSnapshot: learning.demoSnapshot, studySnapshot: learning.studySnapshot })); } catch { /* Server persistence remains available. */ }
    clearTimeout(timer); timer = setTimeout(() => { void flush(); }, 650);
    return true;
  }

  async function importGuestProgress(generation: number) {
    const owner = state.workspace, learning = state.guestLearning;
    if (state.conflict || importing || state.saving || state.generation !== generation || state.status !== "ready" || !owner || !permitted(owner.account.status) || !hasGuestLearning(learning) || !canImportGuestLearning(owner.learning, owner.liveClass)) throw new Error("Este percurso só pode ser salvo numa conta sem progresso. Seu avanço atual será preservado.");
    // Invalidate reads started before this deliberate write, then serialize new reads.
    const currentTicket = ++ticket;
    edits++;
    importing = true; emit({ saving: true, error: "" });
    const importingWork = (async () => { try {
      const response = await fetcher("/api/student/learning/import", {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", "X-Workspace-Uid": owner.account.id },
        body: JSON.stringify({ revision: 0, saveVersion: owner.learning.saveVersion, demoSnapshot: learning!.demoSnapshot, studySnapshot: learning!.studySnapshot }),
      });
      const result = await payload(response) as { learning: LearningProgress };
      if (currentTicket !== ticket || state.workspace?.account.id !== owner.account.id) throw new Error("A conta conectada mudou. Confira seu painel antes de continuar.");
      try { storage?.().removeItem(GUEST_LEARNING_KEY); } catch { /* A completed import remains safe to repeat: the server refuses to overwrite it. */ }
      edits++; ticket++;
      emit({ workspace: { ...state.workspace, learning: result.learning }, guestLearning: null, generation: state.generation + 1, saving: false, error: "", notice: "Seu percurso deste navegador foi salvo na sua conta." });
    } catch (error) {
      if (currentTicket === ticket) emit({ saving: false });
      throw error;
    } })();
    importPromise = importingWork;
    try { await importingWork; } finally { if (importPromise === importingWork) { importPromise = null; importing = false; } }
  }

  async function sendMessage(subject: string, body: string, conversationId?: string) {
    const owner = state.workspace;
    const generation = state.generation;
    if (!owner || state.status !== "ready") throw new Error("Atualize seu espaço antes de enviar.");
    const check = await read();
    if (deny(check)) throw new Error("Entre novamente para enviar sua mensagem.");
    const verified = await payload(check) as StudentWorkspace;
    if (verified.account.id !== owner.account.id || generation !== state.generation) {
      forgetPending(); replace(verified); throw new Error("A conta conectada mudou. Abra a conversa na conta correta antes de enviar.");
    }
    const response = await fetcher(conversationId ? `/api/student/conversations/${encodeURIComponent(conversationId)}/messages` : "/api/student/conversations", {
      method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", "X-Workspace-Uid": owner.account.id },
      body: JSON.stringify(conversationId ? { body } : { subject, body, ...(owner.account.canTest || subject === "Avaliação da conversa da cafeteria" ? {learningRevision:owner.learning.revision}:{}) }),
    });
    if (deny(response)) throw new Error("Entre novamente para enviar sua mensagem.");
    const result = await payload(response) as { conversation: TeacherConversation };
    if (generation !== state.generation || state.workspace?.account.id !== owner.account.id) throw new Error("A conta conectada mudou. Atualize para conferir o envio.");
    const conversations = [result.conversation, ...state.workspace.conversations.filter(item => item.id !== result.conversation.id)];
    contactEdits++;
    emit({ workspace: { ...state.workspace, conversations } });
    return result.conversation;
  }

  async function applyTestControl(input: Record<string, unknown>) {
    const owner = state.workspace;
    if (state.conflict || tweaking || importing || !owner?.account.canTest || state.status !== "ready") throw new Error("Atualize a conta de testes antes de continuar.");
    const control = {};
    activeControl = control; tweaking = true; forgetPending(); const controlTicket = ++ticket;
    emit({ saving:true, generation:state.generation+1 });
    try {
      if (writePromise) await writePromise;
      if (controlTicket !== ticket || activeControl !== control) return;
      const response = await fetcher("/api/student/test-controls", { method:"POST", credentials:"same-origin", headers:{"Content-Type":"application/json","X-Workspace-Uid":owner.account.id}, body:JSON.stringify({...input,revision:owner.learning.revision,saveVersion:owner.learning.saveVersion}) });
      if (controlTicket !== ticket) return;
      const result = await payload(response) as { learning:LearningProgress };
      if (controlTicket !== ticket) return;
      if (state.workspace?.account.id !== owner.account.id) throw new Error("A conta mudou. Atualize o painel.");
      const fullReset = input.action === "reset-all";
      replace({...state.workspace,learning:result.learning,...(fullReset ? { activities: [], conversations: [], liveClass: null } : {})},"Controle aplicado no banco de dados da sua conta.", control);
      const appliedTicket = ticket;
      // The POST confirms learning; operational records come from the full workspace.
      try {
        const fresh = await read();
        if (appliedTicket !== ticket || deny(fresh)) return;
        const workspace = await payload(fresh) as StudentWorkspace;
        if (appliedTicket !== ticket) return;
        if (workspace.account.id !== owner.account.id) { replace(workspace); throw new Error("A conta mudou. Atualize o painel."); }
        if (workspace.learning.revision >= result.learning.revision) replace(workspace, "", control);
      } catch {
        if (appliedTicket === ticket) emit({ notice: "Controle salvo na sua conta. Não foi possível atualizar todos os dados do painel; confira sua conexão." });
      }
      if (typeof window !== "undefined" && ["reset-all","reset-real","reset-presentation","complete-presentation","complete-all"].includes(String(input.action))) window.dispatchEvent(new Event("basedspeak.presentation.changed"));
      try { window.localStorage.setItem("basedspeak.test-progress.changed",JSON.stringify({uid:owner.account.id,revision:result.learning.revision,at:Date.now()})); } catch { /* Server revision remains authoritative. */ }
    } catch (error) {
      if (controlTicket !== ticket) return;
      reset(); await load();
      throw error;
    } finally { if (activeControl === control) { activeControl = null; tweaking=false; emit({saving:false}); } }
  }

  async function resolveConflict(choice: "server" | "local") {
    const conflict = state.conflict, owner = state.workspace;
    if (!conflict || !owner || conflict.uid !== owner.account.id) return;
    const resolutionTicket = ticket;
    const response = await read();
    if (resolutionTicket !== ticket || deny(response)) return;
    const fresh = await payload(response) as StudentWorkspace;
    if (resolutionTicket !== ticket) return;
    if (fresh.account.id !== conflict.uid || fresh.learning.revision !== conflict.revision || !permitted(fresh.account.status)) {
      clearRecovery(); emit({ conflict: null }); replace(fresh); return;
    }
    if (choice === "local" && (!conflict.remote || fresh.learning.saveVersion !== conflict.remote.saveVersion)) {
      const next = { ...conflict, remote: fresh.learning }; keepRecovery(next); emit({ conflict: next, error: "A conta mudou novamente. Confira a versão atual antes de escolher." }); return;
    }
    clearRecovery(); ticket++;
    if (choice === "server") {
      // Local content remains available in the recovery dialog until this explicit decision.
      emit({ conflict: null }); replace(fresh, "Retomando o percurso salvo na conta.");
      // Even identical snapshots may have an unstaged form draft: make this decision explicit to the mounted practice.
      emit({ generation: state.generation + 1 }); return;
    }
    // Deliberate replacement of the edited fields; no automatic merging of story journals.
    pending = { ...conflict.local };
    emit({ conflict: null, workspace: { ...fresh, learning: { ...fresh.learning, ...pending } }, saving: true, error: "", notice: "Salvando o percurso escolhido desta aba…" });
    await flush();
  }

  function reset() {
    forgetPending(); clearRecovery(); ticket++; loadPromise = null;
    writePromise = null; importPromise = null; resetCheckPromise = null; importing = false;
    activeControl = null; tweaking = false;
    emit({ ...initialState, generation: state.generation + 1 });
  }
  return { subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; }, getSnapshot: () => state, getServerSnapshot: () => initialState, hasPendingChanges: () => editing || Boolean(state.conflict) || state.saving || Object.keys(pending).length > 0, load, refresh, checkForReset, flush, stage, beginEdit, endEdit, importGuestProgress, sendMessage, applyTestControl, resolveConflict, reset };
}

export const studentWorkspace = createWorkspaceStore(workspaceFetch, workspaceStorage);

import type { LearningProgress, SaveLearningInput, StudentWorkspace, TeacherConversation } from "@/contracts/workspace";

type SnapshotKey = "demoSnapshot" | "studySnapshot";
export type WorkspaceState = {
  status: "loading" | "ready" | "error" | "unauthenticated";
  workspace: StudentWorkspace | null;
  saving: boolean;
  error: string;
  notice: string;
  generation: number;
};
type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;
const initialState: WorkspaceState = { status: "loading", workspace: null, saving: false, error: "", notice: "", generation: 0 };
const cacheKey = (uid: string, revision: number) => `basedspeak.learning.${encodeURIComponent(uid)}.${revision}`;

async function payload(response: Response) {
  const value = await response.json().catch(() => null);
  if (!response.ok) throw new Error(typeof value?.error === "string" ? value.error : "Não foi possível conectar ao seu espaço. Tente novamente.");
  return value;
}

/** Server snapshots are authoritative. Legacy/anonymous storage is never imported. */
export function createWorkspaceStore(fetcher: Fetcher, storage?: () => Pick<Storage, "setItem" | "removeItem">) {
  let state = initialState;
  let loadPromise: Promise<void> | null = null;
  let writePromise: Promise<void> | null = null;
  let pending: Partial<Pick<SaveLearningInput, SnapshotKey>> = {};
  let timer: ReturnType<typeof setTimeout> | undefined;
  let ticket = 0;
  let edits = 0;
  let contactEdits = 0;
  const listeners = new Set<() => void>();
  const emit = (patch: Partial<WorkspaceState>) => { state = { ...state, ...patch }; listeners.forEach(listener => listener()); };
  const clearCache = (workspace: StudentWorkspace | null) => {
    if (!workspace) return;
    try { storage?.().removeItem(cacheKey(workspace.account.id, workspace.learning.revision)); } catch { /* Cache is optional. */ }
  };
  const forgetPending = () => { clearTimeout(timer); pending = {}; clearCache(state.workspace); };
  const replace = (workspace: StudentWorkspace, notice = "") => {
    const previous = state.workspace;
    const changed = previous?.account.id !== workspace.account.id || previous.learning.revision !== workspace.learning.revision || previous.account.status !== workspace.account.status;
    const contentChanged = previous?.learning.demoSnapshot !== workspace.learning.demoSnapshot || previous?.learning.studySnapshot !== workspace.learning.studySnapshot;
    const approved = previous?.account.id === workspace.account.id && previous.account.status === "pending" && workspace.account.status === "active";
    if (changed) { forgetPending(); ticket++; }
    emit({ workspace, status: "ready", saving: false, error: "", notice: notice || (approved ? "Seu cadastro foi aprovado. Sua conversa e seu estudo já estão liberados." : previous && changed ? "Seu acesso ou progresso foi atualizado. O estado atual já está carregado." : state.notice), generation: state.generation + (changed || contentChanged ? 1 : 0) });
  };
  const read = () => fetcher("/api/student/workspace", { credentials: "same-origin", cache: "no-store" });
  const deny = (response: Response) => {
    if (response.status !== 401) return false;
    forgetPending(); ticket++;
    emit({ workspace: null, status: "unauthenticated", saving: false, error: "Sua sessão terminou. Entre novamente para acessar seu espaço.", generation: state.generation + 1 });
    return true;
  };

  async function load(background = false) {
    if (loadPromise) return loadPromise;
    if (writePromise) { await writePromise; if (state.status !== "ready") return; }
    // Never replace unsent work with an older GET. flush validates its owner/revision first.
    if (Object.keys(pending).length) return flush();
    const currentTicket = ticket;
    const currentEdits = edits;
    const currentContactEdits = contactEdits;
    if (!background || state.status !== "ready") emit({ status: "loading", error: "" });
    loadPromise = (async () => {
      try {
        const response = await read();
        if (currentTicket !== ticket || deny(response)) return;
        const workspace = await payload(response) as StudentWorkspace;
        if (currentTicket === ticket) {
          // A navigation refresh may overlap editing or saving. An older GET
          // cannot replace newer work from this same account and revision.
          if (workspace.account.status === "active" && state.workspace?.account.id === workspace.account.id && state.workspace.learning.revision === workspace.learning.revision
            && (edits !== currentEdits || Object.keys(pending).length || writePromise)) workspace.learning = state.workspace.learning;
          // A background read started before a confirmed send must not erase it.
          if (state.workspace?.account.id === workspace.account.id && contactEdits !== currentContactEdits) workspace.conversations = state.workspace.conversations;
          replace(workspace);
          if (currentTicket === ticket && (Object.keys(pending).length || writePromise)) emit({ saving:true });
        }
      } catch (error) {
        if (currentTicket === ticket) emit({ status: "error", saving: false, error: error instanceof Error ? error.message : "Não foi possível carregar seu espaço." });
      } finally { loadPromise = null; }
    })();
    return loadPromise;
  }

  async function refresh() {
    if (loadPromise) await loadPromise;
    if (Object.keys(pending).length || writePromise) await flush();
    if (state.status === "ready") await load(true);
  }

  async function flush() {
    clearTimeout(timer);
    if (writePromise) { await writePromise; if (Object.keys(pending).length && state.status === "ready") return flush(); return; }
    const owner = state.workspace;
    if (!owner || !Object.keys(pending).length || owner.account.status !== "active") return;
    const currentTicket = ticket;
    emit({ saving: true, error: "" });
    writePromise = (async () => {
      let submitted: typeof pending = {};
      try {
        // Check identity again before every write: an open tab may outlive a login/logout.
        const verification = await read();
        if (currentTicket !== ticket || deny(verification)) return;
        const verified = await payload(verification) as StudentWorkspace;
        if (currentTicket !== ticket) return;
        if (verified.account.id !== owner.account.id || verified.learning.revision !== owner.learning.revision || verified.account.status !== "active") {
          forgetPending(); replace(verified, "Seu acesso ou progresso mudou. Carregamos o estado atual da sua conta."); return;
        }
        submitted = pending; pending = {};
        const response = await fetcher("/api/student/learning", {
          method: "PUT", credentials: "same-origin", headers: { "Content-Type": "application/json", "X-Workspace-Uid": owner.account.id },
          body: JSON.stringify({ revision: owner.learning.revision, ...submitted }),
        });
        if (currentTicket !== ticket || deny(response)) return;
        if (response.status === 409) {
          // Drop ALL old-epoch work, including edits made while this request was in flight.
          forgetPending(); ticket++;
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
        edits++;
        emit({ workspace, status: "ready", saving: false, error: "" });
        clearCache(owner);
      } catch (error) {
        if (currentTicket !== ticket) return;
        pending = { ...submitted, ...pending };
        emit({ status: "error", saving: false, error: error instanceof Error ? error.message : "Não foi possível salvar. Tente novamente." });
      }
    })();
    await writePromise; writePromise = null;
    if (state.status === "ready" && Object.keys(pending).length) return flush();
  }

  function stage(key: SnapshotKey, value: string | null, generation: number) {
    const workspace = state.workspace;
    if (state.status !== "ready" || !workspace || workspace.account.status !== "active" || state.generation !== generation) return false;
    if (workspace.learning[key] === value) return true;
    edits++;
    pending[key] = value;
    const learning = { ...workspace.learning, [key]: value };
    emit({ workspace: { ...workspace, learning }, saving: true, error: "", notice: "" });
    try { storage?.().setItem(cacheKey(workspace.account.id, learning.revision), JSON.stringify({ uid: workspace.account.id, revision: learning.revision, demoSnapshot: learning.demoSnapshot, studySnapshot: learning.studySnapshot })); } catch { /* Server persistence remains available. */ }
    clearTimeout(timer); timer = setTimeout(() => { void flush(); }, 650);
    return true;
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
      body: JSON.stringify(conversationId ? { body } : { subject, body }),
    });
    if (deny(response)) throw new Error("Entre novamente para enviar sua mensagem.");
    const result = await payload(response) as { conversation: TeacherConversation };
    if (generation !== state.generation || state.workspace?.account.id !== owner.account.id) throw new Error("A conta conectada mudou. Atualize para conferir o envio.");
    const conversations = [result.conversation, ...state.workspace.conversations.filter(item => item.id !== result.conversation.id)];
    contactEdits++;
    emit({ workspace: { ...state.workspace, conversations } });
    return result.conversation;
  }

  function reset() {
    forgetPending(); ticket++; loadPromise = null;
    emit({ ...initialState, generation: state.generation + 1 });
  }
  return { subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; }, getSnapshot: () => state, getServerSnapshot: () => initialState, hasPendingChanges: () => state.saving || Object.keys(pending).length > 0, load, refresh, flush, stage, sendMessage, reset };
}

export const studentWorkspace = createWorkspaceStore((input, init) => fetch(input, init), () => window.localStorage);

import "server-only";
import { randomBytes } from "node:crypto";
import type { UserRecord } from "firebase-admin/auth";
import { getAdminAuth, getAdminDb } from "@/server/firebase";
import type { RequestPrincipal } from "@/server/auth/principal";
import { RequestAuthError } from "@/server/auth/request-auth";
import { consumeRateLimit } from "@/server/http/rate-limit";
import type { Activity, AdminAction, AdminState, AdminUser, ManagementMutationResult } from "@/contracts/management";
import { accountStatus, conversationFromData, iso, learningFromData } from "@/server/workspace/validation";
import { conversationsRef, learningRef, studentActivityRef, userRef } from "@/server/workspace/service";

const auditRef = () => getAdminDb().collection("management_activity");
const audit = (principal: RequestPrincipal, user: { id: string; name: string }, description: string, at: string) => ({ userId: user.id, name: user.name, actorId: principal.uid, actorName: principal.email || principal.uid, description, at });

async function allAuthUsers() {
  const users: UserRecord[] = [];
  let token: string | undefined;
  do { const page = await getAdminAuth().listUsers(1000, token); users.push(...page.users); token = page.pageToken; } while (token);
  return users;
}
export function managementUser(identity: UserRecord, savedProfile?: Record<string, unknown>, rawLearning: Record<string, unknown> = {}): AdminUser {
  const learning = learningFromData(rawLearning);
  const profile = savedProfile || {};
  const recordedStatus = savedProfile ? accountStatus(profile.accountStatus) : "pending";
  return {
    id: identity.uid, name: typeof profile.name === "string" && profile.name.trim() ? profile.name : identity.displayName || identity.email || "Sem nome",
    email: identity.email || "", role: identity.customClaims?.admin === true ? "manager" : "student",
    status: identity.disabled ? recordedStatus === "rejected" ? "rejected" : "suspended" : recordedStatus,
    createdAt: iso(identity.metadata.creationTime), lastLoginAt: iso(profile.lastLoginDate) || iso(identity.metadata.lastSignInTime),
    progress: Math.round((learning.demoPercent + (learning.studyTotal ? learning.studyCompleted / learning.studyTotal * 100 : 0)) / 2),
    demoPercent: learning.demoPercent, studyCompleted: learning.studyCompleted, studyTotal: learning.studyTotal,
    loginResetAt: iso(profile.loginResetAt), notes: typeof profile.managementNotes === "string" ? profile.managementNotes : "",
  };
}
export async function getManagementSnapshot(principal: RequestPrincipal): Promise<AdminState> {
  const [identities, profiles, learning, activity, conversations] = await Promise.all([
    allAuthUsers(), getAdminDb().collection("users").get(), getAdminDb().collection("learning_states").get(),
    auditRef().orderBy("at", "desc").limit(150).get(), conversationsRef().get(),
  ]);
  const profilesById = new Map(profiles.docs.map(doc => [doc.id, doc.data()]));
  const learningById = new Map(learning.docs.map(doc => [doc.id, doc.data()]));
  const users = identities.map(identity => managementUser(identity, profilesById.get(identity.uid), learningById.get(identity.uid))).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  const current = users.find(user => user.id === principal.uid);
  return { users, activity: activity.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Activity[], conversations: conversations.docs.map(doc => conversationFromData(doc.id, doc.data())).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), currentAccount: { id: principal.uid, name: current?.name || principal.email || "Manager", email: principal.email || "" }, updatedAt: new Date().toISOString() };
}

async function withUserLock<T>(uid: string, task: () => Promise<T>): Promise<T> {
  const ref = getAdminDb().collection("management_locks").doc(uid);
  await getAdminDb().runTransaction(async tx => {
    const previous = await tx.get(ref);
    if (Number(previous.data()?.expiresAt) > Date.now()) throw new RequestAuthError("Esta conta está sendo atualizada. Tente novamente em instantes.", 409);
    tx.set(ref, { expiresAt: Date.now() + 120_000 });
  });
  try { return await task(); }
  finally { await ref.delete().catch(() => undefined); }
}

export async function mutateManagement(principal: RequestPrincipal, action: AdminAction): Promise<ManagementMutationResult> {
  await consumeRateLimit({ namespace: "management-write", identifier: principal.uid, limit: 60, windowMs: 60_000 });
  const auth = getAdminAuth(), db = getAdminDb();
  const at = new Date().toISOString();
  if (action.type === "create") {
    const { draft } = action;
    const identity = await auth.createUser({ email: draft.email, displayName: draft.name, password: randomBytes(32).toString("base64url") });
    try {
      if (draft.role === "manager") await auth.setCustomUserClaims(identity.uid, { admin: true });
      const batch = db.batch();
      batch.create(userRef(identity.uid), { id: identity.uid, name: draft.name, email: draft.email, managementNotes: draft.notes, subscriptionStatus: "free", accountStatus: "pending", createdAt: at, updatedAt: at });
      batch.create(auditRef().doc(), audit(principal, { id: identity.uid, name: draft.name }, "Conta criada · aguardando aprovação", at));
      await batch.commit();
    } catch (error) { await auth.deleteUser(identity.uid).catch(() => undefined); throw error; }
    const resetLink = await auth.generatePasswordResetLink(draft.email).catch(() => undefined);
    return { message: resetLink ? "Conta criada. Compartilhe o link para o usuário definir a senha e aprove o acesso quando estiver pronto." : "Conta criada. Gere o link de senha nos controles da conta para compartilhar o acesso.", ...(resetLink ? { resetLink } : {}) };
  }
  return withUserLock(action.userId, async () => {
    const [identity, profile] = await Promise.all([auth.getUser(action.userId), userRef(action.userId).get()]);
    const previous = managementUser(identity, profile.data());
    const target = { id: previous.id, name: previous.name };
    if (action.userId === principal.uid && (action.type === "suspend" || action.type === "reject" || action.type === "reset-login" || (action.type === "edit" && action.draft.role !== "manager"))) throw new RequestAuthError("Você não pode remover ou interromper seu próprio acesso de manager.", 409);

    if (action.type === "reset-progress") {
      await db.runTransaction(async tx => {
        const ref = learningRef(action.userId), stored = await tx.get(ref);
        const previousLearning = learningFromData(stored.data());
        tx.set(ref, { ...learningFromData(), revision: previousLearning.revision + 1, updatedAt: at });
        tx.create(auditRef().doc(), audit(principal, target, "Progresso de conversa e estudo reiniciado", at));
        tx.create(studentActivityRef(action.userId).doc(), { kind: "reset", title: "Seu progresso foi reiniciado pela gestão", at });
      });
      return { message: "Progresso reiniciado. As sessões abertas receberão o novo estado ao sincronizar." };
    }
    if (action.type === "reset-login") {
      if (!identity.email) throw new RequestAuthError("Esta conta não tem e-mail de login.", 409);
      const resetLink = await auth.generatePasswordResetLink(identity.email);
      await auth.revokeRefreshTokens(identity.uid);
      const batch = db.batch();
      batch.set(userRef(identity.uid), { loginResetAt: at, updatedAt: at }, { merge: true });
      batch.create(auditRef().doc(), audit(principal, target, "Link de senha gerado e sessões revogadas", at));
      try { await batch.commit(); }
      catch { throw new RequestAuthError("Sessões encerradas, mas não foi possível registrar o reset. Tente novamente para gerar um novo link.", 503); }
      return { message: "Sessões encerradas. Compartilhe o link com o titular para definir uma nova senha.", resetLink };
    }

    let description: string;
    let patch: Record<string, unknown> = { updatedAt: at };
    let nextDisabled = identity.disabled;
    let nextClaims = identity.customClaims || {};
    let nextName = identity.displayName || previous.name;
    let nextEmail = identity.email;
    if (action.type === "edit") {
      patch = { ...patch, name: action.draft.name, email: action.draft.email, managementNotes: action.draft.notes };
      nextName = action.draft.name; nextEmail = action.draft.email;
      nextClaims = { ...identity.customClaims, admin: action.draft.role === "manager" };
      description = "Dados da conta atualizados";
    } else {
      const allowed = action.type === "approve" || action.type === "reject" ? previous.status === "pending" : action.type === "suspend" ? previous.status === "active" : previous.status === "suspended" || previous.status === "rejected";
      if (!allowed) throw new RequestAuthError("O status desta conta mudou. Atualize o painel antes de continuar.", 409);
      const status = action.type === "approve" || action.type === "activate" ? "active" : action.type === "reject" ? "rejected" : "suspended";
      patch.accountStatus = status;
      nextDisabled = status === "rejected" || status === "suspended";
      description = action.type === "approve" ? "Cadastro aprovado" : action.type === "reject" ? `Cadastro reprovado${action.reason ? ` · ${action.reason}` : ""}` : action.type === "activate" ? "Acesso reativado" : "Acesso suspenso";
    }
    const claimsChanged = nextClaims.admin !== identity.customClaims?.admin;
    const emailChanged = nextEmail !== identity.email;
    try {
      await auth.updateUser(identity.uid, { displayName: nextName, ...(nextEmail ? { email: nextEmail } : {}), disabled: nextDisabled, ...(emailChanged ? { emailVerified: false } : {}) });
      if (claimsChanged) await auth.setCustomUserClaims(identity.uid, nextClaims);
      const batch = db.batch();
      batch.set(userRef(identity.uid), patch, { merge: true });
      batch.create(auditRef().doc(), audit(principal, target, description, at));
      batch.create(studentActivityRef(identity.uid).doc(), { kind: "account", title: description, at });
      await batch.commit();
    } catch (error) {
      // Firebase Auth and Firestore cannot share a transaction. Restore Auth if
      // the profile/audit write fails, and never report an unconfirmed mutation.
      try {
        await auth.updateUser(identity.uid, { displayName: identity.displayName || "", ...(identity.email ? { email: identity.email } : {}), emailVerified: identity.emailVerified, disabled: identity.disabled });
        if (claimsChanged) await auth.setCustomUserClaims(identity.uid, identity.customClaims || {});
      } catch { throw new RequestAuthError("A operação ficou parcialmente aplicada. Atualize esta conta e revise o acesso antes de tentar novamente.", 503); }
      throw error;
    }
    if (nextDisabled || claimsChanged || emailChanged) {
      try { await auth.revokeRefreshTokens(identity.uid); }
      catch { return { message: `${description}. A revogação de sessões não foi confirmada; use Redefinir login para tentar novamente.` }; }
    }
    return { message: `${description}.` };
  });
}

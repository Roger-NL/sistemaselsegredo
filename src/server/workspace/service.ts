import "server-only";
import { getAdminAuth, getAdminDb } from "@/server/firebase";
import type { RequestPrincipal } from "@/server/auth/principal";
import type { LiveClassBooking } from "@/contracts/live-class";
import type { LearningProgress, StudentWorkspace, TeacherConversation, TeacherMessage } from "@/contracts/workspace";
import { RequestAuthError } from "@/server/auth/request-auth";
import { RequestPayloadError, assertOnlyKeys } from "@/server/http/request";
import { consumeRateLimit } from "@/server/http/rate-limit";
import { accountStatus, conversationFromData, learningFromData, parseDemoSnapshot, parseStudySnapshot, savedStudyCompleted, textField } from "./validation";
import { prepareOperationalNotifications, writeOperationalNotifications, type OperationalEvent } from "@/server/notifications/outbox";
import { scheduleOperationalNotifications } from "@/server/notifications/background";
import { completedConversation } from "@/server/notifications/events";

export const userRef = (uid: string) => getAdminDb().collection("users").doc(uid);
export const studentActivityRef = (uid: string) => userRef(uid).collection("student_activity");
export const learningRef = (uid: string) => getAdminDb().collection("learning_states").doc(uid);
export const conversationsRef = () => getAdminDb().collection("teacher_conversations");

export async function getStudentWorkspace(principal: RequestPrincipal): Promise<StudentWorkspace> {
  const [identity, profile, learning, activity, conversations, liveClass] = await Promise.all([
    getAdminAuth().getUser(principal.uid), userRef(principal.uid).get(), learningRef(principal.uid).get(),
    studentActivityRef(principal.uid).orderBy("at", "desc").limit(100).get(),
    conversationsRef().where("userId", "==", principal.uid).get(),
    getAdminDb().collection("demo_live_classes").doc(principal.uid).get(),
  ]);
  const data = profile.data() || {};
  return {
    account: { id: principal.uid, name: typeof data.name === "string" ? data.name : identity.displayName || "", email: identity.email || "", status: profile.exists ? accountStatus(data.accountStatus) : "pending", role: identity.customClaims?.admin === true ? "manager" : "student" },
    learning: { ...learningFromData(learning.data()), studyCompleted: savedStudyCompleted(learning.data()) },
    liveClass: liveClass.data()?.userId === principal.uid ? liveClass.data() as LiveClassBooking : null,
    activities: activity.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StudentWorkspace["activities"],
    conversations: conversations.docs.map(doc => conversationFromData(doc.id, doc.data())).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  };
}

export async function saveLearning(principal: RequestPrincipal, body: Record<string, unknown>, options: { requireEmpty?: boolean } = {}): Promise<{ learning: LearningProgress }> {
  assertOnlyKeys(body, ["revision", "demoSnapshot", "studySnapshot"]);
  if (!Number.isSafeInteger(body.revision) || Number(body.revision) < 0 || !("demoSnapshot" in body || "studySnapshot" in body)) throw new RequestPayloadError("Informe uma revisão e um progresso válidos.");
  await consumeRateLimit({ namespace: "learning-save", identifier: principal.uid, limit: 120, windowMs: 60_000 });
  const patch: Partial<LearningProgress> = { ...("demoSnapshot" in body ? parseDemoSnapshot(body.demoSnapshot) : {}), ...("studySnapshot" in body ? parseStudySnapshot(body.studySnapshot) : {}) };
  const result = await getAdminDb().runTransaction(async tx => {
    const [stored, profile, booking] = await Promise.all([tx.get(learningRef(principal.uid)), tx.get(userRef(principal.uid)), options.requireEmpty ? tx.get(getAdminDb().collection("demo_live_classes").doc(principal.uid)) : Promise.resolve(null)]);
    if (!profile.exists || !["active", "pending"].includes(accountStatus(profile.data()?.accountStatus))) throw new RequestAuthError("Seu acesso à prática está indisponível. Fale com o professor.", 403);
    const previous = learningFromData(stored.data());
    if (options.requireEmpty && (previous.revision !== 0 || previous.demoSnapshot !== null || previous.studySnapshot !== null || booking?.exists)) throw new RequestAuthError("Esta conta já tem um percurso. Seu progresso atual foi preservado; o percurso deste navegador não foi importado.", 409);
    if (previous.revision !== body.revision) throw new RequestAuthError("Seu progresso foi reiniciado. Atualize o painel antes de continuar.", 409);
    if ((!("demoSnapshot" in patch) || patch.demoSnapshot === previous.demoSnapshot) && (!("studySnapshot" in patch) || patch.studySnapshot === previous.studySnapshot)) return { learning: previous, notificationIds: [] };
    const at = new Date().toISOString();
    const next: LearningProgress = { ...previous, ...patch, updatedAt: at };
    const notifications: OperationalEvent[] = [];
    const identity = { userId: principal.uid, userName: String(profile.data()?.name || "Aluno"), userEmail: principal.email || "", occurredAt: at };
    const conversationCompleted = "demoSnapshot" in patch && completedConversation(next.demoSnapshot) && !completedConversation(previous.demoSnapshot);
    if (conversationCompleted) notifications.push({ ...identity, kind: "conversation_completed" });
    if ("studySnapshot" in patch && next.studyCompleted === next.studyTotal && savedStudyCompleted(stored.data()) < next.studyTotal) notifications.push({ ...identity, kind: "study_completed" });
    const enqueue = await prepareOperationalNotifications(tx, notifications);
    tx.set(learningRef(principal.uid), next);
    const events: string[] = [];
    if (next.demoSnapshot && !previous.demoSnapshot) events.push("Conversa da cafeteria iniciada");
    if (conversationCompleted) events.push("Atividades da conversa da cafeteria concluídas");
    if (next.studyCompleted > previous.studyCompleted) events.push(`Estudo: ${next.studyCompleted} de ${next.studyTotal} atividades concluídas`);
    for (const title of events) tx.create(studentActivityRef(principal.uid).doc(), { kind: "learning", title, at });
    return { learning: next, notificationIds: enqueue() };
  });
  scheduleOperationalNotifications(result.notificationIds);
  return { learning: result.learning };
}

/** Explicit guest continuation, guarded atomically against overwriting any saved account journey. */
export async function importGuestLearning(principal: RequestPrincipal, body: Record<string, unknown>) {
  if (body.revision !== 0 || (!body.demoSnapshot && !body.studySnapshot)) throw new RequestPayloadError("Escolha um percurso válido deste navegador para salvar na sua conta.");
  await consumeRateLimit({ namespace: "guest-learning-import", identifier: principal.uid, limit: 5, windowMs: 3_600_000 });
  return saveLearning(principal, body, { requireEmpty: true });
}

export async function createConversation(principal: RequestPrincipal, body: Record<string, unknown>) {
  assertOnlyKeys(body, ["subject", "body"]);
  const subject = textField(body.subject, "Assunto", 160);
  const message = textField(body.body, "Mensagem", 4000);
  await consumeRateLimit({ namespace: "teacher-contact", identifier: principal.uid, limit: 20, windowMs: 60 * 60 * 1000 });
  const profile = (await userRef(principal.uid).get()).data() || {};
  const at = new Date().toISOString(), ref = conversationsRef().doc();
  const name = typeof profile.name === "string" ? profile.name : principal.email || "Aluno";
  const conversation: Omit<TeacherConversation, "id"> = { userId: principal.uid, userName: name, userEmail: principal.email || "", subject, status: "open", createdAt: at, updatedAt: at, messages: [{ id: ref.id, authorId: principal.uid, authorName: name, role: "student", body: message, at }] };
  const batch = getAdminDb().batch();
  batch.create(ref, conversation);
  batch.create(studentActivityRef(principal.uid).doc(), { kind: "contact", title: `Mensagem enviada ao professor: ${subject}`, at });
  const notificationIds = writeOperationalNotifications(batch, [{ kind: "student_message", userId: principal.uid, userName: name, userEmail: principal.email || "", occurredAt: at, entityId: ref.id }]);
  await batch.commit();
  scheduleOperationalNotifications(notificationIds);
  return { conversation: { id: ref.id, ...conversation } };
}

export async function appendConversationMessage(principal: RequestPrincipal, id: string, body: Record<string, unknown>, manager = false) {
  if (!/^[\w-]{1,128}$/.test(id)) throw new RequestPayloadError("Conversa inválida.");
  assertOnlyKeys(body, manager ? ["body", "status"] : ["body"]);
  const text = textField(body.body, "Mensagem", 4000);
  if (manager && body.status !== undefined && body.status !== "answered" && body.status !== "closed") throw new RequestPayloadError("Status da conversa inválido.");
  await consumeRateLimit({ namespace: "teacher-messages", identifier: principal.uid, limit: 60, windowMs: 60 * 60 * 1000 });
  const profile = (await userRef(principal.uid).get()).data() || {};
  const name = typeof profile.name === "string" ? profile.name : principal.email || (manager ? "Professor" : "Aluno");
  const result = await getAdminDb().runTransaction(async tx => {
    const ref = conversationsRef().doc(id), stored = await tx.get(ref);
    if (!stored.exists) throw new RequestAuthError("Conversa não encontrada.", 404);
    const previous = conversationFromData(stored.id, stored.data()!);
    if (!manager && previous.userId !== principal.uid) throw new RequestAuthError("Conversa não encontrada.", 404);
    if (!manager && previous.status === "closed") throw new RequestAuthError("Esta conversa foi encerrada. Inicie uma nova mensagem.", 409);
    if (previous.messages.length >= 100) throw new RequestAuthError("Esta conversa atingiu o limite de mensagens. Inicie uma nova conversa.", 409);
    const at = new Date().toISOString();
    const message: TeacherMessage = { id: studentActivityRef(previous.userId).doc().id, authorId: principal.uid, authorName: name, role: manager ? "manager" : "student", body: text, at };
    const next = { ...previous, messages: [...previous.messages, message], status: manager ? body.status === "closed" ? "closed" as const : "answered" as const : "open" as const, updatedAt: at };
    if (Buffer.byteLength(JSON.stringify(next), "utf8") > 750_000) throw new RequestAuthError("Esta conversa atingiu o limite de tamanho. Inicie uma nova conversa.", 409);
    tx.update(ref, { messages: next.messages, status: next.status, updatedAt: at });
    tx.create(studentActivityRef(previous.userId).doc(), { kind: "contact", title: manager ? `Professor respondeu: ${previous.subject}` : `Mensagem enviada: ${previous.subject}`, at });
    if (manager) tx.create(getAdminDb().collection("management_activity").doc(), { userId: previous.userId, name: previous.userName, actorId: principal.uid, actorName: name, description: `Resposta ao aluno: ${previous.subject}`, at });
    const notificationIds = manager ? [] : writeOperationalNotifications(tx, [{ kind: "student_message", userId: principal.uid, userName: name, userEmail: principal.email || "", occurredAt: at, entityId: `${id}:${message.id}` }]);
    return { conversation: next, notificationIds };
  });
  scheduleOperationalNotifications(result.notificationIds);
  return { conversation: result.conversation };
}

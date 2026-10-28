import "server-only";
import { createHash } from "node:crypto";
import { getAdminDb } from "@/server/firebase";
import type { RequestPrincipal } from "@/server/auth/principal";
import { RequestAuthError } from "@/server/auth/request-auth";
import { assertOnlyKeys, RequestPayloadError } from "@/server/http/request";
import { consumeRateLimit } from "@/server/http/rate-limit";
import { accountStatus, parseStudySnapshot } from "@/server/workspace/validation";
import { studySteps } from "@/features/theory/progress";
import { monthKey, monthSlots, offsetMonth } from "@/features/live-class/calendar";
import type { LiveClassAvailability, LiveClassBooking } from "@/contracts/live-class";

// Separate from legacy paid sessions: no Premium entitlement or purchase waiting period.
const bookings = () => getAdminDb().collection("demo_live_classes");
const locks = () => getAdminDb().collection("demo_live_class_slots");
const learning = (uid: string) => getAdminDb().collection("learning_states").doc(uid);
const profile = (uid: string) => getAdminDb().collection("users").doc(uid);
export const liveClassTimezone = () => process.env.LIVE_CLASS_TIMEZONE || process.env.GOOGLE_CALENDAR_TIMEZONE || "Europe/Lisbon";
const lockId = (start: string) => createHash("sha256").update(start).digest("hex");
function progress(data: Record<string, unknown> = {}) {
  // Derive eligibility from the saved practices, never a submitted percentage.
  try { return parseStudySnapshot(data.studySnapshot ?? null).studyCompleted; } catch { return 0; }
}
function active(exists: boolean, data: Record<string, unknown> = {}) {
  if (!exists || accountStatus(data.accountStatus) !== "active") throw new RequestAuthError("Seu acesso aguarda aprovação da gestão.", 403);
}
function checkedMonth(value: string | null, timezone: string, now = new Date()) {
  const current = monthKey(now, timezone), month = value || current;
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || month < current || month > offsetMonth(current, 2)) throw new RequestPayloadError("Escolha um mês entre o atual e os próximos dois meses.");
  return month;
}
export async function getLiveClass(principal: RequestPrincipal, requestedMonth: string | null): Promise<LiveClassAvailability> {
  const timezone = liveClassTimezone(), month = checkedMonth(requestedMonth, timezone);
  const [user, saved, existing] = await Promise.all([profile(principal.uid).get(), learning(principal.uid).get(), bookings().doc(principal.uid).get()]);
  const completed = progress(saved.data()), total = studySteps.length;
  const eligible = user.exists && accountStatus(user.data()?.accountStatus) === "active" && completed === total;
  const booking = existing.exists ? existing.data() as LiveClassBooking : null;
  let slots = eligible && (!booking || booking.status === "cancelled") ? monthSlots(month, timezone) : [];
  if (slots.length) {
    const reserved = await locks().where("month", "==", month).get();
    const taken = new Set(reserved.docs.map(doc => doc.data().start as string));
    slots = slots.filter(slot => !taken.has(slot.start));
  }
  return { userId: principal.uid, eligible, completed, total, month, timezone, slots, booking };
}
export async function bookLiveClass(principal: RequestPrincipal, body: Record<string, unknown>) {
  assertOnlyKeys(body, ["start"]);
  if (typeof body.start !== "string" || body.start.length > 40 || !Number.isFinite(Date.parse(body.start))) throw new RequestPayloadError("Escolha um horário válido.");
  await consumeRateLimit({ namespace: "free-class-booking", identifier: principal.uid, limit: 20, windowMs: 600_000 });
  const timezone = liveClassTimezone(), now = new Date();
  const month = checkedMonth(monthKey(new Date(body.start), timezone), timezone, now);
  const slot = monthSlots(month, timezone, now).find(slot => slot.start === body.start);
  if (!slot) throw new RequestPayloadError("Esse horário não está mais disponível. Escolha outro.", 409);
  const ref = bookings().doc(principal.uid), lock = locks().doc(lockId(slot.start));
  return getAdminDb().runTransaction(async tx => {
    const [user, saved, previous, held] = await Promise.all([tx.get(profile(principal.uid)), tx.get(learning(principal.uid)), tx.get(ref), tx.get(lock)]);
    active(user.exists, user.data());
    if (progress(saved.data()) !== studySteps.length) throw new RequestAuthError("Conclua 100% do estudo guiado para agendar sua aula gratuita.", 403);
    const current = previous.exists ? previous.data() as LiveClassBooking : null;
    if (current && current.status !== "cancelled") {
      if (current.start === slot.start && ["pending", "confirmed"].includes(current.status)) return { booking: current };
      throw new RequestPayloadError("Você já tem uma aula gratuita registrada. Confira seu agendamento.", 409);
    }
    if (held.exists) throw new RequestPayloadError("Esse horário acabou de ser reservado. Escolha outro.", 409);
    const at = now.toISOString(), data = user.data()!;
    const booking: LiveClassBooking = { id: principal.uid, userId: principal.uid, studentName: String(data.name || principal.email || "Aluno"), studentEmail: principal.email || "", start: slot.start, end: slot.end, timezone, status: "pending", revision: (current?.revision || 0) + 1, createdAt: current?.createdAt || at, updatedAt: at, reason: "", meetingUrl: "" };
    tx.set(lock, { userId: principal.uid, start: slot.start, end: slot.end, month });
    tx.set(ref, booking);
    tx.create(profile(principal.uid).collection("student_activity").doc(), { kind: "scheduling", title: "Aula gratuita solicitada; aguardando confirmação do professor", at });
    tx.create(getAdminDb().collection("management_activity").doc(), { userId: principal.uid, name: booking.studentName, actorId: principal.uid, actorName: booking.studentName, description: "Aluno solicitou a aula gratuita", at });
    return { booking };
  });
}
export async function listLiveClasses() {
  const snapshot = await bookings().get();
  return { bookings: snapshot.docs.map(doc => doc.data() as LiveClassBooking).sort((a, b) => a.start.localeCompare(b.start)), timezone: liveClassTimezone() };
}
export async function decideLiveClass(principal: RequestPrincipal, body: Record<string, unknown>) {
  assertOnlyKeys(body, ["id", "revision", "decision", "reason", "meetingUrl"]);
  if (typeof body.id !== "string" || !/^[^/]{1,128}$/.test(body.id) || !Number.isSafeInteger(body.revision) || !["confirm", "cancel", "complete"].includes(String(body.decision))) throw new RequestPayloadError("Agendamento ou decisão inválidos.");
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  const meetingUrl = typeof body.meetingUrl === "string" ? body.meetingUrl.trim() : "";
  if (reason.length > 1000 || meetingUrl.length > 1000) throw new RequestPayloadError("O texto informado é muito longo.");
  if (body.decision === "cancel" && !reason) throw new RequestPayloadError("Informe o motivo para o aluno escolher outro horário.");
  if (meetingUrl) { try { if (new URL(meetingUrl).protocol !== "https:") throw new Error(); } catch { throw new RequestPayloadError("Informe um link de aula que comece com https://."); } }
  await consumeRateLimit({ namespace: "free-class-decisions", identifier: principal.uid, limit: 60, windowMs: 600_000 });
  return getAdminDb().runTransaction(async tx => {
    const ref = bookings().doc(body.id as string), stored = await tx.get(ref);
    if (!stored.exists) throw new RequestPayloadError("Agendamento não encontrado.", 404);
    const current = stored.data() as LiveClassBooking;
    if (current.revision !== body.revision) throw new RequestPayloadError("O agendamento mudou. Atualize a agenda antes de continuar.", 409);
    const lock = locks().doc(lockId(current.start));
    const [held, user] = await Promise.all([tx.get(lock), tx.get(profile(current.userId))]);
    if (body.decision === "confirm") active(user.exists, user.data());
    if (!held.exists || held.data()?.userId !== current.userId || !["pending", "confirmed"].includes(current.status)) throw new RequestPayloadError("Esse agendamento não pode mais ser alterado. Atualize a agenda.", 409);
    if (body.decision === "complete" && (current.status !== "confirmed" || new Date(current.end) > new Date())) throw new RequestPayloadError("Marque como realizada após o horário da aula confirmada.", 409);
    if (body.decision === "confirm" && new Date(current.start) <= new Date()) throw new RequestPayloadError("Esse horário já passou. Cancele o pedido para liberar uma nova escolha.", 409);
    const at = new Date().toISOString(), status = body.decision === "confirm" ? "confirmed" : body.decision === "cancel" ? "cancelled" : "completed";
    const booking: LiveClassBooking = { ...current, revision: current.revision + 1, status, reason: status === "cancelled" ? reason : "", meetingUrl: status === "confirmed" ? meetingUrl : current.meetingUrl, updatedAt: at };
    tx.set(ref, booking);
    if (status === "cancelled") tx.delete(lock);
    const title = status === "confirmed" ? "Sua aula gratuita foi confirmada" : status === "cancelled" ? `Agendamento cancelado: ${reason}` : "Aula gratuita realizada";
    tx.create(profile(current.userId).collection("student_activity").doc(), { kind: "scheduling", title, at });
    tx.create(getAdminDb().collection("management_activity").doc(), { userId: current.userId, name: current.studentName, actorId: principal.uid, actorName: principal.email || "Manager", description: title, at });
    return { booking };
  });
}

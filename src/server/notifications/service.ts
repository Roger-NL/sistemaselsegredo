import "server-only";
import { randomUUID } from "node:crypto";
import { getAdminDb } from "@/server/firebase";
import type { NotificationSettings, OperationalNotificationSummary } from "@/contracts/notifications";
import { RequestPayloadError, assertOnlyKeys } from "@/server/http/request";
import { operationalNotifications, type OutboxNotification } from "./outbox";
import { NotificationDeliveryError, notificationProviderConfiguration, sendOperationalEmail, type NotificationEnvelope } from "./provider";

const settingsRef = () => getAdminDb().collection("settings").doc("operational_notifications");
const distantFuture = "9999-12-31T23:59:59.999Z";
const retryWindowMs = 23 * 60 * 60 * 1000;
const labels = {
  new_signup: "Novo cadastro",
  conversation_completed: "Conversa da cafeteria concluída",
  study_completed: "Estudo guiado concluído — aula gratuita liberada",
  live_class_requested: "Novo pedido de aula gratuita",
  student_message: "Nova mensagem de aluno",
} as const;

async function readSettings() {
  const data = (await settingsRef().get()).data() || {};
  return {
    recipientEmail: typeof data.recipientEmail === "string" ? data.recipientEmail : "raugerac@gmail.com",
    enabled: data.enabled !== false,
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : null,
  };
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const [settings, queued, attention, recent] = await Promise.all([
    readSettings(),
    operationalNotifications().where("status", "in", ["pending", "processing"]).count().get(),
    operationalNotifications().where("status", "in", ["failed", "needs_review"]).count().get(),
    operationalNotifications().orderBy("createdAt", "desc").limit(20).get(),
  ]);
  const summaries: OperationalNotificationSummary[] = recent.docs.map(doc => {
    const data = doc.data() as OutboxNotification;
    return { id: doc.id, kind: data.kind, status: data.status, studentName: data.userName, createdAt: data.createdAt, sentAt: data.sentAt || null, attempts: data.attempts || 0, errorCode: data.errorCode || null };
  });
  return { ...settings, ...notificationProviderConfiguration(), cronConfigured: Boolean(process.env.CRON_SECRET?.trim()), queuedCount: queued.data().count, attentionCount: attention.data().count, recent: summaries };
}

export async function updateNotificationSettings(body: Record<string, unknown>, actorUid: string): Promise<NotificationSettings> {
  assertOnlyKeys(body, ["recipientEmail", "enabled"]);
  const email = typeof body.recipientEmail === "string" ? body.recipientEmail.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || /[\r\n]/.test(email)) throw new RequestPayloadError("Informe um e-mail válido para receber os avisos.");
  if (typeof body.enabled !== "boolean") throw new RequestPayloadError("Informe se os avisos devem ficar ativos.");
  await settingsRef().set({ recipientEmail: email, enabled: body.enabled, updatedAt: new Date().toISOString(), updatedBy: actorUid });
  return getNotificationSettings();
}

function envelopeFor(event: OutboxNotification, recipientEmail: string, senderEmail: string): NotificationEnvelope {
  const title = labels[event.kind];
  const student = [event.userName, event.userEmail].filter(Boolean).join(" — ");
  return {
    from: `BasedSpeak <${senderEmail}>`, to: [recipientEmail], subject: `[BasedSpeak] ${title}`,
    text: [title, "", `Aluno: ${student}`, `Quando: ${event.occurredAt}`, event.details || "", "", "Confira os detalhes na ADM:", "https://www.basedspeak.com/adm", "", "Aviso operacional automático do BasedSpeak."].filter(line => line !== undefined).join("\n"),
  };
}

type DeliveryOutcome = "sent" | "retry" | "review" | "skipped";
async function deliver(id: string, settings: Awaited<ReturnType<typeof readSettings>>, senderEmail: string): Promise<DeliveryOutcome> {
  const ref = operationalNotifications().doc(id), now = new Date(), leaseToken = randomUUID();
  const envelope = await getAdminDb().runTransaction(async tx => {
    const snapshot = await tx.get(ref);
    if (!snapshot.exists) return null;
    const current = snapshot.data() as OutboxNotification;
    if (!["pending", "processing"].includes(current.status) || current.nextAttemptAt > now.toISOString()) return null;
    if (current.leaseUntil && Date.parse(current.leaseUntil) > now.getTime()) return null;
    // After an ambiguous timeout, retrying beyond the provider's 24h key lifetime can duplicate mail.
    if ((current.firstAttemptAt && now.getTime() - Date.parse(current.firstAttemptAt) >= retryWindowMs) || current.attempts >= 8) {
      tx.update(ref, { status: "needs_review", errorCode: "safe_retry_window_expired", nextAttemptAt: distantFuture, leaseUntil: null, leaseToken: null });
      return "review" as const;
    }
    const nextEnvelope = current.envelope || envelopeFor(current, settings.recipientEmail, senderEmail);
    const leaseUntil = new Date(now.getTime() + 60_000).toISOString();
    tx.update(ref, { status: "processing", envelope: nextEnvelope, firstAttemptAt: current.firstAttemptAt || now.toISOString(), attempts: current.attempts + 1, leaseUntil, leaseToken, nextAttemptAt: leaseUntil, errorCode: null });
    return nextEnvelope;
  });
  if (!envelope) return "skipped";
  if (envelope === "review") return "review";
  let providerId: string;
  try {
    providerId = await sendOperationalEmail(envelope, `basedspeak-operational/${id}`);
  } catch (error) {
    const code = error instanceof NotificationDeliveryError ? error.code : "delivery_failed";
    const retryable = error instanceof NotificationDeliveryError && error.retryable;
    const retryScheduled = await getAdminDb().runTransaction(async tx => {
      const snapshot = await tx.get(ref), current = snapshot.data() as OutboxNotification | undefined;
      if (!current || current.leaseToken !== leaseToken) return false;
      const retry = retryable && current.attempts < 8;
      const delay = Math.min(60_000 * 5 ** Math.max(0, current.attempts - 1), 6 * 60 * 60 * 1000);
      tx.update(ref, { status: retry ? "pending" : "failed", errorCode: code, nextAttemptAt: retry ? new Date(Date.now() + delay).toISOString() : distantFuture, leaseUntil: null, leaseToken: null });
      return retry;
    });
    return retryScheduled ? "retry" : "review";
  }
  // If this commit fails, the lease expires and the same provider key safely resolves the result.
  await getAdminDb().runTransaction(async tx => {
    const snapshot = await tx.get(ref);
    if (snapshot.data()?.leaseToken !== leaseToken) return;
    tx.update(ref, { status: "sent", providerId, sentAt: new Date().toISOString(), nextAttemptAt: distantFuture, leaseUntil: null, leaseToken: null, errorCode: null });
  });
  return "sent";
}

/** Immediate delivery, cron, and the manager retry action all share leases and provider idempotency. */
export async function processOperationalNotifications(options: { ids?: string[]; limit?: number } = {}) {
  const result = { sent: 0, retry: 0, review: 0, skipped: 0, configured: notificationProviderConfiguration().configured };
  const settings = await readSettings(), provider = notificationProviderConfiguration();
  if (!settings.enabled || !provider.configured || !provider.senderEmail) return result;
  const limit = Math.max(1, Math.min(5, options.limit || 5));
  const ids = options.ids?.slice(0, limit) || (await operationalNotifications().where("nextAttemptAt", "<=", new Date().toISOString()).orderBy("nextAttemptAt", "asc").limit(limit).get()).docs.map(doc => doc.id);
  for (const id of ids) {
    try { result[await deliver(id, settings, provider.senderEmail)] += 1; }
    catch { result.retry += 1; console.error("[notifications] delivery storage unavailable"); }
  }
  return result;
}

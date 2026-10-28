import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RequestPrincipal } from "@/server/auth/principal";
import { emptyProgress, studySteps } from "@/features/theory/progress";

type Data = Record<string, unknown>;
const memory = vi.hoisted(() => {
  const docs = new Map<string, Data>();
  let sequence = 0, transactions = Promise.resolve();
  const snapshot = (path: string) => ({ id: path.split("/").at(-1)!, exists: docs.has(path), data: () => docs.get(path) });
  const ref = (path: string) => ({ path, id: path.split("/").at(-1)!, get: async () => snapshot(path), set: async (data: Data) => { docs.set(path, structuredClone(data)); }, collection: (name: string) => collection(`${path}/${name}`) });
  function collection(path: string, filters: [string, string, unknown][] = [], sort?: [string, string], limit?: number) {
    const matching = () => {
      let entries = [...docs.entries()].filter(([key, data]) => key.startsWith(`${path}/`) && !key.slice(path.length + 1).includes("/") && filters.every(([field, op, value]) => op === "in" ? (value as unknown[]).includes(data[field]) : op === "<=" ? String(data[field]) <= String(value) : data[field] === value));
      if (sort) entries = entries.sort((a, b) => String(a[1][sort[0]]).localeCompare(String(b[1][sort[0]])) * (sort[1] === "desc" ? -1 : 1));
      return limit ? entries.slice(0, limit) : entries;
    };
    return { doc: (id?: string) => ref(`${path}/${id || `generated-${++sequence}`}`), where: (field: string, op: string, value: unknown) => collection(path, [...filters, [field, op, value]], sort, limit), orderBy: (key: string, direction = "asc") => collection(path, filters, [key, direction], limit), limit: (n: number) => collection(path, filters, sort, n), get: async () => ({ docs: matching().map(([key]) => snapshot(key)) }), count: () => ({ get: async () => ({ data: () => ({ count: matching().length }) }) }) };
  }
  function writer() {
    let writing = false;
    const writes: (() => void)[] = [];
    return {
      get: async (reference: { path: string }) => { if (writing) throw new Error("Reads must precede writes"); return snapshot(reference.path); },
      create: (reference: { path: string }, data: Data) => { writing = true; writes.push(() => { if (docs.has(reference.path)) throw new Error("Already exists"); docs.set(reference.path, structuredClone(data)); }); },
      set: (reference: { path: string }, data: Data) => { writing = true; writes.push(() => docs.set(reference.path, structuredClone(data))); },
      update: (reference: { path: string }, data: Data) => { writing = true; writes.push(() => docs.set(reference.path, { ...docs.get(reference.path), ...structuredClone(data) })); },
      commit: async () => { writes.forEach(write => write()); },
    };
  }
  return { docs, db: { collection, batch: writer, runTransaction: async <T>(callback: (tx: ReturnType<typeof writer>) => Promise<T>) => {
    const run = transactions.then(async () => { const tx = writer(); const result = await callback(tx); await tx.commit(); return result; });
    transactions = run.then(() => undefined, () => undefined); return run;
  } } };
});
vi.mock("@/server/firebase", () => ({ getAdminDb: () => memory.db }));
vi.mock("@/server/http/rate-limit", () => ({ consumeRateLimit: vi.fn(async () => undefined) }));
vi.mock("@/server/notifications/background", () => ({ scheduleOperationalNotifications: vi.fn() }));
import { recordVerifiedLogin } from "@/server/auth/service";
import { createConversation, saveLearning } from "@/server/workspace/service";
import { operationalNotificationId } from "@/server/notifications/outbox";
import { getNotificationSettings, processOperationalNotifications, updateNotificationSettings } from "@/server/notifications/service";
import { GET as cron } from "@/app/api/cron/notifications/route";
import { NotificationDeliveryError, sendOperationalEmail } from "@/server/notifications/provider";

const student: RequestPrincipal = { uid: "student", email: "student@example.com", role: "student", source: "session_cookie", subscriptionStatus: "free" };
const now = new Date("2026-10-28T10:00:00Z");
const fetchMock = vi.fn();
const pending = () => [...memory.docs.entries()].filter(([key]) => key.startsWith("operational_notifications/"));
async function newSignup() { await recordVerifiedLogin({ uid: student.uid, email: student.email || undefined, name: "Student" }); return pending()[0]; }
beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(now); memory.docs.clear(); vi.clearAllMocks();
  vi.stubEnv("RESEND_API_KEY", "re_private-test-key"); vi.stubEnv("NOTIFICATION_FROM_EMAIL", "avisos@notify.basedspeak.com"); vi.stubEnv("CRON_SECRET", "private-cron-test-key");
  vi.stubGlobal("fetch", fetchMock); fetchMock.mockResolvedValue({ ok: true, json: async () => ({ id: "provider-accepted-id" }) });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("durable operational events", () => {
  it("atomically queues one new signup, never backfills old profiles on login", async () => {
    await newSignup(); await recordVerifiedLogin({ uid: student.uid, email: student.email || undefined });
    expect(pending()).toHaveLength(1); expect(pending()[0][1]).toMatchObject({ kind: "new_signup", status: "pending", attempts: 0 });
    memory.docs.set("users/old-user", { accountStatus: "active" });
    await recordVerifiedLogin({ uid: "old-user" }); expect(pending()).toHaveLength(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("queues the first 24/24 completion only, including after reset/recompletion, and ignores forged legacy counters", async () => {
    memory.docs.set("users/student", { accountStatus: "active", name: "Student" });
    memory.docs.set("learning_states/student", { studyCompleted: 24 });
    const full = JSON.stringify({ ...emptyProgress, completed: studySteps.map(item => item.step.id) });
    await saveLearning(student, { revision: 0, studySnapshot: full });
    expect(pending()).toHaveLength(1); expect(pending()[0][1].kind).toBe("study_completed");
    await saveLearning(student, { revision: 0, studySnapshot: full });
    await saveLearning(student, { revision: 0, studySnapshot: null });
    await saveLearning(student, { revision: 0, studySnapshot: full });
    expect(pending()).toHaveLength(1);
  });
  it("does not invent a completion for an already complete saved study", async () => {
    memory.docs.set("users/student", { accountStatus: "active" });
    const completed = studySteps.map(item => item.step.id);
    memory.docs.set("learning_states/student", { studySnapshot: JSON.stringify({ ...emptyProgress, completed }) });
    await saveLearning(student, { revision: 0, studySnapshot: JSON.stringify({ ...emptyProgress, position: 1, completed }) });
    expect(pending()).toHaveLength(0);
  });
  it("records a message atomically without copying message content into the outbox", async () => {
    memory.docs.set("users/student", { name: "Student", accountStatus: "pending" });
    await createConversation(student, { subject: "Private subject", body: "Private student message" });
    expect(pending()).toHaveLength(1); expect(JSON.stringify(pending()[0][1])).not.toContain("Private");
    expect([...memory.docs.keys()].some(key => key.startsWith("teacher_conversations/"))).toBe(true);
  });
});

describe("safe delivery and manager configuration", () => {
  it("persists the selected destination and exposes status without exposing API/cron credentials", async () => {
    await newSignup(); const settings = await updateNotificationSettings({ recipientEmail: "  RAUGERAC@gmail.com ", enabled: true }, "manager");
    expect(settings).toMatchObject({ recipientEmail: "raugerac@gmail.com", configured: true, senderEmail: "avisos@notify.basedspeak.com", queuedCount: 1, attentionCount: 0 });
    expect(memory.docs.get("settings/operational_notifications")).toMatchObject({ updatedBy: "manager", recipientEmail: "raugerac@gmail.com" });
    expect(JSON.stringify(settings)).not.toContain("private-test-key"); expect(JSON.stringify(settings)).not.toContain("private-cron");
    await expect(updateNotificationSettings({ recipientEmail: "recipient@example.com\r\nBcc:x@y.com", enabled: true }, "manager")).rejects.toThrow();
  });
  it("keeps events durably pending until the provider is configured, or while the manager pauses mail", async () => {
    await newSignup(); vi.stubEnv("RESEND_API_KEY", "");
    expect(await processOperationalNotifications()).toMatchObject({ configured: false, sent: 0 });
    expect(pending()[0][1]).toMatchObject({ attempts: 0, status: "pending" });
    vi.stubEnv("RESEND_API_KEY", "re_test"); await updateNotificationSettings({ recipientEmail: "raugerac@gmail.com", enabled: false }, "manager");
    await processOperationalNotifications(); expect(fetchMock).not.toHaveBeenCalled();
  });
  it("uses a stable provider idempotency key and Firestore lease to prevent concurrent or repeated delivery", async () => {
    const [path] = await newSignup();
    await Promise.all([processOperationalNotifications(), processOperationalNotifications()]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const request = fetchMock.mock.calls[0][1];
    expect(request.headers["Idempotency-Key"]).toBe(`basedspeak-operational/${path.split("/")[1]}`);
    expect(JSON.parse(request.body)).toMatchObject({ to: ["raugerac@gmail.com"], subject: "[BasedSpeak] Novo cadastro aguardando aprovação" });
    expect(memory.docs.get(path)).toMatchObject({ status: "sent", attempts: 1, providerId: "provider-accepted-id" });
    await processOperationalNotifications(); expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("retries transient failures with the exact first envelope even if the manager changes the recipient", async () => {
    const [path] = await newSignup(); fetchMock.mockRejectedValueOnce(new Error("network timeout"));
    expect(await processOperationalNotifications()).toMatchObject({ retry: 1, sent: 0 });
    expect(memory.docs.get("users/student")).toMatchObject({ accountStatus: "pending" });
    const firstRequest = fetchMock.mock.calls[0][1]; await updateNotificationSettings({ recipientEmail: "new-manager@example.com", enabled: true }, "manager");
    vi.advanceTimersByTime(61_000); await processOperationalNotifications();
    expect(fetchMock.mock.calls[1][1].body).toBe(firstRequest.body);
    expect(fetchMock.mock.calls[1][1].headers["Idempotency-Key"]).toBe(firstRequest.headers["Idempotency-Key"]);
    expect(memory.docs.get(path)).toMatchObject({ status: "sent", attempts: 2 });
  });
  it("recovers an expired lease but refuses uncertain deliveries beyond the safe provider key window", async () => {
    const [path, event] = await newSignup();
    memory.docs.set(path, { ...event, status: "processing", attempts: 1, firstAttemptAt: now.toISOString(), nextAttemptAt: now.toISOString(), leaseUntil: new Date(now.getTime() - 1000).toISOString(), leaseToken: "dead-function" });
    await processOperationalNotifications(); expect(fetchMock).toHaveBeenCalledTimes(1);
    memory.docs.set(path, { ...event, status: "processing", attempts: 1, firstAttemptAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), nextAttemptAt: now.toISOString() });
    expect(await processOperationalNotifications()).toMatchObject({ review: 1 });
    expect(memory.docs.get(path)).toMatchObject({ status: "needs_review", errorCode: "safe_retry_window_expired" });
    expect(fetchMock).toHaveBeenCalledTimes(1); expect((await getNotificationSettings()).attentionCount).toBe(1);
  });
  it("records terminal provider errors with safe codes, never the private response body", async () => {
    const [path] = await newSignup(); fetchMock.mockResolvedValueOnce({ ok: false, status: 403, json: async () => ({ secret: "sensitive provider response" }) });
    await processOperationalNotifications();
    expect(memory.docs.get(path)).toMatchObject({ status: "failed", errorCode: "provider_http_403" });
    expect(JSON.stringify(memory.docs.get(path))).not.toContain("sensitive provider response");
  });
  it("rejects unauthenticated cron calls even when no secret exists", async () => {
    vi.stubEnv("CRON_SECRET", ""); expect((await cron(new Request("https://example.com/api/cron/notifications", { headers: { authorization: "Bearer undefined" } }))).status).toBe(401);
    vi.stubEnv("CRON_SECRET", "private-cron-test-key");
    expect((await cron(new Request("https://example.com/api/cron/notifications"))).status).toBe(401);
    const response = await cron(new Request("https://example.com/api/cron/notifications", { headers: { authorization: "Bearer private-cron-test-key" } }));
    expect(response.status).toBe(200); expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
  it("rejects invalid provider responses without mistaking HTTP acceptance for a durable send result", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await expect(sendOperationalEmail({ from: "x@y.com", to: ["a@b.com"], subject: "x", text: "x" }, "test")).rejects.toBeInstanceOf(NotificationDeliveryError);
  });
  it("deduplicates by kind and entity without placing personal details in document IDs", () => {
    const id = operationalNotificationId({ kind: "new_signup", userId: "student" });
    expect(id).toMatch(/^[a-f0-9]{64}$/); expect(id).toBe(operationalNotificationId({ kind: "new_signup", userId: "student" }));
    expect(id).not.toBe(operationalNotificationId({ kind: "student_message", userId: "student", entityId: "message-1" }));
  });
});

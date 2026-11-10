import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RequestPrincipal } from "@/server/auth/principal";

const memory = vi.hoisted(() => {
  type Data = Record<string, unknown>;
  const docs = new Map<string, Data>();
  const identity = { uid: "FvhS6SDcIJfGiDteKjAlGzBJAQq1", email: "raugerac@gmail.com", emailVerified: true, disabled: false };
  const auth = { getUser: vi.fn(async () => ({ ...identity })) };
  let retry = false;
  let failure: Error | null = null;
  let reads = 0;
  const ref = (path: string) => ({ path, id: path.split("/").at(-1)!, collection: (name: string) => collection(`${path}/${name}`), get: async () => snapshot(path) });
  function snapshot(path: string) {
    const exists = docs.has(path), data = structuredClone(docs.get(path));
    return { id: path.split("/").at(-1)!, exists, ref: ref(path), data: () => structuredClone(data) };
  }
  function collection(path: string, filters: [string, unknown][] = [], limit = 1000) {
    return {
      doc: (id = crypto.randomUUID()) => ref(`${path}/${id}`),
      where: (key: string, _op: string, value: unknown) => collection(path, [...filters, [key, value]], limit),
      limit: (next: number) => collection(path, filters, next),
      get: async () => {
        const selected = [...docs].filter(([key, data]) => key.startsWith(`${path}/`) && !key.slice(path.length + 1).includes("/") && filters.every(([field, value]) => data[field] === value)).slice(0, limit);
        return { size: selected.length, docs: selected.map(([key]) => snapshot(key)) };
      },
    };
  }
  const db = {
    collection,
    runTransaction: async <T>(callback: (tx: unknown) => Promise<T>) => {
      const attempt = async () => {
        const writes: (() => void)[] = [];
        const tx = {
          get: (target: { get: () => Promise<unknown> }) => {
            if (writes.length) throw new Error("Firestore requires all reads before any write");
            reads += 1;
            return target.get();
          },
          set: (target: { path: string }, value: Data) => writes.push(() => docs.set(target.path, structuredClone(value))),
          create: (target: { path: string }, value: Data) => writes.push(() => docs.set(target.path, structuredClone(value))),
          update: (target: { path: string }, value: Data) => writes.push(() => docs.set(target.path, { ...docs.get(target.path), ...structuredClone(value) })),
          delete: (target: { path: string }) => writes.push(() => { docs.delete(target.path); }),
        };
        return { result: await callback(tx), writes };
      };
      if (retry) { retry = false; await attempt(); }
      const current = await attempt();
      if (failure) throw failure;
      current.writes.forEach(write => write());
      return current.result;
    },
  };
  return { docs, db, auth, identity, reset: () => { docs.clear(); retry = false; failure = null; reads = 0; }, retryOnce: () => { retry = true; }, failCommit: (error: Error) => { failure = error; }, readCount: () => reads };
});

vi.mock("@/server/firebase", () => ({ getAdminDb: () => memory.db, getAdminAuth: () => memory.auth }));
vi.mock("@/server/http/rate-limit", () => ({ consumeRateLimit: vi.fn(async () => {}) }));
vi.mock("@/server/notifications/background", () => ({ scheduleOperationalNotifications: vi.fn() }));

import { mutateTestProgress } from "@/server/superuser/service";
import { createConversation, saveLearning } from "@/server/workspace/service";
import { completePresentation } from "@/server/presentation/service";

const owner: RequestPrincipal = { uid: memory.identity.uid, email: memory.identity.email, role: "admin", source: "session_cookie", subscriptionStatus: "free" };
const uid = owner.uid;
const reset = (revision = 0, saveVersion = revision) => mutateTestProgress(owner, { action: "reset-all", revision, saveVersion });
const original = () => structuredClone([...memory.docs]);

beforeEach(() => {
  vi.clearAllMocks();
  memory.reset();
  memory.auth.getUser.mockResolvedValue({ ...memory.identity });
  memory.docs.set(`users/${uid}`, { name: "Owner", email: owner.email, accountStatus: "active", role: "admin", subscriptionStatus: "premium", presentationCompletedAt: "2026-10-01", presentationRevision: 4 });
});

describe("owner-only total journey reset", () => {
  it("removes bookings, own legacy locks, messages, activities and outbox while preserving identity, money, globals and neighbors", async () => {
    const sessionId = `${uid}_p2`;
    const removed = {
      [`demo_live_classes/${uid}`]: { userId: uid, status: "confirmed", start: "2026-11-05T10:00:00Z" },
      "demo_live_class_slots/owned": { userId: uid },
      "demo_live_class_slots/orphan-owned": { userId: uid },
      [`live_sessions/${sessionId}`]: { userId: uid, slotLockId: "legacy", status: "confirmed" },
      "live_session_slot_locks/legacy": { userId: uid, sessionId },
      "live_session_slot_locks/legacy-without-user": { sessionId },
      "live_session_slot_locks/orphan-owned": { userId: uid },
      "teacher_conversations/owner": { userId: uid, messages: [{ body: "old" }] },
      [`users/${uid}/student_activity/learning`]: { kind: "learning" },
      [`users/${uid}/student_activity/contact`]: { kind: "contact" },
      [`users/${uid}/student_activity/scheduling`]: { kind: "scheduling" },
      "management_activity/owner": { userId: uid, actorId: "manager" },
      "operational_notifications/owner-pending": { userId: uid, status: "pending" },
      "operational_notifications/owner-failed": { userId: uid, status: "failed" },
      "operational_notifications/owner-sent": { userId: uid, status: "sent" },
    };
    const preserved = {
      "users/other": { role: "admin", presentationCompletedAt: "keep" },
      "learning_states/other": { revision: 8 },
      "demo_live_classes/other": { userId: "other" },
      "demo_live_class_slots/other": { userId: "other" },
      "live_sessions/other_p2": { userId: "other" },
      "live_session_slot_locks/foreign-even-with-owner-session": { userId: "other", sessionId },
      "live_session_slot_locks/other": { userId: "other", sessionId: "other_p2" },
      "teacher_conversations/other": { userId: "other" },
      "users/other/student_activity/one": { kind: "learning" },
      "management_activity/other-even-with-owner-actor": { userId: "other", actorId: uid },
      "operational_notifications/other": { userId: "other", status: "processing" },
      "settings/operational_notifications": { enabled: true },
      "media/global": { url: "keep" },
      "payment_attempts/owner": { userId: uid, status: "paid" },
      "learning_test_audit/historical": { userId: uid, action: "complete-study" },
    };
    for (const [path, data] of Object.entries({ ...removed, ...preserved })) memory.docs.set(path, data);
    const result = await reset();
    expect(result.learning).toMatchObject({ demoSnapshot: null, studySnapshot: null, demoPercent: 0, studyCompleted: 0, revision: 1, saveVersion: 1, testMode: true });
    for (const path of Object.keys(removed)) expect(memory.docs.has(path), path).toBe(false);
    for (const [path, data] of Object.entries(preserved)) expect(memory.docs.get(path), path).toEqual(data);
    expect(memory.docs.get(`users/${uid}`)).toEqual({ name: "Owner", email: owner.email, accountStatus: "active", role: "admin", subscriptionStatus: "premium", presentationCompletedAt: null, presentationRevision: 5 });
    expect([...memory.docs.keys()].filter(path => path.startsWith("learning_test_audit/"))).toHaveLength(2);
  });

  it("keeps operational data for the partial normal-journey reset", async () => {
    const preserved = { [`demo_live_classes/${uid}`]: { userId: uid }, [`users/${uid}/student_activity/contact`]: { kind: "contact" }, "teacher_conversations/owner": { userId: uid }, "operational_notifications/owner": { userId: uid, status: "pending" } };
    for (const [path, data] of Object.entries(preserved)) memory.docs.set(path, data);
    memory.docs.set(`users/${uid}/student_activity/old-learning`, { kind: "learning" });
    expect((await mutateTestProgress(owner, { action: "reset-real", revision: 0, saveVersion: 0 })).learning.testMode).toBe(false);
    for (const [path, data] of Object.entries(preserved)) expect(memory.docs.get(path)).toEqual(data);
    expect(memory.docs.has(`users/${uid}/student_activity/old-learning`)).toBe(false);
  });

  it("refuses other admins, students and changed canonical identities without reading or modifying journey data", async () => {
    const before = original();
    for (const role of ["admin", "student"] as const) await expect(mutateTestProgress({ ...owner, uid: "other", role }, { action: "reset-all", revision: 0, saveVersion: 0 })).rejects.toMatchObject({ status: 403 });
    for (const patch of [{ emailVerified: false }, { disabled: true }, { email: "other@example.com" }]) {
      memory.auth.getUser.mockResolvedValue({ ...memory.identity, ...patch });
      await expect(reset()).rejects.toMatchObject({ status: 403 });
    }
    expect(original()).toEqual(before);
    expect(memory.readCount()).toBe(0);
  });

  it("rejects old save and presentation tokens after reset; a lost-response retry causes no extra deletion or audit", async () => {
    await reset();
    const after = original();
    await expect(reset()).rejects.toMatchObject({ status: 409 });
    await expect(saveLearning(owner, { revision: 0, saveVersion: 0, demoSnapshot: null })).rejects.toMatchObject({ status: 409 });
    await expect(completePresentation(uid, 4)).rejects.toMatchObject({ status: 409 });
    expect(original()).toEqual(after);
    const second = await reset(1);
    expect(second.learning).toMatchObject({ revision: 2, saveVersion: 2 });
    expect(memory.docs.get(`users/${uid}`)?.presentationRevision).toBe(6);
  });

  it("retries the Firestore callback with all reads first and commits one reset/audit", async () => {
    memory.docs.set(`demo_live_classes/${uid}`, { userId: uid });
    memory.retryOnce();
    expect((await reset()).learning.revision).toBe(1);
    expect(memory.docs.has(`demo_live_classes/${uid}`)).toBe(false);
    expect([...memory.docs.keys()].filter(path => path.startsWith("learning_test_audit/"))).toHaveLength(1);
  });

  it("fails atomically if an owner notification is already being sent", async () => {
    memory.docs.set(`demo_live_classes/${uid}`, { userId: uid });
    memory.docs.set("operational_notifications/in-flight", { userId: uid, status: "processing", leaseUntil: "9999-01-01" });
    const before = original();
    await expect(reset()).rejects.toMatchObject({ status: 409 });
    expect(original()).toEqual(before);
  });

  it("also refuses an expired processing lease because the delivery result may still be unknown", async () => {
    memory.docs.set("operational_notifications/ambiguous", { userId: uid, status: "processing", leaseUntil: "2020-01-01" });
    const before = original();
    await expect(reset()).rejects.toMatchObject({ status: 409 });
    expect(original()).toEqual(before);
  });

  it("handles canonical legacy booking/session keys without userId and never deletes a contradictory UID", async () => {
    memory.docs.set(`demo_live_classes/${uid}`, { status: "completed" });
    memory.docs.set(`live_sessions/${uid}_p2`, { status: "completed" });
    memory.docs.set("live_session_slot_locks/legacy", { sessionId: `${uid}_p2` });
    await reset();
    for (const path of [`demo_live_classes/${uid}`, `live_sessions/${uid}_p2`, "live_session_slot_locks/legacy"]) expect(memory.docs.has(path), path).toBe(false);
    memory.docs.set(`demo_live_classes/${uid}`, { userId: "other", status: "confirmed" });
    const before = original();
    await expect(reset(1)).rejects.toMatchObject({ status: 409 });
    expect(original()).toEqual(before);
  });

  it("refuses an oversized combined deletion plan instead of deleting a bounded prefix", async () => {
    for (let index = 0; index < 230; index++) {
      memory.docs.set(`users/${uid}/student_activity/${index}`, { kind: "contact" });
      memory.docs.set(`teacher_conversations/${index}`, { userId: uid });
    }
    const before = original();
    await expect(reset()).rejects.toMatchObject({ status: 409 });
    expect(original()).toEqual(before);
  });

  it("detects a collection beyond the query sentinel and refuses oversized document payloads atomically", async () => {
    for (let index = 0; index < 452; index++) memory.docs.set(`teacher_conversations/${index}`, { userId: uid });
    const beforeCount = original();
    await expect(reset()).rejects.toMatchObject({ status: 409 });
    expect(original()).toEqual(beforeCount);
    for (let index = 0; index < 452; index++) memory.docs.delete(`teacher_conversations/${index}`);
    for (let index = 0; index < 4; index++) memory.docs.set(`teacher_conversations/${index}`, { userId: uid, messages: [{ body: "x".repeat(600_000) }] });
    const beforeBytes = original();
    await expect(reset()).rejects.toMatchObject({ status: 409 });
    expect(original()).toEqual(beforeBytes);
  });

  it("leaves all documents unchanged if Firestore rejects the atomic commit", async () => {
    memory.docs.set(`demo_live_classes/${uid}`, { userId: uid });
    const before = original();
    memory.failCommit(Object.assign(new Error("Transaction exceeds maximum request size of 10 MiB"), { code: 8 }));
    await expect(reset()).rejects.toMatchObject({ status: 409 });
    expect(original()).toEqual(before);
  });
});

describe("owner messages serialize with the total reset", () => {
  it("requires the canonical owner's current revision even for ordinary messages", async () => {
    const before = original();
    for (const learningRevision of [undefined, -1, "0"]) await expect(createConversation(owner, { subject: "Dúvida", body: "old", ...(learningRevision !== undefined ? { learningRevision } : {}) })).rejects.toMatchObject({ status: 400 });
    expect(original()).toEqual(before);
    await reset();
    await expect(createConversation(owner, { subject: "Dúvida", body: "old", learningRevision: 0 })).rejects.toMatchObject({ status: 409 });
    expect([...memory.docs.keys()].some(path => path.startsWith("teacher_conversations/"))).toBe(false);
    const { conversation } = await createConversation(owner, { subject: "Dúvida", body: "fresh", learningRevision: 1 });
    expect(conversation.userId).toBe(uid);
  });

  it("rejects a message begun on another device before reset but reaching its write transaction afterwards", async () => {
    let release!: () => void;
    const paused = new Promise<void>(resolve => { release = resolve; });
    memory.auth.getUser.mockImplementationOnce(async () => { await paused; return { ...memory.identity }; });
    const pending = createConversation(owner, { subject: "Dúvida", body: "old device", learningRevision: 0 });
    await reset();
    const after = original();
    release();
    await expect(pending).rejects.toMatchObject({ status: 409 });
    expect(original()).toEqual(after);
  });

  it("clears messages committed just before reset, including their activity and queued notification", async () => {
    await createConversation(owner, { subject: "Dúvida", body: "committed before reset", learningRevision: 0 });
    expect([...memory.docs.keys()].filter(path => path.startsWith("teacher_conversations/"))).toHaveLength(1);
    expect([...memory.docs.keys()].filter(path => path.startsWith("operational_notifications/"))).toHaveLength(1);
    await reset();
    for (const prefix of ["teacher_conversations/", "operational_notifications/", `users/${uid}/student_activity/`]) expect([...memory.docs.keys()].some(path => path.startsWith(prefix)), prefix).toBe(false);
  });
});

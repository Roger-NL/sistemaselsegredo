import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { RequestPrincipal } from "@/server/auth/principal";
import { studySteps } from "@/features/theory/progress";
import { monthSlots } from "@/features/live-class/calendar";

// Isolated optimistic-concurrency double: every read captures a version, commit
// checks all read versions atomically, and a conflict reexecutes the callback.
// This tests the real service's retry semantics, not Firestore infrastructure.
const memory = vi.hoisted(() => {
  type Data = Record<string, unknown>;
  const docs = new Map<string, Data>(), versions = new Map<string, number>();
  let sequence = 0, retries = 0;
  const snapshot = (path: string) => { const value = structuredClone(docs.get(path)); return { exists: value !== undefined, data: () => value }; };
  const ref = (path: string) => ({ path, collection: (name: string) => collection(`${path}/${name}`) });
  const collection = (path: string) => ({ doc: (id = `event-${++sequence}`) => ref(`${path}/${id}`) });
  return { docs, reset: () => { docs.clear(); versions.clear(); retries = 0; }, retries: () => retries, db: { collection, runTransaction: async <T>(callback: (tx: unknown) => Promise<T>): Promise<T> => {
    for (let attempt = 0; attempt < 8; attempt++) {
      const reads = new Map<string, number>();
      const writes: { path: string; value?: Data; create?: boolean }[] = [];
      const tx = {
        get: async ({ path }: { path: string }) => { reads.set(path, versions.get(path) ?? 0); return snapshot(path); },
        set: ({ path }: { path: string }, value: Data) => writes.push({ path, value: structuredClone(value) }),
        create: ({ path }: { path: string }, value: Data) => writes.push({ path, value: structuredClone(value), create: true }),
        delete: ({ path }: { path: string }) => writes.push({ path }),
      };
      const result = await callback(tx);
      if ([...reads].some(([path, version]) => (versions.get(path) ?? 0) !== version)) { retries++; continue; }
      if (writes.some(write => write.create && docs.has(write.path))) throw new Error("CREATE_PRECONDITION_FAILED");
      for (const { path, value } of writes) { if (value) docs.set(path, value); else docs.delete(path); versions.set(path, (versions.get(path) ?? 0) + 1); }
      return result;
    }
    throw new Error("TRANSACTION_RETRIES_EXHAUSTED");
  } } };
});
vi.mock("@/server/firebase", () => ({ getAdminDb: () => memory.db }));
vi.mock("@/server/http/rate-limit", () => ({ consumeRateLimit: async () => undefined }));
vi.mock("@/server/notifications/background", () => ({ scheduleOperationalNotifications: () => undefined }));
import { bookLiveClass } from "@/server/live-class/service";
const now = new Date("2026-11-03T12:00:00Z");
const principal = (uid: string): RequestPrincipal => ({ uid, email: `${uid}@example.invalid`, role: "student", source: "session_cookie", subscriptionStatus: "free" });
const paths = (prefix: string) => [...memory.docs.keys()].filter(path => path.startsWith(prefix + "/"));
beforeEach(() => {
  memory.reset(); vi.useFakeTimers(); vi.setSystemTime(now); vi.stubEnv("LIVE_CLASS_TIMEZONE", "Europe/Lisbon");
  for (const uid of ["launch-qa-a", "launch-qa-b"]) {
    memory.docs.set(`users/${uid}`, { accountStatus: "active", name: "Synthetic QA" });
    memory.docs.set(`learning_states/${uid}`, { studySnapshot: JSON.stringify({ version: 1, position: 0, completed: studySteps.map(item => item.step.id), supported: [] }) });
  }
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

it("retries a genuine overlapping slot conflict and commits exactly one student's booking", async () => {
  const start = monthSlots("2026-11", "Europe/Lisbon", now)[0].start;
  const results = await Promise.allSettled([bookLiveClass(principal("launch-qa-a"), { start }), bookLiveClass(principal("launch-qa-b"), { start })]);
  expect(results.filter(item => item.status === "fulfilled")).toHaveLength(1);
  expect(results.find(item => item.status === "rejected")).toMatchObject({ reason: { status: 409 } });
  expect(memory.retries()).toBeGreaterThan(0);
  expect(paths("demo_live_classes")).toHaveLength(1); expect(paths("demo_live_class_slots")).toHaveLength(1);
  expect(paths("operational_notifications")).toHaveLength(1);
  const booking = memory.docs.get(paths("demo_live_classes")[0])!;
  expect(memory.docs.get(paths("demo_live_class_slots")[0])?.userId).toBe(booking.userId);
});

it("resolves simultaneous identical requests idempotently without duplicate activity or notifications", async () => {
  const start = monthSlots("2026-11", "Europe/Lisbon", now)[0].start;
  const results = await Promise.all([bookLiveClass(principal("launch-qa-a"), { start }), bookLiveClass(principal("launch-qa-a"), { start })]);
  expect(results[0]).toEqual(results[1]); expect(memory.retries()).toBeGreaterThan(0);
  expect(paths("demo_live_classes")).toHaveLength(1); expect(paths("demo_live_class_slots")).toHaveLength(1);
  expect(paths("operational_notifications")).toHaveLength(1);
  expect(paths("users/launch-qa-a/student_activity")).toHaveLength(1);
  expect(paths("management_activity")).toHaveLength(1);
});

it("does not allocate two slots when one account concurrently requests different times", async () => {
  const slots = monthSlots("2026-11", "Europe/Lisbon", now);
  const results = await Promise.allSettled([bookLiveClass(principal("launch-qa-a"), { start: slots[0].start }), bookLiveClass(principal("launch-qa-a"), { start: slots[1].start })]);
  expect(results.filter(item => item.status === "fulfilled")).toHaveLength(1);
  expect(results.find(item => item.status === "rejected")).toMatchObject({ reason: { status: 409 } });
  expect(memory.retries()).toBeGreaterThan(0);
  expect(paths("demo_live_class_slots")).toHaveLength(1); expect(paths("demo_live_classes")).toHaveLength(1);
});

import { beforeEach, expect, it, vi } from "vitest";
import { emptyProgress, studySteps } from "@/features/theory/progress";
import type { RequestPrincipal } from "@/server/auth/principal";
import { createDemo, transition } from "@/features/demo/model/reducer";
import { encodeSnapshot } from "@/features/demo/session/storage";

// Two tabs may both finish preflight at revision 0, then commit in this order.
// A serial transaction schedule is sufficient to reproduce a stale write;
// no Firebase, notification delivery or learner data is involved.
const memory = vi.hoisted(() => {
  const docs = new Map<string, Record<string, unknown>>();
  const ref = (path: string) => ({ path, collection: (name: string) => collection(`${path}/${name}`) });
  const collection = (path: string) => ({ doc: (id = "audit-event") => ref(`${path}/${id}`) });
  return { docs, db: { collection, runTransaction: async (callback: (tx: unknown) => Promise<unknown>) => {
    const writes: (() => void)[] = [];
    const tx = {
      get: async (reference: { path: string }) => ({ exists: docs.has(reference.path), data: () => docs.get(reference.path) }),
      set: (reference: { path: string }, data: Record<string, unknown>) => writes.push(() => docs.set(reference.path, structuredClone(data))),
      create: (reference: { path: string }, data: Record<string, unknown>) => writes.push(() => docs.set(reference.path, structuredClone(data))),
    };
    const result = await callback(tx); writes.forEach(write => write()); return result;
  } } };
});
vi.mock("@/server/firebase", () => ({ getAdminDb: () => memory.db }));
vi.mock("@/server/http/rate-limit", () => ({ consumeRateLimit: async () => undefined }));
vi.mock("@/server/notifications/outbox", () => ({ prepareOperationalNotifications: async () => () => [] }));
vi.mock("@/server/notifications/background", () => ({ scheduleOperationalNotifications: () => undefined }));
vi.mock("@/server/auth/principal", () => ({ getRequestPrincipal: async () => ({ uid: "launch-qa", email: "qa@example.invalid", role: "student", source: "session_cookie", subscriptionStatus: "free" }) }));
import { saveLearning, importGuestLearning } from "@/server/workspace/service";
import { PUT } from "@/app/api/student/learning/route";
const principal: RequestPrincipal = { uid: "launch-qa", email: "qa@example.invalid", role: "student", source: "session_cookie", subscriptionStatus: "free" };
const snapshot = (count: number) => JSON.stringify({ ...emptyProgress, completed: studySteps.slice(0, count).map(item => item.step.id) });
beforeEach(() => { memory.docs.clear(); memory.docs.set("users/launch-qa", { accountStatus: "active" }); });

it("preserves newer saved study when a second tab submits a stale snapshot from the same reset revision", async () => {
  await saveLearning(principal, { revision: 0, saveVersion: 0, studySnapshot: snapshot(2) });
  // A rejected stale request or a safe merge are both acceptable outcomes.
  const newer = structuredClone(memory.docs.get("learning_states/launch-qa"));
  await expect(saveLearning(principal, { revision: 0, saveVersion: 0, studySnapshot: snapshot(1) })).rejects.toMatchObject({ status: 409, code: "LEARNING_SAVE_CONFLICT" });
  expect(memory.docs.get("learning_states/launch-qa")).toEqual(newer);
  expect(memory.docs.get("learning_states/launch-qa")?.studyCompleted).toBe(2);
});

it("rejects conflicting story journals and multi-field snapshots without changing either saved field", async () => {
  const initial = createDemo("less", "launch-story", 0);
  const first = encodeSnapshot(initial);
  const next = encodeSnapshot(transition(initial, { type: "PROFILE", profile: "some", at: initial.nodeId }));
  await saveLearning(principal, { revision: 0, saveVersion: 0, demoSnapshot: next, studySnapshot: snapshot(2) });
  const newer = structuredClone(memory.docs.get("learning_states/launch-qa"));
  for (const patch of [{ demoSnapshot: first }, { demoSnapshot: first, studySnapshot: snapshot(1) }, { studySnapshot: snapshot(1) }]) {
    await expect(saveLearning(principal, { revision: 0, saveVersion: 0, ...patch })).rejects.toMatchObject({ status: 409, code: "LEARNING_SAVE_CONFLICT" });
    expect(memory.docs.get("learning_states/launch-qa")).toEqual(newer);
  }
});

it("returns a distinct private HTTP conflict and rejects a missing save token", async () => {
  await saveLearning(principal, { revision: 0, saveVersion: 0, studySnapshot: snapshot(2) });
  const request = (body: object) => new Request("http://localhost/api/student/learning", { method: "PUT", headers: { Origin: "http://localhost", "Content-Type": "application/json", "X-Workspace-Uid": principal.uid }, body: JSON.stringify(body) });
  const conflict = await PUT(request({ revision: 0, saveVersion: 0, studySnapshot: snapshot(1) }));
  expect(conflict.status).toBe(409);
  expect(await conflict.json()).toMatchObject({ code: "LEARNING_SAVE_CONFLICT" });
  expect(conflict.headers.get("cache-control")).toBe("private, no-store");
  expect((await PUT(request({ revision: 0, studySnapshot: snapshot(1) }))).status).toBe(400);
});

it("retries a lost response without extra versions or activity; permits a deliberate regression with the current token", async () => {
  const input = { revision: 0, saveVersion: 0, studySnapshot: snapshot(2) };
  const first = await saveLearning(principal, input);
  const before = structuredClone([...memory.docs]);
  expect(await saveLearning(principal, input)).toEqual(first);
  expect([...memory.docs]).toEqual(before);
  expect(first.learning.saveVersion).toBe(1);
  const back = await saveLearning(principal, { revision: 0, saveVersion: 1, studySnapshot: snapshot(1) });
  expect(back.learning).toMatchObject({ saveVersion: 2, studyCompleted: 1 });
});

it("starts legacy records at zero, versions import, and prevents a stale write after import", async () => {
  memory.docs.set("learning_states/launch-qa", { revision: 0 });
  expect((await importGuestLearning(principal, { revision: 0, saveVersion: 0, studySnapshot: snapshot(2) })).learning.saveVersion).toBe(1);
  await expect(saveLearning(principal, { revision: 0, saveVersion: 0, studySnapshot: snapshot(1) })).rejects.toMatchObject({ code: "LEARNING_SAVE_CONFLICT" });
  await expect(importGuestLearning(principal, { revision: 0, saveVersion: 1, studySnapshot: snapshot(1) })).rejects.toMatchObject({ status: 409 });
});

import { describe, expect, it } from "vitest";
import type { StudentWorkspace } from "../src/contracts/workspace";
import { createWorkspaceStore } from "../src/features/dashboard/workspace-store";
import { emptyGuestLearning, GUEST_LEARNING_KEY, readGuestLearning } from "../src/features/dashboard/guest-learning";
import { resetLessonAccountProgress } from "../src/features/first-encounters/useLessonAccountProgress";
import { createLessonStorage } from "../src/features/first-encounters/lesson-storage";
import { decodeLessonAccountSnapshot, encodeLessonAccountSnapshot } from "../src/features/first-encounters/lesson-account-snapshot";
import { EMPTY_LESSON_DASHBOARD_INPUT, LESSON_DASHBOARD_STORAGE, getLessonDashboardSnapshot } from "../src/features/first-encounters/lesson-dashboard";
const memory = () => { const data = new Map<string, string>(); return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); }, removeItem: (key: string) => { data.delete(key); } }; };
const account = (id = "student-a"): StudentWorkspace => ({ account: { id, name: "Ana", email: "ana@example.test", role: "student", status: "active" }, learning: emptyGuestLearning(), activities: [], conversations: [], liveClass: null });

describe("the new course uses one account-owned progress source", () => {
  it("preserves the approved local demo while ignoring old cafeteria records", () => {
    const storage = memory();
    storage.setItem("basedspeak.learning.guest.v1", JSON.stringify({ version: 1, demoSnapshot: "old cafe", studySnapshot: "old study" }));
    expect(readGuestLearning(storage).studyCompleted).toBe(0);
    storage.setItem(LESSON_DASHBOARD_STORAGE.introduction, "done");
    storage.setItem(LESSON_DASHBOARD_STORAGE.guidePosition, '{"version":1,"index":3}');
    const saved = readGuestLearning(storage);
    expect(getLessonDashboardSnapshot(decodeLessonAccountSnapshot(saved.lessonSnapshot ?? null)?.progress)).toMatchObject({ stage: "guide", percent: 12 });
  });

  it("saves every lesson phase to the signed-in account and resumes on another device", async () => {
    const guest = memory();
    guest.setItem(GUEST_LEARNING_KEY, JSON.stringify({ version: 2, lessonSnapshot: encodeLessonAccountSnapshot({ ...EMPTY_LESSON_DASHBOARD_INPUT, introduction: "done" }) }));
    const before = guest.getItem(GUEST_LEARNING_KEY);
    let server = account();
    const writes: { body: Record<string, unknown>; uid: string | null }[] = [];
    const fetcher = async (url: string, init?: RequestInit) => {
      if (init?.method === "PUT") {
        const body = JSON.parse(String(init.body)); writes.push({ body, uid: new Headers(init.headers).get("X-Workspace-Uid") });
        const input = decodeLessonAccountSnapshot(body.lessonSnapshot)!.progress;
        const snapshot = getLessonDashboardSnapshot(input);
        server = { ...server, learning: { ...server.learning, lessonSnapshot: body.lessonSnapshot, saveVersion: server.learning.saveVersion + 1, demoPercent: snapshot.percent, studyCompleted: snapshot.completedUnits } };
        return Response.json({ learning: server.learning });
      }
      expect(url).toBe("/api/student/workspace"); return Response.json(server);
    };
    const store = createWorkspaceStore(fetcher, () => guest, () => memory());
    await store.load();
    const storage = createLessonStorage(store, store.getSnapshot().generation);
    expect(storage.getItem(LESSON_DASHBOARD_STORAGE.introduction)).toBeNull();
    storage.setItem(LESSON_DASHBOARD_STORAGE.introPosition, '{"version":1,"index":2}');
    await store.flush();
    expect(writes).toHaveLength(1);
    expect(writes[0].uid).toBe("student-a");
    expect(writes[0].body).toMatchObject({ revision: 0, saveVersion: 0 });
    expect(writes[0].body).not.toHaveProperty("demoSnapshot");
    expect(guest.getItem(GUEST_LEARNING_KEY)).toBe(before);
    const otherDevice = createWorkspaceStore(fetcher, () => memory(), () => memory());
    await otherDevice.load();
    const restored = createLessonStorage(otherDevice, otherDevice.getSnapshot().generation);
    expect(restored.getItem(LESSON_DASHBOARD_STORAGE.introPosition)).toBe('{"version":1,"index":2}');
    const stale = storage;
    server = account("student-b"); await store.load(true);
    expect(() => stale.setItem(LESSON_DASHBOARD_STORAGE.introduction, "done")).toThrow();
    expect(writes).toHaveLength(1);
  });

  it("keeps anonymous learning public and never calls a write API", async () => {
    const local = memory();
    const calls: string[] = [];
    const store = createWorkspaceStore(async (_url, init) => { calls.push(init?.method ?? "GET"); return Response.json({}, { status: 401 }); }, () => local, () => memory());
    await store.load();
    const storage = createLessonStorage(store, store.getSnapshot().generation);
    storage.setItem(LESSON_DASHBOARD_STORAGE.introduction, "done");
    await store.flush();
    expect(readGuestLearning(local).studyCompleted).toBe(3);
    expect(calls).toEqual(["GET"]);
  });
  it.each(["account", "revision"] as const)("does not report a reset as successful after its %s changes during preflight", async change => {
    let calls = 0;
    const original = account();
    const changed = change === "account" ? account("student-b") : { ...account(), learning: { ...emptyGuestLearning(), revision: 1 } };
    let writes = 0;
    const store = createWorkspaceStore(async (_url, init) => {
      if (init?.method === "PUT") { writes++; return Response.json({ learning: changed.learning }); }
      return Response.json(++calls === 1 ? original : changed);
    }, () => memory(), () => memory());
    await store.load();
    const generation = store.getSnapshot().generation;
    await expect(resetLessonAccountProgress(store, generation)).rejects.toThrow("mudou");
    expect(writes).toBe(0);
    expect(store.getSnapshot().workspace).toEqual(changed);
    await expect(resetLessonAccountProgress(store, generation)).rejects.toThrow("Atualize");
    expect(writes).toBe(0);
  });

});

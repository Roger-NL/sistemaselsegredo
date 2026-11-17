import { afterEach, describe, expect, it, vi } from "vitest";
import type { StudentWorkspace } from "@/contracts/workspace";
import { createWorkspaceStore } from "@/features/dashboard/workspace-store";
import { canPractice } from "@/features/dashboard/practice-access";
import { GUEST_LEARNING_KEY, emptyGuestLearning, readGuestLearning } from "@/features/dashboard/guest-learning";
import { accountLesson } from "./helpers/lesson-snapshot";
const json = (data: unknown, status = 200) => Response.json(data, { status });
const account = (uid = "student", status: "pending" | "active" = "pending"): StudentWorkspace => ({ account: { id: uid, name: "Student", email: "student@example.test", status, role: "student" }, learning: emptyGuestLearning(), liveClass: null, activities: [], conversations: [] });
function setup() {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
  const fetcher = vi.fn<(input: string, init?: RequestInit) => Promise<Response>>();
  return { values, storage, fetcher, store: createWorkspaceStore(fetcher, () => storage) };
}
const cache = (s: ReturnType<typeof setup>, units = 13) => s.values.set(GUEST_LEARNING_KEY, JSON.stringify({ version: 2, lessonSnapshot: accountLesson(units) }));
afterEach(() => vi.useRealTimers());

describe("the public lesson and deliberate account continuation", () => {
  it("opens and reloads anonymous learning without a write API", async () => {
    const s = setup(); s.fetcher.mockResolvedValue(json({}, 401)); await s.store.load();
    expect(canPractice(s.store.getSnapshot())).toBe(true);
    expect(s.store.stage("lessonSnapshot", accountLesson(13), s.store.getSnapshot().generation)).toBe(true);
    await s.store.flush();
    const reloaded = createWorkspaceStore(s.fetcher, () => s.storage); await reloaded.load();
    expect(reloaded.getSnapshot().guestLearning).toMatchObject({ studyCompleted: 13, studyTotal: 49 });
    expect(s.fetcher.mock.calls.every(([, init]) => !init?.method)).toBe(true);
  });
  it("permits public practice while offline and reports storage failures", async () => {
    const s = setup(); s.fetcher.mockRejectedValue(new Error("offline")); await s.store.load();
    expect(canPractice(s.store.getSnapshot())).toBe(true); expect(s.store.getSnapshot().notice).toContain("apenas neste navegador");
    const broken = createWorkspaceStore(async () => json({}, 401), () => ({ getItem: () => null, removeItem: () => {}, setItem: () => { throw new Error("blocked"); } }));
    await broken.load(); expect(broken.stage("lessonSnapshot", accountLesson(3), broken.getSnapshot().generation)).toBe(true);
    expect(broken.getSnapshot().guestLearning?.studyCompleted).toBe(3); expect(broken.getSnapshot().notice).toContain("não permitiu salvar");
  });
  it("synchronizes a pending account while keeping guest learning separate", async () => {
    const s = setup(); cache(s); const data = account();
    s.fetcher.mockResolvedValueOnce(json(data)).mockResolvedValueOnce(json(data)).mockResolvedValueOnce(json({ learning: { ...data.learning, lessonSnapshot: accountLesson(20), studyCompleted: 20, saveVersion: 1 } }));
    await s.store.load(); expect(canPractice(s.store.getSnapshot())).toBe(true);
    s.store.stage("lessonSnapshot", accountLesson(20), s.store.getSnapshot().generation); await s.store.flush();
    expect(s.store.getSnapshot().workspace?.learning.studyCompleted).toBe(20);
    expect(readGuestLearning(s.storage).studyCompleted).toBe(13);
    expect(new Headers(s.fetcher.mock.calls[2][1]?.headers).get("X-Workspace-Uid")).toBe("student");
  });
  it("never mixes private work into the guest journey when a session expires", async () => {
    const s = setup(); cache(s); const data = account("private"); data.learning.lessonSnapshot = accountLesson(49);
    s.fetcher.mockResolvedValueOnce(json(data)).mockResolvedValueOnce(json({}, 401));
    await s.store.load(); const stale = s.store.getSnapshot().generation; await s.store.load(true);
    expect(s.store.getSnapshot().workspace).toBeNull(); expect(s.store.getSnapshot().guestLearning?.studyCompleted).toBe(13);
    expect(s.store.stage("lessonSnapshot", accountLesson(49), stale)).toBe(false);
  });
  it("rejects a foreign or corrupt browser curriculum without reading private caches", () => {
    const s = setup(); s.values.set("basedspeak.learning.private.0", "private");
    s.values.set(GUEST_LEARNING_KEY, JSON.stringify({ version: 2, lessonSnapshot: '{"version":1,"courseId":"cafeteria","progress":{}}' }));
    expect(readGuestLearning(s.storage).studyCompleted).toBe(0);
    expect(s.values.get("basedspeak.learning.private.0")).toBe("private");
  });
  it("never imports on login and removes guest work only after confirmed persistence", async () => {
    const s = setup(); cache(s, 49); const data = account();
    s.fetcher.mockResolvedValueOnce(json(data)).mockResolvedValueOnce(json({ learning: { ...data.learning, lessonSnapshot: accountLesson(49), studyCompleted: 49 } }));
    await s.store.load(); expect(s.fetcher).toHaveBeenCalledTimes(1);
    const generation = s.store.getSnapshot().generation; await s.store.importGuestProgress(generation);
    expect(JSON.parse(String(s.fetcher.mock.calls[1][1]?.body))).toEqual({ revision: 0, saveVersion: 0, lessonSnapshot: accountLesson(49) });
    expect(s.values.has(GUEST_LEARNING_KEY)).toBe(false); expect(s.store.getSnapshot().workspace?.learning.studyCompleted).toBe(49);
    expect(s.store.stage("lessonSnapshot", accountLesson(10), generation)).toBe(false);
  });
  it("refuses to overwrite an existing course, reservation or reset epoch before requesting import", async () => {
    for (const patch of [{ learning: { lessonSnapshot: accountLesson(3) } }, { learning: { lessonSnapshot: accountLesson(0) } }, { learning: { demoSnapshot: "historical-course" } }, { learning: { studySnapshot: "historical-study" } }, { learning: { revision: 1 } }, { liveClass: { id: "reserved" } }]) {
      const s = setup(); cache(s); const data = account(); Object.assign(data.learning, patch.learning); Object.assign(data, patch.liveClass ? { liveClass: patch.liveClass } : {});
      s.fetcher.mockResolvedValue(json(data)); await s.store.load();
      await expect(s.store.importGuestProgress(s.store.getSnapshot().generation)).rejects.toThrow("conta sem progresso");
      expect(s.fetcher).toHaveBeenCalledTimes(1); expect(s.values.has(GUEST_LEARNING_KEY)).toBe(true);
    }
  });
  it("preserves both journeys when another device wins an import race", async () => {
    const s = setup(); cache(s); s.fetcher.mockResolvedValueOnce(json(account())).mockResolvedValueOnce(json({ error: "Seu progresso foi preservado." }, 409));
    await s.store.load(); await expect(s.store.importGuestProgress(s.store.getSnapshot().generation)).rejects.toThrow("preservado");
    expect(s.values.has(GUEST_LEARNING_KEY)).toBe(true); expect(s.store.getSnapshot().workspace?.learning.lessonSnapshot).toBeNull();
  });
});

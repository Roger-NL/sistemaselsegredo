import { afterEach, describe, expect, it, vi } from "vitest";
import { localToolsAllowed } from "@/features/local-testing/environment";
import { changeTestProgress } from "@/features/local-testing/progress";
import { TEST_LEARNING_KEY, setLocalTesting, testStorage, workspaceFetch } from "@/features/local-testing/sandbox";
import { emptyGuestLearning, GUEST_LEARNING_KEY, readGuestLearning, writeGuestLearning } from "@/features/dashboard/guest-learning";
import { decodeLessonAccountSnapshot } from "@/features/first-encounters/lesson-account-snapshot";
import { getLessonDashboardSnapshot } from "@/features/first-encounters/lesson-dashboard";
import { restoreLessonProgress } from "@/features/first-encounters/lesson-progress";
import { LESSON_SCENES } from "@/features/first-encounters/lesson-one";
function storage() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); }, clear: () => values.clear(), key: (index: number) => [...values.keys()][index] ?? null, get length() { return values.size; } };
}
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe("local-only development boundary", () => {
  it("rejects every host in production and remote hosts in development", () => {
    vi.stubEnv("NODE_ENV", "production");
    for (const host of ["localhost", "127.0.0.1:3000", "[::1]:3000", "www.basedspeak.com"]) expect(localToolsAllowed(host)).toBe(false);
    vi.stubEnv("NODE_ENV", "development");
    for (const host of ["localhost", "127.0.0.1:3000", "[::1]:3000"]) expect(localToolsAllowed(host)).toBe(true);
    for (const host of ["localhost.example.com", "www.basedspeak.com", "192.168.1.2:3000"]) expect(localToolsAllowed(host)).toBe(false);
  });
  it("keeps real guest progress and account caches intact when test data are written or reset", () => {
    const port = storage();
    port.setItem(GUEST_LEARNING_KEY, "original guest"); port.setItem("basedspeak.learning.account.1", "private account");
    const isolated = testStorage(port);
    writeGuestLearning(isolated, changeTestProgress(emptyGuestLearning(), "complete-study", "beginner"));
    expect(readGuestLearning(isolated).studyCompleted).toBe(49);
    expect(port.getItem(GUEST_LEARNING_KEY)).toBe("original guest");
    isolated.removeItem!("basedspeak.learning.account.1"); isolated.removeItem!(GUEST_LEARNING_KEY);
    expect(port.getItem(TEST_LEARNING_KEY)).toBeNull();
    expect(port.getItem("basedspeak.learning.account.1")).toBe("private account");
  });
  it("blocks workspace requests locally, including writes, but cannot activate the sandbox in production", async () => {
    const port = storage(); const fetcher = vi.fn(async () => new Response("{}"));
    vi.stubGlobal("window", { location: { hostname: "localhost" }, localStorage: port, sessionStorage: storage(), dispatchEvent: vi.fn() }); vi.stubGlobal("fetch", fetcher);
    vi.stubEnv("NODE_ENV", "development"); setLocalTesting(true);
    expect((await workspaceFetch("/api/student/workspace")).status).toBe(401);
    expect((await workspaceFetch("/api/student/learning", { method: "PUT" })).status).toBe(401);
    expect(fetcher).not.toHaveBeenCalled();
    vi.stubEnv("NODE_ENV", "production"); expect(() => setLocalTesting(true)).toThrow();
    await workspaceFetch("/api/student/workspace"); expect(fetcher).toHaveBeenCalledOnce();
  });
});
describe("synthetic local progress", () => {
  it("jumps among all six real activities and completes validated lesson snapshots without mutating the original", () => {
    const original = emptyGuestLearning();
    for (const part of [1, 3, 6]) {
      const jumped = changeTestProgress(original, "jump-demo", undefined, part);
      const input = decodeLessonAccountSnapshot(jumped.lessonSnapshot!)!.progress;
      const position = restoreLessonProgress(input.lesson);
      expect(LESSON_SCENES[position.scene].game).toBe(part);
    }
    const jumped = changeTestProgress(original, "jump-demo", undefined, 3);
    const advanced = changeTestProgress(jumped, "advance-demo");
    expect(LESSON_SCENES[restoreLessonProgress(decodeLessonAccountSnapshot(advanced.lessonSnapshot!)!.progress.lesson).scene].game).toBe(4);
    const complete = changeTestProgress(advanced, "complete-demo");
    expect(getLessonDashboardSnapshot(decodeLessonAccountSnapshot(complete.lessonSnapshot!)!.progress)).toMatchObject({ lessonCompleted: 29, percent: 78 });
    expect(original.lessonSnapshot).toBeNull();
  });
  it("completes the new written review, resets each area and never leaks local simulations into account data", () => {
    const demo = changeTestProgress(emptyGuestLearning(), "complete-demo");
    const one = changeTestProgress(demo, "advance-study"); expect(one.studyCompleted).toBeGreaterThan(demo.studyCompleted);
    const all = changeTestProgress(one, "complete-study"); expect(all.studyCompleted).toBe(49);
    const resetStudy = getLessonDashboardSnapshot(decodeLessonAccountSnapshot(changeTestProgress(all, "reset-study").lessonSnapshot!)!.progress);
    expect(resetStudy.lessonCompleted).toBe(29); expect(resetStudy.percent).toBe(78);
    const resetDemo = getLessonDashboardSnapshot(decodeLessonAccountSnapshot(changeTestProgress(all, "reset-demo").lessonSnapshot!)!.progress);
    expect(resetDemo.lessonCompleted).toBe(0); expect(resetDemo.percent).toBeLessThan(100);
    expect(changeTestProgress(all, "reset-all").lessonSnapshot).toBeNull();
    expect(demo.lessonSnapshot).not.toBeNull();
  });
});

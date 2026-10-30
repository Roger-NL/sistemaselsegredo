import { afterEach, describe, expect, it, vi } from "vitest";
import { localToolsAllowed } from "@/features/local-testing/environment";
import { changeTestProgress } from "@/features/local-testing/progress";
import { TEST_LEARNING_KEY, setLocalTesting, testStorage, workspaceFetch } from "@/features/local-testing/sandbox";
import { emptyGuestLearning, GUEST_LEARNING_KEY, readGuestLearning, writeGuestLearning } from "@/features/dashboard/guest-learning";
import { decodeSnapshot } from "@/features/demo/session/storage";
import { catalog } from "@/features/demo/content/catalog";
import { PROFILES } from "@/features/demo/model/types";
import { studySteps } from "@/features/theory/progress";
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
    expect(readGuestLearning(isolated).studyCompleted).toBe(studySteps.length);
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
  for (const profile of PROFILES) it(`can jump, resume and finish valid demo snapshots for ${profile}`, () => {
    const original = emptyGuestLearning();
    for (const part of [1, 3, 6, 10]) {
      const jumped = changeTestProgress(original, "jump-demo", profile, part);
      expect(catalog[decodeSnapshot(jumped.demoSnapshot!)!.nodeId].part).toBe(part);
    }
    const jumped = changeTestProgress(original, "jump-demo", profile, 3);
    const advanced = changeTestProgress(jumped, "advance-demo", profile);
    expect(catalog[decodeSnapshot(advanced.demoSnapshot!)!.nodeId].part).toBe(4);
    const completed = changeTestProgress(advanced, "complete-demo", profile);
    const state = decodeSnapshot(completed.demoSnapshot!)!;
    expect(state.nodeId).toBe("end"); expect(state.evidence.length).toBeGreaterThan(10);
    expect(state.journal.some(event => event.type === "TEST_FORWARD")).toBe(false);
    expect(original.demoSnapshot).toBeNull();
    expect(changeTestProgress(completed, "reset-demo", profile).demoSnapshot).toBeNull();
  });
  it("advances the next unfinished study practice, finishes all practices, and resets each area independently", () => {
    const demo = changeTestProgress(emptyGuestLearning(), "complete-demo", "beginner");
    const one = changeTestProgress(demo, "advance-study", "beginner"); expect(one.studyCompleted).toBe(1);
    const all = changeTestProgress(one, "complete-study", "beginner"); expect(all.studyCompleted).toBe(studySteps.length);
    const resetStudy = changeTestProgress(all, "reset-study", "beginner");
    expect(resetStudy.demoSnapshot).toBe(demo.demoSnapshot); expect(resetStudy.studySnapshot).toBeNull();
    const resetDemo = changeTestProgress(all, "reset-demo", "beginner"); expect(resetDemo.studySnapshot).toBe(all.studySnapshot);
    const resetAll = changeTestProgress(all, "reset-all", "beginner"); expect(resetAll.demoSnapshot).toBeNull(); expect(resetAll.studySnapshot).toBeNull();
  });
});

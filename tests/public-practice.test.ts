import { afterEach, describe, expect, it, vi } from "vitest";
import type { StudentWorkspace } from "@/contracts/workspace";
import { createWorkspaceStore } from "@/features/dashboard/workspace-store";
import { canPractice } from "@/features/dashboard/practice-access";
import { GUEST_LEARNING_KEY, readGuestLearning } from "@/features/dashboard/guest-learning";
import { createDemo } from "@/features/demo/model/reducer";
import { encodeSnapshot } from "@/features/demo/session/storage";
import { emptyProgress, studySteps } from "@/features/theory/progress";

const story = encodeSnapshot(createDemo("beginner", "public-practice-test", 0));
const study = JSON.stringify({ ...emptyProgress, position: 4, completed: studySteps.slice(0, 4).map(item => item.step.id) });
const fullStudy = JSON.stringify({ ...emptyProgress, completed: studySteps.map(item => item.step.id) });
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status });
const account = (uid = "student", status: "pending" | "active" = "pending"): StudentWorkspace => ({ account: { id: uid, name: "Student", email: "student@example.com", status, role: "student" }, learning: { revision: 0, demoSnapshot: null, studySnapshot: null, studyCompleted: 0, studyTotal: 24, demoPercent: 0, updatedAt: null }, liveClass: null, activities: [], conversations: [] });
function setup() {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) || null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
  const fetcher = vi.fn<(input: string, init?: RequestInit) => Promise<Response>>();
  return { values, storage, fetcher, store: createWorkspaceStore(fetcher, () => storage) };
}
const cache = (context: ReturnType<typeof setup>, snapshot = study) => context.values.set(GUEST_LEARNING_KEY, JSON.stringify({ version: 1, demoSnapshot: story, studySnapshot: snapshot }));
afterEach(() => vi.useRealTimers());

describe("public conversation and guided study", () => {
  it("opens without an account, saves locally without any write API and restores both practices on reload", async () => {
    const s = setup(); s.fetcher.mockResolvedValue(json({}, 401));
    expect(canPractice(s.store.getSnapshot())).toBe(false);
    await s.store.load(); const generation = s.store.getSnapshot().generation;
    expect(canPractice(s.store.getSnapshot())).toBe(true); expect(s.store.getSnapshot().workspace).toBeNull();
    expect(s.store.stage("demoSnapshot", story, generation)).toBe(true);
    expect(s.store.stage("studySnapshot", study, generation)).toBe(true);
    await s.store.flush(); expect(s.store.hasPendingChanges()).toBe(false);
    expect(s.fetcher).toHaveBeenCalledTimes(1); expect(s.values.has(GUEST_LEARNING_KEY)).toBe(true);
    const reloaded = createWorkspaceStore(s.fetcher, () => s.storage); await reloaded.load();
    expect(reloaded.getSnapshot().guestLearning).toMatchObject({ demoSnapshot: story, studySnapshot: study, studyCompleted: 4 });
    expect(s.fetcher.mock.calls.some(([, init]) => init?.method === "PUT" || init?.method === "POST")).toBe(false);
  });
  it("still opens the public demo when account lookup is temporarily unavailable, without pretending to sync", async () => {
    const s = setup(); s.fetcher.mockRejectedValue(new Error("Account service offline"));
    await s.store.load();
    expect(canPractice(s.store.getSnapshot())).toBe(true); expect(s.store.getSnapshot().workspace).toBeNull();
    expect(s.store.getSnapshot().notice).toContain("apenas neste navegador");
  });
  it("reports blocked local storage honestly and keeps the current page usable", async () => {
    const fetcher = vi.fn(async () => json({}, 401));
    const store = createWorkspaceStore(fetcher, () => ({ getItem: () => null, removeItem: () => {}, setItem: () => { throw new Error("Storage blocked"); } }));
    await store.load(); expect(store.stage("demoSnapshot", story, store.getSnapshot().generation)).toBe(true);
    expect(store.getSnapshot().guestLearning?.demoSnapshot).toBe(story); expect(store.getSnapshot().notice).toContain("não permitiu salvar");
  });
  it("synchronizes a pending student's real account while keeping the guest journey separate", async () => {
    const s = setup(); cache(s);
    const data = account();
    s.fetcher.mockResolvedValueOnce(json(data)).mockResolvedValueOnce(json(data)).mockResolvedValueOnce(json({ learning: { ...data.learning, studySnapshot: study, studyCompleted: 4 } }));
    await s.store.load(); expect(canPractice(s.store.getSnapshot())).toBe(true);
    expect(s.store.getSnapshot().workspace?.learning.demoSnapshot).toBeNull();
    expect(s.store.getSnapshot().guestLearning?.demoSnapshot).toBe(story);
    s.store.stage("studySnapshot", study, s.store.getSnapshot().generation); await s.store.flush();
    expect(s.fetcher.mock.calls[2][0]).toBe("/api/student/learning");
    expect(s.store.getSnapshot().workspace?.learning.studyCompleted).toBe(4);
    expect(s.values.has(GUEST_LEARNING_KEY)).toBe(true);
  });
  it("never mixes the previous signed-in student's work into the public journey after session expiration", async () => {
    const s = setup(); cache(s);
    const data = account("private-student", "active"); data.learning.studySnapshot = fullStudy;
    s.fetcher.mockResolvedValueOnce(json(data)).mockResolvedValueOnce(json({}, 401));
    await s.store.load(); const stale = s.store.getSnapshot().generation; await s.store.load(true);
    expect(s.store.getSnapshot().workspace).toBeNull(); expect(s.store.getSnapshot().guestLearning?.studyCompleted).toBe(4);
    expect(s.store.stage("studySnapshot", fullStudy, stale)).toBe(false);
  });
  it("rejects corrupt or forged browser progress without touching private account caches", () => {
    const s = setup(); s.values.set("basedspeak.learning.private.0", "private-progress");
    for (const value of ["broken", JSON.stringify({ version: 1, demoSnapshot: "fake" }), JSON.stringify({ version: 1, studySnapshot: JSON.stringify({ ...emptyProgress, completed: ["forged-step"] }) })]) {
      s.values.set(GUEST_LEARNING_KEY, value); expect(readGuestLearning(s.storage).studyCompleted).toBe(0);
      expect(s.values.has(GUEST_LEARNING_KEY)).toBe(false);
      expect(s.values.get("basedspeak.learning.private.0")).toBe("private-progress");
    }
  });
});

describe("explicit continuation into an account", () => {
  it("ignores an older read during import and serializes navigation until the saved journey is confirmed", async () => {
    const s = setup(); cache(s, fullStudy); const data = account();
    const imported = { ...data, learning: { ...data.learning, demoSnapshot: story, studySnapshot: fullStudy, studyCompleted: 24 } };
    let finishRead!: (response: Response) => void;
    let finishImport!: (response: Response) => void;
    s.fetcher.mockResolvedValueOnce(json(data))
      .mockImplementationOnce(() => new Promise(resolve => { finishRead = resolve; }))
      .mockImplementationOnce(() => new Promise(resolve => { finishImport = resolve; }))
      .mockResolvedValueOnce(json(imported));
    await s.store.load();
    const olderRead = s.store.load(true);
    const importing = s.store.importGuestProgress(s.store.getSnapshot().generation);
    finishRead(json(data)); await olderRead;
    expect(s.store.getSnapshot().saving).toBe(true);
    const navigating = s.store.load(true);
    expect(s.fetcher).toHaveBeenCalledTimes(3);
    finishImport(json({ learning: imported.learning }));
    await Promise.all([importing, navigating]);
    expect(s.store.getSnapshot().workspace?.learning.studyCompleted).toBe(24);
    expect(s.store.getSnapshot().saving).toBe(false);
    expect(s.values.has(GUEST_LEARNING_KEY)).toBe(false);
  });
  it("does not import on login; imports only after the explicit action and clears the browser journey after confirmed persistence", async () => {
    const s = setup(); cache(s, fullStudy); const data = account();
    s.fetcher.mockResolvedValueOnce(json(data)).mockResolvedValueOnce(json({ learning: { ...data.learning, demoSnapshot: story, studySnapshot: fullStudy, studyCompleted: 24 } }));
    await s.store.load(); expect(s.fetcher).toHaveBeenCalledTimes(1);
    expect(s.store.getSnapshot().workspace?.learning.studyCompleted).toBe(0);
    const generation = s.store.getSnapshot().generation; await s.store.importGuestProgress(generation);
    expect(s.fetcher.mock.calls[1]).toEqual(["/api/student/learning/import", expect.objectContaining({ method: "POST", headers: { "Content-Type": "application/json", "X-Workspace-Uid": "student" } })]);
    expect(JSON.parse(s.fetcher.mock.calls[1][1]!.body as string)).toEqual({ revision: 0, demoSnapshot: story, studySnapshot: fullStudy });
    expect(s.store.getSnapshot().workspace?.learning.studyCompleted).toBe(24); expect(s.values.has(GUEST_LEARNING_KEY)).toBe(false);
    expect(s.store.stage("demoSnapshot", story, generation)).toBe(false);
  });
  it("refuses to overwrite any existing account journey or reset epoch before making a request", async () => {
    for (const learning of [{ demoSnapshot: story }, { studySnapshot: study }, { revision: 1 }]) {
      const s = setup(); cache(s, fullStudy); const data = account(); data.learning = { ...data.learning, ...learning };
      s.fetcher.mockResolvedValueOnce(json(data)); await s.store.load();
      await expect(s.store.importGuestProgress(s.store.getSnapshot().generation)).rejects.toThrow("conta sem progresso");
      expect(s.fetcher).toHaveBeenCalledTimes(1); expect(s.values.has(GUEST_LEARNING_KEY)).toBe(true);
    }
  });
  it("preserves both journeys when the server detects another device has already saved progress", async () => {
    const s = setup(); cache(s, fullStudy);
    s.fetcher.mockResolvedValueOnce(json(account())).mockResolvedValueOnce(json({ error: "Esta conta já tem um percurso. Seu progresso foi preservado." }, 409));
    await s.store.load(); await expect(s.store.importGuestProgress(s.store.getSnapshot().generation)).rejects.toThrow("preservado");
    expect(s.values.has(GUEST_LEARNING_KEY)).toBe(true); expect(s.store.getSnapshot().saving).toBe(false);
    expect(s.store.getSnapshot().workspace?.learning.studySnapshot).toBeNull();
  });
});

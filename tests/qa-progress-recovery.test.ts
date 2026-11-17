import { describe, expect, it, vi } from "vitest";
import type { StudentWorkspace } from "@/contracts/workspace";
import { GUEST_LEARNING_KEY, readGuestLearning } from "@/features/dashboard/guest-learning";
import { createWorkspaceStore } from "@/features/dashboard/workspace-store";
import { accountLesson } from "./helpers/lesson-snapshot";
const study = accountLesson(2);
const guestRecord = JSON.stringify({ version: 2, lessonSnapshot: study, updatedAt: null });
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const account = (uid = "student-a"): StudentWorkspace => ({
  account: { id: uid, name: "Pessoa", email: `${uid}@example.invalid`, status: "active", role: "student" },
  learning: { revision: 0, saveVersion: 0, demoSnapshot: null, studySnapshot: null, lessonSnapshot: null, demoPercent: 0, studyCompleted: 0, studyTotal: 49, updatedAt: null },
  activities: [], conversations: [], liveClass: null,
});
function memoryStorage() {
  const records = new Map<string, string>();
  return {
    records,
    getItem: (key: string) => records.get(key) ?? null,
    setItem: (key: string, value: string) => { records.set(key, value); },
    removeItem: (key: string) => { records.delete(key); },
  };
}

describe("resuming and protecting local progress", () => {
  it("keeps the guest journey after an interrupted import and removes it only after an explicit successful retry", async () => {
    const local = memoryStorage(), data = account();
    local.setItem(GUEST_LEARNING_KEY, guestRecord);
    let finishImport!: (result: Response) => void;
    const fetcher = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValueOnce(response(data))
      .mockRejectedValueOnce(new Error("Connection interrupted"))
      .mockImplementationOnce(() => new Promise(resolve => { finishImport = resolve; }));
    const store = createWorkspaceStore(fetcher, () => local);
    await store.load();
    const generation = store.getSnapshot().generation;

    await expect(store.importGuestProgress(generation)).rejects.toThrow("Connection interrupted");
    expect(local.getItem(GUEST_LEARNING_KEY)).toBe(guestRecord);
    expect(store.getSnapshot().workspace?.learning.lessonSnapshot).toBeNull();
    expect(store.getSnapshot().saving).toBe(false);
    expect(fetcher.mock.calls.filter(([, init]) => init?.method === "POST")).toHaveLength(1);

    const retry = store.importGuestProgress(generation);
    expect(local.getItem(GUEST_LEARNING_KEY)).toBe(guestRecord);
    expect(store.getSnapshot().workspace?.learning.lessonSnapshot).toBeNull();
    const imported = { ...data.learning, saveVersion: 1, lessonSnapshot: study, studyCompleted: 2 };
    finishImport(response({ learning: imported }));
    await retry;
    expect(local.getItem(GUEST_LEARNING_KEY)).toBeNull();
    expect(store.getSnapshot().workspace?.learning).toEqual(imported);
    expect(store.getSnapshot().generation).toBeGreaterThan(generation);
    expect(store.stage("lessonSnapshot", study, generation)).toBe(false);
    expect(fetcher.mock.calls.filter(([, init]) => init?.method === "POST")).toHaveLength(2);
  });

  it("keeps the guest copy when an import was saved remotely but its response was lost", async () => {
    const local = memoryStorage(), remote = account();
    local.setItem(GUEST_LEARNING_KEY, guestRecord);
    const fetcher = vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method !== "POST") return response(structuredClone(remote));
      if (remote.learning.lessonSnapshot) return response({ error: "Esta conta já tem um percurso." }, 409);
      remote.learning = { ...remote.learning, saveVersion: 1, lessonSnapshot: study, studyCompleted: 2 };
      throw new Error("Response lost after save");
    });
    const store = createWorkspaceStore(fetcher, () => local);
    await store.load();
    const generation = store.getSnapshot().generation;

    await expect(store.importGuestProgress(generation)).rejects.toThrow("Response lost after save");
    expect(local.getItem(GUEST_LEARNING_KEY)).toBe(guestRecord);
    expect(store.getSnapshot().workspace?.learning.lessonSnapshot).toBeNull();
    await expect(store.importGuestProgress(generation)).rejects.toThrow("já tem um percurso");
    expect(local.getItem(GUEST_LEARNING_KEY)).toBe(guestRecord);
    await store.refresh();
    expect(store.getSnapshot().workspace?.learning.lessonSnapshot).toBe(study);
    expect(store.getSnapshot().workspace?.learning.studyCompleted).toBe(2);
    expect(store.getSnapshot().guestLearning?.lessonSnapshot).toBe(study);
    expect(fetcher.mock.calls.filter(([, init]) => init?.method === "POST")).toHaveLength(2);
  });

  it("does not attach an in-flight import to a different account after reset", async () => {
    const local = memoryStorage(); local.setItem(GUEST_LEARNING_KEY, guestRecord);
    const first = account(), second = account("student-b");
    let finishImport!: (result: Response) => void;
    const fetcher = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValueOnce(response(first))
      .mockImplementationOnce(() => new Promise(resolve => { finishImport = resolve; }))
      .mockResolvedValueOnce(response(second));
    const store = createWorkspaceStore(fetcher, () => local);
    await store.load();
    const oldGeneration = store.getSnapshot().generation;
    const importing = store.importGuestProgress(oldGeneration);
    const rejected = expect(importing).rejects.toThrow("conta conectada mudou");
    store.reset();
    const loadingOtherAccount = store.load();
    finishImport(response({ learning: { ...first.learning, saveVersion: 1, lessonSnapshot: study, studyCompleted: 2 } }));
    await rejected;
    await loadingOtherAccount;

    expect(store.getSnapshot().workspace?.account.id).toBe("student-b");
    expect(store.getSnapshot().workspace?.learning.lessonSnapshot).toBeNull();
    expect(store.getSnapshot().guestLearning?.lessonSnapshot).toBe(study);
    expect(local.getItem(GUEST_LEARNING_KEY)).toBe(guestRecord);
    expect(store.stage("lessonSnapshot", study, oldGeneration)).toBe(false);
    const writes = fetcher.mock.calls.filter(([, init]) => init?.method === "POST");
    expect(writes).toHaveLength(1);
    expect(writes[0][1]?.headers).toMatchObject({ "X-Workspace-Uid": "student-a" });
  });

  it("releases an abandoned editing base so a fresh remote snapshot can be resumed", async () => {
    const first = account(), remote = account();
    remote.learning = { ...remote.learning, saveVersion: 1, lessonSnapshot: study, studyCompleted: 2 };
    const fetcher = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValueOnce(response(first)).mockResolvedValueOnce(response(remote));
    const store = createWorkspaceStore(fetcher);
    await store.load();
    const generation = store.getSnapshot().generation;
    expect(store.beginEdit(generation)).toBe(true);
    expect(store.hasPendingChanges()).toBe(true);
    store.endEdit(generation);
    expect(store.hasPendingChanges()).toBe(false);
    await store.load(true);
    expect(store.getSnapshot().workspace?.learning).toEqual(remote.learning);
    expect(store.getSnapshot().generation).toBeGreaterThan(generation);
    expect(store.stage("lessonSnapshot", study, generation)).toBe(false);
    expect(fetcher.mock.calls.every(([, init]) => init?.method !== "PUT")).toBe(true);
  });

  it.each([
    ["an oversized cache", "x".repeat(850_001)],
    ["an oversized study", JSON.stringify({ version: 1, lessonSnapshot: "x".repeat(50_001) })],
    ["an unsupported consultation", JSON.stringify({ version: 1, lessonSnapshot: JSON.stringify({ version: 999, completed: ["unknown"] }) })],
  ])("discards %s without touching a private account cache", (_label, corrupt) => {
    const local = memoryStorage();
    local.setItem("basedspeak.learning.student-a.0", "private-cache");
    local.setItem(GUEST_LEARNING_KEY, corrupt);
    const restored = readGuestLearning(local);
    expect(restored.lessonSnapshot).toBeNull();
    expect(restored.studyCompleted).toBe(0);
    expect(local.getItem(GUEST_LEARNING_KEY)).toBeNull();
    expect(local.getItem("basedspeak.learning.student-a.0")).toBe("private-cache");
  });

  it("clears malformed conflict recovery without writing it or disturbing a valid guest journey", async () => {
    const local = memoryStorage(), session = memoryStorage(), data = account();
    local.setItem(GUEST_LEARNING_KEY, guestRecord);
    session.setItem("basedspeak.learning.conflict.v1", JSON.stringify({ uid: "student-a", revision: 0, baseVersion: 0, local: { unexpected: "private value" } }));
    const fetcher = vi.fn(async () => response(data));
    const store = createWorkspaceStore(fetcher, () => local, () => session);
    await store.load();

    expect(store.getSnapshot().conflict).toBeNull();
    expect(store.getSnapshot().workspace?.learning).toEqual(data.learning);
    expect(store.getSnapshot().guestLearning?.lessonSnapshot).toBe(study);
    expect(session.getItem("basedspeak.learning.conflict.v1")).toBeNull();
    expect(local.getItem(GUEST_LEARNING_KEY)).toBe(guestRecord);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});

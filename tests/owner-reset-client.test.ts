import { afterEach, describe, expect, it, vi } from "vitest";
import type { StudentWorkspace } from "@/contracts/workspace";
import { createWorkspaceStore } from "@/features/dashboard/workspace-store";
import { GUEST_LEARNING_KEY } from "@/features/dashboard/guest-learning";
import { emptyProgress, studySteps } from "@/features/theory/progress";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
function account(revision = 0, canTest = true): StudentWorkspace {
  return {
    account: { id: "owner", name: "QA", email: "qa@example.invalid", status: "active", role: "manager", canTest },
    learning: { revision, saveVersion: revision, demoSnapshot: revision ? null : "old-story", studySnapshot: revision ? null : "old-study", studyCompleted: revision ? 0 : 24, studyTotal: 24, demoPercent: revision ? 0 : 100, updatedAt: null },
    activities: revision ? [] : [{ id: "old", kind: "learning", title: "Old activity", at: "2026-11-01" }],
    conversations: revision ? [] : [{ id: "old", userId: "owner", userName: "QA", userEmail: "qa@example.invalid", subject: "Old conversation", status: "open", createdAt: "2026-11-01", updatedAt: "2026-11-01", messages: [] }],
    liveClass: revision ? null : { id: "booking", userId: "owner", studentName: "QA", studentEmail: "qa@example.invalid", revision: 0, status: "pending", start: "2026-12-01T10:00:00Z", end: "2026-12-01T11:00:00Z", timezone: "Europe/Lisbon", reason: "", meetingUrl: "", createdAt: "2026-11-01", updatedAt: "2026-11-01" },
  };
}
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  return { promise: new Promise<T>(done => { resolve = done; }), resolve: (value: T) => resolve(value) };
};
afterEach(() => vi.useRealTimers());

describe("owner reset across independent clients", () => {
  it("reloads all account data after the PC reset and makes the mobile adopt the new epoch", async () => {
    let remote = account();
    const fetcher = vi.fn(async (url: string) => {
      if (url === "/api/student/test-controls") { remote = account(1); return json({ learning: remote.learning }); }
      return json(structuredClone(remote));
    });
    const pc = createWorkspaceStore(fetcher), mobile = createWorkspaceStore(fetcher);
    await pc.load(); await mobile.load();
    const oldGeneration = mobile.getSnapshot().generation;
    expect(mobile.beginEdit(oldGeneration)).toBe(true);
    await pc.applyTestControl({ action: "reset-all" });
    expect(pc.getSnapshot().workspace).toEqual(remote);
    await mobile.checkForReset();
    expect(mobile.getSnapshot().workspace).toEqual(remote);
    expect(mobile.getSnapshot().generation).toBeGreaterThan(oldGeneration);
    expect(mobile.hasPendingChanges()).toBe(false);
    expect(mobile.stage("studySnapshot", "stale", oldGeneration)).toBe(false);
    expect(fetcher.mock.calls.filter(([url]) => url === "/api/student/test-controls")).toHaveLength(1);
  });

  it("detects reset without waiting for a PUT response and ignores its late success", async () => {
    vi.useFakeTimers();
    let remote = account();
    const oldPut = deferred<Response>(), newPut = deferred<Response>();
    let writes = 0;
    const fetcher = vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method === "PUT") return ++writes === 1 ? oldPut.promise : newPut.promise;
      return json(structuredClone(remote));
    });
    const mobile = createWorkspaceStore(fetcher);
    await mobile.load();
    const oldGeneration = mobile.getSnapshot().generation;
    mobile.stage("studySnapshot", "unsaved-old", oldGeneration);
    const oldSaving = mobile.flush();
    await vi.advanceTimersByTimeAsync(0);
    expect(writes).toBe(1);
    remote = account(1);
    await mobile.checkForReset();
    expect(mobile.getSnapshot().workspace?.learning.studyCompleted).toBe(0);
    expect(mobile.getSnapshot().workspace?.liveClass).toBeNull();
    const newGeneration = mobile.getSnapshot().generation;
    expect(mobile.stage("studySnapshot", "new-epoch", newGeneration)).toBe(true);
    const newSaving = mobile.flush();
    await vi.advanceTimersByTimeAsync(0);
    expect(writes).toBe(2);
    oldPut.resolve(json({ learning: { ...account().learning, studySnapshot: "unsaved-old" } }));
    await oldSaving;
    expect(mobile.getSnapshot().workspace?.learning.revision).toBe(1);
    expect(mobile.getSnapshot().saving).toBe(true);
    newPut.resolve(json({ learning: { ...remote.learning, saveVersion: 2, studySnapshot: "new-epoch" } }));
    await newSaving;
    expect(mobile.getSnapshot().workspace?.learning).toMatchObject({ revision: 1, saveVersion: 2, studySnapshot: "new-epoch" });
  });

  it("preserves the editing base and unsent work when only saveVersion changes", async () => {
    vi.useFakeTimers();
    let remote = account();
    const fetcher = vi.fn(async () => json(structuredClone(remote)));
    const mobile = createWorkspaceStore(fetcher);
    await mobile.load();
    const generation = mobile.getSnapshot().generation;
    mobile.beginEdit(generation);
    mobile.stage("studySnapshot", "local-draft", generation);
    remote = { ...remote, learning: { ...remote.learning, saveVersion: 2, studySnapshot: "other-device" } };
    await mobile.checkForReset();
    expect(mobile.getSnapshot().workspace?.learning).toMatchObject({ revision: 0, saveVersion: 0, studySnapshot: "local-draft" });
    expect(mobile.getSnapshot().generation).toBe(generation);
    expect(mobile.getSnapshot().saving).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(2);
    mobile.reset();
  });

  it("clears an old conflict and its recovery copy when the remote reset arrives", async () => {
    vi.useFakeTimers();
    const records = new Map<string, string>();
    const storage = { getItem: (key: string) => records.get(key) ?? null, setItem: (key: string, value: string) => { records.set(key, value); }, removeItem: (key: string) => { records.delete(key); } };
    let remote = account();
    const fetcher = vi.fn(async () => json(structuredClone(remote)));
    const mobile = createWorkspaceStore(fetcher, () => storage, () => storage);
    await mobile.load();
    mobile.stage("studySnapshot", "rejected-old", mobile.getSnapshot().generation);
    remote.learning.saveVersion = 1;
    await mobile.flush();
    expect(mobile.getSnapshot().conflict?.local.studySnapshot).toBe("rejected-old");
    expect(records.has("basedspeak.learning.conflict.v1")).toBe(true);
    remote = account(1);
    await mobile.checkForReset();
    expect(mobile.getSnapshot().conflict).toBeNull();
    expect(records.has("basedspeak.learning.conflict.v1")).toBe(false);
    expect(mobile.getSnapshot().workspace?.learning.studySnapshot).toBeNull();
  });

  it("does not hide a ready owner account when a background check fails", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(json(account())).mockRejectedValueOnce(new Error("offline"));
    const store = createWorkspaceStore(fetcher);
    await store.load(); await store.checkForReset();
    expect(store.getSnapshot()).toMatchObject({ status: "ready", workspace: { account: { canTest: true }, learning: { revision: 0 } } });
  });

  it("does not enable the owner check for an ordinary account", async () => {
    const fetcher = vi.fn(async () => json(account(0, false)));
    const store = createWorkspaceStore(fetcher);
    await store.load(); await store.checkForReset();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("does not restore deleted operational data if the read after a confirmed reset fails", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(json(account())).mockResolvedValueOnce(json({ learning: account(1).learning })).mockRejectedValueOnce(new Error("offline"));
    const store = createWorkspaceStore(fetcher);
    await store.load(); await store.applyTestControl({ action: "reset-all" });
    expect(store.getSnapshot().workspace).toMatchObject({ learning: { revision: 1, studySnapshot: null }, activities: [], conversations: [], liveClass: null });
    expect(store.getSnapshot().notice).toContain("Controle salvo");
  });

  it("lets a new reset check run even if a previous epoch's check never responded", async () => {
    const oldCheck = deferred<Response>();
    let remote = account();
    const fetcher = vi.fn(async (url: string) => {
      if (url === "/api/student/test-controls") { remote = account(1); return json({ learning: remote.learning }); }
      return json(structuredClone(remote));
    });
    const store = createWorkspaceStore(fetcher);
    await store.load();
    fetcher.mockImplementationOnce(() => oldCheck.promise);
    const oldChecking = store.checkForReset();
    await store.applyTestControl({ action: "reset-all" });
    remote = account(2);
    await store.checkForReset();
    expect(store.getSnapshot().workspace?.learning.revision).toBe(2);
    oldCheck.resolve(json(account())); await oldChecking;
    expect(store.getSnapshot().workspace?.learning.revision).toBe(2);
  });

  it("never rolls back a newer remote reset when an older control POST finishes late", async () => {
    const oldControl = deferred<Response>();
    let remote = account();
    const fetcher = vi.fn(async (url: string) => url === "/api/student/test-controls" ? oldControl.promise : json(structuredClone(remote)));
    const store = createWorkspaceStore(fetcher);
    await store.load();
    const controlling = store.applyTestControl({ action: "reset-all" });
    remote = account(2); await store.checkForReset();
    expect(store.beginEdit(store.getSnapshot().generation)).toBe(true);
    fetcher.mockRejectedValueOnce(new Error("offline"));
    oldControl.resolve(json({ learning: account(1).learning })); await controlling;
    expect(store.getSnapshot().workspace).toEqual(remote);
  });

  it("keeps a newer command busy when an invalidated command fails late", async () => {
    const oldControl = deferred<Response>(), newControl = deferred<Response>();
    let remote = account(), commands = 0;
    const fetcher = vi.fn(async (url: string) => url === "/api/student/test-controls" ? (++commands === 1 ? oldControl.promise : newControl.promise) : json(structuredClone(remote)));
    const store = createWorkspaceStore(fetcher);
    await store.load();
    const oldCommand = store.applyTestControl({ action: "reset-all" });
    remote = account(2); await store.checkForReset();
    const currentCommand = store.applyTestControl({ action: "reset-all" });
    oldControl.resolve(json({ error: "old request" }, 409)); await oldCommand;
    expect(store.getSnapshot().saving).toBe(true);
    expect(store.getSnapshot().workspace?.learning.revision).toBe(2);
    remote = account(3); newControl.resolve(json({ learning: remote.learning })); await currentCommand;
    expect(store.getSnapshot().saving).toBe(false);
    expect(store.getSnapshot().workspace).toEqual(remote);
  });

  it("does not wait for a guest import before adopting the owner's reset", async () => {
    const records = new Map<string, string>();
    const storage = { getItem: (key: string) => records.get(key) ?? null, setItem: (key: string, value: string) => { records.set(key, value); }, removeItem: (key: string) => { records.delete(key); } };
    const study = JSON.stringify({ ...emptyProgress, completed: [studySteps[0].step.id] });
    const guest = JSON.stringify({ version: 1, demoSnapshot: null, studySnapshot: study, updatedAt: null });
    records.set(GUEST_LEARNING_KEY, guest);
    let remote = account();
    remote = { ...remote, learning: { ...remote.learning, demoSnapshot: null, studySnapshot: null, demoPercent: 0, studyCompleted: 0 }, liveClass: null };
    const oldImport = deferred<Response>();
    const fetcher = vi.fn(async (_url: string, init?: RequestInit) => init?.method === "POST" ? oldImport.promise : json(structuredClone(remote)));
    const store = createWorkspaceStore(fetcher, () => storage);
    await store.load();
    const importing = store.importGuestProgress(store.getSnapshot().generation);
    const rejected = expect(importing).rejects.toThrow("conta conectada mudou");
    remote = account(1); await store.checkForReset();
    expect(store.beginEdit(store.getSnapshot().generation)).toBe(true);
    oldImport.resolve(json({ learning: { ...account().learning, studySnapshot: study, studyCompleted: 1 } }));
    await rejected;
    expect(store.getSnapshot().workspace?.learning).toEqual(remote.learning);
    expect(records.get(GUEST_LEARNING_KEY)).toBe(guest);
  });
});

import { afterEach, expect, it, vi } from "vitest";
import type { StudentWorkspace } from "@/contracts/workspace";
import { createWorkspaceStore } from "@/features/dashboard/workspace-store";

const data = (saveVersion = 0, uid = "qa", revision = 0): StudentWorkspace => ({ account: { id: uid, email: "qa@example.invalid", name: "QA", role: "student", status: "active" }, learning: { saveVersion, revision, demoSnapshot: `story-${saveVersion}`, studySnapshot: `study-${saveVersion}`, studyCompleted: saveVersion, studyTotal: 24, demoPercent: 0, updatedAt: null }, activities: [], conversations: [], liveClass: null });
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const response = (version = 0, uid = "qa", revision = 0) => json(data(version, uid, revision));
const conflict = () => json({ error: "Another save", code: "LEARNING_SAVE_CONFLICT" }, 409);
function setup() {
  const records = new Map<string, string>();
  const recovery = { getItem: (key: string) => records.get(key) ?? null, setItem: (key: string, value: string) => { records.set(key, value); }, removeItem: (key: string) => { records.delete(key); } };
  const fetcher = vi.fn<(input: string, init?: RequestInit) => Promise<Response>>();
  return { records, recovery, fetcher, store: createWorkspaceStore(fetcher, undefined, () => recovery) };
}
afterEach(() => vi.restoreAllMocks());

it("does not relabel stale edits with the newer token returned by preflight", async () => {
  const { store, fetcher, records } = setup();
  fetcher.mockResolvedValueOnce(response()).mockResolvedValueOnce(response(1));
  await store.load(); const generation = store.getSnapshot().generation;
  store.stage("demoSnapshot", "local-story", generation); store.stage("studySnapshot", "local-study", generation);
  await store.flush();
  expect(fetcher.mock.calls.every(([, init]) => init?.method !== "PUT")).toBe(true);
  expect(store.getSnapshot().conflict).toMatchObject({ uid: "qa", baseVersion: 0, local: { demoSnapshot: "local-story", studySnapshot: "local-study" }, remote: { saveVersion: 1 } });
  expect(store.getSnapshot().generation).toBe(generation); // The mounted form draft survives the conflict.
  expect(store.hasPendingChanges()).toBe(true); expect(records.size).toBe(1);
  expect(store.stage("demoSnapshot", "late-stale-callback", generation)).toBe(false);
});

it("preserves edits made while a conflicting PUT is in flight and never retries automatically", async () => {
  const { store, fetcher } = setup(); let finish!: (response: Response) => void;
  fetcher.mockResolvedValueOnce(response()).mockResolvedValueOnce(response()).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; })).mockResolvedValueOnce(response(1));
  await store.load(); const generation = store.getSnapshot().generation;
  store.stage("demoSnapshot", "submitted-draft", generation);
  const saving = store.flush(); await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(3));
  store.stage("demoSnapshot", "newer-draft", generation); store.stage("studySnapshot", "new-study", generation);
  finish(conflict()); await saving; await store.flush();
  expect(store.getSnapshot().conflict?.local).toEqual({ demoSnapshot: "newer-draft", studySnapshot: "new-study" });
  expect(fetcher.mock.calls.filter(([, init]) => init?.method === "PUT")).toHaveLength(1);
  expect(store.getSnapshot().generation).toBe(generation);
});

it("advances the base for queued edits only after this tab's own successful write", async () => {
  const { store, fetcher } = setup(); let finish!: (response: Response) => void;
  fetcher.mockResolvedValueOnce(response()).mockResolvedValueOnce(response()).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; })).mockResolvedValueOnce(response(1)).mockResolvedValueOnce(json({ learning: { ...data(2).learning, demoSnapshot: "second" } }));
  await store.load(); const generation = store.getSnapshot().generation;
  store.stage("demoSnapshot", "first", generation);
  const saving = store.flush(); await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(3));
  store.stage("demoSnapshot", "second", generation);
  finish(json({ learning: { ...data(1).learning, demoSnapshot: "first" } })); await saving;
  expect(fetcher.mock.calls.filter(([, init]) => init?.method === "PUT").map(([, init]) => JSON.parse(init!.body as string))).toEqual([
    { revision: 0, saveVersion: 0, demoSnapshot: "first" }, { revision: 0, saveVersion: 1, demoSnapshot: "second" },
  ]);
  expect(store.getSnapshot().workspace?.learning).toMatchObject({ saveVersion: 2, demoSnapshot: "second" });
});

it("requires a new explicit choice if the remote version changes again during recovery", async () => {
  const { store, fetcher } = setup();
  fetcher.mockResolvedValueOnce(response()).mockResolvedValueOnce(response(1)).mockResolvedValueOnce(response(2)).mockResolvedValueOnce(response(2)).mockResolvedValueOnce(response(2)).mockResolvedValueOnce(json({ learning: { ...data(3).learning, demoSnapshot: "local" } }));
  await store.load(); store.stage("demoSnapshot", "local", store.getSnapshot().generation); await store.flush();
  await store.resolveConflict("local");
  expect(store.getSnapshot().conflict?.remote?.saveVersion).toBe(2);
  expect(fetcher.mock.calls.filter(([, init]) => init?.method === "PUT")).toHaveLength(0);
  await store.resolveConflict("local");
  expect(JSON.parse(fetcher.mock.calls.at(-1)![1]!.body as string)).toEqual({ revision: 0, saveVersion: 2, demoSnapshot: "local" });
  expect(store.getSnapshot().conflict).toBeNull();
});

it("restores the isolated rejected content after reload for the same verified account", async () => {
  const { store, fetcher, recovery, records } = setup();
  fetcher.mockResolvedValueOnce(response()).mockResolvedValueOnce(response(1));
  await store.load(); store.stage("studySnapshot", "preserved-study", store.getSnapshot().generation); await store.flush();
  const reloadFetch = vi.fn(async () => response(1));
  const reload = createWorkspaceStore(reloadFetch, undefined, () => recovery); await reload.load();
  expect(reload.getSnapshot().conflict?.local).toEqual({ studySnapshot: "preserved-study" });
  expect(reloadFetch).toHaveBeenCalledTimes(1);
  await reload.resolveConflict("server");
  expect(reload.getSnapshot().workspace?.learning).toEqual(data(1).learning);
  expect(reload.getSnapshot().conflict).toBeNull(); expect(records.size).toBe(0);
});

it.each(["uid", "reset", "expired"])("never recovers rejected content across %s changes", async mode => {
  const { store, fetcher, records } = setup();
  fetcher.mockResolvedValueOnce(response()).mockResolvedValueOnce(response(1));
  await store.load(); store.stage("studySnapshot", "private-draft", store.getSnapshot().generation); await store.flush();
  fetcher.mockResolvedValueOnce(mode === "expired" ? json({}, 401) : mode === "uid" ? response(0, "other") : response(2, "qa", 1));
  await store.resolveConflict("local");
  expect(store.getSnapshot().conflict).toBeNull(); expect(records.size).toBe(0);
  expect(fetcher.mock.calls.some(([, init]) => init?.method === "PUT")).toBe(false);
  expect(JSON.stringify(store.getSnapshot())).not.toContain("private-draft");
});

it("does not accept a background read's new version for an edit that started earlier", async () => {
  const { store, fetcher } = setup(); let finish!: (response: Response) => void;
  fetcher.mockResolvedValueOnce(response()).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; })).mockResolvedValueOnce(response(1));
  await store.load(); const reading = store.load(true);
  store.stage("demoSnapshot", "local", store.getSnapshot().generation); finish(response(1)); await reading;
  expect(store.getSnapshot().workspace?.learning.saveVersion).toBe(0);
  await store.flush(); expect(store.getSnapshot().conflict?.local.demoSnapshot).toBe("local");
  expect(fetcher.mock.calls.some(([, init]) => init?.method === "PUT")).toBe(false);
});

it("retains the editing base and mounted form when a study answer has not produced a saved snapshot yet", async () => {
  const { store, fetcher } = setup();
  fetcher.mockResolvedValueOnce(response()).mockResolvedValueOnce(response(1)).mockResolvedValueOnce(response(1));
  await store.load(); const generation = store.getSnapshot().generation;
  expect(store.beginEdit(generation)).toBe(true);
  await store.load(true);
  expect(store.getSnapshot().workspace?.learning.saveVersion).toBe(0);
  expect(store.getSnapshot().generation).toBe(generation);
  store.stage("studySnapshot", "study-after-checking-answer", generation); await store.flush();
  expect(store.getSnapshot().conflict?.local.studySnapshot).toBe("study-after-checking-answer");
  expect(fetcher.mock.calls.some(([, init]) => init?.method === "PUT")).toBe(false);
});

it("preserves a draft after a lost write response, then lets the user retain the confirmed server copy", async () => {
  const { store, fetcher } = setup();
  fetcher.mockResolvedValueOnce(response()).mockResolvedValueOnce(response()).mockRejectedValueOnce(new Error("Response lost")).mockImplementation(async () => response(1));
  await store.load(); store.stage("demoSnapshot", "local", store.getSnapshot().generation); await store.flush();
  expect(store.getSnapshot().status).toBe("error"); await store.refresh();
  expect(store.getSnapshot().conflict?.local.demoSnapshot).toBe("local");
  await store.resolveConflict("server");
  expect(fetcher.mock.calls.filter(([, init]) => init?.method === "PUT")).toHaveLength(1);
  expect(store.getSnapshot().conflict).toBeNull();
});

import { afterEach, describe, expect, it, vi } from "vitest";
import type { StudentWorkspace, TeacherConversation } from "@/contracts/workspace";
import { createWorkspaceStore } from "@/features/dashboard/workspace-store";

const workspace = (uid = "student-a", revision = 0): StudentWorkspace => ({
  account: { id: uid, name: "", email: "", status: "active", role: "student" },
  learning: { revision, demoSnapshot: null, studySnapshot: null, demoPercent: 0, studyCompleted: 0, studyTotal: 24, updatedAt: null },
  activities: [], conversations: [],
});
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const saved = (data: StudentWorkspace, patch: object) => json({ learning: { ...data.learning, ...patch, updatedAt: "2026-10-27T12:00:00Z" } });
const setup = () => {
  const fetcher = vi.fn<(input: string, init?: RequestInit) => Promise<Response>>();
  const storage = { setItem: vi.fn(), removeItem: vi.fn() };
  const store = createWorkspaceStore(fetcher, () => storage);
  return { fetcher, storage, store };
};
afterEach(() => { vi.useRealTimers(); });

describe("student workspace synchronization", () => {
  it("keeps the connected workspace visible while navigation refreshes its activity", async () => {
    const { store, fetcher } = setup();
    const data = workspace();
    let finish!: (response: Response) => void;
    fetcher.mockResolvedValueOnce(json(data)).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    await store.load();
    const generation = store.getSnapshot().generation;
    const updating = store.refresh();
    expect(store.getSnapshot().status).toBe("ready");
    expect(store.getSnapshot().workspace).toEqual(data);
    const fresh = { ...data, activities:[{ id:"saved-activity", kind:"learning", title:"Conversa iniciada", at:"2026-10-27T12:00:00Z" }] };
    finish(json(fresh)); await updating;
    expect(store.getSnapshot().workspace?.activities).toEqual(fresh.activities);
    expect(store.getSnapshot().generation).toBe(generation);
  });

  it("never rolls back a conversation when an older navigation read arrives after a save", async () => {
    const { store, fetcher } = setup();
    const data = workspace();
    let finish!: (response: Response) => void;
    fetcher.mockResolvedValueOnce(json(data)).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }))
      .mockResolvedValueOnce(json(data)).mockResolvedValueOnce(saved(data, { demoSnapshot:"part-three" }));
    await store.load();
    const generation = store.getSnapshot().generation;
    const updating = store.refresh();
    expect(store.stage("demoSnapshot", "part-three", generation)).toBe(true);
    await store.flush();
    finish(json(data)); await updating;
    expect(store.getSnapshot().workspace?.learning.demoSnapshot).toBe("part-three");
    expect(store.getSnapshot().generation).toBe(generation);
    expect(store.hasPendingChanges()).toBe(false);
  });

  it("finishes pending progress before reading the activity shown on returning to the panel", async () => {
    const { store, fetcher } = setup();
    const data = workspace();
    const fresh = { ...data, learning:{ ...data.learning, demoSnapshot:"part-three" }, activities:[{ id:"activity", kind:"learning", title:"Conversa iniciada", at:"2026-10-27T12:00:00Z" }] };
    fetcher.mockResolvedValueOnce(json(data)).mockResolvedValueOnce(json(data))
      .mockResolvedValueOnce(saved(data, { demoSnapshot:"part-three" })).mockResolvedValueOnce(json(fresh));
    await store.load();
    store.stage("demoSnapshot", "part-three", store.getSnapshot().generation);
    const updating = store.refresh();
    expect(store.getSnapshot().status).toBe("ready");
    await updating;
    expect(store.getSnapshot().workspace?.activities).toEqual(fresh.activities);
    expect(store.getSnapshot().workspace?.learning.demoSnapshot).toBe("part-three");
  });

  it("still replaces a changed account during a background navigation refresh", async () => {
    const { store, fetcher } = setup();
    let finish!: (response: Response) => void;
    fetcher.mockResolvedValueOnce(json(workspace())).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    await store.load();
    const generation = store.getSnapshot().generation;
    const updating = store.refresh();
    store.stage("demoSnapshot", "private-work", generation);
    finish(json(workspace("student-b"))); await updating;
    expect(store.getSnapshot().workspace?.account.id).toBe("student-b");
    expect(store.getSnapshot().workspace?.learning.demoSnapshot).toBeNull();
    expect(store.stage("demoSnapshot", "old callback", generation)).toBe(false);
    expect(store.hasPendingChanges()).toBe(false);
  });

  it("discards pending practice if access is suspended during a navigation refresh", async () => {
    const { store, fetcher } = setup();
    let finish!: (response: Response) => void;
    fetcher.mockResolvedValueOnce(json(workspace())).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    await store.load();
    const generation = store.getSnapshot().generation;
    const updating = store.refresh();
    store.stage("demoSnapshot", "unsent", generation);
    const suspended = workspace(); suspended.account.status = "suspended";
    finish(json(suspended)); await updating;
    expect(store.getSnapshot().workspace?.account.status).toBe("suspended");
    expect(store.getSnapshot().workspace?.learning.demoSnapshot).toBeNull();
    expect(store.hasPendingChanges()).toBe(false);
    expect(store.stage("demoSnapshot", "old callback", generation)).toBe(false);
  });

  it("does not accept anonymous work or read/import any legacy browser snapshot", async () => {
    const { store, fetcher, storage } = setup();
    expect(store.stage("demoSnapshot", "anonymous", 0)).toBe(false);
    expect(fetcher).not.toHaveBeenCalled();
    fetcher.mockResolvedValue(json(workspace()));
    await store.load();
    expect(store.getSnapshot().workspace?.learning.demoSnapshot).toBeNull();
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("scopes caches by verified uid and revision, serializes both snapshot fields", async () => {
    const { store, fetcher, storage } = setup();
    const data = workspace("uid/with spaces", 7);
    fetcher.mockResolvedValueOnce(json(data)).mockResolvedValueOnce(json(data)).mockResolvedValueOnce(saved(data, { demoSnapshot: "story", studySnapshot: "study" }));
    await store.load();
    const generation = store.getSnapshot().generation;
    store.stage("demoSnapshot", "story", generation);
    store.stage("studySnapshot", "study", generation);
    await store.flush();
    expect(storage.setItem).toHaveBeenCalledWith("basedspeak.learning.uid%2Fwith%20spaces.7", expect.any(String));
    expect(JSON.parse(fetcher.mock.calls[2][1]!.body as string)).toEqual({ revision: 7, demoSnapshot: "story", studySnapshot: "study" });
    expect(fetcher.mock.calls[2][1]!.headers).toEqual({ "Content-Type": "application/json", "X-Workspace-Uid": "uid/with spaces" });
    expect(fetcher.mock.calls[1][0]).toBe("/api/student/workspace");
    expect(store.getSnapshot().saving).toBe(false);
    expect(store.getSnapshot().workspace?.learning.studySnapshot).toBe("study");
  });

  it("drops old snapshots and callbacks after 409 without automatically re-uploading", async () => {
    const { store, fetcher, storage } = setup();
    const data = workspace();
    fetcher.mockResolvedValueOnce(json(data)).mockResolvedValueOnce(json(data)).mockResolvedValueOnce(json({ error: "reset" }, 409)).mockResolvedValueOnce(json(workspace("student-a", 1)));
    await store.load();
    const staleGeneration = store.getSnapshot().generation;
    store.stage("demoSnapshot", "old story", staleGeneration);
    await store.flush();
    expect(store.getSnapshot().workspace?.learning.revision).toBe(1);
    expect(store.getSnapshot().workspace?.learning.demoSnapshot).toBeNull();
    expect(store.stage("demoSnapshot", "old component", staleGeneration)).toBe(false);
    await store.flush();
    expect(fetcher.mock.calls.filter(([, init]) => init?.method === "PUT")).toHaveLength(1);
    expect(storage.removeItem).toHaveBeenCalledWith("basedspeak.learning.student-a.0");
    expect(store.getSnapshot().notice).toContain("reiniciado");
  });

  it("discards edits queued during a reset request as well as the submitted snapshot", async () => {
    const { store, fetcher } = setup();
    let finish!: (response: Response) => void;
    fetcher.mockResolvedValueOnce(json(workspace())).mockResolvedValueOnce(json(workspace())).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; })).mockResolvedValueOnce(json(workspace("student-a", 1)));
    await store.load();
    const generation = store.getSnapshot().generation;
    store.stage("demoSnapshot", "old", generation);
    const writing = store.flush();
    await vi.waitFor(() => expect(finish).toBeTypeOf("function"));
    store.stage("studySnapshot", "queued old study", generation);
    finish(json({ error: "reset" }, 409));
    await writing;
    expect(store.getSnapshot().workspace?.learning.studySnapshot).toBeNull();
    expect(fetcher.mock.calls.filter(([, init]) => init?.method === "PUT")).toHaveLength(1);
  });

  it("shows a recoverable load failure after reset and never restores rejected progress", async () => {
    const { store, fetcher } = setup();
    fetcher.mockResolvedValueOnce(json(workspace())).mockResolvedValueOnce(json(workspace())).mockResolvedValueOnce(json({ error: "reset" }, 409)).mockRejectedValueOnce(new Error("offline"));
    await store.load();
    store.stage("demoSnapshot", "old", store.getSnapshot().generation);
    await store.flush();
    expect(store.getSnapshot().status).toBe("error");
    expect(store.getSnapshot().workspace).toBeNull();
    fetcher.mockResolvedValueOnce(json(workspace("student-a", 1)));
    await store.load();
    expect(store.getSnapshot().workspace?.learning.demoSnapshot).toBeNull();
    expect(fetcher.mock.calls.filter(([, init]) => init?.method === "PUT")).toHaveLength(1);
  });

  it("checks the current account before writing and drops work when a different user signs in", async () => {
    const { store, fetcher } = setup();
    fetcher.mockResolvedValueOnce(json(workspace())).mockResolvedValueOnce(json(workspace("student-b")));
    await store.load();
    const generation = store.getSnapshot().generation;
    store.stage("demoSnapshot", "belongs to a", generation);
    await store.flush();
    expect(store.getSnapshot().workspace?.account.id).toBe("student-b");
    expect(store.getSnapshot().workspace?.learning.demoSnapshot).toBeNull();
    expect(store.stage("demoSnapshot", "a stale callback", generation)).toBe(false);
    expect(fetcher.mock.calls.filter(([, init]) => init?.method === "PUT")).toHaveLength(0);
  });

  it("detects a reset during the preflight GET and does not PUT the previous epoch", async () => {
    const { store, fetcher } = setup();
    fetcher.mockResolvedValueOnce(json(workspace())).mockResolvedValueOnce(json(workspace("student-a", 2)));
    await store.load();
    store.stage("studySnapshot", "old", store.getSnapshot().generation);
    await store.flush();
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(store.getSnapshot().workspace?.learning.revision).toBe(2);
  });

  it("retains a failed write in memory and revalidates identity and revision before retry", async () => {
    const { store, fetcher } = setup();
    const data = workspace();
    fetcher.mockResolvedValueOnce(json(data)).mockResolvedValueOnce(json(data)).mockRejectedValueOnce(new Error("offline"));
    await store.load();
    store.stage("demoSnapshot", "unsaved", store.getSnapshot().generation);
    await store.flush();
    expect(store.getSnapshot().status).toBe("error");
    expect(store.getSnapshot().workspace?.learning.demoSnapshot).toBe("unsaved");
    expect(store.hasPendingChanges()).toBe(true);
    fetcher.mockResolvedValueOnce(json(data)).mockResolvedValueOnce(saved(data, { demoSnapshot: "unsaved" }));
    await store.load();
    expect(fetcher.mock.calls[3][0]).toBe("/api/student/workspace");
    expect(store.getSnapshot().status).toBe("ready");
    expect(store.getSnapshot().error).toBe("");
    expect(store.hasPendingChanges()).toBe(false);
  });

  it("clears account data and pending writes on expired sessions", async () => {
    const { store, fetcher } = setup();
    fetcher.mockResolvedValueOnce(json(workspace())).mockResolvedValueOnce(json({ error: "expired" }, 401));
    await store.load();
    store.stage("studySnapshot", "private", store.getSnapshot().generation);
    await store.flush();
    expect(store.getSnapshot().status).toBe("unauthenticated");
    expect(store.getSnapshot().workspace).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("ignores late in-flight responses after logout", async () => {
    const { store, fetcher } = setup();
    let finish!: (response: Response) => void;
    fetcher.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    const loading = store.load();
    store.reset(); finish(json(workspace())); await loading;
    expect(store.getSnapshot().workspace).toBeNull();
  });

  it("never permits inactive accounts to stage practice", async () => {
    for (const status of ["pending", "suspended", "rejected"] as const) {
      const { store, fetcher } = setup();
      const data = workspace(); data.account.status = status;
      fetcher.mockResolvedValueOnce(json(data)); await store.load();
      expect(store.stage("demoSnapshot", "forbidden", store.getSnapshot().generation)).toBe(false);
      await store.flush(); expect(fetcher).toHaveBeenCalledTimes(1);
    }
  });

  it("updates snapshots from another device without reviving a mounted stale practice", async () => {
    const { store, fetcher } = setup();
    fetcher.mockResolvedValueOnce(json(workspace())); await store.load();
    const generation = store.getSnapshot().generation;
    const remote = workspace(); remote.learning.studySnapshot = "remote";
    fetcher.mockResolvedValueOnce(json(remote)); await store.load();
    expect(store.getSnapshot().workspace?.learning.studySnapshot).toBe("remote");
    expect(store.stage("studySnapshot", "stale", generation)).toBe(false);
  });
});

describe("real teacher conversations", () => {
  const conversation: TeacherConversation = { id: "conversation-1", userId: "student-a", userName: "", userEmail: "", subject: "Dúvida", status: "open", createdAt: "2026-10-27T12:00:00Z", updatedAt: "2026-10-27T12:00:00Z", messages: [] };
  it("persists a pending student's message through the API before confirming it", async () => {
    const { store, fetcher } = setup();
    const pending = workspace(); pending.account.status = "pending";
    fetcher.mockResolvedValueOnce(json(pending)).mockResolvedValueOnce(json(pending)).mockResolvedValueOnce(json({ conversation }));
    await store.load();
    expect(store.getSnapshot().workspace?.conversations).toEqual([]);
    await store.sendMessage("Dúvida", "Minha dúvida");
    expect(store.getSnapshot().workspace?.conversations).toEqual([conversation]);
    expect(fetcher.mock.calls[2][0]).toBe("/api/student/conversations");
    expect(JSON.parse(fetcher.mock.calls[2][1]!.body as string)).toEqual({ subject: "Dúvida", body: "Minha dúvida" });
    expect(fetcher.mock.calls[2][1]!.headers).toEqual({ "Content-Type": "application/json", "X-Workspace-Uid": "student-a" });
  });

  it("never adds a local success when the server rejects a message", async () => {
    const { store, fetcher } = setup();
    fetcher.mockResolvedValueOnce(json(workspace())).mockResolvedValueOnce(json(workspace())).mockResolvedValueOnce(json({ error: "Falha no envio" }, 503));
    await store.load();
    await expect(store.sendMessage("Dúvida", "Texto")).rejects.toThrow("Falha no envio");
    expect(store.getSnapshot().workspace?.conversations).toEqual([]);
  });

  it("prevents a draft from being sent as a different signed-in account", async () => {
    const { store, fetcher } = setup();
    fetcher.mockResolvedValueOnce(json(workspace())).mockResolvedValueOnce(json(workspace("student-b")));
    await store.load();
    await expect(store.sendMessage("Private", "Original user's draft")).rejects.toThrow("conta conectada mudou");
    expect(fetcher.mock.calls.some(([, init]) => init?.method === "POST")).toBe(false);
  });

  it("loads actual teacher replies on refresh and posts replies to the existing conversation", async () => {
    const { store, fetcher } = setup();
    const data = workspace(); data.conversations = [{ ...conversation, status: "answered", messages: [{ id: "teacher-message", authorId: "manager", authorName: "", role: "manager", body: "Resposta real", at: "2026-10-27T12:01:00Z" }] }];
    fetcher.mockResolvedValueOnce(json(workspace())).mockResolvedValueOnce(json(data)).mockResolvedValueOnce(json(data)).mockResolvedValueOnce(json({ conversation: data.conversations[0] }));
    await store.load(); await store.load();
    expect(store.getSnapshot().workspace?.conversations[0].messages[0].body).toBe("Resposta real");
    await store.sendMessage("", "Obrigada", conversation.id);
    expect(fetcher.mock.calls[3][0]).toBe("/api/student/conversations/conversation-1/messages");
    expect(JSON.parse(fetcher.mock.calls[3][1]!.body as string)).toEqual({ body: "Obrigada" });
  });
});

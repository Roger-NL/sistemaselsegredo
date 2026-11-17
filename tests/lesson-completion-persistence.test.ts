import { describe, expect, it, vi } from "vitest";
import type { StudentWorkspace } from "../src/contracts/workspace";
import { emptyGuestLearning, GUEST_LEARNING_KEY } from "../src/features/dashboard/guest-learning";
import { createWorkspaceStore } from "../src/features/dashboard/workspace-store";
import { encodeLessonAccountSnapshot } from "../src/features/first-encounters/lesson-account-snapshot";
import { CONCLUSION_QUESTIONS, conclusionModel, createConclusionState, setConclusionDraft, submitConclusionAnswer } from "../src/features/first-encounters/lesson-conclusion";
import { EMPTY_LESSON_DASHBOARD_INPUT } from "../src/features/first-encounters/lesson-dashboard";
import { LESSON_SCENES } from "../src/features/first-encounters/lesson-one";
import { createLessonProgress } from "../src/features/first-encounters/lesson-progress";
import { verifyLessonCompletion } from "../src/features/first-encounters/useLessonAccountProgress";

function memory() {
  const items = new Map<string, string>();
  return { getItem: (key: string) => items.get(key) ?? null, setItem: (key: string, value: string) => { items.set(key, value); }, removeItem: (key: string) => { items.delete(key); } };
}
function finished() {
  let conclusion = createConclusionState();
  for (const question of CONCLUSION_QUESTIONS) conclusion = submitConclusionAnswer(setConclusionDraft(conclusion, question, conclusionModel(question)), question);
  const completed = LESSON_SCENES.flatMap(scene => scene.rounds.map(round => round.id));
  return encodeLessonAccountSnapshot({ introduction: "done", guide: "done", lesson: JSON.stringify({ ...createLessonProgress(), scene: LESSON_SCENES.length, completed }), conclusion: JSON.stringify({ ...conclusion, phase: "summary" }) });
}
function account(lessonSnapshot: string | null = null): StudentWorkspace {
  return { account: { id: "test-one", name: "Teste", email: "aluno@example.test", role: "student", status: "active" }, learning: { ...emptyGuestLearning(), lessonSnapshot }, activities: [], conversations: [], liveClass: null };
}

describe("completion receipts", () => {
  it("confirms the browser's own persisted lesson and distinguishes missing, refused and stale storage", async () => {
    const cache = memory();
    const guest = async () => Response.json({}, { status: 401 });
    const store = createWorkspaceStore(guest, () => cache);
    await store.load();
    const generation = store.getSnapshot().generation;
    store.stage("lessonSnapshot", finished(), generation);
    const fetcher = vi.fn(() => { throw Error("guests never call an account endpoint"); });
    const verify = (storage = () => cache) => verifyLessonCompletion(store, generation, storage, fetcher);
    expect(await verify()).toBe("guest-local");
    expect(await verify(() => { throw Error("storage blocked"); })).toBe("guest-session");
    cache.removeItem(GUEST_LEARNING_KEY);
    expect(await verify()).toBe("guest-session");
    cache.setItem(GUEST_LEARNING_KEY, JSON.stringify({ version: 2, lessonSnapshot: encodeLessonAccountSnapshot(EMPTY_LESSON_DASHBOARD_INPUT) }));
    expect(await verify()).toBe("guest-session");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("requires an acknowledged save and an independent read of the same 49 units", async () => {
    let server = account(), fail = true;
    const fetcher = vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method === "PUT") {
        if (fail) return Response.json({}, { status: 503 });
        server = { ...server, learning: { ...server.learning, saveVersion: 1, lessonSnapshot: JSON.parse(String(init.body)).lessonSnapshot } };
        return Response.json({ learning: server.learning });
      }
      return Response.json(server);
    });
    const store = createWorkspaceStore(fetcher, memory);
    await store.load();
    const generation = store.getSnapshot().generation;
    store.stage("lessonSnapshot", finished(), generation);
    const verify = () => verifyLessonCompletion(store, generation, memory, fetcher);
    await expect(verify()).rejects.toThrow("confirmar");
    expect(store.hasPendingChanges()).toBe(true);
    fail = false;
    await expect(verify()).resolves.toBe("account");
    expect(fetcher.mock.calls.at(-1)).toEqual(["/api/student/workspace", { cache: "no-store", credentials: "same-origin" }]);
    server = { ...server, learning: { ...server.learning, saveVersion: 2, lessonSnapshot: null } };
    await expect(verify()).rejects.toThrow("mudou");
    expect(store.getSnapshot().workspace?.learning.lessonSnapshot).toBeNull();
  });

  it.each(["uid", "revision", "new edit"] as const)("discards a verification that races with %s", async event => {
    let server = account(finished());
    const fetcher = async () => Response.json(server);
    const store = createWorkspaceStore(fetcher, memory);
    await store.load();
    const generation = store.getSnapshot().generation;
    let release!: (response: Response) => void;
    const read = vi.fn(() => new Promise<Response>(done => { release = done; }));
    const verifying = verifyLessonCompletion(store, generation, memory, read);
    await vi.waitFor(() => expect(read).toHaveBeenCalledTimes(1));
    const stale = Response.json(server);
    if (event === "new edit") store.stage("lessonSnapshot", encodeLessonAccountSnapshot(EMPTY_LESSON_DASHBOARD_INPUT), generation);
    else {
      server = event === "uid" ? { ...server, account: { ...server.account, id: "test-two" } } : { ...server, learning: { ...server.learning, revision: 1 } };
      await store.load(true);
    }
    release(stale);
    await expect(verifying).rejects.toThrow();
    store.reset();
  });

  it("rejects a server record with only a 49/49 counter and an unfinished lesson", async () => {
    const server = account(encodeLessonAccountSnapshot(EMPTY_LESSON_DASHBOARD_INPUT));
    server.learning.studyCompleted = 49;
    const fetcher = async () => Response.json(server);
    const store = createWorkspaceStore(fetcher, memory);
    await store.load();
    await expect(verifyLessonCompletion(store, store.getSnapshot().generation, memory, fetcher)).rejects.toThrow("49 etapas");
  });
});

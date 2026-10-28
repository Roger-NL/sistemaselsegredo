import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RequestPrincipal } from "@/server/auth/principal";
import { emptyProgress, studySteps } from "@/features/theory/progress";

type Data = Record<string, unknown>;
const memory = vi.hoisted(() => {
  const docs = new Map<string, Data>();
  const users = new Map<string, Data>();
  let sequence = 0, failCommit = false;
  function snapshot(path: string) { return { id: path.split("/").at(-1)!, exists: docs.has(path), data: () => docs.get(path) }; }
  function ref(path: string) {
    return { path, id: path.split("/").at(-1)!, get: async () => snapshot(path), delete: async () => { docs.delete(path); }, collection: (name: string) => query(`${path}/${name}`) };
  }
  function query(path: string, filters: [string, unknown][] = [], order?: string, limit?: number) {
    return { doc: (id?: string) => ref(`${path}/${id || `id-${++sequence}`}`), where: (key: string, _op: string, value: unknown) => query(path, [...filters, [key, value]], order, limit), orderBy: (key: string) => query(path, filters, key, limit), limit: (n: number) => query(path, filters, order, n), get: async () => {
      let entries = [...docs.entries()].filter(([key, value]) => key.startsWith(`${path}/`) && key.slice(path.length + 1).indexOf("/") === -1 && filters.every(([k, v]) => value[k] === v));
      if (order) entries = entries.sort((a, b) => String(b[1][order]).localeCompare(String(a[1][order])));
      if (limit) entries = entries.slice(0, limit);
      return { docs: entries.map(([key]) => snapshot(key)), size: entries.length };
    } };
  }
  function writes() {
    const pending: (() => void)[] = [];
    return {
      get: async (reference: ReturnType<typeof ref>) => snapshot(reference.path),
      set: (reference: ReturnType<typeof ref>, value: Data, opts?: { merge?: boolean }) => { pending.push(() => docs.set(reference.path, { ...(opts?.merge ? docs.get(reference.path) : {}), ...structuredClone(value) })); },
      create: (reference: ReturnType<typeof ref>, value: Data) => { pending.push(() => docs.set(reference.path, structuredClone(value))); },
      update: (reference: ReturnType<typeof ref>, value: Data) => { pending.push(() => docs.set(reference.path, { ...docs.get(reference.path), ...structuredClone(value) })); },
      commit: async () => { if (failCommit) { failCommit = false; throw new Error("DB unavailable"); } pending.forEach(write => write()); },
    };
  }
  const auth = {
    getUser: vi.fn(async (uid: string) => { const user = users.get(uid); if (!user) throw Object.assign(new Error("missing"), { code: "auth/user-not-found" }); return structuredClone(user); }),
    listUsers: vi.fn(async () => ({ users: [...users.values()].map(value => structuredClone(value)) })),
    createUser: vi.fn(async (data: Data) => { const user = { uid: `created-${++sequence}`, ...data, metadata: {}, customClaims: {} }; users.set(user.uid, user); return structuredClone(user); }),
    updateUser: vi.fn(async (uid: string, patch: Data) => { users.set(uid, { ...users.get(uid), ...patch }); }),
    setCustomUserClaims: vi.fn(async (uid: string, customClaims: Data) => { users.set(uid, { ...users.get(uid), customClaims }); }),
    revokeRefreshTokens: vi.fn(async () => undefined),
    generatePasswordResetLink: vi.fn(async () => "https://example.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=private"),
    deleteUser: vi.fn(async (uid: string) => { users.delete(uid); }),
  };
  return { docs, users, auth, failNextCommit: () => { failCommit = true; }, db: { collection: query, batch: writes, runTransaction: async <T>(callback: (tx: ReturnType<typeof writes>) => Promise<T>) => { const tx = writes(); const result = await callback(tx); await tx.commit(); return result; } } };
});
vi.mock("@/server/firebase", () => ({ getAdminDb: () => memory.db, getAdminAuth: () => memory.auth }));
vi.mock("@/server/http/rate-limit", () => ({ consumeRateLimit: vi.fn(async () => undefined) }));
import { getManagementSnapshot, mutateManagement } from "@/server/management/service";
import { appendConversationMessage, createConversation, getStudentWorkspace, saveLearning } from "@/server/workspace/service";
const manager: RequestPrincipal = { uid: "manager", email: "manager@example.com", role: "admin", source: "session_cookie", subscriptionStatus: "free" };
const student: RequestPrincipal = { ...manager, uid: "student", email: "student@example.com", role: "student" };
const study = JSON.stringify({ ...emptyProgress, completed: [studySteps[0].step.id] });
beforeEach(() => {
  vi.clearAllMocks(); memory.docs.clear(); memory.users.clear();
  for (const principal of [manager, student]) {
    memory.users.set(principal.uid, { uid: principal.uid, displayName: principal.uid, email: principal.email, disabled: false, emailVerified: true, metadata: { creationTime: "2026-10-01T00:00:00Z" }, customClaims: { admin: principal.role === "admin" } });
    memory.docs.set(`users/${principal.uid}`, { id: principal.uid, name: principal.uid, accountStatus: "active" });
  }
});

describe("connected student and manager services", () => {
  it("gives the student only their own live class and counts valid saved practices", async () => {
    const booking = { id: student.uid, userId: student.uid, status: "confirmed", start: "2026-11-01T13:00:00Z", timezone: "Europe/Lisbon" };
    memory.docs.set("demo_live_classes/manager", { ...booking, id: "manager", userId: "manager" });
    memory.docs.set("learning_states/student", { studyCompleted: 24 });
    expect(await getStudentWorkspace(student)).toMatchObject({ liveClass: null, learning: { studyCompleted: 0 } });
    memory.docs.set("demo_live_classes/student", booking);
    await saveLearning(student, { revision: 0, studySnapshot: study });
    expect(await getStudentWorkspace(student)).toMatchObject({ liveClass: booking, learning: { studyCompleted: 1 } });
    memory.docs.set("demo_live_classes/student", { ...booking, userId: "manager" });
    expect((await getStudentWorkspace(student)).liveClass).toBeNull();
  });
  it("counts actual Auth accounts, excluding orphan profiles and ignoring fictional legacy progress", async () => {
    memory.docs.set("users/orphan", { name: "orphan", progress: 100 });
    const data = await getManagementSnapshot(manager);
    expect(data.users).toHaveLength(2); expect(data.users.every(user => user.progress === 0)).toBe(true);
    expect(data.conversations).toEqual([]);
  });
  it("joins the same saved practices and live booking into follow-up, ignoring orphan booking records", async () => {
    await saveLearning(student, { revision: 0, studySnapshot: JSON.stringify({ ...emptyProgress, completed: studySteps.map(item => item.step.id) }) });
    let snapshot = await getManagementSnapshot(manager);
    expect(snapshot.users.find(user => user.id === student.uid)).toMatchObject({ canBookLiveClass: true, studyCompleted: 24, liveClass: null });
    const booking = { id: student.uid, userId: student.uid, status: "confirmed", start: "2026-11-01T13:00:00Z", timezone: "Europe/Lisbon" };
    memory.docs.set(`demo_live_classes/${student.uid}`, booking);
    memory.docs.set("demo_live_classes/orphan", { ...booking, id: "orphan", userId: "orphan" });
    snapshot = await getManagementSnapshot(manager);
    expect(snapshot.users).toHaveLength(2);
    expect(snapshot.users.find(user => user.id === student.uid)).toMatchObject({ canBookLiveClass: false, studyCompleted: 24, liveClass: booking });
  });
  it("creates a real Auth login pending approval, with an actionable password link", async () => {
    const result = await mutateManagement(manager, { type: "create", draft: { name: "New", email: "new@example.com", role: "student", notes: "" } });
    expect(result.resetLink).toContain("resetPassword");
    const snapshot = await getManagementSnapshot(manager);
    const created = snapshot.users.find(user => user.email === "new@example.com")!;
    expect(created.status).toBe("pending");
    await mutateManagement(manager, { type: "approve", userId: created.id });
    expect(memory.docs.get(`users/${created.id}`)?.accountStatus).toBe("active");
  });
  it("rolls back a new Auth account when profile persistence fails", async () => {
    memory.failNextCommit();
    await expect(mutateManagement(manager, { type: "create", draft: { name: "New", email: "new@example.com", role: "student", notes: "" } })).rejects.toThrow();
    expect(memory.auth.deleteUser).toHaveBeenCalled();
    expect(memory.users.size).toBe(2);
  });
  it("suspends login, revokes sessions, and allows a subsequent reactivation", async () => {
    await mutateManagement(manager, { type: "suspend", userId: "student" });
    expect(memory.users.get("student")?.disabled).toBe(true);
    expect(memory.auth.revokeRefreshTokens).toHaveBeenCalledWith("student");
    await mutateManagement(manager, { type: "activate", userId: "student" });
    expect(memory.users.get("student")?.disabled).toBe(false);
  });
  it("protects the manager from self-lockout and does not mutate unrelated entitlements", async () => {
    memory.docs.set("users/student", { accountStatus: "active", subscriptionStatus: "premium", paymentId: "preserve" });
    await expect(mutateManagement(manager, { type: "suspend", userId: "manager" })).rejects.toMatchObject({ status: 409 });
    await mutateManagement(manager, { type: "edit", userId: "student", draft: { name: "Edited", email: student.email!, role: "student", notes: "note" } });
    expect(memory.docs.get("users/student")).toMatchObject({ subscriptionStatus: "premium", paymentId: "preserve", name: "Edited" });
  });
  it("saves progress to the account, exposes it to management, and rejects writes predating a manager reset", async () => {
    const saved = await saveLearning(student, { revision: 0, studySnapshot: study });
    expect(saved.learning.studyCompleted).toBe(1);
    expect((await getManagementSnapshot(manager)).users.find(user => user.id === "student")?.studyCompleted).toBe(1);
    await mutateManagement(manager, { type: "reset-progress", userId: "student" });
    await expect(saveLearning(student, { revision: 0, studySnapshot: study })).rejects.toMatchObject({ status: 409 });
    const workspace = await getStudentWorkspace(student);
    expect(workspace.learning).toMatchObject({ revision: 1, studyCompleted: 0, studySnapshot: null });
    expect(workspace.activities.some(item => item.kind === "reset")).toBe(true);
  });
  it("allows pending students to contact the professor but prevents practice writes", async () => {
    memory.docs.set("users/student", { name: "Student", accountStatus: "pending" });
    await expect(saveLearning(student, { revision: 0, studySnapshot: study })).rejects.toMatchObject({ status: 403 });
    const result = await createConversation(student, { subject: "Dúvida", body: "Como continuar?" });
    expect(result.conversation.status).toBe("open");
  });
  it("connects a real student message and manager reply with both panels and activity history", async () => {
    const { conversation } = await createConversation(student, { subject: "Minha dúvida", body: "Uma pergunta" });
    expect((await getManagementSnapshot(manager)).conversations[0].id).toBe(conversation.id);
    await appendConversationMessage(manager, conversation.id, { body: "Uma resposta", status: "answered" }, true);
    const workspace = await getStudentWorkspace(student);
    expect(workspace.conversations[0].messages.map(message => message.body)).toEqual(["Uma pergunta", "Uma resposta"]);
    expect(workspace.conversations[0].status).toBe("answered");
    expect(workspace.activities.some(item => item.title.includes("Professor respondeu"))).toBe(true);
    expect((await getManagementSnapshot(manager)).activity[0].description).toContain("Resposta ao aluno");
  });
  it("enforces conversation ownership and closure, and rejects oversized messages", async () => {
    const { conversation } = await createConversation(student, { subject: "Dúvida", body: "Pergunta" });
    await expect(appendConversationMessage({ ...student, uid: "other" }, conversation.id, { body: "intrusion" })).rejects.toMatchObject({ status: 404 });
    await expect(appendConversationMessage(student, conversation.id, { body: "x".repeat(4001) })).rejects.toThrow();
    await appendConversationMessage(manager, conversation.id, { body: "Resolvido", status: "closed" }, true);
    await expect(appendConversationMessage(student, conversation.id, { body: "reopen" })).rejects.toMatchObject({ status: 409 });
  });
  it("generates a private reset link, revokes sessions, and never stores the credential link in audit", async () => {
    const result = await mutateManagement(manager, { type: "reset-login", userId: "student" });
    expect(result.resetLink).toContain("oobCode=private");
    expect(memory.auth.revokeRefreshTokens).toHaveBeenCalledWith("student");
    const audit = (await getManagementSnapshot(manager)).activity;
    expect(JSON.stringify(audit)).not.toContain("oobCode");
  });
  it("reports a partially persisted reset precisely rather than claiming a confirmed audit", async () => {
    memory.auth.revokeRefreshTokens.mockImplementationOnce(async () => { memory.failNextCommit(); });
    await expect(mutateManagement(manager, { type: "reset-login", userId: "student" })).rejects.toMatchObject({ status: 503, message: expect.stringContaining("Sessões encerradas") });
    expect(memory.auth.revokeRefreshTokens).toHaveBeenCalledWith("student");
    expect((await getManagementSnapshot(manager)).activity).toEqual([]);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ signup: vi.fn(), login: vi.fn(), signOut: vi.fn(), update: vi.fn(), getDoc: vi.fn(), request: vi.fn() }));
vi.mock("@/client/auth/firebase", () => ({ auth: {}, db: {} }));
vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: mocks.signup, signInWithEmailAndPassword: mocks.login,
  signOut: mocks.signOut, updateProfile: mocks.update,
  updateEmail: vi.fn(), updatePassword: vi.fn(), sendPasswordResetEmail: vi.fn(),
}));
vi.mock("firebase/firestore", () => ({ doc: vi.fn(), getDoc: mocks.getDoc, updateDoc: vi.fn(), deleteField: vi.fn() }));
import { register, login, logout } from "@/client/auth/service";
import legacy from "./fixtures/demo-legacy-navigation.json";
import { decodeSnapshot, STORAGE_KEY } from "@/features/demo/session/storage";
import { THEORY_KEY } from "@/features/theory/progress";

const user = { uid: "new-account", email: "qa@example.test", displayName: "QA", metadata: { creationTime: "2026-10-27" }, getIdToken: vi.fn(async () => "verified-token"), getIdTokenResult: vi.fn(async () => ({ claims: {} })) };
beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal("fetch", mocks.request);
  mocks.request.mockResolvedValue(new Response(null, { status: 200 }));
  mocks.getDoc.mockResolvedValue({ exists: () => true, data: () => ({ name: "Saved QA", subscriptionStatus: "free" }) });
  for (const action of [mocks.signup, mocks.login]) action.mockResolvedValue({ user });
  mocks.signOut.mockResolvedValue(undefined);
  mocks.update.mockResolvedValue(undefined);
});

describe("reactivated account entry", () => {
  it("creates the Firebase account and confirms the server session before reporting success", async () => {
    const result = await register("Usuário", "qa@example.test", "test-password", "test-password");
    expect(result.success).toBe(true);
    expect(mocks.signup).toHaveBeenCalledWith({}, "qa@example.test", "test-password");
    expect(mocks.request).toHaveBeenCalledWith("/api/auth/session", expect.objectContaining({ method: "POST", credentials: "include", body: JSON.stringify({ idToken: "verified-token" }) }));
    expect(mocks.getDoc).toHaveBeenCalled();
  });
  it("does not create an account when password confirmation differs", async () => {
    expect((await register("Usuário", "qa@example.test", "one", "another")).success).toBe(false);
    expect(mocks.signup).not.toHaveBeenCalled(); expect(mocks.request).not.toHaveBeenCalled();
  });
  it("offers login to an account already created when server confirmation fails, without creating it twice", async () => {
    mocks.request.mockResolvedValueOnce(new Response(null, { status: 503 }));
    const result = await register("Usuário", "qa@example.test", "test-password", "test-password");
    expect(result).toMatchObject({ success: false, accountCreated: true });
    expect(result.error).toContain("mesmo e-mail e senha");
    expect(mocks.signup).toHaveBeenCalledTimes(1);
    expect(mocks.signOut).toHaveBeenCalled();
    expect(mocks.getDoc).not.toHaveBeenCalled();
  });
  it("recovers a partially finished signup with the same credentials through login", async () => {
    mocks.request.mockResolvedValueOnce(new Response(null, { status: 503 }));
    expect((await register("Usuário", "qa@example.test", "test-password", "test-password")).accountCreated).toBe(true);
    expect((await login("qa@example.test", "test-password")).success).toBe(true);
    expect(mocks.signup).toHaveBeenCalledTimes(1);
    expect(mocks.login).toHaveBeenCalledWith({}, "qa@example.test", "test-password");
  });
  it("preserves a created Auth identity if its display-name update fails and clears any previous session", async () => {
    mocks.update.mockRejectedValueOnce({ code: "auth/network-request-failed" });
    expect(await register("Usuário", "qa@example.test", "test-password", "test-password")).toMatchObject({ success: false, accountCreated: true });
    expect(mocks.request).toHaveBeenCalledWith("/api/auth/session", expect.objectContaining({ method: "DELETE" }));
    expect(mocks.signup).toHaveBeenCalledTimes(1);
  });
  it("does not claim an account exists when signup itself fails on the network", async () => {
    mocks.signup.mockRejectedValueOnce({ code: "auth/network-request-failed" });
    const result = await register("Usuário", "qa@example.test", "test-password", "test-password");
    expect(result).toMatchObject({ success: false, error: expect.stringContaining("conexão") });
    expect(result.accountCreated).toBeUndefined();
    expect(mocks.request).not.toHaveBeenCalled();
  });
  it("keeps failed credentials outside the server session", async () => {
    mocks.login.mockRejectedValueOnce({ code: "auth/invalid-credential" });
    expect(await login("qa@example.test", "wrong")).toEqual({ success: false, error: "E-mail ou senha incorretos." });
    expect(mocks.request).not.toHaveBeenCalled(); expect(mocks.getDoc).not.toHaveBeenCalled();
  });
  for (const [name, action] of [
    ["email login", () => login("qa@example.test", "test-password")],
    ["signup", () => register("Usuário", "qa@example.test", "test-password", "test-password")],
  ] as const) {
    it(`${name}: fails closed if the server cannot establish the session`, async () => {
      mocks.request.mockResolvedValueOnce(new Response(null, { status: 401 }));
      expect((await action()).success).toBe(false);
      expect(mocks.request.mock.calls[1][1].method).toBe("DELETE");
      expect(mocks.signOut).toHaveBeenCalled(); expect(mocks.getDoc).not.toHaveBeenCalled();
    });
    it(`${name}: preserves a verified session when the optional browser profile read fails`, async () => {
      mocks.getDoc.mockRejectedValueOnce({ code: "permission-denied" });
      const result = await action();
      expect(result.success).toBe(true);
      expect(result.user).toMatchObject({ id: "new-account", email: "qa@example.test", subscriptionStatus: "free", isAdmin: false });
      expect(mocks.signOut).not.toHaveBeenCalled();
    });
  }
  it("can enter with verified identity when no browser profile document is visible", async () => {
    mocks.getDoc.mockResolvedValueOnce({ exists: () => false });
    expect((await login("qa@example.test", "test-password")).success).toBe(true);
  });
  it("keeps a verified server session usable when the browser profile network is unavailable", async () => {
    mocks.getDoc.mockRejectedValueOnce(new Error("unavailable"));
    expect((await login("qa@example.test", "test-password")).success).toBe(true);
  });
  it("signs out of Firebase without clearing unrelated browser storage", async () => {
    const clear = vi.fn(); vi.stubGlobal("localStorage", { clear });
    await logout();
    expect(mocks.signOut).toHaveBeenCalledWith({}); expect(clear).not.toHaveBeenCalled();
  });
  it("preserves a real legacy attempt and separate study progress through signup, login and logout", async () => {
    const story = JSON.stringify(legacy.less.resumed);
    const study = JSON.stringify({ version: 1, position: 1, completed: ["this-yours"], supported: ["this-yours"] });
    const data = new Map([[STORAGE_KEY, story], [THEORY_KEY, study]]);
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
      removeItem: (key: string) => data.delete(key), clear: () => data.clear(),
    });
    const original = decodeSnapshot(story);
    expect(original).not.toBeNull();
    for (const action of [
      () => register("Usuário", "qa@example.test", "test-password", "test-password"),
      () => login("qa@example.test", "test-password"),
    ]) {
      expect((await action()).success).toBe(true);
      await logout();
      expect(data.get(STORAGE_KEY)).toBe(story);
      expect(data.get(THEORY_KEY)).toBe(study);
      expect(decodeSnapshot(data.get(STORAGE_KEY)!)).toEqual(original);
    }
  });
});

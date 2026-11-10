import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookie: undefined as string | undefined,
  verifyCookie: vi.fn(), verifyIdToken: vi.fn(), getUser: vi.fn(),
  doc: vi.fn(), getProfile: vi.fn(), updateProfile: vi.fn(),
  login: vi.fn(), google: vi.fn(), signup: vi.fn(), signOut: vi.fn(), clientProfile: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: (name: string) => name === "es_auth_session" && mocks.cookie ? { value: mocks.cookie } : undefined }),
}));
vi.mock("@/server/firebase", () => ({
  getAdminAuth: () => ({ verifySessionCookie: mocks.verifyCookie, verifyIdToken: mocks.verifyIdToken, getUser: mocks.getUser }),
  getAdminDb: () => ({ collection: () => ({ doc: mocks.doc }) }),
}));
vi.mock("@/server/auth/service", () => ({ recordVerifiedLogin: vi.fn() }));
vi.mock("@/client/auth/firebase", () => ({ auth: {}, db: {} }));
vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: mocks.signup, signInWithEmailAndPassword: mocks.login,
  signInWithPopup: mocks.google, GoogleAuthProvider: class {}, signOut: mocks.signOut,
  updateProfile: vi.fn(), updateEmail: vi.fn(), updatePassword: vi.fn(), sendPasswordResetEmail: vi.fn(),
}));
vi.mock("firebase/firestore", () => ({ doc: vi.fn(), getDoc: mocks.clientProfile, updateDoc: vi.fn(), deleteField: vi.fn() }));

import { GET as getSession } from "@/app/api/auth/session/route";
import { PATCH as patchProfile } from "@/app/api/account/profile/route";
import { login, loginWithGoogle, register } from "@/client/auth/service";

const origin = "https://basedspeak.test";
function getRequest(cookie?: string, authorization?: string) {
  return new Request(`${origin}/api/auth/session`, { headers: {
    ...(cookie ? { cookie: `es_auth_session=${cookie}` } : {}),
    ...(authorization ? { authorization } : {}),
  } });
}
function patchRequest(body: string, expectedUid?: string, contentLength?: string) {
  return new Request(`${origin}/api/account/profile`, { method: "PATCH", headers: {
    origin, "content-type": "application/json",
    ...(expectedUid ? { "x-workspace-uid": expectedUid } : {}),
    ...(contentLength ? { "content-length": contentLength } : {}),
  }, body });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.cookie = undefined;
  mocks.verifyCookie.mockResolvedValue({ uid: "student-a", email: "a@example.test", admin: false });
  mocks.verifyIdToken.mockRejectedValue(new Error("invalid bearer"));
  mocks.getUser.mockResolvedValue({ disabled: false, customClaims: { admin: false } });
  mocks.doc.mockReturnValue({ get: mocks.getProfile, update: mocks.updateProfile });
  mocks.getProfile.mockResolvedValue({ exists: true, data: () => ({ accountStatus: "active", subscriptionStatus: "free" }) });
  mocks.updateProfile.mockResolvedValue(undefined);
  mocks.signOut.mockResolvedValue(undefined);
});
afterEach(() => vi.unstubAllGlobals());

describe("session and account route boundaries", () => {
  it("uses a verified session cookie when a bearer token has expired and keeps the identity private", async () => {
    const response = await getSession(getRequest("valid-cookie", "Bearer expired-token"));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toMatchObject({ authenticated: true, principal: { uid: "student-a", role: "student", source: "session_cookie" } });
    expect(mocks.verifyIdToken).toHaveBeenCalledWith("expired-token", true);
    expect(mocks.verifyCookie).toHaveBeenCalledWith("valid-cookie", true);
    expect(mocks.doc).toHaveBeenCalledWith("student-a");
  });

  it("rejects revoked and malformed session cookies, clearing session and legacy cookies", async () => {
    mocks.verifyCookie.mockRejectedValueOnce(new Error("revoked"));
    const revoked = await getSession(getRequest("revoked-cookie"));
    expect(revoked.status).toBe(401);
    expect(await revoked.json()).toEqual({ authenticated: false });
    expect(mocks.verifyCookie).toHaveBeenCalledWith("revoked-cookie", true);
    for (const name of ["es_auth_session", "es_session_token", "es_user_role", "es_user_status"]) {
      expect(revoked.cookies.get(name)).toMatchObject({ value: "", maxAge: 0 });
    }
    mocks.verifyCookie.mockClear();
    const malformed = await getSession(getRequest("%E0%A4%A"));
    expect(malformed.status).toBe(401);
    expect(malformed.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.verifyCookie).not.toHaveBeenCalled();
    expect(mocks.doc).not.toHaveBeenCalled();
  });

  it("does not retain administrator authority in a valid old cookie after demotion", async () => {
    mocks.verifyCookie.mockResolvedValue({ uid: "former-admin", email: "admin@example.test", admin: true });
    mocks.getProfile.mockResolvedValue({ exists: true, data: () => ({ accountStatus: "active", role: "admin", isAdmin: true }) });
    const response = await getSession(getRequest("old-admin-cookie"));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ principal: { uid: "former-admin", role: "student" } });
    expect(mocks.getUser).toHaveBeenCalledWith("former-admin");
  });

  it("clears an otherwise valid cookie when its account has been suspended", async () => {
    mocks.getProfile.mockResolvedValue({ exists: true, data: () => ({ accountStatus: "suspended" }) });
    const response = await getSession(getRequest("previously-valid-cookie"));
    expect(response.status).toBe(401);
    expect(response.cookies.get("es_auth_session")).toMatchObject({ value: "", maxAge: 0 });
    expect(mocks.updateProfile).not.toHaveBeenCalled();
  });

  it("keeps an edited name out of the newly connected account after a session switch", async () => {
    mocks.cookie = "cookie-for-student-b";
    mocks.verifyCookie.mockResolvedValue({ uid: "student-b", email: "b@example.test" });
    const stale = await patchProfile(patchRequest(JSON.stringify({ name: "Nome da primeira conta" }), "student-a"));
    expect(stale.status).toBe(409);
    expect(mocks.verifyCookie).toHaveBeenCalledWith("cookie-for-student-b", true);
    expect(mocks.doc).not.toHaveBeenCalled();
    expect(mocks.updateProfile).not.toHaveBeenCalled();

    const current = await patchProfile(patchRequest(JSON.stringify({ name: "  Nome da segunda conta  " }), "student-b"));
    expect(current.status).toBe(200);
    expect(await current.json()).toEqual({ name: "Nome da segunda conta" });
    expect(mocks.doc).toHaveBeenCalledExactlyOnceWith("student-b");
    expect(mocks.updateProfile).toHaveBeenCalledExactlyOnceWith({ name: "Nome da segunda conta", updatedAt: expect.any(String) });
  });

  it("enforces the actual UTF-8 payload size even if Content-Length understates it", async () => {
    mocks.cookie = "valid-cookie";
    const response = await patchProfile(patchRequest(JSON.stringify({ name: "á".repeat(1100) }), "student-a", "1"));
    expect(response.status).toBe(413);
    expect(mocks.doc).not.toHaveBeenCalled();
    expect(mocks.updateProfile).not.toHaveBeenCalled();
  });
});

describe("login after an interrupted client claims lookup", () => {
  it.each([
    ["e-mail", () => login("a@example.test", "fake-password")],
    ["Google", () => loginWithGoogle()],
    ["cadastro", () => register("Aluno", "a@example.test", "fake-password", "fake-password")],
  ])("retains the verified session without assuming admin access when %s claims are unavailable", async (_name, enter) => {
    const identity = {
      uid: "student-a", email: "a@example.test", displayName: "Aluno",
      metadata: { creationTime: "2026-11-04" },
      getIdToken: vi.fn().mockResolvedValue("fresh-test-token"),
      getIdTokenResult: vi.fn().mockRejectedValue(new Error("temporary token failure")),
    };
    mocks.login.mockResolvedValue({ user: identity });
    mocks.google.mockResolvedValue({ user: identity });
    mocks.signup.mockResolvedValue({ user: identity });
    // Editable profile fields cannot replace a verified administrative claim.
    mocks.clientProfile.mockResolvedValue({ exists: () => true, data: () => ({ name: "Aluno", isAdmin: true }) });
    let serverCookie: string | null = null;
    const request = vi.fn<typeof fetch>(async (_input, init) => {
      if (init?.method === "POST") serverCookie = "confirmed-session";
      if (init?.method === "DELETE") serverCookie = null;
      return new Response(null, { status: 200 });
    });
    vi.stubGlobal("fetch", request);

    const result = await enter();
    expect(result).toMatchObject({ success: true, user: { id: "student-a", isAdmin: false } });
    expect(serverCookie).toBe("confirmed-session");
    expect(mocks.signOut).not.toHaveBeenCalled();
  });

  it("rejects login and clears the previous session when the server refuses confirmation", async () => {
    const identity = {
      uid: "student-a", email: "a@example.test", displayName: "Aluno",
      metadata: { creationTime: "2026-11-04" },
      getIdToken: vi.fn().mockResolvedValue("test-token"),
      getIdTokenResult: vi.fn().mockResolvedValue({ claims: { admin: true } }),
    };
    mocks.login.mockResolvedValue({ user: identity });
    let serverCookie: string | null = "old-session";
    vi.stubGlobal("fetch", vi.fn<typeof fetch>(async (_input, init) => {
      if (init?.method === "DELETE") serverCookie = null;
      return new Response(null, { status: init?.method === "POST" ? 401 : 200 });
    }));

    const result = await login("a@example.test", "fake-password");
    expect(result.success).toBe(false);
    expect(serverCookie).toBeNull();
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
    expect(identity.getIdTokenResult).not.toHaveBeenCalled();
    expect(mocks.clientProfile).not.toHaveBeenCalled();
  });
});

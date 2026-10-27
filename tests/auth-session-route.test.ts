import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ verify: vi.fn(), create: vi.fn(), profile: vi.fn(), principal: vi.fn() }));
vi.mock("@/server/firebase", () => ({ getAdminAuth: () => ({ verifyIdToken: mocks.verify, createSessionCookie: mocks.create }) }));
vi.mock("@/server/auth/service", () => ({ recordVerifiedLogin: mocks.profile }));
vi.mock("@/server/auth/principal", () => ({ getRequestPrincipal: mocks.principal }));
import { POST, GET, DELETE } from "@/app/api/auth/session/route";

const origin = "https://basedspeak.test";
function request(method: string, body?: unknown, source: string | null = origin) {
  return new Request(`${origin}/api/auth/session`, { method, headers: {
    ...(source ? { origin: source } : {}), "content-type": "application/json",
  }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.verify.mockResolvedValue({ uid: "verified-user", email: "qa@example.test", auth_time: Math.floor(Date.now() / 1000) });
  mocks.create.mockResolvedValue("signed-session");
  mocks.profile.mockResolvedValue(undefined);
});

describe("real server session boundary", () => {
  it("exchanges a recent verified identity for a seven-day HttpOnly cookie", async () => {
    const response = await POST(request("POST", { idToken: "fresh-token" }));
    expect(response.status).toBe(200);
    expect(mocks.verify).toHaveBeenCalledWith("fresh-token", true);
    expect(mocks.create).toHaveBeenCalledWith("fresh-token", { expiresIn: 604800000 });
    expect(mocks.profile).toHaveBeenCalledWith(expect.objectContaining({ uid: "verified-user" }));
    const cookie = response.cookies.get("es_auth_session")!;
    expect(cookie).toMatchObject({ value: "signed-session", httpOnly: true, sameSite: "lax", path: "/", maxAge: 604800 });
    expect(response.cookies.get("es_user_role")).toMatchObject({ value: "", maxAge: 0 });
  });
  it("requires same-origin POST and DELETE before accessing identity or profile services", async () => {
    for (const source of [null, "https://foreign.example"]) {
      expect((await POST(request("POST", { idToken: "attacker-token" }, source))).status).toBe(403);
      expect((await DELETE(request("DELETE", undefined, source))).status).toBe(403);
    }
    expect(mocks.verify).not.toHaveBeenCalled();
    expect(mocks.profile).not.toHaveBeenCalled();
  });
  it("rejects missing and malformed tokens without creating profiles", async () => {
    for (const body of [{}, { idToken: " " }, { idToken: 123 }]) {
      expect((await POST(request("POST", body))).status).toBe(400);
    }
    expect(mocks.verify).not.toHaveBeenCalled();
    expect(mocks.profile).not.toHaveBeenCalled();
  });
  it("rejects expired or revoked ID tokens and clears a previous server cookie", async () => {
    mocks.verify.mockRejectedValue(new Error("revoked"));
    const response = await POST(request("POST", { idToken: "revoked-token" }));
    expect(response.status).toBe(401);
    expect(response.cookies.get("es_auth_session")).toMatchObject({ value: "", maxAge: 0 });
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.profile).not.toHaveBeenCalled();
  });
  it("requires a recent sign-in, not merely a freshly refreshed old ID token", async () => {
    for (const auth_time of [Math.floor(Date.now() / 1000) - 301, undefined, Number.NaN]) {
      mocks.verify.mockResolvedValue({ uid: "verified-user", auth_time });
      expect((await POST(request("POST", { idToken: "refreshed-old-login" }))).status).toBe(401);
    }
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.profile).not.toHaveBeenCalled();
  });
  it("does not record a login when the cookie exchange fails", async () => {
    mocks.create.mockRejectedValueOnce(new Error("service unavailable"));
    expect((await POST(request("POST", { idToken: "fresh-token" }))).status).toBe(401);
    expect(mocks.profile).not.toHaveBeenCalled();
  });
  it("does not deliver a signed session if the server profile transaction fails", async () => {
    mocks.profile.mockRejectedValueOnce(new Error("database unavailable"));
    const response = await POST(request("POST", { idToken: "fresh-token" }));
    expect(response.status).toBe(401);
    expect(response.cookies.get("es_auth_session")).toMatchObject({ value: "", maxAge: 0 });
  });
  it("clears the server and legacy cookies on an explicit same-origin logout", async () => {
    const response = await DELETE(request("DELETE"));
    expect(response.status).toBe(200);
    for (const name of ["es_auth_session", "es_session_token", "es_user_role", "es_user_status"]) {
      expect(response.cookies.get(name)).toMatchObject({ value: "", maxAge: 0 });
    }
    expect(mocks.profile).not.toHaveBeenCalled();
  });
  it("reports only a principal verified by the existing session guard", async () => {
    mocks.principal.mockResolvedValueOnce(null);
    const anonymous = await GET(request("GET"));
    expect(anonymous.status).toBe(401);
    expect(anonymous.headers.get("cache-control")).toBe("private, no-store");
    mocks.principal.mockResolvedValueOnce({ uid: "verified-user", source: "session" });
    const response = await GET(request("GET"));
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toEqual({ authenticated: true, principal: { uid: "verified-user", source: "session" } });
  });
});

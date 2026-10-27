import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ verifyToken: vi.fn(), verifyCookie: vi.fn(), identity: vi.fn(), profile: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
vi.mock("@/server/firebase", () => ({ getAdminAuth: () => ({ verifyIdToken: mocks.verifyToken, verifySessionCookie: mocks.verifyCookie, getUser: mocks.identity }), getAdminDb: () => ({ collection: () => ({ doc: () => ({ get: mocks.profile }) }) }) }));
import { getRequestPrincipal } from "@/server/auth/principal";
const request = () => new Request("https://basedspeak.test/api/admin/workspace", { headers: { authorization: "Bearer token" } });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.verifyToken.mockResolvedValue({ uid: "user", email: "user@example.com", admin: false });
  mocks.identity.mockResolvedValue({ disabled: false, customClaims: { admin: true } });
  mocks.profile.mockResolvedValue({ exists: true, data: () => ({ accountStatus: "active", role: "admin", isAdmin: true }) });
});
describe("real account and manager authority", () => {
  it("ignores editable profile role fields and verifies revocation", async () => {
    expect(await getRequestPrincipal(request())).toMatchObject({ uid: "user", role: "student", accountStatus: "active" });
    expect(mocks.verifyToken).toHaveBeenCalledWith("token", true);
    expect(mocks.identity).not.toHaveBeenCalled();
  });
  it("requires both verified and current administrative claims", async () => {
    mocks.verifyToken.mockResolvedValue({ uid: "user", admin: true });
    expect(await getRequestPrincipal(request())).toMatchObject({ role: "admin" });
    mocks.identity.mockResolvedValue({ disabled: false, customClaims: { admin: false } });
    expect(await getRequestPrincipal(request())).toMatchObject({ role: "student" });
  });
  it("rejects suspended/rejected accounts and treats legacy accounts as active", async () => {
    for (const accountStatus of ["suspended", "rejected"]) {
      mocks.profile.mockResolvedValue({ exists: true, data: () => ({ accountStatus }) });
      expect(await getRequestPrincipal(request())).toBeNull();
    }
    mocks.profile.mockResolvedValue({ exists: true, data: () => ({}) });
    expect(await getRequestPrincipal(request())).toMatchObject({ accountStatus: "active" });
  });
  it("keeps pending accounts identified for their panel and contact", async () => {
    mocks.profile.mockResolvedValue({ exists: true, data: () => ({ accountStatus: "pending" }) });
    expect(await getRequestPrincipal(request())).toMatchObject({ uid: "user", accountStatus: "pending" });
  });
  it("never grants active access to an Auth account without a server profile", async () => {
    mocks.profile.mockResolvedValue({ exists: false, data: () => undefined });
    expect(await getRequestPrincipal(request())).toMatchObject({ accountStatus: "pending" });
  });
});

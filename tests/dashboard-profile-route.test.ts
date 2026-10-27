import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ identity: vi.fn(), doc: vi.fn(), update: vi.fn() }));
vi.mock("@/server/dashboard/account", () => ({ getDashboardIdentity: mocks.identity }));
vi.mock("@/server/firebase", () => ({ getAdminDb: () => ({ collection: () => ({ doc: mocks.doc }) }) }));
import { PATCH } from "@/app/api/account/profile/route";

function request(body: unknown, origin: string | null = "http://localhost") {
  return new Request("http://localhost/api/account/profile", { method: "PATCH", headers: {
    "content-type": "application/json", ...(origin ? { origin } : {}),
  }, body: JSON.stringify(body) });
}

beforeEach(() => {
  vi.clearAllMocks(); mocks.identity.mockResolvedValue({ uid: "verified-user" });
  mocks.doc.mockReturnValue({ update: mocks.update }); mocks.update.mockResolvedValue(undefined);
});

describe("dashboard profile updates", () => {
  it("requires a same-origin request before looking up an identity", async () => {
    for (const origin of [null, "https://other.example"]) expect((await PATCH(request({ name: "Name" }, origin))).status).toBe(403);
    expect(mocks.identity).not.toHaveBeenCalled(); expect(mocks.doc).not.toHaveBeenCalled();
  });
  it("rejects unauthenticated or revoked sessions without a database write", async () => {
    mocks.identity.mockResolvedValue(null);
    expect((await PATCH(request({ name: "Name" }))).status).toBe(401);
    expect(mocks.doc).not.toHaveBeenCalled();
  });
  it("writes only the name and timestamp on the account from the verified identity", async () => {
    const response = await PATCH(request({ name: "  New name  " }));
    expect(response.status).toBe(200); expect(await response.json()).toEqual({ name: "New name" });
    expect(mocks.doc).toHaveBeenCalledWith("verified-user");
    expect(mocks.update).toHaveBeenCalledWith({ name: "New name", updatedAt: expect.any(String) });
  });
  it("cannot choose another account, change entitlements or write extra profile fields", async () => {
    for (const body of [{ name: "Name", uid: "another-user" }, { name: "Name", subscriptionStatus: "premium" }, { name: "Name", email: "other@example.com" }]) {
      expect((await PATCH(request(body))).status).toBe(400);
    }
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("rejects blank, oversized, malformed and control-character names", async () => {
    for (const name of [" ", "x".repeat(121), null, 42, "Name\nOther"]) expect((await PATCH(request({ name }))).status).toBe(400);
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("reports a failed write without claiming the name was saved", async () => {
    mocks.update.mockRejectedValueOnce(new Error("database unavailable"));
    const response = await PATCH(request({ name: "Name" }));
    expect(response.status).toBe(500); expect(await response.json()).toHaveProperty("error");
  });
});

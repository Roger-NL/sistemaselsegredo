import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ get: vi.fn(), create: vi.fn(), update: vi.fn(), ref: {} }));
vi.mock("@/server/firebase", () => ({ getAdminDb: () => ({
  collection: () => ({ doc: () => mocks.ref }),
  runTransaction: async (callback: (tx: typeof mocks) => Promise<void>) => callback(mocks),
}) }));
import { recordVerifiedLogin } from "@/server/auth/service";
beforeEach(() => vi.clearAllMocks());
describe("minimal profile after verified login", () => {
  it("creates only identity and free entitlement, without depending on old browser rules", async () => {
    mocks.get.mockResolvedValue({ exists: false });
    await recordVerifiedLogin({ uid: "test-user", email: "test@example.com", name: "Test" });
    const profile = mocks.create.mock.calls[0][1];
    expect(profile).toMatchObject({ id: "test-user", subscriptionStatus: "free", name: "Test" });
    expect(profile.accountStatus).toBe("pending");
    expect(Object.keys(profile).sort()).toEqual(["id", "email", "name", "subscriptionStatus", "accountStatus", "createdAt", "lastLoginDate", "updatedAt"].sort());
  });
  it("updates timestamps without replacing historical documents or entitlements", async () => {
    mocks.get.mockResolvedValue({ exists: true });
    await recordVerifiedLogin({ uid: "test-user" });
    expect(mocks.create).not.toHaveBeenCalled();
    expect(Object.keys(mocks.update.mock.calls[0][1]).sort()).toEqual(["lastLoginDate", "updatedAt"]);
  });
});

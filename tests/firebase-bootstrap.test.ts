import { beforeEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({
  getApps: vi.fn((): object[] => []), getApp: vi.fn(),
  initializeApp: vi.fn(() => ({})), cert: vi.fn(),
  getAuth: vi.fn(), getFirestore: vi.fn(),
}));
vi.mock("firebase-admin/app", () => sdk);
vi.mock("firebase-admin/auth", () => ({ getAuth: sdk.getAuth }));
vi.mock("firebase-admin/firestore", () => ({ getFirestore: sdk.getFirestore }));

beforeEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs(); });

describe("canonical Firebase Admin bootstrap", () => {
  it("does not initialize on import and reuses the existing app", async () => {
    const { getAdminAuth, getAdminDb } = await import("@/server/firebase");
    expect(sdk.initializeApp).not.toHaveBeenCalled();
    const app = {};
    sdk.getApps.mockReturnValueOnce([app]).mockReturnValueOnce([app]);
    sdk.getApp.mockReturnValue(app);
    getAdminAuth(); getAdminDb();
    expect(sdk.initializeApp).not.toHaveBeenCalled();
    expect(sdk.getAuth).toHaveBeenCalledWith(app);
    expect(sdk.getFirestore).toHaveBeenCalledWith(app);
  });

  it("fails closed for invalid credentials without logging their value", async () => {
    vi.stubEnv("FIREBASE_SERVICE_ACCOUNT", "invalid-test-only-credential");
    const { getAdminDb } = await import("@/server/firebase");
    expect(() => getAdminDb()).toThrow("FIREBASE_SERVICE_ACCOUNT_INVALID");
    expect(sdk.initializeApp).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ cookie: undefined as string | undefined, verify: vi.fn(), get: vi.fn(), doc: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => mocks.cookie ? { value: mocks.cookie } : undefined }) }));
vi.mock("@/server/firebase", () => ({
  getAdminAuth: () => ({ verifySessionCookie: mocks.verify }),
  getAdminDb: () => ({ collection: () => ({ doc: mocks.doc }) }),
}));
vi.mock("@/features/dashboard/Dashboard", () => ({ Dashboard: () => null }));
vi.mock("@/features/dashboard/PublicDashboard", () => ({ PublicDashboard: () => null }));

import { getDashboardAccount } from "@/server/dashboard/account";
import DashboardPage from "@/app/dashboard/page";
import { Dashboard } from "@/features/dashboard/Dashboard";
import { PublicDashboard } from "@/features/dashboard/PublicDashboard";

beforeEach(() => {
  vi.clearAllMocks(); mocks.cookie = undefined;
  mocks.doc.mockReturnValue({ get: mocks.get });
});

describe("dashboard server access", () => {
  it("renders the anonymous catalogue without accessing Firebase", async () => {
    const page = await DashboardPage();
    expect(page.type).toBe(PublicDashboard);
    expect(page.props).toEqual({});
    expect(mocks.verify).not.toHaveBeenCalled();
    expect(mocks.doc).not.toHaveBeenCalled();
  });
  it.each(["expired", "forged", "revoked"])("renders only the catalogue for a %s cookie", async reason => {
    mocks.cookie = "invalid-session";
    mocks.verify.mockRejectedValueOnce(new Error(reason));
    const page = await DashboardPage();
    expect(page.type).toBe(PublicDashboard);
    expect(page.props).toEqual({});
    expect(mocks.verify).toHaveBeenCalledWith("invalid-session", true);
    expect(mocks.doc).not.toHaveBeenCalled();
  });
  it("passes only the verified account's name and email to the client", async () => {
    mocks.cookie = "verified-session";
    mocks.verify.mockResolvedValue({ uid: "verified-user", email: "test@example.com", name: "Google name" });
    mocks.get.mockResolvedValue({ data: () => ({ name: "Saved name", subscriptionStatus: "premium", paymentId: "private-id" }) });
    const page = await DashboardPage();
    expect(page.type).toBe(Dashboard);
    expect(page.props).toEqual({ account: { name: "Saved name", email: "test@example.com" } });
    expect(mocks.doc).toHaveBeenCalledWith("verified-user");
    expect(mocks.verify).toHaveBeenCalledWith("verified-session", true);
  });
  it("uses the verified provider name when the profile service is unavailable", async () => {
    mocks.cookie = "verified-session";
    mocks.verify.mockResolvedValue({ uid: "verified-user", name: "Google name" });
    mocks.get.mockRejectedValueOnce(new Error("database unavailable"));
    await expect(getDashboardAccount()).resolves.toEqual({ name: "Google name", email: "" });
  });
  it("does not present the registration placeholder as a person's name", async () => {
    mocks.cookie = "verified-session";
    mocks.verify.mockResolvedValue({ uid: "verified-user", name: "Usuário" });
    mocks.get.mockResolvedValue({ data: () => ({ name: "Usuário" }) });
    await expect(getDashboardAccount()).resolves.toEqual({ name: "", email: "" });
  });
});

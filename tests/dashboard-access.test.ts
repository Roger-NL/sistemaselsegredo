import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ cookie: undefined as string | undefined, verify: vi.fn(), get: vi.fn(), doc: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => mocks.cookie ? { value: mocks.cookie } : undefined }) }));
vi.mock("@/server/firebase", () => ({
  getAdminAuth: () => ({ verifySessionCookie: mocks.verify }),
  getAdminDb: () => ({ collection: () => ({ doc: mocks.doc }) }),
}));
vi.mock("next/navigation", () => ({ redirect: (target: string) => { throw new Error(`REDIRECT:${target}`); } }));
vi.mock("@/features/dashboard/Dashboard", () => ({ Dashboard: () => null }));

import { getDashboardAccount } from "@/server/dashboard/account";
import DashboardPage from "@/app/dashboard/page";

beforeEach(() => {
  vi.clearAllMocks(); mocks.cookie = undefined;
  mocks.doc.mockReturnValue({ get: mocks.get });
});

describe("dashboard server access", () => {
  it("redirects anonymous visitors to sign-in without accessing Firebase", async () => {
    await expect(DashboardPage()).rejects.toThrow("REDIRECT:/comecar?modo=entrar");
    expect(mocks.verify).not.toHaveBeenCalled();
    expect(mocks.doc).not.toHaveBeenCalled();
  });
  it("rejects an expired, forged or revoked cookie before reading any profile", async () => {
    mocks.cookie = "invalid-session"; mocks.verify.mockRejectedValueOnce(new Error("revoked"));
    await expect(DashboardPage()).rejects.toThrow("REDIRECT:/comecar?modo=entrar");
    expect(mocks.verify).toHaveBeenCalledWith("invalid-session", true);
    expect(mocks.doc).not.toHaveBeenCalled();
  });
  it("passes only the verified account's name and email to the client", async () => {
    mocks.cookie = "verified-session";
    mocks.verify.mockResolvedValue({ uid: "verified-user", email: "test@example.com", name: "Google name" });
    mocks.get.mockResolvedValue({ data: () => ({ name: "Saved name", subscriptionStatus: "premium", paymentId: "private-id" }) });
    const page = await DashboardPage();
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

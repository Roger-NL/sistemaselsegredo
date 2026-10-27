import { describe, expect, it, vi } from "vitest";
const principal = vi.hoisted(() => vi.fn());
vi.mock("@/server/auth/principal", () => ({ getRequestPrincipal: principal }));
import { requireAdminPrincipal } from "@/server/auth/route-guards";
import { resolvePostAuthTarget } from "@/client/auth/navigation";
const request = new Request("http://localhost/api/admin/example");
describe("reserved admin guard and future navigation", () => {
  it("requires verified identity and administrative role", async () => {
    principal.mockResolvedValueOnce(null);
    await expect(requireAdminPrincipal(request)).rejects.toMatchObject({ status: 401 });
    principal.mockResolvedValueOnce({ role: "student" });
    await expect(requireAdminPrincipal(request)).rejects.toMatchObject({ status: 403 });
    principal.mockResolvedValueOnce({ uid: "admin", role: "admin" });
    await expect(requireAdminPrincipal(request)).resolves.toMatchObject({ uid: "admin" });
  });
  it("does not send future authentication back to retired screens or unsafe callbacks", () => {
    for (const callbackUrl of [null, "/login?callbackUrl=test", "//example.com", "/\\example.com", "/api/checkout", "/\nunsafe"]) expect(resolvePostAuthTarget({ mode: "login", callbackUrl })).toBe("/");
    expect(resolvePostAuthTarget({ mode: "login", callbackUrl: "/dashboard" })).toBe("/dashboard");
    expect(resolvePostAuthTarget({ mode: "login", callbackUrl: "/demo" })).toBe("/demo");
  });
});

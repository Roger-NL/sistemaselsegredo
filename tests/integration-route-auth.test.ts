import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ principal: vi.fn(), database: vi.fn() }));
vi.mock("@/server/auth/principal", () => ({ getRequestPrincipal: mocks.principal }));
vi.mock("@/server/firebase", () => ({ getAdminDb: mocks.database }));

import * as invites from "@/app/api/admin/invite-codes/route";
import * as invite from "@/app/api/auth/invite/route";
import * as checkout from "@/app/api/checkout/route";
import * as verify from "@/app/api/verify-payment/route";
import * as availability from "@/app/api/scheduling/availability/route";
import * as cancel from "@/app/api/scheduling/cancel/route";
import * as request from "@/app/api/scheduling/request/route";
import * as status from "@/app/api/scheduling/status/route";
import * as day from "@/app/api/admin/scheduling/day/route";
import * as decision from "@/app/api/admin/scheduling/decision/route";
import * as snapshot from "@/app/api/admin/scheduling/snapshot/route";
import * as webhook from "@/app/api/webhooks/asaas/route";

const protectedMethods = [
  ["GET", invites.GET], ["POST", invites.POST], ["POST", invite.POST],
  ["GET", checkout.GET], ["POST", checkout.POST], ["POST", verify.POST],
  ["GET", availability.GET], ["POST", cancel.POST], ["POST", request.POST], ["GET", status.GET],
  ["GET", day.GET], ["POST", decision.POST], ["GET", snapshot.GET],
] as const;

beforeEach(() => { vi.clearAllMocks(); mocks.principal.mockResolvedValue(null); });
afterEach(() => vi.unstubAllEnvs());

describe("preserved API authorization boundaries", () => {
  for (const [index, [method, handler]] of protectedMethods.entries()) {
    it(`denies anonymous request ${index + 1} with JSON before integration access`, async () => {
      const response = await handler(new Request("http://localhost/api/reserved", { method }));
      expect(response.status).toBe(401);
      expect(response.headers.get("content-type")).toContain("application/json");
      expect(response.headers.get("location")).toBeNull();
      expect(mocks.database).not.toHaveBeenCalled();
    });
  }
  for (const [index, [method, handler]] of [["GET", invites.GET], ["POST", invites.POST], ["GET", day.GET], ["POST", decision.POST], ["GET", snapshot.GET]].entries()) {
    it(`denies non-admin request ${index + 1} without consulting services`, async () => {
      mocks.principal.mockResolvedValue({ uid: "user", role: "student" });
      const response = await (handler as typeof day.GET)(new Request("http://localhost/api/reserved", { method: method as string }));
      expect(response.status).toBe(403);
      expect(mocks.database).not.toHaveBeenCalled();
    });
  }
  it("fails closed for webhook tokens without touching the database", async () => {
    vi.stubEnv("ASAAS_WEBHOOK_TOKEN", "test-secret");
    for (const token of ["", "wrong-token"]) {
      const response = await webhook.POST(new Request("http://localhost/api/webhooks/asaas", { method: "POST", headers: { "asaas-access-token": token } }));
      expect(response.status).toBe(401);
    }
    expect(mocks.database).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ principal: vi.fn(), get: vi.fn(), update: vi.fn(), process: vi.fn(), rate: vi.fn() }));
vi.mock("@/server/auth/principal", () => ({ getRequestPrincipal: mocks.principal }));
vi.mock("@/server/notifications/service", () => ({ getNotificationSettings: mocks.get, updateNotificationSettings: mocks.update, processOperationalNotifications: mocks.process }));
vi.mock("@/server/http/rate-limit", async importOriginal => ({ ...await importOriginal<typeof import("@/server/http/rate-limit")>(), consumeRateLimit: mocks.rate }));
import * as notifications from "@/app/api/admin/notifications/route";

const origin = "https://basedspeak.test";
const request = (method: string, body?: unknown, source = origin, uid = "manager") => new Request(`${origin}/api/admin/notifications`, {
  method, headers: { origin: source, "content-type": "application/json", "x-workspace-uid": uid }, ...(method === "GET" ? {} : { body: JSON.stringify(body) }),
});
beforeEach(() => {
  vi.clearAllMocks();
  mocks.principal.mockResolvedValue({ uid: "manager", role: "admin", accountStatus: "active" });
  mocks.get.mockResolvedValue({ enabled: true, configured: true, recipientEmail: "owner@example.com" });
  mocks.update.mockResolvedValue({ enabled: true, recipientEmail: "owner@example.com" });
  mocks.process.mockResolvedValue({ sent: 1, retry: 0, review: 0, skipped: 0, configured: true });
});

describe("operational notification management boundaries", () => {
  it("only exposes settings to an active manager", async () => {
    for (const principal of [null, { uid: "student", role: "student", accountStatus: "active" }, { uid: "manager", role: "admin", accountStatus: "pending" }]) {
      mocks.principal.mockResolvedValue(principal);
      expect((await notifications.GET(request("GET"))).status).toBe(principal ? 403 : 401);
    }
    expect(mocks.get).not.toHaveBeenCalled();
  });
  it("refuses cross-origin writes or a stale manager identity before changing settings", async () => {
    expect((await notifications.PATCH(request("PATCH", {}, "https://foreign.test"))).status).toBe(403);
    expect((await notifications.POST(request("POST", { action: "process" }, origin, "other-manager"))).status).toBe(409);
    expect(mocks.update).not.toHaveBeenCalled(); expect(mocks.process).not.toHaveBeenCalled();
  });
  it("cannot supply provider keys or change a recipient through a processing request", async () => {
    expect((await notifications.PATCH(request("PATCH", { recipientEmail: "owner@example.com", enabled: true, apiKey: "not-accepted" }))).status).toBe(400);
    expect((await notifications.POST(request("POST", { action: "process", recipientEmail: "other@example.com" }))).status).toBe(400);
    expect(mocks.update).not.toHaveBeenCalled(); expect(mocks.process).not.toHaveBeenCalled();
  });
  it("persists the selected recipient with the verified manager identity", async () => {
    const body = { recipientEmail: "owner@example.com", enabled: true };
    const response = await notifications.PATCH(request("PATCH", body));
    expect(response.status).toBe(200); expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.update).toHaveBeenCalledWith(body, "manager");
    expect(mocks.rate).toHaveBeenCalledWith(expect.objectContaining({ namespace: "notification-settings", identifier: "manager" }));
  });
  it("does not attempt external delivery while paused or missing provider configuration", async () => {
    for (const settings of [{ enabled: false, configured: true }, { enabled: true, configured: false }]) {
      mocks.get.mockResolvedValue(settings);
      expect((await notifications.POST(request("POST", { action: "process" }))).status).toBe(409);
    }
    expect(mocks.process).not.toHaveBeenCalled();
  });
  it("rate limits a configured processing action and returns actual outcomes", async () => {
    const response = await notifications.POST(request("POST", { action: "process" }));
    expect(response.status).toBe(200);
    expect((await response.json()).delivery.sent).toBe(1);
    expect(mocks.rate).toHaveBeenCalledWith(expect.objectContaining({ namespace: "notification-process", identifier: "manager", limit: 5 }));
    expect(mocks.process).toHaveBeenCalledOnce();
  });
});

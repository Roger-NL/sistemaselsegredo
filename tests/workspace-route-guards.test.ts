import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ principal: vi.fn(), db: vi.fn() }));
vi.mock("@/server/auth/principal", () => ({ getRequestPrincipal: mocks.principal }));
vi.mock("@/server/firebase", () => ({ getAdminDb: mocks.db, getAdminAuth: vi.fn() }));
import * as student from "@/app/api/student/workspace/route";
import * as learning from "@/app/api/student/learning/route";
import * as importing from "@/app/api/student/learning/import/route";
import * as conversations from "@/app/api/student/conversations/route";
import * as messages from "@/app/api/student/conversations/[id]/messages/route";
import * as management from "@/app/api/admin/workspace/route";
import * as users from "@/app/api/admin/users/route";
import * as replies from "@/app/api/admin/conversations/[id]/messages/route";
const origin = "https://basedspeak.test";
const params = { params: Promise.resolve({ id: "conversation" }) };
const request = (method: string, source = origin, body: unknown = {}) => new Request(`${origin}/api/test`, { method, headers: { origin: source, "content-type": "application/json" }, ...(method === "GET" ? {} : { body: JSON.stringify(body) }) });
const routes = [
  ["GET", (req: Request) => student.GET(req)], ["PUT", (req: Request) => learning.PUT(req)],
  ["POST", (req: Request) => importing.POST(req)],
  ["POST", (req: Request) => conversations.POST(req)], ["POST", (req: Request) => messages.POST(req, params)],
  ["GET", (req: Request) => management.GET(req)], ["POST", (req: Request) => users.POST(req)], ["POST", (req: Request) => replies.POST(req, params)],
] as const;
beforeEach(() => { vi.clearAllMocks(); mocks.principal.mockResolvedValue(null); });
describe("workspace API authorization and request boundaries", () => {
  routes.forEach(([method, handler], index) => it(`denies anonymous workspace route ${index + 1} before database access`, async () => {
    const response = await handler(request(method));
    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.db).not.toHaveBeenCalled();
  }));
  routes.filter(([method]) => method !== "GET").forEach(([method, handler], index) => it(`denies cross-origin mutation ${index + 1} before authentication`, async () => {
    const response = await handler(request(method, "https://foreign.test"));
    expect(response.status).toBe(403);
    expect(mocks.principal).not.toHaveBeenCalled(); expect(mocks.db).not.toHaveBeenCalled();
  }));
  it("blocks ordinary and pending manager accounts from real administrative operations", async () => {
    for (const principal of [{ uid: "student", role: "student" }, { uid: "manager", role: "admin", accountStatus: "pending" }]) {
      mocks.principal.mockResolvedValue(principal);
      expect((await management.GET(request("GET"))).status).toBe(403);
      expect((await users.POST(request("POST"))).status).toBe(403);
      expect((await replies.POST(request("POST"), params)).status).toBe(403);
    }
    expect(mocks.db).not.toHaveBeenCalled();
  });
  it("rejects malformed and unexpected management writes before any side effects", async () => {
    mocks.principal.mockResolvedValue({ uid: "manager", role: "admin", accountStatus: "active" });
    for (const body of [{ type: "delete", userId: "student" }, { type: "approve", userId: "users/target" }, { type: "create", draft: { name: "Name", email: "user@example.com", role: "student", notes: "", admin: true } }]) expect((await users.POST(request("POST", origin, body))).status).toBe(400);
    expect(mocks.db).not.toHaveBeenCalled();
  });
  it("rejects a stale account header or a missing header before a student's mutation", async () => {
    mocks.principal.mockResolvedValue({ uid: "student-B", role: "student", accountStatus: "active" });
    for (const expected of [undefined, "student-A"]) {
      const req = request("PUT");
      if (expected) req.headers.set("x-workspace-uid", expected);
      expect((await learning.PUT(req)).status).toBe(409);
    }
    expect(mocks.db).not.toHaveBeenCalled();
  });
  it("accepts a matching header and proceeds to payload validation", async () => {
    mocks.principal.mockResolvedValue({ uid: "student-B", role: "student", accountStatus: "active" });
    const req = request("PUT", origin, { revision: "invalid" });
    req.headers.set("x-workspace-uid", "student-B");
    expect((await learning.PUT(req)).status).toBe(400);
    expect(mocks.db).not.toHaveBeenCalled();
  });
});

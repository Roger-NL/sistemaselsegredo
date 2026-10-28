import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ principal: vi.fn(), get: vi.fn(), transaction: vi.fn(), update: vi.fn(), doc: vi.fn() }));
vi.mock("@/server/auth/request-auth", async importOriginal => ({ ...await importOriginal<typeof import("@/server/auth/request-auth")>(), requireRequestPrincipal: mocks.principal }));
vi.mock("@/server/firebase", () => ({ getAdminDb: () => ({ collection: (name: string) => { expect(name).toBe("users"); return { doc: mocks.doc }; }, runTransaction: mocks.transaction }) }));
import { GET, POST } from "@/app/api/student/presentation/route";
import { RequestAuthError } from "@/server/auth/request-auth";
function request(body: unknown = { completed: true }, uid = "student-a", origin: string | null = "https://based.test") {
  return new Request("https://based.test/api/student/presentation", { method: "POST", headers: { "Content-Type": "application/json", "X-Presentation-Uid": uid, ...(origin ? { origin } : {}) }, body: JSON.stringify(body) });
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.principal.mockResolvedValue({ uid: "student-a", accountStatus: "pending" });
  mocks.doc.mockImplementation(uid => ({ uid, get: mocks.get }));
  mocks.get.mockResolvedValue({ exists: true, data: () => ({ accountStatus: "pending", studySnapshot: "untouched" }) });
  mocks.transaction.mockImplementation(callback => callback({ get: mocks.get, update: mocks.update }));
});
describe("student presentation persistence", () => {
  it("reads only the verified account with private no-store headers, including pending students", async () => {
    const response = await GET(new Request("https://based.test/api/student/presentation?uid=other"));
    expect(await response.json()).toEqual({ uid: "student-a", completed: false });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.doc).toHaveBeenCalledWith("student-a");
    expect(mocks.principal).toHaveBeenCalledWith(expect.any(Request), { allowBearer: false });
  });
  it("shows once for both older and newly created accounts, regardless of existing learning progress", async () => {
    for (const createdAt of ["2020-01-01T00:00:00Z", "2026-10-28T12:00:00Z"]) {
      mocks.get.mockResolvedValueOnce({ exists: true, data: () => ({ createdAt, studyCompleted: 24, accountStatus: "active" }) });
      expect(await (await GET(new Request("https://based.test/api/student/presentation"))).json()).toEqual({ uid: "student-a", completed: false });
    }
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("does not carry one account's presentation completion into another account", async () => {
    mocks.doc.mockImplementation(uid => ({ get: async () => ({ exists: true, data: () => uid === "student-a" ? { presentationCompletedAt: "2026-10-28T12:00:00Z" } : {} }) }));
    expect(await (await GET(new Request("https://based.test/api/student/presentation"))).json()).toEqual({ uid: "student-a", completed: true });
    mocks.principal.mockResolvedValueOnce({ uid: "student-b" });
    expect(await (await GET(new Request("https://based.test/api/student/presentation"))).json()).toEqual({ uid: "student-b", completed: false });
  });
  it("writes exactly one private presentation field without granting access or changing progress", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200); expect(await response.json()).toEqual({ uid: "student-a", completed: true });
    expect(mocks.update).toHaveBeenCalledWith({ uid: "student-a", get: mocks.get }, { presentationCompletedAt: expect.any(String) });
    expect(Object.keys(mocks.update.mock.calls[0][1])).toEqual(["presentationCompletedAt"]);
  });
  it("is idempotent across repeat visits/devices and never resets completion", async () => {
    mocks.get.mockResolvedValue({ exists: true, data: () => ({ presentationCompletedAt: "2026-10-28T12:00:00Z" }) });
    expect(await (await GET(new Request("https://based.test/api/student/presentation"))).json()).toEqual({ uid: "student-a", completed: true });
    expect((await POST(request())).status).toBe(200); expect(mocks.update).not.toHaveBeenCalled();
    expect((await POST(request({ completed: false }))).status).toBe(400);
  });
  it("rejects missing or foreign origins before authentication", async () => {
    for (const origin of [null, "https://foreign.test"]) expect((await POST(request(undefined, "student-a", origin))).status).toBe(403);
    expect(mocks.principal).not.toHaveBeenCalled(); expect(mocks.update).not.toHaveBeenCalled();
  });
  it("rejects another account or switched session and all extra body fields", async () => {
    expect((await POST(request(undefined, "student-b"))).status).toBe(409);
    for (const body of [{ completed: true, uid: "student-b" }, { completed: true, role: "admin" }, {}, { completed: 1 }]) expect((await POST(request(body))).status).toBe(400);
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("does not provision missing profiles and does not claim success on database failure", async () => {
    mocks.get.mockResolvedValueOnce({ exists: false });
    expect((await POST(request())).status).toBe(409); expect(mocks.update).not.toHaveBeenCalled();
    mocks.transaction.mockRejectedValueOnce(new Error("offline"));
    const response = await POST(request()); expect(response.status).toBe(503); expect(await response.json()).toHaveProperty("error");
  });
  it("rejects expired or revoked sessions with private responses", async () => {
    mocks.principal.mockRejectedValue(new RequestAuthError("Session expired"));
    for (const response of [await GET(new Request("https://based.test/api/student/presentation")), await POST(request())]) {
      expect(response.status).toBe(401); expect(response.headers.get("cache-control")).toBe("private, no-store");
    }
    expect(mocks.update).not.toHaveBeenCalled();
  });
});

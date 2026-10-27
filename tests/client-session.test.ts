import { describe, expect, it, vi } from "vitest";
import { createSessionSynchronizer } from "@/client/auth/session";

describe("client server-session synchronization", () => {
  it("deduplicates a verified token, refreshes explicitly and clears on logout", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(null));
    const identity = { getIdToken: vi.fn().mockResolvedValue("test-token") };
    const sync = createSessionSynchronizer(request);
    expect(await sync(identity)).toBe(true);
    expect(await sync(identity)).toBe(true);
    expect(request).toHaveBeenCalledTimes(1);
    expect(await sync(identity, true)).toBe(true);
    expect(identity.getIdToken).toHaveBeenLastCalledWith(true);
    expect(await sync(null)).toBe(true);
    expect(request).toHaveBeenLastCalledWith("/api/auth/session", { method: "DELETE", credentials: "include" });
    expect(await sync(identity)).toBe(true);
    expect(request).toHaveBeenCalledTimes(4);
  });

  it("clears a rejected session and permits a retry without caching failure", async () => {
    const request = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValue(new Response(null));
    const sync = createSessionSynchronizer(request);
    const identity = { getIdToken: async () => "test-token" };
    expect(await sync(identity)).toBe(false);
    expect(request.mock.calls[1][1]?.method).toBe("DELETE");
    expect(await sync(identity)).toBe(true);
    expect(request.mock.calls[2][1]?.method).toBe("POST");
  });

  it("reports network and token failures without requiring React", async () => {
    const request = vi.fn<typeof fetch>().mockRejectedValue(new Error("offline"));
    const sync = createSessionSynchronizer(request);
    expect(await sync(null)).toBe(false);
    expect(await sync({ getIdToken: async () => { throw new Error("expired"); } })).toBe(false);
  });

  it("tries to clear an earlier cookie after token or transport failure", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(null));
    const sync = createSessionSynchronizer(request);
    expect(await sync({ getIdToken: async () => { throw new Error("expired"); } })).toBe(false);
    expect(request).toHaveBeenLastCalledWith("/api/auth/session", { method: "DELETE", credentials: "include" });
    request.mockRejectedValueOnce(new Error("offline"));
    expect(await sync({ getIdToken: async () => "new-token" })).toBe(false);
    expect(request).toHaveBeenLastCalledWith("/api/auth/session", { method: "DELETE", credentials: "include" });
  });
});

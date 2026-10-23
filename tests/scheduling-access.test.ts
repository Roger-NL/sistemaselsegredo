import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ collection: vi.fn(), get: vi.fn() }));
vi.mock("@/server/firebase", () => ({ getAdminDb: () => ({ collection: mocks.collection }) }));
vi.mock("@/server/integrations/google-calendar", () => ({ getSchedulingTimezone: () => "UTC" }));
import { getSchedulingStatusForUser } from "@/server/scheduling/service";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.collection.mockImplementation((name: string) => {
    if (!["users", "live_sessions"].includes(name)) throw new Error(`Unexpected collection ${name}`);
    return { doc: () => ({ get: () => mocks.get(name) }) };
  });
});

describe("reserved scheduling service without curriculum", () => {
  it("does not grant a reservation solely from premium access or query exams", async () => {
    mocks.get.mockImplementation(async (collection: string) => collection === "users"
      ? { exists: true, data: () => ({ subscriptionStatus: "premium", premiumActivatedAt: "2026-01-01T00:00:00Z" }) }
      : { exists: false });
    const status = await getSchedulingStatusForUser("test-user");
    expect(status).toMatchObject({ isPremium: true, session: null, canRequestScheduling: false });
    expect(status.waitingReason).toContain("serviço autorizado");
    expect(mocks.collection.mock.calls.map(([name]) => name)).toEqual(["users", "live_sessions"]);
  });
  it("denies scheduling without financial entitlement before reading reservations", async () => {
    mocks.get.mockResolvedValue({ exists: true, data: () => ({ subscriptionStatus: "free" }) });
    expect(await getSchedulingStatusForUser("test-user")).toMatchObject({ isPremium: false, schedulingVisible: false, canRequestScheduling: false });
    expect(mocks.collection).toHaveBeenCalledTimes(1);
  });
});

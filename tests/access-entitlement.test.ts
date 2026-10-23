import { describe, expect, it } from "vitest";
import { buildPremiumAccessUpdate, resolvePremiumExpiresAtIso } from "@/server/access/service";

describe("financial entitlement", () => {
  it("writes access fields without curricular grants or progress", () => {
    expect(buildPremiumAccessUpdate({ inviteCodeUsed: "BS-••••-1234", activatedAtIso: "2026-01-01T00:00:00Z", expiresAtIso: "2027-01-01T00:00:00Z" })).toEqual({
      subscriptionStatus: "premium", inviteCodeUsed: "BS-••••-1234",
      premiumActivatedAt: "2026-01-01T00:00:00Z", subscriptionExpiresAt: "2027-01-01T00:00:00Z",
    });
  });
  it("retains the invite's one-year access duration", () => {
    expect(resolvePremiumExpiresAtIso(new Date("2026-01-01T00:00:00Z"))).toBe("2027-01-01T00:00:00.000Z");
  });
});

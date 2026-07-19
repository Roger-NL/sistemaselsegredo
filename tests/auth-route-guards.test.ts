import { describe, expect, it } from "vitest";
import { evaluateAuthGuard } from "@/lib/auth/route-guards";

describe("evaluateAuthGuard", () => {
    it("keeps login reachable even when a stale cookie exists", () => {
        expect(evaluateAuthGuard({ pathname: "/login", hasVerifiedSession: true })).toEqual({
            allow: true,
            reason: "allow",
        });
    });

    it("redirects protected paths and preserves the complete callback", () => {
        const decision = evaluateAuthGuard({
            pathname: "/pilar/2",
            pathnameWithSearch: "/pilar/2?module=quiz",
            hasVerifiedSession: false,
        });

        expect(decision.allow).toBe(false);
        expect(decision.reason).toBe("protected_requires_login");
        expect(decision.redirectTo).toBe("/login?callbackUrl=%2Fpilar%2F2%3Fmodule%3Dquiz");
    });

    it("does not confuse similarly prefixed public paths with protected ones", () => {
        expect(evaluateAuthGuard({ pathname: "/dashboard-public" })).toEqual({ allow: true, reason: "allow" });
        expect(evaluateAuthGuard({ pathname: "/admin-guide" })).toEqual({ allow: true, reason: "allow" });
    });
});

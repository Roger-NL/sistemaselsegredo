import { describe, expect, it } from "vitest";
import { resolvePaymentMode } from "@/features/payment/payment-mode";
import { calculateCheckoutInstallmentTotals } from "@/server/payments/installments";

const baseMode = {
    isAuthenticated: true,
    isAuthLoading: false,
    isPremium: false,
    inviteRequested: false,
    hasPendingPayment: false,
    isRecoveringPayment: false,
};

describe("payment UI contracts", () => {
    it("stops at manual reconciliation instead of opening a new checkout", () => {
        expect(resolvePaymentMode({ ...baseMode, reconciliationState: "manual-reconciliation" })).toBe("manual-reconciliation");
        expect(resolvePaymentMode({ ...baseMode, reconciliationState: "unresolved" })).toBe("unresolved-payment");
    });

    it("normalizes installment counts and keeps two installments free", () => {
        expect(calculateCheckoutInstallmentTotals(297, 2)).toMatchObject({
            installmentCount: 2,
            totalAmount: 297,
            hasFee: false,
        });
        expect(calculateCheckoutInstallmentTotals(297, 99).installmentCount).toBe(6);
        expect(calculateCheckoutInstallmentTotals(297, 6).totalAmount).toBeGreaterThan(297);
    });
});

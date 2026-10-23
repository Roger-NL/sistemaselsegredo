import { describe, expect, it } from "vitest";
import { calculateCheckoutInstallmentTotals } from "@/server/payments/installments";

describe("reserved payment installment contract", () => {
  it("normalizes counts and keeps two installments free", () => {
    expect(calculateCheckoutInstallmentTotals(297, 2)).toMatchObject({ installmentCount: 2, totalAmount: 297, hasFee: false });
    expect(calculateCheckoutInstallmentTotals(297, 99).installmentCount).toBe(6);
    expect(calculateCheckoutInstallmentTotals(297, 6).totalAmount).toBeGreaterThan(297);
  });
});

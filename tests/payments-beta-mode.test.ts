import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const asaasMocks = vi.hoisted(() => ({
  createCreditCardPayment: vi.fn(),
  createOrGetCustomer: vi.fn(),
  createPixPayment: vi.fn(),
  getPayment: vi.fn(),
  getPixQrCode: vi.fn(),
}));

vi.mock("@/lib/firebase-admin", () => ({ adminDb: {} }));
vi.mock("@/lib/asaas", () => ({
  ...asaasMocks,
  AsaasApiError: class AsaasApiError extends Error {
    status = 500;
  },
  isPaymentPaid: (status: string) => ["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"].includes(status),
}));

import { isBetaFreeMode, PaymentsDisabledError } from "@/lib/payments/config";
import { createCheckout, getCheckoutState, verifyPaymentStatus } from "@/lib/payments/service";

const originalBetaFreeMode = process.env.BETA_FREE_MODE;

function restoreBetaFreeMode() {
  if (originalBetaFreeMode === undefined) {
    delete process.env.BETA_FREE_MODE;
  } else {
    process.env.BETA_FREE_MODE = originalBetaFreeMode;
  }
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  restoreBetaFreeMode();
});

describe("free beta payment enforcement", () => {
  it("fails closed when BETA_FREE_MODE is absent", () => {
    delete process.env.BETA_FREE_MODE;
    expect(isBetaFreeMode()).toBe(true);
  });

  it("enables paid flows only through an explicit false value", () => {
    process.env.BETA_FREE_MODE = "false";
    expect(isBetaFreeMode()).toBe(false);

    process.env.BETA_FREE_MODE = "0";
    expect(isBetaFreeMode()).toBe(true);
  });

  it("blocks direct checkout before any Asaas call", async () => {
    process.env.BETA_FREE_MODE = "true";

    await expect(createCheckout({
      userId: "user_123",
      name: "Beta User",
      email: "beta@example.com",
      cpfCnpj: "12345678901",
      paymentMethod: "PIX",
      plan: "lifetime",
    })).rejects.toBeInstanceOf(PaymentsDisabledError);

    expect(asaasMocks.createOrGetCustomer).not.toHaveBeenCalled();
    expect(asaasMocks.createPixPayment).not.toHaveBeenCalled();
    expect(asaasMocks.createCreditCardPayment).not.toHaveBeenCalled();
  });

  it("blocks direct state and verification calls before consulting Asaas", async () => {
    process.env.BETA_FREE_MODE = "true";

    await expect(getCheckoutState("user_123", "lifetime")).rejects.toBeInstanceOf(PaymentsDisabledError);
    await expect(verifyPaymentStatus("user_123", "pay_123")).rejects.toBeInstanceOf(PaymentsDisabledError);

    expect(asaasMocks.getPayment).not.toHaveBeenCalled();
    expect(asaasMocks.getPixQrCode).not.toHaveBeenCalled();
  });
});

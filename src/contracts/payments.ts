/** Shared API contract. Contains no payment UI state or SDKs. */
export type PaymentReconciliationState = "paid" | "pending" | "manual-reconciliation" | "unresolved" | "error";

export type VerifyPaymentApiResponse = {
  success: boolean;
  isPaid: boolean;
  status: string | null;
  reconciliationState: PaymentReconciliationState;
  message?: string;
  shouldStopPolling?: boolean;
};

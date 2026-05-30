export type CheckoutPaymentMethod = "PIX" | "CREDIT_CARD";

export type CreditCardCheckoutMode = "INVOICE_URL" | "DIRECT";

export type CheckoutPlan = "lifetime" | "specialty";

export type AsaasPaymentStatus =
  | "PENDING"
  | "RECEIVED"
  | "CONFIRMED"
  | "OVERDUE"
  | "REFUNDED"
  | "RECEIVED_IN_CASH"
  | "REFUND_REQUESTED"
  | "CHARGEBACK_REQUESTED"
  | "CHARGEBACK_DISPUTE"
  | "AWAITING_CHARGEBACK_REVERSAL"
  | "DUNNING_REQUESTED"
  | "DUNNING_RECEIVED"
  | "AWAITING_RISK_ANALYSIS";

export interface CheckoutCustomerInput {
  userId: string;
  localCustomerId?: string;
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
  mobilePhone?: string;
  postalCode?: string;
  addressNumber?: string;
  addressComplement?: string | null;
  remoteIp?: string;
}

export interface CheckoutCardInput {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
  token?: string;
}

export interface CheckoutCardHolderInfoInput {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  addressComplement?: string | null;
  phone?: string;
  mobilePhone?: string;
}

export interface CheckoutRequestInput extends CheckoutCustomerInput {
  value?: number;
  description?: string;
  plan?: CheckoutPlan;
  paymentMethod?: CheckoutPaymentMethod;
  creditCardMode?: CreditCardCheckoutMode;
  installmentCount?: number;
  card?: CheckoutCardInput;
  cardHolderInfo?: CheckoutCardHolderInfoInput;
}

export interface PendingCheckoutPayment {
  paymentId: string;
  paymentMethod: CheckoutPaymentMethod;
  status: string;
  creditCardMode?: CreditCardCheckoutMode;
  installmentCount?: number;
  invoiceUrl?: string;
  qrCode?: string;
  qrCodePayload?: string;
  createdAt: string;
  expiresAt?: string;
  dueDate?: string;
  plan: CheckoutPlan;
}

export interface PaymentAttemptRecord {
  id: string;
  userId: string;
  localCustomerId?: string;
  asaasCustomerId: string;
  paymentMethod: CheckoutPaymentMethod;
  creditCardMode?: CreditCardCheckoutMode;
  installmentCount?: number;
  plan: CheckoutPlan;
  value: number;
  description: string;
  status: string;
  dueDate: string;
  invoiceUrl?: string;
  qrCode?: string;
  qrCodePayload?: string;
  expiresAt?: string;
  externalReference: string;
  billingType: CheckoutPaymentMethod;
  lastWebhookEvent?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutStateResponse {
  success: boolean;
  isPaid?: boolean;
  alreadyPremium?: boolean;
  hasPendingPayment?: boolean;
  reusedExisting?: boolean;
  expired?: boolean;
  message?: string;
  paymentId?: string;
  paymentMethod?: CheckoutPaymentMethod;
  creditCardMode?: CreditCardCheckoutMode;
  installmentCount?: number;
  status?: string;
  invoiceUrl?: string;
  requiresRedirect?: boolean;
  qrCode?: string;
  qrCodePayload?: string;
  expiresAt?: string;
  dueDate?: string;
  plan?: CheckoutPlan;
  reconciliationStatus?: PaymentReconciliationStatus;
  needsManualReconciliation?: boolean;
  reconciliationReason?: PaymentReconciliationReason;
}

export type PaymentReconciliationStatus =
  | "pending"
  | "paid"
  | "expired"
  | "cleared"
  | "already_premium"
  | "unresolved";

export type PaymentReconciliationReason =
  | "tracked_attempt"
  | "tracked_pending_snapshot"
  | "provider_reference_match_without_plan"
  | "missing_attempt"
  | "missing_plan"
  | "user_mismatch"
  | "provider_reference_mismatch"
  | "invalid_paid_status"
  | "pending"
  | "cleared"
  | "expired"
  | "already_premium";

export interface PaymentVerificationResponse {
  isPaid: boolean;
  status: string;
  paymentId: string;
  plan?: CheckoutPlan;
  reconciliationStatus: PaymentReconciliationStatus;
  reconciliationReason: PaymentReconciliationReason;
  needsManualReconciliation?: boolean;
}

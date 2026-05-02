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
  card?: CheckoutCardInput;
  cardHolderInfo?: CheckoutCardHolderInfoInput;
}

export interface PendingCheckoutPayment {
  paymentId: string;
  paymentMethod: CheckoutPaymentMethod;
  status: string;
  creditCardMode?: CreditCardCheckoutMode;
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
  alreadyPremium?: boolean;
  hasPendingPayment?: boolean;
  reusedExisting?: boolean;
  expired?: boolean;
  message?: string;
  paymentId?: string;
  paymentMethod?: CheckoutPaymentMethod;
  creditCardMode?: CreditCardCheckoutMode;
  status?: string;
  invoiceUrl?: string;
  requiresRedirect?: boolean;
  qrCode?: string;
  qrCodePayload?: string;
  expiresAt?: string;
  dueDate?: string;
  plan?: CheckoutPlan;
}

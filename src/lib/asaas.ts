import type {
  AsaasPaymentStatus,
  CheckoutCardHolderInfoInput,
  CheckoutCardInput,
  CreditCardCheckoutMode,
} from "@/lib/payments/types";

const DEFAULT_ASAAS_BASE_URL = "https://api-sandbox.asaas.com/v3";

export class AsaasApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "AsaasApiError";
    this.status = status;
    this.details = details;
  }
}

export const ASAAS_API_URL =
  process.env.ASAAS_BASE_URL ||
  process.env.NEXT_PUBLIC_ASAAS_API_URL ||
  DEFAULT_ASAAS_BASE_URL;

function getAsaasApiKey() {
  const key = process.env.ASAAS_API_KEY;

  if (!key) {
    throw new Error("ASAAS_API_KEY nao configurada.");
  }

  return key.replace(/'/g, "");
}

function getHeaders() {
  return {
    "Content-Type": "application/json",
    accept: "application/json",
    access_token: getAsaasApiKey(),
  };
}

async function safeJsonParse(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function normalizeAsaasErrorMessage(operation: string, details: unknown) {
  if (
    details &&
    typeof details === "object" &&
    "errors" in details &&
    Array.isArray((details as { errors?: Array<{ description?: string }> }).errors)
  ) {
    const firstError = (details as { errors?: Array<{ description?: string }> }).errors?.[0];
    if (firstError?.description) {
      return `${operation}: ${firstError.description}`;
    }
  }

  return `${operation}: erro retornado pela Asaas`;
}

async function asaasFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${ASAAS_API_URL}${path}`, {
    ...init,
    headers: {
      ...getHeaders(),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const payload = await safeJsonParse(response);

  if (!response.ok) {
    throw new AsaasApiError(
      normalizeAsaasErrorMessage(`Asaas ${init?.method || "GET"} ${path}`, payload),
      response.status,
      payload
    );
  }

  return payload as T;
}

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj?: string;
}

interface AsaasListResponse<T> {
  data: T[];
}

export async function createOrGetCustomer(name: string, email: string, cpfCnpj?: string): Promise<AsaasCustomer> {
  const search = await asaasFetch<AsaasListResponse<AsaasCustomer>>(
    `/customers?email=${encodeURIComponent(email)}`
  );

  if (search.data.length > 0) {
    return search.data[0];
  }

  return asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      cpfCnpj,
    }),
  });
}

export interface AsaasPayment {
  id: string;
  customer: string;
  value: number;
  netValue: number;
  billingType: "PIX" | "CREDIT_CARD";
  status: AsaasPaymentStatus | string;
  dueDate: string;
  invoiceUrl?: string;
  invoiceNumber?: string;
  externalReference?: string;
  creditCardToken?: string;
  pixTransaction?: string;
  description?: string;
}

interface AsaasCreatePaymentRequest {
  customer: string;
  billingType: "PIX" | "CREDIT_CARD";
  value: number;
  dueDate: string;
  description: string;
  externalReference: string;
  creditCard?: CheckoutCardInput;
  creditCardToken?: string;
  creditCardHolderInfo?: CheckoutCardHolderInfoInput;
  remoteIp?: string;
}

function normalizeDueDateForPix() {
  return new Date().toISOString().split("T")[0];
}

export async function createPixPayment(
  customerId: string,
  value: number,
  description: string,
  externalReference: string
): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>("/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: customerId,
      billingType: "PIX",
      value,
      dueDate: normalizeDueDateForPix(),
      description,
      externalReference,
    } satisfies AsaasCreatePaymentRequest),
  });
}

export async function createCreditCardPayment(input: {
  customer: string;
  value: number;
  description: string;
  dueDate: string;
  externalReference: string;
  creditCardMode: CreditCardCheckoutMode;
  creditCard?: CheckoutCardInput;
  creditCardToken?: string;
  creditCardHolderInfo?: CheckoutCardHolderInfoInput;
  remoteIp?: string;
}): Promise<AsaasPayment> {
  const payload: AsaasCreatePaymentRequest = {
    customer: input.customer,
    billingType: "CREDIT_CARD",
    value: input.value,
    dueDate: input.dueDate,
    description: input.description,
    externalReference: input.externalReference,
  };

  if (input.creditCardMode === "DIRECT") {
    if (input.creditCardToken) {
      payload.creditCardToken = input.creditCardToken;
    } else if (input.creditCard) {
      payload.creditCard = input.creditCard;
    }

    if (input.creditCardHolderInfo) {
      payload.creditCardHolderInfo = input.creditCardHolderInfo;
    }

    payload.remoteIp = input.remoteIp;
  }

  return asaasFetch<AsaasPayment>("/payments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getPayment(paymentId: string): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>(`/payments/${paymentId}`);
}

export async function getPixQrCode(paymentId: string): Promise<{ encodedImage: string; payload: string }> {
  return asaasFetch<{ encodedImage: string; payload: string }>(`/payments/${paymentId}/pixQrCode`);
}

export function isPaymentPaid(status: string) {
  return status === "RECEIVED" || status === "CONFIRMED" || status === "RECEIVED_IN_CASH";
}

export async function tokenizeCreditCard(input: {
  customer: Pick<AsaasCustomer, "name" | "email" | "cpfCnpj">;
  creditCard: CheckoutCardInput;
  creditCardHolderInfo: CheckoutCardHolderInfoInput;
  remoteIp: string;
}): Promise<{ creditCardToken: string }> {
  return asaasFetch<{ creditCardToken: string }>("/creditCard/tokenizeCreditCard", {
    method: "POST",
    body: JSON.stringify({
      customer: input.customer,
      creditCard: input.creditCard,
      creditCardHolderInfo: input.creditCardHolderInfo,
      remoteIp: input.remoteIp,
    }),
  });
}

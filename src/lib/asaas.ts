import type {
  AsaasPaymentStatus,
} from "@/lib/payments/types";
import { assertPaymentsEnabled } from "@/lib/payments/config";

const ASAAS_PRODUCTION_BASE_URL = "https://api.asaas.com/v3";
const ASAAS_SANDBOX_BASE_URL = "https://api-sandbox.asaas.com/v3";
const ASAAS_REQUEST_TIMEOUT_MS = 15_000;
const ASAAS_USER_AGENT = "BasedSpeak/0.1 (+https://basedspeak.com)";

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

export class AsaasTransportError extends Error {
  cause: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "AsaasTransportError";
    this.cause = cause;
  }
}

function getAsaasApiUrl() {
  const configuredUrl = process.env.ASAAS_BASE_URL?.trim().replace(/\/$/, "");

  if (!configuredUrl) {
    throw new Error("ASAAS_BASE_URL nao configurada.");
  }

  if (![ASAAS_PRODUCTION_BASE_URL, ASAAS_SANDBOX_BASE_URL].includes(configuredUrl)) {
    throw new Error("ASAAS_BASE_URL invalida. Use apenas a URL oficial da Asaas.");
  }

  if (
    process.env.NODE_ENV === "production" &&
    configuredUrl === ASAAS_SANDBOX_BASE_URL &&
    process.env.ASAAS_ALLOW_SANDBOX_IN_PRODUCTION !== "true"
  ) {
    throw new Error("O sandbox da Asaas esta bloqueado em producao.");
  }

  return configuredUrl;
}

export function isAsaasSandboxEnvironment() {
  return getAsaasApiUrl() === ASAAS_SANDBOX_BASE_URL;
}

function getAsaasApiKey(apiUrl: string) {
  const rawKey = process.env.ASAAS_API_KEY;

  if (!rawKey) {
    throw new Error("ASAAS_API_KEY nao configurada.");
  }

  const key = rawKey.trim().replace(/^['"]|['"]$/g, "");
  const expectedPrefix = apiUrl === ASAAS_SANDBOX_BASE_URL ? "$aact_hmlg_" : "$aact_prod_";

  if (!key.startsWith(expectedPrefix)) {
    throw new Error(
      apiUrl === ASAAS_SANDBOX_BASE_URL
        ? "ASAAS_API_KEY nao pertence ao ambiente sandbox."
        : "ASAAS_API_KEY nao pertence ao ambiente de producao."
    );
  }

  return key;
}

function getHeaders(apiUrl: string) {
  return {
    "Content-Type": "application/json",
    accept: "application/json",
    "User-Agent": process.env.ASAAS_USER_AGENT?.trim() || ASAAS_USER_AGENT,
    access_token: getAsaasApiKey(apiUrl),
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
  assertPaymentsEnabled();
  const apiUrl = getAsaasApiUrl();
  const headers = {
    ...getHeaders(apiUrl),
    ...(init?.headers || {}),
  };
  let response: Response;

  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers,
      signal: init?.signal ?? AbortSignal.timeout(ASAAS_REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error) {
    throw new AsaasTransportError(`Asaas ${init?.method || "GET"} ${path}: falha de transporte.`, error);
  }

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
  value?: number;
  installmentCount?: number;
  totalValue?: number;
  dueDate: string;
  description: string;
  externalReference: string;
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
  installmentCount?: number;
}): Promise<AsaasPayment> {
  const payload: AsaasCreatePaymentRequest = {
    customer: input.customer,
    billingType: "CREDIT_CARD",
    dueDate: input.dueDate,
    description: input.description,
    externalReference: input.externalReference,
  };

  if (input.installmentCount && input.installmentCount > 1) {
    payload.installmentCount = input.installmentCount;
    payload.totalValue = input.value;
  } else {
    payload.value = input.value;
  }

  return asaasFetch<AsaasPayment>("/payments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getPayment(paymentId: string): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>(`/payments/${paymentId}`);
}

export async function getPixQrCode(paymentId: string): Promise<{
  encodedImage: string;
  payload: string;
  expirationDate: string;
}> {
  return asaasFetch<{ encodedImage: string; payload: string; expirationDate: string }>(
    `/payments/${paymentId}/pixQrCode`
  );
}

export function isPaymentPaid(status: string) {
  return status === "RECEIVED" || status === "CONFIRMED" || status === "RECEIVED_IN_CASH";
}

import { NextResponse } from "next/server";
import { RequestAuthError, requireAuthenticatedUser } from "@/server/auth/request-auth";
import { AsaasApiError, AsaasTransportError } from "@/server/integrations/asaas";
import { createCheckout, getCheckoutState } from "@/server/payments/service";
import { PaymentsDisabledError } from "@/server/payments/config";
import type { CheckoutPlan } from "@/server/payments/types";
import { consumeRateLimit, RateLimitError, rateLimitErrorResponse } from "@/server/http/rate-limit";
import {
  assertOnlyKeys,
  readJsonObject,
  RequestPayloadError,
  requestPayloadErrorResponse,
} from "@/server/http/request";

export const dynamic = "force-dynamic";
const MAX_CHECKOUT_BODY_BYTES = 8 * 1_024;

function getErrorResponse(error: unknown) {
  if (error instanceof PaymentsDisabledError) {
    return NextResponse.json({ error: error.code }, { status: error.status });
  }

  if (error instanceof AsaasApiError) {
    return NextResponse.json(
      {
        error: error.message,
        provider: "asaas",
        providerStatus: error.status,
      },
      { status: error.status >= 400 && error.status < 500 ? 400 : 502 }
    );
  }

  if (error instanceof AsaasTransportError) {
    return NextResponse.json({ error: error.message, provider: "asaas" }, { status: 502 });
  }

  if (error instanceof RateLimitError) {
    return rateLimitErrorResponse(error);
  }

  if (error instanceof RequestPayloadError) {
    return requestPayloadErrorResponse(error);
  }

  if (error instanceof RequestAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  const message = error instanceof Error ? error.message : "Unexpected checkout error";
  const status =
    message === "FORBIDDEN_PAYMENT_ACCESS"
      ? 403
      : message === "INVALID_CHECKOUT_PLAN" || message === "SPECIALTY_CHECKOUT_DISABLED"
        ? 400
        : message === "CHECKOUT_IN_PROGRESS" ||
            message === "CHECKOUT_ALREADY_TRACKED" ||
            message === "CHECKOUT_RECONCILIATION_REQUIRED"
          ? 409
          : 500;
  return NextResponse.json({ error: message }, { status });
}

function parseCheckoutPlan(value: unknown): CheckoutPlan {
  if (value === undefined || value === null || value === "lifetime") {
    return "lifetime";
  }

  if (value === "specialty") {
    return "specialty";
  }

  throw new Error("INVALID_CHECKOUT_PLAN");
}

function parseCheckoutPaymentMethod(value: unknown) {
  if (value === undefined || value === null || value === "PIX") {
    return "PIX" as const;
  }

  if (value === "CREDIT_CARD") {
    return "CREDIT_CARD" as const;
  }

  throw new RequestPayloadError("INVALID_PAYMENT_METHOD");
}

function parseInstallmentCount(value: unknown) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 12) {
    throw new RequestPayloadError("INVALID_INSTALLMENT_COUNT");
  }

  return value;
}

export async function GET(req: Request) {
  try {
    const authUser = await requireAuthenticatedUser(req);
    await consumeRateLimit({
      namespace: "checkout-state",
      identifier: authUser.uid,
      limit: 60,
      windowMs: 60_000,
    });
    const { searchParams } = new URL(req.url);
    const plan = parseCheckoutPlan(searchParams.get("plan"));
    const checkoutState = await getCheckoutState(authUser.uid, plan);
    return NextResponse.json(checkoutState);
  } catch (error: unknown) {
    console.error("Checkout state error:", error);
    return getErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const authUser = await requireAuthenticatedUser(req);
    await consumeRateLimit({
      namespace: "checkout-create",
      identifier: authUser.uid,
      limit: 10,
      windowMs: 10 * 60_000,
    });
    const payload = await readJsonObject(req, MAX_CHECKOUT_BODY_BYTES);
    assertOnlyKeys(payload, [
      "name",
      "email",
      "cpfCnpj",
      "plan",
      "paymentMethod",
      "creditCardMode",
      "installmentCount",
    ]);

    if (
      typeof payload.name !== "string" ||
      !payload.name.trim() ||
      payload.name.length > 200 ||
      typeof payload.cpfCnpj !== "string" ||
      !payload.cpfCnpj.trim() ||
      payload.cpfCnpj.length > 20
    ) {
      return NextResponse.json({ error: "Missing required checkout fields." }, { status: 400 });
    }

    if (!authUser.email) {
      throw new RequestPayloadError("VERIFIED_EMAIL_REQUIRED");
    }

    const paymentMethod = parseCheckoutPaymentMethod(payload.paymentMethod);
    if (payload.creditCardMode !== undefined && payload.creditCardMode !== "INVOICE_URL") {
      throw new RequestPayloadError("DIRECT_CARD_NOT_ALLOWED");
    }

    const checkoutResponse = await createCheckout({
      name: payload.name.trim(),
      email: authUser.email,
      cpfCnpj: payload.cpfCnpj.trim(),
      plan: parseCheckoutPlan(payload.plan),
      paymentMethod,
      creditCardMode: paymentMethod === "CREDIT_CARD" ? "INVOICE_URL" : undefined,
      installmentCount: parseInstallmentCount(payload.installmentCount),
      userId: authUser.uid,
      localCustomerId: authUser.uid,
    });
    return NextResponse.json(checkoutResponse);
  } catch (error: unknown) {
    console.error("Checkout creation error:", error);
    return getErrorResponse(error);
  }
}

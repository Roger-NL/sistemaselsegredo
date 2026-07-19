import { NextResponse } from "next/server";
import { RequestAuthError, requireAuthenticatedUser } from "@/lib/auth/request-auth";
import { AsaasApiError, AsaasTransportError } from "@/lib/asaas";
import { verifyPaymentStatus } from "@/lib/payments/service";
import { PaymentsDisabledError } from "@/lib/payments/config";
import { consumeRateLimit, RateLimitError, rateLimitErrorResponse } from "@/lib/server/rate-limit";
import {
  assertOnlyKeys,
  readJsonObject,
  RequestPayloadError,
  requestPayloadErrorResponse,
} from "@/lib/server/request";
import type { PaymentReconciliationState, VerifyPaymentApiResponse } from "@/features/payment/payment-mode";

export const dynamic = "force-dynamic";
const MAX_VERIFY_PAYMENT_BODY_BYTES = 2 * 1_024;

function isKnownReconciliationState(value: unknown): value is PaymentReconciliationState {
  return (
    value === "paid" ||
    value === "pending" ||
    value === "manual-reconciliation" ||
    value === "unresolved" ||
    value === "error"
  );
}

function normalizeVerificationResponse(verification: unknown): VerifyPaymentApiResponse {
  const payload = verification && typeof verification === "object" ? (verification as Record<string, unknown>) : {};
  const isPaid = payload.isPaid === true;
  const status = typeof payload.status === "string" ? payload.status : null;
  const message = typeof payload.message === "string" ? payload.message : undefined;
  const reconciliationStatus =
    typeof payload.reconciliationStatus === "string" ? payload.reconciliationStatus : undefined;

  let reconciliationState: PaymentReconciliationState = "pending";

  if (isPaid || reconciliationStatus === "paid") {
    reconciliationState = "paid";
  } else if (
    payload.needsManualReconciliation === true ||
    payload.requiresManualReconciliation === true ||
    payload.requiresManualAction === true
  ) {
    reconciliationState = "manual-reconciliation";
  } else if (reconciliationStatus === "unresolved") {
    reconciliationState = "unresolved";
  } else if (isKnownReconciliationState(payload.reconciliationState)) {
    reconciliationState = payload.reconciliationState;
  } else if (payload.unresolved === true || status === "UNRESOLVED") {
    reconciliationState = "unresolved";
  }

  const shouldStopPolling =
    typeof payload.shouldStopPolling === "boolean"
      ? payload.shouldStopPolling
      : reconciliationState === "manual-reconciliation" || reconciliationState === "unresolved";

  return {
    success: payload.success === false ? false : true,
    isPaid,
    status,
    reconciliationState,
    message,
    shouldStopPolling,
  };
}

export async function POST(req: Request) {
  try {
    const authUser = await requireAuthenticatedUser(req);
    await consumeRateLimit({
      namespace: "verify-payment",
      identifier: authUser.uid,
      limit: 60,
      windowMs: 60_000,
    });
    const payload = await readJsonObject(req, MAX_VERIFY_PAYMENT_BODY_BYTES);
    assertOnlyKeys(payload, ["paymentId"]);
    const paymentId = typeof payload.paymentId === "string" ? payload.paymentId.trim() : "";

    if (!paymentId || paymentId.length > 200) {
      return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
    }

    const verification = await verifyPaymentStatus(authUser.uid, paymentId);
    return NextResponse.json(normalizeVerificationResponse(verification));
  } catch (error: unknown) {
    console.error("[verify-payment] Error:", error);

    if (error instanceof PaymentsDisabledError) {
      return NextResponse.json(
        {
          success: false,
          error: error.code,
          isPaid: false,
          status: null,
          reconciliationState: "error",
          message: "Os pagamentos estao desativados durante o beta gratuito.",
          shouldStopPolling: true,
        } satisfies VerifyPaymentApiResponse & { error: string },
        { status: error.status }
      );
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
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          isPaid: false,
          status: null,
          reconciliationState: "error",
          message: "Nao foi possivel consultar o estado desta cobranca agora.",
          shouldStopPolling: false,
        } satisfies VerifyPaymentApiResponse & { error: string },
        { status: 502 }
      );
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

    const message = error instanceof Error ? error.message : "Unexpected verify payment error";
    const status = message === "FORBIDDEN_PAYMENT_ACCESS" ? 403 : 500;
    const response: VerifyPaymentApiResponse & { error: string } = {
      success: false,
      error: message,
      isPaid: false,
      status: null,
      reconciliationState: "error",
      message:
        status === 403
          ? "Essa cobranca nao pertence a esta conta."
          : "Nao foi possivel consultar o estado desta cobranca agora.",
      shouldStopPolling: false,
    };

    return NextResponse.json(response, { status });
  }
}

import { NextResponse } from "next/server";
import { RequestAuthError, requireAuthenticatedUser } from "@/lib/auth/request-auth";
import { AsaasApiError } from "@/lib/asaas";
import { verifyPaymentStatus } from "@/lib/payments/service";
import type { PaymentReconciliationState, VerifyPaymentApiResponse } from "@/features/payment/payment-mode";

export const dynamic = "force-dynamic";

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

  let reconciliationState: PaymentReconciliationState = "pending";

  if (isKnownReconciliationState(payload.reconciliationState)) {
    reconciliationState = payload.reconciliationState;
  } else if (payload.requiresManualReconciliation === true || payload.requiresManualAction === true) {
    reconciliationState = "manual-reconciliation";
  } else if (payload.unresolved === true || status === "UNRESOLVED") {
    reconciliationState = "unresolved";
  } else if (isPaid) {
    reconciliationState = "paid";
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
    const { paymentId } = (await req.json()) as { paymentId?: string; userId?: string };

    if (!paymentId) {
      return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
    }

    const verification = await verifyPaymentStatus(authUser.uid, paymentId);
    return NextResponse.json(normalizeVerificationResponse(verification));
  } catch (error: unknown) {
    console.error("[verify-payment] Error:", error);

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

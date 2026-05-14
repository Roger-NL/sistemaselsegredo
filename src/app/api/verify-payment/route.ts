import { NextResponse } from "next/server";
import { RequestAuthError, requireAuthenticatedUser } from "@/lib/auth/request-auth";
import { AsaasApiError } from "@/lib/asaas";
import { verifyPaymentStatus } from "@/lib/payments/service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const authUser = await requireAuthenticatedUser(req);
    const { paymentId } = (await req.json()) as { paymentId?: string; userId?: string };

    if (!paymentId) {
      return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
    }

    const verification = await verifyPaymentStatus(authUser.uid, paymentId);
    return NextResponse.json(verification);
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
    return NextResponse.json({ error: message }, { status });
  }
}

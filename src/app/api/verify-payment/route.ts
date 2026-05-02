import { NextResponse } from "next/server";
import { AsaasApiError } from "@/lib/asaas";
import { verifyPaymentStatus } from "@/lib/payments/service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { paymentId, userId } = (await req.json()) as { paymentId?: string; userId?: string };

    if (!paymentId || !userId) {
      return NextResponse.json({ error: "Missing paymentId or userId" }, { status: 400 });
    }

    const verification = await verifyPaymentStatus(userId, paymentId);
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

    const message = error instanceof Error ? error.message : "Unexpected verify payment error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

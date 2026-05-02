import { NextResponse } from "next/server";
import { AsaasApiError } from "@/lib/asaas";
import { createCheckout } from "@/lib/payments/service";
import type { CheckoutRequestInput } from "@/lib/payments/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as CheckoutRequestInput;

    if (!payload.name || !payload.email || !payload.cpfCnpj || !payload.userId) {
      return NextResponse.json({ error: "Missing required checkout fields." }, { status: 400 });
    }

    const response = await createCheckout({
      ...payload,
      paymentMethod: "CREDIT_CARD",
      creditCardMode: "DIRECT",
    });

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Direct credit card checkout error:", error);

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

    const message = error instanceof Error ? error.message : "Unexpected direct credit card checkout error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

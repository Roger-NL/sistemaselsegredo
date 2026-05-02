import { NextResponse } from "next/server";
import { AsaasApiError } from "@/lib/asaas";
import { createCreditCardToken } from "@/lib/payments/service";
import type { CheckoutRequestInput } from "@/lib/payments/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as CheckoutRequestInput;

    if (!payload.name || !payload.email || !payload.cpfCnpj || !payload.card) {
      return NextResponse.json({ error: "Missing card tokenization fields." }, { status: 400 });
    }

    const token = await createCreditCardToken(payload);
    return NextResponse.json({ success: true, ...token });
  } catch (error: unknown) {
    console.error("Credit card tokenization error:", error);

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

    const message = error instanceof Error ? error.message : "Unexpected credit card tokenization error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

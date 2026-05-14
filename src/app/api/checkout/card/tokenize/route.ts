import { NextResponse } from "next/server";
import { RequestAuthError, requireAuthenticatedUser } from "@/lib/auth/request-auth";
import { AsaasApiError } from "@/lib/asaas";
import { createCreditCardToken } from "@/lib/payments/service";
import type { CheckoutRequestInput } from "@/lib/payments/types";

export const dynamic = "force-dynamic";

function resolveRequestIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "127.0.0.1";
}

export async function POST(req: Request) {
  try {
    const authUser = await requireAuthenticatedUser(req);
    const payload = (await req.json()) as CheckoutRequestInput;

    if (!payload.name || !payload.email || !payload.cpfCnpj || !payload.card) {
      return NextResponse.json({ error: "Missing card tokenization fields." }, { status: 400 });
    }

    const token = await createCreditCardToken({
      ...payload,
      userId: authUser.uid,
      localCustomerId: authUser.uid,
      remoteIp: payload.remoteIp || resolveRequestIp(req),
    });
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

    if (error instanceof RequestAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "Unexpected credit card tokenization error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

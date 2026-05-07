import { NextResponse } from "next/server";
import { AsaasApiError } from "@/lib/asaas";
import { createCheckout, getCheckoutState } from "@/lib/payments/service";
import type { CheckoutPlan, CheckoutRequestInput } from "@/lib/payments/types";

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

function getErrorResponse(error: unknown) {
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

  const message = error instanceof Error ? error.message : "Unexpected checkout error";
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const plan = (searchParams.get("plan") as CheckoutPlan | null) ?? "lifetime";

    if (!userId) {
      return NextResponse.json({ error: "Missing userId." }, { status: 400 });
    }

    const checkoutState = await getCheckoutState(userId, plan);
    return NextResponse.json(checkoutState);
  } catch (error: unknown) {
    console.error("Checkout state error:", error);
    return getErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as CheckoutRequestInput;

    if (!payload.name || !payload.email || !payload.cpfCnpj || !payload.userId) {
      return NextResponse.json({ error: "Missing required checkout fields." }, { status: 400 });
    }

    const checkoutResponse = await createCheckout({
      ...payload,
      remoteIp: payload.remoteIp || (payload.creditCardMode === "DIRECT" ? resolveRequestIp(req) : payload.remoteIp),
    });
    return NextResponse.json(checkoutResponse);
  } catch (error: unknown) {
    console.error("Checkout creation error:", error);
    return getErrorResponse(error);
  }
}

import { NextResponse } from "next/server";
import { handleAsaasWebhook } from "@/lib/payments/service";

export const dynamic = "force-dynamic";

function isWebhookAuthorized(req: Request) {
  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;

  if (!expectedToken) {
    return true;
  }

  const url = new URL(req.url);
  const queryToken = url.searchParams.get("token");
  const headerToken = req.headers.get("x-asaas-webhook-token");

  return queryToken === expectedToken || headerToken === expectedToken;
}

export async function POST(req: Request) {
  try {
    if (!isWebhookAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized webhook request." }, { status: 401 });
    }

    const payload = await req.json();
    const result = await handleAsaasWebhook(payload);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Asaas webhook error:", error);
    const message = error instanceof Error ? error.message : "Unexpected webhook error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

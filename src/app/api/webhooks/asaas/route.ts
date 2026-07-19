import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { handleAsaasWebhook } from "@/lib/payments/service";
import {
  readJsonObject,
  RequestPayloadError,
  requestPayloadErrorResponse,
} from "@/lib/server/request";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const MAX_WEBHOOK_BODY_BYTES = 128 * 1_024;

function tokensMatch(receivedToken: string, expectedToken: string) {
  const received = Buffer.from(receivedToken, "utf8");
  const expected = Buffer.from(expectedToken, "utf8");

  return received.length === expected.length && timingSafeEqual(received, expected);
}

function isWebhookAuthorized(req: Request) {
  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN?.trim();

  if (!expectedToken) {
    return false;
  }

  const headerToken = req.headers.get("asaas-access-token")?.trim();

  return Boolean(headerToken && tokensMatch(headerToken, expectedToken));
}

export async function POST(req: Request) {
  try {
    if (!isWebhookAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized webhook request." }, { status: 401 });
    }

    const payload = await readJsonObject(req, MAX_WEBHOOK_BODY_BYTES);
    const result = await handleAsaasWebhook(payload);
    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof RequestPayloadError) {
      return requestPayloadErrorResponse(error);
    }
    const message = error instanceof Error ? error.message : "Unexpected webhook error";
    const status = message === "INVALID_ASAAS_WEBHOOK_PAYLOAD" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

import { NextResponse } from "next/server";
import { audio } from "@/features/demo/content/media";
import { assertOnlyKeys, getRequestIp, readJsonObject, RequestPayloadError, requestPayloadErrorResponse } from "@/server/http/request";
import { consumeRateLimit, RateLimitError, rateLimitErrorResponse } from "@/server/http/rate-limit";
import { readCachedSpeech, resolveCachedSpeech, speechParameters } from "@/server/speech/runtime";
import { SpeechUnavailableError } from "@/server/speech/cache";
import type { AudioId } from "@/features/demo/model/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const headers = { "Cache-Control": "no-store" };
  try {
    if (req.headers.get("origin") !== new URL(req.url).origin || req.headers.get("sec-fetch-site") === "cross-site") {
      return NextResponse.json({ error: "SAME_ORIGIN_REQUIRED" }, { status: 403, headers });
    }
    const payload = await readJsonObject(req, 1024);
    assertOnlyKeys(payload, ["audioId"]);
    if (typeof payload.audioId !== "string" || !Object.hasOwn(audio, payload.audioId)) throw new RequestPayloadError("UNKNOWN_AUDIO_ID");
    const parameters = speechParameters(); // Fail before any database/provider call when not configured.
    const text = audio[payload.audioId as AudioId].text;
    // Only the read-only hit lookup runs alongside admission. Generation must wait for admission.
    const [, cached] = await Promise.all([
      consumeRateLimit({ namespace: "demo-audio-ip", identifier: getRequestIp(req), limit: 120, windowMs: 60_000 }),
      readCachedSpeech(text, parameters),
    ]);
    const result = cached ?? await resolveCachedSpeech(text, parameters);
    if (result.status === "pending") return NextResponse.json(result, { status: 202, headers: { ...headers, "Retry-After": String(result.retryAfter) } });
    return NextResponse.json({ status: "ready", key: result.key, audioUrl: result.url }, { headers });
  } catch (error) {
    if (error instanceof RequestPayloadError) return requestPayloadErrorResponse(error);
    if (error instanceof RateLimitError) return rateLimitErrorResponse(error);
    return NextResponse.json({ error: error instanceof SpeechUnavailableError ? error.code : "SPEECH_UNAVAILABLE" }, { status: 503, headers });
  }
}

import { NextResponse } from "next/server";
import { audio } from "@/features/demo/content/media";
import { assertOnlyKeys, readJsonObject, RequestPayloadError, requestPayloadErrorResponse } from "@/server/http/request";
import { speechPlaybackParameters } from "@/server/speech/parameters";
import { SpeechUnavailableError } from "@/server/speech/cache";
import type { AudioId } from "@/features/demo/model/types";
import { getPublishedAudioCatalog } from "@/server/speech/published";

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
    const parameters = speechPlaybackParameters();
    const published = getPublishedAudioCatalog(parameters, speechPlaybackParameters("you"))[payload.audioId as AudioId];
    // Public, already published media has no generation cost and needs no database admission.
    if (published) return NextResponse.json({ status: "ready", ...published }, { headers });
    // Listening is strictly read-only. A missing file must never spend provider credits.
    return NextResponse.json({ error: "AUDIO_NOT_PUBLISHED" }, { status: 503, headers });
  } catch (error) {
    if (error instanceof RequestPayloadError) return requestPayloadErrorResponse(error);
    return NextResponse.json({ error: error instanceof SpeechUnavailableError ? error.code : "SPEECH_UNAVAILABLE" }, { status: 503, headers });
  }
}

import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/server/firebase";
import { RequestAuthError, requireAuthenticatedUser } from "@/server/auth/request-auth";
import { buildStudyModuleKey } from "@/lib/study/stats";
import { PILLARS_CONTENT } from "@/data/pillars-content";
import { RateLimitError, consumeRateLimit, rateLimitErrorResponse } from "@/server/http/rate-limit";
import {
  RequestPayloadError,
  assertOnlyKeys,
  readJsonObject,
  requestPayloadErrorResponse,
} from "@/server/http/request";

const MAX_ACCEPTED_SECONDS = 60;
const MIN_ACCEPTED_SECONDS = 5;
const MAX_HEARTBEAT_BODY_BYTES = 2_048;
const MODULE_ID_PATTERN = /^[a-zA-Z0-9:_-]{1,100}$/;
const MODULES_BY_PILLAR = new Map(
  Object.entries(PILLARS_CONTENT).map(([pillarId, content]) => [
    Number(pillarId),
    new Set((content.modules ?? []).map((module) => module.id)),
  ])
);

export const runtime = "nodejs";

function normalizePositiveInt(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  const normalized = Math.trunc(parsed);
  return normalized > 0 ? normalized : null;
}

export async function POST(req: Request) {
  try {
    const principal = await requireAuthenticatedUser(req);
    const body = await readJsonObject(req, MAX_HEARTBEAT_BODY_BYTES);
    assertOnlyKeys(body, ["pillarId", "moduleId", "activeSeconds"]);

    const pillarId = normalizePositiveInt(body.pillarId);
    const activeSeconds = normalizePositiveInt(body.activeSeconds);

    if (!pillarId || pillarId > 9 || !activeSeconds) {
      return NextResponse.json({ error: "Missing study heartbeat fields." }, { status: 400 });
    }

    if (activeSeconds < MIN_ACCEPTED_SECONDS || activeSeconds > MAX_ACCEPTED_SECONDS) {
      return NextResponse.json({ error: "Invalid active study interval." }, { status: 400 });
    }

    if (body.moduleId !== undefined && (typeof body.moduleId !== "string" || !MODULE_ID_PATTERN.test(body.moduleId.trim()))) {
      throw new RequestPayloadError("INVALID_STUDY_MODULE");
    }
    const rawModuleId = typeof body.moduleId === "string" ? body.moduleId.trim() : "";
    if (rawModuleId && !MODULES_BY_PILLAR.get(pillarId)?.has(rawModuleId)) {
      throw new RequestPayloadError("INVALID_STUDY_MODULE");
    }

    await consumeRateLimit({
      namespace: "study-heartbeat-seconds",
      identifier: principal.uid,
      limit: 90,
      windowMs: 60 * 1_000,
      cost: activeSeconds,
    });

    const moduleId =
      rawModuleId.length > 0
        ? buildStudyModuleKey(pillarId, rawModuleId)
        : buildStudyModuleKey(pillarId);

    const userRef = getAdminDb().collection("users").doc(principal.uid);

    await getAdminDb().runTransaction(async (transaction) => {
      const userSnapshot = await transaction.get(userRef);
      if (!userSnapshot.exists) {
        throw new RequestPayloadError("USER_PROFILE_NOT_FOUND", 404);
      }
      const userData = userSnapshot.data() ?? {};
      const highestUnlockedPillar =
        typeof userData.progressSnapshot?.highestUnlockedPillar === "number"
          ? userData.progressSnapshot.highestUnlockedPillar
          : typeof userData.approvedPillar === "number"
            ? userData.approvedPillar
            : 1;
      if (principal.role !== "admin" && pillarId > highestUnlockedPillar) {
        throw new RequestPayloadError("STUDY_PILLAR_LOCKED", 403);
      }

      transaction.set(userRef, {
        studyStats: {
          totalActiveSeconds: FieldValue.increment(activeSeconds),
          byPillar: {
            [String(pillarId)]: FieldValue.increment(activeSeconds),
          },
          byModule: {
            [moduleId]: FieldValue.increment(activeSeconds),
          },
          lastStudiedAt: new Date().toISOString(),
        },
      }, { merge: true });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof RequestAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof RequestPayloadError) return requestPayloadErrorResponse(error);
    if (error instanceof RateLimitError) return rateLimitErrorResponse(error);

    console.error("Study heartbeat API error:", error);
    return NextResponse.json({ error: "Failed to record study time." }, { status: 500 });
  }
}

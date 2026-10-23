import { requireAdminPrincipal } from "@/server/auth/route-guards";
import { Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminDb } from "@/server/firebase";
import { RequestAuthError } from "@/server/auth/request-auth";
import {
  DEFAULT_INVITE_EXPIRY_DAYS,
  generateSecureInviteCode,
  getHashedInviteDocumentId,
  getInviteCodeLastFour,
  getMaskedInviteCode,
  hashInviteCode,
  INVITE_CODES_COLLECTION,
  timestampLikeToMillis,
} from "@/server/auth/invites";
import { RateLimitError, consumeRateLimit, rateLimitErrorResponse } from "@/server/http/rate-limit";
import {
  RequestPayloadError,
  assertOnlyKeys,
  readJsonObject,
  requestPayloadErrorResponse,
} from "@/server/http/request";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_GENERATION_BODY_BYTES = 1_024;
// Firestore accepts at most 500 writes in a single atomic batch. This is a
// per-request safety boundary, not a cap on the number of beta participants.
const MAX_BATCH_SIZE = 500;
const MAX_EXPIRY_DAYS = 365;



function parseInteger(value: unknown, fallback: number, min: number, max: number) {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new RequestPayloadError("INVALID_INVITE_GENERATION_OPTIONS");
  }
  return parsed;
}

function isoFromTimestampLike(value: unknown) {
  const millis = timestampLikeToMillis(value);
  return millis === null ? null : new Date(millis).toISOString();
}

function getErrorResponse(error: unknown) {
  if (error instanceof RequestAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof RequestPayloadError) return requestPayloadErrorResponse(error);
  if (error instanceof RateLimitError) return rateLimitErrorResponse(error);
  console.error("[api/admin/invite-codes] error", error);
  return NextResponse.json({ error: "INVITE_CODE_OPERATION_FAILED" }, { status: 500 });
}

export async function GET(req: Request) {
  try {
    await requireAdminPrincipal(req);


    const snapshot = await getAdminDb().collection(INVITE_CODES_COLLECTION)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();
    const nowMs = Date.now();
    const codes = snapshot.docs.map((document) => {
      const data = document.data();
      const legacyCode = typeof data.code === "string" ? data.code : null;
      const expiresAtMs = timestampLikeToMillis(data.expiresAt);
      const expired = data.status === "unused" && expiresAtMs !== null && expiresAtMs <= nowMs;

      return {
        id: document.id,
        displayCode: getMaskedInviteCode(
          typeof data.codeLast4 === "string"
            ? data.codeLast4
            : legacyCode
              ? getInviteCodeLastFour(legacyCode)
              : undefined
        ),
        code: null,
        copyable: false,
        status: expired ? "expired" : typeof data.status === "string" ? data.status : "unknown",
        createdAt: isoFromTimestampLike(data.createdAt),
        expiresAt: isoFromTimestampLike(data.expiresAt),
      };
    });

    return NextResponse.json({ codes }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return getErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const principal = await requireAdminPrincipal(req);

    await consumeRateLimit({
      namespace: "admin-invite-generation",
      identifier: principal.uid,
      limit: 10,
      windowMs: 10 * 60 * 1_000,
    });

    const body = await readJsonObject(req, MAX_GENERATION_BODY_BYTES);
    assertOnlyKeys(body, ["amount", "expiresInDays"]);
    const amount = parseInteger(body.amount, 1, 1, MAX_BATCH_SIZE);
    const expiresInDays = parseInteger(body.expiresInDays, DEFAULT_INVITE_EXPIRY_DAYS, 1, MAX_EXPIRY_DAYS);
    const createdAt = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(createdAt.toMillis() + expiresInDays * 24 * 60 * 60 * 1_000);
    const batch = getAdminDb().batch();
    const codes = Array.from({ length: amount }, () => {
      const code = generateSecureInviteCode();
      const codeHash = hashInviteCode(code);
      const ref = getAdminDb().collection(INVITE_CODES_COLLECTION).doc(getHashedInviteDocumentId(codeHash));
      batch.create(ref, {
        codeHash,
        codeLast4: getInviteCodeLastFour(code),
        status: "unused",
        createdAt,
        expiresAt,
        createdByUid: principal.uid,
        createdByEmail: principal.email,
        type: "premium_access",
        version: 2,
      });
      return {
        id: ref.id,
        code,
        displayCode: code,
        copyable: true,
        status: "unused",
        createdAt: createdAt.toDate().toISOString(),
        expiresAt: expiresAt.toDate().toISOString(),
      };
    });

    await batch.commit();
    return NextResponse.json(
      { codes },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return getErrorResponse(error);
  }
}

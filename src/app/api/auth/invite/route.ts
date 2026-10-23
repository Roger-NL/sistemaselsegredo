import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/server/firebase";
import { RequestAuthError, requireRequestPrincipal } from "@/server/auth/request-auth";
import { buildPremiumAccessUpdate } from "@/server/access/service";
import {
  getHashedInviteDocumentId,
  getInviteCodeLastFour,
  getMaskedInviteCode,
  hashInviteCode,
  INVITE_CODES_COLLECTION,
  normalizeSecureInviteCode,
  timestampLikeToMillis,
} from "@/server/auth/invites";
import { RateLimitError, consumeRateLimit, rateLimitErrorResponse } from "@/server/http/rate-limit";
import {
  RequestPayloadError,
  assertOnlyKeys,
  getRequestIp,
  readJsonObject,
  requestPayloadErrorResponse,
} from "@/server/http/request";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type InviteActivationPayload = {
  code?: string;
};

const MAX_INVITE_BODY_BYTES = 2_048;
const INVITE_ATTEMPT_WINDOW_MS = 15 * 60 * 1_000;

function getErrorResponse(error: unknown) {
  if (error instanceof RequestAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof RequestPayloadError) {
    return requestPayloadErrorResponse(error);
  }

  if (error instanceof RateLimitError) {
    return rateLimitErrorResponse(error);
  }

  if (error instanceof Error) {
    switch (error.message) {
      case "INVITE_CODE_REQUIRED":
        return NextResponse.json({ error: "Codigo de convite obrigatorio." }, { status: 400 });
      case "INVITE_CODE_INVALID":
      case "INVITE_CODE_EXPIRED":
        return NextResponse.json({ error: "Codigo invalido ou indisponivel." }, { status: 400 });
      case "USER_PROFILE_NOT_FOUND":
        return NextResponse.json({ error: "Perfil do usuario nao encontrado." }, { status: 404 });
      case "ALREADY_PREMIUM":
        return NextResponse.json({ error: "Este usuario ja possui acesso premium." }, { status: 409 });
      default:
        break;
    }
  }

  return NextResponse.json({ error: "Erro ao processar codigo de convite." }, { status: 500 });
}

export async function POST(req: Request) {
  try {
    const principal = await requireRequestPrincipal(req, {
      allowBearer: true,
      allowSessionCookie: true,
    });

    await Promise.all([
      consumeRateLimit({
        namespace: "invite-activation-user",
        identifier: principal.uid,
        limit: 8,
        windowMs: INVITE_ATTEMPT_WINDOW_MS,
      }),
      consumeRateLimit({
        namespace: "invite-activation-ip",
        identifier: getRequestIp(req),
        limit: 30,
        windowMs: INVITE_ATTEMPT_WINDOW_MS,
      }),
    ]);

    const payload = await readJsonObject(req, MAX_INVITE_BODY_BYTES) as InviteActivationPayload;
    assertOnlyKeys(payload as Record<string, unknown>, ["code"]);
    const normalizedCode = normalizeSecureInviteCode(typeof payload.code === "string" ? payload.code : "");

    if (!normalizedCode || normalizedCode.length > 64) {
      throw new Error("INVITE_CODE_REQUIRED");
    }

    const codeHash = hashInviteCode(normalizedCode);
    const inviteCodesRef = getAdminDb().collection(INVITE_CODES_COLLECTION);
    const hashedInviteRef = inviteCodesRef.doc(getHashedInviteDocumentId(codeHash));
    const usersRef = getAdminDb().collection("users");
    const userRef = usersRef.doc(principal.uid);

    const outcome = await getAdminDb().runTransaction(async (transaction) => {
      const hashedInviteSnapshot = await transaction.get(hashedInviteRef);
      let inviteDoc = hashedInviteSnapshot.exists ? hashedInviteSnapshot : null;

      if (!inviteDoc) {
        const legacySnapshot = await transaction.get(
          inviteCodesRef.where("code", "==", normalizedCode).limit(1)
        );
        inviteDoc = legacySnapshot.empty ? null : legacySnapshot.docs[0];
      }

      if (!inviteDoc) return { kind: "invalid" as const };

      const inviteData = inviteDoc.data() ?? {};
      if (inviteData.status !== "unused") return { kind: "invalid" as const };

      const expiresAtMs = timestampLikeToMillis(inviteData.expiresAt);
      if (expiresAtMs !== null && expiresAtMs <= Date.now()) {
        transaction.update(inviteDoc.ref, {
          status: "expired",
          expiredAt: new Date().toISOString(),
        });
        return { kind: "expired" as const };
      }

      const userSnapshot = await transaction.get(userRef);

      if (!userSnapshot.exists) {
        return { kind: "user_missing" as const };
      }

      const userData = userSnapshot.data() ?? {};

      if (userData.subscriptionStatus === "premium") {
        return { kind: "already_premium" as const };
      }

      const nowIso = new Date().toISOString();
      const lastFour = getInviteCodeLastFour(normalizedCode);
      const maskedCode = getMaskedInviteCode(lastFour);

      transaction.update(inviteDoc.ref, {
        status: "used",
        usedBy: principal.uid,
        usedAt: nowIso,
        codeHash,
        codeLast4: lastFour,
        ...(inviteData.code ? { code: FieldValue.delete(), migratedAt: nowIso } : {}),
      });

      transaction.update(
        userRef,
        buildPremiumAccessUpdate({
          inviteCodeUsed: maskedCode,
          activatedAtIso: nowIso,
        })
      );

      return { kind: "success" as const, maskedCode };
    });

    if (outcome.kind === "invalid") throw new Error("INVITE_CODE_INVALID");
    if (outcome.kind === "expired") throw new Error("INVITE_CODE_EXPIRED");
    if (outcome.kind === "user_missing") throw new Error("USER_PROFILE_NOT_FOUND");
    if (outcome.kind === "already_premium") throw new Error("ALREADY_PREMIUM");


    return NextResponse.json({
      success: true,
      inviteCode: outcome.maskedCode,
    });
  } catch (error) {
    console.error("[api/auth/invite] activation error", error);
    return getErrorResponse(error);
  }
}

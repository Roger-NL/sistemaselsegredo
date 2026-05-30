import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { RequestAuthError, requireRequestPrincipal } from "@/lib/auth/request-auth";
import {
  buildPremiumAccessUpdate,
  buildStoredProgressSnapshot,
  deriveLegacyApprovedPillar,
  normalizeInviteCode,
  type WriterExamStatus,
  type WriterLiveSessionStatus,
} from "@/lib/auth/premium-access";

export const dynamic = "force-dynamic";

type InviteActivationPayload = {
  code?: string;
};

async function getLatestExamStatus(userId: string, pillarId: number): Promise<WriterExamStatus> {
  const snapshot = await adminDb
    .collection("pillar_exams")
    .where("userId", "==", userId)
    .where("pillarId", "==", pillarId)
    .get();

  if (snapshot.empty) {
    return "not_started";
  }

  const exams = snapshot.docs
    .map((doc) => doc.data() as { status?: WriterExamStatus; createdAt?: { toMillis?: () => number } | null })
    .sort((left, right) => {
      const leftTime = left.createdAt?.toMillis?.() ?? 0;
      const rightTime = right.createdAt?.toMillis?.() ?? 0;
      return rightTime - leftTime;
    });

  return exams[0]?.status ?? "not_started";
}

async function recomputeInviteProgressSnapshot(userId: string) {
  const userRef = adminDb.collection("users").doc(userId);
  const userSnapshot = await userRef.get();
  if (!userSnapshot.exists) {
    return;
  }

  const userData = userSnapshot.data() as {
    subscriptionStatus?: string;
    completedPillarModules?: string[];
    localPillarStatus?: Record<string, string>;
    chosenSpecialization?: string | null;
    completedSpecializations?: string[];
    approvedPillar?: number;
  };

  const [pillar1ExamStatus, pillar2ExamStatus, liveSessionSnapshot] = await Promise.all([
    getLatestExamStatus(userId, 1),
    getLatestExamStatus(userId, 2),
    adminDb.collection("live_sessions").doc(`${userId}_p2`).get(),
  ]);

  const snapshot = buildStoredProgressSnapshot({
    subscriptionStatus: userData.subscriptionStatus,
    completedPillarModules: userData.completedPillarModules,
    localPillarStatus: userData.localPillarStatus,
    chosenSpecialization: userData.chosenSpecialization,
    completedSpecializations: userData.completedSpecializations,
    pillar1ExamStatus,
    pillar2ExamStatus,
    pillar2LiveSessionStatus: (
      liveSessionSnapshot.exists
        ? (liveSessionSnapshot.data()?.status as WriterLiveSessionStatus | undefined)
        : "not_created"
    ),
    currentApprovedPillar: typeof userData.approvedPillar === "number" ? userData.approvedPillar : 1,
  });

  await userRef.set(
    {
      progressSnapshot: snapshot,
      approvedPillar: deriveLegacyApprovedPillar(snapshot),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

function getErrorResponse(error: unknown) {
  if (error instanceof RequestAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof Error) {
    switch (error.message) {
      case "INVITE_CODE_REQUIRED":
        return NextResponse.json({ error: "Codigo de convite obrigatorio." }, { status: 400 });
      case "INVITE_CODE_INVALID":
        return NextResponse.json({ error: "Codigo invalido ou ja utilizado." }, { status: 404 });
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
      allowLegacyCookie: false,
    });

    const payload = (await req.json().catch(() => ({}))) as InviteActivationPayload;
    const normalizedCode = normalizeInviteCode(payload.code ?? "");

    if (!normalizedCode) {
      throw new Error("INVITE_CODE_REQUIRED");
    }

    const inviteCodesRef = adminDb.collection("invite_codes");
    const usersRef = adminDb.collection("users");
    const userRef = usersRef.doc(principal.uid);

    await adminDb.runTransaction(async (transaction) => {
      const inviteSnapshot = await transaction.get(
        inviteCodesRef
          .where("code", "==", normalizedCode)
          .where("status", "==", "unused")
          .limit(1)
      );

      if (inviteSnapshot.empty) {
        throw new Error("INVITE_CODE_INVALID");
      }

      const userSnapshot = await transaction.get(userRef);

      if (!userSnapshot.exists) {
        throw new Error("USER_PROFILE_NOT_FOUND");
      }

      const userData = userSnapshot.data() ?? {};
      const currentApprovedPillar =
        typeof userData.approvedPillar === "number" ? userData.approvedPillar : 1;

      if (userData.subscriptionStatus === "premium") {
        throw new Error("ALREADY_PREMIUM");
      }

      const inviteDoc = inviteSnapshot.docs[0];
      const nowIso = new Date().toISOString();

      transaction.update(inviteDoc.ref, {
        status: "used",
        usedBy: principal.uid,
        usedAt: nowIso,
      });

      transaction.update(
        userRef,
        buildPremiumAccessUpdate({
          currentApprovedPillar,
          inviteCodeUsed: normalizedCode,
          activatedAtIso: nowIso,
        })
      );
    });

    await recomputeInviteProgressSnapshot(principal.uid);

    return NextResponse.json({
      success: true,
      inviteCode: normalizedCode,
    });
  } catch (error) {
    console.error("[api/auth/invite] activation error", error);
    return getErrorResponse(error);
  }
}

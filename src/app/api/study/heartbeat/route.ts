import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { adminDb } from "@/lib/firebase-admin";
import { RequestAuthError, requireAuthenticatedUser } from "@/lib/auth/request-auth";
import { buildStudyModuleKey } from "@/lib/study/stats";

const MAX_ACCEPTED_SECONDS = 60;
const MIN_ACCEPTED_SECONDS = 5;

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
    const body = (await req.json()) as {
      pillarId?: unknown;
      moduleId?: unknown;
      activeSeconds?: unknown;
    };

    const pillarId = normalizePositiveInt(body.pillarId);
    const activeSeconds = normalizePositiveInt(body.activeSeconds);

    if (!pillarId || !activeSeconds) {
      return NextResponse.json({ error: "Missing study heartbeat fields." }, { status: 400 });
    }

    if (activeSeconds < MIN_ACCEPTED_SECONDS || activeSeconds > MAX_ACCEPTED_SECONDS) {
      return NextResponse.json({ error: "Invalid active study interval." }, { status: 400 });
    }

    const moduleId =
      typeof body.moduleId === "string" && body.moduleId.trim().length > 0
        ? buildStudyModuleKey(pillarId, body.moduleId)
        : buildStudyModuleKey(pillarId);

    const userRef = adminDb.collection("users").doc(principal.uid);

    await userRef.set(
      {
        studyStats: {
          totalActiveSeconds: admin.firestore.FieldValue.increment(activeSeconds),
          byPillar: {
            [String(pillarId)]: admin.firestore.FieldValue.increment(activeSeconds),
          },
          byModule: {
            [moduleId]: admin.firestore.FieldValue.increment(activeSeconds),
          },
          lastStudiedAt: new Date().toISOString(),
        },
      },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof RequestAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Study heartbeat API error:", error);
    return NextResponse.json({ error: "Failed to record study time." }, { status: 500 });
  }
}

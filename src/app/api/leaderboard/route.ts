import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { RequestAuthError, requireAuthenticatedUser } from "@/lib/auth/request-auth";

interface LeaderboardRow {
  id: string;
  name: string;
  streak: number;
}

function formatName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "Aluno";
  }

  if (parts.length === 1) {
    return parts[0];
  }

  const firstName = parts[0];
  const lastNameInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastNameInitial}.`;
}

function normalizeLimit(value: string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 5;
  }

  return Math.min(Math.max(Math.trunc(parsed), 1), 20);
}

export async function GET(req: Request) {
  try {
    await requireAuthenticatedUser(req);

    const { searchParams } = new URL(req.url);
    const limitCount = normalizeLimit(searchParams.get("limit"));

    const snapshot = await adminDb
      .collection("users")
      .orderBy("currentStreak", "desc")
      .limit(limitCount)
      .get();

    const rows: LeaderboardRow[] = snapshot.docs
      .map((doc) => {
        const data = doc.data() as {
          name?: string;
          currentStreak?: number;
        };

        if (typeof data.name !== "string" || typeof data.currentStreak !== "number") {
          return null;
        }

        return {
          id: doc.id,
          name: formatName(data.name),
          streak: data.currentStreak,
        };
      })
      .filter((row): row is LeaderboardRow => row !== null);

    return NextResponse.json({ rows });
  } catch (error) {
    if (error instanceof RequestAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Leaderboard API error:", error);
    return NextResponse.json({ error: "Failed to load leaderboard." }, { status: 500 });
  }
}

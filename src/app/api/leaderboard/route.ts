import { NextResponse } from "next/server";
import { getAdminDb } from "@/server/firebase";
import { RequestAuthError, requireAuthenticatedUser } from "@/lib/auth/request-auth";

interface LeaderboardRow {
  id: string;
  name: string;
  streak: number;
  isYou: boolean;
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
    const authUser = await requireAuthenticatedUser(req);

    const { searchParams } = new URL(req.url);
    const limitCount = normalizeLimit(searchParams.get("limit"));

    const snapshot = await getAdminDb().collection("users")
      .orderBy("currentStreak", "desc")
      .limit(limitCount)
      .get();

    const rows: LeaderboardRow[] = snapshot.docs
      .map((doc, index) => {
        const data = doc.data() as {
          name?: string;
          currentStreak?: number;
        };

        if (typeof data.name !== "string" || typeof data.currentStreak !== "number") {
          return null;
        }

        return {
          // Never expose Firebase UIDs to other students.
          id: `rank-${index + 1}`,
          name: formatName(data.name),
          streak: data.currentStreak,
          isYou: doc.id === authUser.uid,
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

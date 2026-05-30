export interface LeaderboardUser {
    id: string;
    name: string;
    streak: number;
    isYou?: boolean;
}

interface LeaderboardApiResponse {
    rows?: LeaderboardUser[];
}

export async function getLeaderboard(limitCount = 5): Promise<LeaderboardUser[]> {
    try {
        const response = await fetch(`/api/leaderboard?limit=${limitCount}`, {
            credentials: "include",
            cache: "no-store",
        });

        if (!response.ok) {
            return [];
        }

        const payload = (await response.json()) as LeaderboardApiResponse;
        return Array.isArray(payload.rows) ? payload.rows : [];
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
    }
}

import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

export interface LeaderboardUser {
    id: string;
    name: string;
    streak: number;
    isYou?: boolean;
}

export async function getLeaderboard(limitCount = 5): Promise<LeaderboardUser[]> {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, orderBy("currentStreak", "desc"), limit(limitCount));
        const querySnapshot = await getDocs(q);

        const users: LeaderboardUser[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Basic filtering to ensure name and streak exist
            if (data.name && typeof data.currentStreak === 'number') {
                users.push({
                    id: doc.id,
                    name: formatName(data.name),
                    streak: data.currentStreak
                });
            }
        });

        return users;
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
    }
}

// Helper to format name like "Maria S."
function formatName(fullName: string): string {
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0];
    const firstName = parts[0];
    const lastNameInitial = parts[parts.length - 1].charAt(0).toUpperCase();
    return `${firstName} ${lastNameInitial}.`;
}

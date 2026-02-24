export const RANKS = [
    "Passenger",           // 0
    "Check-in Complete",   // 1
    "Frequent Flyer",      // 2
    "Crew Member",         // 3
    "Crew Member+",        // 4 (Progresso)
    "Co-Pilot",            // 5
    "Co-Pilot+",           // 6 (Progresso)
    "Captain",             // 7
    "Captain+",            // 8 (Progresso)
    "Commander (Elite)"    // 9
];

export const getRank = (completedCount: number) => {
    // Garante que o índice esteja dentro dos limites
    const index = Math.min(Math.max(completedCount, 0), RANKS.length - 1);
    return RANKS[index];
};

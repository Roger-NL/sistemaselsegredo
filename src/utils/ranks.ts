export const RANKS = [
    "Recruta",          // 0
    "Cadete",           // 1
    "Soldado",          // 2
    "Cabo",             // 3
    "Sargento",         // 4
    "Tenente",          // 5
    "Capitão",          // 6
    "Major",            // 7
    "Coronel",          // 8
    "General de Exército" // 9
];

export const getRank = (completedCount: number) => {
    // Garante que o índice esteja dentro dos limites
    const index = Math.min(Math.max(completedCount, 0), RANKS.length - 1);
    return RANKS[index];
};

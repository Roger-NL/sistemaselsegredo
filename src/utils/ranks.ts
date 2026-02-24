export const RANKS = [
    "{{Passenger|Passageiro}}",           // 0
    "{{Check-in Complete|Check-in}}",     // 1
    "{{Frequent Flyer|Viajante Frequente}}", // 2
    "{{Crew Member|Tripulante}}",         // 3
    "{{Crew Member|Tripulante+}}",        // 4 (Progresso)
    "{{Co-Pilot|Co-piloto}}",             // 5
    "{{Co-Pilot|Co-piloto+}}",            // 6 (Progresso)
    "{{Captain|Capitão}}",               // 7
    "{{Captain|Capitão+}}",              // 8 (Progresso)
    "{{Commander|Comandante (Elite)}}"   // 9
];

export const getRank = (completedCount: number) => {
    // Garante que o índice esteja dentro dos limites
    const index = Math.min(Math.max(completedCount, 0), RANKS.length - 1);
    return RANKS[index];
};

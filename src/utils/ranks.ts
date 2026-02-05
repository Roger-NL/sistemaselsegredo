// Patentes de Piloto - Do iniciante ao lendário!
export const RANKS = [
    "Passageiro",        // 0 - Só olhando pela janela
    "Simulador",         // 1 - Treinou no joguinho
    "Drone",             // 2 - Voa baixinho
    "Ultraleve",         // 3 - Ganhando altitude
    "Comercial",         // 4 - Coisa séria agora
    "Capitão",           // 5 - Cruzando continentes
    "Comandante",        // 6 - Lidera a formação
    "Ás",                // 7 - Elite do ar
    "Supersônico",       // 8 - Quebra barreira do som
    "Lenda"              // 9 - Hall da Fama
];

export const getRank = (completedCount: number) => {
    // Garante que o índice esteja dentro dos limites
    const index = Math.min(Math.max(completedCount, 0), RANKS.length - 1);
    return RANKS[index];
};

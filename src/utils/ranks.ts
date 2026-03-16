export const RANKS = [
    "Passageiro",
    "Cadete de Voo",
    "Navegador de Rota",
    "Tripulante de Bordo",
    "Operador de Cabine",
    "Co-piloto",
    "Primeiro Oficial",
    "Capitão",
    "Capitão Sênior",
    "Comandante"
] as const;

export const RANK_DETAILS = [
    {
        name: "Passageiro",
        description: "Inicio da jornada. Voce entrou no sistema e esta conhecendo a estrutura do voo."
    },
    {
        name: "Cadete de Voo",
        description: "Primeiros treinos operacionais. Voce ja saiu da observacao e entrou em formacao."
    },
    {
        name: "Navegador de Rota",
        description: "Voce comeca a reconhecer caminhos, padroes e direcoes com mais seguranca."
    },
    {
        name: "Tripulante de Bordo",
        description: "A participacao deixa de ser passiva. Voce ja atua dentro da operacao."
    },
    {
        name: "Operador de Cabine",
        description: "Mais controle, mais leitura de ambiente e mais consistencia no processo."
    },
    {
        name: "Co-piloto",
        description: "Voce sustenta a missao com apoio tecnico e presenca em situacoes reais."
    },
    {
        name: "Primeiro Oficial",
        description: "Nivel de confianca maior. Voce decide melhor, responde rapido e mantem o curso."
    },
    {
        name: "Capitão",
        description: "Autonomia operacional. Voce conduz o voo com seguranca e clareza."
    },
    {
        name: "Capitão Sênior",
        description: "Alta consistencia, lideranca madura e leitura de risco acima da media."
    },
    {
        name: "Comandante",
        description: "Patente maxima da trilha. Referencia de dominio, controle e execucao."
    }
] as const;

export const getRank = (completedCount: number) => {
    // Garante que o índice esteja dentro dos limites
    const index = Math.min(Math.max(completedCount, 0), RANKS.length - 1);
    return RANKS[index];
};

export const getRankIndex = (completedCount: number) => {
    return Math.min(Math.max(completedCount, 0), RANKS.length - 1);
};

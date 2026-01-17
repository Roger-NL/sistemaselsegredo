// ============================================================================
// ES English Academy - Curriculum Data
// O "cérebro" do sistema: fonte única de verdade para pilares e especializações
// ============================================================================

// Tipos para tipagem forte
export type PillarStatus = "locked" | "unlocked" | "completed";
export type PlanetStatus = "locked" | "unlocked";

export interface Pillar {
    id: string;
    title: string;
    status: PillarStatus;
    description: string;
    routerPath: string;
}

export interface Planet {
    id: string;
    title: string;
    status: PlanetStatus;
    orbitDistance: number; // px - distância do centro para posicionamento visual
    color: string;
    icon: string; // emoji ou ícone para representação visual
}

// ============================================================================
// OS 9 PILARES (O Sol)
// Progressão sequencial: o aluno deve completar cada pilar para desbloquear o próximo
// ============================================================================
export const PILLARS: Pillar[] = [
    {
        id: "pilar-1",
        title: "01. Introdução & Mindset",
        status: "unlocked", // Primeiro pilar sempre desbloqueado
        description: "A fundação do método e a história do fundador.",
        routerPath: "/pilar/1",
    },
    {
        id: "pilar-2",
        title: "02. Inglês Auditivo",
        status: "locked",
        description: "A chave para a comunicação real através da escuta ativa.",
        routerPath: "/pilar/2",
    },
    {
        id: "pilar-3",
        title: "03. Gramática Essencial",
        status: "locked",
        description: "Estruturas fundamentais sem decoreba.",
        routerPath: "/pilar/3",
    },
    {
        id: "pilar-4",
        title: "04. Vocabulário Estratégico",
        status: "locked",
        description: "As palavras que realmente importam no dia a dia.",
        routerPath: "/pilar/4",
    },
    {
        id: "pilar-5",
        title: "05. Pronúncia & Fluência",
        status: "locked",
        description: "Técnicas para soar natural e confiante.",
        routerPath: "/pilar/5",
    },
    {
        id: "pilar-6",
        title: "06. Conversação Prática",
        status: "locked",
        description: "Diálogos reais para situações cotidianas.",
        routerPath: "/pilar/6",
    },
    {
        id: "pilar-7",
        title: "07. Expressões Idiomáticas",
        status: "locked",
        description: "O inglês que os nativos realmente usam.",
        routerPath: "/pilar/7",
    },
    {
        id: "pilar-8",
        title: "08. Escrita Eficiente",
        status: "locked",
        description: "Emails, mensagens e textos profissionais.",
        routerPath: "/pilar/8",
    },
    {
        id: "pilar-9",
        title: "09. Imersão Total",
        status: "locked",
        description: "Consolidação e preparação para as especializações.",
        routerPath: "/pilar/9",
    },
];

// ============================================================================
// OS PLANETAS (Especializações)
// Só desbloqueiam quando TODOS os pilares estiverem "completed"
// ============================================================================
export const PLANETS: Planet[] = [
    {
        id: "spec-interview",
        title: "Entrevistas de Emprego",
        status: "locked",
        orbitDistance: 180, // Órbita mais próxima
        color: "#06b6d4", // Cyan
        icon: "💼",
    },
    {
        id: "spec-travel",
        title: "Viagens Internacionais",
        status: "locked",
        orbitDistance: 240, // Órbita média
        color: "#22c55e", // Green
        icon: "✈️",
    },
    {
        id: "spec-business",
        title: "Inglês para Negócios",
        status: "locked",
        orbitDistance: 300, // Órbita mais distante
        color: "#f59e0b", // Amber
        icon: "📊",
    },
];

// ============================================================================
// HELPERS
// Funções utilitárias para verificar progresso
// ============================================================================

/** Retorna o pilar atual (primeiro não-completed) */
export function getCurrentPillar(): Pillar | null {
    return PILLARS.find((p) => p.status !== "completed") || null;
}

/** Verifica se todos os pilares foram completados */
export function areAllPillarsCompleted(): boolean {
    return PILLARS.every((p) => p.status === "completed");
}

/** Retorna contagem de pilares completados */
export function getCompletedPillarsCount(): number {
    return PILLARS.filter((p) => p.status === "completed").length;
}

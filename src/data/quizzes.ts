// ============================================================================
// ES English Academy - Quiz Questions Data
// Perguntas organizadas por pilar para validar o aprendizado
// ============================================================================

export interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number; // índice da resposta correta (0-3)
}

export interface PillarQuiz {
    pillarId: string;
    questions: Question[];
}

// Perguntas para cada pilar
export const QUIZ_DATA: PillarQuiz[] = [
    {
        pillarId: "pilar-1",
        questions: [
            {
                id: "q1-1",
                question: "Qual é o principal objetivo do método ES English?",
                options: [
                    "Decorar regras gramaticais",
                    "Desenvolver fluência natural através de imersão",
                    "Traduzir textos literalmente",
                    "Memorizar listas de vocabulário",
                ],
                correctAnswer: 1,
            },
            {
                id: "q1-2",
                question: "O que significa ter um 'growth mindset' no aprendizado de idiomas?",
                options: [
                    "Acreditar que a habilidade é fixa e não pode mudar",
                    "Evitar desafios para não cometer erros",
                    "Acreditar que é possível melhorar com prática e esforço",
                    "Focar apenas no que já sabe fazer bem",
                ],
                correctAnswer: 2,
            },
            {
                id: "q1-3",
                question: "Qual é a melhor atitude ao cometer erros durante o aprendizado?",
                options: [
                    "Sentir vergonha e evitar falar",
                    "Ver como oportunidade de aprendizado",
                    "Desistir e tentar outro método",
                    "Ignorar completamente",
                ],
                correctAnswer: 1,
            },
        ],
    },
    {
        pillarId: "pilar-2",
        questions: [
            {
                id: "q2-1",
                question: "Por que o inglês auditivo é fundamental para a fluência?",
                options: [
                    "Porque é mais fácil que ler",
                    "Porque reflete como o idioma é usado naturalmente",
                    "Porque não requer esforço",
                    "Porque substitui todas as outras habilidades",
                ],
                correctAnswer: 1,
            },
            {
                id: "q2-2",
                question: "Qual técnica é mais eficaz para melhorar a compreensão auditiva?",
                options: [
                    "Ouvir uma vez e traduzir mentalmente",
                    "Escuta repetida com foco em diferentes elementos",
                    "Ler a transcrição sem ouvir",
                    "Ouvir apenas músicas lentas",
                ],
                correctAnswer: 1,
            },
            {
                id: "q2-3",
                question: "O que é 'connected speech'?",
                options: [
                    "Falar muito rápido",
                    "A forma como palavras se conectam na fala natural",
                    "Usar gírias em conversas",
                    "Falar ao telefone",
                ],
                correctAnswer: 1,
            },
        ],
    },
    {
        pillarId: "pilar-3",
        questions: [
            {
                id: "q3-1",
                question: "Qual é a abordagem mais eficaz para aprender gramática?",
                options: [
                    "Decorar todas as regras antes de praticar",
                    "Aprender no contexto de uso real",
                    "Evitar gramática completamente",
                    "Estudar apenas exceções",
                ],
                correctAnswer: 1,
            },
            {
                id: "q3-2",
                question: "Complete: 'She ___ to the gym every day.'",
                options: ["go", "goes", "going", "gone"],
                correctAnswer: 1,
            },
            {
                id: "q3-3",
                question: "Qual frase está correta?",
                options: [
                    "I have went to Paris last year",
                    "I went to Paris last year",
                    "I go to Paris last year",
                    "I have go to Paris last year",
                ],
                correctAnswer: 1,
            },
        ],
    },
    {
        pillarId: "pilar-4",
        questions: [
            {
                id: "q4-1",
                question: "Qual estratégia é mais eficaz para expandir vocabulário?",
                options: [
                    "Memorizar dicionário palavra por palavra",
                    "Aprender palavras em contexto e chunks",
                    "Focar apenas em palavras difíceis",
                    "Traduzir literalmente do português",
                ],
                correctAnswer: 1,
            },
            {
                id: "q4-2",
                question: "O que são 'collocations'?",
                options: [
                    "Palavras que nunca aparecem juntas",
                    "Combinações naturais de palavras",
                    "Erros comuns de gramática",
                    "Sinônimos de palavras difíceis",
                ],
                correctAnswer: 1,
            },
            {
                id: "q4-3",
                question: "Qual é o significado de 'get along with someone'?",
                options: [
                    "Discutir com alguém",
                    "Ter um bom relacionamento com alguém",
                    "Encontrar alguém na rua",
                    "Esquecer alguém",
                ],
                correctAnswer: 1,
            },
        ],
    },
    {
        pillarId: "pilar-5",
        questions: [
            {
                id: "q5-1",
                question: "O que é mais importante para uma boa pronúncia?",
                options: [
                    "Falar com sotaque perfeito de nativo",
                    "Ser claro e compreensível",
                    "Falar extremamente devagar",
                    "Usar apenas palavras simples",
                ],
                correctAnswer: 1,
            },
            {
                id: "q5-2",
                question: "O que é 'word stress'?",
                options: [
                    "Estresse causado por palavras difíceis",
                    "A sílaba enfatizada em uma palavra",
                    "Pausas entre palavras",
                    "Volume da voz",
                ],
                correctAnswer: 1,
            },
            {
                id: "q5-3",
                question: "Qual técnica ajuda a melhorar a fluência oral?",
                options: [
                    "Pensar em português antes de falar",
                    "Shadowing (repetir áudios nativos)",
                    "Evitar falar até ter certeza",
                    "Falar apenas palavras que conhece bem",
                ],
                correctAnswer: 1,
            },
        ],
    },
    {
        pillarId: "pilar-6",
        questions: [
            {
                id: "q6-1",
                question: "Como iniciar uma conversa casual em inglês?",
                options: [
                    "Começar falando de política",
                    "Usar small talk sobre o tempo ou dia",
                    "Fazer perguntas muito pessoais",
                    "Ficar em silêncio esperando o outro",
                ],
                correctAnswer: 1,
            },
            {
                id: "q6-2",
                question: "Qual expressão usar para pedir esclarecimento educadamente?",
                options: [
                    "'What?' de forma direta",
                    "'Could you repeat that, please?'",
                    "'I don't understand anything'",
                    "'Speak slower!'",
                ],
                correctAnswer: 1,
            },
            {
                id: "q6-3",
                question: "Como encerrar uma conversa de forma educada?",
                options: [
                    "Simplesmente sair",
                    "'It was nice talking to you!'",
                    "Olhar para o celular insistentemente",
                    "Dizer que está entediado",
                ],
                correctAnswer: 1,
            },
        ],
    },
    {
        pillarId: "pilar-7",
        questions: [
            {
                id: "q7-1",
                question: "O que significa 'break the ice'?",
                options: [
                    "Quebrar gelo literalmente",
                    "Iniciar uma conversa de forma descontraída",
                    "Terminar um relacionamento",
                    "Fazer algo difícil",
                ],
                correctAnswer: 1,
            },
            {
                id: "q7-2",
                question: "Qual é o significado de 'piece of cake'?",
                options: [
                    "Uma fatia de bolo",
                    "Algo muito fácil",
                    "Uma recompensa",
                    "Um problema sério",
                ],
                correctAnswer: 1,
            },
            {
                id: "q7-3",
                question: "O que significa 'hit the nail on the head'?",
                options: [
                    "Machucar o dedo",
                    "Acertar em cheio, estar correto",
                    "Fazer barulho",
                    "Construir algo",
                ],
                correctAnswer: 1,
            },
        ],
    },
    {
        pillarId: "pilar-8",
        questions: [
            {
                id: "q8-1",
                question: "Qual é o tom adequado para um email profissional?",
                options: [
                    "Extremamente casual com gírias",
                    "Formal mas amigável",
                    "Muito formal e distante",
                    "Igual a uma mensagem de texto",
                ],
                correctAnswer: 1,
            },
            {
                id: "q8-2",
                question: "Como fechar um email profissional?",
                options: [
                    "'Bye!'",
                    "'Best regards,'",
                    "'XOXO'",
                    "'That's all'",
                ],
                correctAnswer: 1,
            },
            {
                id: "q8-3",
                question: "Qual frase é apropriada para solicitar algo em um email?",
                options: [
                    "'I need this now!'",
                    "'Could you please send me the report?'",
                    "'Send report.'",
                    "'Give me report!'",
                ],
                correctAnswer: 1,
            },
        ],
    },
    {
        pillarId: "pilar-9",
        questions: [
            {
                id: "q9-1",
                question: "O que caracteriza a imersão total no idioma?",
                options: [
                    "Estudar apenas gramática",
                    "Viver cercado pelo idioma em múltiplos contextos",
                    "Assistir um filme por mês",
                    "Traduzir tudo mentalmente",
                ],
                correctAnswer: 1,
            },
            {
                id: "q9-2",
                question: "Qual hábito ajuda a manter a fluência a longo prazo?",
                options: [
                    "Estudar intensamente uma vez por mês",
                    "Prática consistente e diária",
                    "Apenas ler livros simples",
                    "Evitar conteúdo desafiador",
                ],
                correctAnswer: 1,
            },
            {
                id: "q9-3",
                question: "Parabéns! Você completou todos os pilares. Qual é o próximo passo?",
                options: [
                    "Parar de estudar",
                    "Explorar as especializações",
                    "Começar do zero",
                    "Desistir do inglês",
                ],
                correctAnswer: 1,
            },
        ],
    },
];

// Helper para buscar quiz de um pilar
export function getQuizByPillarId(pillarId: string): PillarQuiz | undefined {
    return QUIZ_DATA.find((q) => q.pillarId === pillarId);
}

// Helper para buscar quiz pelo número do pilar
export function getQuizByPillarNumber(pillarNumber: number): PillarQuiz | undefined {
    return QUIZ_DATA.find((q) => q.pillarId === `pilar-${pillarNumber}`);
}

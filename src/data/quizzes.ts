// ============================================================================ 
// BasedSpeak - Quiz Questions Data
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
                question: "Qual é o principal objetivo do método BasedSpeak?",
                options: [
                    "Decorar regras gramaticais",
                    "Desenvolver autonomia e comunicação real",
                    "Traduzir textos literalmente",
                    "Memorizar listas de vocabulário",
                ],
                correctAnswer: 1,
            },
            {
                id: "q1-2",
                question: "O que o curso prioriza no lugar da fluência perfeita?",
                options: [
                    "A fluência acadêmica",
                    "A fluência operacional",
                    "A escrita formal",
                    "A pronúncia britânica",
                ],
                correctAnswer: 1,
            },
            {
                id: "q1-3",
                question: "Qual é a melhor atitude ao cometer erros durante o aprendizado?",
                options: [
                    "Sentir vergonha e evitar falar",
                    "Ver como parte natural do processo",
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
                question: "Por que o inglês auditivo é fundamental?",
                options: [
                    "Porque é mais fácil que ler",
                    "Porque é a base da comunicação natural",
                    "Porque não requer esforço",
                    "Porque substitui a gramática",
                ],
                correctAnswer: 1,
            },
            {
                id: "q2-2",
                question: "O que é 'Listening Ativo'?",
                options: [
                    "Ouvir passivamente enquanto faz outras coisas",
                    "Prestar atenção em entonação, ritmo e emoção",
                    "Ler a transcrição sem ouvir",
                    "Ouvir apenas músicas lentas",
                ],
                correctAnswer: 1,
            },
            {
                id: "q2-3",
                question: "O que são 'Connected Sounds'?",
                options: [
                    "Falar muito rápido",
                    "A união de sons entre o fim de uma palavra e o início de outra",
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
                question: "Você quer pagar a conta no restaurante. Qual a forma mais natural?",
                options: [
                    "I will pay the bill now.",
                    "I want to pay.",
                    "Can I have the bill, please?", 
                    "The check is for me.",
                ],
                correctAnswer: 2, 
            },
            {
                id: "q3-2",
                question: "Você está perdido e precisa achar a estação de trem. Qual a melhor forma de perguntar?",
                options: [
                    "Where is the train station?",
                    "Excuse me, how do I get to the train station?",
                    "I'm lost, I need the train station.",
                    "Train station, please.",
                ],
                correctAnswer: 1,
            },
            {
                id: "q3-3",
                question: "Alguém fala rápido demais e você não entende. O que você diz?",
                options: [
                    "What? Your English is too fast.",
                    "I don't understand you at all.",
                    "Please, stop.",
                    "Sorry, could you speak a little slower, please?",
                ],
                correctAnswer: 3,
            },
        ],
    },
    {
        pillarId: "pilar-4",
        questions: [
            {
                id: "q4-1",
                question: "Qual frase segue corretamente a estrutura principal do inglês?",
                options: [
                    "Pizza I want.",
                    "I pizza want.",
                    "I want pizza.",
                    "Want I pizza.",
                ],
                correctAnswer: 2,
            },
            {
                id: "q4-2",
                question: "Como perguntar corretamente onde alguém mora?",
                options: [
                    "Where you live?",
                    "You live where?",
                    "Where do you live?",
                    "Do you live where?",
                ],
                correctAnswer: 2,
            },
            {
                id: "q4-3",
                question: "Qual é a negação correta de “They have a car”?",
                options: [
                    "They not have a car.",
                    "They have not a car.",
                    "They don’t have a car.",
                    "They doesn’t have a car.",
                ],
                correctAnswer: 2,
            },
             {
                id: "q4-4",
                question: "Qual é a negação correta de “She works here”?",
                options: [
                    "She don't work here.",
                    "She no work here.",
                    "She doesn't work here.",
                    "She doesn't works here.",
                ],
                correctAnswer: 2,
            },
        ],
    },
    {
        pillarId: "pilar-5",
        questions: [
            {
                id: "q5-1",
                question: "Ao ouvir \"twelve fifty\" em um contexto de compra, qual leitura faz mais sentido?",
                options: [
                    "12.50",
                    "125",
                    "1,250",
                    "12,500",
                ],
                correctAnswer: 0,
            },
            {
                id: "q5-2",
                question: "Você quer confirmar o preço de um item que está na sua frente. Qual pergunta soa melhor?",
                options: [
                    "How much is this?",
                    "How many is this?",
                    "What price this is?",
                    "This costs how much money?",
                ],
                correctAnswer: 0,
            },
            {
                id: "q5-3",
                question: "Você recebeu a data \"05/08\" em um contexto internacional. Qual é a atitude mais segura?",
                options: [
                    "Assumir que sempre é 5 de agosto.",
                    "Assumir que sempre é 8 de maio.",
                    "Confirmar o formato antes de seguir.",
                    "Ignorar a data e esperar contexto.",
                ],
                correctAnswer: 2,
            },
            {
                id: "q5-4",
                question: "Qual frase expressa melhor um prazo final?",
                options: [
                    "I'll stay until Friday.",
                    "Send it by Friday.",
                    "I work for Friday.",
                    "The file is at Friday.",
                ],
                correctAnswer: 1,
            },
            {
                id: "q5-5",
                question: "Numa oferta de trabalho, qual pergunta evita uma confusão importante logo de cara?",
                options: [
                    "Is that monthly or yearly?",
                    "How many salaries is that?",
                    "Why salary talks like that?",
                    "You pay this in speaking?",
                ],
                correctAnswer: 0,
            },
        ],
    },
    {
        pillarId: "pilar-6",
        questions: [
            {
                id: "q6-1",
                question: "Quando alguem pergunta \"What do you do?\", qual resposta desenvolve melhor a conversa?",
                options: [
                    "\"Yes.\" (Sim.)",
                    "\"I work in IT, mostly with support. How about you?\" (Eu trabalho com TI, principalmente com suporte. E voce?)",
                    "\"Work yes office.\" (Trabalho sim escritorio.)",
                    "\"No English now.\" (Sem ingles agora.)",
                ],
                correctAnswer: 1,
            },
            {
                id: "q6-2",
                question: "Qual frase funciona melhor para ganhar tempo sem sumir da conversa?",
                options: [
                    "\"...\" (silencio puro.)",
                    "\"Let me think for a second.\" (Deixa eu pensar um segundo.)",
                    "\"My English is impossible.\" (Meu ingles e impossivel.)",
                    "\"I cant answer ever.\" (Eu nao posso responder nunca.)",
                ],
                correctAnswer: 1,
            },
            {
                id: "q6-3",
                question: "Qual abertura soa mais natural para small talk no trabalho?",
                options: [
                    "\"Tell me your personal problems.\" (Me conte seus problemas pessoais.)",
                    "\"How's your day going so far?\" (Como esta indo seu dia ate agora?)",
                    "\"Why are you here exactly?\" (Por que voce esta aqui exatamente?)",
                    "\"Explain your full life now.\" (Explique sua vida inteira agora.)",
                ],
                correctAnswer: 1,
            },
            {
                id: "q6-4",
                question: "Qual frase conta um problema de forma mais clara e organizada?",
                options: [
                    "\"Meeting wrong time problem.\" (Reuniao horario errado problema.)",
                    "\"I wrote down the wrong time, so I missed the meeting.\" (Eu anotei o horario errado, entao perdi a reuniao.)",
                    "\"Problem meeting yes.\" (Problema reuniao sim.)",
                    "\"Time incorrectly existence.\" (Horario incorretamente existencia.)",
                ],
                correctAnswer: 1,
            },
            {
                id: "q6-5",
                question: "Qual atitude representa melhor a conversa encadeada que o Pilar 6 quer construir?",
                options: [
                    "Responder so o minimo e esperar a conversa acabar.",
                    "Alternar entre responder, reagir, perguntar e conectar com o que o outro disse.",
                    "Falar muito sem ouvir o outro.",
                    "Mudar de assunto sempre que aparecer um detalhe novo.",
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
                question: "Qual é a filosofia central do Pilar 7?",
                options: [
                    "Aprender mais 500 palavras",
                    "Tornar o aluno independente e autoaprendente",
                    "Focar apenas em conversação",
                    "Morar fora para fluência",
                ],
                correctAnswer: 1,
            },
            {
                id: "q7-2",
                question: "Qual a ordem correta da Escada da Imersão em séries/filmes?",
                options: [
                    "Sem legenda → PT → EN",
                    "PT → EN → Sem legenda",
                    "EN → Sem legenda → PT",
                    "Apenas legenda EN",
                ],
                correctAnswer: 1,
            },
            {
                id: "q7-3",
                question: "Qual a forma mais eficaz de usar Anki?",
                options: [
                    "Baixar listas prontas",
                    "Criar seus próprios flashcards com frases reais",
                    "Revisar apenas 1x por mês",
                    "Colocar apenas palavras soltas",
                ],
                correctAnswer: 1,
            },
            {
                id: "q7-4",
                question: "O que é o Platô do Intermediário?",
                options: [
                    "Esquecer inglês básico",
                    "Sentir que não evolui apesar do estudo",
                    "Nível mais alto possível",
                    "Um erro do material",
                ],
                correctAnswer: 1,
            },
             {
                id: "q7-5",
                question: "Qual é um exemplo de meta SMART para inglês?",
                options: [
                    "\"Vou ficar fluente\"",
                    "\"Quero aprender muito vocabulário\"",
                    "\"Em 30 dias, adiciono 3 frases ao Anki todos os dias\"",
                    "\"Estudo sempre que tenho tempo\"",
                ],
                correctAnswer: 2,
            },
        ],
    },
    {
        pillarId: "pilar-8",
        questions: [
            {
                id: "q8-1",
                question: "Qual é a principal função dos Módulos de Especialização?",
                options: [
                    "Revisar o básico novamente",
                    "Focar em vocabulário específico para acelerar resultados na carreira ou vida",
                    "Ensinar gírias aleatórias",
                    "Substituir o currículo base",
                ],
                correctAnswer: 1,
            },
            {
                id: "q8-2",
                question: "O módulo de 'Business English' é ideal para quem?",
                options: [
                    "Quem quer aprender a pedir comida em restaurantes",
                    "Quem precisa participar de reuniões, apresentações e escrever e-mails corporativos",
                    "Quem quer assistir filmes sem legenda",
                    "Quem é médico ou enfermeiro",
                ],
                correctAnswer: 1,
            },
            {
                id: "q8-3",
                question: "Qual é a estratégia recomendada para cursar as especializações?",
                options: [
                    "Fazer todas ao mesmo tempo para acabar logo",
                    "Focar em uma de cada vez para garantir profundidade e evitar sobrecarga",
                    "Não fazer nenhuma e parar de estudar",
                    "Escolher aleatoriamente sem pensar no objetivo",
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
                question: "Qual é o próximo passo após concluir o Currículo Base?",
                options: [
                    "Aposentar o inglês.",
                    "Iniciar a Especialização escolhida na Decision Matrix.",
                    "Refazer o básico para sempre.",
                    "Esperar a fluência cair do céu.",
                ],
                correctAnswer: 1,
            },
            {
                id: "q9-2",
                question: "O que a 'Decision Matrix' te ajuda a fazer?",
                options: [
                    "Jogar um jogo.",
                    "Escolher a trilha de aprendizado ideal para sua carreira/vida.",
                    "Desistir do curso.",
                    "Gastrar mais dinheiro.",
                ],
                correctAnswer: 1,
            },
            {
                id: "q9-3",
                question: "A jornada termina aqui?",
                options: [
                    "Sim, acabou.",
                    "Não, é apenas o começo da maestria e aplicação real.",
                    "Talvez.",
                    "Não sei.",
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

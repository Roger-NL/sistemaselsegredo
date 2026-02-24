import { PillarData } from "@/types/study";

export const PILAR_9_DATA: PillarData = {
    id: 9,
    title: "Pilar 9: A Decisão Final",
    subtitle: "O briefing da sua próxima missão e o acesso ao suporte humano.",
    blocks: [
        {
            type: "system-status",
            content: "MISSION BRIEFING: FINAL STAGE. Calculating trajectory."
        },
        {
            type: "h2",
            content: "Introdução: O Fim do Tutorial"
        },
        {
            type: "paragraph",
            content: "Nos videogames, você acabou de sair da 'Ilha do Tutorial'. O mapa-múndi está aberto. Você tem o barco, a bússola e a tripulação. Para onde você navega? A indecisão aqui é fatal. Quem não sabe para onde vai, fica parado no porto."
        },
        {
            type: "h2",
            content: "Parte 1: O Algoritmo de Decisão Tática"
        },
        {
            type: "paragraph",
            content: "Responda rápido para descobrir seu próximo passo ideal."
        },
        {
            type: "interactive-quiz",
            content: "Q1: Você precisa do inglês para TRABALHO nos próximos 3 meses?|SIM (Urgente)|NÃO (Longo Prazo)|0"
        },
        {
            type: "reveal-box",
            title: "Se respondeu SIM:",
            content: "- Já tem o emprego? -> Faça **Business Elite** ou **IT Pro**.\n- Está procurando? -> Faça **Job Hunter**.\n\nFoco total em vocabulário profissional."
        },
        {
            type: "reveal-box",
            title: "Se respondeu NÃO:",
            content: "- Tem viagem marcada? -> Faça **Global Traveler**.\n- Quer apenas curtir filmes/séries? -> Faça **Pop Culture**.\n\nFoco em diversão e cultura."
        },
        {
            type: "h2",
            content: "Parte 2: O Contrato de Compromisso"
        },
        {
            type: "paragraph",
            content: "Estudos mostram que escrever suas metas aumenta em 42% a chance de realizá-las. Assine seu compromisso mental agora."
        },
        {
            type: "terminal-view",
            content: [
                "COMMITMENT PROCEDURE:",
                "I, [SEU NOME], declare that I have completed the Foundation Phase.",
                "My next target is: [SUA ESPECIALIZAÇÃO].",
                "I will dedicate 15 minutes daily.",
                "Status: SIGNED."
            ]
        },
        {
            type: "h2",
            content: "Parte 3: Suporte Humano (Human Intel)"
        },
        {
            type: "paragraph",
            content: "Ainda está confuso? O algoritmo não resolveu? Temos um agente humano esperando por você."
        },
        {
            type: "box-action",
            title: "Consultoria Estratégica",
            content: "Agende sua sessão individual. Vamos diagnosticar seu nível atual, entender seus objetivos de vida e desenhar um plano de estudos personalizado para os próximos 6 meses."
        },
        {
            type: "pillar-end",
            title: "MISSÃO CUMPRIDA",
            content: "O Currículo Base está finalizado. Você sobreviveu. Você evoluiu. Agora, vá e conquiste o mundo. End of Transmission."
        }
    ]
};

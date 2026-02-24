import { PillarData } from "@/types/study";

export const PILAR_4_DATA: PillarData = {
    id: 4,
    title: "Pilar 4: Engenharia da Frase",
    subtitle: "A lógica modular por trás do idioma: S+V+O e a Tabela Periódica dos Pronomes.",
    blocks: [
        {
            type: "system-status",
            content: "{{CORE ENGINE|MOTOR PRINCIPAL}}: {{LOADING|CARREGANDO}}... {{LOGIC MODULES ACTIVE|MÓDULOS LÓGICOS ATIVOS}}."
        },
        {
            type: "h2",
            content: "Introdução: O Fim do 'Portunhol'"
        },
        {
            type: "paragraph",
            content: "O 'Portunhol' acontece quando você pega a lógica do português e troca as palavras por inglês. Isso não funciona. O inglês é uma língua germânica, lógica e rígida. O português é latino, flexível e poético. Neste pilar, vamos instalar a lógica germânica no seu cérebro."
        },
        {
            type: "h2",
            content: "Parte 1: A Fórmula Mestra (S + V + O)"
        },
        {
            type: "paragraph",
            content: "Esta é a regra de ouro. 90% das frases em inglês seguem estritamente esta ordem. Não mude a ordem."
        },
        {
            type: "terminal-view",
            content: [
                "SVO PROCEDURE:",
                "[ {{SUJEITO|QUEM}} ] + [ {{VERBO|AÇÃO}} ] + [ {{OBJETO|ALVO}} ]",
                "Quem faz?   + O que faz? + O quê?",
                "   {{I|Eu}}        +   {{Love|Amo}}     +  {{Pizza|Pizza}}",
                "   {{She|Ela}}      +   {{Wants|Quer}}    +  {{Water|Água}}"
            ]
        },
        {
            type: "box-warning",
            title: "Erro Fatal: O Sujeito Oculto",
            content: "Em português, dizemos 'Fui na praia' (Sujeito 'Eu' implícito). Em inglês, isso é PROIBIDO. Você DEVE dizer '**{{I went to the beach|Eu fui à praia}}**'. Sem sujeito, a frase não existe."
        },
        {
            type: "h2",
            content: "Parte 2: A Tabela Periódica dos Pronomes"
        },
        {
            type: "paragraph",
            content: "Você precisa saber quem é quem no jogo. Estes são os pilotos da sua frase."
        },
        {
            type: "table",
            content: [
                "{{I|Eu}}|Eu (Sempre Maiúsculo)|{{I work here.|Eu trabalho aqui.}}",
                "{{You|Você}}|Você / Vocês|{{You are smart.|Você é inteligente.}}",
                "{{He|Ele}}|Ele (Homem)|{{He is my brother.|Ele é meu irmão.}}",
                "{{She|Ela}}|Ela (Mulher)|{{She is the boss.|Ela é a chefe.}}",
                "{{It|Ele/Ela}}|Ele/Ela (Coisa/Animal)|{{It is a dog.|É um cachorro.}}",
                "{{We|Nós}}|Nós|{{We are a team.|Nós somos um time.}}",
                "{{They|Eles}}|Eles/Elas (Plural de tudo)|{{They are coming.|Eles estão vindo.}}"
            ]
        },
        {
            type: "h2",
            content: "Parte 3: O Sistema Binário (Do vs Does)"
        },
        {
            type: "paragraph",
            content: "Para fazer perguntas no presente, o inglês usa 'operadores'. Imagine que são chaves que abrem a porta da interrogação."
        },
        {
            type: "decision-tree",
            content: [
                "Quem é o Sujeito?|{{I, You, We, They|Eu, Você, Nós, Eles}}|{{He, She, It|Ele, Ela, Coisa}}",
                "Use {{DO|FAZER}}|Ex: {{Do you like pizza?|Você gosta de pizza?}}|Use {{DOES|FAZER}}|Ex: {{Does she like pizza?|Ela gosta de pizza?}}"
            ]
        },
        {
            type: "box-insight",
            title: "O 'S' Fofoqueiro",
            content: "Quando usamos **{{He/She/It|Ele/Ela/Coisa}}** no presente afirmativo, o verbo ganha um 'S'. Ex: '{{I work|Eu trabalho}}' -> '{{She works|Ela trabalha}}'. Esse 'S' não é plural. É uma marca de 'terceira pessoa'."
        },
        {
            type: "interactive-quiz",
            content: "Qual frase está correta?|{{She like coffee.|Ela gostar café.}}|{{She likes coffee.|Ela gosta de café.}}|{{She do like coffee.|Ela faz gostar café.}}|1"
        },
        {
            type: "h2",
            content: "Parte 4: O Passado e o Futuro (Time Travel)"
        },
        {
            type: "paragraph",
            content: "Mudar o tempo em inglês é incrivelmente fácil. Você só troca o operador."
        },
        {
            type: "cards-grid",
            content: [
                "Passado ({{DID|FEZ}})|Para perguntar no passado, use **{{DID|FEZ}}**. O verbo volta ao normal. Ex: **{{Did you go?|Você foi?}}**",
                "Futuro ({{WILL|VAI}})|Para falar do futuro, use **{{WILL|VAI}}**. Ex: {{I will go.|Eu irei.}}"
            ]
        },
        {
            type: "h2",
            content: "Parte 5: As Palavras Mágicas (WH Questions)"
        },
        {
            type: "paragraph",
            content: "Para extrair informações específicas, use as 'WH Words' antes do operador."
        },
        {
            type: "list",
            content: [
                "**{{What|O quê}}** (O quê/Qual) -> {{What do you want?|O que você quer?}}",
                "**{{Where|Onde}}** (Onde) -> {{Where do you live?|Onde você mora?}}",
                "**{{When|Quando}}** (Quando) -> {{When do you work?|Quando você trabalha?}}",
                "**{{Who|Quem}}** (Quem) -> {{Who are you?|Quem é você?}}",
                "**{{Why|Por que}}** (Por que) -> {{Why are you here?|Por que você está aqui?}}",
                "**{{How|Como}}** (Como) -> {{How are you?|Como vai você?}}"
            ]
        },
        {
            type: "pillar-end",
            title: "Engenharia Dominada",
            content: "Você tem as peças (vocabulário) e o manual (estrutura). Agora você pode construir qualquer frase simples com confiança."
        }
    ]
};

// PILAR 5: FINANÇAS E NÚMEROS (EXPANDED ELITE VERSION)

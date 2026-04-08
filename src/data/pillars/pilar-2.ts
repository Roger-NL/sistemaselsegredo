import { PillarData } from "@/types/study";

export const PILAR_2_DATA: PillarData = {
    id: 2,
    title: "PILAR 2: OUVIR O INGLES REAL",
    subtitle: "Treinando seu ouvido para reconhecer som conectado, ritmo e intencao no ingles falado de verdade.",
    modules: [
        {
            id: "p2-intro",
            title: "MÓDULO 1: {{START HERE|COMECE POR AQUI}}",
            subtitle: "O ajuste de mentalidade para parar de ouvir ingles como se fosse portugues.",
            status: "active",
            blocks: [
                {
                    type: "system-status",
                    content: "{{AUDIO PHASE READY|FASE DE AUDIO PRONTA}}... {{REAL LISTENING MODE ON|MODO DE ESCUTA REAL ATIVADO}}... {{GETTING IT WRONG AT FIRST IS NORMAL|ERRAR NO COMECO E NORMAL}}..."
                },
                {
                    type: "h2",
                    content: "Agora o foco muda: o trabalho e no ouvido."
                },
                {
                    type: "paragraph",
                    content: "No Pilar 1, voce entendeu por que travava. Aqui, voce comeca a resolver isso na pratica. O Pilar 2 existe para te mostrar que o problema quase nunca e 'falta de vocabulario'. Na maioria das vezes, o problema e ouvir o ingles do jeito errado."
                },
                {
                    type: "box-warning",
                    title: "⚠️ Antes de comecar",
                    content: "Nesta fase, errar faz parte do processo. Se no comeco tudo parecer embolado, isso nao quer dizer que voce nao leva jeito. Quer dizer so que seu ouvido ainda esta aprendendo a separar o que antes chegava como um bloco so."
                },
                {
                    type: "h3",
                    content: "1.1 O que voce vai aprender aqui"
                },
                {
                    type: "paragraph",
                    content: "Este pilar nao e sobre decorar regra. E sobre perceber o que realmente acontece no audio. A progressao aqui e simples:"
                },
                {
                    type: "list",
                    content: [
                        "**1. {{Notice the sound|Perceber o som}}:** parar de tratar tudo como um ruido so.",
                        "**2. {{Separate what sounds similar|Separar sons parecidos}}:** notar diferencas que antes passavam batido.",
                        "**3. {{Hear the block|Ouvir o bloco}}:** captar frases inteiras sem depender de cada palavra.",
                        "**4. {{Catch intention|Pegar a intencao}}:** entender o que a pessoa quer mesmo quando o audio nao vem perfeito.",
                        "**5. {{Stay steady|Ficar firme}}:** continuar ouvindo e respondendo sem entrar em panico."
                    ]
                },
                {
                    type: "elite-insight",
                    title: "Importante sobre o proximo passo",
                    content: "Ao fim do Pilar 2, sua prova vai passar pela leitura da equipe antes de liberar o Pilar 3. A ideia aqui nao e te segurar: e confirmar se essa base auditiva realmente firmou. Se precisar, voce ajusta antes de seguir."
                }
            ]
        },
        {
            id: "p2-p1",
            title: "MÓDULO 2: {{SOUND SEPARATION|SEPARACAO DOS SONS}}",
            subtitle: "Percebendo sons que parecem iguais quando o ouvido ainda mistura tudo.",
            status: "active",
            blocks: [
                {
                    type: "tower-log",
                    content:
                        "AUDIO LOG #01 — {{LISTENING START|INICIO DA ESCUTA}}\n• Focus: {{REAL SOUND|SOM REAL}}\n• Risk: {{Hearing everything as one blur|Ouvir tudo como um bloco so}}\n• Goal: {{Separate what your ear is still mixing|Separar o que seu ouvido ainda mistura}}\n\nNota: aqui voce nao vai aprender palavra nova. Vai aprender a ouvir melhor."
                },
                { type: "h2", content: "O que muita gente chama de '{{fast English|ingles rapido}}' e, na verdade, audio mal separado." },
                {
                    type: "paragraph",
                    content:
                        "Seu cerebro tenta economizar energia o tempo todo. Entao, quando ouve ingles, ele junta sons parecidos e transforma tudo numa massa so. No portugues isso quase nunca te atrapalha. No ingles, atrapalha bastante.\n\nNeste modulo, voce vai comecar a separar o que antes chegava embaralhado."
                },
                {
                    type: "sonic-scan",
                    content: JSON.stringify({
                        title: "{{Quick Ear Check|Checagem Rapida do Ouvido}}",
                        instructions:
                            "Marque o que acontece com voce. Isso aqui nao e julgamento. E so um retrato do seu ponto de partida.",
                        items: [
                            "Quando um nativo fala, eu sinto um 'paredao' de som.",
                            "Eu entendo no texto, mas no audio parece outra lingua.",
                            "Eu confundo palavras curtas (ex: {{bit/beat|bit/beat}}, {{ship/sheep|ship/sheep}}).",
                            "Eu ouco '{{ready|pronto}}' quando a pessoa disse '{{red|vermelho}}'.",
                            "Eu tento traduzir e, quando vejo, ja perdi o resto."
                        ],
                        output:
                            "Se marcou 2+ itens, o seu gargalo principal nao e vocabulario. E escuta."
                    })
                },
                { type: "h3", content: "2.1 O primeiro ajuste: perceber que nao e tudo igual" },
                {
                    type: "paragraph",
                    content:
                        "Voce vai treinar em 3 camadas bem simples:\n\n1) **sons quase iguais**\n2) **final seco**\n3) **resposta rapida**\n\nA ideia nao e ficar analisando demais. E ensinar seu ouvido a notar contraste mais cedo."
                },
                {
                    type: "a-b-snaptest",
                    content: JSON.stringify({
                        title: "{{A/B SnapTest|Teste Rapido A/B}} — 2 segundos por alvo",
                        rule:
                            "Sem legenda. Sem pensar demais. Voce escolhe A ou B no instinto. O objetivo aqui e comecar a acordar o ouvido, nao provar que sabe gramatica.",
                        items: [
                            { id: "ab1", label: "Alvo 1", a: "{{ship|navio}}", b: "{{sheep|ovelha}}" },
                            { id: "ab2", label: "Alvo 2", a: "{{bit|um pouco}}", b: "{{beat|batida}}" },
                            { id: "ab3", label: "Alvo 3", a: "{{full|cheio}}", b: "{{fool|tolo}}" },
                            { id: "ab4", label: "Alvo 4", a: "{{cut|cortar}}", b: "{{cat|gato}}" },
                            { id: "ab5", label: "Alvo 5", a: "{{live|morar/viver}}", b: "{{leave|sair/partir}}" }
                        ],
                        scoring:
                            "Voce nao precisa acertar tudo. Voce precisa descobrir quais pares ainda te confundem."
                    })
                },
                {
                    type: "latency-meter",
                    content: JSON.stringify({
                        title: "{{Reaction Check|Checagem de Reacao}} — onde voce trava",
                        description:
                            "Muita gente perde a conversa nao porque erra, mas porque demora demais para reagir. Marque seu padrao:",
                        options: [
                            "Eu respondo rápido mesmo errando.",
                            "Eu travo tentando ter certeza.",
                            "Eu traduzo mentalmente antes de escolher."
                        ],
                        verdicts: [
                            "Responder rapido, mesmo errando, e um bom sinal: seu ouvido ja esta se movendo.",
                            "Travar mostra medo de errar. A gente vai aliviar isso ao longo do pilar.",
                            "Traduzir antes de reagir deixa tudo mais lento. Vamos soltar isso aos poucos."
                        ]
                    })
                },
                { type: "h3", content: "2.2 {{Dry Ending|Final seco}}: cortar no lugar certo" },
                {
                    type: "paragraph",
                    content:
                        "Aqui esta um erro muito comum de brasileiro: colocar uma vogalzinha no fim da palavra sem perceber. Em vez de parar seco, a pessoa estica. \n\nNao e questao de pronuncia bonita. E questao de fazer o som terminar onde ele realmente termina."
                },
                {
                    type: "cutoff-drill",
                    content: JSON.stringify({
                        title: "{{Cutoff Drill|Treino de Corte}} — parar no fim certo",
                        instruction:
                            "Fale e pare. Sem deixar escapar vogal extra no final. Repita 5x cada.",
                        items: [
                            { word: "{{stop|parar}}", cutoff: "p" },
                            { word: "{{back|atrás}}", cutoff: "k" },
                            { word: "{{red|vermelho}}", cutoff: "d" },
                            { word: "{{cap|boné}}", cutoff: "p" },
                            { word: "{{hot|quente}}", cutoff: "t" }
                        ],
                        warning:
                            "Se aparecer um som extra no final (tipo stopi/backi), seu ouvido ainda esta empurrando a palavra alem do ponto."
                    })
                },
                {
                    type: "misfire-cases",
                    content: JSON.stringify({
                        title: "{{Misfire Cases|Casos de Troca de Som}} — quando um detalhe muda tudo",
                        cases: [
                            {
                                whatYouSay: "{{redi|redi}}",
                                whatTheyHear: "{{ready|pronto}}",
                                whyItHurts:
                                    "Voce acha que falou cor. A outra pessoa entende estado. Em conversa real, isso muda tudo."
                            },
                            {
                                whatYouSay: "{{stopy|stopy}}",
                                whatTheyHear: "{{stop|parar}}",
                                whyItHurts:
                                    "Soa menos firme e ainda embaralha o som que deveria ser curto."
                            },
                            {
                                whatYouSay: "{{cabi|cabi}}",
                                whatTheyHear: "{{cab|táxi/cabine}}",
                                whyItHurts:
                                    "Voce acha que esta falando uma coisa e o ouvido do outro pode puxar para outra."
                            }
                        ],
                        note:
                            "Nem sempre isso e sotaque. Muitas vezes e so som mal fechado."
                    })
                },
                { type: "h3", content: "2.3 {{Sound Anchors|Ancoras de som}}: criar contraste sem decorar regra" },
                {
                    type: "paragraph",
                    content:
                        "Seu cerebro lembra melhor de contraste do que de explicacao tecnica. Por isso, em vez de decorar regra, voce vai criar duas ancoras sonoras que facam sentido para voce."
                },
                {
                    type: "anchor-builder",
                    content: JSON.stringify({
                        title: "{{Anchor Builder|Construtor de Ancoras}} — escolha suas 2 ancoras",
                        instruction:
                            "Escolha 2 pares que mais te confundiram e crie uma ancora com sensacao, nao com regra.",
                        example:
                            "{{ship vs sheep|ship vs sheep}} → {{ship|navio}} = curto (corte), {{sheep|ovelha}} = longo (esticado).",
                        fields: [
                            { id: "a1", label: "Minha Âncora 1 (par)", placeholder: "Ex: {{bit/beat|bit/beat}}" },
                            { id: "a1_hint", label: "Minha âncora (sensação)", placeholder: "Ex: bit = curto / beat = longo" },
                            { id: "a2", label: "Minha Âncora 2 (par)", placeholder: "Ex: {{full/fool|full/fool}}" },
                            { id: "a2_hint", label: "Minha âncora (sensação)", placeholder: "Ex: full = curto / fool = longo" }
                        ]
                    })
                },
                {
                    type: "checksum",
                    content: JSON.stringify({
                        title: "{{Quick Wrap-Up|Fechamento Rapido}} — checagem final",
                        rule:
                            "Se voce ja consegue responder isso com mais clareza, seu ouvido comecou a ajustar.",
                        questions: [
                            {
                                q: "Qual e o objetivo real deste modulo?",
                                options: [
                                    "Aprender varias palavras novas",
                                    "Separar sons que meu ouvido ainda mistura",
                                    "Estudar regras de gramatica"
                                ],
                                answer: 1
                            },
                            {
                                q: "O que significa treinar o {{Dry Ending|final seco}} aqui?",
                                options: [
                                    "Falar mais alto para ser entendido",
                                    "Parar a palavra no ponto certo, sem vogal extra",
                                    "Falar mais devagar para soar correto"
                                ],
                                answer: 1
                            },
                            {
                                q: "Qual e o inimigo mais comum da escuta no comeco?",
                                options: [
                                    "Vocabulario pequeno",
                                    "Som embaralhado + demora para reagir",
                                    "Falta de legenda"
                                ],
                                answer: 1
                            }
                        ]
                    })
                },
                {
                    type: "tower-stamp",
                    content:
                        "ETAPA CONCLUIDA — {{SOUND SEPARATION|SEPARACAO DOS SONS}}\nVoce ainda nao precisa entender tudo. O importante aqui era comecar a ouvir diferenca onde antes parecia tudo igual.\n\nNa proxima etapa, voce vai perceber por que o ingles parece rapido quando, na verdade, o som e que vem conectado."
                }
            ]
        },
        {
            id: "p2-m3",
            title: "MÓDULO 3: {{CONNECTED SPEECH|SOM CONECTADO}}",
            subtitle: "Entendendo por que o ingles falado parece colado e rapido quando chega no ouvido.",
            status: "locked",
            blocks: [
                {
                    type: "tower-log",
                    content:
                        "AUDIO LOG #02 — {{CONNECTED SPEECH|SOM CONECTADO}}\n• Focus: {{LISTENING IN BLOCKS|ESCUTAR EM BLOCOS}}\n• Before: {{ISOLATED SOUNDS|SONS ISOLADOS}}\n• Now: {{FLOWING SPEECH|FALA CORRIDA}}\n\nNota: no ingles real, as palavras quase nunca chegam uma por uma do jeito que aparecem na tela."
                },

                {
                    type: "h2",
                    content: "O ingles real quase nunca chega em palavras separadas. Ele chega em blocos."
                },
                {
                    type: "paragraph",
                    content:
                        "Depois que voce comeca a separar melhor os sons, aparece outro problema: a sensacao de velocidade.\n\nMas o ingles nao parece rapido so porque a pessoa fala correndo. Ele parece rapido porque **as palavras se ligam, se encurtam e se empurram umas nas outras**.\n\nNeste modulo, voce vai aprender a ouvir isso do jeito certo."
                },

                {
                    type: "h3",
                    content: "3.1 {{Word Boundary Illusion|A ilusao de que existe um espacinho entre cada palavra}}"
                },
                {
                    type: "paragraph",
                    content:
                        "Seu cerebro foi treinado por texto, legenda e exercicio escolar. Por isso ele espera que cada palavra apareca certinha, com comeco e fim bem marcados.\n\nNo ingles falado, isso quase nunca acontece. O que chega no ouvido e uma corrente continua. O sentido vem do bloco inteiro, nao de cada pedacinho isolado."
                },

                {
                    type: "boundary-illusion",
                    content: JSON.stringify({
                        title: "{{Boundary Illusion|Ilusão de Fronteira}} — Onde a palavra começa?",
                        instruction:
                            "Ouça o audio e marque onde voce acha que a palavra comeca. Depois compare com o jeito como o som realmente veio.",
                        example:
                            "{{what do you want|o que voce quer}} → /wʌdjəˈwɑnə/\n\nVoce nao escuta tres palavras certinhas. Voce escuta um bloco so.",
                        insight:
                            "Quanto mais voce tenta achar espacos certinhos no meio do audio, mais atrasado voce fica."
                    })
                },

                {
                    type: "h3",
                    content: "3.2 {{Linking|Ligacao}}: quando uma palavra puxa a outra"
                },
                {
                    type: "paragraph",
                    content:
                        "Quando um som termina de um jeito e o proximo comeca logo em seguida, o ingles falado costuma ligar tudo. Isso nao e teatro. E so o jeito normal da fala correr.\n\nVoce nao precisa forcar isso na sua fala agora. Mas precisa reconhecer quando ouvir."
                },

                {
                    type: "linking-map",
                    content: JSON.stringify({
                        title: "{{Linking Map|Mapa de Ligação}} — padrões inevitáveis",
                        patterns: [
                            {
                                pattern: "{{Consonant → Vowel|Consoante → Vogal}}",
                                example: "{{turn it off|desligar}} → tur-ni-toff",
                                note: "O som nao para no meio. Ele desliza."
                            },
                            {
                                pattern: "{{Same Sound Merge|Fusão de Som Igual}}",
                                example: "{{black cat|gato preto}} → bla-cat",
                                note: "Seu ouvido sente uma batida so."
                            },
                            {
                                pattern: "{{Soft Transition|Transição Suave}}",
                                example: "{{see you|te vejo}} → seeyou",
                                note: "Nao tem espacinho claro no meio."
                            }
                        ],
                        rule:
                            "Se voce esperar ouvir cada palavra separadinha, sempre vai parecer que o ingles esta correndo mais do que voce."
                    })
                },

                {
                    type: "h3",
                    content: "3.3 {{Compression|Reducao}}: quando o ingles encurta o som"
                },
                {
                    type: "paragraph",
                    content:
                        "O ingles nao so conecta. Ele tambem encurta.\n\nPartes menos importantes da frase perdem forca, encolhem ou quase somem. Isso nao e erro. E so fala natural."
                },

                {
                    type: "compression-deck",
                    content: JSON.stringify({
                        title: "{{Compression Deck|Painel de Compressão}} — o som reduzido",
                        items: [
                            {
                                written: "{{going to|indo para}}",
                                compressed: "gonna",
                                why:
                                    "Na fala do dia a dia, o som encurta e fica mais leve."
                            },
                            {
                                written: "{{want to|querer}}",
                                compressed: "wanna",
                                why:
                                    "O bloco fica mais rapido de dizer e mais comum de ouvir."
                            },
                            {
                                written: "{{got to|ter que}}",
                                compressed: "gotta",
                                why:
                                    "A forma completa perde espaco na fala corrida."
                            },
                            {
                                written: "{{out of|fora de}}",
                                compressed: "outta",
                                why:
                                    "As bordas entre palavras somem."
                            }
                        ],
                        warning:
                            "Neste momento, o foco nao e imitar. E reconhecer quando isso aparece."
                    })
                },
                {
                    type: "audio-decode-game",
                    content: JSON.stringify({
                        title: "LEITURA DE BLOCO",
                        subtitle: "Aqui o foco e perceber o sentido da fala corrida, nao decorar som isolado.",
                        stepLabel: "Bloco",
                        passLabel: "Acerte pelo menos {passing}/{total} para provar que seu ouvido ja pegou o ritmo",
                        promptLabel: "O que essa fala corrida quer dizer?",
                        successTitle: "Leitura fechada",
                        failTitle: "Mais uma rodada",
                        restartLabel: "Recomeçar leitura",
                        helpButtonLabel: "Ver ajuda deste bloco",
                        helpConfirmMessage: "Tem certeza que deseja ver a ajuda deste bloco? Isso vai mostrar a forma completa e as traducoes.",
                        items: [
                            {
                                phonetic: "Lemme know",
                                decoded: "{{Let me know.|Me avisa.}}",
                                translation: "Me avisa.",
                                options: [
                                    "{{Let me know.|Me avisa.}}",
                                    "{{Leave me alone.|Me deixa em paz.}}",
                                    "{{Let me go.|Me deixa ir.}}"
                                ],
                                answer: 0
                            },
                            {
                                phonetic: "We kinda rushed it",
                                decoded: "{{We kind of rushed it.|A gente fez isso meio na correria.}}",
                                translation: "A gente fez isso meio na correria.",
                                options: [
                                    "{{We can rush it.|A gente consegue acelerar isso.}}",
                                    "{{We kind of rushed it.|A gente fez isso meio na correria.}}",
                                    "{{We rushed to it.|A gente correu ate la.}}"
                                ],
                                answer: 1
                            },
                            {
                                phonetic: "You gotta be kidding",
                                decoded: "{{You have got to be kidding.|Voce so pode estar zoando.}}",
                                translation: "Voce so pode estar zoando.",
                                options: [
                                    "{{You need to be careful.|Voce precisa tomar cuidado.}}",
                                    "{{You have got to be kidding.|Voce so pode estar zoando.}}",
                                    "{{You are getting hidden.|Voce esta ficando escondido.}}"
                                ],
                                answer: 1
                            },
                            {
                                phonetic: "I ain't ready yet",
                                decoded: "{{I am not ready yet.|Eu ainda nao estou pronto.}}",
                                translation: "Eu ainda nao estou pronto.",
                                options: [
                                    "{{I am not ready yet.|Eu ainda nao estou pronto.}}",
                                    "{{I already read it.|Eu ja li isso.}}",
                                    "{{I am ready now.|Agora eu estou pronto.}}"
                                ],
                                answer: 0
                            }
                        ]
                    })
                },

                {
                    type: "h3",
                    content: "3.4 {{Block Decoding|Ouvir em bloco}}: entender sem depender de cada palavra"
                },
                {
                    type: "paragraph",
                    content:
                        "Agora entra uma virada importante: em vez de tentar capturar palavra por palavra, voce vai responder a perguntas mais inteligentes:\n\n• O que esta acontecendo?\n• O que a pessoa quer?\n• Tem pressa ou nao?\n\nQuando voce pega isso, ja pegou a parte mais importante."
                },

                {
                    type: "block-decode",
                    content: JSON.stringify({
                        title: "{{Block Decode|Decodificação de Bloco}} — resposta operacional",
                        instruction:
                            "Ouça o bloco e escolha a interpretacao correta. Nao tente decorar som por som.",
                        samples: [
                            {
                                audio: "we gotta push this back",
                                options: [
                                    "Alguém está cancelando tudo",
                                    "Alguém quer adiar algo",
                                    "Alguém está acelerando o plano"
                                ],
                                answer: 1
                            },
                            {
                                audio: "I dunno if that's gonna work",
                                options: [
                                    "Certeza absoluta",
                                    "Dúvida / risco",
                                    "Entusiasmo"
                                ],
                                answer: 1
                            }
                        ],
                        goal:
                            "Se voce captou a intencao principal, sua escuta ja esta funcionando melhor."
                    })
                },

                {
                    type: "latency-check",
                    content: JSON.stringify({
                        title: "{{Latency Check|Checagem de Latência}} — você ainda está atrasado?",
                        description:
                            "Responda com sinceridade:",
                        items: [
                            "Eu ainda tento ouvir palavra por palavra.",
                            "Eu entendo o bloco, mas me perco nos detalhes.",
                            "Eu já consigo captar intenção rapidamente."
                        ],
                        interpretation:
                            "Se a ultima opcao ja parece mais real para voce, seu ouvido comecou a acompanhar melhor o ritmo."
                    })
                },

                {
                    type: "tower-stamp",
                    content:
                        "ETAPA CONCLUIDA — {{CONNECTED SPEECH|SOM CONECTADO}}\n\nVoce parou de esperar palavras separadas demais e comecou a ouvir grupos de som mais reais.\n\nNa proxima etapa, voce vai aprender a pegar o que importa numa frase: tom, enfase e intencao."
                }
            ]
        },
        {
            id: "p2-m4",
            title: "MÓDULO 4: {{CATCH THE INTENTION|PEGAR A INTENCAO}}",
            subtitle: "Lendo enfase, entonacao e clima da frase para entender o que realmente importa.",
            status: "locked",
            blocks: [
                {
                    type: "radar-console",
                    content:
                        "{{INTENTION MODE|MODO INTENCAO}} — {{ACTIVE|ATIVO}}\n• Input: {{Continuous Speech|Fala corrida}}\n• Focus: {{INTENTION|INTENCAO}} + {{URGENCY|URGÊNCIA}} + {{TONE|TOM}}\n• Rule: {{You do not need every word to understand the point|Voce nao precisa de cada palavra para entender o ponto}}\n\nNota: ouvir bem nao e ouvir tudo. E perceber o que carrega o sentido principal."
                },

                {
                    type: "h2",
                    content: "Voce nao precisa ouvir tudo. Precisa perceber onde esta a intencao da frase."
                },
                {
                    type: "paragraph",
                    content:
                        "Ate aqui, voce ja comecou a limpar o som e a ouvir em bloco. Agora entra uma camada muito importante: **priorizacao**.\n\nNo ingles falado, duas pistas ajudam muito:\n• **{{Stress|Enfase}}**: onde a frase bate mais forte\n• **{{Intonation|Entonacao}}**: para onde a frase aponta\n\nQuando voce aprende a ler isso, para de depender de entender cada palavra."
                },

                {
                    type: "h3",
                    content: "4.1 A frase tem picos"
                },
                {
                    type: "paragraph",
                    content:
                        "Toda frase tem partes que batem mais forte. Geralmente e ali que mora a informacao principal.\n\nMuita gente tenta dar o mesmo peso para tudo. So que, no ingles falado, isso cansa o ouvido e atrasa a compreensao.\n\nAqui voce vai treinar a perceber a fala como um **{{energy map|mapa de energia}}**."
                },

                {
                    type: "stress-heatmap",
                    content: JSON.stringify({
                        title: "{{Stress Heatmap|Mapa de Calor de Ênfase}} — onde a frase realmente 'bate'",
                        instruction:
                            "Leia as linhas e marque mentalmente as palavras que parecem 'mais fortes'. Você não precisa saber a palavra exata — só localizar os picos.",
                        lines: [
                            {
                                text: "I NEED it by TOMORROW.",
                                peaks: ["NEED", "TOMORROW"],
                                why:
                                    "Os picos carregam urgência e prazo. O resto é estrutura."
                            },
                            {
                                text: "We CAN'T do it RIGHT now.",
                                peaks: ["CAN'T", "RIGHT"],
                                why:
                                    "Negação + {{timing|tempo}}. Você já tem 80% do sentido."
                            },
                            {
                                text: "I THOUGHT you said MONDAY.",
                                peaks: ["THOUGHT", "MONDAY"],
                                why:
                                    "{{Conflict|Conflito}} de informação: memória vs data."
                            }
                        ],
                        rule:
                            "Se voce pegar os picos, ja para de se sentir completamente perdido."
                    })
                },

                {
                    type: "h3",
                    content: "4.2 {{Intonation Trace|Entonacao}}: a direcao invisivel da frase"
                },
                {
                    type: "paragraph",
                    content:
                        "{{Intonation|Entonacao}} mostra direcao.\n\nEla ajuda voce a perceber coisas como:\n• e pergunta ou afirmacao?\n• e certeza ou duvida?\n• e convite, aviso ou ordem?\n• tem calor, tensao, ironia?\n\nVoce nao precisa entender todas as palavras para perceber isso. Precisa treinar a curva da fala."
                },

                {
                    type: "intonation-trace",
                    content: JSON.stringify({
                        title: "{{Intonation Trace|Traçado de Entonação}} — leitura por curva",
                        instruction:
                            "Assine a intenção de cada linha apenas pela curva (subindo/descendo).",
                        items: [
                            {
                                line: "You're coming.",
                                contour: "↘",
                                intent: "Afirmação / decisão já tomada",
                                danger:
                                    "Se você tratar como pergunta, você responde errado e perde autoridade."
                            },
                            {
                                line: "You're coming?",
                                contour: "↗",
                                intent: "Pergunta / confirmação",
                                danger:
                                    "Se você tratar como afirmação, você parece desatento."
                            },
                            {
                                line: "Right…",
                                contour: "↘↘ (lento)",
                                intent: "{{Skepticism|Ceticismo}} / discordância disfarçada",
                                danger:
                                    "Você acha que foi concordância. Não foi."
                            },
                            {
                                line: "Okay!",
                                contour: "↗↘ (rápido)",
                                intent: "{{Acceptance|Aceitação}} / energia",
                                danger:
                                    "Você acha que foi neutro. Foi positivo."
                            }
                        ],
                        rule:
                            "Muitas vezes a curva da frase ja entrega a intencao antes de voce entender o detalhe."
                    })
                },

                {
                    type: "h3",
                    content: "4.3 {{Meaning Shift|Mesma frase, sentido diferente}}"
                },
                {
                    type: "paragraph",
                    content:
                        "Aqui fica claro por que entender so as palavras nao basta.\n\nCom a mesma frase, a enfase muda o foco do recado. O que muda nao e o vocabulario. E o lugar onde o peso caiu."
                },

                {
                    type: "emphasis-shift",
                    content: JSON.stringify({
                        title: "{{Meaning Shift|Mudança de Significado}} — {{stress|ênfase}} muda o comando",
                        instruction:
                            "Escolha a leitura correta (intenção) para cada variação.",
                        base: "I didn't say we should cancel it.",
                        variants: [
                            {
                                stressed: "I DIDN'T say we should cancel it.",
                                options: [
                                    "Eu disse isso sim",
                                    "Eu nego ter dito isso",
                                    "Eu quero cancelar agora"
                                ],
                                answer: 1,
                                note:
                                    "O peso está na negação. {{Defense|Defesa}}."
                            },
                            {
                                stressed: "I didn't SAY we should cancel it.",
                                options: [
                                    "Eu insinuei, mas não falei claramente",
                                    "Eu falei com certeza",
                                    "Eu estou cancelando"
                                ],
                                answer: 0,
                                note:
                                    "O peso está no '{{say|dizer}}'. Foi outra forma de comunicar."
                            },
                            {
                                stressed: "I didn't say we should CANCEL it.",
                                options: [
                                    "O problema é cancelar especificamente",
                                    "O problema é a gente",
                                    "O problema é o horário"
                                ],
                                answer: 0,
                                note:
                                    "O alvo é a ação: {{cancel|cancelar}}."
                            }
                        ],
                        rule:
                            "{{Stress|Enfase}} muda o foco. E o foco muda a resposta."
                    })
                },
                {
                    type: "combat-sort-game",
                    content: JSON.stringify([
                        { "text": "{{Could you please repeat the full sentence slowly for me?|Voce poderia repetir a frase inteira devagar para mim?}}", "type": "lab" },
                        { "text": "{{So you need this by tomorrow, right?|Entao voce precisa disso ate amanha, certo?}}", "type": "combat" },
                        { "text": "{{I did not understand your statement.|Eu nao entendi sua afirmacao.}}", "type": "lab" },
                        { "text": "{{Wait, so the main point is the deadline?|Pera, entao o principal aqui e o prazo?}}", "type": "combat" },
                        { "text": "{{Could you clarify your intention in another manner?|Voce poderia esclarecer sua intencao de outra maneira?}}", "type": "lab" },
                        { "text": "{{Got it. You're not saying no forever, just not now.|Entendi. Voce nao esta dizendo nao para sempre, so nao agora.}}", "type": "combat" }
                    ])
                },

                {
                    type: "h3",
                    content: "4.4 {{Priority Extraction|Pegar o principal em 3 sinais}}"
                },
                {
                    type: "paragraph",
                    content:
                        "Quando o audio vier baguncado, seu cerebro vai querer entrar em panico. Para nao cair nisso, voce vai treinar um filtro bem simples:\n\n1) **{{ACTION|ACAO}}**: o que esta sendo pedido ou feito\n2) **{{TIME|TEMPO}}**: quando isso importa\n3) **{{TONE|TOM}}**: como a pessoa esta vindo\n\nEsses tres sinais ja ajudam muito."
                },

                {
                    type: "triage-drill",
                    content: JSON.stringify({
                        title: "{{Triage Drill|Exercício de Triagem}} — {{ACTION|AÇÃO}} / {{TIME|TEMPO}} / {{TONE|TOM}}",
                        instruction:
                            "Para cada entrada, responda somente com 3 tags: [{{ACTION|AÇÃO}}] [{{TIME|TEMPO}}] [{{TONE|TOM}}].",
                        entries: [
                            {
                                input: "Can you send it over by end of day?",
                                expectedTags: ["enviar", "hoje", "neutro/objetivo"],
                                note:
                                    "Mesmo se você perder '{{send it over|enviar}}', você ainda pode captar pedido + prazo."
                            },
                            {
                                input: "We might need to rethink this.",
                                expectedTags: ["reavaliar", "em aberto", "incerto"],
                                note:
                                    "'{{Might|Pode ser}}' puxa dúvida. Isso muda como você responde."
                            },
                            {
                                input: "No, we're not doing that.",
                                expectedTags: ["recusar", "agora", "firme"],
                                note:
                                    "Negação + firmeza: não é debate."
                            }
                        ],
                        rule:
                            "Se voce sai com essas tres tags, ja consegue responder muito melhor, mesmo sem entender tudo."
                    })
                },

                {
                    type: "h3",
                    content: "4.5 {{Jamming Simulation|Interferencia seletiva}}: foco mesmo sem audio limpo"
                },
                {
                    type: "paragraph",
                    content:
                        "No mundo real, o audio nao vem limpinho. Tem palavra comida, barulho, microfone ruim, fala cortada.\n\nNesta simulacao, a ideia e voce continuar pegando o principal mesmo com parte da frase encoberta."
                },

                {
                    type: "selective-jamming",
                    content: JSON.stringify({
                        title: "{{Selective Jamming|Interferência Seletiva}} — foco sob interferência",
                        instruction:
                            "Imagine que partes da frase foram cobertas por ruído. Você ainda precisa entender a missão.",
                        samples: [
                            {
                                masked: "We ___ need this ___ Friday.",
                                question: "Qual é a missão?",
                                options: [
                                    "Entregar algo até sexta",
                                    "Cancelar algo na sexta",
                                    "Viajar na sexta"
                                ],
                                answer: 0,
                                hint:
                                    "Mesmo mascarado, o pico '{{Friday|sexta-feira}}' segura o tempo. O resto você infere."
                            },
                            {
                                masked: "I'm ___ sure this ___ work.",
                                question: "Qual é o {{tone|tom}}?",
                                options: ["certeza", "dúvida", "raiva"],
                                answer: 1,
                                hint:
                                    "O '{{not sure|não tenho certeza}}' é sinal de risco."
                            }
                        ],
                        rule:
                            "Se voce depende de cada palavra para entender, qualquer ruido te derruba."
                    })
                },

                {
                    type: "h3",
                    content: "4.6 {{Response Protocol|Como responder quando voce so pegou o essencial}}"
                },
                {
                    type: "paragraph",
                    content:
                        "Agora vem uma das partes mais uteis: nao basta entender mais ou menos. Voce precisa responder sem se desmontar.\n\nAqui voce vai treinar respostas curtas que:\n• confirmam o que voce captou\n• pedem so o ajuste necessario\n• mantem a conversa andando\n\nSem drama. Sem desculpa desnecessaria. Sem travar."
                },

                {
                    type: "control-responses",
                    content: JSON.stringify({
                        title: "{{Control Responses|Respostas de Controle}} — respostas de torre",
                        instruction:
                            "Escolha a resposta que mantém controle com informação parcial.",
                        situations: [
                            {
                                heard: "…by tomorrow…",
                                youKnow: "prazo",
                                options: [
                                    "I didn't understand anything.",
                                    "Got it — by tomorrow. I'll send it over.",
                                    "Can you repeat all of that slowly, please?"
                                ],
                                answer: 1,
                                note:
                                    "Você confirma o que captou (tempo) e responde com ação."
                            },
                            {
                                heard: "…not sure…work…",
                                youKnow: "dúvida/risco",
                                options: [
                                    "Okay.",
                                    "So there's some risk. What's the main blocker?",
                                    "Sorry, my English is bad."
                                ],
                                answer: 1,
                                note:
                                    "Você transforma dúvida em diagnóstico. Isso é operador."
                            },
                            {
                                heard: "…we're not doing that…",
                                youKnow: "recusa firme",
                                options: [
                                    "Why?",
                                    "Understood. What's the alternative?",
                                    "I think you're wrong."
                                ],
                                answer: 1,
                                note:
                                    "Você aceita o comando e pede rota alternativa."
                            }
                        ],
                        rule:
                            "A melhor resposta costuma ser para a intencao da frase, nao para cada palavra isolada."
                    })
                },

                {
                    type: "operator-notes",
                    content:
                        "ANOTACAO FINAL\n\nSe este modulo te mexeu, e porque ele cutuca uma ideia antiga: a de que entender = ouvir todas as palavras.\n\nAqui voce treinou outra base:\n• entender = perceber picos + curva + intencao\n\nIsso deixa a escuta mais leve e a resposta mais firme."
                },

                {
                    type: "completion-seal",
                    content:
                        "{{CATCH THE INTENTION|PEGAR A INTENCAO}} — {{COMPLETE|CONCLUIDO}}\nVoce aprendeu a:\n• notar onde a frase bate mais forte\n• ler intencao pela entonacao\n• extrair o principal em poucos sinais\n• responder melhor mesmo sem audio perfeito\n\nNa proxima etapa, voce vai aplicar isso em fala mais baguncada, sotaque e pressao real."
                }
            ]
        },
        {
            id: "p2-m5",
            title: "MÓDULO 5: {{MESSY ENGLISH, REAL LIFE|INGLES BAGUNCADO, VIDA REAL}}",
            subtitle: "Quando o audio vem com sotaque, emocao, frase quebrada e voce mesmo assim precisa entender o suficiente.",
            status: "locked",
            blocks: [
                {
                    type: "spectrum-init",
                    content:
                        "{{REAL WORLD MODE|MODO MUNDO REAL}} — {{ACTIVE|ATIVO}}\n• {{Signal Quality|Qualidade do Audio}}: VARIABLE\n• {{Noise Level|Ruido}}: REAL\n• {{Accent Variation|Variacao de Sotaque}}: PRESENTE\n• {{Perfect Conditions|Condicoes Perfeitas}}: ZERO\n\nNota: se voce so entende ingles limpinho, pausado e bem certinho, seu ouvido ainda esta treinado para aula e nao para vida real."
                },

                {
                    type: "h2",
                    content: "O ingles da vida real nao coopera com voce."
                },
                {
                    type: "paragraph",
                    content:
                        "Ate aqui, voce treinou por partes. Agora entra a etapa em que tudo mistura.\n\nAqui o audio pode vir:\n• cortado\n• acelerado\n• emocional\n• com {{accent|sotaque}}\n• com erro de quem esta falando\n\nE mesmo assim, voce ainda precisa entender o suficiente para agir. Esse e o treino que mais parece com conversa real."
                },

                {
                    type: "h3",
                    content: "5.1 {{Accent Drift|Sotaque muda o som, nao a missao}}"
                },
                {
                    type: "paragraph",
                    content:
                        "Nao existe um ingles unico. O som muda de pessoa para pessoa, de lugar para lugar e de contexto para contexto.\n\nMuita gente trava porque compara tudo com um ingles idealizado da propria cabeca. O problema e que, fora da aula, a fala real nao pede permissao para vir bonita.\n\nAqui voce vai treinar a aceitar variacao sem sair do eixo."
                },

                {
                    type: "accent-drift-map",
                    content: JSON.stringify({
                        title: "{{Accent Drift Map|Mapa de Deriva de Sotaque}} — o que muda de verdade",
                        instruction:
                            "Observe os padroes. Nao e para decorar sotaque. E para notar tendencias e continuar entendendo a ideia principal.",
                        accents: [
                            {
                                profile: "{{Fast / Reduced|Rápido / Reduzido}}",
                                characteristics: [
                                    "vogais encurtadas",
                                    "consoantes coladas",
                                    "{{aggressive rhythm|ritmo agressivo}}"
                                ],
                                risk:
                                    "Pode soar como pressa ou raiva sem necessariamente ser isso."
                            },
                            {
                                profile: "{{Flat / Low Intonation|Plano / Entonação Baixa}}",
                                characteristics: [
                                    "pouca variação de tom",
                                    "{{stress|ênfase}} menos evidente",
                                    "{{constant rhythm|ritmo constante}}"
                                ],
                                risk:
                                    "Pode soar frio ou distante, mesmo sendo neutro."
                            },
                            {
                                profile: "{{Heavy Stress Shifts|Mudanças de Ênfase Intensas}}",
                                characteristics: [
                                    "{{emphasis|ênfase}} inesperada",
                                    "{{irregular rhythm|ritmo irregular}}",
                                    "pausas onde não se espera"
                                ],
                                risk:
                                    "Quem tenta entender o jeito antes do conteudo geralmente se perde."
                            }
                        ],
                        rule:
                            "Nao lute contra o sotaque. Escute atraves dele."
                    })
                },

                {
                    type: "h3",
                    content: "5.2 {{Imperfect English|Quando o ingles ruim vem do outro lado}}"
                },
                {
                    type: "paragraph",
                    content:
                        "Nem todo mundo fala ingles bem. E isso vai acontecer com cliente, colega, parceiro, motorista, atendente, qualquer pessoa.\n\nVoce vai ouvir:\n• gramatica quebrada\n• frase pela metade\n• ordem estranha de palavras\n\nIsso pode parecer ruim no comeco, mas tem um lado bom: mostra que comunicacao real nao depende de perfeicao. Primeiro, porem, voce precisa conseguir entender o ingles imperfeito deles."
                },

                {
                    type: "imperfect-input",
                    content: JSON.stringify({
                        title: "{{Imperfect Input|Entrada Imperfeita}} — compreensão sem correção",
                        instruction:
                            "Ignore a forma. Capture a funcao. O que importa aqui nao e a frase bonita. E o que a pessoa esta tentando comunicar.",
                        samples: [
                            {
                                input: "Yesterday he no come meeting.",
                                question: "Qual é a informação relevante?",
                                options: [
                                    "Ele cancelou tudo",
                                    "Ele faltou à reunião",
                                    "Ele chegou atrasado"
                                ],
                                answer: 1,
                                insight:
                                    "A forma esta errada. A mensagem continua clara."
                            },
                            {
                                input: "We try fix tomorrow maybe.",
                                question: "Qual é o estado da situação?",
                                options: [
                                    "Solução confirmada",
                                    "Tentativa futura incerta",
                                    "Problema resolvido"
                                ],
                                answer: 1,
                                insight:
                                    "'{{Try|Tentar}}' + '{{maybe|talvez}}' = baixa certeza. Nao e promessa."
                            },
                            {
                                input: "I not understand why decision this.",
                                question: "O que essa pessoa está expressando?",
                                options: [
                                    "Concordância total",
                                    "Confusão / discordância com uma decisão",
                                    "Pedido de prazo"
                                ],
                                answer: 1,
                                insight:
                                    "Mesmo com a estrutura torta, a intencao aparece."
                            }
                        ],
                        rule:
                            "Conversa real nao da nota de gramatica. Ela cobra entendimento."
                    })
                },

                {
                    type: "h3",
                    content: "5.3 {{Emotional Overlay|Quando a emocao muda o jeito da fala}}"
                },
                {
                    type: "paragraph",
                    content:
                        "Emocao muda a fala inteira: velocidade, volume, clareza e ate escolha de palavra.\n\nO erro mais comum e responder ao calor da emocao em vez de responder ao que a pessoa realmente quer.\n\nAqui voce vai aprender a separar **{{emotion|emocao}}** de **{{content|conteudo}}**."
                },

                {
                    type: "emotional-overlay",
                    content: JSON.stringify({
                        title: "{{Emotional Overlay|Sobreposição Emocional}} — emoção não é instrução",
                        instruction:
                            "Para cada cenário, identifique emoção e missão separadamente. Responda à missão, não ao tom.",
                        scenarios: [
                            {
                                audio: "This is taking forever!",
                                emotion: "{{frustration|frustração}}",
                                missionOptions: [
                                    "Cancelar o projeto imediatamente",
                                    "Acelerar ou cobrar andamento",
                                    "Ignorar completamente"
                                ],
                                answer: 1,
                                note:
                                    "O tom é forte, mas a ação pedida é simples: acelerar."
                            },
                            {
                                audio: "I just don't see how this helps.",
                                emotion: "{{skepticism|ceticismo}}",
                                missionOptions: [
                                    "Defender a ideia atacando a pessoa",
                                    "Explicar valor / justificar a abordagem",
                                    "Encerrar a conversa"
                                ],
                                answer: 1,
                                note:
                                    "Não é ataque. É dúvida. A resposta é explicação, não defesa."
                            },
                            {
                                audio: "Fine. Whatever works.",
                                emotion: "{{resigned acceptance|resignação}}",
                                missionOptions: [
                                    "Celebrar como vitória",
                                    "Avançar com cuidado — há resistência silenciosa",
                                    "Ignorar e seguir adiante sem verificar"
                                ],
                                answer: 1,
                                note:
                                    "'{{Fine|Tudo bem}}' com tom plano raramente é entusiasmo. É sinal de alerta."
                            }
                        ],
                        rule:
                            "Responder so ao tom costuma piorar a conversa. Responder ao ponto principal costuma melhorar."
                    })
                },

                {
                    type: "h3",
                    content: "5.4 {{Partial Loss|Quando voce perde parte do audio}}"
                },
                {
                    type: "paragraph",
                    content:
                        "Voce nao vai entender tudo. Nem em ingles, nem em portugues. Isso e normal.\n\nO problema nao e perder parte do audio. O problema e nao saber o que fazer quando isso acontece.\n\nAqui o treino e exatamente esse: seguir em frente com o que voce conseguiu captar."
                },

                {
                    type: "partial-loss-drill",
                    content: JSON.stringify({
                        title: "{{Partial Loss Drill|Exercício de Perda Parcial}} — operar com informação incompleta",
                        instruction:
                            "Você só entende fragmentos. Decida a melhor ação possível sem pedir repetição total.",
                        cases: [
                            {
                                heard: "…{{send|enviar}}… {{Friday|sexta}}… {{issue|problema}}…",
                                options: [
                                    "{{Ask for full repetition|Pedir repetição total}}",
                                    "{{Confirm deadline and ask about the issue|Confirmar prazo e perguntar sobre o problema}}",
                                    "{{Ignore and wait|Ignorar e aguardar}}"
                                ],
                                answer: 1,
                                insight:
                                    "Você confirma o que captou (prazo + problema) e abre espaço para o resto. Isso é controle."
                            },
                            {
                                heard: "…{{not approved|não aprovado}}… {{budget|orçamento}}…",
                                options: [
                                    "{{Argue immediately|Argumentar imediatamente}}",
                                    "{{Acknowledge and ask next steps|Confirmar e perguntar próximos passos}}",
                                    "{{Stay silent indefinitely|Ficar em silêncio indefinidamente}}"
                                ],
                                answer: 1,
                                insight:
                                    "{{Acceptance|Aceitação}} + próximo passo mantém você no jogo. Argumentar sem informação completa é fraqueza."
                            },
                            {
                                heard: "…{{team thinks|equipe acha}}… {{different approach|abordagem diferente}}…",
                                options: [
                                    "{{Defend current plan immediately|Defender o plano atual imediatamente}}",
                                    "{{Clarify what approach they prefer|Esclarecer qual abordagem preferem}}",
                                    "{{Agree to everything|Concordar com tudo}}"
                                ],
                                answer: 1,
                                insight:
                                    "Com informação parcial, clarificar é mais poderoso que defender ou ceder."
                            }
                        ],
                        rule:
                            "Nao espere clareza total para agir. Conversa real quase nunca funciona assim."
                    })
                },

                {
                    type: "h3",
                    content: "5.5 {{Self-Regulation|Ficar estavel por dentro}}"
                },
                {
                    type: "paragraph",
                    content:
                        "O maior inimigo aqui nao e o audio dificil. E a reacao interna.\n\nQuando bate panico, o ouvido fecha. Quando voce se encolhe, a resposta sai pior. Quando trava demais, a conversa te atropela.\n\nPor isso voce vai treinar uma sequencia simples para voltar ao eixo."
                },

                {
                    type: "self-regulation-protocol",
                    content: JSON.stringify({
                        title: "{{Stability Protocol|Protocolo de Estabilidade}} — 4 passos em ordem",
                        steps: [
                            {
                                number: 1,
                                action: "{{Breathing|Respiração}} curta e silenciosa — 2 ciclos",
                                why: "Baixa a aceleracao interna antes da resposta."
                            },
                            {
                                number: 2,
                                action: "{{Confirm what was understood|Confirmar o que foi entendido}}",
                                why: "Mostra que voce continua dentro da conversa, mesmo sem ter pego tudo."
                            },
                            {
                                number: 3,
                                action: "{{One directed question|Uma pergunta direcionada — apenas uma}}",
                                why: "Uma pergunta bem colocada ajuda mais do que pedir tudo de novo de uma vez."
                            },
                            {
                                number: 4,
                                action: "{{Simple action or calibration request|Ação simples ou pedido de ajuste}}",
                                why: "Fecha a resposta com movimento, e nao com desculpa."
                            }
                        ],
                        warning:
                            "Pedir desculpa nao organiza sua escuta. Estrutura organiza.\n'Sorry, my English is bad' quase sempre te deixa menor do que a situacao pede."
                    })
                },
                {
                    type: "combat-sort-game",
                    content: JSON.stringify([
                        { "text": "{{I did not completely understand your speech.|Eu nao compreendi completamente a sua fala.}}", "type": "lab" },
                        { "text": "{{I got the main part. Can you say that last bit again?|Peguei a parte principal. Pode repetir o finalzinho?}}", "type": "combat" },
                        { "text": "{{Please repeat everything from the beginning very slowly.|Por favor, repita tudo desde o comeco bem devagar.}}", "type": "lab" },
                        { "text": "{{So the issue is the budget, right?|Entao a questao aqui e o orcamento, certo?}}", "type": "combat" },
                        { "text": "{{I am sorry, my listening is insufficient.|Desculpe, minha escuta e insuficiente.}}", "type": "lab" },
                        { "text": "{{Wait, I missed one part. What's the main blocker?|Pera, perdi uma parte. Qual e o principal travamento?}}", "type": "combat" }
                    ])
                },

                {
                    type: "h3",
                    content: "5.6 {{Readiness Check|Checagem final}}: onde sua escuta esta agora"
                },
                {
                    type: "paragraph",
                    content:
                        "Este e o ultimo ponto tecnico antes da avaliacao do tutor.\n\nResponda com honestidade. Nao com o que voce queria que ja estivesse perfeito."
                },

                {
                    type: "readiness-check",
                    content: JSON.stringify({
                        title: "{{Readiness Check|Verificação de Prontidão}} — diagnóstico final",
                        description: "Marque apenas o que e verdadeiro agora, nao o que voce queria que ja fosse.",
                        questions: [
                            {
                                text: "Consigo entender {{intention|intenção}} mesmo perdendo palavras?",
                                signal: "{{listening|escuta}} operacional"
                            },
                            {
                                text: "Consigo responder sem entrar em {{panic|pânico}} ou travar?",
                                signal: "{{response control|controle de resposta}}"
                            },
                            {
                                text: "Consigo operar com {{accent|sotaque}} e áudio imperfeito?",
                                signal: "{{spectrum tolerance|tolerância ao espectro}}"
                            },
                            {
                                text: "Consigo manter controle emocional quando o inglês vem agressivo ou confuso?",
                                signal: "{{self-regulation|autorregulação}}"
                            }
                        ],
                        interpretation:
                            "4 marcados: sua base auditiva esta bem firme.\n3 marcados: voce ja avancou bastante e a avaliacao vai mostrar o ajuste fino.\n2 ou menos: a avaliacao vai te mostrar com clareza onde apertar mais."
                    })
                },

                {
                    type: "transition-brief",
                    content:
                        "{{TRANSITION BRIEF|PASSAGEM PARA A AVALIACAO}}\n\nVoce treinou com audio limpo, com som conectado, com intencao e com fala baguncada.\n\nNo proximo modulo, voce fecha essa etapa e envia sua avaliacao.\nDepois disso, a equipe vai olhar sua resposta para confirmar se essa base auditiva esta pronta para sustentar o Pilar 3."
                },

                {
                    type: "completion-seal",
                    content:
                        "{{MESSY ENGLISH, REAL LIFE|INGLES BAGUNCADO, VIDA REAL}} — {{COMPLETE|CONCLUIDO}}\n\nVoce nao precisa entender tudo para agir bem.\nPrecisa entender o suficiente para manter a conversa viva, fazer perguntas certas e nao desabar quando o audio vem imperfeito.\n\nEssa e a base real que este modulo queria construir."
                }
            ]
        },
        {
            id: "p2-m6",
            title: "MÓDULO 6: {{CLOSING THIS STAGE|FECHANDO ESTA ETAPA}}",
            subtitle: "Fechando o Pilar 2 com clareza, calma e preparo para a avaliacao.",
            status: "locked",
            blocks: [
                {
                    type: "soft-status",
                    content:
                        "{{STATUS DA ETAPA|STATUS DA ETAPA}}\n• {{Listening Base|Base de escuta}}: {{BUILT|CONSTRUIDA}}\n• {{Cognitive Load|Carga mental}}: {{LIGHTER|MAIS LEVE}}\n• {{Next Step|Proximo passo}}: {{TUTOR REVIEW|ANALISE DO TUTOR}}\n\nRespira. A parte mais densa ficou para tras."
                },

                {
                    type: "h2",
                    content: "Para um segundo. Voce merece fechar isso com calma."
                },
                {
                    type: "paragraph",
                    content:
                        "Antes de pensar no proximo pilar, vale reconhecer o que aconteceu aqui.\n\nO Pilar 2 foi a parte mais pesada da escuta. E isso nao foi por acaso. Cada modulo apertou um ponto que costuma travar o brasileiro quando o ingles sai da tela e entra no audio."
                },

                {
                    type: "h3",
                    content: "O que já mudou em você"
                },
                {
                    type: "paragraph",
                    content:
                        "Talvez voce ainda nao sinta tudo isso com nitidez. E tudo bem.\n\nEscuta melhora primeiro por dentro. Muitas vezes a pessoa so percebe o quanto avancou quando volta para uma situacao que antes derrubava."
                },

                {
                    type: "simple-list",
                    content: [
                        "Você aprendeu a ouvir sem traduzir palavra por palavra",
                        "Você aprendeu a aceitar imperfeição como parte do processo",
                        "Você aprendeu a responder mesmo sem certeza total",
                        "Você aprendeu a se manter mais inteiro quando o inglês vem difícil",
                        "Você treinou algo que a maioria nunca treina: {{composure|calma}} sob pressão real"
                    ]
                },

                {
                    type: "h3",
                    content: "O que acontece agora"
                },
                {
                    type: "paragraph",
                    content:
                        "Daqui para frente, o processo muda.\n\nDepois da sua prova, a equipe vai avaliar o que voce enviou para confirmar se essa base auditiva realmente firmou.\n\nSe estiver tudo certo, o proximo pilar e liberado. Se ainda precisar de ajuste, voce recebe o direcionamento para refazer com mais clareza."
                },

                {
                    type: "paragraph",
                    content:
                        "Nao e para te pegar. Nao e para te humilhar. Nao e para te provar que voce nao sabe.\n\nE so uma checagem seria para garantir que o proximo passo esta vindo na hora certa."
                },

                {
                    type: "h3",
                    content: "Sobre a sua avaliacao"
                },
                {
                    type: "paragraph",
                    content:
                        "No proximo passo, voce vai responder a avaliacao final deste pilar.\n\nDepois de enviada, ela fica em analise. E a partir do Pilar 2 essa aprovacao passa a ser obrigatoria para liberar o proximo nivel."
                },

                {
                    type: "soft-warning",
                    title: "Uma coisa importante antes de enviar",
                    content:
                        "Voce nao precisa tentar parecer melhor do que esta agora.\n\nNao decore. Nao force frase bonita. Nao tente adivinhar o que a equipe quer ler.\n\nA ideia e mostrar seu ponto real. E isso ajuda muito mais na sua evolucao."
                },

                {
                    type: "h3",
                    content: "Se algo ainda parece confuso"
                },
                {
                    type: "paragraph",
                    content:
                        "Normal. Completamente normal.\n\nO ouvido demora um pouco para assentar. Algumas conexoes aparecem enquanto voce pratica, e outras so ficam nitidas depois.\n\nConfia no processo e no que voce ja construiu ate aqui."
                },

                {
                    type: "final-note",
                    content:
                        "Voce nao terminou o Pilar 2 tentando ouvir ingles como aluno de escola.\n\nVoce terminou aprendendo a lidar com ingles falado de verdade.\n\nIsso muda bastante coisa daqui para frente."
                },

                {
                    type: "pilar2-end",
                    title: "PILAR 2 — {{COMPLETE|CONCLUIDO}}",
                    content:
                        "A parte mais tecnica da sua escuta foi fechada.\n\nAgora vem a avaliacao desta etapa.\n\nDepois do envio, a equipe analisa e libera o Pilar 3 quando essa base estiver pronta."
                }
            ]
        }
    ]
};

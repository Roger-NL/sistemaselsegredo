import { PillarData } from "@/types/study";

export const PILAR_2_DATA: PillarData = {
    id: 2,
    title: "PILAR 2: TOWER CONTROL",
    subtitle: "A primeira fase técnica. Reprogramando seu hardware auditivo para operar em frequências nativas.",
    modules: [
        {
            id: "p2-intro",
            title: "MÓDULO 1: {{START HERE|COMECE POR AQUI}}",
            subtitle: "Briefing de missão e mentalidade técnica necessária para a fase de áudio.",
            status: "active",
            blocks: [
                {
                    type: "system-status",
                    content: "{{ACCESSING...|ACESSANDO...}} {{SYSTEM STATUS: TECHNICAL PHASE INITIALIZED|STATUS DO SISTEMA: FASE TÉCNICA INICIALIZADA}}... {{ERROR PROTOCOL: EXPECTED|PROTOCOLO DE ERRO: ESPERADO}}..."
                },
                {
                    type: "h2",
                    content: "Bem-vindo à Grade, Operador."
                },
                {
                    type: "paragraph",
                    content: "Você venceu o Pilar 1. Sua mentalidade foi resetada. Agora, o treinamento técnico começa de verdade. O **{{Pillar 2: Tower Control|Pilar 2: Controle de Torre}}** é o seu rito de passagem."
                },
                {
                    type: "box-warning",
                    title: "⚠️ O {{ERROR PROTOCOL|PROTOCOLO DE ERRO}}",
                    content: "Nesta fase, o erro não é apenas permitido, ele é esperado. Se você entender tudo de primeira, você está no treinamento errado. Cada falha de percepção é um dado de calibração para o seu sistema."
                },
                {
                    type: "h3",
                    content: "1.2 Sistema de Ranks ({{Flight Career|Carreira de Voo}})"
                },
                {
                    type: "paragraph",
                    content: "Seu progresso não é medido por 'aulas assistidas', mas por **patentes de comando**. Cada nível exige mais precisão auditiva e controle operacional:"
                },
                {
                    type: "list",
                    content: [
                        "**1. {{Passenger|Passageiro}}:** Você está apenas observando o sistema.",
                        "**2. {{Flight Cadet|Cadete de Voo}}:** Você entrou em formação e começou a treinar com método.",
                        "**3. {{Route Navigator|Navegador de Rota}}:** Você identifica caminhos e mantém direção sob pressão.",
                        "**4. {{Crew Operator|Tripulante de Bordo}}:** Você já participa da operação de forma ativa.",
                        "**5. {{Cabin Operator|Operador de Cabine}}:** Você organiza processos e mantém o controle do ambiente.",
                        "**6. {{Co-Pilot|Co-piloto}}:** Domínio técnico avançado e suporte operacional.",
                        "**7. {{First Officer|Primeiro Oficial}}:** Você assume decisões rápidas e sustenta a missão em campo.",
                        "**8. {{Captain|Capitão}}:** Autonomia total em situações de voo real.",
                        "**9. {{Senior Captain|Capitão Sênior}}:** Alta consistência, leitura de risco e liderança operacional.",
                        "**10. {{Commander|Comandante}}:** Autoridade máxima e referência de performance no sistema."
                    ]
                },
                {
                    type: "elite-insight",
                    title: "🛑 A REGRA DE {{STOP|PARADA}} ({{Safety Protocol|Protocolo de Segurança}})",
                    content: "Você NÃO poderá avançar para o Pilar 3 sem avaliação e aprovação de um instrutor de elite. Isso não é uma punição, é segurança operacional. Não enviamos operadores para o campo sem rádio funcional."
                }
            ]
        },
        {
            id: "p2-p1",
            title: "MÓDULO 2: {{SIGNAL DECONSTRUCTION|DESCONSTRUÇÃO DE SINAL}}",
            subtitle: "Limpando o ruído. Isolando os fonemas que seu cérebro colapsa em 1 só som.",
            status: "active",
            blocks: [
                {
                    type: "tower-log",
                    content:
                        "TOWER LOG #01 — {{SESSION START|INÍCIO DA SESSÃO}}\n• Channel: {{AUDIO_IN|ENTRADA_DE_ÁUDIO}}\n• Mode: {{ANALYTICAL HEARING|AUDIÇÃO ANALÍTICA}}\n• Threat: {{PORTUGUESE AUTO-INTERPRETER|AUTO-INTÉRPRETE DE PORTUGUÊS}}\n• Goal: {{Separate signal from noise|Separar sinal de ruído}}\n\nNota da Torre: aqui você não aprende palavras. Você aprende a OUVIR."
                },
                { type: "h2", content: "O que você acha que é “{{fast English|inglês rápido}}” é só áudio mal decodificado." },
                {
                    type: "paragraph",
                    content:
                        "Seu cérebro faz um truque sujo: ele pega sons diferentes e **amassa tudo em um só** pra economizar energia. \n\nIsso funciona no português. No inglês, isso te destrói.\n\nNesta Parte 1, você vai fazer o que um controlador faz: **isolar sinal**. Se você não isola, você não controla."
                },
                {
                    type: "sonic-scan",
                    content: JSON.stringify({
                        title: "{{Sonic Scan|Varredura Sônica}} — Autoavaliação de Hardware",
                        instructions:
                            "Marque o que acontece com você. Não é vergonha. É diagnóstico.",
                        items: [
                            "Quando um nativo fala, eu sinto um ‘paredão’ de som.",
                            "Eu entendo no texto, mas no áudio parece outra língua.",
                            "Eu confundo palavras curtas (ex: {{bit/beat|bit/beat}}, {{ship/sheep|ship/sheep}}).",
                            "Eu ouço ‘{{ready|pronto}}’ quando a pessoa disse ‘{{red|vermelho}}’.",
                            "Eu tento traduzir e perco o resto da frase."
                        ],
                        output:
                            "Se marcou 2+ itens, seu problema não é vocabulário. É {{DECODING|DECODIFICAÇÃO}}."
                    })
                },
                { type: "h3", content: "1.1 {{Frequency Sweep|Varredura de Frequência}}: você vai ouvir em camadas" },
                {
                    type: "paragraph",
                    content:
                        "A Torre não ouve tudo de uma vez. Ela faz varredura. \n\nVocê vai treinar em 3 camadas:\n\n1) **Diferença mínima** (sons quase idênticos)\n2) **Final seco** (parar no fim sem inventar vogal)\n3) **Identificação rápida** (reagir sem pensar)\n\nSe você pensa demais, seu cérebro chama o tradutor interno e você perde o controle."
                },
                {
                    type: "a-b-snaptest",
                    content: JSON.stringify({
                        title: "{{A/B SnapTest|Teste Rápido A/B}} — 2 segundos por alvo",
                        rule:
                            "Sem legenda. Sem pausa mental. Você escolhe A ou B no instinto. O objetivo é TREINAR SEU RADAR, não sua gramática.",
                        items: [
                            { id: "ab1", label: "Alvo 1", a: "{{ship|navio}}", b: "{{sheep|ovelha}}" },
                            { id: "ab2", label: "Alvo 2", a: "{{bit|um pouco}}", b: "{{beat|batida}}" },
                            { id: "ab3", label: "Alvo 3", a: "{{full|cheio}}", b: "{{fool|tolo}}" },
                            { id: "ab4", label: "Alvo 4", a: "{{cut|cortar}}", b: "{{cat|gato}}" },
                            { id: "ab5", label: "Alvo 5", a: "{{live|morar/viver}}", b: "{{leave|sair/partir}}" }
                        ],
                        scoring:
                            "Você não precisa acertar tudo. Você precisa descobrir quais pares te quebram — esses serão seus ‘pontos cegos’."
                    })
                },
                {
                    type: "latency-meter",
                    content: JSON.stringify({
                        title: "{{Latency Meter|Medidor de Latência}} — o inimigo invisível",
                        description:
                            "Seu cérebro perde a conversa não porque erra — mas porque demora. Marque seu padrão:",
                        options: [
                            "Eu respondo rápido mesmo errando.",
                            "Eu travo tentando ter certeza.",
                            "Eu traduzo mentalmente antes de escolher."
                        ],
                        verdicts: [
                            "Rápido mesmo errando = operador treinável.",
                            "Travar = ansiedade de performance (precisa de protocolo).",
                            "Traduzir = {{bug of configuration|erro de configuração}} (vamos remover aos poucos)."
                        ]
                    })
                },
                { type: "h3", content: "1.2 {{Noise Gate|Portão de Ruído}}: o treino do {{DRY ENDING|FINAL SECO}}" },
                {
                    type: "paragraph",
                    content:
                        "Aqui é onde o brasileiro se entrega sem perceber: ele adiciona um som fantasma depois da consoante final. \n\nA Torre chama isso de **{{Noise Gate|Portão de Ruído}}**: você precisa cortar o áudio exatamente no final. \n\nNão é ‘pronúncia bonita’. É **clareza de sinal**."
                },
                {
                    type: "cutoff-drill",
                    content: JSON.stringify({
                        title: "{{Cutoff Drill|Treino de Corte}} — Trava no penhasco",
                        instruction:
                            "Fale e PARE. Não deslize para nenhuma vogal extra. Repita 5x cada.",
                        items: [
                            { word: "{{stop|parar}}", cutoff: "p" },
                            { word: "{{back|atrás}}", cutoff: "k" },
                            { word: "{{red|vermelho}}", cutoff: "d" },
                            { word: "{{cap|boné}}", cutoff: "p" },
                            { word: "{{hot|quente}}", cutoff: "t" }
                        ],
                        warning:
                            "Se você ouvir um ‘i’ no final (stopi/backi), seu {{Noise Gate|Portão de Ruído}} falhou."
                    })
                },
                {
                    type: "misfire-cases",
                    content: JSON.stringify({
                        title: "{{Misfire Cases|Casos de Falha de Disparo}} — quando 1 som te derruba",
                        cases: [
                            {
                                whatYouSay: "{{redi|redi}}",
                                whatTheyHear: "{{ready|pronto}}",
                                whyItHurts:
                                    "Você acha que falou cor. O nativo entende estado. Isso muda decisões em call."
                            },
                            {
                                whatYouSay: "{{stopy|stopy}}",
                                whatTheyHear: "{{stop|parar}}",
                                whyItHurts:
                                    "Parece infantil, incerto, inseguro — e ainda atrapalha a percepção do comando."
                            },
                            {
                                whatYouSay: "{{cabi|cabi}}",
                                whatTheyHear: "{{cab|táxi/cabine}}",
                                whyItHurts:
                                    "Você acha que está falando boné. Pode soar como táxi."
                            }
                        ],
                        note:
                            "Não é ‘sotaque’. É ambiguidade de sinal."
                    })
                },
                { type: "h3", content: "1.3 {{Anchor Lock|Bloqueio de Âncora}}: criando âncoras sonoras (sem tradução)" },
                {
                    type: "paragraph",
                    content:
                        "Seu cérebro aprende melhor com âncora do que com regra. \n\nUma âncora sonora é um **contraste brutal** que você nunca mais esquece. \n\nVocê vai escolher 2 âncoras pessoais agora."
                },
                {
                    type: "anchor-builder",
                    content: JSON.stringify({
                        title: "{{Anchor Builder|Construtor de Âncoras}} — escolha suas 2 âncoras",
                        instruction:
                            "Escolha 2 pares que mais te confundiram e crie uma âncora com sensação, não com tradução.",
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
                        title: "{{Checksum|Soma de Verificação}} — validação rápida",
                        rule:
                            "Se você consegue responder isso sem pensar, seu sinal começou a limpar.",
                        questions: [
                            {
                                q: "Qual é o objetivo real desta Parte 1?",
                                options: [
                                    "Aprender muitas palavras novas",
                                    "Separar sons que meu cérebro colapsa",
                                    "Estudar regras de gramática"
                                ],
                                answer: 1
                            },
                            {
                                q: "O que é o {{Noise Gate|Portão de Ruído}} aqui?",
                                options: [
                                    "Falar mais alto para ser entendido",
                                    "Cortar no final seco sem vogal extra",
                                    "Falar devagar para soar correto"
                                ],
                                answer: 1
                            },
                            {
                                q: "Qual é o inimigo nº1 do listening no início?",
                                options: [
                                    "Vocabulário pequeno",
                                    "Ambiguidade sonora + demora de processamento",
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
                        "TOWER STAMP — {{PART 1 COMPLETE|PARTE 1 CONCLUÍDA}}\nVocê não ‘aprendeu inglês’. Você instalou controle de sinal.\n\nPróxima etapa: você vai sincronizar frequência e perceber que o “rápido” era só conexão + redução.\n\nCâmbio."
                }
            ]
        },
        {
            id: "p2-m3",
            title: "MÓDULO 3: {{FREQUENCY SYNC|SINCRONIZAÇÃO DE FREQUÊNCIA}}",
            subtitle: "Conectando o sinal. Onde palavras isoladas viram blocos operacionais.",
            status: "locked",
            blocks: [
                {
                    type: "tower-log",
                    content:
                        "TOWER LOG #02 — {{FREQUENCY SYNC|SINCRONIZAÇÃO DE FREQUÊNCIA}}\n• Channel: {{CONTINUOUS AUDIO|ÁUDIO CONTÍNUO}}\n• Mode: {{BLOCK DECODING|DECODIFICAÇÃO DE BLOCO}}\n• Previous State: {{ISOLATED SOUNDS|SONS ISOLADOS}}\n• Target State: {{CONTINUOUS FLOW|FLUXO CONTÍNUO}}\n\nNota da Torre: entender palavra por palavra é lento demais para o mundo real."
                },

                {
                    type: "h2",
                    content: "O inglês real não chega em palavras. Ele chega em blocos."
                },
                {
                    type: "paragraph",
                    content:
                        "Depois de limpar o ruído grosso, surge um novo problema: **velocidade percebida**.\n\nAqui está a verdade operacional:\n\nO inglês não soa rápido porque as pessoas falam depressa. Ele soa rápido porque **as fronteiras entre palavras desaparecem**.\n\nNeste módulo, você vai parar de procurar espaços inexistentes."
                },

                {
                    type: "h3",
                    content: "3.1 {{Word Boundary Illusion|Ilusão de Fronteira de Palavra}}"
                },
                {
                    type: "paragraph",
                    content:
                        "Seu cérebro foi treinado para acreditar que cada palavra começa e termina de forma clara.\n\nNo inglês falado, isso é falso.\n\nO que existe são **ondas contínuas**, e o significado vem do bloco, não da palavra."
                },

                {
                    type: "boundary-illusion",
                    content: JSON.stringify({
                        title: "{{Boundary Illusion|Ilusão de Fronteira}} — Onde a palavra começa?",
                        instruction:
                            "Ouça o áudio e marque onde você ACHA que a palavra começa. Depois veja a segmentação real.",
                        example:
                            "{{what do you want|o que você quer}} → /wʌdjəˈwɑnə/\n\nNão existem três palavras audíveis. Existe um único bloco.",
                        insight:
                            "Quanto mais você procura espaços, mais você se perde."
                    })
                },

                {
                    type: "h3",
                    content: "3.2 {{Linking|Ligação}}: soldando frequências"
                },
                {
                    type: "paragraph",
                    content:
                        "Quando um som termina aberto e o próximo começa aberto, o cérebro nativo **solda** tudo.\n\nNão é escolha. É economia de energia.\n\nVocê não precisa falar assim agora. Mas precisa **ouvir assim**."
                },

                {
                    type: "linking-map",
                    content: JSON.stringify({
                        title: "{{Linking Map|Mapa de Ligação}} — padrões inevitáveis",
                        patterns: [
                            {
                                pattern: "{{Consonant → Vowel|Consoante → Vogal}}",
                                example: "{{turn it off|desligar}} → tur-ni-toff",
                                note: "A palavra nunca 'para'. Ela escorre."
                            },
                            {
                                pattern: "{{Same Sound Merge|Fusão de Som Igual}}",
                                example: "{{black cat|gato preto}} → bla-cat",
                                note: "O cérebro ouve uma pancada só."
                            },
                            {
                                pattern: "{{Soft Transition|Transição Suave}}",
                                example: "{{see you|te vejo}} → seeyou",
                                note: "Nenhum espaço audível."
                            }
                        ],
                        rule:
                            "Se você espera ouvir cada palavra separada, você sempre chegará atrasado."
                    })
                },

                {
                    type: "h3",
                    content: "3.3 {{Compression|Compressão}}: quando o inglês espreme o áudio"
                },
                {
                    type: "paragraph",
                    content:
                        "Além de conectar, o inglês **comprime**.\n\nSílabas fracas perdem forma. Sons inteiros desaparecem.\n\nIsso não é erro. É eficiência."
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
                                    "O cérebro mantém apenas o núcleo informacional."
                            },
                            {
                                written: "{{want to|querer}}",
                                compressed: "wanna",
                                why:
                                    "Redução elimina esforço desnecessário."
                            },
                            {
                                written: "{{got to|ter que}}",
                                compressed: "gotta",
                                why:
                                    "Som fraco não sobrevive à velocidade real."
                            },
                            {
                                written: "{{out of|fora de}}",
                                compressed: "outta",
                                why:
                                    "Fronteira de palavra colapsa."
                            }
                        ],
                        warning:
                            "Você não está autorizado a falar assim ainda. Sua missão aqui é reconhecer."
                    })
                },

                {
                    type: "h3",
                    content: "3.4 {{Block Decoding|Decodificação de Bloco}}: entender sem traduzir"
                },
                {
                    type: "paragraph",
                    content:
                        "Agora vem a mudança crítica.\n\nVocê vai ouvir blocos completos e responder apenas a isso:\n\n• O que está acontecendo?\n• Qual é a intenção?\n• Existe urgência ou não?\n\nPalavras específicas são secundárias."
                },

                {
                    type: "block-decode",
                    content: JSON.stringify({
                        title: "{{Block Decode|Decodificação de Bloco}} — resposta operacional",
                        instruction:
                            "Ouça o bloco e escolha a interpretação correta. Não tente lembrar palavras.",
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
                            "Se você capturou intenção, você venceu o {{listening|escuta}}."
                    })
                },

                {
                    type: "latency-check",
                    content: JSON.stringify({
                        title: "{{Latency Check|Checagem de Latência}} — você ainda está atrasado?",
                        description:
                            "Responda honestamente:",
                        items: [
                            "Eu ainda tento ouvir palavra por palavra.",
                            "Eu entendo o bloco, mas me perco nos detalhes.",
                            "Eu já consigo captar intenção rapidamente."
                        ],
                        interpretation:
                            "Se marcou a última opção, sua frequência começou a sincronizar."
                    })
                },

                {
                    type: "tower-stamp",
                    content:
                        "TOWER STAMP — {{FREQUENCY SYNC COMPLETE|SINCRONIZAÇÃO DE FREQUÊNCIA CONCLUÍDA}}\n\nVocê parou de caçar palavras isoladas.\nVocê começou a ouvir blocos reais.\n\nPróxima etapa: filtrar o que importa e ignorar o resto.\nPrepare o radar."
                }
            ]
        },
        {
            id: "p2-m4",
            title: "MÓDULO 4: {{RADAR LOCK|TRAVA DE RADAR}}",
            subtitle: "Filtrando o sinal. {{Stress|Ênfase}}, entonação e intenção — a leitura que acontece acima das palavras.",
            status: "locked",
            blocks: [
                {
                    type: "radar-console",
                    content:
                        "{{RADAR CONSOLE|CONSOLE DE RADAR}} — {{LOCK SEQUENCE|SEQUÊNCIA DE TRAVA}}\n• Input: {{Continuous Speech|Fala Contínua}}\n• Target: {{INTENTION|INTENÇÃO}} + {{URGENCY|URGÊNCIA}} + {{DIRECTION|DIREÇÃO}}\n• Rule: {{Words are optional. Signals are mandatory.|Palavras são opcionais. Sinais são obrigatórios.}}\n\nNota da Torre: um operador não entende tudo. Um operador entende o que importa."
                },

                {
                    type: "h2",
                    content: "Você não precisa ouvir tudo. Você precisa travar o radar no que carrega intenção."
                },
                {
                    type: "paragraph",
                    content:
                        "Até aqui você já limpou ruído e começou a reconhecer blocos.\n\nAgora vem a camada que separa amador de operador: **priorização**.\n\nO inglês falado tem duas pistas que quase ninguém treina:\n• **{{Stress|Ênfase}}** (onde a frase bate)\n• **{{Intonation|Entonação}}** (para onde a frase aponta)\n\nQuando você aprende a ler essas duas coisas, você consegue operar mesmo quando perde palavras."
                },

                {
                    type: "h3",
                    content: "4.1 O princípio do {{Radar|Radar}}: a frase tem picos"
                },
                {
                    type: "paragraph",
                    content:
                        "Toda frase tem picos de energia. Esses picos são onde mora a informação real.\n\nSeu cérebro brasileiro tende a dar o mesmo peso para tudo. No inglês, isso é suicídio auditivo.\n\nAqui você vai treinar a enxergar a fala como **{{energy map|mapa de energia}}**."
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
                            "Se você captar os picos, você não entra em pânico. Você sabe do que se trata."
                    })
                },

                {
                    type: "h3",
                    content: "4.2 {{Intonation Trace|Traçado de Entonação}}: a seta invisível"
                },
                {
                    type: "paragraph",
                    content:
                        "{{Intonation|Entonação}} é direção.\n\nEla responde perguntas como:\n• é pergunta ou afirmação?\n• é certeza ou dúvida?\n• é convite ou ordem?\n• é ironia ou literal?\n\nVocê não precisa entender todas as palavras para capturar isso. Você precisa ler a curva."
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
                            "A curva te dá intenção antes da palavra te dar detalhe."
                    })
                },

                {
                    type: "h3",
                    content: "4.3 {{Meaning Shift|Mudança de Significado}}: a mesma frase, três missões diferentes"
                },
                {
                    type: "paragraph",
                    content:
                        "Agora você vai ver por que 'entender palavras' é frágil.\n\nCom as mesmas palavras, o {{stress|ênfase}} muda a missão.\n\nVocê vai treinar a detectar **onde o falante colocou o peso** — porque isso muda o alvo."
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
                            "{{Stress|Ênfase}} = mira. A mira define o que você responde."
                    })
                },

                {
                    type: "h3",
                    content: "4.4 {{Priority Extraction|Extração de Prioridade}}: capturar missão em 3 sinais"
                },
                {
                    type: "paragraph",
                    content:
                        "Quando o áudio vier caótico, seu cérebro quer entrar em modo pânico.\n\nAqui você instala um protocolo de extração em três sinais:\n\n1) **{{ACTION|AÇÃO}}** (o que está sendo feito/pedido)\n2) **{{TIME|TEMPO}}** (agora, depois, amanhã, urgente)\n3) **{{TONE|TOM}}** (leve, tenso, irritado, incerto)\n\nVocê vai treinar isso sem depender de texto."
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
                            "Se você sai com tags corretas, você está operacional mesmo sem transcrição."
                    })
                },

                {
                    type: "h3",
                    content: "4.5 {{Jamming Simulation|Simulação de Interferência}}: ruído seletivo (treino de foco real)"
                },
                {
                    type: "paragraph",
                    content:
                        "O mundo real não te dá áudio limpo.\n\nNesta simulação, você vai sofrer interferência em palavras 'de baixa importância'.\n\nObjetivo: manter o radar travado nos picos e na curva, ignorando o resto."
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
                            "Se você precisa de cada palavra para entender, você não tem controle — você tem dependência."
                    })
                },

                {
                    type: "h3",
                    content: "4.6 {{Response Protocol|Protocolo de Resposta}}: como responder quando você só pegou o essencial"
                },
                {
                    type: "paragraph",
                    content:
                        "Agora a parte mais valiosa: não basta entender. Você precisa responder sem parecer perdido.\n\nVocê vai usar {{control responses|respostas de controle}} que:\n• confirmam intenção\n• pedem ajuste mínimo\n• mantêm você no comando\n\nSem se justificar. Sem pedir desculpas. Sem cair no modo frágil."
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
                            "Você responde ao que a frase QUER, não ao que a frase DIZ palavra por palavra."
                    })
                },

                {
                    type: "operator-notes",
                    content:
                        "NOTAS DO OPERADOR (gravadas no sistema)\n\nSe você travou neste módulo, não é porque ele é difícil.\nÉ porque ele ataca a sua crença antiga de que 'entender = palavras'.\n\nAqui você instalou outro padrão:\n• entender = picos + curva + intenção\n\nIsso reduz pânico em tempo real."
                },

                {
                    type: "completion-seal",
                    content:
                        "{{RADAR LOCK|TRAVA DE RADAR}} — {{COMPLETE|CONCLUÍDO}}\nVocê aprendeu a:\n• localizar picos de informação\n• ler intenção pela {{intonation|entonação}}\n• extrair missão em 3 sinais\n• responder com controle mesmo com áudio incompleto\n\nPróxima etapa: caos real — sotaques, ruído e condições adversas.\nA Torre vai testar seu sistema em espectro total."
                }
            ]
        },
        {
            id: "p2-m5",
            title: "MÓDULO 5: {{FULL SPECTRUM OPERATIONS|OPERAÇÕES EM ESPECTRO TOTAL}}",
            subtitle: "Operando sob pressão. Quando o inglês vem sujo, imperfeito e sem aviso.",
            status: "locked",
            blocks: [
                {
                    type: "spectrum-init",
                    content:
                        "{{FULL SPECTRUM MODE|MODO ESPECTRO TOTAL}} — ENABLED\n• {{Signal Quality|Qualidade do Sinal}}: UNSTABLE\n• {{Noise Level|Nível de Ruído}}: VARIABLE\n• {{Accent Drift|Deriva de Sotaque}}: ACTIVE\n• {{Expectation|Expectativa}}: ZERO\n\nNota da Torre: se você só entende inglês limpo, você não entende inglês.\nEste módulo não tem condições ideais. Isso é intencional."
                },

                {
                    type: "h2",
                    content: "O inglês do mundo real não coopera com você."
                },
                {
                    type: "paragraph",
                    content:
                        "Até agora, você treinou com intenção clara.\n\nNeste módulo, isso acaba.\n\nAqui o áudio vem:\n• cortado\n• apressado\n• emocional\n• com {{accent|sotaque}}\n• com erros\n\nE mesmo assim, **você precisa entender o suficiente para agir**.\n\nEsta é a diferença entre operador e estudante."
                },

                {
                    type: "h3",
                    content: "5.1 {{Accent Drift|Deriva de Sotaque}}: quando o inglês muda de forma"
                },
                {
                    type: "paragraph",
                    content:
                        "Não existe um inglês único.\n\nO som muda conforme quem fala — e você vai ouvir todos os tipos no campo real.\n\nNeste ponto, muitos alunos quebram porque tentam comparar tudo com o inglês 'ideal' da cabeça deles.\n\nVocê vai aprender a aceitar variação sem travar. A missão não muda porque o sotaque mudou."
                },

                {
                    type: "accent-drift-map",
                    content: JSON.stringify({
                        title: "{{Accent Drift Map|Mapa de Deriva de Sotaque}} — o que muda de verdade",
                        instruction:
                            "Observe os padrões. Não memorize sotaques. Identifique tendências e extraia missão apesar delas.",
                        accents: [
                            {
                                profile: "{{Fast / Reduced|Rápido / Reduzido}}",
                                characteristics: [
                                    "vogais encurtadas",
                                    "consoantes coladas",
                                    "{{aggressive rhythm|ritmo agressivo}}"
                                ],
                                risk:
                                    "Parece pressa ou raiva — mas pode ser apenas estilo."
                            },
                            {
                                profile: "{{Flat / Low Intonation|Plano / Entonação Baixa}}",
                                characteristics: [
                                    "pouca variação de tom",
                                    "{{stress|ênfase}} menos evidente",
                                    "{{constant rhythm|ritmo constante}}"
                                ],
                                risk:
                                    "Soa desinteressado — mas pode ser totalmente neutro."
                            },
                            {
                                profile: "{{Heavy Stress Shifts|Mudanças de Ênfase Intensas}}",
                                characteristics: [
                                    "{{emphasis|ênfase}} inesperada",
                                    "{{irregular rhythm|ritmo irregular}}",
                                    "pausas onde não se espera"
                                ],
                                risk:
                                    "O aluno perde o foco tentando entender o 'jeito' e perde o conteúdo."
                            }
                        ],
                        rule:
                            "Não lute contra o sotaque. Extraia a missão apesar dele."
                    })
                },

                {
                    type: "h3",
                    content: "5.2 {{Imperfect English|Inglês Imperfeito}}: quando o erro vem do outro lado"
                },
                {
                    type: "paragraph",
                    content:
                        "Nem todo mundo fala inglês bem. E isso vai acontecer — com clientes, parceiros, colegas.\n\nVocê vai ouvir:\n• gramática quebrada\n• frases incompletas\n• ordem estranha de palavras\n\nIsso é libertador: **se o outro erra e ainda é entendido, você também pode**.\n\nMas primeiro, você precisa entender o inglês imperfeito deles."
                },

                {
                    type: "imperfect-input",
                    content: JSON.stringify({
                        title: "{{Imperfect Input|Entrada Imperfeita}} — compreensão sem correção",
                        instruction:
                            "Ignore a forma. Capture a função. O que importa não é o que está gramaticalmente correto — é o que está sendo comunicado.",
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
                                    "A forma está errada. A mensagem está clara. 'No come' = 'didn't come'."
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
                                    "'{{Try|Tentar}}' + '{{maybe|talvez}}' = baixa certeza. Não é compromisso."
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
                                    "Mesmo com estrutura quebrada, '{{not understand|não entender}}' + '{{decision|decisão}}' = questionamento claro."
                            }
                        ],
                        rule:
                            "Campo real não dá nota de gramática. Ele cobra entendimento."
                    })
                },

                {
                    type: "h3",
                    content: "5.3 {{Emotional Overlay|Sobreposição Emocional}}: quando emoção distorce o áudio"
                },
                {
                    type: "paragraph",
                    content:
                        "Emoção muda tudo — velocidade, volume, clareza e escolha de palavras.\n\nO erro mais comum: reagir à emoção em vez de responder à missão.\n\nAqui você vai aprender a separar **{{emotion|emoção}}** de **{{content|conteúdo}}** para nunca reagir errado sob pressão."
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
                            "Responder à emoção gera conflito. Responder à missão gera controle."
                    })
                },

                {
                    type: "h3",
                    content: "5.4 {{Partial Loss|Perda Parcial}}: quando você perde 30–40% do áudio"
                },
                {
                    type: "paragraph",
                    content:
                        "Você não vai entender tudo. Nunca. Nem mesmo em português.\n\nIsso não é falha de inglês. É realidade de comunicação real.\n\nFalha é não saber o que fazer quando isso acontece.\n\nOperador não espera áudio perfeito — ele executa com o que tem."
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
                            "Não espere clareza total para agir. Campo não funciona assim."
                    })
                },

                {
                    type: "h3",
                    content: "5.5 {{Self-Regulation|Autorregulação}}: manter o sistema estável"
                },
                {
                    type: "paragraph",
                    content:
                        "O maior inimigo neste módulo não é o áudio difícil.\n\nÉ a reação interna.\n\nPânico fecha o ouvido. Desculpa fragiliza posição. Silêncio excessivo sinaliza colapso.\n\nAqui você instala um protocolo de estabilidade que funciona em tempo real — mesmo quando você sente que perdeu o controle."
                },

                {
                    type: "self-regulation-protocol",
                    content: JSON.stringify({
                        title: "{{Stability Protocol|Protocolo de Estabilidade}} — 4 passos em ordem",
                        steps: [
                            {
                                number: 1,
                                action: "{{Breathing|Respiração}} curta e silenciosa — 2 ciclos",
                                why: "Reduz ativação do {{panic response|resposta de pânico}} antes de qualquer palavra."
                            },
                            {
                                number: 2,
                                action: "{{Confirm what was understood|Confirmar o que foi entendido}}",
                                why: "Demonstra que você está no controle — mesmo sem entender tudo."
                            },
                            {
                                number: 3,
                                action: "{{One directed question|Uma pergunta direcionada — apenas uma}}",
                                why: "Pedir tudo de novo ao mesmo tempo soa como colapso. Uma pergunta soa como precisão."
                            },
                            {
                                number: 4,
                                action: "{{Simple action or calibration request|Ação simples ou pedido de ajuste}}",
                                why: "Encerra o ciclo com movimento — não com desculpa."
                            }
                        ],
                        warning:
                            "Pedir desculpa não regula sistema. Estrutura regula.\n'Sorry, my English is bad' não é humildade — é desarmamento."
                    })
                },

                {
                    type: "h3",
                    content: "5.6 {{Readiness Check|Verificação de Prontidão}}: você está pronto para o voo real?"
                },
                {
                    type: "paragraph",
                    content:
                        "Este é o último {{checkpoint|ponto de verificação}} técnico antes da validação humana.\n\nResponda com honestidade absoluta — não com o que você quer que seja verdade."
                },

                {
                    type: "readiness-check",
                    content: JSON.stringify({
                        title: "{{Readiness Check|Verificação de Prontidão}} — diagnóstico final",
                        description: "Marque apenas o que é verdadeiro agora, não o que você quer que seja.",
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
                            "4 marcados: sistema funcional. Você está pronto para o {{Check-Ride|Voo de Verificação}}.\n3 marcados: bom — a aula ao vivo vai ajustar o gap.\n2 ou menos: o {{Check-Ride|Voo de Verificação}} vai revelar exatamente onde ajustar."
                    })
                },

                {
                    type: "transition-brief",
                    content:
                        "{{TRANSITION BRIEF|BRIEFING DE TRANSIÇÃO}} — PREPARAÇÃO PARA VALIDAÇÃO\n\nVocê treinou em espectro total.\nAgora vem o voo acompanhado.\n\nNo próximo módulo, um profissional vai:\n• testar seu {{listening|escuta}} em tempo real\n• observar suas reações sob pressão\n• confirmar se seu controle é real — não ensaiado\n\nIsso não é prova de inglês.\nÉ prova de {{readiness|prontidão}}."
                },

                {
                    type: "completion-seal",
                    content:
                        "{{FULL SPECTRUM|ESPECTRO TOTAL}} — {{COMPLETE|CONCLUÍDO}}\n\nVocê não entende tudo.\nMas você entende o suficiente.\n\nIsso é {{functional fluency|fluência funcional}}.\nA Torre aguarda seu {{Check-Ride|Voo de Verificação}}."
                }
            ]
        },
        {
            id: "p2-m6",
            title: "MÓDULO 6: {{CLEARANCE|LIBERAÇÃO}}",
            subtitle: "Você chegou. Respire fundo. O difícil ficou para trás.",
            status: "locked",
            blocks: [
                {
                    type: "soft-status",
                    content:
                        "{{SYSTEM STATUS|STATUS DO SISTEMA}}\n• {{Technical Phase|Fase Técnica}}: COMPLETED\n• {{Cognitive Load|Carga Cognitiva}}: REDUCED\n• {{Next Step|Próximo Passo}}: {{HUMAN VALIDATION|VALIDAÇÃO HUMANA}}\n\nNota da Torre: respire. Você fez a parte difícil."
                },

                {
                    type: "h2",
                    content: "Pare um segundo. Você merece isso."
                },
                {
                    type: "paragraph",
                    content:
                        "Antes de qualquer próxima etapa, faça algo simples:\n\nPare.\n\nVocê acabou de atravessar a fase mais densa de todo o método.\n\nNenhum dos módulos anteriores foi fácil. E nenhum foi por acaso.\nCada exercício existia por um motivo. Cada desconforto tinha uma função."
                },

                {
                    type: "h3",
                    content: "O que já mudou em você"
                },
                {
                    type: "paragraph",
                    content:
                        "Você pode não sentir isso claramente ainda — e tudo bem.\n\nAlgumas mudanças são silenciosas no começo.\n\nMas algumas coisas já não são mais as mesmas — e isso é o que importa."
                },

                {
                    type: "simple-list",
                    content: [
                        "Você aprendeu a ouvir sem traduzir palavra por palavra",
                        "Você aprendeu a aceitar imperfeição como parte do processo",
                        "Você aprendeu a responder mesmo sem certeza total",
                        "Você aprendeu a manter controle quando o inglês vem difícil",
                        "Você treinou algo que a maioria nunca treina: {{composure|compostura}} sob pressão real"
                    ]
                },

                {
                    type: "h3",
                    content: "O que acontece agora"
                },
                {
                    type: "paragraph",
                    content:
                        "Daqui para frente, o sistema muda de forma.\n\nVocê não vai avançar sozinho.\n\nUm profissional vai ouvir você, observar como você reage — e confirmar se o que foi construído aqui já é real.\n\nNão é avaliação de inglês.\nÉ {{calibration|calibração}}."
                },

                {
                    type: "paragraph",
                    content:
                        "Não tem certo ou errado.\nNão tem nota.\nNão tem armadilha.\n\nTem apenas presença — a sua."
                },

                {
                    type: "h3",
                    content: "Sobre o agendamento"
                },
                {
                    type: "paragraph",
                    content:
                        "No próximo passo, você verá um calendário com horários disponíveis.\n\nEscolha um e pronto.\n\nOs horários são limitados intencionalmente — para garantir atenção real ao seu caso e respeito pelo seu tempo."
                },

                {
                    type: "soft-warning",
                    title: "Uma coisa importante antes de marcar",
                    content:
                        "Você não precisa estudar mais nada agora.\n\nNão revise.\nNão decore.\nNão tente parecer melhor do que você é.\n\nVenha exatamente como está — porque é assim que a validação funciona de verdade."
                },

                {
                    type: "h3",
                    content: "Se algo ainda parece confuso"
                },
                {
                    type: "paragraph",
                    content:
                        "Normal. Completamente normal.\n\nO ouvido demora mais para 'assentar' do que a mente.\n\nMuitas conexões acontecem depois que você para de forçar.\n\nConfie no processo — e confie no que você já construiu."
                },

                {
                    type: "final-note",
                    content:
                        "Você não terminou o Pilar 2 tentando entender inglês.\n\nVocê terminou aprendendo a lidar com ele.\n\nIsso muda tudo."
                },

                {
                    type: "pilar2-end",
                    title: "PILAR 2 — {{COMPLETE|CONCLUÍDO}}",
                    content:
                        "A fase técnica foi encerrada.\n\nAgora é humano com humano.\n\nA Torre aguarda seu agendamento."
                }
            ]
        }
    ]
};

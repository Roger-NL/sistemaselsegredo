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
                        "**2. {{Check-in Complete|Check-in Realizado}}:** Seus dados básicos foram validados.",
                        "**3. {{Frequent Flyer|Viajante Frequente}}:** Você já tem exposição constante ao sinal.",
                        "**4. {{Crew Member|Tripulante}}:** Você começou a operar o sistema de forma ativa.",
                        "**5. {{Co-Pilot|Co-piloto}}:** Domínio técnico avançado e suporte operacional.",
                        "**6. {{Captain|Capitão}}:** Autonomia total em situações de voo real.",
                        "**7. {{Commander|Comandante}} (Elite):** Você é a autoridade máxima e referência no campo."
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
            id: "p2-p3",
            title: "MÓDULO 4: RADAR LOCK",
            subtitle: "Filtrando o sinal e focando no que realmente importa na frase.",
            status: "locked",
            blocks: []
        },
        {
            id: "p2-p4",
            title: "MÓDULO 5: FULL SPECTRUM",
            subtitle: "Operando em condições reais: sotaques, ruídos e caos sonoro.",
            status: "locked",
            blocks: []
        },
        {
            id: "p2-final",
            title: "MÓDULO 6: CHECK-RIDE",
            subtitle: "Seu rito de passagem antes de avançar para o próximo Pilar.",
            status: "locked",
            blocks: []
        }
    ]
};

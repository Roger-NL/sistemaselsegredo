import { PillarData } from "@/types/study";

// ==============================================================================
// PILAR 1: INTRODUÇÃO & MINDSET (EXPANDED ELITE VERSION)
// ==============================================================================
export const PILAR_1_DATA: PillarData = {
    id: 1,
    title: "Pilar 1: Protocolo de Iniciação",
    subtitle: "A reconfiguração completa da sua mentalidade e a ciência por trás da fluência.",
    modules: [
        {
            id: "p1-m1",
            title: "Módulo 1: A Biologia do Travamento & O Filtro Afetivo",
            subtitle: "Hackear o sistema de defesa do seu cérebro para desativar o modo de pânico.",
            status: "active",
            blocks: [
                {
                    type: "system-status",
                    content: "{{NEURAL SCAN|Escaneamento Neural}}: {{INITIATED|Iniciado}}. {{ANALYZING COGNITIVE BLOCKS|Analisando Bloqueios Cognitivos}}..."
                },
                {
                    type: "box-goal",
                    title: "Objetivo do Módulo",
                    content: "Hackear o sistema de defesa do seu cérebro. Antes de aprender a falar, você precisa entender por que o seu hardware (biologia) está sabotando o seu software (aprendizado). Vamos desativar o modo de pânico e instalar o modo de processamento de elite."
                },
                {
                    type: "h2",
                    content: "1.1 A Anatomia do \"Branco\" Mental"
                },
                {
                    type: "paragraph",
                    content: "Você já esteve em uma situação onde precisava falar uma frase simples em inglês, mas sua mente se transformou em uma tela estática de TV antiga? Isso não é falta de inteligência; é o seu **Sistema Límbico** assumindo o controle da aeronave."
                },
                {
                    type: "brain-diagram",
                    content: JSON.stringify({
                        title: "🧠 CAMADA NEUROCIENTÍFICA: O SEQUESTRO DA AMÍGDALA",
                        steps: [
                            "No centro do seu cérebro existe uma estrutura chamada Amígdala. Ela é o seu radar tático para ameaças. Para o seu cérebro primitivo, não existe diferença entre um leão faminto e o julgamento social de falar \"wrong\" em uma reunião.",
                            "O Curto-Circuito: Quando o nível de estresse sobe (Filtro Afetivo), a Amígdala dispara cortisol. Este hormônio bloqueia as sinapses no Córtex Pré-Frontal (a sede do pensamento lógico e da gramática).",
                            "A Paralisia: O acesso à memória de longo prazo é cortado. Você \"sabe\" o conteúdo, mas o cabo está desconectado."
                        ]
                    })
                },
                {
                    type: "reveal-box",
                    title: "🔬 A CIÊNCIA DA MIELINA (Clique para expandir)",
                    content: "Nas escolas comuns, você estuda para a Memória Declarativa (saber sobre algo). Aqui, treinamos para a Mielinização. A mielina é uma camada de gordura que isola os neurônios; quanto mais você pratica um som real, mais espessa fica essa camada, tornando o impulso elétrico até 100x mais rápido."
                },
                {
                    type: "elite-insight",
                    title: "💡 INSIGHT DE ELITE",
                    content: "A fluência não é o tamanho do seu dicionário mental, mas a espessura da sua camada de mielina nos circuitos da fala."
                },
                {
                    type: "h2",
                    content: "1.2 Camada Cultural: O Complexo do \"Pajancu\" Brasileiro"
                },
                {
                    type: "paragraph",
                    content: "O aluno brasileiro médio sofre de uma síndrome cultural destrutiva: a necessidade de ser perfeito antes de ser funcional. Fomos ensinados a rir de quem erra a pronúncia, e isso criou uma geração de \"mudos alfabetizados\"."
                },
                {
                    type: "comparison-table",
                    content: JSON.stringify({
                        headers: ["Perfil", "Foco Principal", "Resultado na Crise", "Mentalidade"],
                        rows: [
                            ["O Acadêmico", "Perfeição Gramatical", "Travamento Total", "\"Se não for perfeito, não falo.\""],
                            ["O Operador ES", "Eficiência na Entrega", "Autonomia Tática", "\"A mensagem chegou? Missão cumprida.\""]
                        ]
                    })
                },
                {
                    type: "paragraph",
                    content: "**A Realidade do Nativo:** O falante nativo de inglês é, por natureza, preguiçoso e focado em eficiência. Ele não está analisando se você usou o {{Gerund|Gerúndio}} corretamente; ele quer saber se o café vai chegar quente ou frio. O erro é apenas um ruído na linha; o travamento é a queda total do sinal."
                },
                {
                    type: "h2",
                    content: "🛠️ Engenharia Reversa: O Desmonte do \"{{I Don't Know|Eu Não Sei}}\""
                },
                {
                    type: "paragraph",
                    content: "Vamos analisar como o cérebro processa uma das frases mais comuns do mundo e por que a forma como te ensinaram é um convite ao erro sob pressão."
                },
                {
                    type: "phonetic-breakdown",
                    content: JSON.stringify({
                        formal: {
                            text: "I do not know.",
                            analysis: "4 unidades de processamento: I + do + not + know"
                        },
                        combat: {
                            text: "I dunno.",
                            analysis: "1 unidade sonora: /aj-dã-nou/"
                        },
                        explanation: "Economia Glótica: No \"I do not know\", sua língua precisa tocar o céu da boca duas vezes (no 'd' e no 'n'). Isso exige coordenação motora fina que desaparece sob estresse. O Schwa (/ə/): No \"dunno\", o som do 'o' é substituído pelo som mais comum do inglês: o Schwa. É um som neutro, de relaxamento total da mandíbula. Intenção: Falar \"I do not know\" soa robótico ou excessivamente enfático. Falar \"I dunno\" sinaliza que você é parte do grupo, baixando a guarda do interlocutor."
                    })
                },
                {
                    type: "h2",
                    content: "⚔️ Cenário de Combate: O Labirinto do Aeroporto"
                },
                {
                    type: "scenario-card",
                    content: JSON.stringify({
                        context: "Você acabou de desembarcar em Chicago. Está atrasado para a conexão. Um funcionário da companhia aérea te para e fala em velocidade 1.5x.",
                        situation: "Sir, ya needa check ya gate 'cause it changed t'B12, got it?",
                        wrong: {
                            action: "O cérebro tenta traduzir \"Sir... you... need... to...\". Enquanto você traduz o \"need\", o funcionário já terminou a frase. O Filtro Afetivo sobe. Suor frio. Amígdala sequestra o cérebro.",
                            result: "\"Yes... sorry... my English is bad.\" (Missão Fracassada)"
                        },
                        right: {
                            action: "Ignore as \"Glue Words\": Você não precisa entender o \"ya\", \"needa\", \"'cause\". Foque nos \"Content Words\": Você ouviu GATE, CHANGE, B12.",
                            result: "\"Gate B12? Okay, thanks!\" — Você usou o Mínimo Viável de Comunicação. Cortisol baixo, confiança alta."
                        }
                    })
                },
                {
                    type: "box-warning",
                    title: "⚠️ VÍCIO BRASILEIRO DETECTADO",
                    content: "Pare de pedir desculpas pelo seu inglês. Cada vez que você diz \"{{Sorry for my English|Desculpe pelo meu inglês}}\", você está reafirmando para o seu subconsciente que você é um intruso. Operadores de elite não pedem desculpas; eles ajustam a frequência do rádio."
                }
            ]
        },
        {
            id: "p1-m2",
            title: "Parte 2: O Batismo de Fogo — A História de Roger",
            subtitle: "A 'Ponte Húngara' e a prova de que a necessidade extrema vence qualquer método tradicional.",
            status: "locked",
            blocks: [
                {
                    type: "system-status",
                    content: "{{CASE STUDY|Estudo de Caso}}: ROGER_ORIGIN.log {{LOADING|Carregando}}..."
                },
                {
                    type: "box-goal",
                    title: "Objetivo Tático",
                    content: "Analisar o estudo de caso real da 'Ponte Húngara'. Vamos decompor como a necessidade extrema de conexão e a falha do ensino tradicional brasileiro forçaram o cérebro a abandonar a gramática de livro em favor da sobrevivência funcional."
                },
                {
                    type: "h2",
                    content: "2.1 O Grande Blefe: 4 Anos de Investimento, Retorno Zero"
                },
                {
                    type: "paragraph",
                    content: "No Brasil, eu fui o \"estudante modelo\". Segui o script das grandes franquias por quatro anos. Frequentei aulas duas vezes por semana, fiz todos os {{homeworks|tarefas de casa}} e tirei notas máximas nas provas de gramática. No papel, eu era um \"sucesso\". Na vida real, ao desembarcar na Europa, eu descobri que era um **analfabeto funcional**."
                },
                {
                    type: "paragraph",
                    content: "O sistema tradicional é desenhado para criar **Linguistas de Auditório**, não **Operadores de Campo**. Eles te ensinam a anatomia da arma, mas nunca te levam para o estande de tiro."
                },
                {
                    type: "memory-diagram",
                    content: JSON.stringify({
                        title: "🧠 CAMADA NEUROCIENTÍFICA: Memória Declarativa vs. Procedural",
                        declarative: {
                            title: "Memória Declarativa",
                            icon: "📚",
                            description: "É o foco das escolas tradicionais. Armazena fatos e regras (ex: 'A estrutura do Present Perfect é have + particípio'). É um processo lento, consciente e exige que o Córtex Pré-Frontal 'calcule' a frase antes de falar. Sob estresse, esse cálculo trava."
                        },
                        procedural: {
                            title: "Memória Procedural",
                            icon: "🎯",
                            description: "É a memória de habilidades motoras (como dirigir ou lutar). Ela reside nos Gânglios da Base. É automática, rápida e não requer pensamento consciente. É a base da fluência real."
                        },
                        diagnosis: "No Brasil, o Roger tinha muita informação declarativa, mas zero treino procedural. Quando a pressão subiu, o cérebro dele tentou calcular a regra, gerou um erro de processamento e ele travou. O aprendizado real só acontece quando a língua migra da regra (declarativa) para o reflexo (procedural)."
                    })
                },
                {
                    type: "h2",
                    content: "2.2 O Choque de Realidade: A 'Ponte Húngara'"
                },
                {
                    type: "paragraph",
                    content: "A minha história mudou por causa de uma necessidade visceral. Em Portugal, conheci minha primeira namorada, uma húngara. Ela não falava português. Eu não falava húngaro. O inglês era nossa **única ponte possível**."
                },
                {
                    type: "box-warning",
                    title: "⚠️ A Dor Mais Profunda",
                    content: "Foi ali que senti a dor mais profunda do adulto que não fala inglês: a perda da identidade. Em português, eu sou inteligente, articulado e engraçado. Em inglês, eu me sentia uma criança de 5 anos em um corpo de adulto, incapaz de expressar por que estava chateado ou o que eu realmente sentia. Essa humilhação foi o que me fez resetar o método."
                },
                {
                    type: "comparison-table",
                    content: JSON.stringify({
                        headers: ["Situação", "Inglês de Livro (Engessado)", "Inglês de Combate (Real)", "Análise de Eficiência"],
                        rows: [
                            ["Expressar Sentimento", "I am very happy to be here.", "I'm so glad I made it.", "Glad é mais orgânico; Made it foca no esforço."],
                            ["Dificuldade de Entendimento", "Could you repeat that slowly?", "Wait, I'm lost. Come again?", "Metáforas de movimento são 10x mais comuns."],
                            ["Sair de Casa", "We must go to the restaurant.", "Let's head out. I'm starving.", "Head out é um phrasal verb vital."],
                            ["Resolver Conflito", "I do not agree with your opinion.", "I don't see it that way.", "Menos agressivo, mais tático."]
                        ]
                    })
                },
                {
                    type: "h2",
                    content: "🛠️ Engenharia Reversa: O Aprendizado Estilo 'Bebê'"
                },
                {
                    type: "paragraph",
                    content: "Sob a pressão do relacionamento, meu cérebro parou de tentar 'estudar' e começou a **adquirir** o idioma através de quatro fases táticas:"
                },
                {
                    type: "baby-learning",
                    content: JSON.stringify({
                        title: "As 4 Fases de Aquisição Tática",
                        phases: [
                            {
                                name: "Observação",
                                icon: "👁️",
                                description: "Reconhecimento de Padrão: Eu não focava nas palavras, mas nas reações dela. Se eu falava de um jeito e ela sorria, o padrão era validado. O feedback emocional é mais poderoso que qualquer correção gramatical."
                            },
                            {
                                name: "Associação",
                                icon: "🔗",
                                description: "Âncora Química: Eu não traduzia a palavra 'Missed'. Eu associava o som /míst/ ao sentimento de saudade quando ela viajava. Isso criou uma âncora dopaminérgica — a palavra virou sensação, não tradução."
                            },
                            {
                                name: "Erro",
                                icon: "⚡",
                                description: "Calibragem de Mira: Eu falava errado, era corrigido ou não era entendido, e meu cérebro ajustava o som. O erro era apenas um dado técnico de ajuste de mira, não uma falha moral."
                            },
                            {
                                name: "Repetição",
                                icon: "🔄",
                                description: "Mielinização: O que funcionava, eu usava de novo e de novo até que os músculos da minha boca não precisassem mais de comando consciente. O reflexo substituiu o cálculo."
                            }
                        ]
                    })
                },
                {
                    type: "phrase-analysis",
                    content: JSON.stringify({
                        phrase: "I'm not sure I follow you.",
                        phonetic: "/aim-nó-ʃôr/ — O 't' final desaparece para dar lugar ao 'f'. Ninguém diz /ai/ /æm/ /nɒt/. O som real é um bloco único.",
                        grammarNote: "Eu removi o 'that' (I'm not sure THAT I...). No método operacional, se uma palavra não adiciona significado, ela é descartada para economizar largura de banda cerebral."
                    })
                },
                {
                    type: "h2",
                    content: "⚔️ Cenário de Combate: A 'DR' sem Google Tradutor"
                },
                {
                    type: "scenario-card",
                    content: JSON.stringify({
                        context: "Você e sua parceira/o estão em um restaurante. Houve um mal-entendido sobre o horário. O clima está pesado. Você precisa resolver isso sem parecer um robô ou um dicionário ambulante.",
                        situation: "Você chegou atrasado e precisa se desculpar e resolver a situação.",
                        wrong: {
                            action: "O Recruta (Mentalidade de Franquia): Tenta montar a frase perfeita na cabeça antes de falar. Fica calculando preposições.",
                            result: "\"I apologize. I arrived late because the traffic was very intense. Please, do not be angry.\" — Soa frio, distante e mecânico."
                        },
                        right: {
                            action: "O Operador (Mentalidade ES): Usa linguagem real com expressões de nativo. Admite o erro com naturalidade. Oferece solução prática.",
                            result: "\"Hey, my bad. I messed up with the time. Traffic was a total nightmare, seriously. Let's just eat, okay? My treat.\" — Humano, tático, resolve o conflito."
                        }
                    })
                },
                {
                    type: "reveal-box",
                    title: "🔍 Análise do Sucesso (Clique para expandir)",
                    content: "'My bad / I messed up': Admite o erro de forma humana e rápida. Baixa o cortisol do interlocutor. 'Total nightmare': Usa uma imagem mental forte em vez de adjetivos técnicos (intense traffic). 'My treat': Resolve o conflito com uma ação prática (eu pago). A frase do Operador tem 15 palavras vs 21 do Recruta, e comunica 3x mais emoção."
                },
                {
                    type: "h2",
                    content: "🎙️ Tom e Voz: A Mentalidade de Elite"
                },
                {
                    type: "paragraph",
                    content: "**Pare de se desculpar.** O vício brasileiro de dizer \"Sorry for my bad English\" é um sinal de submissão que sabota sua autoridade. Na \"Ponte Húngara\", eu entendi que se eu ficasse me desculpando, eu nunca lideraria a conversa. O inglês é apenas o cabo que conecta dois computadores; se o sinal tiver ruído, você não joga o computador fora, você apenas **ajusta a frequência**."
                },
                {
                    type: "elite-insight",
                    title: "💡 INSIGHT DE ELITE",
                    content: "Eu não criei a ES Academy porque sou um gênio das línguas. Eu a criei porque eu senti a humilhação de ser um adulto 'mudo'. Minha missão é garantir que você não precise passar por quatro anos de mentiras para só então começar a viver o idioma na prática."
                }
            ]
        },
        {
            id: "p1-m3",
            title: "Parte 3: O Necrotério do Ensino Tradicional",
            subtitle: "Por que o Sistema foi Desenhado para Você Falhar — uma autópsia no método das grandes franquias.",
            status: "locked",
            blocks: [
                {
                    type: "system-status",
                    content: "{{AUTOPSY REPORT|Relatório de Autópsia}}: {{TRADITIONAL_METHOD.exe INITIATED|MÉTODO_TRADICIONAL.exe INICIADO}}..."
                },
                {
                    type: "box-goal",
                    title: "Objetivo Tático",
                    content: "Realizar uma autópsia no método das grandes franquias e escolas tradicionais. Vamos identificar os 'vírus' pedagógicos que infectaram seu aprendizado e substituí-los por uma mentalidade de ROI (Retorno sobre Investimento) Linguístico."
                },
                {
                    type: "h2",
                    content: "3.1 A Anatomia do Fracasso Programado"
                },
                {
                    type: "paragraph",
                    content: "Você já se perguntou por que as grandes escolas de inglês ocupam os prédios mais caros e gastam milhões em marketing com celebridades, mas o Brasil continua no topo dos rankings de pior proficiência do mundo?"
                },
                {
                    type: "paragraph",
                    content: "A resposta é brutal: **O modelo de negócio deles depende do seu fracasso.** Se você aprender inglês em 1 ano, eles perdem 4 anos de mensalidade. O sistema tradicional foi desenhado para ser um labirinto, não uma linha reta."
                },
                {
                    type: "brain-diagram",
                    content: JSON.stringify({
                        title: "🧠 CAMADA NEUROCIENTÍFICA: A Armadilha do Input Passivo",
                        steps: [
                            "A Curva de Esquecimento (Ebbinghaus): Se você estuda uma regra gramatical e preenche lacunas em um livro, seu cérebro descarta 80% dessa informação em 24 horas. Por quê? Porque não houve 'Saliência de Sobrevivência'.",
                            "O Erro das Sinapses Isoladas: No método antigo, você aprende 'palavras soltas'. No seu cérebro, isso cria sinapses fracas e isoladas. Para falar, o cérebro precisa de uma rede densa.",
                            "O Método Elite: Nós usamos {{Active Recall|Recuperação Ativa}}. Em vez de você ler uma regra, nós te jogamos em um cenário onde você precisa daquela estrutura para sobreviver. Isso força o cérebro a fortalecer a bainha de mielina instantaneamente."
                        ]
                    })
                },
                {
                    type: "h2",
                    content: "3.2 Camada Cultural: O 'Inglês de Laboratório' vs. O Mundo Cão"
                },
                {
                    type: "paragraph",
                    content: "O inglês dos livros didáticos é o que chamamos de **Inglês de Laboratório**: estéril, sem sotaque, sem ruído e sem pressa. No entanto, o mundo real é um 'zoológico'."
                },
                {
                    type: "comparison-table",
                    content: JSON.stringify({
                        headers: ["Elemento", "Método Tradicional (Necrotério)", "Método Elite (Operacional)", "Impacto no Campo"],
                        rows: [
                            ["Foco", "Gramática Prescritiva (Regras)", "Gramática Funcional (Uso)", "O tradicional te faz um revisor; o Elite te faz um líder."],
                            ["Velocidade", "Lenta e Articulada (Robótica)", "Velocidade Real ({{Connected Speech|Fala Conectada}})", "O tradicional te deixa surdo para nativos."],
                            ["Erro", "Punido com notas e vergonha", "Usado como dado de calibragem", "O tradicional cria medo; o Elite cria audácia."],
                            ["Vocabulário", "Geral e Inútil (Cores, Animais)", "Alta Frequência (Pareto 80/20)", "O tradicional gasta seu tempo; o Elite gera ROI."]
                        ]
                    })
                },
                {
                    type: "reveal-box",
                    title: "📝 Nota do Instrutor (Clique para expandir)",
                    content: "Aprender inglês com livro de franquia é como tentar aprender a lutar MMA jogando 'Street Fighter' no videogame. Você conhece os golpes, mas a primeira vez que levar um soco (ouvir um nativo rápido), você vai desmaiar."
                },
                {
                    type: "h2",
                    content: "🛠️ Engenharia Reversa: Desmontando o 'I am going to'"
                },
                {
                    type: "paragraph",
                    content: "Vamos pegar o exemplo clássico que as escolas ensinam por meses: o futuro com 'going to'."
                },
                {
                    type: "phonetic-breakdown",
                    content: JSON.stringify({
                        formal: {
                            text: "{{I am going to travel next year|Vou viajar ano que vem}}.",
                            analysis: "Pronunciando cada sílaba: I-am-go-ing-to — 5 unidades de processamento"
                        },
                        combat: {
                            text: "{{I'm gonna travel nex' year|Vou viajar ano que vem}}.",
                            analysis: "Bloco único: /aim-gâ-na/ — 1 unidade sonora"
                        },
                        explanation: "A Fusão (Gonna): O cérebro do nativo funde going + to para liberar espaço de processamento para a informação principal (travel). Se você tenta falar o 'going to' completo, você soa como um robô e perde o ritmo da conversa. Omissão do T Final: Em 'next year', o 't' de next desaparece porque a próxima palavra começa com uma consoante. É uma regra de Sandwich de Consoantes. No tradicional, ninguém te conta isso, e você fica tentando pronunciar o 't' e trava a língua. Intenção: O 'I am going to' formal é usado em documentos. Se você usa isso no bar ou em uma reunião de negócios informal, você cria uma barreira social. Você soa 'estrangeiro demais'."
                    })
                },
                {
                    type: "h2",
                    content: "⚔️ Cenário de Combate: A Reunião de 'Briefing' (The Corporate Trap)"
                },
                {
                    type: "scenario-card",
                    content: JSON.stringify({
                        context: "Você está em uma reunião via Zoom com a equipe dos EUA. O seu chefe americano diz:",
                        situation: "\"{{Guys, we gotta pivot the strategy 'cause the numbers ain't lookin' good. Whad'ya reckon?|Pessoal, temos que mudar a estratégia porque os números não parecem bons. O que vocês acham?}}\"",
                        wrong: {
                            action: "O Aluno Tradicional: Ele tenta processar: 'We got... to? Pivot? Cause? Ain't?'. Ele trava no Ain't porque o livro disse que isso é errado e não deve ser usado. O filtro afetivo sobe.",
                            result: "Ele gagueja e perde a oportunidade de dar sua opinião. Silêncio constrangedor."
                        },
                        right: {
                            action: "O Operador Elite: Filtro de Ruído — ignora ain't e gotta. Captura de Palavras-Chave: {{PIVOT|MUDAR}}, {{STRATEGY|ESTRATÉGIA}}, {{NUMBERS|NÚMEROS}}, {{NOT GOOD|NADA BOM}}.",
                            result: "\"{{I'm with you. Let's change the plan. I have an idea.|Estou com você. Vamos mudar o plano. Tenho uma ideia.}}\" — Simples, direto e operacional. O chefe quer soluções, não poesia."
                        }
                    })
                },
                {
                    type: "h2",
                    content: "🎙️ Tom e Voz: O Despertar da Raiva Produtiva"
                },
                {
                    type: "paragraph",
                    content: "**Sinta raiva.** Sinta raiva dos anos perdidos preenchendo lacunas. Essa raiva é o que vai te impulsionar a não aceitar mais o método medíocre. O brasileiro médio tem 'trauma' de inglês porque foi tratado como uma criança incapaz. Aqui, você é um adulto com objetivos claros."
                },
                {
                    type: "box-warning",
                    title: "⚠️ VÍCIO BRASILEIRO DETECTADO",
                    content: "O medo de parecer 'grosseiro' por ser direto. No inglês de elite, ser direto é ser respeitoso com o tempo do outro. O excesso de palavras (polidez excessiva de livro) soa como insegurança."
                },
                {
                    type: "elite-insight",
                    title: "💡 INSIGHT DE ELITE",
                    content: "O método tradicional é uma dieta de 500 calorias para quem quer correr uma maratona. Ele te mantém vivo, mas nunca te permite vencer. Estamos aqui para te dar o banquete da fluência real."
                }
            ]
        },
        {
            id: "p1-m4",
            title: "Parte 4: A Lei de Pareto e a Fluência Operacional",
            subtitle: "O Segredo dos 20% — como resolver 80% das situações com vocabulário cirúrgico.",
            status: "locked",
            blocks: [
                {
                    type: "system-status",
                    content: "{{PARETO ANALYSIS|Análise de Pareto}}: {{VOCABULARY_OPTIMIZATION.exe LOADING|OTIMIZAÇÃO_DE_VOCABULÁRIO.exe CARREGANDO}}..."
                },
                {
                    type: "box-goal",
                    title: "Objetivo Tático",
                    content: "Aplicar o Princípio de Pareto (80/20) ao idioma. Vamos identificar as armas de alto calibre (vocabulário de alta frequência) que permitem que você resolva 80% das situações do mundo real com apenas 20% do esforço linguístico. Chega de carregar peso morto."
                },
                {
                    type: "h2",
                    content: "4.1 A Ditadura do Dicionário vs. A Eficiência do Operador"
                },
                {
                    type: "paragraph",
                    content: "O maior erro do aluno brasileiro é acreditar que 'saber inglês' é saber **todas** as palavras. Um nativo médio utiliza cerca de 3.000 palavras no seu dia a dia, embora conheça 20.000. No entanto, com apenas **800 a 1.200 palavras bem aplicadas**, você já é capaz de operar em nível de elite em reuniões, viagens e negociações."
                },
                {
                    type: "brain-diagram",
                    content: JSON.stringify({
                        title: "🧠 CAMADA NEUROCIENTÍFICA: O SAR e a Sobrecarga Cognitiva",
                        steps: [
                            "O SAR: O seu cérebro possui um filtro chamado Sistema de Ativação Reticular. Ele decide o que é importante e o que é ruído. Se você tenta aprender palavras obscuras (como '{{nevertheless|no entanto}}' ou '{{furthermore|além disso}}'), seu SAR as descarta por falta de uso prático.",
                            "Custo de Processamento ({{Cognitive Load|Carga Cognitiva}}): Cada palavra que você tenta 'escolher' na hora de falar consome energia do Córtex Pré-Frontal. Se você tem um dicionário imenso mas pouco treinado, seu cérebro sofre de Paralisia por Análise.",
                            "Poda Neuronal ({{Synaptic Pruning|Poda Sináptica}}): O cérebro é eficiente. Ele fortalece as conexões que você usa sempre e 'poda' as que não usa. Ao focar nos 20% (Pareto), você cria super-rodovias neurais (mielinização pesada) para os termos que realmente importam."
                        ]
                    })
                },
                {
                    type: "h2",
                    content: "4.2 Camada Cultural: Vocabulário de Luxo vs. Vocabulário de ROI"
                },
                {
                    type: "paragraph",
                    content: "Muitos alunos tentam impressionar usando palavras complexas e acabam soando como um livro didático antigo. No 'Global Command', a moeda de troca é a **clareza**."
                },
                {
                    type: "comparison-table",
                    content: JSON.stringify({
                        headers: ["Conceito", "Palavra de Livro (Baixo ROI)", "Palavra de Elite (Alto ROI)", "Por que o ROI é maior?"],
                        rows: [
                            ["Executar", "To implement/execute", "{{To get it done|Fazer acontecer}}", "Get é o 'coringa' do inglês. Serve para 1000 situações."],
                            ["Entender", "To comprehend", "{{To get it / To follow|Entender / Acompanhar}}", "Curto, rítmico e demonstra conexão imediata."],
                            ["Ajudar", "To assist", "{{To help out / give a hand|Dar uma força}}", "Phrasal verbs geram proximidade e fluidez natural."],
                            ["Compensar", "To compensate", "{{To make up for|Compensar por}}", "Soa menos corporativo e mais humano/operacional."],
                            ["Descobrir", "To discover", "{{To find out|Descobrir}}", "É o termo padrão em 90% das conversas de negócios."]
                        ]
                    })
                },
                {
                    type: "h2",
                    content: "🛠️ Engenharia Reversa: O Poder do 'GET' (A Ferramenta Universal)"
                },
                {
                    type: "paragraph",
                    content: "Se o inglês fosse uma caixa de ferramentas, o verbo **GET** seria a chave inglesa que ajusta qualquer parafuso. Se você domina o Get, sua autonomia operacional sobe 40% instantaneamente."
                },
                {
                    type: "phrase-analysis",
                    content: JSON.stringify({
                        phrase: "{{I'll get it to you by tomorrow.|Eu entrego para você amanhã.}}",
                        phonetic: "/ail-gué-rit-tchu-bai-tu-már-rou/ — O 't' de get vira um 'r' suave (Flap T) porque está entre duas vogais. O 'to you' vira /tchu/.",
                        grammarNote: "Multifuncionalidade: Nessa frase, GET substitui 'send', 'deliver', 'bring' ou 'email'. Ao usar Get, você simplifica a tarefa no cérebro do ouvinte. Você está prometendo um resultado, não descrevendo o processo técnico."
                    })
                },
                {
                    type: "h2",
                    content: "⚔️ Cenário de Combate: A Negociação de Prazo (The Deadline War)"
                },
                {
                    type: "scenario-card",
                    content: JSON.stringify({
                        context: "Você é o gerente de um projeto. Um cliente internacional quer saber por que o relatório não chegou. Você está sob pressão (Amígdala em alerta).",
                        situation: "O cliente pergunta: '{{Where is the report? We were expecting it yesterday.|Cadê o relatório? Esperávamos isso ontem.}}'",
                        wrong: {
                            action: "O Recruta (Mentalidade Dicionário): Tenta montar uma frase complexa para parecer profissional.",
                            result: "\"{{I apologize for the delay. We are experiencing some technical difficulties, but we will provide the document as soon as possible.|Peço desculpas pelo atraso. Estamos com dificuldades técnicas, mas entregaremos o documento assim que possível.}}\" — Muito longo, chances imensas de errar 'difficulties' ou 'provide'."
                        },
                        right: {
                            action: "O Operador (Pareto 80/20): Usa palavras de alta frequência e foca no resultado.",
                            result: "\"{{Sorry about that. We're running a bit late, but I'll get it done today. I'll send it over in an hour. Is that okay?|Desculpe por isso. Estamos um pouco atrasados, mas vou resolver hoje. Te envio em uma hora. Tudo bem?}}\" — 'Running late' + 'Get it done' + 'Send it over' + pergunta tática."
                        }
                    })
                },
                {
                    type: "reveal-box",
                    title: "🔍 Análise do Sucesso (Clique para expandir)",
                    content: "'Running late': Expressão de alta frequência para atrasos. 'Get it done': Foca no resultado, não no problema. 'Send it over': Phrasal verb que demonstra agilidade. 'Is that okay?': Devolve a bola para o cliente, ganhando tempo e controle da conversa."
                },
                {
                    type: "h2",
                    content: "🎙️ Tom e Voz: A Mentalidade de 'Menos é Mais'"
                },
                {
                    type: "paragraph",
                    content: "Muitos brasileiros têm vergonha de falar 'simples'. Eles acham que falar simples é sinal de ignorância. A verdade é o oposto: no mundo executivo global, **quem fala difícil geralmente é quem não sabe o que está fazendo**."
                },
                {
                    type: "paragraph",
                    content: "**Humor Tático:** Se você tentar usar uma palavra de 5 sílabas e gaguejar, você parece um amador. Se você usar uma palavra de 1 sílaba com a entonação correta e confiança de um operador, você parece o dono da empresa."
                },
                {
                    type: "box-warning",
                    title: "⚠️ VÍCIO BRASILEIRO DETECTADO",
                    content: "Tentar traduzir expressões idiomáticas do português literalmente (ex: 'The cow went to the swamp' para 'A vaca foi pro brejo'). Pare. No Método Pareto, usamos as expressões de alta frequência do inglês, como 'It's going south' (Está dando errado)."
                },
                {
                    type: "elite-insight",
                    title: "💡 INSIGHT DE ELITE",
                    content: "A fluência operacional não é sobre o quanto você sabe, mas sobre o quão pouco você precisa para resolver um problema. Se você pode derrubar o alvo com uma pistola (palavras simples), por que carregar um canhão (vocabulário complexo) que você mal consegue levantar?"
                }
            ]
        },
        {
            id: "p1-m5",
            title: "Parte 5: Anatomia do Som Real",
            subtitle: "Decodificando a 'Metralhadora' Nativa — hackear o seu sistema auditivo.",
            status: "locked",
            blocks: [
                {
                    type: "system-status",
                    content: "{{AUDIO DECODER|DECODIFICADOR DE ÁUDIO}}: {{CONNECTED_SPEECH.wav ANALYZING|FALA_CONECTADA.wav ANALISANDO}}..."
                },
                {
                    type: "box-goal",
                    title: "Objetivo Tático",
                    content: "Hackear o seu sistema auditivo. Vamos entender por que os nativos parecem falar 'rápido demais' e como desativar a 'Vogal Fantasma' (o vício nº 1 dos brasileiros) que destrói sua inteligência percebida em campo."
                },
                {
                    type: "h2",
                    content: "5.1 O Mito do 'Eles Falam Rápido Demais'"
                },
                {
                    type: "paragraph",
                    content: "A maior reclamação dos operadores novatos é: 'Eu entendo o professor, mas não entendo o nativo na rua'. O problema **não é a velocidade, é o ritmo**. O português é uma língua Syllable-timed (cada sílaba tem o mesmo peso); o inglês é Stress-timed (nós 'atropelamos' as sílabas fracas para enfatizar as fortes)."
                },
                {
                    type: "brain-diagram",
                    content: JSON.stringify({
                        title: "🧠 CAMADA NEUROCIENTÍFICA: Percepção Categórica e o Filtro Fonético",
                        steps: [
                            "Percepção Categórica: Seu cérebro foi treinado para ignorar sons que não existem no português. Quando um nativo usa um som que você não conhece (como o Schwa ou o Short I), seu cérebro tenta 'encaixar' esse som na gaveta mais próxima.",
                            "O Erro de Processamento: O cérebro brasileiro ouve '{{Bit|Pouco}}' (pouco) e processa como '{{Beat|Bater}}' (bater). Essa confusão gera um delay de processamento no Córtex Auditivo, fazendo com que você perca o resto da frase enquanto tenta decodificar a primeira palavra.",
                            "Mapeamento Fonético: Para entender o inglês real, precisamos 're-mapear' os neurônios auditivos para reconhecer o {{Connected Speech|Fala Conectada}} (fala conectada) como uma unidade única de som, e não como palavras separadas."
                        ]
                    })
                },
                {
                    type: "h2",
                    content: "5.2 A Batalha contra a 'Vogal Fantasma' (Epêntese)"
                },
                {
                    type: "paragraph",
                    content: "O maior inimigo da sua fluência é o som que você **adiciona** onde ele não existe. No Brasil, toda consoante 'quer' ser seguida de uma vogal. No inglês, consoantes podem ser secas e mortas."
                },
                {
                    type: "comparison-table",
                    content: JSON.stringify({
                        headers: ["Palavra", "O Erro (Vogal Fantasma)", "O Som Elite", "Impacto Tático"],
                        rows: [
                            ["Facebook", "Face-bu-qui", "/feis-buk/", "O 'i' final sinaliza amadorismo e quebra o ritmo."],
                            ["Like", "Lai-qui", "/laik/", "Matar o som no 'k' economiza 0.5s de processamento."],
                            ["Red", "He-di", "/red/", "Se você disser 'Redi', o nativo pode entender 'Ready'."],
                            ["Stop", "Es-tó-pi", "/stɑːp/", "Adicionar um 'e' antes do 's' é o 'dedo-duro' do brasileiro."]
                        ]
                    })
                },
                {
                    type: "box-action",
                    title: "🎯 Ação Corretiva",
                    content: "Imagine que o final da palavra é um penhasco. Você deve parar exatamente na consoante final. Não deixe sua língua 'escorregar' para um som de 'i'."
                },
                {
                    type: "h2",
                    content: "🛠️ Engenharia Reversa: Desmontando o 'What do you...'"
                },
                {
                    type: "paragraph",
                    content: "Vamos analisar a frase que você mais vai ouvir em campo e como ela realmente soa quando disparada por um nativo."
                },
                {
                    type: "phonetic-breakdown",
                    content: JSON.stringify({
                        formal: {
                            text: "{{What do you want to eat?|O que você quer comer?}}",
                            analysis: "6 palavras separadas — processamento lento e artificial"
                        },
                        combat: {
                            text: "{{Whaddya wanna eat?|O que você quer comer?}}",
                            analysis: "/wʌ-djə-wɑː-nə-it/ — 3 blocos sonoros"
                        },
                        explanation: "Redução Tática: O 'do you' funde-se com 'what', transformando-se em um som de 'dj' suave = /wʌ-djə/. O Schwa (/ə/): O som do 'o' em 'do' e do 'u' em 'you' morre, virando um som neutro e relaxado. O Flap T: Se a próxima palavra começar com vogal, o 't' vira um som de 'r' rápido. Wanna: O 'want to' é fundido para manter a velocidade."
                    })
                },
                {
                    type: "h2",
                    content: "🌍 Camada Cultural: O Inglês 'Mascado' vs. O Inglês 'Cantado'"
                },
                {
                    type: "paragraph",
                    content: "No Brasil, falamos com a boca muito aberta e articulada. O inglês é falado no fundo da garganta, com a mandíbula mais relaxada."
                },
                {
                    type: "comparison-table",
                    content: JSON.stringify({
                        headers: ["Elemento", "Formal (Acadêmico)", "Street (Operacional)", "Por que fazem isso?"],
                        rows: [
                            ["Got to", "{{I have got to go.|Eu tenho que ir.}}", "{{I gotta split.|Eu tenho que vazar.}}", "Eficiência máxima de movimento."],
                            ["Could have", "{{I could have done it.|Eu poderia ter feito.}}", "{{I coulda dunnit.|Eu podia ter feito.}}", "Redução de 4 sílabas para 2."],
                            ["Out of", "{{Get out of here.|Saia daqui.}}", "{{Outta here!|Zarpa daqui!}}", "O 't' vira 'r' e as palavras se fundem."]
                        ]
                    })
                },
                {
                    type: "reveal-box",
                    title: "📝 Nota do Instrutor (Clique para expandir)",
                    content: "O nativo não fala 'errado', ele fala de forma econômica. Tentar falar o inglês de livro em um bar ou em uma reunião informal é como ir de terno e gravata para a praia: você é o único que não está confortável."
                },
                {
                    type: "h2",
                    content: "⚔️ Cenário de Combate: O Pedido sob Pressão (Coffee Shop)"
                },
                {
                    type: "scenario-card",
                    content: JSON.stringify({
                        context: "Você está em uma cafeteria em Londres. Há uma fila enorme atrás de você. O atendente, com sotaque forte e pressa, dispara:",
                        situation: "\"{{Whaddya-havin? Need-any-thin-else?|O que vai querer? Precisa de mais alguma coisa?}}\"",
                        wrong: {
                            action: "O Aluno Tradicional: Tenta separar as palavras: 'What... do... you... having?'. Ele se confunde com o 'ing' no final e trava na gramática.",
                            result: "O atendente perde a paciência. A fila cresce. Pânico."
                        },
                        right: {
                            action: "O Operador Elite: Reconhece /whaddya/ como unidade de pergunta. Foca na entonação e na palavra HAVING.",
                            result: "\"{{A black coffee, please. That's it.|Um café preto, por favor. Só isso.}}\" — Curto, grosso e funcional. Missão cumprida sem estresse."
                        }
                    })
                },
                {
                    type: "h2",
                    content: "🎙️ Tom e Voz: A Autoridade do Silêncio"
                },
                {
                    type: "paragraph",
                    content: "Muitas vezes, a melhor pronúncia é o **silêncio entre as palavras**. O brasileiro tem medo do silêncio e preenche com 'éééé...' ou 'humm...'."
                },
                {
                    type: "paragraph",
                    content: "**Técnica de Elite:** Se você esquecer uma palavra, faça uma pausa silenciosa. Isso demonstra controle e autoridade. Preencher com sons de vogais brasileiras (o 'humm' com som de 'u') quebra sua imagem de operador."
                },
                {
                    type: "elite-insight",
                    title: "💡 INSIGHT DE ELITE",
                    content: "O seu ouvido é um músculo. Se você só treina ouvindo áudio lento de livro didático, você está treinando para perder. A partir de agora, você vai consumir o som real, com todas as suas 'sujeiras' e contrações. É assim que o mundo fala."
                }
            ]
        },
        {
            id: "p1-m6",
            title: "Parte 6: O Elo Final — A Aliança do Operador",
            subtitle: "O Nascimento da sua Liberdade — selar a conexão emocional e ativar o Modo de Operação Total.",
            status: "locked",
            blocks: [
                {
                    type: "system-status",
                    content: "{{IDENTITY PROTOCOL|PROTOCOLO DE IDENTIDADE}}: {{OPERATOR_ALLIANCE.exe INITIALIZING|ALIANÇA_DO_OPERADOR.exe INICIALIZANDO}}..."
                },
                {
                    type: "box-goal",
                    title: "Objetivo Tático",
                    content: "Selar a conexão emocional entre a sua história e a sua nova identidade. Este não é um contrato de estudos; é um pacto de sobrevivência. Vamos converter a sua frustração em combustível e ativar o 'Modo de Operação Total'."
                },
                {
                    type: "h2",
                    content: "6.1 A Conclusão da Jornada de Roger: O Fim do Silêncio"
                },
                {
                    type: "paragraph",
                    content: "A minha história (Parte 2) não terminou apenas com um vocabulário novo. Ela terminou quando eu percebi que o inglês era a única coisa que me separava da pessoa que eu amava. Eu me lembro vividamente de estar em uma mesa, querendo dizer algo profundo, algo que fizesse os olhos dela brilharem, e a gramática de livro ser uma **mordaça na minha boca**."
                },
                {
                    type: "paragraph",
                    content: "A ES Academy nasceu desse grito contido. Ela nasceu para que você nunca mais sinta que é 'menos' só porque não consegue conjugar o Present Perfect. **A fluência não é um troféu; é a sua voz sendo devolvida a você.** Quando eu finalmente consegui rir, chorar e brigar em inglês, eu não era apenas um 'falante', eu era **eu mesmo em outra língua**. E é essa liberdade que eu estou te entregando agora."
                },
                {
                    type: "brain-diagram",
                    content: JSON.stringify({
                        title: "🧠 CAMADA NEUROCIENTÍFICA: O Valor da Sobrevivência e o Sistema de Recompensa",
                        steps: [
                            "O Eixo Hipotálamo-Hipófise-Adrenal (HPA): O seu cérebro prioriza o que é vital. Se você estuda por 'obrigação', seu cérebro descarta. Se você estuda por CONEXÃO (para salvar seu emprego, para falar com seu parceiro, para ser livre), seu cérebro entende que o inglês é uma ferramenta de sobrevivência.",
                            "Ocitocina e Aprendizado Social: Ao se conectar com a minha história e com os outros operadores, seu cérebro libera ocitocina. Esse hormônio REDUZ o medo (Filtro Afetivo) e abre as portas para a plasticidade neural.",
                            "A Mudança de Identidade: O seu Córtex Cingulado Anterior monitora conflitos. Se você diz 'eu sou péssimo em inglês', ele vai sabotar seus treinos. Ao assinar este protocolo, você está instalando uma nova identidade: 'Eu sou um comunicador de elite em treinamento'. O cérebro trabalhará para manter essa nova imagem."
                        ]
                    })
                },
                {
                    type: "h2",
                    content: "6.2 A Aliança de Elite (O Teu Novo DNA)"
                },
                {
                    type: "paragraph",
                    content: "Para cruzar a fronteira para o Pilar 2, você precisa aceitar as leis que regem o nosso território. No 'Global Command', não há espaço para vítimas, apenas para **protagonistas**."
                },
                {
                    type: "comparison-table",
                    content: JSON.stringify({
                        headers: ["Lei", "O Princípio", "O Impacto na Sua Vida"],
                        rows: [
                            ["🔗 Lei da Conexão Humana", "Você nunca mais verá o inglês como 'matéria'. Você verá como o cabo que te liga ao mundo.", "Se o cabo tiver ruído, você não desiste; você ajusta a frequência."],
                            ["⚡ Lei da Vulnerabilidade Tática", "Você admite que vai errar. E você vai rir disso.", "O erro é o sinal de que você está na fronteira do seu território, expandindo-o."],
                            ["🗽 Lei da Liberdade Absoluta", "Você estuda hoje para ser o dono da sua narrativa amanhã.", "Sem tradutores, sem intermediários, sem mordaças."]
                        ]
                    })
                },
                {
                    type: "h2",
                    content: "🛠️ Engenharia Reversa: O 'I Got This' (A Postura de Comando)"
                },
                {
                    type: "paragraph",
                    content: "Analise o peso emocional desta frase curta. É o mantra do operador."
                },
                {
                    type: "phrase-analysis",
                    content: JSON.stringify({
                        phrase: "{{I got this.|Deixa comigo.}}",
                        phonetic: "/ai-gót-thís/ — O 't' de got é seco, quase um estalo. São três batidas fortes que acalmam o sistema nervoso.",
                        grammarNote: "Propriedade (Ownership): O uso do 'Got' indica posse imediata da situação. Não é 'Eu tentarei'. É 'Está sob meu controle'. O som do 'th' em 'this' exige que você coloque a língua entre os dentes — é um gesto físico de afirmação que o sistema tradicional ignora, mas que nós usamos para ancorar a confiança."
                    })
                },
                {
                    type: "h2",
                    content: "⚔️ Cenário de Combate: O Fantasma do Passado"
                },
                {
                    type: "scenario-card",
                    content: JSON.stringify({
                        context: "Você abre o próximo pilar. A velha voz da insegurança sussurra:",
                        situation: "\"Isso é muito difícil. Você nunca vai conseguir falar como o Roger.\"",
                        wrong: {
                            action: "O Recruta: Fica triste, fecha a plataforma.",
                            result: "Volta para a zona de conforto da mediocridade. Mais um ano perdido."
                        },
                        right: {
                            action: "O Operador Elite (Conexão Total): Responde ao Fantasma: 'Eu não quero falar como o Roger. Eu quero falar como EU mesmo. E o Roger está aqui para me dar o mapa que ele suou sangue para desenhar.'",
                            result: "Ativação: Bata no peito e diga: '{{I got this. One step at a time.|Eu dou conta. Um passo de cada vez.}}' O medo é um passageiro, mas VOCÊ é o piloto."
                        }
                    })
                },
                {
                    type: "h2",
                    content: "🎙️ Tom e Voz: O Convite ao Próximo Nível"
                },
                {
                    type: "paragraph",
                    content: "Eu não quero que você apenas prossiga. Eu quero que você sinta uma **necessidade física de continuar**. O Pilar 1 foi a cirurgia para remover o tumor do método antigo. O Pilar 2 é onde começamos a te dar **superpoderes auditivos**."
                },
                {
                    type: "paragraph",
                    content: "Imagine a sensação de dar o play em um filme e, pela primeira vez, as palavras não serem apenas ruído, mas **frases claras**. Imagine o prazer de não precisar mais de legendas para a sua própria vida. Esse prazer está a **um clique de distância**."
                },
                {
                    type: "elite-insight",
                    title: "💡 INSIGHT FINAL DE ELITE",
                    content: "A mordaça caiu. Você conhece a minha dor, e agora ela é o seu escudo. Você entendeu que o inglês é biologia e emoção, não gramática e papel. Você não é mais um estudante; você é um OPERADOR em treinamento."
                },
                {
                    type: "box-action",
                    title: "📋 BRIEFING DE ENCERRAMENTO",
                    content: "O Pilar 1 está selado. Seu sistema operacional mental foi completamente reformatado. Você agora possui:\\n\\n✅ Conhecimento do Filtro Afetivo e como desativá-lo\\n✅ A história do Roger como prova de que a mudança é possível\\n✅ A visão clara do fracasso do método tradicional\\n✅ O vocabulário Pareto 80/20 para máximo ROI\\n✅ O ouvido calibrado para o Connected Speech\\n✅ A Aliança de Elite selada no seu DNA"
                },
                {
                    type: "pillar-end",
                    title: "🎖️ PILAR 1 CONCLUÍDO",
                    content: "OPERADOR, O GLOBO ESTÁ ESCURO. É HORA DE ILUMINAR O PILAR 2. Seus ouvidos estão prestes a receber superpoderes de decodificação. Prepare-se para ouvir o inglês como você nunca ouviu antes."
                }
            ]
        }
    ]
};

// ==============================================================================
// PILAR 2: DECODIFICAÇÃO AUDITIVA (EXPANDED ELITE VERSION)
// ==============================================================================
export const PILAR_2_DATA: PillarData = {
    id: 2,
    title: "Pilar 2: Decodificação Auditiva Avançada",
    subtitle: "A ciência do som: Schwa, Connected Speech e o fim das legendas.",
    blocks: [
        {
            type: "system-status",
            content: "AUDIO MATRIX: ENGAGED. Frequency analysis started."
        },
        {
            type: "h2",
            content: "Introdução: O Abismo entre Escrita e Som"
        },
        {
            type: "paragraph",
            content: "O inglês não é uma língua fonética como o português (onde se lê o que se escreve). O inglês é uma língua de ritmo e acentuação. Se você tentar ler inglês como lê português, você soará como um robô – e pior, não entenderá os humanos."
        },
        {
            type: "table",
            content: [
                "Frase Escrita|Leitura Brasileira (Errada)|Realidade Nativa (Certa)",
                "{{Wait a minute|Espere um minuto}}|Uêiti a minúti|Wei-da-mi-nit",
                "{{I don't know|Eu não sei}}|Ai dônti nôu|Ai-du-no",
                "{{He is a teacher|Ele é um professor}}|Rí ízi a tí-tchêr|Hi-za-ti-tcher"
            ]
        },
        {
            type: "h2",
            content: "Parte 1: O Som Mais Importante (The Schwa /ə/)"
        },
        {
            type: "box-insight",
            title: "O Segredo Invisível",
            content: "Existe um som que representa 30% de todo o inglês falado. Ele se chama SCHWA. É um som preguiçoso, curto, quase um 'â' sussurrado. Ele acontece em sílabas que NÃO são tônicas."
        },
        {
            type: "paragraph",
            content: "Exemplos do Schwa (o som /ə/):"
        },
        {
            type: "list",
            content: [
                "**{{About|Sobre}}** -> Não é 'A-baut'. É /ə/-baut.",
                "{{Banana|Banana}} -> Ba-nan-/ə/.",
                "{{Photograph|Fotografia}} -> Fo-to-gr/ə/f.",
                "{{Teacher|Professor}} -> Ti-tch/ə/r."
            ]
        },
        {
            type: "interactive-quiz",
            content: "Onde está o Schwa na palavra '{{POLICE|POLÍCIA}}'?|No 'PO' (/pə/)|No 'LICE'|Não tem.|0"
        },
        {
            type: "h2",
            content: "Parte 2: Connected Speech (A Cola Sonora)"
        },
        {
            type: "paragraph",
            content: "Nativos não pausam entre palavras. Eles colam tudo. Existem 3 tipos principais de cola que você precisa dominar para parar de dizer 'eles falam rápido demais'."
        },
        {
            type: "h3",
            content: "Regra 1: Consoante + Vogal (O Link Básico)"
        },
        {
            type: "paragraph",
            content: "Quando uma palavra termina em som de consoante e a próxima começa com vogal, elas viram uma só."
        },
        {
            type: "reveal-box",
            title: "Exemplos de Link C+V",
            content: "- **{{Wake up|Acordar}}** -> `Wei-kup`\n- **{{Turn it off|Desligue isso}}** -> `Tur-ni-toff`\n- **{{An apple|Uma maçã}}** -> `A-na-pple`\n- **{{Stop it|Pare com isso}}** -> `Sto-pit`"
        },
        {
            type: "h3",
            content: "Regra 2: Consoante + Consoante (O Link Gêmeo)"
        },
        {
            type: "paragraph",
            content: "Quando a consoante final é igual à inicial da próxima, você pronuncia apenas UMA vez, alongada."
        },
        {
            type: "list",
            content: [
                "**{{Black cat|Gato preto}}** -> `Bla-cat` (Não diga o 'k' duas vezes)",
                "**{{Social life|Vida social}}** -> `So-sha-life`",
                "**{{Good day|Bom dia}}** -> `Goo-day`"
            ]
        },
        {
            type: "h3",
            content: "Regra 3: O 'T' Americano (Flap T)"
        },
        {
            type: "paragraph",
            content: "Entre vogais, o 'T' americano soa como 'R' de 'arara'."
        },
        {
            type: "list",
            content: [
                "**{{Water|Água}}** -> `Wa-rer`",
                "**{{Better|Melhor}}** -> `Be-rer`",
                "**{{City|Cidade}}** -> `Ci-ry`",
                "**{{A lot of|Muito de}}** -> `A-lo-ra-v`"
            ]
        },
        {
            type: "h2",
            content: "Parte 3: O Catálogo de Reduções Extremas"
        },
        {
            type: "paragraph",
            content: "Além de conectar, eles cortam pedaços das palavras. Decore esta tabela se quiser entender filmes."
        },
        {
            type: "table",
            content: [
                "Formal|Redução|Tradução Mental",
                "{{Going to|Vou (futuro)}}|{{Gonna|Vou}}|Indo (futuro)",
                "{{Want to|Querer}}|{{Wanna|Querer}}|Querer",
                "{{Kind of|Tipo de}}|{{Kinda|Meio que}}|Meio que...",
                "{{Out of|Fora de}}|{{Outta|Fora de}}|Fora de",
                "{{Got to|Tenho que}}|{{Gotta|Tenho que}}|Tenho que",
                "{{Don't know|Não sei}}|{{Dunno|Sei lá}}|Não sei",
                "{{Let me|Deixe-me}}|{{Lemme|Deixa eu}}|Deixa eu...",
                "{{Give me|Dê-me}}|{{Gimme|Me dá}}|Me dá"
            ]
        },
        {
            type: "audio-player",
            content: "Frase Teste: \"{{I'm gonna outta here coz I gotta work.|Vou sair daqui porque tenho que trabalhar.}}\""
        },
        {
            type: "h2",
            content: "Parte 4: A Técnica do Listening Ativo"
        },
        {
            type: "box-action",
            title: "Protocolo de Estudo com Séries",
            content: "Não assista passivamente. Escolha uma cena de 2 minutos.\n\n1. **Sem legenda**: Tente pegar o contexto.\n2. **Legenda em Inglês**: Leia e ouça. Identifique os 'Links' e 'Reduções' que aprendeu acima.\n3. **Shadowing**: Pause frase a frase e tente imitar o som exato.\n4. **Sem legenda novamente**: Você verá que a cena ficou 'lenta' magicamente."
        },
        {
            type: "pillar-end",
            title: "Decodificação Completa",
            content: "Seus ouvidos agora têm o filtro certo. O ruído virou sinal. Vamos para a sobrevivência prática."
        }
    ]
};

// ==============================================================================
// PILAR 3: SOBREVIVÊNCIA TÁTICA (EXPANDED ELITE VERSION)
// ==============================================================================
export const PILAR_3_DATA: PillarData = {
    id: 3,
    title: "Pilar 3: Kit de Sobrevivência Global",
    subtitle: "Scripts completos para dominar qualquer cenário urbano sem pânico.",
    blocks: [
        {
            type: "system-status",
            content: "{{SURVIVAL MODE|MODO DE SOBREVIVÊNCIA}}: {{READY|PRONTO}}. {{Tactical scripts loaded|Scripts táticos carregados}}."
        },
        {
            type: "h2",
            content: "Introdução: A Matriz da Educação (Politeness)"
        },
        {
            type: "paragraph",
            content: "Nos EUA e Reino Unido, a 'educação' (politeness) é moeda de troca. Ser direto demais soa rude. Ser educado abre portas e garante melhor atendimento."
        },
        {
            type: "table",
            content: [
                "Nível|Frase|Percepção do Nativo",
                "🔴 Rude|{{I want water.|Eu quero água.}}|Homem das cavernas. Exigente.",
                "🟡 Básico|{{Give me water, please.|Me dê água, por favor.}}|Aceitável, mas um pouco direto.",
                "🟢 Elite|{{Could I have some water?|Poderia me dar um pouco de água?}}|Educado, fluente, merece respeito.",
                "✨ Ultra|{{I'd like some water, please.|Gostaria de um pouco de água, por favor.}}|Perfeito. Padrão ouro."
            ]
        },
        {
            type: "h2",
            content: "Parte 1: O Restaurante (Cenário Completo)"
        },
        {
            type: "paragraph",
            content: "O restaurante é o teste final de sobrevivência. Vamos mapear do início ao fim."
        },
        {
            type: "h3",
            content: "Fase 1: Chegando (The Host)"
        },
        {
            type: "dialogue",
            title: "Na Porta",
            content: [
                "Host: {{Hi, welcome! Do you have a reservation?|Oi, bem-vindo! Você tem reserva?}}",
                "You: {{Yes, under the name [Seu Nome].|Sim, no nome de [Seu Nome].}}",
                "Host: {{Right this way.|Por aqui, por favor.}}"
            ]
        },
        {
            type: "h3",
            content: "Fase 2: Pedindo (Ordering)"
        },
        {
            type: "paragraph",
            content: "Nunca diga 'I want'. Use 'I'll have' ou 'I'd like'."
        },
        {
            type: "dialogue",
            title: "O Pedido",
            content: [
                "Waiter: {{Are you ready to order?|Está pronto para pedir?}}",
                "You: {{Yes. I'll have the steak, please.|Sim. Vou querer o bife, por favor.}}",
                "Waiter: {{How would you like your steak cooked?|Qual o ponto da carne?}}",
                "You: {{Medium-rare, please.|Ao ponto para mal, por favor.}}",
                "Waiter: {{And to drink?|E para beber?}}",
                "You: {{Just tap water, please.|Apenas água da torneira, por favor.}}"
            ]
        },
        {
            type: "box-insight",
            title: "Dica Cultural",
            content: "**Tap Water** (água da torneira) é grátis e segura nos EUA e Europa. Se pedir 'Water', eles podem trazer uma garrafa cara de $8. Seja específico."
        },
        {
            type: "h3",
            content: "Fase 3: Pagando (The Check)"
        },
        {
            type: "list",
            content: [
                "Peça a conta: *\"{{Can I have the check, please?|Pode me trazer a conta, por favor?}}\"* (EUA) ou *\"{{The bill, please?|A conta, por favor?}}\"* (UK).",
                "Gorjeta ({{Tip|Gorjeta}}): Nos EUA, 18-20% é obrigatório moralmente. Não deixe menos que isso a menos que o serviço tenha sido terrível.",
                "Dividir: *\"{{Can we split the check?|Podemos dividir a conta?}}\"* "
            ]
        },
        {
            type: "h2",
            content: "Parte 2: Hotel & Problemas (Troubleshooting)"
        },
        {
            type: "paragraph",
            content: "Fazer check-in é fácil. O difícil é reclamar que o chuveiro não funciona sem parecer um louco."
        },
        {
            type: "box-warning",
            title: "A Fórmula da Reclamação Suave",
            content: "Use esta estrutura: **Desculpa + O Problema + O Pedido.**\n\nEx: \"Hi, sorry to bother you, but my shower isn't working. Could you send someone to check it?\""
        },
        {
            type: "list",
            content: [
                "**O Wi-Fi não conecta**: *\"{{I'm having trouble connecting to the Wi-Fi.|Estou com problemas para conectar no Wi-Fi.}}\"*",
                "**Barulho**: *\"{{The room next door is very noisy.|O quarto ao lado está muito barulhento.}}\"*",
                "**Toalhas**: *\"{{Could we get some extra towels?|Poderíamos ter algumas toalhas extras?}}\"*",
                "**Late Check-out**: *\"{{Is it possible to have a late check-out?|É possível fazer o check-out mais tarde?}}\"* "
            ]
        },
        {
            type: "h2",
            content: "Parte 3: Direções & Transporte (Uber/Taxi)"
        },
        {
            type: "paragraph",
            content: "Hoje temos GPS, mas bateria acaba. Saber perguntar é essencial."
        },
        {
            type: "dialogue",
            title: "Pedindo Direção",
            content: [
                "You: {{Excuse me, how do I get to the subway station?|Com licença, como chego à estação de metrô?}}",
                "Local: {{Go straight, turn right at the lights, and it's on your left.|Vá em frente, vire à direita no semáforo, e fica à sua esquerda.}}",
                "You: {{Thank you so much!|Muito obrigado!}}"
            ]
        },
        {
            type: "interactive-quiz",
            content: "No Uber, você quer que ele ligue o ar condicionado. Você diz:|{{Turn on the air!|Ligue o ar!}}|{{Can you turn up the AC, please?|Pode aumentar o ar condicionado, por favor?}}|{{I'm hot.|Estou com calor.}}|1"
        },
        {
            type: "h2",
            content: "Parte 4: Saúde & Farmácia (Emergency)"
        },
        {
            type: "paragraph",
            content: "Não brinque com saúde. Vocabulário preciso salva vidas."
        },
        {
            type: "cards-grid",
            content: [
                "Sintomas|{{Headache|Dor de cabeça}} (Dor de cabeça), {{Sore throat|Garganta inflamada}} (Garganta inflamada), {{Fever|Febre}} (Febre), {{Nauseous|Enjoado}} (Enjoado)",
                "Remédios|{{Painkiller|Analgésico}} (Analgésico), {{Cough syrup|Xarope}} (Xarope), {{Band-aid|Curativo}} (Curativo), {{Prescription|Receita}} (Receita)"
            ]
        },
        {
            type: "box-action",
            title: "Frase de Ouro na Farmácia",
            content: "*\"{{I have a terrible headache. What do you recommend?|Tenho uma dor de cabeça terrível. O que você recomenda?}}\"* (Deixe o farmacêutico ajudar)."
        },
        {
            type: "pillar-end",
            title: "Agente Pronto para Campo",
            content: "Você tem os scripts. Você tem a postura. Você tem o vocabulário. Agora você não é mais um turista perdido; você é um viajante tático."
        }
    ]
};

// ==============================================================================
// PILAR 4: FUNDAMENTOS & ENGENHARIA (EXPANDED ELITE VERSION)
// ==============================================================================
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
                "SVO PROTOCOL:",
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

// ==============================================================================
// PILAR 5: FINANÇAS E NÚMEROS (EXPANDED ELITE VERSION)
// ==============================================================================
export const PILAR_5_DATA: PillarData = {
    id: 5,
    title: "Pilar 5: Domínio Financeiro & Numérico",
    subtitle: "Do café ao contrato milionário: como falar números com precisão cirúrgica.",
    blocks: [
        {
            type: "system-status",
            content: "{{FINANCE MODULE|MÓDULO FINANCEIRO}}: {{ACTIVE|ATIVO}}. {{Converting currency|Convertendo moeda}}..."
        },
        {
            type: "h2",
            content: "Introdução: O Custo do Erro"
        },
        {
            type: "paragraph",
            content: "Em uma viagem, errar um número pode custar o dobro. Em negócios, pode custar o emprego. Neste pilar, vamos blindar sua matemática linguística."
        },
        {
            type: "h2",
            content: "Parte 1: A Armadilha Sonora (13 vs 30)"
        },
        {
            type: "paragraph",
            content: "O erro mais comum e perigoso. Aprenda a diferença de ênfase."
        },
        {
            type: "table",
            content: [
                "Grupo|Exemplos|Aonde está a força?|Som Final",
                "Teens (Adolescentes)|{{13, 14, 15... 19|13, 14, 15... 19}}|No final (thir-{{TEEN|TEEN}})|Longo (innnn)",
                "Ties (Dezenas)|{{30, 40, 50... 90|30, 40, 50... 90}}|No início ({{THIR|THIR}}-ty)|Curto e seco (y)"
            ]
        },
        {
            type: "interactive-quiz",
            content: "Se eu digo '{{FOR-ty|QUARENTA}}', qual número é?|14|40|4"
        },
        {
            type: "h2",
            content: "Parte 2: Big Money (Milhões e Bilhares)"
        },
        {
            type: "paragraph",
            content: "Em inglês, usamos vírgula onde o português usa ponto, e vice-versa. Mas na fala, usamos blocos."
        },
        {
            type: "list",
            content: [
                "**{{Hundred|Centena}}**: Centena (100)",
                "**{{Thousand|Milhar}}**: Milhar (1,000) -> Note a vírgula!",
                "**{{Million|Milhão}}**: Milhão (1,000,000)",
                "**{{Billion|Bilhão}}**: Bilhão (1,000,000,000)"
            ]
        },
        {
            type: "box-action",
            title: "Tática de Leitura",
            content: "Leia sempre em blocos de 3 dígitos, seguindo a vírgula.\nEx: 2,500,300\n- 'Two million,'\n- 'Five hundred thousand,'\n- 'Three hundred.'"
        },
        {
            type: "h2",
            content: "Parte 3: Moeda e Preços (Street Smart)"
        },
        {
            type: "paragraph",
            content: "Ninguém fala 'Twenty dollars and zero cents'. Aprenda a gíria da rua."
        },
        {
            type: "table",
            content: [
                "Escrito|Falado (Formal)|Falado (Rua)",
                "$1.50|{{One dollar fifty|Um dólar e cinquenta}}|{{Buck fifty|Um mango e cinquenta}}",
                "$20.00|{{Twenty dollars|Vinte dólares}}|{{Twenty bucks|Vinte contos}}",
                "$1200|{{One thousand two hundred|Mil e duzentos}}|{{Twelve hundred|Doze centenas}} (Doze centenas)",
                "$250k|{{250 thousand|250 mil}}|{{Quarter mill|Um quarto de milhão}}"
            ]
        },
        {
            type: "h2",
            content: "Parte 4: Negociação de Salário (Roleplay Avançado)"
        },
        {
            type: "paragraph",
            content: "Você recebeu uma oferta. É hora de negociar."
        },
        {
            type: "dialogue",
            title: "A Contraproposta",
            content: [
                "HR: {{The offer is 50k a year.|A oferta é de 50 mil por ano.}}",
                "You: {{I appreciate the offer. However, based on my experience and the market average, I was expecting something in the 60k to 65k range.|Agradeço a oferta. Porém, com base na minha experiência e média de mercado, eu esperava algo entre 60 e 65 mil.}}",
                "HR: {{We can do 60k if you sign today.|Podemos fazer 60 mil se assinar hoje.}}",
                "You: {{It's a deal.|Fechado.}}"
            ]
        },
        {
            type: "box-insight",
            title: "Termos de Poder",
            content: "**{{Gross Salary|Salário Bruto}}**: Bruto.\\n**{{Net Salary|Salário Líquido}}**: Líquido.\\n**{{Benefits|Benefícios}}**: Benefícios (Plano de saúde, etc).\\n**{{Bonus|Bônus}}**: Bônus de performance."
        },
        {
            type: "h2",
            content: "Parte 5: Datas e Horários (Time Management)"
        },
        {
            type: "list",
            content: [
                "**Anos**: Divida em dois. 1990 = '{{Nineteen ninety|Dezenove noventa}}'. 2024 = '{{Twenty twenty-four|Vinte vinte e quatro}}'.",
                "**Horas**: Use 'Past' e 'To'. 2:15 = '{{Quarter past two|Um quarto passado das duas}}'. 2:50 = '{{Ten to three|Dez para as três}}'."
            ]
        },
        {
            type: "pillar-end",
            title: "Módulo Financeiro Encerrado",
            content: "Você agora sabe quanto custa, quanto ganha e quando vai acontecer. Você está no controle dos números."
        }
    ]
};

// ==============================================================================
// PILAR 6: PRODUÇÃO CONTROLADA (EXPANDED ELITE VERSION)
// ==============================================================================
export const PILAR_6_DATA: PillarData = {
    id: 6,
    title: "Pilar 6: Laboratório de Fala",
    subtitle: "Transformando pensamento passivo em som ativo: técnicas de fonoaudiologia para fluência.",
    blocks: [
        {
            type: "system-status",
            content: "{{VOICE MODULE|MÓDULO DE VOZ}}: {{RECORDING|GRAVANDO}}... {{PREPARE FOR OUTPUT|PREPARE PARA SAÍDA}}."
        },
        {
            type: "h2",
            content: "Introdução: A Fisiologia da Fala"
        },
        {
            type: "paragraph",
            content: "Falar inglês não é apenas mental; é físico. Sua boca, língua e garganta estão acostumadas com os sons do português. Para falar inglês, você precisa treinar esses músculos para fazer movimentos novos. É como ir à academia pela primeira vez."
        },
        {
            type: "h2",
            content: "Parte 1: Eliminando o Sotaque Brasileiro (The 'i' Killer)"
        },
        {
            type: "box-warning",
            title: "O Erro Número 1 do Brasileiro",
            content: "Adicionar um 'i' no final de palavras que terminam em consoante muda. Ex: '{{Facebook|Facebook}}' vira 'Facebooki'. '{{Big|Grande}}' vira 'Bigui'. Isso destrói o ritmo do inglês."
        },
        {
            type: "paragraph",
            content: "O inglês adora consoantes secas e abruptas. Treine cortar o som imediatamente."
        },
        {
            type: "table",
            content: [
                "Palavra|Brasileiro Típico (Errado)|Inglês Correto (Seco)",
                "{{Hot dog|Cachorro quente}}|Ró-ti dó-gui|{{Hot-dog|Cachorro quente}} (O 't' e 'g' somem)",
                "{{Internet|Internet}}|In-ter-né-tchi|{{In-ter-net|Internet}} (O 't' final é mudo)",
                "{{Facebook|Facebook}}|Fa-ce-boo-ki|{{Face-book|Facebook}} (O 'k' é uma parada)",
                "{{Big Mac|Big Mac}}|Bi-gui Mé-qui|{{Big-Mac|Big Mac}}"
            ]
        },
        {
            type: "h2",
            content: "Parte 2: Técnica Shadowing (A Sombra)"
        },
        {
            type: "paragraph",
            content: "Esta é a técnica usada por poliglotas e espiões. Não é repetir depois; é repetir JUNTO."
        },
        {
            type: "list",
            content: [
                "1. Escolha um áudio curto com transcrição (Podcast ou TED Talk).",
                "2. Ouça uma vez para entender.",
                "3. Toque de novo e tente falar AO MESMO TEMPO, imitando a melodia, as pausas e a respiração.",
                "4. Grave-se e compare."
            ]
        },
        {
            type: "audio-player",
            content: "Frase de Treino: \"I think that learning English is crucial for my career.\""
        },
        {
            type: "h2",
            content: "Parte 3: Story Reworking (Engenharia Reversa)"
        },
        {
            type: "paragraph",
            content: "Como melhorar seu vocabulário sozinho? Contando histórias e 'auditando' elas."
        },
        {
            type: "box-action",
            title: "O Processo de 4 Passos",
            content: "1. **Grave**: Conte uma história de 1 minuto no gravador.\n2. **Transcreva**: Escreva exatamente o que você falou (com erros e tudo).\n3. **Melhore**: Pegue o texto e troque palavras básicas por avançadas (Ex: 'Good' -> 'Amazing'). Corrija a gramática com o ChatGPT.\n4. **Regrave**: Conte a mesma história, agora usando a versão melhorada."
        },
        {
            type: "table",
            content: [
                "Versão 1.0 (Básica)|Versão 2.0 (Elite)",
                "Yesterday I go to the mall.|Yesterday I **went** to the mall.",
                "It was good.|It was **fantastic**.",
                "I eat a burger.|I **had** a delicious burger."
            ]
        },
        {
            type: "h2",
            content: "Parte 4: Respiração e Pausas (Thought Groups)"
        },
        {
            type: "paragraph",
            content: "Você não fala frase por frase. Você fala em 'grupos de pensamento'. Aprender onde respirar faz você soar fluente instantaneamente."
        },
        {
            type: "reveal-box",
            title: "Exemplo de Pausas",
            content: "Robô: \"I... want... to... go... to... the... store.\"\n\nHumano: \"I wanna go / to the store.\"\n\nAnalítico: \"If I were you / I would buy / that car.\""
        },
        {
            type: "h2",
            content: "Parte 5: Desafio de 7 Dias (Bootcamp)"
        },
        {
            type: "list",
            content: [
                "**Dia 1**: Grave-se lendo um parágrafo. Foque no final seco das palavras.",
                "**Dia 2**: Shadowing de 2 minutos.",
                "**Dia 3**: Narre o que você está fazendo enquanto cozinha/dirige.",
                "**Dia 4**: Story Reworking (Versão 1.0 e 2.0).",
                "**Dia 5**: Cante uma música rápida lendo a letra (Rap/Pop).",
                "**Dia 6**: Responda a uma entrevista simulada no espelho.",
                "**Dia 7**: Grave um vídeo se apresentando em 1 minuto. Guarde para ver daqui a 6 meses."
            ]
        },
        {
            type: "pillar-end",
            title: "Voz Ativada",
            content: "Sua boca agora sabe o caminho. Sua mente sabe o processo. Fale sem medo. O silêncio é o único erro."
        }
    ]
};

// ==============================================================================
// PILAR 7: AUTONOMIA E FERRAMENTAS (EXPANDED ELITE VERSION)
// ==============================================================================
export const PILAR_7_DATA: PillarData = {
    id: 7,
    title: "Pilar 7: Autonomia & O Infinito",
    subtitle: "Como nunca mais depender de um professor e aprender para sempre.",
    blocks: [
        {
            type: "system-status",
            content: "AUTONOMY PROTOCOL: ENABLED. Breaking dependency chains."
        },
        {
            type: "h2",
            content: "Introdução: A Chave da Prisão"
        },
        {
            type: "paragraph",
            content: "A indústria do inglês quer que você seja aluno para sempre. Nós queremos que você seja livre. Se você precisa de mim para saber se sua frase está certa, eu falhei. Este pilar é sua carta de alforria."
        },
        {
            type: "h2",
            content: "Parte 1: O Digital Toolkit (Seu Arsenal)"
        },
        {
            type: "paragraph",
            content: "A tecnologia hoje substitui 90% do que um professor faz. Use estas ferramentas."
        },
        {
            type: "table",
            content: [
                "Ferramenta|Função|Como Usar",
                "**DeepL**|Tradutor de Nuance|Melhor que o Google. Use para entender o 'tom' da frase.",
                "**YouGlish**|Busca de Contexto|Digite uma palavra e veja 1000 vídeos de nativos usando ela.",
                "**ChatGPT**|Tutor Pessoal|Peça correções, explicações gramaticais e exemplos.",
                "**Anki**|Memória Externa|App de repetição espaçada para nunca esquecer vocabulário."
            ]
        },
        {
            type: "box-insight",
            title: "Prompt Mestre para o ChatGPT",
            content: "Copie e cole isso na IA: *\"Aja como um professor de inglês nativo. Eu vou escrever um texto. Quero que você corrija meus erros, explique o motivo da correção e sugira uma forma mais natural/nativa de dizer a mesma coisa.\"*"
        },
        {
            type: "h2",
            content: "Parte 2: Input Ativo vs. Passivo"
        },
        {
            type: "paragraph",
            content: "Ouvir música enquanto lava louça é bom, mas não ensina inglês. Isso é Input Passivo. Para evoluir, você precisa de Input Ativo."
        },
        {
            type: "reveal-box",
            title: "A Diferença Real",
            content: "**Passivo**: Deixar o som entrar. Bom para manutenção.\n**Ativo**: Focar, anotar, repetir, pausar, analisar. Essencial para crescimento.\n\nRegra: 80% do seu tempo pode ser Passivo, mas os 20% Ativos valem ouro."
        },
        {
            type: "h2",
            content: "Parte 3: O Ciclo da Fluência (The Loop)"
        },
        {
            type: "paragraph",
            content: "Como manter o inglês vivo sem morar fora?"
        },
        {
            type: "list",
            content: [
                "**1. Consumo**: Leia notícias, veja vídeos, ouça podcasts sobre assuntos que você GOSTA (não sobre 'aprender inglês').",
                "**2. Captura**: Viu uma palavra nova? Anote no Anki.",
                "**3. Prática**: Use essa palavra em uma frase sozinha no chuveiro.",
                "**4. Revisão**: O Anki vai te lembrar da palavra antes de você esquecer."
            ]
        },
        {
            type: "h2",
            content: "Parte 4: A Rotina de 15 Minutos (Para quem não tem tempo)"
        },
        {
            type: "box-action",
            title: "O Plano Diário Mínimo Viável",
            content: "- **Minuto 0-5 (Café)**: Ler 1 artigo curto no app da BBC News ou CNN.\n- **Minuto 5-10 (Trânsito)**: Ouvir 5 min de um Podcast.\n- **Minuto 10-15 (Noite)**: Escrever 3 frases sobre como foi seu dia no bloco de notas."
        },
        {
            type: "pillar-end",
            title: "Você é Livre",
            content: "Você tem as ferramentas. Você tem o método. Você tem a rotina. A partir de agora, a responsabilidade é sua. E isso é ótimo."
        }
    ]
};

// ==============================================================================
// PILAR 8: ESPECIALIZAÇÕES (EXPANDED ELITE VERSION)
// ==============================================================================
export const PILAR_8_DATA: PillarData = {
    id: 8,
    title: "Pilar 8: Especializações (Select Your Class)",
    subtitle: "Personalize sua jornada: onde você quer ser elite?",
    blocks: [
        {
            type: "system-status",
            content: "CHARACTER SELECTION: OPEN. Choose your specialization."
        },
        {
            type: "paragraph",
            content: "O 'Inglês Geral' te trouxe até aqui. Agora, para chegar ao topo, você precisa de 'Inglês Específico'. Escolha sua classe de combate."
        },
        {
            type: "h2",
            content: "Classe 1: Business Elite (O Executivo)"
        },
        {
            type: "cards-grid",
            content: [
                "Foco|Reuniões, Liderança, Negociação e E-mails Formais.",
                "Para quem|Gerentes, Empreendedores e quem quer subir na carreira corporativa."
            ]
        },
        {
            type: "list",
            content: [
                "Aprenda a interromper com educação em uma call.",
                "Apresente gráficos e dados com confiança.",
                "Escreva e-mails que impõem respeito."
            ]
        },
        {
            type: "h2",
            content: "Classe 2: Global Traveler (O Nômade)"
        },
        {
            type: "cards-grid",
            content: [
                "Foco|Sobrevivência Avançada, Resolução de Problemas, Socialização.",
                "Para quem|Viajantes, Nômades Digitais e Turistas Profissionais."
            ]
        },
        {
            type: "list",
            content: [
                "Resolva extravios de bagagem e problemas de hotel.",
                "Faça amizade em bares e hostels.",
                "Alugue carros e entenda as leis locais."
            ]
        },
        {
            type: "h2",
            content: "Classe 3: Job Hunter (O Candidato)"
        },
        {
            type: "cards-grid",
            content: [
                "Foco|Entrevistas, Currículo, LinkedIn e Storytelling Pessoal.",
                "Para quem|Quem busca vaga em multinacional ou emprego no exterior."
            ]
        },
        {
            type: "list",
            content: [
                "Responda 'Tell me about yourself' perfeitamente.",
                "Use o método STAR para descrever suas conquistas.",
                "Negocie seu salário e benefícios em dólar."
            ]
        },
        {
            type: "h2",
            content: "Classe 4: IT Professional (O Tech Lead)"
        },
        {
            type: "cards-grid",
            content: [
                "Foco|Termos Técnicos, Daily Scrum, Code Review e Documentação.",
                "Para quem|Desenvolvedores, POs, Designers e Data Scientists."
            ]
        },
        {
            type: "list",
            content: [
                "Participe de Dailies sem travar.",
                "Explique arquitetura complexa de forma simples.",
                "Entenda sotaques de times globais (indianos, europeus, etc)"
            ]
        },
        {
            type: "pillar-end",
            title: "Menu Aberto",
            content: "Estude os cards. No próximo pilar, você tomará a decisão final e traçará seu plano."
        }
    ]
};

// ==============================================================================
// PILAR 9: A ENCRUZILHADA (EXPANDED ELITE VERSION)
// ==============================================================================
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
                "COMMITMENT PROTOCOL:",
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

export const PILLARS_CONTENT: { [key: number]: PillarData } = {
    1: PILAR_1_DATA,
    2: PILAR_2_DATA,
    3: PILAR_3_DATA,
    4: PILAR_4_DATA,
    5: PILAR_5_DATA,
    6: PILAR_6_DATA,
    7: PILAR_7_DATA,
    8: PILAR_8_DATA,
    9: PILAR_9_DATA
};

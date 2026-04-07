import { PillarData } from "@/types/study";

export const PILAR_1_DATA: PillarData = {
    id: 1,
    title: "PILAR 1: Protocolo de Iniciação",
    subtitle: "A reconfiguração completa da sua mentalidade e a ciência por trás da fluência.",
    modules: [
        {
            id: "p1-m1",
            title: "MÓDULO 1: O \"BRANCO\" MENTAL",
            subtitle: "Entender por que você trava e como desativar o modo de pânico em 5 segundos.",
            status: "active",
            blocks: [
                {
                    type: "h2",
                    content: "Bem-vindo(a)! Vamos começar"
                },
                {
                    type: "paragraph",
                    content: "Você está começando a primeira parte do curso. E já vale deixar uma coisa clara: aqui a gente não vai te jogar naquele inglês duro de escola.\n\nA ideia é outra. Você vai entender por que trava, como sair desse travamento e o que falar quando a mente der branco. Tudo com foco em conversa real, não em frase bonita de prova."
                },
                {
                    type: "h3",
                    content: "1.0 Por que tanta gente trava mesmo depois de estudar"
                },
                {
                    type: "paragraph",
                    content: "Muita gente estuda por anos, entende exercícios, reconhece palavras, mas na hora de abrir a boca trava. Isso acontece porque o ensino tradicional acostuma você a pensar no inglês como matéria, não como ferramenta.\n\nNeste módulo, a gente vai fazer três coisas:\n\n• entender por que o branco aparece;\n• aprender frases curtas que te salvam na hora;\n• trocar vergonha por controle."
                },
                {
                    type: "box-action",
                    title: "Aquecimento rápido",
                    content: "Essas frases estão embaralhadas. A ideia aqui não é decorar regra. É fazer seu cérebro entrar em modo prático desde o começo."
                },
                {
                    type: "scramble-exercise",
                    content: JSON.stringify({
                        sentence: "I eat breakfast at 8 am.",
                        translation: "Eu tomo café da manhã às 8."
                    })
                },
                {
                    type: "scramble-exercise",
                    content: JSON.stringify({
                        sentence: "Today, I went to the park.",
                        translation: "Hoje, eu fui ao parque."
                    })
                },
                {
                    type: "scramble-exercise",
                    content: JSON.stringify({
                        sentence: "Can you say that again?",
                        translation: "Pode falar isso de novo?"
                    })
                },
                {
                    type: "paragraph",
                    content: "Sinta a diferença: você não está olhando uma regra e tentando parecer perfeito. Você está montando inglês real com a mão na massa."
                },
                {
                    type: "system-status",
                    content: "{{CHECK-IN DA AULA|Check-in da aula}}: {{LENDO SEU MOMENTO|Lendo seu momento}}... {{NERVOSISMO IDENTIFICADO|Nervosismo identificado}}... {{VOLTANDO AO CONTROLE|Voltando ao controle}}..."
                },
                {
                    type: "paragraph",
                    content: "Você já esteve em uma reunião ou viagem, alguém te fez uma pergunta simples e... **PUFT**. Sua mente virou uma TV fora do ar. O coração disparou, a mão suou e a palavra sumiu. \n\n**Isso não é falta de inteligência.** É biologia. Seu cérebro entrou em {{Panic Mode|Modo de Pânico}} e desligou sua capacidade de pensar em inglês para tentar te proteger do julgamento alheio."
                },
                {
                    type: "elite-insight",
                    title: "💡 POR QUE ISSO IMPORTA?",
                    content: "Enquanto você estiver no \"modo pânico\", seu cérebro bloqueia a parte que sabe gramática. Se você não souber desativar esse \"interruptor\", você vai estudar 10 anos e continuar travando na {{Real Life|Vida Real}}."
                },
                {
                    type: "h2",
                    content: "1.1 O que fazer quando der branco"
                },
                {
                    type: "paragraph",
                    content: "Quando o branco vier, o pior erro é se diminuir com frases como \"{{Sorry, my English is bad|desculpa, meu inglês é ruim}}\". Isso piora o nervosismo e ainda faz você perder presença.\n\nO melhor caminho é simples: ganhar tempo com uma frase curta, retomar o que ouviu e seguir a conversa sem se humilhar."
                },
                {
                    type: "box-action",
                    title: "Frase de apoio que salva",
                    content: "Em vez de pedir desculpas, use uma frase curta que segura a conversa:\n\n**\"{{Say that again.|Fala isso de novo.}}\"**\n\nRepita em voz alta agora: **/sêi-dét-ə-guén/**.\n\nA lógica aqui é simples: você não trava, não some e não finge que entendeu. Você só puxa a conversa de volta para um lugar seguro."
                },
                {
                    type: "micro-win",
                    content: "**Vitória imediata:** você já tem uma resposta prática para quando travar. Isso parece pequeno, mas muda muito a forma como você entra numa conversa."
                },
                {
                    type: "paragraph",
                    content: "Ao final deste Pilar, você vai fazer um desafio para mostrar que entendeu a lógica do método. A ideia não é perfeição. É mostrar que você já consegue reagir melhor do que antes."
                }
            ]
        },
        {
            id: "p1-m2",
            title: "MÓDULO 2: A VIRADA DE CHAVE",
            subtitle: "A 'Ponte Húngara' e a prova de que necessidade real acelera seu inglês.",
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
                        "title": "🧠 CAMADA NEUROCIENTÍFICA: Memória Declarativa vs. Procedural",
                        "declarative": {
                            "title": "Memória Declarativa",
                            "icon": "📚",
                            "description": "É o foco das escolas tradicionais. Armazena fatos e regras (ex: 'A estrutura do {{Present Perfect|Presente Perfeito}} é {{have|ter}} + particípio'). É um processo lento, consciente e exige que o Córtex Pré-Frontal 'calcule' a frase antes de falar. Sob estresse, esse cálculo trava."
                        },
                        "procedural": {
                            "title": "Memória Procedural",
                            "icon": "🎯",
                            "description": "É a memória de habilidades motoras (como dirigir ou lutar). Ela reside nos Gânglios da Base. É automática, rápida e não requer pensamento consciente. É a base da fluência real."
                        },
                        "diagnosis": "No Brasil, o Roger tinha muita informação declarativa, mas zero treino procedural. Quando a pressão subiu, o cérebro dele tentou calcular a regra, gerou um erro de processamento e ele travou. O aprendizado real só acontece quando a língua migra da regra (declarativa) para o reflexo (procedural)."
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
                        "headers": ["Situação", "Inglês de Livro (Engessado)", "Inglês de Combate (Real)", "Análise de Eficiência"],
                        "rows": [
                            ["Expressar Sentimento", "{{I am very happy to be here.|Estou muito feliz de estar aqui.}}", "{{I'm so glad I made it.|Estou feliz demais de ter conseguido chegar.}}", "{{Glad|Contente}} é mais orgânico; {{Made it|Consegui chegar}} foca no esforço."],
                            ["Dificuldade de Entendimento", "{{Could you repeat that slowly?|Poderia repetir devagar?}}", "{{Wait, I'm lost. Come again?|Espera, me perdi. Fala de novo?}}", "Metáforas de movimento ({{lost|perdido}}) são muito mais comuns."],
                            ["Sair de Casa", "{{We must go to the restaurant.|Devemos ir ao restaurante.}}", "{{Let's head out. I'm starving.|Vamos indo. Tô faminto.}}", "{{Head out|Sair/Partir}} é um phrasal verb vital."],
                            ["Resolver Conflito", "{{I do not agree with your opinion.|Não concordo com sua opinião.}}", "{{I don't see it that way.|Eu não vejo assim.}}", "Menos agressivo, mais natural."]
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
                        "title": "As 4 Fases de Aquisição Tática",
                        "phases": [
                            {
                                "name": "Observação",
                                "icon": "👁️",
                                "description": "Reconhecimento de Padrão: Eu não focava nas palavras, mas nas reações dela. Se eu falava de um jeito e ela sorria, o padrão era validado. O feedback emocional é mais poderoso que qualquer correção gramatical."
                            },
                            {
                                "name": "Associação",
                                "icon": "🔗",
                                "description": "Âncora Química: Eu não traduzia a palavra '{{Missed|Senti falta}}'. Eu associava o som /míst/ ao sentimento de saudade quando ela viajava. Isso criou uma âncora dopaminérgica — a palavra virou sensação, não tradução."
                            },
                            {
                                "name": "Erro",
                                "icon": "⚡",
                                "description": "Calibragem de Mira: Eu falava errado, era corrigido ou não era entendido, e meu cérebro ajustava o som. O erro era apenas um dado técnico de ajuste de mira, não uma falha moral."
                            },
                            {
                                "name": "Repetição",
                                "icon": "🔄",
                                "description": "Mielinização: O que funcionava, eu usava de novo e de novo até que os músculos da minha boca não precisassem mais de comando consciente. O reflexo substituiu o cálculo."
                            }
                        ]
                    })
                },
                {
                    type: "phrase-analysis",
                    content: JSON.stringify({
                        "phrase": "{{I'm not sure I follow you.|Não tenho certeza se te acompanho.}}",
                        "phonetic": "/aim-nó-ʃôr-ai-fó-lou-iu/ — O 't' final desaparece para dar lugar ao 'f'. Ninguém diz {{I am not|Eu não sou}} /ai/ /æm/ /nɒt/. O som real é um bloco único.",
                        "grammarNote": "Eu removi o '{{that|que}}' (I'm not sure THAT I...). No método operacional, se uma palavra não adiciona significado, ela é descartada para economizar largura de banda cerebral."
                    })
                },
                {
                    type: "h2",
                    content: "⚔️ Cenário de Combate: A 'DR' sem Google Tradutor"
                },
                {
                    type: "scenario-card",
                    content: JSON.stringify({
                        "context": "Você e sua parceira/o estão em um restaurante. Houve um mal-entendido sobre o horário. O clima está pesado. Você precisa resolver isso sem parecer um robô ou um dicionário ambulante.",
                        "situation": "Você chegou atrasado e precisa se desculpar e resolver a situação.",
                        "wrong": {
                            "action": "O Recruta (Mentalidade de Franquia): Tenta montar a frase perfeita na cabeça antes de falar. Fica calculando preposições.",
                            "result": "\"{{I apologize. I arrived late because the traffic was very intense. Please, do not be angry.|Peço desculpas. Cheguei atrasado porque o trânsito estava muito intenso. Por favor, não fique brava.}}\" — Soa frio, distante e mecânico."
                        },
                        "right": {
                            "action": "O Operador (Mentalidade BasedSpeak): Usa linguagem real com expressões de nativo. Admite o erro com naturalidade. Oferece solução prática.",
                            "result": "\"{{Hey, my bad. I messed up with the time. Traffic was a total nightmare, seriously. Let's just eat, okay? My treat.|Ei, foi mal. Eu errei com o horário. O trânsito estava um pesadelo total, sério. Vamos só comer, tá bom? Eu pago.}}\" — Humano, tático, resolve o conflito."
                        }
                    })
                },
                {
                    type: "reveal-box",
                    title: "🔍 Análise do Sucesso (Clique para expandir)",
                    content: "'{{My bad|Foi mal}} / {{I messed up|Eu vacilei}}': admite o erro de forma humana e rápida. '{{Total nightmare|Pesadelo total}}': usa imagem simples em vez de frase engessada. '{{My treat|Por minha conta}}': resolve com ação prática. A frase natural fala menos e comunica muito mais."
                },
                {
                    type: "h2",
                    content: "🎙️ Tom e Voz: A Mentalidade de Elite"
                },
                {
                    type: "paragraph",
                    content: "**Pare de se desculpar.** O vício brasileiro de dizer \"{{Sorry for my bad English|Desculpe pelo meu inglês ruim}}\" é um sinal de submissão que sabota sua autoridade. Na \"Ponte Húngara\", eu entendi que se eu ficasse me desculpando, eu nunca lideraria a conversa. O inglês é apenas o cabo que conecta dois computadores; se o sinal tiver ruído, você não joga o computador fora, você apenas **ajusta a frequência**."
                },
                {
                    type: "elite-insight",
                    title: "💡 INSIGHT DE ELITE",
                    content: "Eu não criei a BasedSpeak porque sou um gênio das línguas. Eu a criei porque eu senti a humilhação de ser um adulto 'mudo'. Minha missão é garantir que você não precise passar por quatro anos de mentiras para só então começar a viver o idioma na prática."
                },
                {
                    type: "box-warning",
                    title: "🔓 OPEN LOOP: A COLA SONORA",
                    content: "A técnica que salvou Roger na 'Ponte Húngara' depende de uma coisa: decodificar a velocidade nativa. No próximo pilar, revelaremos o segredo do '{{Connected Speech|Fala Conectada}}', a razão pela qual '{{What do you want|O que você quer}}' vira '{{Whaddya-wanna|O que cê quer}}'."
                }
            ]
        },
        {
            id: "p1-m3",
            title: "MÓDULO 3: ONDE O MÉTODO TRAVA",
            subtitle: "Por que o ensino tradicional costuma falhar na conversa real.",
            status: "locked",
            blocks: [
                {
                    type: "system-status",
                    content: "{{AUTOPSY REPORT|Relatório de Autópsia}}: {{TRADITIONAL_METHOD.exe|MÉTODO_TRADICIONAL.exe}}... {{VIRUS DETECTED|Vírus Detectado}}... {{SHUTTING DOWN SYSTEM|Desligando Sistema}}..."
                },
                {
                    type: "box-warning",
                    title: "🚨 A VERDADE BRUTAL",
                    content: "O modelo de negócio das grandes escolas depende do seu fracasso. Se você aprende em 6 meses, eles perdem 4 anos de mensalidade. Você não é um aluno para eles; você é uma anuidade paga."
                },
                {
                    type: "h2",
                    content: "3.1 O Inglês de \"Laboratório\" (Estéril e Morto)"
                },
                {
                    type: "paragraph",
                    content: "Você passou anos preenchendo lacunas em livros coloridos. Aprendeu a cor das frutas e os animais da fazenda. Mas, no primeiro soco da vida real (um nativo falando rápido), você desmaiou. \n\nO inglês de livro é um cadáver: não tem sotaque, não tem gíria e não tem pressa. O mundo real é um 'zoológico'."
                },
                {
                    type: "brain-diagram",
                    content: JSON.stringify({
                        "title": "🧠 POR QUE VOCÊ ESQUECE TUDO?",
                        "steps": [
                            "Input Passivo: Ler regras e ouvir áudios lentos gera sinapses fracas. Seu cérebro deleta isso em 24h porque não vê risco nem recompensa.",
                            "A Mordaça Gramatical: Ao tentar 'calcular' a regra antes de falar, você gera um delay de processamento. A conversa avança e você fica para trás.",
                            "Recuperação Ativa (BasedSpeak): Nós não ensinamos a regra. Nós te jogamos no fogo. O cérebro só grava o que é necessário para surpreender."
                        ]
                    })
                },
                {
                    type: "h2",
                    content: "3.2 O Crime do \"{{I am going to|Eu vou}}\""
                },
                {
                    type: "paragraph",
                    content: "Eles te ensinaram a falar frases inteiras, sílaba por sílaba. Mas humanos não falam assim. Veja a diferença entre o que você aprendeu e o que você realmente precisa ouvir."
                },
                {
                    type: "phonetic-breakdown",
                    content: JSON.stringify({
                        "formal": {
                            "text": "{{I am going to travel next year.|Eu vou viajar no ano que vem.}}",
                            "analysis": "5 Unidades de processamento. Pesado. Soa como um computador de 1990."
                        },
                        "combat": {
                            "text": "{{I'm gonna travel nex' year.|Vou viajar ano que vem.}}",
                            "analysis": "1 Unidade sonora: /aim-gâ-na/. Rápido. O 't' de {{next|próximo}} desaparece. É assim que o mundo fala."
                        },
                        "explanation": "Sanduíche de Consoantes: Quando o 't' fica preso entre duas consoantes, o nativo o descarta para ganhar velocidade. Se você tenta pronunciar tudo, você trava a língua e soa 'estrangeiro demais'."
                    })
                },
                {
                    type: "comparison-table",
                    content: JSON.stringify({
                        "headers": ["Elemento", "Escola Comum (Necrotério)", "Método Elite (Operacional)"],
                        "rows": [
                            ["Velocidade", "Lenta e Robótica", "{{Connected Speech|Fala Conectada}} Real"],
                            ["Erro", "Punido com nota (Gera Medo)", "Dados de Calibragem (Gera Audácia)"],
                            ["Vocabulário", "Inútil (Cores/Animais)", "Pareto 80/20 (Alta Frequência)"],
                            ["Foco", "Saber 'sobre' o inglês", "{{Get it done|Fazer acontecer}} no inglês"]
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
                    content: "⚔️ Cenário de Combate: A Emboscada Corporativa"
                },
                {
                    type: "scenario-card",
                    content: JSON.stringify({
                        "context": "Reunião de emergência via Zoom. Seu chefe americano solta uma metralhadora de palavras.",
                        "situation": "\"{{Guys, we gotta pivot the strategy 'cause the numbers ain't lookin' good. Whad'ya reckon?|Pessoal, temos que mudar a estratégia porque os números não estão bons. O que acham?}}\"",
                        "wrong": {
                            "action": "Tentar processar o 'ain't' e o 'reckon' (que não estavam no seu livro). Entrar em pânico.",
                            "result": "Silêncio constrangedor. Você parece incompetente, mas é apenas o seu método que é lento."
                        },
                        "right": {
                            "action": "Filtro de Ruído. Capturar apenas as palavras de poder: {{PIVOT|MUDAR}}, {{STRATEGY|ESTRATÉGIA}}, {{NUMBERS|NÚMEROS}}, {{NOT GOOD|NADA BOM}}.",
                            "result": "\"{{I'm with you. Let's change the plan. I have an idea.|Tô contigo. Vamos mudar o plano. Tenho uma ideia.}}\" (Líder. Operacional. Elite.)"
                        }
                    })
                },
                {
                    type: "elite-insight",
                    title: "💡 DESPERTE SUA RAIVA",
                    content: "Sinta raiva do tempo perdido preenchendo lacunas. Essa raiva é o que vai te impulsionar a não aceitar mais o método medíocre. O brasileiro médio tem 'trauma' de inglês porque foi tratado como uma criança incapaz."
                },
                {
                    type: "box-action",
                    title: "🔓 O FIM DA DITADURA DO DICIONÁRIO",
                    content: "Saber inglês não é saber TODAS as palavras. É saber as palavras certas. No próximo módulo, vou te mostrar como 20% do vocabulário resolve 80% da sua vida. Vamos cortar a gordura e focar no músculo. O Princípio de Pareto vai explodir sua mente."
                },
                {
                    type: "combat-sort-game",
                    content: JSON.stringify([
                        { "text": "I apologize for the inconveniences", "type": "lab" },
                        { "text": "My bad, I messed up", "type": "combat" },
                        { "text": "I am going to travel next year", "type": "lab" },
                        { "text": "I'm gonna travel nex' year", "type": "combat" },
                        { "text": "Could you repeat that slowly?", "type": "lab" },
                        { "text": "Wait, I'm lost. Come again?", "type": "combat" }
                    ])
                }
            ]
        },
        {
            id: "p1-m4",
            title: "MÓDULO 4: A LEI DE PARETO",
            subtitle: "O segredo dos 20%: resolver 80% das situações com vocabulário útil.",
            status: "locked",
            blocks: [
                {
                    type: "system-status",
                    content: "{{RESOURCE OPTIMIZATION|OTIMIZAÇÃO DE RECURSOS}}: {{ENABLED|Ativado}}. {{SCANNING HIGH-FREQUENCY DATA|Escaneando Dados de Alta Frequência}}... {{80/20 RULE APPLIED|Regra 80/20 Aplicada}}."
                },
                {
                    type: "box-goal",
                    title: "Objetivo Tático",
                    content: "Parar de carregar peso morto. Vamos identificar as armas de alto calibre (vocabulário de alta frequência) que permitem que você opere no mundo real com o mínimo de esforço. Fluência não é sobre saber MUITO, é sobre saber o que IMPORTA."
                },
                {
                    type: "h2",
                    content: "4.1 A Ditadura do Dicionário vs. O ROI Linguístico"
                },
                {
                    type: "paragraph",
                    content: "O maior erro do recruta é acreditar que saber inglês é saber TODAS as palavras. Um nativo conhece 20.000 palavras, mas usa apenas 3.000 no dia a dia.\n\nSe você focar nas palavras certas (o seu {{Return on Investment|Retorno sobre Investimento}}), você consegue negociar, viajar e liderar reuniões com apenas 800 a 1.200 palavras bem aplicadas. Você está estudando para ser um dicionário ambulante ou um Operador de Elite?"
                },
                {
                    type: "brain-diagram",
                    content: JSON.stringify({
                        "title": "🧠 O FILTRO DE SOBREVIVÊNCIA (SAR)",
                        "steps": [
                            "Sobrecarga Cognitiva: Tentar aprender palavras 'bonitas' mas inúteis (como {{nevertheless|no entanto}}) trava o seu Córtex. Seu cérebro gasta energia escolhendo a palavra e esquece de falar.",
                            "O Princípio de Pareto: 20% do vocabulário é responsável por 80% da comunicação real. Ao focar nesse núcleo, você cria 'Super-Rodovias Neurais' para respostas automáticas.",
                            "Poda Sináptica: O cérebro de elite descarta o que não usa. Se uma palavra não te ajuda a resolver um problema em 15 segundos, ela é lixo tecnológico."
                        ]
                    })
                },
                {
                    type: "elite-insight",
                    title: "💡 INSIGHT DE COMANDO",
                    content: "A fluência operacional não é o tamanho do seu arsenal, mas a sua habilidade em derrubar o alvo com uma única pistola. Carregar um canhão que você não consegue levantar só vai te fazer ser morto em campo."
                },
                {
                    type: "comparison-table",
                    content: JSON.stringify({
                        "headers": ["Conceito", "Palavra de Livro (Baixo ROI)", "Palavra de Elite (Alto ROI)", "Vantagem"],
                        "rows": [
                            ["Executar", "{{To execute/implement|Executar/Implementar}}", "{{To get it done|Fazer acontecer}}", "{{Get|Pegar/Conseguir}} é a ferramenta universal."],
                            ["Entender", "{{To comprehend|Compreender}}", "{{To get it / To follow|Entender / Acompanhar}}", "Curto, rítmico e demonstra conexão."],
                            ["Descobrir", "{{To discover|Descobrir}}", "{{To find out|Descobrir/Apurar}}", "Padrão ouro em 95% das conversas reais."],
                            ["Compensar", "{{To compensate|Compensar}}", "{{To make up for|Compensar por}}", "Soa humano e natural, não corporativo."]
                        ]
                    })
                },
                {
                    type: "h2",
                    content: "4.2 A Ferramenta Universal: O Verbo \"{{GET|CONSEGUIR}}\""
                },
                {
                    type: "paragraph",
                    content: "Se o inglês fosse uma máquina, o verbo **GET** seria o óleo que faz as engrenagens girarem. Ele substitui mais de 50 outros verbos. Se você domina o {{Get|Conseguir}}, sua autonomia sobre 40% instantaneamente."
                },
                {
                    type: "phrase-analysis",
                    content: JSON.stringify({
                        "phrase": "{{I'll get it to you by tomorrow.|Eu entrego para você até amanhã.}}",
                        "phonetic": "/ail-gué-rit-tchu-bai-tu-már-rou/ — O 't' de {{get|pegar}} vira um 'r' rápido (Flap T). O {{to you|para você}} vira /tchu/.",
                        "grammarNote": "Aqui, GET substitui {{send|enviar}}, {{deliver|entregar}} ou {{bring|trazer}}. Você simplifica a tarefa para o cérebro de quem ouve."
                    })
                },
                {
                    type: "h2",
                    content: "⚔️ Cenário de Combate: A Guerra dos Prazos"
                },
                {
                    type: "scenario-card",
                    content: JSON.stringify({
                        "context": "Cliente internacional furioso. O relatório está atrasado. Sua Amígdala quer que você se esconda.",
                        "situation": "\"{{Where is the report? We were expecting it yesterday!|Onde está o relatório? Estávamos esperando ontem!}}\"",
                        "wrong": {
                            "action": "O Recruta tenta ser 'educado demais' com palavras complexas e gagueja.",
                            "result": "\"{{I apologize for the inconveniences. We are having difficulties...|Peço desculpas pelas inconveniências. Estamos tendo dificuldades...}}\" (Você soa distante e inseguro.)"
                        },
                        "right": {
                            "action": "O Operador usa Pareto. Direto ao ponto. Foco no resultado.",
                            "result": "\"{{Sorry about that. We're running a bit late, but I'll get it done today. Is that okay?|Desculpe por isso. Estamos um pouco atrasados, mas vou resolver hoje. Tudo bem?}}\" (Você assume o comando da conversa)"
                        }
                    })
                },
                {
                    type: "box-warning",
                    title: "⚠️ O LIMITE DO TUTORIAL",
                    content: "O que você viu até aqui é o mapa da mina. Mas saber que o 80/20 existe não é o mesmo que possuir as listas de alta frequência e os treinamentos de mielinização pesada. \n\nExiste um protocolo silencioso que separa quem 'sabe como funciona' de quem 'opera no automático'. Para cruzar essa linha, você precisará de mais do que apenas teoria."
                },
                {
                    type: "elite-insight",
                    title: "🔓 OPEN LOOP: O VÍRUS DO SOTAQUE",
                    content: "Você aprendeu a economizar palavras. Mas de que adianta usar as palavras certas se o seu sotaque brasileiro adiciona uma \"{{Vogal Fantasma|Epêntese}}\" que faz os gringos acharem que você é um amador? No próximo módulo, vou te mostrar o som invisível que destrói sua autoridade. Prepare seus ouvidos."
                }
            ]
        },
        {
            id: "p1-m5",
            title: "MÓDULO 5: ANATOMIA DO SOM REAL",
            subtitle: "Entendendo o ritmo real da fala nativa para ouvir com mais clareza.",
            status: "locked",
            blocks: [
                {
                    type: "system-status",
                    content: "{{AUDIO DECODER|DECODIFICADOR DE ÁUDIO}}: {{CONNECTED_SPEECH.wav ANALYZING|FALA_CONECTADA.wav ANALISANDO}}... {{DETECTING PHANTOM VOWELS|Detectando Vogais Fantasmas}}..."
                },
                {
                    type: "box-goal",
                    title: "Objetivo Tático",
                    content: "Seu ouvido não é ruim; ele foi mal treinado. Vamos entender por que os nativos parecem falar 'rápido demais' e como desativar a 'Vogal Fantasma' (o vício nº 1 dos brasileiros) que destrói sua inteligência percebida em campo."
                },
                {
                    type: "h2",
                    content: "5.1 O Mito da Velocidade (Eles não falam rápido)"
                },
                {
                    type: "paragraph",
                    content: "A maior reclamação dos operadores novatos é: 'Eu entendo o professor, mas não entendo o nativo na rua'. O segredo: eles não falam rápido, eles falam **conectado**.\n\nO português é uma língua 'Sílaba por Sílaba' (tá-tá-tá-tá). O inglês é uma língua de 'Ritmo e Pancada' (Stress-timed). Nós atropelamos as palavras fracas para chegar logo nas fortes."
                },
                {
                    type: "brain-diagram",
                    content: JSON.stringify({
                        "title": "🧠 O FILTRO FONÉTICO BRASILEIRO",
                        "steps": [
                            "Percepção Categórica: Seu cérebro foi treinado para ignorar sons que não existem no português. Quando um nativo usa um 'Schwa' ou um 'Short I', seu cérebro tenta encaixar na gaveta mais próxima (geralmente o som de 'i' ou 'é').",
                            "O Delay de Processamento: Você ouve '{{Bit|Pouco}}' e seu cérebro processa como '{{Beat|Bater}}'. Essa confusão gera um atraso. Enquanto você decodifica a primeira palavra, o nativo já terminou a frase.",
                            "Remapeamento Neural: Para entender o inglês real, precisamos instalar um novo driver de áudio no seu córtex auditivo."
                        ]
                    })
                },
                {
                    type: "h2",
                    content: "5.2 A Batalha contra a 'Vogal Fantasma' (O Vírus 'i')"
                },
                {
                    type: "paragraph",
                    content: "O maior inimigo da sua autoridade é o som que você **adiciona** onde ele não existe. No Brasil, consoante muda é proibida; toda consoante quer uma vogal de mãos dadas. No inglês, consoantes podem (e devem) morrer secas."
                },
                {
                    type: "comparison-table",
                    content: JSON.stringify({
                        "headers": ["Palavra", "O Erro Brasileiro (Vogal Fantasma)", "O Som Elite (Seco)", "Impacto na Imagem"],
                        "rows": [
                            ["Facebook", "Face-bu-qui", "/feis-buk/", "O 'i' final sinaliza amadorismo imediato."],
                            ["Like", "Lai-qui", "/laik/", "Matar o som no 'k' economiza 0.5s de processamento."],
                            ["Red", "He-di", "/red/", "Se você disser 'Redi', o nativo entende '{{Ready|Pronto}}'."],
                            ["Stop", "Es-tó-pi", "/stɑːp/", "Adicionar um 'e' antes do 's' é o 'dedo-duro' da sua nacionalidade."]
                        ]
                    })
                },
                {
                    type: "box-action",
                    title: "🎯 AÇÃO CORRETIVA: O PENHASCO",
                    content: "Imagine que o final da palavra é um penhasco. Você deve parar exatamente na consoante final. Não deixe sua língua 'escorregar' para um som de 'i'. Treine travar a garganta no final de \"{{Big|Grande}}\" e \"{{Hot|Quente}}\"."
                },
                {
                    type: "h2",
                    content: "🛠️ Engenharia Reversa: Desmontando o 'What do you...'"
                },
                {
                    type: "paragraph",
                    content: "Vamos analisar a frase mais comum do mundo e por que você nunca a ouviu como aprendeu na escola."
                },
                {
                    type: "phonetic-breakdown",
                    content: JSON.stringify({
                        "formal": {
                            "text": "{{What do you want to eat?|O que você quer comer?}}",
                            "analysis": "6 palavras separadas. Lento. Artificial. Ninguém fala assim fora da sala de aula."
                        },
                        "combat": {
                            "text": "{{Whaddya wanna eat?|Que cê qué comer?}}",
                            "analysis": "/wʌ-djə-wɑː-nə-it/ — 3 blocos sonoros fluidos."
                        },
                        "explanation": "Redução Tática: O 'do you' funde-se com 'what', virando /wʌ-djə/. O 'want to' vira 'wanna'. Se você esperar ouvir 'What do you', você vai perder o início da frase e ficar perdido no resto."
                    })
                },
                {
                    type: "h2",
                    content: "🌍 Camada Cultural: O Inglês 'Mascado' vs. O Inglês 'Cantado'"
                },
                {
                    type: "paragraph",
                    content: "No Brasil, falamos com a boca muito aberta e articulada. O inglês é falado no fundo da garganta, com a mandíbula relaxada, quase sem abrir a boca."
                },
                {
                    type: "comparison-table",
                    content: JSON.stringify({
                        "headers": ["Elemento", "Formal (Acadêmico)", "Street (Operacional)", "Por que fazem isso?"],
                        "rows": [
                            ["Got to", "{{I have got to go.|Eu tenho que ir.}}", "{{I gotta split.|Tenho que vazar.}}", "Eficiência máxima de movimento."],
                            ["Could have", "{{I could have done it.|Eu poderia ter feito.}}", "{{I coulda done it.|Eu podia ter feito.}}", "Redução de 4 sílabas para 2."],
                            ["Out of", "{{Get out of here.|Saia daqui.}}", "{{Outta here!|Zarpa daqui!}}", "O 't' vira 'r' e as palavras se fundem."]
                        ]
                    })
                },
                {
                    type: "reveal-box",
                    title: "📝 NOTA TÁTICA (Clique para expandir)",
                    content: "O nativo não fala 'errado', ele fala de forma econômica. Tentar falar o inglês de livro em um bar ou em uma reunião informal é como ir de terno e gravata para a praia: você é o único que não está confortável e todos percebem."
                },
                {
                    type: "h2",
                    content: "⚔️ Cenário de Combate: O Pedido sob Pressão (Coffee Shop)"
                },
                {
                    type: "scenario-card",
                    content: JSON.stringify({
                        "context": "Starbucks em NY. Fila enorme atrás de você. O atendente, estressado, dispara:",
                        "situation": "\"{{Whaddya-havin? Need-any-thin-else?|O que vai querer? Precisa de mais algo?}}\"",
                        "wrong": {
                            "action": "O Aluno Tradicional tenta separar as palavras: 'What... do... you... having?'. Ele trava na gramática do 'having'.",
                            "result": "O atendente perde a paciência. 'Next!'. Você sai sem o café e com a autoestima no chão."
                        },
                        "right": {
                            "action": "O Operador Elite reconhece o som /whaddya/ como um bloco único. Foca na entonação de pergunta.",
                            "result": "\"{{Black coffee. That's it.|Café preto. Só isso.}}\" (Curto, claro e funcional.)"
                        }
                    })
                },
                {
                    type: "h2",
                    content: "🎙️ Tom e Voz: A Autoridade do Silêncio"
                },
                {
                    type: "paragraph",
                    content: "O brasileiro tem pavor do silêncio. Quando esquecemos uma palavra, preenchemos com \"éééé...\" ou \"humm...\". Isso é mortal.\n\n**Técnica de Elite:** Se esquecer a palavra, faça uma pausa silenciosa. Olhe nos olhos. O silêncio demonstra pensamento e controle. O \"éééé\" demonstra insegurança e ativa o sotaque brasileiro."
                },
                {
                    type: "elite-insight",
                    title: "💡 INSIGHT DE ELITE",
                    content: "O seu ouvido é um músculo. Se você só treina ouvindo áudio lento de livro didático, você está treinando para perder. A partir de agora, você vai consumir o som real, com todas as suas 'sujeiras', reduções e velocidade. Bem-vindo ao mundo real."
                },
                {
                    type: "audio-decode-game",
                    content: JSON.stringify([
                        { "phonetic": "Whaddya-havin?", "options": ["What do you have?", "What are you having?", "What have you?"], "answer": 1 },
                        { "phonetic": "I gotta split", "options": ["I got to spit", "I have got to go", "I got a split"], "answer": 1 },
                        { "phonetic": "I coulda dunnit", "options": ["I could do it", "I could have done it", "I cold donut"], "answer": 1 },
                        { "phonetic": "Outta here!", "options": ["Out of here", "Outside here", "Ought to hear"], "answer": 0 }
                    ])
                }
            ]
        },
        {
            id: "p1-m6",
            title: "MÓDULO 6: O ELO FINAL",
            subtitle: "Fechando o Pilar 1 com confiança e preparo para a avaliação.",
            status: "locked",
            blocks: [
                {
                    type: "system-status",
                    content: "{{IDENTITY PROCEDURE|PROCEDIMENTO DE IDENTIDADE}}: {{OPERATOR_ALLIANCE.exe INITIALIZING|ALIANÇA_DO_OPERADOR.exe INICIALIZANDO}}... {{HUMAN VERIFICATION REQUIRED|VERIFICAÇÃO HUMANA NECESSÁRIA}}..."
                },
                {
                    type: "box-goal",
                    title: "Objetivo Tático",
                    content: "Este é o ponto de não retorno. Não estamos aqui para \"tentar\" aprender inglês. Estamos aqui para assassinar o velho \"eu\" que tinha medo de falar. O objetivo deste módulo é selar um pacto biológico e preparar você para o **Checkpoint de Elite**."
                },
                {
                    type: "h2",
                    content: "6.1 A Conclusão da Jornada de Roger: O Fim do Silêncio"
                },
                {
                    type: "paragraph",
                    content: "A minha história (Parte 2) não terminou apenas com um vocabulário novo. Ela terminou quando eu percebi que o inglês era a única coisa que me separava da pessoa que eu amava. Eu me lembro vividamente de estar em uma mesa, querendo dizer algo profundo, e a gramática de livro ser uma **mordaça na minha boca**."
                },
                {
                    type: "paragraph",
                    content: "A BasedSpeak nasceu desse grito contido. Ela nasceu para que você nunca mais sinta que é 'menos' só porque não consegue conjugar o verbo. **A fluência não é um troféu; é a sua voz sendo devolvida a você.**"
                },
                {
                    type: "brain-diagram",
                    content: JSON.stringify({
                        "title": "🧠 O EFEITO SALIÊNCIA (Por que você vai ser testado)",
                        "steps": [
                            "O Cérebro Preguiçoso: Se você sabe que ninguém vai ver o seu trabalho, seu cérebro economiza energia e não retém a informação.",
                            "A Pressão Social (Accountability): Saber que um HUMANO REAL vai ler e julgar suas palavras ativa o sistema de alerta do cérebro. A adrenalina sobe. A memória grava.",
                            "A Validação: Receber um 'Aprovado' de um especialista gera uma descarga de dopamina 10x maior do que passar em um quiz automático."
                        ]
                    })
                },
                {
                    type: "h2",
                    content: "6.2 O Checkpoint Humano (A Prova de Fogo)"
                },
                {
                    type: "paragraph",
                    content: "Você chegou ao fim do conteúdo teórico. Mas, no Global Command, teoria sem execução é alucinação. Para desbloquear o **Pilar 2 (Superpoderes Auditivos)**, você passará por duas etapas agora:\n\n1. **O Quiz Tático:** Perguntas rápidas para verificar se você entendeu os conceitos (Filtro Afetivo, Pareto, etc).\n2. **A Prova de Texto (O Desafio Real):** Você terá que escrever. E é aqui que separamos os meninos dos lobos."
                },
                {
                    type: "box-warning",
                    title: "🚫 PROTOCOLO ANTI-IA (LEIA COM ATENÇÃO)",
                    content: "**NÃO USE CHATGPT. NÃO USE TRADUTOR.**\n\nSua prova será corrigida por um **Tutor Humano de Elite**, não por uma máquina. Nossos tutores são treinados para detectar padrões sintéticos de IA.\n\nSe detectarmos que seu texto foi gerado por robô:\n1. Sua prova será anulada.\n2. Você perderá o respeito do comando.\n\n**O que nós queremos:** Queremos o seu inglês \"quebrado\", real, sujo e honesto. Queremos ver o seu esforço, não a perfeição de um algoritmo. **Prefiro um erro honesto do que um acerto mentiroso.**"
                },
                {
                    type: "elite-insight",
                    title: "💎 O VALOR DO FEEDBACK SINCERO",
                    content: "No mundo lá fora, as pessoas mentem para serem educadas. Elas dizem \"seu inglês é bom\" enquanto riem por dentro. Aqui, nós vendemos a **VERDADE**.\n\nVocê receberá um feedback brutalmente honesto, cirúrgico e humano. Alguém vai ler cada palavra sua, analisar sua lógica e te dizer exatamente onde você está errando e como corrigir. Esse nível de atenção personalizada é o que custa milhares de dólares em consultorias. Aqui, é o padrão."
                },
                {
                    type: "h2",
                    content: "⚔️ O Pacto Final"
                },
                {
                    type: "paragraph",
                    content: "Antes de clicar em \"Iniciar Prova\", faça um acordo com você mesmo. Você não vai trapacear. Você não vai se esconder. Você vai colocar sua cara a tapa."
                },
                {
                    type: "phrase-analysis",
                    content: JSON.stringify({
                        "phrase": "{{Bring it on.|Manda ver.}}",
                        "phonetic": "/brin-guiron/ — O som conecta tudo. Postura de ataque.",
                        "grammarNote": "Atitude de Combate: Usado quando você está pronto para o desafio, não importa quão difícil seja. É o oposto de recuar."
                    })
                },
                {
                    type: "box-action",
                    title: "📋 BRIEFING PRÉ-PROVA",
                    content: "Você está prestes a entrar na zona de avaliação.\n\n**Sua Missão:** Provar que entendeu a mentalidade do Operador.\n**Seu Juiz:** Um ser humano real, especialista e incorruptível.\n**Sua Recompensa:** A verdade sobre o seu nível e a chave para o Pilar 2."
                },
                {
                    type: "pillar-end",
                    title: "🎖️ PILAR 1: FASE TEÓRICA CONCLUÍDA",
                    content: "A teoria acabou. A prática começa agora. Respire fundo. Beba água. E mostre-nos quem você realmente é. **Aos vencedores, o Pilar 2 os aguarda.**"
                }
            ]
        }
    ]
};


// ============================================================================
// PILAR 2: TORRE DE CONTROLE (DECODIFICACAO) (EXPANDED ELITE VERSION)
// ============================================================================

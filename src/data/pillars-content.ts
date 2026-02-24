import { PillarData } from "@/types/study";

// ==============================================================================
// PILAR 1: INTRODUÇÃO & MINDSET (EXPANDED ELITE VERSION)
// ==============================================================================
export const PILAR_1_DATA: PillarData = {
    id: 1,
    title: "PILAR 1: Protocolo de Iniciação",
    subtitle: "A reconfiguração completa da sua mentalidade e a ciência por trás da fluência.",
    modules: [
                {
            id: "p1-m1",
            title: "MÓDULO 1: O \"Branco\" Mental e o Interruptor de Pânico",
            subtitle: "Entender por que você trava e como desativar o modo de pânico em 5 segundos.",
            status: "active",
            blocks: [
                {
                    type: "system-status",
                    content: "{{COCKPIT CHECK|CHECK-IN NA CABINE}}: {{SCANNING EMOTIONAL STATE|Escanendo Estado Emocional}}... {{PANIC SIGNAL DETECTED|Sinal de Pânico Detectado}}... {{BYPASSING AMYGDALA|Contornando Amígdala}}..."
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
                    content: "1.1 A Primeira Ferramenta de Controle (O Fim das Desculpas)"
                },
                {
                    type: "paragraph",
                    content: "Quando o \"branco\" vier, o pior erro é baixar a cabeça e dizer \"{{Sorry, my English is bad|Desculpe, meu inglês é ruim}}\". Isso reforça o pânico e te coloca em posição de submissão. \n\n**Onde você vai usar isso?** No aeroporto, em uma {{Business Call|Chamada de Trabalho}} ou conhecendo alguém novo."
                },
                {
                    type: "box-action",
                    title: "🎯 MINI-EXERCÍCIO: O COMANDO DE VOZ",
                    content: "Em vez de pedir desculpas, você vai comandar a conversa. Se não entendeu, use esta frase curta e poderosa:\n\n**\"{{Say that again?|Diga de novo?}}\"**\n\n**Tarefa:** Repita em voz alta agora, com firmeza: **/sêi-dát-ə-guén/**. \nSinta a diferença. Você não está pedindo permissão; você está ajustando a frequência do rádio."
                },
                {
                    type: "micro-win",
                    content: "**VITÓRIA IMEDIATA:** Você acaba de aprender a manter sua autoridade mesmo quando não entende uma frase. Você substituiu uma frase de \"vítima\" por uma frase de {{Operator|Operador}}."
                }
            ]
        },
        {
            id: "p1-m2",
            title: "MÓDULO 2: Parte 2: O Batismo de Fogo — A História de Roger",
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
                            ["Expressar Sentimento", "{{I am very happy to be here.|Estou muito feliz de estar aqui.}}", "{{I'm so glad I made it.|Estou tão feliz que consegui.}}", "{{Glad|Contente}} é mais orgânico; {{Made it|Consegui}} foca no esforço."],
                            ["Dificuldade de Entendimento", "{{Could you repeat that slowly?|Poderia repetir devagar?}}", "{{Wait, I'm lost. Come again?|Espera, me perdi. Pode repetir?}}", "Metáforas de movimento ({{lost|perdido}}) são 10x mais comuns."],
                            ["Sair de Casa", "{{We must go to the restaurant.|Devemos ir ao restaurante.}}", "{{Let's head out. I'm starving.|Vamos indo. Tô faminto.}}", "{{Head out|Sair/Partir}} é um phrasal verb vital."],
                            ["Resolver Conflito", "{{I do not agree with your opinion.|Não concordo com sua opinião.}}", "{{I don't see it that way.|Não vejo dessa forma.}}", "Menos agressivo, mais tático."]
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
                            "action": "O Operador (Mentalidade ES): Usa linguagem real com expressões de nativo. Admite o erro com naturalidade. Oferece solução prática.",
                            "result": "\"{{Hey, my bad. I messed up with the time. Traffic was a total nightmare, seriously. Let's just eat, okay? My treat.|Ei, foi mal. Eu errei com o horário. O trânsito estava um pesadelo total, sério. Vamos só comer, tá bom? Eu pago.}}\" — Humano, tático, resolve o conflito."
                        }
                    })
                },
                {
                    type: "reveal-box",
                    title: "🔍 Análise do Sucesso (Clique para expandir)",
                    content: "'{{My bad|Foi mal}} / {{I messed up|Eu errei}}': Admite o erro de forma humana e rápida. Baixa o cortisol do interlocutor. '{{Total nightmare|Pesadelo total}}': Usa uma imagem mental forte em vez de adjetivos técnicos (intense traffic). '{{My treat|Por minha conta}}': Resolve o conflito com uma ação prática (eu pago). A frase do Operador tem 15 palavras vs 21 do Recruta, e comunica 3x mais emoção."
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
                    content: "Eu não criei a ES Academy porque sou um gênio das línguas. Eu a criei porque eu senti a humilhação de ser um adulto 'mudo'. Minha missão é garantir que você não precise passar por quatro anos de mentiras para só então começar a viver o idioma na prática."
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
            title: "MÓDULO 3: Parte 3: O Necrotério do Ensino Tradicional",
            subtitle: "Autópsia no método das franquias — por que o sistema precisa que você falhe para lucrar.",
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
                            "Recuperação Ativa (ES): Nós não ensinamos a regra. Nós te jogamos no fogo. O cérebro só grava o que é necessário para surpreender."
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
            title: "MÓDULO 4: Parte 4: A Lei de Pareto e a Fluência Operacional",
            subtitle: "O Segredo dos 20% — como resolver 80% das situações com vocabulário cirúrgico e tático.",
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
                            "result": "\"{{I apologize for the inconveniences. We are having difficulties...|Peço desculpas pelas inconveniências. Estamos tendo dificuldades...}}\" (Você soa inseguro e culpado)"
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
            title: "MÓDULO 5: Parte 5: Anatomia do Som Real",
            subtitle: "Decodificando a 'Metralhadora' Nativa — hackear o seu sistema auditivo para entender filmes e nativos.",
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
                            ["Could have", "{{I could have done it.|Eu poderia ter feito.}}", "{{I coulda dunnit.|Podia ter feito.}}", "Redução de 4 sílabas para 2."],
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
                            "result": "\"{{A black coffee, please. That's it.|Um café preto, por favor. Só isso.}}\" (Curto, grosso e funcional. Missão cumprida.)"
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
            title: "MÓDULO 6: Parte 6: O Elo Final — A Aliança do Operador",
            subtitle: "O Nascimento da sua Liberdade — selar a conexão emocional e preparar para o Teste de Fogo.",
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
                    content: "A ES Academy nasceu desse grito contido. Ela nasceu para que você nunca mais sinta que é 'menos' só porque não consegue conjugar o verbo. **A fluência não é um troféu; é a sua voz sendo devolvida a você.**"
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
            title: "Procedimento de Estudo com Séries",
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
            content: "AUTONOMY PROCEDURE: ENABLED. Breaking dependency chains."
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

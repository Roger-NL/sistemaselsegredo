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
                    content: "Você está começando a primeira parte do curso. E já vale deixar uma coisa clara: aqui a gente não vai te empurrar aquele inglês duro de escola.\n\nA ideia é outra. Você vai entender por que trava, como sair desse travamento e o que falar quando a mente der branco. Tudo com foco em conversa real, não em frase bonita de prova.\n\nSe você já estudou, tentou e mesmo assim sentiu que, na hora de responder, o inglês simplesmente evaporava, este módulo foi feito exatamente para esse ponto."
                },
                {
                    type: "h3",
                    content: "1.0 Por que tanta gente trava mesmo depois de estudar"
                },
                {
                    type: "paragraph",
                    content: "Muita gente estuda por anos, entende exercícios, reconhece palavras, mas na hora de abrir a boca trava. Isso acontece porque o ensino tradicional acostuma você a tratar o inglês como matéria, não como ferramenta.\n\nNo papel parece que sabe. Na conversa, parece que sumiu tudo.\n\nNeste módulo, a gente vai fazer três coisas:\n\n• entender por que o branco aparece;\n• aprender frases curtas que te salvam na hora;\n• trocar vergonha por controle."
                },
                {
                    type: "box-action",
                    title: "Diagnóstico rápido",
                    content: "Essas frases estão embaralhadas porque elas ajudam a gente a sentir seu nível logo no começo. Não é prova e nem pegadinha. É só uma forma leve de ver como você organiza o inglês na prática, sem depender de regra decorada."
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
                    content: "Sinta a diferença: você não está olhando uma regra e tentando parecer perfeito. Você está mexendo no inglês com a mão na massa.\n\nE isso já mostra uma coisa importante: talvez seu problema nunca tenha sido capacidade. Talvez você só tenha treinado do jeito errado até aqui."
                },
                {
                    type: "system-status",
                    content: "{{CHECK-IN DA AULA|Check-in da aula}}: {{LENDO SEU MOMENTO|Lendo seu momento}}... {{NERVOSISMO IDENTIFICADO|Nervosismo identificado}}... {{VOLTANDO AO CONTROLE|Voltando ao controle}}..."
                },
                {
                    type: "paragraph",
                    content: "Você já esteve numa reunião, numa viagem ou numa conversa simples, alguém te fez uma pergunta e o branco veio na hora. O coração acelerou, a mão suou e a palavra sumiu.\n\nSe isso já aconteceu com você, presta atenção: **isso não é falta de inteligência.** É biologia. Seu cérebro entrou em {{Panic Mode|Modo de Pânico}} e reduziu sua capacidade de pensar em inglês para tentar te proteger do julgamento, da exposição e do erro."
                },
                {
                    type: "elite-insight",
                    title: "💡 POR QUE ISSO IMPORTA?",
                    content: "Enquanto você estiver no \"modo pânico\", seu cérebro bloqueia acesso rápido ao que já sabe. Se você não souber desativar esse \"interruptor\", pode estudar por muito tempo e continuar travando na {{Real Life|Vida Real}}."
                },
                {
                    type: "h2",
                    content: "1.1 O que fazer quando der branco"
                },
                {
                    type: "paragraph",
                    content: "Quando o branco vier, o pior erro é se diminuir com frases como \"{{Sorry, my English is bad|desculpa, meu inglês é ruim}}\". Isso piora o nervosismo e ainda faz você perder presença.\n\nO melhor caminho é simples: ganhar tempo com uma frase curta, retomar o que ouviu e seguir a conversa sem se apagar."
                },
                {
                    type: "box-action",
                    title: "Frase de apoio que salva",
                    content: "Em vez de pedir desculpas, use uma frase curta que segura a conversa:\n\n**\"{{Say that again.|Fala isso de novo.}}\"**\n\nRepita em voz alta agora: **/sêi-dét-ə-guén/**.\n\nA lógica aqui é simples: você não trava, não some e não finge que entendeu. Você puxa a conversa de volta para um lugar seguro e ganha mais alguns segundos de controle."
                },
                {
                    type: "micro-win",
                    content: "**Vitória imediata:** você já tem uma resposta prática para quando travar. Isso parece pequeno, mas muda muito a forma como você entra numa conversa. Muita gente passa anos estudando sem ter nem essa primeira saída."
                },
                {
                    type: "paragraph",
                    content: "Ao final deste Pilar, você vai fazer um desafio para mostrar que entendeu a lógica do método. A ideia não é perfeição. É mostrar que você já reage melhor do que antes.\n\nÉ assim que a confiança começa: quando você percebe que já não responde do mesmo jeito de antes."
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
                    title: "Objetivo deste módulo",
                    content: "Olhar para o caso real da 'Ponte Húngara' e entender por que a necessidade real mudou o jeito de aprender. A ideia aqui é simples: mostrar por que regra sozinha não sustenta conversa e por que uso real acelera muito mais."
                },
                {
                    type: "h2",
                    content: "2.1 O Grande Blefe: 4 Anos de Investimento, Retorno Zero"
                },
                {
                    type: "paragraph",
                    content: "No Brasil, eu fui o \"estudante modelo\". Segui o script das grandes franquias por quatro anos. Frequentei aulas duas vezes por semana, fiz todos os {{homeworks|tarefas de casa}} e tirei notas máximas nas provas de gramática. No papel, eu era um \"sucesso\". Na vida real, ao desembarcar na Europa, descobri uma verdade mais dura: eu funcionava muito abaixo do que o boletim prometia."
                },
                {
                    type: "paragraph",
                    content: "O sistema tradicional costuma formar gente que sabe explicar inglês, mas não necessariamente usar inglês sob pressão. Ele te ensina a teoria, mas quase nunca te força a reagir de verdade."
                },
                {
                    type: "memory-diagram",
                    content: JSON.stringify({
                        "title": "🧠 CAMADA NEUROCIENTÍFICA: Memória Declarativa vs. Procedural",
                        "declarative": {
                            "title": "Memória Declarativa",
                            "icon": "📚",
                            "description": "É o foco das escolas tradicionais. Armazena fatos e regras (ex: 'A estrutura do {{Present Perfect|Presente Perfeito}} é {{have|ter}} + particípio'). Funciona para prova e explicação, mas é lenta demais quando você precisa responder na hora."
                        },
                        "procedural": {
                            "title": "Memória Procedural",
                            "icon": "🎯",
                            "description": "É a memória de habilidade e reflexo. É ela que entra quando você dirige, reage ou fala sem precisar montar tudo na cabeça antes. É a base da fluência real."
                        },
                        "diagnosis": "No Brasil, o Roger tinha muita informação declarativa, mas quase nenhum treino procedural. Quando a pressão subiu, o cérebro tentou calcular a regra em vez de reagir. E travou. Em outras palavras: regra sozinha não vira reflexo."
                    })
                },
                {
                    type: "h2",
                    content: "2.2 O Choque de Realidade: A 'Ponte Húngara'"
                },
                {
                    type: "paragraph",
                    content: "A minha história mudou quando o inglês deixou de ser matéria e virou necessidade real. Em Portugal, conheci minha primeira namorada, uma húngara. Ela não falava português. Eu não falava húngaro. O inglês era a única forma de a gente se encontrar no meio."
                },
                {
                    type: "box-warning",
                    title: "⚠️ O ponto que mudou tudo",
                    content: "Foi ali que eu senti uma dor que muita gente adulta conhece, mas quase nunca sabe nomear: a sensação de perder a própria presença. Em português, eu sabia quem eu era. Em inglês, eu parecia menor do que realmente era. Eu não conseguia explicar o que sentia, nem sustentar uma conversa do jeito que eu sustentaria na minha língua. Foi isso que me fez mudar o método."
                },
                {
                    type: "comparison-table",
                    content: JSON.stringify({
                        "headers": ["Situação", "Inglês de Livro (Engessado)", "Inglês Real", "Análise de Eficiência"],
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
                    content: "Sob essa necessidade real, meu cérebro parou de tentar 'estudar' e começou a adquirir o idioma de outro jeito. O processo, na prática, passou por quatro fases simples:"
                },
                {
                    type: "baby-learning",
                    content: JSON.stringify({
                        "title": "As 4 Fases dessa Virada",
                        "phases": [
                            {
                                "name": "Observação",
                                "icon": "👁️",
                                "description": "Eu não focava só nas palavras, mas nas reações. Se eu falava de um jeito e ela entendia, aquilo ganhava força. O cérebro aprende mais rápido quando sente resultado."
                            },
                            {
                                "name": "Associação",
                                "icon": "🔗",
                                "description": "Eu não traduzia cada palavra. Eu associava som com situação, contexto e sensação. A palavra deixava de ser teoria e começava a ter vida."
                            },
                            {
                                "name": "Erro",
                                "icon": "⚡",
                                "description": "Eu falava errado, era corrigido ou não era entendido, e meu cérebro ajustava. O erro deixava de ser vergonha e virava ajuste."
                            },
                            {
                                "name": "Repetição",
                                "icon": "🔄",
                                "description": "O que funcionava, eu usava de novo e de novo até não precisar mais pensar tanto. Aos poucos, o reflexo foi entrando no lugar do cálculo."
                            }
                        ]
                    })
                },
                {
                    type: "phrase-analysis",
                    content: JSON.stringify({
                        "phrase": "{{I'm not sure I follow you.|Não tenho certeza se te acompanho.}}",
                        "phonetic": "/aim-nó-ʃôr-ai-fó-lou-iu/ — O 't' final desaparece para dar lugar ao 'f'. Ninguém diz {{I am not|Eu não sou}} /ai/ /æm/ /nɒt/. O som real é um bloco único.",
                        "grammarNote": "Eu removi o '{{that|que}}' (I'm not sure THAT I...). A lógica aqui é simples: se uma palavra não ajuda a mensagem a andar, ela pesa mais do que ajuda."
                    })
                },
                {
                    type: "h2",
                    content: "Cenário real: a 'DR' sem Google Tradutor"
                },
                {
                    type: "scenario-card",
                    content: JSON.stringify({
                        "context": "Você e sua parceira/o estão em um restaurante. Houve um mal-entendido sobre o horário. O clima está pesado. Você precisa resolver isso sem parecer um robô ou um dicionário ambulante.",
                        "situation": "Você chegou atrasado e precisa se desculpar e resolver a situação.",
                        "wrong": {
                            "action": "A cabeça treinada por escola tenta montar a frase perfeita antes de falar. Fica calculando palavra, preposição e ordem.",
                            "result": "\"{{I apologize. I arrived late because the traffic was very intense. Please, do not be angry.|Peço desculpas. Cheguei atrasado porque o trânsito estava muito intenso. Por favor, não fique brava.}}\" — Soa frio, distante e mecânico."
                        },
                        "right": {
                            "action": "A mentalidade BasedSpeak usa linguagem real, admite o erro sem teatro e leva a conversa para uma saída prática.",
                            "result": "\"{{Hey, my bad. I messed up with the time. Traffic was a total nightmare, seriously. Let's just eat, okay? My treat.|Ei, foi mal. Eu errei com o horário. O trânsito estava um pesadelo total, sério. Vamos só comer, tá bom? Eu pago.}}\" — Soa humano, natural e útil."
                        }
                    })
                },
                {
                    type: "reveal-box",
                    title: "🔍 Análise do Sucesso (Clique para expandir)",
                    content: "'{{My bad|Foi mal}} / {{I messed up|Eu vacilei}}': admite o erro de forma humana e rápida. '{{Total nightmare|Pesadelo total}}': troca frase dura por imagem simples. '{{My treat|Por minha conta}}': resolve com ação prática. A frase natural fala menos, mas move mais."
                },
                {
                    type: "h2",
                    content: "🎙️ Tom e Voz: O ponto da virada"
                },
                {
                    type: "paragraph",
                    content: "**Pare de se desculpar o tempo todo.** O vício brasileiro de dizer \"{{Sorry for my bad English|Desculpe pelo meu inglês ruim}}\" enfraquece sua presença antes mesmo da conversa andar. Na \"Ponte Húngara\", eu entendi uma coisa simples: se eu começasse me diminuindo, eu entregava minha presença antes de entregar minha ideia. O inglês é o meio, não o palco. Se o sinal vier com ruído, você ajusta e continua."
                },
                {
                    type: "elite-insight",
                    title: "💡 INSIGHT DE ELITE",
                    content: "Eu não criei a BasedSpeak porque sou um gênio das línguas. Eu criei porque vivi na pele o que acontece quando um adulto sabe mais do que consegue mostrar. O método nasceu para encurtar esse caminho e transformar estudo em uso real mais cedo. E é por isso que ele funciona: menos teoria solta, mais reação, repetição e contexto vivo."
                },
                {
                    type: "box-warning",
                    title: "🔓 OPEN LOOP: A COLA SONORA",
                    content: "A técnica que salvou Roger na 'Ponte Húngara' depende de uma coisa: conseguir ouvir o som real como ele vem. No próximo pilar, você vai entender por que '{{What do you want|O que você quer}}' vira '{{Whaddya-wanna|O que cê quer}}' e por que isso muda tudo na escuta."
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
                    title: "🚨 A VERDADE QUE POUCA GENTE TE FALA",
                    content: "Grande parte do ensino tradicional te mantém ocupado, mas não necessariamente te deixa operacional. Você estuda, repete, faz exercício, tira nota e até sente que está avançando. O problema é que isso nem sempre te prepara para reagir quando o inglês aparece com pressão, velocidade e ruído real."
                },
                {
                    type: "h2",
                    content: "3.1 O Inglês de \"Laboratório\" (Estéril e Morto)"
                },
                {
                    type: "paragraph",
                    content: "Muita gente passou anos treinando um inglês que funciona no exercício, mas enfraquece na conversa real. Aprendeu lista, completou lacuna, reconheceu estrutura e respondeu prova. Só que, quando o idioma veio com sotaque, pressa, redução e contexto vivo, a base começou a falhar.\n\nO problema não é estudar. O problema é estudar um inglês limpo demais e depois esperar que ele aguente o mundo real sem treino de realidade."
                },
                {
                    type: "brain-diagram",
                    content: JSON.stringify({
                        "title": "🧠 POR QUE TANTA COISA SOME NA HORA?",
                        "steps": [
                            "Input Passivo: ler regra e ouvir áudio controlado gera reconhecimento, mas nem sempre gera reflexo. Seu cérebro entende, mas não necessariamente reage.",
                            "Travamento de Processamento: quando você tenta calcular a regra antes de falar, cria atraso. A conversa continua, e você fica tentando alcançar.",
                            "Recuperação Ativa: quando o treino aproxima mais a vida real, o cérebro começa a registrar o que realmente precisa para agir, não só para explicar."
                        ]
                    })
                },
                {
                    type: "h2",
                    content: "3.2 O problema do \"{{I am going to|Eu vou}}\" perfeitinho demais"
                },
                {
                    type: "paragraph",
                    content: "A escola costuma te ensinar a frase inteira, palavra por palavra, como se o idioma sempre viesse bem recortado. Mas gente real não fala assim. O som vem comprimido, ligado e cheio de economia. Se o seu ouvido espera o formato escolar, ele se atrasa."
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
                        "headers": ["Elemento", "Escola Comum", "Uso Operacional"],
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
                    content: "Aprender inglês só em material muito controlado é como treinar direção apenas em simulador. Você entende a lógica, reconhece o painel e até sabe o que deveria fazer. Mas a rua pede outra prontidão: pressão, improviso e leitura rápida do que está acontecendo."
                },
                {
                    type: "h2",
                    content: "⚔️ Cenário de Combate: A Emboscada Corporativa"
                },
                {
                    type: "scenario-card",
                    content: JSON.stringify({
                        "context": "Reunião de emergência via Zoom. Seu chefe americano entra rápido no ponto e a frase vem mais comprimida do que o seu ouvido queria.",
                        "situation": "\"{{Guys, we gotta pivot the strategy 'cause the numbers ain't lookin' good. Whad'ya reckon?|Pessoal, temos que mudar a estratégia porque os números não estão bons. O que acham?}}\"",
                        "wrong": {
                            "action": "Tentar decodificar cada palavra isolada, travar no {{ain't|ain't}} e no {{reckon|reckon}} e perder a ideia central.",
                            "result": "Silêncio ou resposta atrasada. Você não parece sem inteligência; parece sem ferramenta para aquele tipo de escuta."
                        },
                        "right": {
                            "action": "Filtro de Ruído. Capturar as palavras de poder: {{PIVOT|MUDAR}}, {{STRATEGY|ESTRATÉGIA}}, {{NUMBERS|NÚMEROS}}, {{NOT GOOD|NADA BOM}}.",
                            "result": "\"{{I'm with you. Let's change the plan. I have an idea.|Tô contigo. Vamos mudar o plano. Tenho uma ideia.}}\" Você não traduziu tudo. Você entendeu o suficiente para entrar no jogo."
                        }
                    })
                },
                {
                    type: "elite-insight",
                    title: "💡 TRANSFORME FRUSTRAÇÃO EM CRITÉRIO",
                    content: "Não precisa romantizar o tempo perdido. Mas vale usar essa frustração como critério. Se um método te faz sentir que sabe e depois te abandona na conversa real, o problema não é falta de esforço da sua parte. O problema é o tipo de treino que você recebeu."
                },
                {
                    type: "box-action",
                    title: "🔓 O FIM DO EXCESSO DE DICIONÁRIO",
                    content: "Saber inglês não é saber todas as palavras. É saber as palavras certas com mais velocidade de uso. No próximo módulo, você vai ver como 20% do vocabulário resolve uma fatia enorme da vida real. A ideia é simples: parar de carregar peso morto e começar a operar com o que mais retorna."
                },
                {
                    type: "combat-sort-game",
                    content: JSON.stringify([
                        { "text": "{{I apologize for the inconvenience.|Peço desculpas pelo inconveniente.}}", "type": "lab" },
                        { "text": "{{My bad, I messed up.|Foi mal, eu vacilei.}}", "type": "combat" },
                        { "text": "{{I am going to travel next year.|Eu vou viajar no ano que vem.}}", "type": "lab" },
                        { "text": "{{I'm gonna travel nex' year.|Vou viajar ano que vem.}}", "type": "combat" },
                        { "text": "{{Could you repeat that slowly?|Você poderia repetir isso devagar?}}", "type": "lab" },
                        { "text": "{{Wait, I'm lost. Come again?|Pera, me perdi. Fala de novo?}}", "type": "combat" }
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
                    content: "Parar de carregar peso morto. Vamos identificar o vocabulário de alta frequência que permite que você opere no mundo real com o mínimo de esforço desperdiçado. Fluência não é sobre saber muito. É sobre saber o que mais retorna."
                },
                {
                    type: "h2",
                    content: "4.1 A Ditadura do Dicionário vs. O ROI Linguístico"
                },
                {
                    type: "paragraph",
                    content: "O maior erro de quem começa a levar inglês a sério é acreditar que saber inglês é saber todas as palavras. Um nativo conhece muito, mas usa uma fatia bem menor disso no dia a dia.\n\nSe você focar nas palavras certas, no seu {{Return on Investment|Retorno sobre Investimento}}, consegue negociar, viajar e sustentar conversa com muito menos vocabulário do que imagina. A pergunta não é se você sabe muito. A pergunta é se você sabe o que mais move a vida real."
                },
                {
                    type: "brain-diagram",
                    content: JSON.stringify({
                        "title": "🧠 O FILTRO DE SOBREVIVÊNCIA (SAR)",
                        "steps": [
                            "Sobrecarga Cognitiva: tentar aprender palavra bonita demais e útil de menos trava seu processamento. O cérebro gasta energia escolhendo a palavra e perde velocidade de resposta.",
                            "Princípio de Pareto: uma parte pequena do vocabulário sustenta uma parte enorme da comunicação real. Quando você foca nesse núcleo, o reflexo cresce mais rápido.",
                            "Poda Inteligente: o cérebro guarda melhor o que usa com frequência. Se uma palavra quase nunca resolve nada na sua rotina, ela tende a pesar mais do que ajudar."
                        ]
                    })
                },
                {
                    type: "elite-insight",
                    title: "💡 INSIGHT DE COMANDO",
                    content: "A fluência operacional não é o tamanho do seu arsenal. É a sua capacidade de resolver com rapidez o que mais aparece. Carregar vocabulário demais, sem uso, cria ilusão de avanço e pouca resposta na prática."
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
                    content: "Se o inglês fosse uma máquina, o verbo **GET** seria o óleo que faz as engrenagens girarem. Ele substitui uma quantidade enorme de verbos e intenções. Quando você domina {{Get|Get}}, sua autonomia sobe porque o idioma começa a responder com menos esforço."
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
                        "context": "Cliente internacional irritado. O relatório está atrasado. A pressão bate e a vontade é sumir.",
                        "situation": "\"{{Where is the report? We were expecting it yesterday!|Onde está o relatório? Estávamos esperando ontem!}}\"",
                        "wrong": {
                            "action": "A pessoa tenta ser sofisticada demais, caça palavra complexa e perde firmeza.",
                            "result": "\"{{I apologize for the inconveniences. We are having difficulties...|Peço desculpas pelas inconveniências. Estamos tendo dificuldades...}}\" (Soa distante, lento e pouco confiável.)"
                        },
                        "right": {
                            "action": "A mentalidade certa usa Pareto: vai direto ao ponto e protege o resultado.",
                            "result": "\"{{Sorry about that. We're running a bit late, but I'll get it done today. Is that okay?|Desculpe por isso. Estamos um pouco atrasados, mas vou resolver hoje. Tudo bem?}}\" (Você recupera controle sem se esconder atrás de frase difícil.)"
                        }
                    })
                },
                {
                    type: "box-warning",
                    title: "⚠️ O LIMITE DO TUTORIAL",
                    content: "O que você viu até aqui é o mapa da mina. Mas saber que o 80/20 existe não é a mesma coisa que ter critério para cortar excesso, reconhecer padrão útil e automatizar vocabulário que realmente aparece.\n\nExiste uma diferença grande entre entender a lógica e operar com ela. Para cruzar essa linha, você precisa de mais do que teoria."
                },
                {
                    type: "elite-insight",
                    title: "🔓 OPEN LOOP: O VÍRUS DO SOTAQUE",
                    content: "Você aprendeu a economizar palavras. Agora entra outro ponto decisivo: o som que você adiciona sem perceber. No próximo módulo, você vai ver como a {{Vogal Fantasma|epêntese}} bagunça sua escuta, sua produção e a imagem de clareza que você passa."
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
                    content: "Seu ouvido não é ruim; ele foi mal treinado. Vamos entender por que os nativos parecem falar rápido demais e como desativar a {{Vogal Fantasma|vogal fantasma}}, um dos vícios mais comuns do brasileiro quando ouve e produz inglês."
                },
                {
                    type: "h2",
                    content: "5.1 O Mito da Velocidade (Eles não falam rápido)"
                },
                {
                    type: "paragraph",
                    content: "Uma das reclamações mais comuns é: 'Eu entendo o professor, mas não entendo o nativo na rua'. O segredo é que eles não falam necessariamente mais rápido. Eles falam **conectado**.\n\nO português tende a vir mais recortado sílaba por sílaba. O inglês distribui energia de outro jeito: reduz palavras fracas e concentra força nas partes mais importantes."
                },
                {
                    type: "brain-diagram",
                    content: JSON.stringify({
                        "title": "🧠 O FILTRO FONÉTICO BRASILEIRO",
                        "steps": [
                            "Percepção Categórica: seu cérebro foi treinado para ignorar sons que não existem no português. Quando o nativo usa um {{schwa|schwa}} ou um som curto, seu ouvido tenta encaixar na gaveta mais próxima.",
                            "Delay de Processamento: você ouve '{{Bit|Pouco}}' e o cérebro puxa '{{Beat|Bater}}'. Essa troca gera atraso, e a frase anda antes de você terminar de decodificar.",
                            "Remapeamento: para entender o inglês real, o ouvido precisa aprender novos contrastes em vez de insistir no filtro do português."
                        ]
                    })
                },
                {
                    type: "h2",
                    content: "5.2 A Batalha contra a 'Vogal Fantasma' (O Vírus 'i')"
                },
                {
                    type: "paragraph",
                    content: "Um dos vícios que mais bagunçam a clareza é o som que você **adiciona** onde ele não existe. No português, consoantes finais costumam pedir apoio. No inglês, muitas delas morrem secas. Quando você coloca uma vogal extra, o som muda, o ritmo muda e a compreensão pode sair do trilho."
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
                    content: "Imagine que o final da palavra é um penhasco. Você deve parar exatamente na consoante final. Não deixe sua língua escorregar para um som de 'i'. Treine encerrar seco em \"{{Big|Grande}}\" e \"{{Hot|Quente}}\"."
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
                    content: "O português costuma vir mais aberto e articulado. O inglês, em muitos contextos, trabalha com mais relaxamento de mandíbula, mais redução e menos esforço em cada sílaba fraca."
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
                    content: "O nativo não fala 'errado'; ele fala de forma econômica. Tentar reproduzir o inglês de livro em todo contexto informal cria um descompasso. Você até pode ser entendido, mas fica menos natural e gasta mais energia do que precisa."
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
                            "action": "A cabeça treinada por escola tenta separar todas as palavras e trava na forma.",
                            "result": "Você se atrasa, perde o fio e sente que o problema é incapacidade, quando na verdade o problema é o tipo de escuta que foi treinado."
                        },
                        "right": {
                            "action": "Você reconhece /whaddya/ como bloco de pergunta e foca no que importa.",
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
                    content: "Muita gente tem pavor do silêncio. Quando esquece uma palavra, preenche com \"éééé...\" ou \"humm...\".\n\n**Técnica de Elite:** se esquecer a palavra, faça uma pausa silenciosa. O silêncio transmite processamento e controle. O preenchimento excessivo transmite pressa, insegurança e ruído."
                },
                {
                    type: "elite-insight",
                    title: "💡 INSIGHT DE ELITE",
                    content: "O seu ouvido é um músculo. Se você só treina com áudio lento e limpo demais, está treinando uma versão protegida do idioma. A partir daqui, a ideia é encostar no som real, com redução, velocidade e imperfeição suficiente para gerar adaptação de verdade."
                },
                {
                    type: "audio-decode-game",
                    content: JSON.stringify([
                        {
                            "phonetic": "Whaddya-havin?",
                            "decoded": "{{What are you having?|O que voce vai pedir?}}",
                            "translation": "O que voce vai pedir?",
                            "options": [
                                "{{What do you have?|O que voce tem?}}",
                                "{{What are you having?|O que voce vai pedir?}}",
                                "{{What have you?|O que voce possui?}}"
                            ],
                            "answer": 1
                        },
                        {
                            "phonetic": "I gotta split",
                            "decoded": "{{I have got to go.|Eu tenho que ir.}}",
                            "translation": "Tenho que ir embora.",
                            "options": [
                                "{{I got to spit.|Eu cheguei a cuspir.}}",
                                "{{I have got to go.|Eu tenho que ir.}}",
                                "{{I got a split.|Eu consegui uma rachadura.}}"
                            ],
                            "answer": 1
                        },
                        {
                            "phonetic": "I coulda dunnit",
                            "decoded": "{{I could have done it.|Eu poderia ter feito isso.}}",
                            "translation": "Eu poderia ter feito isso.",
                            "options": [
                                "{{I could do it.|Eu poderia fazer isso.}}",
                                "{{I could have done it.|Eu poderia ter feito isso.}}",
                                "{{I cold donut.|Eu rosquinha gelada.}}"
                            ],
                            "answer": 1
                        },
                        {
                            "phonetic": "Outta here!",
                            "decoded": "{{Out of here!|Sai daqui!}}",
                            "translation": "Sai daqui!",
                            "options": [
                                "{{Out of here!|Sai daqui!}}",
                                "{{Outside here.|Do lado de fora daqui.}}",
                                "{{Ought to hear.|Deveria ouvir.}}"
                            ],
                            "answer": 0
                        }
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
                    content: "{{TRANSIÇÃO DE ETAPA|TRANSIÇÃO DE ETAPA}}: {{FREE ACCESS COMPLETE|ACESSO GRATUITO CONCLUÍDO}}... {{NEXT STEP AVAILABLE|PRÓXIMA ETAPA DISPONÍVEL}}..."
                },
                {
                    type: "box-goal",
                    title: "Objetivo desta etapa",
                    content: "Você chegou ao fim da parte gratuita do Pilar 1. E isso já diz bastante: você não está mais no inglês decorado. Agora a próxima etapa é confirmar, de um jeito leve e real, o que já começou a mudar no seu ouvido, na sua confiança e na sua forma de pensar o idioma."
                },
                {
                    type: "h2",
                    content: "6.1 O que muda depois desta etapa"
                },
                {
                    type: "paragraph",
                    content: "Muita gente chega até aqui achando que o mais difícil era começar. Mas, na prática, o ponto de virada vem quando a pessoa percebe que já não quer mais voltar para aquele inglês travado, cheio de medo e tradução mental."
                },
                {
                    type: "paragraph",
                    content: "Daqui para frente, o curso entra numa camada mais acompanhada: mais aplicação, mais direção e mais correção humana. Não é sobre jogar mais conteúdo em cima de você. É sobre pegar o que já começou a nascer e transformar isso em uso real com mais segurança."
                },
                {
                    type: "brain-diagram",
                    content: JSON.stringify({
                        "title": "🧠 Por que existe uma validação humana",
                        "steps": [
                            "Quando ninguém vê o que você faz, o cérebro tende a tratar aquilo como algo descartável.",
                            "Quando uma pessoa real lê sua resposta, você presta mais atenção, organiza melhor o raciocínio e grava mais.",
                            "Quando recebe um retorno humano, você entende com mais clareza onde já melhorou e o que ainda precisa ajustar."
                        ]
                    })
                },
                {
                    type: "h2",
                    content: "6.2 Como funciona sua primeira avaliação"
                },
                {
                    type: "paragraph",
                    content: "Agora entra uma avaliação curta, prática e honesta. Ela existe para mostrar seu ponto atual e preparar sua passagem para a próxima fase.\n\nVocê vai passar por duas partes:\n\n1. **Perguntas rápidas:** para confirmar as ideias principais deste pilar.\n2. **Resposta escrita:** para mostrar, com suas palavras, o que você entendeu e como aplicaria isso na vida real."
                },
                {
                    type: "box-warning",
                    title: "Regras da avaliação",
                    content: "Esta etapa é simples:\n\n1. Responda com suas próprias palavras.\n2. Pode usar inglês simples. Não precisa inventar frase bonita.\n3. Erro honesto vale muito mais do que texto perfeito copiado.\n4. Evite tradutor e IA. O objetivo aqui é enxergar seu momento real.\n\nSeu texto será lido por uma pessoa da equipe. A ideia não é te punir. É entender seu nível com clareza para a próxima fase fazer sentido de verdade."
                },
                {
                    type: "elite-insight",
                    title: "💎 O que vem depois da parte gratuita",
                    content: "O Pilar 1 te mostra que o método funciona na prática. A etapa seguinte aprofunda isso com correção humana, continuidade guiada e uma progressão mais completa entre os pilares.\n\nÉ nessa hora que o curso deixa de ser só conteúdo e vira acompanhamento de verdade."
                },
                {
                    type: "h2",
                    content: "6.3 Antes de seguir"
                },
                {
                    type: "paragraph",
                    content: "Não pense nisso como uma prova para te expor. Pense como um retrato sincero do seu momento. Quanto mais honesta for sua resposta, mais útil essa etapa vai ser para você."
                },
                {
                    type: "phrase-analysis",
                    content: JSON.stringify({
                        "phrase": "{{Let's do it.|Vamos nessa.}}",
                        "phonetic": "/lets du it/ — curto, leve e com energia de começo.",
                        "grammarNote": "É o tipo de frase simples que combina com essa etapa: sem drama, sem pose e com disposição para seguir."
                    })
                },
                {
                    type: "box-action",
                    title: "📋 O que você vai encontrar agora",
                    content: "Ao tocar em iniciar avaliação, você verá:\n\n• uma parte curta de perguntas objetivas\n• uma resposta escrita simples\n• a etapa de contato para facilitar o retorno da equipe\n\nTudo foi pensado para ser direto, leve e útil."
                },
                {
                    type: "pillar-end",
                    title: "Pilar 1 concluído",
                    content: "Você atravessou a parte gratuita e já viu que aprender inglês pode ser mais claro, mais leve e muito mais real.\n\nAgora vem a etapa que transforma isso em direção concreta: sua primeira avaliação humana.\n\nRespira, faz com calma e segue. O próximo nível começa logo depois daqui."
                }
            ]
        }
    ]
};


// ============================================================================
// PILAR 2: TORRE DE CONTROLE (DECODIFICACAO) (EXPANDED ELITE VERSION)
// ============================================================================

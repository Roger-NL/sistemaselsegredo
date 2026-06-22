import { PillarData } from "@/types/study";

export const PILAR_1_DATA: PillarData = {
    id: 1,
    title: "PILAR 1: Protocolo de Iniciação",
    subtitle: "Descubra o inglês que você já reconhece e transforme isso em ação real.",
    modules: [
        {
            id: "p1-m1",
            title: "MÓDULO 1: A PRIMEIRA VITÓRIA",
            subtitle: "Use uma frase simples para não travar quando a mente der branco.",
            status: "active",
            blocks: [
                {
                    type: "system-status",
                    content: "{{PRIMEIRA MISSÃO|Primeira missão}}: provar que você já consegue usar inglês antes de qualquer explicação longa."
                },
                {
                    type: "box-action",
                    title: "Primeira vitória",
                    content: "Antes de falar sobre regra, verbo ou gramática, você vai fazer uma coisa prática.\n\nImagine que alguém falou em {{English|inglês}} com você. Sua mente deu branco. Em vez de sumir, você usa esta frase:\n\n**{{Say that again.|Fala isso de novo.}}**\n\nNão precisa parecer perfeito. Só precisa reagir."
                },
                {
                    type: "scramble-exercise",
                    content: JSON.stringify({
                        sentence: "Say that again.",
                        translation: "Fala isso de novo."
                    })
                },
                {
                    type: "micro-win",
                    content: "**Viu? Você acabou de montar uma frase real.** Não foi uma frase de livro. Foi uma ferramenta para continuar dentro da conversa."
                },
                {
                    type: "paragraph",
                    content: "Esse é o ponto de partida do método: você não começa descobrindo o quanto falta. Você começa descobrindo o que já consegue fazer.\n\nTalvez você ainda não consiga explicar uma conversa inteira. Tudo bem. Mas você acabou de usar uma frase curta, útil e real. Isso já muda a sua posição. Em vez de ficar paralisado, você ganha alguns segundos de {{time|tempo}}."
                },
                {
                    type: "h2",
                    content: "1.1 Você já reconhece mais do que imagina"
                },
                {
                    type: "box-action",
                    title: "Missão de reconhecimento",
                    content: "Olhe para estas palavras. Não tente estudar. Só perceba quantas você já reconhece:\n\n{{love|amor}} · {{house|casa}} · {{car|carro}} · {{phone|telefone/celular}} · {{music|música}} · {{game|jogo}} · {{coffee|café}} · {{water|água}} · {{black|preto}} · {{red|vermelho}} · {{blue|azul}} · {{family|família}}\n\nSe você reconheceu algumas, você não está no zero. Você tem pontos de entrada."
                },
                {
                    type: "interactive-quiz",
                    content: "Qual grupo tem apenas palavras que muitos brasileiros já reconhecem?|{{love|amor}} / {{house|casa}} / {{car|carro}}|{{although|embora}} / {{throughout|ao longo de}} / {{nevertheless|mesmo assim}}|{{jurisdiction|jurisdição}} / {{liability|responsabilidade legal}} / {{threshold|limite}}|0"
                },
                {
                    type: "micro-win",
                    content: "**Você acabou de encontrar inglês conhecido dentro do seu próprio repertório.** A base existe. Agora a gente vai organizar essa base para ela virar ação."
                },
                {
                    type: "h2",
                    content: "1.2 O que fazer quando a mente der branco"
                },
                {
                    type: "paragraph",
                    content: "Quando o branco aparece, o erro mais comum é começar se diminuindo: {{Sorry, my English is bad|Desculpa, meu inglês é ruim}}.\n\nEssa frase parece educada, mas joga sua energia para baixo. Antes mesmo de tentar, você já avisou para a outra pessoa que está inseguro. O problema não é pedir ajuda. O problema é se apagar."
                },
                {
                    type: "comparison-table",
                    content: JSON.stringify({
                        headers: ["Situação", "Resposta que te diminui", "Resposta que te mantém presente"],
                        rows: [
                            ["Não entendi", "{{Sorry, my English is bad.|Desculpa, meu inglês é ruim.}}", "{{Say that again.|Fala isso de novo.}}"],
                            ["Preciso pensar", "{{I don't know.|Eu não sei.}}", "{{Give me a second.|Me dá um segundo.}}"],
                            ["Me perdi na frase", "{{My English is terrible.|Meu inglês é horrível.}}", "{{Wait, I'm lost.|Espera, me perdi.}}"]
                        ]
                    })
                },
                {
                    type: "scramble-exercise",
                    content: JSON.stringify({
                        sentence: "Give me a second.",
                        translation: "Me dá um segundo."
                    })
                },
                {
                    type: "scramble-exercise",
                    content: JSON.stringify({
                        sentence: "Wait, I'm lost.",
                        translation: "Espera, me perdi."
                    })
                },
                {
                    type: "box-action",
                    title: "Seu primeiro kit de controle",
                    content: "Guarde estas três frases como seu primeiro kit:\n\n1. **{{Say that again.|Fala isso de novo.}}**\n2. **{{Give me a second.|Me dá um segundo.}}**\n3. **{{Wait, I'm lost.|Espera, me perdi.}}**\n\nElas não resolvem todo o inglês da sua vida. Elas resolvem algo mais urgente: impedem você de desaparecer quando a pressão chega."
                },
                {
                    type: "h2",
                    content: "1.3 Por que isso funciona"
                },
                {
                    type: "paragraph",
                    content: "Você já esteve em uma reunião, viagem, chamada de vídeo ou situação simples em que alguém falou inglês e a palavra sumiu? O coração acelera, a cabeça tenta traduzir tudo e a frase não sai.\n\nIsso não significa que você é incapaz. Muitas vezes significa que seu cérebro entrou em modo de proteção. Ele tenta evitar julgamento, erro e exposição. Só que, para te proteger, ele também bloqueia acesso rápido ao que você já sabe."
                },
                {
                    type: "elite-insight",
                    title: "A virada de mentalidade",
                    content: "A primeira meta não é falar bonito. A primeira meta é não perder presença. Quando você diz {{Say that again|Fala isso de novo}}, você compra tempo, reduz a pressão e mantém a conversa aberta."
                },
                {
                    type: "interactive-quiz",
                    content: "Qual frase combina melhor com controle, não com vergonha?|{{Sorry, I'm bad.|Desculpa, eu sou ruim.}}|{{Say that again.|Fala isso de novo.}}|{{I know nothing.|Eu não sei nada.}}|1"
                },
                {
                    type: "elite-insight",
                    title: "Aprendizado do módulo",
                    content: "Inglês funcional começa com controle, não com perfeição. Primeiro você aprende a continuar presente. Depois você melhora frase, som, vocabulário e confiança."
                },
                {
                    type: "micro-win",
                    content: "**Vitória do módulo:** você já reconheceu palavras fáceis, montou frases reais e ganhou um kit simples para não travar no primeiro impacto."
                }
            ]
        },
        {
            id: "p1-m2",
            title: "MÓDULO 2: A HISTÓRIA QUE CRIOU O MÉTODO",
            subtitle: "A Ponte Húngara em cenas interativas, provando que reconhecimento já é começo.",
            status: "locked",
            blocks: [
                {
                    type: "system-status",
                    content: "{{HISTÓRIA INTERATIVA|História interativa}}: ler, reconhecer, clicar, vencer e entender por que o método nasceu."
                },
                {
                    type: "box-action",
                    title: "Missão de leitura",
                    content: "Nesta história, o texto fica em português. Só algumas palavras fáceis aparecem em {{English|inglês}}.\n\nLeia procurando palavras que você já reconhece. Não precisa entender tudo. Clique nelas quando quiser confirmar o sentido."
                },
                {
                    type: "h2",
                    content: "2.1 Cena 1: o aluno modelo"
                },
                {
                    type: "paragraph",
                    content: "Durante quatro anos, eu fui o aluno que fazia tudo certo. Ia para a aula, fazia {{homework|tarefa de casa}}, tirava nota boa e achava que meu {{English|inglês}} estava no caminho certo.\n\nEu reconhecia palavras como {{book|livro}}, {{school|escola}}, {{teacher|professor}}, {{test|prova}} e {{good|bom}}. No papel, parecia que tudo estava funcionando. A sensação era: se a nota está boa, então eu estou bem."
                },
                {
                    type: "interactive-quiz",
                    content: "Quais palavras da cena são bem prováveis de você já reconhecer?|{{homework|tarefa de casa}} / {{English|inglês}} / {{teacher|professor}}|{{jurisdiction|jurisdição}} / {{threshold|limite}} / {{liability|responsabilidade legal}}|{{nevertheless|mesmo assim}} / {{although|embora}} / {{throughout|ao longo de}}|0"
                },
                {
                    type: "micro-win",
                    content: "**Você reconheceu inglês dentro da história.** Esse é o começo: perceber antes de traduzir tudo."
                },
                {
                    type: "h2",
                    content: "2.2 Cena 2: o choque de realidade"
                },
                {
                    type: "paragraph",
                    content: "Quando cheguei na Europa, a ilusão quebrou. Uma coisa era responder uma {{test|prova}}. Outra coisa era responder uma pessoa {{real|real/de verdade}}, na minha frente, esperando uma reação.\n\nNa sala, eu tinha tempo. Na vida real, tinha ritmo, sotaque, barulho, emoção e pressão. A pergunta vinha e eu não conseguia transformar o que eu sabia em resposta."
                },
                {
                    type: "interactive-quiz",
                    content: "O que costuma travar mais um adulto quando bate pressão?|Uma {{test|prova}} com tempo para pensar|Uma pessoa {{real|real/de verdade}} esperando resposta|Uma lista de cores como {{black|preto}}, {{red|vermelho}} e {{blue|azul}}|1"
                },
                {
                    type: "box-warning",
                    title: "A diferença que quase ninguém explica",
                    content: "Reconhecer inglês não é a mesma coisa que conseguir usar inglês sob pressão.\n\nVocê pode reconhecer {{love|amor}}, {{house|casa}}, {{car|carro}}, {{food|comida}} e {{music|música}}, mas ainda travar quando precisa montar uma resposta. O problema não é burrice. É falta de ponte entre reconhecimento e reação."
                },
                {
                    type: "h2",
                    content: "2.3 Cena 3: a Ponte Húngara"
                },
                {
                    type: "paragraph",
                    content: "A virada começou quando conheci uma húngara. Ela não falava português. Eu não falava húngaro. Se cada um ficasse preso no próprio idioma, a conversa acabava ali. Mas existia uma {{bridge|ponte}} entre nós: o {{English|inglês}}.\n\nDe repente, o inglês deixou de ser matéria. Virou caminho. Virou {{connection|conexão}}. Virou a única forma de dizer coisas simples: {{hi|oi}}, {{sorry|desculpa}}, {{coffee|café}}, {{food|comida}}, {{home|casa/lar}}, {{love|amor}}, {{help|ajuda}}."
                },
                {
                    type: "interactive-quiz",
                    content: "Pelo contexto, o que significa {{bridge|bridge}} nessa história?|Ponte|Prova|Dinheiro|0"
                },
                {
                    type: "micro-win",
                    content: "**Você acabou de entender uma palavra pelo contexto.** Isso é habilidade real. É assim que muito idioma começa a entrar: não como regra isolada, mas como sentido dentro de uma situação."
                },
                {
                    type: "h2",
                    content: "2.4 Cena 4: o sentimento"
                },
                {
                    type: "paragraph",
                    content: "O mais duro não era esquecer uma palavra. Era sentir que eu ficava menor.\n\nEm português, eu era eu. Em inglês, eu queria dizer {{simple things|coisas simples}}, mas travava. Queria falar de {{time|tempo/horário}}, {{work|trabalho}}, {{family|família}}, {{money|dinheiro}}, {{problem|problema}}, {{dream|sonho}}. Só que faltava uma ferramenta para começar."
                },
                {
                    type: "interactive-quiz",
                    content: "Na cena, {{simple things|simple things}} aponta para quê?|Coisas simples que ele queria dizer|Uma regra gramatical avançada|Uma prova de escola|0"
                },
                {
                    type: "reveal-box",
                    title: "O que estava acontecendo por trás",
                    content: "Eu tinha inglês de reconhecimento, mas não tinha inglês de reação. Eu reconhecia pedaços, mas não sabia transformar esses pedaços em presença. É aqui que muito brasileiro se perde: acha que precisa estudar tudo de novo, quando muitas vezes precisa reorganizar o que já viu e treinar resposta."
                },
                {
                    type: "h2",
                    content: "2.5 Cena 5: a virada"
                },
                {
                    type: "paragraph",
                    content: "Foi ali que eu entendi: eu não precisava parecer perfeito. Eu precisava conseguir reagir.\n\nNão era sobre falar bonito. Era sobre criar {{connection|conexão}}. Sobre conseguir dizer o básico sem desaparecer. Sobre transformar palavras conhecidas em ação: {{help me|me ajuda}}, {{I need time|preciso de tempo}}, {{I like this|eu gosto disso}}, {{I don't know|eu não sei}}, {{say that again|fala isso de novo}}."
                },
                {
                    type: "comparison-table",
                    content: JSON.stringify({
                        headers: ["O que eu tinha", "O que faltava", "O que o método faz"],
                        rows: [
                            ["Palavras reconhecidas", "Uso em situação real", "Transforma reconhecimento em reação."],
                            ["Notas e exercícios", "Presença em conversa", "Treina resposta curta, útil e repetível."],
                            ["Medo de errar", "Estratégia para continuar", "Troca vergonha por controle."]
                        ]
                    })
                },
                {
                    type: "elite-insight",
                    title: "Aprendizado do módulo",
                    content: "Saber reconhecer é o primeiro degrau. O método não joga fora o que você já sabe. Ele pega esse material espalhado e transforma em uso real: palavra vira frase, frase vira reação, reação vira confiança."
                },
                {
                    type: "micro-win",
                    content: "**Vitória do módulo:** você leu uma história real, reconheceu palavras simples e entendeu a origem do método: transformar o que já existe em ação."
                }
            ]
        },
        {
            id: "p1-m3",
            title: "MÓDULO 3: POR QUE VOCÊ TRAVAVA",
            subtitle: "Entenda o travamento sem se culpar e aprenda respostas que mantêm presença.",
            status: "locked",
            blocks: [
                {
                    type: "system-status",
                    content: "{{CHECKPOINT DE REAÇÃO|Checkpoint de reação}}: trocar vergonha automática por estratégia simples."
                },
                {
                    type: "box-action",
                    title: "Primeiro, escolha",
                    content: "Alguém falou rápido em {{English|inglês}}. Você ouviu algumas palavras, talvez {{work|trabalho}}, {{time|tempo}}, {{money|dinheiro}} ou {{problem|problema}}, mas não entendeu a frase inteira.\n\nAgora escolha a resposta que te mantém mais presente."
                },
                {
                    type: "interactive-quiz",
                    content: "Qual resposta te coloca mais no controle?|{{Sorry, my English is bad.|Desculpa, meu inglês é ruim.}}|{{Wait, I'm lost. Come again?|Espera, me perdi. Fala de novo?}}|Silêncio e sorriso nervoso|1"
                },
                {
                    type: "micro-win",
                    content: "**Você não travou. Você escolheu uma reação.** Esse é o músculo que interessa no começo: continuar na conversa mesmo sem entender tudo."
                },
                {
                    type: "paragraph",
                    content: "A diferença é simples: uma frase pede ajuda; a outra te diminui.\n\n{{Wait, I'm lost. Come again?|Espera, me perdi. Fala de novo?}} admite que você se perdeu, mas mantém você na conversa."
                },
                {
                    type: "comparison-table",
                    content: JSON.stringify({
                        headers: ["Quando acontece", "Resposta que te diminui", "Resposta com controle", "Por que funciona"],
                        rows: [
                            ["Não entendi", "{{Sorry, my English is bad.|Desculpa, meu inglês é ruim.}}", "{{Wait, I'm lost. Come again?|Espera, me perdi. Fala de novo?}}", "Você assume a falha de entendimento sem se atacar."],
                            ["Preciso pensar", "{{I don't know anything.|Eu não sei nada.}}", "{{Give me a second.|Me dá um segundo.}}", "Você compra tempo sem sair da conversa."],
                            ["Preciso ouvir de novo", "{{I am bad at English.|Sou ruim em inglês.}}", "{{Say that again.|Fala isso de novo.}}", "Você pede repetição de forma direta e funcional."]
                        ]
                    })
                },
                {
                    type: "h2",
                    content: "3.1 O travamento não prova incapacidade"
                },
                {
                    type: "paragraph",
                    content: "Agora entra a explicação mais profunda.\n\nQuando você está calmo, consegue reconhecer palavras: {{house|casa}}, {{car|carro}}, {{coffee|café}}, {{friend|amigo}}, {{music|música}}, {{work|trabalho}}. Mas quando alguém fala rápido, seu cérebro tenta fazer tudo ao mesmo tempo: ouvir, traduzir, lembrar regra, montar frase e evitar erro.\n\nEssa sobrecarga cria o branco. Não porque você não tem capacidade, mas porque está tentando usar inglês como cálculo, não como reação."
                },
                {
                    type: "brain-diagram",
                    content: JSON.stringify({
                        title: "O ciclo do travamento",
                        steps: [
                            "Você escuta uma frase rápida e tenta traduzir palavra por palavra.",
                            "A pressão sobe porque a outra pessoa está esperando resposta.",
                            "Seu cérebro tenta montar a frase perfeita antes de falar.",
                            "A demora vira vergonha, e a vergonha bloqueia ainda mais.",
                            "Uma frase de controle quebra o ciclo e devolve alguns segundos para você."
                        ]
                    })
                },
                {
                    type: "box-action",
                    title: "Missão: escolher presença",
                    content: "Agora você vai treinar o olhar. Não procure a frase mais bonita. Procure a frase que mantém você na conversa."
                },
                {
                    type: "combat-sort-game",
                    content: JSON.stringify([
                        { text: "{{Sorry, my English is bad.|Desculpa, meu inglês é ruim.}}", type: "lab" },
                        { text: "{{Wait, I'm lost. Come again?|Espera, me perdi. Fala de novo?}}", type: "combat" },
                        { text: "{{I don't know anything.|Eu não sei nada.}}", type: "lab" },
                        { text: "{{Give me a second.|Me dá um segundo.}}", type: "combat" },
                        { text: "{{I can't speak English.|Eu não sei falar inglês.}}", type: "lab" },
                        { text: "{{Say that again.|Fala isso de novo.}}", type: "combat" },
                        { text: "{{My English is terrible.|Meu inglês é horrível.}}", type: "lab" },
                        { text: "{{I need a second.|Preciso de um segundo.}}", type: "combat" }
                    ])
                },
                {
                    type: "reveal-box",
                    title: "A parte densa, sem complicar",
                    content: "Uma parte do inglês é reconhecimento: você olha e sabe que {{red|vermelho}} é uma cor, {{food|comida}} é comida, {{phone|telefone/celular}} é telefone. Outra parte é recuperação ativa: conseguir puxar a palavra ou frase no momento certo. O curso existe para aproximar essas duas partes."
                },
                {
                    type: "elite-insight",
                    title: "Aprendizado do módulo",
                    content: "O problema não é errar. O problema é ficar sem estratégia. Quando você tem uma frase de controle, o erro deixa de ser queda e vira ajuste. Você para de tentar parecer perfeito e começa a operar melhor."
                },
                {
                    type: "micro-win",
                    content: "**Vitória do módulo:** você entendeu por que trava e treinou respostas que protegem sua presença."
                }
            ]
        },
        {
            id: "p1-m4",
            title: "MÓDULO 4: VOCÊ NÃO PRECISA DE MIL PALAVRAS",
            subtitle: "Organize palavras fáceis em situações úteis e entenda a lógica 80/20.",
            status: "locked",
            blocks: [
                {
                    type: "system-status",
                    content: "{{MISSÃO 80/20|Missão 80/20}}: transformar palavras conhecidas em ferramenta de situação."
                },
                {
                    type: "box-action",
                    title: "Cena rápida",
                    content: "Você está em uma viagem. A bateria do {{phone|celular}} está acabando. Você precisa achar {{food|comida}}, {{water|água}} ou {{help|ajuda}}.\n\nMesmo sem frase perfeita, três palavras já acendem a situação:\n\n{{go|ir}} · {{help|ajuda}} · {{food|comida}}\n\nVocê ainda não falou bonito. Mas já sabe o que procurar."
                },
                {
                    type: "interactive-quiz",
                    content: "Você está viajando e precisa resolver o básico. Qual grupo parece mais útil?|{{go|ir}} / {{help|ajuda}} / {{food|comida}} / {{water|água}}|{{movie|filme}} / {{music|música}} / {{game|jogo}} / {{blue|azul}}|{{family|família}} / {{love|amor}} / {{friend|amigo}} / {{red|vermelho}}|0"
                },
                {
                    type: "micro-win",
                    content: "**Com poucas palavras, você já sabe o que procurar numa situação real.** Isso é leitura de situação."
                },
                {
                    type: "h2",
                    content: "4.1 Seu primeiro núcleo 80/20"
                },
                {
                    type: "box-action",
                    title: "Palavras que voltam sempre",
                    content: "Agora organize seu arsenal em blocos menores.\n\nAção: {{go|ir}} · {{get|pegar/conseguir}} · {{have|ter}}\n\nNecessidade: {{want|querer}} · {{need|precisar}} · {{help|ajuda/ajudar}}\n\nVida real: {{work|trabalho/trabalhar}} · {{time|tempo/horário}} · {{food|comida}} · {{money|dinheiro}} · {{problem|problema}}\n\nConversa: {{like|gostar}} · {{friend|amigo}} · {{family|família}} · {{coffee|café}}"
                },
                {
                    type: "h2",
                    content: "4.2 Palavras por situação"
                },
                {
                    type: "comparison-table",
                    content: JSON.stringify({
                        headers: ["Situação", "Palavras simples que já resolvem", "O que elas permitem", "Exemplo de intenção"],
                        rows: [
                            ["Viagem", "{{go|ir}} / {{help|ajuda}} / {{food|comida}} / {{water|água}}", "Pedir direção, ajuda, comida e água.", "{{I need help.|Preciso de ajuda.}}"],
                            ["Trabalho", "{{work|trabalho}} / {{time|tempo/horário}} / {{money|dinheiro}} / {{problem|problema}}", "Falar de rotina, horário, pagamento e problema.", "{{I have a problem.|Tenho um problema.}}"],
                            ["Conversa", "{{like|gostar}} / {{want|querer}} / {{need|precisar}} / {{friend|amigo}}", "Dizer preferência, desejo, necessidade e relação.", "{{I like this.|Eu gosto disso.}}"],
                            ["Casa e vida", "{{house|casa}} / {{family|família}} / {{phone|telefone/celular}} / {{coffee|café}}", "Falar de ambiente, rotina e contato.", "{{My phone is here.|Meu celular está aqui.}}"]
                        ]
                    })
                },
                {
                    type: "interactive-quiz",
                    content: "Qual grupo combina melhor com uma situação de trabalho?|{{work|trabalho}} / {{time|tempo/horário}} / {{money|dinheiro}} / {{problem|problema}}|{{coffee|café}} / {{movie|filme}} / {{music|música}} / {{game|jogo}}|{{red|vermelho}} / {{blue|azul}} / {{black|preto}} / {{love|amor}}|0"
                },
                {
                    type: "h2",
                    content: "4.3 Agora entra a lógica 80/20"
                },
                {
                    type: "paragraph",
                    content: "A lógica é simples: uma parte pequena do vocabulário aparece em uma quantidade enorme de situações. Isso não significa que você nunca vai aprender palavras novas. Significa que, no começo, você ganha muito mais resultado quando aprende a usar bem as palavras que voltam sempre.\n\nÉ por isso que {{go|ir}}, {{get|pegar/conseguir}}, {{have|ter}}, {{want|querer}}, {{need|precisar}}, {{like|gostar}}, {{help|ajuda/ajudar}}, {{time|tempo/horário}} e {{problem|problema}} valem tanto. Elas aparecem em conversa, viagem, trabalho, compra, pedido, dúvida e emergência."
                },
                {
                    type: "phrase-analysis",
                    content: JSON.stringify({
                        phrase: "{{I need help.|Eu preciso de ajuda.}}",
                        phonetic: "/ai nid help/ — frase curta, direta e fácil de reconhecer. Não precisa parecer sofisticada para funcionar.",
                        grammarNote: "{{Need|precisar}} é uma palavra de alto retorno. Com ela, você já consegue expressar urgência, falta, pedido e necessidade."
                    })
                },
                {
                    type: "scenario-card",
                    content: JSON.stringify({
                        context: "Você está em uma estação, aeroporto ou loja. Tem pouco tempo, está com dúvida e precisa resolver algo simples.",
                        situation: "Você não sabe para onde ir e precisa pedir ajuda.",
                        wrong: {
                            action: "Tentar montar uma frase perfeita e desistir porque não lembra todas as palavras.",
                            result: "Você fica parado, mesmo reconhecendo palavras como {{help|ajuda}}, {{go|ir}} e {{time|tempo}}."
                        },
                        right: {
                            action: "Usar poucas palavras com intenção clara.",
                            result: "{{I need help. Where do I go?|Preciso de ajuda. Para onde eu vou?}}"
                        }
                    })
                },
                {
                    type: "reveal-box",
                    title: "Densidade sem peso morto",
                    content: "Vocabulário não é coleção. Vocabulário é acesso. Uma palavra vale mais quando abre muitas portas. {{Get|Pegar/conseguir}} abre várias. {{Need|Precisar}} abre várias. {{Help|Ajuda}} abre várias. Palavras raras podem ser úteis depois, mas palavras frequentes fazem o aluno sair do lugar agora."
                },
                {
                    type: "elite-insight",
                    title: "Aprendizado do módulo",
                    content: "Você não precisa carregar um dicionário inteiro. Precisa reconhecer o núcleo que aparece em viagem, trabalho, conversa, comida, dinheiro, ajuda e problema. Fluência começa quando palavra conhecida vira intenção clara."
                },
                {
                    type: "micro-win",
                    content: "**Vitória do módulo:** você organizou palavras fáceis em situações reais e entendeu por que poucas palavras bem usadas podem destravar muita coisa."
                }
            ]
        },
        {
            id: "p1-m5",
            title: "MÓDULO 5: O SOM REAL NÃO É IMPOSSÍVEL",
            subtitle: "Decodifique fala conectada e sinta por que a escuta é a próxima porta.",
            status: "locked",
            blocks: [
                {
                    type: "system-status",
                    content: "{{DECODIFICADOR DE SOM|Decodificador de som}}: reconhecer a frase escondida dentro do som real."
                },
                {
                    type: "box-action",
                    title: "Primeiro, decodifique",
                    content: "Você já viu palavras simples. Já montou frases de controle. Agora vem uma parte que muda tudo: o som.\n\nOlhe para esta frase conhecida:\n\n**{{What do you want?|O que você quer?}}**\n\nNa fala real, ela pode soar assim:\n\n**{{Whaddya want?|O que cê quer?}}**\n\nParece outra frase, mas é a mesma. Seu ouvido só está vendo a porta do próximo treinamento."
                },
                {
                    type: "audio-decode-game",
                    content: JSON.stringify([
                        {
                            phonetic: "Whaddya want?",
                            decoded: "{{What do you want?|O que você quer?}}",
                            translation: "O que você quer?",
                            options: [
                                "{{What do you want?|O que você quer?}}",
                                "{{Where do you live?|Onde você mora?}}",
                                "{{What is your name?|Qual é o seu nome?}}"
                            ],
                            answer: 0
                        },
                        {
                            phonetic: "Gimme a second",
                            decoded: "{{Give me a second.|Me dá um segundo.}}",
                            translation: "Me dá um segundo.",
                            options: [
                                "{{Give me a second.|Me dá um segundo.}}",
                                "{{Get me some food.|Me arruma comida.}}",
                                "{{Go in a second.|Vá em um segundo.}}"
                            ],
                            answer: 0
                        },
                        {
                            phonetic: "Wanna go?",
                            decoded: "{{Do you want to go?|Você quer ir?}}",
                            translation: "Você quer ir?",
                            options: [
                                "{{Do you want to work?|Você quer trabalhar?}}",
                                "{{Do you want to go?|Você quer ir?}}",
                                "{{Do you need help?|Você precisa de ajuda?}}"
                            ],
                            answer: 1
                        },
                        {
                            phonetic: "Come again?",
                            decoded: "{{Can you say that again?|Pode falar isso de novo?}}",
                            translation: "Pode falar isso de novo?",
                            options: [
                                "{{Can you say that again?|Pode falar isso de novo?}}",
                                "{{Can you come tomorrow?|Você pode vir amanhã?}}",
                                "{{Can you get money?|Você pode conseguir dinheiro?}}"
                            ],
                            answer: 0
                        }
                    ])
                },
                {
                    type: "micro-win",
                    content: "**Você decodificou inglês real.** O som não era impossível. Ele só estava conectado."
                },
                {
                    type: "paragraph",
                    content: "O nativo não está tentando te derrubar. Ele fala com economia. Palavras se juntam, sons somem e a frase vira um bloco.\n\nSeu trabalho agora não é decorar fonética difícil. É começar a reconhecer padrões: {{What do you|O que você}} pode virar {{Whaddya|O que cê}}, {{want to|querer}} pode virar {{wanna|querer}}, e {{give me|me dá}} pode soar como {{gimme|me dá}}.\n\nAqui você só abriu a primeira fresta. A escuta real tem camadas, e a próxima fase existe exatamente para treinar isso com calma."
                },
                {
                    type: "h2",
                    content: "5.1 O que muda quando você começa a ouvir padrões"
                },
                {
                    type: "comparison-table",
                    content: JSON.stringify({
                        headers: ["Forma de livro", "Som real comum", "O que seu ouvido aprende"],
                        rows: [
                            ["{{What do you want?|O que você quer?}}", "{{Whaddya want?|O que cê quer?}}", "As palavras se conectam."],
                            ["{{Do you want to go?|Você quer ir?}}", "{{Wanna go?|Quer ir?}}", "A frase fica mais curta."],
                            ["{{Give me a second.|Me dá um segundo.}}", "{{Gimme a second.|Me dá um segundo.}}", "O som vira um bloco."],
                            ["{{I am going to go.|Eu vou ir.}}", "{{I'm gonna go.|Eu vou.}}", "A fala real corta caminho."]
                        ]
                    })
                },
                {
                    type: "scenario-card",
                    content: JSON.stringify({
                        context: "Você está em uma cafeteria. A pessoa do atendimento fala rápido. Você reconhece pedaços: {{coffee|café}}, {{want|querer}}, {{anything else|mais alguma coisa}}.",
                        situation: "A frase vem como um bloco: {{Whaddya want? Anything else?|O que cê quer? Mais alguma coisa?}}",
                        wrong: {
                            action: "Tentar separar cada palavra, travar e concluir que seu inglês não serve.",
                            result: "Você perde a frase inteira porque estava procurando o inglês limpo da escola."
                        },
                        right: {
                            action: "Capturar a intenção principal e responder simples.",
                            result: "{{Coffee, please. That's it.|Café, por favor. Só isso.}}"
                        }
                    })
                },
                {
                    type: "reveal-box",
                    title: "O que isso prepara",
                    content: "Este módulo não existe para fazer você entender todo nativo de uma vez. Ele existe para provar uma coisa menor e mais importante: o som real pode ser decodificado. O Pilar 2 continua exatamente daqui: treinar o ouvido para reconhecer esses blocos com mais segurança."
                },
                {
                    type: "elite-insight",
                    title: "Aprendizado do módulo",
                    content: "O nativo não fala impossível. Ele fala conectado. Quando você entende isso, a escuta deixa de parecer caos e começa a parecer padrão. E quando um padrão aparece uma vez, ele pode ser treinado."
                },
                {
                    type: "micro-win",
                    content: "**Vitória do módulo:** você identificou frases escondidas dentro do som real. Esse é o primeiro sinal de escuta treinável."
                }
            ]
        },
        {
            id: "p1-m6",
            title: "MÓDULO 6: FECHAMENTO E AVALIAÇÃO",
            subtitle: "Consolide suas vitórias, crie seu mapa de partida e prepare a próxima fase.",
            status: "locked",
            blocks: [
                {
                    type: "system-status",
                    content: "{{INICIAÇÃO COMPLETA|Iniciação completa}}: transformar microvitórias em direção."
                },
                {
                    type: "box-goal",
                    title: "Resumo das suas vitórias",
                    content: "Antes da avaliação, olha o que você já fez:\n\n- Você montou uma frase útil quando deu branco.\n- Você reconheceu palavras simples em uma história real.\n- Você entendeu a Ponte Húngara e por que o método nasceu.\n- Você escolheu respostas que mantêm presença.\n- Você percebeu que poucas palavras resolvem situações.\n- Você decodificou fala real conectada.\n- Você percebeu que escuta não é mágica: é reconhecimento de padrões."
                },
                {
                    type: "micro-win",
                    content: "**Você sabe mais do que imaginava.** O que começou como medo agora virou evidência: você reconhece, escolhe, monta e decodifica."
                },
                {
                    type: "interactive-quiz",
                    content: "Qual vitória mostra melhor que você saiu do zero?|Reconhecer palavras como {{love|amor}}, {{house|casa}} e {{coffee|café}} dentro de contexto|Decorar uma lista enorme sem usar|Esperar ficar perfeito antes de tentar|0"
                },
                {
                    type: "h2",
                    content: "6.1 O que este Pilar realmente provou"
                },
                {
                    type: "paragraph",
                    content: "O Pilar 1 não tentou ensinar todo o inglês. Ele fez algo mais importante para o começo: mostrou que existe base.\n\nVocê reconhece palavras. Você consegue montar frases curtas. Você consegue escolher uma resposta melhor. Você consegue perceber que o som real tem padrão.\n\nAgora que essa base apareceu, continuar não é começar do zero. É dar sequência."
                },
                {
                    type: "h2",
                    content: "6.2 Agora vem o seu mapa de partida"
                },
                {
                    type: "paragraph",
                    content: "Agora vamos criar o seu primeiro mapa de ponto de partida. Não é uma prova para te expor. É uma forma de entender o que você já reconhece, como você pensa e qual deve ser o próximo passo.\n\nA avaliação existe para organizar o caminho. Ela mostra onde sua base já está aparecendo e o que precisa ser treinado em seguida."
                },
                {
                    type: "box-warning",
                    title: "Como responder",
                    content: "Responda com suas próprias palavras. Pode usar inglês simples. Não precisa inventar frase bonita. Erro honesto vale mais do que texto perfeito copiado.\n\nEvite tradutor e IA nesta etapa. O objetivo é enxergar seu momento real para a próxima fase fazer sentido."
                },
                {
                    type: "interactive-quiz",
                    content: "Qual é a ideia principal deste Pilar?|Descobrir que falta tudo|Perceber o que você já reconhece e começar a usar|Decorar muita regra antes de ouvir e reagir|1"
                },
                {
                    type: "h2",
                    content: "6.3 A próxima porta: escuta"
                },
                {
                    type: "paragraph",
                    content: "Se o Pilar 1 acendeu a primeira luz, a próxima pergunta é natural: como ouvir melhor o inglês real?\n\nVocê já viu que {{What do you want?|O que você quer?}} pode virar {{Whaddya want?|O que cê quer?}}. Isso não é detalhe pequeno. É uma porta. Quando o ouvido começa a reconhecer esses blocos, a conversa fica menos assustadora.\n\nPor isso, a próxima fase aprofunda exatamente esse ponto: escuta, som real, fala conectada e reconhecimento mais rápido."
                },
                {
                    type: "reveal-box",
                    title: "O próximo passo lógico",
                    content: "Até aqui, você descobriu que não está começando do zero. Você reconhece palavras, entende intenções simples e já viu que o som real tem padrão. O próximo passo natural é treinar a escuta: aprender a perceber esses blocos quando alguém fala de verdade."
                },
                {
                    type: "elite-insight",
                    title: "Aprendizado final",
                    content: "O próximo passo não é estudar aleatoriamente. É seguir com direção. Primeiro você descobre o que já existe. Depois transforma reconhecimento em escuta, escuta em reação e reação em confiança."
                },
                {
                    type: "box-action",
                    title: "Chamada para ação",
                    content: "Quando estiver pronto, toque no botão de avaliação para **criar seu mapa de partida**.\n\nA ideia não é te julgar. É organizar o que você já mostrou aqui e indicar se o próximo passo faz sentido: treinar a escuta guiada no Pilar 2."
                },
                {
                    type: "pillar-end",
                    title: "Pilar 1 concluído",
                    content: "Você completou sua iniciação.\n\nVocê já reagiu, reconheceu palavras, organizou situações e decodificou seu primeiro som real.\n\nAgora o próximo passo é natural: treinar o ouvido para reconhecer mais desses padrões no inglês falado. Esse é o papel do Pilar 2."
                }
            ]
        }
    ]
};

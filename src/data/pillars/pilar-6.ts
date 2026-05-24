import { PillarData } from "@/types/study";

export const PILAR_6_DATA: PillarData = {
    id: 6,
    title: "Pilar 6: Conversacao Pratica",
    subtitle: "Como responder, sustentar, puxar e conduzir conversas reais em ingles com mais rapidez, presenca e fluidez funcional.",
    modules: [
        {
            id: "p6-m1",
            title: "MODULO 1: RESPOSTA SEM COLAPSO",
            subtitle: "Como responder sem congelar, ganhar tempo sem sumir e manter a conversa viva mesmo quando a palavra nao vem na hora.",
            status: "active",
            blocks: [
                {
                    type: "system-status",
                    content: "{{SPEAKING CHANNEL|CANAL DE FALA}}: {{ONLINE|ATIVO}}. {{Turn-taking protocol armed|Protocolo de turno armado}}."
                },
                {
                    type: "h2",
                    content: "Conversar bem nao comeca com resposta brilhante. Comeca com resposta que nao morre"
                },
                {
                    type: "paragraph",
                    content: "Muita gente acha que trava em conversa porque nao sabe ingles suficiente. As vezes isso e verdade. Mas, em muitos casos, o bloqueio vem antes: a pessoa recebe a pergunta, entra em panico e tenta montar a resposta perfeita inteira de uma vez. O resultado e silencio, atraso ou fuga. Este modulo corrige esse ponto."
                },
                {
                    type: "box-goal",
                    title: "Objetivo deste modulo",
                    content: "Fazer voce responder mais cedo e com mais seguranca. Nao para soar genial. Para nao desaparecer da conversa quando ela comeca."
                },
                {
                    type: "box-insight",
                    title: "Base da pesquisa",
                    content: "A linha usada aqui bate com materiais de conversacao do British Council, Cambridge e descritores do CEFR: responder, pedir esclarecimento, fazer pequena continuacao e manter o turno valem mais do que esperar a frase perfeita."
                },
                {
                    type: "h3",
                    content: "1.1 O primeiro erro: achar que responder e igual a entregar uma frase completa de prova"
                },
                {
                    type: "paragraph",
                    content: "Conversa real nao funciona como redacao oral. Ela funciona em movimentos curtos. Voce responde um pouco, sinaliza que esta ali, ganha um segundo, completa, pergunta de volta ou confirma o que ouviu. Esse fluxo pequeno vale ouro."
                },
                {
                    type: "cards-grid",
                    content: [
                        "Resposta minima viva|{{Yeah, a little.|Sim, um pouco.}}",
                        "Ganho de tempo limpo|{{Let me think for a second.|Deixa eu pensar um segundo.}}",
                        "Checagem de entendimento|{{Sorry, do you mean today or this week?|Desculpa, voce quer dizer hoje ou esta semana?}}",
                        "Reentrada na conversa|{{Right, so... I usually work from home.|Certo, entao... eu normalmente trabalho de casa.}}"
                    ]
                },
                {
                    type: "box-warning",
                    title: "O que mata o turno",
                    content: "Silencio longo demais, {{yes|sim}} vazio sem continuacao, sorriso sem resposta e fingir que entendeu quando nao entendeu. Cambridge chama atencao para isso com clareza: a conversa morre rapido quando o aluno so acena ou fica quieto."
                },
                {
                    type: "h3",
                    content: "1.2 A regra pratica: responda, acrescente, devolva ou esclareca"
                },
                {
                    type: "paragraph",
                    content: "Uma boa resposta inicial nao precisa ser longa. Ela precisa abrir uma das quatro saidas abaixo. Essa logica tambem conversa com a ideia de {{Ask, Answer, Add|Perguntar, Responder, Acrescentar}} trabalhada pelo British Council para manter conversa natural."
                },
                {
                    type: "table",
                    title: "As 4 saidas que salvam a conversa",
                    content: [
                        "Saida|Funcao|Exemplo",
                        "Responder|entregar o minimo necessario|{{I work in sales.|Eu trabalho com vendas.}}",
                        "Acrescentar|evitar resposta seca|{{I work in sales, mostly with new clients.|Eu trabalho com vendas, principalmente com novos clientes.}}",
                        "Devolver|manter a troca viva|{{How about you?|E voce?}}",
                        "Esclarecer|evitar erro em cadeia|{{Sorry, could you say that again?|Desculpa, pode repetir?}}"
                    ]
                },
                {
                    type: "h3",
                    content: "1.3 Ganhar tempo sem parecer perdido"
                },
                {
                    type: "paragraph",
                    content: "Pausa existe em conversa. O problema nao e pausar. O problema e sumir. Em ingles, pequenos apoios te compram tempo e mantem o canal aberto. O ouvinte percebe que voce continua presente."
                },
                {
                    type: "comparison",
                    content: [
                        "{{...|...}}|Silencio puro. O outro nao sabe se voce travou, nao ouviu ou desistiu.",
                        "{{Let me think...|Deixa eu pensar...}}|Pausa comunicada. Voce continua no jogo.",
                        "{{Uh... yes.|Ahn... sim.}}|Resposta curta demais e sem direcao.",
                        "{{Yeah, a little. Let me think of a good example.|Sim, um pouco. Deixa eu pensar num bom exemplo.}}|Mais natural e mais util."
                    ]
                },
                {
                    type: "dialogue",
                    title: "Pergunta simples, resposta viva",
                    content: [
                        "Person A: {{So, what do you do?|Entao, o que voce faz?}}",
                        "You: {{I work in marketing.|Eu trabalho com marketing.}}",
                        "You: {{Mostly with social media campaigns.|Principalmente com campanhas de redes sociais.}}",
                        "You: {{How about you?|E voce?}}",
                        "Person A: {{Nice. I work in design.|Legal. Eu trabalho com design.}}"
                    ]
                },
                {
                    type: "box-action",
                    title: "Atalho de sobrevivencia",
                    content: "Se a pergunta vier e o cerebro atrasar, use esta ordem: 1) responda o minimo, 2) acrescente um detalhe curto, 3) devolva ou siga. O alvo nao e performance. E continuidade."
                },
                {
                    type: "h3",
                    content: "1.4 Pedir esclarecimento tambem e conversar"
                },
                {
                    type: "paragraph",
                    content: "O CEFR trata pedir esclarecimento e checar entendimento como parte real da interacao. Entao parar a conversa para limpar sentido nao e fracasso. E competencia."
                },
                {
                    type: "cards-grid",
                    content: [
                        "Pedir repeticao|{{Sorry, could you say that again?|Desculpa, pode repetir?}}",
                        "Checar parte da frase|{{Sorry, which day did you say?|Desculpa, qual dia voce falou?}}",
                        "Confirmar escolha|{{Do you mean the morning meeting?|Voce quer dizer a reuniao da manha?}}",
                        "Comprar tempo com presenca|{{One second, let me think.|Um segundo, deixa eu pensar.}}"
                    ]
                },
                {
                    type: "scramble-exercise",
                    content: "{\"sentence\":\"I work in sales, mostly with new clients.\",\"translation\":\"Eu trabalho com vendas, principalmente com novos clientes.\"}"
                },
                {
                    type: "list",
                    content: [
                        "Pergunta 1: {{Did I answer something real, or only make noise?|Eu respondi algo real ou so fiz barulho?}}",
                        "Pergunta 2: {{Did I add one small detail?|Eu acrescentei um detalhe pequeno?}}",
                        "Pergunta 3: {{If I didnt understand, did I clarify early?|Se eu nao entendi, eu esclareci cedo?}}"
                    ]
                },
                {
                    type: "interactive-quiz",
                    content: "Qual resposta mantem a conversa mais viva quando alguem pergunta {{What do you do?|O que voce faz?}}?|{{Yes.|Sim.}}|{{I work in IT.|Eu trabalho com TI.}}|{{I work in IT, mostly with support. How about you?|Eu trabalho com TI, principalmente com suporte. E voce?}}|2"
                },
                {
                    type: "interactive-quiz",
                    content: "Qual frase ajuda voce a ganhar tempo sem desaparecer da conversa?|{{...|...}}|{{Let me think for a second.|Deixa eu pensar um segundo.}}|{{No English.|Sem ingles.}}|1"
                },
                {
                    type: "interactive-quiz",
                    content: "Se voce nao entendeu uma pergunta, qual saida e mais inteligente?|{{Smile and say yes.|Sorrir e dizer sim.}}|{{Ignore it and change the subject.|Ignorar e mudar de assunto.}}|{{Sorry, could you say that again?|Desculpa, pode repetir?}}|2"
                },
                {
                    type: "micro-win",
                    content: "Voce terminou este modulo com um ganho importante: conversar ja nao precisa comecar no modo tudo ou nada. Agora voce tem como entrar, segurar e continuar."
                }
            ]
        },
        {
            id: "p6-m2",
            title: "MODULO 2: SMALL TALK QUE FUNCIONA",
            subtitle: "Como abrir conversa, puxar assunto leve, fazer follow-up e sair bem sem parecer robotico nem invasivo.",
            status: "locked",
            blocks: [
                {
                    type: "system-status",
                    content: "{{SOCIAL MODE|MODO SOCIAL}}: {{ONLINE|ATIVO}}. {{Warm opener bank loaded|Banco de aberturas leves carregado}}."
                },
                {
                    type: "h2",
                    content: "Small talk nao e conversa inutil. E a ponte que faz a conversa acontecer"
                },
                {
                    type: "paragraph",
                    content: "Muita gente despreza small talk porque acha superficial. Mas, em ingles real, ela cumpre uma funcao muito pratica: reduzir atrito, mostrar abertura e criar um clima em que a conversa pode crescer. Antes da parte mais importante, quase sempre vem uma entrada leve."
                },
                {
                    type: "box-goal",
                    title: "Objetivo deste modulo",
                    content: "Ensinar voce a iniciar, sustentar e fechar trocas leves com mais naturalidade, especialmente em trabalho, encontro casual, evento, corredor, fila e pausa de cafe."
                },
                {
                    type: "box-insight",
                    title: "Base da pesquisa",
                    content: "British Council destaca que small talk cria conforto e conexao, e que a conversa flui melhor quando voce usa abertura suave, escuta ativa, follow-up e topicos seguros. O foco aqui e esse."
                },
                {
                    type: "h3",
                    content: "2.1 Abertura suave vale mais do que pergunta pesada"
                },
                {
                    type: "paragraph",
                    content: "Em muitos contextos de lingua inglesa, a conversa nao comeca com pergunta pessoal direta. Ela comeca com comentario simples, pergunta leve sobre o momento ou algo facil de responder. Isso baixa a pressao."
                },
                {
                    type: "cards-grid",
                    content: [
                        "No trabalho|{{How's your day going so far?|Como esta indo seu dia ate agora?}}",
                        "Em evento|{{Have you been to one of these events before?|Voce ja veio a um evento desses antes?}}",
                        "Em encontro casual|{{Busy morning?|Manha corrida?}}",
                        "Com abertura de ambiente|{{Nice weather today, isnt it?|Tempo bom hoje, ne?}}"
                    ]
                },
                {
                    type: "box-warning",
                    title: "O que evitar no comeco",
                    content: "Pergunta intima cedo demais, entrevista seca em sequencia e topico pesado logo de cara. Small talk boa abre espaco; nao pressiona a pessoa."
                },
                {
                    type: "h3",
                    content: "2.2 Topico seguro nao e topico sem vida"
                },
                {
                    type: "paragraph",
                    content: "British Council sugere trabalhar com temas leves e nao controversos no inicio: clima, rotina, fim de semana, viagem, hobbies, evento, trabalho em nivel simples. O truque nao e o topico em si. E o jeito de puxar e continuar."
                },
                {
                    type: "table",
                    title: "Topicos que costumam funcionar bem",
                    content: [
                        "Topico|Por que funciona|Exemplo",
                        "Dia ou semana|facil de responder|{{How's your week going?|Como esta indo sua semana?}}",
                        "Evento ou lugar|contexto compartilhado|{{What brings you here today?|O que te trouxe aqui hoje?}}",
                        "Fim de semana|leve e comum|{{Any plans for the weekend?|Algum plano para o fim de semana?}}",
                        "Interesse ou hobby|abre chance de follow-up|{{Do you do any sports?|Voce pratica algum esporte?}}"
                    ]
                },
                {
                    type: "h3",
                    content: "2.3 O segredo nao e perguntar mais. E perguntar melhor"
                },
                {
                    type: "paragraph",
                    content: "Cambridge Grammar lembra que follow-up questions nascem do que a outra pessoa acabou de dizer. E o British Council reforca que isso mostra interesse real. Em vez de pular para outro assunto, voce pega uma pista e expande."
                },
                {
                    type: "comparison",
                    content: [
                        "{{How was your weekend?|Como foi seu fim de semana?}} -> {{Good.|Bom.}} -> fim|Pergunta existe, mas nao virou conversa.",
                        "{{How was your weekend?|Como foi seu fim de semana?}} -> {{Good. I went hiking.|Bom. Fui fazer trilha.}} -> {{Really? Where did you go?|Serio? Onde voce foi?}}|Aqui a conversa ganhou corpo.",
                        "{{Do you like music?|Voce gosta de musica?}} -> {{Yes.|Sim.}}|Resposta seca sem abertura.",
                        "{{Do you like music?|Voce gosta de musica?}} -> {{Yeah, especially live music. What about you?|Sim, principalmente musica ao vivo. E voce?}}|Mais natural e mais social."
                    ]
                },
                {
                    type: "cards-grid",
                    content: [
                        "Mostrar interesse|{{That sounds fun.|Parece legal.}}",
                        "Puxar detalhe|{{How did that go?|Como foi isso?}}",
                        "Abrir expansao|{{Tell me more about that.|Me fala mais sobre isso.}}",
                        "Criar continuidade|{{Really? I didnt know that.|Serio? Eu nao sabia disso.}}"
                    ]
                },
                {
                    type: "dialogue",
                    title: "Small talk leve, natural e util",
                    content: [
                        "You: {{How's your week going so far?|Como esta indo sua semana ate agora?}}",
                        "Person B: {{Pretty good. Busy, but good.|Bem boa. Corrida, mas boa.}}",
                        "You: {{Yeah? What have you been working on?|Ah e? Em que voce tem trabalhado?}}",
                        "Person B: {{A new client project, mostly.|Num projeto novo de cliente, principalmente.}}",
                        "You: {{Nice. That sounds interesting.|Legal. Parece interessante.}}"
                    ]
                },
                {
                    type: "h3",
                    content: "2.4 Saber sair bem tambem conta"
                },
                {
                    type: "paragraph",
                    content: "Uma conversa curta nao precisa morrer de forma estranha. Fechar bem tambem e habilidade de conversa. Encerrar com educacao deixa a impressao melhor do que desaparecer no ar."
                },
                {
                    type: "cards-grid",
                    content: [
                        "Fechar com calor|{{It was nice talking to you.|Foi bom falar com voce.}}",
                        "Encerrar sem cortar seco|{{I should let you get back to work.|Vou deixar voce voltar ao trabalho.}}",
                        "Fechar com gentileza|{{Enjoy the rest of your day.|Aproveita o resto do seu dia.}}",
                        "Deixar porta aberta|{{Lets catch up again soon.|Vamos conversar de novo em breve.}}"
                    ]
                },
                {
                    type: "scramble-exercise",
                    content: "{\"sentence\":\"How's your week going so far?\",\"translation\":\"Como esta indo sua semana ate agora?\"}"
                },
                {
                    type: "box-action",
                    title: "Formula simples de small talk",
                    content: "1) Abra com pergunta leve ou comentario simples.\n2) Ouva a pista da resposta.\n3) Faca um follow-up curto.\n4) Acrescente uma reacao humana.\n5) Feche com educacao se a conversa precisar acabar."
                },
                {
                    type: "interactive-quiz",
                    content: "Qual abertura soa mais leve e natural para small talk no trabalho?|{{Tell me your personal problems.|Me conte seus problemas pessoais.}}|{{How's your day going so far?|Como esta indo seu dia ate agora?}}|{{Why are you here exactly?|Por que voce esta aqui exatamente?}}|1"
                },
                {
                    type: "interactive-quiz",
                    content: "A pessoa diz {{I went hiking this weekend.|Fui fazer trilha neste fim de semana.}} Qual follow-up mantem melhor a conversa?|{{Okay.|Ok.}}|{{Really? Where did you go?|Serio? Onde voce foi?}}|{{I also have shoes.|Eu tambem tenho sapatos.}}|1"
                },
                {
                    type: "interactive-quiz",
                    content: "Qual fechamento encerra a troca com mais educacao?|{{Bye.|Tchau.}}|{{I should let you get back to work.|Vou deixar voce voltar ao trabalho.}}|{{Conversation finished.|Conversa encerrada.}}|1"
                },
                {
                    type: "micro-win",
                    content: "Voce fechou o segundo modulo com uma habilidade que muda muito jogo social: agora ja da para abrir conversa, puxar continuacao e sair bem sem parecer travado."
                }
            ]
        },
        {
            id: "p6-m3",
            title: "MODULO 3: FALAR DA SUA VIDA",
            subtitle: "Como falar de rotina, trabalho, cidade, gostos e historia pessoal sem soar mecanico.",
            status: "locked",
            blocks: [
                {
                    type: "system-status",
                    content: "{{PERSONAL TRACK|TRILHA PESSOAL}}: {{ONLINE|ATIVA}}. {{Self-introduction layer loaded|Camada de autoapresentacao carregada}}."
                },
                {
                    type: "h2",
                    content: "Depois de entrar na conversa, voce precisa ter o que dizer sobre voce"
                },
                {
                    type: "paragraph",
                    content: "Muita gente consegue responder {{fine|bem}}, {{good|bom}} e {{not much|nada demais}}, mas trava quando precisa falar da propria vida por mais de uma linha. E aqui nao estamos falando de discurso bonito. Estamos falando de coisas que aparecem o tempo todo: de onde voce e, o que voce faz, como e sua rotina, do que voce gosta e como e o lugar onde voce vive."
                },
                {
                    type: "box-goal",
                    title: "Objetivo deste modulo",
                    content: "Fazer voce falar de si com mais naturalidade e mais material real, sem depender de frase decorada ou resposta seca demais."
                },
                {
                    type: "box-insight",
                    title: "Base da pesquisa",
                    content: "A estrutura deste modulo foi guiada por blocos do British Council sobre {{talking about your job|falar sobre seu trabalho}}, {{talking about where you're from|falar de onde voce e}} e {{talking about personal interests|falar de interesses pessoais}}. O padrao e claro: resposta simples, detalhe curto e continuidade."
                },
                {
                    type: "h3",
                    content: "3.1 Comece com blocos que voce realmente vai usar"
                },
                {
                    type: "paragraph",
                    content: "Voce nao precisa contar sua biografia inteira. Precisa dominar alguns blocos que se conectam bem. Quando esses blocos ficam vivos, a conversa anda."
                },
                {
                    type: "cards-grid",
                    content: [
                        "Origem|{{I'm from Recife.|Eu sou de Recife.}}",
                        "Cidade atual|{{I live in Lisbon now.|Eu moro em Lisboa agora.}}",
                        "Trabalho|{{I work in customer support.|Eu trabalho com atendimento ao cliente.}}",
                        "Interesse|{{I like cooking and going for walks.|Eu gosto de cozinhar e de sair para caminhar.}}"
                    ]
                },
                {
                    type: "h3",
                    content: "3.2 Falar de onde voce e sem parar na primeira frase"
                },
                {
                    type: "paragraph",
                    content: "British Council trabalha isso de um jeito bem util: origem, lugar atual e uma pequena descricao. Essa terceira parte e o que impede a resposta de morrer."
                },
                {
                    type: "dialogue",
                    title: "Origem com um passo a mais",
                    content: [
                        "Person A: {{Where are you from?|De onde voce e?}}",
                        "You: {{I'm from Sao Paulo.|Eu sou de Sao Paulo.}}",
                        "You: {{I live near the city center.|Eu moro perto do centro da cidade.}}",
                        "You: {{Its busy, but I like it.|E corrido, mas eu gosto.}}"
                    ]
                },
                {
                    type: "comparison",
                    content: [
                        "{{I'm from Brazil.|Eu sou do Brasil.}}|Resposta correta, mas fecha rapido.",
                        "{{I'm from Brazil, and I live in Curitiba now.|Eu sou do Brasil, e moro em Curitiba agora.}}|Ja abre mais conversa.",
                        "{{I am from Brazil, I am from a city, it is a place.|Eu sou do Brasil, eu sou de uma cidade, e um lugar.}}|Monta palavras, mas nao entrega informacao viva.",
                        "{{I'm from Brazil. Its a quiet place, and the people are really friendly.|Eu sou do Brasil. E um lugar tranquilo, e as pessoas sao bem amigaveis.}}|Mais humana e mais conversavel."
                    ]
                },
                {
                    type: "h3",
                    content: "3.3 Falar do que voce faz sem parecer formulario"
                },
                {
                    type: "paragraph",
                    content: "Quando alguem pergunta {{What do you do?|O que voce faz?}}, a conversa nao pede cargo perfeito em linguagem corporativa. Ela pede clareza. O British Council usa bem essa linha: diga seu papel e, se puder, explique em uma camada a mais."
                },
                {
                    type: "table",
                    title: "Jeitos limpos de falar do trabalho",
                    content: [
                        "Pergunta|Resposta base|Resposta com detalhe",
                        "{{What do you do?|O que voce faz?}}|{{I'm a teacher.|Eu sou professor.}}|{{I teach kids online.|Eu ensino criancas online.}}",
                        "{{What's your role?|Qual e sua funcao?}}|{{I work in sales.|Eu trabalho com vendas.}}|{{Mostly with new clients.|Principalmente com novos clientes.}}",
                        "{{Do you like your job?|Voce gosta do seu trabalho?}}|{{Yeah, I do.|Sim, gosto.}}|{{Its busy, but I learn a lot.|E corrido, mas eu aprendo bastante.}}"
                    ]
                },
                {
                    type: "box-warning",
                    title: "Erro comum",
                    content: "Tentar responder tudo de uma vez ou traduzir um cargo complicado demais. Em conversa comum, clareza ganha. Se o outro quiser mais, ele pergunta."
                },
                {
                    type: "h3",
                    content: "3.4 Rotina e interesses: o que voce faz quando nao esta trabalhando"
                },
                {
                    type: "paragraph",
                    content: "Interesse pessoal ajuda muito porque gera pista para follow-up. Em vez de listar hobbies como inventario, foque em poucas coisas que voce realmente faz."
                },
                {
                    type: "cards-grid",
                    content: [
                        "Rotina curta|{{I usually get up early.|Eu normalmente acordo cedo.}}",
                        "Tempo livre|{{When I'm not working, I usually read or go for a walk.|Quando eu nao estou trabalhando, eu normalmente leio ou saio para caminhar.}}",
                        "Frequencia|{{I do it once or twice a week.|Eu faco isso uma ou duas vezes por semana.}}",
                        "Falta de tempo|{{Sometimes its hard to find time.|As vezes e dificil achar tempo.}}"
                    ]
                },
                {
                    type: "dialogue",
                    title: "Interesse pessoal sem soar montado",
                    content: [
                        "Person A: {{What do you do when you're not working?|O que voce faz quando nao esta trabalhando?}}",
                        "You: {{I usually read or watch documentaries.|Eu normalmente leio ou assisto documentarios.}}",
                        "You: {{And I try to go for a walk in the evening.|E eu tento sair para caminhar no fim do dia.}}",
                        "Person A: {{Nice. What kind of documentaries do you like?|Legal. Que tipo de documentario voce gosta?}}"
                    ]
                },
                {
                    type: "h3",
                    content: "3.5 A chave aqui nao e volume. E combinacao"
                },
                {
                    type: "paragraph",
                    content: "Voce nao precisa de vinte frases sobre voce. Precisa de combinacoes boas. Lugar + descricao. Trabalho + detalhe. Interesse + frequencia. Isso ja muda muito o nivel da sua resposta."
                },
                {
                    type: "box-action",
                    title: "Formula simples para falar de voce",
                    content: "1) Diga a informacao base.\n2) Acrescente um detalhe curto.\n3) Se couber, mostre opiniao ou frequencia.\n4) Deixe espaco para o outro continuar a conversa."
                },
                {
                    type: "scramble-exercise",
                    content: "{\"sentence\":\"I work in customer support, and I usually work from home.\",\"translation\":\"Eu trabalho com atendimento ao cliente, e normalmente trabalho de casa.\"}"
                },
                {
                    type: "interactive-quiz",
                    content: "Qual resposta fala de onde voce e com mais vida, sem exagerar?|{{I'm from Brazil.|Eu sou do Brasil.}}|{{I'm from Brazil, and I live in Porto now.|Eu sou do Brasil, e moro no Porto agora.}}|{{Brazil from I am.|Do Brasil de eu sou.}}|1"
                },
                {
                    type: "interactive-quiz",
                    content: "Se alguem pergunta {{What do you do?|O que voce faz?}}, qual resposta soa mais natural?|{{I am function administrative in company.|Eu sou funcao administrativa em empresa.}}|{{I work in admin, mostly with schedules and documents.|Eu trabalho na area administrativa, principalmente com agendas e documentos.}}|{{My work is office yes.|Meu trabalho e escritorio sim.}}|1"
                },
                {
                    type: "interactive-quiz",
                    content: "Qual frase fala de interesse pessoal de forma mais conversavel?|{{I have hobby.|Eu tenho hobby.}}|{{When I'm not working, I usually cook and listen to podcasts.|Quando eu nao estou trabalhando, eu normalmente cozinho e escuto podcasts.}}|{{In free time yes things.|No tempo livre sim coisas.}}|1"
                },
                {
                    type: "micro-win",
                    content: "Voce terminou este modulo com uma virada importante: agora voce ja tem mais material para sustentar conversa sobre quem voce e, o que voce faz e como voce vive."
                }
            ]
        },
        {
            id: "p6-m4",
            title: "MODULO 4: OPINIAO, CONCORDANCIA E REACAO",
            subtitle: "Como reagir, concordar, discordar e dizer o que voce acha sem travar nem soar duro.",
            status: "locked",
            blocks: [
                {
                    type: "system-status",
                    content: "{{REACTION LAYER|CAMADA DE REACAO}}: {{ONLINE|ATIVA}}. {{Opinion engine loaded|Motor de opiniao carregado}}."
                },
                {
                    type: "h2",
                    content: "Conversa boa nao vive so de informacao. Ela tambem vive de reacao"
                },
                {
                    type: "paragraph",
                    content: "Depois de falar de voce, o proximo passo natural e reagir ao que o outro diz. E aqui muita gente cai em dois extremos: ou responde so com {{yes|sim}} e {{no|nao}}, ou tenta discordar de um jeito duro e escolar. O modulo de agora existe para ajustar esse meio."
                },
                {
                    type: "box-goal",
                    title: "Objetivo deste modulo",
                    content: "Ensinar voce a dar opiniao, pedir a opiniao do outro, concordar e discordar com mais naturalidade e mais tato."
                },
                {
                    type: "box-insight",
                    title: "Base da pesquisa",
                    content: "Aqui eu segui de perto materiais do British Council e Cambridge sobre {{opinions|opinioes}} e {{agreeing and disagreeing|concordar e discordar}}, alem dos descritores do CEFR para interacao em desacordo: clareza, confirmacao, respeito e reacao curta bem colocada."
                },
                {
                    type: "h3",
                    content: "4.1 Dar opiniao nao precisa soar como debate formal"
                },
                {
                    type: "paragraph",
                    content: "No cotidiano, sua opiniao costuma entrar em moldes simples. O British Council trabalha isso de forma bem direta: {{I think...|Eu acho...}}, {{I dont think...|Eu nao acho...}}, {{In my opinion...|Na minha opiniao...}}, {{For me...|Para mim...}}. O peso vem do que voce acrescenta depois, nao da frase parecer sofisticada."
                },
                {
                    type: "cards-grid",
                    content: [
                        "Opiniao simples|{{I think its a good idea.|Eu acho que e uma boa ideia.}}",
                        "Opiniao negativa limpa|{{I dont think thats the best option.|Eu nao acho que essa seja a melhor opcao.}}",
                        "Opiniao pessoal|{{For me, the morning is better.|Para mim, a manha e melhor.}}",
                        "Abrir espaco|{{What do you think?|O que voce acha?}}"
                    ]
                },
                {
                    type: "h3",
                    content: "4.2 Reagir bem vale quase tanto quanto opinar"
                },
                {
                    type: "paragraph",
                    content: "Nem toda resposta precisa trazer uma grande tese. As vezes o que faz a conversa andar e uma reacao curta, mas viva. Isso mostra que voce esta acompanhando e ajuda o outro a continuar."
                },
                {
                    type: "comparison",
                    content: [
                        "{{Yes.|Sim.}}|Entendivel, mas fraco e pouco social.",
                        "{{Yeah, I think youre right.|Sim, acho que voce tem razao.}}|Mais humano e mais conversavel.",
                        "{{No.|Nao.}}|Seco demais em varias situacoes.",
                        "{{I see what you mean, but Im not sure I agree.|Entendo o que voce quer dizer, mas nao tenho certeza se concordo.}}|Discorda sem quebrar o clima."
                    ]
                },
                {
                    type: "h3",
                    content: "4.3 Concordar e mais do que dizer {{I agree|eu concordo}}"
                },
                {
                    type: "paragraph",
                    content: "Concordancia boa costuma ter ao menos um pequeno reforco. O British Council usa bem esse movimento. Cambridge tambem trabalha a ideia de reconhecer se duas pessoas estao concordando ou nao dentro da conversa."
                },
                {
                    type: "table",
                    title: "Jeitos naturais de concordar",
                    content: [
                        "Funcao|Frase|Uso",
                        "Concordar direto|{{I agree.|Eu concordo.}}|quando a ideia ja esta clara",
                        "Concordar com reforco|{{I think youre right.|Acho que voce tem razao.}}|quando voce quer soar mais humano",
                        "Reconhecer um ponto|{{Youve got a point there.|Voce tem um ponto ai.}}|quando a fala do outro te convence em parte",
                        "Concordar com energia|{{Yeah, definitely.|Sim, com certeza.}}|para resposta mais viva"
                    ]
                },
                {
                    type: "h3",
                    content: "4.4 Discordar sem parecer ataque"
                },
                {
                    type: "paragraph",
                    content: "Discordar nao precisa virar confronto. O proprio material do British Council traz modelos uteis: {{I think I disagree.|Acho que eu discordo.}}, {{Dont get me wrong, but...|Nao me entenda mal, mas...}}, {{I see what you mean, but...|Entendo o que voce quer dizer, mas...}}. O segredo esta no amortecedor antes da discordancia."
                },
                {
                    type: "box-warning",
                    title: "Erro comum",
                    content: "Usar {{No, youre wrong.|Nao, voce esta errado.}} em conversa comum quase sempre pesa demais. Em muitos contextos, especialmente no trabalho, isso corta o clima sem necessidade."
                },
                {
                    type: "cards-grid",
                    content: [
                        "Discordar com tato|{{I see what you mean, but I prefer the other option.|Entendo o que voce quer dizer, mas eu prefiro a outra opcao.}}",
                        "Discordar leve|{{Im not sure I agree.|Nao tenho certeza se concordo.}}",
                        "Discordar com cuidado|{{Dont get me wrong, but I think its too expensive.|Nao me entenda mal, mas acho que esta caro demais.}}",
                        "Buscar a opiniao do outro|{{Do you agree?|Voce concorda?}}"
                    ]
                },
                {
                    type: "dialogue",
                    title: "Opiniao sem rigidez",
                    content: [
                        "Person A: {{I think remote work is better for everyone.|Eu acho que trabalho remoto e melhor para todo mundo.}}",
                        "You: {{I see what you mean.|Entendo o que voce quer dizer.}}",
                        "You: {{But for me, hybrid work is better.|Mas, para mim, o trabalho hibrido e melhor.}}",
                        "You: {{You still get flexibility, but its easier to stay connected to the team.|Voce ainda tem flexibilidade, mas fica mais facil manter conexao com a equipe.}}",
                        "Person A: {{Yeah, youve got a point there.|Sim, voce tem um ponto ai.}}"
                    ]
                },
                {
                    type: "h3",
                    content: "4.5 Quando voce nao quer parecer frio nem forcar concordancia"
                },
                {
                    type: "paragraph",
                    content: "Nem sempre voce vai concordar de verdade. E tambem nem sempre precisa entrar em confronto. Em varios casos, reconhecer a ideia do outro e marcar sua posicao ja resolve a conversa de forma madura."
                },
                {
                    type: "box-action",
                    title: "Formula simples para opiniao e desacordo",
                    content: "1) Reaja ao que ouviu.\n2) Diga sua opiniao em frase curta.\n3) Se discordar, use amortecedor antes do ponto principal.\n4) Se couber, explique em uma linha o motivo."
                },
                {
                    type: "scramble-exercise",
                    content: "{\"sentence\":\"I see what you mean, but I prefer the other option.\",\"translation\":\"Entendo o que voce quer dizer, mas eu prefiro a outra opcao.\"}"
                },
                {
                    type: "interactive-quiz",
                    content: "Qual frase expressa opiniao de forma simples e natural?|{{Opinion I have this.|Opiniao eu tenho isto.}}|{{I think this is a good idea.|Eu acho que esta e uma boa ideia.}}|{{This idea yes my opinion.|Esta ideia sim minha opiniao.}}|1"
                },
                {
                    type: "interactive-quiz",
                    content: "Qual resposta discorda com mais tato?|{{No, youre wrong.|Nao, voce esta errado.}}|{{I see what you mean, but Im not sure I agree.|Entendo o que voce quer dizer, mas nao tenho certeza se concordo.}}|{{Wrong idea.|Ideia errada.}}|1"
                },
                {
                    type: "interactive-quiz",
                    content: "Se voce quer pedir a opiniao da outra pessoa, qual pergunta funciona melhor?|{{What do you think?|O que voce acha?}}|{{Your opinion now?|Sua opiniao agora?}}|{{Speak your idea fast.|Fale sua ideia rapido.}}|0"
                },
                {
                    type: "micro-win",
                    content: "Voce fechou este modulo com mais controle social na conversa: agora ja da para reagir, concordar, discordar e sustentar ponto sem soar travado nem agressivo."
                }
            ]
        },
        {
            id: "p6-m5",
            title: "MODULO 5: HISTORIAS CURTAS E SITUACOES REAIS",
            subtitle: "Como contar o que aconteceu, explicar problema, atraso ou decisao e manter clareza.",
            status: "locked",
            blocks: [
                {
                    type: "system-status",
                    content: "{{STORY MODE|MODO HISTORIA}}: {{ONLINE|ATIVO}}. {{Narrative flow loaded|Fluxo narrativo carregado}}."
                },
                {
                    type: "h2",
                    content: "Em conversa real, voce nao fala so de opiniao. Voce tambem conta o que aconteceu"
                },
                {
                    type: "paragraph",
                    content: "Chega uma hora em que a conversa pede relato: um atraso, um erro, um problema, uma viagem, um episodio curioso, uma coisa que aconteceu ontem. Muita gente conhece as palavras soltas, mas se perde quando precisa organizar os fatos em sequencia. Este modulo resolve isso."
                },
                {
                    type: "box-goal",
                    title: "Objetivo deste modulo",
                    content: "Ensinar voce a contar historias curtas e explicar situacoes reais com ordem, clareza e ritmo, sem transformar tudo num caos de frases desconectadas."
                },
                {
                    type: "box-insight",
                    title: "Base da pesquisa",
                    content: "A linha aqui segue orientacoes do British Council para {{tell a story or personal anecdote|contar uma historia ou anedota pessoal}} e para {{dealing with a problem|lidar com um problema}}, alem de orientacoes de Cambridge sobre trabalhar narrativas pessoais dentro da conversacao."
                },
                {
                    type: "h3",
                    content: "5.1 Historia curta boa tem direcao, nao volume"
                },
                {
                    type: "paragraph",
                    content: "British Council sugere um caminho bem util: introducao curta, contexto, sequencia do que aconteceu e um fechamento. O erro mais comum e tentar colocar detalhe demais e perder o fio."
                },
                {
                    type: "table",
                    title: "Esqueleto simples de historia curta",
                    content: [
                        "Parte|Funcao|Exemplo",
                        "Abertura|dizer do que a historia trata|{{Something funny happened yesterday.|Uma coisa engracada aconteceu ontem.}}",
                        "Contexto|dar lugar, tempo ou situacao|{{I was on my way to work.|Eu estava indo para o trabalho.}}",
                        "Acao|dizer o que aconteceu|{{I got on the wrong bus.|Eu peguei o onibus errado.}}",
                        "Fechamento|mostrar resultado ou importancia|{{I was late, but I learned to double-check the number.|Eu me atrasei, mas aprendi a conferir o numero duas vezes.}}"
                    ]
                },
                {
                    type: "h3",
                    content: "5.2 Sequencia importa mais do que sofisticacao"
                },
                {
                    type: "paragraph",
                    content: "Voce nao precisa contar historia com linguagem literaria. Precisa marcar a ordem dos fatos. British Council recomenda palavras simples de sequencia porque elas ajudam o ouvinte a seguir voce sem cansaco."
                },
                {
                    type: "cards-grid",
                    content: [
                        "Comeco|{{First|Primeiro}} / {{At first|No comeco}}",
                        "Passo seguinte|{{Then|Depois}} / {{After that|Depois disso}}",
                        "Virada|{{So|Entao}} / {{Because|Porque}} / {{Although|Embora}}",
                        "Fechamento|{{In the end|No fim}} / {{Finally|Finalmente}}"
                    ]
                },
                {
                    type: "comparison",
                    content: [
                        "{{Yesterday bus wrong late problem.|Ontem onibus errado atraso problema.}}|Joga palavras, mas nao conduz o ouvinte.",
                        "{{Yesterday, I got on the wrong bus, so I was late for work.|Ontem, eu peguei o onibus errado, entao me atrasei para o trabalho.}}|Curta, clara e suficiente.",
                        "{{I tell one story and many things and another thing and then another thing.|Eu conto uma historia e muitas coisas e outra coisa e depois outra coisa.}}|Fala sem trilho.",
                        "{{First I missed the bus, then I took the wrong one, and in the end I arrived late.|Primeiro eu perdi o onibus, depois peguei o errado, e no fim cheguei atrasado.}}|Ordem limpa."
                    ]
                },
                {
                    type: "h3",
                    content: "5.3 Explicar problema sem dramatizar demais"
                },
                {
                    type: "paragraph",
                    content: "Conversa adulta tambem pede saber dizer que algo deu errado. O material do British Council sobre problemas ajuda muito porque mostra o valor de frases simples como {{I've got a bit of a problem.|Estou com um pequeno problema.}}, {{I've made a mistake.|Cometi um erro.}} e {{I'm sure we can work it out.|Tenho certeza de que podemos resolver isso.}}"
                },
                {
                    type: "dialogue",
                    title: "Problema real, explicado com ordem",
                    content: [
                        "You: {{I've got a bit of a problem.|Estou com um pequeno problema.}}",
                        "Person B: {{Whats wrong?|O que houve?}}",
                        "You: {{I made a mistake with the meeting time.|Eu cometi um erro com o horario da reuniao.}}",
                        "You: {{I wrote down 3:30 instead of 2:30.|Eu anotei 3:30 em vez de 2:30.}}",
                        "You: {{So I missed the start of the meeting.|Entao eu perdi o comeco da reuniao.}}",
                        "Person B: {{Dont worry, these things happen.|Nao se preocupe, essas coisas acontecem.}}"
                    ]
                },
                {
                    type: "box-warning",
                    title: "O que enfraquece sua historia",
                    content: "Falar sem ordem, encher de detalhe que nao move a cena, e nao deixar claro qual foi o problema principal. Historia curta boa anda."
                },
                {
                    type: "h3",
                    content: "5.4 Quando a historia precisa soar humana, nao teatral"
                },
                {
                    type: "paragraph",
                    content: "Uma pequena reacao deixa o relato mais natural. Voce nao precisa dramatizar. Basta mostrar o impacto do que aconteceu."
                },
                {
                    type: "cards-grid",
                    content: [
                        "Surpresa|{{I couldnt believe it.|Eu nao podia acreditar.}}",
                        "Frustracao leve|{{It was really frustrating.|Foi bem frustrante.}}",
                        "Alivio|{{I felt much better after that.|Eu me senti bem melhor depois disso.}}",
                        "Aprendizado|{{Now I always double-check.|Agora eu sempre confiro duas vezes.}}"
                    ]
                },
                {
                    type: "box-action",
                    title: "Formula simples para historia e problema",
                    content: "1) Abra com o fato principal.\n2) Diga quando ou onde aconteceu.\n3) Mostre a sequencia do que houve.\n4) Feche com resultado, reacao ou aprendizado."
                },
                {
                    type: "scramble-exercise",
                    content: "{\"sentence\":\"I wrote down the wrong time, so I missed the meeting.\",\"translation\":\"Eu anotei o horario errado, entao perdi a reuniao.\"}"
                },
                {
                    type: "interactive-quiz",
                    content: "Qual frase conta um problema de forma mais clara?|{{Meeting wrong time problem.|Reuniao horario errado problema.}}|{{I wrote down the wrong time, so I missed the meeting.|Eu anotei o horario errado, entao perdi a reuniao.}}|{{I problem meeting yes.|Eu problema reuniao sim.}}|1"
                },
                {
                    type: "interactive-quiz",
                    content: "Qual grupo ajuda mais a dar ordem a uma historia curta?|{{Blue, table, fast.|Azul, mesa, rapido.}}|{{First, then, after that, in the end.|Primeiro, depois, depois disso, no fim.}}|{{Yes, no, maybe, okay.|Sim, nao, talvez, ok.}}|1"
                },
                {
                    type: "interactive-quiz",
                    content: "Se voce quer abrir um relato de problema no trabalho, qual frase funciona melhor?|{{Ive got a bit of a problem.|Estou com um pequeno problema.}}|{{Problem came full total.|Problema veio cheio total.}}|{{My issue existsly.|Meu problema existe.}}|0"
                },
                {
                    type: "micro-win",
                    content: "Voce terminou este modulo com uma habilidade que pesa muito na vida real: agora voce ja consegue explicar o que aconteceu com mais ordem, mais calma e mais clareza."
                }
            ]
        },
        {
            id: "p6-m6",
            title: "MODULO 6: CONVERSA ENCADEADA",
            subtitle: "Como juntar resposta, small talk, opiniao e historia para sustentar conversa mais longa.",
            status: "locked",
            blocks: [
                {
                    type: "system-status",
                    content: "{{CHAINED CONVERSATION|CONVERSA ENCADEADA}}: {{ONLINE|ATIVA}}. {{Integration stage armed|Etapa de integracao armada}}."
                },
                {
                    type: "h2",
                    content: "Agora voce para de treinar pecas soltas e comeca a conduzir conversa inteira"
                },
                {
                    type: "paragraph",
                    content: "A partir daqui, o foco nao e mais uma habilidade isolada. E a costura. Responder, puxar assunto, falar de voce, reagir, contar um fato e voltar para o outro sem perder o fio. E isso que faz a conversa deixar de parecer exercicio."
                },
                {
                    type: "box-goal",
                    title: "Objetivo deste modulo",
                    content: "Juntar tudo o que entrou no Pilar 6 em conversas mais longas, com mais continuidade, mais retomada e mais presenca."
                },
                {
                    type: "box-insight",
                    title: "Base da pesquisa",
                    content: "Cambridge destaca que {{talk as interaction|falar como interacao}} e uma habilidade complexa, melhor ensinada com dialogos naturais, abertura, fechamento, relatos pessoais e reacao ao que o outro diz. Este modulo fecha exatamente essa costura."
                },
                {
                    type: "h3",
                    content: "6.1 Conversa encadeada nao e falar sem parar"
                },
                {
                    type: "paragraph",
                    content: "Sustentar conversa nao significa monopolizar a fala. Significa fazer a troca continuar. Isso inclui abrir, responder, devolver, comentar, conectar com algo anterior e saber encerrar."
                },
                {
                    type: "table",
                    title: "As pecas do encadeamento",
                    content: [
                        "Peca|Funcao|Exemplo",
                        "Abrir|iniciar a troca|{{Hows your week going?|Como esta indo sua semana?}}",
                        "Responder|entregar conteudo|{{Its been busy, actually.|Tem sido corrida, na verdade.}}",
                        "Expandir|nao deixar a fala morrer|{{Im finishing a big project at work.|Estou terminando um projeto grande no trabalho.}}",
                        "Devolver|manter a conversa nos dois lados|{{How about you?|E voce?}}",
                        "Retomar|conectar com algo anterior|{{You mentioned travel earlier. Where did you go?|Voce mencionou viagem antes. Onde voce foi?}}",
                        "Fechar|encerrar bem|{{It was great talking to you.|Foi otimo falar com voce.}}"
                    ]
                },
                {
                    type: "h3",
                    content: "6.2 O melhor sinal de conversa viva: desenvolvimento"
                },
                {
                    type: "paragraph",
                    content: "Cambridge usa muito a ideia de {{development of the interaction|desenvolvimento da interacao}}. Traduzindo para o nosso jogo: nao basta responder o minimo. Voce mostra que esta construindo junto quando diz um pouco mais, faz follow-up e usa pistas do que ja apareceu."
                },
                {
                    type: "comparison",
                    content: [
                        "{{Fine. You?|Bem. E voce?}}|Funciona, mas fica no nivel minimo.",
                        "{{Pretty good. Ive been busy with work, but its going well. How about you?|Bem boa. Tenho estado ocupado com trabalho, mas esta indo bem. E voce?}}|Ja cria espaco de continuidade.",
                        "{{Okay.|Ok.}} -> fim|A conversa apaga rapido.",
                        "{{Really? You said you were traveling last week. How was that?|Serio? Voce falou que ia viajar semana passada. Como foi?}}|Retoma, conecta e desenvolve."
                    ]
                },
                {
                    type: "h3",
                    content: "6.3 O protocolo de retomada"
                },
                {
                    type: "paragraph",
                    content: "Quando a conversa comeca a perder forca, voce nao precisa entrar em panico. Retomar algo que a pessoa acabou de dizer ou algo que apareceu antes quase sempre salva o fluxo."
                },
                {
                    type: "cards-grid",
                    content: [
                        "Retomar detalhe recente|{{You mentioned a new project. Hows that going?|Voce mencionou um projeto novo. Como esta indo?}}",
                        "Puxar experiencia|{{What happened after that?|O que aconteceu depois disso?}}",
                        "Conectar com gosto|{{You said you like hiking. Do you go often?|Voce falou que gosta de trilha. Voce vai com frequencia?}}",
                        "Reabrir com clima leve|{{By the way, how was your weekend?|A proposito, como foi seu fim de semana?}}"
                    ]
                },
                {
                    type: "dialogue",
                    title: "Conversa mais longa, sem parecer ensaio",
                    content: [
                        "You: {{Hows your week going so far?|Como esta indo sua semana ate agora?}}",
                        "Person B: {{Pretty busy, to be honest. Im finishing a project.|Bem corrida, para ser sincero. Estou terminando um projeto.}}",
                        "You: {{Oh, nice. What kind of project is it?|Ah, legal. Que tipo de projeto e?}}",
                        "Person B: {{Its a website redesign for a client.|E um redesign de site para um cliente.}}",
                        "You: {{That sounds interesting.|Parece interessante.}}",
                        "You: {{Do you usually work on projects like that?|Voce costuma trabalhar em projetos assim?}}",
                        "Person B: {{Yeah, quite often.|Sim, com bastante frequencia.}}",
                        "You: {{Nice. I work with clients too, so I know how intense that can be.|Legal. Eu tambem trabalho com clientes, entao sei como isso pode ser intenso.}}"
                    ]
                },
                {
                    type: "h3",
                    content: "6.4 Saber voltar para voce sem sequestrar a conversa"
                },
                {
                    type: "paragraph",
                    content: "Conversar bem nao e so perguntar. Tambem e compartilhar. A chave e nao transformar tudo em monologo. Comente algo seu que tenha relacao com o que o outro disse, e depois devolva de novo se fizer sentido."
                },
                {
                    type: "box-warning",
                    title: "Dois erros classicos no fechamento do pilar",
                    content: "Ficar so entrevistando o outro sem se expor nunca, ou falar tanto de si que o outro some da conversa. Encadeamento bom alterna."
                },
                {
                    type: "box-action",
                    title: "Formula de conversa encadeada",
                    content: "1) Abra.\n2) Responda com algo real.\n3) Acrescente um detalhe.\n4) Puxe follow-up ou retomada.\n5) Compartilhe algo relacionado.\n6) Feche com educacao quando a troca acabar."
                },
                {
                    type: "scramble-exercise",
                    content: "{\"sentence\":\"You mentioned a new project. How's that going?\",\"translation\":\"Voce mencionou um projeto novo. Como isso esta indo?\"}"
                },
                {
                    type: "interactive-quiz",
                    content: "Qual resposta mostra melhor desenvolvimento da interacao?|{{Fine.|Bem.}}|{{Pretty good. Ive been busy with work, but its going well. How about you?|Bem boa. Tenho estado ocupado com trabalho, mas esta indo bem. E voce?}}|{{Week yes.|Semana sim.}}|1"
                },
                {
                    type: "interactive-quiz",
                    content: "Se a conversa esta esfriando, qual retomada ajuda mais?|{{Silence.|Silencio.}}|{{You mentioned travel earlier. Where did you go?|Voce mencionou viagem antes. Onde voce foi?}}|{{Random price question.|Pergunta aleatoria sobre preco.}}|1"
                },
                {
                    type: "interactive-quiz",
                    content: "Qual atitude conversa melhor com o que este modulo quer fechar?|{{Answer only the minimum forever.|Responder so o minimo para sempre.}}|{{Alternate between answering, reacting, asking and connecting.|Alternar entre responder, reagir, perguntar e conectar.}}|{{Talk without listening.|Falar sem ouvir.}}|1"
                },
                {
                    type: "box-insight",
                    title: "O ganho central deste pilar",
                    content: "Voce saiu do modo frase solta e entrou no modo conversa. Isso nao significa fluencia total. Significa algo muito mais valioso nesta etapa: presenca, continuidade e capacidade de se manter vivo dentro da interacao."
                },
                {
                    type: "pillar-end",
                    title: "Conversacao pratica consolidada",
                    content: "Voce fechou o Pilar 6 com um salto importante. Agora ja da para entrar numa conversa, falar de voce, reagir ao outro, contar um fato, explicar um problema e manter o fluxo com mais naturalidade. O proximo passo ja nao e apenas sobreviver em ingles. E comecar a soar cada vez mais funcional, presente e convincente."
                }
            ]
        }
    ]
};

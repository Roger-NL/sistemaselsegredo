import type { AudioId } from "@/features/demo/model/types";

export type PracticeGap = { before: string; after: string; meaning: string; answers: string[]; feedback?: string };
export type Practice = { hint: string; feedback?: Record<string, string>; context?: { text: string; meaning: string }[]; instruction?: string } & (
  | { kind: "choice"; prompt: string; options: string[]; answer: string; explanation: string; placement?: { cue: string } }
  | { kind: "order"; prompt: string; tokens: string[]; distractors?: string[]; answer: string; explanation: string }
  | { kind: "write"; prompt: string; answers: string[]; gaps?: PracticeGap[]; explanation: string });

export type StudyStep = {
  id: string;
  title: string;
  goal: string;
  mode: "explain" | "practice";
  why: string;
  examples?: { text: string; meaning: string; note?: string }[];
  phrase: string;
  meaning: string;
  storyAudio: { id: AudioId; scope: "full" | "excerpt" }[];
  body: string;
  detail: string;
  practice: Practice;
};

export type Lesson = { id: string; title: string; description: string; steps: StudyStep[] };

export const lessons: Lesson[] = [
  {
    id: "pertencimento", title: "De quem é?", description: "Aponte, pergunte e reconheça o que é seu.",
    steps: [
      {
        id: "this-yours", title: "Uma pergunta no balcão", phrase: "Is this yours?", meaning: "Esse café é seu?",
        mode: "explain",
        why: "This aponta para o objeto; yours diz de quem ele é sem repetir o nome. Is vem antes de this porque você está fazendo uma pergunta.",
        examples: [{ text: "This is yours.", meaning: "Isto é seu.", note: "afirmação" }, { text: "Is this yours?", meaning: "Isto é seu?", note: "pergunta" }],
        goal: "Entenda quando alguém quer saber se um objeto é seu.",
        storyAudio: [{"id": "C01", "scope": "full"}],
        body: "Use Is this yours? para conferir a quem pertence um objeto. This aponta para o objeto à vista; yours indica ‘seu’ ou ‘sua’ sem repetir o nome dele. Na cena do copo, a pergunta fica natural como ‘Esse café é seu?’.",
        detail: "Exemplo novo: alguém deixou uma caneta na mesa. Você aponta e pergunta Is this yours? — ‘Esta é sua?’. A frase continua funcionando porque o objeto está claro. Compare a ordem: This is yours. afirma ‘Isto é seu’; Is this yours? faz a pergunta.",
        practice: { kind: "choice", prompt: "Alguém aponta um copo e pergunta ‘Is this yours?’. O que quer saber?", options: ["Se você gosta do café.", "Se o copo é seu.", "Se você quer sair."], answer: "Se o copo é seu.", explanation: "Is this yours? pergunta se o objeto pertence à pessoa que está ouvindo. Yours já representa ‘seu copo’ nesta cena, por isso não é preciso dizer coffee de novo.", feedback: {"Se você gosta do café.": "Essa seria uma pergunta sobre gosto, como Do you like it? Aqui, yours fala de pertencimento: Lucas quer conferir de quem é o copo.", "Se você quer sair.": "A pergunta aponta para um objeto, não para uma decisão de sair. Yours se dirige à pessoa que está ouvindo: ‘Esse objeto é seu?’."} , hint: "Lucas aponta para um objeto e quer saber de quem ele é. Yours se refere à pessoa com quem ele está falando."},
      },
      {
        id: "mine-your", title: "Meu, seu — sem repetir", phrase: "Oh! This is mine.", meaning: "Ah! Este é meu.",
        mode: "practice",
        why: "My e your acompanham coffee. Mine e yours substituem esse conjunto quando o objeto já está claro; por isso, não repetimos coffee depois deles.",
        examples: [{ text: "my coffee / your coffee", meaning: "meu café / seu café", note: "com o nome" }, { text: "mine / yours", meaning: "o meu / o seu", note: "sem repetir coffee" }],
        goal: "Diga de quem é o café, com ou sem repetir a palavra coffee.",
        storyAudio: [{"id": "C05", "scope": "full"}],
        body: "Pense no que vem depois da palavra. Em my coffee, my acompanha coffee: ‘meu café’. Se o copo já está claro, mine basta: ‘o meu’. O mesmo vale para your coffee e yours: ‘seu café’ e ‘o seu’.\nNa fala de Lucas, mine identifica o copo dele, porque é ele quem está falando.",
        detail: "Exemplos novos com o mesmo objeto:\nThis is my coffee. — Este é meu café.\nThis is mine. — Este é meu.\nIs this your coffee? — Este é seu café?\nIs this yours? — Este é seu?\nMy e your acompanham coffee; mine e yours permitem deixá-lo de fora. Yours se escreve sem apóstrofo.",
        practice: {"kind": "write", "prompt": "Exemplo novo: escreva a forma de “meu” ou “seu” diretamente em cada frase.", "answers": ["my mine your yours"], hint: "Primeiro olhe o sentido: meu ou seu? Depois veja se coffee vem logo após a lacuna. Antes de coffee, use my ou your; sem repetir coffee, use mine ou yours.", "explanation": "Com o nome: my coffee = meu café; your coffee = seu café.\nSem repetir o nome: mine = o meu; yours = o seu.\nOlhe cada frase: a tradução indica de quem é o café, e a presença de coffee mostra qual forma cabe.", gaps: [{"before": "This is ", "after": " coffee.", "meaning": "Este é meu café.", "answers": ["my"], feedback: "Aqui, coffee vem depois da lacuna e a tradução diz ‘meu café’. Use a forma que acompanha o nome: my coffee."}, {"before": "It is ", "after": ".", "meaning": "É meu.", "answers": ["mine"], feedback: "O nome coffee já ficou entendido. Mine representa ‘o meu café’ inteiro: It is mine. — É meu."}, {"before": "Is this ", "after": " coffee?", "meaning": "Este é seu café?", "answers": ["your"], feedback: "A tradução diz ‘seu café’ e coffee vem depois da lacuna. Use a forma que acompanha o nome: your coffee."}, {"before": "Is it ", "after": "?", "meaning": "É seu?", "answers": ["yours"], feedback: "A pergunta não repete coffee. Yours já representa ‘o seu café’: Is it yours? — É seu?"}]},
      },
      {
        id: "its-not", title: "Confirmar ou corrigir", phrase: "No, it's not mine.", meaning: "Não, não é meu.",
        mode: "explain",
        why: "It's reúne it is. Not nega a ideia: o copo não é meu. O no responde à pergunta; not faz a negativa dentro da frase.",
        examples: [{ text: "It's mine.", meaning: "É meu.", note: "confirma" }, { text: "It's not mine.", meaning: "Não é meu.", note: "corrige o engano" }],
        goal: "Corrija um engano sobre o copo com uma frase curta.",
        storyAudio: [{"id": "U01", "scope": "full"}],
        body: "Para corrigir o engano sobre o copo, diga No, it's not mine. — ‘Não, não é meu’. It's é a forma curta de it is. A palavra not muda ‘é meu’ para ‘não é meu’. O no inicial responde à pergunta.",
        detail: "Compare as respostas: Yes, it's mine. confirma que o copo é seu; No, it's not mine. corrige o engano. It is not mine. e It isn't mine. também expressam a negativa. Você encontra formas diferentes, mas o sentido de pertencimento continua o mesmo.",
        practice: { kind: "write", prompt: "Complete a frase para corrigir o engano sobre o copo.", answers: ["not"], hint: "Você quer corrigir o engano: o copo não é seu. A palavra que nega a frase entra depois de is, antes de mine.", explanation: "A lacuna recebe not: No, it's not mine. — ‘Não, não é meu’. O no responde à pergunta; o not, depois de is, torna negativa a informação sobre o copo." , gaps: [{"before": "No, it's ", "after": " mine.", "meaning": "Não, não é meu.", "answers": ["not"], feedback: "Você quer dizer ‘não é meu’. Not faz essa mudança dentro da frase: it's not mine. Complete só a palavra que falta."}]},
      },
    ],
  },
  {
    id: "pedido", title: "O que você pediu?", description: "Fale do pedido e devolva a pergunta.",
    steps: [
      {
        id: "did-order", title: "Um pedido que já aconteceu", phrase: "What did you order?", meaning: "O que você pediu?",
        mode: "practice",
        why: "Did já marca o passado da pergunta. Por isso, o verbo seguinte fica na forma básica order; usar ordered repetiria a marca de passado.",
        examples: [{ text: "I ordered a coffee.", meaning: "Pedi um café.", note: "ordered marca o passado · exemplo novo" }, { text: "What did you order?", meaning: "O que você pediu?", note: "did marca o passado" }],
        goal: "Pergunte o que a outra pessoa pediu usando did e order.",
        storyAudio: [{"id": "U02", "scope": "full"}],
        body: "O pedido já foi feito. What did you order? pergunta qual foi a comida ou bebida escolhida: ‘O que você pediu?’. What pergunta ‘o quê’, e order é ‘pedir’ neste contexto. Did situa a pergunta no passado; por isso, order vem sem -ed.",
        detail: "Compare com um exemplo novo: I ordered a coffee. — ‘Pedi um café’. Na afirmação, ordered marca o passado. Na pergunta What did you order?, did já faz esse trabalho, e o outro verbo fica como order. É uma pergunta sobre o pedido feito, não uma oferta para pedir agora.",
        practice: { kind: "order", prompt: "Pergunte: “O que você pediu?”", tokens: ["order?", "you", "What", "did"], distractors: ["ordered?"], answer: "What did you order?", explanation: "What did you order? = ‘O que você pediu?’. Did já marca o passado da pergunta, por isso a peça é order, sem -ed. A sequência é What + did + you + order." , hint: "Did já mostra que o pedido aconteceu. Depois dele, use o verbo order sem -ed. A pergunta começa com What did you…"},
      },
      {
        id: "iced-coffee", title: "Uma bebida, poucas palavras", phrase: "An iced coffee.", meaning: "Um café com gelo.",
        mode: "explain",
        why: "An acompanha iced porque essa palavra começa com som de vogal. O artigo depende do som logo depois dele, mesmo que coffee venha em seguida.",
        examples: [{ text: "an iced coffee", meaning: "um café com gelo", note: "iced começa com som de vogal" }, { text: "a coffee", meaning: "um café", note: "coffee começa com som de consoante" }],
        goal: "Reconheça uma resposta simples sobre o pedido de bebida.",
        storyAudio: [{"id": "C03", "scope": "excerpt"}],
        body: "An iced coffee. é uma resposta curta e suficiente sobre o pedido: ‘Um café com gelo’. Iced descreve o tipo de bebida. O artigo vem logo antes dessa palavra, então escolhemos an pelo som de vogal no começo de iced, mesmo que coffee venha depois.",
        detail: "Compare estes exemplos: an iced coffee — um café com gelo; a coffee — um café. O artigo acompanha o primeiro som da palavra seguinte. Aqui, a coffee é uma porção ou um copo da bebida. Sweet, em It's sweet., descreve o sabor doce, não a temperatura.",
        practice: {"kind": "choice", "prompt": "Exemplos novos: qual par completa “___ iced coffee / ___ coffee”? Escolha pelo som inicial da palavra seguinte.", "options": ["a / an", "an / a", "an / an"], "answer": "an / a", "explanation": "O par é an / a: an iced coffee e a coffee. O que conta é o som da palavra logo após o artigo: vogal em iced, consoante em coffee.", "feedback": {"a / an": "Os artigos ficaram trocados. Em iced coffee, escute primeiro iced, que começa com som de vogal: an iced coffee. Em coffee, o som inicial pede a.", "an / an": "An combina com o som inicial de iced. Na segunda expressão, a palavra seguinte é coffee, com som de consoante: a coffee."}, hint: "Ouça o começo da palavra seguinte: iced tem som de vogal, então combina com an. Coffee tem som de consoante, então combina com a."},
      },
      {
        id: "and-you", title: "A conversa vai e volta", phrase: "An iced coffee. And you?", meaning: "Um café com gelo. E você?",
        mode: "explain",
        why: "And you? devolve a pergunta à outra pessoa. A conversa já deixou o assunto claro; por isso, essas duas palavras substituem a pergunta inteira.",
        examples: [{ text: "I'm tired. And you?", meaning: "Estou cansado. E você?", note: "pergunta como a pessoa está · exemplo novo" }, { text: "I like coffee. And you?", meaning: "Gosto de café. E você?", note: "pergunta sobre gosto · exemplo novo" }],
        goal: "Devolva a pergunta para manter a conversa andando.",
        storyAudio: [{"id": "C03", "scope": "full"}],
        body: "And you? passa a vez à outra pessoa: ‘E você?’. Numa conversa sobre pedidos, você conta o que pediu e devolve a mesma pergunta com essas duas palavras. O assunto já está claro, por isso não é preciso repetir What did you order?",
        detail: "O sentido acompanha o assunto. Exemplo novo: I'm tired. And you? pergunta como a outra pessoa está. Já I like coffee. And you? devolve uma pergunta sobre gostar de café. A expressão é curta porque as duas pessoas conseguem recuperar a pergunta pela conversa.",
        practice: { kind: "write", prompt: "Escreva a expressão de duas palavras que significa ‘E você?’", answers: ["And you?", "And you"], hint: "Você já contou seu pedido e quer devolver a pergunta. And liga as falas; acrescente a palavra que significa “você”.", explanation: "And you? significa ‘E você?’ e devolve a pergunta sobre o assunto atual. Depois de falar do pedido, é um jeito simples de convidar a outra pessoa a contar o dela." },
      },
    ],
  },
  {
    id: "reacoes", title: "Reagir com naturalidade", description: "Surpresa, concordância, cuidado e gentileza.",
    steps: [
      {
        id: "really-too", title: "Sério? Eu também!", phrase: "Really? Me too!", meaning: "Sério? Eu também!",
        mode: "explain",
        why: "Really? mostra surpresa ou interesse. Depois de “I like it.”, Me too. diz “eu também gosto”, retomando a ideia sem repetir a frase.",
        goal: "Mostre que você compartilha o gosto da outra pessoa.",
        storyAudio: [{"id": "C08", "scope": "full"}],
        body: "Really? mostra surpresa ou interesse: ‘Sério?’. Me too. acrescenta que a mesma ideia também vale para você. Depois de I like it., Me too. quer dizer ‘Eu também gosto’. Você pode mostrar interesse, compartilhar a opinião ou fazer as duas coisas.",
        detail: "Os caminhos da história usam Me too. para retomar tanto ‘também pedi isso’ quanto ‘também estou cansado’; você pode ter percorrido apenas um deles. Not really. suaviza uma negativa: ‘Não muito’. Para concordar com uma negativa, um exemplo novo é I don't like it. — Me neither. Really? também pode expressar dúvida, conforme o tom.",
        practice: { placement: { cue: "Lucas: “I like it.”" }, kind: "choice", prompt: "Diga “eu também”.", options: ["Not really.", "Really?", "Me too."], answer: "Me too.", explanation: "Me too. retoma I like it.: ‘Eu também gosto’. Really? mostra interesse ou surpresa, mas sozinho não informa se você compartilha a opinião.", feedback: {"Not really.": "Not really. comunica ‘Não muito’. Como nesta situação você também gosta da bebida, a resposta precisa compartilhar a opinião positiva.", "Really?": "Really? funciona para mostrar surpresa ou interesse. Para dizer que você também gosta, falta a ideia de ‘eu também’: Me too."} , hint: "A pessoa gosta da bebida e você também. Escolha a resposta que compartilha essa opinião. Mostrar surpresa, sozinho, não diz que você concorda."},
      },
      {
        id: "sorry-okay", title: "Pequenas gentilezas", phrase: "Oh! Sorry! — It's okay.", meaning: "Ah! Desculpa! — Tudo bem.",
        mode: "explain",
        why: "Sorry! reconhece um engano. It's okay. recebe a desculpa e tranquiliza a outra pessoa; por isso, cada expressão pertence a um lado dessa troca.",
        goal: "Receba uma desculpa e tranquilize a outra pessoa.",
        storyAudio: [{"id": "C02", "scope": "full"}, {"id": "U03", "scope": "full"}],
        body: "Sorry! pede desculpas por um engano. It's okay. recebe a desculpa e tranquiliza: ‘Tudo bem’. Uma pessoa reconhece o problema; a outra mostra que podem seguir com a conversa. São falas pequenas, mas cada uma faz uma coisa diferente.",
        detail: "Exemplo novo: alguém esbarra em você e diz Sorry! Você responde It's okay. para mostrar que está tudo bem. Se alguém ajuda você, Thanks! ou Thank you. agradece essa ajuda. Oh! marca uma reação, e Oh, okay. também pode indicar ‘Ah, entendi’, conforme a situação.",
        practice: { placement: { cue: "Lucas: “Sorry!”" },"kind": "choice", "prompt": "Diga que está tudo bem.", "options": ["It's okay.", "Sorry!", "Thanks!"], "answer": "It's okay.", "explanation": "It's okay. = ‘Tudo bem’. É uma resposta à desculpa que tranquiliza Lucas e permite continuar a conversa sem transformar o engano num problema maior.", "feedback": {"Sorry!": "Sorry! é a fala de quem pede desculpas. Lucas já fez isso; agora você quer tranquilizá-lo. It's okay. comunica ‘Tudo bem’.", "Thanks!": "Thanks! agradece uma ajuda ou gentileza. Aqui você quer receber a desculpa e dizer que o engano não foi um problema: It's okay."}, hint: "A pessoa já pediu desculpas pelo engano. Você quer responder “Tudo bem”, para ela saber que não houve problema."},
      },
      {
        id: "careful-close", title: "Reagir ao momento", phrase: "Careful! — That was close.", meaning: "Cuidado! — Foi por pouco.",
        mode: "practice",
        why: "Careful! avisa enquanto ainda há risco. That was close. comenta o susto depois que o perigo passou; a escolha muda conforme o momento da cena.",
        examples: [{ text: "Careful!", meaning: "Cuidado!", note: "o copo ainda pode cair" }, { text: "That was close.", meaning: "Foi por pouco.", note: "o copo já está seguro" }],
        goal: "Escolha a fala que ajuda enquanto o copo ainda corre risco.",
        storyAudio: [{"id": "U08", "scope": "full"}, {"id": "C11", "scope": "full"}],
        body: "Careful! é um aviso: ‘Cuidado!’. Use quando ainda há risco, como um copo prestes a cair. Depois que o risco passa, That was close. comenta o susto: ‘Foi por pouco’. A diferença principal é o momento em que cada fala ajuda.",
        detail: "Em That was close., a ideia é chegar perto de algo ruim acontecer; was se refere ao momento que passou. Outras reações têm funções diferentes: Nice! é ‘Legal!’, e Lucky you! pode reconhecer uma vantagem da outra pessoa, como ‘Que sorte a sua!’. O tom pode tornar essa última fala simpática ou irônica.",
        practice: { kind: "choice", prompt: "O copo está caindo. Como você avisa?", options: ["Nice!", "That was close.", "Careful!"], answer: "Careful!", explanation: "Careful! avisa enquanto ainda é possível evitar o acidente. That was close. cabe depois, quando o copo já está seguro e você comenta que foi por pouco.", feedback: {"Nice!": "Nice! reage positivamente a algo, como ‘Legal!’. Para chamar atenção ao risco de o copo cair, você precisa de um aviso: Careful!", "That was close.": "That was close. comenta um risco que já passou. Nesta cena o copo ainda pode cair, então a fala adequada é o aviso Careful!"} , hint: "O copo ainda está caindo. Você precisa avisar agora; a frase de alívio só combina depois que o risco passou."},
      },
    ],
  },
  {
    id: "gostar", title: "Do que você gosta?", description: "Dê sua opinião e descubra a da outra pessoa.",
    steps: [
      {
        id: "like-it", title: "Uma opinião simples", phrase: "I like it.", meaning: "Eu gosto disso.",
        mode: "explain",
        why: "It retoma o assunto conhecido, como a bebida. Like se liga diretamente a ele; por isso, não copiamos o “de” de “gostar de” do português.",
        examples: [{ text: "I like coffee.", meaning: "Eu gosto de café.", note: "nomeia a bebida · exemplo novo" }, { text: "I like it.", meaning: "Eu gosto disso.", note: "retoma a bebida" }],
        goal: "Conte que você gosta de algo com três palavras.",
        storyAudio: [{"id": "U06", "scope": "full"}],
        body: "I like it. dá uma opinião simples: ‘Eu gosto’. It retoma o assunto que já está claro, como o café. Em português dizemos ‘gostar de’; nesta frase em inglês, like se liga diretamente a it. Você não precisa repetir o nome da bebida.",
        detail: "Exemplo novo: alguém oferece uma bebida, você experimenta e diz I like it. A pessoa entende de que você gosta porque a bebida já é o assunto. Para essa preferência, use I like, sem am. It também pode retomar outro assunto singular, como o trabalho.",
        practice: { kind: "order", prompt: "Diga: “Eu gosto disso.”", tokens: ["it.", "I", "like"], distractors: ["am", "of"], answer: "I like it.", explanation: "I like it. = ‘Eu gosto’. A frase junta I + like + it. Am não acompanha like nesta preferência, e não entra of para copiar o ‘de’ do português." , hint: "Comece por I, a pessoa que fala. Depois de like, coloque diretamente aquilo de que você gosta: it. As peças am e of não entram nesta frase."},
      },
      {
        id: "do-you-like", title: "Da opinião à pergunta", phrase: "Do you like your job?", meaning: "Você gosta do seu trabalho?",
        mode: "practice",
        why: "Do ajuda a transformar a opinião em pergunta e vem antes de you. Depois de like, você coloca o assunto sobre o qual quer saber.",
        examples: [{ text: "You like this café.", meaning: "Você gosta desta cafeteria.", note: "afirmação · exemplo novo" }, { text: "Do you like this café?", meaning: "Você gosta desta cafeteria?", note: "pergunta · exemplo novo" }],
        goal: "Transforme o assunto em uma pergunta sobre a cafeteria.",
        storyAudio: [{"id": "U12", "scope": "full"}],
        body: "Do you like…? pergunta sobre o gosto da outra pessoa. Do ajuda a formar a pergunta; aqui não significa ‘fazer’. Depois, você diz o assunto: your job é ‘seu trabalho’; this café é ‘esta cafeteria’. O começo se mantém, e você troca o final para perguntar sobre outra coisa.",
        detail: "Exemplo novo: You like this café. afirma ‘Você gosta desta cafeteria’. Do you like this café? transforma a ideia em pergunta. Uma resposta curta possível é Yes, I do. A forma Yeah, I like it. também responde naturalmente e deixa explícita a opinião.",
        practice: { kind: "order", prompt: "Pergunte: “Você gosta desta cafeteria?”", tokens: ["this", "like", "café?", "Do", "you"], answer: "Do you like this café?", explanation: "Do you like this café? pergunta ‘Você gosta desta cafeteria?’. Do you like forma o começo da pergunta; this café identifica o lugar sobre o qual você quer saber." , hint: "Para perguntar, comece com Do you like… Depois coloque this café, o lugar sobre o qual você quer saber."},
      },
      {
        id: "like-here", title: "Gostar daqui", phrase: "I like it here.", meaning: "Eu gosto daqui.",
        mode: "explain",
        why: "Aprenda I like it here. como um conjunto: “Eu gosto daqui”. Here situa a opinião no lugar; it não aponta para a bebida nessa expressão.",
        examples: [{ text: "I like it.", meaning: "Eu gosto disso.", note: "opinião sobre a bebida" }, { text: "I like it here.", meaning: "Eu gosto daqui.", note: "opinião sobre estar no lugar" }],
        goal: "Diferencie gostar de algo de gostar de estar neste lugar.",
        storyAudio: [{"id": "U17", "scope": "full"}],
        body: "I like it here. expressa que você gosta de estar neste lugar: ‘Eu gosto daqui’. Here significa ‘aqui’. Compare com I like it.: essa fala pode dar uma opinião sobre a bebida. Ao acrescentar here, você passa a comentar a experiência de estar no lugar.",
        detail: "Aprenda I like it here. como uma expressão para gostar do lugar, sem tentar apontar um objeto para it. Em I like English., English nomeia o idioma de que a pessoa gosta. Essa frase, sozinha, não diz necessariamente que ela gosta de estudá-lo.",
        practice: { kind: "choice", prompt: "Qual frase diz que você gosta de estar neste lugar?", options: ["I like English.", "I like it here.", "It's mine."], answer: "I like it here.", explanation: "I like it here. = ‘Eu gosto daqui’. Here situa sua opinião no lugar onde você está. As outras opções falam do idioma ou de quem é um objeto.", feedback: {"I like English.": "Essa frase diz que você gosta do idioma inglês. Para falar da experiência de estar neste lugar, use a expressão com here: I like it here.", "It's mine.": "It's mine. informa ‘É meu’, indicando pertencimento. A proposta aqui é dar uma opinião sobre o lugar: I like it here."} , hint: "O assunto é o lugar onde você está. Procure here, que significa “aqui”, para dizer que gosta daqui."},
      },
    ],
  },
  {
    id: "sobre-voce", title: "Um pouco sobre você", description: "Cansaço, aprendizado e um dia de trabalho.",
    steps: [
      {
        id: "im-tired", title: "Como você está", phrase: "I'm tired.", meaning: "Estou cansado ou cansada.",
        mode: "practice",
        why: "I'm é a forma curta de I am. Tired descreve como você está; por isso, precisa de am para formar essa frase sobre seu estado.",
        examples: [{ text: "I'm tired.", meaning: "Estou cansado ou cansada.", note: "forma curta" }, { text: "I am tired.", meaning: "Estou cansado ou cansada.", note: "mesmo sentido, sem contração" }],
        goal: "Diga como está se sentindo usando I'm ou I am.",
        storyAudio: [{"id": "C12", "scope": "full"}],
        body: "I'm tired. conta como você está se sentindo: ‘Estou cansado’ ou ‘Estou cansada’. I'm é a forma curta de I am, e tired descreve o cansaço. As duas formas funcionam: I'm tired. e I am tired. A palavra tired continua igual em inglês.",
        detail: "Tired descreve um estado; não é uma atividade em andamento. Compare I'm tired. com I'm learning English.: as duas começam com I'm, mas só a segunda traz uma atividade com -ing. But I'm tired. acrescenta contraste a outra ideia: ‘Mas estou cansado’.",
        practice: { kind: "write", prompt: "Complete a frase para dizer como você está: “Estou cansado”.", answers: ["I'm", "I’m"], hint: "A frase precisa começar com “eu estou”: I am. Você pode escrever essas duas palavras ou juntá-las na contração com apóstrofo.", explanation: "I'm e I am completam a frase: I'm tired. ou I am tired. — ‘Estou cansado’. Am liga quem fala ao estado de cansaço; por isso, I sozinho não completa esta proposta." , gaps: [{"before": "", "after": " tired.", "meaning": "Estou cansado ou cansada.", "answers": ["I'm", "I am"], feedback: "Complete com ‘eu estou’: I'm ou I am. As duas formas dão a mesma frase completa: I'm tired. / I am tired."}]},
      },
      {
        id: "learning", title: "Algo que está em andamento", phrase: "I'm learning English.", meaning: "Estou aprendendo inglês.",
        mode: "explain",
        why: "I'm combina com learning para apresentar uma atividade em andamento. Ela pode durar meses; por isso, a frase não exige que você esteja estudando naquele segundo.",
        examples: [{ text: "I'm tired.", meaning: "Estou cansado ou cansada.", note: "descreve um estado" }, { text: "I'm learning English.", meaning: "Estou aprendendo inglês.", note: "apresenta uma atividade deste período" }],
        goal: "Conte que aprender inglês faz parte deste momento da sua vida.",
        storyAudio: [{"id": "U11", "scope": "full"}],
        body: "I'm learning English. conta que você está aprendendo inglês neste período da sua vida. I'm vem antes de learning, a forma com -ing de learn, ‘aprender’. A frase pode falar de um aprendizado que dura dias ou meses; você não precisa estar estudando naquele segundo.",
        detail: "O padrão I am + verbo com -ing apresenta uma atividade em andamento e recebe o nome de presente contínuo. Em I'm tired., tired descreve um estado; em I'm learning English., learning apresenta a atividade. English nomeia o idioma e começa com letra maiúscula.",
        practice: { kind: "order", prompt: "Exemplo novo: diga “Estou aprendendo inglês”.", tokens: ["English.", "learning", "I'm"], distractors: ["tired", "learn"], answer: "I'm learning English.", explanation: "I'm learning English. = ‘Estou aprendendo inglês’. Learning apresenta a atividade deste período. Tired descreve cansaço; learn sem -ing não completa o padrão I'm + atividade em andamento." , hint: "Você quer falar de uma atividade deste período: aprender inglês. Use I’m com learning. Tired descreve cansaço, não a atividade de aprender."},
      },
      {
        id: "work-job", title: "Trabalho que cansa", phrase: "Too much work. — Long day.", meaning: "Trabalho demais. — Um dia longo.",
        mode: "explain",
        why: "Work fala da atividade ou quantidade de trabalho; job nomeia o emprego. Too much indica excesso, por isso explica o cansaço mesmo de quem gosta do emprego.",
        examples: [{ text: "a lot of work", meaning: "muito trabalho", note: "quantidade grande" }, { text: "too much work", meaning: "trabalho demais", note: "quantidade além do limite" }],
        goal: "Fale de trabalho em excesso sem confundir work e job.",
        storyAudio: [{"id": "C13", "scope": "excerpt"}, {"id": "C14", "scope": "excerpt"}],
        body: "Too much work. explica que há trabalho demais, além do que é confortável ou possível fazer. Work, aqui, fala da atividade ou quantidade de trabalho; job costuma nomear o emprego. Você pode gostar do emprego e ainda assim estar cansado por ter trabalho em excesso.",
        detail: "A lot of work diz que há uma quantidade grande; too much work acrescenta que ela passou do limite. Neste sentido, usamos much work; um emprego pode ser contado: one job, two jobs. Long day. resume ‘Um dia longo’, e Yeah. pode ser um ‘sim’ ou ‘é’ informal.",
        practice: {"kind": "choice", "prompt": "Exemplo novo: você gosta do emprego, mas há trabalho além do que consegue fazer. Qual frase expressa as duas ideias?", "options": ["I like my work, but I have a lot of work.", "I like my job, but I have too much work.", "I like my job, but I have too much job."], "answer": "I like my job, but I have too much work.", "explanation": "I like my job, but I have too much work. reúne as duas ideias: ‘Gosto do meu emprego, mas tenho trabalho demais’. Job nomeia o emprego; too much work indica excesso de trabalho.", "feedback": {"I like my work, but I have a lot of work.": "Essa frase pode ser válida em inglês, mas a lot of work indica apenas uma quantidade grande. A proposta pede trabalho em excesso, expresso por too much work.", "I like my job, but I have too much job.": "My job funciona para nomear o emprego. Na segunda parte, você quer falar da quantidade de atividade em excesso: too much work, em vez de too much job."}, hint: "Separe as duas ideias: job é o emprego; work é a quantidade de trabalho. Too much diz que passou do limite; a lot of diz apenas que a quantidade é grande."},
      },
    ],
  },
  {
    id: "convite", title: "Senta comigo?", description: "Reconheça um convite e responda com clareza.",
    steps: [
      {
        id: "sit-me", title: "Um convite curto", phrase: "Sit with me?", meaning: "Senta comigo?",
        mode: "explain",
        why: "Sit diz a ação; with me diz com quem. Depois de with, usamos me, não I. O contexto e o tom fazem dessa fala um convite.",
        examples: [{ text: "I like it.", meaning: "Eu gosto disso.", note: "I é quem faz a ação" }, { text: "Sit with me?", meaning: "Senta comigo?", note: "me vem depois de with" }],
        goal: "Reconheça quando alguém convida você para sentar junto.",
        storyAudio: [{"id": "C17", "scope": "full"}],
        body: "Sit with me? é um convite curto para sentar junto: ‘Senta comigo?’. Sit é a ação de sentar; with me é ‘comigo’. Na cena da mesa livre, a situação e o tom tornam esse convite natural. A pessoa abre espaço para vocês continuarem conversando.",
        detail: "Depois de with, usamos me: with me. I aparece como quem faz algo, como em I like it. Sit with me? é informal e depende do contexto. Um exemplo novo mais explícito é Would you like to sit with me? — ‘Você gostaria de sentar comigo?’.",
        practice: { kind: "choice", prompt: "O que a pessoa propõe com ‘Sit with me?’?", options: ["Que você peça outro café.", "Que você se sente com ela.", "Que você vá embora."], answer: "Que você se sente com ela.", explanation: "Sit with me? convida você a se sentar com a pessoa. A mesa livre dá contexto ao convite: sit é ‘sentar’, e with me é ‘comigo’.", feedback: {"Que você peça outro café.": "O convite trata de sentar, a ação expressa por sit. Não há um pedido de bebida nessa fala: with me convida você a fazer companhia à pessoa.", "Que você vá embora.": "With me quer dizer ‘comigo’. A pessoa convida você a se sentar junto dela e continuar o encontro, não a sair."} , hint: "Sit é sentar e with me é comigo. Pense no convite que faz sentido quando há uma mesa livre para os dois."},
      },
      {
        id: "yeah-sure", title: "Aceitar o convite", phrase: "Yeah, sure.", meaning: "Sim, claro.",
        mode: "explain",
        why: "Sure significa “claro” ao aceitar esse convite. Yeah reforça o sim informal; por isso, Sure! sozinho também deixa claro que você aceita sentar junto.",
        goal: "Aceite um convite com uma resposta curta e natural.",
        storyAudio: [{"id": "U10", "scope": "full"}],
        body: "Yeah, sure. aceita o convite de um jeito informal: ‘Sim, claro’. Yeah é uma forma comum de yes, e sure significa ‘claro’ nesta resposta. Sure! sozinho também funciona. Uma resposta curta já deixa claro que você topa se sentar.",
        detail: "Pense no que a resposta faz na conversa. Yeah, sure. aceita a proposta; Oh, nice! reage positivamente, mas pode não confirmar se você vai se sentar. Sure ganha sentido na situação e nem sempre corresponde à mesma palavra em português.",
        practice: {"kind": "write", "prompt": "Lucas convida: “Sit with me?”. Escreva uma aceitação curta e clara com sure, como nas expressões deste passo.", "answers": ["Sure!", "Yeah, sure.", "Yes, sure."], hint: "Você quer aceitar o convite. Sure significa “claro” aqui e pode ser uma resposta completa. Também pode vir depois de Yeah ou Yes.", "explanation": "Sure!, Yeah, sure. e Yes, sure. aceitam o convite com clareza. Not sure expressaria incerteza, e Nice! sozinho poderia ser apenas uma reação positiva."},
      },
      {
        id: "can-sit", title: "E se você fizer o pedido?", phrase: "Can I sit here?", meaning: "Posso sentar aqui? · exemplo novo",
        mode: "practice",
        why: "Can vem antes de I para perguntar se você pode sentar. Depois de can, sit fica na forma básica, sem to; here informa o lugar.",
        examples: [{ text: "I can sit here.", meaning: "Posso sentar aqui.", note: "afirmação · exemplo novo" }, { text: "Can I sit here?", meaning: "Posso sentar aqui?", note: "pedido de permissão · exemplo novo" }],
        goal: "Tome a iniciativa e peça permissão para sentar.",
        storyAudio: [],
        body: "Neste exemplo novo, você faz o pedido: Can I sit here? — ‘Posso sentar aqui?’. Can I abre a pergunta de permissão, sit diz o que você quer fazer e here indica o lugar. Agora você inicia a interação, em vez de apenas aceitar um convite.",
        detail: "Depois de can, o verbo fica na forma básica: can sit, sem to. Exemplo novo com um toque de gentileza: Can I sit here, please? — ‘Posso sentar aqui, por favor?’. Can também pode expressar possibilidade ou capacidade; neste pedido, o contexto indica permissão.",
        practice: { kind: "order", prompt: "Exemplo novo: pergunte “Posso sentar aqui?”", tokens: ["here?", "I", "sit", "Can"], answer: "Can I sit here?", explanation: "Can I sit here? = ‘Posso sentar aqui?’. A pergunta coloca can antes de I. Depois vem a ação sit e o lugar here; não é preciso acrescentar to." , hint: "Você vai pedir permissão. Comece com Can I… e depois diga o que quer fazer e onde: sit e here. Não é preciso acrescentar to."},
      },
    ],
  },
  {
    id: "ficar-sair", title: "Ficar mais ou ir?", description: "Fale do seu tempo, das suas necessidades e do lugar.",
    steps: [
      {
        id: "stay-longer", title: "Mais um pouco", phrase: "I can stay a little longer.", meaning: "Posso ficar mais um pouco.",
        mode: "explain",
        why: "I can stay informa sua disponibilidade para ficar. A little longer acrescenta um pouco mais de tempo; por isso, a frase prolonga a permanência sem definir minutos.",
        examples: [{ text: "I can stay.", meaning: "Posso ficar.", note: "disponibilidade" }, { text: "I can stay a little longer.", meaning: "Posso ficar mais um pouco.", note: "disponibilidade com tempo extra" }],
        goal: "Diga que pode continuar a conversa por mais um pouco.",
        storyAudio: [{"id": "U15", "scope": "full"}],
        body: "I can stay a little longer. comunica que você pode ficar mais um pouco. I can stay dá a ideia principal: você tem essa disponibilidade. A little longer acrescenta um pequeno tempo além do que já passou ou estava previsto, sem prometer uma duração exata.",
        detail: "Depois de can, use stay na forma básica, sem to ou -ing. Nesta afirmação, a ordem começa com I can. Compare com Can I sit here?, apresentado como exemplo novo: para fazer a pergunta, can vinha antes de I.",
        practice: { kind: "order", prompt: "Diga: “Posso ficar mais um pouco.”", tokens: ["longer.", "can", "a", "stay", "I", "little"], answer: "I can stay a little longer.", explanation: "I can stay a little longer. = ‘Posso ficar mais um pouco’. Organize as duas partes: I can stay comunica a disponibilidade; a little longer acrescenta o tempo extra." , hint: "Monte primeiro “Eu posso ficar”: I can stay. Depois acrescente “mais um pouco”: a little longer."},
      },
      {
        id: "have-go", title: "Dizer que precisa ir", phrase: "I have to go.", meaning: "Tenho que ir.",
        mode: "practice",
        why: "Have to expressa necessidade, enquanto can indica possibilidade. Como o compromisso exige sua saída, I have to go. deixa claro que você precisa ir.",
        examples: [{ text: "I can go.", meaning: "Posso ir.", note: "possibilidade · exemplo novo" }, { text: "I have to go.", meaning: "Tenho que ir.", note: "necessidade" }],
        goal: "Avise que precisa sair, em vez de dizer apenas que pode sair.",
        storyAudio: [{"id": "U16", "scope": "full"}],
        body: "I have to go. é uma maneira clara de dizer que você precisa sair: ‘Tenho que ir’. Have to funciona junto com o sentido de necessidade, e go é ‘ir’. A frase não exige explicar o compromisso ou outro motivo; ela já comunica que você precisa encerrar a permanência.",
        detail: "Compare os exemplos novos: I can go. — ‘Posso ir’; I have to go. — ‘Tenho que ir’. A primeira fala de possibilidade; a segunda, de necessidade. Repare também na forma: can go não leva to, enquanto have to go mantém esse to.",
        practice: { "kind": "choice", "prompt": "Seu compromisso começa agora. Como você diz que precisa sair?", "options": ["I can go.", "I have to go.", "I can stay."], "answer": "I have to go.", "explanation": "I have to go. expressa a necessidade de sair por causa do compromisso. I can go. diria apenas que você pode ir; a frase escolhida precisa comunicar ‘tenho que’.", "feedback": {"I can go.": "I can go. significa ‘Posso ir’. Como o compromisso exige sua saída, você precisa comunicar necessidade: I have to go.", "I can stay.": "I can stay. informa que você pode ficar. Nesta situação, o compromisso faz você precisar sair; I have to go. comunica isso."}, hint: "Seu compromisso não permite ficar. Escolha “tenho que ir”, uma necessidade. “Posso ir” fala apenas de uma possibilidade."},
      },
      {
        id: "break-quiet", title: "Uma pausa em um lugar tranquilo", phrase: "I need a break. It's quiet here.", meaning: "Preciso de uma pausa. É tranquilo aqui.",
        mode: "explain",
        why: "Need diz o que você precisa; quiet descreve o lugar. Por isso, um ambiente tranquilo e uma necessidade de pausa são informações diferentes, mesmo quando combinam.",
        examples: [{ text: "I need a break.", meaning: "Preciso de uma pausa.", note: "necessidade da pessoa" }, { text: "It's quiet here.", meaning: "É tranquilo aqui.", note: "característica do lugar" }],
        goal: "Expresse sua necessidade de uma pausa.",
        storyAudio: [{"id": "C23", "scope": "full"}, {"id": "C27", "scope": "full"}],
        body: "I need a break. fala de uma necessidade sua: ‘Preciso de uma pausa’. It's quiet here. descreve o lugar: ‘É tranquilo aqui’. As duas falas podem combinar numa conversa sobre cansaço, mas cada uma traz uma informação diferente: o que a pessoa precisa e como está o ambiente.",
        detail: "Em I need a break., a break vem logo depois de need; não entra of para copiar o ‘de’ de ‘preciso de’. Quiet descreve o ambiente, enquanto tired descreve o cansaço de alguém. Compare: I'm tired. — ‘Estou cansado’; It's quiet here. — ‘É tranquilo aqui’.",
        practice: { placement: { cue: "Você está cansado." }, kind: "choice", prompt: "Peça uma pausa.", options: ["It's quiet here.", "I need a break.", "I like it here."], answer: "I need a break.", explanation: "I need a break. = ‘Preciso de uma pausa’. Need expressa a necessidade, e a break nomeia a pausa. As outras opções comentam como é o lugar ou se você gosta dele.", feedback: {"It's quiet here.": "Essa frase informa que o lugar é tranquilo. Para dizer do que você precisa, use I need a break. — ‘Preciso de uma pausa’.", "I like it here.": "Essa frase diz ‘Gosto daqui’, uma opinião sobre o lugar. A proposta pede uma necessidade sua: I need a break."} , hint: "A frase deve falar do que você precisa. Need expressa essa necessidade; a break é uma pausa. As outras respostas falam do lugar."},
      },
    ],
  },
  {
    id: "despedida", title: "Até a próxima", description: "Mantenha contato e encerre a conversa com gentileza.",
    steps: [
      {
        id: "keep-touch", title: "Continuar em contato", phrase: "Can we keep in touch?", meaning: "Podemos manter contato?",
        mode: "explain",
        why: "Keep in touch funciona como uma expressão: “manter contato”. Can we abre uma proposta que inclui os dois; por isso, a frase sugere continuar o vínculo.",
        goal: "Proponha manter contato depois deste encontro.",
        storyAudio: [{"id": "U18", "scope": "full"}],
        body: "Can we keep in touch? propõe que vocês continuem em contato depois do encontro. We é ‘nós’, incluindo quem fala e a outra pessoa. Keep in touch funciona como uma expressão inteira: ‘manter contato’. A pergunta abre essa possibilidade, sem escolher ainda um telefone ou outro canal.",
        detail: "Aprenda keep in touch como um conjunto: keep traz a ideia de continuar, e in touch completa a expressão de contato. A ordem da pergunta começa com can e depois we. Conversar sobre como manter esse contato seria um próximo passo, além desta fala.",
        practice: { kind: "order", prompt: "Proponha: “Podemos manter contato?”", tokens: ["touch?", "we", "in", "Can", "keep"], answer: "Can we keep in touch?", explanation: "Can we keep in touch? = ‘Podemos manter contato?’. Can we abre a proposta conjunta, e keep in touch traz a ideia de continuar em contato depois do encontro." , hint: "Comece a pergunta com Can we… A expressão para “manter contato” é keep in touch; mantenha essas três palavras juntas, nessa ordem."},
      },
      {
        id: "nice-talking", title: "Reconhecer uma boa conversa", phrase: "Nice talking to you.", meaning: "Foi bom conversar com você.",
        mode: "explain",
        why: "Nice talking to you. reconhece que a conversa foi boa. Como a troca está terminando, essa expressão valoriza o encontro e prepara uma despedida gentil.",
        goal: "Reconheça uma boa conversa ao se despedir.",
        storyAudio: [{"id": "U19", "scope": "full"}],
        body: "Nice talking to you. reconhece uma conversa agradável ao se despedir: ‘Foi bom conversar com você’. Use quando a troca está terminando. A fala valoriza o encontro e ajuda a encerrá-lo com gentileza, especialmente quando alguém já disse que precisa ir.",
        detail: "Aprenda a expressão inteira para esse momento social. O -ing de talking não significa, sozinho, uma atividade em andamento: aqui não há am, is ou are antes dele. Compare com I'm learning English., que tem a combinação I'm + learning.",
        practice: { kind: "choice", prompt: "Quando ‘Nice talking to you.’ combina com a situação?", options: ["Ao avisar que um copo vai cair.", "Ao encerrar uma conversa agradável.", "Ao perguntar quem fez o pedido."], answer: "Ao encerrar uma conversa agradável.", explanation: "Nice talking to you. combina com o fim de uma conversa agradável. É um jeito de dizer que você gostou da troca e se despedir com gentileza.", feedback: {"Ao avisar que um copo vai cair.": "Durante o risco, a fala útil é Careful! Nice talking to you. valoriza uma conversa ao se despedir, depois da troca.", "Ao perguntar quem fez o pedido.": "Nice talking to you. não pergunta sobre um pedido. Ela reconhece que foi bom conversar e combina com o encerramento do encontro."} , hint: "Você já teve uma conversa agradável e está se despedindo. Pense na frase que reconhece esse encontro ao terminar."},
      },
      {
        id: "you-too-bye", title: "Uma despedida de volta", phrase: "You too. Bye!", meaning: "Também gostei de conversar. Tchau!",
        mode: "practice",
        why: "You too. devolve a gentileza de Nice talking to you. Me too. retoma um estado como I'm tired.; por isso, a fala anterior determina qual resposta cabe.",
        examples: [{ text: "“I'm tired.” — “Me too.”", meaning: "“Estou cansado.” — “Eu também.”", note: "compartilha o estado" }, { text: "“Nice talking to you.” — “You too.”", meaning: "“Foi bom conversar com você.” — “Também gostei.”", note: "retribui a gentileza" }],
        goal: "Retribua a gentileza e encerre a conversa.",
        storyAudio: [{"id": "C29", "scope": "full"}],
        body: "Depois de Nice talking to you., You too. devolve a gentileza: você também gostou de conversar com a pessoa. A fala anterior completa o sentido, então você não precisa repetir tudo. Bye! encerra a troca com um ‘Tchau!’.",
        detail: "Compare as retomadas: depois de I'm tired., Me too. diz que você também está cansado. Depois de Nice talking to you., You too. retribui a gentileza. Outro exemplo novo: Have a good day! — You too! devolve o desejo de um bom dia.",
        practice: { kind: "write", prompt: "A pessoa diz “Nice talking to you.” Complete sua despedida de volta.", answers: ["You"], hint: "A outra pessoa disse que gostou de conversar com você. Para devolver a gentileza, complete com a palavra de “você também”, não “eu também”.", explanation: "You too. retribui a mensagem de Nice talking to you.: ‘Também gostei de conversar’. A resposta se dirige à outra pessoa; Bye! completa a despedida." , gaps: [{"before": "", "after": " too. Bye!", "meaning": "Também gostei de conversar. Tchau!", "answers": ["You"], feedback: "A pessoa se dirigiu a você ao dizer Nice talking to you. Para retribuir a gentileza, complete You too. — ‘Também gostei de conversar’."}]},
      },
    ],
  },
];

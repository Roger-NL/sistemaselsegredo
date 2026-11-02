import type { AudioId } from "@/features/demo/model/types";

export type Practice = { feedback?: Record<string, string>; context?: { text: string; meaning: string }[]; instruction?: string } & (
  | { kind: "choice"; prompt: string; options: string[]; answer: string; explanation: string }
  | { kind: "order"; prompt: string; tokens: string[]; distractors?: string[]; answer: string; explanation: string }
  | { kind: "write"; prompt: string; answers: string[]; hint: string; explanation: string });

export type StudyStep = {
  id: string;
  title: string;
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
        storyAudio: [{"id": "C01", "scope": "full"}],
        body: "A pergunta procura o dono do objeto apontado. This aponta para este objeto; nesta cena, o copo. Yours significa ‘seu’ ou ‘sua’, sem repetir o objeto. This is yours. afirma; Is this yours? pergunta. Use quando o objeto estiver claro para as duas pessoas.",
        detail: "A tradução natural na cafeteria pode ser ‘Esse café é seu?’. Não é uma tradução fixa de this. Is é uma forma de be, verbo que pode corresponder a ‘ser’ ou ‘estar’. Nesta pergunta, ele vem antes de this. Não precisamos acrescentar do: Is this yours? já tem a estrutura de pergunta com be. A tradução acompanha o contexto, sem substituir cada palavra mecanicamente.",
        practice: { kind: "choice", prompt: "Alguém aponta um copo e pergunta ‘Is this yours?’. O que quer saber?", options: ["Se você gosta do café.", "Se o copo é seu.", "Se você quer sair."], answer: "Se o copo é seu.", explanation: "Yours indica pertencimento: a pergunta é sobre o dono do objeto.", feedback: {"Se você gosta do café.": "Gostar seria uma pergunta com like. Yours pergunta sobre pertencimento.", "Se você quer sair.": "A pergunta aponta para um objeto; não trata da sua disponibilidade para sair."} },
      },
      {
        id: "mine-your", title: "Meu, seu — sem repetir", phrase: "Oh! This is mine.", meaning: "Ah! Este é meu.",
        storyAudio: [{"id": "C05", "scope": "full"}],
        body: "Mine significa ‘meu’ ou ‘minha’ quando o objeto já está entendido. Assim, This is mine. identifica o copo de quem fala; quando Lucas diz isso, ele identifica o próprio copo. Compare: my coffee é ‘meu café’; mine substitui o conjunto ‘meu café’. A mesma diferença aparece em your coffee e yours. Use my ou your antes do nome; use mine ou yours para evitar repetir esse nome.",
        detail: "Mine e yours não mudam para acompanhar o gênero do objeto em português. Mine pode ser ‘meu café’ ou ‘minha bolsa’, conforme o assunto. Yours não leva apóstrofo: não escrevemos your's. Aqui, o s faz parte da palavra e não indica plural.",
        practice: {"kind": "write", "prompt": "Exemplo novo: complete com a forma de “meu” ou “seu” que cabe em cada frase.", "context": [{"text": "This is ___ coffee.", "meaning": "Este é meu café."}, {"text": "It is ___.", "meaning": "É meu."}, {"text": "Is this ___ coffee?", "meaning": "Este é seu café?"}, {"text": "Is it ___?", "meaning": "É seu?"}], "instruction": "Escreva as quatro palavras na ordem, separadas por espaços.", "answers": ["my mine your yours"], "hint": "Antes de coffee, use my ou your. Sem repetir coffee, use mine ou yours.", "explanation": "My coffee e your coffee vêm antes do nome. Mine e yours substituem o conjunto. A ordem é my, mine, your, yours."},
      },
      {
        id: "its-not", title: "Confirmar ou corrigir", phrase: "No, it's not mine.", meaning: "Não, não é meu.",
        storyAudio: [{"id": "U01", "scope": "full"}],
        body: "Para corrigir o engano, diga No, it's not mine. It's junta it e is; it retoma o objeto que está em discussão. Not torna a afirmação negativa. Para confirmar, basta Yes, it's mine. Essas respostas dispensam repetir coffee porque a situação já mostra de que vocês estão falando. A contração é comum tanto na conversa quanto na escrita informal.",
        detail: "It is not mine. e It isn't mine. também expressam a negativa. It's significa it is neste contexto; a palavra its, sem apóstrofo, tem outra função. O no inicial responde à pergunta. O not dentro da frase é o que transforma ‘é meu’ em ‘não é meu’.",
        practice: { kind: "write", prompt: "Complete só a palavra que falta: No, it's ___ mine.", answers: ["not"], hint: "É a palavra que torna a frase negativa.", explanation: "Not entra depois de is: it's not mine = não é meu." },
      },
    ],
  },
  {
    id: "pedido", title: "O que você pediu?", description: "Fale do pedido e devolva a pergunta.",
    steps: [
      {
        id: "did-order", title: "Um pedido que já aconteceu", phrase: "What did you order?", meaning: "O que você pediu?",
        storyAudio: [{"id": "U02", "scope": "full"}],
        body: "A pessoa quer saber qual foi o seu pedido. What pergunta ‘o quê’; order, aqui, é o verbo ‘pedir’ comida ou bebida. Did ajuda a fazer a pergunta sobre algo que já aconteceu. Depois de did, usamos order na forma básica, sem acrescentar ed. É uma pergunta sobre o pedido feito, não uma oferta para pedir agora.",
        detail: "Compare a pergunta da história com um exemplo novo: I ordered a coffee. significa ‘Pedi um café’. Na afirmação, ordered marca o passado. Na pergunta What did you order?, did já marca o passado; por isso, order permanece na forma básica. Não precisamos estudar todos os passados para usar este padrão.",
        practice: { kind: "order", prompt: "Monte ‘O que você pediu?’. Escolha order ou ordered; uma peça sobra.", tokens: ["order?", "you", "What", "did"], distractors: ["ordered?"], answer: "What did you order?", explanation: "O padrão é What + did + you + order. O passado aparece em did." },
      },
      {
        id: "iced-coffee", title: "Uma bebida, poucas palavras", phrase: "An iced coffee.", meaning: "Um café com gelo.",
        storyAudio: [{"id": "C03", "scope": "excerpt"}],
        body: "An iced coffee. já responde à pergunta sobre o pedido; não é necessário repetir a frase inteira. Iced descreve a bebida servida fria, com gelo. An significa ‘um’ ou ‘uma’ e aparece aqui antes do som de vogal no começo de iced. Na história também aparece It's sweet.: ‘É doce’. Sweet descreve o sabor, e não a temperatura.",
        detail: "O artigo depende do som da palavra seguinte: an iced coffee, mas a coffee. Iced vem antes de coffee porque descreve o tipo de café. Neste contexto, a coffee é uma porção ou um copo de café; a bebida também pode ser tratada sem contar porções em outras frases.",
        practice: {"kind": "choice", "prompt": "Exemplos novos: qual par completa “___ iced coffee / ___ coffee”? Escolha pelo som inicial da palavra seguinte.", "options": ["a / an", "an / a", "an / an"], "answer": "an / a", "explanation": "Iced começa com som de vogal: an iced coffee. Coffee começa com som de consoante: a coffee.", "feedback": {"a / an": "Os artigos ficaram invertidos: iced começa com som de vogal; coffee, de consoante.", "an / an": "Antes de coffee, o som inicial é de consoante: use a."}},
      },
      {
        id: "and-you", title: "A conversa vai e volta", phrase: "An iced coffee. And you?", meaning: "Um café com gelo. E você?",
        storyAudio: [{"id": "C03", "scope": "full"}],
        body: "And you? devolve a pergunta sem repetir tudo. Depois de falar do próprio pedido, a pessoa quer saber o que você pediu. And liga a sua resposta à pergunta seguinte; you é ‘você’. O sentido completo depende do assunto: depois de falar do cansaço ou do trabalho, And you? devolve essa outra pergunta. Use quando a ligação estiver clara.",
        detail: "Respostas curtas fazem parte da conversa cotidiana. Isso não significa retirar palavras de qualquer frase: aqui, as duas pessoas conseguem recuperar a pergunta pelo contexto. Exemplo novo: ‘I like coffee. And you?’ devolve a pergunta sobre gostar de café, não sobre o pedido feito.",
        practice: { kind: "write", prompt: "Escreva a expressão de duas palavras que significa ‘E você?’", answers: ["And you?", "And you"], hint: "Começa com And.", explanation: "And you? mantém a troca e devolve a pergunta sobre o assunto atual." },
      },
    ],
  },
  {
    id: "reacoes", title: "Reagir com naturalidade", description: "Surpresa, concordância, cuidado e gentileza.",
    steps: [
      {
        id: "really-too", title: "Sério? Eu também!", phrase: "Really? Me too!", meaning: "Sério? Eu também!",
        storyAudio: [{"id": "C08", "scope": "full"}],
        body: "Really? mostra surpresa ou interesse: ‘Sério?’. Me too. diz que uma afirmação positiva também vale para você. Depois de I like it., significa ‘Eu também gosto’. Já Not really. é uma maneira mais suave de responder ‘Não muito’ ou ‘Na verdade, não’. Essas expressões fazem coisas diferentes: mostrar interesse, concordar ou suavizar uma resposta negativa.",
        detail: "No ramo do pedido, Me too. retoma ‘também pedi um café com gelo’. No ramo do cansaço, retoma ‘também estou cansado’. Você pode ter percorrido apenas um desses casos. Me too. retoma uma ideia positiva; não é a resposta padrão para concordar com uma negativa. Se alguém diz ‘I don't like it’, uma resposta possível é ‘Me neither’ — exemplo novo, para perceber o limite. Really sozinho também pode transmitir dúvida; o tom de voz e a situação ajudam a interpretar.",
        practice: { kind: "choice", prompt: "Você gosta da bebida. A outra pessoa diz ‘I like it.’ Qual resposta comunica que você também gosta?", options: ["Not really.", "Really?", "Me too."], answer: "Me too.", explanation: "Me too. compartilha a mesma opinião positiva. Really? apenas pede confirmação ou expressa surpresa.", feedback: {"Not really.": "Not really. suaviza uma negativa; aqui você quer compartilhar uma opinião positiva.", "Really?": "Really? mostra surpresa ou interesse, mas não diz que você também gosta."} },
      },
      {
        id: "sorry-okay", title: "Pequenas gentilezas", phrase: "Oh! Sorry! — It's okay.", meaning: "Ah! Desculpa! — Tudo bem.",
        storyAudio: [{"id": "C02", "scope": "full"}, {"id": "U03", "scope": "full"}],
        body: "Sorry! pede desculpas pelo engano. It's okay. tranquiliza: ‘Tudo bem’. Uma pessoa se desculpa; a outra diz que o engano não foi um problema. Na cafeteria, essa troca permite continuar a conversa com gentileza.",
        detail: "Thanks! agradece uma ajuda. Oh! pode marcar descoberta ou reação, sem uma tradução única em toda situação. Okay também pode confirmar que você entendeu: Oh, okay. pode ser ‘Ah, entendi’ ou ‘Ah, tudo bem’. Não significa sempre entusiasmo. Thanks e Thank you expressam agradecimento; sorry expressa desculpa neste contexto. Escolha pelo que deseja fazer na conversa, não apenas pelo número de palavras.",
        practice: {"kind": "choice", "prompt": "Lucas percebe o engano sobre o copo e diz “Sorry!”. Você quer dizer que o engano não foi um problema. O que responde?", "options": ["It's okay.", "Sorry!", "Thanks!"], "answer": "It's okay.", "explanation": "It's okay. tranquiliza depois da desculpa.", "feedback": {"Sorry!": "Sorry! pede desculpas. Aqui você quer tranquilizar quem já se desculpou.", "Thanks!": "Thanks! agradece. Para dizer que o engano não foi um problema, use uma resposta de tranquilização."}},
      },
      {
        id: "careful-close", title: "Reagir ao momento", phrase: "Careful! — That was close.", meaning: "Cuidado! — Foi por pouco.",
        storyAudio: [{"id": "U08", "scope": "full"}, {"id": "C11", "scope": "full"}],
        body: "Careful! alerta para um risco imediato, como um copo prestes a cair. Depois que o perigo passa, That was close. significa ‘Foi por pouco’. Aqui, close não é fechar: fala de chegar perto de algo ruim acontecer. Escolha a expressão conforme o momento do risco.",
        detail: "Nice! e Oh, nice! reagem positivamente, como ‘Legal!’. Lucky you! comenta uma vantagem da outra pessoa, como ‘Que sorte a sua!’. Was é uma forma passada de be: o quase acidente acabou de acontecer. Aprenda That was close. como uma expressão inteira antes de analisar cada parte. Lucky you! pode soar simpático ou irônico conforme o tom; não existe um significado emocional garantido só pelas palavras escritas.",
        practice: { kind: "choice", prompt: "O copo ainda está caindo. Qual fala avisa a pessoa a tempo?", options: ["Nice!", "That was close.", "Careful!"], answer: "Careful!", explanation: "Careful! avisa durante o risco. That was close. comenta o alívio depois.", feedback: {"Nice!": "Nice! é uma reação positiva; não avisa sobre o risco de o copo cair.", "That was close.": "Essa fala comenta o alívio depois do risco. O copo ainda está caindo."} },
      },
    ],
  },
  {
    id: "gostar", title: "Do que você gosta?", description: "Dê sua opinião e descubra a da outra pessoa.",
    steps: [
      {
        id: "like-it", title: "Uma opinião simples", phrase: "I like it.", meaning: "Eu gosto disso.",
        storyAudio: [{"id": "U06", "scope": "full"}],
        body: "I like it. expressa que algo agrada a você. I é ‘eu’; like é ‘gostar’; it retoma a coisa de que vocês estão falando, como a bebida. Em português dizemos ‘gostar de’; neste padrão em inglês, like se liga diretamente a it. Use a frase para dar uma opinião quando o assunto já estiver claro, sem repetir o nome da bebida ou do objeto.",
        detail: "It não significa apenas ‘isso’: pode retomar o café, o trabalho ou outro assunto singular. A tradução mais natural de I like it. pode ser simplesmente ‘Eu gosto’. Para uma preferência deste tipo, normalmente usamos I like, sem am: não precisamos de I'm para acompanhar todos os verbos.",
        practice: { kind: "order", prompt: "Monte ‘Eu gosto disso’. Use só as peças necessárias; duas sobram.", tokens: ["it.", "I", "like"], distractors: ["am", "of"], answer: "I like it.", explanation: "Use I + like + it. Não acrescente am a esta preferência nem of para copiar o ‘de’ de ‘gostar de’." },
      },
      {
        id: "do-you-like", title: "Da opinião à pergunta", phrase: "Do you like your job?", meaning: "Você gosta do seu trabalho?",
        storyAudio: [{"id": "U12", "scope": "full"}],
        body: "Para perguntar sobre o gosto de outra pessoa, use Do you like…? Do ajuda a construir a pergunta; não significa ‘fazer’ aqui. Your job é ‘seu trabalho’ no sentido de emprego. Do you like this café? pergunta sobre a cafeteria. Do you like it? retoma um assunto já claro. Mantenha Do you like e troque o complemento para mudar o assunto.",
        detail: "Compare: You like your job. afirma; Do you like your job? pergunta. Diferentemente de Is this yours?, esta pergunta usa do porque o verbo principal é like. Uma resposta curta possível é Yes, I do. A resposta da história, Yeah, I like it., também é natural e repete a opinião.",
        practice: { kind: "order", prompt: "Monte a pergunta sobre a cafeteria.", tokens: ["this", "like", "café?", "Do", "you"], answer: "Do you like this café?", explanation: "Do you like fica no início; this café identifica o assunto da pergunta." },
      },
      {
        id: "like-here", title: "Gostar daqui", phrase: "I like it here.", meaning: "Eu gosto daqui.",
        storyAudio: [{"id": "U17", "scope": "full"}],
        body: "I like it here. fala da experiência de estar neste lugar. Here significa ‘aqui’; a expressão inteira pode ser traduzida como ‘Gosto daqui’. Compare com I like it., que pode falar do café: o complemento muda o assunto.",
        detail: "Em I like English., English nomeia o idioma de que a pessoa gosta. A frase isolada não afirma necessariamente gostar de estudá-lo. Em I like it here., não precisamos apontar um objeto para it: essa é uma forma comum de dizer que estar no lugar é agradável. Compare os sentidos antes de traduzir palavra por palavra. Na fala, o acento e a situação deixam mais claro se a pessoa está falando da bebida ou do ambiente.",
        practice: { kind: "choice", prompt: "Qual frase diz que você gosta de estar neste lugar?", options: ["I like English.", "I like it here.", "It's mine."], answer: "I like it here.", explanation: "Here localiza a experiência: ‘Eu gosto daqui’. English fala do idioma; mine indica pertencimento.", feedback: {"I like English.": "English nomeia o idioma. Para gostar de estar neste lugar, o complemento é here.", "It's mine.": "Mine indica pertencimento. Esta proposta é sobre gostar do lugar."} },
      },
    ],
  },
  {
    id: "sobre-voce", title: "Um pouco sobre você", description: "Cansaço, aprendizado e um dia de trabalho.",
    steps: [
      {
        id: "im-tired", title: "Como você está", phrase: "I'm tired.", meaning: "Estou cansado ou cansada.",
        storyAudio: [{"id": "C12", "scope": "full"}],
        body: "I'm tired. descreve como você está se sentindo. I'm junta I e am; tired significa ‘cansado’ ou ‘cansada’, sem mudar de forma. Am faz a ligação entre você e esse estado. Não se diz I tired. Na história, But I'm tired. acrescenta um contraste: a pessoa gosta de algo, mas está cansada. But significa ‘mas’, ligando as duas ideias.",
        detail: "Be pode corresponder a ser ou estar, dependendo da frase. Aqui, I am tired. e I'm tired. têm o mesmo sentido. Tired descreve um estado; não é uma ação em andamento. Por isso, a presença de I'm, sozinha, não significa que a frase esteja no presente contínuo.",
        practice: { kind: "write", prompt: "Complete para dizer ‘Estou cansado’: ___ tired.", answers: ["I'm", "I’m"], hint: "Uma opção curta une I e am por um apóstrofo.", explanation: "I'm é a contração de I am. As duas formas funcionam aqui: I'm tired. ou I am tired." },
      },
      {
        id: "learning", title: "Algo que está em andamento", phrase: "I'm learning English.", meaning: "Estou aprendendo inglês.",
        storyAudio: [{"id": "U11", "scope": "full"}],
        body: "A frase conta que aprender inglês faz parte da sua vida neste período. Learning é a forma com ing de learn, ‘aprender’. Aqui, I'm vem antes de learning: I am + learning. Essa combinação apresenta uma atividade em andamento. Não exige que você esteja estudando naquele segundo; o aprendizado pode estar acontecendo ao longo de dias ou meses.",
        detail: "Este padrão se chama presente contínuo: uma forma de be + verbo com ing. Compare I'm tired. com I'm learning English.: a primeira descreve um estado com tired; a segunda apresenta uma atividade com learning. English é o nome do idioma e começa com letra maiúscula.",
        practice: { kind: "order", prompt: "Exemplo novo: você faz um curso neste período. Monte ‘Estou aprendendo inglês’. Duas peças sobram.", tokens: ["English.", "learning", "I'm"], distractors: ["tired", "learn"], answer: "I'm learning English.", explanation: "I'm + learning apresenta a atividade em andamento neste período. Tired descreve cansaço; depois de I'm, learn sozinho não forma essa atividade." },
      },
      {
        id: "work-job", title: "Trabalho que cansa", phrase: "Too much work. — Long day.", meaning: "Trabalho demais. — Um dia longo.",
        storyAudio: [{"id": "C13", "scope": "excerpt"}, {"id": "C14", "scope": "excerpt"}],
        body: "Too much work. explica o cansaço: há trabalho em excesso. Work, aqui, é a atividade ou quantidade de trabalho; job costuma nomear o emprego. Compare gostar do emprego com ter trabalho demais: são ideias compatíveis.",
        detail: "Long day. resume um dia longo ou cansativo. Yeah. é um ‘sim’ ou ‘é’ informal. Neste sentido, work não é contado como objetos separados, por isso usamos much work. Job pode ser contado: one job, two jobs. Too much indica excesso, não apenas uma quantidade grande. Lucky you!, outra reação da história, pode reconhecer a sorte de quem teve um dia mais leve.",
        practice: {"kind": "choice", "prompt": "Exemplo novo: você gosta do emprego, mas há trabalho além do que consegue fazer. Qual frase expressa as duas ideias?", "options": ["I like my work, but I have a lot of work.", "I like my job, but I have too much work.", "I like my job, but I have too much job."], "answer": "I like my job, but I have too much work.", "explanation": "My job nomeia o emprego. Too much work indica trabalho em excesso.", "feedback": {"I like my work, but I have a lot of work.": "Essa frase pode ser válida, mas a lot of work diz que a quantidade é grande; não afirma o excesso pedido.", "I like my job, but I have too much job.": "Job nomeia um emprego e pode ser contado. Para a quantidade de atividade em excesso, use too much work."}},
      },
    ],
  },
  {
    id: "convite", title: "Senta comigo?", description: "Reconheça um convite e responda com clareza.",
    steps: [
      {
        id: "sit-me", title: "Um convite curto", phrase: "Sit with me?", meaning: "Senta comigo?",
        storyAudio: [{"id": "C17", "scope": "full"}],
        body: "Sit with me? convida a pessoa para se sentar junto. Sit significa ‘sentar’; with me, ‘comigo’. O ponto de interrogação representa o tom de convite, em vez de uma ordem seca. Oh, a table! anuncia que surgiu uma mesa. Na situação da cafeteria, a sequência torna a intenção clara: há lugar para continuar a conversa, e a pessoa está convidando você.",
        detail: "Me é a forma usada depois de with; I aparece como sujeito em I like it. Não dizemos with I. Sit with me? é uma forma informal e curta, dependente do tom e da situação. Exemplo novo, mais explícito: Would you like to sit with me? é um convite mais completo.",
        practice: { kind: "choice", prompt: "O que a pessoa propõe com ‘Sit with me?’?", options: ["Que você peça outro café.", "Que você se sente com ela.", "Que você vá embora."], answer: "Que você se sente com ela.", explanation: "Sit é sentar; with me é comigo. O contexto transforma a fala curta em convite.", feedback: {"Que você peça outro café.": "Sit significa sentar; não é um pedido de bebida.", "Que você vá embora.": "With me convida você a ficar junto da pessoa, em vez de ir embora."} },
      },
      {
        id: "yeah-sure", title: "Aceitar o convite", phrase: "Yeah, sure.", meaning: "Sim, claro.",
        storyAudio: [{"id": "U10", "scope": "full"}],
        body: "Yeah, sure. aceita o convite de forma informal. Yeah é uma maneira comum de dizer yes; sure, nesta resposta, significa ‘claro’ ou ‘com certeza’. Sure! sozinho também pode aceitar uma proposta. Oh, nice! expressa uma reação positiva, mas nem toda reação positiva responde claramente a um convite. Aqui, Yeah, sure. deixa evidente que você topa se sentar.",
        detail: "Palavras ganham sentido dentro da expressão: sure nem sempre deve ser traduzido da mesma maneira em todas as frases. Neste convite, não é necessário construir uma explicação longa para aceitar. Uma resposta curta pode ser completa como ação de conversa, mesmo sem ter a forma de uma oração inteira.",
        practice: {"kind": "write", "prompt": "Lucas convida: “Sit with me?”. Escreva uma aceitação curta e clara com sure, como nas expressões deste passo.", "answers": ["Sure!", "Yeah, sure.", "Yes, sure."], "hint": "Sure! sozinho já aceita. Você também pode começar com Yeah ou Yes.", "explanation": "Sure!, Yeah, sure. e Yes, sure. aceitam o convite. Not sure expressa incerteza; uma reação como Nice! sozinha não confirma que você topa."},
      },
      {
        id: "can-sit", title: "E se você fizer o pedido?", phrase: "Can I sit here?", meaning: "Posso sentar aqui? · exemplo novo",
        storyAudio: [],
        body: "Este é um exemplo novo com palavras que já se aproximam da história. Can I sit here? pede permissão para sentar neste lugar. Can vem antes de I na pergunta, e sit permanece na forma básica. Here localiza o pedido: ‘aqui’. Você sai da posição de responder a um convite e passa a iniciar uma interação com uma pergunta curta.",
        detail: "Can também pode falar de capacidade ou possibilidade; nesta pergunta, o contexto indica permissão. Depois de can, usamos o verbo sem to: can sit. Acrescentar please pode tornar o pedido mais delicado: Can I sit here, please? Não é preciso traduzir can sempre por uma única palavra em português.",
        practice: { kind: "order", prompt: "Exemplo novo: monte ‘Posso sentar aqui?’", tokens: ["here?", "I", "sit", "Can"], answer: "Can I sit here?", explanation: "Can + I + sit + here forma a pergunta sobre permissão para se sentar." },
      },
    ],
  },
  {
    id: "ficar-sair", title: "Ficar mais ou ir?", description: "Fale do seu tempo, das suas necessidades e do lugar.",
    steps: [
      {
        id: "stay-longer", title: "Mais um pouco", phrase: "I can stay a little longer.", meaning: "Posso ficar mais um pouco.",
        storyAudio: [{"id": "U15", "scope": "full"}],
        body: "A pessoa diz que tem a possibilidade de continuar ali. Can stay é ‘posso ficar’; a little longer acrescenta ‘mais um pouco’, em relação ao tempo já passado. A ordem agora é de afirmação: I vem antes de can. Use a frase quando ainda puder ficar, sem prometer um tempo exato. Ela comunica disponibilidade para continuar o encontro.",
        detail: "Depois de can, stay fica na forma básica: não acrescentamos to nem ing. Longer compara a duração com a que já estava prevista ou acontecendo. A little suaviza a quantidade extra. Na pergunta nova Can I sit here?, can vinha primeiro; nesta afirmação, I can vem primeiro.",
        practice: { kind: "order", prompt: "Monte a fala que comunica que você pode ficar mais um pouco.", tokens: ["longer.", "can", "a", "stay", "I", "little"], answer: "I can stay a little longer.", explanation: "I can stay dá a ideia principal. A little longer acrescenta a duração extra." },
      },
      {
        id: "have-go", title: "Dizer que precisa ir", phrase: "I have to go.", meaning: "Tenho que ir.",
        storyAudio: [{"id": "U16", "scope": "full"}],
        body: "I have to go. comunica necessidade de sair. Aprenda have to como o conjunto ‘ter que’ ou ‘precisar’; go é ‘ir’. Aqui, have não está dizendo que você possui alguma coisa. A frase permite encerrar a permanência com clareza. Não é a mesma mensagem de I can stay.: uma fala de necessidade, a outra fala da possibilidade de continuar.",
        detail: "Compare os padrões: can go, sem to, e have to go, com to. Não precisamos aplicar a regra de can a todos os verbos. Have to pode comunicar uma obrigação ou necessidade prática; a razão pode ficar implícita. A frase não explica sozinha se existe um compromisso ou outro motivo.",
        practice: {"kind": "choice", "prompt": "Exemplo novo: seu compromisso começa agora e você precisa sair. Qual frase comunica necessidade, em vez de apenas possibilidade?", "options": ["I can go.", "I have to go.", "I can stay."], "answer": "I have to go.", "explanation": "Have to go expressa a necessidade de ir; can go expressa possibilidade.", "feedback": {"I can go.": "Can go diz que você pode ir, sem afirmar que precisa. O compromisso pede necessidade.", "I can stay.": "Can stay comunica disponibilidade para ficar, enquanto aqui você precisa sair."}},
      },
      {
        id: "break-quiet", title: "Uma pausa em um lugar tranquilo", phrase: "I need a break. It's quiet here.", meaning: "Preciso de uma pausa. É tranquilo aqui.",
        storyAudio: [{"id": "C23", "scope": "full"}, {"id": "C27", "scope": "full"}],
        body: "I need a break. expressa uma necessidade: need é ‘precisar’ e a break é ‘uma pausa’. Não acrescente of para copiar o ‘de’ do português. It's quiet here. descreve o ambiente: quiet é ‘tranquilo’ ou ‘silencioso’; here é ‘aqui’. A primeira frase fala de você; a segunda ajuda a explicar por que esse lugar pode ser bom para descansar.",
        detail: "Break tem outros sentidos, mas a break, depois de need e numa conversa sobre cansaço, é uma pausa. Quiet não significa ‘cansado’: caracteriza o ambiente. Compare I'm tired. com It's quiet here. A forma de be muda com aquilo de que falamos: I am e it is.",
        practice: { kind: "choice", prompt: "Você quer dizer que precisa de uma pausa. Qual frase faz isso?", options: ["It's quiet here.", "I need a break.", "I like it here."], answer: "I need a break.", explanation: "Need expressa a necessidade; a break é uma pausa. As outras falas comentam o lugar.", feedback: {"It's quiet here.": "Essa fala descreve o ambiente. Você quer expressar sua necessidade de uma pausa.", "I like it here.": "Gostar daqui é uma opinião sobre o lugar. Need expressa a necessidade pedida."} },
      },
    ],
  },
  {
    id: "despedida", title: "Até a próxima", description: "Mantenha contato e encerre a conversa com gentileza.",
    steps: [
      {
        id: "keep-touch", title: "Continuar em contato", phrase: "Can we keep in touch?", meaning: "Podemos manter contato?",
        storyAudio: [{"id": "U18", "scope": "full"}],
        body: "A pergunta propõe continuar a relação depois do encontro. We significa ‘nós’, incluindo as duas pessoas. Keep in touch é uma expressão inteira: ‘manter contato’. Ela não fala de tocar fisicamente alguém. Como em outras perguntas com can, a ordem começa por can e depois traz quem participa. Use quando quiser saber se a outra pessoa também aceita continuar em contato.",
        detail: "Keep, aqui, tem a ideia de continuar; in touch completa a expressão. Não precisamos traduzir cada parte ao pé da letra para compreender a proposta. A pergunta também não determina como o contato acontecerá: trocar telefone ou escolher outro canal seria um próximo passo, fora desta frase.",
        practice: { kind: "order", prompt: "Monte a proposta: ‘Podemos manter contato?’", tokens: ["touch?", "we", "in", "Can", "keep"], answer: "Can we keep in touch?", explanation: "Can we pergunta sobre uma possibilidade conjunta. Keep in touch significa manter contato." },
      },
      {
        id: "nice-talking", title: "Reconhecer uma boa conversa", phrase: "Nice talking to you.", meaning: "Foi bom conversar com você.",
        storyAudio: [{"id": "U19", "scope": "full"}],
        body: "Nice talking to you. é uma despedida que valoriza a conversa que acabou de acontecer. Nice significa agradável; talking to you é ‘conversar com você’ neste conjunto. Aprenda a expressão completa para esse momento social. Ela não é uma pergunta e não pede que a pessoa continue falando: sinaliza uma conclusão amigável, especialmente quando alguém já disse que precisa ir.",
        detail: "Apesar do ing em talking, esta expressão não segue o padrão I'm learning. Não há am, is ou are antes de talking; portanto, ing sozinho não identifica presente contínuo. Aqui, talking dá nome à atividade de conversar dentro de uma expressão curta de despedida.",
        practice: { kind: "choice", prompt: "Quando ‘Nice talking to you.’ combina com a situação?", options: ["Ao avisar que um copo vai cair.", "Ao encerrar uma conversa agradável.", "Ao perguntar quem fez o pedido."], answer: "Ao encerrar uma conversa agradável.", explanation: "É uma forma de reconhecer que foi bom conversar e se despedir com gentileza.", feedback: {"Ao avisar que um copo vai cair.": "Para alertar sobre o copo, use Careful! Esta fala reconhece a conversa ao encerrá-la.", "Ao perguntar quem fez o pedido.": "Esta expressão não faz uma pergunta. Ela valoriza a conversa que acabou de acontecer."} },
      },
      {
        id: "you-too-bye", title: "Uma despedida de volta", phrase: "You too. Bye!", meaning: "Também gostei de conversar. Tchau!",
        storyAudio: [{"id": "C29", "scope": "full"}],
        body: "Depois de Nice talking to you., You too. devolve a gentileza: você também gostou de conversar com a pessoa. O sentido vem da despedida anterior; não é necessário repetir tudo. Bye! é ‘Tchau!’. Compare com Me too. depois de I'm tired.: ali você diz que também está cansado. Aqui, a resposta se dirige à outra pessoa e retribui a mensagem.",
        detail: "Não trate me too e you too como respostas intercambiáveis em qualquer situação. Pergunte que ideia está sendo retomada. A tradução contextual de You too. nesta despedida fica mais natural como ‘Também gostei de conversar’. Fora daqui, a mesma expressão pode devolver um desejo, como num exemplo novo: ‘Have a good day!’ — ‘You too!’.",
        practice: { kind: "write", prompt: "A pessoa se despede: ‘Nice talking to you.’ Complete a resposta da história: ___ too. Bye!", answers: ["You"], hint: "Nesta despedida, a resposta se dirige à outra pessoa.", explanation: "You too. retribui Nice talking to you. Bye! conclui a despedida." },
      },
    ],
  },
];

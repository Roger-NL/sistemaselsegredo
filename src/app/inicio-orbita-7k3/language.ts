export type LearningLanguage = "pt" | "de" | "es";
export type SceneId = "world" | "work" | "life";
export type BarrierId = "freeze" | "translate" | "words" | "start";

export type LocalizedVariant = {
  setting: string;
  contextTranslation: string;
  openingTranslation: string;
  translation: string;
  partMeanings: string[];
  partClueMeanings: string[][];
  partNotes: string[];
  replyTranslation: string;
  replyPartMeanings: string[];
  replyClueMeanings: string[][];
  replyPartNotes: string[];
};

type LocaleCopy = {
  languageName: string;
  greeting: string;
  greetingReturning: string;
  askName: string;
  afterName: string;
  hello: string;
  chooseScene: string;
  chooseBarrier: string;
  sceneLabels: Record<SceneId, { label: string; response: string }>;
  barriers: Record<BarrierId, { label: string; description: string; action: string; understand: string }>;
  guidance: Record<BarrierId, string>;
  lessonIntro: Record<BarrierId, string>;
  lessonTitles: Record<BarrierId, string>;
  lessonFocus: { freezeFirst: string; freezeNext: string; wordsAnchor: string; startFirst: string; startNext: string };
  practiceCueTitles: Record<"freeze" | "translate" | "words", string>;
  freezeCueHint: string;
  practiceIntents: Record<SceneId, [string, string]>;
  practiceWords: Record<SceneId, [{ phrase: string; meaning: string }, { phrase: string; meaning: string }]>;
  answerLessonTitle: string;
  lessonHint: string;
  replyIntro: string;
  replyLessonTitle: string;
  replyLessonHint: string;
  ready: string;
  continue: string;
  recapTitle: string;
  testAnotherPath: string;
  chooseAnotherBarrier: string;
  recapProgress: Record<BarrierId, string>;
  speakers: { other: string; you: string };
  variants: Record<SceneId, { standard: LocalizedVariant; beginner: LocalizedVariant }>;
};

const pt: LocaleCopy = {
  languageName: "Português",
  greeting: "Oi! Que bom ter você por aqui.\nComo você gosta de ser chamado?",
  greetingReturning: "Oi de novo, {name}!\nVamos encontrar seu próximo passo no inglês?",
  askName: "Como você gosta de ser chamado?",
  afterName: "Prazer, {name}.\nOnde você mais gostaria de usar o inglês?",
  hello: "{name} conta: onde você mais gostaria de usar o inglês?",
  chooseScene: "E o que mais pega na hora de falar?",
  chooseBarrier: "Como você está começando do zero, vamos usar uma frase curta e completa:",
  sceneLabels: {
    world: { label: "Viajar com liberdade", response: "Vamos levar o inglês para as suas viagens." },
    work: { label: "Me expressar no trabalho", response: "Vamos dar espaço às suas ideias no trabalho." },
    life: { label: "Conversar com as pessoas", response: "Vamos começar por uma conexão do dia a dia." },
  },
  barriers: {
    freeze: { label: "Na hora me dá branco", description: "Sei um pouco, mas travo na conversa.", action: "Consegui montar a frase", understand: "Quero entender cada parte" },
    translate: { label: "Quero falar sem traduzir tudo na cabeça", description: "Quero formar frases sem passar palavra por palavra pelo português.", action: "Consegui usar os blocos", understand: "Quero entender cada parte" },
    words: { label: "Sei o que quero dizer, mas faltam as palavras", description: "A ideia está na cabeça, mas não encontro as palavras em inglês.", action: "Consegui usar essas palavras", understand: "Quero entender cada parte" },
    start: { label: "Estou começando do zero", description: "Quero aprender com frases simples, desde o começo.", action: "Consegui montar a frase", understand: "Quero entender cada parte" },
  },
  guidance: {
    freeze: "Se der branco, uma resposta pronta ajuda você a começar. Leia a frase inteira:",
    translate: "Pense no que você quer fazer na conversa. A frase inteira em inglês é:",
    words: "Você não precisa conhecer todas as palavras para responder. Veja a frase completa:",
    start: "Vamos começar com uma frase curta, que você pode usar de verdade:",
  },
  lessonIntro: {
    freeze: "Agora encontre uma pista em cada parte. Se der branco, comece pela primeira e deixe a próxima vir depois.",
    translate: "Agora veja o que cada parte faz na conversa. A tradução fica ao lado para ajudar, mas você pode pensar na ideia inteira.",
    words: "Agora encontre as palavras úteis dentro da frase e veja como elas se ligam. Assim você ganha uma resposta, não só uma lista de vocabulário.",
    start: "Agora descubra, uma parte de cada vez, como essa frase simples funciona.",
  },
  lessonTitles: {
    freeze: "UMA PISTA DE CADA VEZ",
    translate: "BLOCOS DE SENTIDO",
    words: "PALAVRAS NA CONVERSA",
    start: "SUA PRIMEIRA FRASE, EM PARTES",
  },
  lessonFocus: {
    freezeFirst: "SEU PONTO DE PARTIDA",
    freezeNext: "PUXE O PRÓXIMO PEDAÇO",
    wordsAnchor: "UMA PARTE ÚTIL",
    startFirst: "PRIMEIRO PASSO",
    startNext: "MAIS UMA PARTE",
  },
  practiceCueTitles: {
    freeze: "SE DER BRANCO, COMECE POR AQUI",
    translate: "DUAS IDEIAS, UMA RESPOSTA",
    words: "DUAS PALAVRAS PARA GUARDAR",
  },
  freezeCueHint: "Diga só este começo. Depois, continue com o resto da frase.",
  practiceIntents: {
    world: ["Responder que sim", "Pedir uma sugestão"],
    work: ["Apresentar sua ideia", "Pedir espaço para compartilhá-la"],
    life: ["Contar do que você gosta", "Devolver a pergunta"],
  },
  practiceWords: {
    world: [{ phrase: "recommend", meaning: "recomendar" }, { phrase: "what", meaning: "o que" }],
    work: [{ phrase: "idea", meaning: "ideia" }, { phrase: "share", meaning: "compartilhar" }],
    life: [{ phrase: "music", meaning: "música" }, { phrase: "love", meaning: "adorar" }],
  },
  answerLessonTitle: "SUA RESPOSTA, EM PEÇAS",
  lessonHint: "Toque em cada parte para ouvir",
  replyIntro: "Agora vamos entender também o que a outra pessoa pode responder:",
  replyLessonTitle: "A RESPOSTA DO OUTRO LADO",
  replyLessonHint: "Ela também tem pistas. Toque para ouvir",
  ready: "Juntar a frase",
  continue: "Continuar a conversa",
  recapTitle: "Olha a conversa que você acabou de conseguir acompanhar.",
  testAnotherPath: "Testar outro caminho",
  chooseAnotherBarrier: "Vamos manter a situação e experimentar outra dificuldade. O que acontece com você na hora de falar?",
  recapProgress: {
    freeze: "Você partiu do branco, montou sua resposta e entendeu o que veio depois.",
    translate: "Você conectou os blocos de sentido e acompanhou a conversa inteira.",
    words: "Você usou palavras como pistas para montar a resposta e entender a reação.",
    start: "Sua primeira conversa em inglês: você entendeu a pergunta, a resposta e a reação.",
  },
  speakers: { other: "Outra pessoa", you: "Você" },
  variants: {
    world: {
      standard: {
        setting: "Imagine que você está em um café, em outro país. Alguém pergunta:", contextTranslation: "Você está em um café.", openingTranslation: "É a sua primeira vez aqui?", translation: "Sim! O que você recomenda?", partMeanings: ["Sim!", "O que você", "recomenda?"], partClueMeanings: [["sim"], ["o que", "você"], ["recomendar"]], partNotes: ["Yes! responde diretamente à pergunta. Em inglês, você pode confirmar com uma palavra e acrescentar um detalhe depois.", "What do you…? é o molde “o que você…?”. O do ajuda a formar a pergunta; aqui não significa “fazer”.", "Depois de What do you, o verbo vem na forma simples: recommend. Juntos, os blocos perguntam o que a pessoa sugere."], replyTranslation: "O café é ótimo. De onde você é?", replyPartMeanings: ["O café é ótimo.", "De onde você é?"], replyClueMeanings: [["café", "ótimo"], ["onde", "de"]], replyPartNotes: ["The aponta para aquele café do lugar; great descreve a experiência. Em inglês, a palavra que descreve vem depois de is.", "Where are you from? pergunta de onde alguém é. From fecha a pergunta com a ideia de origem."],
      },
      beginner: {
        setting: "Você está em um café, em outro país. Alguém pergunta:", contextTranslation: "Você está em um café.", openingTranslation: "Você gosta de café?", translation: "Sim, eu gosto de café.", partMeanings: ["Sim,", "eu gosto", "de café."], partClueMeanings: [["sim"], ["eu", "gostar"], ["café"]], partNotes: ["Yes responde à pergunta. A pausa da vírgula prepara o detalhe que vem em seguida.", "I é quem fala; like diz do que essa pessoa gosta. Em inglês, a pessoa vem antes do verbo.", "Coffee completa a ideia: você gosta de café. Em inglês, não precisa colocar “de” antes dessa palavra."], replyTranslation: "Eu também!", replyPartMeanings: ["Eu também!"], replyClueMeanings: [["eu também"]], replyPartNotes: ["Me too! é uma resposta pronta para dizer “eu também” sem repetir a frase toda."],
      },
    },
    work: {
      standard: {
        setting: "Imagine uma reunião. Você tem uma ideia e alguém pergunta:", contextTranslation: "Estamos em uma reunião.", openingTranslation: "O que você acha?", translation: "Tenho uma ideia. Posso compartilhar?", partMeanings: ["Tenho uma ideia.", "Posso", "compartilhar?"], partClueMeanings: [["eu", "ter", "uma ideia"], ["poder", "eu"], ["compartilhar", "isso"]], partNotes: ["I have… diz o que você tem. O inglês costuma mostrar quem fala antes do verbo; an aparece antes do som de vogal em idea.", "Can I…? pede permissão. Para perguntar, can vem antes de I; numa afirmação seria I can.", "Share é a ação; it retoma a ideia já mencionada. Assim você não precisa repetir idea."], replyTranslation: "Claro. Adoraríamos ouvir.", replyPartMeanings: ["Claro.", "Adoraríamos ouvir."], replyClueMeanings: [["claro"], ["adoraríamos", "ouvir isso"]], replyPartNotes: ["Of course! é uma expressão pronta para aceitar um pedido com naturalidade: “claro!”.", "We’d love to… mostra entusiasmo e deixa hear para completar a ação. It aponta de volta para a ideia."],
      },
      beginner: {
        setting: "Um colega mostra uma ideia na reunião e pergunta:", contextTranslation: "Vamos facilitar o trabalho.", openingTranslation: "Você gosta da minha ideia?", translation: "Eu gosto da sua ideia.", partMeanings: ["Eu gosto", "da sua ideia."], partClueMeanings: [["eu", "gostar"], ["sua", "ideia"]], partNotes: ["I é quem fala e like é a opinião. A ordem comum em inglês é pessoa + verbo.", "Your vem antes do que pertence a alguém: your idea, “sua ideia”."], replyTranslation: "Obrigado(a)!", replyPartMeanings: ["Obrigado(a)!"], replyClueMeanings: [["obrigado(a)"]], replyPartNotes: ["Thank you! é a forma natural de agradecer quando alguém elogia uma ideia."],
      },
    },
    life: {
      standard: {
        setting: "Imagine que você está conhecendo alguém. A pessoa pergunta:", contextTranslation: "Vamos falar sobre música.", openingTranslation: "O que você gosta de fazer?", translation: "Eu adoro música. E você?", partMeanings: ["Eu adoro música.", "E quanto a", "você?"], partClueMeanings: [["eu", "adorar", "música"], ["como", "sobre"], ["você"]], partNotes: ["I é quem fala, love é o que sente e music completa a ideia. Em inglês, a ordem é pessoa + verbo + assunto.", "How about…? funciona como um convite para a outra pessoa responder. Aqui, o conjunto vale “e você?”, não a soma literal das palavras.", "You devolve a pergunta à outra pessoa. O resto fica subentendido porque o contexto já está claro."], replyTranslation: "Eu também! Que tipo de música?", replyPartMeanings: ["Eu também!", "Que tipo de música?"], replyClueMeanings: [["eu também"], ["que tipo de", "música"]], replyPartNotes: ["Me too! é uma resposta pronta para mostrar que você sente o mesmo, sem repetir a frase.", "What kind of…? pergunta qual tipo. Of faz parte desse bloco e music completa o assunto."],
      },
      beginner: {
        setting: "Você está conhecendo alguém. A pessoa pergunta:", contextTranslation: "Vamos falar sobre música.", openingTranslation: "Você gosta de música?", translation: "Eu adoro música.", partMeanings: ["Eu adoro", "música."], partClueMeanings: [["eu", "adorar"], ["música"]], partNotes: ["I mostra quem fala; love é o verbo. Juntos, I love quer dizer “eu adoro”.", "Music completa a ideia: é o que a pessoa adora. Em inglês, o assunto vem depois do verbo."], replyTranslation: "Eu também!", replyPartMeanings: ["Eu também!"], replyClueMeanings: [["eu também"]], replyPartNotes: ["Me too! responde “eu também” e mostra que vocês têm algo em comum."],
      },
    },
  },
};

const de: LocaleCopy = {
  languageName: "Deutsch",
  greeting: "Hallo! Schön, dass du da bist.\nWie darf ich dich nennen?",
  greetingReturning: "Schön, dass du wieder da bist, {name}!\nFinden wir deinen nächsten Schritt im Englisch?",
  askName: "Wie darf ich dich nennen?",
  afterName: "Freut mich, {name}.\nWo möchtest du Englisch am liebsten benutzen?",
  hello: "{name}, erzähl mir: Wo möchtest du Englisch am liebsten benutzen?",
  chooseScene: "Was fällt dir beim Sprechen am schwersten?",
  chooseBarrier: "Da du ganz am Anfang stehst, nehmen wir einen kurzen, vollständigen Satz:",
  sceneLabels: {
    world: { label: "Selbstständig reisen", response: "Wir nehmen Englisch mit auf deine Reisen." },
    work: { label: "Mich bei der Arbeit ausdrücken", response: "Geben wir deinen Ideen bei der Arbeit Raum." },
    life: { label: "Mit Menschen ins Gespräch kommen", response: "Wir beginnen mit einer Verbindung aus dem Alltag." },
  },
  barriers: {
    freeze: { label: "Beim Sprechen habe ich einen Blackout", description: "Ich kann schon etwas, aber im Gespräch blockiere ich.", action: "Ich habe den Satz geschafft", understand: "Ich möchte jeden Teil verstehen" },
    translate: { label: "Ich möchte sprechen, ohne alles im Kopf zu übersetzen", description: "Ich möchte Sätze bilden, ohne jedes Wort erst auf Deutsch zu denken.", action: "Ich konnte die Bausteine nutzen", understand: "Ich möchte jeden Teil verstehen" },
    words: { label: "Ich weiß, was ich sagen will, aber mir fehlen die Wörter", description: "Die Idee ist da, aber die englischen Wörter fallen mir nicht ein.", action: "Ich konnte diese Wörter nutzen", understand: "Ich möchte jeden Teil verstehen" },
    start: { label: "Ich fange ganz von vorn an", description: "Ich möchte von Anfang an mit einfachen Sätzen lernen.", action: "Ich habe den Satz geschafft", understand: "Ich möchte jeden Teil verstehen" },
  },
  guidance: {
    freeze: "Wenn du blockierst, hilft dir ein fertiger Satz beim Einstieg. Lies zuerst die ganze Antwort:",
    translate: "Denk daran, was du im Gespräch erreichen möchtest. Der ganze Satz auf Englisch lautet:",
    words: "Du musst nicht jedes Wort kennen, um zu antworten. Hier ist der ganze Satz:",
    start: "Beginnen wir mit einem kurzen Satz, den du wirklich benutzen kannst:",
  },
  lessonIntro: {
    freeze: "Jetzt findest du in jedem Teil einen Anhaltspunkt. Wenn du blockierst, beginne mit dem ersten und mach dann weiter.",
    translate: "Jetzt siehst du, welche Aufgabe jeder Teil im Gespräch hat. Die Übersetzung hilft dir, aber denk an die ganze Aussage.",
    words: "Jetzt entdeckst du nützliche Wörter im Satz und siehst, wie sie zusammengehören. So lernst du eine Antwort, nicht nur eine Wortliste.",
    start: "Jetzt sehen wir uns Schritt für Schritt an, wie dieser einfache Satz funktioniert.",
  },
  lessonTitles: {
    freeze: "EIN ANHALTSPUNKT NACH DEM ANDEREN",
    translate: "SINNBAUSTEINE",
    words: "WÖRTER IM GESPRÄCH",
    start: "DEIN ERSTER SATZ IN TEILEN",
  },
  lessonFocus: {
    freezeFirst: "DEIN EINSTIEG",
    freezeNext: "DANN DER NÄCHSTE TEIL",
    wordsAnchor: "EIN NÜTZLICHER BAUSTEIN",
    startFirst: "ERSTER SCHRITT",
    startNext: "NOCH EIN TEIL",
  },
  practiceCueTitles: {
    freeze: "WENN DU BLOCKIERST, BEGINNE HIER",
    translate: "ZWEI GEDANKEN, EINE ANTWORT",
    words: "ZWEI NÜTZLICHE WÖRTER",
  },
  freezeCueHint: "Sag erst diesen Anfang. Danach kommt der Rest des Satzes.",
  practiceIntents: {
    world: ["Mit Ja antworten", "Nach einer Empfehlung fragen"],
    work: ["Deine Idee vorstellen", "Fragen, ob du sie teilen darfst"],
    life: ["Sagen, was du magst", "Die Frage zurückgeben"],
  },
  practiceWords: {
    world: [{ phrase: "recommend", meaning: "empfehlen" }, { phrase: "what", meaning: "was" }],
    work: [{ phrase: "idea", meaning: "Idee" }, { phrase: "share", meaning: "teilen" }],
    life: [{ phrase: "music", meaning: "Musik" }, { phrase: "love", meaning: "lieben" }],
  },
  answerLessonTitle: "DEINE ANTWORT IN BAUSTEINEN",
  lessonHint: "Tippe auf einen Teil, um ihn anzuhören",
  replyIntro: "Jetzt schauen wir uns auch an, was die andere Person antworten könnte:",
  replyLessonTitle: "DIE ANTWORT DER ANDEREN PERSON",
  replyLessonHint: "Auch hier gibt es Hinweise. Tippe zum Anhören",
  ready: "Den Satz zusammensetzen",
  continue: "Das Gespräch fortsetzen",
  recapTitle: "Schau mal, welchem Gespräch du gerade folgen konntest.",
  testAnotherPath: "Einen anderen Weg ausprobieren",
  chooseAnotherBarrier: "Wir behalten die Situation bei und probieren eine andere Schwierigkeit. Was passiert bei dir, wenn du sprichst?",
  recapProgress: {
    freeze: "Du bist vom Blackout ausgegangen, hast deine Antwort gebaut und die Reaktion verstanden.",
    translate: "Du hast die Bausteine verbunden und dem ganzen Gespräch folgen können.",
    words: "Du hast Wörter als Hinweise genutzt, um zu antworten und die Reaktion zu verstehen.",
    start: "Dein erstes Gespräch auf Englisch: Du hast Frage, Antwort und Reaktion verstanden.",
  },
  speakers: { other: "Andere Person", you: "Du" },
  variants: {
    world: {
      standard: {
        setting: "Stell dir vor, du bist in einem Café im Ausland. Jemand fragt:", contextTranslation: "Du bist in einem Café.", openingTranslation: "Bist du zum ersten Mal hier?", translation: "Ja! Was empfiehlst du?", partMeanings: ["Ja!", "Was …", "empfiehlst du?"], partClueMeanings: [["ja"], ["was", "Frage an dich"], ["empfehlen"]], partNotes: ["Yes! antwortet direkt auf die Frage. Du kannst auf Englisch erst kurz bestätigen und danach noch etwas ergänzen.", "What do you…? beginnt eine Frage an die andere Person. Im Deutschen steckt die Frageform im Verb; do wird nicht als eigenes Wort übersetzt.", "Nach What do you steht recommend in seiner Grundform. Auf Deutsch wird daraus empfiehlst du?"], replyTranslation: "Der Kaffee ist sehr gut. Woher kommst du?", replyPartMeanings: ["Der Kaffee ist sehr gut.", "Woher kommst du?"], replyClueMeanings: [["Kaffee", "sehr gut"], ["wo", "her"]], replyPartNotes: ["The zeigt auf den Kaffee an diesem Ort; great beschreibt ihn. Im Englischen steht die Beschreibung nach is.", "Where are you from? fragt nach deiner Herkunft. From ergänzt die Idee „aus/von“."],
      },
      beginner: {
        setting: "Du bist in einem Café im Ausland. Jemand fragt:", contextTranslation: "Du bist in einem Café.", openingTranslation: "Magst du Kaffee?", translation: "Ja, ich mag Kaffee.", partMeanings: ["Ja,", "ich mag", "Kaffee."], partClueMeanings: [["ja"], ["ich", "mögen"], ["Kaffee"]], partNotes: ["Yes beantwortet die Frage. Das Komma macht eine kleine Pause, bevor das Detail kommt.", "I zeigt, wer spricht; like sagt, was diese Person mag. Im Englischen steht die Person vor dem Verb.", "Coffee ergänzt den Gedanken: Du magst Kaffee. Im Englischen steht hier kein Wort für „von“ davor."], replyTranslation: "Ich auch!", replyPartMeanings: ["Ich auch!"], replyClueMeanings: [["ich auch"]], replyPartNotes: ["Me too! ist eine feste Antwort für „ich auch“, ohne den ganzen Satz zu wiederholen."],
      },
    },
    work: {
      standard: {
        setting: "Stell dir ein Meeting vor. Du hast eine Idee und jemand fragt:", contextTranslation: "Wir sind in einem Meeting.", openingTranslation: "Was denkst du?", translation: "Ich habe eine Idee. Kann ich sie teilen?", partMeanings: ["Ich habe eine Idee.", "Kann ich", "sie teilen?"], partClueMeanings: [["ich", "haben", "eine Idee"], ["können", "ich"], ["teilen", "sie/es"]], partNotes: ["I have… sagt, was du hast. Im Englischen kommt die Person vor dem Verb; an steht vor dem Vokallaut in idea.", "Can I…? bittet um Erlaubnis. In der Frage steht can vor I; in einer Aussage wäre es I can.", "Share ist die Handlung; it verweist auf die Idee, die schon erwähnt wurde. So musst du idea nicht wiederholen."], replyTranslation: "Natürlich. Wir würden sie gern hören.", replyPartMeanings: ["Natürlich.", "Wir würden sie gern hören."], replyClueMeanings: [["natürlich"], ["würden gern", "sie hören"]], replyPartNotes: ["Of course! ist eine feste, natürliche Zusage: „Natürlich!“.", "We’d love to… zeigt Begeisterung; hear ergänzt danach die Handlung. It verweist zurück auf die Idee."],
      },
      beginner: {
        setting: "Eine Kollegin oder ein Kollege zeigt eine Idee und fragt:", contextTranslation: "Machen wir die Arbeit einfacher.", openingTranslation: "Gefällt dir meine Idee?", translation: "Ich mag deine Idee.", partMeanings: ["Ich mag", "deine Idee."], partClueMeanings: [["ich", "mögen"], ["deine", "Idee"]], partNotes: ["I zeigt, wer spricht, und like sagt die Meinung. Die einfache englische Reihenfolge ist Person + Verb.", "Your steht vor dem, was jemandem gehört: your idea heißt „deine Idee“."], replyTranslation: "Danke!", replyPartMeanings: ["Danke!"], replyClueMeanings: [["danke"]], replyPartNotes: ["Thank you! ist die natürliche Art, sich für ein Lob zu bedanken."],
      },
    },
    life: {
      standard: {
        setting: "Stell dir vor, du lernst jemanden kennen. Die Person fragt:", contextTranslation: "Lass uns über Musik sprechen.", openingTranslation: "Was machst du gern?", translation: "Ich liebe Musik. Und du?", partMeanings: ["Ich liebe Musik.", "Und wie ist es mit", "dir?"], partClueMeanings: [["ich", "lieben", "Musik"], ["wie", "über"], ["du"]], partNotes: ["I ist die Person, die spricht; love ist das Gefühl und music ergänzt den Gedanken. Die Reihenfolge ist Person + Verb + Thema.", "How about…? lädt die andere Person zum Antworten ein. Hier bedeutet der ganze Ausdruck „Und du?“, nicht die wörtliche Summe der Wörter.", "You gibt die Frage an die andere Person zurück. Der Rest ist klar und muss nicht wiederholt werden."], replyTranslation: "Ich auch! Welche Art von Musik?", replyPartMeanings: ["Ich auch!", "Welche Art von Musik?"], replyClueMeanings: [["ich auch"], ["welche Art von", "Musik"]], replyPartNotes: ["Me too! zeigt, dass du genauso empfindest, ohne den Satz zu wiederholen.", "What kind of…? fragt nach der Art. Of gehört zu diesem Ausdruck; music ergänzt das Thema."],
      },
      beginner: {
        setting: "Du lernst jemanden kennen. Die Person fragt:", contextTranslation: "Lass uns über Musik sprechen.", openingTranslation: "Magst du Musik?", translation: "Ich liebe Musik.", partMeanings: ["Ich liebe", "Musik."], partClueMeanings: [["ich", "lieben"], ["Musik"]], partNotes: ["I zeigt, wer spricht; love ist das Verb. Zusammen heißt I love: „Ich liebe“.", "Music ergänzt den Gedanken: Das ist, was die Person liebt. Im Englischen steht das Thema nach dem Verb."], replyTranslation: "Ich auch!", replyPartMeanings: ["Ich auch!"], replyClueMeanings: [["ich auch"]], replyPartNotes: ["Me too! heißt „Ich auch!“ und zeigt, dass ihr etwas gemeinsam habt."],
      },
    },
  },
};

const es: LocaleCopy = {
  languageName: "Español",
  greeting: "¡Hola! Me alegra que estés aquí.\n¿Cómo te gusta que te llamen?",
  greetingReturning: "¡Qué bueno verte de nuevo, {name}!\nBusquemos tu próximo paso en inglés.",
  askName: "¿Cómo te gusta que te llamen?",
  afterName: "Mucho gusto, {name}.\n¿Dónde te gustaría usar más el inglés?",
  hello: "{name}, cuéntame: ¿dónde te gustaría usar más el inglés?",
  chooseScene: "¿Qué es lo que más te cuesta al hablar?",
  chooseBarrier: "Como estás empezando desde cero, vamos con una frase corta y completa:",
  sceneLabels: {
    world: { label: "Viajar con libertad", response: "Llevemos el inglés a tus viajes." },
    work: { label: "Expresarme en el trabajo", response: "Démosle espacio a tus ideas en el trabajo." },
    life: { label: "Conversar con otras personas", response: "Empecemos con una conexión cotidiana." },
  },
  barriers: {
    freeze: { label: "Al hablar, me quedo en blanco", description: "Sé un poco, pero me bloqueo en la conversación.", action: "Ya pude formar la frase", understand: "Quiero entender cada parte" },
    translate: { label: "Quiero hablar sin traducirlo todo mentalmente", description: "Quiero formar frases sin pensar cada palabra primero en español.", action: "Ya pude usar los bloques", understand: "Quiero entender cada parte" },
    words: { label: "Sé lo que quiero decir, pero me faltan las palabras", description: "Tengo la idea, pero no encuentro las palabras en inglés.", action: "Ya pude usar estas palabras", understand: "Quiero entender cada parte" },
    start: { label: "Estoy empezando desde cero", description: "Quiero aprender desde el principio con frases sencillas.", action: "Ya pude formar la frase", understand: "Quiero entender cada parte" },
  },
  guidance: {
    freeze: "Si te quedas en blanco, una respuesta preparada te ayuda a empezar. Lee la frase completa:",
    translate: "Piensa en lo que quieres hacer en la conversación. La frase completa en inglés es:",
    words: "No necesitas conocer todas las palabras para responder. Mira la frase completa:",
    start: "Empecemos con una frase corta que puedes usar de verdad:",
  },
  lessonIntro: {
    freeze: "Ahora encuentra una pista en cada parte. Si te quedas en blanco, empieza por la primera y sigue después.",
    translate: "Ahora mira qué hace cada parte en la conversación. La traducción está al lado para ayudarte, pero piensa en la idea completa.",
    words: "Ahora encuentra las palabras útiles dentro de la frase y observa cómo se unen. Así aprendes una respuesta, no solo una lista.",
    start: "Ahora descubre, parte por parte, cómo funciona esta frase sencilla.",
  },
  lessonTitles: {
    freeze: "UNA PISTA A LA VEZ",
    translate: "BLOQUES DE SENTIDO",
    words: "PALABRAS EN LA CONVERSACIÓN",
    start: "TU PRIMERA FRASE, POR PARTES",
  },
  lessonFocus: {
    freezeFirst: "TU PUNTO DE PARTIDA",
    freezeNext: "SIGUE CON LA PRÓXIMA PARTE",
    wordsAnchor: "UNA PARTE ÚTIL",
    startFirst: "PRIMER PASO",
    startNext: "UNA PARTE MÁS",
  },
  practiceCueTitles: {
    freeze: "SI TE QUEDAS EN BLANCO, EMPIEZA AQUÍ",
    translate: "DOS IDEAS, UNA RESPUESTA",
    words: "DOS PALABRAS PARA RECORDAR",
  },
  freezeCueHint: "Di solo este comienzo. Después, continúa con el resto de la frase.",
  practiceIntents: {
    world: ["Responder que sí", "Pedir una recomendación"],
    work: ["Presentar tu idea", "Pedir permiso para compartirla"],
    life: ["Decir lo que te gusta", "Devolver la pregunta"],
  },
  practiceWords: {
    world: [{ phrase: "recommend", meaning: "recomendar" }, { phrase: "what", meaning: "qué" }],
    work: [{ phrase: "idea", meaning: "idea" }, { phrase: "share", meaning: "compartir" }],
    life: [{ phrase: "music", meaning: "música" }, { phrase: "love", meaning: "encantar / amar" }],
  },
  answerLessonTitle: "TU RESPUESTA, POR PARTES",
  lessonHint: "Toca cada parte para escucharla",
  replyIntro: "Ahora vamos a entender también lo que podría responder la otra persona:",
  replyLessonTitle: "LA RESPUESTA DE LA OTRA PERSONA",
  replyLessonHint: "También tiene pistas. Toca para escuchar",
  ready: "Unir la frase",
  continue: "Continuar la conversación",
  recapTitle: "Mira la conversación que acabas de poder seguir.",
  testAnotherPath: "Probar otro camino",
  chooseAnotherBarrier: "Mantengamos la situación y probemos otra dificultad. ¿Qué te pasa cuando hablas?",
  recapProgress: {
    freeze: "Empezaste quedándote en blanco, formaste tu respuesta y entendiste lo que vino después.",
    translate: "Conectaste los bloques de significado y seguiste toda la conversación.",
    words: "Usaste palabras como pistas para responder y entender la reacción.",
    start: "Tu primera conversación en inglés: entendiste la pregunta, la respuesta y la reacción.",
  },
  speakers: { other: "La otra persona", you: "Tú" },
  variants: {
    world: {
      standard: {
        setting: "Imagina que estás en una cafetería, en otro país. Alguien pregunta:", contextTranslation: "Estás en una cafetería.", openingTranslation: "¿Es tu primera vez aquí?", translation: "¡Sí! ¿Qué recomiendas?", partMeanings: ["¡Sí!", "¿Qué …", "recomiendas?"], partClueMeanings: [["sí"], ["qué", "pregunta dirigida a ti"], ["recomendar"]], partNotes: ["Yes! responde directamente a la pregunta. En inglés puedes confirmar primero y añadir un detalle después.", "What do you…? inicia una pregunta dirigida a la otra persona. En español basta con ¿Qué…?; do no se traduce por separado.", "Recommend completa la pregunta. En español se conjuga como recomiendas, aunque en inglés el verbo queda igual."], replyTranslation: "El café está muy bueno. ¿De dónde eres?", replyPartMeanings: ["El café está muy bueno.", "¿De dónde eres?"], replyClueMeanings: [["café", "muy bueno"], ["dónde", "de"]], replyPartNotes: ["The señala ese café del lugar; great lo describe. En inglés, la descripción va después de is.", "Where are you from? pregunta de dónde eres. From completa la idea de origen."],
      },
      beginner: {
        setting: "Estás en una cafetería, en otro país. Alguien pregunta:", contextTranslation: "Estás en una cafetería.", openingTranslation: "¿Te gusta el café?", translation: "Sí, me gusta el café.", partMeanings: ["Sí,", "me gusta", "el café."], partClueMeanings: [["sí"], ["yo / me", "gustar"], ["café"]], partNotes: ["Yes responde a la pregunta. La pausa de la coma prepara el detalle que viene después.", "I like se expresa como me gusta en español. En inglés, I va primero y like no cambia aquí; no traduzcas cada palabra en el mismo orden.", "Coffee completa la idea: me gusta el café. En inglés no hace falta poner el antes de coffee."], replyTranslation: "¡A mí también!", replyPartMeanings: ["¡A mí también!"], replyClueMeanings: [["a mí también"]], replyPartNotes: ["Me too! es una respuesta fija para decir «yo también» sin repetir toda la frase."],
      },
    },
    work: {
      standard: {
        setting: "Imagina una reunión. Tienes una idea y alguien pregunta:", contextTranslation: "Estamos en una reunión.", openingTranslation: "¿Qué te parece?", translation: "Tengo una idea. ¿Puedo compartirla?", partMeanings: ["Tengo una idea.", "¿Puedo", "compartirla?"], partClueMeanings: [["yo", "tener", "una idea"], ["poder", "yo"], ["compartir", "eso"]], partNotes: ["I have… dice lo que tienes. En inglés suele aparecer primero quién habla; an va antes del sonido vocálico de idea.", "Can I…? pide permiso. En la pregunta, can va antes de I; en una afirmación sería I can.", "Share es la acción; it se refiere a la idea que ya mencionaste. Así no tienes que repetir idea."], replyTranslation: "Por supuesto. Nos encantaría escucharla.", replyPartMeanings: ["Por supuesto.", "Nos encantaría escucharla."], replyClueMeanings: [["por supuesto"], ["nos encantaría", "escucharla"]], replyPartNotes: ["Of course! es una expresión natural para aceptar una petición: «¡Claro!».", "We’d love to… expresa entusiasmo; hear completa la acción. It vuelve a referirse a la idea."],
      },
      beginner: {
        setting: "Un compañero muestra una idea en la reunión y pregunta:", contextTranslation: "Hagamos el trabajo más fácil.", openingTranslation: "¿Te gusta mi idea?", translation: "Me gusta tu idea.", partMeanings: ["Me gusta", "tu idea."], partClueMeanings: [["yo / me", "gustar"], ["tu", "idea"]], partNotes: ["I like se expresa como me gusta en español. El inglés pone primero a quien habla: I like; no copies el orden del español.", "Your va antes de lo que pertenece a alguien: your idea significa «tu idea»."], replyTranslation: "¡Gracias!", replyPartMeanings: ["¡Gracias!"], replyClueMeanings: [["gracias"]], replyPartNotes: ["Thank you! es la forma natural de dar las gracias cuando alguien elogia una idea."],
      },
    },
    life: {
      standard: {
        setting: "Imagina que acabas de conocer a alguien. La persona pregunta:", contextTranslation: "Hablemos de música.", openingTranslation: "¿Qué te gusta hacer?", translation: "Me encanta la música. ¿Y a ti?", partMeanings: ["Me encanta la música.", "¿Y a", "ti?"], partClueMeanings: [["yo / me", "encantar", "música"], ["cómo", "sobre"], ["ti"]], partNotes: ["I love music se expresa como me encanta la música. En inglés, I va primero; en español cambia la estructura.", "How about…? invita a la otra persona a responder. Aquí la expresión funciona como ¿Y a…?, no como la suma literal de sus palabras.", "You devuelve la pregunta a la otra persona: How about you? equivale a ¿Y a ti?"], replyTranslation: "¡A mí también! ¿Qué tipo de música?", replyPartMeanings: ["¡A mí también!", "¿Qué tipo de música?"], replyClueMeanings: [["a mí también"], ["qué tipo de", "música"]], replyPartNotes: ["Me too! muestra que sientes lo mismo, sin repetir toda la frase.", "What kind of…? pregunta por el tipo. Of forma parte de esa expresión y music completa el tema."],
      },
      beginner: {
        setting: "Estás conociendo a alguien. La persona pregunta:", contextTranslation: "Hablemos de música.", openingTranslation: "¿Te gusta la música?", translation: "Me encanta la música.", partMeanings: ["Me encanta", "la música."], partClueMeanings: [["yo", "encantar"], ["música"]], partNotes: ["I indica quién habla; love es el verbo. Juntos, I love significa «me encanta».", "Music completa la idea: es lo que le encanta a la persona. En inglés, el tema va después del verbo."], replyTranslation: "¡A mí también!", replyPartMeanings: ["¡A mí también!"], replyClueMeanings: [["a mí también"]], replyPartNotes: ["Me too! significa «a mí también» y muestra que tienen algo en común."],
      },
    },
  },
};

export const localeCopy: Record<LearningLanguage, LocaleCopy> = { pt, de, es };

export function localizedVariant(
  language: LearningLanguage,
  sceneId: SceneId,
  beginner: boolean,
): LocalizedVariant {
  return localeCopy[language].variants[sceneId][beginner ? "beginner" : "standard"];
}

export function languageLabel(language: LearningLanguage): string {
  const target = language === "de" ? "Englisch" : language === "es" ? "Inglés" : "Inglês";
  return `${localeCopy[language].languageName} → ${target}`;
}

export function isLearningLanguage(value: unknown): value is LearningLanguage {
  return value === "pt" || value === "de" || value === "es";
}

import type { LearningLanguage } from "./language";

export type MusicAnswer = "love" | "hate";

export const musicAnswers = {
  love: { phrase: "I love music.", verb: "love", reply: "Me too!" },
  hate: { phrase: "I hate music.", verb: "hate", reply: "Oh, really?" },
} as const;

type AnswerCopy = {
  meaning: string;
  parts: [string, string, string];
  clues: [string, string, string];
  notes: [string, string, string];
  replyMeaning: string;
  replyNote: string;
};

type MusicStarterCopy = {
  translate: string;
  respond: string;
  choose: string;
  draft: string;
  draftHint: string;
  understand: string;
  lessonIntro: string;
  lessonTitle: string;
  lessonHint: string;
  contrastTitle: string;
  love: string;
  hate: string;
  context: string;
  progress: string;
  reactionIntro: string;
  answers: Record<MusicAnswer, AnswerCopy>;
};

export const musicStarterCopy: Record<LearningLanguage, MusicStarterCopy> = {
  pt: {
    translate: "Ver a tradução", respond: "Responder",
    choose: "Qual resposta combina com você? Escolha uma para experimentar.",
    draft: "Sua resposta pode ser:", draftHint: "Quer entender o que significa antes de responder?",
    understand: "Quero entender o que significa",
    lessonIntro: "Vamos lá{address}. “{phrase}” significa “{meaning}”. Veja como as três palavras se juntam:",
    lessonTitle: "SUA RESPOSTA, PALAVRA POR PALAVRA", lessonHint: "Toque para ouvir cada palavra",
    contrastTitle: "UMA PALAVRA MUDA A OPINIÃO", love: "adorar", hate: "detestar",
    context: "Você está conhecendo alguém.",
    progress: "Você escolheu uma resposta em inglês e acompanhou a reação da outra pessoa.",
    reactionIntro: "Você respondeu. Agora veja como a outra pessoa reage:",
    answers: {
      love: {
        meaning: "Eu adoro música.", parts: ["Eu", "adoro", "música."], clues: ["eu", "adorar", "música"],
        notes: [
          "I é eu: quem está falando. Em inglês, esse I fica sempre em letra maiúscula.",
          "Love aqui é adoro. Junte I + love e você já disse eu adoro. É um jeito de dizer que gosta muito.",
          "Music é música. Adoro o quê? Música! Ela completa a ideia sem precisar de outra palavra no meio.",
        ],
        replyMeaning: "Eu também!", replyNote: "Me too! é eu também. A pessoa está dizendo que também adora música, sem repetir a frase toda.",
      },
      hate: {
        meaning: "Eu detesto música.", parts: ["Eu", "detesto", "música."], clues: ["eu", "detestar", "música"],
        notes: [
          "I é eu: quem está falando. Em inglês, esse I fica sempre em letra maiúscula.",
          "Hate é detesto. Ele ocupa o lugar de love e muda sua opinião. É uma palavra forte: use se for isso mesmo que quer dizer.",
          "Music é música. Detesto o quê? Música! I e music continuam iguais; só a palavra do meio mudou.",
        ],
        replyMeaning: "Ah, é mesmo?", replyNote: "Oh, really? mostra surpresa ou curiosidade. A pessoa ouviu sua opinião e quer saber mais; não está dizendo que concorda.",
      },
    },
  },
  es: {
    translate: "Ver la traducción", respond: "Responder",
    choose: "¿Qué respuesta va contigo? Elige una para probar.",
    draft: "Tu respuesta puede ser:", draftHint: "¿Quieres entender qué significa antes de responder?",
    understand: "Quiero entender qué significa",
    lessonIntro: "Vamos allá{address}. “{phrase}” significa “{meaning}”. Mira cómo se unen las tres palabras:",
    lessonTitle: "TU RESPUESTA, PALABRA POR PALABRA", lessonHint: "Toca para escuchar cada palabra",
    contrastTitle: "UNA PALABRA CAMBIA LA OPINIÓN", love: "adorar", hate: "detestar",
    context: "Estás conociendo a alguien.",
    progress: "Elegiste una respuesta en inglés y seguiste la reacción de la otra persona.",
    reactionIntro: "Ya respondiste. Ahora mira cómo reacciona la otra persona:",
    answers: {
      love: {
        meaning: "Yo adoro la música.", parts: ["Yo", "adoro", "la música."], clues: ["yo", "adorar", "música"],
        notes: [
          "I es yo: quien habla. En inglés siempre se escribe con mayúscula, incluso en mitad de una frase.",
          "Love aquí es adoro. Con I + love ya dices yo adoro. El inglés necesita I; en español puedes decir simplemente adoro.",
          "Music es música. ¿Qué adoras? ¡La música! En inglés no necesitas poner el artículo the antes de music aquí.",
        ],
        replyMeaning: "¡Yo también!", replyNote: "Me too! significa yo también. La otra persona también adora la música y no necesita repetir la frase completa.",
      },
      hate: {
        meaning: "Yo detesto la música.", parts: ["Yo", "detesto", "la música."], clues: ["yo", "detestar", "música"],
        notes: [
          "I es yo: quien habla. En inglés siempre se escribe con mayúscula, incluso en mitad de una frase.",
          "Hate es detestar. Ocupa el lugar de love y cambia tu opinión. Es una palabra fuerte: úsala si eso es lo que quieres decir.",
          "Music es música. ¿Qué detestas? ¡La música! I y music siguen igual; solo cambió la palabra del medio.",
        ],
        replyMeaning: "¿Ah, sí?", replyNote: "Oh, really? expresa sorpresa o curiosidad. La otra persona quiere saber más; no está diciendo que opine lo mismo.",
      },
    },
  },
  de: {
    translate: "Übersetzung ansehen", respond: "Antworten",
    choose: "Welche Antwort passt zu dir? Wähle eine zum Ausprobieren.",
    draft: "Deine Antwort könnte lauten:", draftHint: "Möchtest du erst verstehen, was das bedeutet?",
    understand: "Ich möchte die Bedeutung verstehen",
    lessonIntro: "Los geht’s{address}. „{phrase}“ bedeutet „{meaning}“. So passen die drei Wörter zusammen:",
    lessonTitle: "DEINE ANTWORT, WORT FÜR WORT", lessonHint: "Tippe, um jedes Wort zu hören",
    contrastTitle: "EIN WORT ÄNDERT DEINE MEINUNG", love: "lieben", hate: "hassen",
    context: "Du lernst gerade jemanden kennen.",
    progress: "Du hast eine Antwort auf Englisch gewählt und die Reaktion der anderen Person mitverfolgt.",
    reactionIntro: "Du hast geantwortet. Jetzt sieh dir an, wie die andere Person reagiert:",
    answers: {
      love: {
        meaning: "Ich liebe Musik.", parts: ["Ich", "liebe", "Musik."], clues: ["ich", "lieben", "Musik"],
        notes: [
          "I heißt ich: die Person, die spricht. Im Englischen wird dieses I immer großgeschrieben.",
          "Love heißt hier liebe. Mit I + love sagst du schon ich liebe. So zeigst du, dass du etwas sehr magst.",
          "Music heißt Musik. Was liebst du? Musik! Das Wort vervollständigt deinen Gedanken, ohne ein zusätzliches Wort dazwischen.",
        ],
        replyMeaning: "Ich auch!", replyNote: "Me too! heißt ich auch. Die andere Person liebt ebenfalls Musik und muss nicht den ganzen Satz wiederholen.",
      },
      hate: {
        meaning: "Ich hasse Musik.", parts: ["Ich", "hasse", "Musik."], clues: ["ich", "hassen", "Musik"],
        notes: [
          "I heißt ich: die Person, die spricht. Im Englischen wird dieses I immer großgeschrieben.",
          "Hate heißt hier hasse. Es steht an derselben Stelle wie love und ändert deine Meinung. Das ist ein starkes Wort: Nutze es, wenn du es so meinst.",
          "Music heißt Musik. Was hasst du? Musik! I und music bleiben gleich; nur das Wort in der Mitte ändert sich.",
        ],
        replyMeaning: "Ach, wirklich?", replyNote: "Oh, really? drückt Überraschung oder Neugier aus. Die andere Person möchte mehr erfahren; sie stimmt dir damit nicht automatisch zu.",
      },
    },
  },
};

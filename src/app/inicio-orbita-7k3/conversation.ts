import {
  normalizeVisitorName,
  visitorNameError,
} from "@/lib/welcome/visitor-name";

export type Stage =
  | "name"
  | "hello"
  | "scene"
  | "barrier"
  | "practice"
  | "lesson"
  | "replyLesson"
  | "done";
export type LessonCard = {
  phrase: string;
  translation: string;
  clues: { english: string; portuguese: string }[];
  note: string;
};
export type ConversationRecap = {
  context: { phrase: string; translation: string };
  turns: { speaker: string; phrase: string; translation: string }[];
  progress: string;
};
export type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
  speech?: string[];
  lesson?: LessonCard[];
  lessonTitle?: string;
  lessonHint?: string;
  recap?: ConversationRecap;
};
export type Choice = { id: string; label: string };

const scenes = [
  {
    id: "world",
    label: "Viajar com liberdade",
    response: "Vamos levar o inglês para as suas viagens.",
    setting:
      "Imagine que você está em um café, em outro país. Alguém pergunta:",
    contextLine: "You are in a café.",
    contextTranslation: "Você está em um café.",
    opening: "Is this your first time here?",
    openingTranslation: "É a sua primeira vez aqui?",
    phrase: "Yes! What do you recommend?",
    translation: "Sim! O que você recomenda?",
    parts: ["Yes!", "What do you", "recommend?"],
    partMeanings: ["Sim!", "O que você", "recomenda?"],
    partClues: [
      [{ english: "Yes", portuguese: "sim" }],
      [
        { english: "what", portuguese: "o que" },
        { english: "do you", portuguese: "você" },
      ],
      [{ english: "recommend", portuguese: "recomendar" }],
    ],
    partNotes: [
      "Uma resposta curta já confirma: sim!",
      "What do you… já começa a pergunta: “o que você…?”.",
      "Recommend é recomendar. Em viagem, é um jeito ótimo de pedir uma sugestão.",
    ],
    vocabulary: ["recommend = recomendar", "coffee = café"],
    reply: "The coffee is great. Where are you from?",
    replyTranslation: "O café é ótimo. De onde você é?",
    replyParts: ["The coffee is great.", "Where are you from?"],
    replyPartMeanings: ["O café é ótimo.", "De onde você é?"],
    replyPartClues: [
      [
        { english: "coffee", portuguese: "café" },
        { english: "great", portuguese: "ótimo" },
      ],
      [
        { english: "where", portuguese: "onde" },
        { english: "from", portuguese: "de" },
      ],
    ],
    replyPartNotes: [
      "The coffee é “o café”; great dá a ideia de “ótimo”.",
      "Where are you from? é uma pergunta comum para conhecer alguém.",
    ],
    beginner: {
      setting: "Você está em um café, em outro país. Alguém pergunta:",
      contextLine: "You are in a café.",
      contextTranslation: "Você está em um café.",
      opening: "Do you like coffee?",
      openingTranslation: "Você gosta de café?",
      phrase: "Yes, I like coffee.",
      translation: "Sim, eu gosto de café.",
      parts: ["Yes,", "I like", "coffee."],
      partMeanings: ["Sim,", "eu gosto", "de café."],
      partClues: [
        [{ english: "yes", portuguese: "sim" }],
        [
          { english: "I", portuguese: "eu" },
          { english: "like", portuguese: "gosto" },
        ],
        [{ english: "coffee", portuguese: "café" }],
      ],
      partNotes: [
        "Yes é uma resposta curtinha para dizer “sim”.",
        "I like é “eu gosto”. Você já montou o começo da ideia!",
        "Coffee é café. Pronto: você falou do que gosta.",
      ],
      vocabulary: ["coffee = café", "like = gostar"],
      reply: "Me too!",
      replyTranslation: "Eu também!",
      replyParts: ["Me too!"],
      replyPartMeanings: ["Eu também!"],
      replyPartClues: [[{ english: "me too", portuguese: "eu também" }]],
      replyPartNotes: ["A pessoa também gosta de café. Vocês já têm algo em comum!"],
    },
  },
  {
    id: "work",
    label: "Me expressar no trabalho",
    response: "Vamos dar espaço às suas ideias no trabalho.",
    setting: "Imagine uma reunião. Você tem uma ideia e alguém pergunta:",
    contextLine: "We are in a meeting.",
    contextTranslation: "Estamos em uma reunião.",
    opening: "What do you think?",
    openingTranslation: "O que você acha?",
    phrase: "I have an idea. Can I share it?",
    translation: "Tenho uma ideia. Posso compartilhar?",
    parts: ["I have an idea.", "Can I", "share it?"],
    partMeanings: ["Tenho uma ideia.", "Posso", "compartilhar?"],
    partClues: [
      [
        { english: "I", portuguese: "eu" },
        { english: "have", portuguese: "tenho" },
        { english: "an idea", portuguese: "uma ideia" },
      ],
      [
        { english: "can", portuguese: "posso" },
        { english: "I", portuguese: "eu" },
      ],
      [
        { english: "share", portuguese: "compartilhar" },
        { english: "it", portuguese: "isso" },
      ],
    ],
    partNotes: [
      "I have… apresenta algo que você tem: uma ideia.",
      "Can I…? pede licença: “posso…?”.",
      "Share it é compartilhar essa ideia com o grupo.",
    ],
    vocabulary: ["idea = ideia", "share = compartilhar"],
    reply: "Of course. We'd love to hear it.",
    replyTranslation: "Claro. Adoraríamos ouvir.",
    replyParts: ["Of course.", "We'd love to hear it."],
    replyPartMeanings: ["Claro.", "Adoraríamos ouvir."],
    replyPartClues: [
      [{ english: "of course", portuguese: "claro" }],
      [
        { english: "we'd love to", portuguese: "adoraríamos" },
        { english: "hear it", portuguese: "ouvir isso" },
      ],
    ],
    replyPartNotes: [
      "Of course! é um “claro!” simpático e direto.",
      "We'd love to… mostra entusiasmo: “adoraríamos…”.",
    ],
    beginner: {
      setting: "Um colega mostra uma ideia na reunião e pergunta:",
      contextLine: "Let's make work easier.",
      contextTranslation: "Vamos facilitar o trabalho.",
      opening: "Do you like my idea?",
      openingTranslation: "Você gosta da minha ideia?",
      phrase: "I like your idea.",
      translation: "Eu gosto da sua ideia.",
      parts: ["I like", "your idea."],
      partMeanings: ["Eu gosto", "da sua ideia."],
      partClues: [
        [
          { english: "I", portuguese: "eu" },
          { english: "like", portuguese: "gosto" },
        ],
        [
          { english: "your", portuguese: "sua" },
          { english: "idea", portuguese: "ideia" },
        ],
      ],
      partNotes: [
        "I like é “eu gosto”. Uma forma simples e direta de dar sua opinião.",
        "Your idea é “sua ideia”. Você já conseguiu falar o que pensa na reunião!",
      ],
      vocabulary: ["like = gostar", "idea = ideia"],
      reply: "Thank you!",
      replyTranslation: "Obrigado(a)!",
      replyParts: ["Thank you!"],
      replyPartMeanings: ["Obrigado(a)!"],
      replyPartClues: [[{ english: "thank you", portuguese: "obrigado(a)" }]],
      replyPartNotes: ["Uma resposta curta e simpática depois de receber um elogio."],
    },
  },
  {
    id: "life",
    label: "Conversar com as pessoas",
    response: "Vamos começar por uma conexão do dia a dia.",
    setting: "Imagine que você está conhecendo alguém. A pessoa pergunta:",
    contextLine: "Let's talk about music.",
    contextTranslation: "Vamos falar sobre música.",
    opening: "What do you like to do?",
    openingTranslation: "O que você gosta de fazer?",
    phrase: "I love music. How about you?",
    translation: "Eu adoro música. E você?",
    parts: ["I love music.", "How about", "you?"],
    partMeanings: ["Eu adoro música.", "E quanto a", "você?"],
    partClues: [
      [
        { english: "I", portuguese: "eu" },
        { english: "love", portuguese: "adoro" },
        { english: "music", portuguese: "música" },
      ],
      [
        { english: "how", portuguese: "como" },
        { english: "about", portuguese: "sobre" },
      ],
      [{ english: "you", portuguese: "você" }],
    ],
    partNotes: [
      "Não precisa saber tudo: love e music dão pistas. O sentido já começa a aparecer!",
      "How é “como” e about é “sobre”. Mas juntas, How about…? vira um convite: “E quanto a…?”.",
      "Agora devolva a bola: e você? A conversa continua com a outra pessoa.",
    ],
    vocabulary: ["love = adoro", "How about you? = E você?"],
    reply: "Me too! What kind of music?",
    replyTranslation: "Eu também! Que tipo de música?",
    replyParts: ["Me too!", "What kind of music?"],
    replyPartMeanings: ["Eu também!", "Que tipo de música?"],
    replyPartClues: [
      [{ english: "me too", portuguese: "eu também" }],
      [
        { english: "what kind of", portuguese: "que tipo de" },
        { english: "music", portuguese: "música" },
      ],
    ],
    replyPartNotes: [
      "Me too! é uma forma rápida de dizer que vocês têm algo em comum.",
      "What kind of…? pergunta “que tipo de…?”. A conversa segue pelo assunto que vocês gostam.",
    ],
    beginner: {
      setting: "Você está conhecendo alguém. A pessoa pergunta:",
      contextLine: "Let's talk about music.",
      contextTranslation: "Vamos falar sobre música.",
      opening: "Do you like music?",
      openingTranslation: "Você gosta de música?",
      phrase: "I love music.",
      translation: "Eu adoro música.",
      parts: ["I love", "music."],
      partMeanings: ["Eu adoro", "música."],
      partClues: [
        [
          { english: "I", portuguese: "eu" },
          { english: "love", portuguese: "adoro" },
        ],
        [{ english: "music", portuguese: "música" }],
      ],
      partNotes: [
        "Love é uma palavra que muita gente já reconhece. Aqui, quer dizer “adoro”.",
        "Music é música. Duas pistas e você já entendeu a ideia!",
      ],
      vocabulary: ["love = adoro", "music = música"],
      reply: "Me too!",
      replyTranslation: "Eu também!",
      replyParts: ["Me too!"],
      replyPartMeanings: ["Eu também!"],
      replyPartClues: [[{ english: "me too", portuguese: "eu também" }]],
      replyPartNotes: ["A pessoa também gosta de música: a conversa já criou conexão."],
    },
  },
];

export const welcomeSpeechPhrases = Array.from(
    new Set(
      scenes.flatMap((scene) => [
        scene.opening,
        scene.phrase,
        scene.reply,
        scene.contextLine,
        ...scene.parts,
        ...scene.replyParts,
        scene.beginner.opening,
        scene.beginner.phrase,
        scene.beginner.reply,
        scene.beginner.contextLine,
        ...scene.beginner.parts,
        ...scene.beginner.replyParts,
      ]),
  ),
);

const barriers = [
  {
    id: "freeze",
    label: "Na hora, dá branco",
    actionLabel: "Consegui montar a frase",
    translateLabel: "Quero entender cada parte",
    focus: "Podemos começar com frases curtas, para você encontrar sua voz.",
  },
  {
    id: "translate",
    label: "Traduzo tudo na cabeça",
    actionLabel: "Consegui usar os blocos",
    translateLabel: "Quero conferir o sentido",
    focus:
      "Podemos praticar pequenas ideias completas, sem traduzir cada palavra.",
  },
  {
    id: "words",
    label: "Faltam as palavras",
    actionLabel: "Consegui usar essas palavras",
    translateLabel: "Quero ver a frase completa",
    focus: "Podemos ampliar seu repertório com frases que cabem na sua vida.",
  },
  {
    id: "start",
    label: "Estou começando do zero",
    actionLabel: "Li cada parte",
    translateLabel: "Ver tradução",
    focus: "Podemos construir sua base, uma conversa de cada vez.",
  },
];

type Scene = (typeof scenes)[number];
type Barrier = (typeof barriers)[number];

function sceneForBarrier(scene: Scene, barrier: Barrier): Scene {
  return barrier.id === "start" ? { ...scene, ...scene.beginner } : scene;
}

function numberedParts(scene: Scene) {
  return scene.parts
    .map((part, index) => `${index + 1}. ${part} — ${scene.partMeanings[index]}`)
    .join("\n");
}

function buildPracticeMessage(scene: Scene, barrier: Barrier) {
  const situation = `${scene.setting}\n“${scene.opening}” — ${scene.openingTranslation}`;

  switch (barrier.id) {
    case "freeze":
      return `${situation}\n\nVocê disse que dá branco na hora de falar. Então não tente lembrar a frase inteira. Vamos montar a resposta em três pedaços:\n\n${numberedParts(scene)}\n\nLeia um pedaço, faça uma pausa e junte o próximo.`;
    case "translate":
      return `${situation}\n\nVocê disse que traduz tudo na cabeça. Vamos usar blocos prontos, sem montar palavra por palavra:\n\n${numberedParts(scene)}\n\nLeia cada bloco como uma ideia completa e depois junte os três.`;
    case "words":
      return `${situation}\n\nVocê disse que faltam as palavras. Para esta conversa, guarde só estas duas:\n\n${scene.vocabulary.join("\n")}\n\nAgora use as duas na resposta. Em três partes:\n${numberedParts(scene)}`;
    case "start":
      return `${situation}\n\nComo você está começando do zero, vamos por partes. Você pode responder:\n“${scene.phrase}” — ${scene.translation}\n\nLeia devagar, uma parte por vez:\n${numberedParts(scene)}`;
    default:
      return situation;
  }
}

function buildTranslationSupport(scene: Scene, barrier: Barrier) {
  switch (barrier.id) {
    case "freeze":
      return `Vamos tirar mais peso da memória. Cada pedaço quer dizer:\n\n${numberedParts(scene)}\n\nOlhe só para um pedaço por vez. Depois junte os três.`;
    case "translate":
      return `A pergunta quer dizer:\n“${scene.opening}” — ${scene.openingTranslation}\n\nOs blocos da resposta formam esta ideia:\n“${scene.phrase}” — ${scene.translation}\n\nAgora volte ao inglês. Cada bloco tem seu sentido ao lado:\n${numberedParts(scene)}`;
    case "words":
      return `A pergunta é:\n“${scene.opening}” — ${scene.openingTranslation}\n\nCom as palavras que você acabou de guardar, a resposta completa é:\n“${scene.phrase}” — ${scene.translation}\n\nAgora experimente dizer cada parte:\n${numberedParts(scene)}`;
    case "start":
      return `A pergunta é “${scene.opening}” — ${scene.openingTranslation}. Sua resposta é “${scene.phrase}” — ${scene.translation}.\n\nLeia cada parte em inglês no seu tempo:\n${numberedParts(scene)}`;
    default:
      return `Sua resposta quer dizer “${scene.translation}”. Agora experimente dizer a frase em inglês.`;
  }
}

function makeLessonCards(
  parts: string[],
  meanings: string[],
  clues: Scene["partClues"],
  notes: string[],
): LessonCard[] {
  return parts.map((phrase, index) => ({
    phrase,
    translation: meanings[index],
    clues: clues[index],
    note: notes[index],
  }));
}

function buildLessonIntro(barrier: Barrier) {
  switch (barrier.id) {
    case "freeze":
      return "Você já montou sua resposta. Agora vamos ver por que ela funciona, sem decorar tudo de uma vez.";
    case "translate":
      return "Agora vamos ligar os blocos de sentido e entender a resposta sem traduzir palavra por palavra.";
    case "words":
      return "Vamos usar as pistas de vocabulário para entender como a resposta se forma.";
    case "start":
      return "Agora vamos entender sua primeira resposta em partes pequenas, sem pressa.";
    default:
      return "Vamos descobrir por que essa frase funciona.";
  }
}

function buildConversationRecap(scene: Scene, barrier: Barrier): ConversationRecap {
  const progress = ({
    freeze:
      "Você partiu do branco, montou sua resposta e entendeu o que veio depois.",
    translate:
      "Você conectou os blocos de sentido e acompanhou a conversa inteira.",
    words:
      "Você usou palavras como pistas para montar a resposta e entender a reação.",
    start:
      "Sua primeira conversa em inglês: você entendeu a pergunta, a resposta e a reação.",
  } satisfies Record<Barrier["id"], string>)[barrier.id]!;

  return {
    context: { phrase: scene.contextLine, translation: scene.contextTranslation },
    turns: [
      { speaker: "Outra pessoa", phrase: scene.opening, translation: scene.openingTranslation },
      { speaker: "Você", phrase: scene.phrase, translation: scene.translation },
      { speaker: "Outra pessoa", phrase: scene.reply, translation: scene.replyTranslation },
    ],
    progress,
  };
}

export type Conversation = {
  stage: Stage;
  name?: string;
  messages: Message[];
  sceneId?: string;
  barrierId?: string;
  translated: boolean;
};

export function createConversation(
  rememberedName?: string | null,
): Conversation {
  const name =
    rememberedName && !visitorNameError(rememberedName)
      ? normalizeVisitorName(rememberedName)
      : undefined;
  return {
    stage: name ? "hello" : "name",
    name,
    messages: [
      {
        id: 0,
        role: "assistant",
        text: name
          ? `Oi de novo, ${name}!\nVamos encontrar seu próximo passo no inglês?`
          : "Oi! Que bom ter você por aqui.\nComo você gosta de ser chamado?",
      },
    ],
    translated: false,
  };
}

export const initialConversation = createConversation();

export type ConversationAction =
  | { stage: Stage; choiceId: string; type?: never }
  | { type: "name"; name: string }
  | { type: "rename"; name: string }
  | { type: "forget-name" }
  | { type: "restart" };

export function getChoices(state: Conversation): Choice[] {
  switch (state.stage) {
    case "name":
      return [];
    case "hello":
      return [{ id: "begin", label: "Vamos lá" }];
    case "scene":
      return scenes;
    case "barrier":
      return barriers;
    case "practice": {
      const barrier = barriers.find((item) => item.id === state.barrierId);
      if (!barrier) return [];
      return [
        ...(!state.translated
          ? [{ id: "translate", label: barrier.translateLabel }]
          : []),
        { id: "spoken", label: barrier.actionLabel },
      ];
    }
    case "lesson":
      return [{ id: "ready", label: "Juntar a frase" }];
    case "replyLesson":
      return [{ id: "continue", label: "Continuar a conversa" }];
    case "done":
      return [];
  }
}

export function conversationReducer(
  state: Conversation,
  action: ConversationAction,
): Conversation {
  if (action.type === "restart") {
    if (!state.name) return createConversation();
    return {
      stage: "scene",
      name: state.name,
      sceneId: undefined,
      barrierId: undefined,
      translated: false,
      messages: [
        {
          id: 0,
          role: "assistant",
          text: `${state.name}, vamos por outro caminho.\nOnde você quer praticar agora?`,
        },
      ],
    };
  }
  if (action.type === "forget-name") return { ...state, name: undefined };
  if (action.type === "name" || action.type === "rename") {
    if (visitorNameError(action.name)) return state;
    const name = normalizeVisitorName(action.name);
    if (action.type === "rename")
      return state.name === name ? state : { ...state, name };
    if (state.stage !== "name") return state;
    return {
      ...state,
      stage: "scene",
      name,
      messages: [
        ...state.messages,
        { id: state.messages.length, role: "user", text: name },
        {
          id: state.messages.length + 1,
          role: "assistant",
          text: `Prazer, ${name}.\nOnde você mais gostaria de usar o inglês?`,
        },
      ],
    };
  }
  // An outdated or repeated click must never answer the next question.
  if (action.stage !== state.stage) return state;
  const choice = getChoices(state).find((item) => item.id === action.choiceId);
  if (!choice) return state;

  let next = { ...state };
  let response: string;
  let speech: string[] = [];
  let recap: ConversationRecap | undefined;
  switch (state.stage) {
    case "hello":
      next.stage = "scene";
      response = `${state.name ? `${state.name}, me` : "Me"} conta: onde você mais gostaria de usar o inglês?`;
      break;
    case "scene": {
      const scene = scenes.find((item) => item.id === choice.id)!;
      next = { ...next, stage: "barrier", sceneId: scene.id };
      response = `${state.name ? `${state.name}, vamos` + scene.response.slice(5) : scene.response}\nE o que mais pega na hora de falar?`;
      break;
    }
    case "barrier": {
      const baseScene = scenes.find((item) => item.id === state.sceneId);
      const barrier = barriers.find((item) => item.id === choice.id);
      if (!baseScene || !barrier) return state;
      const scene = sceneForBarrier(baseScene, barrier);
      const translated = barrier.id === "start";
      next = { ...next, stage: "practice", barrierId: barrier.id, translated };
      response = buildPracticeMessage(scene, barrier);
      speech = [scene.opening, ...scene.parts];
      break;
    }
    case "practice": {
      const baseScene = scenes.find((item) => item.id === state.sceneId);
      const barrier = barriers.find((item) => item.id === state.barrierId);
      if (!baseScene || !barrier) return state;
      const scene = sceneForBarrier(baseScene, barrier);
      if (choice.id === "translate") {
        next.translated = true;
        response = buildTranslationSupport(scene, barrier);
        speech = [...scene.parts];
      } else {
        next.stage = "lesson";
        response = buildLessonIntro(barrier);
        const lesson = makeLessonCards(
          scene.parts,
          scene.partMeanings,
          scene.partClues,
          scene.partNotes,
        );
        next.messages = [
          ...state.messages,
          { id: state.messages.length, role: "user", text: choice.label },
          {
            id: state.messages.length + 1,
            role: "assistant",
            text: response,
            lesson,
            lessonTitle: "SUA RESPOSTA, EM PEÇAS",
            lessonHint: "Toque em cada parte para ouvir",
          },
        ];
        return next;
      }
      break;
    }
    case "lesson": {
      const baseScene = scenes.find((item) => item.id === state.sceneId);
      const barrier = barriers.find((item) => item.id === state.barrierId);
      if (!baseScene || !barrier) return state;
      const scene = sceneForBarrier(baseScene, barrier);
      next.stage = "replyLesson";
      response = "Agora vamos entender também o que a outra pessoa pode responder:";
      const lesson = makeLessonCards(
        scene.replyParts,
        scene.replyPartMeanings,
        scene.replyPartClues,
        scene.replyPartNotes,
      );
      next.messages = [
        ...state.messages,
        { id: state.messages.length, role: "user", text: choice.label },
        {
          id: state.messages.length + 1,
          role: "assistant",
          text: response,
          lesson,
          lessonTitle: "A RESPOSTA DO OUTRO LADO",
          lessonHint: "Ela também tem pistas. Toque para ouvir",
        },
      ];
      return next;
    }
    case "replyLesson": {
      const baseScene = scenes.find((item) => item.id === state.sceneId);
      const barrier = barriers.find((item) => item.id === state.barrierId);
      if (!baseScene || !barrier) return state;
      const scene = sceneForBarrier(baseScene, barrier);
      next.stage = "done";
      response = "Olha a conversa que você acabou de conseguir acompanhar.";
      recap = buildConversationRecap(scene, barrier);
      break;
    }
    default:
      return state;
  }
  next.messages = [
    ...state.messages,
    { id: state.messages.length, role: "user", text: choice.label },
    {
      id: state.messages.length + 1,
      role: "assistant",
      text: response,
      speech,
      ...(recap ? { recap } : {}),
    },
  ];
  return next;
}

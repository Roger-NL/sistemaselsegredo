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
      "Yes! responde diretamente à pergunta. Em inglês, você pode confirmar com uma palavra e acrescentar um detalhe depois.",
      "What do you…? é o molde “o que você…?”. O do ajuda a formar a pergunta; aqui não significa “fazer”.",
      "Depois de What do you, o verbo vem na forma simples: recommend. Juntos, os blocos perguntam o que a pessoa sugere.",
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
      "The aponta para aquele café do lugar; great descreve a experiência. Em inglês, a palavra que descreve vem depois de is.",
      "Where are you from? pergunta de onde alguém é. From fecha a pergunta com a ideia de origem.",
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
        "Yes responde à pergunta. A pausa da vírgula prepara o detalhe que vem em seguida.",
        "I é quem fala; like diz do que essa pessoa gosta. Em inglês, a pessoa vem antes do verbo.",
        "Coffee completa a ideia: você gosta de café. Em inglês, não precisa colocar “de” antes dessa palavra.",
      ],
      vocabulary: ["coffee = café", "like = gostar"],
      reply: "Me too!",
      replyTranslation: "Eu também!",
      replyParts: ["Me too!"],
      replyPartMeanings: ["Eu também!"],
      replyPartClues: [[{ english: "me too", portuguese: "eu também" }]],
      replyPartNotes: ["Me too! é uma resposta pronta para dizer “eu também” sem repetir a frase toda."],
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
      "I have… diz o que você tem. O inglês costuma mostrar quem fala antes do verbo; an aparece antes do som de vogal em idea.",
      "Can I…? pede permissão. Para perguntar, can vem antes de I; numa afirmação seria I can.",
      "Share é a ação; it retoma a ideia já mencionada. Assim você não precisa repetir idea.",
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
      "Of course! é uma expressão pronta para aceitar um pedido com naturalidade: “claro!”.",
      "We’d love to… mostra entusiasmo e deixa hear para completar a ação. It aponta de volta para a ideia.",
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
        "I é quem fala e like é a opinião. A ordem comum em inglês é pessoa + verbo.",
        "Your vem antes do que pertence a alguém: your idea, “sua ideia”.",
      ],
      vocabulary: ["like = gostar", "idea = ideia"],
      reply: "Thank you!",
      replyTranslation: "Obrigado(a)!",
      replyParts: ["Thank you!"],
      replyPartMeanings: ["Obrigado(a)!"],
      replyPartClues: [[{ english: "thank you", portuguese: "obrigado(a)" }]],
      replyPartNotes: ["Thank you! é a forma natural de agradecer quando alguém elogia uma ideia."],
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
      "I é quem fala, love é o que sente e music completa a ideia. Em inglês, a ordem é pessoa + verbo + assunto.",
      "How about…? funciona como um convite para a outra pessoa responder. Aqui, o conjunto vale “e você?”, não a soma literal das palavras.",
      "You devolve a pergunta à outra pessoa. O resto fica subentendido porque o contexto já está claro.",
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
      "Me too! é uma resposta pronta para mostrar que você sente o mesmo, sem repetir a frase.",
      "What kind of…? pergunta qual tipo. Of faz parte desse bloco e music completa o assunto.",
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
        "I mostra quem fala; love é o verbo. Juntos, I love quer dizer “eu adoro”.",
        "Music completa a ideia: é o que a pessoa adora. Em inglês, o assunto vem depois do verbo.",
      ],
      vocabulary: ["love = adoro", "music = música"],
      reply: "Me too!",
      replyTranslation: "Eu também!",
      replyParts: ["Me too!"],
      replyPartMeanings: ["Eu também!"],
      replyPartClues: [[{ english: "me too", portuguese: "eu também" }]],
      replyPartNotes: ["Me too! responde “eu também” e mostra que vocês têm algo em comum."],
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
    actionLabel: "Consegui montar a frase",
    translateLabel: "Quero entender cada parte",
    focus: "Podemos construir sua base, uma conversa de cada vez.",
  },
];

type Scene = (typeof scenes)[number];
type Barrier = (typeof barriers)[number];

function sceneForBarrier(scene: Scene, barrier: Barrier): Scene {
  return barrier.id === "start" ? { ...scene, ...scene.beginner } : scene;
}

function buildPracticeMessage(scene: Scene, barrier: Barrier) {
  const situation = `${scene.setting}\n“${scene.opening}” — ${scene.openingTranslation}`;
  const guidance: Record<Barrier["id"], string> = {
    freeze:
      "Você disse que às vezes dá branco. Em vez de inventar na hora, use uma resposta pronta:",
    translate:
      "Você disse que costuma traduzir tudo na cabeça. Primeiro, veja a ideia completa:",
    words:
      "Você disse que faltam palavras. Comece com esta frase útil e veja como ela soa:",
    start:
      "Como você está começando do zero, vamos usar uma frase curta e completa:",
  };
  return `${situation}\n\n${guidance[barrier.id]}\n“${scene.phrase}”\n${scene.translation}`;
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
  const focus: Record<Barrier["id"], string> = {
    freeze: "sem precisar guardar a frase inteira de uma vez",
    translate: "olhando para a função de cada bloco, não só a tradução",
    words: "usando as palavras conhecidas como pistas",
    start: "com uma explicação curta para cada bloco",
  };
  return `Agora vamos entender por que essa frase funciona ${focus[barrier.id]}.`;
}

function makeReplyLessonStep(
  state: Conversation,
  choiceLabel: string,
  scene: Scene,
  intro: string,
): Conversation {
  const lesson = makeLessonCards(
    scene.replyParts,
    scene.replyPartMeanings,
    scene.replyPartClues,
    scene.replyPartNotes,
  );
  return {
    ...state,
    stage: "replyLesson",
    messages: [
      ...state.messages,
      { id: state.messages.length, role: "user", text: choiceLabel },
      {
        id: state.messages.length + 1,
        role: "assistant",
        text: intro,
        lesson,
        lessonTitle: "A RESPOSTA DO OUTRO LADO",
        lessonHint: "Ela também tem pistas. Toque para ouvir",
      },
    ],
  };
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
        { id: "understand", label: barrier.translateLabel },
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
      next = { ...next, stage: "practice", barrierId: barrier.id };
      response = buildPracticeMessage(scene, barrier);
      speech = [scene.opening, scene.phrase];
      break;
    }
    case "practice": {
      const baseScene = scenes.find((item) => item.id === state.sceneId);
      const barrier = barriers.find((item) => item.id === state.barrierId);
      if (!baseScene || !barrier) return state;
      const scene = sceneForBarrier(baseScene, barrier);
      if (choice.id === "spoken") {
        return makeReplyLessonStep(
          state,
          choice.label,
          scene,
          "Boa. Sua frase está montada. Agora veja o que a outra pessoa responde:",
        );
      }
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
    case "lesson": {
      const baseScene = scenes.find((item) => item.id === state.sceneId);
      const barrier = barriers.find((item) => item.id === state.barrierId);
      if (!baseScene || !barrier) return state;
      const scene = sceneForBarrier(baseScene, barrier);
      return makeReplyLessonStep(
        state,
        choice.label,
        scene,
        "Agora vamos entender também o que a outra pessoa pode responder:",
      );
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

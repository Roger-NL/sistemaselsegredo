import {
  normalizeVisitorName,
  visitorNameError,
} from "@/lib/welcome/visitor-name";
import { localizedVariant, localeCopy, type BarrierId, type LearningLanguage, type SceneId } from "./language";

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
  clues: { english: string; meaning: string }[];
  note: string;
};
export type ConversationRecap = {
  contextLabel: string;
  progressLabel: string;
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
      [{ english: "Yes", meaning: "sim" }],
      [
        { english: "what", meaning: "o que" },
        { english: "do you", meaning: "você" },
      ],
      [{ english: "recommend", meaning: "recomendar" }],
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
        { english: "coffee", meaning: "café" },
        { english: "great", meaning: "ótimo" },
      ],
      [
        { english: "where", meaning: "onde" },
        { english: "from", meaning: "de" },
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
        [{ english: "yes", meaning: "sim" }],
        [
          { english: "I", meaning: "eu" },
          { english: "like", meaning: "gosto" },
        ],
        [{ english: "coffee", meaning: "café" }],
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
      replyPartClues: [[{ english: "me too", meaning: "eu também" }]],
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
        { english: "I", meaning: "eu" },
        { english: "have", meaning: "tenho" },
        { english: "an idea", meaning: "uma ideia" },
      ],
      [
        { english: "can", meaning: "posso" },
        { english: "I", meaning: "eu" },
      ],
      [
        { english: "share", meaning: "compartilhar" },
        { english: "it", meaning: "isso" },
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
      [{ english: "of course", meaning: "claro" }],
      [
        { english: "we'd love to", meaning: "adoraríamos" },
        { english: "hear it", meaning: "ouvir isso" },
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
          { english: "I", meaning: "eu" },
          { english: "like", meaning: "gosto" },
        ],
        [
          { english: "your", meaning: "sua" },
          { english: "idea", meaning: "ideia" },
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
      replyPartClues: [[{ english: "thank you", meaning: "obrigado(a)" }]],
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
        { english: "I", meaning: "eu" },
        { english: "love", meaning: "adoro" },
        { english: "music", meaning: "música" },
      ],
      [
        { english: "how", meaning: "como" },
        { english: "about", meaning: "sobre" },
      ],
      [{ english: "you", meaning: "você" }],
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
      [{ english: "me too", meaning: "eu também" }],
      [
        { english: "what kind of", meaning: "que tipo de" },
        { english: "music", meaning: "música" },
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
          { english: "I", meaning: "eu" },
          { english: "love", meaning: "adoro" },
        ],
        [{ english: "music", meaning: "música" }],
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
      replyPartClues: [[{ english: "me too", meaning: "eu também" }]],
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

function sceneForBarrier(scene: Scene, barrier: Barrier, language: LearningLanguage): Scene {
  const beginner = barrier.id === "start";
  const base = beginner ? { ...scene, ...scene.beginner } : scene;
  const copy = localizedVariant(language, scene.id as SceneId, beginner);
  return {
    ...base,
    setting: copy.setting,
    contextTranslation: copy.contextTranslation,
    openingTranslation: copy.openingTranslation,
    translation: copy.translation,
    partMeanings: copy.partMeanings,
    partNotes: copy.partNotes,
    partClues: base.partClues.map((items, part) => items.map((item, index) => ({
      english: item.english,
      meaning: copy.partClueMeanings[part]?.[index] ?? item.meaning,
    }))),
    replyTranslation: copy.replyTranslation,
    replyPartMeanings: copy.replyPartMeanings,
    replyPartNotes: copy.replyPartNotes,
    replyPartClues: base.replyPartClues.map((items, part) => items.map((item, index) => ({
      english: item.english,
      meaning: copy.replyClueMeanings[part]?.[index] ?? item.meaning,
    }))),
  } as Scene;
}

function buildPracticeMessage(scene: Scene, barrier: Barrier, language: LearningLanguage) {
  const copy = localeCopy[language];
  const situation = `${scene.setting}\n“${scene.opening}” — ${scene.openingTranslation}`;
  return `${situation}\n\n${copy.guidance[barrier.id as BarrierId]}\n“${scene.phrase}”\n${scene.translation}`;
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

function buildLessonIntro(barrier: Barrier, language: LearningLanguage) {
  const lead = language === "de" ? "Jetzt schauen wir uns an, warum dieser Satz funktioniert" : "Ahora vamos a entender por qué funciona esta frase";
  return `${lead} ${localeCopy[language].lessonIntro[barrier.id as BarrierId]}.`;
}

function makeReplyLessonStep(
  state: Conversation,
  choiceLabel: string,
  scene: Scene,
  intro: string,
  language: LearningLanguage,
): Conversation {
  const copy = localeCopy[language];
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
        lessonTitle: copy.replyLessonTitle,
        lessonHint: copy.replyLessonHint,
      },
    ],
  };
}

function buildConversationRecap(scene: Scene, barrier: Barrier, language: LearningLanguage): ConversationRecap {
  const copy = localeCopy[language];

  return {
    contextLabel: language === "de" ? "DER KONTEXT" : language === "es" ? "EL CONTEXTO" : "O CONTEXTO",
    progressLabel: language === "de" ? "DAS HAST DU GESCHAFFT" : language === "es" ? "LO CONSEGUISTE" : "VOCÊ CONSEGUIU",
    context: { phrase: scene.contextLine, translation: scene.contextTranslation },
    turns: [
      { speaker: copy.speakers.other, phrase: scene.opening, translation: scene.openingTranslation },
      { speaker: copy.speakers.you, phrase: scene.phrase, translation: scene.translation },
      { speaker: copy.speakers.other, phrase: scene.reply, translation: scene.replyTranslation },
    ],
    progress: copy.recapProgress[barrier.id as BarrierId],
  };
}

export type Conversation = {
  stage: Stage;
  language: LearningLanguage;
  name?: string;
  messages: Message[];
  sceneId?: string;
  barrierId?: string;
  testedBarrierIds?: string[];
};

export const ORBIT_PROGRESS_STORAGE_KEY = "basedspeak:orbit-progress:v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isValidMessage(value: unknown): value is Message {
  if (!isRecord(value) || !Number.isInteger(value.id) ||
      (value.role !== "assistant" && value.role !== "user") ||
      typeof value.text !== "string" || value.text.length > 5000) return false;
  if (value.speech !== undefined && !isStringList(value.speech)) return false;
  if (value.lesson !== undefined) {
    if (!Array.isArray(value.lesson) || value.lesson.length > 6) return false;
    for (const card of value.lesson) {
      if (!isRecord(card) || typeof card.phrase !== "string" ||
          typeof card.translation !== "string" || typeof card.note !== "string" ||
          !Array.isArray(card.clues) || !card.clues.every((clue) =>
            isRecord(clue) && typeof clue.english === "string" && typeof clue.meaning === "string")) return false;
    }
  }
  if (value.recap !== undefined) {
    const recap = value.recap;
    if (!isRecord(recap) || typeof recap.contextLabel !== "string" ||
        typeof recap.progressLabel !== "string" || typeof recap.progress !== "string" ||
        !isRecord(recap.context) || typeof recap.context.phrase !== "string" ||
        typeof recap.context.translation !== "string" || !Array.isArray(recap.turns) ||
        !recap.turns.every((turn) => isRecord(turn) && typeof turn.speaker === "string" &&
          typeof turn.phrase === "string" && typeof turn.translation === "string")) return false;
  }
  return true;
}

export function isValidConversation(value: unknown): value is Conversation {
  return isRecord(value) &&
    ["name", "hello", "scene", "barrier", "practice", "lesson", "replyLesson", "done"].includes(String(value.stage)) &&
    (value.language === "pt" || value.language === "de" || value.language === "es") &&
    (value.name === undefined || (typeof value.name === "string" && value.name.length <= 60)) &&
    (value.sceneId === undefined || ["world", "work", "life"].includes(String(value.sceneId))) &&
    (value.barrierId === undefined || ["freeze", "translate", "words", "start"].includes(String(value.barrierId))) &&
    (value.testedBarrierIds === undefined || (Array.isArray(value.testedBarrierIds) && value.testedBarrierIds.length <= 4 && value.testedBarrierIds.every((id) => ["freeze", "translate", "words", "start"].includes(String(id))))) &&
    Array.isArray(value.messages) && value.messages.length > 0 && value.messages.length <= 32 &&
    value.messages.every(isValidMessage);
}

export function readConversationProgress(
  storage: Pick<Storage, "getItem" | "removeItem">,
): Conversation | null {
  try {
    const raw = storage.getItem(ORBIT_PROGRESS_STORAGE_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (isValidConversation(value)) return value;
    storage.removeItem(ORBIT_PROGRESS_STORAGE_KEY);
  } catch {
    try { storage.removeItem(ORBIT_PROGRESS_STORAGE_KEY); } catch { /* storage unavailable */ }
  }
  return null;
}

export function saveConversationProgress(
  storage: Pick<Storage, "setItem">,
  conversation: Conversation,
): boolean {
  try {
    storage.setItem(ORBIT_PROGRESS_STORAGE_KEY, JSON.stringify(conversation));
    if (typeof window !== "undefined" && storage === window.localStorage) {
      window.dispatchEvent(new Event("basedspeak:orbit-progress-change"));
    }
    return true;
  } catch {
    return false;
  }
}

export function createConversation(
  rememberedName?: string | null,
  language: LearningLanguage = "pt",
): Conversation {
  const copy = localeCopy[language];
  const name =
    rememberedName && !visitorNameError(rememberedName)
      ? normalizeVisitorName(rememberedName)
      : undefined;
  return {
    stage: name ? "hello" : "name",
    language,
    name,
    messages: [
      {
        id: 0,
        role: "assistant",
        text: name ? copy.greetingReturning.replace("{name}", name) : copy.greeting,
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
  | { type: "set-language"; language: LearningLanguage }
  | { type: "restart" }
  | { type: "try-another-path" }
  | { type: "restore"; conversation: Conversation };

export function getChoices(state: Conversation): Choice[] {
  const copy = localeCopy[state.language];
  switch (state.stage) {
    case "name":
      return [];
    case "hello":
      return [{ id: "begin", label: state.language === "de" ? "Los geht's" : state.language === "es" ? "Vamos" : "Vamos lá" }];
    case "scene":
      return scenes.map((scene) => ({ id: scene.id, label: copy.sceneLabels[scene.id as SceneId].label }));
    case "barrier":
      return barriers
        .filter((barrier) => !state.testedBarrierIds?.includes(barrier.id))
        .map((barrier) => ({ id: barrier.id, label: copy.barriers[barrier.id as BarrierId].label }));
    case "practice": {
      const barrier = barriers.find((item) => item.id === state.barrierId);
      if (!barrier) return [];
      return [
        { id: "understand", label: copy.barriers[barrier.id as BarrierId].understand },
        { id: "spoken", label: copy.barriers[barrier.id as BarrierId].action },
      ];
    }
    case "lesson":
      return [{ id: "ready", label: copy.ready }];
    case "replyLesson":
      return [{ id: "continue", label: copy.continue }];
    case "done":
      return [];
  }
}

export function conversationReducer(
  state: Conversation,
  action: ConversationAction,
): Conversation {
  if (action.type === "restore") {
    return isValidConversation(action.conversation) ? action.conversation : state;
  }
  if (action.type === "try-another-path") {
    if (state.stage !== "done" || !state.sceneId || getChoices({ ...state, stage: "barrier" }).length === 0) return state;
    const copy = localeCopy[state.language];
    return {
      ...state,
      stage: "barrier",
      barrierId: undefined,
      messages: [
        ...state.messages,
        { id: state.messages.length, role: "user", text: copy.testAnotherPath },
        { id: state.messages.length + 1, role: "assistant", text: copy.chooseAnotherBarrier },
      ],
    };
  }
  if (action.type === "set-language") {
    if (action.language === state.language) return state;
    return createConversation(state.name, action.language);
  }
  if (action.type === "restart") {
    if (!state.name) return createConversation(undefined, state.language);
    return {
      stage: "scene",
      language: state.language,
      name: state.name,
      sceneId: undefined,
      barrierId: undefined,
      testedBarrierIds: [],
      messages: [
        {
          id: 0,
          role: "assistant",
          text: state.language === "de"
            ? `${state.name}, probieren wir einen anderen Weg.\nWo möchtest du jetzt üben?`
            : state.language === "es"
              ? `${state.name}, vamos por otro camino.\n¿Dónde quieres practicar ahora?`
              : `${state.name}, vamos por outro caminho.\nOnde você quer praticar agora?`,
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
          text: localeCopy[state.language].afterName.replace("{name}", name),
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
      response = localeCopy[state.language].hello.replace("{name}, ", state.name ? `${state.name}, ` : "");
      break;
    case "scene": {
      const scene = scenes.find((item) => item.id === choice.id)!;
      next = { ...next, stage: "barrier", sceneId: scene.id, testedBarrierIds: [] };
      const copy = localeCopy[state.language];
      const localized = copy.sceneLabels[scene.id as SceneId];
      const sceneResponse = state.name
        ? `${state.name}, ${localized.response[0].toLowerCase()}${localized.response.slice(1)}`
        : localized.response;
      response = `${sceneResponse}\n${copy.chooseScene}`;
      break;
    }
    case "barrier": {
      const baseScene = scenes.find((item) => item.id === state.sceneId);
      const barrier = barriers.find((item) => item.id === choice.id);
      if (!baseScene || !barrier) return state;
      const scene = sceneForBarrier(baseScene, barrier, state.language);
      next = {
        ...next,
        stage: "practice",
        barrierId: barrier.id,
        testedBarrierIds: [...new Set([...(state.testedBarrierIds ?? []), barrier.id])],
      };
      response = buildPracticeMessage(scene, barrier, state.language);
      speech = [scene.opening, scene.phrase];
      break;
    }
    case "practice": {
      const baseScene = scenes.find((item) => item.id === state.sceneId);
      const barrier = barriers.find((item) => item.id === state.barrierId);
      if (!baseScene || !barrier) return state;
      const scene = sceneForBarrier(baseScene, barrier, state.language);
      if (choice.id === "spoken") {
        return makeReplyLessonStep(
          state,
          choice.label,
          scene,
          state.language === "de" ? "Gut. Dein Satz steht. Jetzt sieh dir an, was die andere Person antwortet:" : state.language === "es" ? "Bien. Ya formaste la frase. Ahora mira lo que responde la otra persona:" : "Boa. Sua frase está montada. Agora veja o que a outra pessoa responde:",
          state.language,
        );
      }
      next.stage = "lesson";
      response = state.language === "pt"
        ? `Agora vamos entender por que essa frase funciona ${localeCopy.pt.lessonIntro[barrier.id as BarrierId]}.`
        : buildLessonIntro(barrier, state.language);
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
          lessonTitle: localeCopy[state.language].answerLessonTitle,
          lessonHint: localeCopy[state.language].lessonHint,
        },
      ];
      return next;
    }
    case "lesson": {
      const baseScene = scenes.find((item) => item.id === state.sceneId);
      const barrier = barriers.find((item) => item.id === state.barrierId);
      if (!baseScene || !barrier) return state;
      const scene = sceneForBarrier(baseScene, barrier, state.language);
      return makeReplyLessonStep(
        state,
        choice.label,
        scene,
        localeCopy[state.language].replyIntro,
        state.language,
      );
    }
    case "replyLesson": {
      const baseScene = scenes.find((item) => item.id === state.sceneId);
      const barrier = barriers.find((item) => item.id === state.barrierId);
      if (!baseScene || !barrier) return state;
      const scene = sceneForBarrier(baseScene, barrier, state.language);
      next.stage = "done";
      response = localeCopy[state.language].recapTitle;
      recap = buildConversationRecap(scene, barrier, state.language);
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

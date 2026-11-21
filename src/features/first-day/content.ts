import { examplesCopy, narration, permissionRuleCopy } from "./narration";
import type { DialogueClip, NarrationClip } from "./narration";

export type FirstDayArt = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export const coverSources = [
  { media: "(min-aspect-ratio: 4/3)", src: "/first-day/art-v1/capa-gibi-desktop.webp" },
  { media: "(max-aspect-ratio: 5/8)", src: "/first-day/art-v1/capa-gibi-mobile.webp" },
] as const;

export const art = {
  cover: {
    src: "/first-day/art-v1/capa-gibi-vertical.webp", width: 1024, height: 1365,
    alt: "Roger, Ana e Leo se reúnem na cafeteria em volta de um gibi de aventura.",
  },
  arrival: {
    src: "/first-day/art-v1/panorama-flor.webp", width: 640, height: 592,
    alt: "Ana lê um gibi na cafeteria. Há uma cadeira amarela livre ao lado dela.",
  },
  chair: {
    src: "/first-day/art-v1/cadeira.webp", width: 248, height: 201,
    alt: "Detalhe da cadeira amarela ao lado de Ana.",
  },
  invitation: {
    src: "/first-day/art-v1/resposta.webp", width: 1024, height: 683,
    alt: "Ana olha para você e indica a cadeira livre. Você ainda segura a bandeja.",
  },
  anaMakesRoom: {
    src: "/first-day/art-v1/ana-afasta-bolsa.webp", width: 1024, height: 683,
    alt: "Ana ergue a bolsa pela alça e deixa a cadeira amarela livre. Você ainda segura a bandeja.",
  },
  seated: {
    src: "/first-day/art-v1/apresente-se.webp", width: 1024, height: 683,
    alt: "Do seu lugar à mesa, você vê Ana de perto e o gibi aberto. Sua bandeja já está apoiada.",
  },
  anaIntroducesHerself: {
    src: "/first-day/art-v1/ana-se-apresenta.webp", width: 1024, height: 683,
    alt: "Ana olha para você, sorri e leva uma mão ao peito enquanto se apresenta. O gibi continua aberto.",
  },
  window: {
    src: "/first-day/art-v1/janela.webp", width: 1024, height: 683,
    alt: "Na cafeteria, você aponta para o trinco da janela fechada. Ana olha para você.",
  },
  door: {
    src: "/first-day/art-v1/porta.webp", width: 1024, height: 683,
    alt: "Ana está ao lado da porta aberta, e sua mão se aproxima da maçaneta.",
  },
} satisfies Record<string, FirstDayArt>;

type PageBase = {
  id: string;
  title: string;
  part: 1 | 2 | 3 | 4;
  partTitle: string;
};

export type WordSequence = {
  words: readonly string[];
  order: readonly number[];
};

export type CharacterReply = {
  speaker: string;
  translation: string;
  voice: DialogueClip;
};

export type GuidedPage = PageBase & WordSequence & {
  kind: "Ação";
  scene: "sit" | "intro";
  caption: string;
  image: FirstDayArt;
  detail?: FirstDayArt;
  voice: DialogueClip;
  translations: readonly string[];
};

export type ReactionPage = PageBase & {
  kind: "Reação";
  caption: string;
  image: FirstDayArt;
  narration: NarrationClip;
  reply: CharacterReply;
  tip?: { title: string; phrases: readonly string[] };
};

type ExamplePanel = {
  context: string;
  image: FirstDayArt;
  line: string;
  translation: string;
  voice: DialogueClip;
};

export type ExamplesPage = PageBase & {
  kind: "Tirinha";
  narration: NarrationClip;
  description: string;
  panels: readonly [ExamplePanel, ExamplePanel, ExamplePanel];
};

type RuleTone = "can" | "person" | "verb" | "context";
type RuleToken = { line: string; tone: RuleTone };

export type RulePage = PageBase & {
  kind: "Explicação";
  narration: NarrationClip;
  lead: string;
  detail: string;
  pieces: readonly (RuleToken & { meaning: string })[];
  examples: readonly { image: FirstDayArt; tokens: readonly RuleToken[]; translation: string; voice: DialogueClip }[];
};

export type ChallengePage = PageBase & WordSequence & {
  kind: "Desafio";
  instruction: Record<"en" | "pt", NarrationClip>;
  image: FirstDayArt;
  translationVoice: NarrationClip;
  voice: DialogueClip;
};

type PreviewPage = PageBase & { kind: "Em preparação"; moment: string };
export type FirstDayPage = GuidedPage | ReactionPage | ExamplesPage | RulePage | ChallengePage | PreviewPage;

const firstPart = { part: 1, partTitle: "Um lugar para sentar" } as const;

const firstPartPages: readonly FirstDayPage[] = [
  {
    ...firstPart,
    id: "ask-to-sit",
    kind: "Ação",
    scene: "sit",
    title: "Peça permissão",
    caption: `${narration.lunchtime.translation} ${narration["empty-chair"].translation}`,
    image: art.arrival,
    detail: art.chair,
    voice: "learner-seat",
    words: ["Hi,", "can", "I", "sit", "here?"],
    order: [0, 2, 4, 1, 3],
    translations: ["", "Oi!", "Oi!", "Oi! Posso…", "Oi! Posso sentar…", "Oi! Posso sentar aqui?"],
  },
  {
    ...firstPart,
    id: "ana-makes-room",
    kind: "Reação",
    title: "Ana abre espaço",
    caption: narration["ana-looks-up"].translation,
    image: art.anaMakesRoom,
    narration: "ana-looks-up",
    reply: { speaker: "Ana", translation: "Claro!", voice: "ana-sure" },
    tip: { title: "Outras formas de dizer «claro»", phrases: ["Of course!", "Go ahead.", "No problem."] },
  },
  {
    ...firstPart,
    id: "meet-ana",
    kind: "Ação",
    scene: "intro",
    title: "Apresente-se",
    caption: `${narration["sit-beside-ana"].translation} É hora de dizer seu nome.`,
    image: art.seated,
    voice: "learner-intro",
    words: ["I’m", "Roger,", "by", "the", "way."],
    order: [2, 0, 4, 1, 3],
    translations: ["", "Eu sou…", "Eu sou o Roger…", "Eu sou o Roger…", "Eu sou o Roger…", "Aliás, eu sou o Roger."],
  },
  {
    ...firstPart,
    id: "ana-introduces-herself",
    kind: "Reação",
    title: "Ana se apresenta",
    caption: narration["ana-introduces-herself"].translation,
    image: art.anaIntroducesHerself,
    narration: "ana-introduces-herself",
    reply: { speaker: "Ana", translation: "Eu sou a Ana.", voice: "ana-intro" },
    tip: { title: "Outras formas de se apresentar", phrases: ["You can call me Ana.", "I go by Ana."] },
  },
  {
    ...firstPart,
    id: "permission-examples",
    kind: "Tirinha",
    ...examplesCopy,
    narration: "three-requests",
    panels: [
      { context: "Na janela", image: art.window, line: "Can I open it?", translation: "Posso abrir?", voice: "example-window" },
      { context: "À mesa", image: art.invitation, line: "Can I sit here?", translation: "Posso sentar aqui?", voice: "example-seat" },
      { context: "Com o gibi", image: art.seated, line: "Can I see it?", translation: "Posso ver?", voice: "example-comic" },
    ],
  },
  {
    ...firstPart,
    id: "permission-rule",
    kind: "Explicação",
    ...permissionRuleCopy,
    narration: "permission-rule",
    pieces: [
      { line: "Can", tone: "can", meaning: "pedido" },
      { line: "I", tone: "person", meaning: "eu" },
      { line: "verbo", tone: "verb", meaning: "ação" },
    ],
    examples: [
      { image: art.invitation, tokens: [{ line: "Can", tone: "can" }, { line: "I", tone: "person" }, { line: "sit", tone: "verb" }, { line: "here?", tone: "context" }], translation: "Posso sentar aqui?", voice: "example-seat" },
      { image: art.window, tokens: [{ line: "Can", tone: "can" }, { line: "I", tone: "person" }, { line: "open", tone: "verb" }, { line: "it?", tone: "context" }], translation: "Posso abrir?", voice: "example-window" },
    ],
  },
  {
    ...firstPart,
    id: "close-the-door",
    kind: "Desafio",
    title: "Faça um pedido novo",
    instruction: { en: "door-instruction-en", pt: "door-instruction-pt" },
    image: art.door,
    words: ["Can", "I", "close", "the", "door?"],
    order: [4, 2, 0, 3, 1],
    translationVoice: "door-answer-pt",
    voice: "challenge-door",
  },
];

const upcomingParts = [
  { part: 2, id: "the-comic", title: "O gibi da Ana", pages: ["Peça para ver o desenho", "Reaja ao desenho", "Pedidos diferentes", "Quem faz a ação?", "Peça para ver e comente"] },
  { part: 3, id: "meet-leo", title: "Conhecendo Leo", pages: ["Conheça Leo", "Peça para ler", "De quem é o gibi?", "Como falar de quem tem algo", "Cumprimente Leo e peça para ler"] },
  { part: 4, id: "see-you", title: "Até a próxima", pages: ["Combine o horário", "Despeça-se", "Um novo combinado", "Como combinar e se despedir", "Combine a hora e se despeça"] },
] as const;

const moments = ["Ação", "Ação", "Tirinha", "Explicação", "Desafio"] as const;

export const pages: readonly FirstDayPage[] = [
  ...firstPartPages,
  ...upcomingParts.flatMap(part => part.pages.map((title, index): PreviewPage => ({
    id: `${part.id}-${index + 1}`,
    part: part.part,
    partTitle: part.title,
    title,
    kind: "Em preparação",
    moment: moments[index],
  }))),
];

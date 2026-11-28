import { examplesCopy, narration, permissionRuleCopy } from "./narration";
import type { DialogueClip, FirstDayWord, NarrationClip, StudyDialogueClip } from "./narration";
import { partTwoPages, type PartTwoPage } from "./part-two-content";
import { sequelPages, type SequelPage } from "./sequel-content";

export type FirstDayArt = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export const cleanReadingMedia = "(max-width: 759px) and (orientation: portrait)";
export const partOnePortraitMedia = "(max-width: 959px) and (orientation: portrait)";
export const tallComicStripMedia = "(min-width: 960px) and (max-aspect-ratio: 5/3)";

export const coverSources = [
  { media: "(min-aspect-ratio: 4/3)", src: "/first-day/art-v2/capa-gibi-desktop.webp" },
  { media: "(max-aspect-ratio: 5/8)", src: "/first-day/art-v2/capa-gibi-mobile.webp" },
] as const;

type IllustratedPanel = { image: FirstDayArt; portraitImage: FirstDayArt };
type ImageSize = readonly [width: number, height: number];

function panelArt(file: string, alt: string, pc: ImageSize, mobile: ImageSize): IllustratedPanel {
  const base = "/first-day-part-one";
  return {
    image: { src: `${base}/pc/${file}.webp`, width: pc[0], height: pc[1], alt },
    portraitImage: { src: `${base}/celular/${file}.webp`, width: mobile[0], height: mobile[1], alt },
  };
}

export const art = {
  cover: {
    src: "/first-day/art-v2/capa-gibi-vertical.webp", width: 1024, height: 1365,
    alt: "Rafael, Ana e Leo se reúnem na cafeteria em volta de um gibi de aventura.",
  },
  chair: {
    src: "/first-day-part-one/detalhe/01-cadeira.webp", width: 520, height: 423,
    alt: "A mão de Rafael aponta para a cadeira amarela onde está a bolsa de Ana.",
  },
  arrival: panelArt("01-chegada", "Ana lê um gibi à mesa, com a bolsa na cadeira amarela ao lado. Rafael se aproxima segurando a bandeja.", [1672, 941], [1000, 1250]),
  anaMakesRoom: panelArt("02-bolsa", "Ana ergue a bolsa para liberar a cadeira amarela. Rafael ainda está de pé com a bandeja.", [1456, 819], [1000, 1500]),
  seated: panelArt("03-rafael", "Sentado ao lado de Ana, Rafael leva a mão ao peito. A bandeja e o gibi aberto estão sobre a mesa.", [1672, 941], [1000, 1500]),
  anaIntroducesHerself: panelArt("04-ana", "Ana sorri para Rafael e leva a mão ao peito ao se apresentar.", [1672, 941], [1000, 1500]),
  window: panelArt("05a-06b-janela", "Sentado com Ana, Rafael aponta para a janela da cafeteria.", [1128, 752], [1120, 840]),
  invitation: panelArt("05b-06a-mesa", "Rafael segura a bandeja e indica a cadeira ao lado de Ana, que segura o gibi.", [1128, 752], [1120, 840]),
  comicExample: panelArt("05c-gibi", "Ana e Rafael conversam diante do gibi aberto sobre a mesa.", [1128, 752], [1120, 840]),
  door: panelArt("07-porta", "Ana segura a bolsa à frente do corpo enquanto Rafael alcança a maçaneta da porta aberta.", [1672, 941], [1000, 1500]),
};

type PageBase<P extends number = 1> = {
  id: string;
  title: string;
  part: P;
  partTitle: string;
};

export type WordSequence = {
  words: readonly FirstDayWord[];
  order: readonly number[];
};

export type CharacterReply = {
  speaker: string;
  translation: string;
  voice: DialogueClip;
};

type StoryPage = PageBase & IllustratedPanel;

export type GuidedPage = StoryPage & WordSequence & {
  kind: "Ação";
  scene: "sit" | "intro";
  caption: string;
  detail?: FirstDayArt;
  voice: DialogueClip;
  translationVoice?: NarrationClip;
  translations: readonly string[];
};

export type ReactionPage = StoryPage & {
  kind: "Reação";
  caption: string;
  narration: NarrationClip;
  reply: CharacterReply;
  tip?: { title: string; phrases: readonly string[] };
};

export function storyImage(page: IllustratedPanel, portrait: boolean) {
  return portrait ? page.portraitImage : page.image;
}

type ExamplePanel = IllustratedPanel & {
  context: string;
  line: string;
  translation: string;
  voice: StudyDialogueClip;
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
  examples: readonly (IllustratedPanel & { tokens: readonly RuleToken[]; translation: string; voice: StudyDialogueClip })[];
};

export type ChallengePage = StoryPage & WordSequence & {
  kind: "Desafio";
  instruction: "door-instruction-pt";
  translationVoice: NarrationClip;
  voice: DialogueClip;
  reply: { speaker: string; voice: DialogueClip; translationVoice: NarrationClip };
};

export type FirstDayPage = GuidedPage | ReactionPage | ExamplesPage | RulePage | ChallengePage | PartTwoPage | SequelPage;

export function usesCleanReading(page: FirstDayPage | undefined): page is GuidedPage | ReactionPage | ChallengePage {
  return page?.part === 1 && (page.kind === "Ação" || page.kind === "Reação" || page.kind === "Desafio");
}

const firstPart = { part: 1, partTitle: "Um lugar para sentar" } as const;

const firstPartPages: readonly FirstDayPage[] = [
  {
    ...firstPart,
    id: "ask-to-sit",
    kind: "Ação",
    scene: "sit",
    title: "Peça permissão",
    caption: `${narration.lunchtime.translation} ${narration["empty-chair"].translation}`,
    ...art.arrival,
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
    ...art.anaMakesRoom,
    narration: "ana-looks-up-pt",
    reply: { speaker: "Ana", translation: "Claro!", voice: "ana-sure" },
    tip: { title: "Outras formas de dizer «claro»", phrases: ["Of course!", "Go ahead.", "No problem."] },
  },
  {
    ...firstPart,
    id: "meet-ana",
    kind: "Ação",
    scene: "intro",
    title: "Apresente-se",
    caption: narration["rafael-sits-pt"].text,
    ...art.seated,
    voice: "rafael-intro",
    translationVoice: "rafael-intro-pt",
    words: ["I’m", "Rafael,", "by", "the", "way."],
    order: [2, 0, 4, 1, 3],
    translations: ["", "Eu sou…", "Eu sou o Rafael…", "Eu sou o Rafael…", "Eu sou o Rafael…", narration["rafael-intro-pt"].text],
  },
  {
    ...firstPart,
    id: "ana-introduces-herself",
    kind: "Reação",
    title: "Ana se apresenta",
    caption: narration["ana-introduces-herself"].translation,
    ...art.anaIntroducesHerself,
    narration: "ana-introduces-herself-pt",
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
      { context: "Na janela", ...art.window, line: "Can I open it?", translation: "Posso abrir?", voice: "example-window" },
      { context: "À mesa", ...art.invitation, line: "Can I sit here?", translation: "Posso sentar aqui?", voice: "example-seat" },
      { context: "Com o gibi", ...art.comicExample, line: "Can I see it?", translation: "Posso ver?", voice: "example-comic" },
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
      { ...art.invitation, tokens: [{ line: "Can", tone: "can" }, { line: "I", tone: "person" }, { line: "sit", tone: "verb" }, { line: "here?", tone: "context" }], translation: "Posso sentar aqui?", voice: "example-seat" },
      { ...art.window, tokens: [{ line: "Can", tone: "can" }, { line: "I", tone: "person" }, { line: "open", tone: "verb" }, { line: "it?", tone: "context" }], translation: "Posso abrir?", voice: "example-window" },
    ],
  },
  {
    ...firstPart,
    id: "close-the-door",
    kind: "Desafio",
    title: "Faça um pedido novo",
    instruction: "door-instruction-pt",
    ...art.door,
    words: ["Can", "I", "close", "the", "door?"],
    order: [4, 2, 0, 3, 1],
    translationVoice: "door-answer-pt",
    voice: "challenge-door",
    reply: { speaker: "Ana", voice: "ana-door-reply", translationVoice: "ana-door-reply-pt" },
  },
];

export const pages: readonly FirstDayPage[] = [
  ...firstPartPages,
  ...partTwoPages,
  ...sequelPages,
];

export const firstDayPartCount = new Set(pages.map(page => page.part)).size;

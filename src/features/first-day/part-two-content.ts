import type { FirstDayArt } from "./content";
import type { BalloonPrint } from "./StoryPanel";

export type Bilingual = { en: string; pt: string };
export type PartTwoArt = { image: FirstDayArt; portraitImage: FirstDayArt; placement?: BalloonPrint };
type CharacterLine = Bilingual & { speaker: string };
type PageInfo = {
  part: 2 | 3 | 4; partTitle: string; id: string; title: string; englishTitle: string; caption: Bilingual;
};

export type ComicAction = PageInfo & {
  kind: "Ação"; before: PartTwoArt; after: PartTwoArt;
  replyCaption: Bilingual;
  prefix?: Bilingual; words: readonly string[]; order: readonly number[]; translations: readonly string[];
  aside?: CharacterLine;
  reply: Bilingual & { speaker?: string };
};
export type ComicExample = { context: Bilingual; line: Bilingual; art: PartTwoArt };
type ComicExamples = PageInfo & { kind: "Tirinha"; panels: readonly ComicExample[] };
type ComicRule = PageInfo & {
  kind: "Explicação"; pieces: readonly { token: string; meaning: Bilingual }[];
  examples: readonly {
    line: Bilingual; explanation: Bilingual; art: PartTwoArt;
    tokens?: readonly { text: string; piece?: number }[];
  }[];
};
export type ComicRound = {
  instruction: Bilingual; bank: readonly string[]; solution: readonly number[]; translation: string; art: PartTwoArt;
  speaker?: string;
  label: Bilingual;
  retryHint: Bilingual;
  choice?: true;
};
export type PartialRequestCopy = {
  fixed: readonly [string, string, string]; glossary: Bilingual; answerHint: Bilingual;
  reply: Bilingual; closing: Bilingual; revealArt: PartTwoArt;
};
type ComicChallenge = PageInfo & {
  kind: "Desafio"; revealCaption: Bilingual; completeCaption?: Bilingual;
} & ({ rounds: readonly [ComicRound]; partialRequest: PartialRequestCopy }
  | { rounds: readonly [ComicRound, ComicRound]; partialRequest?: undefined });
export type PartTwoPage = ComicAction | ComicExamples | ComicRule | ComicChallenge;

const artDirectories = { 2: "two", 3: "three", 4: "four" } as const;

export function comicArt(part: PageInfo["part"], file: string, alt: string, placement?: BalloonPrint): PartTwoArt {
  const base = `/first-day-part-${artDirectories[part]}`;
  return {
    image: { src: `${base}/pc/${file}.webp`, width: 1488, height: 837, alt },
    portraitImage: { src: `${base}/celular/${file}.webp`, width: 900, height: 1350, alt },
    ...(placement && { placement }),
  };
}

const request = comicArt(2, "pedido", "Rafael se inclina para olhar o gibi que Ana está lendo. Pela fresta da página, aparece um pedaço do telhado terracota.");
const show = comicArt(2, "mostra", "Ana gira o gibi aberto para Rafael e aponta para a torre e as arcadas.");
const reaction = comicArt(2, "reacao", "Rafael olha a ilustração e sorri para Ana.");
const agreement = comicArt(2, "confirma", "Ana sorri para Rafael.");
const see = comicArt(2, "ver", "Rafael estende a mão para olhar o gibi que Ana lhe oferece.");
const offer = comicArt(2, "oferecer", "Rafael segura o gibi aberto e o inclina para que Ana veja o desenho.");
const beforeTurn = comicArt(2, "desafio", "Ana pinça o canto da página que mostra a torre e as arcadas. Rafael acompanha o gesto.");
const reveal = comicArt(2, "revelacao", "Ana vira a folha e revela a Rafael um veleiro de vela vermelha na página seguinte.");

const base = { part: 2, partTitle: "O desenho no gibi" } as const;
const canISee = { en: "Can I see?", pt: "Posso ver?" };
const canYouShowMe = { en: "Can you show me?", pt: "Você pode me mostrar?" };

export const partTwoPages: readonly PartTwoPage[] = [
  {
    ...base, id: "the-comic-1", kind: "Ação", title: "Peça para ver o desenho", englishTitle: "Ask to see the picture",
    caption: { en: "Rafael notices a drawing in the comic.", pt: "Rafael repara num desenho no gibi." },
    replyCaption: { en: "Ana tilts the comic toward Rafael.", pt: "Ana inclina o gibi na direção de Rafael." },
    before: request, after: show, prefix: { en: "Wow!", pt: "Uau!" },
    words: ["Can", "you", "show", "me?"], order: [2, 0, 3, 1],
    translations: ["Uau!", "Uau!", "Uau! Pode…", "Uau! Pode mostrar…", "Uau! Pode me mostrar?"],
    reply: { en: "Here, look.", pt: "Aqui, olha." },
  },
  {
    ...base, id: "the-comic-2", kind: "Ação", title: "Reaja ao desenho", englishTitle: "React to the picture",
    caption: { en: "Now Rafael can see the whole picture.", pt: "Agora Rafael consegue ver o desenho inteiro." },
    replyCaption: { en: "Ana smiles.", pt: "Ana dá um sorriso." },
    before: reaction, after: agreement, words: ["That’s", "so", "cool!"], order: [2, 0, 1],
    translations: ["", "Isso é…", "Isso é tão…", "Que legal!"],
    reply: { en: "I know, right?", pt: "Pois é, né?" },
  },
  {
    ...base, id: "the-comic-3", kind: "Tirinha", title: "Pedidos diferentes", englishTitle: "Different requests",
    caption: { en: "Rafael speaks in all three examples. Notice who looks and who shows the comic.", pt: "Rafael fala nos três exemplos. Repare em quem olha e quem mostra o gibi." },
    panels: [
      { context: { en: "Rafael wants to look", pt: "Rafael quer olhar" }, line: canISee, art: see },
      { context: { en: "Ana shows Rafael", pt: "Ana mostra a Rafael" }, line: canYouShowMe, art: show },
      { context: { en: "Rafael offers to show Ana", pt: "Rafael se oferece para mostrar" }, line: { en: "Can I show you?", pt: "Posso te mostrar?" }, art: offer },
    ],
  },
  {
    ...base, id: "the-comic-4", kind: "Explicação", title: "Quem faz a ação?", englishTitle: "Who does what?",
    caption: { en: "The word after can tells you who acts. Then comes the base verb, like see or show.",
      pt: "A palavra depois de can indica quem faz a ação. Depois vem o verbo na forma básica, como see ou show." },
    pieces: [
      { token: "Can", meaning: { en: "start the question", pt: "abre a pergunta" } },
      { token: "I / you", meaning: { en: "who does it", pt: "quem faz" } },
      { token: "see / show", meaning: { en: "the action", pt: "a ação" } },
    ],
    examples: [
      { line: canISee, explanation: { en: "With Can I, the speaker acts. Here, Rafael wants to look.", pt: "Com Can I, quem age é quem fala. Aqui, Rafael quer olhar." }, art: see },
      { line: canYouShowMe, explanation: { en: "With Can you, the listener acts. Ana shows the picture, and me refers to Rafael.", pt: "Com Can you, quem age é quem escuta. Ana mostra o desenho, e me se refere ao Rafael." }, art: show },
    ],
  },
  {
    ...base, id: "the-comic-5", kind: "Desafio", title: "Vire a página", englishTitle: "Turn the page",
    caption: { en: "Ana is holding the corner of the page.", pt: "Ana segura o canto da página." },
    revealCaption: { en: "Ana turns the page. There’s a sailboat.", pt: "Ana vira a página. Tem um veleiro no desenho." },
    partialRequest: {
      fixed: ["Can", "turn", "page?"],
      glossary: { en: "turn the page = virar a página", pt: "turn the page = virar a página" },
      answerHint: { en: "Put you after Can and the before page.", pt: "Coloque «you» depois de «Can» e «the» antes de «page»." },
      reply: { en: "Sure!", pt: "Claro!" }, closing: { en: "That’s so cool!", pt: "Que legal!" }, revealArt: reveal,
    },
    rounds: [
      { label: { en: "Request", pt: "Pedido" },
        instruction: { en: "Ask Ana to turn the page.", pt: "Peça à Ana para virar a página." },
        retryHint: { en: "After Can, say who will turn the page. Before page, use the word that points to that specific page.", pt: "Depois de «Can», indique quem vai virar a página. Antes de «page», use a palavra que indica essa página específica." },
        bank: ["you", "the"], solution: [0, 1], speaker: "Rafael",
        translation: "Você pode virar a página?", art: beforeTurn },
    ],
  },
];

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
type ComicChallenge = PageInfo & {
  kind: "Desafio"; revealCaption: Bilingual; completeCaption?: Bilingual;
  rounds: readonly [ComicRound, ComicRound];
};
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

const base = { part: 2, partTitle: "O gibi da Ana" } as const;
const canISee = { en: "Can I see?", pt: "Posso ver?" };
const canYouShowMe = { en: "Can you show me?", pt: "Pode me mostrar?" };

export const partTwoPages: readonly PartTwoPage[] = [
  {
    ...base, id: "the-comic-1", kind: "Ação", title: "Peça para ver o desenho", englishTitle: "Ask to see the picture",
    caption: { en: "At the table, the comic is still open. A picture catches your eye.", pt: "À mesa, o gibi continua aberto. Um desenho chama sua atenção." },
    replyCaption: { en: "Ana turns the comic toward you.", pt: "Ana vira o gibi na sua direção." },
    before: request, after: show, prefix: { en: "Wow!", pt: "Uau!" },
    words: ["Can", "you", "show", "me?"], order: [2, 0, 3, 1],
    translations: ["Uau!", "Uau!", "Uau! Pode…", "Uau! Pode mostrar…", "Uau! Pode me mostrar?"],
    reply: { en: "Here, look.", pt: "Aqui, olha." },
  },
  {
    ...base, id: "the-comic-2", kind: "Ação", title: "Reaja ao desenho", englishTitle: "React to the picture",
    caption: { en: "Now you can see the whole picture.", pt: "Agora você consegue ver o desenho inteiro." },
    replyCaption: { en: "Ana looks up and smiles.", pt: "Ana levanta os olhos e sorri." },
    before: reaction, after: agreement, words: ["That’s", "so", "cool!"], order: [2, 0, 1],
    translations: ["", "Isso é…", "Isso é tão…", "Que legal!"],
    reply: { en: "I know, right?", pt: "Né?" },
  },
  {
    ...base, id: "the-comic-3", kind: "Tirinha", title: "Pedidos diferentes", englishTitle: "Different requests",
    caption: { en: "Watch their hands. Who looks, and who shows the comic?", pt: "Observe as mãos. Quem olha e quem mostra o gibi?" },
    panels: [
      { context: { en: "You ask to look", pt: "Você pede para olhar" }, line: canISee, art: see },
      { context: { en: "You ask Ana to show you", pt: "Você pede que Ana mostre" }, line: canYouShowMe, art: show },
      { context: { en: "You offer to show Ana", pt: "Você se oferece para mostrar" }, line: { en: "Can I show you?", pt: "Posso te mostrar?" }, art: offer },
    ],
  },
  {
    ...base, id: "the-comic-4", kind: "Explicação", title: "Quem faz a ação?", englishTitle: "Who does what?",
    caption: { en: "After can, say who does the action. Then use the verb unchanged, like see or show.",
      pt: "Depois de can, diga quem faz a ação. Em seguida, use o verbo sem mudar, como see (ver) ou show (mostrar)." },
    pieces: [
      { token: "Can", meaning: { en: "start the question", pt: "abre a pergunta" } },
      { token: "I / you", meaning: { en: "who does it", pt: "quem faz" } },
      { token: "see / show", meaning: { en: "the action", pt: "a ação" } },
      { token: "me", meaning: { en: "who it’s for", pt: "para quem" } },
    ],
    examples: [
      { line: canISee, explanation: { en: "I means Rafael wants to look.", pt: "I é quem fala. Aqui, o Rafael pede permissão para olhar." }, art: see },
      { line: canYouShowMe, explanation: { en: "You means Ana shows it. Me means she shows it to Rafael.", pt: "You é a Ana, que mostra o desenho. Como ela mostra para o Rafael, ele diz me." }, art: show },
    ],
  },
  {
    ...base, id: "the-comic-5", kind: "Desafio", title: "Peça para ver e comente", englishTitle: "Ask and react",
    caption: { en: "Imagine Ana is about to turn the page.", pt: "Imagine que Ana está prestes a virar a página." },
    revealCaption: { en: "Ana turns the page. A sailboat appears.", pt: "Ana vira a página. Aparece um veleiro." },
    rounds: [
      { label: { en: "Request", pt: "Pedido" },
        instruction: { en: "How does Rafael ask Ana to show him the next page?", pt: "Como Rafael pede para Ana mostrar a próxima página?" },
        retryHint: { en: "Ana will show the page. Start with ‘Can you’.", pt: "É a Ana quem vai mostrar a página. Comece com «Can you»." },
        bank: ["next", "I", "show", "page?", "Can", "the", "you", "me", "see"], solution: [4, 6, 2, 7, 5, 0, 3],
        translation: "Pode me mostrar a próxima página?", art: beforeTurn },
      { label: { en: "Reaction", pt: "Reação" },
        instruction: { en: "Rafael loves the new picture. What does he say?", pt: "Rafael adorou o desenho novo. O que ele diz?" },
        retryHint: { en: "Rafael is reacting to the picture. Start with ‘That’s’.", pt: "Rafael está reagindo ao desenho. Comece com «That’s»." },
        bank: ["so", "right?", "That’s", "cool!", "know"], solution: [2, 0, 3], translation: "Que legal!", art: reveal },
    ],
  },
];

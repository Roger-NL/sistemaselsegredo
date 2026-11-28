import { comicArt, type Bilingual, type PartTwoPage } from "./part-two-content";

const arrival = comicArt(3, "chegada", "Leo chega à mesa da cafeteria e Ana devolve o gibi que ele havia emprestado.", {
  desktop: { mouth: [.789, .406], headTop: .19, oval: [.748, .097, 345, 102], completed: [.748, .108, 480, 123] },
  portrait: { mouth: [.794, .523], headTop: .35, oval: [.655, .147, 220, 53], completed: [.629, .147, 255, 84] },
});
const introduction = comicArt(3, "apresenta", "Rafael cumprimenta Leo, que indica a capa do gibi que Ana acabou de devolver.", {
  desktop: { mouth: [.514, .262], headTop: .02, oval: [.665, .126, 370, 112] },
  portrait: { mouth: [.548, .310], headTop: .15, oval: [.799, .143, 153, 73] },
});
const edition = comicArt(3, "edicao", "Leo segura o gibi que recebeu de Ana e Rafael olha para a capa antes de fazer a pergunta.", {
  desktop: { mouth: [.815, .538], headTop: .00, oval: [.583, .115, 296, 103], completed: [.583, .119, 362, 128] },
  portrait: { mouth: [.829, .569], headTop: .22, oval: [.574, .125, 163, 49], completed: [.572, .132, 222, 72] },
});
const tomorrow = comicArt(3, "amanha", "Leo responde a Rafael e apoia a mão sobre o mesmo gibi, na mesa da cafeteria.", {
  desktop: { mouth: [.435, .270], headTop: .035, oval: [.611, .096, 488, 155] },
  portrait: { mouth: [.455, .413], headTop: .270, oval: [.622, .149, 276, 104] },
});
const mine = comicArt(3, "meu-gibi", "Leo segura um gibi e aponta para si mesmo.", {
  desktop: { mouth: [.415, .403], headTop: .17, oval: [.385, .093, 275, 101], completed: [.385, .10, 365, 125] },
  portrait: { mouth: [.436, .300], headTop: .15, oval: [.344, .067, 160, 49], completed: [.352, .077, 220, 69] },
});
const yours = comicArt(3, "seu-gibi", "Leo aponta para Rafael, que tem um gibi nas mãos.");
const together = comicArt(3, "dois-gibis", "Leo e Rafael colocam dois gibis lado a lado sobre a mesa.");
const anaToLeo = comicArt(3, "desafio-voce", "Ana aponta para Leo. O mesmo gibi continua nas mãos dele.", {
  desktop: { mouth: [.235, .481], headTop: .245, oval: [.379, .101, 275, 101], completed: [.379, .101, 392, 128] },
  portrait: { mouth: [.200, .341], headTop: .205, oval: [.350, .092, 160, 49], completed: [.350, .092, 225, 72] },
});

const base = { part: 3, partTitle: "Conhecendo Leo" } as const;
const iHave = { en: "I have a comic.", pt: "Eu tenho um gibi." } satisfies Bilingual;
const youHave = { en: "You have a comic.", pt: "Você tem um gibi." } satisfies Bilingual;
const weHave = { en: "We have two comics.", pt: "Nós temos dois gibis." } satisfies Bilingual;

export const partThreePages: readonly PartTwoPage[] = [
  {
    ...base, id: "meet-leo-1", kind: "Ação", title: "Conheça Leo",
    caption: "Leo se aproxima. Ana devolve o gibi que pegou emprestado dele.",
    aside: { speaker: "Leo", en: "Hi, my name is Leo.", pt: "Oi, meu nome é Leo." },
    replyCaption: "Leo aponta para a capa do gibi que Ana acabou de devolver.",
    before: arrival, after: introduction,
    words: ["Nice", "to", "meet", "you,", "Leo.", "I’m", "Rafael."],
    order: [2, 6, 0, 4, 1, 5, 3],
    translations: ["", "Prazer…", "Prazer…", "Prazer em conhecer…", "Prazer em te conhecer…",
      "Prazer em te conhecer, Leo.", "Prazer em te conhecer, Leo. Eu sou…", "Prazer em te conhecer, Leo. Eu sou o Rafael."],
    reply: { speaker: "Leo", en: "I have the new one.", pt: "Eu tenho a edição nova." },
  },
  {
    ...base, id: "meet-leo-2", kind: "Ação", title: "Peça para ler",
    caption: "Leo fala de outra edição do gibi. Você quer ler a nova.",
    replyCaption: "Leo pode trazer a edição nova amanhã.",
    before: edition, after: tomorrow,
    words: ["Can", "I", "read", "it?"], order: [2, 0, 3, 1],
    translations: ["", "", "Posso…", "Posso ler…", "Posso ler?"],
    reply: { speaker: "Leo", en: "Yes, I can bring it tomorrow.", pt: "Sim, posso trazer amanhã." },
  },
  {
    ...base, id: "meet-leo-3", kind: "Tirinha", title: "Quem está com o gibi?",
    caption: "Leo fala nos três quadros. Veja quem está com um gibi em cada um.",
    panels: [
      { context: "Leo aponta para si mesmo", line: iHave, art: mine },
      { context: "Leo aponta para Rafael", line: youHave, art: yours },
      { context: "Leo e Rafael têm um gibi cada um", line: weHave, art: together },
    ],
  },
  {
    ...base, id: "meet-leo-4", kind: "Explicação", title: "Como falar de quem tem algo",
    caption: "I, you e we mostram quem tem algo. Com essas três palavras, have fica igual.",
    pieces: [
      { token: "I / you / we", meaning: "quem tem" },
      { token: "have", meaning: "ter" },
      { token: "a comic", meaning: "o que têm" },
    ],
    examples: [
      { line: iHave, art: mine,
        tokens: [{ text: "I", piece: 0 }, { text: "have", piece: 1 }, { text: "a comic.", piece: 2 }],
        explanation: "Leo usa I quando fala de si mesmo." },
      { line: youHave, art: yours,
        tokens: [{ text: "You", piece: 0 }, { text: "have", piece: 1 }, { text: "a comic.", piece: 2 }],
        explanation: "Leo usa you porque está falando com Rafael, que segura o gibi." },
    ],
  },
  {
    ...base, id: "meet-leo-5", kind: "Desafio", title: "Eu ou você?",
    caption: "Leo segura o gibi e aponta para si mesmo.",
    revealCaption: "Leo continua com o mesmo gibi. Agora é Ana quem fala com ele.",
    rounds: [
      {
        speaker: "Leo",
        label: "Leo fala",
        instruction: "Como Leo diria «Eu tenho um gibi» em inglês?",
        retryHint: "Leo fala de si mesmo. Comece com «I».",
        bank: ["have", "We", "a", "You", "comic.", "I"], solution: [5, 0, 2, 4], translation: iHave.pt, art: mine,
      },
      {
        speaker: "Ana",
        label: "Ana fala",
        instruction: "Como Ana diria «Você tem um gibi» falando com o Leo?",
        retryHint: "Ana está falando com o Leo. Comece com «You».",
        bank: ["comic.", "I", "have", "We", "You", "a"], solution: [4, 2, 5, 0], translation: youHave.pt, art: anaToLeo,
      },
    ],
  },
];

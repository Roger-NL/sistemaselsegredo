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
    ...base, id: "meet-leo-1", kind: "Ação", title: "Conheça Leo", englishTitle: "Meet Leo",
    caption: { en: "Leo walks over. Ana gives him back the comic she borrowed.", pt: "Leo se aproxima. Ana devolve o gibi que pegou emprestado dele." },
    aside: { speaker: "Leo", en: "Hi, my name is Leo.", pt: "Oi, meu nome é Leo." },
    replyCaption: { en: "Leo points to the cover of the comic Ana just returned.", pt: "Leo aponta para a capa do gibi que Ana acabou de devolver." },
    before: arrival, after: introduction,
    words: ["Nice", "to", "meet", "you,", "Leo.", "I’m", "Rafael."],
    order: [2, 6, 0, 4, 1, 5, 3],
    translations: ["", "Prazer…", "Prazer…", "Prazer em conhecer…", "Prazer em te conhecer…",
      "Prazer em te conhecer, Leo.", "Prazer em te conhecer, Leo. Eu sou…", "Prazer em te conhecer, Leo. Eu sou o Rafael."],
    reply: { speaker: "Leo", en: "I have the new one.", pt: "Eu tenho a edição nova." },
  },
  {
    ...base, id: "meet-leo-2", kind: "Ação", title: "Peça para ler", englishTitle: "Ask to read the comic",
    caption: { en: "Leo is talking about a different issue. You want to read the new one.", pt: "Leo fala de outra edição do gibi. Você quer ler a nova." },
    replyCaption: { en: "Leo can bring the new issue tomorrow.", pt: "Leo pode trazer a edição nova amanhã." },
    before: edition, after: tomorrow,
    words: ["Can", "I", "read", "it?"], order: [2, 0, 3, 1],
    translations: ["", "", "Posso…", "Posso ler…", "Posso ler?"],
    reply: { speaker: "Leo", en: "Yes, I can bring it tomorrow.", pt: "Sim, posso trazer amanhã." },
  },
  {
    ...base, id: "meet-leo-3", kind: "Tirinha", title: "Quem está com o gibi?", englishTitle: "Who has the comic?",
    caption: { en: "Leo speaks in all three panels. See who’s holding a comic in each one.", pt: "Leo fala nos três quadros. Veja quem está com um gibi em cada um." },
    panels: [
      { context: { en: "Leo points to himself", pt: "Leo aponta para si mesmo" }, line: iHave, art: mine },
      { context: { en: "Leo points to Rafael", pt: "Leo aponta para Rafael" }, line: youHave, art: yours },
      { context: { en: "Leo and Rafael each have a comic", pt: "Leo e Rafael têm um gibi cada um" }, line: weHave, art: together },
    ],
  },
  {
    ...base, id: "meet-leo-4", kind: "Explicação", title: "Como falar de quem tem algo", englishTitle: "How to say who has something",
    caption: { en: "I, you, and we tell us who has something. With these three words, have stays the same.",
      pt: "I, you e we mostram quem tem algo. Com essas três palavras, have fica igual." },
    pieces: [
      { token: "I / you / we", meaning: { en: "who has it", pt: "quem tem" } },
      { token: "have", meaning: { en: "to have", pt: "ter" } },
      { token: "a comic", meaning: { en: "what they have", pt: "o que têm" } },
    ],
    examples: [
      { line: iHave, art: mine,
        tokens: [{ text: "I", piece: 0 }, { text: "have", piece: 1 }, { text: "a comic.", piece: 2 }],
        explanation: { en: "Leo says I when he is talking about himself.", pt: "Leo usa I quando fala de si mesmo." } },
      { line: youHave, art: yours,
        tokens: [{ text: "You", piece: 0 }, { text: "have", piece: 1 }, { text: "a comic.", piece: 2 }],
        explanation: { en: "Leo uses you because he is speaking to Rafael, who is holding the comic.", pt: "Leo usa you porque está falando com Rafael, que segura o gibi." } },
    ],
  },
  {
    ...base, id: "meet-leo-5", kind: "Desafio", title: "Eu ou você?", englishTitle: "Who are they talking about?",
    caption: { en: "Leo holds the comic and points to himself.", pt: "Leo segura o gibi e aponta para si mesmo." },
    revealCaption: { en: "Leo still has the same comic. Now Ana is speaking to him.", pt: "Leo continua com o mesmo gibi. Agora é Ana quem fala com ele." },
    rounds: [
      {
        speaker: "Leo",
        label: { en: "Leo speaks", pt: "Leo fala" },
        instruction: { en: "How does Leo say he has a comic?", pt: "Como Leo diria «Eu tenho um gibi» em inglês?" },
        retryHint: { en: "Leo is talking about himself. Start with ‘I’.", pt: "Leo fala de si mesmo. Comece com «I»." },
        bank: ["have", "We", "a", "You", "comic.", "I"], solution: [5, 0, 2, 4], translation: iHave.pt, art: mine,
      },
      {
        speaker: "Ana",
        label: { en: "Ana speaks", pt: "Ana fala" },
        instruction: { en: "How does Ana tell Leo that he has a comic?", pt: "Como Ana diria «Você tem um gibi» falando com o Leo?" },
        retryHint: { en: "Ana is speaking directly to Leo. Start with ‘You’.", pt: "Ana está falando com o Leo. Comece com «You»." },
        bank: ["comic.", "I", "have", "We", "You", "a"], solution: [4, 2, 5, 0], translation: youHave.pt, art: anaToLeo,
      },
    ],
  },
];

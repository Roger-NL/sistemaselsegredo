import type { Bilingual, ComicExample, PartTwoArt } from "./part-two-content";

export type SequelPanel = {
  art: PartTwoArt;
  line?: Bilingual & { speaker: string };
  activity?: SequelExercise;
  portraitFocus?: "left" | "right";
};

export type SequelExercise = {
  instruction: string;
  bank: Record<"pt" | "en", readonly string[]>;
  solution: Record<"pt" | "en", readonly number[]>;
  prefilled?: Record<"pt" | "en", readonly number[]>;
  mode: "choose" | "assemble";
};

type SequelPageInfo = {
  edition: "sequel";
  part: 3 | 4 | 5;
  partTitle: string;
  id: string;
  title: string;
  caption: string;
};

export type SequelPage = SequelPageInfo & (
  | { kind: "História"; panels: readonly SequelPanel[] }
  | { kind: "Tirinha"; panels: readonly [ComicExample, ComicExample, ComicExample] }
  | { kind: "Explicação"; examples: readonly ComicExample[] }
  | { kind: "Desafio"; art: PartTwoArt; exercises: readonly SequelExercise[]; closing?: readonly SequelPanel[]; confirmation: string }
);

export type SequelStep = { exercise: SequelExercise; panelIndex?: number };

function dialogueSteps(panels: readonly SequelPanel[]): SequelStep[] {
  return panels.flatMap(({ activity }, panelIndex) => activity ? [{ exercise: activity, panelIndex }] : []);
}

export function getSequelSteps(page: SequelPage): readonly SequelStep[] {
  switch (page.kind) {
    case "História": return dialogueSteps(page.panels);
    case "Desafio": {
      const steps = page.exercises.map(exercise => ({ exercise, panelIndex: page.closing ? 0 : undefined }));
      return page.closing ? [...steps, ...dialogueSteps(page.closing)] : steps;
    }
    default: return [];
  }
}

export function currentSequelExercise(page: SequelPage, completed: number) {
  return getSequelSteps(page)[completed]?.exercise;
}

function guidedLine(speaker: "Léo" | "Rafael" | "Ana e Léo", en: readonly string[], pt: readonly string[],
  instruction: string): Pick<SequelPanel, "line" | "activity"> {
  const bank = { en: [...en].reverse(), pt: [...pt].reverse() };
  const solution = {
    en: en.map((_, index) => en.length - 1 - index),
    pt: pt.map((_, index) => pt.length - 1 - index),
  };
  return {
    line: { speaker, en: en.join(" "), pt: pt.join(" ") },
    activity: { mode: "assemble", instruction, bank, solution },
  };
}

const artFolders = { 3: "three", 4: "four", 5: "five" } as const;

function sequelArt(part: keyof typeof artFolders, file: string, alt: string): PartTwoArt {
  const folder = `/first-day-part-${artFolders[part]}`;
  return {
    image: { src: `${folder}/pc/${file}.webp`, width: 1280, height: 720, alt },
    portraitImage: { src: `${folder}/celular/${file}.webp`, width: 768, height: 1152, alt },
  };
}

const arrivingLeo = sequelArt(3, "v2-leo-chega", "Léo chega à mesa e fala com Ana, que está com o gibi.");
const anaIntroducing = sequelArt(3, "v2-ana-apresenta", "Ana apresenta Rafael ao Léo com um gesto de mão.");
const rafaelGreeting = sequelArt(3, "v2-rafael-cumprimenta", "Rafael olha para Léo e o cumprimenta.");
const leoGreeting = sequelArt(3, "v2-leo-retribui", "Léo olha para Rafael e retribui o cumprimento.");
const introduceStrip = sequelArt(3, "v2-tirinha-apresentacao", "Ana indica Rafael ao apresentá-lo a Léo.");
const replyStrip = sequelArt(3, "v2-tirinha-resposta", "Léo olha diretamente para Rafael e sorri ao cumprimentá-lo.");

const anaExplaining = sequelArt(4, "v2-ana-explica", "Ana indica o gibi sobre a mesa enquanto conta a Rafael que Léo o emprestou.");
const rafaelAsking = sequelArt(4, "v2-rafael-pede", "Rafael olha para Léo e faz um gesto discreto na direção do gibi que quer pegar emprestado.");
const leoLending = sequelArt(4, "v2-leo-empresta", "Léo entrega o gibi a Rafael enquanto Ana observa.");
const borrowStrip = sequelArt(4, "v2-tirinha-pedido", "Rafael pede o gibi emprestado apontando para o exemplar à frente de Léo.");
const confirmBorrowStrip = sequelArt(4, "v2-tirinha-confirmacao", "Rafael indica o gibi e confirma com Léo se pode levá-lo naquele dia.");

const rafaelSuggesting = sequelArt(5, "v2-rafael-combina", "Rafael aponta para a bandeja do almoço e olha para Léo, com o gibi na outra mão.");
const leoConfirming = sequelArt(5, "v2-leo-confirma", "Léo aponta para a mesa da cafeteria onde vão se encontrar.");
const rafaelThanking = sequelArt(5, "v2-rafael-agradece", "Rafael agradece a Léo com um sorriso e o gibi junto de si.");
const anaAgreeing = sequelArt(5, "v2-ana-concorda", "Ana sorri e concorda com o elogio de Rafael ao Léo.");
const rafaelSayingGoodbye = sequelArt(5, "v2-rafael-despede", "Rafael se levanta com o gibi na mão e se volta para os colegas.");
const friendsWaving = sequelArt(5, "v2-ana-leo-acenam", "Ana e Léo acenam para Rafael da mesa.");
const rafaelLeaving = sequelArt(5, "v2-rafael-sai", "Rafael sai da cafeteria levando o gibi emprestado.");
const timeStrip = sequelArt(5, "v2-tirinha-horario", "Léo conversa com Rafael à mesa ao lado da bandeja do almoço.");
const placeStrip = sequelArt(5, "v2-tirinha-local", "Léo indica a mesma mesa onde os colegas estão sentados.");

const introduction = { en: "This is Rafael, our new classmate.", pt: "Esse é o Rafael, nosso colega novo." };
const greeting = { en: "Hello, Leo! Nice to meet you.", pt: "Olá, Léo! Prazer em te conhecer." };
const returnedGreeting = { en: "Nice to meet you, Rafael!", pt: "Prazer em te conhecer, Rafael!" };
const borrowing = { en: "Would you lend me this comic?", pt: "Você me emprestaria esse gibi?" };
const permission = { en: "Can I take this one today?", pt: "Posso levar esse hoje?" };
const time = { en: "Tomorrow at lunch.", pt: "Amanhã, na hora do almoço." };
const place = { en: "Right here.", pt: "Aqui mesmo." };
const goodbye = { en: "Thanks, everyone! I have to go. See you tomorrow, okay?",
  pt: "Valeu, pessoal! Tenho que ir. Mas até amanhã, hein?" };

const introductionExamples = [
  { context: "Ana apresenta Rafael", line: introduction, art: introduceStrip },
  { context: "Rafael cumprimenta Léo", line: greeting, art: rafaelGreeting },
  { context: "Léo retribui o cumprimento", line: returnedGreeting, art: replyStrip },
] as const satisfies readonly ComicExample[];

const borrowExamples = [
  { context: "Rafael pede o gibi emprestado", line: borrowing, art: borrowStrip },
  { context: "Rafael confirma se pode levar", line: permission, art: confirmBorrowStrip },
  { context: "Léo dá permissão", line: { en: "Sure! Go ahead.", pt: "Claro! Pode levar." }, art: leoLending },
] as const satisfies readonly ComicExample[];

const meetingExamples = [
  { context: "Léo combina quando eles vão se ver", line: time, art: timeStrip },
  { context: "Léo confirma o lugar", line: place, art: placeStrip },
  { context: "Rafael agradece e se despede",
    line: { en: "Thanks, everyone! See you tomorrow!", pt: "Valeu, pessoal! Até amanhã!" }, art: rafaelSayingGoodbye },
] as const satisfies readonly ComicExample[];

const blank = "";
const meetLeo = { edition: "sequel", part: 3, partTitle: "Conhecendo Léo" } as const;
const borrowComic = { edition: "sequel", part: 4, partTitle: "O gibi emprestado" } as const;
const seeYouTomorrow = { edition: "sequel", part: 5, partTitle: "Até amanhã" } as const;

export const sequelPages: readonly SequelPage[] = [
  {
    ...meetLeo, id: "meet-leo-v2-arrival", kind: "História", title: "Léo chega à mesa",
    caption: "Léo se aproxima da mesa.",
    panels: [
      { art: arrivingLeo, ...guidedLine("Léo",
        ["Hi, Ana!", "I see you finished", "the comic.", "Did you like it?"],
        ["Olá, Ana!", "Vi que você já", "terminou o gibi.", "Gostou?"],
        "Monte a pergunta do Léo para a Ana.") },
      { art: anaIntroducing, portraitFocus: "left", line: { speaker: "Ana", en: "I loved it! Oh, Leo, this is Rafael, our new classmate.",
        pt: "Adorei! Ah, Léo, esse é o Rafael, nosso colega novo." } },
    ],
  },
  {
    ...meetLeo, id: "meet-leo-v2-greetings", kind: "História", title: "Rafael e Léo se apresentam",
    caption: blank,
    panels: [
      { art: rafaelGreeting, portraitFocus: "right", line: { speaker: "Rafael", ...greeting },
        activity: {
          mode: "assemble", instruction: "Cumprimente o Léo.",
          bank: { en: ["Nice to meet you.", "Hello, Leo!"], pt: ["Prazer em te conhecer.", "Olá, Léo!"] },
          solution: { en: [1, 0], pt: [1, 0] },
        } },
      { art: leoGreeting, ...guidedLine("Léo",
        ["Nice to meet you, Rafael!", "Do you like", "comics too?"],
        ["Prazer em te conhecer, Rafael!", "Você também", "gosta de gibi?"],
        "Monte a resposta do Léo.") },
    ],
  },
  {
    ...meetLeo, id: "meet-leo-v2-strip", kind: "Tirinha", title: "Apresentações",
    caption: "Ana apresentou vocês. Você disse “Nice to meet you” ao Léo, que respondeu com a mesma expressão.",
    panels: introductionExamples,
  },
  {
    ...meetLeo, id: "meet-leo-v2-explanation", kind: "Explicação", title: "Quando alguém apresenta vocês",
    caption: "Ana usa “This is Rafael” para apresentar Rafael.\nRafael cumprimenta Léo, e os dois dizem “Nice to meet you”.",
    examples: [introductionExamples[0], introductionExamples[2]],
  },
  {
    ...meetLeo, id: "meet-leo-v2-challenge", kind: "Desafio", title: "Cumprimente o Léo",
    caption: blank, art: rafaelGreeting,
    exercises: [{
      mode: "choose",
      instruction: "Ana acabou de apresentar vocês. O que você diz ao Léo?",
      bank: { en: ["I loved it!", "Nice to meet you.", "Do you like comics too?"],
        pt: ["Adorei!", "Prazer em te conhecer.", "Você também gosta de gibi?"] },
      solution: { en: [1], pt: [1] },
    }],
    confirmation: "Boa! Você cumprimentou o Léo na hora certa.",
  },
  {
    ...borrowComic, id: "borrow-comic-v2-request", kind: "História", title: "De quem é o gibi?",
    caption: blank,
    panels: [
      { art: anaExplaining, portraitFocus: "left", line: { speaker: "Ana",
        en: "Oh, Rafael, this is actually Leo’s comic. He lent it to me. He loves comics and has a huge collection.",
        pt: "Ah, Rafael, esse gibi é do Léo, na verdade. Foi ele que me emprestou. Ele adora gibis e tem uma coleção enorme." } },
      { art: rafaelAsking, portraitFocus: "right", line: { speaker: "Rafael", en: "Wow, really? Leo, would you lend me this one?",
        pt: "Uau, sério? Léo, você me emprestaria esse?" },
        activity: {
          mode: "assemble", instruction: "Peça o gibi emprestado ao Léo.",
          bank: { en: ["this one?", "you", "Would", "lend me"], pt: ["esse?", "me emprestaria", "Você"] },
          solution: { en: [2, 1, 3, 0], pt: [2, 1, 0] },
        } },
    ],
  },
  {
    ...borrowComic, id: "borrow-comic-v2-lending", kind: "História", title: "Léo entrega o gibi",
    caption: blank,
    panels: [{ art: leoLending, ...guidedLine("Léo",
      ["Sure, man!", "You can take this one today.", "And if you want,", "I can bring the new issue", "tomorrow, too."],
      ["Claro, cara!", "Pode levar esse hoje.", "E, se quiser,", "amanhã eu trago", "a edição nova também."],
      "Monte a oferta do Léo.") }],
  },
  {
    ...borrowComic, id: "borrow-comic-v2-strip", kind: "Tirinha", title: "Peça o gibi emprestado",
    caption: "Rafael descobre que o gibi é do Léo. Ele diz “Would you lend me this one?” porque os dois já sabem de qual gibi estão falando.",
    panels: borrowExamples,
  },
  {
    ...borrowComic, id: "borrow-comic-v2-explanation", kind: "Explicação", title: "Como pedir algo emprestado",
    caption: "Para pedir o gibi emprestado, diga “Would you lend me this comic?”\nPara confirmar se pode levar hoje, pergunte “Can I take this one today?”",
    examples: [borrowExamples[0], borrowExamples[1]],
  },
  {
    ...borrowComic, id: "borrow-comic-v2-challenge", kind: "Desafio", title: "Monte o pedido",
    caption: blank, art: rafaelAsking,
    exercises: [{
      mode: "assemble",
      instruction: "Peça ao Léo para te emprestar o gibi hoje.",
      bank: { en: ["comic", "you", "today,", "Would", "Leo?", "me", "lend", "your"],
        pt: ["gibi", "emprestaria", "Léo?", "Você", "hoje,", "seu", "me"] },
      solution: { en: [3, 1, 6, 5, 7, 0, 2, 4], pt: [3, 6, 1, 5, 0, 4, 2] },
      prefilled: { en: [0, 4], pt: [0, 3] },
    }],
    confirmation: "Boa! Você pediu o gibi emprestado.",
  },
  {
    ...seeYouTomorrow, id: "see-you-tomorrow-v2-meeting", kind: "História", title: "Eles combinam o almoço",
    caption: blank,
    panels: [
      { art: rafaelSuggesting, portraitFocus: "right", ...guidedLine("Rafael",
        ["Wow, really?", "Can we meet", "at lunch, then?"],
        ["Uau, é sério?", "Pode ser", "na hora do almoço, então?"],
        "Sugira um encontro na hora do almoço.") },
      { art: leoConfirming, ...guidedLine("Léo",
        ["Yeah!", "Tomorrow at lunch,", "right here."],
        ["Sim!", "Amanhã, na hora do almoço,", "aqui mesmo."],
        "Monte a confirmação do Léo.") },
    ],
  },
  {
    ...seeYouTomorrow, id: "see-you-tomorrow-v2-thanks", kind: "História", title: "Rafael agradece",
    caption: blank,
    panels: [
      { art: rafaelThanking, portraitFocus: "right", ...guidedLine("Rafael",
        ["Thanks, man!", "You’re awesome."],
        ["Cara, valeu!", "Você é incrível."],
        "Agradeça ao Léo.") },
      { art: anaAgreeing, portraitFocus: "left", line: { speaker: "Ana", en: "Yeah, he is.", pt: "Sim, ele é." } },
    ],
  },
  {
    ...seeYouTomorrow, id: "see-you-tomorrow-v2-bell", kind: "História", title: "Hora de ir",
    caption: "O sinal toca.",
    panels: [{ art: rafaelSayingGoodbye }],
  },
  {
    ...seeYouTomorrow, id: "see-you-tomorrow-v2-strip", kind: "Tirinha", title: "Até amanhã",
    caption: "Vocês combinaram de se ver amanhã, na hora do almoço, nessa mesma mesa. Agora tocou o sinal. É hora de se despedir.",
    panels: meetingExamples,
  },
  {
    ...seeYouTomorrow, id: "see-you-tomorrow-v2-explanation", kind: "Explicação", title: "Como combinar um encontro e se despedir",
    caption: "“Tomorrow at lunch” indica quando, e “Right here” indica onde.\nAo sair, diga “Thanks, everyone!”, “I have to go” e “See you tomorrow!”",
    examples: meetingExamples,
  },
  {
    ...seeYouTomorrow, id: "see-you-tomorrow-v2-challenge", kind: "Desafio", title: "Antes de sair",
    caption: blank, art: rafaelSayingGoodbye,
    exercises: [
      {
        mode: "assemble", instruction: "Confirme quando vocês vão se ver.",
        bank: { en: ["at lunch", "Tomorrow"], pt: ["na hora do almoço", "Amanhã,"] },
        solution: { en: [1, 0], pt: [1, 0] },
      },
      {
        mode: "assemble", instruction: "Confirme onde vocês vão se encontrar. Use as duas palavras do Léo.",
        bank: { en: ["here", "Right"], pt: ["mesmo", "Aqui"] },
        solution: { en: [1, 0], pt: [1, 0] },
      },
      {
        mode: "assemble",
        instruction: "Monte a despedida do Rafael. Primeiro agradeça, depois diga que precisa ir e, por fim, se despeça.",
        bank: { en: ["See you tomorrow, okay?", "Thanks, everyone!", "I have to go."],
          pt: ["Mas até amanhã, hein?", "Valeu, pessoal!", "Tenho que ir."] },
        solution: { en: [1, 2, 0], pt: [1, 2, 0] },
      },
    ],
    confirmation: "Você completou a conversa!",
    closing: [
      { art: rafaelSayingGoodbye, line: { speaker: "Rafael", ...goodbye } },
      { art: friendsWaving, ...guidedLine("Ana e Léo",
        ["Bye!", "See you tomorrow!"], ["Tchau!", "Até amanhã!"],
        "Complete a despedida da Ana e do Léo.") },
      { art: rafaelLeaving },
    ],
  },
];

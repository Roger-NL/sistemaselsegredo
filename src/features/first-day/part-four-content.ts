import { comicArt, type Bilingual, type PartTwoPage } from "./part-two-content";

const askingTime = comicArt(4, "horario", "Rafael aponta para o relógio no próprio pulso enquanto combina o horário com Leo.", {
  desktop: { mouth: [.743, .373], headTop: .03, oval: [.660, .106, 263, 98], completed: [.665, .114, 307, 123] },
  portrait: { mouth: [.751, .439], headTop: .18, oval: [.666, .134, 156, 57], completed: [.666, .134, 173, 76] },
});
const rightHere = comicArt(4, "aqui", "Leo aponta para a própria mesa para combinar onde vão se encontrar de novo.", {
  desktop: { mouth: [.457, .379], headTop: .05, oval: [.601, .114, 341, 134] },
  portrait: { mouth: [.491, .378], headTop: .19, oval: [.688, .134, 180, 83] },
});
const bell = comicArt(4, "sinal", "A campainha toca. Rafael se levanta e ergue a mão em direção a Ana e Leo.", {
  desktop: { mouth: [.709, .200], headTop: .008, oval: [.473, .102, 390, 103], completed: [.473, .105, 445, 132] },
  portrait: { mouth: [.710, .299], headTop: .010, oval: [.490, .103, 151, 62], completed: [.510, .108, 147, 97] },
});
const goodbye = comicArt(4, "adeus", "Ana e Leo acenam para Rafael, que segue em direção à saída da cafeteria.", {
  desktop: { headTop: .14, oval: [.589, .117, 275, 133] },
  portrait: { headTop: .22, oval: [.702, .131, 156, 83] },
});
const lunchArt = comicArt(4, "almoco", "Uma aluna leva uma bandeja de almoço para a mesa na cafeteria.", {
  desktop: { headTop: .04, oval: [.599, .093, 270, 95], completed: [.602, .096, 306, 134] },
  portrait: { headTop: .06, oval: [.693, .137, 142, 56], completed: [.689, .146, 175, 84] },
});
const noonArt = comicArt(4, "meio-dia", "O relógio digital da cafeteria marca 12:00.");
const tomorrowArt = comicArt(4, "amanha", "A mesa da cafeteria onde Rafael, Ana e Leo combinaram de se encontrar no dia seguinte.", {
  desktop: { headTop: .06, oval: [.552, .127, 235, 92] },
  portrait: { headTop: .08, oval: [.551, .132, 143, 56] },
});

const base = { part: 4, partTitle: "Até a próxima" } as const;
const lunch = { en: "At lunch.", pt: "Na hora do almoço." } satisfies Bilingual;
const noon = { en: "At noon.", pt: "Ao meio-dia." } satisfies Bilingual;
const appointment = { en: "Tomorrow at lunch.", pt: "Amanhã, na hora do almoço." } satisfies Bilingual;

export const partFourPages: readonly PartTwoPage[] = [
  {
    ...base, id: "see-you-1", kind: "Ação", title: "Combine o horário",
    caption: "Leo pode trazer a edição nova amanhã. Confirme quando vocês vão se encontrar.",
    replyCaption: "Leo confirma o horário e aponta para a mesa.",
    before: askingTime, after: rightHere,
    words: ["At", "lunch?"], order: [1, 0],
    translations: ["", "Na hora…", "Na hora do almoço?"],
    reply: { speaker: "Leo", en: "Yeah, right here.", pt: "Sim, aqui mesmo." },
  },
  {
    ...base, id: "see-you-2", kind: "Ação", title: "Despeça-se",
    caption: "O sinal toca. É hora da aula.",
    replyCaption: "Ana e Leo se despedem com um aceno.",
    before: bell, after: goodbye,
    prefix: { en: "Thanks, Leo.", pt: "Valeu, Leo." },
    words: ["See", "you", "guys", "tomorrow!"], order: [3, 1, 0, 2],
    translations: ["Valeu, Leo.", "Valeu, Leo. Até…", "Valeu, Leo. Até…", "Valeu, Leo. Até mais, pessoal…", "Valeu, Leo. Até amanhã, pessoal!"],
    reply: { speaker: "Ana & Leo", en: "See you!", pt: "Até!" },
  },
  {
    ...base, id: "see-you-3", kind: "Tirinha", title: "Um novo combinado",
    caption: "At lunch indica a hora do almoço. At noon quer dizer meio-dia.",
    panels: [
      { context: "A refeição", line: lunch, art: lunchArt },
      { context: "O relógio", line: noon, art: noonArt },
      { context: "O dia e o horário juntos", line: appointment, art: tomorrowArt },
    ],
  },
  {
    ...base, id: "see-you-4", kind: "Explicação", title: "Como combinar e se despedir",
    caption: "Tomorrow indica o dia. At lunch indica quando se encontrar. Para se despedir, use See you.",
    pieces: [
      { token: "Tomorrow", meaning: "em que dia" },
      { token: "at lunch", meaning: "em que horário" },
    ],
    examples: [
      { line: appointment, art: tomorrowArt, tokens: [{ text: "Tomorrow", piece: 0 }, { text: "at lunch.", piece: 1 }],
        explanation: "Você diz o dia e o horário." },
      { line: { en: "See you tomorrow!", pt: "Até amanhã!" }, art: goodbye,
        tokens: [{ text: "See you" }, { text: "tomorrow!", piece: 0 }],
        explanation: "Você se despede e menciona o dia seguinte." },
    ],
  },
  {
    ...base, id: "see-you-5", kind: "Desafio", title: "Marque o combinado",
    caption: "Leo pode trazer a edição nova no dia seguinte.",
    revealCaption: "Vocês vão se encontrar na mesma mesa no intervalo do meio do dia.",
    completeCaption: appointment.pt,
    rounds: [
      {
        label: "Dia", choice: true,
        instruction: "Em que dia eles vão se encontrar de novo?",
        retryHint: "Tomorrow significa amanhã.",
        bank: ["Today", "Tomorrow"], solution: [1], translation: "Amanhã", art: tomorrowArt,
      },
      {
        label: "Horário", choice: true,
        instruction: "Em que horário eles vão se encontrar?",
        retryHint: "At lunch é na hora do almoço.",
        bank: ["At breakfast", "At lunch"], solution: [1], translation: "Na hora do almoço", art: lunchArt,
      },
    ],
  },
];

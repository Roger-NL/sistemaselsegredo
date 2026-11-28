type Language = "en" | "pt";

type Segment = {
  en: string;
  pt: string;
  toPt: string;
  toEn: string;
};

function line(en: string, pt: string, toPt = "", toEn = ""): Segment {
  return { en, pt, toPt, toEn };
}

// Each preview describes what the reader knows after another word. Function
// words can leave the preview unchanged until the corresponding idea is clear.
const dialogue: readonly (readonly Segment[])[] = [
  [
    line("Hi, Ana!", "Olá, Ana!", "Olá,", "Hi,"),
    line("I see you finished the comic.", "Vi que você já terminou o gibi.",
      "Eu…|Vi…|Vi que você…|Vi que você já terminou…|Vi que você já terminou o…",
      "I see…|I see that…|I see you…|I see you already…|I see you finished…|I see you finished the…"),
    line("Did you like it?", "Gostou?", "…|Você…|Gostou…"),
  ],
  [
    line("Hello, Leo!", "Olá, Léo!", "Olá,", "Hello,"),
    line("Nice to meet you.", "Prazer em te conhecer.", "Prazer…|Prazer em…|Prazer em te conhecer…",
      "Nice…|Nice to…|Nice to meet you…"),
  ],
  [
    line("Nice to meet you, Rafael!", "Prazer em te conhecer, Rafael!",
      "Prazer…|Prazer em…|Prazer em te conhecer…|Prazer em te conhecer,",
      "Nice…|Nice to…|Nice to meet you…|Nice to meet you,"),
    line("Do you like comics too?", "Você também gosta de gibi?",
      "…|Você…|Você gosta…|Você gosta de gibi…",
      "You…|You also…|Do you like…|Do you like…"),
  ],
  [line("Nice to meet you.", "Prazer em te conhecer.", "Prazer…|Prazer em…|Prazer em te conhecer…",
    "Nice…|Nice to…|Nice to meet you…")],
  [line("Would you lend me this one?", "Você me emprestaria esse?",
    "…|Você…|Você emprestaria…|Você me emprestaria…|Você me emprestaria esse…",
    "Would you…|Would you…|Would you lend me…")],
  [line("Would you lend me your comic today, Leo?", "Você me emprestaria seu gibi hoje, Léo?",
    "…|Você…|Você emprestaria…|Você me emprestaria…|Você me emprestaria seu…|Você me emprestaria seu gibi…|Você me emprestaria seu gibi hoje,",
    "Would you…|Would you…|Would you lend me…|Would you lend me your…|Would you lend me your comic…|Would you lend me your comic today,")],
  [
    line("Sure, man!", "Claro, cara!", "Claro,", "Sure,"),
    line("You can take this one today.", "Pode levar esse hoje.",
      "Você…|Pode…|Pode levar…|Pode levar esse…|Pode levar esse…",
      "You can…|You can take…|You can take this one…"),
    line("And if you want,", "E, se quiser,", "E…|E, se…|E, se você…",
      "And…|And if…"),
    line("I can bring the new issue tomorrow, too.", "amanhã eu trago a edição nova também.",
      "eu…|eu posso…|eu trago…|eu trago a…|eu trago a nova…|eu trago a edição nova…|amanhã eu trago a edição nova…",
      "tomorrow…|I…|I can bring…|I can bring the…|I can bring the issue…|I can bring the new issue tomorrow…"),
  ],
  [
    line("Leo,", "Léo,"),
    line("would you lend me this one?", "você me emprestaria esse?",
      "…|você…|você emprestaria…|você me emprestaria…|você me emprestaria esse…",
      "would you…|would you…|would you lend me…"),
  ],
  [
    line("Wow, really?", "Uau, é sério?", "Uau,", "Wow,|Wow, really…"),
    line("Can we meet at lunch, then?", "Pode ser na hora do almoço, então?",
      "Pode…|Pode…|Pode ser…|Pode ser na…|Pode ser na hora do almoço…",
      "Can…|Can we meet…|Can we meet at…|Can we meet at…|Can we meet at…|Can we meet at lunch,"),
  ],
  [
    line("Yeah!", "Sim!"),
    line("Tomorrow at lunch,", "Amanhã, na hora do almoço,", "Amanhã…|Amanhã, na hora de…",
      "Tomorrow…|Tomorrow at…|Tomorrow at…|Tomorrow at…"),
    line("right here.", "aqui mesmo.", "bem…", "here…"),
  ],
  [
    line("Thanks, man!", "Cara, valeu!", "Valeu…", "Man…"),
    line("You’re awesome.", "Você é incrível.", "Você é…", "You…|You’re…"),
  ],
  [
    line("Tomorrow at lunch", "Amanhã, na hora do almoço", "Amanhã…|Amanhã, na hora de…",
      "Tomorrow…|Tomorrow at…|Tomorrow at…|Tomorrow at…"),
  ],
  [line("Right here", "Aqui mesmo", "Bem…", "Here…")],
  [
    line("Thanks, everyone!", "Valeu, pessoal!", "Valeu,", "Thanks,"),
    line("I have to go.", "Tenho que ir.", "Eu…|Tenho…|Tenho que…",
      "I have…|I have to…"),
    line("See you tomorrow, okay?", "Mas até amanhã, hein?", "Até…|Até…|Até amanhã,",
      "But…|See you…|See you tomorrow,"),
  ],
  [
    line("Bye!", "Tchau!"),
    line("See you tomorrow!", "Até amanhã!", "Até…|Até…", "See you…"),
  ],
];

const translations = { en: new Map<string, string[]>(), pt: new Map<string, string[]>() };

for (const segments of dialogue) {
  for (const language of ["en", "pt"] as const) {
    const opposite = language === "en" ? "pt" : "en";
    const progression = [""];
    let completed = "";
    for (const segment of segments) {
      const wordCount = segment[language].split(" ").length;
      const previews = (language === "en" ? segment.toPt : segment.toEn).split("|");
      const prefix = completed ? completed + " " : "";
      for (let index = 0; index < wordCount - 1; index++) {
        progression.push(prefix + (previews[index] || "…"));
      }
      completed = prefix + segment[opposite];
      progression.push(completed);
    }
    translations[language].set(segments.map(segment => segment[language]).join(" "), progression);
  }
}

export function sequelWordTranslation(original: string, language: Language, count: number, after = 0): string {
  const progression = translations[language].get(original);
  if (!progression || count <= after) return "";
  const prefix = progression[after] ?? "";
  const text = progression[Math.min(count, progression.length - 1)];
  return text.startsWith(prefix) ? text.slice(prefix.length).trimStart() : text;
}

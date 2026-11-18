/** Written consolidation and a small transfer test, independent of practice. */
export const LESSON_CONCLUSION_STORAGE = "basedspeak.lesson-one.conclusion.v1";
export type ConclusionPronoun = "I" | "you" | "we" | "they";
export type ConclusionTheory = {
  id: string; title: string; english: string; portuguese: string;
  explanationPT: string; example: string; translation: string; note: string;
};
export const CONCLUSION_THEORY: readonly ConclusionTheory[] = [
  { id: "i", title: "Como digo que estou pronto?", english: "I am ready.", portuguese: "Estou pronto ou pronta.",
    explanationPT: "Com meu nome, I am diz quem eu sou. Com ready, diz como estou.",
    example: "I'm ready.", translation: "Estou pronta.", note: "I'm é a forma curta de I am." },
  { id: "you", title: "Como pergunto se você está pronto?", english: "Are you ready?", portuguese: "Você está pronto ou pronta?",
    explanationPT: "Na pergunta, are vem antes de you.",
    example: "You are ready.", translation: "Você está pronto ou pronta.", note: "Na afirmação, you vem primeiro." },
  { id: "we", title: "Como apresento uma amizade?", english: "We are friends.", portuguese: "Nós somos amigos.",
    explanationPT: "Maya fala sobre ela e Sam. We inclui Maya nessa amizade.",
    example: "We're friends.", translation: "Somos amigos.", note: "We're é a forma curta de we are." },
  { id: "they", title: "Como aviso que eles chegaram?", english: "They are here.", portuguese: "Eles estão aqui.",
    explanationPT: "Ana vê Maya e Sam chegando. Ela usa they para falar dos dois.",
    example: "They're here.", translation: "Eles estão aqui.", note: "They're é a forma curta de they are." },
  { id: "forms", title: "Qual forma completa a frase?", english: "I am · You are · We are · They are", portuguese: "A forma acompanha o pronome",
    explanationPT: "Use am com I. Use are com you, we e they.",
    example: "We are ready.", translation: "Estamos prontos.", note: "Ready funciona no singular e no plural." },
];

export type ConclusionQuestion = {
  id: string; kind: "choice" | "writing"; context: string; prompt: string;
  expected: { pronoun: ConclusionPronoun; complement: string; question?: boolean };
  choices?: readonly string[]; relationPT: string; relationEN: string;
};
const ORIGINAL_QUESTIONS: readonly ConclusionQuestion[] = [
  { id: "self", kind: "choice", context: "Leo acaba de conhecer Ana. Ele diz seu próprio nome.", prompt: "Qual é a fala de Leo?",
    expected: { pronoun: "I", complement: "Leo" }, choices: ["You are Leo.", "They are a team.", "I am Leo.", "We are a team."],
    relationPT: "Leo fala de si, por isso usa I. Com I, usamos am.", relationEN: "Leo is speaking about himself: I am Leo." },
  { id: "listener", kind: "choice", context: "Ana fala diretamente com Maya, dizendo quem Maya é.", prompt: "Qual é a fala de Ana para Maya?",
    expected: { pronoun: "you", complement: "Maya" }, choices: ["I am Maya.", "You are Maya.", "We are a team.", "They are a team."],
    relationPT: "Maya recebe a fala. Ana usa you para falar com ela; mesmo sendo uma pessoa, a forma é are.", relationEN: "Ana is speaking to Maya: You are Maya." },
  { id: "inside", kind: "choice", context: "Equipe: Ana + Leo. Leo apresenta essa equipe a Maya, que não faz parte dela.", prompt: "Como Leo apresenta a própria equipe?",
    expected: { pronoun: "we", complement: "a team" }, choices: ["They are a team.", "You are a team.", "I am Leo.", "We are a team."],
    relationPT: "Leo pertence à equipe Ana + Leo. Como o grupo inclui quem fala, ele usa we are.", relationEN: "Leo is part of the team: We are a team." },
  { id: "outside", kind: "choice", context: "Equipe: Maya + Sam. Ana descreve essa equipe para Leo. Ana e Leo estão fora dela.", prompt: "Qual é a fala de Ana sobre essa equipe?",
    expected: { pronoun: "they", complement: "a team" }, choices: ["They are a team.", "We are a team.", "You are a team.", "I am Ana."],
    relationPT: "Ana descreve outras pessoas; ela e Leo estão fora dessa equipe. A fala usa they are.", relationEN: "Ana is speaking about another group: They are a team." },
  { id: "write-self", kind: "writing", context: "Ana chega a uma reunião e se apresenta a Nina.", prompt: "Apresente-se como Ana usando I am ou I’m.",
    expected: { pronoun: "I", complement: "Ana" }, relationPT: "Use I am ou I’m antes do nome de Ana.", relationEN: "I am Ana. / I’m Ana." },
  { id: "write-listener", kind: "writing", context: "Maya fala diretamente com Leo, dizendo quem Leo é.", prompt: "Escreva a fala de Maya para Leo em inglês.",
    expected: { pronoun: "you", complement: "Leo" }, relationPT: "Leo recebe a fala. Maya diz you are, mesmo falando com uma só pessoa.", relationEN: "Maya is speaking to Leo: You are Leo." },
];

// Distinct IDs let an existing attempt keep the exact prompt it answered.
export const CONCLUSION_QUESTIONS: readonly ConclusionQuestion[] = [
  ORIGINAL_QUESTIONS[0], ORIGINAL_QUESTIONS[1],
  { id: "inside-friends", kind: "choice", context: "Sam e Maya são amigos. Sam conta isso a Leo.", prompt: "O que Sam diz a Leo?",
    expected: { pronoun: "we", complement: "friends" }, choices: ["They are friends.", "You are here.", "I am ready.", "We are friends."],
    relationPT: "Sam faz parte da dupla. We are friends inclui Sam e Maya.", relationEN: "Sam and Maya are friends." },
  { id: "outside-here", kind: "choice", context: "Ana vê Maya e Sam chegarem e avisa a Leo que eles estão aqui.", prompt: "Qual é o aviso de Ana?",
    expected: { pronoun: "they", complement: "here" }, choices: ["They are here.", "We are here.", "You are here.", "I am here."],
    relationPT: "Ana fala de Maya e Sam. They are here indica onde os dois estão.", relationEN: "They are here." },
  ORIGINAL_QUESTIONS[4],
  { id: "write-ready", kind: "writing", context: "Antes da aula, Nina pergunta a Leo “Are you ready?”. Ele responde “Estou pronto”.", prompt: "Escreva a resposta de Leo.",
    expected: { pronoun: "I", complement: "ready" },
    relationPT: "Leo fala de si. I am ready e I'm ready dizem que ele está pronto.", relationEN: "I'm ready." },
];

/** Independent transfer practice. These IDs never enter a saved attempt. */
export const TRANSFER_QUESTIONS: readonly ConclusionQuestion[] = [
  { id: "transfer-ask-ready", kind: "choice", context: "Nina quer saber se Maya está pronta para começar.",
    prompt: "Como Nina pergunta isso a Maya?", expected: { pronoun: "you", complement: "ready", question: true },
    choices: ["You are ready.", "Are you ready?", "I am ready.", "We are ready."],
    relationPT: "Nina pergunta a Maya. Para fazer a pergunta, are vem antes de you.", relationEN: "Are you ready?" },
  { id: "transfer-group-here", kind: "writing", context: "Você e Leo chegaram à biblioteca. Maya pergunta onde vocês estão.",
    prompt: "Diga em inglês que vocês estão aqui.", expected: { pronoun: "we", complement: "here" },
    relationPT: "Você faz parte da dupla. We are here e We're here dizem que vocês estão aqui.", relationEN: "We are here." },
];

export function getConclusionQuestions(state: ConclusionState): readonly ConclusionQuestion[] {
  return CONCLUSION_QUESTIONS.map((question, index) => {
    const previous = ORIGINAL_QUESTIONS[index];
    return previous.id !== question.id && state.attempts[previous.id] && !state.attempts[question.id] ? previous : question;
  });
}

export type ConclusionEvaluation = { correct: boolean; meaningCorrect: boolean; formCorrect: boolean; model: string; feedbackTitle: string; explanationPT: string; explanationEN: string; notes: string[] };
export function conclusionModel(question: ConclusionQuestion) {
  const pronoun = question.expected.pronoun;
  if (question.expected.question) return `${pronoun === "I" ? "Am" : "Are"} ${pronoun} ${question.expected.complement}?`;
  return `${pronoun === "I" ? "I" : pronoun[0].toUpperCase() + pronoun.slice(1)} ${pronoun === "I" ? "am" : "are"} ${question.expected.complement}.`;
}
export function evaluateConclusionAnswer(question: ConclusionQuestion, raw: string): ConclusionEvaluation {
  const normalized = raw.normalize("NFKC").toLowerCase().replace(/[’‘]/g, "'")
    .replace(/[.,!?;:]+/g, " ").replace(/\s+/g, " ").trim();
  if (question.expected.question) {
    const model = conclusionModel(question);
    const correct = normalized === model.slice(0, -1).toLowerCase();
    return { correct, meaningCorrect: correct, formCorrect: correct, model, feedbackTitle: correct ? "Isso mesmo." : "Observe a ordem da pergunta.", explanationPT: question.relationPT, explanationEN: question.relationEN, notes: [] };
  }
  const expanded = normalized.replace(/^(?:i'm|im|iam|i m)\b/, "i am")
    .replace(/^(you|we|they)(?:'re|re| re)\b/, "$1 are");
  const parsed = /^(i|you|we|they)(?: (am|are|is))? (.+)$/.exec(expanded);
  const pronoun = parsed?.[1] === "i" ? "I" : parsed?.[1];
  const complement = parsed?.[3];
  const alias = question.expected.complement === "Ana" && complement === "anna";
  const meaningCorrect = pronoun === question.expected.pronoun && (complement === question.expected.complement.toLowerCase() || alias);
  const formCorrect = Boolean(parsed && parsed[2] === (pronoun === "I" ? "am" : "are"));
  const notes: string[] = [];
  if (meaningCorrect && !formCorrect) notes.push(`O sentido ficou claro. Ajuste a forma para ${conclusionModel(question)}`);
  const informalContraction = /^(im|iam|i m)\b/.test(normalized);
  if (meaningCorrect && informalContraction) notes.push("Use I'm, com apóstrofo, ou I am.");
  else if (meaningCorrect && alias) notes.push("Nesta cena, escrevemos Ana: I am Ana.");
  const correct = meaningCorrect && formCorrect;
  let feedbackTitle = correct ? "Faz sentido." : meaningCorrect ? "Ajuste am ou are." : "Observe quem está falando.";
  if (question.id === "write-self" && normalized === "my name is ana") feedbackTitle = "Essa frase também apresenta Ana.";
  return { correct, meaningCorrect, formCorrect, model: conclusionModel(question), feedbackTitle,
    explanationPT: question.relationPT, explanationEN: question.relationEN, notes };
}

export type ConclusionAttempt = { draft: string; firstAnswer: string | null; lastAnswer: string | null };
export type ConclusionState = { version: 1; phase: "theory" | "test" | "summary"; theoryIndex: number; theoryBlock?: 0 | 1; questionIndex: number; testStarted: boolean; attempts: Record<string, ConclusionAttempt> };
export function createConclusionState(): ConclusionState {
  return { version: 1, phase: "theory", theoryIndex: 0, questionIndex: 0, testStarted: false, attempts: {} };
}
const emptyAttempt = (): ConclusionAttempt => ({ draft: "", firstAnswer: null, lastAnswer: null });
export function getConclusionAttempt(state: ConclusionState, question: ConclusionQuestion): ConclusionAttempt {
  return state.attempts[question.id] ?? emptyAttempt();
}
export function setConclusionDraft(state: ConclusionState, question: ConclusionQuestion, draft: string): ConclusionState {
  return { ...state, attempts: { ...state.attempts, [question.id]: { ...getConclusionAttempt(state, question), draft: draft.slice(0, 120), lastAnswer: null } } };
}
export function submitConclusionAnswer(state: ConclusionState, question: ConclusionQuestion): ConclusionState {
  const attempt = getConclusionAttempt(state, question);
  if (!attempt.draft.trim()) return state;
  return { ...state, attempts: { ...state.attempts, [question.id]: { ...attempt, firstAnswer: attempt.firstAnswer ?? attempt.draft, lastAnswer: attempt.draft } } };
}
export function getConclusionScore(state: ConclusionState) {
  const first = getConclusionQuestions(state).map(question => {
    const answer = state.attempts[question.id]?.firstAnswer;
    return answer == null ? null : evaluateConclusionAnswer(question, answer);
  });
  return { total: CONCLUSION_QUESTIONS.length, answered: first.filter(Boolean).length,
    correct: first.filter(result => result?.correct).length, meaning: first.filter(result => result?.meaningCorrect).length,
    form: first.filter(result => result?.formCorrect).length };
}
export function isConclusionComplete(state: ConclusionState) {
  return getConclusionQuestions(state).every(question => {
    const answer = state.attempts[question.id]?.lastAnswer;
    return answer != null && evaluateConclusionAnswer(question, answer).correct;
  });
}
export function restoreConclusionState(raw: string | null): ConclusionState {
  try {
    const saved = JSON.parse(raw ?? "null");
    if (saved?.version !== 1 || !["theory", "test", "summary"].includes(saved.phase)) return createConclusionState();
    const attempts: ConclusionState["attempts"] = {};
    for (const question of [...ORIGINAL_QUESTIONS, ...CONCLUSION_QUESTIONS]) {
      const value = saved.attempts?.[question.id];
      if (!value || typeof value !== "object") continue;
      const answer = (text: unknown) => typeof text === "string" && text.trim() ? text.slice(0, 120) : null;
      const firstAnswer = answer(value.firstAnswer);
      attempts[question.id] = { draft: typeof value.draft === "string" ? value.draft.slice(0, 120) : "", firstAnswer,
        lastAnswer: firstAnswer === null ? null : answer(value.lastAnswer) };
    }
    const clamp = (value: unknown, max: number) => Number.isInteger(value) ? Math.max(0, Math.min(value as number, max)) : 0;
    const state: ConclusionState = { version: 1, phase: saved.phase, theoryIndex: clamp(saved.theoryIndex, CONCLUSION_THEORY.length - 1),
      ...(saved.theoryBlock === 1 ? { theoryBlock: 1 } : {}), questionIndex: clamp(saved.questionIndex, CONCLUSION_QUESTIONS.length - 1), testStarted: saved.testStarted === true || saved.phase !== "theory", attempts };
    const firstPending = getConclusionQuestions(state).findIndex(question => {
      const answer = attempts[question.id]?.lastAnswer;
      return answer == null || !evaluateConclusionAnswer(question, answer).correct;
    });
    if (firstPending >= 0) {
      state.questionIndex = Math.min(state.questionIndex, firstPending);
      if (state.phase === "summary") state.phase = "test";
    }
    return state;
  } catch { return createConclusionState(); }
}

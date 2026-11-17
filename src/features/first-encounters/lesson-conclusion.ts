/** Written consolidation and a small transfer test, independent of practice. */
export const LESSON_CONCLUSION_STORAGE = "basedspeak.lesson-one.conclusion.v1";
export type ConclusionPronoun = "I" | "you" | "we" | "they";
export type ConclusionTheory = {
  id: string; title: string; english: string; portuguese: string;
  explanationPT: string; explanationEN: string; example: string; translation: string; note: string;
};
export const CONCLUSION_THEORY: readonly ConclusionTheory[] = [
  { id: "i", title: "Quando eu falo de mim", english: "I am", portuguese: "Eu sou",
    explanationPT: "I é a pessoa que está falando de si. Para se apresentar, ela usa I am e seu nome.",
    explanationEN: "I means the speaker: I am Ana.",
    example: "I am Ana.", translation: "Eu sou Ana.", note: "To be expressa identidade ou pertencimento nesta aula; em outros contextos, também pode corresponder a estar." },
  { id: "you", title: "Quando eu falo com você", english: "You are", portuguese: "Você é · Vocês são",
    explanationPT: "You indica quem ouve: uma pessoa (tu/você) ou várias (vocês). Nos dois casos, usamos are.",
    explanationEN: "You can mean one person or several people.",
    example: "You are Leo.", translation: "Você é Leo.", note: "Para um grupo que está ouvindo: You are a team. = Vocês são uma equipe." },
  { id: "we", title: "Quando eu faço parte do grupo", english: "We are", portuguese: "Nós somos",
    explanationPT: "We inclui quem está falando e pelo menos mais uma pessoa. Quem fala pertence ao grupo que descreve.",
    explanationEN: "We includes the speaker.",
    example: "We are a team.", translation: "Nós somos uma equipe.", note: "Ana e Leo formam uma equipe. Ana pode apresentar esse grupo usando we." },
  { id: "they", title: "Quando eu falo de outro grupo", english: "They are", portuguese: "Eles são · Elas são",
    explanationPT: "Aqui, they aponta para um grupo de outras pessoas. Quem fala fica fora desse grupo.",
    explanationEN: "They refers to another group.",
    example: "They are a team.", translation: "Eles/Elas são uma equipe.", note: "O grupo pode ter mulheres, homens ou ambos. Isso não muda they are." },
  { id: "forms", title: "Por que am e are?", english: "I am · You are · We are · They are", portuguese: "A forma acompanha o pronome",
    explanationPT: "O verbo to be muda com o pronome: I am; you, we e they are. Are também acompanha you no singular.",
    explanationEN: "Use am with I; are with you, we and they.",
    example: "I am = I'm", translation: "Mesma ideia, duas formas.",
    note: "I'm encurta I am. O apóstrofo marca o a omitido; I am não leva apóstrofo." },
];

export type ConclusionQuestion = {
  id: string; kind: "choice" | "writing"; context: string; prompt: string;
  expected: { pronoun: ConclusionPronoun; complement: string };
  choices?: readonly string[]; relationPT: string; relationEN: string;
};
export const CONCLUSION_QUESTIONS: readonly ConclusionQuestion[] = [
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
  { id: "write-self", kind: "writing", context: "Ana chega a uma reunião e se apresenta a Nina.", prompt: "Escreva a fala de Ana em inglês.",
    expected: { pronoun: "I", complement: "Ana" }, relationPT: "Ana fala de si. A apresentação usa I am e o nome dela.", relationEN: "Ana introduces herself: I am Ana." },
  { id: "write-listener", kind: "writing", context: "Maya fala diretamente com Leo, dizendo quem Leo é.", prompt: "Escreva a fala de Maya para Leo em inglês.",
    expected: { pronoun: "you", complement: "Leo" }, relationPT: "Leo recebe a fala. Maya diz you are, mesmo falando com uma só pessoa.", relationEN: "Maya is speaking to Leo: You are Leo." },
];

export type ConclusionEvaluation = { correct: boolean; meaningCorrect: boolean; formCorrect: boolean; model: string; explanationPT: string; explanationEN: string; notes: string[] };
export function conclusionModel(question: ConclusionQuestion) {
  const pronoun = question.expected.pronoun;
  return `${pronoun === "I" ? "I" : pronoun[0].toUpperCase() + pronoun.slice(1)} ${pronoun === "I" ? "am" : "are"} ${question.expected.complement}.`;
}
export function evaluateConclusionAnswer(question: ConclusionQuestion, raw: string): ConclusionEvaluation {
  const normalized = raw.normalize("NFKC").toLowerCase().replace(/[’‘]/g, "'")
    .replace(/[.,!?;:]+/g, " ").replace(/\s+/g, " ").trim();
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
  return { correct: meaningCorrect && formCorrect, meaningCorrect, formCorrect, model: conclusionModel(question),
    explanationPT: question.relationPT, explanationEN: question.relationEN, notes };
}

export type ConclusionAttempt = { draft: string; firstAnswer: string | null; lastAnswer: string | null };
export type ConclusionState = { version: 1; phase: "theory" | "test" | "summary"; theoryIndex: number; questionIndex: number; testStarted: boolean; attempts: Record<string, ConclusionAttempt> };
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
  const first = CONCLUSION_QUESTIONS.map(question => {
    const answer = state.attempts[question.id]?.firstAnswer;
    return answer == null ? null : evaluateConclusionAnswer(question, answer);
  });
  return { total: CONCLUSION_QUESTIONS.length, answered: first.filter(Boolean).length,
    correct: first.filter(result => result?.correct).length, meaning: first.filter(result => result?.meaningCorrect).length,
    form: first.filter(result => result?.formCorrect).length };
}
export function isConclusionComplete(state: ConclusionState) {
  return CONCLUSION_QUESTIONS.every(question => {
    const answer = state.attempts[question.id]?.lastAnswer;
    return answer != null && evaluateConclusionAnswer(question, answer).correct;
  });
}
export function restoreConclusionState(raw: string | null): ConclusionState {
  try {
    const saved = JSON.parse(raw ?? "null");
    if (saved?.version !== 1 || !["theory", "test", "summary"].includes(saved.phase)) return createConclusionState();
    const attempts: ConclusionState["attempts"] = {};
    for (const question of CONCLUSION_QUESTIONS) {
      const value = saved.attempts?.[question.id];
      if (!value || typeof value !== "object") continue;
      const answer = (text: unknown) => typeof text === "string" && text.trim() ? text.slice(0, 120) : null;
      const firstAnswer = answer(value.firstAnswer);
      attempts[question.id] = { draft: typeof value.draft === "string" ? value.draft.slice(0, 120) : "", firstAnswer,
        lastAnswer: firstAnswer === null ? null : answer(value.lastAnswer) };
    }
    const clamp = (value: unknown, max: number) => Number.isInteger(value) ? Math.max(0, Math.min(value as number, max)) : 0;
    const state: ConclusionState = { version: 1, phase: saved.phase, theoryIndex: clamp(saved.theoryIndex, CONCLUSION_THEORY.length - 1),
      questionIndex: clamp(saved.questionIndex, CONCLUSION_QUESTIONS.length - 1), testStarted: saved.testStarted === true || saved.phase !== "theory", attempts };
    const firstPending = CONCLUSION_QUESTIONS.findIndex(question => {
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

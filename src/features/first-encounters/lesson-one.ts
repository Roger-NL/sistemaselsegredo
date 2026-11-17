/** The approved first lesson: six linguistic games, each followed by a new use. */
export type PersonId = "ana" | "leo" | "maya" | "sam" | "nina";
export type Pronoun = "I" | "you" | "we" | "they";
export type Verb = "am" | "are";
export type Phrase = { pronoun: Pronoun; verb: Verb; complement: string };
export type Round = {
  id: string;
  kind: "bubbles" | "join" | "speaker" | "verb" | "build" | "messages" | "ensemble";
  speaker: PersonId;
  listener: PersonId;
  team: PersonId[];
  referent: PersonId | "team";
  expected: Phrase;
  instruction: string;
  candidateSpeakers?: PersonId[];
  bubbleChoices?: Phrase[];
  ensemble?: Round[];
  anonymous?: boolean;
};
export type Scene = {
  id: string;
  game: number;
  mode: "game" | "use";
  title: string;
  prompt: string;
  hint: string;
  insight: string;
  rounds: Round[];
};
export type Evaluation = { correct: boolean; meaningCorrect: boolean; feedback: string; corrections: string[] };

export const PERSON_NAMES: Record<PersonId, string> = { ana: "Ana", leo: "Leo", maya: "Maya", sam: "Sam", nina: "Nina" };
export const PRONOUNS: Pronoun[] = ["I", "you", "we", "they"];
export const VERBS: Verb[] = ["am", "are"];

const phrase = (pronoun: Pronoun, complement: string): Phrase => ({ pronoun, verb: pronoun === "I" ? "am" : "are", complement });
const individualChoices = (name: string): Phrase[] => [phrase("I", name), phrase("you", name)];
const groupChoices = (): Phrase[] => [phrase("we", "a team"), phrase("they", "a team")];
function round(id: string, kind: Round["kind"], speaker: PersonId, listener: PersonId, team: PersonId[], referent: Round["referent"], expected: Phrase, instruction: string, extra: Partial<Pick<Round, "candidateSpeakers" | "bubbleChoices" | "ensemble" | "anonymous">> = {}): Round {
  return { id, kind, speaker, listener, team: [...team], referent, expected, instruction, ...extra };
}

const messages = [
  round("g5-a", "speaker", "ana", "nina", ["ana", "leo"], "team", phrase("we", "a team"), "Mensagem A: We are a team.", { candidateSpeakers: ["ana", "maya"], anonymous: true }),
  round("g5-b", "speaker", "maya", "nina", ["ana", "leo"], "team", phrase("they", "a team"), "Mensagem B: They are a team.", { candidateSpeakers: ["ana", "maya"], anonymous: true }),
];
const ensembleChoices = [phrase("I", "Ana"), phrase("you", "Ana"), phrase("we", "a team"), phrase("they", "a team")];
const ensemble = [
  round("g6-self", "bubbles", "ana", "maya", ["ana", "leo"], "ana", phrase("I", "Ana"), "Ana se apresenta a Maya.", { bubbleChoices: ensembleChoices }),
  round("g6-listener", "bubbles", "maya", "ana", ["ana", "leo"], "ana", phrase("you", "Ana"), "Maya fala diretamente com Ana sobre Ana.", { bubbleChoices: ensembleChoices }),
  round("g6-inside", "bubbles", "ana", "maya", ["ana", "leo"], "team", phrase("we", "a team"), "Ana apresenta sua equipe a Maya.", { bubbleChoices: ensembleChoices }),
  round("g6-outside", "bubbles", "sam", "maya", ["ana", "leo"], "team", phrase("they", "a team"), "Sam descreve a equipe Ana + Leo para Maya.", { bubbleChoices: ensembleChoices }),
];

export const LESSON_SCENES: Scene[] = [
  {
    id: "lesson-01", game: 1, mode: "game", title: "O balão tem dono",
    prompt: "O nome continua Ana. Escolha a fala de quem está com a vez.",
    hint: "I é quem fala. You é a pessoa a quem a fala se dirige.",
    insight: "A pessoa continua a mesma; muda se ela fala de si ou se outra pessoa fala com ela.",
    rounds: [
      round("g1-self", "bubbles", "ana", "leo", [], "ana", phrase("I", "Ana"), "Ana fala para Leo sobre si.", { bubbleChoices: individualChoices("Ana") }),
      round("g1-listener", "bubbles", "leo", "ana", [], "ana", phrase("you", "Ana"), "Agora Leo fala diretamente com Ana.", { bubbleChoices: individualChoices("Ana") }),
    ],
  },
  {
    id: "lesson-02", game: 1, mode: "use", title: "Outra pessoa se apresenta",
    prompt: "Use a mesma ideia na conversa de Maya e Sam.",
    hint: "Veja de quem sai o balão e para quem ele vai. O nome permanece Maya.",
    insight: "I e you não são nomes fixos de personagens. Eles acompanham a conversa.",
    rounds: [
      round("use1-self", "bubbles", "maya", "sam", [], "maya", phrase("I", "Maya"), "Maya se apresenta a Sam.", { bubbleChoices: individualChoices("Maya") }),
      round("use1-listener", "bubbles", "sam", "maya", [], "maya", phrase("you", "Maya"), "Sam fala diretamente com Maya.", { bubbleChoices: individualChoices("Maya") }),
    ],
  },
  {
    id: "lesson-03", game: 2, mode: "game", title: "Entrar na equipe",
    prompt: "Faça a equipe combinar com a fala. Depois escolha quem pode descrevê-la de fora.",
    hint: "O grupo marcado mostra participação. Quem fala faz parte dessa equipe?",
    insight: "We inclui quem fala. They descreve a equipe externa definida nesta conversa.",
    rounds: [
      round("g2-join", "join", "ana", "maya", ["leo", "sam"], "team", phrase("we", "a team"), "Leo e Sam já são uma equipe. Inclua a pessoa que permite a Ana dizer We are a team.", { candidateSpeakers: ["ana", "maya"] }),
      round("g2-outside", "speaker", "nina", "maya", ["ana", "leo", "sam"], "team", phrase("they", "a team"), "A equipe agora é Ana + Leo + Sam. Quem pode descrevê-la a Maya usando They?", { candidateSpeakers: ["ana", "leo", "nina"] }),
    ],
  },
  {
    id: "lesson-04", game: 2, mode: "use", title: "Descrever a mesma equipe",
    prompt: "Sam e Nina continuam juntos. Ajuste a fala de cada personagem.",
    hint: "Compare quem fala com os integrantes; a equipe não muda para acomodar uma tentativa.",
    insight: "Um integrante apresenta a própria equipe com We. Uma pessoa de fora pode descrevê-la com They.",
    rounds: [
      round("use2-inside", "bubbles", "sam", "maya", ["sam", "nina"], "team", phrase("we", "a team"), "Sam apresenta a equipe Sam + Nina a Maya.", { bubbleChoices: groupChoices() }),
      round("use2-outside", "bubbles", "maya", "ana", ["sam", "nina"], "team", phrase("they", "a team"), "Maya descreve a mesma equipe para Ana.", { bubbleChoices: groupChoices() }),
    ],
  },
  {
    id: "lesson-05", game: 3, mode: "game", title: "Uma peça serve a três falas",
    prompt: "Combine am ou are com a pessoa ou o grupo de cada fala.",
    hint: "You are também pode se dirigir a uma pessoa. Não decida apenas contando personagens.",
    insight: "I am. You are. We are. They are. A forma acompanha o pronome.",
    rounds: [
      round("g3-i", "verb", "ana", "leo", ["ana", "leo"], "ana", phrase("I", "Ana"), "Ana fala de si para Leo."),
      round("g3-you", "verb", "leo", "ana", ["ana", "leo"], "ana", phrase("you", "Ana"), "Leo fala diretamente com Ana."),
      round("g3-we", "verb", "ana", "maya", ["ana", "leo"], "team", phrase("we", "a team"), "Ana apresenta sua equipe a Maya."),
      round("g3-they", "verb", "nina", "maya", ["ana", "leo"], "team", phrase("they", "a team"), "Nina descreve a equipe Ana + Leo para Maya."),
    ],
  },
  {
    id: "lesson-06", game: 3, mode: "use", title: "Montar as falas de Sam",
    prompt: "Monte um turno de cada vez. Todas as palavras continuam disponíveis.",
    hint: "Primeiro escolha a relação com quem fala; depois combine am ou are.",
    insight: "A mesma ideia funciona com outras pessoas e sem uma frase preenchida para copiar.",
    rounds: [
      round("use3-i", "build", "sam", "maya", ["sam", "nina"], "sam", phrase("I", "Sam"), "Sam se apresenta a Maya."),
      round("use3-you", "build", "maya", "sam", ["sam", "nina"], "sam", phrase("you", "Sam"), "Maya fala diretamente com Sam."),
      round("use3-we", "build", "sam", "maya", ["sam", "nina"], "team", phrase("we", "a team"), "Sam apresenta a equipe Sam + Nina a Maya."),
      round("use3-they", "build", "ana", "maya", ["sam", "nina"], "team", phrase("they", "a team"), "Ana descreve essa equipe para Maya."),
    ],
  },
  {
    id: "lesson-07", game: 4, mode: "game", title: "A mesma equipe, outra voz",
    prompt: "Ana e Leo continuam na equipe. Escolha quem pode dizer cada frase a Nina.",
    hint: "Veja se quem assume a fala pertence à equipe. Mais de uma pessoa pode resolver We.",
    insight: "Qualquer integrante pode usar We para este grupo; Maya pode descrevê-lo de fora com They.",
    rounds: [
      round("g4-inside", "speaker", "ana", "nina", ["ana", "leo"], "team", phrase("we", "a team"), "Quem pode dizer We are a team sobre Ana + Leo?", { candidateSpeakers: ["ana", "leo", "maya"] }),
      round("g4-outside", "speaker", "maya", "nina", ["ana", "leo"], "team", phrase("they", "a team"), "E quem pode dizer They are a team para Nina?", { candidateSpeakers: ["ana", "leo", "maya"] }),
    ],
  },
  {
    id: "lesson-08", game: 4, mode: "use", title: "Novas pessoas, mesma ideia",
    prompt: "Agora a equipe é Maya + Sam. Envie a fala de cada turno.",
    hint: "O grupo fica igual. Muda se a pessoa que fala está incluída nele.",
    insight: "A fala acompanha a participação, mesmo quando a equipe e os lugares mudam.",
    rounds: [
      round("use4-inside", "bubbles", "maya", "nina", ["maya", "sam"], "team", phrase("we", "a team"), "Maya apresenta sua equipe a Nina.", { bubbleChoices: groupChoices() }),
      round("use4-outside", "bubbles", "leo", "nina", ["maya", "sam"], "team", phrase("they", "a team"), "Leo descreve a mesma equipe para Nina.", { bubbleChoices: groupChoices() }),
    ],
  },
  {
    id: "lesson-09", game: 5, mode: "game", title: "Mensagem sem remetente",
    prompt: "As mensagens são de Ana e Maya, uma vez cada. Descubra quem enviou cada uma.",
    hint: "Ana pertence à equipe. Maya está fora. O que We e They dizem sobre quem fala?",
    insight: "A fala permite inferir o remetente quando a equipe e o destinatário estão definidos.",
    rounds: [
      // Container speaker is structural only: anonymous UIs must not reveal it.
      round("g5-messages", "messages", "ana", "nina", ["ana", "leo"], "team", phrase("we", "a team"), "Equipe Ana + Leo. Nina recebe A: We are a team; B: They are a team. Todos descrevem os fatos corretamente.", { candidateSpeakers: ["ana", "maya"], ensemble: messages, anonymous: true }),
    ],
  },
  {
    id: "lesson-10", game: 5, mode: "use", title: "A mensagem vira conversa",
    prompt: "Ana foi identificada. Use essa informação numa conversa nova.",
    hint: "Ana continua na equipe quando muda quem a escuta. Maya continua descrevendo-a de fora.",
    insight: "A identidade resolvida é útil para se apresentar e para falar da equipe.",
    rounds: [
      round("use5-i", "build", "ana", "maya", ["ana", "leo"], "ana", phrase("I", "Ana"), "Ana se apresenta a Maya."),
      round("use5-we", "build", "ana", "maya", ["ana", "leo"], "team", phrase("we", "a team"), "Ana apresenta a equipe Ana + Leo a Maya."),
      round("use5-they", "build", "maya", "sam", ["ana", "leo"], "team", phrase("they", "a team"), "Maya descreve essa equipe para Sam."),
    ],
  },
  {
    id: "lesson-11", game: 6, mode: "game", title: "Quatro falas, um encontro",
    prompt: "Entregue os quatro balões aos turnos. Confira o conjunto quando terminar.",
    hint: "Veja quem fala, para quem e de quem. Nome ou equipe iguais não significam perspectiva igual.",
    insight: "I, you, we e they conservam relações diferentes, mesmo com o mesmo nome ou a mesma equipe.",
    rounds: [
      round("g6-ensemble", "ensemble", "ana", "maya", ["ana", "leo"], "ana", phrase("I", "Ana"), "Distribua as quatro falas entre os turnos de Ana, Maya e Sam.", { ensemble, bubbleChoices: ensembleChoices }),
    ],
  },
  {
    id: "lesson-12", game: 6, mode: "use", title: "Outro encontro completo",
    prompt: "Nina e Sam formam a equipe. Monte quatro falas novas, sem modelo preenchido.",
    hint: "Você pode rever uma relação e continuar. O apoio fica separado do resultado sem ajuda.",
    insight: "Você praticou falar de si, com alguém, da própria equipe e de uma equipe externa.",
    rounds: [
      round("use6-i", "build", "nina", "leo", ["nina", "sam"], "nina", phrase("I", "Nina"), "Nina se apresenta a Leo."),
      round("use6-you", "build", "leo", "nina", ["nina", "sam"], "nina", phrase("you", "Nina"), "Leo fala diretamente com Nina."),
      round("use6-we", "build", "nina", "leo", ["nina", "sam"], "team", phrase("we", "a team"), "Nina apresenta sua equipe a Leo."),
      round("use6-they", "build", "ana", "leo", ["nina", "sam"], "team", phrase("they", "a team"), "Ana descreve a equipe Nina + Sam para Leo."),
    ],
  },
];

function isPerson(value: unknown): value is PersonId {
  return typeof value === "string" && Object.hasOwn(PERSON_NAMES, value);
}
function isPhrase(value: unknown): value is Phrase {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Phrase>;
  return PRONOUNS.includes(item.pronoun as Pronoun) && VERBS.includes(item.verb as Verb) && typeof item.complement === "string";
}
function normalizeComplement(value: string): string {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").replace(/[.!]+$/, "").trim().toLowerCase();
}
function result(correct: boolean, feedback: string, corrections: string[] = []): Evaluation {
  return { correct, meaningCorrect: correct, feedback, corrections };
}

export function phraseText(value: Phrase): string {
  const start = value.pronoun === "I" ? "I" : value.pronoun[0].toUpperCase() + value.pronoun.slice(1);
  const complement = value.complement.trim().replace(/\s+/g, " ").replace(/[.!?]+$/, "").trim();
  return `${start} ${value.verb} ${complement}.`;
}

/** The phrase must refer to the requested person/group in the unchanged scene. */
export function evaluatePhrase(target: Round, answer: Phrase): Evaluation {
  if (!isPhrase(answer)) return result(false, "Monte a fala com um pronome, am ou are e o complemento desta vez.");
  if (!isPerson(target.speaker) || !isPerson(target.listener) || target.speaker === target.listener) return result(false, "Esta vez precisa de um falante e um destinatário diferentes.");
  const actualComplement = normalizeComplement(answer.complement);
  const expectedComplement = normalizeComplement(target.expected.complement);
  const localNameAlias = expectedComplement === "ana" && actualComplement === "anna";
  if (actualComplement !== expectedComplement && !localNameAlias) {
    return result(false, target.referent === "team" ? "Esta fala apresenta a equipe. Preserve a team como complemento." : `A pessoa referida nesta vez é ${PERSON_NAMES[target.referent]}. Preserve essa identidade.`);
  }
  if (answer.pronoun !== target.expected.pronoun) {
    const feedback = target.expected.pronoun === "I" ? "Esta fala apresenta quem está falando. I se refere ao próprio falante."
      : target.expected.pronoun === "you" ? "Aqui a fala se dirige à outra pessoa. You se refere ao destinatário."
      : target.expected.pronoun === "we" ? "A fala pedida inclui quem fala na equipe. Compare a participação com We."
      : "A fala pedida descreve a equipe de fora. Compare a participação com They.";
    return result(false, feedback);
  }
  if (target.referent === "team") {
    const members = new Set(target.team);
    if (members.size !== target.team.length || members.size < 2 || target.team.some(member => !isPerson(member))) return result(false, "A equipe desta vez precisa estar definida, sem repetir integrantes.");
    if (answer.pronoun === "we" && !members.has(target.speaker)) return result(false, "We inclui quem fala, mas essa pessoa ainda está fora da equipe descrita.");
    if (answer.pronoun === "they" && (members.has(target.speaker) || members.has(target.listener))) return result(false, "Nesta conversa, They descreve uma equipe externa ao falante e ao destinatário.");
    if (answer.pronoun !== "we" && answer.pronoun !== "they") return result(false, "Esta vez apresenta um grupo; preserve a relação com a equipe.");
  } else {
    const subject = answer.pronoun === "I" ? target.speaker : answer.pronoun === "you" ? target.listener : null;
    if (subject !== target.referent) return result(false, "Essa fala passa a identificar outra pessoa. Reveja quem fala e com quem está falando.");
    if (normalizeComplement(PERSON_NAMES[target.referent]) !== expectedComplement) return result(false, "O nome da fala precisa combinar com a pessoa referida nesta vez.");
  }
  const corrections: string[] = [];
  const correctVerb: Verb = answer.pronoun === "I" ? "am" : "are";
  if (answer.verb !== correctVerb) {
    const model = phraseText({ ...answer, verb: correctVerb, complement: target.expected.complement });
    corrections.push(`O sentido ficou claro. Com ${answer.pronoun}, usamos ${correctVerb}: ${model}`);
  }
  if (localNameAlias) corrections.push("Anna também é um nome possível. Nesta cena, a personagem usa a grafia Ana.");
  return result(true, corrections.length ? "Você comunicou a relação. Veja um ajuste de forma para a próxima fala." : "Essa fala combina com a conversa.", corrections);
}

/** A speaker choice can have several correct solutions; the original scene is never mutated. */
export function evaluateSpeaker(target: Round, person: PersonId): Evaluation {
  if (!isPerson(person) || target.candidateSpeakers && !target.candidateSpeakers.includes(person)) return result(false, "Escolha uma das pessoas disponíveis para assumir esta fala.");
  if (person === target.listener) return result(false, "O destinatário continua ouvindo nesta vez. Escolha outra pessoa para falar.");
  return evaluatePhrase({ ...target, speaker: person }, target.expected);
}

/** Joining adds the speaker to the existing team, preserving every initial member. */
export function evaluateTeam(target: Round, members: readonly PersonId[]): Evaluation {
  if (target.kind !== "join" || target.referent !== "team" || target.expected.pronoun !== "we") return result(false, "Nesta vez, a equipe é fixa. Ajuste a fala, sem trocar os integrantes.");
  if (members.some(member => !isPerson(member)) || new Set(members).size !== members.length) return result(false, "Cada integrante precisa aparecer uma vez na equipe.");
  const required = new Set([...target.team, target.speaker]);
  if (members.length !== required.size || members.some(member => !required.has(member))) {
    return result(false, "Preserve os integrantes que já estavam juntos e inclua quem fala. Trocar a equipe por outra não cumpre esta vez.");
  }
  return evaluatePhrase({ ...target, team: [...members] }, target.expected);
}

function combine(evaluations: Evaluation[]): Evaluation {
  const wrong = evaluations.find(evaluation => !evaluation.meaningCorrect);
  if (wrong) return result(false, wrong.feedback);
  const corrections = [...new Set(evaluations.flatMap(evaluation => evaluation.corrections))];
  return result(true, corrections.length ? "As relações ficaram claras. Veja os ajustes de forma." : "O conjunto combina com todas as situações.", corrections);
}

/** Check the whole anonymous assignment only after both senders have been placed. */
export function evaluateMessages(target: Round, assignments: readonly (PersonId | null)[]): Evaluation {
  const turns = target.ensemble ?? [];
  if (target.kind !== "messages" || !turns.length || assignments.length !== turns.length || assignments.some(person => !isPerson(person))) return result(false, "Atribua uma pessoa a cada mensagem antes de conferir o conjunto.");
  if (new Set(assignments).size !== assignments.length) return result(false, "Cada pessoa envia uma mensagem neste desafio. Não repita o remetente.");
  return combine(turns.map((turn, index) => evaluateSpeaker(turn, assignments[index]!)));
}

/** Check complete phrases against all four contexts; no partial correctness is exposed. */
export function evaluateEnsemble(target: Round, answers: readonly (Phrase | null)[]): Evaluation {
  const turns = target.ensemble ?? [];
  if (target.kind !== "ensemble" || !turns.length || answers.length !== turns.length || answers.some(answer => !isPhrase(answer))) return result(false, "Entregue uma fala completa a cada turno antes de conferir o conjunto.");
  return combine(turns.map((turn, index) => evaluatePhrase(turn, answers[index]!)));
}

import { describe, expect, it } from "vitest";
import { CONCLUSION_QUESTIONS, CONCLUSION_THEORY, createConclusionState, evaluateConclusionAnswer, conclusionModel,
  getConclusionQuestions, getConclusionScore, isConclusionComplete, restoreConclusionState, setConclusionDraft, submitConclusionAnswer } from "../src/features/first-encounters/lesson-conclusion";

const self = CONCLUSION_QUESTIONS.find(question => question.id === "write-self")!;
const listener = CONCLUSION_QUESTIONS.find(question => question.id === "listener")!;
function answer(state: ReturnType<typeof createConclusionState>, question: typeof self, text: string) {
  return submitConclusionAnswer(setConclusionDraft(state, question, text), question);
}

describe("written lesson consolidation", () => {
  it("contains five short explanations and six checks with four relations plus two written transfers", () => {
    expect(CONCLUSION_THEORY.map(page => page.id)).toEqual(["i", "you", "we", "they", "forms"]);
    expect(CONCLUSION_QUESTIONS.filter(question => question.kind === "choice")).toHaveLength(4);
    expect(CONCLUSION_QUESTIONS.filter(question => question.kind === "writing")).toHaveLength(2);
    expect(new Set(CONCLUSION_QUESTIONS.map(question => question.id)).size).toBe(6);
    for (const question of CONCLUSION_QUESTIONS.filter(question => question.kind === "choice")) {
      expect(question.choices?.filter(choice => evaluateConclusionAnswer(question, choice).correct)).toHaveLength(1);
      expect(question.choices).toContain(conclusionModel(question));
    }
  });

  it.each(["I am Ana.", "i am ana", "  I   am ANA! ", "I'm Ana", "I’m Ana.", "im ana", "iam ana", "i m ana", "I am Anna."])("accepts the intended written meaning and form: %s", text => {
    expect(evaluateConclusionAnswer(self, text)).toMatchObject({ correct: true, meaningCorrect: true, formCorrect: true });
  });

  it("recognizes Ana's alternative introduction in feedback while retaining the scores for the requested form", () => {
    const result = evaluateConclusionAnswer(self, "  MY name   is Ana. ");
    expect(result).toMatchObject({ correct: false, meaningCorrect: false, formCorrect: false,
      feedbackTitle: "Essa frase também apresenta Ana." });
    for (const text of ["My name is Leo.", "My name is Ana and Leo."]) {
      expect(evaluateConclusionAnswer(self, text)).toMatchObject({ correct: false, feedbackTitle: "Observe quem está falando." });
    }
    expect(evaluateConclusionAnswer(listener, "My name is Ana.").feedbackTitle).toBe("Observe quem está falando.");
  });

  it("recognizes a relationship without pretending the wrong or omitted verb is correct", () => {
    for (const text of ["I are Ana", "I is Ana", "I Ana"]) {
      expect(evaluateConclusionAnswer(self, text)).toMatchObject({ correct: false, meaningCorrect: true, formCorrect: false, model: "I am Ana." });
    }
    expect(evaluateConclusionAnswer(listener, "you am maya")).toMatchObject({ correct: false, meaningCorrect: true, formCorrect: false });
  });

  it("does not accept the wrong perspective, the wrong name or trailing garbage", () => {
    for (const text of ["You are Ana", "I am Maya", "I am Ana and Leo", "I'm a team", "Ana", "nonsense", ""]) {
      expect(evaluateConclusionAnswer(self, text).correct).toBe(false);
    }
    expect(evaluateConclusionAnswer(listener, "I am Leo")).toMatchObject({ correct: false, meaningCorrect: false, formCorrect: true });
    expect(evaluateConclusionAnswer(listener, "you're maya").correct).toBe(true);
  });

  it("keeps the first response immutable through corrections, clearing and subsequent submissions", () => {
    let state = answer(createConclusionState(), self, "you are Ana");
    expect(getConclusionScore(state)).toMatchObject({ answered: 1, correct: 0, meaning: 0, form: 1 });
    state = setConclusionDraft(state, self, "");
    expect(state.attempts[self.id].firstAnswer).toBe("you are Ana");
    expect(submitConclusionAnswer(state, self)).toBe(state);
    state = answer(state, self, "im ana");
    expect(state.attempts[self.id]).toEqual({ draft: "im ana", firstAnswer: "you are Ana", lastAnswer: "im ana" });
    expect(getConclusionScore(state).correct).toBe(0);
    expect(evaluateConclusionAnswer(self, state.attempts[self.id].lastAnswer!).correct).toBe(true);
  });

  it("scores meaning and am/are independently and completes only after all six responses are corrected", () => {
    let state = createConclusionState();
    for (const question of CONCLUSION_QUESTIONS) state = answer(state, question, question.id === "write-self" ? "I are Ana" : conclusionModel(question));
    expect(getConclusionScore(state)).toEqual({ total: 6, answered: 6, correct: 5, meaning: 6, form: 5 });
    expect(isConclusionComplete(state)).toBe(false);
    state = answer(state, self, "I am Ana.");
    expect(isConclusionComplete(state)).toBe(true);
    expect(getConclusionScore(state).correct).toBe(5);
  });

  it("restores attempts and first-response scoring without trusting a saved score", () => {
    let state = answer(createConclusionState(), self, "I are Ana");
    state = answer(state, self, "I'm Ana");
    const restored = restoreConclusionState(JSON.stringify({ ...state, score: 6 }));
    expect(restored.attempts[self.id]).toEqual(state.attempts[self.id]);
    expect(getConclusionScore(restored)).toMatchObject({ correct: 0, meaning: 1, form: 0 });
  });

  it("prevents a corrupted restore from skipping unanswered questions or fabricating a complete summary", () => {
    const state = restoreConclusionState(JSON.stringify({ version: 1, phase: "summary", theoryIndex: 999, questionIndex: 999, attempts: {} }));
    expect(state.phase).toBe("test"); expect(state.questionIndex).toBe(0); expect(state.theoryIndex).toBe(4);
    expect(isConclusionComplete(state)).toBe(false);
    expect(restoreConclusionState("{broken")).toEqual(createConclusionState());
    expect(restoreConclusionState(JSON.stringify({ version: 3, phase: "summary" }))).toEqual(createConclusionState());
  });

  it("keeps previous submissions attached to the exact question they answered", () => {
    const oldModels = {self: "I am Leo.", listener: "You are Maya.", inside: "We are a team.", outside: "They are a team.", "write-self": "I am Ana.", "write-listener": "You are Leo."};
    const attempts = Object.fromEntries(Object.entries(oldModels).map(([id, value]) => [id, { draft: value, firstAnswer: value, lastAnswer: value }]));
    attempts["write-self"].firstAnswer = "My name is Ana.";
    const state = restoreConclusionState(JSON.stringify({ ...createConclusionState(), phase: "summary", testStarted: true, attempts }));
    expect(isConclusionComplete(state)).toBe(true);
    expect(state.phase).toBe("summary");
    expect(getConclusionScore(state)).toEqual({ total: 6, answered: 6, correct: 5, meaning: 5, form: 5 });
    expect(getConclusionQuestions(state).map(q => q.id)).toEqual(Object.keys(oldModels));
    expect(state.attempts).toEqual(attempts);
  });

  it("allows a completed review to reopen theory without discarding its original result", () => {
    let state = createConclusionState();
    for (const question of CONCLUSION_QUESTIONS) state = answer(state, question, conclusionModel(question));
    state = { ...state, phase: "theory", theoryIndex: 0, testStarted: true };
    const restored = restoreConclusionState(JSON.stringify(state));
    expect(restored.phase).toBe("theory"); expect(isConclusionComplete(restored)).toBe(true);
    expect(getConclusionScore(restored).correct).toBe(6);
    expect(getConclusionScore(createConclusionState())).toEqual({ total: 6, answered: 0, correct: 0, meaning: 0, form: 0 });
  });
});

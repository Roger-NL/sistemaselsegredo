import { describe, expect, it } from "vitest";
import lessonAudio from "../src/features/first-encounters/lesson-one-audio.json";
import { restoreLessonProgress } from "../src/features/first-encounters/lesson-progress";
import {
  LESSON_SCENES,
  PERSON_NAMES,
  PRONOUNS,
  VERBS,
  evaluateEnsemble,
  evaluateMessages,
  evaluatePhrase,
  evaluateSpeaker,
  evaluateTeam,
  phraseText,
  type PersonId,
  type Phrase,
  type Round,
} from "../src/features/first-encounters/lesson-one";

const allRounds = LESSON_SCENES.flatMap(scene => scene.rounds.flatMap(round => [round, ...(round.ensemble ?? [])]));
function round(id: string): Round {
  const found = allRounds.find(item => item.id === id);
  if (!found) throw new Error(`Missing lesson-one round: ${id}`);
  return found;
}
function permutations<T>(items: T[]): T[][] {
  if (!items.length) return [[]];
  return items.flatMap((item, index) => permutations(items.filter((_, i) => i !== index)).map(rest => [item, ...rest]));
}
/** Keep the reusable evaluator covered without restoring the retired final worksheet. */
function ensembleFixture(): Round {
  const turns = ["g3-i", "g3-you", "g3-we", "g3-they"].map(id => ({ ...round(id) }));
  return { ...turns[0], id: "ensemble-evaluator-fixture", kind: "ensemble", ensemble: turns, bubbleChoices: turns.map(turn => ({ ...turn.expected })) };
}

describe("the approved first lesson", () => {
  it("contains six games and six immediate uses in the approved order", () => {
    expect(LESSON_SCENES).toHaveLength(12);
    expect(LESSON_SCENES.map(scene => scene.id)).toEqual(Array.from({ length: 12 }, (_, i) => `lesson-${String(i + 1).padStart(2, "0")}`));
    expect(LESSON_SCENES.map(scene => scene.mode)).toEqual(Array.from({ length: 6 }, () => ["game", "use"]).flat());
    expect(LESSON_SCENES.map(scene => scene.game)).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6]);
    expect(LESSON_SCENES.filter(scene => scene.mode === "use").every(scene => scene.rounds.length >= 2)).toBe(true);
    expect(LESSON_SCENES.every(scene => scene.title && scene.prompt && scene.hint && scene.insight)).toBe(true);
    expect(new Set(allRounds.map(item => item.id)).size).toBe(allRounds.length);
  });

  it("defines actual speakers, addressees and referents without silently changing identity", () => {
    for (const item of allRounds) {
      expect(PERSON_NAMES[item.speaker], item.id).toBeTruthy();
      expect(PERSON_NAMES[item.listener], item.id).toBeTruthy();
      expect(item.speaker, item.id).not.toBe(item.listener);
      expect(new Set(item.team).size, item.id).toBe(item.team.length);
      expect(item.team.every(member => Object.hasOwn(PERSON_NAMES, member)), item.id).toBe(true);
      if (item.kind === "join") continue;
      const checked = evaluatePhrase(item, item.expected);
      expect(checked.correct, item.id).toBe(true);
      expect(checked.meaningCorrect, item.id).toBe(true);
      expect(checked.corrections, item.id).toEqual([]);
    }
  });

  it("preserves the approved special mechanics rather than reducing everything to pronoun buttons", () => {
    expect(round("g2-join")).toMatchObject({ kind: "join", speaker: "ana", listener: "maya", team: ["leo", "sam"], candidateSpeakers: ["ana", "maya"], expected: { pronoun: "we" } });
    expect(round("g2-outside")).toMatchObject({ kind: "speaker", team: ["ana", "leo", "sam"], candidateSpeakers: ["ana", "leo", "nina"], expected: { pronoun: "they" } });
    expect(round("g5-messages")).toMatchObject({ kind: "messages", anonymous: true, listener: "nina" });
    expect(round("g5-messages").ensemble?.every(item => item.anonymous)).toBe(true);
    expect(round("g6-ensemble")).toMatchObject({ kind: "speaker", speaker: "leo", listener: "nina", team: [], candidateSpeakers: ["leo", "nina"], expected: { pronoun: "you", complement: "Nina" } });
    expect(round("g6-ensemble").ensemble).toBeUndefined();
    expect(round("use5-i")).toMatchObject({ kind: "bubbles", speaker: "sam", listener: "maya", referent: "sam", expected: { pronoun: "I", complement: "Sam" } });
    expect(LESSON_SCENES[11].rounds.map(item => item.kind)).toEqual(["speaker", "bubbles", "join", "messages"]);
  });

  it("keeps the lesson to four affirmative forms and the two stated complement families", () => {
    expect(PRONOUNS).toEqual(["I", "you", "we", "they"]);
    expect(VERBS).toEqual(["am", "are"]);
    for (const item of allRounds) {
      expect(item.expected.verb, item.id).toBe(item.expected.pronoun === "I" ? "am" : "are");
      expect(item.expected.complement, item.id).toBe(item.referent === "team" ? "a team" : PERSON_NAMES[item.referent]);
    }
  });

  it("preserves all 29 saved round IDs, scene boundaries and existing completion prefixes", () => {
    const groups = [
      ["g1-self", "g1-listener"], ["use1-self", "use1-listener"], ["g2-join", "g2-outside"], ["use2-inside", "use2-outside"],
      ["g3-i", "g3-you", "g3-we", "g3-they"], ["use3-i", "use3-you", "use3-we", "use3-they"],
      ["g4-inside", "g4-outside"], ["use4-inside", "use4-outside"], ["g5-messages"], ["use5-i", "use5-we", "use5-they"],
      ["g6-ensemble"], ["use6-i", "use6-you", "use6-we", "use6-they"],
    ];
    expect(LESSON_SCENES.map(scene => scene.rounds.map(item => item.id))).toEqual(groups);
    const ids = groups.flat();
    expect(ids).toHaveLength(29);
    const saved = { version: 2 as const, scene: 11, round: 2, completed: ids.slice(0, 27), supported: ["g6-ensemble"] };
    expect(restoreLessonProgress(JSON.stringify(saved))).toEqual(saved);
    const complete = { ...saved, scene: 12, round: 0, completed: ids };
    expect(restoreLessonProgress(JSON.stringify(complete))).toEqual(complete);
  });

  it("has existing audio for every correct actor, alternative valid speaker and visible phrase preview", () => {
    const catalog = lessonAudio as Record<string, string>;
    for (const target of allRounds) {
      const speakers = target.kind === "speaker"
        ? target.candidateSpeakers!.filter(person => evaluateSpeaker(target, person).correct)
        : [target.speaker];
      for (const person of speakers) expect(catalog[`${person}:${phraseText(target.expected)}`], `${target.id}: accepted ${person}`).toBeTruthy();
      if (["speaker", "join", "messages"].includes(target.kind)) {
        expect(catalog[`nina:${phraseText(target.expected)}`], `${target.id}: neutral reading`).toBeTruthy();
      }
      for (const option of target.bubbleChoices ?? []) {
        expect(catalog[`nina:${phraseText(option)}`], `${target.id}: phrase preview`).toBeTruthy();
      }
    }
  });
});

describe("complete English phrases", () => {
  it("formats the full sentence with a capital initial and one final full stop", () => {
    expect(phraseText({ pronoun: "I", verb: "am", complement: "Ana" })).toBe("I am Ana.");
    expect(phraseText({ pronoun: "you", verb: "are", complement: "Ana" })).toBe("You are Ana.");
    expect(phraseText({ pronoun: "we", verb: "are", complement: "a team" })).toBe("We are a team.");
    expect(phraseText({ pronoun: "they", verb: "are", complement: "  a   team. " })).toBe("They are a team.");
  });

  it("keeps Ana as the same referent when I changes to you", () => {
    const self = round("g1-self"), addressed = round("g1-listener");
    expect(evaluatePhrase(self, { pronoun: "I", verb: "am", complement: "Ana" }).correct).toBe(true);
    expect(evaluatePhrase(self, { pronoun: "you", verb: "are", complement: "Ana" }).correct).toBe(false);
    expect(evaluatePhrase(addressed, { pronoun: "you", verb: "are", complement: "Ana" }).correct).toBe(true);
    expect(evaluatePhrase(addressed, { pronoun: "I", verb: "am", complement: "Ana" }).correct).toBe(false);
    expect(evaluatePhrase(self, { pronoun: "I", verb: "am", complement: "Leo" }).meaningCorrect).toBe(false);
    expect(evaluatePhrase({ ...self, speaker: "leo", listener: "maya" }, self.expected).meaningCorrect).toBe(false);
    expect(evaluatePhrase({ ...addressed, listener: "maya" }, addressed.expected).meaningCorrect).toBe(false);
  });

  it("treats am/are agreement as coaching when the intended relation is correct", () => {
    for (const id of ["g3-i", "g3-you", "g3-we", "g3-they"]) {
      const target = round(id);
      const answer: Phrase = { ...target.expected, verb: target.expected.verb === "am" ? "are" : "am" };
      const checked = evaluatePhrase(target, answer);
      expect(checked, id).toMatchObject({ correct: true, meaningCorrect: true });
      expect(checked.corrections, id).toHaveLength(1);
      expect(checked.corrections[0], id).toContain(phraseText(target.expected));
    }
    const you = evaluatePhrase(round("g3-you"), { pronoun: "you", verb: "am", complement: "Ana" });
    expect(you.corrections[0]).toContain("you, usamos are");
    expect(you.corrections[0]).not.toContain("plural");
  });

  it("does not mistake a wrong perspective for a small verb adjustment", () => {
    const inside = round("g3-we"), outside = round("g3-they");
    expect(evaluatePhrase(inside, { pronoun: "they", verb: "am", complement: "a team" })).toMatchObject({ correct: false, meaningCorrect: false, corrections: [] });
    expect(evaluatePhrase(outside, { pronoun: "we", verb: "are", complement: "a team" }).meaningCorrect).toBe(false);
    expect(evaluatePhrase(inside, { pronoun: "I", verb: "am", complement: "a team" }).meaningCorrect).toBe(false);
    expect(evaluatePhrase(inside, { pronoun: "we", verb: "are", complement: "Ana" }).meaningCorrect).toBe(false);
  });

  it("requires the world to support we and the external they relationship", () => {
    const inside = round("g3-we"), outside = round("g3-they");
    expect(evaluatePhrase({ ...inside, speaker: "nina" }, inside.expected).meaningCorrect).toBe(false);
    expect(evaluatePhrase({ ...outside, speaker: "ana" }, outside.expected).meaningCorrect).toBe(false);
    expect(evaluatePhrase({ ...outside, listener: "leo" }, outside.expected).meaningCorrect).toBe(false);
    expect(evaluatePhrase({ ...inside, listener: "leo" }, inside.expected).correct).toBe(true);
    expect(evaluatePhrase({ ...inside, team: ["ana"] }, inside.expected).meaningCorrect).toBe(false);
    expect(evaluatePhrase({ ...outside, team: ["ana", "ana"] }, outside.expected).meaningCorrect).toBe(false);
  });

  it("tolerates benign complement typography and only the deliberate Ana/Anna alias", () => {
    const target = round("g1-self");
    expect(evaluatePhrase(target, { ...target.expected, complement: " ana. " }).correct).toBe(true);
    const alias = evaluatePhrase(target, { ...target.expected, complement: "Anna" });
    expect(alias).toMatchObject({ correct: true, meaningCorrect: true });
    expect(alias.corrections[0]).toContain("grafia Ana");
    for (const name of ["Maya", "Annabelle", "Anya", "Ana and Leo", "Ana?", ""]) {
      expect(evaluatePhrase(target, { ...target.expected, complement: name }).meaningCorrect, name).toBe(false);
    }
  });

  it("rejects malformed saved payloads rather than treating unknown words as grammar coaching", () => {
    for (const answer of [null, {}, { pronoun: "he", verb: "are", complement: "Ana" }, { pronoun: "I", verb: "bananas", complement: "Ana" }, { pronoun: "I", verb: "am", complement: null }]) {
      expect(evaluatePhrase(round("g1-self"), answer as unknown as Phrase).correct).toBe(false);
    }
  });
});

describe("team and speaker decisions", () => {
  it("joins Ana without replacing the original Leo/Sam team or changing the audience", () => {
    const target = round("g2-join");
    expect(evaluateTeam(target, ["leo", "sam", "ana"]).correct).toBe(true);
    expect(evaluateTeam(target, ["ana", "sam", "leo"]).correct).toBe(true);
    for (const members of [["leo", "sam"], ["leo", "sam", "maya"], ["ana"], ["ana", "leo"], ["ana", "sam"], ["ana", "leo", "sam", "maya"], ["ana", "leo", "sam", "ana"]] as PersonId[][]) {
      expect(evaluateTeam(target, members).meaningCorrect, members.join("/")).toBe(false);
    }
    expect(evaluatePhrase(target, target.expected).meaningCorrect).toBe(false);
    expect(evaluateTeam(round("use2-inside"), ["sam", "nina", "ana"]).correct).toBe(false);
  });

  it("chooses Nina to describe the enlarged team from outside", () => {
    expect(evaluateSpeaker(round("g2-outside"), "nina").correct).toBe(true);
    expect(evaluateSpeaker(round("g2-outside"), "ana").correct).toBe(false);
    expect(evaluateSpeaker(round("g2-outside"), "leo").correct).toBe(false);
    expect(evaluateSpeaker(round("g2-outside"), "maya").correct).toBe(false);
  });

  it("accepts both Ana and Leo for we, but only Maya for they among the stated candidates", () => {
    const inside = round("g4-inside"), outside = round("g4-outside");
    expect(evaluateSpeaker(inside, "ana").correct).toBe(true);
    expect(evaluateSpeaker(inside, "leo").correct).toBe(true);
    expect(evaluateSpeaker(inside, "maya").correct).toBe(false);
    expect(evaluateSpeaker(outside, "maya").correct).toBe(true);
    expect(evaluateSpeaker(outside, "ana").correct).toBe(false);
    expect(evaluateSpeaker(outside, "leo").correct).toBe(false);
    expect(evaluateSpeaker(outside, "sam").correct).toBe(false);
    expect(evaluateSpeaker(outside, "nina").correct).toBe(false);
  });

  it("identifies Leo addressing Nina while the recipient keeps listening", () => {
    const target = round("g6-ensemble");
    expect(evaluateSpeaker(target, "leo").correct).toBe(true);
    expect(evaluateSpeaker(target, "nina").meaningCorrect).toBe(false);
    expect(evaluateSpeaker(target, "maya").correct).toBe(false);
    expect(evaluateSpeaker(target, "ana").correct).toBe(false);
    expect(evaluateSpeaker(target, "sam").correct).toBe(false);
    expect(evaluateSpeaker({ ...target, candidateSpeakers: ["nina", "leo"] }, "leo").correct).toBe(true);
  });
});

describe("whole linguistic puzzles", () => {
  it("has exactly one complete solution to the anonymous messages", () => {
    const target = round("g5-messages");
    const assignments: PersonId[][] = [["ana", "maya"], ["maya", "ana"], ["ana", "ana"], ["maya", "maya"]];
    const solutions = assignments.filter(assignment => evaluateMessages(target, assignment).correct);
    expect(solutions).toEqual([["maya", "ana"]]);
    expect(evaluateMessages(target, ["ana", null]).correct).toBe(false);
    expect(evaluateMessages(target, ["ana"]).correct).toBe(false);
    expect(evaluateMessages(target, ["ana", "maya", "leo"]).correct).toBe(false);
    expect(evaluateMessages(target, ["leo", "maya"]).correct).toBe(false);
    expect(Object.keys(evaluateMessages(target, ["ana", "maya"])).sort()).toEqual(["correct", "corrections", "feedback", "meaningCorrect"]);
  });

  it("infers message ownership from membership rather than candidate positions or the stored model actor", () => {
    const target = round("g5-messages");
    expect(evaluateMessages(target, target.candidateSpeakers!).correct).toBe(false);
    const reordered = { ...target, candidateSpeakers: [...target.candidateSpeakers!].reverse(),
      ensemble: target.ensemble!.map(turn => ({ ...turn, speaker: turn.speaker === "ana" ? "maya" as const : "ana" as const, candidateSpeakers: [...turn.candidateSpeakers!].reverse() })) };
    expect(evaluateMessages(reordered, ["maya", "ana"]).correct).toBe(true);
    const changedWorld = { ...target, team: ["maya", "leo"] as PersonId[],
      ensemble: target.ensemble!.map(turn => ({ ...turn, team: ["maya", "leo"] as PersonId[] })) };
    expect(evaluateMessages(changedWorld, ["ana", "maya"]).correct).toBe(true);
    expect(evaluateMessages(changedWorld, ["maya", "ana"]).correct).toBe(false);
    expect(target.ensemble!.map(turn => phraseText(turn.expected))).toEqual(["They are a team.", "We are a team."]);
    expect(LESSON_SCENES[8].hint).not.toMatch(/Ana|Maya/);
  });

  it("still evaluates complete four-context arrangements independently of the active curriculum", () => {
    const target = ensembleFixture();
    const arrangements = permutations(target.bubbleChoices!);
    expect(arrangements).toHaveLength(24);
    const solutions = arrangements.filter(answers => evaluateEnsemble(target, answers).correct);
    expect(solutions).toHaveLength(1);
    expect(solutions[0].map(phraseText)).toEqual(["I am Ana.", "You are Ana.", "We are a team.", "They are a team."]);
    expect(evaluateEnsemble(target, [target.bubbleChoices![0], null, null, null]).correct).toBe(false);
    expect(evaluateEnsemble(target, target.bubbleChoices!.slice(0, 3)).correct).toBe(false);
    expect(evaluateEnsemble(target, Array(4).fill(target.bubbleChoices![0])).correct).toBe(false);
  });

  it("preserves meaning-based coaching when all ensemble relations are correct", () => {
    const target = ensembleFixture();
    const answers: Phrase[] = target.ensemble!.map(turn => ({ ...turn.expected, verb: turn.expected.verb === "am" ? "are" : "am" }));
    const checked = evaluateEnsemble(target, answers);
    expect(checked).toMatchObject({ correct: true, meaningCorrect: true });
    expect(checked.corrections).toHaveLength(4);
  });

  it("uses four different decisions in the final conversation and carries the changed team forward", () => {
    const uses = LESSON_SCENES[11].rounds;
    expect(uses.map(item => phraseText(item.expected))).toEqual(["I am Nina.", "You are Nina.", "We are a team.", "They are a team."]);
    expect(evaluateSpeaker(uses[0], "nina").correct).toBe(true);
    expect(evaluateSpeaker(uses[0], "maya").correct).toBe(false);
    expect(evaluatePhrase(uses[1], uses[1].expected).correct).toBe(true);
    expect(evaluatePhrase(uses[1], uses[1].bubbleChoices![0]).meaningCorrect).toBe(false);
    const joined = [...uses[2].team, "nina"] as PersonId[];
    expect(evaluateTeam(uses[2], joined).correct).toBe(true);
    expect(evaluateTeam(uses[2], [...uses[2].team, "leo"]).correct).toBe(false);
    expect(uses[2].team).toEqual(["sam"]);
    expect(uses[3].team).toEqual(joined);
    expect(uses[3]).toMatchObject({ kind: "messages", listener: "maya", candidateSpeakers: ["nina", "leo"], anonymous: true });
    expect(uses[3].ensemble!.every(message => message.anonymous && message.listener === "maya")).toBe(true);
    expect(uses[3].ensemble!.map(message => phraseText(message.expected))).toEqual(["They are a team.", "I am Nina."]);
    const solutions = permutations(uses[3].candidateSpeakers!).filter(assignment => evaluateMessages(uses[3], assignment).correct);
    expect(solutions).toEqual([["leo", "nina"]]);
    expect(evaluateMessages(uses[3], uses[3].candidateSpeakers!).correct).toBe(false);
    expect(evaluateMessages(uses[3], ["leo", null]).correct).toBe(false);
    expect(evaluateMessages(uses[3], ["nina", "nina"]).correct).toBe(false);
    expect(evaluatePhrase(uses[0], { pronoun: "I", verb: "am", complement: "Ana" }).meaningCorrect).toBe(false);
  });

  it("never mutates lesson data, phrases, membership arrays or assignments during evaluation", () => {
    const before = JSON.stringify(LESSON_SCENES);
    const joined = Object.freeze(["ana", "leo", "sam"] as PersonId[]);
    const senders = Object.freeze(["ana", "maya"] as PersonId[]);
    const fullTarget = ensembleFixture();
    const full = Object.freeze(fullTarget.ensemble!.map(item => Object.freeze({ ...item.expected })));
    evaluateTeam(round("g2-join"), joined);
    evaluateSpeaker(round("g4-inside"), "leo");
    evaluateMessages(round("g5-messages"), senders);
    evaluateEnsemble(fullTarget, full);
    expect(JSON.stringify(LESSON_SCENES)).toBe(before);
    expect(joined).toEqual(["ana", "leo", "sam"]);
    expect(senders).toEqual(["ana", "maya"]);
  });
});

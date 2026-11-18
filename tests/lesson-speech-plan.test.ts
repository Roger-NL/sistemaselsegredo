import { describe, expect, it } from "vitest";
import { LESSON_SCENES, phraseText } from "../src/features/first-encounters/lesson-one";
import { getAutomaticLessonSpeech, getLessonSceneGuide } from "../src/features/first-encounters/lesson-speech-plan";

const rounds = LESSON_SCENES.flatMap(scene => scene.rounds);
const find = (id: string) => rounds.find(round => round.id === id)!;

describe("automatic speech keeps the lesson's hidden decisions hidden", () => {
  it("does not supply unfinished phrases or unassigned conversation answers", () => {
    for (const round of rounds.filter(round => ["bubbles", "verb", "build", "ensemble"].includes(round.kind))) {
      expect(getAutomaticLessonSpeech(round, false), round.id).toEqual([]);
    }
  });
  it("reads already given team/speaker prompts with a neutral voice", () => {
    for (const round of rounds.filter(round => ["join", "speaker"].includes(round.kind))) {
      expect(getAutomaticLessonSpeech(round, false), round.id).toEqual([{ person:"nina", text:phraseText(round.expected), role:"narration" }]);
    }
  });
  it("reads both anonymous messages neutrally before any sender is accepted", () => {
    expect(getAutomaticLessonSpeech(find("g5-messages"), false)).toEqual([
      {person:"nina",text:"They are a team.",role:"narration",turnIndex:0},
      {person:"nina",text:"We are a team.",role:"narration",turnIndex:1},
    ]);
  });
  it("performs the identified message authors only after the whole answer is accepted", () => {
    expect(getAutomaticLessonSpeech(find("g5-messages"), true)).toEqual([
      {person:"maya",text:"They are a team.",role:"character",turnIndex:0},
      {person:"ana",text:"We are a team.",role:"character",turnIndex:1},
    ]);
  });
  it("reads the final Nina prompt neutrally and performs Leo only after acceptance", () => {
    const round = find("g6-ensemble");
    expect(getAutomaticLessonSpeech(round, false)).toEqual([{person:"nina",text:"You are Nina.",role:"narration"}]);
    expect(getAutomaticLessonSpeech(round, true, "leo")).toEqual([{person:"leo",text:"You are Nina.",role:"character"}]);
  });
  it("keeps the final identity/team messages neutral until Leo and Nina are identified", () => {
    const round = find("use6-they");
    expect(getAutomaticLessonSpeech(round, false)).toEqual([
      {person:"nina",text:"They are a team.",role:"narration",turnIndex:0},
      {person:"nina",text:"I am Nina.",role:"narration",turnIndex:1},
    ]);
    expect(getAutomaticLessonSpeech(round, true)).toEqual([
      {person:"leo",text:"They are a team.",role:"character",turnIndex:0},
      {person:"nina",text:"I am Nina.",role:"character",turnIndex:1},
    ]);
  });
  it("uses the valid chosen speaker and preserves narrator/actor roles even for Nina", () => {
    expect(getAutomaticLessonSpeech(find("g4-inside"), true, "leo")).toEqual([{person:"leo",text:"We are a team.",role:"character"}]);
    expect(getAutomaticLessonSpeech(find("g2-outside"), false)[0].role).toBe("narration");
    expect(getAutomaticLessonSpeech(find("g2-outside"), true)[0]).toEqual({person:"nina",text:"They are a team.",role:"character"});
  });
  it.each(["g2-join", "use6-we"])("explains the team control without naming the person to choose in %s", id => {
    const guide = getLessonSceneGuide(find(id));
    expect(guide.title + guide.action).not.toMatch(/Ana|Leo|Maya|Sam|Nina/);
    expect(guide.action).toContain("uma pessoa");
  });
  it("always performs canonical accepted forms and gives every round a concrete instruction", () => {
    for (const round of rounds) {
      expect(getAutomaticLessonSpeech(round,true).every(turn=>!/\bI are\b|\b(?:You|We|They) am\b/.test(turn.text)),round.id).toBe(true);
      const guide = getLessonSceneGuide(round);
      expect(guide.title.length,round.id).toBeGreaterThan(12);
      if (round.vocabulary) {
        expect(guide.action, round.id).toBe(round.vocabulary.cue);
        expect(getAutomaticLessonSpeech(round, true), round.id).toEqual([{ person: round.speaker, text: phraseText(round.expected), role: "character" }]);
      } else {
        expect(guide.action.length, round.id).toBeGreaterThan(12);
      }
      expect(guide.title+guide.action,round.id).not.toContain("undefined");
    }
  });
});

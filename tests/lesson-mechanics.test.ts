import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { LESSON_SCENES } from "../src/features/first-encounters/lesson-one";
import { LESSON_MECHANICS, LESSON_MECHANICS_STORAGE, getLessonMechanic, getLessonMechanicHandPlan } from "../src/features/first-encounters/lesson-mechanics";
import { getTutorialNarration } from "../src/features/first-encounters/tutorial-script";

const rounds = LESSON_SCENES.flatMap(scene => scene.rounds);
describe("lesson control guidance", () => {
  it("covers the six active mechanics and preserves the existing local narration registry", () => {
    expect(new Set(rounds.map(round => getLessonMechanic(round)?.id))).toEqual(new Set(["bubbles", "join", "speaker", "verb", "build", "messages"]));
    for (const [id, clip] of Object.entries(LESSON_MECHANICS)) {
      expect(clip).toMatchObject({ id, person: "nina", role: "narration", key: `nina:${clip.text}` });
      if (id !== "write") expect(clip.url).toBe(`/first-encounters/audio/mechanics-pt/nina-${id}.m4a`);
      expect(existsSync(new URL(`../public${clip.url}`, import.meta.url)), id).toBe(true);
    }
    expect(LESSON_MECHANICS_STORAGE).toBe("basedspeak.lesson-one.mechanics.v1");
    expect(getLessonMechanic(null)).toBeNull();
  });
  it("reuses the existing writing clip exactly", () => {
    const old = getTutorialNarration("write-check");
    expect(getLessonMechanic(rounds[0], true)).toMatchObject({ id: "write", text: old.text, key: old.key, url: old.url });
  });
  it("never derives a demonstration from a grammatical answer or a message sender", () => {
    for (const round of rounds) {
      const changed = { ...round, speaker: round.listener, expected: { ...round.expected, pronoun: "they" as const }, candidateSpeakers: [...(round.candidateSpeakers ?? [])].reverse() };
      expect(getLessonMechanicHandPlan(round.kind, undefined, changed)).toEqual(getLessonMechanicHandPlan(round.kind, undefined, round));
    }
    const message = getLessonMechanicHandPlan("messages")!.beats[0];
    expect(message).toMatchObject({ source: "people", target: "messages", text: "Uma pessoa" });
    expect(getLessonMechanicHandPlan("ensemble")!.beats[0]).toMatchObject({ source: "bubble-bank", text: "Sua fala" });
  });
  it("bounds gestures by the supplied real clip duration and uses generic ghost labels", () => {
    for (const id of Object.keys(LESSON_MECHANICS) as (keyof typeof LESSON_MECHANICS)[]) {
      const plan = getLessonMechanicHandPlan(id, { duration: 3.2, words: [{ word: "Conferir.", start: 2.5, end: 2.9 }] })!;
      expect(plan.audioKey).toBe(LESSON_MECHANICS[id].key);
      for (const beat of plan.beats) {
        expect(beat.start).toBeGreaterThanOrEqual(0);
        expect(beat.end).toBeGreaterThan(beat.start);
        expect(beat.end).toBeLessThanOrEqual(3.2);
        if (beat.kind === "drag") expect(["Sua fala", "Uma pessoa", "Uma peça", "Outra peça"]).toContain(beat.text);
      }
    }
  });
});

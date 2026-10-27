import { describe, expect, it } from "vitest";
import { completeStep, decodeProgress, emptyProgress, isCorrect, studySteps } from "@/features/theory/progress";

// Expected language and meaning are written independently of the catalog's answer fields.
const examples = [
  { id: "this-yours", correct: ["Se o copo é seu."], wrong: ["Se você gosta do café.", "Se você quer sair."] },
  { id: "mine-your", correct: ["This is mine.", "  THIS  is mine!  "], wrong: ["Is this mine?", "This mine is.", "This is yours."] },
  { id: "its-not", correct: ["not", "  NOT! "], wrong: ["", "no", "now", "mine", "it's not"] },
  { id: "did-order", correct: ["What did you order?", " what DID you order "], wrong: ["What you did order?", "What did you ordered?", "What do you order?"] },
  { id: "iced-coffee", correct: ["An iced coffee."], wrong: ["A sweet coffee.", "A quiet café."] },
  { id: "and-you", correct: ["And you?", " AND   YOU! ", "And\tyou"], wrong: ["You and?", "And me?", "And your?"] },
  { id: "really-too", correct: ["Me too."], wrong: ["Not really.", "Really?"] },
  { id: "sorry-okay", correct: ["It's okay.", "It is okay!", " IT’S  okay "], wrong: ["Careful!", "What did you order?", "It isn't okay."] },
  { id: "careful-close", correct: ["Careful!"], wrong: ["Nice!", "That was close."] },
  { id: "like-it", correct: ["I like it.", " I   LIKE it! "], wrong: ["I don't like it.", "Like it I.", "I am like it."] },
  { id: "do-you-like", correct: ["Do you like this café?", "DO you like this cafe\u0301!"], wrong: ["You do like this café.", "Do this café like you?", "Did you like this café?"] },
  { id: "like-here", correct: ["I like it here."], wrong: ["I like English.", "It's mine.", "I don't like it here."] },
  { id: "im-tired", correct: ["I'm", "I’m", "I am", "  I'M! "], wrong: ["I", "Im", "am", "I’m tired", "I'm not", "you are"] },
  { id: "learning", correct: ["I'm learning English.", "I am learning English!", " I’M  learning   ENGLISH "], wrong: ["I learning am English.", "I'm not learning English.", "I'm learn English."] },
  { id: "work-job", correct: ["Too much work."], wrong: ["Your job.", "Me too."] },
  { id: "sit-me", correct: ["Que você se sente com ela."], wrong: ["Que você peça outro café.", "Que você vá embora."] },
  { id: "yeah-sure", correct: ["sure", " SURE! "], wrong: ["no", "not sure", "sorry", "Yeah, sure."] },
  { id: "can-sit", correct: ["Can I sit here?", " CAN  I sit here "], wrong: ["I can sit here.", "Can I to sit here?", "Can I sit there?"] },
  { id: "stay-longer", correct: ["I can stay a little longer.", " I CAN stay a little longer! "], wrong: ["Can I stay a little longer?", "I can to stay a little longer.", "I can't stay a little longer."] },
  { id: "have-go", correct: ["to", " TO! "], wrong: ["", "can", "for", "to not", "have to"] },
  { id: "break-quiet", correct: ["I need a break."], wrong: ["It's quiet here.", "I like it here.", "I don't need a break."] },
  { id: "keep-touch", correct: ["Can we keep in touch?", " can WE keep in touch! "], wrong: ["We can keep in touch.", "Can we keep touch in?", "Can you keep in touch?"] },
  { id: "nice-talking", correct: ["Ao encerrar uma conversa agradável."], wrong: ["Ao avisar que um copo vai cair.", "Ao perguntar quem fez o pedido."] },
  { id: "you-too-bye", correct: ["You", " YOU! "], wrong: ["Me", "Your", "You too", "Bye"] },
] as const;

const practiceFor = (id: string) => {
  const step = studySteps.find(item => item.step.id === id)?.step;
  expect(step, `Missing reviewed practice ${id}`).toBeDefined();
  return step!.practice;
};

describe("reviewed cafeteria study answers", () => {
  it("covers the 24 reviewed practices without silently omitting a new or renamed step", () => {
    expect(studySteps.map(({ step }) => step.id).sort()).toEqual(examples.map(({ id }) => id).sort());
  });

  for (const example of examples) {
    it(`${example.id}: accepts the intended meaning and rejects distinct meanings or word order`, () => {
      const practice = practiceFor(example.id);
      for (const answer of example.correct) expect(isCorrect(practice, answer), answer).toBe(true);
      for (const answer of example.wrong) expect(isCorrect(practice, answer), answer).toBe(false);
      expect(isCorrect(practice, "  \t\n ")).toBe(false);
      if (practice.kind === "choice") {
        expect(practice.options.filter(option => isCorrect(practice, option))).toEqual([example.correct[0]]);
        for (const option of practice.options) {
          if (option !== example.correct[0]) expect(example.wrong).toContain(option);
        }
      }
    });
  }

  it("rejects missing and extra pieces in every phrase assembly", () => {
    for (const { id, correct } of examples) {
      const practice = practiceFor(id);
      if (practice.kind !== "order") continue;
      const words = correct[0].split(" ");
      expect(isCorrect(practice, words.slice(0, -1).join(" ")), `${id}: missing final piece`).toBe(false);
      expect(isCorrect(practice, `not ${correct[0]}`), `${id}: added negative`).toBe(false);
      expect(isCorrect(practice, [...words].reverse().join(" ")), `${id}: reversed order`).toBe(false);
    }
  });
});

describe("study progress represents the completed practice attempts", () => {
  it("can finish all 24 steps while preserving which attempts used a model", () => {
    let progress = emptyProgress;
    const supported: string[] = [];
    for (const [index, { id }] of examples.entries()) {
      const before = structuredClone(progress);
      const withModel = index % 3 === 0;
      if (withModel) supported.push(id);
      progress = completeStep(progress, id, withModel);
      expect(progress.completed).toHaveLength(index + 1);
      expect(progress.supported).toEqual(supported);
      expect(before.completed).toHaveLength(index);
      expect(decodeProgress(JSON.stringify(progress))).toEqual(progress);
    }
    expect(progress.completed).toEqual(examples.map(({ id }) => id));
    expect(progress.completed).toHaveLength(24);
    expect(progress.supported).toHaveLength(8);
    expect(progress.position).toBe(0);
    expect(emptyProgress.completed).toEqual([]);
    expect(emptyProgress.supported).toEqual([]);
  });

  it("allows a later response without consulting a model to supersede model completion for every step", () => {
    let progress = emptyProgress;
    for (const { id } of examples) progress = completeStep(progress, id, true);
    expect(progress.supported).toHaveLength(24);
    for (const [index, { id }] of examples.entries()) {
      progress = completeStep(progress, id, false);
      expect(progress.completed).toHaveLength(24);
      expect(progress.supported).not.toContain(id);
      expect(progress.supported).toHaveLength(23 - index);
      expect(decodeProgress(JSON.stringify(progress))).toEqual(progress);
    }
    expect(progress.supported).toEqual([]);
    const last = completeStep(progress, "you-too-bye", false);
    expect(last.completed).toHaveLength(24);
    expect(last.supported).toEqual([]);
  });

  it("does not turn navigation, duplicate IDs or unknown persisted IDs into additional completion", () => {
    const navigationOnly = { ...emptyProgress, position: 23 };
    expect(decodeProgress(JSON.stringify(navigationOnly))).toEqual(navigationOnly);
    expect(navigationOnly.completed).toEqual([]);
    expect(completeStep(navigationOnly, "unknown", true)).toBe(navigationOnly);
    const saved = decodeProgress(JSON.stringify({
      version: 1, position: 999,
      completed: ["this-yours", "unknown", "this-yours", 3, null],
      supported: ["this-yours", "unknown", "mine-your", "this-yours"],
    }));
    expect(saved).toEqual({ version: 1, position: 23, completed: ["this-yours"], supported: ["this-yours"] });
    expect(completeStep(saved, "this-yours", true)).toEqual(saved);
    expect(completeStep(saved, "this-yours", false)).toEqual({ ...saved, supported: [] });
  });

  it("restores malformed or incompatible progress as an empty study without invented attempts", () => {
    for (const raw of [null, "", "broken", "null", "[]", '{"version":2}',
      '{"version":1,"position":0.5,"completed":[],"supported":[]}',
      '{"version":1,"position":0,"completed":"all","supported":[]}',
      '{"version":1,"position":0,"completed":[],"supported":null}',
    ]) expect(decodeProgress(raw)).toEqual(emptyProgress);
  });
});

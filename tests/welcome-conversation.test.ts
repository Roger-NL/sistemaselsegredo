import { describe, expect, it } from "vitest";
import {
  conversationReducer, createConversation, getChoices, initialConversation,
  isValidConversation, readConversationProgress, saveConversationProgress,
  welcomeSpeechPhrases, type Conversation,
} from "../src/app/inicio-orbita-7k3/conversation";
import { guidedContent } from "../src/app/inicio-orbita-7k3/guided-practice";
import { translate } from "../src/app/inicio-orbita-7k3/guided-content-types";
import { type LearningLanguage, type SceneId, type BarrierId } from "../src/app/inicio-orbita-7k3/language";
import { getOrbitUiCopy } from "../src/app/inicio-orbita-7k3/ui-copy";

const languages = ["pt", "es", "de"] as const;
const scenes = ["world", "work", "life"] as const;
const barriers = ["start", "freeze", "words", "translate"] as const;
const matrix = languages.flatMap((language) => scenes.flatMap((scene) =>
  barriers.map((barrier) => ({ language, scene, barrier }))));

function answer(state: Conversation, id: string) {
  return conversationReducer(state, { stage: state.stage, choiceId: id });
}
function question(language: LearningLanguage, scene: SceneId, barrier: BarrierId) {
  return answer(answer(answer(createConversation("Ana", language), "begin"), scene), barrier);
}
function storage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
}
function assertRestorable(state: Conversation) {
  const cache = storage();
  expect(isValidConversation(state)).toBe(true);
  expect(saveConversationProgress(cache, state)).toBe(true);
  expect(readConversationProgress(cache)).toEqual(state);
}

describe("guided welcome conversation", () => {
  it.each(matrix)("uses optional translation and both real responses for $language / $scene / $barrier", ({ language, scene, barrier }) => {
    const content = guidedContent[scene][barrier];
    const initial = question(language, scene, barrier);
    expect(initial.stage).toBe("question");
    expect(initial.messages.at(-1)?.text).toContain(content.question);
    expect(initial.messages.at(-1)?.text).not.toContain(translate(content.questionMeaning, language));
    expect(initial.messages.at(-1)?.speech).toEqual([content.question]);
    expect(getChoices(initial).map(({ id }) => id)).toEqual(["translate-question", "answer-question"]);
    assertRestorable(initial);

    const revealed = answer(initial, "translate-question");
    expect(revealed.messages.at(-1)?.text).toContain(translate(content.questionMeaning, language));
    expect(revealed.stage).toBe("question");
    expect(getChoices(revealed).map(({ id }) => id)).toEqual(["answer-question"]);
    expect(answer(revealed, "translate-question")).toBe(revealed);
    assertRestorable(revealed);

    for (const source of [initial, revealed]) {
      const options = answer(source, "answer-question");
      expect(options.stage).toBe("answerChoice");
      expect(getChoices(options).map(({ label }) => label)).toEqual(content.answers.map((item) => item.phrase));
      expect(getChoices(options).every((item) => item.speech && welcomeSpeechPhrases.includes(item.speech))).toBe(true);
      assertRestorable(options);

      for (const selected of content.answers) {
        const draft = answer(options, selected.id);
        expect(draft.stage).toBe("practice");
        expect(draft.answerId).toBe(selected.id);
        expect(draft.messages.at(-1)?.text).toContain(selected.phrase);
        expect(draft.messages.at(-1)?.text).not.toContain(translate(selected.meaning, language));
        expect(draft.messages.filter((message) => message.role === "user" && message.text === selected.phrase)).toHaveLength(0);
        expect(getChoices(draft).map(({ id }) => id)).toEqual(["understand", "change-answer", "spoken"]);
        expect(answer(draft, content.answers.find((item) => item.id !== selected.id)!.id)).toBe(draft);
        assertRestorable(draft);

        const lesson = answer(draft, "understand");
        expect(lesson.stage).toBe("lesson");
        expect(lesson.messages.slice(0, draft.messages.length)).toEqual(draft.messages);
        expect(lesson.messages.at(-1)?.text).toContain("Ana");
        expect(lesson.messages.at(-1)?.text).toContain(translate(selected.meaning, language));
        expect(lesson.messages.at(-1)?.text).not.toMatch(/\{(?:name|address|phrase|meaning)\}/);
        expect(lesson.messages.at(-1)?.lesson?.map((card) => card.phrase)).toEqual(selected.parts.map((part) => part.en));
        expect(lesson.messages.at(-1)?.lesson?.map((card) => card.translation)).toEqual(selected.parts.map((part) => translate(part.meaning, language)));
        expect(lesson.messages.at(-1)?.lesson?.every((card) => card.note && card.focus && welcomeSpeechPhrases.includes(card.phrase))).toBe(true);
        expect(lesson.messages.at(-1)?.practiceCue?.items.map((item) => item.phrase)).toEqual(content.contrast.map((part) => part.en));
        expect(lesson.messages.at(-1)?.practiceCue?.items.map((item) => item.note)).toEqual(content.contrast.map((part) => translate(part.note, language)));
        assertRestorable(lesson);

        // Understanding is optional; sending from either route uses the same selected response.
        for (const sendFrom of [draft, lesson]) {
          const reaction = answer(sendFrom, sendFrom.stage === "lesson" ? "ready" : "spoken");
          expect(reaction.stage).toBe("replyLesson");
          expect(getChoices(reaction)).toEqual([{ id: "continue", label: getOrbitUiCopy(language).viewSummary }]);
          expect(answer(reaction, "change-answer")).toBe(reaction);
          expect(reaction.messages.at(-2)?.text).toBe(selected.phrase);
          expect(reaction.messages.filter((message) => message.role === "user" && message.text === selected.phrase)).toHaveLength(1);
          expect(reaction.messages.at(-1)?.lesson?.map((card) => card.phrase)).toEqual(selected.reaction.parts.map((part) => part.en));
          expect(reaction.messages.at(-1)?.lesson?.map((card) => card.translation)).toEqual(selected.reaction.parts.map((part) => translate(part.meaning, language)));
          assertRestorable(reaction);
          const done = answer(reaction, "continue");
          expect(done.stage).toBe("done");
          expect(done.messages.at(-1)?.recap?.turns).toEqual([
            expect.objectContaining({ phrase: content.question, translation: translate(content.questionMeaning, language) }),
            expect.objectContaining({ phrase: selected.phrase, translation: translate(selected.meaning, language) }),
            expect.objectContaining({ phrase: selected.reaction.phrase, translation: translate(selected.reaction.meaning, language) }),
          ]);
          expect(done.messages.at(-1)?.recap?.context).toEqual({ phrase: "", translation: translate(content.context, language) });
          if (barrier === "translate") expect(done.messages.at(-1)?.recap?.progress).not.toMatch(/conectou|conectaste|verbunden/i);
          expect(getChoices(done)).toEqual([]);
          assertRestorable(done);
        }
      }
    }
  });

  it.each(matrix)("can change an unsent draft or explained answer in $language / $scene / $barrier", ({ language, scene, barrier }) => {
    const content = guidedContent[scene][barrier];
    const initial = answer(question(language, scene, barrier), "translate-question");
    const options = answer(initial, "answer-question");
    const draft = answer(options, content.answers[0].id);
    for (const previous of [draft, answer(draft, "understand")]) {
      const changed = answer(previous, "change-answer");
      expect(changed).toMatchObject({
        stage: "answerChoice", language, name: "Ana", sceneId: scene, barrierId: barrier,
        guidedVersion: previous.guidedVersion, questionTranslated: true, testedBarrierIds: previous.testedBarrierIds,
      });
      expect(changed.answerId).toBeUndefined();
      expect(changed.musicAnswer).toBeUndefined();
      expect(changed.messages.slice(0, previous.messages.length)).toEqual(previous.messages);
      expect(getChoices(changed).map((item) => item.label)).toEqual(content.answers.map((item) => item.phrase));
      assertRestorable(changed);

      // Change twice, then send the second alternative. Earlier drafts remain history, never sent speech.
      const second = answer(changed, content.answers[1].id);
      const back = answer(second, "change-answer");
      assertRestorable(back);
      const latest = answer(back, content.answers[1].id);
      const lesson = answer(latest, "understand");
      expect(lesson.messages.at(-1)?.text).toContain(translate(content.answers[1].meaning, language));
      expect(lesson.messages.at(-1)?.lesson?.map((card) => card.phrase)).toEqual(content.answers[1].parts.map((part) => part.en));
      expect(lesson.messages.filter((message) => message.role === "user" && content.answers.some((item) => item.phrase === message.text))).toHaveLength(0);
      const sent = answer(lesson, "ready");
      expect(sent.messages.at(-1)?.lesson?.map((card) => card.phrase)).toEqual(content.answers[1].reaction.parts.map((part) => part.en));
      expect(sent.messages.filter((message) => message.role === "user" && content.answers.some((item) => item.phrase === message.text))).toHaveLength(1);
      const done = answer(sent, "continue");
      expect(done.messages.at(-1)?.recap?.turns[1].phrase).toBe(content.answers[1].phrase);
      expect(done.messages.at(-1)?.recap?.turns[2].phrase).toBe(content.answers[1].reaction.phrase);
      expect(answer(done, "change-answer")).toBe(done);
      assertRestorable(done);
    }
  });

  it("keeps repeated changes restorable even after the earlier history limit", () => {
    let state = answer(question("pt", "life", "start"), "answer-question");
    for (let index = 0; index < 30; index++) {
      state = answer(answer(state, index % 2 ? "love" : "hate"), "change-answer");
      assertRestorable(state);
    }
    expect(state.messages.length).toBeGreaterThan(96);
    expect(state.messages.some((message) => message.role === "user" && /^I (love|hate) music\.$/.test(message.text))).toBe(false);
  });

  it("accepts older contrast items without a note while rejecting invalid notes", () => {
    const draft = answer(answer(question("pt", "world", "start"), "answer-question"), "first");
    const lesson = answer(draft, "understand");
    const old = {
      ...lesson,
      messages: lesson.messages.map((message) => message.practiceCue ? {
        ...message, practiceCue: { ...message.practiceCue, items: message.practiceCue.items.map(({ phrase, meaning }) => ({ phrase, meaning })) },
      } : message),
    };
    assertRestorable(old);
    const invalid = { ...old, messages: old.messages.map((message) => message.practiceCue ? {
      ...message, practiceCue: { ...message.practiceCue, items: [{ phrase: "coffee", meaning: "café", note: 42 }] },
    } : message) };
    expect(isValidConversation(invalid)).toBe(false);
  });

  it("keeps the simplest vocabulary at zero and distinct material in all four difficulties", () => {
    expect(guidedContent.world.start.answers.map((item) => item.phrase)).toEqual(["I like coffee.", "No, I like tea."]);
    expect(guidedContent.world.start.answers[1].reaction.phrase).toBe("Oh, OK!");
    expect(guidedContent.work.start.answers.map((item) => item.phrase)).toEqual(["I like your idea.", "I love your idea."]);
    expect(guidedContent.life.start.answers.map((item) => item.phrase)).toEqual(["I love music.", "I hate music."]);
    for (const scene of scenes) {
      const scenarios = barriers.map((barrier) => guidedContent[scene][barrier]);
      expect(new Set(scenarios.map((scenario) => scenario.question)).size).toBe(4);
      const phrases = scenarios.flatMap((scenario) => scenario.answers.map((item) => item.phrase));
      expect(new Set(phrases).size).toBe(8);
      const zeroSize = Math.max(...guidedContent[scene].start.answers.map((item) => item.phrase.split(" ").length));
      for (const barrier of ["words", "translate"] as const) {
        expect(guidedContent[scene][barrier].answers.every((item) => item.phrase.split(" ").length > zeroSize)).toBe(true);
      }
    }
  });

  it("keeps question, answer, chunks, reaction and contrast audio approved across all branches", () => {
    for (const scene of scenes) for (const barrier of barriers) {
      const content = guidedContent[scene][barrier];
      const phrases = [content.question, ...content.contrast.map((part) => part.en),
        ...content.answers.flatMap((item) => [item.phrase, item.reaction.phrase, ...item.parts.map((part) => part.en), ...item.reaction.parts.map((part) => part.en)])];
      expect(phrases.every((phrase) => welcomeSpeechPhrases.includes(phrase))).toBe(true);
      for (const item of content.answers) {
        expect(item.parts.map((part) => part.en).join(" ")).toBe(item.phrase);
        expect(item.reaction.parts.map((part) => part.en).join(" ")).toBe(item.reaction.phrase);
        for (const language of languages) {
          expect(translate(item.meaning, language).trim()).not.toBe("");
          expect(item.parts.every((part) => translate(part.meaning, language).trim() && translate(part.note, language).trim())).toBe(true);
        }
      }
    }
  });

  it.each(scenes)("saves all four complete test paths without losing progress in %s", (scene) => {
    let state = answer(answer(createConversation("Ana"), "begin"), scene);
    for (const barrier of barriers) {
      state = answer(state, barrier);
      state = answer(state, "translate-question");
      state = answer(state, "answer-question");
      state = answer(state, getChoices(state)[1].id);
      state = answer(answer(answer(state, "understand"), "ready"), "continue");
      assertRestorable(state);
      if (barrier !== "translate") {
        state = conversationReducer(state, { type: "try-another-path" });
        expect(state.stage).toBe("barrier");
        expect(state.answerId).toBeUndefined();
        expect(state.guidedVersion).toBeUndefined();
        expect(state.questionTranslated).toBeUndefined();
        expect(getChoices(state).map((choice) => choice.id)).not.toContain(barrier);
      }
    }
    expect(state.messages.length).toBeGreaterThan(64);
    expect(state.testedBarrierIds).toHaveLength(4);
    expect(conversationReducer(state, { type: "try-another-path" })).toBe(state);
  });

  it("rejects impossible saved selections and malformed message data", () => {
    const current = question("pt", "world", "start");
    expect(isValidConversation({ ...current, stage: "practice", answerId: "hate" })).toBe(false);
    expect(isValidConversation({ ...current, guidedVersion: 2 })).toBe(false);
    expect(isValidConversation({ ...current, messages: [{ id: 0, role: "assistant", text: "hi", lesson: "bad" }] })).toBe(false);
    const cache = storage();
    cache.setItem("basedspeak:orbit-progress:v1", JSON.stringify({ stage: "done" }));
    expect(readConversationProgress(cache)).toBeNull();
    expect(cache.getItem("basedspeak:orbit-progress:v1")).toBeNull();
  });

  it.each(languages)("uses the visitor's name and keeps the whole selected interface in %s", (language) => {
    const greeting = createConversation("Roger", language);
    const next = answer(greeting, "begin");
    expect(next.messages.at(-1)?.text).toContain("Roger");
    expect(next.messages.at(-1)?.text).not.toContain("{name}");
    const current = question(language, "work", "words");
    const changed = conversationReducer(current, { type: "set-language", language: language === "pt" ? "es" : "pt" });
    expect(changed.name).toBe("Ana");
    expect(changed.stage).toBe("hello");
    expect(changed.sceneId).toBeUndefined();
    expect(changed.answerId).toBeUndefined();
  });

  it("asks for a real typed name, normalizes it and changes preferences without rewriting history", () => {
    expect(initialConversation.stage).toBe("name");
    expect(createConversation().language).toBe("pt");
    expect(getChoices(initialConversation)).toEqual([]);
    expect(conversationReducer(initialConversation, { type: "name", name: "   " })).toBe(initialConversation);
    const named = conversationReducer(initialConversation, { type: "name", name: "  João   Paulo " });
    expect(named.name).toBe("João Paulo");
    expect(named.messages.at(-1)?.text).toContain("Prazer, João Paulo");
    expect(named.stage).toBe("scene");
    expect(conversationReducer(named, { type: "name", name: "Outra" })).toBe(named);
    const updated = conversationReducer(named, { type: "rename", name: "Bia" });
    expect(updated.messages).toBe(named.messages);
    expect(answer(updated, "world").messages.at(-1)?.text).toContain("Bia");
  });

  it("restarts only this conversation while keeping the name and language", () => {
    const current = question("de", "work", "start");
    const restarted = conversationReducer(current, { type: "restart" });
    expect(restarted.stage).toBe("scene");
    expect(restarted.name).toBe("Ana");
    expect(restarted.language).toBe("de");
    expect(restarted.messages).toHaveLength(1);
    expect(restarted.answerId).toBeUndefined();
    expect(getChoices(restarted).map((choice) => choice.id)).toEqual(["world", "work", "life"]);
  });

  it("ignores invalid and stale clicks instead of answering the next question twice", () => {
    const state = question("pt", "world", "freeze");
    expect(conversationReducer(state, { stage: "barrier", choiceId: "freeze" })).toBe(state);
    expect(answer(state, "not-a-choice")).toBe(state);
    expect(initialConversation.messages).toHaveLength(1);
  });

  it("can still finish a previously saved music choice from the first prototype", () => {
    const current = answer(answer(question("pt", "life", "start"), "answer-question"), "hate");
    const legacy = { ...current, guidedVersion: undefined, answerId: undefined, musicAnswer: "hate" as const };
    expect(isValidConversation(legacy)).toBe(true);
    const reaction = answer(legacy, "spoken");
    expect(reaction.messages.at(-1)?.lesson?.[0].phrase).toBe("Oh, really?");
  });
});

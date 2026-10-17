import { describe, expect, it } from "vitest";
import {
  conversationReducer,
  getChoices,
  initialConversation,
  createConversation,
  readConversationProgress,
  saveConversationProgress,
  welcomeSpeechPhrases,
  type Conversation,
} from "../src/app/inicio-orbita-7k3/conversation";
import { localeCopy, localizedVariant, type LearningLanguage } from "../src/app/inicio-orbita-7k3/language";

function answer(state: Conversation, choiceId: string) {
  return conversationReducer(state, { stage: state.stage, choiceId });
}

function startPractice(scene: string, barrier: string) {
  return answer(
    answer(
      conversationReducer(initialConversation, { type: "name", name: "Ana" }),
      scene,
    ),
    barrier,
  );
}

function startPracticeInLanguage(scene: string, barrier: string, language: LearningLanguage) {
  const hello = answer(createConversation("Ana", language), "begin");
  return answer(answer(hello, scene), barrier);
}

describe("welcome conversation", () => {
  it.each(["de", "es"] as const)("starts in Portuguese by default and supports switching to %s", (language) => {
    const initial = createConversation("Ana");
    expect(initial.language).toBe("pt");
    const started = createConversation("Ana", language);
    expect(started.language).toBe(language);
    expect(started.messages[0].text).toContain(localeCopy[language].greetingReturning.split("{name}")[0]);
    const changed = conversationReducer(startPractice("world", "freeze"), {
      type: "set-language",
      language,
    });
    expect(changed.name).toBe("Ana");
    expect(changed.language).toBe(language);
    expect(changed.stage).toBe("hello");
    expect(getChoices(changed)[0].label).toBe(language === "de" ? "Los geht's" : language === "es" ? "Vamos" : "Vamos lá");
  });

  it.each([
    ["world", "freeze"], ["world", "translate"], ["world", "words"], ["world", "start"],
    ["work", "freeze"], ["work", "translate"], ["work", "words"], ["work", "start"],
    ["life", "freeze"], ["life", "translate"], ["life", "words"], ["life", "start"],
  ])("keeps the full teaching flow translated into German for %s / %s", (scene, barrier) => {
    const practice = startPracticeInLanguage(scene, barrier, "de");
    const base = localeCopy.de.variants[scene as keyof typeof localeCopy.de.variants][barrier === "start" ? "beginner" : "standard"];
    const practiceText = practice.messages.at(-1)?.text ?? "";
    expect(practice.language).toBe("de");
    expect(practiceText).toContain(base.translation);
    expect(practiceText).not.toContain("Tenho uma ideia");
    const answerLesson = answer(practice, "understand");
    const cards = answerLesson.messages.at(-1)?.lesson ?? [];
    expect(cards).toHaveLength(base.partNotes.length);
    expect(cards.map((card) => card.translation)).toEqual(base.partMeanings);
    expect(cards.map((card) => card.clues.length)).toEqual(base.partClueMeanings.map((items) => items.length));
    expect(cards.every((card) => card.note.length > 35)).toBe(true);
    expect(cards.flatMap((card) => card.clues).every((clue) => clue.meaning.length > 0)).toBe(true);
    const replyLesson = answer(answerLesson, "ready");
    const replyCards = replyLesson.messages.at(-1)?.lesson ?? [];
    expect(replyCards.map((card) => card.translation)).toEqual(base.replyPartMeanings);
    expect(replyCards.map((card) => card.clues.length)).toEqual(base.replyClueMeanings.map((items) => items.length));
    const done = answer(replyLesson, "continue");
    expect(done.messages.at(-1)?.recap?.turns[0].translation).toBe(base.openingTranslation);
  });

  it.each([
    ["world", "freeze"], ["world", "translate"], ["world", "words"], ["world", "start"],
    ["work", "freeze"], ["work", "translate"], ["work", "words"], ["work", "start"],
    ["life", "freeze"], ["life", "translate"], ["life", "words"], ["life", "start"],
  ])("keeps the full teaching flow translated into Spanish for %s / %s", (scene, barrier) => {
    const practice = startPracticeInLanguage(scene, barrier, "es");
    const base = localizedVariant("es", scene as "world" | "work" | "life", barrier === "start");
    const practiceText = practice.messages.at(-1)?.text ?? "";
    expect(practiceText).toContain(base.translation);
    expect(practiceText).not.toContain("Tenho uma ideia");
    const answerLesson = answer(practice, "understand");
    const cards = answerLesson.messages.at(-1)?.lesson ?? [];
    expect(cards).toHaveLength(base.partNotes.length);
    expect(cards.map((card) => card.translation)).toEqual(base.partMeanings);
    expect(cards.map((card) => card.clues.length)).toEqual(base.partClueMeanings.map((items) => items.length));
    expect(cards.every((card) => card.note.length > 35)).toBe(true);
    expect(cards.flatMap((card) => card.clues).every((clue) => clue.meaning.length > 0)).toBe(true);
    const replyLesson = answer(answerLesson, "ready");
    const replyCards = replyLesson.messages.at(-1)?.lesson ?? [];
    expect(replyCards.map((card) => card.translation)).toEqual(base.replyPartMeanings);
    expect(replyCards.map((card) => card.clues.length)).toEqual(base.replyClueMeanings.map((items) => items.length));
    const done = answer(replyLesson, "continue");
    expect(done.messages.at(-1)?.recap?.turns[0].translation).toBe(base.openingTranslation);
  });

  it.each([
    [
      "world",
      "Yes! What do you recommend?",
      ["Yes!", "What do you", "recommend?"],
    ],
    [
      "work",
      "I have an idea. Can I share it?",
      ["I have an idea.", "Can I", "share it?"],
    ],
    [
      "life",
      "I love music. How about you?",
      ["I love music.", "How about", "you?"],
    ],
  ])(
    "keeps the complete transcript and uses the chosen %s scene",
    (scene, phrase, parts) => {
      const state = startPractice(scene, "freeze");
      expect(state.stage).toBe("practice");
      expect(state.messages).toHaveLength(7);
      expect(state.messages[0]).toEqual(initialConversation.messages[0]);
      expect(state.messages.map((message) => message.role)).toEqual([
        "assistant",
        "user",
        "assistant",
        "user",
        "assistant",
        "user",
        "assistant",
      ]);
      expect(state.messages.at(-1)?.text).toContain(`“${phrase}”`);
      expect(state.messages.at(-1)?.text).toContain(
        scene === "world" ? "Sim! O que você recomenda?" :
          scene === "work" ? "Tenho uma ideia. Posso compartilhar?" :
            "Eu adoro música. E você?",
      );
      expect(state.messages.at(-1)?.speech).toEqual(
        expect.arrayContaining([phrase]),
      );
      expect(state.messages.at(-1)?.speech).not.toContain(parts[0]);
      expect(new Set(state.messages.map((message) => message.id)).size).toBe(
        state.messages.length,
      );
    },
  );

  it("adds translation as a new exchange without overwriting earlier answers", () => {
    const before = startPractice("work", "words");
    const lesson = answer(before, "understand");
    expect(lesson.messages.slice(0, before.messages.length)).toEqual(
      before.messages,
    );
    expect(lesson.stage).toBe("lesson");
    expect(lesson.messages.at(-1)?.text).toContain("usando as palavras conhecidas como pistas");
    expect(lesson.messages.at(-1)?.lesson?.map((card) => card.note)).toEqual(
      expect.arrayContaining([expect.stringContaining("Can I…? pede permissão")]),
    );
    expect(answer(lesson, "understand")).toBe(lesson);
    const replyLesson = answer(lesson, "ready");
    expect(replyLesson.stage).toBe("replyLesson");
    expect(replyLesson.messages.at(-1)?.lesson).toEqual([
      expect.objectContaining({ phrase: "Of course." }),
      expect.objectContaining({ phrase: "We'd love to hear it." }),
    ]);
    const done = answer(replyLesson, "continue");
    expect(done.stage).toBe("done");
    expect(done.messages.at(-1)?.recap?.turns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ phrase: "I have an idea. Can I share it?" }),
        expect.objectContaining({ phrase: "Of course. We'd love to hear it." }),
      ]),
    );
    expect(done.messages.at(-1)?.recap?.context.phrase).toBe("We are in a meeting.");
    expect(getChoices(done)).toEqual([]);
  });

  it("shows the full translated phrase before teaching beginners each part", () => {
    const state = startPractice("world", "start");
    expect(state.messages.at(-1)?.text).toContain("Você gosta de café?");
    expect(state.messages.at(-1)?.text).toContain("Yes, I like coffee.");
    expect(state.messages.at(-1)?.text).toContain("Sim, eu gosto de café.");
    expect(state.messages.at(-1)?.text).toContain(
      "Como você está começando do zero",
    );
    expect(getChoices(state).map((choice) => choice.id)).toEqual(["understand", "spoken"]);
    const lesson = answer(state, "understand");
    expect(lesson.stage).toBe("lesson");
    expect(lesson.messages.at(-1)?.lesson?.[1]?.note).toContain("pessoa vem antes do verbo");
  });

  it.each([
    [
      "freeze",
      "Você disse que às vezes dá branco",
      "use uma resposta pronta",
      "Consegui montar a frase",
    ],
    [
      "translate",
      "Você disse que costuma traduzir tudo na cabeça",
      "veja a ideia completa",
      "Consegui usar os blocos",
    ],
    [
      "words",
      "Você disse que faltam palavras",
      "veja como ela soa",
      "Consegui usar essas palavras",
    ],
    [
      "start",
      "Como você está começando do zero",
      "I like your idea.",
      "Consegui montar a frase",
    ],
  ])(
    "adapts the next exercise to the %s difficulty",
    (barrier, context, exercise, actionLabel) => {
      const state = startPractice("work", barrier);
      expect(state.messages.at(-1)?.text).toContain(context);
      expect(state.messages.at(-1)?.text).toContain(exercise);
    expect(getChoices(state).at(-1)?.label).toBe(actionLabel);
    },
  );

  it.each([
    ["world", ["freeze", "translate", "words"], "Yes! What do you recommend?", "Sim! O que você recomenda?", ["Yes!", "What do you", "recommend?"]],
    ["world", ["start"], "Yes, I like coffee.", "Sim, eu gosto de café.", ["Yes,", "I like", "coffee."]],
    ["work", ["freeze", "translate", "words"], "I have an idea. Can I share it?", "Tenho uma ideia. Posso compartilhar?", ["I have an idea.", "Can I", "share it?"]],
    ["work", ["start"], "I like your idea.", "Eu gosto da sua ideia.", ["I like", "your idea."]],
    ["life", ["freeze", "translate", "words"], "I love music. How about you?", "Eu adoro música. E você?", ["I love music.", "How about", "you?"]],
    ["life", ["start"], "I love music.", "Eu adoro música.", ["I love", "music."]],
  ])(
    "shows English and Portuguese together for the %s phrase variants",
    (scene, barriers, phrase, translation, parts) => {
      for (const barrier of barriers) {
        const practice = startPractice(scene, barrier);
        const text = practice.messages.at(-1)?.text ?? "";
        expect(text).toContain(`“${phrase}”`);
        expect(text).toContain(translation);
        const lesson = answer(practice, "understand");
        expect(lesson.stage).toBe("lesson");
        expect(lesson.messages.at(-1)?.lesson?.map((card) => card.phrase)).toEqual(parts);
        expect(lesson.messages.at(-1)?.lesson?.every((card) => card.note.length > 35)).toBe(true);
      }
    },
  );

  it.each([
    ["freeze", "partiu do branco"],
    ["translate", "conectou os blocos de sentido"],
    ["words", "palavras como pistas"],
    ["start", "primeira conversa em inglês"],
  ])("keeps the %s path reflected after practice", (barrier, confirmation) => {
    const replyLesson = answer(startPractice("work", barrier), "spoken");
    const done = answer(replyLesson, "continue");
    expect(done.messages.at(-1)?.recap?.progress).toContain(confirmation);
    expect(done.messages.at(-1)?.text).toBe(
      "Olha a conversa que você acabou de conseguir acompanhar.",
    );
  });

  it("teaches the people-conversation phrase with easy visual lesson cards", () => {
    const practice = startPractice("life", "start");
    const lesson = answer(practice, "understand");

    expect(lesson.stage).toBe("lesson");
    expect(lesson.messages.slice(0, practice.messages.length)).toEqual(
      practice.messages,
    );
    expect(lesson.messages.at(-1)?.lesson).toEqual([
      expect.objectContaining({ phrase: "I love" }),
      expect.objectContaining({ phrase: "music." }),
    ]);
    expect(getChoices(lesson)).toEqual([
      { id: "ready", label: "Juntar a frase" },
    ]);

    const replyLesson = answer(lesson, "ready");
    expect(replyLesson.stage).toBe("replyLesson");
    expect(replyLesson.messages.at(-1)?.lesson).toEqual([
      expect.objectContaining({ phrase: "Me too!" }),
    ]);
    expect(getChoices(replyLesson)).toEqual([
      { id: "continue", label: "Continuar a conversa" },
    ]);

    const done = answer(replyLesson, "continue");
    expect(done.stage).toBe("done");
    expect(done.messages.at(-1)?.recap?.turns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ phrase: "I love music." }),
        expect.objectContaining({ phrase: "Me too!" }),
      ]),
    );
  });

  it.each([
    ["world", "Do you like coffee?", "Yes, I like coffee.", "Me too!"],
    ["work", "Do you like my idea?", "I like your idea.", "Thank you!"],
    ["life", "Do you like music?", "I love music.", "Me too!"],
  ])(
    "uses beginner-friendly question, answer, and reply for %s",
    (scene, question, phrase, reply) => {
      const practice = startPractice(scene, "start");
      expect(practice.messages.at(-1)?.text).toContain(question);
      expect(practice.messages.at(-1)?.text).toContain(phrase);
      expect(practice.messages.at(-1)?.text).not.toContain(
        "I have an idea. Can I share it?",
      );

      const answerLesson = answer(practice, "understand");
      expect(answerLesson.messages.at(-1)?.lesson?.length).toBeGreaterThan(0);
      const replyLesson = answer(answerLesson, "ready");
      expect(replyLesson.messages.at(-1)?.lesson?.map((card) => card.phrase)).toContain(reply);
      expect(answer(replyLesson, "continue").messages.at(-1)?.recap?.turns.map((turn) => turn.phrase)).toContain(reply);
    },
  );

  it.each([
    ["world", "freeze"],
    ["world", "translate"],
    ["world", "words"],
    ["world", "start"],
    ["work", "freeze"],
    ["work", "translate"],
    ["work", "words"],
    ["work", "start"],
    ["life", "freeze"],
    ["life", "translate"],
    ["life", "words"],
    ["life", "start"],
  ])("teaches both sides for the %s / %s path", (scene, barrier) => {
    const answerLesson = answer(startPractice(scene, barrier), "understand");
    expect(answerLesson.stage).toBe("lesson");
    expect(answerLesson.messages.at(-1)?.lesson?.length).toBeGreaterThan(0);

    const replyLesson = answer(answerLesson, "ready");
    expect(replyLesson.stage).toBe("replyLesson");
    expect(replyLesson.messages.at(-1)?.lesson?.length).toBeGreaterThan(0);
    expect(
      replyLesson.messages
        .at(-1)
        ?.lesson?.every((card) => welcomeSpeechPhrases.includes(card.phrase)),
    ).toBe(true);

    const done = answer(replyLesson, "continue");
    expect(done.stage).toBe("done");
    expect(done.messages.at(-1)?.recap?.turns).toHaveLength(3);
  });

  it("asks for a typed name and welcomes a returning visitor", () => {
    expect(initialConversation.stage).toBe("name");
    expect(getChoices(initialConversation)).toEqual([]);
    const named = conversationReducer(initialConversation, {
      type: "name",
      name: "  João   Paulo ",
    });
    expect(named.name).toBe("João Paulo");
    expect(named.messages[1].text).toBe("João Paulo");
    expect(named.messages.at(-1)?.text).toContain("Prazer, João Paulo");
    expect(named.stage).toBe("scene");
    const returning = createConversation(named.name);
    expect(returning.stage).toBe("hello");
    expect(returning.messages[0].text).toContain("Oi de novo, João Paulo!");
  });

  it("restarts only the welcome route and keeps the saved name", () => {
    const practice = startPractice("work", "start");
    const restarted = conversationReducer(practice, { type: "restart" });
    expect(restarted.stage).toBe("scene");
    expect(restarted.name).toBe("Ana");
    expect(restarted.sceneId).toBeUndefined();
    expect(restarted.barrierId).toBeUndefined();
    expect(restarted.messages).toHaveLength(1);
    expect(restarted.messages[0].text).toContain("Ana, vamos por outro caminho.");
    expect(getChoices(restarted).map((choice) => choice.id)).toEqual([
      "world",
      "work",
      "life",
    ]);
  });

  it("lets testers try an untested difficulty branch before rating the experience", () => {
    const practice = startPracticeInLanguage("world", "start", "de");
    const completed = answer(answer(practice, "spoken"), "continue");
    expect(completed.stage).toBe("done");
    expect(completed.testedBarrierIds).toEqual(["start"]);

    const nextBranch = conversationReducer(completed, { type: "try-another-path" });
    expect(nextBranch.stage).toBe("barrier");
    expect(nextBranch.messages.at(-1)?.text).toContain("andere Schwierigkeit");
    expect(getChoices(nextBranch).map(({ id }) => id)).not.toContain("start");
    expect(getChoices(nextBranch)).toHaveLength(3);

    const chosenBranch = answer(nextBranch, getChoices(nextBranch)[0].id);
    expect(chosenBranch.stage).toBe("practice");
    expect(chosenBranch.testedBarrierIds).toHaveLength(2);
  });

  it("saves and restores the conversation so a mobile refresh keeps progress", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
      removeItem: (key: string) => { values.delete(key); },
    };
    const progress = answer(answer(createConversation("Ana", "de"), "begin"), "world");

    expect(saveConversationProgress(storage, progress)).toBe(true);
    expect(readConversationProgress(storage)).toEqual(progress);
  });

  it("discards invalid saved conversation data", () => {
    const values = new Map<string, string>([["basedspeak:orbit-progress:v1", JSON.stringify({ stage: "done", language: "de", messages: [{ id: 0, role: "assistant", text: "hi", lesson: "bad" }] })]]);
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      removeItem: (key: string) => { values.delete(key); },
    };

    expect(readConversationProgress(storage)).toBeNull();
    expect(values.has("basedspeak:orbit-progress:v1")).toBe(false);
  });

  it("rejects empty names and updates the preference without rewriting history", () => {
    expect(
      conversationReducer(initialConversation, { type: "name", name: "   " }),
    ).toBe(initialConversation);
    const named = conversationReducer(initialConversation, {
      type: "name",
      name: "Ana",
    });
    expect(conversationReducer(named, { type: "name", name: "Outra" })).toBe(
      named,
    );
    const updated = conversationReducer(named, { type: "rename", name: "Bia" });
    expect(updated.messages).toBe(named.messages);
    expect(answer(updated, "world").messages.at(-1)?.text).toContain("Bia");
  });

  it("ignores invalid and stale clicks instead of advancing twice", () => {
    const state = answer(createConversation("Ana"), "begin");
    expect(
      conversationReducer(state, { stage: "hello", choiceId: "begin" }),
    ).toBe(state);
    expect(answer(state, "not-a-choice")).toBe(state);
    expect(initialConversation.messages).toHaveLength(1);
  });
});

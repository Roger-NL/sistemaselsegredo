import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DemoExperience } from "@/features/demo/DemoExperience";
import { createDemo, transition } from "@/features/demo/model/reducer";
import { listeningTarget } from "@/features/demo/model/listening";
import type { DemoState } from "@/features/demo/model/types";

const render = (state: DemoState) => renderToStaticMarkup(createElement(DemoExperience, { initial: state }));
const listen = (state: DemoState) => {
  const target = listeningTarget(state);
  return target ? transition(state, { at: state.nodeId, type: "AUDIO_ACCESS", key: target.key, mode: "heard" }) : state;
};
const next = (state: DemoState) => transition(listen(state), { at: state.nodeId, type: "NEXT" });

describe("opening reading order", () => {
  it("separates the title, story context and Lucas's first line into distinct cards", () => {
    let state = createDemo("beginner", "opening-render", 0);
    let html = render(state);
    expect(html).toContain("Um encontro na cafeteria.");
    expect(html).toContain("Avançar");
    expect(html).not.toContain("Is this yours?");
    expect(html).not.toContain("Ele aponta para um copo");
    state = next(state); html = render(state);
    expect(html).toContain("Ele aponta para um copo e pergunta.");
    expect(html).toContain("Começar a história");
    expect(html).not.toContain("Is this yours?");
    state = next(state); html = render(state);
    expect(html).toContain("Escute Lucas.");
    expect(html).not.toContain("Is this yours?");
    expect(html).not.toContain("Entender a pergunta");
    state = listen(state); html = render(state);
    expect(html).toContain("Is this yours?");
    expect(html).toContain("Entender a pergunta");
    expect(html).not.toContain("Ele aponta para um copo");
  });
  it("shows the standalone instruction without the English line or the answer choices", () => {
    let state = createDemo("beginner", "opening-render", 0);
    for (let step = 0; step < 3; step++) state = next(state);
    expect(state.nodeId).toBe("p2.prompt");
    const prompt = render(state);
    expect(prompt).toContain("O que ele está perguntando?");
    expect(prompt).not.toContain("Is this yours?");
    expect(prompt).not.toContain("Esse café é seu?");
    expect(prompt).not.toContain("Você quer um café?");
    const question = render(next(state));
    expect(question).toContain("Escolha o significado.");
    expect(question).toContain("Is this yours?");
    expect(question).toContain("Esse café é seu?");
    expect(question).toContain("Você quer um café?");
  });
  it("introduces the part-three intention before showing its choices", () => {
    let state = createDemo("beginner", "opening-render", 0);
    for (let step = 0; step < 4; step++) state = next(state);
    state = transition(state, { at: state.nodeId, type: "UNDERSTAND", correct: true });
    state = transition(state, { at: state.nodeId, type: "PREPARE" });
    for (const block of ["no", "negative", "mine"]) state = transition(state, { at: state.nodeId, type: "BLOCK", block });
    state = transition(state, { at: state.nodeId, type: "SUBMIT" });
    state = next(state);
    expect(state.nodeId).toBe("p3.prompt");
    expect(render(state)).toContain("Como você quer continuar a conversa?");
    expect(render(state)).not.toContain("Perguntar o que ele pediu");
    const choices = render(next(state));
    expect(choices).toContain("Perguntar o que ele pediu");
    expect(choices).toContain("Dizer que está tudo bem");
  });
});

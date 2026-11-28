// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { FirstDay } from "@/features/first-day/FirstDay";
import { getSequelSteps, sequelPages } from "@/features/first-day/sequel-content";
import { sequelWordBank } from "@/features/first-day/sequel-word-bank";

const play = vi.hoisted(() => vi.fn());
vi.mock("@/features/first-day/useFirstDayNarration", () => ({
  useFirstDayNarration: () => ({ play, stop: vi.fn(), playing: null }),
}));

let root: Root;
let container: HTMLElement;
const storage = "basedspeak:first-day:v1";
const door = "close-the-door";


beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  play.mockClear();
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  localStorage.removeItem(storage);
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it("reveals Ana's reply on a correct answer, plays both speakers, and restores independent replay", () => {
  localStorage.setItem(storage, JSON.stringify({
    pageId: door, sound: true, attempts: { [door]: { placed: [0, 1, 2, 3, 4] } },
  }));
  act(() => root.render(createElement(FirstDay)));
  expect(container.textContent).not.toContain("It’s noisy out there.");
  const forward = container.querySelector<HTMLButtonElement>(".fd1-challenge-next")!;
  expect(forward.disabled).toBe(true);
  const check = Array.from(container.querySelectorAll("button")).find(button => button.textContent?.includes("Conferir"));
  expect(check?.disabled).toBe(false);
  act(() => check!.click());
  expect(forward.disabled).toBe(false);
  expect(forward.querySelector(".fd1-challenge-next-unlock")).not.toBeNull();
  expect(play).toHaveBeenCalledExactlyOnceWith(["door-answer-pt", "ana-door-reply-pt"], 350);

  act(() => root.unmount());
  play.mockClear();
  root = createRoot(container);
  act(() => root.render(createElement(FirstDay)));
  expect(container.textContent).toContain("Can I close the door?");
  expect(container.textContent).not.toContain("Posso fechar a porta?");
  const ana = container.querySelector<HTMLButtonElement>("button[aria-label*='Claro! Está barulhento lá fora.']");
  expect(ana?.parentElement?.textContent).toContain("Sure! It’s noisy out there.");
  const word = Array.from(ana!.parentElement!.querySelectorAll("button")).find(button => button.textContent === "noisy")!;
  act(() => word.click());
  expect(container.querySelector(".fd-word-definition")?.textContent).toContain("barulhento");
  expect(play).not.toHaveBeenCalled();
  act(() => ana!.click());
  expect(play).toHaveBeenCalledExactlyOnceWith(["ana-door-reply-pt"], undefined);
  const readPortuguese = container.querySelector<HTMLButtonElement>('button[aria-label="Ler em português por 5 segundos"]')!;
  act(() => readPortuguese.click());
  expect(container.querySelector(".fd1-caption")?.textContent).toContain("A porta está aberta.");
  expect(container.textContent).toContain("Can I close the door?");
  expect(container.textContent).toContain("Sure! It’s noisy out there.");
  expect(play).toHaveBeenLastCalledWith(["door-instruction-pt"], undefined);
  act(() => ana!.click());
  expect(play).toHaveBeenLastCalledWith(["ana-door-reply-pt"], undefined);
});

it("translates only the English question for five seconds and leaves the answers in English", () => {
  vi.useFakeTimers();
  localStorage.setItem(storage, JSON.stringify({
    pageId: door, sound: false, attempts: { [door]: { placed: [0, 1, 2, 3, 4], result: "correct" } },
  }));
  act(() => root.render(createElement(FirstDay)));
  expect(container.textContent).toContain("Can I close the door?");
  expect(container.textContent).toContain("Sure! It’s noisy out there.");
  expect(container.textContent).not.toContain("Claro! Está barulhento lá fora.");
  const englishQuestion = "The door is open. Before you close it, ask Ana for permission.";
  const portugueseQuestion = "A porta está aberta. Antes de fechá-la, peça permissão à Ana.";
  const question = () => container.querySelector(".fd1-caption")?.textContent;
  expect(question()).toContain(englishQuestion);
  const readPortuguese = container.querySelector<HTMLButtonElement>('button[aria-label="Ler em português por 5 segundos"]')!;
  act(() => readPortuguese.click());
  expect(container.textContent).toContain("Sure! It’s noisy out there.");
  expect(container.textContent).not.toContain("Claro! Está barulhento lá fora.");
  expect(container.querySelector(".fd1-language-countdown")).not.toBeNull();
  expect(question()).toContain(portugueseQuestion);
  act(() => vi.advanceTimersByTime(4999));
  expect(question()).toContain(portugueseQuestion);
  act(() => vi.advanceTimersByTime(1));
  expect(question()).toContain(englishQuestion);
  expect(container.textContent).toContain("Sure! It’s noisy out there.");
  expect(container.querySelector(".fd1-language-countdown")).toBeNull();

  act(() => readPortuguese.click());
  act(() => root.unmount());
  root = createRoot(container);
  act(() => root.render(createElement(FirstDay)));
  expect(question()).toContain(englishQuestion);
  expect(container.textContent).toContain("Sure! It’s noisy out there.");
  expect(container.querySelector('button[aria-label="Ler em português por 5 segundos"]')).not.toBeNull();
  expect(play).not.toHaveBeenCalled();
});

it("keeps every multiple-choice answer in English throughout the Portuguese preview", () => {
  vi.useFakeTimers();
  localStorage.setItem(storage, JSON.stringify({ pageId: "meet-leo-v2-challenge", sound: false }));
  act(() => root.render(createElement(FirstDay)));
  const question = () => container.querySelector(".fd-sequel-exercise legend")?.textContent;
  const choices = () => [...container.querySelectorAll("[data-choice] button")].map(button => button.textContent);
  const englishOptions = ["I loved it!", "Nice to meet you.", "Do you like comics too?"];
  expect(question()).toBe("Ana has just introduced you. What do you say to Leo?");
  expect(choices()).toEqual(englishOptions);
  const readPortuguese = container.querySelector<HTMLButtonElement>('button[aria-label="Ler em português por 5 segundos"]')!;
  act(() => readPortuguese.click());
  expect(question()).toBe("Ana acabou de apresentar vocês. O que você diz ao Léo?");
  expect(choices()).toEqual(englishOptions);
  act(() => vi.advanceTimersByTime(5000));
  expect(question()).toBe("Ana has just introduced you. What do you say to Leo?");
  expect(choices()).toEqual(englishOptions);
});

it.each([
  ["permission-rule", "Peça permissão", "Ask for permission", "permission-rule"],
  ["the-comic-4", "Quem faz a ação?", "Who does what?", null],
  ["meet-leo-v2-explanation", "Quando alguém apresenta vocês", "When someone introduces you", null],
  ["borrow-comic-v2-explanation", "Como pedir algo emprestado", "How to ask to borrow something", null],
  ["see-you-tomorrow-v2-explanation", "Como combinar um encontro e se despedir", "How to make plans and say goodbye", null],
])("shows %s in Portuguese, previews English for five seconds and only offers existing recordings", (pageId, portuguese, english, clip) => {
  vi.useFakeTimers();
  localStorage.setItem(storage, JSON.stringify({ pageId, sound: true }));
  act(() => root.render(createElement(FirstDay)));

  const heading = () => container.querySelector("#fd-page-title")?.textContent;
  const introLanguage = () => container.querySelector(".fd1-rule-intro")?.getAttribute("lang");
  const listen = container.querySelector<HTMLButtonElement>("button.fd-narration-control");
  expect(heading()).toBe(portuguese);
  expect(introLanguage()).toBe("pt-BR");
  if (clip) {
    expect(listen?.getAttribute("aria-label")).toBe("Ouvir narração em português");
    act(() => listen!.click());
    expect(play).toHaveBeenCalledExactlyOnceWith([clip], undefined);
  } else {
    expect(listen).toBeNull();
  }

  const readEnglish = container.querySelector<HTMLButtonElement>('button[aria-label="Ler em inglês por 5 segundos"]')!;
  act(() => readEnglish.click());
  expect(heading()).toBe(english);
  expect(introLanguage()).toBe("en");
  expect(play).toHaveBeenCalledTimes(clip ? 1 : 0);
  expect(container.querySelector(".fd1-language-countdown")).not.toBeNull();

  act(() => vi.advanceTimersByTime(4999));
  expect(heading()).toBe(english);
  act(() => vi.advanceTimersByTime(1));
  expect(heading()).toBe(portuguese);
  expect(introLanguage()).toBe("pt-BR");
  expect(container.querySelector(".fd1-language-countdown")).toBeNull();
  expect(play).toHaveBeenCalledTimes(clip ? 1 : 0);
});

it.each([
  door,
  "the-comic-5",
  "meet-leo-v2-challenge",
  "borrow-comic-v2-challenge",
  "see-you-tomorrow-v2-challenge",
])("offers the delayed language cue and dismisses it after use on %s", pageId => {
  vi.useFakeTimers();
  localStorage.setItem(storage, JSON.stringify({ pageId, sound: false }));
  act(() => root.render(createElement(FirstDay)));

  const attention = () => container.querySelector("[data-fd-language-attention]");
  expect(container.querySelector("main[data-fd-challenge-theme]")?.getAttribute("data-first-day-page")).toBe(pageId);
  expect(container.querySelector<HTMLButtonElement>(".fd1-challenge-next")?.disabled).toBe(true);
  expect(container.querySelector(".fd1-challenge-next-film")?.textContent).toBe("Acerte o desafio");
  expect(attention()?.getAttribute("data-fd-language-attention")).toBe("challenge");
  const readPortuguese = attention()?.querySelector<HTMLButtonElement>("button");
  expect(readPortuguese?.textContent).toBe("Ler em PT");

  act(() => readPortuguese!.click());
  expect(attention()).toBeNull();
  expect(container.querySelector(".fd1-language-countdown")).not.toBeNull();
  act(() => vi.advanceTimersByTime(5000));
  expect(attention()).toBeNull();
  expect(readPortuguese?.textContent).toBe("Ler em PT");
});

it("dismisses the challenge cue even when the learner picks an incorrect answer", () => {
  localStorage.setItem(storage, JSON.stringify({ pageId: "meet-leo-v2-challenge", sound: false }));
  act(() => root.render(createElement(FirstDay)));
  expect(container.querySelector('[data-fd-language-attention="challenge"]')).not.toBeNull();

  const incorrectAnswer = container.querySelector<HTMLButtonElement>("[data-choice] button")!;
  act(() => incorrectAnswer.click());
  expect(container.textContent).toContain("Tente outra opção.");
  expect(container.querySelector("[data-fd-language-attention]")).toBeNull();
});

it("explains the locked Part 4 button and animates only a newly correct answer", () => {
  localStorage.setItem(storage, JSON.stringify({ pageId: "meet-leo-v2-challenge", sound: false }));
  act(() => root.render(createElement(FirstDay)));

  const forward = () => container.querySelector<HTMLButtonElement>('button[aria-label="Ir para a Parte 4"]')!;
  const film = () => forward().querySelector(".fd1-challenge-next-film");
  const choices = container.querySelectorAll<HTMLButtonElement>("[data-choice] button");
  expect(forward().disabled).toBe(true);
  expect(forward().querySelector(`#${forward().getAttribute("aria-describedby")}`)?.textContent).toBe("Acerte o desafio");
  expect(film()?.querySelector(".lucide-lock")).not.toBeNull();
  expect(forward().querySelector(".fd1-challenge-next-copy")?.textContent).toBe("Ir para a Parte 4");

  act(() => choices[0].click());
  expect(forward().disabled).toBe(true);
  expect(forward().querySelector("[data-fd-unlocking]")).toBeNull();

  act(() => choices[1].click());
  expect(forward().disabled).toBe(false);
  expect(forward().hasAttribute("aria-describedby")).toBe(false);
  expect(film()?.querySelector(".fd1-challenge-next-unlock")).not.toBeNull();

  act(() => root.unmount());
  root = createRoot(container);
  act(() => root.render(createElement(FirstDay)));
  expect(forward().disabled).toBe(false);
  expect(film()).toBeNull();
});

it("opens the film on the completed request in Part 2", () => {
  localStorage.setItem(storage, JSON.stringify({
    pageId: "the-comic-5", sound: false, partTwoRequestVersion: 3, attempts: { "the-comic-5": { round: 0, placed: [0, 1] } },
  }));
  act(() => root.render(createElement(FirstDay)));

  const forward = container.querySelector<HTMLButtonElement>(".fd1-challenge-next")!;
  const check = [...container.querySelectorAll<HTMLButtonElement>(".fd1-check-actions button")]
    .find(button => button.textContent === "Conferir")!;
  expect(forward.disabled).toBe(true);
  act(() => check.click());
  expect(forward.disabled).toBe(false);
  expect(forward.querySelector(".fd1-challenge-next-unlock")).not.toBeNull();
});

it.each([[1, false], [2, true]])("unlocks Part 5 only after the last question on the current panel (step %s)", (completed, ready) => {
  const pageId = "see-you-tomorrow-v2-challenge";
  const page = sequelPages.find(item => item.id === pageId)!;
  const { exercise } = getSequelSteps(page)[completed];
  const { order: placed } = sequelWordBank(exercise.bank.en, exercise.solution.en);
  localStorage.setItem(storage, JSON.stringify({
    pageId, sound: false, sequelActivityVersion: 2, counts: { [pageId]: completed }, attempts: { [pageId]: { placed, language: "en" } },
  }));
  act(() => root.render(createElement(FirstDay)));

  const forward = container.querySelector<HTMLButtonElement>(".fd1-challenge-next")!;
  const check = [...container.querySelectorAll<HTMLButtonElement>(".fd1-check-actions button")]
    .find(button => button.textContent === "Conferir")!;
  expect(forward.disabled).toBe(true);
  act(() => check.click());
  expect(forward.disabled).toBe(!ready);
  expect(Boolean(forward.querySelector(".fd1-challenge-next-unlock"))).toBe(ready);
});

it("dismisses the reading cue when the learner places a word in the balloon", () => {
  localStorage.setItem(storage, JSON.stringify({ pageId: "ask-to-sit", sound: false }));
  act(() => root.render(createElement(FirstDay)));
  expect(container.querySelector('[data-fd-language-attention="reading"]')).not.toBeNull();

  const word = container.querySelector<HTMLButtonElement>('[data-lesson-drag-source="word-0"]')!;
  const balloon = container.querySelector('[data-lesson-drop="first-day-bubble"]')!;
  act(() => word.click());
  act(() => balloon.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
  expect(balloon.textContent).toContain("Oi!");
  expect(container.querySelector("[data-fd-language-attention]")).toBeNull();
});

it("keeps the borrowing hints while the learner assembles, undoes and confirms the new request", () => {
  localStorage.setItem(storage, JSON.stringify({ pageId: "borrow-comic-v2-challenge", sound: false }));
  act(() => root.render(createElement(FirstDay)));

  const hints = () => [...container.querySelectorAll(".fd-sequel-prefilled")].map(word => word.textContent);
  const button = (label: string) => [...container.querySelectorAll<HTMLButtonElement>("button")]
    .find(item => (item.getAttribute("aria-label") ?? item.textContent) === label)!;
  function place(word: string) {
    act(() => button(word).click());
    const balloon = container.querySelector('[data-lesson-drop="first-day-sequel-balloon"]')!;
    act(() => balloon.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
  }

  expect(hints()).toEqual(["Would", "your"]);
  expect(container.querySelectorAll("[data-lesson-drag-source]")).toHaveLength(6);
  expect(button("Desfazer").disabled).toBe(true);
  place("you");
  expect(container.querySelector(".fd1-translation")?.textContent).toBe("Você…");
  act(() => button("Desfazer").click());
  expect(hints()).toEqual(["Would", "your"]);
  expect(button("Desfazer").disabled).toBe(true);

  for (const word of ["you", "lend", "me", "comic", "today,", "Leo?"]) place(word);
  expect(container.querySelector(".fd1-translation")?.textContent).toBe("Você me emprestaria seu gibi hoje, Léo?");
  expect(button("Ir para a Parte 5").disabled).toBe(true);
  act(() => button("Conferir").click());
  expect(button("Ir para a Parte 5").disabled).toBe(false);
});

it("shows the ending in Portuguese and records completion before returning to the catalog", () => {
  const pageId = "see-you-tomorrow-v2-challenge";
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("prefers-reduced-motion"), addEventListener() {}, removeEventListener() {} }));
  localStorage.setItem(storage, JSON.stringify({
    pageId, sound: false, sequelActivityVersion: 2, counts: { [pageId]: 4 }, frames: { [pageId]: 2 },
  }));
  act(() => root.render(createElement(FirstDay)));
  Object.assign(container.querySelector("dialog.fd-menu")!, { close: vi.fn() });
  const finish = [...container.querySelectorAll("button")].find(button => button.textContent === "Concluir aula")!;
  act(() => finish.click());

  const ending = container.querySelector("#fd-chapter-title");
  expect(ending?.textContent).toBe("Aula concluída!");
  expect(ending?.getAttribute("lang")).toBe("pt-BR");
  expect(container.querySelector(".fd-ending-exit")?.getAttribute("href")).toBe("/");
  expect(JSON.parse(localStorage.getItem(storage)!)).toMatchObject({ lessonFinished: true, demoCompleted: true });
});

it("opens a catalog review on the cover and keeps the completed demo", () => {
  const pageId = "see-you-tomorrow-v2-challenge";
  const counts = { "ask-to-sit": 5, [pageId]: 4 };
  localStorage.setItem(storage, JSON.stringify({ pageId, sound: false, sequelActivityVersion: 2, counts, lessonFinished: true }));
  const previousUrl = window.location.href;
  window.history.replaceState({ preview: true }, "", "/first-day?rever=1&local=1");
  try {
    act(() => root.render(createElement(FirstDay)));
    expect(container.querySelector("main")?.getAttribute("data-first-day-page")).toBe("cover");
    expect(window.location.search).toBe("?local=1");
    expect(window.history.state).toEqual({ preview: true });
    const saved = JSON.parse(localStorage.getItem(storage)!);
    expect(saved).toMatchObject({ pageId: null, demoCompleted: true, counts });
    expect(saved.lessonFinished).toBeUndefined();
  } finally {
    window.history.replaceState(null, "", previousUrl);
  }
});

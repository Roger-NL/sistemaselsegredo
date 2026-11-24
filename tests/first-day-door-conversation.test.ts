// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { FirstDay } from "@/features/first-day/FirstDay";

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
});

it("reveals Ana's reply on a correct answer, plays both speakers, and restores independent replay", () => {
  localStorage.setItem(storage, JSON.stringify({
    pageId: door, sound: true, attempts: { [door]: { placed: [0, 1, 2, 3, 4] } },
  }));
  act(() => root.render(createElement(FirstDay)));
  expect(container.textContent).not.toContain("It’s noisy out there.");
  const check = Array.from(container.querySelectorAll("button")).find(button => button.textContent?.includes("Conferir"));
  expect(check?.disabled).toBe(false);
  act(() => check!.click());
  expect(play).toHaveBeenCalledExactlyOnceWith(["door-answer-pt", "ana-door-reply-pt"], 350);

  act(() => root.unmount());
  play.mockClear();
  root = createRoot(container);
  act(() => root.render(createElement(FirstDay)));
  expect(container.textContent).toContain("Can I close the door?");
  expect(container.textContent).not.toContain("Posso fechar a porta?");
  const ana = container.querySelector<HTMLButtonElement>("button[aria-label*='Claro! Está barulhento lá fora.']");
  expect(ana?.textContent).toContain("Sure! It’s noisy out there.");
  expect(play).not.toHaveBeenCalled();
  act(() => ana!.click());
  expect(play).toHaveBeenCalledExactlyOnceWith(["ana-door-reply-pt"], undefined);
  const invert = Array.from(container.querySelectorAll("button")).find(button => button.textContent === "Inverter")!;
  act(() => invert.click());
  expect(container.textContent).toContain("Posso fechar a porta?");
  expect(container.textContent).toContain("Claro! Está barulhento lá fora.");
  act(() => ana!.click());
  expect(play).toHaveBeenLastCalledWith(["ana-door-reply"], undefined);
});

it("keeps the conversation readable on a silent return visit", () => {
  localStorage.setItem(storage, JSON.stringify({
    pageId: door, sound: false, attempts: { [door]: { placed: [0, 1, 2, 3, 4], result: "correct" } },
  }));
  act(() => root.render(createElement(FirstDay)));
  expect(container.textContent).toContain("Can I close the door?");
  expect(container.textContent).toContain("Sure! It’s noisy out there.");
  expect(container.textContent).not.toContain("Claro! Está barulhento lá fora.");
  const invert = Array.from(container.querySelectorAll("button")).find(button => button.textContent === "Inverter")!;
  act(() => invert.click());
  expect(container.textContent).toContain("Claro! Está barulhento lá fora.");
  expect(container.querySelector("button[aria-label*='Sure!']")).toBeNull();
  expect(play).not.toHaveBeenCalled();
});

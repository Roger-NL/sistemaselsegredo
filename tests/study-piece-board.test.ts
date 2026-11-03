// @vitest-environment jsdom
import { act, createElement, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudyPieceBoard, type StudyPieceBoardProps } from "@/features/theory/StudyPieceBoard";

const mocks = vi.hoisted(() => ({ change: vi.fn(), sound: vi.fn(), submit: vi.fn() }));
vi.mock("@/components/interaction/sounds", () => ({ playInteractionSound: mocks.sound }));
let root: Root, container: HTMLElement;
let hit: ReturnType<typeof vi.fn>, capture: ReturnType<typeof vi.fn>, release: ReturnType<typeof vi.fn>;
const originalCapture = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "setPointerCapture");
const originalRelease = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "releasePointerCapture");
type HarnessProps = Partial<Omit<StudyPieceBoardProps, "selected" | "onChange">> & { initial?: number[] };
function Harness({ initial = [], tokens = ["I", "like", "it."], slots = 3, locked = false, mode, cue }: HarnessProps) {
  const [selected, setSelected] = useState(initial);
  return createElement("form", { onSubmit: event => { event.preventDefault(); mocks.submit(); } }, createElement(StudyPieceBoard, {
    tokens, selected, slots, locked, mode, cue,
    onChange: next => { mocks.change(next); setSelected(next); },
  }));
}
async function mount(props: HarnessProps = {}) { await act(async () => root.render(createElement(Harness, props))); }
const byLabel = (label: string) => [...container.querySelectorAll<HTMLButtonElement>("button")].find(button => button.getAttribute("aria-label") === label)!;
const bankPiece = (token: string) => byLabel(`Usar ${token}`);
const placedPiece = (token: string) => byLabel(`Devolver ${token} ao banco`);
const slot = (index: number) => container.querySelector<HTMLElement>(`[data-study-drop-slot="${index}"]`)!;
const bank = () => container.querySelector<HTMLElement>("[data-study-piece-bank]")!;
function pointer(type: string, target: EventTarget, x: number, y: number, pointerId = 1) {
  // jsdom lacks native pointer hit testing/capture. The event order and target
  // resolution are controlled here; browser checks cover real device geometry.
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 });
  Object.defineProperties(event, { pointerId: { value: pointerId }, pointerType: { value: "touch" }, isPrimary: { value: true } });
  target.dispatchEvent(event);
  return event;
}
async function point(type: string, target: EventTarget, x: number, y: number, pointerId = 1) {
  let event!: MouseEvent;
  await act(async () => { event = pointer(type, target, x, y, pointerId); });
  return event;
}
async function drag(button: HTMLButtonElement, destination: Element | null) {
  hit.mockReturnValue(destination);
  await point("pointerdown", button, 10, 10);
  await point("pointermove", document, 40, 40);
  await point("pointerup", document, 40, 40);
}
beforeEach(() => {
  vi.clearAllMocks(); vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  document.body.innerHTML = '<div id="root"></div>';
  container = document.getElementById("root")!; root = createRoot(container);
  hit = vi.fn(); capture = vi.fn(); release = vi.fn();
  Object.defineProperty(document, "elementFromPoint", { configurable: true, value: hit });
  Object.defineProperty(HTMLElement.prototype, "setPointerCapture", { configurable: true, value: capture });
  Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", { configurable: true, value: release });
});
afterEach(async () => {
  await act(async () => root.unmount());
  Reflect.deleteProperty(document, "elementFromPoint");
  if (originalCapture) Object.defineProperty(HTMLElement.prototype, "setPointerCapture", originalCapture); else Reflect.deleteProperty(HTMLElement.prototype, "setPointerCapture");
  if (originalRelease) Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", originalRelease); else Reflect.deleteProperty(HTMLElement.prototype, "releasePointerCapture");
  vi.unstubAllGlobals();
});

describe("study piece placement without grading or auto-submit", () => {
  it("places taps in the next slot, respects capacity, and makes returning a placed piece explicit", async () => {
    await mount({ slots: 2 });
    expect(container.querySelectorAll(".study-piece-instruction")).toHaveLength(1);
    expect(container.querySelector(".study-piece-instruction strong")?.textContent).toBe("Arraste as palavras");
    expect(container.querySelector(".study-piece-instruction > span")?.textContent).toBe("ou toque");
    expect(slot(0).dataset.next).toBe("true");
    await act(async () => bankPiece("I").click());
    expect(mocks.change).toHaveBeenLastCalledWith([0]);
    expect(bankPiece("I").hidden).toBe(true);
    expect(bankPiece("I").disabled).toBe(true);
    expect(slot(1).dataset.next).toBe("true");
    expect(container.querySelector('[role="status"]')?.textContent).toContain("1 de 2");
    expect(container.querySelector(".study-piece-answer-meta [aria-hidden]")?.textContent).toBe("1/2");
    await act(async () => bankPiece("like").click());
    expect(mocks.change).toHaveBeenLastCalledWith([0, 1]);
    expect(bankPiece("it.").disabled).toBe(true);
    await act(async () => bankPiece("it.").click());
    expect(mocks.change).toHaveBeenCalledTimes(2);
    await act(async () => placedPiece("I").click());
    expect(mocks.change).toHaveBeenLastCalledWith([1]);
    expect(bankPiece("I").hidden).toBe(false);
    expect(bankPiece("I").disabled).toBe(false);
    expect(slot(0).querySelector("button")?.textContent).toContain("like");
    expect(slot(1).dataset.next).toBe("true");
    expect(mocks.submit).not.toHaveBeenCalled();
    expect([...container.querySelectorAll("button")].every(button => button.type === "button")).toBe(true);
    expect(mocks.sound).toHaveBeenCalledTimes(3);
  });

  it("moves keyboard focus between the visible bank and placed piece without submitting", async () => {
    await mount();
    bankPiece("I").focus();
    await act(async () => bankPiece("I").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })));
    expect(mocks.change).toHaveBeenLastCalledWith([0]);
    expect(document.activeElement).toBe(placedPiece("I"));
    expect(document.activeElement?.getAttribute("data-piece-token")).toBe("0");
    expect(bankPiece("I").hidden).toBe(true);
    bankPiece("like").focus();
    await act(async () => bankPiece("like").dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true })));
    expect(mocks.change).toHaveBeenLastCalledWith([0, 1]);
    expect(document.activeElement).toBe(placedPiece("like"));
    placedPiece("I").focus();
    await act(async () => placedPiece("I").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })));
    expect(mocks.change).toHaveBeenLastCalledWith([1]);
    expect(document.activeElement).toBe(bankPiece("I"));
    expect(bankPiece("I").hidden).toBe(false);
    expect(bankPiece("I").disabled).toBe(false);
    expect(mocks.submit).not.toHaveBeenCalled();
    // Preventing the native keyboard default must not discard a later virtual
    // click from assistive technology merely because no pointerdown occurred.
    await act(async () => bankPiece("I").click());
    expect(mocks.change).toHaveBeenLastCalledWith([1, 0]);
  });

  it("keeps a small pointer movement a normal tap and only starts drag after the threshold", async () => {
    await mount();
    const tile = bankPiece("I");
    await point("pointerdown", tile, 10, 10);
    const move = await point("pointermove", document, 14, 13);
    expect(move.defaultPrevented).toBe(false);
    expect(capture).not.toHaveBeenCalled();
    expect(document.querySelector(".study-piece-ghost")).toBeNull();
    const up = await point("pointerup", document, 14, 13);
    expect(up.defaultPrevented).toBe(false);
    expect(mocks.change).not.toHaveBeenCalled();
    await act(async () => tile.click());
    expect(mocks.change).toHaveBeenCalledExactlyOnceWith([0]);
  });

  it("drags with a ghost and destination highlight, and appends to a later empty slot without creating holes", async () => {
    await mount();
    hit.mockReturnValue(slot(2));
    const tile = bankPiece("I");
    await point("pointerdown", tile, 10, 10);
    expect(capture).not.toHaveBeenCalled();
    const move = await point("pointermove", document, 40, 40);
    expect(move.defaultPrevented).toBe(true);
    expect(capture).toHaveBeenCalledExactlyOnceWith(1);
    expect(document.querySelector(".study-piece-ghost")?.textContent).toBe("I");
    expect(slot(2).dataset.dragOver).toBe("true");
    expect(mocks.change).not.toHaveBeenCalled();
    await point("pointerup", document, 40, 40);
    expect(mocks.change).toHaveBeenCalledExactlyOnceWith([0]);
    expect(slot(0).querySelector("button")?.textContent).toContain("I");
    expect(slot(1).querySelector("button")).toBeNull();
    expect(document.querySelector(".study-piece-ghost")).toBeNull();
    expect(release).toHaveBeenCalledWith(1);
    expect(mocks.sound).toHaveBeenCalledExactlyOnceWith("click");
    expect(mocks.submit).not.toHaveBeenCalled();
  });

  it("reorders a placed token and suppresses the following synthetic click instead of removing another piece", async () => {
    await mount({ initial: [0, 1, 2] });
    const originalNode = placedPiece("I");
    await drag(originalNode, slot(2));
    expect(mocks.change).toHaveBeenCalledExactlyOnceWith([1, 2, 0]);
    await act(async () => originalNode.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 })));
    expect(mocks.change).toHaveBeenCalledTimes(1);
    await drag(placedPiece("I"), bank());
    expect(mocks.change).toHaveBeenLastCalledWith([1, 2]);
    expect(mocks.change).toHaveBeenCalledTimes(2);
    expect(mocks.sound).toHaveBeenCalledTimes(2);
  });

  it("inserts a bank piece at an occupied position while space remains", async () => {
    await mount({ initial: [0, 2] });
    await drag(bankPiece("like"), slot(1));
    expect(mocks.change).toHaveBeenCalledExactlyOnceWith([0, 1, 2]);
    expect(container.querySelector('[role="status"]')?.textContent).toContain("3 de 3");
  });

  it("also supports a gesture when pointer capture is unavailable", async () => {
    Object.defineProperty(HTMLElement.prototype, "setPointerCapture", { configurable: true, value: undefined });
    Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", { configurable: true, value: undefined });
    await mount();
    await drag(bankPiece("like"), slot(0));
    expect(mocks.change).toHaveBeenCalledExactlyOnceWith([1]);
  });

  for (const reason of ["outside", "pointercancel", "Escape"]) it(`cancels on ${reason}, preserving the answer and allowing the next tap`, async () => {
    await mount({ initial: [0] });
    const tile = bankPiece("like");
    hit.mockReturnValue(slot(1));
    await point("pointerdown", tile, 10, 10);
    await point("pointermove", document, 40, 40);
    expect(document.querySelector(".study-piece-ghost")).not.toBeNull();
    if (reason === "outside") { hit.mockReturnValue(null); await point("pointerup", document, 40, 40); }
    else if (reason === "pointercancel") await point("pointercancel", document, 40, 40);
    else await act(async () => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    await point("pointerup", document, 40, 40);
    expect(document.querySelector(".study-piece-ghost")).toBeNull();
    expect(mocks.change).not.toHaveBeenCalled();
    expect(placedPiece("I")).toBeDefined();
    expect(mocks.sound).not.toHaveBeenCalled();
    await act(async () => tile.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 })));
    expect(mocks.change).not.toHaveBeenCalled();
    await point("pointerdown", tile, 10, 10);
    await point("pointerup", document, 10, 10);
    await act(async () => tile.click());
    expect(mocks.change).toHaveBeenCalledExactlyOnceWith([0, 1]);
  });

  it("leaves all controls inactive when locked, including a lock arriving during a gesture", async () => {
    await mount({ locked: true, initial: [0] });
    expect([...container.querySelectorAll<HTMLButtonElement>("button")].every(button => button.disabled)).toBe(true);
    expect(bank().hidden).toBe(true);
    expect(container.textContent).not.toContain("Arraste para mudar a ordem");
    expect(container.querySelector('[role="status"]')?.textContent).toBe("Frase pronta. Continue no botão abaixo.");
    await act(async () => placedPiece("I").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })));
    await drag(bankPiece("like"), slot(1));
    expect(mocks.change).not.toHaveBeenCalled(); expect(mocks.sound).not.toHaveBeenCalled();
    await mount({ locked: false });
    hit.mockReturnValue(slot(1));
    await point("pointerdown", bankPiece("like"), 10, 10);
    await point("pointermove", document, 40, 40);
    await mount({ locked: true });
    expect(document.querySelector(".study-piece-ghost")).toBeNull();
    await point("pointerup", document, 40, 40);
    expect(mocks.change).not.toHaveBeenCalled(); expect(mocks.sound).not.toHaveBeenCalled();
  });
});

describe("contextual reply board", () => {
  it("shows the cue and lets another tap or drop replace the one chosen reply", async () => {
    const replies = ["Sorry!", "It's okay.", "Thanks!"];
    await mount({ tokens: replies, slots: 1, mode: "reply", cue: "A pessoa já se desculpou. Você quer tranquilizá-la." });
    expect(container.textContent).toContain("A pessoa já se desculpou.");
    expect(container.querySelector('[aria-label="Sua fala"]')).not.toBeNull();
    expect(container.querySelectorAll("[data-study-drop-slot]")).toHaveLength(1);
    await act(async () => bankPiece("Sorry!").click());
    expect(mocks.change).toHaveBeenLastCalledWith([0]);
    expect(bankPiece("Sorry!").hidden).toBe(true);
    await act(async () => bankPiece("It's okay.").click());
    expect(mocks.change).toHaveBeenLastCalledWith([1]);
    expect(bankPiece("Sorry!").hidden).toBe(false);
    expect(bankPiece("It's okay.").hidden).toBe(true);
    await drag(bankPiece("Thanks!"), slot(0));
    expect(mocks.change).toHaveBeenLastCalledWith([2]);
    expect(container.querySelectorAll(".study-piece-placed")).toHaveLength(1);
    await drag(placedPiece("Thanks!"), bank());
    expect(mocks.change).toHaveBeenLastCalledWith([]);
    expect(mocks.submit).not.toHaveBeenCalled();
    expect(mocks.sound).toHaveBeenCalledTimes(4);
  });

  it("keeps focus on a keyboard-selected replacement reply and returns it to the bank", async () => {
    await mount({ tokens: ["Really?", "Me too."], slots: 1, mode: "reply", cue: "Lucas: “I like it.”" });
    expect(container.querySelector(".study-piece-speaker")?.textContent).toBe("Lucas");
    expect(container.querySelector(".study-piece-cue [lang=en]")?.textContent).toBe("I like it.");
    expect(container.querySelector(".study-piece-instruction strong")?.textContent).toBe("Arraste a resposta");
    for (const [token, key] of [["Really?", "Enter"], ["Me too.", " "]]) {
      bankPiece(token).focus();
      await act(async () => bankPiece(token).dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })));
      expect(document.activeElement).toBe(placedPiece(token));
      expect(bankPiece(token).hidden).toBe(true);
    }
    expect(bankPiece("Really?").hidden).toBe(false);
    expect(bankPiece("Really?").disabled).toBe(false);
    await act(async () => placedPiece("Me too.").dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true })));
    expect(document.activeElement).toBe(bankPiece("Me too."));
    expect(bankPiece("Me too.").hidden).toBe(false);
    expect(mocks.change.mock.calls.map(([answer]) => answer)).toEqual([[0], [1], []]);
    expect(mocks.submit).not.toHaveBeenCalled();
  });
});

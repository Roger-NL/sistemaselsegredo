// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { SiteViewport } from "@/components/core/SiteViewport";
import { useLessonViewport } from "@/features/first-encounters/useLessonViewport";

function WritingSurface() {
  useLessonViewport();
  return createElement("div", { className: "lo-app", "data-lesson-theme": "comic" },
    createElement(SiteViewport), createElement("input"));
}

it("keeps Safari's pan when both viewports shrink and leaves the writing field in place", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("innerWidth", 390);
  vi.stubGlobal("innerHeight", 699);
  const viewport = Object.assign(new EventTarget(), { width: 390, height: 699, offsetTop: 0, offsetLeft: 0, scale: 1 });
  vi.stubGlobal("visualViewport", viewport);
  const container = document.createElement("div");
  document.body.append(container);
  const app = createRoot(container);
  try {
    await act(async () => app.render(createElement(WritingSurface)));
    const field = container.querySelector("input")!;
    const scroll = vi.fn();
    field.scrollIntoView = scroll;
    field.focus();

    // Observed on iOS Safari: the visual and layout heights are identical, yet
    // a fixed dialog still needs the full 274px pan to stay above the keyboard.
    vi.stubGlobal("innerHeight", 425);
    Object.assign(viewport, { height: 425, offsetTop: 274 });
    viewport.dispatchEvent(new Event("resize"));
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    expect(document.documentElement.dataset.keyboardOpen).toBe("true");
    expect(document.documentElement.style.getPropertyValue("--lesson-keyboard-top")).toBe("274px");
    expect(scroll).not.toHaveBeenCalled();
    field.blur();
    viewport.offsetTop = 150;
    viewport.dispatchEvent(new Event("scroll"));
    expect(document.documentElement.dataset.keyboardOpen).toBe("true");
    expect(document.documentElement.style.getPropertyValue("--lesson-keyboard-top")).toBe("150px");

    vi.stubGlobal("innerHeight", 699);
    Object.assign(viewport, { height: 699, offsetTop: 0 });
    viewport.dispatchEvent(new Event("resize"));
    expect(document.documentElement.dataset.keyboardOpen).toBe("false");
  } finally {
    await act(async () => app.unmount());
    container.remove();
    vi.unstubAllGlobals();
  }
});

// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConversationPreview } from "@/features/landing/ConversationPreview";

let container: HTMLElement, root: Root;
beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div"); document.body.appendChild(container); root = createRoot(container);
  await act(async () => root.render(createElement(ConversationPreview)));
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); });

async function click(label: string) {
  const button = [...container.querySelectorAll<HTMLButtonElement>("button")].find(item => item.getAttribute("aria-label") === label || item.textContent === label);
  expect(button, label).toBeDefined();
  await act(async () => button!.click());
}

describe("landing decorations independent of system emoji fonts", () => {
  it("draws the desktop star and direction marks without font-rendered symbols", () => {
    for (const selector of [".language-star", ".language-sticker", ".language-stage-top"]) {
      const decoration = container.querySelector(selector)!;
      const svg = decoration.querySelector("svg")!;
      expect(svg, selector).not.toBeNull();
      expect(svg.getAttribute("stroke")).toBe("currentColor");
      expect(svg.getAttribute("fill")).toBe("none");
      expect(svg.getAttribute("aria-hidden")).toBe("true");
      expect(svg.querySelector("text")).toBeNull();
      expect(decoration.textContent).not.toMatch(/[✳↗↘\uFE0F]/u);
    }
    expect(container.querySelector(".language-sticker")?.textContent).toBe("YOURTURN ");
  });

  it("retains voluntary motion control, sentence assembly and restart with vector decorations", async () => {
    await click("Pausar animações");
    expect(container.querySelector(".language-stage")?.getAttribute("data-motion")).toBe("off");
    await click("Retomar animações");
    expect(container.querySelector(".language-stage")?.getAttribute("data-motion")).toBe("on");
    await click("I’m"); await click("learning"); await click("English.");
    expect(container.querySelector(".language-answer")?.textContent).toBe("I’m learning English.");
    expect(container.querySelector(".language-stage")?.classList.contains("is-complete")).toBe(true);
    await click("Recomeçar a amostra");
    expect(container.querySelector(".language-stage")?.classList.contains("is-complete")).toBe(false);
    expect(container.querySelector(".language-star svg")).not.toBeNull();
    expect(container.querySelectorAll(".language-word-bank button:disabled")).toHaveLength(0);
  });
});

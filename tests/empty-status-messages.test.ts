// @vitest-environment jsdom
import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BrowserText } from "@/components/i18n/BrowserText";
let root: Root, container: HTMLDivElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  window.matchMedia = vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })) as unknown as typeof window.matchMedia;
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); });

async function message(value: ReactNode) {
  await act(async () => root.render(createElement("p", { role: "status", className: "notice" }, createElement(BrowserText, null, value))));
  return container.querySelector("p")!;
}
function translate(boundary: Element) {
  const font = document.createElement("font"), nested = document.createElement("font");
  nested.textContent = boundary.textContent; font.append(nested); boundary.replaceChildren(font);
}
describe("empty status text boundaries", () => {
  it("leaves an empty message without a span or text node, and preserves zero", async () => {
    for (const value of ["", null, undefined, false]) {
      const status = await message(value);
      expect(status.matches(":empty")).toBe(true);
      expect(status.childNodes).toHaveLength(0);
    }
    expect((await message(0)).textContent).toBe("0");
    expect(container.querySelector("[data-ui-text]")).not.toBeNull();
  });

  it("preserves deliberate inline whitespace and the original real-message text", async () => {
    expect((await message(" ")).textContent).toBe(" ");
    const status = await message("  Confira sua resposta.  ");
    expect(status.textContent).toBe("  Confira sua resposta.  ");
    expect(status.matches(":empty")).toBe(false);
  });

  it("handles empty, translated message, new message and empty without stale text or DOM errors", async () => {
    expect((await message("")).matches(":empty")).toBe(true);
    await message("Confira sua resposta.");
    const old = container.querySelector("[data-ui-text]")!;
    translate(old);
    expect((await message("Tente novamente.")).textContent).toBe("Tente novamente.");
    expect(old.isConnected).toBe(false);
    old.textContent = "Delayed old translation";
    const current = container.querySelector("[data-ui-text]")!;
    translate(current);
    const cleared = await message("");
    expect(cleared.matches(":empty")).toBe(true);
    expect(current.isConnected).toBe(false);
    current.textContent = "Delayed current translation";
    expect(cleared.childNodes).toHaveLength(0);
  });
});

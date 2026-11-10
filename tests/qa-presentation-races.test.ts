// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/superuser/TestControls", () => ({ TestControls: () => null }));
import { PresentationGate } from "@/features/onboarding/PresentationGate";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}

function status(uid: string, completed: boolean) {
  return new Response(JSON.stringify({ uid, completed, revision: 0 }), {
    status: 200, headers: { "Content-Type": "application/json" },
  });
}

let root: Root;
let container: HTMLElement;
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  window.scrollTo = vi.fn();
  window.matchMedia = vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })) as unknown as typeof window.matchMedia;
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  document.body.innerHTML = '<div id="root"></div>';
  container = document.getElementById("root")!;
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  vi.unstubAllGlobals();
});

async function mount() {
  // PresentationGate receives a render function as its children prop.
  // eslint-disable-next-line react/no-children-prop
  await act(async () => root.render(createElement(PresentationGate, {
    children: () => createElement("h1", null, "Painel da conta"),
  })));
}

async function clickButton(label: string) {
  const button = [...container.querySelectorAll<HTMLButtonElement>("button")].find(item => item.textContent?.trim() === label);
  expect(button, label).toBeDefined();
  expect(button!.disabled).toBe(false);
  await act(async () => button!.click());
}

describe("presentation access while requests finish out of order", () => {
  it("keeps the current dashboard when an older status request returns 401 late", async () => {
    const old = deferred<Response>();
    const recent = deferred<Response>();
    fetchMock.mockReturnValueOnce(old.promise).mockReturnValueOnce(recent.promise);
    await mount();
    await act(async () => window.dispatchEvent(new Event("basedspeak.presentation.changed")));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await act(async () => recent.resolve(status("student-a", true)));
    expect(container.textContent).toContain("Painel da conta");
    await act(async () => old.resolve(new Response(null, { status: 401 })));
    expect(container.textContent).toContain("Painel da conta");
    expect(container.textContent).not.toContain("Sua sessão mudou");
  });

  it.each([401, 409])("keeps a fresh confirmed presentation when an older completion returns %i late", async code => {
    const oldSave = deferred<Response>();
    const recent = deferred<Response>();
    fetchMock.mockResolvedValueOnce(status("student-a", false)).mockReturnValueOnce(oldSave.promise).mockReturnValueOnce(recent.promise);
    await mount();
    for (let i = 0; i < 8; i++) await clickButton("Continuar");
    await clickButton("Abrir meu painel");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await act(async () => window.dispatchEvent(new Event("basedspeak.presentation.changed")));
    await act(async () => recent.resolve(status("student-a", true)));
    expect(container.textContent).toContain("Painel da conta");
    await act(async () => oldSave.resolve(new Response(null, { status: code })));
    expect(container.textContent).toContain("Painel da conta");
    expect(container.textContent).not.toContain("Sua sessão mudou");
  });

  it("still requires sign-in when the current status request returns 401", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));
    await mount();
    expect(container.textContent).toContain("Sua sessão mudou");
    expect(container.textContent).not.toContain("Painel da conta");
    expect(container.querySelector('a[href="/comecar?modo=entrar"]')).not.toBeNull();
  });

  it.each([401, 409])("requires sign-in when the current completion returns %i", async code => {
    fetchMock.mockResolvedValueOnce(status("student-a", false)).mockResolvedValueOnce(new Response(null, { status: code }));
    await mount();
    for (let i = 0; i < 8; i++) await clickButton("Continuar");
    await clickButton("Abrir meu painel");
    expect(container.textContent).toContain("Sua sessão mudou");
    expect(container.textContent).not.toContain("Painel da conta");
    expect(container.querySelector('a[href="/comecar?modo=entrar"]')).not.toBeNull();
  });
});

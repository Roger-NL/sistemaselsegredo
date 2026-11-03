// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DemoState } from "@/features/demo/model/types";

const mocks = vi.hoisted(() => ({ snapshot: null as { status: "ok"; state: DemoState } | null, restart: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/features/demo/session/browser", () => ({ subscribe: () => () => {}, getBrowserSnapshot: () => mocks.snapshot, getServerSnapshot: () => mocks.snapshot, remember: () => true, restart: mocks.restart }));
vi.mock("@/features/dashboard/use-student-workspace", () => ({ useStudentWorkspace: () => ({ status: "ready", generation: 7, workspace: { account: { id: "local-admin", name: "ADM", role: "manager", status: "active" }, learning: { demoSnapshot: null, studySnapshot: null, studyCompleted: 0, studyTotal: 24 }, liveClass: null }, guestLearning: null, saving: false, notice: "", error: "", refresh: vi.fn() }) }));
vi.mock("@/features/superuser/TestControls", () => ({ TestControls: () => null }));
vi.mock("@/features/local-testing/LocalTestLauncher", () => ({ LocalTestStatus: () => null, LocalTestLauncher: () => null }));
import { DemoHost } from "@/features/demo/DemoHost";
import { createDemo } from "@/features/demo/model/reducer";

let root: Root, container: HTMLElement;
beforeEach(async () => {
  vi.clearAllMocks(); vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  window.matchMedia = vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })) as unknown as typeof window.matchMedia;
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function(this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function(this: HTMLDialogElement) { this.open = false; } });
  mocks.restart.mockReturnValue(true);
  mocks.snapshot = { status: "ok", state: createDemo("beginner", "admin-navigation", 0) };
  document.body.innerHTML = '<div id="root"></div>'; container = document.getElementById("root")!; root = createRoot(container);
  await act(async () => root.render(createElement(DemoHost, { experience: true })));
});
afterEach(async () => { await act(async () => root.unmount()); vi.unstubAllGlobals(); });
async function click(text: string) {
  const button = [...container.querySelectorAll("button")].find(b => b.textContent === text)!;
  expect(button, text).toBeDefined(); await act(async () => button.click());
}
async function openRestart() {
  container.querySelector<HTMLDetailsElement>(".app-header-menu")!.open = true;
  await click("Recomeçar");
  return container.querySelector<HTMLDialogElement>('dialog[aria-labelledby="restart-conversation-title"]')!;
}

describe("admin story navigation", () => {
  it("returns to the previous real screen through the menu without resetting the story", async () => {
    await click("Avançar");
    expect(container.querySelector(".opening-card h1")?.textContent).toContain("Você e Lucas");
    container.querySelector<HTMLDetailsElement>(".app-header-menu")!.open = true;
    await click("Voltar");
    expect(container.querySelector(".opening-card h1")?.textContent).toBe("Um encontro na cafeteria.");
    expect(mocks.restart).not.toHaveBeenCalled();
  });
  it("asks inside the page, preserves progress when cancelled, and resets only after explicit confirmation", async () => {
    const original = structuredClone(mocks.snapshot);
    const dialog = await openRestart();
    expect(dialog.open).toBe(true); expect(mocks.restart).not.toHaveBeenCalled();
    await click("Continuar minha conversa");
    expect(dialog.open).toBe(false); expect(mocks.snapshot).toEqual(original);
    expect(mocks.restart).not.toHaveBeenCalled();
    await openRestart(); await click("Recomeçar conversa");
    expect(mocks.restart).toHaveBeenCalledExactlyOnceWith(7);
    expect(mocks.push).toHaveBeenCalledExactlyOnceWith("/demo"); expect(dialog.open).toBe(false);
  });
  it("does not claim a restart or navigate away if the current progress cannot be replaced", async () => {
    mocks.restart.mockReturnValue(false);
    const original = structuredClone(mocks.snapshot);
    const dialog = await openRestart(); await click("Recomeçar conversa");
    expect(dialog.open).toBe(true); expect(dialog.textContent).toContain("Sua conversa foi mantida");
    expect(mocks.push).not.toHaveBeenCalled(); expect(mocks.snapshot).toEqual(original);
  });
});

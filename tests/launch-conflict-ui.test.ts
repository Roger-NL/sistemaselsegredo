// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { LearningRecovery } from "@/features/dashboard/workspace-store";
const mocks = vi.hoisted(() => ({ state: { conflict: null as LearningRecovery | null, error: "" }, resolve: vi.fn() }));
vi.mock("@/features/dashboard/use-student-workspace", () => ({ useStudentWorkspace: () => mocks.state }));
vi.mock("@/features/dashboard/workspace-store", () => ({ studentWorkspace: { resolveConflict: mocks.resolve } }));
import { LearningConflict } from "@/features/dashboard/LearningConflict";
let root: Root, container: HTMLElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  document.body.innerHTML = '<textarea id="unsent">Ainda em composição</textarea><div id="root"></div>';
  container = document.getElementById("root")!; root = createRoot(container);
  // jsdom has no native modal top layer; the browser check covers it separately.
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } });
  mocks.resolve.mockReset().mockResolvedValue(undefined);
  mocks.state = { error: "", conflict: { uid: "qa", revision: 0, baseVersion: 0, local: { studySnapshot: null }, remote: null } };
});
afterEach(async () => { await act(async () => root.unmount()); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("focuses the conflict heading without saving, keeps the form draft, and requires an explicit recovery choice", async () => {
  const draft = document.getElementById("unsent");
  await act(async () => root.render(createElement(LearningConflict)));
  expect(document.activeElement?.id).toBe("learning-conflict-title");
  expect(mocks.resolve).not.toHaveBeenCalled();
  const local = [...container.querySelectorAll("button")].find(button => button.textContent === "Usar o percurso desta aba")!;
  expect(local.disabled).toBe(true);
  const escape = new Event("cancel", { cancelable: true }); container.querySelector("dialog")!.dispatchEvent(escape);
  expect(escape.defaultPrevented).toBe(true);
  expect(document.getElementById("unsent")).toBe(draft);
  expect((draft as HTMLTextAreaElement).value).toBe("Ainda em composição");
  const server = [...container.querySelectorAll("button")].find(button => button.textContent === "Retomar o percurso da conta")!;
  await act(async () => server.click());
  expect(mocks.resolve).toHaveBeenCalledExactlyOnceWith("server");
});

it("keeps recovery visible and reports an error when the deliberate choice cannot reach the account", async () => {
  mocks.resolve.mockRejectedValueOnce(new Error("Offline"));
  await act(async () => root.render(createElement(LearningConflict)));
  const server = [...container.querySelectorAll("button")].find(button => button.textContent === "Retomar o percurso da conta")!;
  await act(async () => server.click());
  expect(container.querySelector("dialog")?.open).toBe(true);
  expect(container.querySelector('[role="alert"]')?.textContent).toContain("continua preservado");
  expect(mocks.resolve).toHaveBeenCalledTimes(1);
});

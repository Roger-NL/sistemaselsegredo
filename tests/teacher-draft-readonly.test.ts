// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";

const send = vi.hoisted(() => vi.fn());
vi.mock("@/features/dashboard/workspace-store", () => ({ studentWorkspace: { sendMessage: send } }));
import { TeacherContact } from "@/features/dashboard/TeacherContact";

it("enables a complete teacher draft locally, clears it on leaving and never sends it", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
  const host = document.createElement("div"); document.body.append(host);
  let root = createRoot(host);
  const mount = () => act(async () => root.render(createElement(TeacherContact, { conversations: [], disabled: false })));
  const button = () => host.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  async function write(selector: string, value: string) {
    const field = host.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)!;
    const prototype = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    await act(async () => {
      Object.getOwnPropertyDescriptor(prototype, "value")!.set!.call(field, value);
      field.dispatchEvent(new InputEvent("input", { bubbles: true, data: value }));
    });
  }
  try {
    await mount(); expect(button().disabled).toBe(true);
    await write('input[name="subject"]', "Rascunho de teste local"); expect(button().disabled).toBe(true);
    await write('textarea[name="body"]', "Teste de habilitação; não enviar."); expect(button().disabled).toBe(false);
    expect(host.textContent).not.toContain("Mensagem enviada ao professor.");
    expect(send).not.toHaveBeenCalled(); expect(fetcher).not.toHaveBeenCalled();
    await act(async () => root.unmount()); root = createRoot(host); await mount();
    expect(host.querySelector<HTMLInputElement>('input[name="subject"]')!.value).toBe("");
    expect(host.querySelector<HTMLTextAreaElement>('textarea[name="body"]')!.value).toBe("");
    expect(button().disabled).toBe(true); expect(send).not.toHaveBeenCalled(); expect(fetcher).not.toHaveBeenCalled();
  } finally { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); }
});

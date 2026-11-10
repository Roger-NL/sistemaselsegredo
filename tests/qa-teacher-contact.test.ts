// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TeacherConversation } from "@/contracts/workspace";

const mocks = vi.hoisted(() => ({ sendMessage: vi.fn() }));
vi.mock("@/features/dashboard/workspace-store", () => ({ studentWorkspace: { sendMessage: mocks.sendMessage } }));
import { TeacherContact } from "@/features/dashboard/StudentSections";
import { OPEN_TEACHER_CONVERSATION_EVENT } from "@/features/dashboard/next-step";

let root: Root;
let container: HTMLElement;
const conversation = (id: string, status: TeacherConversation["status"]): TeacherConversation => ({
  id, userId: "student", userName: "", userEmail: "", subject: `Assunto ${id}`, status,
  createdAt: "2026-11-01T12:00:00Z", updatedAt: "2026-11-01T12:00:00Z", messages: [],
});
const threads = [conversation("aberta", "answered"), conversation("encerrada", "closed")];
async function render(disabled = false) {
  await act(async () => root.render(createElement(TeacherContact, { conversations: threads, disabled })));
}
function button(text: string): HTMLButtonElement {
  const found = [...container.querySelectorAll("button")].find(item => item.textContent?.includes(text));
  if (!found) throw new Error(`Botão ausente: ${text}`);
  return found;
}
async function type(name: string, value: string) {
  const field = container.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`)!;
  const prototype = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, "value")!.set!.call(field, value);
  await act(async () => field.dispatchEvent(new Event("input", { bubbles: true })));
}
async function click(text: string) { await act(async () => button(text).click()); }
async function submit() { await act(async () => container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))); }

beforeEach(() => {
  vi.clearAllMocks(); vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div"); document.body.appendChild(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); });

describe("contato com professor — interações", () => {
  it("exige assunto e mensagem não vazios, e não envia quando desabilitado", async () => {
    await render();
    expect(button("Enviar mensagem").disabled).toBe(true);
    await type("subject", "  Dúvida  "); await type("body", "   ");
    expect(button("Enviar mensagem").disabled).toBe(true);
    await submit(); expect(mocks.sendMessage).not.toHaveBeenCalled();
    await type("body", " Olá "); expect(button("Enviar mensagem").disabled).toBe(false);
    await render(true); await submit(); expect(mocks.sendMessage).not.toHaveBeenCalled();
  });
  it("preserva rascunho após falha e envia uma única vez na tentativa seguinte", async () => {
    mocks.sendMessage.mockRejectedValueOnce(new Error("Conexão indisponível"));
    await render(); await type("subject", "  Dúvida  "); await type("body", "  Preciso de ajuda  ");
    await submit();
    expect(container.querySelector('[role="alert"]')?.textContent).toContain("Conexão indisponível");
    expect(container.querySelector<HTMLInputElement>('[name="subject"]')!.value).toBe("  Dúvida  ");
    expect(container.querySelector<HTMLTextAreaElement>('[name="body"]')!.value).toBe("  Preciso de ajuda  ");
    let resolve!: (value: TeacherConversation) => void;
    mocks.sendMessage.mockReturnValueOnce(new Promise<TeacherConversation>(done => { resolve = done; }));
    await submit();
    expect(mocks.sendMessage).toHaveBeenLastCalledWith("Dúvida", "Preciso de ajuda", undefined);
    expect(button("Enviando").matches(":disabled")).toBe(true);
    await submit(); await click("Assunto aberta");
    expect(mocks.sendMessage).toHaveBeenCalledTimes(2);
    expect(container.querySelector('[name="subject"]')).not.toBeNull();
    await act(async () => resolve(threads[0]));
    expect(container.querySelector('[role="status"]')?.textContent).toContain("Mensagem enviada");
    expect(container.querySelector<HTMLTextAreaElement>('[name="body"]')!.value).toBe("");
    expect(container.querySelector('[name="subject"]')).toBeNull();
  });
  it("responde à conversa selecionada e impede resposta em conversa encerrada", async () => {
    mocks.sendMessage.mockResolvedValue(threads[0]);
    await render(); await click("Assunto aberta"); await type("body", " Obrigada "); await submit();
    expect(mocks.sendMessage).toHaveBeenCalledWith("", "Obrigada", "aberta");
    await click("Assunto encerrada");
    expect(container.querySelector("form")).toBeNull();
    expect(container.textContent).toContain("Esta conversa foi encerrada");
    await click("Nova conversa");
    expect(container.querySelector<HTMLInputElement>('[name="subject"]')!.value).toBe("");
  });
  it("abre somente uma conversa existente pelo atalho do painel", async () => {
    await render(); await type("subject", "Rascunho");
    await act(async () => window.dispatchEvent(new CustomEvent(OPEN_TEACHER_CONVERSATION_EVENT, { detail: "inexistente" })));
    expect(container.querySelector<HTMLInputElement>('[name="subject"]')!.value).toBe("Rascunho");
    await act(async () => window.dispatchEvent(new CustomEvent(OPEN_TEACHER_CONVERSATION_EVENT, { detail: "aberta" })));
    expect(container.querySelector('[name="subject"]')).toBeNull();
    expect(container.textContent).toContain("Assunto aberta");
  });
});

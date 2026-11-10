// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StudentWorkspace } from "@/contracts/workspace";
import type { LiveClassAvailability, LiveClassBooking } from "@/contracts/live-class";
const mocks = vi.hoisted(() => ({ flush: vi.fn(), refresh: vi.fn(), getSnapshot: vi.fn() }));
vi.mock("@/features/dashboard/workspace-store", () => ({ studentWorkspace: mocks }));
import { StudentLiveClass } from "@/features/live-class/StudentLiveClass";
const workspace = { account: { id: "qa-student", status: "active" }, learning: { studyCompleted: 24, studyTotal: 24 } } as StudentWorkspace;
const availability: LiveClassAvailability = { userId: "qa-student", eligible: true, completed: 24, total: 24, month: "2026-11", timezone: "Europe/Lisbon", booking: null, slots: [
  { start: "2026-11-12T10:00:00Z", end: "2026-11-12T11:00:00Z", day: "2026-11-12", time: "10:00" },
  { start: "2026-11-13T11:00:00Z", end: "2026-11-13T12:00:00Z", day: "2026-11-13", time: "11:00" },
] };
const booking = { id: "booking", userId: "qa-student", status: "pending", start: "2026-11-13T11:00:00Z", timezone: "Europe/Lisbon", reason: "", meetingUrl: "" } as LiveClassBooking;
let root: Root, container: HTMLElement, fetchMock: ReturnType<typeof vi.fn>;
const response = (value: unknown, ok = true) => ({ ok, json: async () => value });
const find = (text: string) => [...container.querySelectorAll("button")].find(item => item.textContent?.includes(text))!;
async function click(button: HTMLButtonElement) { await act(async () => button.click()); }
beforeEach(() => {
  vi.clearAllMocks(); vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div"); document.body.appendChild(container); root = createRoot(container);
  fetchMock = vi.fn().mockResolvedValue(response(availability)); vi.stubGlobal("fetch", fetchMock);
  mocks.flush.mockResolvedValue(undefined); mocks.refresh.mockResolvedValue(undefined); mocks.getSnapshot.mockReturnValue({ workspace });
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; };
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); });
async function mount() { await act(async () => root.render(createElement(StudentLiveClass, { workspace, disabled: false }))); }
describe("agenda — controles do aluno", () => {
  it("limpa a escolha ao trocar de dia e envia o horário escolhido apenas após flush", async () => {
    await mount(); await click(find("Agendar minha aula"));
    expect(find("Solicitar este horário").disabled).toBe(true);
    await click(find("10:00")); expect(find("Solicitar este horário").disabled).toBe(false);
    await click(container.querySelector<HTMLButtonElement>('[aria-label="Dia 13"]')!);
    expect(find("Solicitar este horário").disabled).toBe(true);
    await click(find("11:00"));
    fetchMock.mockResolvedValueOnce(response({ booking }));
    await click(find("Solicitar este horário"));
    expect(mocks.flush).toHaveBeenCalledOnce();
    const post = fetchMock.mock.calls.find(([, options]) => options?.method === "POST")!;
    expect(post[0]).toBe("/api/student/live-class");
    expect(post[1].headers["X-Workspace-Uid"]).toBe("qa-student");
    expect(JSON.parse(post[1].body)).toEqual({ start: "2026-11-13T11:00:00Z" });
    expect(mocks.flush.mock.invocationCallOrder[0]).toBeLessThan(fetchMock.mock.invocationCallOrder.at(-1)!);
    expect(container.querySelector('[role="status"]')?.textContent).toContain("Pedido enviado");
    expect(container.querySelector("dialog")!.open).toBe(false);
    expect(find("Pedido enviado").disabled).toBe(true);
  });
  it("mantém a escolha e oferece nova tentativa se a reserva falhar", async () => {
    await mount(); await click(find("Agendar minha aula")); await click(find("10:00"));
    fetchMock.mockResolvedValueOnce(response({ error: "Horário indisponível" }, false));
    await click(find("Solicitar este horário"));
    expect(container.querySelector("dialog")!.open).toBe(true);
    expect(container.querySelector("dialog")!.textContent).toContain("Horário indisponível");
    expect(find("Solicitar este horário").disabled).toBe(false);
    expect(container.querySelector('[role="status"]')).toBeNull();
  });
  it("recusa disponibilidade de outra conta e não habilita a agenda", async () => {
    fetchMock.mockResolvedValue(response({ ...availability, userId: "outra-conta" }));
    await mount();
    expect(container.querySelector('[role="alert"]')?.textContent).toContain("conta conectada mudou");
    expect(find("Agendar minha aula").disabled).toBe(true);
  });
});

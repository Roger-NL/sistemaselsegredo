// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StudentWorkspace } from "@/contracts/workspace";
import type { WorkspaceState } from "@/features/dashboard/workspace-store";
import type { LessonDashboardInput } from "@/features/first-encounters/lesson-dashboard";
import { lessonInput } from "./helpers/first-encounters-progress";
import { accountLesson } from "./helpers/lesson-snapshot";
import { decodeLessonAccountSnapshot } from "@/features/first-encounters/lesson-account-snapshot";

const mocks = vi.hoisted(() => ({ state: null as WorkspaceState | null, input: null as LessonDashboardInput | null, ready: true, error: "", saving: false,
  refresh: vi.fn(async () => {}), reset: vi.fn(async () => {}), flush: vi.fn(async () => {}), clear: vi.fn(), replace: vi.fn(), routerRefresh: vi.fn(), logout: vi.fn(async () => {}) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace, refresh: mocks.routerRefresh }) }));
vi.mock("@/client/auth/service", () => ({ logout: mocks.logout }));
vi.mock("@/features/dashboard/use-student-workspace", () => ({ useStudentWorkspace: () => ({ ...mocks.state, refresh: mocks.refresh }) }));
vi.mock("@/features/dashboard/workspace-store", () => ({ studentWorkspace: { getSnapshot: () => mocks.state, flush: mocks.flush, reset: mocks.clear } }));
vi.mock("@/features/first-encounters/useLessonAccountProgress", () => ({ useLessonAccountProgress: () => ({ ready: mocks.ready, input: mocks.input, storageAvailable: true, refresh: mocks.refresh, reset: mocks.reset, saving: mocks.saving, error: mocks.error, notice: "" }) }));
vi.mock("@/features/first-encounters/useLessonSounds", () => ({ useLessonSounds: () => ({ play: vi.fn(), muted: false, toggleMuted: vi.fn() }) }));
vi.mock("@/features/dashboard/LearningConflict", () => ({ LearningConflict: () => null }));
vi.mock("@/features/first-encounters/LessonAccountPanels", () => ({ LessonAccountPanels: ({ section }: { section: string }) => createElement("section", { "data-account-section": section }, createElement("h2", null, section === "live" ? "Minha aula ao vivo." : "Fale com o professor.")) }));
import { Dashboard } from "@/features/dashboard/Dashboard";
import { TeacherContact, TeacherThread } from "@/features/dashboard/TeacherContact";

let root: Root, host: HTMLDivElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); mocks.ready = true; mocks.error = ""; mocks.saving = false; mocks.input = lessonInput();
  mocks.state = { status: "ready", generation: 1, saving: false, error: "", notice: "", workspace: { account: { id: "student", name: "Julia", email: "julia@example.com", status: "active", role: "student" }, learning: { revision: 0, saveVersion: 0, demoSnapshot: null, studySnapshot: null, lessonSnapshot: null, demoPercent: 0, studyCompleted: 0, studyTotal: 49, updatedAt: null }, activities: [], conversations: [], liveClass: null } };
  for (const fn of [mocks.refresh, mocks.reset, mocks.flush, mocks.clear, mocks.replace, mocks.routerRefresh, mocks.logout]) fn.mockClear();
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function(this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function(this: HTMLDialogElement) { this.open = false; } });
  window.history.replaceState(null, "", "/dashboard"); host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const mount = async () => { await act(async () => root.render(createElement(Dashboard, { account: { name: "Julia", email: "julia@example.com" } }))); };
const button = (text: string) => [...host.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent?.trim() === text)!;
const click = async (node: HTMLElement) => { expect(node).toBeTruthy(); await act(async () => node.click()); };
const tab = (hash: string) => host.querySelector<HTMLAnchorElement>(`.student-nav a[href='#${hash}']`)!;
async function typeName(text: string) { const input = host.querySelector<HTMLInputElement>('input[name="name"]')!; await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, text); input.dispatchEvent(new InputEvent("input", { bubbles: true, data: text })); }); }

describe("the main account dashboard", () => {
  it("shows the current49-step snapshot and real tabs instead of the retired conversation", async () => {
    mocks.input = lessonInput(10); await mount();
    expect(host.querySelector("details")?.open).toBe(false); expect(host.querySelector(".dashboard-access")?.getAttribute("href")).toBe("/demo");
    await click(tab("avanco")); expect(host.textContent).toContain("39%"); expect(host.textContent).toContain("49 etapas");
    expect(host.querySelectorAll("[data-dashboard-step]")).toHaveLength(5);
    await click(tab("atividades")); expect(host.querySelectorAll(".lesson-dashboard-activity")).toHaveLength(6);
    await click(tab("contato")); expect(host.querySelector('[data-account-section="teacher"]')).not.toBeNull();
    expect(host.innerHTML).not.toMatch(/cafeteria|Parte 2 de 10|\/demo\/estudo/);
  });
  it("shows all four account areas on arrival and opens each detail from the overview", async () => {
    await mount();
    const overview = host.querySelector<HTMLElement>(".lesson-dashboard-overview")!;
    expect(overview.querySelectorAll("[data-overview-section]")).toHaveLength(4);
    expect(overview.textContent).toContain("Meu avanço");
    expect(overview.textContent).toContain("Minhas atividades");
    expect(overview.textContent).toContain("Minha aula ao vivo");
    expect(overview.textContent).toContain("Fale com o professor");
    expect(host.textContent).toContain("Inglês na prática.");
    expect(host.textContent).not.toMatch(/hist[oó]ria|jogos?|jogar/i);
    for (const section of ["avanco", "atividades", "aula-ao-vivo", "contato"]) {
      await click(host.querySelector<HTMLAnchorElement>(`.lesson-dashboard-overview a[href='#${section}']`)!);
      expect(host.querySelector("[data-dashboard-section]")?.getAttribute("data-dashboard-section")).toBe(section);
      await click(tab("jornada"));
    }
  });
  it("keeps the lesson action while displaying an actual booking and teacher reply below", async () => {
    mocks.state!.workspace!.liveClass = { id: "booking", userId: "student", studentName: "Julia", studentEmail: "julia@example.com", start: "2026-12-01T14:00:00Z", end: "2026-12-01T15:00:00Z", timezone: "UTC", status: "confirmed", revision: 1, createdAt: "2026-11-17", updatedAt: "2026-11-17", reason: "", meetingUrl: "" };
    mocks.state!.workspace!.conversations = [{ id: "reply", userId: "student", userName: "Julia", userEmail: "", subject: "Dúvida sobre we are", status: "answered", createdAt: "2026-11-17", updatedAt: "2026-11-17", messages: [{ id: "message", authorId: "teacher", authorName: "Professor", role: "manager", body: "Resposta real", at: "2026-11-17" }] }];
    await mount();
    expect(host.querySelector("a.dashboard-access")?.getAttribute("href")).toBe("/demo");
    expect(host.querySelector("[data-overview-section='aula-ao-vivo']")?.textContent).toContain("Aula confirmada");
    expect(host.querySelector("[data-overview-section='contato']")?.textContent).toContain("Dúvida sobre we are");
    const received = vi.fn(); window.addEventListener("basedspeak:open-teacher-conversation", received);
    try {
      await click(host.querySelector<HTMLAnchorElement>("[data-overview-section='contato'] a")!);
      await act(async () => { await new Promise<void>(resolve => requestAnimationFrame(() => resolve())); });
      expect(received).toHaveBeenCalledOnce();
      expect((received.mock.calls[0][0] as CustomEvent).detail).toBe("reply");
    } finally { window.removeEventListener("basedspeak:open-teacher-conversation", received); }
  });
  it("does not announce an unlocked agenda from a pending save, simulated completion or foreign booking", async () => {
    mocks.input = lessonInput(29);
    // Finishing the activities alone still leaves theory and the test.
    mocks.state!.workspace!.learning.studyCompleted = 38;
    mocks.state!.workspace!.liveClass = { userId: "other-student", status: "confirmed" } as StudentWorkspace["liveClass"];
    await mount();
    const text = () => host.querySelector("[data-overview-section='aula-ao-vivo']")!.textContent;
    expect(text()).toContain("Conclua a aula, a teoria e o teste");
    expect(text()).not.toContain("Aula confirmada");
    expect(text()).not.toContain("está liberada");
    mocks.input = decodeLessonAccountSnapshot(accountLesson(49))!.progress;
    mocks.state!.workspace!.learning.studyCompleted = 49;
    mocks.saving = true;
    await mount(); expect(text()).toContain("Confirmando seu avanço"); expect(text()).not.toContain("está liberada");
    mocks.saving = false;
    await mount(); expect(text()).toContain("Sua aula gratuita de 1 hora está liberada");
    mocks.state!.workspace!.learning.testMode = true;
    await mount(); expect(text()).toContain("Conclusões simuladas não liberam a agenda"); expect(text()).not.toContain("está liberada");
  });
  it("opens a real account modal and saves a name with the current principal guard", async () => {
    const fetcher = vi.fn(async () => Response.json({ name: "Joana" })); vi.stubGlobal("fetch", fetcher); await mount();
    await click(button("Minha conta")); expect(host.querySelector<HTMLDialogElement>('[aria-labelledby="lesson-account-title"]')?.open).toBe(true);
    await typeName("Joana"); const form = host.querySelector<HTMLFormElement>('[aria-labelledby="lesson-account-title"] form')!;
    await act(async () => { form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
    expect(fetcher).toHaveBeenCalledWith("/api/account/profile", expect.objectContaining({ method: "PATCH", headers: expect.objectContaining({ "X-Workspace-Uid": "student" }), body: JSON.stringify({ name: "Joana" }) }));
    expect(host.textContent).toContain("Nome atualizado."); expect(mocks.refresh).toHaveBeenCalled();
    expect(host.querySelector('a[href="/dashboard?painel=conta"]')).toBeNull();
  });
  it("keeps practice available for pending accounts but blocks suspended access while keeping contact", async () => {
    mocks.state!.workspace!.account.status = "pending"; await mount(); expect(host.querySelector('a.dashboard-access')).not.toBeNull();
    mocks.state!.workspace!.account.status = "suspended"; mocks.ready = false; mocks.error = "Seu acesso à aula está indisponível.";
    await act(async () => root.render(createElement(Dashboard, { account: { name: "Julia", email: "julia@example.com" } })));
    expect(host.querySelector<HTMLButtonElement>("button.dashboard-access")?.disabled).toBe(true); expect(host.textContent).toContain(mocks.error);
    await click(tab("contato")); expect(host.querySelector('[data-account-section="teacher"]')).not.toBeNull();
  });
  it("reports persistence errors and resets only on the explicit settings action", async () => {
    mocks.saving = true; await mount(); expect(host.textContent).toContain("Salvando seu avanço"); expect(mocks.reset).not.toHaveBeenCalled();
    mocks.saving = false; await mount(); await click(button("Configurações"));
    await click(button("Recomeçar percurso")); expect(mocks.reset).toHaveBeenCalledOnce(); expect(host.textContent).toContain("mensagens e aulas foram preservadas");
    mocks.error = "Não foi possível salvar"; await act(async () => root.render(createElement(Dashboard, { account: { name: "Julia", email: "julia@example.com" } })));
    expect(host.textContent).toContain(mocks.error); expect(button("Tentar novamente")).toBeTruthy();
  });
  it("signs out through the existing session endpoint without deleting the account", async () => {
    const fetcher = vi.fn(async () => new Response(null, { status: 204 })); vi.stubGlobal("fetch", fetcher); await mount(); await click(button("Minha conta")); await click(button("Sair da conta"));
    expect(mocks.flush).toHaveBeenCalledOnce(); expect(fetcher).toHaveBeenCalledWith("/api/auth/session", { method: "DELETE", credentials: "same-origin" });
    expect(mocks.clear).toHaveBeenCalledOnce(); expect(mocks.replace).toHaveBeenCalledWith("/comecar?modo=entrar"); expect(mocks.logout).toHaveBeenCalledOnce();
  });
  it("preserves teacher conversations and escapes message content", () => {
    const conversation = { id: "thread", userId: "student", userName: "Julia", userEmail: "", subject: "Dúvida real", status: "answered" as const, createdAt: "2026-11-01", updatedAt: "2026-11-02", messages: [{ id: "reply", authorId: "manager", authorName: "Professor", role: "manager" as const, body: "Resposta <script>alert(1)</script>", at: "2026-11-02" }] };
    const contact = renderToStaticMarkup(createElement(TeacherContact, { conversations: [conversation], disabled: false }));
    expect(contact).toContain("Dúvida real"); expect(contact).toContain("Enviar mensagem"); expect(contact).not.toContain("Mensagem enviada ao professor.");
    const thread = renderToStaticMarkup(createElement(TeacherThread, { conversation })); expect(thread).toContain("&lt;script&gt;"); expect(thread).not.toContain("<script>");
  });
});

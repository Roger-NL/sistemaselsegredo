// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StudentWorkspace } from "@/contracts/workspace";
import type { WorkspaceState } from "@/features/dashboard/workspace-store";

const mocks = vi.hoisted(() => ({ state: null as WorkspaceState | null,
  refresh: vi.fn(async () => {}), flush: vi.fn(async () => {}), clear: vi.fn(), replace: vi.fn(), routerRefresh: vi.fn(), logout: vi.fn(async () => {}) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace, refresh: mocks.routerRefresh }) }));
vi.mock("@/client/auth/service", () => ({ logout: mocks.logout }));
vi.mock("@/features/dashboard/use-student-workspace", () => ({ useStudentWorkspace: () => ({ ...mocks.state, refresh: mocks.refresh }) }));
vi.mock("@/features/dashboard/workspace-store", () => ({ studentWorkspace: { getSnapshot: () => mocks.state, flush: mocks.flush, reset: mocks.clear } }));
vi.mock("@/features/first-encounters/useLessonSounds", () => ({ useLessonSounds: () => ({ play: vi.fn(), muted: false, toggleMuted: vi.fn() }) }));
vi.mock("@/features/dashboard/LearningConflict", () => ({ LearningConflict: () => null }));
vi.mock("@/features/first-encounters/LessonAccountPanels", () => ({ LessonAccountPanels: ({ section }: { section: string }) => createElement("section", { "data-account-section": section }, createElement("h2", null, section === "live" ? "Minha aula ao vivo." : "Fale com o professor.")) }));
import { Dashboard } from "@/features/dashboard/Dashboard";
import { PublicDashboard } from "@/features/dashboard/PublicDashboard";
import { TeacherContact, TeacherThread } from "@/features/dashboard/TeacherContact";

let root: Root, host: HTMLDivElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); window.localStorage.clear();
  mocks.state = { status: "ready", generation: 1, saving: false, error: "", notice: "", workspace: { account: { id: "student", name: "Julia", email: "julia@example.com", status: "active", role: "student" }, learning: { revision: 0, saveVersion: 0, demoSnapshot: null, studySnapshot: null, lessonSnapshot: null, demoPercent: 0, studyCompleted: 0, studyTotal: 49, updatedAt: null }, activities: [], conversations: [], liveClass: null } };
  for (const fn of [mocks.refresh, mocks.flush, mocks.clear, mocks.replace, mocks.routerRefresh, mocks.logout]) fn.mockClear();
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function(this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function(this: HTMLDialogElement) { this.open = false; } });
  window.history.replaceState(null, "", "/dashboard"); host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const mount = async () => { await act(async () => root.render(createElement(Dashboard, { account: { name: "Julia", email: "julia@example.com" } }))); };
const button = (text: string) => [...host.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent?.trim() === text)!;
const click = async (node: HTMLElement) => { expect(node).toBeTruthy(); await act(async () => node.click()); };
const tab = (hash: string) => host.querySelector<HTMLAnchorElement>(`.app-menu-panel a[href='#${hash}']`)!;
async function typeName(text: string) { const input = host.querySelector<HTMLInputElement>('input[name="name"]')!; await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, text); input.dispatchEvent(new InputEvent("input", { bubbles: true, data: text })); }); }

describe("the main account dashboard", () => {
  it("offers First Day and the three illustrated covers in reading order without an account", () => {
    const markup = renderToStaticMarkup(createElement(PublicDashboard));
    expect(markup).toContain('href="/first-day"');
    expect(markup).toContain("Começar a ler");
    expect(markup).toContain("Em breve");
    const catalog = new DOMParser().parseFromString(markup, "text/html");
    expect(Array.from(catalog.querySelectorAll(".catalog-book"), book => book.textContent)).toEqual([
      "Um café, por favor", "Do outro lado da rua", "Um dia de chuva",
    ]);
    expect(markup).not.toMatch(/Minhas atividades|Minha conta|\/comecar/);
  });
  it("opens First Day at the saved point and has working account tabs", async () => {
    localStorage.setItem("basedspeak:first-day:v1", JSON.stringify({ pageId: "ana-introduces-herself", sound: true }));
    mocks.state!.workspace!.activities = [{ id: "recent", kind: "practice", title: "Atividade registrada", at: "2026-11-23T12:00:00Z" }];
    mocks.state!.workspace!.learning.studyCompleted = 18;
    await mount();
    expect(host.querySelector("details")?.open).toBe(false);
    expect(host.querySelector(".catalog-cta")?.getAttribute("href")).toBe("/first-day");
    expect(host.textContent).toContain("Continuar leitura");
    await click(tab("avanco")); expect(host.textContent).toContain("Página 4 de 22");
    expect(host.textContent).toContain("18 de 49 etapas concluídas no percurso anterior.");
    await click(tab("atividades")); expect(host.textContent).toContain("Atividade registrada");
    await click(tab("contato")); expect(host.querySelector('[data-account-section="teacher"]')).not.toBeNull();
    await click(tab("aula-ao-vivo")); expect(host.querySelector('[data-account-section="live"]')).not.toBeNull();
  });
  it("keeps the reading action while showing an actual booking and opening the teacher reply", async () => {
    mocks.state!.workspace!.liveClass = { id: "booking", userId: "student", studentName: "Julia", studentEmail: "julia@example.com", start: "2026-12-01T14:00:00Z", end: "2026-12-01T15:00:00Z", timezone: "UTC", status: "confirmed", revision: 1, createdAt: "2026-11-17", updatedAt: "2026-11-17", reason: "", meetingUrl: "" };
    mocks.state!.workspace!.conversations = [{ id: "reply", userId: "student", userName: "Julia", userEmail: "", subject: "Dúvida sobre can I", status: "answered", createdAt: "2026-11-17", updatedAt: "2026-11-17", messages: [{ id: "message", authorId: "teacher", authorName: "Professor", role: "manager", body: "Resposta real", at: "2026-11-17" }] }];
    await mount();
    expect(host.querySelector("a.catalog-cta")?.getAttribute("href")).toBe("/first-day");
    expect(host.querySelector(".catalog-account-overview")?.textContent).toContain("Aula confirmada");
    expect(host.querySelector(".catalog-account-overview")?.textContent).toContain("Dúvida sobre can I");
    const received = vi.fn(); window.addEventListener("basedspeak:open-teacher-conversation", received);
    try {
      await click(host.querySelector<HTMLAnchorElement>(".catalog-account-overview a[href='#contato']")!);
      await act(async () => { await new Promise<void>(resolve => requestAnimationFrame(() => resolve())); });
      expect(received).toHaveBeenCalledOnce();
      expect((received.mock.calls[0][0] as CustomEvent).detail).toBe("reply");
    } finally { window.removeEventListener("basedspeak:open-teacher-conversation", received); }
  });
  it("does not show a booking for another account", async () => {
    mocks.state!.workspace!.liveClass = { userId: "other-student", status: "confirmed" } as StudentWorkspace["liveClass"];
    await mount();
    expect(host.querySelector(".catalog-account-overview")?.textContent).not.toContain("Aula confirmada");
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
  it("keeps the public reading available and account support reachable when the workspace has an error", async () => {
    mocks.state!.workspace!.account.status = "pending"; await mount(); expect(host.querySelector('a.catalog-cta')).not.toBeNull();
    mocks.state!.workspace!.account.status = "suspended"; mocks.state!.error = "Seu acesso à aula está indisponível.";
    await act(async () => root.render(createElement(Dashboard, { account: { name: "Julia", email: "julia@example.com" } })));
    expect(host.querySelector("a.catalog-cta")?.getAttribute("href")).toBe("/first-day"); expect(host.textContent).toContain(mocks.state!.error);
    await click(tab("contato")); expect(host.querySelector('[data-account-section="teacher"]')).not.toBeNull();
  });
  it("reports account errors and restarts only the First Day reading on request", async () => {
    localStorage.setItem("basedspeak:first-day:v1", JSON.stringify({ pageId: "close-the-door", attempts: { "close-the-door": { placed: [0, 1, 2, 3, 4], result: "correct" } }, sound: true }));
    mocks.state!.saving = true;
    await mount(); expect(host.textContent).toContain("Salvando seu avanço");
    const confirm = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    await click(button("Configurações")); await click(button("Recomeçar leitura"));
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(JSON.parse(localStorage.getItem("basedspeak:first-day:v1")!).pageId).toBe("close-the-door");
    await click(button("Recomeçar leitura"));
    expect(JSON.parse(localStorage.getItem("basedspeak:first-day:v1")!)).toMatchObject({ pageId: null, attempts: {}, sound: true });
    expect(host.textContent).toContain("Leitura reiniciada neste navegador.");
    mocks.state!.saving = false; mocks.state!.error = "Não foi possível salvar";
    await mount(); expect(host.textContent).toContain(mocks.state!.error); expect(button("Tentar novamente")).toBeTruthy();
  });
  it("signs out through the existing session endpoint without deleting the account", async () => {
    const fetcher = vi.fn(async () => new Response(null, { status: 204 })); vi.stubGlobal("fetch", fetcher); await mount(); await click(button("Minha conta")); await click(button("Sair da conta"));
    expect(mocks.flush).toHaveBeenCalledOnce(); expect(fetcher).toHaveBeenCalledWith("/api/auth/session", { method: "DELETE", credentials: "same-origin" });
    expect(mocks.clear).toHaveBeenCalledOnce(); expect(mocks.replace).toHaveBeenCalledWith("/"); expect(mocks.logout).toHaveBeenCalledOnce();
  });
  it("preserves teacher conversations and escapes message content", () => {
    const conversation = { id: "thread", userId: "student", userName: "Julia", userEmail: "", subject: "Dúvida real", status: "answered" as const, createdAt: "2026-11-01", updatedAt: "2026-11-02", messages: [{ id: "reply", authorId: "manager", authorName: "Professor", role: "manager" as const, body: "Resposta <script>alert(1)</script>", at: "2026-11-02" }] };
    const contact = renderToStaticMarkup(createElement(TeacherContact, { conversations: [conversation], disabled: false }));
    expect(contact).toContain("Dúvida real"); expect(contact).toContain("Enviar mensagem"); expect(contact).not.toContain("Mensagem enviada ao professor.");
    const thread = renderToStaticMarkup(createElement(TeacherThread, { conversation })); expect(thread).toContain("&lt;script&gt;"); expect(thread).not.toContain("<script>");
  });
});

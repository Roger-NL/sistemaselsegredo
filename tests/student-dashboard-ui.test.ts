import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync, writeFileSync } from "node:fs";
import type { WorkspaceState } from "@/features/dashboard/workspace-store";

vi.mock("@/features/onboarding/PresentationGate", () => ({ PresentationGate: ({ children }: { children: (review: () => void) => unknown }) => children(() => {}) }));

const mocks = vi.hoisted(() => ({ state: null as WorkspaceState | null }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }) }));
vi.mock("@/features/dashboard/use-student-workspace", () => ({ useStudentWorkspace: () => ({ ...mocks.state, refresh: vi.fn() }) }));
vi.mock("@/features/demo/session/browser", () => ({ subscribe: () => () => {}, getBrowserSnapshot: () => ({ status: "empty", state: null }), getServerSnapshot: () => ({ status: "empty", state: null }) }));

import { Dashboard } from "@/features/dashboard/Dashboard";
import { TeacherContact, TeacherThread } from "@/features/dashboard/StudentSections";
import { PracticeAccess } from "@/features/dashboard/PracticeAccess";
import { TheoryExperience } from "@/features/theory/TheoryExperience";
import { emptyProgress, studySteps } from "@/features/theory/progress";
import { canPractice } from "@/features/dashboard/practice-access";
import { emptyGuestLearning } from "@/features/dashboard/guest-learning";
import { DemoHost } from "@/features/demo/DemoHost";

beforeEach(() => {
  mocks.state = { status: "ready", generation: 1, saving: false, error: "", notice: "", workspace: { account: { id: "student", name: "", email: "", status: "active", role: "student" }, learning: { revision: 0, demoSnapshot: null, studySnapshot: null, demoPercent: 0, studyCompleted: 0, studyTotal: 24, updatedAt: null }, activities: [], conversations: [], liveClass: null } };
});
const render = () => renderToStaticMarkup(createElement(Dashboard, { account: { name: "", email: "" } }));

describe("student dashboard", () => {
  it("renders real empty sections, account-bound progress and direct navigation", () => {
    const html = render();
    for (const label of ["Minhas atividades.", "Meu avanço.", "Fale com o professor.", "Ainda não há atividades registradas.", "Você ainda não enviou mensagens."]) expect(html).toContain(label);
    for (const id of ["jornada", "atividades", "avanco", "contato"]) expect(html).toContain(`id="${id}"`);
    expect(html).toContain("Ainda não começou");
    expect(html).toContain("Seu próximo passo");
    expect(html).not.toMatch(/whatsapp|wa\.me|exemplo|ilustrativ|prévia|modo demonstração|roger@example/i);
    // Optional static visual harness, outside the app and without adding a product preview route.
    if (process.env.ALUNO_VISUAL_HTML) {
      const css = ["src/app/globals.css", "src/features/dashboard/dashboard.css", "src/components/navigation/navigation.css", "src/features/demo/demo.css"].map(path => readFileSync(path, "utf8").replace('@import "tailwindcss";', "")).join("\n");
      writeFileSync(process.env.ALUNO_VISUAL_HTML, `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Aluno · verificação de layout vazio</title><style>:root{--font-geist-sans:Arial}body{margin:0}button,input,textarea{font:inherit}${css}</style></head><body>${html}</body></html>`);
    }
  });

  it("lets a pending student begin immediately and contact the teacher without approval", () => {
    mocks.state!.workspace!.account.status = "pending";
    const html = render();
    expect(html).toContain("sem esperar aprovação");
    expect(html).not.toMatch(/class="dashboard-access"[^>]*disabled=""/);
    expect(html).toContain('name="body"');
    expect(html).toContain("Enviar mensagem");
    expect(html).toContain("Conta criada");
    expect(html).toContain("Tudo pronto para começar.");
    expect(html).toContain("Libera ao concluir 100% do estudo guiado.");
  });
  it("guides the first approved visit and stops showing onboarding after practice begins", () => {
    expect(render()).toContain("Tudo pronto para começar.");
    expect(render()).toContain('aria-label="Acessar minha história"');
    mocks.state!.workspace!.learning.studyCompleted = 1;
    expect(render()).not.toContain("Tudo pronto para começar.");
  });
  it("opens the connected study for pending accounts instead of rendering an approval barrier", () => {
    mocks.state!.workspace!.account.status = "pending";
    const html = renderToStaticMarkup(createElement(TheoryExperience, { publishedAudio: {} }));
    expect(canPractice(mocks.state!)).toBe(true);
    expect(html).toContain("Começar a descobrir");
    expect(html).not.toContain("Aguardando aprovação");
  });

  it("shows actual activity titles and confirmed teacher replies, escaping message markup", () => {
    const data = mocks.state!.workspace!;
    data.activities = [{ id: "activity-1", title: "Estudo salvo", kind: "study", at: "2026-10-27T12:00:00Z" }];
    data.conversations = [{ id: "thread-1", userId: "student", userName: "", userEmail: "", subject: "Dúvida enviada", status: "answered", createdAt: "2026-10-27T12:00:00Z", updatedAt: "2026-10-27T12:01:00Z", messages: [{ id: "reply-1", authorId: "manager", authorName: "", role: "manager", at: "2026-10-27T12:01:00Z", body: "Resposta do professor <script>alert(1)</script>" }] }];
    const html = render();
    expect(html).toContain("Estudo salvo");
    expect(html).toContain("Dúvida enviada");
    expect(html).toContain("Professor respondeu");
    expect(html).not.toContain("Ainda não há atividades registradas.");
    const contact = renderToStaticMarkup(createElement(TeacherContact, { conversations: data.conversations, disabled: false }));
    expect(contact).toContain("Nova mensagem.");
    expect(contact).not.toContain("Mensagem enviada ao professor.");
    const thread = renderToStaticMarkup(createElement(TeacherThread, { conversation: data.conversations[0] }));
    expect(thread).toContain("Resposta do professor &lt;script&gt;");
    expect(thread).not.toContain("<script>");
    expect(thread).toContain('data-author="manager"');
  });

  it("does not show a fabricated workspace when loading or when the API fails", () => {
    mocks.state = { ...mocks.state!, status: "loading", workspace: null };
    expect(render()).toContain("Carregando seu espaço…");
    expect(render()).not.toContain('id="atividades"');
    mocks.state = { ...mocks.state, status: "error", error: "Não foi possível conectar" };
    expect(render()).toContain("Tentar novamente");
    expect(render()).toContain("Não foi possível conectar");
    expect(render()).not.toContain('aria-label="Percurso da conversa da cafeteria"');
  });

  it("keeps the public demo available without a sign-in requirement", () => {
    const state = { ...mocks.state!, status: "unauthenticated" as const, workspace: null };
    const html = renderToStaticMarkup(createElement(PracticeAccess, { state, retry: async () => {} }));
    expect(html).toContain("sem cadastro");
    expect(html).not.toContain('href="/comecar?modo=entrar"');
    expect(canPractice({ ...state, guestLearning: emptyGuestLearning() })).toBe(true);
  });

  it("connects saved study completion to booking, waiting for persistence and respecting an existing booking", () => {
    const theory = () => renderToStaticMarkup(createElement(TheoryExperience, { publishedAudio: {} }));
    const data = mocks.state!.workspace!;
    data.learning.studySnapshot = JSON.stringify({ ...emptyProgress, completed: studySteps.slice(0, 23).map(item => item.step.id) });
    expect(theory()).not.toContain('class="study-completion"');
    data.learning.studySnapshot = JSON.stringify({ ...emptyProgress, completed: studySteps.map(item => item.step.id) });
    mocks.state!.saving = true;
    expect(theory()).toContain('disabled="">Confirmando seu progresso');
    expect(theory()).not.toContain("Agendar minha aula gratuita");
    mocks.state!.saving = false;
    expect(theory()).toContain('href="/dashboard#aula-ao-vivo"');
    expect(theory()).toContain("Agendar minha aula gratuita");
    data.liveClass = { id: "student", userId: "student", status: "confirmed" } as NonNullable<typeof data.liveClass>;
    expect(theory()).toContain("Ver minha aula ao vivo");
    expect(theory()).not.toContain("Agendar minha aula gratuita");
  });
  it("lets anonymous visitors start the story and study; requires a deliberate account continuation for the free lesson", () => {
    mocks.state = { ...mocks.state!, status: "unauthenticated", workspace: null, guestLearning: { ...emptyGuestLearning(), studySnapshot: JSON.stringify({ ...emptyProgress, completed: studySteps.map(item => item.step.id) }), studyCompleted: 24 } };
    const story = renderToStaticMarkup(createElement(DemoHost, { experience: true }));
    expect(story).toContain("Começar a conversa");
    expect(story).toContain("Demo livre"); expect(story).not.toContain("Entre para continuar");
    const study = renderToStaticMarkup(createElement(TheoryExperience, { publishedAudio: {} }));
    expect(study).toContain("Criar minha conta para a aula"); expect(study).toContain("sem refazer as práticas");
    expect(study).toContain('href="/comecar?modo=entrar"'); expect(study).not.toContain('href="/dashboard#aula-ao-vivo"');
  });
});

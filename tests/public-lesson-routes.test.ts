import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const account = vi.hoisted(() => vi.fn());
vi.mock("@/server/dashboard/account", () => ({ getDashboardAccount: account }));
vi.mock("next/navigation", () => ({ redirect: (target: string) => { throw new Error(`REDIRECT:${target}`); } }));
vi.mock("@/features/first-encounters/LessonOne", () => ({ LessonOne: () => createElement("main", { "data-course": "first-encounters" }) }));
vi.mock("@/features/first-encounters/LessonDashboard", () => ({ LessonDashboard: () => null }));

import DemoPage, { metadata } from "@/app/demo/page";
import DashboardPage from "@/app/dashboard/page";
import StudyPage from "@/app/demo/estudo/page";
import LocalLesson from "@/app/dev/primeiros-encontros/page";
import LocalDashboard from "@/app/dev/primeiros-encontros/painel/page";
import VisualStudy from "@/app/dev/estudo-visual/page";

beforeEach(() => vi.clearAllMocks());
describe("the approved lesson is the principal public experience", () => {
  it("renders the new lesson without requiring an account or the retired host", () => {
    expect(renderToStaticMarkup(DemoPage())).toContain('data-course="first-encounters"');
    expect(account).not.toHaveBeenCalled();
    expect(metadata.alternates).toMatchObject({ canonical: "/demo" });
    expect(metadata.description).not.toMatch(/cafeteria/i);
  });
  it("retains verified dashboard access and passes the real account to the new panel", async () => {
    account.mockResolvedValueOnce(null);
    await expect(DashboardPage()).rejects.toThrow("REDIRECT:/comecar?modo=entrar");
    account.mockResolvedValueOnce({ name: "Ana", email: "ana@example.test" });
    expect((await DashboardPage()).props).toEqual({ account: { name: "Ana", email: "ana@example.test" } });
  });
  it("keeps the old study bookmark behind the lesson's existing order guard", () => {
    expect(StudyPage).toThrow("REDIRECT:/demo?retomar=conclusao");
  });
  it("redirects former local previews to the main routes without preserving arbitrary queries", async () => {
    await expect(LocalLesson({ searchParams: Promise.resolve({ apresentacao: "1", retomar: "conclusao", revisao: "1", token: "discard" }) })).rejects.toThrow("REDIRECT:/demo?apresentacao=1&retomar=conclusao");
    expect(LocalDashboard).toThrow("REDIRECT:/dashboard");
    expect(VisualStudy).toThrow("REDIRECT:/demo");
  });
});

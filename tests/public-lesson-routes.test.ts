import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const account = vi.hoisted(() => vi.fn());
vi.mock("@/server/dashboard/account", () => ({ getDashboardAccount: account, getDashboardIdentity: account }));
vi.mock("next/navigation", () => ({
  redirect: (target: string) => { throw new Error(`REDIRECT:${target}`); },
  notFound: () => { throw new Error("NOT_FOUND"); },
}));
vi.mock("@/features/first-day/FirstDay", () => ({ FirstDay: () => createElement("main", { "data-course": "first-day" }) }));

import FirstDayPage, { metadata } from "@/app/first-day/page";
import DemoPage from "@/app/demo/page";
import DemoSection from "@/app/demo/[section]/page";
import StudyPage from "@/app/demo/estudo/page";
import FirstDayPreview from "@/app/dev/first-day/page";
import LocalLesson from "@/app/dev/primeiros-encontros/page";
import LocalDashboard from "@/app/dev/primeiros-encontros/painel/page";
import VisualStudy from "@/app/dev/estudo-visual/page";

beforeEach(() => vi.clearAllMocks());
describe("the approved lesson is the principal public experience", () => {
  it("renders First Day and preloads the revised cover and reaction without looking up an account", () => {
    const html = renderToStaticMarkup(FirstDayPage());
    expect(html).toContain('data-course="first-day"');
    expect(html).toContain('href="/first-day/art-v2/capa-gibi-mobile.webp"');
    expect(html).toContain('href="/first-day/art-v2/capa-gibi-desktop.webp"');
    expect(html).toContain('href="/first-day-part-one/celular/02-bolsa.webp"');
    expect(html).toContain('href="/first-day-part-one/pc/02-bolsa.webp"');
    expect(account).not.toHaveBeenCalled();
    expect(metadata.alternates).toMatchObject({ canonical: "/first-day" });
  });

  it("redirects the old demo, study and preview bookmarks to the official route", () => {
    for (const alias of [DemoPage, StudyPage, FirstDayPreview, LocalLesson, VisualStudy]) {
      expect(alias).toThrow("REDIRECT:/first-day");
    }
    expect(LocalDashboard).toThrow("REDIRECT:/dashboard");
  });

  it.each(["teoria", "teste", "extras"])("redirects the former %s section to First Day", async section => {
    await expect(DemoSection({ params: Promise.resolve({ section }) })).rejects.toThrow("REDIRECT:/first-day");
  });

  it("keeps unknown demo sections unavailable", async () => {
    await expect(DemoSection({ params: Promise.resolve({ section: "desconhecida" }) })).rejects.toThrow("NOT_FOUND");
  });
});

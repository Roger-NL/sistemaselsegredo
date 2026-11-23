import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AppHeader } from "@/components/navigation/AppHeader";
import { Brand } from "@/components/ui/Brand";

describe("connected learning navigation", () => {
  it("keeps First Day, the panel and account reachable from the learning menu", () => {
    for (const current of ["dashboard", "demo", "study"] as const) {
      const html = renderToStaticMarkup(createElement(AppHeader, { current }));
      for (const path of ["/dashboard", "/first-day", "/dashboard?painel=conta", "/dashboard?painel=configuracoes"]) expect(html).toContain(`href="${path}"`);
      expect(html).toContain('aria-label="Menu de navegação"');
      expect(html).toContain('aria-label="BasedSpeak — meu painel"');
    }
  });
  it("links the visitor to First Day and the public panel without opening account entry", () => {
    const html = renderToStaticMarkup(createElement(AppHeader, { current: "dashboard", guest: true }));
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/first-day"');
    expect(html).not.toContain('href="/comecar');
  });
  it("preserves the original public brand destination outside the learning navigation", () => {
    const html = renderToStaticMarkup(createElement(Brand));
    expect(html).toContain('href="/"');
    expect(html).toContain('aria-label="BasedSpeak — início"');
  });
});

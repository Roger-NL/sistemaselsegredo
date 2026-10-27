import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AppHeader } from "@/components/navigation/AppHeader";
import { Brand } from "@/components/ui/Brand";

describe("connected learning navigation", () => {
  it("keeps the panel, story, study and account reachable from every learning screen", () => {
    for (const current of ["dashboard", "demo", "study"] as const) {
      const html = renderToStaticMarkup(createElement(AppHeader, { current }));
      for (const path of ["/dashboard", "/demo", "/demo/estudo", "/dashboard?painel=conta", "/dashboard?painel=configuracoes"]) expect(html).toContain(`href="${path}"`);
      expect(html).toContain('aria-label="Menu de navegação"');
      expect(html).toContain('aria-label="BasedSpeak — meu painel"');
    }
  });
  it("preserves the original public brand destination outside the learning navigation", () => {
    const html = renderToStaticMarkup(createElement(Brand));
    expect(html).toContain('href="/"');
    expect(html).toContain('aria-label="BasedSpeak — início"');
  });
});

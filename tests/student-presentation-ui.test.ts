import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PresentationGate, parsePresentationStatus } from "@/features/onboarding/PresentationGate";
import { Presentation } from "@/features/onboarding/Presentation";
import { presentationSteps } from "@/features/onboarding/content";

describe("presentation before the student's dashboard", () => {
  it("withholds dashboard content and hooks during the initial session-bound check", () => {
    const children = vi.fn(() => createElement("p", null, "Private dashboard details"));
    // The gate uses a render function so dashboard hooks cannot mount before verification.
    // eslint-disable-next-line react/no-children-prop
    const html = renderToStaticMarkup(createElement(PresentationGate, { children }));
    expect(html).toContain("Preparando seu espaço"); expect(html).not.toContain("Private dashboard details"); expect(children).not.toHaveBeenCalled();
  });
  it("requires a server-confirmed UID and boolean completion", () => {
    for (const value of [null, {}, { uid: "", completed: true }, { uid: "student", completed: "true" }]) expect(() => parsePresentationStatus(value)).toThrow();
    expect(parsePresentationStatus({ uid: "student", completed: false })).toEqual({ uid: "student", completed: false });
  });
  it("offers explicit skip, step navigation, back and forward without autoplay", () => {
    const html = renderToStaticMarkup(createElement(Presentation, { onFinish: () => {} }));
    for (const label of ["Pular apresentação", "Etapas da apresentação", "Etapa 5: Meu painel", "Continuar", "Voltar", 'tabindex="-1"', 'aria-current="step"']) expect(html).toContain(label);
    expect(html).not.toContain("autoplay");
    expect(html).toContain("O professor aprova seu cadastro");
    expect(renderToStaticMarkup(createElement(Presentation, { review: true, onFinish: () => {} }))).toContain("Voltar ao painel");
  });
  it("explains the real journey and the exact one-hour, one-per-account benefit", () => {
    const copy = presentationSteps.map(step => `${step.title} ${step.description} ${step.note}`).join(" ");
    for (const value of ["Lucas", "microfone", "Guiado", "Com pistas", "Mais autônomo", "oito blocos", "24 práticas", "100%", "1 hora", "uma aula por conta", "confirmação", "Meu painel", "fale com o professor"]) expect(copy.toLowerCase()).toContain(value.toLowerCase());
  });
});

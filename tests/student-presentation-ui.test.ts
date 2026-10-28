import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PresentationGate, parsePresentationStatus } from "@/features/onboarding/PresentationGate";
import { Presentation } from "@/features/onboarding/Presentation";
import { canVisitPresentationScene, presentationSteps, presentationFrames, presentationSceneStart } from "@/features/onboarding/content";

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
  it("requires the first viewing in order, with back and forward but no skip", () => {
    const html = renderToStaticMarkup(createElement(Presentation, { onFinish: () => {} }));
    for (const label of ["Etapas da apresentação", "Etapa 5: Meu painel", "Continuar", "Voltar", 'tabindex="-1"', 'aria-current="step"']) expect(html).toContain(label);
    expect(html).not.toContain("autoplay");
    expect(html).not.toContain("Pular apresentação");
    expect(html).not.toContain("Voltar ao painel");
    expect(html).not.toContain("Abrir meu painel");
    expect(html).toMatch(/aria-label="Etapa 5: Meu painel"[^>]*disabled=""/);
    expect(html).toContain("Seu inglês");
    expect(html).not.toContain("O professor libera");
    expect(html).not.toContain("24 práticas");
    const review = renderToStaticMarkup(createElement(Presentation, { review: true, onFinish: () => {} }));
    expect(review).toContain("Voltar ao painel");
    expect(review).not.toMatch(/aria-label="Etapa 5: Meu painel"[^>]*disabled=""/);
  });
  it("unlocks scene shortcuts only after reaching them, retaining visited scenes after going back", () => {
    expect(presentationSteps.map((_, i) => canVisitPresentationScene(i, 0, false))).toEqual([true, false, false, false, false]);
    expect(canVisitPresentationScene(1, 1, false)).toBe(false);
    expect(canVisitPresentationScene(1, 2, false)).toBe(true);
    expect(canVisitPresentationScene(4, 7, false)).toBe(false);
    expect(canVisitPresentationScene(4, 8, false)).toBe(true);
    expect(canVisitPresentationScene(3, 6, false)).toBe(true);
    expect(presentationSteps.every((_, i) => canVisitPresentationScene(i, 0, true))).toBe(true);
  });
  it("explains the real journey and the exact one-hour, one-per-account benefit", () => {
    const copy = presentationFrames.map(frame => `${frame.title} ${frame.description}`).join(" ");
    for (const value of ["Lucas", "microfone", "Três apoios", "Guiado", "Com pistas", "Mais autônomo", "oito blocos", "24 práticas", "100%", "Uma hora", "uma aula por conta", "confirmação", "Meu painel", "Sua conta está pronta"]) expect(copy.toLowerCase()).toContain(value.toLowerCase());
  });
  it("breaks five scenes into short click-led frames instead of showing every explanation together", () => {
    expect(presentationSteps).toHaveLength(5);
    expect(presentationFrames).toHaveLength(9);
    expect(presentationSteps.map((_, i) => presentationSceneStart(i))).toEqual([0, 2, 4, 6, 8]);
    for (const frame of presentationFrames) {
      expect(frame.description.split(/\s+/).length).toBeLessThanOrEqual(22);
      expect(frame.title.split("|")).toHaveLength(2);
    }
    expect(presentationFrames[1].description).toContain("Sua conta está pronta");
    expect(presentationFrames[1].description).not.toContain("sem cadastro");
    expect(presentationFrames[1].title).toBe("Tudo pronto.|A conversa é sua.");
    expect(presentationFrames.map(frame => `${frame.title} ${frame.description}`).join(" ")).not.toMatch(/aprova|aguardando|professor libera|conta criada/i);
    expect(presentationFrames[7].description).toContain("acompanhe a confirmação");
  });
});

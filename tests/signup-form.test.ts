import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }));
vi.mock("@/client/auth/service", () => ({ register: vi.fn(), login: vi.fn(), loginWithGoogle: vi.fn(), resetPassword: vi.fn() }));
import { SignupForm } from "@/features/landing/SignupForm";

describe("new student account entry", () => {
  it("explains teacher approval before registration without an extra required profile step", () => {
    const html = renderToStaticMarkup(createElement(SignupForm, { initialMode: "signup" }));
    expect(html).toContain("professor aprova seu acesso");
    expect(html).toContain("aguarde a aprovação do professor no seu painel");
    expect(html).toContain("Continuar com Google");
    expect(html).toContain("Criar conta e continuar");
    expect(html).not.toContain('name="name"');
  });
  it("keeps login distinct from a new registration", () => {
    const html = renderToStaticMarkup(createElement(SignupForm, { initialMode: "login" }));
    expect(html).toContain("Entrar no meu painel");
    expect(html).not.toContain('class="signup-approval-note"');
  });
});

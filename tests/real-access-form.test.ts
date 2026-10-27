import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }));
vi.mock("@/client/auth/service", () => ({ login: vi.fn(), register: vi.fn(), resetPassword: vi.fn() }));
import { SignupForm } from "@/features/landing/SignupForm";
import { MoreInformation } from "@/features/landing/MoreInformation";

describe("real access form replaces decorative access", () => {
  it("requires email and password for registration without a Google access option", () => {
    const html = renderToStaticMarkup(createElement(SignupForm, { initialMode: "signup" }));
    expect(html).toContain('type="email"');
    expect(html).toContain('autoComplete="new-password"');
    expect(html).toContain('minLength="6"');
    expect(html.match(/required=""/g)).toHaveLength(2);
    expect(html).toContain("Criar conta e continuar");
    expect(html).not.toContain("Google");
    expect(html).not.toContain("signup-divider");
    expect(html).not.toContain("noValidate");
    expect(html).not.toContain("Pode continuar sem preencher");
  });
  it("requires credentials for login and preserves the recovery option", () => {
    const html = renderToStaticMarkup(createElement(SignupForm, { initialMode: "login" }));
    expect(html).toContain('autoComplete="current-password"');
    expect(html.match(/required=""/g)).toHaveLength(2);
    expect(html).toContain("Entrar no meu painel");
    expect(html).toContain("Esqueci minha senha");
    expect(html).not.toContain("PRÉVIA VISUAL");
    expect(html).not.toContain("Google");
  });
  it("describes only email and password in the landing account explanation", () => {
    const html = renderToStaticMarkup(createElement(MoreInformation));
    expect(html).toContain("Com e-mail e senha.");
    expect(html).not.toContain("Google");
  });
});

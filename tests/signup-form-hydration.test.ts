// @vitest-environment jsdom
import { act, createElement, type ReactNode } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignupForm } from "@/features/landing/SignupForm";
import { login, loginWithGoogle, register, resetPassword } from "@/client/auth/service";

const router = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/components/core/AutoFit", () => ({ AutoFit: ({ children }: { children: ReactNode }) => children }));
vi.mock("@/client/auth/service", () => ({
  login: vi.fn(), loginWithGoogle: vi.fn(), register: vi.fn(), resetPassword: vi.fn(),
}));

let host: HTMLDivElement;
let root: Root | undefined;
const form = () => host.querySelector("form")!;
const submitButton = () => host.querySelector<HTMLButtonElement>(".signup-submit")!;
const email = "aluno@example.invalid";
const password = "ficticio-para-teste";

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.clearAllMocks();
  host = document.createElement("div");
  document.body.append(host);
});
afterEach(async () => {
  if (root) await act(async () => root?.unmount());
  root = undefined;
  host.remove();
  vi.unstubAllGlobals();
});

async function hydrate(mode: "login" | "signup") {
  const tree = createElement(SignupForm, { initialMode: mode });
  host.innerHTML = renderToString(tree);
  expect(form().method).toBe("post");
  const fields = form().querySelectorAll("input");
  expect([...fields].every(input => input.matches(":disabled"))).toBe(true);
  expect(submitButton().form).toBe(form());
  expect(submitButton().disabled).toBe(true);
  // Disabled fields are excluded from native form data, even if a browser restores their values.
  fields.forEach(input => { input.value = "restored"; });
  expect([...new FormData(form()).keys()]).toEqual([]);
  submitButton().click();
  expect(login).not.toHaveBeenCalled();
  expect(register).not.toHaveBeenCalled();
  await act(async () => { root = hydrateRoot(host, tree); });
  expect(submitButton().disabled).toBe(false);
  expect(form().querySelector("fieldset")!.disabled).toBe(false);
  expect(form().method).toBe("post");
}

describe("account form during hydration", () => {
  it.each(["login", "signup"] as const)("enables the external %s button only after hydration", async mode => {
    await hydrate(mode);
    form().querySelector<HTMLInputElement>('[name="email"]')!.value = email;
    form().querySelector<HTMLInputElement>('[name="password"]')!.value = password;
    vi.mocked(login).mockResolvedValue({ success: true });
    vi.mocked(register).mockResolvedValue({ success: true });
    await act(async () => { submitButton().click(); });
    if (mode === "login") expect(login).toHaveBeenCalledWith(email, password);
    else expect(register).toHaveBeenCalledWith("Usuário", email, password, password);
    expect(router.replace).toHaveBeenCalledWith("/dashboard");
  });

  it("handles recovery through the hydrated form and keeps Google sign-in available", async () => {
    await hydrate("login");
    vi.mocked(loginWithGoogle).mockResolvedValue({ success: true });
    await act(async () => { host.querySelector<HTMLButtonElement>(".signup-google")!.click(); });
    expect(loginWithGoogle).toHaveBeenCalledOnce();
    await act(async () => { host.querySelector<HTMLButtonElement>(".signup-forgot")!.click(); });
    expect(form().querySelector('[name="password"]')).toBeNull();
    expect(form().method).toBe("post");
    form().querySelector<HTMLInputElement>('[name="email"]')!.value = email;
    vi.mocked(resetPassword).mockResolvedValue({ success: true });
    const enter = new Event("submit", { bubbles: true, cancelable: true });
    await act(async () => { form().dispatchEvent(enter); });
    expect(enter.defaultPrevented).toBe(true);
    expect(resetPassword).toHaveBeenCalledWith(email);
    expect(host.querySelector('[role="status"]')?.textContent).toContain("link para criar uma nova senha");
  });
});

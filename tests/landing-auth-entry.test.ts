import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ cookie: undefined as string | undefined, verify: vi.fn(), db: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => mocks.cookie ? { value: mocks.cookie } : undefined }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), redirect: (target: string) => { throw new Error(`REDIRECT:${target}`); } }));
vi.mock("@/server/firebase", () => ({ getAdminAuth: () => ({ verifySessionCookie: mocks.verify }), getAdminDb: mocks.db }));
vi.mock("@/features/landing/SignupForm", () => ({ SignupForm: ({ initialMode }: { initialMode: string }) => createElement("div", { "data-mode": initialMode }) }));

import StartPage from "@/app/comecar/page";
import HomePage from "@/app/page";

beforeEach(() => { mocks.cookie = undefined; vi.clearAllMocks(); });

describe("returning through the home page", () => {
  it("keeps the public landing and sign-in link without contacting Firebase for an anonymous visitor", async () => {
    const html = renderToStaticMarkup(await HomePage());
    expect(html).toContain('href="/comecar?modo=entrar"');
    expect(html).toContain("Começar a conversa");
    expect(mocks.verify).not.toHaveBeenCalled();
    expect(mocks.db).not.toHaveBeenCalled();
  });

  it("opens the dashboard directly for an existing verified session without another sign-in click", async () => {
    mocks.cookie = "existing-session";
    mocks.verify.mockResolvedValueOnce({ uid: "existing-user" });
    await expect(HomePage()).rejects.toThrow("REDIRECT:/dashboard");
    expect(mocks.verify).toHaveBeenCalledExactlyOnceWith("existing-session", true);
    expect(mocks.db).not.toHaveBeenCalled();
  });

  for (const reason of ["expired", "revoked", "forged"]) it(`keeps sign-in available for a ${reason} session`, async () => {
    mocks.cookie = `${reason}-session`;
    mocks.verify.mockRejectedValueOnce(new Error(reason));
    const html = renderToStaticMarkup(await HomePage());
    expect(html).toContain('href="/comecar?modo=entrar"');
    expect(mocks.verify).toHaveBeenCalledWith(`${reason}-session`, true);
    expect(mocks.db).not.toHaveBeenCalled();
  });
});

describe("landing account entry", () => {
  it("offers registration without contacting Firebase when no session is present", async () => {
    const html = renderToStaticMarkup(await StartPage({ searchParams: Promise.resolve({}) }));
    expect(html).toContain('data-mode="signup"');
    expect(mocks.verify).not.toHaveBeenCalled();
  });

  it("offers sign-in for the explicit Entrar link", async () => {
    const html = renderToStaticMarkup(await StartPage({ searchParams: Promise.resolve({ modo: "entrar" }) }));
    expect(html).toContain('data-mode="login"');
  });

  it("skips registration only after verifying the existing session, including revocation", async () => {
    mocks.cookie = "existing-session";
    mocks.verify.mockResolvedValueOnce({ uid: "existing-user" });
    await expect(StartPage({ searchParams: Promise.resolve({}) })).rejects.toThrow("REDIRECT:/dashboard");
    expect(mocks.verify).toHaveBeenCalledWith("existing-session", true);
  });

  it("lets an expired or forged session sign in again", async () => {
    mocks.cookie = "expired-or-forged";
    mocks.verify.mockRejectedValueOnce(new Error("Invalid session"));
    const html = renderToStaticMarkup(await StartPage({ searchParams: Promise.resolve({ modo: "entrar" }) }));
    expect(html).toContain('data-mode="login"');
    expect(mocks.verify).toHaveBeenCalledWith("expired-or-forged", true);
  });
});

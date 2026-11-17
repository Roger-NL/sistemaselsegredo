// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { BrowserText } from "@/components/i18n/BrowserText";
import { TeacherThread } from "@/features/dashboard/TeacherContact";
import type { TeacherConversation } from "@/contracts/workspace";
let root: Root, host: HTMLDivElement;
beforeEach(() => { vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); });
function translate(target: Element) { const font = document.createElement("font"); font.textContent = target.textContent; target.replaceChildren(font); }
it("keeps a changed account status current after native translation replaces its text nodes", async () => {
  const render = (value: string) => act(async () => root.render(createElement("p", { role: "status" }, createElement(BrowserText, null, value))));
  await render("Salvando seu avanço…"); const old = host.querySelector("[data-ui-text]")!; translate(old);
  await render("Seu avanço foi salvo."); old.textContent = "Delayed old translation";
  expect(host.textContent).toBe("Seu avanço foi salvo."); expect(old.isConnected).toBe(false);
  translate(host.querySelector("[data-ui-text]")!); await render(""); expect(host.querySelector("p")?.childNodes).toHaveLength(0);
});
it("preserves new teacher messages when a translated older message finishes late", async () => {
  const thread = (body: string): TeacherConversation => ({ id: "thread", userId: "student", userName: "", userEmail: "", subject: "Dúvida", status: "answered", createdAt: "2026-11-01", updatedAt: "2026-11-02", messages: [{ id: "message", role: "manager", authorId: "teacher", authorName: "Professor", body, at: "2026-11-02" }] });
  await act(async () => root.render(createElement(TeacherThread, { conversation: thread("Primeira orientação") })));
  const old = host.querySelector('.student-messages p [data-ui-text]')!; translate(old);
  await act(async () => root.render(createElement(TeacherThread, { conversation: thread("Orientação atualizada") })));
  old.textContent = "Delayed translation"; expect(host.textContent).toContain("Orientação atualizada"); expect(host.textContent).not.toContain("Delayed translation");
});
it("declares the source language without injecting translation or patching browser prototypes", () => {
  const layout = readFileSync("src/app/layout.tsx", "utf8"); expect(layout).toContain('lang="pt-BR" translate="yes"'); expect(layout).not.toMatch(/notranslate|translate\.google|googtrans|Node\.prototype/);
});

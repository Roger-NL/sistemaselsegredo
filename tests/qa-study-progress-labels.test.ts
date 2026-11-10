// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UserRecord } from "firebase-admin/auth";

vi.mock("@/features/superuser/TestControls", () => ({ TestControls: () => null }));
import { Presentation } from "@/features/onboarding/Presentation";
import { StudentFollowUp } from "@/features/admin/StudentFollowUp";
import { managementUser } from "@/server/management/service";
import { studySteps } from "@/features/theory/progress";

let root: Root;
let container: HTMLElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  window.scrollTo = vi.fn();
  window.matchMedia = vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })) as unknown as typeof window.matchMedia;
  document.body.innerHTML = '<div id="root"></div>';
  container = document.getElementById("root")!;
  root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); vi.unstubAllGlobals(); });

describe("study progress is presented as stages, not all as exercises", () => {
  it("keeps the illustrated count aligned with the presentation's stage description", async () => {
    await act(async () => root.render(createElement(Presentation, { onFinish: vi.fn() })));
    for (let index = 0; index < 5; index++) {
      const next = [...container.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent?.trim() === "Continuar");
      expect(next).toBeDefined();
      await act(async () => next!.click());
    }
    const illustration = container.querySelector(".presentation-study-number");
    expect(illustration?.querySelector("strong")?.textContent).toBe(String(studySteps.length));
    expect(illustration?.textContent).toContain("etapas");
    expect(illustration?.textContent).not.toContain("práticas");
    expect(container.querySelector(".presentation-description")?.textContent).toContain(`${studySteps.length} etapas`);
  });

  it("describes the same progress count as stages in the teacher's student view", async () => {
    const identity = { uid: "student-qa", displayName: "Aluno de teste", email: "qa@example.invalid", disabled: false, customClaims: {}, metadata: {} } as UserRecord;
    const user = managementUser(identity, { accountStatus: "active" }, {}, null);
    await act(async () => root.render(createElement(StudentFollowUp, {
      users: [user], conversations: [], stage: "all", onStageChange: vi.fn(), onManage: vi.fn(), onSchedule: vi.fn(), onMessages: vi.fn(),
    })));
    const study = [...container.querySelectorAll(".admin-followup-progress > div")].find(item => item.querySelector("dt")?.textContent === "Estudo guiado");
    expect(study?.querySelector("progress")?.getAttribute("max")).toBe(String(studySteps.length));
    expect(study?.querySelector("dd")?.textContent).toContain("etapas");
    expect(study?.querySelector("dd")?.textContent).not.toContain("práticas");
  });
});

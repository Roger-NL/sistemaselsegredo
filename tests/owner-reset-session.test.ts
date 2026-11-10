// @vitest-environment jsdom
import { act, createElement, Fragment } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StudentWorkspace } from "@/contracts/workspace";
import type { createWorkspaceStore as StoreFactory } from "@/features/dashboard/workspace-store";

const mocks = vi.hoisted(() => ({ pathname: "/demo/estudo", store: null as ReturnType<typeof StoreFactory> | null }));
vi.mock("next/navigation", () => ({ usePathname: () => mocks.pathname }));
vi.mock("@/features/superuser/TestControls", () => ({ TestControlsOverlay: () => null }));
vi.mock("@/features/dashboard/LearningConflict", () => ({ LearningConflict: () => null }));
vi.mock("@/features/dashboard/workspace-store", async importOriginal => {
  const actual = await importOriginal<typeof import("@/features/dashboard/workspace-store")>();
  return { ...actual, get studentWorkspace() { return mocks.store; } };
});
import { createWorkspaceStore } from "@/features/dashboard/workspace-store";
import { StudentWorkspaceSession } from "@/features/dashboard/StudentWorkspaceSession";
import { useStudentWorkspace } from "@/features/dashboard/use-student-workspace";
import { shouldPollWorkspace } from "@/features/dashboard/workspace-refresh";
import { StudentSections } from "@/features/dashboard/StudentSections";

const data = (revision = 0, canTest = true): StudentWorkspace => ({
  account: { id: "owner", name: "QA", email: "qa@example.invalid", role: "manager", status: "active", canTest },
  learning: { revision, saveVersion: revision, demoSnapshot: null, studySnapshot: null, studyCompleted: revision ? 0 : 24, studyTotal: 24, demoPercent: 0, updatedAt: null },
  activities: [], conversations: [], liveClass: null,
});
let root: Root, container: HTMLDivElement;
function Readout() {
  const { workspace } = useStudentWorkspace();
  return createElement("output", null, `${workspace?.learning.studyCompleted ?? "loading"}/${workspace?.learning.studyTotal ?? 24}`);
}
beforeEach(() => {
  vi.useFakeTimers(); vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
  mocks.pathname = "/demo/estudo";
  container = document.createElement("div"); document.body.appendChild(container); root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount()); container.remove(); mocks.store?.reset();
  vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals();
});
async function mount() {
  await act(async () => root.render(createElement(Fragment, null, createElement(StudentWorkspaceSession), createElement(Readout))));
}

describe("visible owner account on a second device", () => {
  it("updates the study within five seconds and invalidates the presentation cache after a remote reset", async () => {
    let remote = data();
    const fetcher = vi.fn(async () => new Response(JSON.stringify(remote), { status: 200 }));
    mocks.store = createWorkspaceStore(fetcher);
    const changed = vi.fn(); window.addEventListener("basedspeak.presentation.changed", changed);
    try {
      await mount(); expect(container.textContent).toBe("24/24");
      remote = data(1);
      await act(async () => vi.advanceTimersByTimeAsync(5_000));
      expect(container.textContent).toBe("0/24");
      expect(changed).toHaveBeenCalledOnce();
      expect(mocks.store.getSnapshot().generation).toBeGreaterThan(0);
    } finally { window.removeEventListener("basedspeak.presentation.changed", changed); }
  });

  it("validates a same-browser hint without discarding a same-revision draft", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify(data()), { status: 200 }));
    mocks.store = createWorkspaceStore(fetcher);
    await mount();
    const generation = mocks.store.getSnapshot().generation;
    mocks.store.beginEdit(generation);
    await act(async () => window.dispatchEvent(new StorageEvent("storage", { key: "basedspeak.test-progress.changed", newValue: "untrusted hint" })));
    expect(mocks.store.getSnapshot().generation).toBe(generation);
    expect(mocks.store.hasPendingChanges()).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("invalidates the presentation after a reset PUT response temporarily clears the workspace", async () => {
    let finishRead!: (value: Response) => void;
    let reads = 0;
    const fetcher = vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method === "PUT") return new Response(JSON.stringify({ error: "reset" }), { status: 409 });
      if (++reads === 3) return new Promise<Response>(resolve => { finishRead = resolve; });
      return new Response(JSON.stringify(data()), { status: 200 });
    });
    mocks.store = createWorkspaceStore(fetcher);
    const changed = vi.fn(); window.addEventListener("basedspeak.presentation.changed", changed);
    try {
      await mount();
      const generation = mocks.store.getSnapshot().generation;
      await act(async () => { mocks.store!.stage("studySnapshot", "old-draft", generation); });
      let saving!: Promise<void>;
      await act(async () => { saving = mocks.store!.flush(); await vi.advanceTimersByTimeAsync(0); });
      expect(mocks.store.getSnapshot().workspace).toBeNull();
      await act(async () => { finishRead(new Response(JSON.stringify(data(1)), { status: 200 })); await saving; });
      expect(container.textContent).toBe("0/24");
      expect(changed).toHaveBeenCalledOnce();
    } finally { window.removeEventListener("basedspeak.presentation.changed", changed); }
  });

  it("does not add owner polling to an ordinary active student's practice", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify(data(0, false)), { status: 200 }));
    mocks.store = createWorkspaceStore(fetcher);
    await mount(); await act(async () => vi.advanceTimersByTimeAsync(60_000));
    expect(fetcher).toHaveBeenCalledOnce();
    for (const route of ["/dashboard", "/demo", "/demo/estudo", "/adm"]) expect(shouldPollWorkspace(route, "active", true)).toBe(true);
    expect(shouldPollWorkspace("/comecar", "active", true)).toBe(false);
    expect(shouldPollWorkspace("/demo/estudo", "active", false)).toBe(false);
  });

  it("clears booking and contact UI on the owner's new epoch, ignoring an older booking response", async () => {
    const booking = { id: "old-booking", userId: "owner", studentName: "QA", studentEmail: "qa@example.invalid", revision: 0, status: "pending", start: "2026-12-01T10:00:00Z", end: "2026-12-01T11:00:00Z", timezone: "Europe/Lisbon", reason: "", meetingUrl: "", createdAt: "2026-11-01", updatedAt: "2026-11-01" };
    const availability = { userId: "owner", eligible: false, completed: 24, total: 24, month: "2026-12", timezone: "Europe/Lisbon", booking, slots: [] };
    let oldReply!: (value: Response) => void;
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(availability), { status: 200 }))
      .mockImplementationOnce(() => new Promise<Response>(resolve => { oldReply = resolve; }))
      .mockResolvedValue(new Response(JSON.stringify({ ...availability, booking: null, completed: 0 }), { status: 200 }));
    vi.stubGlobal("fetch", fetcher);
    mocks.store = createWorkspaceStore(async () => new Response(JSON.stringify(data()), { status: 200 }));
    await act(async () => root.render(createElement(StudentSections, { workspace: data(), disabled: false })));
    expect(container.querySelector(".live-class-booking")).not.toBeNull();
    const subject = container.querySelector<HTMLInputElement>('[name="subject"]')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(subject, "Old draft");
      subject.dispatchEvent(new Event("input", { bubbles: true }));
      window.dispatchEvent(new Event("focus"));
    });
    await act(async () => root.render(createElement(StudentSections, { workspace: data(1), disabled: false })));
    expect(container.querySelector(".live-class-booking")).toBeNull();
    expect(container.querySelector<HTMLInputElement>('[name="subject"]')!.value).toBe("");
    await act(async () => oldReply(new Response(JSON.stringify(availability), { status: 200 })));
    expect(container.querySelector(".live-class-booking")).toBeNull();
    expect(container.textContent).toContain("0 de 24 etapas");
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { subscribeWorkspaceRefresh } from "@/features/dashboard/workspace-refresh";

afterEach(() => vi.useRealTimers());
describe("visible student workspace updates", () => {
  it("polls the panel, pauses when hidden and cleans up on navigation", () => {
    vi.useFakeTimers();
    const browser = new EventTarget(), page = Object.assign(new EventTarget(), { visibilityState: "visible" });
    const refresh = vi.fn(), stop = subscribeWorkspaceRefresh(refresh, true, browser, page);
    vi.advanceTimersByTime(30_000); expect(refresh).toHaveBeenCalledTimes(1);
    page.visibilityState = "hidden";
    vi.advanceTimersByTime(60_000); browser.dispatchEvent(new Event("focus"));
    expect(refresh).toHaveBeenCalledTimes(1);
    page.visibilityState = "visible"; page.dispatchEvent(new Event("visibilitychange"));
    expect(refresh).toHaveBeenCalledTimes(2);
    stop(); vi.advanceTimersByTime(30_000); browser.dispatchEvent(new Event("online"));
    expect(refresh).toHaveBeenCalledTimes(2);
  });
  it("refreshes on reconnect during study without polling the practice", () => {
    vi.useFakeTimers();
    const browser = new EventTarget(), page = Object.assign(new EventTarget(), { visibilityState: "visible" });
    const refresh = vi.fn(), stop = subscribeWorkspaceRefresh(refresh, false, browser, page);
    vi.advanceTimersByTime(60_000); expect(refresh).not.toHaveBeenCalled();
    browser.dispatchEvent(new Event("online")); expect(refresh).toHaveBeenCalledTimes(1);
    stop();
  });
});

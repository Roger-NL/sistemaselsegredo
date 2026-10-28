/** Refresh quietly while visible; polling is reserved for the dashboard. */
export function subscribeWorkspaceRefresh(refresh: () => void, poll: boolean, browser: EventTarget = window, page: EventTarget & { visibilityState: string } = document) {
  const visible = () => { if (page.visibilityState !== "hidden") refresh(); };
  browser.addEventListener("focus", visible);
  browser.addEventListener("online", visible);
  page.addEventListener("visibilitychange", visible);
  const interval = poll ? setInterval(visible, 30_000) : undefined;
  return () => {
    clearInterval(interval);
    browser.removeEventListener("focus", visible);
    browser.removeEventListener("online", visible);
    page.removeEventListener("visibilitychange", visible);
  };
}

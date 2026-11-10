export function shouldPollWorkspace(pathname: string, accountStatus?: string, canTest = false) {
  if (canTest && ["/dashboard", "/demo", "/demo/estudo", "/adm"].includes(pathname)) return true;
  return pathname === "/dashboard" || ((pathname === "/demo" || pathname === "/demo/estudo") && accountStatus === "pending");
}

/** Refresh quietly while visible; only the test owner polls during active practice. */
export function subscribeWorkspaceRefresh(refresh: () => void, poll: boolean, browser: EventTarget = window, page: EventTarget & { visibilityState: string } = document, intervalMs = 30_000) {
  const visible = () => { if (page.visibilityState !== "hidden") refresh(); };
  browser.addEventListener("focus", visible);
  browser.addEventListener("online", visible);
  page.addEventListener("visibilitychange", visible);
  const interval = poll ? setInterval(visible, intervalMs) : undefined;
  return () => {
    clearInterval(interval);
    browser.removeEventListener("focus", visible);
    browser.removeEventListener("online", visible);
    page.removeEventListener("visibilitychange", visible);
  };
}

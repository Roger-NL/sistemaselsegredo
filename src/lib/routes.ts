import { isRetiredPage } from "./page-aliases";
export const ROUTES = { home: "/", start: "/comecar", demo: "/demo", terms: "/termos", privacy: "/privacidade" } as const;

/** Future authenticated pages must choose an explicit, safe callback. No old dashboard default. */
export function isSafeInternalCallbackPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//") && !/[\\\u0000-\u0020]/.test(path)
    && !path.startsWith("/api/") && path !== "/api" && !isRetiredPage(path.split(/[?#]/, 1)[0]);
}

import { isRetiredPage } from "./page-aliases";
export const ROUTES = { home: "/", start: "/comecar", dashboard: "/dashboard", demo: "/demo", terms: "/termos", privacy: "/privacidade" } as const;

/** Only active internal pages can be used as authentication callbacks. */
export function isSafeInternalCallbackPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//") && !/[\\\u0000-\u0020]/.test(path)
    && !path.startsWith("/api/") && path !== "/api" && !isRetiredPage(path.split(/[?#]/, 1)[0]);
}

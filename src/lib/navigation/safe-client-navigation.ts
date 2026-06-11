type ClientRouter = {
  push: (href: string) => void;
  replace?: (href: string) => void;
  prefetch?: (href: string) => void;
};

type SafeNavigationOptions = {
  method?: "push" | "replace";
  delayMs?: number;
};

type WindowWithIdleCallback = Window &
  typeof globalThis & {
    requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

export function navigateWithMobileFallback(
  router: ClientRouter,
  href: string,
  options: SafeNavigationOptions = {}
) {
  const { method = "push", delayMs = 180 } = options;

  if (method === "replace" && router.replace) {
    router.replace(href);
  } else {
    router.push(href);
  }

  if (typeof window === "undefined") return;

  window.setTimeout(() => {
    const target = new URL(href, window.location.origin);
    const targetPath = `${target.pathname}${target.search}${target.hash}`;
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (currentPath !== targetPath) {
      if (method === "replace") {
        window.location.replace(href);
      } else {
        window.location.assign(href);
      }
    }
  }, delayMs);
}

export function prefetchClientRoute(router: ClientRouter, href: string) {
  try {
    router.prefetch?.(href);
  } catch {
    // Prefetch is a best-effort warmup. Navigation must never depend on it.
  }
}

export function prefetchClientRoutesDuringIdle(router: ClientRouter, hrefs: string[]) {
  if (typeof window === "undefined") return;

  const uniqueHrefs = Array.from(new Set(hrefs.filter(Boolean)));
  if (uniqueHrefs.length === 0) return;

  const run = () => {
    uniqueHrefs.forEach((href) => prefetchClientRoute(router, href));
  };

  const idleWindow = window as WindowWithIdleCallback;

  if (typeof idleWindow.requestIdleCallback === "function") {
    const idleCallback = idleWindow.requestIdleCallback(run, { timeout: 1800 });
    return () => idleWindow.cancelIdleCallback?.(idleCallback);
  }

  const timeoutId = window.setTimeout(run, 300);
  return () => window.clearTimeout(timeoutId);
}

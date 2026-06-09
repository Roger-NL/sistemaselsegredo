type ClientRouter = {
  push: (href: string) => void;
  replace?: (href: string) => void;
};

type SafeNavigationOptions = {
  method?: "push" | "replace";
  delayMs?: number;
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

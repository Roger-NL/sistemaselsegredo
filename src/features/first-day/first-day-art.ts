import { art, cleanReadingMedia, coverSources, pages, storyImage, usesCleanReading, type FirstDayPage } from "./content";

function sceneArt(page: FirstDayPage, portrait: boolean) {
  const cleanReading = portrait && usesCleanReading(page);
  switch (page.kind) {
    case "Ação": {
      const image = storyImage(page, cleanReading);
      return !cleanReading && page.detail ? [image.src, page.detail.src] : [image.src];
    }
    case "Reação":
    case "Desafio": return [storyImage(page, cleanReading).src];
    case "Tirinha": return page.panels.map(panel => panel.image.src);
    case "Explicação": return page.examples.map(example => example.image.src);
    case "Em preparação": return [];
  }
}

const pageImages = pages.map(page => sceneArt(page, false));
const portraitImages = pages.map(page => sceneArt(page, true));

function currentPageImages() {
  return window.matchMedia(cleanReadingMedia).matches ? portraitImages : pageImages;
}

function firstDayArtFor(position: number) {
  if (position === 0) {
    return [coverSources.find(({ media }) => window.matchMedia(media).matches)?.src ?? art.cover.src];
  }
  return currentPageImages()[position - 1] ?? [];
}

function whenIdle(task: () => void) {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(task, { timeout: 750 });
    return () => window.cancelIdleCallback(id);
  }

  const id = window.setTimeout(task, 180);
  return () => window.clearTimeout(id);
}

export function createFirstDayArtCache() {
  type Entry = { image: HTMLImageElement; loaded: Promise<boolean>; ready: boolean; failed: boolean };
  const cache = new Map<string, Entry>();

  function load(src: string, priority: "high" | "low") {
    const existing = cache.get(src);
    if (existing && !existing.failed) {
      if (priority === "high") existing.image.fetchPriority = "high";
      return existing;
    }

    const image = new Image();
    image.fetchPriority = priority;
    image.decoding = "async";
    const entry: Entry = { image, loaded: Promise.resolve(false), ready: false, failed: false };
    entry.loaded = new Promise(resolve => {
      const finish = (success: boolean) => {
        clearTimeout(timer);
        image.onload = null;
        image.onerror = null;
        entry.ready = success;
        entry.failed = !success;
        resolve(success);
      };
      const timer = window.setTimeout(() => finish(false), 15000);
      image.onerror = () => finish(false);
      image.onload = () => {
        image.decode().catch(() => {}).then(() => {
          if (!entry.failed) finish(image.naturalWidth > 0);
        });
      };
    });
    cache.set(src, entry);
    image.src = src;
    return entry;
  }

  return {
    warm(position: number) {
      const next = Math.max(0, position) + 1;
      const upcoming = firstDayArtFor(next);
      // Reaction pages can be turned immediately. Get the page beyond them
      // ready while the reader is still on the cover or doing the exercise.
      const followUp = pages[next - 1]?.kind === "Reação" ? firstDayArtFor(next + 1)
        : position === 0 && pages[next]?.kind === "Reação"
          ? [...firstDayArtFor(next + 1), ...firstDayArtFor(next + 2)]
          : [];
      let cancelled = false;
      let cancelIdle: (() => void) | undefined;
      function queueNextPage() {
        if (cancelled || upcoming.length === 0) return;
        cancelIdle = whenIdle(() => {
          const entries = upcoming.map(src => load(src, "low"));
          if (followUp.length === 0) return;
          void Promise.all(entries.map(entry => entry.loaded)).then(() => {
            if (!cancelled) followUp.forEach(src => load(src, "low"));
          });
        });
      }

      if (position < 0) {
        const [cover] = firstDayArtFor(0);
        // Keep the first screen responsive while the cover loads. Warming
        // the next scene can wait until the cover has decoded.
        const entry = load(cover, "high");
        if (entry.ready) queueNextPage();
        else void entry.loaded.then(queueNextPage);
      } else {
        queueNextPage();
      }

      return () => {
        cancelled = true;
        cancelIdle?.();
      };
    },
    prepare(position: number) {
      const targets = firstDayArtFor(position).map(src => load(src, "high"));
      return targets.every(target => target.ready) ? null : Promise.all(targets.map(target => target.loaded));
    },
  };
}

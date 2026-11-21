import { art, cleanReadingMedia, coverSources, pages, storyImage, usesCleanReading, type FirstDayPage } from "./content";

function sceneArt(page: FirstDayPage, portrait: boolean) {
  const cleanReading = portrait && usesCleanReading(page);
  switch (page.kind) {
    case "Ação": {
      const image = storyImage(page, cleanReading);
      return !cleanReading && page.detail ? [image.src, page.detail.src] : [image.src];
    }
    case "Reação": return [storyImage(page, cleanReading).src];
    case "Desafio": return [page.image.src];
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
    warm() {
      firstDayArtFor(0).forEach(src => load(src, "high"));
      firstDayArtFor(1).forEach(src => load(src, "high"));
      const remaining = new Set(currentPageImages().slice(1).flat());
      remaining.forEach(src => load(src, "low"));
    },
    prepare(position: number) {
      const targets = firstDayArtFor(position).map(src => load(src, "high"));
      return targets.every(target => target.ready) ? null : Promise.all(targets.map(target => target.loaded));
    },
  };
}

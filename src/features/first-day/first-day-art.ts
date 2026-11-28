import { art, coverSources, pages, partOnePortraitMedia, storyImage, tallComicStripMedia, type FirstDayPage } from "./content";

function sceneArt(page: FirstDayPage, portrait: boolean) {
  if ("edition" in page) {
    switch (page.kind) {
      case "História": return page.panels.map(panel => storyImage(panel.art, portrait).src);
      case "Tirinha": return page.panels.map(panel => storyImage(panel.art, portrait).src);
      case "Explicação": return page.examples.map(example => storyImage(example.art, portrait).src);
      case "Desafio": return page.closing?.map(panel => storyImage(panel.art, portrait).src) ?? [storyImage(page.art, portrait).src];
    }
  }
  if (page.part !== 1) {
    switch (page.kind) {
      case "Ação": return [page.before, page.after].map(art => storyImage(art, portrait).src);
      case "Tirinha": return page.panels.map(panel => storyImage(panel.art, portrait).src);
      case "Explicação": return page.examples.map(example => storyImage(example.art, portrait).src);
      case "Desafio": {
        const panels = page.rounds.map(round => round.art);
        if (page.partialRequest) panels.push(page.partialRequest.revealArt);
        return panels.map(panel => storyImage(panel, portrait).src);
      }
    }
  }
  switch (page.kind) {
    case "Ação": {
      const image = storyImage(page, portrait);
      return !portrait && page.detail ? [image.src, page.detail.src] : [image.src];
    }
    case "Reação":
    case "Desafio": return [storyImage(page, portrait).src];
    case "Tirinha": return page.panels.map(panel => storyImage(panel, portrait).src);
    case "Explicação": return page.examples.map(example => storyImage(example, portrait).src);
  }
}

const pageImages = pages.map(page => sceneArt(page, false));
const portraitImages = pages.map(page => sceneArt(page, true));

function firstDayArtFor(position: number) {
  if (position === 0) {
    return [coverSources.find(({ media }) => window.matchMedia(media).matches)?.src ?? art.cover.src];
  }
  const index = position - 1;
  const page = pages[index];
  const portrait = window.matchMedia(partOnePortraitMedia).matches
    || ((page?.kind === "Tirinha" && page.part !== 1 || page?.kind === "Explicação" && "edition" in page)
      && window.matchMedia(tallComicStripMedia).matches);
  return (portrait ? portraitImages : pageImages)[index] ?? [];
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
  const decodedImageLimit = 12;

  function load(src: string, priority: "high" | "low") {
    const existing = cache.get(src);
    if (existing && !existing.failed) {
      cache.delete(src);
      cache.set(src, existing);
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
    for (const [source, previous] of cache) {
      if (cache.size <= decodedImageLimit) break;
      if (previous.ready || previous.failed) cache.delete(source);
    }
    image.src = src;
    return entry;
  }

  return {
    warm(position: number) {
      const next = Math.max(0, position) + 1;
      const upcoming = firstDayArtFor(next);
      const current = pages[position - 1];
      const portrait = window.matchMedia(partOnePortraitMedia).matches;
      const reveal = current?.kind !== "Desafio" ? []
        : "edition" in current ? current.closing?.map(panel => storyImage(panel.art, portrait).src) ?? []
        : current.part !== 1 && current.partialRequest ? [storyImage(current.partialRequest.revealArt, portrait).src] : [];
      // Reaction pages can be turned immediately. Get the page beyond them
      // ready while the reader is still on the cover or doing the exercise.
      const followUp = pages[next - 1]?.kind === "Reação" ? firstDayArtFor(next + 1)
        : position <= 0 && pages[next]?.kind === "Reação"
          ? [...firstDayArtFor(next + 1), ...(position === 0 ? firstDayArtFor(next + 2) : [])]
          : [];
      let cancelled = false;
      let cancelIdle: (() => void) | undefined;
      function queueNextPage() {
        if (cancelled || (upcoming.length === 0 && reveal.length === 0)) return;
        const warmUpcoming = () => {
          const entries = upcoming.map(src => load(src, "low"));
          for (const src of reveal) load(src, "low");
          if (followUp.length === 0) return;
          void Promise.all(entries.map(entry => entry.loaded)).then(() => {
            if (!cancelled) followUp.forEach(src => load(src, "low"));
          });
        };
        // Reuse the opening image requests from the HTML. Decode the next
        // panel right away on the cover or on the first exercise (including a reload).
        if (position <= 1) warmUpcoming();
        else cancelIdle = whenIdle(warmUpcoming);
      }

      if (position <= 0) {
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
    prepare(position: number, frame?: number) {
      const sources = firstDayArtFor(position);
      // An action or challenge shows one frame at a time. Its later reveal can load in the background.
      const visible = frame === undefined ? sources : sources.slice(frame, frame + 1);
      const targets = visible.map(src => load(src, "high"));
      if (frame !== undefined && sources[frame + 1]) load(sources[frame + 1], "low");
      return targets.every(target => target.ready) ? null : Promise.all(targets.map(target => target.loaded));
    },
  };
}

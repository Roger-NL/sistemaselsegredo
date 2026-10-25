export type SceneDensity = "comfortable" | "compact" | "tight";
export type SceneSpace = { available: number; intro: number; activity: number; gap: number; mobile: boolean };

/** The visible viewport can be narrower than the layout viewport on mobile. */
export function visibleAppSize(layout: { width: number; height: number }, visual?: { width: number; height: number } | null) {
  const smaller = (fallback: number, visible?: number) => Math.floor(visible && Number.isFinite(visible) && visible > 0 ? Math.min(fallback, visible) : fallback);
  return { width: smaller(layout.width, visual?.width), height: smaller(layout.height, visual?.height) };
}

/** Keep the original 3:2 artwork close to the conversation, using spare space only. */
export function mobileArtworkHeight(width: number, space: Omit<SceneSpace, "mobile">) {
  const natural = Math.max(0, width) * 2 / 3;
  const remaining = space.available - space.intro - space.activity - space.gap * (space.intro > 0 ? 2 : 1);
  return Math.floor(Math.min(natural, Math.max(144, remaining)));
}

/** Tighten spacing when necessary; image and activity always remain together. */
export function nextSceneDensity(current: SceneDensity, space: SceneSpace): SceneDensity {
  if (space.available <= 0 || space.intro < 0 || space.activity <= 0) return current;
  const artwork = space.mobile ? { comfortable: 176, compact: 160, tight: 144 }[current] : 0;
  const gaps = space.mobile && space.intro === 0 ? 1 : 3;
  const needed = space.intro + space.activity + space.gap * gaps + artwork;
  if (needed <= space.available) return current;
  return current === "comfortable" ? "compact" : "tight";
}

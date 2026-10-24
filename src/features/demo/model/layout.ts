export type SceneDensity = "comfortable" | "compact" | "tight";
export type SceneSpace = { available: number; intro: number; activity: number; gap: number; mobile: boolean };

/** Tighten spacing when necessary; image and activity always remain together. */
export function nextSceneDensity(current: SceneDensity, space: SceneSpace): SceneDensity {
  if (space.available <= 0 || space.intro <= 0 || space.activity <= 0) return current;
  const artwork = space.mobile ? { comfortable: 176, compact: 160, tight: 144 }[current] : 0;
  const needed = space.intro + space.activity + space.gap * 3 + artwork;
  if (needed <= space.available) return current;
  return current === "comfortable" ? "compact" : "tight";
}

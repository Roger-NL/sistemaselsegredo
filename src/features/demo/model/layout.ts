export type SceneSpace = { available: number; intro: number; activity: number; gap: number; mobile: boolean };

/** Split before the image/controls lose their space; hysteresis avoids resize flicker. */
export function needsScenePages(space: SceneSpace, alreadyPaged = false): boolean {
  if (space.available <= 0 || space.intro <= 0 || space.activity <= 0) return alreadyPaged;
  const needed = space.intro + space.activity + space.gap * 3 + (space.mobile ? 140 : 0);
  return alreadyPaged ? needed + 32 > space.available : needed > space.available;
}

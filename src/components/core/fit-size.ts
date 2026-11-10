type Size = { width: number; height: number };

/** A natural-height area may keep the same box when its parent's cap grows. */
export const FIT_SPACE_CHANGE = "autofit:spacechange";

/** Keep the actual painted height: excess content remains scrollable, never clipped. */
export function fittedSize(available: Size, natural: Size, minimumScale: number) {
  const safe = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0;
  const width = safe(natural.width), height = safe(natural.height);
  const floor = Number.isFinite(minimumScale) ? Math.max(0, Math.min(1, minimumScale)) : 1;
  const scale = Math.min(1, Math.max(floor, Math.min(
    height ? safe(available.height) / height : 1,
    width ? safe(available.width) / width : 1,
  )));
  const pixels = (value: number) => Math.max(0, Math.ceil(value - Number.EPSILON * Math.max(1, value) * 8));
  const paintedHeight = pixels(height * scale), paintedWidth = pixels(width * scale);
  return { scale, height: paintedHeight, width: paintedWidth,
    overflow: paintedHeight > safe(available.height) + .000001 || paintedWidth > safe(available.width) + .000001 };
}

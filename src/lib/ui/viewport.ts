type ViewportSize = { width: number; height: number };

/** Zoom and browser chrome can make the visible area smaller than the CSS viewport. */
export function visibleViewportSize(layout: ViewportSize, visual?: ViewportSize | null): ViewportSize {
  const fit = (available: number, visible?: number) => Math.floor(
    visible && Number.isFinite(visible) && visible > 0 ? Math.min(available, visible) : available,
  );
  return { width: fit(layout.width, visual?.width), height: fit(layout.height, visual?.height) };
}

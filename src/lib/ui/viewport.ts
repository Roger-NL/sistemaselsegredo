type ViewportSize = { width: number; height: number };

/** Zoom and browser chrome can make the visible area smaller than the CSS viewport. */
export function visibleViewportSize(layout: ViewportSize, visual?: ViewportSize | null): ViewportSize {
  const fit = (available: number, visible?: number) => Math.floor(
    visible && Number.isFinite(visible) && visible > 0 ? Math.min(available, visible) : available,
  );
  return { width: fit(layout.width, visual?.width), height: fit(layout.height, visual?.height) };
}

/** Fixed frames must also follow Safari's pan above an open keyboard. */
export function visibleViewportRect(layout: ViewportSize, visual?: (ViewportSize & { offsetTop?: number; offsetLeft?: number }) | null) {
  const size = visibleViewportSize(layout, visual);
  const offset = (value: number | undefined, maximum: number) =>
    Number.isFinite(value) ? Math.max(0, Math.min(value!, maximum)) : 0;
  return {
    ...size,
    top: offset(visual?.offsetTop, layout.height - size.height),
    left: offset(visual?.offsetLeft, layout.width - size.width),
  };
}

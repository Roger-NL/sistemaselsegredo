"use client";

import { useLayoutEffect, type RefObject } from "react";

/** Fit the illustration and copy; navigation keeps its full size outside this area. */
export function usePresentationFit(
  area: RefObject<HTMLDivElement | null>,
  content: RefObject<HTMLDivElement | null>,
  frame: number,
) {
  useLayoutEffect(() => {
    const available = area.current;
    const stage = content.current;
    if (!available || !stage) return;

    const measure = () => {
      const height = stage.offsetHeight;
      if (!height || !available.clientHeight) return;
      const description = stage.querySelector(".presentation-description");
      const fontSize = description ? parseFloat(getComputedStyle(description).fontSize) : 16;
      // Very small windows can scroll the central area instead of making text unreadable.
      const minimum = Math.min(1, Math.max(.8, 12 / (fontSize || 16)));
      const scale = Math.min(1, Math.max(minimum, available.clientHeight / height));
      available.style.setProperty("--presentation-scale", String(scale));
      available.style.setProperty("--presentation-stage-height", `${height * scale}px`);
      available.setAttribute("data-fitted", "true");
    };

    measure();
    available.scrollTo?.({ top: 0 });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(available);
    observer?.observe(stage);
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, [area, content, frame]);
}

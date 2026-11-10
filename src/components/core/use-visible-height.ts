"use client";
import { useEffect, type RefObject } from "react";

/** Expose the visible height so each screen can fit around keyboard and browser chrome. */
export function useVisibleHeight(root: RefObject<HTMLElement | null>, property: `--${string}`) {
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const viewport = window.visualViewport;
    const measure = () => {
      const visible = viewport?.height;
      const height = Math.floor(visible && Number.isFinite(visible) && visible > 0 ? Math.min(window.innerHeight, visible) : window.innerHeight);
      element.style.setProperty(property, `${height}px`);
    };
    measure();
    window.addEventListener("resize", measure);
    viewport?.addEventListener("resize", measure);
    return () => { window.removeEventListener("resize", measure); viewport?.removeEventListener("resize", measure); element.style.removeProperty(property); };
  }, [root, property]);
}

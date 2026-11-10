"use client";

import { useLayoutEffect } from "react";
import { visibleViewportRect } from "@/lib/ui/viewport";

/** One visible rectangle for every route, menu and dialog, including virtual keyboards. */
export function SiteViewport() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const viewport = window.visualViewport;
    const properties = ["--visible-width", "--visible-height", "--visible-top", "--visible-left"];
    const original = properties.map(name => root.style.getPropertyValue(name));
    let pending = 0;
    let active = true;
    const update = (event?: Event) => {
      if (!active) return;
      const rect = visibleViewportRect({ width: root.clientWidth || window.innerWidth, height: window.innerHeight }, viewport);
      [rect.width, rect.height, rect.top, rect.left].forEach((value, i) => root.style.setProperty(properties[i], `${value}px`));
      // Focus is restored inside the reading area's own scroll boundary, never by zooming text.
      if (event?.type === "scroll") return;
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => {
        pending = 0;
        const focused = document.activeElement;
        if (focused instanceof HTMLElement && focused.matches("input:not([type=radio]):not([type=checkbox]),textarea,[contenteditable=true]")) {
          focused.scrollIntoView?.({ block: "nearest", inline: "nearest", behavior: "instant" });
        }
      });
    };
    update();
    window.addEventListener("resize", update);
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    document.addEventListener("focusin", update);
    return () => {
      active = false;
      cancelAnimationFrame(pending);
      window.removeEventListener("resize", update);
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
      document.removeEventListener("focusin", update);
      properties.forEach((name, i) => original[i] ? root.style.setProperty(name, original[i]) : root.style.removeProperty(name));
    };
  }, []);
  return null;
}

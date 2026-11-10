"use client";

import { useLayoutEffect, type RefObject } from "react";

export function entryArtworkSpace(available: number, reading: number, actions: number, spacing: number) {
  return Math.max(80, Math.min(160, Math.floor(available - reading - actions - spacing)));
}

/** Reserve room for all three choices before lending spare height to the image. */
export function useEntryFit(frame: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const grid = frame.current;
    if (!grid) return;
    const reading = grid.querySelector<HTMLElement>(".entry-reading");
    const stage = reading?.querySelector<HTMLElement>(".auto-fit-content");
    const actions = grid.querySelector<HTMLElement>(".entry-start-actions");
    if (!reading || !stage || !actions) return;
    let pending = 0, active = true;
    const measure = () => {
      pending = 0;
      const styles = getComputedStyle(grid);
      if (styles.display !== "flex" || styles.flexDirection !== "column") {
        grid.style.removeProperty("--entry-art-height"); return;
      }
      const density = reading.dataset.fitDensity;
      reading.dataset.fitDensity = "tight";
      const minimum = Math.max(stage.offsetHeight, stage.scrollHeight);
      if (density) reading.dataset.fitDensity = density; else delete reading.dataset.fitDensity;
      const actionStyle = getComputedStyle(actions);
      const number = (value: string) => parseFloat(value) || 0;
      const spacing = number(styles.paddingTop) + number(styles.paddingBottom) + number(styles.rowGap)
        + number(actionStyle.marginTop) + number(actionStyle.marginBottom);
      grid.style.setProperty("--entry-art-height", `${entryArtworkSpace(grid.clientHeight, minimum, actions.offsetHeight, spacing)}px`);
    };
    const schedule = () => { if (active && !pending) pending = requestAnimationFrame(measure); };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule);
    [grid, stage, actions].forEach(element => observer?.observe(element));
    window.addEventListener("resize", schedule); window.visualViewport?.addEventListener("resize", schedule);
    document.fonts?.addEventListener("loadingdone", schedule);
    return () => {
      active = false; cancelAnimationFrame(pending); observer?.disconnect();
      window.removeEventListener("resize", schedule); window.visualViewport?.removeEventListener("resize", schedule);
      document.fonts?.removeEventListener("loadingdone", schedule);
    };
  }, [frame]);
}

"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { getMotionPreference, subscribePreferences } from "@/features/dashboard/preferences";
import { FIT_SPACE_CHANGE } from "@/components/core/fit-size";
import { mobileArtworkHeight, nextSceneDensity, type SceneDensity } from "../model/layout";
import "./scene-composition.css";

/** Only spacing changes: the illustration, conversation and actions stay on screen. */
export function SceneFrame({ intro, artwork, children, actions, activityKey, opening = false }: { intro: ReactNode; artwork: ReactNode; children: ReactNode; actions: ReactNode; activityKey: string; opening?: boolean }) {
  const frame = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const introduction = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = frame.current;
    if (!root) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations: Animation[] = [];
    const cancel = () => animations.forEach(animation => animation.cancel());
    const respectPreference = () => {
      if (preference.matches || getMotionPreference()) cancel();
    };
    if (!preference.matches && !getMotionPreference()) {
      const reveal = (element: Element | null, distance: number, duration: number, delay = 0) => {
        if (!element?.animate) return;
        animations.push(element.animate([
          { opacity: 0, transform: `translateY(${-distance}px) scale(.985)` },
          { opacity: 1, transform: "translateY(0)" },
        ], { duration, delay, easing: "cubic-bezier(.25,.65,.3,1)", fill: "backwards" }));
      };
      // Native snapshots contain only text. Real controls stay live and animate
      // separately, so a visible button remains clickable during the transition.
      if (document.documentElement.dataset.demoTransition) {
        root.querySelectorAll(".opening-card .audio-trigger, .conversation-tools, .construction, .recognition-response, .written-response, .recall").forEach(element => reveal(element, 6, 340, 70));
      } else {
        reveal(introduction.current, 12, 380);
        reveal(root.querySelector(".activity-content"), 12, 380);
      }
      reveal(root.querySelector(".activity-actions"), 6, 300, 90);
      root.querySelectorAll(".choices > button, .blocks > button").forEach((button, index) => {
        reveal(button, 4, 240, Math.min(index, 4) * 40);
      });
    }
    preference.addEventListener("change", respectPreference);
    const unsubscribe = subscribePreferences(respectPreference);
    return () => { cancel(); unsubscribe(); preference.removeEventListener("change", respectPreference); };
  }, [activityKey]);
  useEffect(() => {
    const root = frame.current;
    const scene = grid.current;
    if (!root || !scene) return;
    const readingArea = root.querySelector<HTMLElement>(".activity-body.auto-fit");
    const reading = readingArea?.querySelector<HTMLElement>(".auto-fit-content") ?? root.querySelector<HTMLElement>(".activity-content");
    scene.dataset.density = "comfortable";
    let scheduled = 0;
    let previousWidth = window.innerWidth;
    let previousHeight = window.visualViewport?.height ?? window.innerHeight;
    const measure = () => {
      scheduled = 0;
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      if (Math.abs(window.innerWidth - previousWidth) > 16 || Math.abs(viewportHeight - previousHeight) > 16) {
        previousWidth = window.innerWidth; previousHeight = viewportHeight;
        scene.dataset.density = "comfortable";
        schedule(); return;
      }
      const height = (element: HTMLElement | null) => element ? Math.ceil(Math.max(element.scrollHeight, element.offsetHeight)) : 0;
      const readingHeight = () => {
        if (!readingArea) return height(reading);
        const density = readingArea.getAttribute("data-fit-density");
        const fitted = readingArea.getAttribute("data-fitted");
        // Budget the complete natural reading box, including its padding.
        // Measuring an already compacted inner child repeatedly gives its
        // space to the image and makes both fitters shrink it again.
        readingArea.dataset.fitDensity = "comfortable";
        readingArea.removeAttribute("data-fitted");
        try { return height(reading); }
        finally {
          if (density === null) readingArea.removeAttribute("data-fit-density"); else readingArea.setAttribute("data-fit-density", density);
          if (fitted === null) readingArea.removeAttribute("data-fitted"); else readingArea.setAttribute("data-fitted", fitted);
        }
      };
      const current = (scene.dataset.density ?? "comfortable") as SceneDensity;
      const unified = getComputedStyle(scene).display === "contents";
      const layout = unified ? root : scene;
      const styles = getComputedStyle(layout);
      const columns = styles.gridTemplateColumns.split(/\s+/).filter(Boolean).length;
      const stacked = columns === 1;
      const panel = root.querySelector<HTMLElement>(".conversation-panel");
      const panelStyle = panel ? getComputedStyle(panel) : null;
      const panelSpace = (parseFloat(panelStyle?.paddingTop ?? "0") || 0) + (parseFloat(panelStyle?.paddingBottom ?? "0") || 0);
      // Stacked scenes have an external action row. In the unified columns,
      // reserve those same controls before fitting the reading area.
      const controls = unified ? height(root.querySelector(".activity-actions")) : 0;
      const space = { available: layout.clientHeight - controls - (parseFloat(styles.paddingTop) || 0) - (parseFloat(styles.paddingBottom) || 0), intro: height(introduction.current),
        activity: readingHeight() + panelSpace,
        gap: parseFloat(styles.rowGap) || 0, mobile: stacked, artwork: stacked ? scene.clientWidth * 2 / 3 : undefined };
      const next = nextSceneDensity(current, space);
      if (space.mobile) scene.style.setProperty("--scene-art-height", `${mobileArtworkHeight(scene.clientWidth, space, root.querySelector(".has-balloon") ? 144 : 96)}px`);
      const artwork = space.mobile ? parseFloat(scene.style.getPropertyValue("--scene-art-height")) || 0 : 0;
      const gaps = space.mobile ? (space.intro > 0 ? 2 : 1) : 1;
      const panelSpaceValue = `${Math.max(44, space.available - space.intro - artwork - space.gap * gaps)}px`;
      if (scene.style.getPropertyValue("--scene-panel-space") !== panelSpaceValue) {
        scene.style.setProperty("--scene-panel-space", panelSpaceValue);
        // A compact auto-height area can stay the same size even after its
        // cap grows. Explicitly refit once, instead of waiting for a resize
        // that cannot occur until comfortable spacing has been restored.
        readingArea?.dispatchEvent(new Event(FIT_SPACE_CHANGE));
      }
      if (next !== current) { scene.dataset.density = next; schedule(); }
    };
    const schedule = () => { if (!scheduled) scheduled = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    for (const element of [root, grid.current, introduction.current, reading, root.querySelector(".activity-actions")]) {
      if (element) observer.observe(element);
    }
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    schedule();
    return () => { observer.disconnect(); cancelAnimationFrame(scheduled); window.removeEventListener("resize", schedule); window.visualViewport?.removeEventListener("resize", schedule); };
  }, [activityKey]);
  return <div ref={frame} className="scene-frame scene-composition" role="group" aria-label="Falas e atividade"><div ref={grid} className={`scene-grid${opening ? " opening-scene" : ""}`}>
    <div ref={introduction} className="scene-intro-slot">{intro}</div>
    {artwork}
    <section className="conversation-panel" aria-label="Cena e resposta">{children}</section>
  </div><div className="activity-actions">{actions}</div></div>;
}

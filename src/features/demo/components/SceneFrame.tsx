"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { getMotionPreference, subscribePreferences } from "@/features/dashboard/preferences";
import { mobileArtworkHeight, nextSceneDensity, type SceneDensity } from "../model/layout";

/** Only spacing changes: the illustration, conversation and actions stay on screen. */
export function SceneFrame({ intro, artwork, children, activityKey, opening = false }: { intro: ReactNode; artwork: ReactNode; children: ReactNode; activityKey: string; opening?: boolean }) {
  const frame = useRef<HTMLDivElement>(null);
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
    if (!root) return;
    root.dataset.density = "comfortable";
    let scheduled = 0;
    let previousWidth = window.innerWidth;
    let previousHeight = window.visualViewport?.height ?? window.innerHeight;
    const measure = () => {
      scheduled = 0;
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      if (Math.abs(window.innerWidth - previousWidth) > 16 || Math.abs(viewportHeight - previousHeight) > 16) {
        previousWidth = window.innerWidth; previousHeight = viewportHeight;
        root.dataset.density = "comfortable";
        schedule(); return;
      }
      const height = (element: HTMLElement | null) => element ? Math.ceil(Math.max(element.scrollHeight, element.getBoundingClientRect().height)) : 0;
      const current = (root.dataset.density ?? "comfortable") as SceneDensity;
      const styles = getComputedStyle(root);
      const space = { available: root.clientHeight - (parseFloat(styles.paddingTop) || 0) - (parseFloat(styles.paddingBottom) || 0), intro: height(introduction.current),
        activity: height(root.querySelector(".activity-content")) + height(root.querySelector(".activity-actions")) + 12,
        gap: parseFloat(styles.rowGap) || 0, mobile: root.clientWidth <= 760 };
      const next = nextSceneDensity(current, space);
      if (space.mobile) root.style.setProperty("--scene-art-height", `${mobileArtworkHeight(root.clientWidth, space)}px`);
      if (next !== current) { root.dataset.density = next; schedule(); }
    };
    const schedule = () => { if (!scheduled) scheduled = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    for (const element of [root, introduction.current, root.querySelector(".activity-content"), root.querySelector(".activity-actions")]) {
      if (element) observer.observe(element);
    }
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    schedule();
    return () => { observer.disconnect(); cancelAnimationFrame(scheduled); window.removeEventListener("resize", schedule); window.visualViewport?.removeEventListener("resize", schedule); };
  }, [activityKey]);
  return <div ref={frame} className={`scene-grid${opening ? " opening-scene" : ""}`}>
    <div ref={introduction} className="scene-intro-slot">{intro}</div>
    {artwork}
    <section className="conversation-panel" aria-label="Falas e atividade">{children}</section>
  </div>;
}

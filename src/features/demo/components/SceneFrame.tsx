"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { nextSceneDensity, type SceneDensity } from "../model/layout";

/** Only spacing changes: the illustration, conversation and actions stay on screen. */
export function SceneFrame({ intro, artwork, children, activityKey }: { intro: ReactNode; artwork: ReactNode; children: ReactNode; activityKey: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const introduction = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = frame.current;
    if (!root) return;
    root.dataset.density = "comfortable";
    let scheduled = 0;
    let previousWidth = root.clientWidth;
    let previousHeight = root.clientHeight;
    const measure = () => {
      scheduled = 0;
      if (Math.abs(root.clientWidth - previousWidth) > 16 || Math.abs(root.clientHeight - previousHeight) > 16) {
        previousWidth = root.clientWidth; previousHeight = root.clientHeight;
        root.dataset.density = "comfortable";
        schedule(); return;
      }
      const height = (element: HTMLElement | null) => element ? Math.ceil(Math.max(element.scrollHeight, element.getBoundingClientRect().height)) : 0;
      const current = (root.dataset.density ?? "comfortable") as SceneDensity;
      const next = nextSceneDensity(current, { available: root.clientHeight, intro: height(introduction.current),
        activity: height(root.querySelector(".activity-content")) + height(root.querySelector(".activity-actions")) + 12,
        gap: parseFloat(getComputedStyle(root).rowGap) || 0, mobile: matchMedia("(max-width: 760px)").matches });
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
  return <div ref={frame} className="scene-grid">
    <div ref={introduction} className="scene-intro-slot">{intro}</div>
    {artwork}
    <section className="conversation-panel" aria-label="Falas e atividade">{children}</section>
  </div>;
}

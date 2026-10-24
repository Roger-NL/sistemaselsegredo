"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { needsScenePages } from "../model/layout";

/** Presentation only: pagination never submits an answer or changes the story. */
export function SceneFrame({ intro, artwork, children, activityKey }: { intro: ReactNode; artwork: ReactNode; children: ReactNode; activityKey: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const introduction = useRef<HTMLDivElement>(null);
  const activity = useRef<HTMLElement>(null);
  const [paged, setPaged] = useState(false);
  const [page, setPage] = useState<"scene" | "activity">("scene");
  useEffect(() => {
    const root = frame.current;
    if (!root) return;
    // Retain measurements while a page is hidden. Observing the unconstrained
    // content also catches wrapping, error messages and newly selected pieces.
    const sizes = { intro: 0, content: 0, actions: 0 };
    let scheduled = 0;
    const measure = () => {
      scheduled = 0;
      const nodes = { intro: introduction.current, content: root.querySelector<HTMLElement>(".activity-content"), actions: root.querySelector<HTMLElement>(".activity-actions") };
      for (const key of Object.keys(nodes) as (keyof typeof sizes)[]) {
        const element = nodes[key];
        if (element?.getClientRects().length) sizes[key] = Math.ceil(Math.max(element.scrollHeight, element.getBoundingClientRect().height));
      }
      const gap = parseFloat(getComputedStyle(root).rowGap) || 0;
      setPaged(previous => needsScenePages({ available: root.clientHeight, intro: sizes.intro,
        activity: sizes.content + sizes.actions + 12, gap, mobile: matchMedia("(max-width: 760px)").matches }, previous));
      if (root.contains(document.activeElement) && document.activeElement?.matches("input, textarea")) setPage("activity");
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
  }, []);
  useEffect(() => {
    if (!paged) return;
    if (page === "activity") {
      if (!activity.current?.contains(document.activeElement)) activity.current?.focus({ preventScroll: true });
    } else introduction.current?.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
  }, [page, paged, activityKey]);
  return <div ref={frame} className="scene-grid" data-paged={paged} data-page={page}>
    <div ref={introduction} className="scene-intro-slot">{intro}</div>
    {artwork}
    <section ref={activity} className="conversation-panel" tabIndex={-1} aria-label="Falas e atividade">{children}</section>
    {paged && <nav className="scene-pages" aria-label="Cena e atividade">
      <button disabled={page === "scene"} onClick={() => setPage("scene")}>← Cena</button>
      <span aria-live="polite">{page === "scene" ? "1" : "2"} de 2</span>
      <button disabled={page === "activity"} onClick={() => setPage("activity")}>Atividade →</button>
    </nav>}
  </div>;
}

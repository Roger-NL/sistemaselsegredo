"use client";

import { useEffect } from "react";

/** iOS keeps the layout viewport tall while its keyboard covers the visual viewport. */
export function useLessonViewport() {
  useEffect(() => {
    const root = document.documentElement, viewport = window.visualViewport;
    let frame = 0;
    const update = () => {
      const editing = document.activeElement?.matches("input,textarea,[contenteditable=true]") ?? false;
      const height = Math.round(viewport?.height ?? window.innerHeight);
      root.style.setProperty("--lesson-visible-height", `${height}px`);
      root.style.setProperty("--lesson-visible-top", `${Math.round(viewport?.offsetTop ?? 0)}px`);
      root.dataset.keyboardOpen = String(editing && window.innerHeight - height > 120);
      cancelAnimationFrame(frame);
      if (editing) frame = requestAnimationFrame(() => {
        const field = document.activeElement;
        if (field instanceof HTMLElement) field.scrollIntoView?.({ block: "nearest", inline: "nearest", behavior: "instant" });
      });
    };
    update();
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => {
      viewport?.removeEventListener("resize", update); viewport?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update); document.removeEventListener("focusin", update); document.removeEventListener("focusout", update);
      cancelAnimationFrame(frame);
      root.style.removeProperty("--lesson-visible-height"); root.style.removeProperty("--lesson-visible-top"); delete root.dataset.keyboardOpen;
    };
  }, []);
}

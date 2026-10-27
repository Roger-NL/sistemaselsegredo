"use client";

import { useEffect } from "react";

export const DASHBOARD_SECTION_EVENT = "basedspeak:dashboard-section";
const sections = new Set(["jornada", "avanco", "atividades", "contato"]);

/** Retry deep links after account data renders, including same-route links. */
export function useDashboardSection(status: string) {
  useEffect(() => {
    let frame = 0;
    const reveal = (event?: Event) => {
      const requested = event instanceof CustomEvent ? event.detail : window.location.hash.slice(1);
      if (typeof requested !== "string" || !sections.has(requested)) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const target = document.getElementById(requested);
        if (!target || target.closest("[hidden]")) return;
        target.scrollIntoView({ block:"start", behavior:"instant" });
        target.querySelector<HTMLElement>("h2")?.focus({ preventScroll:true });
      });
    };
    reveal();
    window.addEventListener("hashchange", reveal);
    window.addEventListener(DASHBOARD_SECTION_EVENT, reveal);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("hashchange", reveal); window.removeEventListener(DASHBOARD_SECTION_EVENT, reveal); };
  }, [status]);
}

"use client";

import { useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { FIT_SPACE_CHANGE, fittedSize } from "./fit-size";

/** Try smaller spacing first. Scale only while text and touch targets remain usable. */
export function AutoFit({ children, className, shellRef, minimumScale = .85, textSelector = "p,li,label,input,select,textarea" }: {
  children?: ReactNode;
  className: string;
  shellRef?: RefObject<HTMLDivElement | null>;
  minimumScale?: number;
  textSelector?: string;
}) {
  const internal = useRef<HTMLDivElement>(null);
  const rootRef = shellRef ?? internal;
  const content = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const area = rootRef.current;
    const stage = content.current;
    if (!area || !stage) return;
    let active = true, pending = 0, force = false, last = "";
    const signature = () => [area.clientWidth, area.clientHeight, area.parentElement?.clientHeight,
      stage.offsetWidth, stage.offsetHeight, stage.scrollWidth, stage.scrollHeight].join(":");
    const measure = () => {
      pending = 0;
      if (!active || (!force && signature() === last)) return;
      force = false;
      // Restore natural flow before measuring. A previously scaled, auto-height
      // parent must be able to grow again when its available space increases.
      area.removeAttribute("data-fitted");
      area.dataset.fitDensity = "comfortable";
      if (area.clientWidth <= 0 || area.clientHeight <= 0) { last = ""; return; }
      for (const density of ["comfortable", "compact", "tight"]) {
        area.dataset.fitDensity = density;
        if (Math.max(stage.offsetHeight, stage.scrollHeight) <= area.clientHeight
          && stage.scrollWidth <= area.clientWidth) break;
      }
      let minimum = Math.max(0, Math.min(1, minimumScale));
      const visible = (element: HTMLElement) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden";
      stage.querySelectorAll<HTMLElement>(textSelector + ",small").forEach(element => {
        if (!visible(element)) return;
        const font = parseFloat(getComputedStyle(element).fontSize);
        if (font > 0) minimum = Math.max(minimum, (element.matches("small,[data-fit-caption],.entry-details,.eyebrow,.landing-eyebrow,.study-eyebrow") ? 12 : 14) / font);
      });
      stage.querySelectorAll<HTMLElement>("button,a[href],input:not([type=radio]):not([type=checkbox]):not([type=hidden]),select,textarea,summary,[role=button],.profile-option,.study-choices>label").forEach(element => {
        if (!visible(element)) return;
        if (element.offsetHeight) minimum = Math.max(minimum, 44 / element.offsetHeight);
        if (element.offsetWidth) minimum = Math.max(minimum, 44 / element.offsetWidth);
      });
      const fitted = fittedSize({ width: area.clientWidth, height: area.clientHeight },
        { width: Math.max(stage.offsetWidth, stage.scrollWidth), height: Math.max(stage.offsetHeight, stage.scrollHeight) }, minimum);
      area.style.setProperty("--fit-scale", String(fitted.scale));
      area.style.setProperty("--fit-height", `${fitted.height}px`);
      area.style.setProperty("--fit-width", `${Math.max(area.clientWidth, fitted.width)}px`);
      area.style.setProperty("--fit-natural-width", `${stage.offsetWidth}px`);
      area.style.setProperty("--fit-left", `${Math.max(0, (area.clientWidth - fitted.width) / 2)}px`);
      if (fitted.scale < 1) area.dataset.fitted = "true";
      area.dataset.fitOverflow = String(fitted.overflow);
      last = signature();
    };
    const schedule = (invalidate = false) => {
      force ||= invalidate;
      if (active && !pending) pending = requestAnimationFrame(measure);
    };
    const changed = () => schedule(true);
    area.addEventListener(FIT_SPACE_CHANGE, changed);
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => schedule());
    observer?.observe(area); observer?.observe(stage);
    if (area.parentElement) observer?.observe(area.parentElement);
    const mutations = new MutationObserver(changed);
    mutations.observe(stage, { subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ["open", "hidden", "class", "lang", "style"] });
    window.addEventListener("resize", changed);
    window.visualViewport?.addEventListener("resize", changed);
    document.fonts?.addEventListener("loadingdone", changed);
    void document.fonts?.ready.then(() => { if (active) changed(); });
    return () => {
      active = false; cancelAnimationFrame(pending);
      observer?.disconnect(); mutations.disconnect();
      area.removeEventListener(FIT_SPACE_CHANGE, changed);
      window.removeEventListener("resize", changed);
      window.visualViewport?.removeEventListener("resize", changed);
      document.fonts?.removeEventListener("loadingdone", changed);
    };
  }, [rootRef, minimumScale, textSelector]);
  return <div ref={rootRef} className={`auto-fit ${className}`}><div className="auto-fit-size"><div ref={content} className="auto-fit-content">{children}</div></div></div>;
}

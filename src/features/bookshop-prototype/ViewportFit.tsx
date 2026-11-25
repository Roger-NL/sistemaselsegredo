"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/** Fit one finite scene to its available area. Controls can stay outside this area. */
export function ViewportFit({ children, className = "" }: { children: ReactNode; className?: string }) {
  const area = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const box = area.current;
    const stage = content.current;
    if (!box || !stage) return;
    let active = true;
    let frame = 0;
    let last = "";

    const signature = () => [box.clientWidth, box.clientHeight, stage.offsetWidth, stage.scrollHeight].join(":");
    const measure = () => {
      frame = 0;
      if (!active || signature() === last) return;
      const width = box.clientWidth;
      const height = box.clientHeight;
      if (width <= 0 || height <= 0) return;
      const fits = (scale: number) => {
        stage.style.width = width / scale + "px";
        return Math.max(stage.scrollHeight, stage.offsetHeight) * scale <= height - 2
          && stage.scrollWidth * scale <= width + 0.5;
      };
      let scale = 1;
      if (!fits(1)) {
        let low = 0.15;
        let high = 1;
        for (let i = 0; i < 12; i++) {
          const candidate = (low + high) / 2;
          if (fits(candidate)) low = candidate;
          else high = candidate;
        }
        scale = low;
      }
      stage.style.width = width / scale + "px";
      stage.style.top = Math.max(0, (height - stage.offsetHeight * scale) / 2) + "px";
      stage.style.transform = "scale(" + scale + ")";
      box.dataset.fitScale = scale.toFixed(3);
      last = signature();
    };
    const schedule = (invalidate = false) => {
      if (invalidate) last = "";
      if (active && !frame) frame = requestAnimationFrame(measure);
    };
    const changed = () => schedule(true);
    const observer = new ResizeObserver(() => schedule());
    observer.observe(box);
    observer.observe(stage);
    const mutations = new MutationObserver(changed);
    mutations.observe(stage, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ["class", "hidden", "open"] });
    window.addEventListener("resize", changed);
    window.visualViewport?.addEventListener("resize", changed);
    document.fonts?.addEventListener("loadingdone", changed);
    void document.fonts?.ready.then(() => { if (active) changed(); });
    measure();
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
      window.removeEventListener("resize", changed);
      window.visualViewport?.removeEventListener("resize", changed);
      document.fonts?.removeEventListener("loadingdone", changed);
    };
  }, []);

  return <div className={"bs-fit " + className} ref={area}><div className="bs-fit-stage" ref={content}>{children}</div></div>;
}

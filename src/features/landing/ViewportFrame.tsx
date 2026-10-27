"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { visibleViewportSize } from "@/lib/ui/viewport";

export function ViewportFrame({ children, className }: { children: ReactNode; className: "landing" | "start-page" }) {
  const frame = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = frame.current;
    if (!element) return;
    const viewport = window.visualViewport;
    const update = () => {
      const size = visibleViewportSize({
        width: document.documentElement.clientWidth || window.innerWidth,
        height: window.innerHeight,
      }, viewport);
      element.style.setProperty("--public-width", `${size.width}px`);
      element.style.setProperty("--public-height", `${size.height}px`);
      element.style.setProperty("--public-left", `${viewport?.offsetLeft || 0}px`);
      element.style.setProperty("--public-top", `${viewport?.offsetTop || 0}px`);
    };
    update();
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return <div ref={frame} className={`public-viewport ${className}`}>{children}</div>;
}

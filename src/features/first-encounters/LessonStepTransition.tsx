"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/** One mounted surface: rigs and form state survive a content advance. */
export function LessonStepTransition({ stepKey, className = "", children }: { stepKey: string | number; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const previous = useRef<string | number | null>(null);
  useLayoutEffect(() => {
    if (previous.current === stepKey) return;
    previous.current = stepKey;
    const node = ref.current;
    if (!node?.animate) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const animation = node.animate(reduced ? [{ opacity: .7 }, { opacity: 1 }] : [{ opacity: .45, transform: "translateX(14px)" }, { opacity: 1, transform: "translateX(0)" }], { duration: reduced ? 120 : 240, easing: "cubic-bezier(.23,1,.32,1)" });
    const finish = () => animation.cancel();
    node.addEventListener("pointerdown", finish, { once: true, capture: true });
    return () => { animation.cancel(); node.removeEventListener("pointerdown", finish, true); };
  }, [stepKey]);
  return <div ref={ref} className={`lesson-step-transition ${className}`} data-step-key={stepKey}>{children}</div>;
}

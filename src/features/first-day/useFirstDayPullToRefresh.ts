"use client";

import { useEffect, type RefObject } from "react";

/** Safari can start a browser refresh even when the viewport disallows overscroll. */
export function useFirstDayPullToRefresh(book: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const surface = book.current;
    if (!surface) return;

    let origin: Touch | undefined;

    function begin(event: TouchEvent) {
      origin = event.touches.length === 1 ? event.touches[0] : undefined;
    }

    function containPull(event: TouchEvent) {
      if (!origin || event.touches.length !== 1 || !event.cancelable || event.defaultPrevented ||
        (window.visualViewport?.scale ?? 1) > 1 || window.scrollY > 0) return;
      const touch = event.touches[0];
      const target = event.target;
      if (touch.identifier !== origin.identifier || !(target instanceof Element)) return;
      if (touch.clientY - origin.clientY <= Math.abs(touch.clientX - origin.clientX)) return;

      for (let element: Element | null = target; element && element !== surface; element = element.parentElement) {
        if (element.scrollTop <= 0) continue;
        const { overflowY } = getComputedStyle(element);
        if (overflowY === "auto" || overflowY === "scroll") return;
      }
      event.preventDefault();
    }

    surface.addEventListener("touchstart", begin, { capture: true, passive: true });
    surface.addEventListener("touchmove", containPull, { capture: true, passive: false });
    return () => {
      surface.removeEventListener("touchstart", begin, true);
      surface.removeEventListener("touchmove", containPull, true);
    };
  }, [book]);
}

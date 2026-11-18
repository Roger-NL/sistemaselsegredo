"use client";

import { useEffect } from "react";
import "./lesson-keyboard.css";

/** Switch to the writing layout for both overlay keyboards (iOS) and resizes-content keyboards. */
export function useLessonViewport() {
  useEffect(() => {
    const root = document.documentElement;
    const viewport = window.visualViewport;
    let width = window.innerWidth;
    let restingHeight = viewport?.height ?? window.innerHeight;
    let keyboardOpen = false;

    function update() {
      const height = viewport?.height ?? window.innerHeight;
      if (window.innerWidth !== width) {
        width = window.innerWidth;
        restingHeight = window.innerHeight;
      }
      const editing = document.activeElement?.matches(".lo-app input:not([type=radio]):not([type=checkbox]), .lo-app textarea");
      // A tap on Conferir may blur the field before the keyboard finishes closing.
      // Keep the button under the finger until the viewport actually grows back.
      keyboardOpen = Boolean((editing || keyboardOpen) && (viewport?.scale ?? 1) === 1 &&
        Math.max(restingHeight, window.innerHeight) - height > 100);
      if (!editing && !keyboardOpen) restingHeight = height;
      // On iOS both heights can shrink together while Safari still pans its fixed
      // containing block. The pan is real even when innerHeight === viewport.height.
      root.style.setProperty("--lesson-keyboard-top", `${Math.max(0, viewport?.offsetTop ?? 0)}px`);
      root.dataset.keyboardOpen = String(keyboardOpen);
      root.toggleAttribute("data-lesson-zoomed", (viewport?.scale ?? 1) > 1);
    }
    // A touch keeps its original target even if the finger travels past the card.
    // Cancel only single-finger movement, leaving taps, native editing and zoom intact.
    function containCardPan(event: TouchEvent) {
      if (!event.cancelable || event.touches.length !== 1 || (viewport?.scale ?? 1) > 1) return;
      const origin = event.target;
      if (!(origin instanceof Element) || !origin.closest(".lo-app :is(.lo-main, .li-introduction, .lo-tutorial, .lo-dialog)")) return;
      if (origin.closest('textarea, select, input:not([type=radio]):not([type=checkbox]), [contenteditable]:not([contenteditable=false])')) return;
      event.preventDefault();
    }
    document.addEventListener("touchmove", containCardPan, { capture: true, passive: false });
    update();
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    document.addEventListener("focusin", update);
    return () => {
      document.removeEventListener("touchmove", containCardPan, true);
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      document.removeEventListener("focusin", update);
      root.style.removeProperty("--lesson-keyboard-top");
      root.removeAttribute("data-lesson-zoomed");
      delete root.dataset.keyboardOpen;
    };
  }, []);
}

/** Drag sources sound only after an actual selection, never a suppressed drag click. */
export function isLessonButtonClick(target: EventTarget | null): boolean {
  if (typeof Element === "undefined" || !(target instanceof Element)) return false;
  const control = target.closest("button,[role=button]");
  return Boolean(control && !control.matches(":disabled,[aria-disabled=true],[data-lesson-drag-source],[data-sound-silent=true]"));
}

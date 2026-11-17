import type { ComponentPropsWithRef } from "react";

export type LessonButtonProps = ComponentPropsWithRef<"button">;

/** The native button owns interaction; its face supplies the printed-comic press. */
export function LessonButton({ children, type = "button", ...props }: LessonButtonProps) {
  return <button {...props} type={type} data-lesson-button="primary">
    <span className="lesson-button-face br-button-face">{children}</span>
  </button>;
}

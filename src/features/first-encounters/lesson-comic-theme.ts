import type { CSSProperties } from "react";

/** The same printed-comic palette used by the approved public site and panel. */
export const COMIC_LESSON_STYLE: CSSProperties & Record<`--lesson-${string}`, string> = {
  "--lesson-primary": "#efc653", "--lesson-primary-shadow": "#202722", "--lesson-primary-text": "#202722",
  "--lesson-button-height": "48px", "--lesson-button-radius": "6px 4px 7px 4px", "--lesson-button-outer-radius": "6px 4px 7px 4px",
  "--lesson-button-padding": "20px", "--lesson-press-depth": "3px", "--lesson-button-duration": "80ms", "--lesson-button-easing": "ease-out",
  "--lesson-button-font-size": "16px", "--lesson-button-font-weight": "600", "--lesson-button-line-height": "20px",
  "--lesson-bg": "#fff7e8", "--lesson-panel": "#fffdf5", "--lesson-white": "#202722",
  "--lesson-ink": "#202722", "--lesson-muted": "#5d655b", "--lesson-line": "#202722",
  "--lesson-green": "#39776b", "--lesson-green-shadow": "#202722", "--lesson-focus": "#39776b",
  "--lesson-disabled-bg": "#ebe7dc", "--lesson-disabled-text": "#777b6a",
  "--lesson-font": 'var(--comic-body, "BasedSpeak Barlow", Arial, sans-serif)',
};

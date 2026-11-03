import type { ReactNode } from "react";

/** A translator may replace a Text node, or finish an old translation late.
 * Keep React's element stable during translation and replace it when the source
 * changes, so an old translation cannot overwrite the new visible value.
 * This renders the source text only; the browser remains the translator. */
export function BrowserText({ children }: { children: ReactNode }) {
  return typeof children === "string" || typeof children === "number"
    ? <span data-ui-text key={children}>{children}</span>
    : children;
}

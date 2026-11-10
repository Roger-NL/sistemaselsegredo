import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";

const icons = {
  "arrow-up-right": ArrowUpRight,
  "arrow-down-right": ArrowDownRight,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  close: X,
};

/** Draw interface symbols as vectors, independent of system emoji fonts. */
export function InterfaceIcon({ name }: { name: keyof typeof icons | "starburst" }) {
  if (name === "starburst") return <svg className="ui-symbol" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true" focusable="false">
    <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07 19.07 4.93" />
  </svg>;
  const Icon = icons[name];
  return <Icon className="ui-symbol" size="1em" strokeWidth={1.5} aria-hidden="true" focusable="false" />;
}

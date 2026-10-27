import Link from "next/link";
import type { MouseEventHandler } from "react";

/** Original BasedSpeak mark from the approved Orbit reference; independent of its UI. */
export function Brand({ href = "/", onClick }: { href?: string; onClick?: MouseEventHandler<HTMLAnchorElement> }) {
  return <Link className="brand" href={href} onClick={onClick} aria-label={href === "/dashboard" ? "BasedSpeak — meu painel" : "BasedSpeak — início"}>
    <span className="brand-mark" aria-hidden="true"><span /><span /><span /><span /></span>
    <span className="brand-word">based<span className="brand-light">speak</span>.</span>
  </Link>;
}

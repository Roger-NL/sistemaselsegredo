import Link from "next/link";
import type { MouseEventHandler } from "react";

/** Original BasedSpeak mark from the approved Orbit reference; independent of its UI. */
export function Brand({ href = "/", onClick, onMenu }: { href?: string; onClick?: MouseEventHandler<HTMLAnchorElement>; onMenu?: () => void }) {
  if (onMenu) return <button type="button" className="brand lo-brand-menu" onClick={onMenu} aria-label="BasedSpeak — abrir menu da aula" aria-haspopup="dialog"><span className="brand-mark" aria-hidden="true"><span /><span /><span /><span /></span><span className="brand-word">based<span className="brand-light">speak</span>.</span></button>;
  return <Link className="brand" href={href} prefetch={href === "/dashboard" ? true : undefined} onClick={onClick} aria-label={href === "/dashboard" ? "BasedSpeak — meu painel" : "BasedSpeak — início"}>
    <span className="brand-mark" aria-hidden="true"><span /><span /><span /><span /></span>
    <span className="brand-word">based<span className="brand-light">speak</span>.</span>
  </Link>;
}

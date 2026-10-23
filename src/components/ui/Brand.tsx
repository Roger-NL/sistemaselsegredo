import Link from "next/link";

/** Original BasedSpeak mark from the approved Orbit reference; independent of its UI. */
export function Brand() {
  return <Link className="brand" href="/" aria-label="BasedSpeak — início">
    <span className="brand-mark" aria-hidden="true"><span /><span /><span /><span /></span>
    <span className="brand-word">based<span className="brand-light">speak</span>.</span>
  </Link>;
}

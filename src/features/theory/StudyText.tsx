import { BrowserText } from "@/components/i18n/BrowserText";
import { studyTextParts } from "./study-text";

/** Keeps explanations in Portuguese and identifies English as study material.
 * Render text nodes only: editorial markers never become arbitrary HTML. */
export function StudyText({ children = "", english = false }: { children?: string; english?: boolean }) {
  const parts = english ? [{ text: children, english: true }] : studyTextParts(children);
  return <>{parts.map((part, index) => part.english
    ? <mark key={index} className="study-english" lang="en" translate="no"><BrowserText>{part.text}</BrowserText></mark>
    : <BrowserText key={index}>{part.text}</BrowserText>)}</>;
}

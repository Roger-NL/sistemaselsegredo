export type StudyTextPart = { text: string; english: boolean };

/** Editorial boundaries, never language detection: Portuguese and English can
 * share words such as "a" or "me". Backticks mark only the English being taught. */
export function studyTextParts(source: string): StudyTextPart[] {
  return source.split(/`([^`]+)`/g).map((text, index) => ({ text, english: index % 2 === 1 })).filter(part => part.text.length > 0);
}

export function plainStudyText(source: string) {
  return studyTextParts(source).map(part => part.text).join("");
}

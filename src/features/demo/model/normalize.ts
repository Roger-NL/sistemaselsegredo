/** Punctuation at the edges is optional. Inside a sentence it separates words
 * only when followed by whitespace; punctuation inside a word is never erased. */
export function normalizeAnswer(text: string) {
  return text.normalize("NFC").toLowerCase().replace(/[’‘]/g, "'").trim()
    .replace(/^[^\p{L}\p{N}']+|[^\p{L}\p{N}']+$/gu, "")
    .replace(/[.,!?;:…]+(?=\s)/g, " ")
    .replace(/\bit's\b/g, "it is").replace(/\bi'm\b/g, "i am")
    .replace(/\bisn't\b/g, "is not").replace(/\bthat's\b/g, "that is")
    .replace(/\bi've\b/g, "i have").replace(/\bdon't\b/g, "do not").replace(/\bcan't\b/g, "cannot")
    .replace(/\s+/g, " ").trim();
}

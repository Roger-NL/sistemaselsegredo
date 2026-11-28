export function sequelWordBank(pieces: readonly string[], pieceOrder: readonly number[]) {
  const tokens = pieces.flatMap((piece, group) => piece.split(/\s+/).filter(Boolean)
    .map((word, offset) => ({ word, group, offset })));
  // Mix words from different phrases while keeping the bank and saved indexes stable.
  tokens.sort((a, b) => a.offset - b.offset || a.group - b.group);
  const groups = pieces.map((): number[] => []);
  const words = tokens.map(({ word, group }, index) => {
    groups[group].push(index);
    return word;
  });
  return { words, order: pieceOrder.flatMap(group => groups[group]), groups };
}

export function sequelHintSlots(ends: readonly number[]) {
  const hints = new Set<number>();
  function add(start: number, end: number) {
    hints.add(start + 1);
    hints.add(start + Math.floor((end - start) / 2));
    hints.add(end - 2);
  }
  for (const [beat, end] of ends.entries()) {
    const start = ends[beat - 1] ?? 0;
    if (end - start >= 8) add(start, end);
  }
  const length = ends.at(-1) ?? 0;
  if (hints.size === 0 && length >= 10) add(0, length);
  return hints;
}

export function sequelPlacementWithHints(placed: readonly number[], answer: readonly number[], hints: ReadonlySet<number>) {
  const reservedWords = new Set(Array.from(hints, slot => answer[slot]));
  const phrase: number[] = [];
  for (let slot = 0; slot < answer.length; slot++) {
    if (hints.has(slot)) {
      phrase.push(answer[slot]);
    } else if (slot < placed.length && !reservedWords.has(placed[slot])) {
      phrase.push(placed[slot]);
    } else {
      break;
    }
  }
  return phrase;
}

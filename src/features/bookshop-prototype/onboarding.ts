export const guideStorageKey = "basedspeak.bookshop-guide.v1";

export const guideSteps = [
  { id: "character", label: "Quem você é" },
  { id: "choices", label: "Suas falas" },
  { id: "games", label: "Suas ações" },
  { id: "support", label: "Seus apoios" },
  { id: "theory", label: "Depois da história" },
  { id: "begin", label: "Seu começo" },
] as const;

export type GuideSnapshot = { version: 1; dismissed: boolean; step: number };
export const freshGuide = (): GuideSnapshot => ({ version: 1, dismissed: false, step: 0 });

export function restoreGuide(raw: string | null): GuideSnapshot {
  if (!raw) return freshGuide();
  try {
    const data = JSON.parse(raw);
    if (!data || data.version !== 1 || typeof data.dismissed !== "boolean" || !Number.isInteger(data.step) || data.step < 0 || data.step >= guideSteps.length) return freshGuide();
    return { version: 1, dismissed: data.dismissed, step: data.step };
  } catch { return freshGuide(); }
}

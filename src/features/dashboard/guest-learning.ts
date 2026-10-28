import type { LearningProgress } from "@/contracts/workspace";
import { decodeSnapshot } from "@/features/demo/session/storage";
import { decodeProgress, studySteps } from "@/features/theory/progress";

export const GUEST_LEARNING_KEY = "basedspeak.learning.guest.v1";
export type GuestStorage = Pick<Storage, "setItem" | "removeItem"> & Partial<Pick<Storage, "getItem">>;
export const emptyGuestLearning = (): LearningProgress => ({ revision: 0, demoSnapshot: null, studySnapshot: null, demoPercent: 0, studyCompleted: 0, studyTotal: studySteps.length, updatedAt: null });

function checkedStudy(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== "string" || raw.length > 50_000) throw new Error("Invalid guest study");
  const data = JSON.parse(raw);
  if (!data || data.version !== 1 || !Number.isInteger(data.position) || !Array.isArray(data.completed) || !Array.isArray(data.supported)) throw new Error("Invalid guest study");
  const progress = decodeProgress(raw);
  if (data.completed.length !== progress.completed.length || data.supported.length !== progress.supported.length) throw new Error("Invalid guest study");
  return JSON.stringify(progress);
}

/** A separate, versioned cache. It never reads legacy snapshots or any account's private cache. */
export function readGuestLearning(storage?: GuestStorage): LearningProgress {
  try {
    const raw = storage?.getItem?.(GUEST_LEARNING_KEY);
    if (!raw) return emptyGuestLearning();
    if (raw.length > 850_000) throw new Error("Guest cache too large");
    const value = JSON.parse(raw);
    if (!value || value.version !== 1) throw new Error("Invalid guest cache");
    const demoSnapshot = value.demoSnapshot ?? null;
    if (demoSnapshot !== null && (typeof demoSnapshot !== "string" || demoSnapshot.length > 750_000 || !decodeSnapshot(demoSnapshot))) throw new Error("Invalid guest story");
    const studySnapshot = checkedStudy(value.studySnapshot);
    return { ...emptyGuestLearning(), demoSnapshot, studySnapshot, studyCompleted: decodeProgress(studySnapshot).completed.length, updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null };
  } catch {
    try { storage?.removeItem(GUEST_LEARNING_KEY); } catch { /* Browser storage may be disabled. */ }
    return emptyGuestLearning();
  }
}

export function hasGuestLearning(learning?: LearningProgress | null) { return Boolean(learning?.demoSnapshot || learning?.studySnapshot); }
export function canImportGuestLearning(learning: LearningProgress, liveClass: unknown) { return learning.revision === 0 && learning.demoSnapshot === null && learning.studySnapshot === null && !liveClass; }
export function writeGuestLearning(storage: GuestStorage | undefined, learning: LearningProgress) {
  storage?.setItem(GUEST_LEARNING_KEY, JSON.stringify({ version: 1, demoSnapshot: learning.demoSnapshot, studySnapshot: learning.studySnapshot, updatedAt: learning.updatedAt }));
}

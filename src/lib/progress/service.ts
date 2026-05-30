import { PILLARS_CONTENT } from "@/data/pillars-content";
import type { PillarExam } from "@/lib/exam/service";
import type { LiveSessionBooking } from "@/lib/scheduling/types";
import type { User } from "@/lib/auth/service";
import {
  buildPillarRange,
  buildProgressSnapshot,
  type ContractExamStatus,
  type ContractLiveSessionStatus,
  type ContractSubscriptionStatus,
  type ProgressContractFacts,
  type ProgressSnapshot
} from "./contract";

export interface ProgressSnapshotUserLike
  extends Pick<
    Partial<User>,
    | "subscriptionStatus"
    | "approvedPillar"
    | "completedPillarModules"
    | "localPillarStatus"
    | "chosenSpecialization"
    | "specializationStatus"
    | "completedSpecializations"
  > {
  progressSnapshot?: unknown;
}

export interface DeriveProgressFactsInput {
  user?: ProgressSnapshotUserLike | null;
  exams?: Array<Partial<PillarExam> | null | undefined>;
  liveSessions?: Array<Partial<LiveSessionBooking> | null | undefined>;
}

export interface ProgressSnapshotOptions {
  requiredModuleIdsByPillar?: Record<number, string[]>;
  totalPillars?: number;
  respectLegacyApprovedPillar?: boolean;
}

export interface ProgressSnapshotComputation {
  facts: ProgressContractFacts;
  snapshot: ProgressSnapshot;
  legacyApprovedPillar: number;
}

export const DEFAULT_TOTAL_PILLARS = 9;

const EXAM_STATUS_PRIORITY: Record<ContractExamStatus, number> = {
  not_started: 0,
  rejected: 1,
  submitted: 2,
  approved: 3
};

const LIVE_SESSION_PRIORITY: Record<ContractLiveSessionStatus, number> = {
  not_created: 0,
  awaiting_pillar_approval: 1,
  cancelled: 2,
  awaiting_release_window: 3,
  ready_to_schedule: 4,
  pending_confirmation: 5,
  confirmed: 6,
  completed: 7
};

export function buildDefaultRequiredModuleIdsByPillar(): Record<number, string[]> {
  return Object.fromEntries(
    Object.entries(PILLARS_CONTENT).map(([pillarKey, pillarData]) => [
      Number(pillarKey),
      pillarData.modules?.map((module) => module.id) ?? []
    ])
  );
}

export function deriveProgressFacts(
  input: DeriveProgressFactsInput,
  options?: ProgressSnapshotOptions
): ProgressContractFacts {
  const user = input.user ?? null;
  const totalPillars = options?.totalPillars ?? DEFAULT_TOTAL_PILLARS;
  const requiredModuleIdsByPillar = options?.requiredModuleIdsByPillar ?? buildDefaultRequiredModuleIdsByPillar();
  const moduleCompletionByPillar = deriveModuleCompletionByPillar(user, requiredModuleIdsByPillar, totalPillars);

  return {
    subscriptionStatus: normalizeSubscriptionStatus(user?.subscriptionStatus),
    pillar1ModulesComplete: Boolean(moduleCompletionByPillar[1]),
    pillar1ExamStatus: deriveExamStatus(input.exams, 1),
    pillar2ModulesComplete: Boolean(moduleCompletionByPillar[2]),
    pillar2ExamStatus: deriveExamStatus(input.exams, 2),
    pillar2LiveSessionStatus: deriveLiveSessionStatus(input.liveSessions, 2),
    allPillarsMarkedComplete: areAllTrackedPillarsComplete(moduleCompletionByPillar, totalPillars),
    chosenSpecialization: Boolean(user?.chosenSpecialization),
    completedSpecializationsCount: Array.isArray(user?.completedSpecializations)
      ? user!.completedSpecializations!.length
      : 0,
    legacyApprovedPillar: normalizeApprovedPillar(user?.approvedPillar),
    legacyAccessOverride: false,
    moduleCompletionByPillar,
  };
}

export function computeProgressSnapshot(
  input: DeriveProgressFactsInput,
  options?: ProgressSnapshotOptions
): ProgressSnapshotComputation {
  const facts = deriveProgressFacts(input, options);
  const snapshot = buildProgressSnapshot(facts);
  const legacyApprovedPillar = facts.legacyApprovedPillar ?? 1;

  if (
    options?.respectLegacyApprovedPillar !== false &&
    legacyApprovedPillar > snapshot.highestUnlockedPillar
  ) {
    const legacySnapshot = applyLegacyApprovedPillarFloor(snapshot, legacyApprovedPillar, options?.totalPillars);
    return {
      facts: {
        ...facts,
        legacyAccessOverride: true,
      },
      snapshot: legacySnapshot,
      legacyApprovedPillar: toLegacyApprovedPillarMirror(legacySnapshot),
    };
  }

  return {
    facts,
    snapshot,
    legacyApprovedPillar: toLegacyApprovedPillarMirror(snapshot),
  };
}

export function applyLegacyApprovedPillarFloor(
  snapshot: ProgressSnapshot,
  approvedPillar: number,
  totalPillars = DEFAULT_TOTAL_PILLARS
): ProgressSnapshot {
  const floor = clamp(approvedPillar, 1, totalPillars);
  const currentPillar = Math.max(snapshot.currentPillar, floor);
  const highestUnlockedPillar = Math.max(snapshot.highestUnlockedPillar, floor);

  return {
    ...snapshot,
    currentPillar,
    highestUnlockedPillar,
    completedPillars: buildPillarRange(Math.max(0, floor - 1)),
    blockedReason: null,
    gateState: "open",
    legacyAccessOverride: true,
    nextAction: getLegacyContinueAction(currentPillar),
    eligibleForSpecialization: snapshot.eligibleForSpecialization || floor >= totalPillars,
  };
}

export function toLegacyApprovedPillarMirror(
  snapshot: Pick<ProgressSnapshot, "highestUnlockedPillar" | "eligibleForSpecialization">,
  totalPillars = DEFAULT_TOTAL_PILLARS
): number {
  if (snapshot.eligibleForSpecialization) {
    return totalPillars;
  }

  return clamp(snapshot.highestUnlockedPillar, 1, totalPillars);
}

export function isProgressSnapshot(value: unknown): value is ProgressSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    candidate.contractVersion === "progress-snapshot-v1" &&
    typeof candidate.currentPillar === "number" &&
    typeof candidate.highestUnlockedPillar === "number" &&
    Array.isArray(candidate.completedPillars) &&
    typeof candidate.nextAction === "string" &&
    typeof candidate.gateState === "string" &&
    typeof candidate.eligibleForSpecialization === "boolean" &&
    typeof candidate.legacyAccessOverride === "boolean"
  );
}

export function readStoredProgressSnapshot(value: unknown): ProgressSnapshot | null {
  return isProgressSnapshot(value) ? value : null;
}

export function deriveModuleCompletionByPillar(
  user: ProgressSnapshotUserLike | null | undefined,
  requiredModuleIdsByPillar = buildDefaultRequiredModuleIdsByPillar(),
  totalPillars = DEFAULT_TOTAL_PILLARS
): Partial<Record<number, boolean>> {
  const completedModules = new Set(
    Array.isArray(user?.completedPillarModules) ? user!.completedPillarModules!.filter(isString) : []
  );
  const localPillarStatus = normalizeLocalPillarStatus(user?.localPillarStatus);
  const moduleCompletionByPillar: Partial<Record<number, boolean>> = {};

  for (let pillarNumber = 1; pillarNumber <= totalPillars; pillarNumber += 1) {
    const requiredModuleIds = requiredModuleIdsByPillar[pillarNumber] ?? [];
    const hasExplicitModuleCompletion =
      requiredModuleIds.length > 0 && requiredModuleIds.every((moduleId) => completedModules.has(moduleId));
    const hasLegacyCompletedStatus = localPillarStatus[`pilar-${pillarNumber}`] === "completed";

    moduleCompletionByPillar[pillarNumber] = hasExplicitModuleCompletion || hasLegacyCompletedStatus;
  }

  return moduleCompletionByPillar;
}

export function deriveExamStatus(
  exams: Array<Partial<PillarExam> | null | undefined> | undefined,
  pillarId: number
): ContractExamStatus {
  const relevantExams = (exams ?? [])
    .filter((exam): exam is Partial<PillarExam> => Boolean(exam) && exam?.pillarId === pillarId)
    .map((exam) => normalizeExamStatus(exam.status));

  if (relevantExams.length === 0) {
    return "not_started";
  }

  return relevantExams.reduce((best, current) =>
    EXAM_STATUS_PRIORITY[current] > EXAM_STATUS_PRIORITY[best] ? current : best
  );
}

export function deriveLiveSessionStatus(
  liveSessions: Array<Partial<LiveSessionBooking> | null | undefined> | undefined,
  sourcePillarId: number
): ContractLiveSessionStatus {
  const relevantSessions = (liveSessions ?? [])
    .filter((session): session is Partial<LiveSessionBooking> => Boolean(session) && session?.sourcePillarId === sourcePillarId)
    .map((session) => normalizeLiveSessionStatus(session.status));

  if (relevantSessions.length === 0) {
    return "not_created";
  }

  return relevantSessions.reduce((best, current) =>
    LIVE_SESSION_PRIORITY[current] > LIVE_SESSION_PRIORITY[best] ? current : best
  );
}

export function normalizeSubscriptionStatus(value: unknown): ContractSubscriptionStatus {
  if (value === "premium" || value === "admin" || value === "expired" || value === "cancelled") {
    return value;
  }

  return "free";
}

export function normalizeExamStatus(value: unknown): ContractExamStatus {
  if (value === "approved") return "approved";
  if (value === "rejected") return "rejected";
  if (value === "pending" || value === "submitted") return "submitted";
  return "not_started";
}

export function normalizeLiveSessionStatus(value: unknown): ContractLiveSessionStatus {
  if (
    value === "awaiting_pillar_approval" ||
    value === "awaiting_release_window" ||
    value === "ready_to_schedule" ||
    value === "pending_confirmation" ||
    value === "confirmed" ||
    value === "completed" ||
    value === "cancelled"
  ) {
    return value;
  }

  return "not_created";
}

export function normalizeApprovedPillar(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(1, Math.trunc(value));
}

function normalizeLocalPillarStatus(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(([, entryValue]) => typeof entryValue === "string")
  ) as Record<string, string>;
}

function areAllTrackedPillarsComplete(
  moduleCompletionByPillar: Partial<Record<number, boolean>>,
  totalPillars: number
): boolean {
  for (let pillarNumber = 1; pillarNumber <= totalPillars; pillarNumber += 1) {
    if (!moduleCompletionByPillar[pillarNumber]) {
      return false;
    }
  }

  return true;
}

function getLegacyContinueAction(currentPillar: number): ProgressSnapshot["nextAction"] {
  if (currentPillar <= 1) return "continue_pillar_1";
  if (currentPillar === 2) return "continue_pillar_2";
  if (currentPillar >= DEFAULT_TOTAL_PILLARS) return "choose_specialization";
  return "continue_pillar_3";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

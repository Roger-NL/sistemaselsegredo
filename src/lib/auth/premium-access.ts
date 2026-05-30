import {
  computeProgressSnapshot,
  type ContractExamStatus,
  type ContractLiveSessionStatus,
  type ContractSubscriptionStatus,
  type ProgressSnapshot,
} from "@/lib/progress";

const REQUIRED_PILLAR_ONE_MODULE_IDS = ["p1-m1", "p1-m2", "p1-m3", "p1-m4", "p1-m5", "p1-m6"] as const;
const REQUIRED_PILLAR_TWO_MODULE_IDS = ["p2-m1", "p2-m2", "p2-m3", "p2-m4", "p2-m5", "p2-m6"] as const;

export type WriterExamStatus = "not_started" | "pending" | "approved" | "rejected" | null | undefined;
export type WriterLiveSessionStatus =
  | "not_created"
  | "awaiting_pillar_approval"
  | "awaiting_release_window"
  | "ready_to_schedule"
  | "pending_confirmation"
  | "confirmed"
  | "completed"
  | "cancelled"
  | null
  | undefined;

export type StoredProgressSnapshot = ProgressSnapshot;

type ProgressSnapshotBuildInput = {
  subscriptionStatus: string | null | undefined;
  completedPillarModules?: string[] | null;
  localPillarStatus?: Record<string, string> | null;
  chosenSpecialization?: string | null;
  completedSpecializations?: string[] | null;
  pillar1ExamStatus?: WriterExamStatus;
  pillar2ExamStatus?: WriterExamStatus;
  pillar2LiveSessionStatus?: WriterLiveSessionStatus;
  currentApprovedPillar?: number;
};

type PremiumAccessUpdateInput = {
  currentApprovedPillar?: number;
  inviteCodeUsed?: string;
  paymentId?: string;
  purchasedPlan?: "lifetime";
  activatedAtIso?: string;
  expiresAtIso?: string;
};

export function normalizeInviteCode(code: string): string {
  return code.trim().replace(/\s+/g, "").toUpperCase();
}

export function resolvePremiumExpiresAtIso(now = new Date()): string {
  const expiresAt = new Date(now);
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  return expiresAt.toISOString();
}

export function toContractSubscriptionStatus(status: string | null | undefined): ContractSubscriptionStatus {
  if (status === "premium" || status === "admin" || status === "expired" || status === "cancelled") {
    return status;
  }

  return "free";
}

export function toContractExamStatus(status: WriterExamStatus): ContractExamStatus {
  if (status === "approved" || status === "rejected") {
    return status;
  }

  if (status === "pending") {
    return "submitted";
  }

  return "not_started";
}

export function toContractLiveSessionStatus(status: WriterLiveSessionStatus): ContractLiveSessionStatus {
  if (
    status === "awaiting_pillar_approval" ||
    status === "awaiting_release_window" ||
    status === "ready_to_schedule" ||
    status === "pending_confirmation" ||
    status === "confirmed" ||
    status === "completed" ||
    status === "cancelled"
  ) {
    return status;
  }

  return "not_created";
}

export function buildStoredProgressSnapshot({
  subscriptionStatus,
  completedPillarModules,
  localPillarStatus,
  chosenSpecialization,
  completedSpecializations,
  pillar1ExamStatus,
  pillar2ExamStatus,
  pillar2LiveSessionStatus,
  currentApprovedPillar = 1,
}: ProgressSnapshotBuildInput): StoredProgressSnapshot {
  const normalizedSubscriptionStatus = toContractSubscriptionStatus(subscriptionStatus);
  const normalizedPillar1ExamStatus = toContractExamStatus(pillar1ExamStatus);
  const normalizedPillar2ExamStatus = toContractExamStatus(pillar2ExamStatus);
  const normalizedPillar2LiveSessionStatus = toContractLiveSessionStatus(pillar2LiveSessionStatus);

  const computation = computeProgressSnapshot(
    {
      user: {
        subscriptionStatus:
          normalizedSubscriptionStatus === "admin" || normalizedSubscriptionStatus === "premium"
            ? "premium"
            : normalizedSubscriptionStatus === "expired"
              ? "expired"
              : "free",
        approvedPillar: currentApprovedPillar,
        completedPillarModules: completedPillarModules ?? [],
        localPillarStatus: localPillarStatus ?? undefined,
        chosenSpecialization: chosenSpecialization ?? undefined,
        completedSpecializations: completedSpecializations ?? undefined,
      },
      exams: [
        normalizedPillar1ExamStatus === "not_started"
          ? { pillarId: 1 }
          : { pillarId: 1, status: normalizedPillar1ExamStatus === "submitted" ? "pending" : normalizedPillar1ExamStatus },
        normalizedPillar2ExamStatus === "not_started"
          ? { pillarId: 2 }
          : { pillarId: 2, status: normalizedPillar2ExamStatus === "submitted" ? "pending" : normalizedPillar2ExamStatus },
      ],
      liveSessions: [
        normalizedPillar2LiveSessionStatus === "not_created"
          ? { sourcePillarId: 2 }
          : { sourcePillarId: 2, status: normalizedPillar2LiveSessionStatus },
      ],
    },
    {
      requiredModuleIdsByPillar: {
        1: [...REQUIRED_PILLAR_ONE_MODULE_IDS],
        2: [...REQUIRED_PILLAR_TWO_MODULE_IDS],
      },
      totalPillars: 9,
      respectLegacyApprovedPillar: true,
    }
  );

  return computation.snapshot;
}

export function deriveLegacyApprovedPillar(snapshot: Pick<StoredProgressSnapshot, "highestUnlockedPillar">) {
  return Math.max(1, snapshot.highestUnlockedPillar);
}

export function buildPremiumAccessUpdate({
  currentApprovedPillar = 1,
  inviteCodeUsed,
  paymentId,
  purchasedPlan,
  activatedAtIso = new Date().toISOString(),
  expiresAtIso = resolvePremiumExpiresAtIso(),
}: PremiumAccessUpdateInput) {
  const nextApprovedPillar = Math.max(currentApprovedPillar, 2);

  return {
    subscriptionStatus: "premium" as const,
    subscriptionExpiresAt: expiresAtIso,
    premiumActivatedAt: activatedAtIso,
    approvedPillar: nextApprovedPillar,
    ...(inviteCodeUsed ? { inviteCodeUsed } : {}),
    ...(paymentId ? { paymentId } : {}),
    ...(purchasedPlan ? { purchasedPlan } : {}),
  };
}

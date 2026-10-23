import "server-only";

import { getAdminDb } from "@/server/firebase";
import { PILLARS_CONTENT } from "@/data/pillars-content";
import { PLANETS } from "@/data/curriculum";
import {
  buildStoredProgressSnapshot,
  deriveLegacyApprovedPillar,
  type WriterExamStatus,
  type WriterLiveSessionStatus,
} from "@/lib/auth/premium-access";

const USERS_COLLECTION = "users";
const EXAMS_COLLECTION = "pillar_exams";
const LIVE_SESSIONS_COLLECTION = "live_sessions";

export type ProgressUpdateInput = {
  completedPillarModules?: unknown;
  chosenSpecialization?: unknown;
  specializationStatus?: unknown;
  completedSpecializations?: unknown;
  completedModules?: unknown;
  hasSeenMissionComplete?: unknown;
  approvedPillar?: unknown;
};

const ALL_MODULES = new Map(
  Object.entries(PILLARS_CONTENT).flatMap(([pillarId, content]) =>
    (content.modules ?? []).map((module) => [module.id, Number(pillarId)] as const)
  )
);
const SPECIALIZATION_IDS = new Set(PLANETS.map((planet) => planet.id));
const SPECIALIZATION_STATUSES = new Set(["studying", "pending_approval", "completed"]);

function stringArray(value: unknown, field: string): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`INVALID_${field.toUpperCase()}`);
  }
  return Array.from(new Set(value));
}

function normalizeCompletedModules(value: unknown): Record<string, number[]> | undefined {
  if (value === undefined) return undefined;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("INVALID_COMPLETED_MODULES");
  }

  const normalized: Record<string, number[]> = {};
  for (const [specializationId, moduleIds] of Object.entries(value as Record<string, unknown>)) {
    if (!SPECIALIZATION_IDS.has(specializationId) || !Array.isArray(moduleIds)) {
      throw new Error("INVALID_COMPLETED_MODULES");
    }
    const cleanIds = Array.from(new Set(moduleIds));
    if (cleanIds.some((moduleId) => !Number.isInteger(moduleId) || Number(moduleId) < 1 || Number(moduleId) > 5)) {
      throw new Error("INVALID_COMPLETED_MODULES");
    }
    normalized[specializationId] = cleanIds.map(Number).sort((left, right) => left - right);
  }
  return normalized;
}

async function latestExamStatus(userId: string, pillarId: number): Promise<WriterExamStatus> {
  const snapshot = await getAdminDb().collection(EXAMS_COLLECTION)
    .where("userId", "==", userId)
    .where("pillarId", "==", pillarId)
    .get();
  if (snapshot.empty) return "not_started";

  return snapshot.docs
    .map((doc) => doc.data() as { status?: WriterExamStatus; createdAt?: { toMillis?: () => number } })
    .sort((left, right) => (right.createdAt?.toMillis?.() ?? 0) - (left.createdAt?.toMillis?.() ?? 0))[0]
    ?.status ?? "not_started";
}

function unionNumbers(left: number[] = [], right: number[] = []) {
  return Array.from(new Set([...left, ...right])).sort((a, b) => a - b);
}

export async function updateProgressServer(
  userId: string,
  input: ProgressUpdateInput,
  isAdmin: boolean
) {
  const userRef = getAdminDb().collection(USERS_COLLECTION).doc(userId);
  const userSnapshot = await userRef.get();
  if (!userSnapshot.exists) throw new Error("USER_NOT_FOUND");
  const current = userSnapshot.data() as Record<string, unknown>;
  const highestUnlocked =
    current.progressSnapshot && typeof current.progressSnapshot === "object" &&
    typeof (current.progressSnapshot as { highestUnlockedPillar?: unknown }).highestUnlockedPillar === "number"
      ? (current.progressSnapshot as { highestUnlockedPillar: number }).highestUnlockedPillar
      : typeof current.approvedPillar === "number"
        ? current.approvedPillar
        : 1;

  const requestedPillarModules = stringArray(input.completedPillarModules, "completed_pillar_modules");
  const currentPillarModules = stringArray(current.completedPillarModules, "completed_pillar_modules") ?? [];
  let completedPillarModules = currentPillarModules;
  if (requestedPillarModules) {
    for (const moduleId of requestedPillarModules) {
      const pillarId = ALL_MODULES.get(moduleId);
      if (!pillarId || (!isAdmin && pillarId > highestUnlocked)) {
        throw new Error("PROGRESS_MODULE_NOT_ALLOWED");
      }
    }
    completedPillarModules = isAdmin
      ? requestedPillarModules
      : Array.from(new Set([...currentPillarModules, ...requestedPillarModules]));
  }

  const eligibleForSpecialization = Boolean(
    current.progressSnapshot && typeof current.progressSnapshot === "object" &&
    (current.progressSnapshot as { eligibleForSpecialization?: unknown }).eligibleForSpecialization === true
  );
  const requestedSpecialization = input.chosenSpecialization;
  let chosenSpecialization =
    typeof current.chosenSpecialization === "string" ? current.chosenSpecialization : null;
  if (requestedSpecialization !== undefined) {
    if (requestedSpecialization !== null && (
      typeof requestedSpecialization !== "string" ||
      !SPECIALIZATION_IDS.has(requestedSpecialization) ||
      (!isAdmin && !eligibleForSpecialization)
    )) {
      throw new Error("SPECIALIZATION_NOT_ALLOWED");
    }
    chosenSpecialization = requestedSpecialization as string | null;
  }

  const requestedCompletedModules = normalizeCompletedModules(input.completedModules);
  const currentCompletedModules = normalizeCompletedModules(current.completedModules) ?? {};
  const completedModules = { ...currentCompletedModules };
  if (requestedCompletedModules) {
    for (const [specializationId, moduleIds] of Object.entries(requestedCompletedModules)) {
      if (!isAdmin && !eligibleForSpecialization && specializationId !== current.chosenSpecialization) {
        throw new Error("SPECIALIZATION_NOT_ALLOWED");
      }
      completedModules[specializationId] = isAdmin
        ? moduleIds
        : unionNumbers(currentCompletedModules[specializationId], moduleIds);
    }
  }

  const requestedCompletedSpecializations = stringArray(input.completedSpecializations, "completed_specializations");
  const currentCompletedSpecializations = stringArray(current.completedSpecializations, "completed_specializations") ?? [];
  let completedSpecializations = currentCompletedSpecializations;
  if (requestedCompletedSpecializations) {
    if (requestedCompletedSpecializations.some((id) =>
      !SPECIALIZATION_IDS.has(id) || (!isAdmin && (completedModules[id]?.length ?? 0) < 5)
    )) {
      throw new Error("SPECIALIZATION_NOT_COMPLETE");
    }
    completedSpecializations = isAdmin
      ? requestedCompletedSpecializations
      : Array.from(new Set([...currentCompletedSpecializations, ...requestedCompletedSpecializations]));
  }

  let specializationStatus = current.specializationStatus ?? null;
  if (input.specializationStatus !== undefined) {
    if (input.specializationStatus !== null && (
      typeof input.specializationStatus !== "string" || !SPECIALIZATION_STATUSES.has(input.specializationStatus)
    )) {
      throw new Error("INVALID_SPECIALIZATION_STATUS");
    }
    if (!isAdmin && input.specializationStatus === "completed" && completedSpecializations.length === 0) {
      throw new Error("SPECIALIZATION_NOT_COMPLETE");
    }
    specializationStatus = input.specializationStatus;
  }

  if (input.hasSeenMissionComplete !== undefined && typeof input.hasSeenMissionComplete !== "boolean") {
    throw new Error("INVALID_MISSION_COMPLETE_STATE");
  }
  if (input.approvedPillar !== undefined && (!isAdmin || !Number.isInteger(input.approvedPillar))) {
    throw new Error("ADMIN_PROGRESS_REQUIRED");
  }

  const approvedPillar = input.approvedPillar !== undefined
    ? Math.min(9, Math.max(1, Number(input.approvedPillar)))
    : typeof current.approvedPillar === "number"
      ? current.approvedPillar
      : 1;

  const [pillar1ExamStatus, pillar2ExamStatus, liveSession] = await Promise.all([
    latestExamStatus(userId, 1),
    latestExamStatus(userId, 2),
    getAdminDb().collection(LIVE_SESSIONS_COLLECTION).doc(`${userId}_p2`).get(),
  ]);
  const progressSnapshot = buildStoredProgressSnapshot({
    subscriptionStatus: typeof current.subscriptionStatus === "string" ? current.subscriptionStatus : "free",
    completedPillarModules,
    chosenSpecialization,
    completedSpecializations,
    pillar1ExamStatus,
    pillar2ExamStatus,
    pillar2LiveSessionStatus: liveSession.exists
      ? (liveSession.data()?.status as WriterLiveSessionStatus | undefined)
      : "not_created",
    currentApprovedPillar: approvedPillar,
  });

  const update = {
    completedPillarModules,
    chosenSpecialization,
    specializationStatus,
    completedSpecializations,
    completedModules,
    ...(typeof input.hasSeenMissionComplete === "boolean"
      ? { hasSeenMissionComplete: input.hasSeenMissionComplete }
      : {}),
    progressSnapshot,
    approvedPillar: deriveLegacyApprovedPillar(progressSnapshot),
    updatedAt: new Date().toISOString(),
  };
  await userRef.set(update, { merge: true });
  return update;
}

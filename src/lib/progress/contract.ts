export type ProgressBlockedReason =
  | "premium_required"
  | "pillar_1_modules_incomplete"
  | "pillar_1_exam_not_submitted"
  | "pillar_2_modules_incomplete"
  | "pillar_2_exam_not_approved"
  | "pillar_2_live_session_not_confirmed";

export type ProgressNextAction =
  | "continue_pillar_1"
  | "submit_pillar_1_exam"
  | "upgrade_required"
  | "continue_pillar_2"
  | "complete_pillar_2_modules"
  | "submit_pillar_2_exam"
  | "schedule_pillar_2_live_session"
  | "wait_pillar_2_live_session_release"
  | "wait_pillar_2_live_session_confirmation"
  | "continue_pillar_3"
  | "choose_specialization";

export type ContractExamStatus =
  | "not_started"
  | "submitted"
  | "approved"
  | "rejected";

export type ContractLiveSessionStatus =
  | "not_created"
  | "awaiting_pillar_approval"
  | "awaiting_release_window"
  | "ready_to_schedule"
  | "pending_confirmation"
  | "confirmed"
  | "completed"
  | "cancelled";

export type ContractSubscriptionStatus =
  | "free"
  | "premium"
  | "admin"
  | "expired"
  | "cancelled";

export type ProgressGateState = "open" | "blocked";

export interface ProgressContractFacts {
  subscriptionStatus: ContractSubscriptionStatus;
  pillar1ModulesComplete: boolean;
  pillar1ExamStatus: ContractExamStatus;
  pillar2ModulesComplete: boolean;
  pillar2ExamStatus: ContractExamStatus;
  pillar2LiveSessionStatus: ContractLiveSessionStatus;
  allPillarsMarkedComplete?: boolean;
  chosenSpecialization?: boolean;
  completedSpecializationsCount?: number;
  legacyApprovedPillar?: number | null;
  legacyAccessOverride?: boolean;
  moduleCompletionByPillar?: Partial<Record<number, boolean>>;
}

export interface ProgressDecisionSeed {
  fromPillar: 1 | 2;
  toPillar: 2 | 3;
  unlocked: boolean;
  blockedReason: ProgressBlockedReason | null;
  nextAction: ProgressNextAction;
  notes: string;
}

export interface ProgressSnapshotSeed {
  currentPillar: number;
  highestUnlockedPillar: number;
  completedPillars: number[];
  blockedReason: ProgressBlockedReason | null;
  nextAction: ProgressNextAction;
  gateState: ProgressGateState;
  eligibleForSpecialization: boolean;
}

export interface ProgressSnapshot extends ProgressSnapshotSeed {
  contractVersion: typeof PROGRESS_CONTRACT_VERSION;
  legacyAccessOverride: boolean;
  decisions: {
    pillar1To2: ProgressDecisionSeed;
    pillar2To3: ProgressDecisionSeed;
  };
}

export const PROGRESS_CONTRACT_VERSION = "progress-snapshot-v1";

export const PROGRESS_CONTRACT_NOTES = {
  pillar1To2:
    "Pilar 2 so abre para premium/admin com Pilar 1 academicamente fechado. Nesta fase, academicamente fechado significa modulos do Pilar 1 completos + prova do Pilar 1 enviada ou aprovada.",
  pillar2To3:
    "Pilar 3 so abre quando Pilar 2 estiver academicamente fechado e a aula ao vivo do Pilar 2 estiver confirmada ou concluida. Estados intermediarios apenas mudam o nextAction.",
  specialization:
    "Elegibilidade para especializacao continua derivada dos fatos legados de conclusao total enquanto a migracao dos pilares 4 a 9 nao chega ao snapshot completo."
} as const;

export function evaluatePillar1To2Contract(
  facts: Pick<
    ProgressContractFacts,
    "subscriptionStatus" | "pillar1ModulesComplete" | "pillar1ExamStatus" | "legacyAccessOverride"
  >
): ProgressDecisionSeed {
  if (facts.legacyAccessOverride) {
    return {
      fromPillar: 1,
      toPillar: 2,
      unlocked: true,
      blockedReason: null,
      nextAction: "continue_pillar_2",
      notes: "Legacy access override mantem Pilar 2 aberto durante a migracao."
    };
  }

  if (!facts.pillar1ModulesComplete) {
    return {
      fromPillar: 1,
      toPillar: 2,
      unlocked: false,
      blockedReason: "pillar_1_modules_incomplete",
      nextAction: "continue_pillar_1",
      notes: "Nao libera Pilar 2 antes de todos os modulos do Pilar 1 estarem completos."
    };
  }

  if (facts.pillar1ExamStatus === "not_started") {
    return {
      fromPillar: 1,
      toPillar: 2,
      unlocked: false,
      blockedReason: "pillar_1_exam_not_submitted",
      nextAction: "submit_pillar_1_exam",
      notes: "A prova do Pilar 1 precisa pelo menos ser enviada para fechar academicamente o pilar."
    };
  }

  if (!isPaidProgressTier(facts.subscriptionStatus)) {
    return {
      fromPillar: 1,
      toPillar: 2,
      unlocked: false,
      blockedReason: "premium_required",
      nextAction: "upgrade_required",
      notes: "Free pode concluir o Pilar 1, mas nao avanca para o Pilar 2 sem premium."
    };
  }

  return {
    fromPillar: 1,
    toPillar: 2,
    unlocked: true,
    blockedReason: null,
    nextAction: "continue_pillar_2",
    notes: "Premium/admin com Pilar 1 academicamente fechado libera Pilar 2."
  };
}

export function evaluatePillar2To3Contract(
  facts: Pick<
    ProgressContractFacts,
    | "subscriptionStatus"
    | "pillar2ModulesComplete"
    | "pillar2ExamStatus"
    | "pillar2LiveSessionStatus"
    | "legacyAccessOverride"
  >
): ProgressDecisionSeed {
  if (facts.legacyAccessOverride) {
    return {
      fromPillar: 2,
      toPillar: 3,
      unlocked: true,
      blockedReason: null,
      nextAction: "continue_pillar_3",
      notes: "Legacy access override mantem Pilar 3 aberto durante a migracao."
    };
  }

  if (!isPaidProgressTier(facts.subscriptionStatus)) {
    return {
      fromPillar: 2,
      toPillar: 3,
      unlocked: false,
      blockedReason: "premium_required",
      nextAction: "upgrade_required",
      notes: "A regra de premium continua valendo para qualquer progressao acima do Pilar 1."
    };
  }

  if (!facts.pillar2ModulesComplete) {
    return {
      fromPillar: 2,
      toPillar: 3,
      unlocked: false,
      blockedReason: "pillar_2_modules_incomplete",
      nextAction: "complete_pillar_2_modules",
      notes: "Todos os modulos do Pilar 2 precisam estar completos antes da etapa ao vivo."
    };
  }

  if (facts.pillar2ExamStatus !== "approved") {
    return {
      fromPillar: 2,
      toPillar: 3,
      unlocked: false,
      blockedReason: "pillar_2_exam_not_approved",
      nextAction: "submit_pillar_2_exam",
      notes: "Para abrir o Pilar 3, a prova do Pilar 2 precisa estar aprovada."
    };
  }

  if (
    facts.pillar2LiveSessionStatus === "not_created" ||
    facts.pillar2LiveSessionStatus === "awaiting_pillar_approval" ||
    facts.pillar2LiveSessionStatus === "ready_to_schedule" ||
    facts.pillar2LiveSessionStatus === "cancelled"
  ) {
    return {
      fromPillar: 2,
      toPillar: 3,
      unlocked: false,
      blockedReason: "pillar_2_live_session_not_confirmed",
      nextAction: "schedule_pillar_2_live_session",
      notes: "Sem aula ao vivo confirmada, o Pilar 3 continua fechado."
    };
  }

  if (facts.pillar2LiveSessionStatus === "awaiting_release_window") {
    return {
      fromPillar: 2,
      toPillar: 3,
      unlocked: false,
      blockedReason: "pillar_2_live_session_not_confirmed",
      nextAction: "wait_pillar_2_live_session_release",
      notes: "A sessao ja foi liberada, mas ainda esta fora da janela segura para abrir os horarios."
    };
  }

  if (facts.pillar2LiveSessionStatus === "pending_confirmation") {
    return {
      fromPillar: 2,
      toPillar: 3,
      unlocked: false,
      blockedReason: "pillar_2_live_session_not_confirmed",
      nextAction: "wait_pillar_2_live_session_confirmation",
      notes: "Agendamento iniciado ainda nao basta; a confirmacao e obrigatoria para abrir o Pilar 3."
    };
  }

  return {
    fromPillar: 2,
    toPillar: 3,
    unlocked: true,
    blockedReason: null,
    nextAction: "continue_pillar_3",
    notes: "Pilar 3 abre apenas depois da confirmacao ou conclusao da aula ao vivo do Pilar 2."
  };
}

export function buildProgressSnapshotSeed(facts: ProgressContractFacts): ProgressSnapshotSeed {
  if (
    facts.allPillarsMarkedComplete ||
    (facts.completedSpecializationsCount ?? 0) > 0 ||
    facts.chosenSpecialization
  ) {
    return {
      currentPillar: 9,
      highestUnlockedPillar: 9,
      completedPillars: buildPillarRange(9),
      blockedReason: null,
      nextAction: "choose_specialization",
      gateState: "open",
      eligibleForSpecialization: true
    };
  }

  const p1To2 = evaluatePillar1To2Contract(facts);
  const p2To3 = evaluatePillar2To3Contract(facts);

  if (!p1To2.unlocked) {
    return {
      currentPillar: 1,
      highestUnlockedPillar: 1,
      completedPillars: [],
      blockedReason: p1To2.blockedReason,
      nextAction: p1To2.nextAction,
      gateState: "blocked",
      eligibleForSpecialization: false
    };
  }

  if (!p2To3.unlocked) {
    return {
      currentPillar: 2,
      highestUnlockedPillar: 2,
      completedPillars: [1],
      blockedReason: p2To3.blockedReason,
      nextAction: p2To3.nextAction,
      gateState: "blocked",
      eligibleForSpecialization: false
    };
  }

  return {
    currentPillar: 3,
    highestUnlockedPillar: 3,
    completedPillars: [1, 2],
    blockedReason: null,
    nextAction: "continue_pillar_3",
    gateState: "open",
    eligibleForSpecialization: false
  };
}

export function buildProgressSnapshot(
  facts: ProgressContractFacts,
  options?: {
    forceLegacyAccessOverride?: boolean;
  }
): ProgressSnapshot {
  const seed = buildProgressSnapshotSeed(facts);
  const p1To2 = evaluatePillar1To2Contract(facts);
  const p2To3 = evaluatePillar2To3Contract(facts);

  return {
    ...seed,
    contractVersion: PROGRESS_CONTRACT_VERSION,
    legacyAccessOverride: Boolean(options?.forceLegacyAccessOverride || facts.legacyAccessOverride),
    decisions: {
      pillar1To2: p1To2,
      pillar2To3: p2To3
    }
  };
}

export function isPaidProgressTier(status: ContractSubscriptionStatus): boolean {
  return status === "premium" || status === "admin";
}

export function buildPillarRange(count: number): number[] {
  return Array.from({ length: Math.max(0, count) }, (_, index) => index + 1);
}

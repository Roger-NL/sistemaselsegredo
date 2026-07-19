import "server-only";

import { Timestamp, type Transaction } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { PILLARS_CONTENT } from "@/data/pillars-content";
import { getQuizByPillarNumber } from "@/data/quizzes";
import {
  buildStoredProgressSnapshot,
  deriveLegacyApprovedPillar,
  type WriterExamStatus,
  type WriterLiveSessionStatus,
} from "@/lib/auth/premium-access";
import { releaseLiveSessionAfterApproval } from "@/lib/scheduling/service";

const EXAMS_COLLECTION = "pillar_exams";
const USERS_COLLECTION = "users";
const SUBMISSION_LOCKS_COLLECTION = "exam_submission_locks";

type ExamDecision = "approved" | "rejected";

export interface ServerExamSubmissionInput {
  userId: string;
  userEmail: string | null;
  pillarId: number;
  quizAnswers: number[];
  writtenAnswer: string;
  userPhone?: string;
  isAdmin?: boolean;
}

function lockId(userId: string, pillarId: number) {
  return `${userId}_p${pillarId}`;
}

function validateSubmission(input: ServerExamSubmissionInput) {
  if (!Number.isInteger(input.pillarId) || input.pillarId < 1 || input.pillarId > 9) {
    throw new Error("INVALID_PILLAR");
  }

  const answerLength = input.writtenAnswer.trim().length;
  if (answerLength < 50 || answerLength > 20_000) {
    throw new Error("INVALID_WRITTEN_ANSWER");
  }

  const quiz = getQuizByPillarNumber(input.pillarId);
  if (
    !quiz ||
    !Array.isArray(input.quizAnswers) ||
    input.quizAnswers.length !== quiz.questions.length ||
    input.quizAnswers.some((answer, index) =>
      !Number.isInteger(answer) || answer < 0 || answer >= quiz.questions[index].options.length
    )
  ) {
    throw new Error("INVALID_QUIZ_ANSWERS");
  }
}

function calculateQuizScore(pillarId: number, answers: number[]) {
  const quiz = getQuizByPillarNumber(pillarId);
  if (!quiz) throw new Error("INVALID_PILLAR");
  const correct = quiz.questions.reduce(
    (total, question, index) => total + (answers[index] === question.correctAnswer ? 1 : 0),
    0
  );
  return Math.round((correct / quiz.questions.length) * 100);
}

function assertExamEligibility(userData: Record<string, unknown>, input: ServerExamSubmissionInput) {
  if (input.isAdmin) return;

  const subscriptionStatus = userData.subscriptionStatus;
  const highestUnlockedPillar =
    userData.progressSnapshot && typeof userData.progressSnapshot === "object" &&
    typeof (userData.progressSnapshot as { highestUnlockedPillar?: unknown }).highestUnlockedPillar === "number"
      ? (userData.progressSnapshot as { highestUnlockedPillar: number }).highestUnlockedPillar
      : typeof userData.approvedPillar === "number"
        ? userData.approvedPillar
        : 1;

  if (input.pillarId > 1 && subscriptionStatus !== "premium") {
    throw new Error("EXAM_REQUIRES_PREMIUM");
  }

  if (input.pillarId > highestUnlockedPillar) {
    throw new Error("EXAM_PILLAR_LOCKED");
  }

  const completedModules = new Set(
    Array.isArray(userData.completedPillarModules)
      ? userData.completedPillarModules.filter((value): value is string => typeof value === "string")
      : []
  );
  const requiredModuleIds = PILLARS_CONTENT[input.pillarId]?.modules?.map((module) => module.id) ?? [];
  if (requiredModuleIds.length === 0 || !requiredModuleIds.every((moduleId) => completedModules.has(moduleId))) {
    throw new Error("EXAM_MODULES_INCOMPLETE");
  }
}

async function getLatestExamStatus(
  userId: string,
  pillarId: number,
  transaction?: Transaction
): Promise<WriterExamStatus> {
  const examQuery = adminDb
    .collection(EXAMS_COLLECTION)
    .where("userId", "==", userId)
    .where("pillarId", "==", pillarId);
  const snapshot = transaction ? await transaction.get(examQuery) : await examQuery.get();

  if (snapshot.empty) return "not_started";

  const exams = snapshot.docs
    .map((doc) => doc.data() as { status?: WriterExamStatus; createdAt?: { toMillis?: () => number } | null })
    .sort((left, right) => (right.createdAt?.toMillis?.() ?? 0) - (left.createdAt?.toMillis?.() ?? 0));

  return exams[0]?.status ?? "not_started";
}

async function getProgressContext(userId: string, transaction?: Transaction) {
  const liveSessionRef = adminDb.collection("live_sessions").doc(`${userId}_p2`);
  const [pillar1ExamStatus, pillar2ExamStatus, liveSessionSnapshot] = await Promise.all([
    getLatestExamStatus(userId, 1, transaction),
    getLatestExamStatus(userId, 2, transaction),
    transaction ? transaction.get(liveSessionRef) : liveSessionRef.get(),
  ]);

  return {
    pillar1ExamStatus,
    pillar2ExamStatus,
    pillar2LiveSessionStatus: (
      liveSessionSnapshot.exists
        ? (liveSessionSnapshot.data()?.status as WriterLiveSessionStatus | undefined)
        : "not_created"
    ),
  };
}

function buildProgressUpdate(
  userData: Record<string, unknown>,
  context: Awaited<ReturnType<typeof getProgressContext>>,
  overrides?: {
    pillar1ExamStatus?: WriterExamStatus;
    pillar2ExamStatus?: WriterExamStatus;
    approvedPillar?: number;
  }
) {
  const snapshot = buildStoredProgressSnapshot({
    subscriptionStatus: typeof userData.subscriptionStatus === "string" ? userData.subscriptionStatus : "free",
    completedPillarModules: Array.isArray(userData.completedPillarModules)
      ? userData.completedPillarModules.filter((value): value is string => typeof value === "string")
      : [],
    localPillarStatus:
      userData.localPillarStatus && typeof userData.localPillarStatus === "object"
        ? (userData.localPillarStatus as Record<string, string>)
        : undefined,
    chosenSpecialization:
      typeof userData.chosenSpecialization === "string" ? userData.chosenSpecialization : null,
    completedSpecializations: Array.isArray(userData.completedSpecializations)
      ? userData.completedSpecializations.filter((value): value is string => typeof value === "string")
      : [],
    pillar1ExamStatus: overrides?.pillar1ExamStatus ?? context.pillar1ExamStatus,
    pillar2ExamStatus: overrides?.pillar2ExamStatus ?? context.pillar2ExamStatus,
    pillar2LiveSessionStatus: context.pillar2LiveSessionStatus,
    currentApprovedPillar:
      overrides?.approvedPillar ??
      (typeof userData.approvedPillar === "number" ? userData.approvedPillar : 1),
  });

  return {
    progressSnapshot: snapshot,
    approvedPillar: deriveLegacyApprovedPillar(snapshot),
    updatedAt: new Date().toISOString(),
  };
}

export async function submitExamServer(input: ServerExamSubmissionInput) {
  validateSubmission(input);
  const quizScore = calculateQuizScore(input.pillarId, input.quizAnswers);

  const pendingSnapshot = await adminDb
    .collection(EXAMS_COLLECTION)
    .where("userId", "==", input.userId)
    .where("pillarId", "==", input.pillarId)
    .where("status", "==", "pending")
    .limit(1)
    .get();

  if (!pendingSnapshot.empty) {
    const existingExam = pendingSnapshot.docs[0];
    const userRef = adminDb.collection(USERS_COLLECTION).doc(input.userId);
    const repairLockRef = adminDb.collection(SUBMISSION_LOCKS_COLLECTION).doc(lockId(input.userId, input.pillarId));

    await adminDb.runTransaction(async (transaction) => {
      const [userSnapshot, context] = await Promise.all([
        transaction.get(userRef),
        getProgressContext(input.userId, transaction),
      ]);
      if (!userSnapshot.exists) throw new Error("USER_NOT_FOUND");
      const userData = userSnapshot.data() ?? {};
      assertExamEligibility(userData, input);
      const update = buildProgressUpdate(userData, context, {
        ...(input.pillarId === 1 ? { pillar1ExamStatus: "pending" as const } : {}),
        ...(input.pillarId === 2 ? { pillar2ExamStatus: "pending" as const } : {}),
      });

      transaction.set(userRef, update, { merge: true });
      transaction.set(repairLockRef, {
        userId: input.userId,
        pillarId: input.pillarId,
        examId: existingExam.id,
        status: "pending",
        repairedAt: new Date().toISOString(),
      }, { merge: true });
    });

    return { success: true, examId: existingExam.id, reusedExisting: true, quizScore };
  }

  const examRef = adminDb.collection(EXAMS_COLLECTION).doc();
  const userRef = adminDb.collection(USERS_COLLECTION).doc(input.userId);
  const lockRef = adminDb.collection(SUBMISSION_LOCKS_COLLECTION).doc(lockId(input.userId, input.pillarId));
  let reusedExamId: string | null = null;

  await adminDb.runTransaction(async (transaction) => {
    const [userSnapshot, lockSnapshot, context] = await Promise.all([
      transaction.get(userRef),
      transaction.get(lockRef),
      getProgressContext(input.userId, transaction),
    ]);

    if (!userSnapshot.exists) throw new Error("USER_NOT_FOUND");

    if (lockSnapshot.exists && lockSnapshot.data()?.status === "pending") {
      reusedExamId = String(lockSnapshot.data()?.examId || "");
      return;
    }

    const userData = userSnapshot.data() ?? {};
    assertExamEligibility(userData, input);
    const progressUpdate = buildProgressUpdate(userData, context, {
      ...(input.pillarId === 1 ? { pillar1ExamStatus: "pending" as const } : {}),
      ...(input.pillarId === 2 ? { pillar2ExamStatus: "pending" as const } : {}),
    });

    transaction.create(examRef, {
      userId: input.userId,
      userEmail: input.userEmail,
      userName: typeof userData.name === "string" ? userData.name : "Aluno",
      userPhone: input.userPhone || (typeof userData.phone === "string" ? userData.phone : ""),
      pillarId: input.pillarId,
      quizScore,
      quizAttempts: 1,
      writtenAnswer: input.writtenAnswer.trim(),
      status: "pending",
      createdAt: Timestamp.now(),
    });
    transaction.set(lockRef, {
      userId: input.userId,
      pillarId: input.pillarId,
      examId: examRef.id,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    transaction.set(userRef, progressUpdate, { merge: true });
  });

  return {
    success: true,
    examId: reusedExamId || examRef.id,
    reusedExisting: Boolean(reusedExamId),
    quizScore,
  };
}

export async function gradeExamServer(examId: string, decision: ExamDecision, feedback?: string) {
  if (!examId || (decision !== "approved" && decision !== "rejected")) {
    throw new Error("INVALID_EXAM_DECISION");
  }

  const examRef = adminDb.collection(EXAMS_COLLECTION).doc(examId);
  const initialExam = await examRef.get();
  if (!initialExam.exists) throw new Error("EXAM_NOT_FOUND");

  const initialData = initialExam.data() ?? {};
  const userId = String(initialData.userId || "");
  const pillarId = Number(initialData.pillarId);
  if (!userId || !Number.isInteger(pillarId)) throw new Error("INVALID_EXAM_RECORD");

  const context = await getProgressContext(userId);
  const userRef = adminDb.collection(USERS_COLLECTION).doc(userId);
  const lockRef = adminDb.collection(SUBMISSION_LOCKS_COLLECTION).doc(lockId(userId, pillarId));
  let alreadyApplied = false;

  await adminDb.runTransaction(async (transaction) => {
    const [examSnapshot, userSnapshot] = await Promise.all([
      transaction.get(examRef),
      transaction.get(userRef),
    ]);

    if (!examSnapshot.exists) throw new Error("EXAM_NOT_FOUND");
    if (!userSnapshot.exists) throw new Error("USER_NOT_FOUND");

    const examData = examSnapshot.data() ?? {};
    if (examData.status === decision) {
      alreadyApplied = true;
      return;
    }
    if (examData.status !== "pending") throw new Error("EXAM_ALREADY_DECIDED");

    const userData = userSnapshot.data() ?? {};
    const currentApprovedPillar = typeof userData.approvedPillar === "number" ? userData.approvedPillar : 1;
    const approvedPillar = decision === "approved" && pillarId >= 3
      ? Math.max(currentApprovedPillar, Math.min(9, pillarId + 1))
      : currentApprovedPillar;
    const progressUpdate = buildProgressUpdate(userData, context, {
      ...(pillarId === 1 ? { pillar1ExamStatus: decision } : {}),
      ...(pillarId === 2 ? { pillar2ExamStatus: decision } : {}),
      approvedPillar,
    });

    transaction.update(examRef, {
      status: decision,
      adminFeedback: feedback?.trim() || "",
      gradedAt: Timestamp.now(),
    });
    transaction.set(lockRef, {
      userId,
      pillarId,
      examId,
      status: "resolved",
      decision,
      resolvedAt: new Date().toISOString(),
    }, { merge: true });
    transaction.set(userRef, progressUpdate, { merge: true });
  });

  if (decision === "approved" && pillarId === 2) {
    await releaseLiveSessionAfterApproval({ userId, examId, sourcePillarId: 2 });
  }

  return { success: true, alreadyApplied, userId, pillarId };
}

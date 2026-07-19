import { createHash, randomUUID } from "node:crypto";
import { adminDb } from "@/lib/firebase-admin";
import {
  createCreditCardPayment,
  createOrGetCustomer,
  createPixPayment,
  getPayment,
  getPixQrCode,
  isPaymentPaid,
  AsaasApiError,
  type AsaasPayment,
} from "@/lib/asaas";
import type {
  CheckoutPlan,
  CheckoutPaymentMethod,
  CheckoutRequestInput,
  CheckoutStateResponse,
  CreditCardCheckoutMode,
  PaymentAttemptRecord,
  PaymentReconciliationReason,
  PaymentReconciliationStatus,
  PaymentVerificationResponse,
  PendingCheckoutPayment,
} from "@/lib/payments/types";
import { calculateCheckoutInstallmentTotals, MAX_CHECKOUT_INSTALLMENTS } from "@/lib/payments/installments";
import { assertPaymentsEnabled } from "@/lib/payments/config";
import {
  buildStoredProgressSnapshot,
  deriveLegacyApprovedPillar,
  type WriterExamStatus,
  type WriterLiveSessionStatus,
} from "@/lib/auth/premium-access";

const PAYMENT_VALUE = 297.0;
const PAYMENT_DESCRIPTION = "BasedSpeak PRO - Acesso Premium";
const SPECIALTY_TEST_PAYMENT_VALUE = 50.0;
const SPECIALTY_TEST_PAYMENT_DESCRIPTION = "Teste DevTools - Compra de Especialidade";
const CARD_DUE_DAYS = 5;

const USER_COLLECTION = "users";
const PAYMENT_ATTEMPTS_COLLECTION = "payment_attempts";
const CHECKOUT_INTENTS_COLLECTION = "checkout_intents";
const WEBHOOK_EVENTS_COLLECTION = "asaas_webhook_events";
const CHECKOUT_CREATION_LEASE_MS = 60 * 1000;
const WEBHOOK_PROCESSING_LEASE_MS = 5 * 60 * 1000;

type UserPaymentSnapshot = {
  subscriptionStatus?: string;
  purchasedPlan?: string;
  paymentId?: string;
  paymentMethod?: CheckoutPaymentMethod;
  paymentStatus?: string;
  pendingPixPayment?: {
    paymentId?: string;
    qrCode?: string;
    qrCodePayload?: string;
    createdAt?: string;
    expiresAt?: string;
    status?: string;
    plan?: CheckoutPlan;
  } | null;
  pendingCheckoutPayment?: PendingCheckoutPayment | null;
  approvedPillar?: number;
  inviteCodeUsed?: string;
  subscriptionExpiresAt?: string;
  premiumPaymentId?: string;
};

type CheckoutIntentStatus =
  | "creating"
  | "pending"
  | "paid"
  | "cleared"
  | "failed"
  | "reconciliation_required";

type CheckoutIntentClaim = {
  id: string;
  token: string;
  userId: string;
  plan: CheckoutPlan;
};

type TrackedPaymentResolution =
  | {
      kind: "tracked";
      attempt: PaymentAttemptRecord;
      reason: Extract<PaymentReconciliationReason, "tracked_attempt" | "tracked_pending_snapshot">;
    }
  | {
      kind: "unresolved";
      reason: Extract<
        PaymentReconciliationReason,
        "provider_reference_match_without_plan" | "missing_attempt" | "missing_plan" | "user_mismatch"
      >;
    };

function nowIso() {
  return new Date().toISOString();
}

function normalizeProviderDate(value: string | undefined, field: string) {
  const timestamp = value ? Date.parse(value) : Number.NaN;
  if (!Number.isFinite(timestamp)) {
    throw new Error(`ASAAS_${field}_INVALID`);
  }

  return new Date(timestamp).toISOString();
}

function formatDateDaysFromNow(daysFromNow: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split("T")[0];
}

function getPlanPricing(plan: CheckoutPlan) {
  if (plan === "specialty") {
    return {
      value: SPECIALTY_TEST_PAYMENT_VALUE,
      description: SPECIALTY_TEST_PAYMENT_DESCRIPTION,
    };
  }

  return {
    value: PAYMENT_VALUE,
    description: PAYMENT_DESCRIPTION,
  };
}

function assertCheckoutPlanEnabled(plan: CheckoutPlan) {
  if (plan !== "lifetime" && plan !== "specialty") {
    throw new Error("INVALID_CHECKOUT_PLAN");
  }

  if (plan === "specialty" && process.env.ASAAS_ENABLE_SPECIALTY_CHECKOUT !== "true") {
    throw new Error("SPECIALTY_CHECKOUT_DISABLED");
  }
}

function stripUndefined<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(([, entryValue]) => entryValue !== undefined)
  ) as T;
}

function getCheckoutIntentId(userId: string, plan: CheckoutPlan) {
  return createHash("sha256").update(`${userId}:${plan}`).digest("hex");
}

async function claimCheckoutIntent(userId: string, plan: CheckoutPlan): Promise<CheckoutIntentClaim> {
  const id = getCheckoutIntentId(userId, plan);
  const intentRef = adminDb.collection(CHECKOUT_INTENTS_COLLECTION).doc(id);
  const token = randomUUID();
  const startedAt = nowIso();

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(intentRef);
    const existing = snapshot.data() as {
      status?: CheckoutIntentStatus;
      leaseExpiresAt?: string;
      attempts?: number;
    } | undefined;
    const leaseExpiresAt = Date.parse(existing?.leaseExpiresAt || "");
    const activeLease = Number.isFinite(leaseExpiresAt) && leaseExpiresAt > Date.now();

    if (existing?.status === "creating" && activeLease) {
      throw new Error("CHECKOUT_IN_PROGRESS");
    }

    if (existing?.status === "pending" || existing?.status === "paid") {
      throw new Error("CHECKOUT_ALREADY_TRACKED");
    }

    if (existing?.status === "reconciliation_required") {
      throw new Error("CHECKOUT_RECONCILIATION_REQUIRED");
    }

    transaction.set(intentRef, {
      userId,
      plan,
      status: "creating",
      claimToken: token,
      startedAt,
      leaseExpiresAt: new Date(Date.now() + CHECKOUT_CREATION_LEASE_MS).toISOString(),
      attempts: (existing?.attempts ?? 0) + 1,
      paymentId: null,
      lastError: null,
      updatedAt: startedAt,
      ...(!snapshot.exists ? { createdAt: startedAt } : {}),
    }, { merge: true });
  });

  return { id, token, userId, plan };
}

async function finalizeCheckoutIntent(
  claim: CheckoutIntentClaim,
  status: Extract<CheckoutIntentStatus, "failed" | "reconciliation_required">,
  error: unknown,
  paymentId?: string
) {
  const intentRef = adminDb.collection(CHECKOUT_INTENTS_COLLECTION).doc(claim.id);

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(intentRef);
    if (snapshot.data()?.claimToken !== claim.token) {
      return;
    }

    transaction.set(intentRef, {
      status,
      ...(paymentId ? { paymentId } : {}),
      leaseExpiresAt: null,
      lastError: error instanceof Error ? error.message.slice(0, 500) : "Unexpected checkout error",
      updatedAt: nowIso(),
    }, { merge: true });
  });
}

function buildUserPendingPaymentUpdate(attempt: PaymentAttemptRecord) {
  return stripUndefined({
    paymentId: attempt.id,
    paymentMethod: attempt.paymentMethod,
    paymentStatus: attempt.status,
    pendingCheckoutPayment: buildPendingCheckoutPayment(attempt),
    pendingPixPayment:
      attempt.paymentMethod === "PIX"
        ? stripUndefined({
            paymentId: attempt.id,
            qrCode: attempt.qrCode,
            qrCodePayload: attempt.qrCodePayload,
            createdAt: attempt.createdAt,
            expiresAt: attempt.expiresAt,
            status: attempt.status,
            plan: attempt.plan,
          })
        : null,
    updatedAt: nowIso(),
  });
}

async function persistCreatedCheckoutAttempt(attempt: PaymentAttemptRecord, claim: CheckoutIntentClaim) {
  const intentRef = adminDb.collection(CHECKOUT_INTENTS_COLLECTION).doc(claim.id);
  const attemptRef = adminDb.collection(PAYMENT_ATTEMPTS_COLLECTION).doc(attempt.id);
  const userRef = adminDb.collection(USER_COLLECTION).doc(attempt.userId);

  await adminDb.runTransaction(async (transaction) => {
    const intentSnapshot = await transaction.get(intentRef);
    if (intentSnapshot.data()?.claimToken !== claim.token) {
      throw new Error("CHECKOUT_INTENT_CLAIM_LOST");
    }

    transaction.set(attemptRef, stripUndefined(attempt), { merge: true });
    transaction.set(userRef, buildUserPendingPaymentUpdate(attempt), { merge: true });
    transaction.set(intentRef, {
      status: isPaymentPaid(attempt.status) ? "paid" : "pending",
      paymentId: attempt.id,
      paymentMethod: attempt.paymentMethod,
      leaseExpiresAt: null,
      lastError: null,
      updatedAt: nowIso(),
    }, { merge: true });
  });
}

async function markCheckoutIntentForAttempt(
  attempt: PaymentAttemptRecord,
  status: Extract<CheckoutIntentStatus, "paid" | "cleared">
) {
  const intentRef = adminDb.collection(CHECKOUT_INTENTS_COLLECTION).doc(
    getCheckoutIntentId(attempt.userId, attempt.plan)
  );

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(intentRef);
    const existingPaymentId = snapshot.data()?.paymentId;

    if (existingPaymentId && existingPaymentId !== attempt.id) {
      return;
    }

    transaction.set(intentRef, {
      userId: attempt.userId,
      plan: attempt.plan,
      paymentId: attempt.id,
      paymentMethod: attempt.paymentMethod,
      status,
      leaseExpiresAt: null,
      updatedAt: nowIso(),
      ...(!snapshot.exists ? { createdAt: nowIso() } : {}),
    }, { merge: true });
  });
}

function buildPendingCheckoutPayment(attempt: PaymentAttemptRecord): PendingCheckoutPayment {
  return stripUndefined({
    paymentId: attempt.id,
    paymentMethod: attempt.paymentMethod,
    status: attempt.status,
    creditCardMode: attempt.creditCardMode,
    installmentCount: attempt.installmentCount,
    invoiceUrl: attempt.invoiceUrl,
    qrCode: attempt.qrCode,
    qrCodePayload: attempt.qrCodePayload,
    createdAt: attempt.createdAt,
    expiresAt: attempt.expiresAt,
    dueDate: attempt.dueDate,
    plan: attempt.plan,
  });
}

function getAttemptResponse(
  attempt: PaymentAttemptRecord,
  options?: { reusedExisting?: boolean; expired?: boolean }
): CheckoutStateResponse {
  const paid = isPaymentPaid(attempt.status);
  return {
    success: true,
    isPaid: paid,
    alreadyPremium: paid && attempt.plan === "lifetime",
    hasPendingPayment: !(options?.expired),
    reusedExisting: options?.reusedExisting,
    expired: options?.expired,
    paymentId: attempt.id,
    paymentMethod: attempt.paymentMethod,
    creditCardMode: attempt.creditCardMode,
    installmentCount: attempt.installmentCount,
    status: attempt.status,
    invoiceUrl: attempt.invoiceUrl,
    requiresRedirect: attempt.paymentMethod === "CREDIT_CARD" && Boolean(attempt.invoiceUrl),
    qrCode: attempt.qrCode,
    qrCodePayload: attempt.qrCodePayload,
    expiresAt: attempt.expiresAt,
    dueDate: attempt.dueDate,
    plan: attempt.plan,
    reconciliationStatus: options?.expired ? "expired" : paid ? "paid" : "pending",
    reconciliationReason: options?.expired ? "expired" : "tracked_attempt",
  };
}

function isPendingPixStillValid(payment: PendingCheckoutPayment | undefined | null) {
  if (!payment || payment.paymentMethod !== "PIX" || !payment.expiresAt) {
    return false;
  }

  return new Date(payment.expiresAt).getTime() > Date.now();
}

function shouldClearPendingPayment(status: string) {
  return [
    "OVERDUE",
    "REFUNDED",
    "REFUND_REQUESTED",
    "CHARGEBACK_REQUESTED",
    "CHARGEBACK_DISPUTE",
    "AWAITING_CHARGEBACK_REVERSAL",
    "DUNNING_REQUESTED",
    "DUNNING_RECEIVED",
  ].includes(status);
}

function shouldRevokePaymentEntitlement(status: string) {
  return [
    "REFUNDED",
    "REFUND_REQUESTED",
    "CHARGEBACK_REQUESTED",
    "CHARGEBACK_DISPUTE",
    "AWAITING_CHARGEBACK_REVERSAL",
  ].includes(status);
}

function sanitizeWebhookEventId(rawEventId: string) {
  return rawEventId.trim().replaceAll("/", "_").slice(0, 500);
}

type WebhookClaim =
  | { kind: "claimed"; token: string }
  | { kind: "completed" }
  | { kind: "processing" };

async function claimWebhookEvent(params: {
  eventId: string;
  providerEventId: string;
  event: string;
  payment: AsaasPayment;
  dateCreated?: string;
}): Promise<WebhookClaim> {
  const webhookRef = adminDb.collection(WEBHOOK_EVENTS_COLLECTION).doc(params.eventId);
  const claimToken = randomUUID();
  const claimedAt = nowIso();
  let claim: WebhookClaim = { kind: "claimed", token: claimToken };

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(webhookRef);
    const existing = snapshot.data() as {
      processingStatus?: string;
      processingStartedAt?: string;
      attempts?: number;
    } | undefined;

    if (existing?.processingStatus === "completed") {
      claim = { kind: "completed" };
      return;
    }

    if (existing?.processingStatus === "processing") {
      const startedAt = Date.parse(existing.processingStartedAt || "");
      const leaseIsActive = Number.isFinite(startedAt) && Date.now() - startedAt < WEBHOOK_PROCESSING_LEASE_MS;
      if (leaseIsActive) {
        claim = { kind: "processing" };
        return;
      }
    }

    const minimalPaymentPayload = stripUndefined({
      id: params.payment.id,
      customer: params.payment.customer,
      billingType: params.payment.billingType,
      status: params.payment.status,
      value: params.payment.value,
      netValue: params.payment.netValue,
      dueDate: params.payment.dueDate,
      externalReference: params.payment.externalReference,
      invoiceNumber: params.payment.invoiceNumber,
    });

    transaction.set(webhookRef, {
      event: params.event,
      paymentId: params.payment.id,
      paymentStatus: params.payment.status,
      payload: stripUndefined({
        id: params.providerEventId,
        event: params.event,
        dateCreated: params.dateCreated,
        payment: minimalPaymentPayload,
      }),
      processingStatus: "processing",
      processingToken: claimToken,
      processingStartedAt: claimedAt,
      ...(!existing ? { receivedAt: claimedAt } : {}),
      updatedAt: claimedAt,
      attempts: (existing?.attempts ?? 0) + 1,
      lastError: null,
    }, { merge: true });
  });

  return claim;
}

async function finalizeWebhookEvent(params: {
  eventId: string;
  claimToken: string;
  outcome: "completed" | "failed";
  details?: Record<string, unknown>;
}) {
  const webhookRef = adminDb.collection(WEBHOOK_EVENTS_COLLECTION).doc(params.eventId);

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(webhookRef);
    const currentToken = snapshot.data()?.processingToken;

    if (currentToken !== params.claimToken) {
      if (params.outcome === "completed") {
        throw new Error("WEBHOOK_EVENT_CLAIM_LOST");
      }
      return;
    }

    const finishedAt = nowIso();
    transaction.set(webhookRef, {
      ...(params.details ?? {}),
      processingStatus: params.outcome,
      updatedAt: finishedAt,
      ...(params.outcome === "completed"
        ? { completedAt: finishedAt, lastError: null }
        : { failedAt: finishedAt }),
    }, { merge: true });
  });
}

function buildUnresolvedVerificationResponse(params: {
  paymentId: string;
  status: string;
  reason: Extract<
    PaymentReconciliationReason,
    "provider_reference_match_without_plan" | "missing_attempt" | "missing_plan" | "user_mismatch"
  >;
}): PaymentVerificationResponse {
  return {
    isPaid: false,
    status: params.status,
    paymentId: params.paymentId,
    reconciliationStatus: "unresolved",
    reconciliationReason: params.reason,
    needsManualReconciliation: true,
  };
}

async function getUserDoc(userId: string) {
  return adminDb.collection(USER_COLLECTION).doc(userId).get();
}

async function getLatestExamStatus(userId: string, pillarId: number): Promise<WriterExamStatus> {
  const snapshot = await adminDb.collection("pillar_exams")
    .where("userId", "==", userId)
    .where("pillarId", "==", pillarId)
    .get();

  if (snapshot.empty) {
    return "not_started";
  }

  const exams = snapshot.docs
    .map((item) => item.data() as { status?: WriterExamStatus; createdAt?: { toMillis?: () => number } | null })
    .sort((left, right) => {
      const leftTime = left.createdAt?.toMillis?.() ?? 0;
      const rightTime = right.createdAt?.toMillis?.() ?? 0;
      return rightTime - leftTime;
    });

  return exams[0]?.status ?? "not_started";
}

async function recomputeStoredProgressSnapshot(
  userId: string,
  options?: {
    subscriptionStatusOverride?: string;
    currentApprovedPillarOverride?: number;
    completedPillarModulesOverride?: string[];
  }
) {
  const userSnapshot = await getUserDoc(userId);
  if (!userSnapshot.exists) {
    return;
  }

  const userData = userSnapshot.data() as UserPaymentSnapshot & {
    completedPillarModules?: string[];
  };

  const [pillar1ExamStatus, pillar2ExamStatus, liveSessionSnapshot] = await Promise.all([
    getLatestExamStatus(userId, 1),
    getLatestExamStatus(userId, 2),
    adminDb.collection("live_sessions").doc(`${userId}_p2`).get(),
  ]);

  const snapshot = buildStoredProgressSnapshot({
    subscriptionStatus: options?.subscriptionStatusOverride ?? userData.subscriptionStatus,
    completedPillarModules: options?.completedPillarModulesOverride ?? userData.completedPillarModules,
    pillar1ExamStatus,
    pillar2ExamStatus,
    pillar2LiveSessionStatus: (
      liveSessionSnapshot.exists
        ? (liveSessionSnapshot.data()?.status as WriterLiveSessionStatus | undefined)
        : "not_created"
    ),
    currentApprovedPillar:
      options?.currentApprovedPillarOverride ??
      (typeof userData.approvedPillar === "number" ? userData.approvedPillar : 1),
  });

  await adminDb.collection(USER_COLLECTION).doc(userId).set(
    {
      progressSnapshot: snapshot,
      approvedPillar: deriveLegacyApprovedPillar(snapshot),
      updatedAt: nowIso(),
    },
    { merge: true }
  );
}

async function getPaymentAttempt(paymentId: string) {
  return adminDb.collection(PAYMENT_ATTEMPTS_COLLECTION).doc(paymentId).get();
}

async function assertPaymentBelongsToUser(paymentId: string, userId: string) {
  const attemptDoc = await getPaymentAttempt(paymentId);
  if (attemptDoc.exists) {
    const attempt = attemptDoc.data() as PaymentAttemptRecord;
    if (attempt.userId !== userId) {
      throw new Error("FORBIDDEN_PAYMENT_ACCESS");
    }
    return attempt;
  }

  const payment = await getPayment(paymentId);
  if ((payment.externalReference || "") !== userId) {
    throw new Error("FORBIDDEN_PAYMENT_ACCESS");
  }

  return null;
}

async function upsertPaymentAttempt(attempt: PaymentAttemptRecord) {
  await adminDb.collection(PAYMENT_ATTEMPTS_COLLECTION).doc(attempt.id).set(stripUndefined(attempt), { merge: true });
}

async function syncUserPendingState(userId: string, attempt: PaymentAttemptRecord | null) {
  const userRef = adminDb.collection(USER_COLLECTION).doc(userId);

  if (!attempt) {
    await userRef.set(
      {
        pendingCheckoutPayment: null,
        pendingPixPayment: null,
        paymentStatus: null,
        paymentMethod: null,
        updatedAt: nowIso(),
      },
      { merge: true }
    );
    return;
  }

  await userRef.set(buildUserPendingPaymentUpdate(attempt), { merge: true });
}

async function grantLifetimeAccess(userId: string, payment: AsaasPayment) {
  const userRef = adminDb.collection(USER_COLLECTION).doc(userId);
  const userDoc = await userRef.get();
  const currentApprovedPillar = userDoc.exists ? Number(userDoc.data()?.approvedPillar || 1) : 1;
  const activatedAt = nowIso();

  await userRef.set(
    {
      subscriptionStatus: "premium",
      purchasedPlan: "lifetime",
      premiumActivatedAt: activatedAt,
      paymentId: payment.id,
      premiumPaymentId: payment.id,
      paymentMethod: payment.billingType as CheckoutPaymentMethod,
      paymentStatus: payment.status,
      pendingCheckoutPayment: null,
      pendingPixPayment: null,
      approvedPillar: Math.max(currentApprovedPillar, 2),
      updatedAt: activatedAt,
    },
    { merge: true }
  );

  await recomputeStoredProgressSnapshot(userId, {
    subscriptionStatusOverride: "premium",
    currentApprovedPillarOverride: Math.max(currentApprovedPillar, 2),
  });
}

async function findAlternativePaidLifetimeAttempt(userId: string, excludedPaymentId: string) {
  const attempts = await adminDb.collection(PAYMENT_ATTEMPTS_COLLECTION)
    .where("userId", "==", userId)
    .get();

  return attempts.docs
    .map((document) => document.data() as PaymentAttemptRecord)
    .filter(
      (attempt) =>
        attempt.id !== excludedPaymentId &&
        attempt.plan === "lifetime" &&
        isPaymentPaid(attempt.status)
    )
    .sort((left, right) => Date.parse(right.paidAt || right.updatedAt) - Date.parse(left.paidAt || left.updatedAt))[0];
}

function hasActiveInviteEntitlement(userData: UserPaymentSnapshot) {
  if (!userData.inviteCodeUsed) {
    return false;
  }

  if (!userData.subscriptionExpiresAt) {
    return true;
  }

  const expiresAt = Date.parse(userData.subscriptionExpiresAt);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

async function revokePaymentEntitlement(
  userId: string,
  attempt: PaymentAttemptRecord,
  payment: AsaasPayment
) {
  if (attempt.plan !== "lifetime" || !shouldRevokePaymentEntitlement(payment.status)) {
    return;
  }

  const [userSnapshot, alternativeAttempt] = await Promise.all([
    getUserDoc(userId),
    findAlternativePaidLifetimeAttempt(userId, payment.id),
  ]);

  if (!userSnapshot.exists) {
    return;
  }

  const userData = userSnapshot.data() as UserPaymentSnapshot;
  const entitlementPaymentId =
    userData.premiumPaymentId ||
    (userData.purchasedPlan === "lifetime" ? userData.paymentId : undefined);

  // A reversal from an older payment must not overwrite a newer entitlement.
  if (entitlementPaymentId && entitlementPaymentId !== payment.id) {
    await userSnapshot.ref.set({
      lastReversedPaymentId: payment.id,
      lastReversedPaymentStatus: payment.status,
      updatedAt: nowIso(),
    }, { merge: true });
    return;
  }

  const preserveInvite = hasActiveInviteEntitlement(userData);
  const preserveOtherOrigin =
    userData.subscriptionStatus === "premium" &&
    userData.purchasedPlan !== "lifetime" &&
    !entitlementPaymentId;
  const preservePremium = Boolean(alternativeAttempt || preserveInvite || preserveOtherOrigin);
  const updatedAt = nowIso();

  await userSnapshot.ref.set({
    subscriptionStatus: preservePremium ? "premium" : "cancelled",
    purchasedPlan: alternativeAttempt ? "lifetime" : null,
    premiumPaymentId: alternativeAttempt?.id ?? null,
    paymentId: alternativeAttempt?.id ?? null,
    paymentMethod: alternativeAttempt?.paymentMethod ?? null,
    paymentStatus: alternativeAttempt?.status ?? payment.status,
    pendingCheckoutPayment: null,
    pendingPixPayment: null,
    lastReversedPaymentId: payment.id,
    lastReversedPaymentStatus: payment.status,
    updatedAt,
  }, { merge: true });

  await recomputeStoredProgressSnapshot(userId, {
    subscriptionStatusOverride: preservePremium ? "premium" : "cancelled",
  });
}

async function registerSpecialtyPurchase(userId: string, payment: AsaasPayment) {
  const userRef = adminDb.collection(USER_COLLECTION).doc(userId);

  await userRef.set(
    {
      lastSpecialtyPurchasePaymentId: payment.id,
      lastSpecialtyPurchaseAt: nowIso(),
      paymentId: payment.id,
      paymentMethod: payment.billingType as CheckoutPaymentMethod,
      paymentStatus: payment.status,
      pendingCheckoutPayment: null,
      pendingPixPayment: null,
      updatedAt: nowIso(),
    },
    { merge: true }
  );
}

function normalizeAttemptFromLegacyUser(userId: string, userData: UserPaymentSnapshot): PaymentAttemptRecord | null {
  const legacyPix = userData.pendingPixPayment;
  if (!legacyPix?.paymentId || !legacyPix.plan) {
    return null;
  }

  return {
    id: legacyPix.paymentId,
    userId,
    asaasCustomerId: "",
    paymentMethod: "PIX",
    plan: legacyPix.plan,
    value: PAYMENT_VALUE,
    description: PAYMENT_DESCRIPTION,
    status: legacyPix.status || "PENDING",
    dueDate: formatDateDaysFromNow(1),
    qrCode: legacyPix.qrCode,
    qrCodePayload: legacyPix.qrCodePayload,
    expiresAt: legacyPix.expiresAt,
    externalReference: userId,
    billingType: "PIX",
    createdAt: legacyPix.createdAt || nowIso(),
    updatedAt: nowIso(),
  };
}

function buildAttemptFromTrackedPendingSnapshot(
  userId: string,
  payment: AsaasPayment,
  userData: UserPaymentSnapshot
): PaymentAttemptRecord | null {
  const pending = userData.pendingCheckoutPayment;
  if (pending?.paymentId === payment.id && pending.plan) {
    return stripUndefined({
      id: payment.id,
      userId,
      asaasCustomerId: payment.customer,
      paymentMethod: pending.paymentMethod,
      creditCardMode: pending.creditCardMode,
      installmentCount: pending.installmentCount,
      plan: pending.plan,
      value: payment.value,
      description: getPlanPricing(pending.plan).description,
      status: payment.status,
      dueDate: payment.dueDate,
      invoiceUrl: payment.invoiceUrl,
      qrCode: pending.qrCode,
      qrCodePayload: pending.qrCodePayload,
      expiresAt: pending.expiresAt,
      externalReference: payment.externalReference || userId,
      billingType: pending.paymentMethod,
      createdAt: pending.createdAt,
      updatedAt: nowIso(),
      paidAt: isPaymentPaid(payment.status) ? nowIso() : undefined,
    });
  }

  const legacyPix = userData.pendingPixPayment;
  if (legacyPix?.paymentId === payment.id && legacyPix.plan) {
    return stripUndefined({
      id: payment.id,
      userId,
      asaasCustomerId: payment.customer,
      paymentMethod: "PIX" as const,
      plan: legacyPix.plan,
      value: payment.value,
      description: getPlanPricing(legacyPix.plan).description,
      status: payment.status,
      dueDate: payment.dueDate,
      qrCode: legacyPix.qrCode,
      qrCodePayload: legacyPix.qrCodePayload,
      expiresAt: legacyPix.expiresAt,
      externalReference: payment.externalReference || userId,
      billingType: "PIX" as const,
      createdAt: legacyPix.createdAt || nowIso(),
      updatedAt: nowIso(),
      paidAt: isPaymentPaid(payment.status) ? nowIso() : undefined,
    });
  }

  return null;
}

function buildPaymentAttemptFromAsaas(params: {
  payment: AsaasPayment;
  userId: string;
  asaasCustomerId: string;
  paymentMethod: CheckoutPaymentMethod;
  creditCardMode?: CreditCardCheckoutMode;
  qrCode?: string;
  qrCodePayload?: string;
  expiresAt?: string;
  value: number;
  description: string;
  plan: CheckoutPlan;
  installmentCount?: number;
  localCustomerId?: string;
  lastWebhookEvent?: string;
}): PaymentAttemptRecord {
  return {
    id: params.payment.id,
    userId: params.userId,
    localCustomerId: params.localCustomerId,
    asaasCustomerId: params.asaasCustomerId,
    paymentMethod: params.paymentMethod,
    creditCardMode: params.creditCardMode,
    installmentCount: params.installmentCount,
    plan: params.plan,
    value: params.value,
    description: params.description,
    status: params.payment.status,
    dueDate: params.payment.dueDate,
    invoiceUrl: params.payment.invoiceUrl,
    qrCode: params.qrCode,
    qrCodePayload: params.qrCodePayload,
    expiresAt: params.expiresAt,
    externalReference: params.payment.externalReference || params.userId,
    billingType: params.paymentMethod,
    lastWebhookEvent: params.lastWebhookEvent,
    paidAt: isPaymentPaid(params.payment.status) ? nowIso() : undefined,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

async function syncAttemptFromAsaas(attempt: PaymentAttemptRecord, payment: AsaasPayment) {
  const updatedAttempt: PaymentAttemptRecord = {
    ...attempt,
    status: payment.status,
    dueDate: payment.dueDate,
    invoiceUrl: payment.invoiceUrl || attempt.invoiceUrl,
    updatedAt: nowIso(),
    paidAt: isPaymentPaid(payment.status) ? attempt.paidAt || nowIso() : attempt.paidAt,
  };

  await upsertPaymentAttempt(updatedAttempt);
  return updatedAttempt;
}

async function resolveTrackedPaymentAttempt(
  userId: string,
  payment: AsaasPayment,
  options?: { existingAttempt?: PaymentAttemptRecord | null; userData?: UserPaymentSnapshot }
): Promise<TrackedPaymentResolution> {
  const existingAttempt = options?.existingAttempt;
  if (existingAttempt) {
    if (existingAttempt.userId !== userId) {
      return { kind: "unresolved", reason: "user_mismatch" };
    }

    return {
      kind: "tracked",
      attempt: existingAttempt,
      reason: "tracked_attempt",
    };
  }

  const userDoc = options?.userData ? null : await getUserDoc(userId);
  const userData = options?.userData ?? ((userDoc?.data() as UserPaymentSnapshot | undefined) ?? undefined);
  if (userData) {
    const attemptFromPending = buildAttemptFromTrackedPendingSnapshot(userId, payment, userData);
    if (attemptFromPending) {
      return {
        kind: "tracked",
        attempt: attemptFromPending,
        reason: "tracked_pending_snapshot",
      };
    }
  }

  if ((payment.externalReference || "") === userId) {
    return { kind: "unresolved", reason: "provider_reference_match_without_plan" };
  }

  return { kind: "unresolved", reason: "missing_attempt" };
}

async function applyPaidAttempt(userId: string, attempt: PaymentAttemptRecord, payment: AsaasPayment) {
  if (!isPaymentPaid(payment.status)) {
    throw new Error("INVALID_PAYMENT_RECONCILIATION_STATUS");
  }

  if (attempt.userId !== userId) {
    throw new Error("FORBIDDEN_PAYMENT_ACCESS");
  }

  if (!attempt.plan) {
    throw new Error("MISSING_PAYMENT_PLAN");
  }

  if (attempt.plan === "lifetime") {
    await grantLifetimeAccess(userId, payment);
  } else {
    await registerSpecialtyPurchase(userId, payment);
  }
  await syncUserPendingState(userId, null);
  await markCheckoutIntentForAttempt(attempt, "paid");
}

async function resolveActiveAttempt(userId: string): Promise<PaymentAttemptRecord | null> {
  const userDoc = await getUserDoc(userId);
  const userData = userDoc.data() as UserPaymentSnapshot | undefined;

  const activePaymentId = userData?.pendingCheckoutPayment?.paymentId || userData?.pendingPixPayment?.paymentId;

  if (activePaymentId) {
    const attemptDoc = await getPaymentAttempt(activePaymentId);
    if (attemptDoc.exists) {
      return attemptDoc.data() as PaymentAttemptRecord;
    }
  }

  const legacyAttempt = userData ? normalizeAttemptFromLegacyUser(userId, userData) : null;
  if (legacyAttempt) {
    await upsertPaymentAttempt(legacyAttempt);
    return legacyAttempt;
  }

  return null;
}

export async function getCheckoutState(userId: string, plan: CheckoutPlan = "lifetime"): Promise<CheckoutStateResponse> {
  assertPaymentsEnabled();
  assertCheckoutPlanEnabled(plan);
  const userDoc = await getUserDoc(userId);
  const userData = userDoc.data() as UserPaymentSnapshot | undefined;

  if (
    plan === "lifetime" &&
    (userData?.subscriptionStatus === "premium" || userData?.purchasedPlan === "lifetime")
  ) {
    return {
      success: true,
      alreadyPremium: true,
      message: "Este usuario ja possui acesso premium.",
      reconciliationStatus: "already_premium",
      reconciliationReason: "already_premium",
    };
  }

  const activeAttempt = await resolveActiveAttempt(userId);
  if (!activeAttempt) {
    return {
      success: true,
      hasPendingPayment: false,
    };
  }

  const payment = await getPayment(activeAttempt.id);
  const syncedAttempt = await syncAttemptFromAsaas(activeAttempt, payment);

  if (isPaymentPaid(payment.status)) {
    await applyPaidAttempt(userId, syncedAttempt, payment);

    return {
      success: true,
      alreadyPremium: syncedAttempt.plan === "lifetime",
      paymentId: payment.id,
      paymentMethod: syncedAttempt.paymentMethod,
      plan: syncedAttempt.plan,
      status: payment.status,
      message: "Pagamento ja confirmado para este usuario.",
      reconciliationStatus: "paid",
      reconciliationReason: "tracked_attempt",
    };
  }

  const pendingState = buildPendingCheckoutPayment(syncedAttempt);

  if (syncedAttempt.paymentMethod === "PIX" && !isPendingPixStillValid(pendingState)) {
    await syncUserPendingState(userId, null);
    await markCheckoutIntentForAttempt(syncedAttempt, "cleared");

    return getAttemptResponse(syncedAttempt, { expired: true });
  }

  if (shouldClearPendingPayment(payment.status)) {
    await revokePaymentEntitlement(userId, syncedAttempt, payment);
    await syncUserPendingState(userId, null);
    await markCheckoutIntentForAttempt(syncedAttempt, "cleared");
    return getAttemptResponse(syncedAttempt, { expired: true });
  }

  await syncUserPendingState(userId, syncedAttempt);
  return getAttemptResponse(syncedAttempt, { reusedExisting: true });
}

export async function createCheckout(input: CheckoutRequestInput): Promise<CheckoutStateResponse> {
  assertPaymentsEnabled();
  const plan = input.plan ?? "lifetime";
  assertCheckoutPlanEnabled(plan);
  const paymentMethod = input.paymentMethod ?? "PIX";
  const creditCardMode: CreditCardCheckoutMode =
    paymentMethod === "CREDIT_CARD" ? input.creditCardMode ?? "INVOICE_URL" : "INVOICE_URL";
  if (creditCardMode !== "INVOICE_URL") {
    throw new Error("DIRECT_CARD_NOT_ALLOWED");
  }
  const installmentCount =
    paymentMethod === "CREDIT_CARD" && Number.isFinite(input.installmentCount)
      ? Math.min(MAX_CHECKOUT_INSTALLMENTS, Math.max(1, Math.trunc(input.installmentCount as number)))
      : 1;
  const { value: baseValue, description } = getPlanPricing(plan);
  const installmentTotals = calculateCheckoutInstallmentTotals(baseValue, installmentCount);
  const value = paymentMethod === "CREDIT_CARD" ? installmentTotals.totalAmount : baseValue;
  const existingState = await getCheckoutState(input.userId, plan);
  if (existingState.alreadyPremium || existingState.hasPendingPayment) {
    return existingState;
  }

  let claim: CheckoutIntentClaim;
  try {
    claim = await claimCheckoutIntent(input.userId, plan);
  } catch (error) {
    if (error instanceof Error && error.message === "CHECKOUT_ALREADY_TRACKED") {
      const trackedState = await getCheckoutState(input.userId, plan);
      if (trackedState.alreadyPremium || trackedState.hasPendingPayment) {
        return trackedState;
      }
    }
    throw error;
  }

  let paymentCreationStarted = false;
  let paymentCreated = false;
  let createdPaymentId: string | undefined;

  try {
    const customer = await createOrGetCustomer(input.name, input.email, input.cpfCnpj);

    if (paymentMethod === "PIX") {
      paymentCreationStarted = true;
      const payment = await createPixPayment(customer.id, value, description, input.userId);
      paymentCreated = true;
      createdPaymentId = payment.id;
      const qrCode = await getPixQrCode(payment.id);
      const expiresAt = normalizeProviderDate(qrCode.expirationDate, "PIX_EXPIRATION_DATE");
      const attempt = buildPaymentAttemptFromAsaas({
        payment,
        userId: input.userId,
        asaasCustomerId: customer.id,
        paymentMethod,
        qrCode: qrCode.encodedImage,
        qrCodePayload: qrCode.payload,
        expiresAt,
        value,
        description,
        plan,
        installmentCount: 1,
        localCustomerId: input.localCustomerId,
      });

      await persistCreatedCheckoutAttempt(attempt, claim);
      return getAttemptResponse(attempt);
    }

    const dueDate = formatDateDaysFromNow(CARD_DUE_DAYS);
    paymentCreationStarted = true;
    const payment = await createCreditCardPayment({
      customer: customer.id,
      value,
      description,
      dueDate,
      externalReference: input.userId,
      installmentCount,
    });
    paymentCreated = true;
    createdPaymentId = payment.id;

    const attempt = buildPaymentAttemptFromAsaas({
      payment,
      userId: input.userId,
      asaasCustomerId: customer.id,
      paymentMethod,
      creditCardMode,
      value,
      description,
      plan,
      installmentCount,
      localCustomerId: input.localCustomerId,
    });

    await persistCreatedCheckoutAttempt(attempt, claim);
    if (isPaymentPaid(payment.status)) {
      await applyPaidAttempt(input.userId, attempt, payment);
    }

    return getAttemptResponse(attempt);
  } catch (error) {
    const reconciliationRequired =
      paymentCreated ||
      (paymentCreationStarted &&
        !(error instanceof AsaasApiError && error.status >= 400 && error.status < 500));
    const intentStatus = reconciliationRequired ? "reconciliation_required" : "failed";

    await finalizeCheckoutIntent(claim, intentStatus, error, createdPaymentId);
    if (reconciliationRequired) {
      console.error("[payments] checkout_reconciliation_required", {
        intentId: claim.id,
        plan,
        paymentMethod,
        error: error instanceof Error ? error.message : "Unexpected checkout error",
      });
    }
    throw error;
  }
}

export async function verifyPaymentStatus(userId: string, paymentId: string): Promise<PaymentVerificationResponse> {
  assertPaymentsEnabled();
  const existingAttempt = await assertPaymentBelongsToUser(paymentId, userId);
  const payment = await getPayment(paymentId);
  const resolution = await resolveTrackedPaymentAttempt(userId, payment, { existingAttempt });

  if (resolution.kind === "unresolved") {
    console.error("[payments] verification_reconciliation_unresolved", {
      paymentId: payment.id,
      reason: resolution.reason,
      status: payment.status,
    });
    return buildUnresolvedVerificationResponse({
      paymentId: payment.id,
      status: payment.status,
      reason: resolution.reason,
    });
  }

  const syncedAttempt = await syncAttemptFromAsaas(resolution.attempt, payment);

  if (isPaymentPaid(payment.status)) {
    await applyPaidAttempt(userId, syncedAttempt, payment);
    return {
      isPaid: true,
      status: payment.status,
      paymentId: payment.id,
      plan: syncedAttempt.plan,
      reconciliationStatus: "paid",
      reconciliationReason: resolution.reason,
    };
  }

  if (shouldClearPendingPayment(payment.status)) {
    await revokePaymentEntitlement(userId, syncedAttempt, payment);
    await syncUserPendingState(userId, null);
    await markCheckoutIntentForAttempt(syncedAttempt, "cleared");
    return {
      isPaid: false,
      status: payment.status,
      paymentId: payment.id,
      plan: syncedAttempt.plan,
      reconciliationStatus: "cleared",
      reconciliationReason: "cleared",
    };
  } else {
    await syncUserPendingState(userId, syncedAttempt);
    return {
      isPaid: false,
      status: payment.status,
      paymentId: payment.id,
      plan: syncedAttempt.plan,
      reconciliationStatus: "pending",
      reconciliationReason: "pending",
    };
  }
}

export async function handleAsaasWebhook(payload: {
  id?: string;
  event?: string;
  dateCreated?: string;
  payment?: AsaasPayment;
}) {
  const { event, payment } = payload;
  const rawEventId = typeof payload.id === "string" ? payload.id.trim() : "";

  if (!rawEventId || !event || !payment?.id) {
    throw new Error("INVALID_ASAAS_WEBHOOK_PAYLOAD");
  }

  const webhookEventId = sanitizeWebhookEventId(rawEventId);
  const claim = await claimWebhookEvent({
    eventId: webhookEventId,
    providerEventId: rawEventId,
    event,
    payment,
    dateCreated: payload.dateCreated,
  });

  if (claim.kind === "completed") {
    return { success: true, duplicated: true, ignoredEvent: event };
  }

  if (claim.kind === "processing") {
    throw new Error("WEBHOOK_EVENT_IN_PROGRESS");
  }

  try {
    const attemptDoc = await getPaymentAttempt(payment.id);
    let attempt: PaymentAttemptRecord | null = attemptDoc.exists
      ? (attemptDoc.data() as PaymentAttemptRecord)
      : null;

    const userId = payment.externalReference || attempt?.userId;
    if (!userId) {
      throw new Error("Nao foi possivel determinar o usuario local para o pagamento recebido.");
    }

    const userDoc = await getUserDoc(userId);
    const userData = userDoc.data() as UserPaymentSnapshot | undefined;
    const resolution = await resolveTrackedPaymentAttempt(userId, payment, {
      existingAttempt: attempt,
      userData,
    });

    if (resolution.kind === "unresolved") {
      console.error("[payments] webhook_reconciliation_unresolved", {
        eventId: rawEventId,
        paymentId: payment.id,
        event,
        reason: resolution.reason,
      });
      await finalizeWebhookEvent({
        eventId: webhookEventId,
        claimToken: claim.token,
        outcome: "completed",
        details: {
          reconciliationStatus: "unresolved",
          reconciliationReason: resolution.reason,
          userId,
          needsManualReconciliation: true,
        },
      });

      return {
        success: true,
        paymentId: payment.id,
        ignoredEvent: event,
        reconciliationStatus: "unresolved",
        reconciliationReason: resolution.reason,
        needsManualReconciliation: true,
      };
    }

    attempt = resolution.attempt;

    if (!attemptDoc.exists) {
      attempt = {
        ...attempt,
        lastWebhookEvent: event,
      };
    } else {
      attempt = {
        ...attempt,
        status: payment.status,
        dueDate: payment.dueDate,
        invoiceUrl: payment.invoiceUrl || attempt.invoiceUrl,
        lastWebhookEvent: event,
        updatedAt: nowIso(),
        paidAt: isPaymentPaid(payment.status) ? attempt.paidAt || nowIso() : attempt.paidAt,
      };
    }

    await upsertPaymentAttempt(attempt);

    if (isPaymentPaid(payment.status)) {
      await applyPaidAttempt(userId, attempt, payment);
      await finalizeWebhookEvent({
        eventId: webhookEventId,
        claimToken: claim.token,
        outcome: "completed",
        details: {
          reconciliationStatus: "paid",
          reconciliationReason: resolution.reason,
          userId,
          needsManualReconciliation: false,
        },
      });
      return {
        success: true,
        grantedAccess: true,
        paymentId: payment.id,
        reconciliationStatus: "paid" as PaymentReconciliationStatus,
        reconciliationReason: resolution.reason,
      };
    }

    const shouldClear = shouldClearPendingPayment(payment.status);
    if (shouldClear) {
      await revokePaymentEntitlement(userId, attempt, payment);
      await syncUserPendingState(userId, null);
      await markCheckoutIntentForAttempt(attempt, "cleared");
    } else {
      await syncUserPendingState(userId, attempt);
    }

    const reconciliationStatus = shouldClear ? "cleared" : "pending";
    await finalizeWebhookEvent({
      eventId: webhookEventId,
      claimToken: claim.token,
      outcome: "completed",
      details: {
        reconciliationStatus,
        reconciliationReason: reconciliationStatus,
        userId,
        needsManualReconciliation: false,
      },
    });

    return {
      success: true,
      ignoredEvent: event,
      paymentId: payment.id,
      reconciliationStatus: reconciliationStatus as PaymentReconciliationStatus,
      reconciliationReason: reconciliationStatus as PaymentReconciliationReason,
    };
  } catch (error) {
    console.error("[payments] webhook_processing_failed", {
      eventId: rawEventId,
      paymentId: payment.id,
      event,
      error: error instanceof Error ? error.message : "Unexpected webhook error",
    });
    await finalizeWebhookEvent({
      eventId: webhookEventId,
      claimToken: claim.token,
      outcome: "failed",
      details: {
        lastError: error instanceof Error ? error.message.slice(0, 500) : "Unexpected webhook error",
      },
    });
    throw error;
  }
}

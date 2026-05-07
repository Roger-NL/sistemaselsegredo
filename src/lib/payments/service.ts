import { adminDb } from "@/lib/firebase-admin";
import {
  createCreditCardPayment,
  createOrGetCustomer,
  createPixPayment,
  getPayment,
  getPixQrCode,
  isPaymentPaid,
  tokenizeCreditCard,
  type AsaasPayment,
} from "@/lib/asaas";
import type {
  CheckoutCardHolderInfoInput,
  CheckoutPlan,
  CheckoutPaymentMethod,
  CheckoutRequestInput,
  CheckoutStateResponse,
  CreditCardCheckoutMode,
  PaymentAttemptRecord,
  PendingCheckoutPayment,
} from "@/lib/payments/types";

const PAYMENT_VALUE = 297.0;
const PAYMENT_DESCRIPTION = "Acesso Vitalicio - BasedSpeak PRO (9 Pilares)";
const SPECIALTY_TEST_PAYMENT_VALUE = 50.0;
const SPECIALTY_TEST_PAYMENT_DESCRIPTION = "Teste DevTools - Compra de Especialidade";
const PIX_VALIDITY_MS = 5 * 60 * 1000;
const CARD_DUE_DAYS = 5;
const DIRECT_CARD_ENABLED = process.env.ASAAS_ENABLE_DIRECT_CREDIT_CARD === "true";

const USER_COLLECTION = "users";
const PAYMENT_ATTEMPTS_COLLECTION = "payment_attempts";
const WEBHOOK_EVENTS_COLLECTION = "asaas_webhook_events";

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
};

function nowIso() {
  return new Date().toISOString();
}

function formatDateDaysFromNow(daysFromNow: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split("T")[0];
}

function stripUndefined<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(([, entryValue]) => entryValue !== undefined)
  ) as T;
}

function buildPendingCheckoutPayment(attempt: PaymentAttemptRecord): PendingCheckoutPayment {
  return stripUndefined({
    paymentId: attempt.id,
    paymentMethod: attempt.paymentMethod,
    status: attempt.status,
    creditCardMode: attempt.creditCardMode,
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
  return {
    success: true,
    hasPendingPayment: !(options?.expired),
    reusedExisting: options?.reusedExisting,
    expired: options?.expired,
    paymentId: attempt.id,
    paymentMethod: attempt.paymentMethod,
    creditCardMode: attempt.creditCardMode,
    status: attempt.status,
    invoiceUrl: attempt.invoiceUrl,
    requiresRedirect: attempt.paymentMethod === "CREDIT_CARD" && Boolean(attempt.invoiceUrl),
    qrCode: attempt.qrCode,
    qrCodePayload: attempt.qrCodePayload,
    expiresAt: attempt.expiresAt,
    dueDate: attempt.dueDate,
    plan: attempt.plan,
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

function sanitizeWebhookEventId(payload: { id?: string; event?: string; payment?: { id?: string; status?: string } }) {
  if (typeof payload.id === "string" && payload.id.length > 0) {
    return payload.id;
  }

  return [
    payload.event || "unknown-event",
    payload.payment?.id || "unknown-payment",
    payload.payment?.status || "unknown-status",
  ].join(":");
}

async function getUserDoc(userId: string) {
  return adminDb.collection(USER_COLLECTION).doc(userId).get();
}

async function getPaymentAttempt(paymentId: string) {
  return adminDb.collection(PAYMENT_ATTEMPTS_COLLECTION).doc(paymentId).get();
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

  await userRef.set(
    stripUndefined({
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
    }),
    { merge: true }
  );
}

async function grantLifetimeAccess(userId: string, payment: AsaasPayment) {
  const userRef = adminDb.collection(USER_COLLECTION).doc(userId);
  const userDoc = await userRef.get();
  const currentApprovedPillar = userDoc.exists ? Number(userDoc.data()?.approvedPillar || 1) : 1;

  await userRef.set(
    {
      subscriptionStatus: "premium",
      purchasedPlan: "lifetime",
      premiumActivatedAt: nowIso(),
      paymentId: payment.id,
      paymentMethod: payment.billingType as CheckoutPaymentMethod,
      paymentStatus: payment.status,
      pendingCheckoutPayment: null,
      pendingPixPayment: null,
      approvedPillar: Math.max(currentApprovedPillar, 2),
      updatedAt: nowIso(),
    },
    { merge: true }
  );
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
  if (!legacyPix?.paymentId) {
    return null;
  }

  return {
    id: legacyPix.paymentId,
    userId,
    asaasCustomerId: "",
    paymentMethod: "PIX",
    plan: "lifetime",
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

function ensureDirectCardFields(input: CheckoutRequestInput) {
  if (!DIRECT_CARD_ENABLED) {
    throw new Error("Pagamento direto com cartao nao esta habilitado neste ambiente.");
  }

  if (!input.card) {
    throw new Error("Dados do cartao sao obrigatorios para o modo direto.");
  }

  if (!input.cardHolderInfo) {
    throw new Error("Dados do titular do cartao sao obrigatorios para o modo direto.");
  }

  if (!input.remoteIp) {
    throw new Error("O IP remoto do comprador e obrigatorio para o modo direto.");
  }
}

function buildCardHolderInfo(input: CheckoutRequestInput): CheckoutCardHolderInfoInput {
  if (input.cardHolderInfo) {
    return input.cardHolderInfo;
  }

  if (!input.postalCode || !input.addressNumber) {
    throw new Error("CEP e numero do endereco sao obrigatorios para pagamento direto com cartao.");
  }

  return {
    name: input.name,
    email: input.email,
    cpfCnpj: input.cpfCnpj,
    postalCode: input.postalCode,
    addressNumber: input.addressNumber,
    addressComplement: input.addressComplement,
    phone: input.phone,
    mobilePhone: input.mobilePhone,
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
  const userDoc = await getUserDoc(userId);
  const userData = userDoc.data() as UserPaymentSnapshot | undefined;

  if (
    plan === "lifetime" &&
    (userData?.subscriptionStatus === "premium" || userData?.purchasedPlan === "lifetime")
  ) {
    return {
      success: true,
      alreadyPremium: true,
      message: "Este usuario ja possui acesso vitalicio.",
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
    if (syncedAttempt.plan === "lifetime") {
      await grantLifetimeAccess(userId, payment);
    } else {
      await registerSpecialtyPurchase(userId, payment);
    }
    await syncUserPendingState(userId, null);

    return {
      success: true,
      alreadyPremium: syncedAttempt.plan === "lifetime",
      paymentId: payment.id,
      paymentMethod: syncedAttempt.paymentMethod,
      plan: syncedAttempt.plan,
      status: payment.status,
      message: "Pagamento ja confirmado para este usuario.",
    };
  }

  const pendingState = buildPendingCheckoutPayment(syncedAttempt);

  if (syncedAttempt.paymentMethod === "PIX" && !isPendingPixStillValid(pendingState)) {
    await syncUserPendingState(userId, null);

    return getAttemptResponse(syncedAttempt, { expired: true });
  }

  if (shouldClearPendingPayment(payment.status)) {
    await syncUserPendingState(userId, null);
    return getAttemptResponse(syncedAttempt, { expired: true });
  }

  await syncUserPendingState(userId, syncedAttempt);
  return getAttemptResponse(syncedAttempt, { reusedExisting: true });
}

export async function createCheckout(input: CheckoutRequestInput): Promise<CheckoutStateResponse> {
  const plan = input.plan ?? "lifetime";
  const paymentMethod = input.paymentMethod ?? "PIX";
  const creditCardMode: CreditCardCheckoutMode =
    paymentMethod === "CREDIT_CARD" ? input.creditCardMode ?? "INVOICE_URL" : "INVOICE_URL";
  const value = input.value ?? (plan === "specialty" ? SPECIALTY_TEST_PAYMENT_VALUE : PAYMENT_VALUE);
  const description = input.description ?? (
    plan === "specialty" ? SPECIALTY_TEST_PAYMENT_DESCRIPTION : PAYMENT_DESCRIPTION
  );

  const existingState = await getCheckoutState(input.userId, plan);
  if (existingState.alreadyPremium || existingState.hasPendingPayment) {
    return existingState;
  }

  const customer = await createOrGetCustomer(input.name, input.email, input.cpfCnpj);

  if (paymentMethod === "PIX") {
    const payment = await createPixPayment(customer.id, value, description, input.userId);
    const qrCode = await getPixQrCode(payment.id);
    const expiresAt = new Date(Date.now() + PIX_VALIDITY_MS).toISOString();
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
      localCustomerId: input.localCustomerId,
    });

    await upsertPaymentAttempt(attempt);
    await syncUserPendingState(input.userId, attempt);

    return getAttemptResponse(attempt);
  }

  const dueDate = formatDateDaysFromNow(CARD_DUE_DAYS);

  if (creditCardMode === "DIRECT") {
    ensureDirectCardFields(input);
    const cardHolderInfo = buildCardHolderInfo(input);
    const payment = await createCreditCardPayment({
      customer: customer.id,
      value,
      description,
      dueDate,
      externalReference: input.userId,
      creditCardMode,
      creditCard: input.card?.token ? undefined : input.card!,
      creditCardToken: input.card?.token,
      creditCardHolderInfo: cardHolderInfo,
      remoteIp: input.remoteIp!,
    });

    const attempt = buildPaymentAttemptFromAsaas({
      payment,
      userId: input.userId,
      asaasCustomerId: customer.id,
      paymentMethod,
      creditCardMode,
      value,
      description,
      plan,
      localCustomerId: input.localCustomerId,
    });

    await upsertPaymentAttempt(attempt);

    if (isPaymentPaid(payment.status)) {
      if (plan === "lifetime") {
        await grantLifetimeAccess(input.userId, payment);
      } else {
        await registerSpecialtyPurchase(input.userId, payment);
      }
      await syncUserPendingState(input.userId, null);
    } else {
      await syncUserPendingState(input.userId, attempt);
    }

    return getAttemptResponse(attempt);
  }

  const payment = await createCreditCardPayment({
    customer: customer.id,
    value,
    description,
    dueDate,
    externalReference: input.userId,
    creditCardMode,
  });

  const attempt = buildPaymentAttemptFromAsaas({
    payment,
    userId: input.userId,
    asaasCustomerId: customer.id,
    paymentMethod,
    creditCardMode,
    value,
    description,
    plan,
    localCustomerId: input.localCustomerId,
  });

  await upsertPaymentAttempt(attempt);
  await syncUserPendingState(input.userId, attempt);

  return getAttemptResponse(attempt);
}

export async function verifyPaymentStatus(userId: string, paymentId: string): Promise<{ isPaid: boolean; status: string }> {
  const payment = await getPayment(paymentId);
  const attemptDoc = await getPaymentAttempt(paymentId);
  const existingAttempt = attemptDoc.exists
    ? (attemptDoc.data() as PaymentAttemptRecord)
    : buildPaymentAttemptFromAsaas({
        payment,
        userId,
        asaasCustomerId: payment.customer,
        paymentMethod: payment.billingType as CheckoutPaymentMethod,
        value: payment.value,
        description: PAYMENT_DESCRIPTION,
        plan: "lifetime",
      });

  const syncedAttempt = await syncAttemptFromAsaas(existingAttempt, payment);

  if (isPaymentPaid(payment.status)) {
    if (syncedAttempt.plan === "lifetime") {
      await grantLifetimeAccess(userId, payment);
    } else {
      await registerSpecialtyPurchase(userId, payment);
    }
    await syncUserPendingState(userId, null);
    return { isPaid: true, status: payment.status };
  }

  if (shouldClearPendingPayment(payment.status)) {
    await syncUserPendingState(userId, null);
  } else {
    await syncUserPendingState(userId, syncedAttempt);
  }

  return { isPaid: false, status: payment.status };
}

export async function handleAsaasWebhook(payload: {
  id?: string;
  event?: string;
  payment?: AsaasPayment;
}) {
  const { event, payment } = payload;

  if (!event || !payment?.id) {
    throw new Error("Webhook payload invalido: evento ou pagamento ausente.");
  }

  const webhookEventId = sanitizeWebhookEventId(payload);
  const webhookRef = adminDb.collection(WEBHOOK_EVENTS_COLLECTION).doc(webhookEventId);
  const webhookDoc = await webhookRef.get();

  if (webhookDoc.exists) {
    return { success: true, duplicated: true, ignoredEvent: event };
  }

  await webhookRef.set({
    event,
    paymentId: payment.id,
    status: payment.status,
    receivedAt: nowIso(),
  });

  const attemptDoc = await getPaymentAttempt(payment.id);
  let attempt: PaymentAttemptRecord | null = attemptDoc.exists
    ? (attemptDoc.data() as PaymentAttemptRecord)
    : null;

  const userId = payment.externalReference || attempt?.userId;
  if (!userId) {
    throw new Error("Nao foi possivel determinar o usuario local para o pagamento recebido.");
  }

  if (!attempt) {
    attempt = buildPaymentAttemptFromAsaas({
      payment,
      userId,
      asaasCustomerId: payment.customer,
      paymentMethod: payment.billingType as CheckoutPaymentMethod,
      value: payment.value,
      description: PAYMENT_DESCRIPTION,
      plan: "lifetime",
      lastWebhookEvent: event,
    });
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
    if (attempt.plan === "lifetime") {
      await grantLifetimeAccess(userId, payment);
    } else {
      await registerSpecialtyPurchase(userId, payment);
    }
    await syncUserPendingState(userId, null);
    return { success: true, grantedAccess: true, paymentId: payment.id };
  }

  if (shouldClearPendingPayment(payment.status)) {
    await syncUserPendingState(userId, null);
  } else {
    await syncUserPendingState(userId, attempt);
  }

  return { success: true, ignoredEvent: event, paymentId: payment.id };
}

export async function createCreditCardToken(input: CheckoutRequestInput) {
  ensureDirectCardFields(input);
  const cardHolderInfo = buildCardHolderInfo(input);

  return tokenizeCreditCard({
    customer: {
      name: input.name,
      email: input.email,
      cpfCnpj: input.cpfCnpj,
    },
    creditCard: input.card!,
    creditCardHolderInfo: cardHolderInfo,
    remoteIp: input.remoteIp!,
  });
}

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { createOrGetCustomer, createPixPayment, getPayment, getPixQrCode, isPaymentPaid } from "@/lib/asaas";
import type { PendingPixPayment } from "@/lib/auth/service";

export const dynamic = "force-dynamic";

const PAYMENT_VALUE = 297.0;
const PAYMENT_DESCRIPTION = "Acesso Vitalicio - BasedSpeak PRO (9 Pilares)";
const PIX_VALIDITY_MS = 5 * 60 * 1000;

function buildPendingPixPayment(
  paymentId: string,
  qrCode: string,
  qrCodePayload: string,
  status: string
): PendingPixPayment {
  const now = new Date();

  return {
    paymentId,
    qrCode,
    qrCodePayload,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + PIX_VALIDITY_MS).toISOString(),
    status,
    plan: "lifetime",
  };
}

function isPendingPixStillValid(payment: PendingPixPayment | undefined | null) {
  if (!payment || payment.plan !== "lifetime") {
    return false;
  }

  return new Date(payment.expiresAt).getTime() > Date.now();
}

async function grantLifetimeAccess(userId: string, paymentId: string) {
  const userRef = adminDb.collection("users").doc(userId);
  const userDoc = await userRef.get();

  if (userDoc.exists) {
    const userData = userDoc.data();
    if (userData?.subscriptionStatus === "premium" || userData?.purchasedPlan === "lifetime") {
      console.log(`User ${userId} already has premium access, skipping grant`);
      return;
    }
  }
  const currentApprovedPillar = userDoc.exists ? Number(userDoc.data()?.approvedPillar || 1) : 1;

  await userRef.set(
    {
      subscriptionStatus: "premium",
      purchasedPlan: "lifetime",
      premiumActivatedAt: new Date().toISOString(),
      paymentId,
      pendingPixPayment: null,
      approvedPillar: Math.max(currentApprovedPillar, 2),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

async function getCheckoutState(userId: string) {
  const userRef = adminDb.collection("users").doc(userId);
  const userDoc = await userRef.get();
  const userData = userDoc.data() as {
    subscriptionStatus?: string;
    purchasedPlan?: string;
    paymentId?: string;
    pendingPixPayment?: PendingPixPayment | null;
  } | undefined;

  if (userData?.subscriptionStatus === "premium" || userData?.purchasedPlan === "lifetime") {
    return NextResponse.json({
      success: true,
      alreadyPremium: true,
      message: "Este usuario ja possui acesso vitalicio.",
    });
  }

  const pendingPixPayment = userData?.pendingPixPayment;

  if (!pendingPixPayment?.paymentId) {
    return NextResponse.json({
      success: true,
      hasPendingPix: false,
    });
  }

  const asaasPayment = await getPayment(pendingPixPayment.paymentId);

  if (isPaymentPaid(asaasPayment.status)) {
    await grantLifetimeAccess(userId, asaasPayment.id);

    return NextResponse.json({
      success: true,
      alreadyPremium: true,
      paymentId: asaasPayment.id,
      message: "Pagamento ja confirmado para este usuario.",
    });
  }

  if (isPendingPixStillValid(pendingPixPayment)) {
    await userRef.set(
      {
        pendingPixPayment: {
          ...pendingPixPayment,
          status: asaasPayment.status,
        },
        paymentId: pendingPixPayment.paymentId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      hasPendingPix: true,
      reusedExisting: true,
      paymentId: pendingPixPayment.paymentId,
      qrCode: pendingPixPayment.qrCode,
      qrCodePayload: pendingPixPayment.qrCodePayload,
      expiresAt: pendingPixPayment.expiresAt,
      status: asaasPayment.status,
    });
  }

  return NextResponse.json({
    success: true,
    hasPendingPix: false,
    expired: true,
    paymentId: pendingPixPayment.paymentId,
    status: asaasPayment.status,
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId." }, { status: 400 });
    }

    return await getCheckoutState(userId);
  } catch (error: unknown) {
    console.error("Checkout PIX GET Error:", error);
    const message = error instanceof Error ? error.message : "Unexpected checkout state error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, cpfCnpj, userId } = await req.json();

    if (!name || !email || !cpfCnpj || !userId) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const existingState = await getCheckoutState(userId);
    const existingPayload = await existingState.json();

    if (existingPayload.alreadyPremium || existingPayload.hasPendingPix) {
      return NextResponse.json(existingPayload, { status: 200 });
    }

    const userRef = adminDb.collection("users").doc(userId);
    const customer = await createOrGetCustomer(name, email, cpfCnpj);
    const payment = await createPixPayment(customer.id, PAYMENT_VALUE, PAYMENT_DESCRIPTION, userId);
    const qrCode = await getPixQrCode(payment.id);
    const nextPendingPixPayment = buildPendingPixPayment(
      payment.id,
      qrCode.encodedImage,
      qrCode.payload,
      payment.status
    );

    await userRef.set(
      {
        paymentId: payment.id,
        pendingPixPayment: nextPendingPixPayment,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      invoiceUrl: payment.invoiceUrl,
      qrCode: qrCode.encodedImage,
      qrCodePayload: qrCode.payload,
      expiresAt: nextPendingPixPayment.expiresAt,
      status: payment.status,
    });
  } catch (error: unknown) {
    console.error("Checkout PIX Error:", error);
    const message = error instanceof Error ? error.message : "Unexpected checkout error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

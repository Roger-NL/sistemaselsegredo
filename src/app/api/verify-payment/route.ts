import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getPayment, isPaymentPaid } from "@/lib/asaas";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { paymentId, userId } = await req.json();

    if (!paymentId || !userId) {
      return NextResponse.json({ error: "Missing paymentId or userId" }, { status: 400 });
    }

    const payment = await getPayment(paymentId);
    const status: string = payment.status;

    console.log(`[verify-payment] paymentId=${paymentId} userId=${userId} status=${status}`);

    const isPaid = isPaymentPaid(status);

    if (isPaid) {
      const userRef = adminDb.collection("users").doc(userId);
      const userDoc = await userRef.get();
      const currentApprovedPillar = userDoc.exists ? Number(userDoc.data()?.approvedPillar || 1) : 1;

      await userRef.set({
        subscriptionStatus: "premium",
        purchasedPlan: "lifetime",
        premiumActivatedAt: new Date().toISOString(),
        paymentId,
        pendingPixPayment: null,
        approvedPillar: Math.max(currentApprovedPillar, 2),
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      console.log(`[verify-payment] Acesso liberado para UID: ${userId}`);
      return NextResponse.json({ isPaid: true, status });
    }

    await adminDb.collection("users").doc(userId).set({
      "pendingPixPayment.status": status,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({ isPaid: false, status });

  } catch (error: unknown) {
    console.error("[verify-payment] Error:", error);
    const message = error instanceof Error ? error.message : "Unexpected verify payment error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

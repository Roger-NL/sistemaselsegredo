import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    const { event, payment } = data;

    // Queremos escutar quando um pagamento foi confirmado ou recebido com sucesso
    if (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED") {
      
      const externalReference = payment.externalReference;
      
      if (!externalReference) {
        throw new Error("Missing externalReference (Firebase UID)");
      }

      console.log(`[Webhook Asaas] Payment confirmed for UID: ${externalReference}`);

      // Atualizar o banco de dados do usuário (Firebase Firestore) usando Admin SDK
      // Contornando as security rules normais.
      const userRef = adminDb.collection("users").doc(externalReference);
      
      const userDoc = await userRef.get();
      const currentApprovedPillar = userDoc.exists ? Number(userDoc.data()?.approvedPillar || 1) : 1;
      
      await userRef.set({
        subscriptionStatus: "premium",
        purchasedPlan: "lifetime",
        paymentId: payment.id,
        pendingPixPayment: null,
        approvedPillar: Math.max(currentApprovedPillar, 2), // Libera instantaneamente o Pilar 2 (o que "fura a fila")
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      return NextResponse.json({ success: true, message: `Access granted safely for ${externalReference}` });
    }

    // Se for outro evento de pagamento, a gente apenas dá 200 pro Asaas parar de tentar enviar
    return NextResponse.json({ success: true, ignoredEvent: event });

  } catch (error: unknown) {
    console.error("Asaas Webhook Error:", error);
    // Erros 500 informam ao Asaas para tentar disparar o Webhook novamente mais tarde
    const message = error instanceof Error ? error.message : "Unexpected webhook error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

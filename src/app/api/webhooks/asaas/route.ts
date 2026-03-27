import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const asaasToken = req.headers.get("asaas-access-token");
    
    // Proteção Máxima: Só aceitar requisições que têm a senha gerada pelo Asaas
    if (asaasToken !== process.env.ASAAS_WEBHOOK_SECRET) {
        console.error("Webhook recusado: Token inválido");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      
      await userRef.set({
        subscriptionStatus: "premium",
        updatedAt: new Date(),
      }, { merge: true });

      return NextResponse.json({ success: true, message: `Access granted safely for ${externalReference}` });
    }

    // Se for outro evento de pagamento, a gente apenas dá 200 pro Asaas parar de tentar enviar
    return NextResponse.json({ success: true, ignoredEvent: event });

  } catch (error: any) {
    console.error("Asaas Webhook Error:", error);
    // Erros 500 informam ao Asaas para tentar disparar o Webhook novamente mais tarde
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

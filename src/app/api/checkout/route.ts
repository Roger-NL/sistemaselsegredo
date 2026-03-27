import { NextResponse } from "next/server";
import { createOrGetCustomer, createPixPayment, getPixQrCode } from "@/lib/asaas";

export async function POST(req: Request) {
  try {
    const { name, email, cpfCnpj, userId } = await req.json();

    if (!name || !email || !cpfCnpj || !userId) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // 1. Criar ou buscar o Cliente no Asaas
    const customer = await createOrGetCustomer(name, email, cpfCnpj);

    // 2. Criar a Cobrança PIX
    // O externalReference é vital: ele contém o Firebase UID
    const payment = await createPixPayment(
      customer.id,
      297.00, // Preço Promocional conforme design (Base: 997,00)
      "Acesso Vitalício - BasedSpeak PRO (9 Pilares)",
      userId
    );

    // 3. Pegar imediatamente o QR Code para exibir ao usuário
    const qrCode = await getPixQrCode(payment.id);

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      invoiceUrl: payment.invoiceUrl,
      qrCode: qrCode.encodedImage,
      qrCodePayload: qrCode.payload
    });

  } catch (error: any) {
    console.error("Checkout PIX Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const ASAAS_API_URL = process.env.NEXT_PUBLIC_ASAAS_API_URL || "https://sandbox.asaas.com/api/v3";

function getHeaders() {
  // Try environment variable, but fallback to direct Sandbox key if Next.js caching fails
  const key = process.env.ASAAS_API_KEY || "$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmE5Mjg3ZGEyLTIwZWMtNDI3OS1iNzE0LWM2Y2MyYjExM2U1NTo6JGFhY2hfYzc1NzAyMDQtNzk1ZC00NDdjLWFlNjMtOTkzNDdmMDQyNTlj";
  return {
    "Content-Type": "application/json",
    "access_token": key.replace(/'/g, ''), // Remove possiveis aspas extras
  };
}

// ==========================================
// CUSTOMERS
// ==========================================

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj?: string;
}

export async function createOrGetCustomer(name: string, email: string, cpfCnpj?: string): Promise<AsaasCustomer> {
  // 1. Tentar buscar primeiro pelo e-mail
  const searchRes = await fetch(`${ASAAS_API_URL}/customers?email=${encodeURIComponent(email)}`, {
    headers: getHeaders(),
  });

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.data && data.data.length > 0) {
      return data.data[0] as AsaasCustomer;
    }
  }

  // 2. Se não encontrou, criar novo
  const createRes = await fetch(`${ASAAS_API_URL}/customers`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      name,
      email,
      cpfCnpj,
    }),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json();
    throw new Error(`Asaas Error (Customer): ${JSON.stringify(errorData)}`);
  }

  const newCustomer = await createRes.json();
  return newCustomer as AsaasCustomer;
}

// ==========================================
// PAYMENTS
// ==========================================

export interface AsaasPayment {
  id: string;
  customer: string;
  value: number;
  netValue: number;
  billingType: string;
  status: string;
  dueDate: string;
  invoiceUrl: string;
  invoiceNumber: string;
  pixTransaction?: string;
  payload?: any;
}

/**
 * Cria uma cobrança PIX.
 * @param customerId ID do cliente no Asaas (cus_xxxxxx)
 * @param value Valor da cobrança (Ex: 297.00)
 * @param description Descrição da cobrança
 * @param externalReference ID externo para vincularmos ao usuário (ex: firebase_uid)
 */
export async function createPixPayment(
  customerId: string,
  value: number,
  description: string,
  externalReference: string
): Promise<AsaasPayment> {
  
  // Vencimento para o mesmo dia (ou D+1)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dueDate = tomorrow.toISOString().split("T")[0];

  const payload = {
    customer: customerId,
    billingType: "PIX",
    value,
    dueDate,
    description,
    externalReference,
  };

  const res = await fetch(`${ASAAS_API_URL}/payments`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`Asaas Error (Payment): ${JSON.stringify(errorData)}`);
  }

  return await res.json();
}

/**
 * Pega o QR Code de um pagamento PIX criado
 */
export async function getPixQrCode(paymentId: string): Promise<{ encodedImage: string; payload: string }> {
  const res = await fetch(`${ASAAS_API_URL}/payments/${paymentId}/pixQrCode`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    throw new Error("Erro ao buscar QR Code PIX.");
  }

  return await res.json();
}

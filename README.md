# BasedSpeak Payments

Projeto Next.js com autenticação Firebase e checkout Asaas para acesso vitalício.

## Configuração

1. Copie [.env.example](/Users/rogera/Documents/projetos/ES/.env.example) para `.env.local`.
2. Preencha:
   - `ASAAS_API_KEY`
   - `ASAAS_BASE_URL`
   - `ASAAS_WEBHOOK_TOKEN`
3. Para sandbox da Asaas, use:
   - `ASAAS_BASE_URL=https://api-sandbox.asaas.com/v3`
4. Se sua conta estiver habilitada para cartão direto/tokenização, opcionalmente ative:
   - `ASAAS_ENABLE_DIRECT_CREDIT_CARD=true`

## Desenvolvimento

```bash
npm install
npm run dev
```

## Fluxos de pagamento suportados

### Pix

- O frontend chama `POST /api/checkout` com `paymentMethod: "PIX"`.
- O backend:
  - cria ou reaproveita o customer na Asaas
  - cria a cobrança Pix
  - busca QR Code
  - persiste a tentativa em `payment_attempts`
  - devolve QR Code e payload copia-e-cola

### Cartão via invoiceUrl

- O frontend chama `POST /api/checkout` com `paymentMethod: "CREDIT_CARD"` e `creditCardMode: "INVOICE_URL"`.
- O backend:
  - cria ou reaproveita o customer na Asaas
  - cria cobrança `CREDIT_CARD`
  - devolve `invoiceUrl`
- O frontend redireciona o cliente para a fatura segura da Asaas.

### Cartão direto pela API

- Endpoint separado:
  - `POST /api/checkout/card/direct`
- Requer:
  - `ASAAS_ENABLE_DIRECT_CREDIT_CARD=true`
  - conta Asaas habilitada para o fluxo
- Envia cartão e dados do titular ao backend, que processa a cobrança via API.

### Tokenização de cartão

- Endpoint preparado:
  - `POST /api/checkout/card/tokenize`
- Também requer:
  - `ASAAS_ENABLE_DIRECT_CREDIT_CARD=true`
  - habilitação da funcionalidade na conta Asaas

## Webhook

Webhook implementado em:

- `POST /api/webhooks/asaas`

Validação:

- Configure a URL na Asaas com o token na query string:
  - `https://seu-dominio.com/api/webhooks/asaas?token=SEU_TOKEN`
- O backend também aceita o header `x-asaas-webhook-token`.

O webhook:

- registra idempotência em `asaas_webhook_events`
- sincroniza o status local em `payment_attempts`
- libera o acesso premium quando o pagamento chega em status pago

## Endpoints

- `GET /api/checkout?userId=...`
  - recupera cobrança pendente ou informa se o usuário já é premium
- `POST /api/checkout`
  - cria checkout Pix ou cartão
- `POST /api/verify-payment`
  - consulta o status atual na Asaas e sincroniza localmente
- `POST /api/webhooks/asaas`
  - recebe eventos da Asaas
- `POST /api/checkout/card/direct`
  - fluxo separado para pagamento direto com cartão
- `POST /api/checkout/card/tokenize`
  - fluxo separado para tokenização

## Exemplo de payload: Pix

```json
{
  "userId": "firebase_uid_123",
  "localCustomerId": "user_123",
  "name": "Maria Silva",
  "email": "maria@email.com",
  "cpfCnpj": "12345678909",
  "paymentMethod": "PIX",
  "value": 297,
  "description": "Acesso Vitalicio - BasedSpeak PRO (9 Pilares)"
}
```

## Exemplo de resposta: Pix

```json
{
  "success": true,
  "hasPendingPayment": true,
  "paymentId": "pay_123",
  "paymentMethod": "PIX",
  "status": "PENDING",
  "invoiceUrl": "https://www.asaas.com/i/pay_123",
  "qrCode": "BASE64_QRCODE",
  "qrCodePayload": "000201....",
  "expiresAt": "2026-05-02T19:30:00.000Z",
  "dueDate": "2026-05-02"
}
```

## Exemplo de payload: Cartão via invoiceUrl

```json
{
  "userId": "firebase_uid_123",
  "localCustomerId": "user_123",
  "name": "Maria Silva",
  "email": "maria@email.com",
  "cpfCnpj": "12345678909",
  "paymentMethod": "CREDIT_CARD",
  "creditCardMode": "INVOICE_URL",
  "value": 297,
  "description": "Acesso Vitalicio - BasedSpeak PRO (9 Pilares)"
}
```

## Exemplo de resposta: Cartão via invoiceUrl

```json
{
  "success": true,
  "hasPendingPayment": true,
  "paymentId": "pay_456",
  "paymentMethod": "CREDIT_CARD",
  "creditCardMode": "INVOICE_URL",
  "status": "PENDING",
  "invoiceUrl": "https://www.asaas.com/i/pay_456",
  "requiresRedirect": true,
  "dueDate": "2026-05-07"
}
```

## Exemplo de payload: Cartão direto

```json
{
  "userId": "firebase_uid_123",
  "localCustomerId": "user_123",
  "name": "Maria Silva",
  "email": "maria@email.com",
  "cpfCnpj": "12345678909",
  "paymentMethod": "CREDIT_CARD",
  "creditCardMode": "DIRECT",
  "remoteIp": "201.10.20.30",
  "postalCode": "01310930",
  "addressNumber": "100",
  "phone": "11999999999",
  "card": {
    "holderName": "MARIA SILVA",
    "number": "5162306219378829",
    "expiryMonth": "05",
    "expiryYear": "2030",
    "ccv": "318"
  }
}
```

## Tratamento de erros

- Erros da Asaas retornam:
  - `error`
  - `provider: "asaas"`
  - `providerStatus`
- O backend não loga número completo do cartão, CVV ou payload de cartão.
- O webhook usa idempotência para ignorar eventos duplicados.

## Como testar em sandbox

1. Configure `ASAAS_BASE_URL=https://api-sandbox.asaas.com/v3`
2. Gere uma cobrança Pix em `/pagamento`
3. Gere uma cobrança de cartão em `/pagamento`
4. Verifique:
   - `payment_attempts` no Firestore
   - atualização do usuário para premium
   - webhook recebendo eventos

## Como usar no frontend

- Pix:
  - selecione `PIX`
  - gere a cobrança
  - pague pelo QR Code
- Cartão:
  - selecione `Cartão`
  - o frontend recebe `invoiceUrl`
  - redireciona para a fatura da Asaas

## Referência oficial da Asaas usada no desenho

- Cobranças via cartão de crédito
- Tokenização de cartão de crédito
- Webhooks de cobrança
- Guia de cobranças

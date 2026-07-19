# BasedSpeak

Aplicação Next.js para aprendizagem de inglês com autenticação Firebase, progressão por pilares, provas com revisão humana, agendamento via Google Calendar e pagamentos Asaas.

## Requisitos

- Node.js 22 ou superior
- Projeto Firebase com Authentication e Firestore
- Conta Asaas (sandbox para desenvolvimento)
- Credenciais Google Calendar para o fluxo de sessões

## Desenvolvimento

```bash
npm install
cp .env.example .env.local
npm run dev
```

Antes de abrir uma alteração:

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

## Segurança e autoridade

- A sessão do browser é trocada por cookie `httpOnly` verificado no servidor.
- Administração depende da custom claim Firebase `admin: true`; não use allowlists de e-mail no código.
- Progresso, pontuação de prova, convites, pagamentos e agendamentos são validados no servidor.
- Cartão é informado apenas no checkout hospedado pelo Asaas; a aplicação não recebe PAN ou CVV.
- As regras e índices Firestore são versionados em `firestore.rules` e `firestore.indexes.json`.

Para auditar as claims sem alterar utilizadores:

```bash
npm run auth:admins
```

Depois de confirmar a lista `FIREBASE_ADMIN_EMAILS`, aplique explicitamente:

```bash
npm run auth:admins -- --apply
```

## Beta gratuito por convite

Defina `BETA_FREE_MODE=true` no ambiente do servidor enquanto o beta fechado estiver ativo. Com a flag ligada, `/pagamento` mostra apenas a ativação por convite, oculta preços e dados financeiros e não inicia pedidos de checkout ou reconciliação de pagamentos.

A flag é exclusivamente de servidor e não deve receber o prefixo `NEXT_PUBLIC_`. Altere-a para `false` apenas quando o fluxo comercial estiver deliberadamente pronto e as credenciais Asaas do ambiente tiverem sido validadas.

## Pagamentos

- `POST /api/checkout`: cria ou recupera uma cobrança Pix/checkout hospedado.
- `POST /api/verify-payment`: reconcilia o estado com o fornecedor.
- `POST /api/webhooks/asaas`: recebe eventos autenticados e idempotentes.

Em produção, `ASAAS_API_KEY`, `ASAAS_BASE_URL` e `ASAAS_WEBHOOK_TOKEN` devem pertencer ao mesmo ambiente. Nunca exponha esses valores com prefixo `NEXT_PUBLIC_`.

## Operação

```bash
npm run scheduling:health
npm run exams:audit-locks
npm run payments:audit
```

Os scripts de migração são dry-run por padrão. Qualquer opção `--apply` deve ser executada somente depois de rever o resultado e fazer backup.

Checklist mínimo de deploy:

1. Executar testes, lint, TypeScript e build.
2. Aplicar claims administrativas antes das regras que dependem delas.
3. Fazer deploy de regras e índices Firestore.
4. Confirmar `BETA_FREE_MODE=true` para o beta gratuito; se a flag estiver desligada, confirmar credenciais Asaas de produção e token do webhook.
5. Executar o healthcheck de scheduling.
6. Fazer smoke test com utilizador não administrador e outro administrador.
7. Com o beta gratuito ativo, validar geração e ativação de um convite; com pagamentos ativos, confirmar Pix/cartão em sandbox e, para produção, usar uma transação real controlada e o respetivo reembolso.

Termos e Privacidade publicados no produto são uma base operacional para o beta fechado e ainda exigem revisão jurídica/identificação completa do controlador antes de abertura comercial.

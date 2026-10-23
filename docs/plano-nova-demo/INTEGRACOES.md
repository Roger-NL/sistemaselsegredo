# Integrações preservadas e pontos de conexão

**Escopo:** mapa-base e contratos preservados. Extrações locais executadas nos sublotes 1a/1b; ver ANDAMENTO.md. Esta auditoria não modifica código, credenciais, banco ou serviços externos. Os caminhos em “hoje” existem na base auditada (`b881b3e`); os caminhos em “depois” são propostas.

## Regra de fronteira

A demo pública não tem login e não deve inicializar Firebase cliente, Asaas, Calendar, ElevenLabs ou Firebase Admin ao carregar `/` ou `/demo`. Uma página futura que precise de uma integração chama uma rota própria; a rota valida entrada e identidade, chama um serviço server-only e esse serviço usa o adaptador externo. Nunca importar SDK Admin, credenciais, Asaas ou Calendar em componentes client.

~~~text
Página / componente client
  → src/client/<domínio>/service.ts (quando houver sessão autenticada)
  → fetch('/api/<domínio>')
  → src/app/api/<domínio>/route.ts
  → src/server/<domínio>/service.ts
  → adaptador Firebase / Asaas / Calendar
~~~

A demo usa apenas `/api/demo/*` e recursos estáticos versionados. O estado da conversa fica no navegador; a API anônima serve apenas sessão de teste, telemetria e avaliação opcional. Esses dois conjuntos de integração não se chamam.

## Firebase, autenticação e banco

| Capacidade | Local atual | Destino proposto | Contrato/uso futuro |
|---|---|---|---|
| Firebase browser SDK | `src/lib/firebase.ts`, `src/lib/firebase/index.ts` | `src/client/auth/firebase.ts` | Inicialização apenas quando uma tela futura autenticada importar o módulo; nunca do shell demo |
| Firebase Admin | `src/lib/firebase-admin.ts`, `src/lib/firebase-admin-firestore.ts` | `src/server/firebase.ts` | Um bootstrap server-only e lazy para Auth/Firestore; eliminar a inicialização duplicada depois de migrar consumidores |
| Serviço de auth misto | `src/lib/auth/service.ts` | `src/server/auth/service.ts` + contratos puros | Separar login/convite/sessão de estatísticas, progresso e tipos do currículo antes de remover `src/data` |
| Principal/autorização | `principal.ts`, `request-auth.ts`, `route-guards.ts`, `admin-policy.ts` em `src/lib/auth/` | `src/server/auth/` | Reutilizar nos handlers que exigem identidade; verificar papel no serviço/handler. Proxy não é autorização |
| Cookie de sessão | `src/lib/auth/session.ts`; POST/DELETE client hoje em `src/context/AuthContext.tsx` | `src/server/auth/session-cookie.ts` e `src/client/auth/session.ts` | Preservar GET/POST/DELETE `/api/auth/session`; extrair o helper client antes de remover provider React |
| Convites | `src/lib/auth/invite-codes.ts`; `/api/auth/invite`; `/api/admin/invite-codes` | `src/server/auth/invites.ts` | Convite público protegido por validação/rate-limit; gestão apenas admin |
| Acesso/premium | `src/lib/auth/premium-access.ts` | `src/server/access/service.ts` | Separar entitlements financeiros e identidade de progresso/pilares; nenhuma chamada pela demo |
| Configuração/rules/índices | `.firebaserc`, `firebase.json`, `firestore.rules`, `firestore.indexes.json` | Preservar e revisar em lote próprio | Não apagar coleções nem aplicar regras/índices remotos como parte da limpeza. Firestore Rules não protegem chamadas via Admin SDK; manter autorização no serviço e IAM adequado |
| Limitação e validação HTTP | `src/lib/server/rate-limit.ts`, `src/lib/server/request.ts` | `src/server/http/` | Adaptar namespaces por rota. Limites não podem travar estado local da narrativa |

### Endpoints atuais de autenticação

- `POST /api/auth/invite`: valida convite e fluxo atual de entrada. Preservar contrato/segurança e dependências necessárias; não oferecer link pela demo.
- `GET, POST, DELETE /api/auth/session`: leitura, estabelecimento/remoção de cookie de sessão. Preservar métodos e respostas de API; não redirecionar para HTML. A demo não usa este cookie.
- `GET, POST /api/admin/invite-codes`: exigir identidade e papel admin no servidor.

Não implementar formulário de login ou cadastro nesta fase. Uma interface futura pode voltar a consumir esses serviços por rotas e contratos documentados.

## Pagamentos / Asaas

| Capacidade | Local atual | Destino proposto | Uso/limite |
|---|---|---|---|
| Cliente e configuração Asaas | `src/lib/asaas.ts`, `src/lib/payments/config.ts` | `src/server/integrations/asaas.ts` | Acesso exclusivamente server-side; segredos por variáveis de ambiente |
| Checkout e tipos | `src/lib/payments/service.ts`, `types.ts`, `installments.ts`; `/api/checkout` | `src/server/payments/` | Preservar endpoint e contrato necessário; separar entitlement do currículo antes de remover o serviço antigo |
| Verificação/reconciliação | `/api/verify-payment`; `src/features/payment/payment-mode.ts` | `/api/verify-payment` chama `src/server/payments/reconciliation.ts`; tipo puro em `src/contracts/payments.ts` | Desacoplar o tipo de UI de pagamento antes de apagar a feature |
| Webhook | `/api/webhooks/asaas` | Mesmo endereço, serviço server-only | Validar autenticidade/idempotência e gravar antes de confirmar sucesso; nenhuma rota demo chama webhook |

Rotas a manter: `GET/POST /api/checkout`, `POST /api/verify-payment`, `POST /api/webhooks/asaas`. Preservar semântica JSON, validações e proteção atual, revisadas contra a nova organização. Não tratar callback com dados de cobrança como URL de entrada da demo. Não excluir dados remotos ou arquivos de auditoria de pagamento.

## Agenda / Google Calendar

| Capacidade | Local atual | Destino proposto | Uso futuro |
|---|---|---|---|
| Calendar API | `src/lib/scheduling/google-calendar.ts` | `src/server/integrations/google-calendar.ts` | Credenciais e acesso exclusivamente no servidor |
| Reserva, disponibilidade e locks | `src/lib/scheduling/service.ts`, `types.ts` | `src/server/scheduling/` | Preservar regras de concorrência/reserva sem importar progresso, pilar ou prova |
| Rotas cliente | `availability`, `request`, `status`, `cancel` em `/api/scheduling/` | Mesmos URLs | Validar identidade/entrada conforme contrato; JSON continua JSON |
| Gestão administrativa | `day`, `snapshot`, `decision` em `/api/admin/scheduling/` | Mesmos URLs | Guardas de papel admin no servidor; não criar painel administrativo agora |
| Verificação operacional | `scripts/scheduling-healthcheck.mjs` | Preservar/adaptar | Executar manualmente/CI conforme procedimento, nunca como efeito colateral da demo |

Desacoplar entitlement e dependências curriculares do serviço antes da limpeza. “Guardar a rota” significa manter o handler operacional/documentado; não preservar a tela de calendário antiga.

## Áudio pronto e publicação de mídia

A experiência usa 9 imagens e 50 arquivos de voz aprovados, servidos estaticamente de `public/demo/cafe/v1/`. O manifesto futuro fica em `src/features/demo/content/media.ts`.

Hoje, `GET /api/speech` e `src/hooks/useTTS.ts` dão suporte a geração/reprodução antiga; a rota importa falas de `src/app/inicio-orbita-7k3/conversation.ts`. Antes de excluir o protótipo, extrair a capacidade de produção para `src/server/integrations/elevenlabs.ts` e uma ferramenta de publicação. O visitante não gera TTS. O endereço antigo `/api/speech` deve responder JSON 410 com código estável após extração, sem redirect HTML. `@vercel/blob` pode permanecer para publicação/armazenamento futuro, mas a demo pública não depende dele se a biblioteca aprovada estiver no deploy como assets estáticos.

## Banco e dados remotos

Coleções identificadas no código/contratos da base atual:

| Coleção | Consumidor atual | Plano |
|---|---|---|
| `users` | auth, acesso, perfil, progresso e operações | Não apagar. Preservar documentos. Remover dos novos fluxos demo; autenticação futura continua podendo consultar identidade mínima |
| `invite_codes` | convites/admin | Preservar |
| `payment_attempts`, `checkout_intents`, `asaas_webhook_events` | checkout/reconciliação/webhook | Preservar e manter integridade/idempotência |
| `live_sessions`, `live_session_slot_locks`, `access_requests` | agendamento e pedidos de acesso | Preservar e manter contrato operacional |
| `pillar_exams`, `exam_submission_locks` | provas curriculares | Não excluir documentos nesta mudança. Código antigo pode ser retirado depois de confirmar que nenhuma integração financeira/agenda depende dele; não há promessa de leitura futura dessas coleções |
| `rate_limits` | controles de abuso | Preservar; separar namespaces de endpoint |
| `speech_audio_cache` | TTS antigo | Não apagar remotamente; deixar de ler pela experiência pública. Política de retenção é decisão separada |
| `webhook_events` | regras/uso histórico | Não confundir com `asaas_webhook_events`; não renomear nem apagar nesta limpeza |
| `demo_sessions`, subcoleção `events`, `demo_feedback` | ainda não existem | Coleções propostas apenas se sessão anônima/telemetria remota forem implementadas; acesso público negado e validação server-side obrigatória |

A lista deve ser revisada contra os nomes literais usados pelos serviços antes de qualquer alteração de regras. Remover um tipo TS ou uma coleção de índices locais não apaga registros remotos, mas publicar regras/índices pode mudar o serviço e exige revisão própria.

## Configuração e segredos

Os nomes são referências de localização/configuração, não valores. Nunca copiar valores de `.env.local`, credenciais JSON, painel Vercel ou arquivo de serviço para documento/versionamento.

| Integração | Variáveis documentadas/encontradas |
|---|---|
| Firebase browser | `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` |
| Firebase Admin/auth | `FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_ADMIN_EMAILS` |
| Asaas | `ASAAS_API_KEY`, `ASAAS_BASE_URL`, `ASAAS_WEBHOOK_TOKEN`, `ASAAS_USER_AGENT`, `ASAAS_ALLOW_SANDBOX_IN_PRODUCTION`, `ASAAS_ENABLE_SPECIALTY_CHECKOUT`, `BETA_FREE_MODE` |
| Calendar | `GOOGLE_CALENDAR_ID`, `GOOGLE_CALENDAR_SERVICE_ACCOUNT`, `GOOGLE_CALENDAR_TUTOR_EMAIL`, `GOOGLE_CALENDAR_TIMEZONE`, `GOOGLE_CALENDAR_SLOT_DURATION_MINUTES`, `GOOGLE_CALENDAR_SLOT_GAP_MINUTES`, `GOOGLE_CALENDAR_WORKDAYS`, `GOOGLE_CALENDAR_WORKDAY_START_HOUR`, `GOOGLE_CALENDAR_WORKDAY_END_HOUR` |
| Voz e Blob | `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `BLOB_READ_WRITE_TOKEN`; `SPEECH_CACHE_DIR` somente em desenvolvimento |

`NEXT_PUBLIC_APP_URL` também aparece na configuração atual. O `.env.example` será atualizado em implementação para documentar todas as chaves esperadas e valores fictícios/placeholder, sem substituir a configuração do ambiente. `configuracoes/scheduling.env.example` pode ser consolidado. Não executar `vercel env pull`, publicar configurações ou abrir secrets como parte deste planejamento.

## Contratos demo e como uma página futura os consome

Proposta isolada de `/api/demo/*` em `src/server/demo/`:

- `POST /api/demo/session`: criar/retomar identificador anônimo opaco em cookie próprio. Não cria usuário Firebase e não lê `es_auth_session`.
- `POST /api/demo/events`: receber lotes limitados e allowlisted, com IDs idempotentes. Falha não interrompe a conversa.
- `POST /api/demo/feedback`: receber uma opção ou comentário não vazio; só confirmar após persistência. Comentário não é texto das respostas narrativas.

Na UI, `src/features/demo/services/api-client.ts` faz `fetch`; não importar adaptadores Firebase. O estado da conversa e a retrospectiva permanecem locais. Eventos servem observação; não decidem o enredo nem provam compreensão. Se o produto decidir não persistir sessão/telemetria remota no primeiro teste, esses endpoints podem ser implementados em lote posterior, mantendo sessão local e ficha humana.

Os limites de payload, idempotência, retenção e rate limits são propostas detalhadas em [DEMO.md](DEMO.md), ainda sem implementação. Antes de coletar dados de teste, definir responsável e prazo de retenção.

## Sequência de desacoplamento obrigatório

1. Extrair helper de sessão client de `AuthContext`; mover tipo de pagamento para contrato puro; consolidar bootstrap Admin.
2. Fazer `premium-access` depender apenas de identidade/entitlement; retirar progresso e currículo do caminho de pagamento e agenda.
3. Extrair voz/manifesto da rota `/api/speech` para ferramenta de produção independente do protótipo.
4. Migrar e exercitar contratos de auth, convite, checkout, webhook e Calendar nos caminhos novos mantendo as URLs.
5. Só então retirar `src/data`, autenticação visual antiga, `inicio-orbita`, curso, provas, dashboard, providers e APIs curriculares.

Aceitação: nenhum import de UI/currículo antigo em serviços preservados; Admin/Asaas/Calendar não entram no client bundle; rotas preservadas continuam retornando JSON e mantendo seus guardas; APIs aposentadas retornam JSON 410; nenhuma ação remota de migração de dados integra esta limpeza.

## Estado implementado no Lote 1

Os destinos acima agora existem, exceto `src/server/auth/service.ts`: o serviço original era browser SDK, por isso a extração mínima correta é `src/client/auth/service.ts`, e o servidor continua representado por principal/request-auth/convites/cookie. Não mover SDK browser para server-only. O serviço misto antigo será retirado com a UI.

`getAdminAuth()` e `getAdminDb()` são os únicos pontos de bootstrap do runtime Next. `/api/speech` já retorna JSON 410; produção explícita em `scripts/media-production/produce.mjs` usa o adaptador de voz. Ferramenta não executada nesta tarefa.

Agenda: contratos de leitura, pedido, cancelamento e decisão preservados. A chave histórica `userId_p2` e campos de origem ficam como compatibilidade de armazenamento/IDs do provedor; nenhuma consulta a provas, gravação de progresso ou exigência curricular permanece no serviço. Uma futura ação autorizada chama `releaseLiveSession({ userId })` no servidor antes de oferecer horários. A demo não chama esse serviço.

A sessão anônima/telemetria remota pode ser adiada conforme plano. Sem responsável e retenção definidos, a implementação inicial fica local e não afirma receber feedback remoto.

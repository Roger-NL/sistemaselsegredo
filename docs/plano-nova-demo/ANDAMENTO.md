# Execução da substituição

## Lote 0 — concluído em 23/10/2026

- Base recuperável: `b881b3e`, tag local `basedspeak-pre-demo-b881b3e`.
- Branch: `codex/nova-demo-cafe`; nenhum arquivo rastreado modificado na entrada.
- Materiais previamente não rastreados em `docs/`, `output/` e `tmp/` preservados.
- As 19 APIs presentes correspondem exatamente a `ROTAS.csv`. Destinos e métodos congelados nesse inventário; aliases browser somente para as URLs listadas, 307 sem query; aposentadoria de API em JSON 410, outros métodos 405.
- Baseline: 112 testes/9 arquivos, lint e TypeScript aprovados.
- `npm run build` falhou exclusivamente no download das três famílias Google Fonts (Geist, Geist Mono, Inter). Não houve consulta a integrações ou alteração de configuração para contornar a falha.
- Nenhum deploy, script operacional mutador, acesso a banco ou alteração externa.

## Execução autorizada

A instrução de execução desta conversa substitui as ressalvas de planejamento dos documentos originais. Narrativa, contratos e destinos permanecem aprovados. Os CSVs conservam o inventário-base; as colunas de execução registram resultados por lote sem apagar o histórico de destino.

## Próximo lote

Lote 1: separar integrações de currículo/UI, extrair sessão client e contratos puros, consolidar Admin e preservar produção de voz fora da rota pública.

## Lote 1a — bootstrap e contratos

- Bootstrap Firebase Admin único em `src/server/firebase.ts`, server-only e lazy; todos os consumidores usam getters. Credencial inválida falha sem imprimir conteúdo nem trocar silenciosamente de identidade. Nenhum acesso remoto executado.
- Sincronização POST/DELETE da sessão extraída para `src/client/auth/session.ts`, sem React, router ou inicialização de SDK. Provider antigo consome o helper enquanto aguarda a remoção no Lote 4.
- Contrato de `/api/verify-payment` em `src/contracts/payments.ts`; estado visual permanece temporariamente no consumidor antigo.
- Verificações: suite original mais testes de sessão e bootstrap; lint e TypeScript. Build continua sujeito à falha-base de fontes externas, sem nova tentativa neste sublote.

## Lote 1b — integrações desacopladas

- Auth/principal/convites/cookie em `src/server/auth`, HTTP em `src/server/http`, Asaas e Calendar em `src/server/integrations`, pagamentos e reservas em seus serviços server-only. Imports de consumidores migrados sem cópias legacy.
- Auth/perfil mínimos extraídos em `src/client/auth/service.ts`; SDK browser em `src/client/auth/firebase.ts`. O serviço misto antigo ainda atende UI antiga até Lote 4; não é dependência dos serviços preservados.
- Convites e pagamentos não consultam provas nem gravam progresso, streak ou desbloqueio de pilares. Sessão registra apenas horário de login.
- Agenda mantém IDs persistidos (`userId_p2`), metadados e contratos JSON existentes por compatibilidade, sem migrar dados. Não consulta provas nem libera reserva automaticamente. `releaseLiveSession` é operação server-only para futuro chamador autorizado; assinatura aceita metadados históricos. Sem sessão explicitamente liberada, status informa indisponibilidade. Locks, revisão de reserva e IDs idempotentes Calendar preservados.
- `/api/speech` GET passa a JSON 410. Adaptador ElevenLabs/Blob e ferramenta explícita de produção extraídos; nenhuma produção/upload executada. Cache remoto antigo permanece intacto e não é apresentado como biblioteca final.
- Novos testes revelaram parsing de body anterior ao guard em cancelamento/pedido de agenda; ordem corrigida e payload limitado/validado. Falta de autenticação retorna JSON 401 mesmo sem body.
- Fonte narrativa completa localizada: `output/pdf/BasedSpeak_Demo_Experiencia_Visual.pdf` (55 páginas). Os recortes de 22 páginas não substituem o roteiro.

## Lote 2 — demo local

- Catálogo literal em dez partes, reducer puro, histórico/transcript por ocorrência, ajuda, perfis, montagens/recombinações e três finais equivalentes. Preparação da Parte 2 não envia fala; respostas reais usam IDs próprios e guard contra cliques antigos.
- Snapshot versionado por replay de eventos validados preserva posição, perfil, blocos, ajuda, decisões, transcript e vista de conclusão/retrospectiva/avaliação. Não retoma áudio. Storage indisponível mantém execução em memória. Reinício limpa apenas as chaves da demo com confirmação.
- `/` e `/demo` independentes dos SDKs e providers antigos. Montagem por clique/teclado, foco por estado e sem arrastar obrigatório. Shell usa fontes do sistema, eliminando a dependência de Google Fonts no build.
- 128 combinações narrativas por perfil (384 percursos puros) cobertas; todos os nós alcançados, três finais, transcript sem duplicatas e recuperação integral. Suite nesta etapa: 149 testes; lint e TypeScript aprovados.
- Mídia final pendente conforme MIDIA.md. Player não gera mídia na visita. Referências conceituais explícitas; nenhum áudio marcado como reproduzido.
- Coleta remota adiada conforme opção aprovada no plano. Avaliação opcional guarda rascunho local por tentativa e informa que não houve envio. Endpoints `/api/demo/*` não são mocks de sucesso e ainda não existem.
- Build sem fontes avançou, mas o sandbox bloqueou o processo/porta interno do Turbopack (EPERM). Servidor de desenvolvimento local iniciado com permissão específica em 127.0.0.1:3100. Verificação de navegador em andamento; build será repetido com a permissão local adequada.

## Lote 3 — compatibilidade de URLs

- 22 padrões browser explícitos em `src/lib/page-aliases.ts`; proxy somente redireciona essas páginas para `/` com 307, descartando query. Desconhecidas passam ao roteador e continuam 404 após retirada das páginas.
- Seis APIs aposentadas retornam JSON 410 estável `API_RETIRED` em seus métodos originais. Não exportam handlers para outros métodos; Next mantém 405. APIs preservadas não são interceptadas.
- 157 testes aprovados, lint e TypeScript. Testes de URL cobrem aliases, legal/recursos/APIs/rotas desconhecidas e query sensível fictícia.

## Lote 4 — retirada do produto antigo

- Remoções revisadas pelo destino do manifesto, com verificação prévia de imports do grafo retido. Páginas/layouts de aluno/admin/auth/pagamento/agenda e órbita, providers, dados/regras curriculares, modelos, provas/progresso/ranking e UI antiga retirados. Sem cópia legacy ou rota escondida.
- AuthContext e serviço misto antigos removidos após extração das capacidades úteis. Ferramenta de voz preservada; hook de geração/reprodução antigo retirado.
- Fallbacks de erro/404 e botão reescritos antes da remoção dos componentes neon. CSS global antigo retirado junto com seus consumidores.
- Documentos, relatórios Lighthouse e scripts one-off listados para remoção retirados; nenhum script mutador foi executado. `output/` e `tmp/` preexistentes preservados.
- Testes de progresso, visitor-name e welcome retirados com suas implementações; teste de estado visual de pagamento substituído pela cobertura útil de parcelamento. Diferença no total de testes nesta etapa é intencional, não falha silencenciada.

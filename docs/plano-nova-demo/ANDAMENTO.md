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

## Lote 5 — recursos e configuração

- 13 assets antigos retirados; oito pacotes diretos sem consumidores removidos e lockfile atualizado offline, sem scripts de instalação/upgrade. Plataforma não atualizada.
- README, `.env.example`, manifest/robots/sitemap e legal reescritos para a demo real. Exemplo Calendar consolidado. Materiais locais em output/tmp preservados e ignorados no Git.
- CSP da entrada e `/demo` restringe imagem/mídia/conexão à própria origem (com websocket local em desenvolvimento). Capacidades reservadas não são importadas pela demo. Microfone e pagamento continuam negados por Permissions-Policy.
- `firestore.rules`, `firestore.indexes.json`, `firebase.json` e `.firebaserc` revisados sem alteração. As regras antigas exigem campos curriculares na criação pelo browser: a auth mínima agora estabelece sessão e cria perfil mínimo no servidor após verificar o token. Essa adaptação evita publicar regras e não migra documentos existentes; login de perfil existente atualiza somente timestamps. Testes usam mocks.
- Guard administrativo real consolidado; navegação futura usa `/` como fallback seguro e não aponta para dashboards retirados. Tipos/IDs históricos de reservas mantidos por compatibilidade, sem exigência curricular ou promessa de desbloqueio.
- O TypeScript após Lote 4 encontrou lixo sintático em `.next/dev/types/routes.d.ts` gerado durante exclusões; removido apenas esse diretório gerado com servidor parado. Typegen e TypeScript finais sem essa interferência. Build com permissão local compilou e revelou chamada residual do guard antigo; corrigida, nova execução em andamento.

- Verificação do Lote 5: 64 testes/14 arquivos, lint sem avisos, TypeScript e build de produção local aprovados. Nenhuma fonte externa necessária para o build.

## Pausa solicitada — revisão de experiência, identidade e áudio

Após o Lote 5, durante a verificação final, o responsável pediu explicitamente uma especificação aprovada antes de novas alterações de código. Também confirmou a mesma logo e cores do Orbit e mudou o requisito de áudio pronto para geração sob demanda com cache persistente global. Implementação pausada a partir dessa instrução.

A proposta está em [REVISAO-EXPERIENCIA-E-AUDIO.md](REVISAO-EXPERIENCIA-E-AUDIO.md). O Orbit publicado foi observado; logo/paleta conferidas também por leitura da base Git, sem restaurar arquivos removidos. Nenhuma geração, upload ou alteração remota foi feita.

Último commit estável: `c8fd65d` (64 testes, lint, TypeScript e build aprovados). Há mudanças locais anteriores à pausa em refinamentos de apoio/foco/player/reducer e testes novos, ainda sem commit final. A última suite em andamento teve 69 testes aprovados e uma falha no teste novo de reconciliação, na expectativa de contagem de chamadas do mock. Não declarar o Lote 6 concluído nem essas mudanças verificadas. Nenhuma correção de código será aplicada enquanto a revisão estiver aguardando aprovação.

O cache global solicitado agora **ainda não está implementado**; o adaptador atual é a extração de produção offline do plano anterior. Logo/paleta da prévia local ainda não foram trocadas para a identidade confirmada nesta revisão.

## Retomada aprovada em 23/10/2026

O responsável respondeu “comece”, aprovando REVISAO-EXPERIENCIA-E-AUDIO.md. A pausa foi encerrada. A falha do teste novo de reconciliação era isolamento do contador do mock entre testes; corrigida antes das novas alterações. Baseline da retomada: 70 testes/16 arquivos, lint e TypeScript aprovados. Refinamentos pendentes de apoio/foco/player e recuperação foram preservados; cache global e identidade entram nos próximos commits.

## Lote 6 — revisão aprovada implementada localmente

- Backend em `842e63d`: `POST /api/demo/audio` aceita somente IDs do catálogo, valida origem/payload, aplica rate limit persistente e falha sanitizada. O adaptador tem um único chamador de produção, o serviço de cache; gerador direto antigo desativado.
- Cache global SHA-256, texto NFC/espaços normalizados e parâmetros de síntese completos. Firestore `speech_audio_cache_v3` coordena reservas e tentativa única; Blob guarda MP3 imutável no caminho determinístico. Transações não chamam o provedor. Falhas após início preservam o contador e bloqueiam regeneração; arquivo já salvo pode ser reconciliado. Sem TTL/exclusão do ledger. Cache antigo preservado sem leituras.
- Frontend em `d91626b`: mesma marca de quatro barras e palavra BasedSpeak, paleta Orbit e Geist local aplicadas à composição própria da cafeteria. Histórico das falas reais permanece consultável; recolhido durante tentativa mental para não revelar Really automaticamente. Não houve restauração de UI/reducer/rotas Orbit.
- Áudio somente após clique, sem pré-geração/autoplay. Player único, pausa/retomada/parada e velocidade local 1×/0,9× sobre o mesmo arquivo. Mudança de etapa invalida pedidos/reprodução antigos. A preferência mais recente é respeitada mesmo durante preparação assíncrona. Erros não alteram o enredo nem exigem login/microfone.
- README, env de exemplo, mídia, contratos, legal e inventários atualizados. Avaliação remota e telemetria continuam desativadas; rascunho local sem confirmação falsa de envio.
- Verificação: **89 testes em 20 arquivos**, incluindo 384 percursos narrativos, contrato do catálogo, configuração sem fallback de voz, concorrência entre instâncias, reserva perdida, processo interrompido após início, falha ambígua, upload sem confirmação e recuperação de Blob. Lint e TypeScript sem avisos. Build de produção local aprovado; rodada final após ajustes do player também aprovada.
- Inspeção dos chunks públicos não encontrou `xi-api-key`, `ELEVENLABS_API_KEY`, `BLOB_READ_WRITE_TOKEN`, `firebase-admin`, URL do provedor ou coleções curriculares. Configuração Firebase/regras/índices permaneceu intocada.
- A abertura do navegador em `http://localhost:3100` foi recusada pela autorização do navegador nesta rodada. Nenhum contorno foi tentado. Portanto, a identidade foi conferida em código contra a referência anteriormente observada; **a conferência visual/interativa da versão final está pendente**. Não anexar capturas antigas como prova desta versão.
- Servidor local de verificação iniciado com os três valores de voz/Blob explicitamente vazios, para impedir chamadas pagas ou uploads. Nenhum serviço remoto consultado/alterado; nenhum deploy ou script operacional executado.

Pendências de prontidão pública: nove imagens finais; validação autorizada da voz/gravações e infraestrutura real; conferência visual no navegador; duração aproximada validada com participantes. Não declarar essas verificações como concluídas.

## Ativação real de áudio autorizada — 23/10/2026

O responsável solicitou explicitamente configurar o Blob e habilitar áudio, mantendo o cache global. Essa autorização específica substitui a restrição anterior de testes exclusivamente simulados para esta ativação.

- O projeto vinculado `novoessite` já possui o Blob público `basedspeak-speech-cache` ativo e credencial configurada no ambiente Production. Não foi criado outro store nem alterada configuração remota. A CLI renovou a sessão Vercel existente; o token do Blob foi sincronizado diretamente para `.env.local`, ignorado pelo Git e com permissões 0600, sem impressão de valores.
- Corrigida somente a representação local de `FIREBASE_SERVICE_ACCOUNT`: JSON canônico com aspas adequadas ao carregador de env, sem alterar identidade/chave. Blob e Firestore passaram nos checks reais de acesso.
- O preflight de leitura da voz retornou `missing_permissions` por restrição de leitura da chave; a operação de síntese permitida funcionou normalmente. Nenhuma permissão do provedor foi ampliada.
- Servidor reiniciado sem os overrides vazios de áudio. `POST /api/demo/audio` para C01 retornou 200/ready; MP3 persistido com 20.106 bytes, `audio/mpeg`, assinatura MP3 válida e download 200.
- Três pedidos concorrentes de replay receberam a mesma chave e o mesmo arquivo. O ledger real `speech_audio_cache_v3` registra `ready`, áudio persistido e `providerAttemptCount: 1`.
- Após novo reinício do servidor, outro pedido retornou a mesma chave e o contador permaneceu 1. Isso confirma persistência além da memória da Function/processo. Cache antigo e gravações existentes preservados.
- Evidência técnica sanitizada em `tmp/audio-activation-proof.json`, ignorada no Git. Nenhuma credencial foi adicionada ao código, documentação, cliente, URL pública ou Git. Não houve deploy, alteração de regras/índices ou mudança de permissões remotas. Apenas os registros operacionais necessários de cache/rate limit e o MP3 autorizado foram gravados.

C01 está validado com serviços reais. A revisão dos demais contextos de áudio e das artes finais continua pendente; o restante do catálogo usa o mesmo fluxo sob demanda. A suíte de 89 testes previamente aprovada permanece aplicável, sem alterações de código nesta ativação.

## Validação integral de áudio autorizada — 23/10/2026

Resultado em [VALIDACAO-AUDIO-COMPLETA.md](VALIDACAO-AUDIO-COMPLETA.md): 50 IDs, 46 MP3s únicos decodificados, 45 primeiras gerações novas (C01 já existia), nenhum erro de API e nenhuma geração adicional nos replays. Os quatro pares de textos iguais compartilharam a chave e o MP3, inclusive sob concorrência. Após reiniciar o servidor, todos os 46 arquivos mantiveram suas chaves e hashes; o ledger permaneceu ready, uma tentativa por chave, timestamps de início/fim imutáveis. Suite: 89 testes/20 arquivos aprovada. Nenhum contador foi resetado; arquivos/registro antigos preservados.

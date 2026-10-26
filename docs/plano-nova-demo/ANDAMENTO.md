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

## Ajuste solicitado: atividade na área visível da janela

O responsável enviou uma captura mostrando cabeçalho/controles/histórico ocupando a tela e solicitou não precisar rolar para alcançar a atividade. A alteração foi implementada após essa instrução:

- Shell da aplicação em `100dvh`, com linhas separadas para cabeçalho, aviso de prévia, área principal flexível e rodapé compacto. As imagens usam somente o espaço disponível; cabeçalho, áudio, pedidos e tipografia foram compactados. Barra de progresso ganhou renderização explícita preta para evitar a cor nativa verde.
- Histórico em diálogo nativo, uma fala por página, com significado, replay e anterior/próxima. Nenhuma fala foi removida do transcript; a revisão continua restrita ao percurso real e a tentativa mental mantém consulta explícita com apoio.
- Pistas em diálogo paginado, sem acrescentar a escada completa abaixo da montagem. Consulta de modelo, tentar sem modelo e usar com apoio preservados. Retrospectiva exibe um momento por vez; conversa completa usa o mesmo histórico paginado.
- Entrada mais curta preserva marca, gratuidade, duração aproximada, aviso de microfone dispensável e três escolhas de apoio sem pré-seleção. Feedback compacto, sem alterar seu rascunho nem ativar coleta.
- Foco das etapas usa preventScroll. Diálogos nativos mantêm Escape, foco contido e retorno ao controle de abertura. CSS mobile usa cena em faixa compacta. Em janelas excepcionalmente baixas (menos de 540px)/zoom extremo, mantém reflow acessível em vez de cortar controles. Páginas legais extensas ficam fora do frame de aplicação.
- A narrativa, o reducer, o catálogo e o serviço de cache não foram alterados. A suíte de 89 testes passou, assim como lint, TypeScript e build local.
- A inspeção visual foi tentada usando a aba local já aberta, mas uma permissão salva/gerenciada do navegador negou observar `http://localhost:3100`. Não houve tentativa de contorno. Alteração revisada em código e baseada na captura enviada; a confirmação de dimensões e interação no navegador permanece pendente. Não alegar medição de overflow nem anexar captura antiga como prova.

## Integração de 12 imagens e três experiências de apoio — 24/10/2026

Autorização explícita para integrar os PNGs aprovados e retomar os níveis, com solicitação adicional de arquivos ainda mais leves. Original aprovado: piloto 04 e sequências 02–12. Exportadas 24 variantes WebP, 640/960px, quality 48/effort 6; 449/907 KiB totais, contra 3.739 KiB das quatro referências antigas. Hashes dos originais preservados; manifesto e script reproduzível. Quadros distintos para copo inclinado/salvo, cansaço, convite, conversa, aprendizado e despedida. Fontes aprovadas intactas; quatro JPGs provisórios retirados de public. Nomes no roteiro, pistas e interface agora LUCAS/BASEDSPEAK, sem números antigos; personagem masculino e traduções corrigidas.

Níveis implementados em política pura de prática: modelo/montagem/reconhecimento no Guiado; estruturas parciais/peças/distratores no Com pistas; escrita local com contrações equivalentes no Mais autônomo. Escrita inválida preservada, sem punição; recuperação por peças e retorno à escrita; ajuda/modelo sempre acessíveis. Mudança de nível somente na próxima atividade; estado e replay locais versionados preservam a atividade atual. Transcript mantém grafia digitada aceita, mas ouvir usa o modelo aprovado, nunca entrada livre. Retrospectiva contabiliza ações observáveis.

Catálogo inglês intacto (SHA-256 verificado), IDs e parâmetros de síntese intactos, serviço de cache não alterado. Nenhum áudio gerado, dado remoto alterado ou deploy realizado nesta rodada. A história passa a cafe-v2 para não aplicar as regras novas a snapshots antigos; UI informa incompatibilidade sem executar eventos antigos silenciosamente.

Suite ampliada: 100 testes/21 arquivos aprovados, incluindo 384 percursos, práticas dos três perfis, escrita/contrações/rejeição sem mudança de sentido, mudança de perfil, recuperação de rascunho, segurança de recall/Careful, decode de todas as variantes WebP e orçamento de bytes. Lint, TypeScript e build local aprovados. Inspeção local de amostras/folha de contato; inspeção interativa de layout ainda pendente do acesso ao navegador.

## Conferência dos três níveis e sequência de imagens — 24/10/2026

Nova tentativa explícita de observar a aba Chrome em localhost:3100 foi negada por permissão salva/política gerenciada. Não foram usados caminhos alternativos para observar/renderizar a página. Teste interativo e medição de overflow permanecem pendentes.

Suíte ampliada para 101 testes/21 arquivos: os 384 percursos agora verificam também a ordem das dez cenas iniciais; V11 somente na escolha sobre aprender inglês; despedida V12 ao final. Caminhos sobre inglês usam as 12 imagens; caminhos sobre trabalho usam 11, sem ilustrar um assunto não escolhido. Teste específico associa 16 momentos/ramificações às imagens esperadas e restringe aviso/copo salvo às etapas corretas. Todas as 24 variantes decodificam. Guiado, Com pistas e Mais autônomo mantêm as verificações de resposta, ajuda e recuperação. Testes, lint e TypeScript aprovados.

Revisão estática encontrou a exceção já existente em max-height:540px: o frame permite rolagem para manter acesso aos controles em janelas muito baixas/zoom. Portanto não se declara que toda a UI está visível sem rolagem em qualquer dimensão. Nenhuma mudança visual sem medição foi aplicada nesta conferência.

## Ajustes para celular — 24/10/2026

Responsável pediu continuar sem revisão visual e priorizar mobile. Cabeçalho compacto com Áudio e Apoio em diálogos nativos (Escape/foco/retorno ao disparador), removendo a barra permanente de áudio e o popover de apoio. Progresso divide a faixa com dois disparadores. Pistas/histórico continuam paginados. Identificação do copo ao lado da ilustração, sem sobreposição sobre os nomes. Textos de apoio legíveis; alvos principais de 44–48px; blocos podem quebrar em telas estreitas. Entrada com seletores maiores e mensagens de recuperação dentro da mesma área para não criar uma linha adicional no grid do app.

Viewport inclui áreas seguras e solicita resizes-content para teclado onde suportado. Campos têm 16px para evitar zoom automático; tecla de envio indicada. Durante foco na escrita, a faixa da ilustração recolhe sem alterar rascunho/progresso. Rodapé mobile contém links legais compactos. Avaliação e retrospectiva receberam espaçamento mobile. Fallback de reflow em altura extrema permanece acessível. Não se afirma ausência de overflow sem medição; navegador não foi acessado por meio alternativo.

101 testes aprovados; lint e TypeScript aprovados. Nenhuma alteração no catálogo, parâmetros de voz, cache global, imagens ou regras dos níveis. A revisão interativa em aparelhos continua pendente, conforme instrução do responsável para seguir sem ela.

## Hierarquia da cena e revisão a partir das capturas — 24/10/2026

Responsável enviou capturas desktop/mobile e apontou início ambíguo: legenda sob a arte disputava a introdução, título dizia continua na primeira etapa, imagem mobile pequena e pedido chamativo permanente. Novo cabeçalho de situação acima do quadro em ambos os formatos. Primeira etapa: Um encontro na cafeteria; contexto apresenta o encontro e conduz à pergunta Is this yours?. Legenda duplicada e texto global sobre 12 cenas removidos. Parte/progresso preservados. Identificação do pedido agora é uma linha contextual apenas em V02/V04, sem cartão tomando largura da arte. Imagem ocupa uma faixa inteira maior no celular; não divide espaço horizontal com pedido. Foco de escrita mantém o recolhimento da imagem e remapeia a atividade para a segunda linha do grid.

Nome textual passa a based em minúsculas conforme grafia da solicitação; nome impresso nas imagens permanece intacto. Logo BasedSpeak preservado. Aviso de tentativa não recuperável compactado. Catálogo de inglês/áudio, cache e regras dos três níveis preservados. 101 testes, lint, TypeScript e build aprovados. Alteração guiada pelas capturas recebidas; sem alegar medição visual automatizada ou acesso ao navegador bloqueado.

## Coluna ilustrada completa e padrão compartilhado — 24/10/2026

Responsável pediu imagem preenchendo todo o lado esquerdo em computador/tablet e todos os textos à direita. Grade compartilhada por todas as cenas: imagem ocupa as duas linhas da coluna esquerda; situação e atividade ficam na direita. Acima de 760px a entrada também mostra arte à esquerda. Cover proporcional preenche o quadro, com enquadramento em 50%/60%, sem deformar a imagem nem modificar arquivos. Bordas podem ser recortadas no enquadramento para eliminar faixas vazias.

No celular, situação → imagem → fala/atividade. As linhas de texto e atividade recebem altura natural; a imagem usa o restante da área disponível em vez de reservar uma altura fixa igual para atividades curtas e longas. Faixa mínima é menor em janelas baixas; foco de escrita continua recolhendo arte. Falas consecutivas de Lucas compartilham um cartão; cada trecho mantém tradução conforme nível e botão de áudio independente. Catálogo, cache e parâmetros intactos.

101 testes, lint, TypeScript e build aprovados. Alterações guiadas pela captura fornecida; ausência de overflow em dimensões reais não foi medida. Preservado fallback acessível de reflow para janelas extremas; nenhuma tentativa de contornar bloqueio do navegador.

## Centralização automática da leitura — 24/10/2026

Responsável pediu centralizar verticalmente o conjunto inteiro da coluna direita quando curto, alinhando ao início quando longo. Grade desktop/tablet agora usa duas linhas automáticas consecutivas para situação/atividade, entre duas faixas flexíveis iguais com mínimo zero. O espaço livre se divide antes/depois do conjunto; quando falta espaço as faixas flexíveis colapsam, preservando acesso ao começo em vez de deslocá-lo para fora da área. Arte continua cobrindo a coluna esquerda inteira. Ordem e grade mobile permanecem intactas. Mudança só de CSS; sem nova geração de áudio ou alteração da história.

## Proteção compartilhada contra conteúdo fora da tela — 24/10/2026

Solicitação: mesmo padrão em todas as etapas e três níveis, principalmente celular. SceneFrame agora envolve todos os nós da conversa e mede introdução, conteúdo, ações e espaço disponível com ResizeObserver. Se o conjunto excede a área, passa a duas páginas de apresentação (Cena/Atividade). Não dispara eventos de história, não envia respostas e não muda nível. A instância se mantém entre fases da mesma atividade; peças, escolhas e escrita permanecem no reducer. Nova etapa reinicia na cena. Medidas de páginas ocultas são retidas; histerese evita alternância contínua perto do limite. A área de ações separada mantém Responder/Continuar/escolhas fora do conteúdo rolável. Formulário de escrita mantém Enter e botão externo associado pelo atributo form.

VisualViewport ajusta a altura do app para teclado e área visível; foco da escrita não é roubado durante paginação. Navegação recebe foco na página correspondente e mantém a ordem cena → atividade. Palavras longas e traduções podem quebrar linha. Diálogos preservam cabeçalho/fechar acessível; entrada preserva botão de começar fora da área longa de seleção. Retrospectiva/avaliação têm limites de altura e controles de conclusão protegidos. Em zoom extremo/conteúdo excepcional, rolagem interna ou reflow permanecem disponíveis em vez de cortar texto. Não há garantia física de todo o conteúdo simultâneo em qualquer altura.

107 testes/22 arquivos aprovados, incluindo os 384 percursos e seis verificações novas de decisão de paginação (celular curto/longo, teclado, desktop e histerese). Lint, TypeScript e build aprovados. Serviço de áudio, catálogo, parâmetros e cache intactos; sem geração remota. Inspeção interativa real continua pendente; implementação de medição pertence à própria UI, sem coleta remota ou tentativa de obter observação do navegador bloqueado.

## Correção: imagem e conversa sempre juntas — 24/10/2026

Responsável rejeitou explicitamente separar Cena/Atividade e pediu uma tela única, inclusive no celular. Removidos controle de páginas, estado de página, abas, regras data-paged e a ocultação da imagem ao focar a escrita. Frame agora adapta somente a densidade (confortável/compacta/justa), reduzindo espaçamentos e altura da faixa ilustrada de acordo com as medidas disponíveis. Arte e conversa permanecem montadas e visíveis juntas. Removida rolagem interna da conversa principal. Mantidos os controles em área própria; mensagem enviada usa uma linha mais compacta no celular sem retirar a resposta. Rascunhos, fases, níveis e áudio não foram alterados.

Quatro testes de densidade substituem os seis de paginação. 105 testes/22 arquivos passaram; lint, TypeScript e build aprovados. A revisão visual continua pendente; não é possível certificar encaixe em toda dimensão física ou zoom sem essa medição. Histórico, ajuda e áreas extensas de revisão permanecem acessíveis separadamente, conforme a estrutura anterior; não há páginas de Cena/Atividade no fluxo da história.

## Legibilidade e presença da imagem em todos os níveis — 24/10/2026

Responsável reforçou imagem grande, conversa junta, texto legível e botões acessíveis, solicitando nova tentativa de acesso. Navegador Chrome foi localizado e nova observação de localhost:3100 foi negada pela mesma política de permissão salva/gerenciada. Teste independente de internet pública acessou documentação W3C com sucesso; problema permanece na autorização da inspeção local. Não houve contorno.

Quadro compartilhado mantém imagem/conversa simultâneas. Piso da arte móvel elevado de 64 para 144px no modo mais compacto (160px intermediário/176px confortável). CSS de leitura agora prevalece sobre densidade: falas 18px, instruções 15px, traduções 14px, ações principais 16px e alvos de 44px. Instruções móveis concisas para etapas com texto repetido preservam situação e apoio; título deixa de ser repetido antes das opções de reconhecimento. Rótulos secundários curtos e toolbar Histórico/Ajuda evitam uma segunda linha desnecessária.

Falas consecutivas usam um cartão e reprodução em sequência dos mesmos IDs canônicos, sem sintetizar texto concatenado. Em densidades compactas, a resposta anterior sai apenas do cartão móvel e permanece no Histórico; a fala/reação atual continua visível. Aumento da área livre pela remoção do rodapé compacto não reinicia a densidade, prevenindo oscilação; apenas mudança real da viewport/fase reavalia do modo confortável.

105 testes/22 arquivos aprovados, incluindo 384 percursos e hash inglês preservado; lint, TypeScript e build aprovados. Fonte/imagens/áudio originais preservados, sem geração remota. Encaixe visual final em aparelhos continua pendente da permissão de observação; não é declarado como medido por estes testes de domínio e CSS.

## Entrada mobile com foto maior e CTA próximo — 24/10/2026

Captura do responsável mostrou a entrada com foto contida no centro de uma faixa estreita e um grande espaço vazio entre os níveis e Começar. Causa no CSS: altura curta fixa da arte + contain; entry-copy com height:100% e entry-reading flex:1 empurravam o CTA ao rodapé. Correção da entrada móvel: primeira linha flexível recebe a altura livre; segunda linha usa altura natural do texto/opções/botão. Arte usa cover proporcional na largura inteira. Removido crescimento artificial da área de texto; botão passa a ficar imediatamente após os níveis.

Texto de entrada mais conciso e descrições móveis específicas para os três perfis, mantendo descrições completas no desktop e no diálogo de apoio. Tipos: corpo/títulos de opção 16px e descrições 14px; alvos de 48–60px. Variantes para janelas baixas compactam espaçamento. Originais e WebPs intactos; regras de nível, histórico e voz intactos. Alteração guiada pela captura, sem afirmar inspeção automática do navegador. 105 testes, lint, TypeScript e build aprovados.

## Correção da resposta duplicada no início — 24/10/2026

Cinco capturas do responsável evidenciaram sequência modelo → treino com botão Responder → modelo ainda não enviado → modelo/treino novamente → reação. Causa no grafo: p2.prepare tinha preparationOnly e SUBMIT avançava a p2.meaning sem transmitir; depois p2.send exigia outro ciclo, com fase present no Guiado. A UI repetia o mesmo rótulo de modelo e usava Responder para uma montagem apenas preparatória. A suíte anterior validava essa separação, que não atendia à clareza da conversa.

Removidos três nós redundantes e a propriedade preparationOnly. Compreensão agora entra diretamente na única resposta p2.send; envio aceito grava U01 uma vez e entra na reação C02. Guiado mantém um modelo inicial; Com pistas mantém peças e Mais autônomo escrita. Rótulos agora distinguem Você pode dizer/Tentar responder de Enviar/Enviar com apoio. Imagens e textos ingleses/TTS intactos; nenhuma geração remota.

Versão cafe-v3 e migração local limitada de cafe-v2: envios reais e percursos completos preservados; treino parcial ou completo continua como rascunho, sem submissão implícita. Mudanças de apoio ambíguas nas telas removidas não são inferidas; snapshot original é preservado e entrada informa incompatibilidade. Cinco testes novos de recuperação e regressão do envio único nos três níveis; 110 testes/22 arquivos aprovados, incluindo 384 percursos, ordem das imagens e hash do catálogo de áudio. Lint, TypeScript e build aprovados. Revisão guiada pelas capturas e código; sem afirmar inspeção automatizada do navegador.

## Auditoria da continuidade completa — 24/10/2026

Revisadas as partes 3–10 e todos os ramos. Não havia outro ciclo de montagem preparatória sem envio como no início. Havia uma lacuna na aceitação do convite: U10 entrava em p8.topic sem fala de Lucas. Agora Nice! (C04 existente) responde imediatamente na mesma etapa de escolha do assunto, com V10 à mesa; sem tela extra. Responder ao convite substitui Sim, vamos, distinguindo a navegação para a atividade da resposta de fato.

Sete testes de regressão novos: convite nos três níveis e seis auditorias completas (três perfis × envio normal/com apoio). Cobrem 768 percursos com validações em cada resposta: preparação, conferência, ajuda e erro não enviam; aceitação envia uma fala e avança diretamente para Lucas; clique atrasado não reenvia. Último Bye encerra depois de You too. Bye! já dito por Lucas. Reutilizações em novas situações (por exemplo, Me too. e Not really.) mantidas como prática contextual.

117 testes/22 arquivos, lint, TypeScript e build aprovados. IDs/destinos de etapas, 12 imagens, catálogo de voz, cache e parâmetros de TTS preservados, sem geração remota. Testes de domínio, sem alegar inspeção visual em navegador.

## Início do áudio e indicador circular local — 24/10/2026

Responsável relatou 3–5 segundos para iniciar e pediu círculo ao lado de Ouvir, sem aviso no topo. Código fazia POST em cada repetição, rate limit → HEAD no Blob → transação com regravação de ready → download. Medição somente de leitura do C01 já existente: registro persistente 986ms na primeira consulta/220ms na segunda; HEAD 467/448ms; primeiros bytes no CDN 245/62ms. São amostras dos componentes, não medição de clique a som nem promessa de latência final.

Cache publicado agora resolve via leitura de metadados persistentes validados, sem HEAD nem regravação por acesso; API faz essa leitura em paralelo ao rate limit. Geração só começa depois de admitida a requisição. Ausência de ready mantém a mesma recuperação, transações de reserva, marcador de tentativa e Blob imutável. Metadados inválidos/indisponíveis falham fechados. Remoção externa de um MP3 resulta em erro de reprodução, sem regeneração. URLs de falas já resolvidas são reutilizadas na sessão como otimização adicional; o cache global continua sendo a autoridade.

AudioButton compartilhado em falas, modelos, ajuda, histórico e retrospectiva. Círculo de 18px com espaço reservado: preparação/buffering indeterminados; timeupdate/duration/ended controlam preenchimento, pausa conserva posição e fim fecha o círculo. Mensagens de estado ficam apenas para leitores de tela; erro breve fica junto ao disparador. Movimento reduzido respeitado. Removidos avisos visuais de áudio no topo. Um único controlador cancela áudio atrasado na mudança de etapa/fase ou remoção do disparador; velocidade continua local, sem TTS adicional. URLs de falas consecutivas resolvem concorrentemente, mas a primeira não espera todas as seguintes para tocar.

127 testes/22 arquivos, lint, TypeScript e build aprovados. Novas regressões cobrem metadados sem regravação/HEAD, bloqueio de geração sem admissão, cache de URL por sessão, progresso por eventos, pausa, buffering, falha e cancelamento de URL atrasada. Nenhuma chamada ao provedor ou alteração remota durante esta correção; consulta real apenas de leitura a arquivo existente. Não houve inspeção visual automatizada do navegador.

## Revalidação do áudio existente e do progresso — 24/10/2026

Responsável pediu testar início, círculo até o fim e reutilização em todas as etapas/mobile. Browser Use localizou a aba Chrome, mas negou observação por permissão salva; sem contorno. Verificador somente leitura usa o serviço real de metadados, o cliente de URL e os MP3s do CDN, com snapshots de geração antes/depois e sem importar provedor. Duas rodadas 50 IDs/46 arquivos decodificados e novas sessões em ordem inversa. Registros e hashes intactos, uma tentativa por arquivo, zero geração adicional.

Encontrada consulta redundante entre quatro pares de IDs com texto idêntico: cliente agora compartilha URL pela frase aprovada, preservando pontuação. Rodada final: resolução de URL mediana 270,649ms/P95 407,072ms; nova sessão máximo 545,261ms; replay mediano 0,015ms sem API adicional. A rodada inicial teve pico isolado de 10,675s; cinco rechecagens 0,191–0,904s. Medidas não são clique a som e não incluem HTTP/rate limit; inventário aquece a conexão. Detalhes e limites em VALIDACAO-AUDIO-COMPLETA.md.

129 testes/22 arquivos, lint, TypeScript e build aprovados. Novo teste percorre os áudios e sequências de todos os nós para validar progresso finito/monótono e término único em 100%. Outra regressão cobre pares de IDs e pontuação distinta. São eventos simulados do player, não revisão visual; confirmação em celular real segue pendente. Nenhuma geração, alteração do ledger ou deploy.

## Remoção da consulta lenta em sessão nova — 24/10/2026

Responsável pediu resolver o pico de 10s sem perder o cache global. Causa retirada do caminho de áudio publicado: índice versionado com referências públicas aos mesmos 50 IDs/46 MP3s persistentes, verificado contra chave de texto/configuração antes de entregar junto da página. A sessão nova não espera POST, Firestore, rate limit nem HEAD para tocar; só solicita o arquivo ao Blob. A API também retorna itens publicados antes de consultar banco. Não há síntese ou download automático na entrada. Ausência no índice mantém a API e admissão/lock global; configuração diferente não recebe referência antiga. Índice não é autoridade para gerar nem substitui o ledger.

Verificador remoto somente leitura ganhou --publish (escreve apenas JSON local após conferir ledger/bytes/hash/decode) e --indexed (proíbe o transporte da API nos testes de sessão). Duas sessões indexadas completas: zero consultas de metadados na reprodução, zero geração nova, registros imutáveis. Resolução inicial máxima 0,029ms, outra sessão máxima 0,087ms; CDN primeiro byte mediano 60,9ms/máximo 243,8ms. Referências somam 2.172 bytes gzip. Detalhes e limites em VALIDACAO-AUDIO-COMPLETA.md: resultados não são clique a som ou ensaio visual mobile.

137 testes/23 arquivos, lint, TypeScript e build aprovados. Configuração server-only separada sem mudar parâmetros. Testes de indisponibilidade do banco/API, validação de voz/modelo/formato/velocidade, índices inválidos, fallback protegido e ausência de credenciais públicas. HTML compilado confirma as 50 referências; nenhum secret nos arquivos públicos verificados. Originais, imagens, texto inglês, parâmetros e ledger preservados. Sem deploy.

## Voltar um avanço por clique — 25/10/2026

Adicionado Voltar ao lado de Recomeçar durante a conversa, desabilitado no início. Replay puro do journal encontra a última mudança de tela/nó, fase ou revisão e restaura o estado anterior a esse avanço; peças, digitação e pistas não contam como passos. Pode voltar sucessivamente até a Parte 1, inclusive após reload. Não usa histórico de URLs. O journal é truncado ao voltar; seguir por outra escolha descarta o futuro anterior, sem duplicar transcript/evidências. Rascunho e peças anteriores ao envio são restaurados. Snapshot continua compatível e não persiste comandos BACK.

Navegação dispara o reducer ativo e mantém cancelamento de áudio ao mudar de tela/fase. Nenhuma geração ou alteração do catálogo/cache. Ajustado somente o espaço entre ações do cabeçalho móvel. Quatro regressões novas cobrem os três níveis até o início, reload, envio/reenviar, fases e troca de ramo. 35 testes do motor, lint, TypeScript e build aprovados. Demais mudanças de hierarquia solicitadas para revisão posterior não foram antecipadas.

## Cartões de atenção nas partes 1–3 — 25/10/2026

Responsável pediu título impactante e leitura sequenciada antes da fala/opções. Implementados cartões únicos: título → contexto → Lucas/Is this yours? → orientação O que ele está perguntando? → compreensão. Parte 3 ganha orientação antes das intenções. Título grande, contexto com contraste/tamanho de mensagem principal, carta clara com borda escura e CTA único por avanço. Cartões não renderizam histórico/pistas/alternativas concorrentes; imagem permanece ao lado no desktop e acima no mobile. Fora desses cartões, orientação inicial também ganha contraste. Não se antecipou a reformulação das partes 4–10.

Versão cafe-v4 e migração de v3/v2, conservando posição e rascunhos sem enviar novamente. Voltar alcança os novos cartões. Os 50 IDs, textos em inglês, parâmetros, arquivos de voz e as 12 imagens são os mesmos. Sem acesso remoto, geração ou deploy. 146 testes/24 arquivos, lint, TypeScript e build aprovados: HTML renderizado confirma orientação sem fala/opções e revelação somente no avanço, além dos percursos e migrações. Verificação local de código/renderização; sem alegar inspeção visual do navegador.

## Largura e continuidade móvel — 25/10/2026

Captura recebida mostra cabeçalho, Apoio e cartão ultrapassando a borda direita. App/experiência passam a ter coluna explícita minmax(0,1fr), largura limitada e min-width:0 nos itens críticos. Cabeçalho e progresso móveis usam grades com trilha flexível limitada; ações curtas preservam alvos de 44px. Fieldset/cartão/atividade também podem encolher e quebrar texto. Removido overflow-x-hidden do body, que mascarava conteúdo maior que a janela. Não se adicionou ocultação horizontal para esconder ações.

Imagem móvel usa contain para mostrar personagens/copos completos; desktop mantém cover à esquerda. SceneFrame deixa de remontar a cada nó: a mesma ilustração permanece montada nas trocas entre título/contexto/fala, e a medição reinicia por nodeId+fase. Corrigido o cálculo de densidade para intro=0 intencional dos cartões; piso da imagem agora acompanha confortável/compacto/justo também na abertura. Ordem, níveis, Voltar, respostas e áudio preservados.

45 testes de layout/abertura/modelo aprovados, além de lint, TypeScript e build. Correção orientada pela captura e código; não se declara medição visual em dispositivo. Nenhum acesso remoto, geração de mídia ou deploy.

## Revisão após persistência do corte móvel — 25/10/2026

Nova captura confirma que a alteração anterior não resolveu o corte. Tentativa de observar a aba Chrome existente foi rejeitada pelo Browser Use por permissão salva/política gerenciada na origem localhost:3100. Não houve contorno nem captura automatizada alternativa.

O shell agora tem border-box explícito e largura limitada pelo menor valor entre o contêiner e a viewport visual, acompanhando resize/scroll da VisualViewport. O layout móvel crítico consulta a largura do próprio app; cabeçalho pode quebrar de linha em vez de ocultar Recomeçar. A imagem usa altura calculada pela proporção original 3:2, limitada pelo espaço necessário à orientação, conversa e ações. Removida a faixa flexível que criava grandes áreas vazias acima/abaixo da foto; cartão e CTA seguem próximos à cena. Mesmos componentes para os três níveis; história, mídias e cache de áudio preservados.

51 testes de layout/abertura/modelo, lint, TypeScript e build aprovados. Incluídas regressões para viewport visual mais estreita, arredondamento, ausência da API e dimensionamento da arte conforme conteúdo. Servidor local reiniciado com o build novo. Validação visual e medição real de overflow continuam pendentes; não se declara confirmação de todas as telas/dispositivos.

## Partes 3–10 sequenciadas e revisão visual no Chrome — 25/10/2026

Implementados cartões de situação, contexto, fala de Lucas e orientação antes de revelar a atividade. Intenções que já explicam a tarefa seguem diretamente para o modelo/atividade daquele nível, evitando repetir a instrução. A resposta correta abre imediatamente a reação de Lucas, incluindo Nice! e You too. Bye!, sem confirmação intermediária. Modelos, escolhas, peças, retomadas e escrita continuam distintos nos três perfis. Botões descrevem o próximo passo. Imagem permanece montada entre cartões da mesma cena. Voltar alcança cada cartão e restaura respostas; cafe-v5 conserva posição/rascunho de snapshots anteriores sem reenviar.

Após quatro capturas enviadas pelo responsável, o agente de design solicitado revisou proporção, hierarquia e capturas reais do resultado. Removidos borda preta superior e contorno de foco programático nos títulos (foco dos controles preservado). Cartões claros com borda suave, fala em escala moderada, contexto maior no celular, Ouvir em controle próprio e ações legíveis. Desktop limitado a 1200 px com arte 3:2 completa; mobile centraliza o conjunto verticalmente quando sobra espaço. Corrigido encolhimento da atividade que fazia botões encobrirem peças/feedback. Apoio cabe em 320 px. Retrospectiva tem ações separadas do conteúdo; os quatro momentos do percurso com pistas couberam em 320×568 sem rolagem após compactar espaçamentos.

Browser Use voltou a permitir a aba Chrome existente nesta sessão; não houve contorno da recusa antiga. Percorridas efetivamente as partes 3–10 nos três perfis, em caminhos selecionados: perguntas/desculpa, confirmação do copo, opiniões positiva/negativa, cansaço, inglês/trabalho, ficar/sair e despedida com/sem contato. Iniciante e menos apoio percorridos em 320×568 durante a implementação; percurso com pistas repetido até o fim com o estilo final (320×568, com comparação em 375×667). Após o ajuste estético, rechecados contextos, reação, escolhas e escrita compartilhados; não se afirma ter repetido todos os estados de todos os ramos após cada ajuste de CSS. Verificados erro com peças preservadas, montagem cheia, escrita inválida/fallback, ajuda/histórico, Voltar e reload. Reações apareceram diretamente após os envios corretos observados.

Dimensões móveis verificadas no navegador: 320×568, 375×667 e 441×957; tablet 834×1112 e desktop 1440×900 em estados representativos. Imagem e conversa juntas, personagens/copos completos, controles visíveis e sem rolagem nos estados da história conferidos. São viewports emulados no Chrome, não aparelhos físicos nem ensaio do teclado virtual. Capturas e medições locais em tmp/demo-visual-review (ignorado pelo git), incluindo desktop-nice-1440.jpg, mobile-nice-375.jpg e mobile-context-441.jpg. Agente de design confirmou a correção dos quatro problemas visuais nas capturas revisadas.

156 testes/25 arquivos, lint e build aprovados. Regressões percorrem os 384 caminhos do motor (128 por perfil), ordem dos cartões, reação imediata, renderização sem atividade concorrente, Voltar e snapshots. Isso não equivale a 384 percursos visuais. Preservados Lucas, based em minúsculas no texto, BASEDSPEAK nas 12 imagens aprovadas, textos/IDs/configuração de áudio e cache global; nenhum áudio gerado novamente, nenhuma mídia alterada e nenhum deploy.

## Seleção de apoio e controles no desktop — 25/10/2026

Responsável rejeitou a seleção comprimida e esclareceu que esta rodada é para computador. A abertura agora separa apresentação/arte à esquerda e decisão à direita; opções com 22 px de padding, intervalo de 14 px, títulos em 18 px e descrições em 14 px. Estado selecionado tem check e borda definida; input nativo preserva teclado, nome acessível e foco. Botão inicial proporcional ao conteúdo. Mantida a abertura móvel no mesmo fluxo, sem nova etapa obrigatória.

Ouvir passou a ter borda/fundo/padding no próprio button: a cápsula externa deixava área visual sem clique. Texto centralizado em 18 px nos cartões de fala; indicador de progresso posicionado sem deslocar o texto. Em desktop, ouvir fica centralizado no cartão de fala/modelo e os botões de avanço ficam centralizados abaixo dos cartões. Sem novas cores de destaque. Áudio, textos/configuração, cache global e regras da atividade preservados.

Chrome 1440×900: seleção dos três níveis por teclado, início da conversa, reprodução até ended, texto centralizado com diferença inferior a 0,01 px e hit test positivo nas quatro bordas internas do botão Ouvir. Botões Ver a pergunta e as opções e Tentar responder conferidos visualmente e com centros alinhados ao painel (diferença inferior a 0,01 px). O envio de clique de mouse pela automação teve timeout; não se afirma teste físico por mouse. Capturas em tmp/demo-visual-review. 156 testes/25 arquivos, lint e build aprovados. Servidor local aberto em localhost:3100; sem deploy.

Nova observação pedagógica registrada, sem implementação nesta rodada: mostrar a frase pronta e depois pedir sua montagem pode parecer cópia sem escuta conduzida. Responsável pediu primeiro terminar ajustes visuais e discutir a sequência antes de alterá-la; não foi imposto ouvir, ocultado modelo ou mudada a progressão de nenhum nível.

## Escutar → entender → responder — 25/10/2026

Responsável autorizou mudar a sequência pedagógica. Falas de Lucas agora abrem com escuta, sem texto em inglês, significado, opções ou avanço concorrente. O término real da sequência de áudio revela a frase e o avanço; clicar, carregar, pausar ou parar não libera a leitura. A primeira pergunta ouvida é reutilizada na compreensão da Parte 2, sem exigir outra escuta idêntica. Reações usam a mesma apresentação, inclusive Parte 2, sem confirmação entre envio e reação.

Iniciante: modelo de resposta começa só com áudio; depois aparecem frase e significado. Responder em inglês oculta o modelo e abre as peças/escolhas daquele exercício. Intermediário: preservados estruturas, peças e distratores, sem modelo completo obrigatório. Menos apoio: preservada escrita autônoma e ajuda opcional. Modelo completo da ajuda também fica oculto até a própria escuta. Careful mantém seu apoio comum aos perfis. Não foram mudados textos em inglês, áudios, configurações, imagens, cache global ou geração.

Conclusão vinculada ao controle que reproduziu a sequência inteira; eventos atrasados/duplicados são ignorados. Avanços de cartão em fila não pulam uma escuta pendente. Em falha de reprodução, há nova tentativa e alternativa explícita em texto, registrada como leitura, sem alegar escuta. Histórico não revela falas ainda não ouvidas/lidas. cafe-v6 persiste escuta/leitura e preserva Voltar, posição e rascunhos; migração de versões anteriores registra avanços antigos como leitura, nunca como áudio ouvido.

Chrome em origem de teste local separada (3101): abertura → escuta → compreensão → resposta → reação nos três perfis; modelo iniciante também na Parte 3; cenas posteriores até a Parte 6 no nível menos apoio, incluindo Careful e reação com dois áudios; ajuda completa opcional no nível menos apoio. Verificados erro de compreensão, pausa sem revelação, retomada até o fim, parar sem revelação, reload antes/depois de ouvir e Voltar entre escuta, leitura e atividade. Não foi feito novo percurso visual completo dos 384 ramos nem ensaio de falha de rede no navegador. Desktop 1440×900 e estado de escuta em 320×568 (arte, cartão e controle completos, sem overflow horizontal). Capturas listen-first-lucas-1440.jpg, listen-first-model-1440.jpg, listen-first-model-after-1440.jpg e listen-first-mobile-320.jpg em tmp/demo-visual-review.

162 testes/26 arquivos, lint e build aprovados. Novas regressões verificam ausência de frase/atividade antes de ouvir em todos os nós e perfis, revelação após conclusão, diferenças de apoio, modelo oculto durante resposta, eventos atrasados, Voltar, persistência e migração v5 sem falsa evidência de escuta. Áudios publicados reutilizados no navegador; nenhum novo arquivo de voz ou deploy.

## Intenção em português e tentativa com peças — 25/10/2026

Nova orientação do responsável substitui o modelo escrito após a escuta: a preparação mostra somente a intenção em português (por exemplo, “Não, não é meu.”). Ouvir reproduz a frase inglesa existente sem revelar sua escrita; Responder em inglês abre a atividade após a conclusão real do áudio. A intenção e o replay continuam disponíveis na atividade. Iniciante conserva preparação guiada e peças/escolhas; intermediário conserva estruturas e distratores; menos apoio conserva escrita autônoma e peças opcionais. Ajuda revela diretamente uma resposta possível somente por solicitação, sem preencher nem enviar a resposta. Sem dicas automáticas ou piscadas.

Nas montagens compartilhadas da demo, uma peça incorreta volta imediatamente às opções e preserva o prefixo correto. A cada terceiro erro, toda a montagem volta e o ciclo reinicia. Retirar uma peça devolve também o sufixo para não deixar uma sequência inválida. Implementação por clique e teclado; arraste não foi adicionado. Contagem persiste após reload. Eventos novos separam essas regras dos cliques antigos, que continuam replayáveis para preservar rascunhos v2–v6. cafe-v7 mantém posição, histórico, escutas e Voltar. Todos os nós de resposta usam a apresentação sequenciada, removendo a orientação repetida na Parte 2.

Chrome: preparação iniciante em 1440×900, sem resposta inglesa escrita antes/depois do áudio; montagem, três erros, Ajuda voluntária, reload e envio com reação imediata. Em 320×568, repetidos erro/terceiro erro na Parte 2 e montagem intermediária da Parte 3, inclusive prefixo correto, remoção e seleção por clique/teclado. Conferida escrita com menos apoio na Parte 4: erro mantém rascunho sem revelar modelo e peças são opcionais; regra de três erros também verificada nesse fallback. Corrigidos corte causado pela orientação duplicada e quebra das três peças intermediárias, mantendo alvos de 44 px. Estados intermediários e reinício finais medidos sem rolagem: ações até 564,1 px dentro de 568 px. Capturas portuguese-cue-1440.jpg e portuguese-bank-320.jpg em tmp/demo-visual-review. Esta rodada verificou amostras dos três níveis, não repetiu o percurso visual completo das partes 3–10 registrado anteriormente.

168 testes/27 arquivos aprovados, incluindo todos os bancos de resposta nos três perfis, retorno imediato, terceiro erro recorrente, remoção, persistência, compatibilidade e ausência de dicas automáticas. Lint, TypeScript e build aprovados. Não há outro motor de curso separado neste repositório: a regra foi aplicada ao motor compartilhado de todas as dez partes da demo. Mídias, frases inglesas, IDs, parâmetros e cache global de áudio preservados; nenhuma geração nova ou deploy.

## Conferência completa das partes 3–10 — 25/10/2026

Concluídos no Chrome dois caminhos complementares por perfil (iniciante, com pistas e menos apoio), desde a abertura até o encerramento. Cada etapa foi observada em 1440×900 e 320×568, alternando o tamanho sobre o mesmo estado. Os caminhos cobriram perguntar/acolher a desculpa, confirmar o copo, opiniões positiva/negativa, cansaço, inglês/trabalho, permanecer/sair e despedida com/sem contato. Reconferidas separadamente, nos três perfis, as duas variantes que a matriz indicou como ausentes: opinião positiva sobre a cafeteria e negativa sobre aprender inglês. Isso cobre os tipos de atividade e as variantes narrativas, sem alegar 384 combinações visuais independentes ou teste em aparelho físico.

Preparação de resposta manteve intenção em português antes e depois do áudio, sem modelo inglês escrito. Peças/opções aparecem na atividade; solução completa continua na Ajuda voluntária. Montagens com alternativa incorreta foram exercitadas até o terceiro erro e depois enviadas corretamente; reconhecimento passou por opção incorreta e correta; escrita passou por envio inválido, preservação do rascunho e resposta válida. Conferida entrada direta na reação após envio correto. O alerta comum da Parte 6 conserva intenção em português, áudio e ação Avisar. Níveis, história, Voltar e mídias preservados.

A revisão encontrou cortes móveis que as amostras anteriores não mostravam: alternativas do iniciante, despedida intermediária montada com quatro palavras e bancos com três trechos longos/distratores nas partes 9 e 10. Correções: alternativas de reconhecimento em duas colunas no mobile; aviso de erro mais curto; espaçamento menor nas peças montadas em densidade justa; intenção em português ocupando a linha inteira; Ouvir centralizado entre Histórico e Ajuda; bancos de três trechos em três colunas na densidade justa. Texto e altura mínima de 44 px das peças/envio preservados. Desktop conserva controles centrais e leitura conjunta com a imagem. Todos os grupos de corte foram reconferidos após as respectivas correções, incluindo partes 3, 4, 5, 8, 9 e 10; nenhum corte confirmado permaneceu nos estados finais reconferidos.

Roteiro e evidências mantidos em tmp/demo-visual-review/full-sweep (ignorado pelo git). Registros incluem observações repetidas e falhas antigas; não equivalem a casos independentes aprovados. Erros do roteiro e medições durante mudança de viewport foram separados de falhas reais. Após pausa solicitada pelo responsável, retomada por matriz de cobertura e saídas resumidas, sem mudar modelo nem suprimir casos. Capturas de referência final: some-A-113-contato-corrigido-completa-320.jpg e versão 1440.jpg, além da despedida e alternativas reconferidas.

168 testes/27 arquivos, lint, TypeScript e build aprovados para o código final; diff sem erros de whitespace. Sem geração de áudio/imagem, mudança do cache global ou deploy. Servidor principal local atualizado com o build verificado.

## Navegação temporária para testes — 26/10/2026

Adicionado Avançar ao lado de Voltar no cabeçalho, liberado antes de responder ou ouvir conforme pedido. Percorre cada cartão/escuta/atividade; nas decisões sem escolha usa a primeira alternativa (as opções normais continuam disponíveis). Pular uma resposta não cria fala do aluno nem evidência de acerto; pular áudio registra acesso por texto, nunca escuta. No encerramento, Avançar fica desabilitado. Voltar restaura o estado anterior, incluindo rascunho. Evento TEST_FORWARD isolado da navegação normal para posterior retirada da liberação de teste; a restrição futura por conclusão ainda não está ativa.

171 testes/28 arquivos, lint e build aprovados. Teste novo percorre as dez partes nos três perfis sem respostas, verificando persistência e retorno em cada avanço e ausência de respostas/escutas fictícias. Chrome: avanço/retorno de atividade sem enviar; cabeçalho conferido em 1440×900 e 320×568, sem overflow, com alvos de 44 px. No mobile Recomeçar usa ícone com nome acessível, mantendo Voltar e Avançar legíveis. Áudios e mídias preservados.

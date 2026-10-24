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

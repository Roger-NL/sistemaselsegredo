# BasedSpeak

Visão de evolução do produto: [curso por histórias e aprofundamento após a demo](docs/VISAO-GERAL-DO-PRODUTO.md). É uma direção em discussão; as etapas futuras ainda não estão implementadas.

Landing de inglês por histórias e demo pública de uma conversa em uma cafeteria. O fluxo principal é `/` → `/comecar` (conta gratuita com Google ou e-mail) → `/demo`. A conversa também permanece acessível diretamente, sem pagamento ou microfone. A pessoa escolhe seu apoio, participa de dez partes, percorre escolhas e recebe uma retrospectiva da conversa que realmente aconteceu.

A landing ocupa uma única tela, sem rolagem ou imagens da demo. Preserva a marca creme/preto, com composição tipográfica animada e amostra interativa isolada da tentativa real. “Dê uma espiada” abre um painel modal com mais informações e os três apoios; arrastar a página não revela novas seções. Animações podem ser pausadas e respeitam movimento reduzido. Fonte local, nenhuma mídia externa e ilhas pequenas de interação; o Firebase do navegador é carregado apenas na tela de conta. `/comecar` verifica uma sessão existente no servidor antes de abrir a demo. A autenticação reutiliza Firebase Auth e a API de sessão preservada, sem reativar `/login` ou `/cadastro`. Cadastro não sincroniza o estado local da conversa. Pesquisa e decisões: `docs/research-landing.md`, `docs/landing-visual-direction.md` e `docs/landing-ux.md`.

## Desenvolvimento local

Node.js 22 ou superior e npm. Use `npm ci`, `npm run dev` e abra `http://localhost:3000`. O motor local não exige credenciais. Os exemplos de integração estão em `.env.example`; não copie valores reais para o Git.

`npm test`, `npm run lint`, `npx tsc --noEmit --incremental false` e `npm run build` verificam a aplicação. Após remover rotas com um dev server aberto, pare o servidor e regenere os tipos (`npx next typegen`); arquivos em `.next` são artefatos regeneráveis.

## Estado da entrega

A conversa, os 128 caminhos narrativos, os três perfis, ajuda, retrospectiva e recuperação local estão implementados. As 12 imagens aprovadas de Lucas e BASEDSPEAK estão integradas, com variantes WebP de 640 e 960px (449/907 KiB no total por resolução); originais preservados em `output/image-tests/cafe`. O áudio sob demanda está habilitado localmente e os 50 IDs foram validados tecnicamente com ElevenLabs, Blob e Firestore reais: 46 MP3s únicos, todos decodificados, com reutilização concorrente e após reinício sem nova geração. A escuta editorial permanece separada. Os JPGs provisórios anteriores foram substituídos. Ver `docs/plano-nova-demo/MIDIA.md`. O layout foi percorrido no Chrome nos três perfis, com dois caminhos complementares por perfil e variantes adicionais das partes 3–10, em 1440×900 e 320×568. Os grupos de corte móvel encontrados foram corrigidos e reconferidos. Isso não substitui validação de duração com participantes nem teste em aparelho físico.

A sessão e o rascunho de avaliação ficam neste navegador. Storage indisponível não bloqueia a história. Recomeçar pede confirmação e limpa somente as chaves da demo. Não há sincronização entre dispositivos.

Coleta de eventos e envio de avaliação remotos estão desativados, conforme a opção aprovada de teste local + observação humana. O formulário não confirma recebimento. Responsável, contato e retenção devem estar definidos antes de implementar/ativar os endpoints de sessão, eventos e avaliação.

A interface usa a altura disponível da janela, com cena e atividade compactas. Um frame compartilhado mede o espaço de cada etapa e ajusta a densidade dos espaçamentos, sem separar Cena/Atividade e sem ocultar a imagem durante a escrita. Os controles de responder/continuar ficam separados do conteúdo. A arte mantém pelo menos 144px no celular, falas usam no mínimo 18px e instruções 15px; instruções móveis concisas evitam repetições. Em densidades compactas, a resposta anterior continua no Histórico e a fala atual permanece na tela. O teclado é acompanhado pela VisualViewport; a conversa principal não usa rolagem interna. No celular, Áudio e Apoio abrem diálogos próprios; os campos têm fonte de 16px e a altura do quadro ilustrado se adapta ao espaço disponível, mantendo imagem e conversa juntas. Áreas seguras do dispositivo são respeitadas e a identificação dos copos aparece junto da situação nas etapas de comparação. No celular, a situação vem antes da imagem. No computador e tablet acima de 760px, a imagem preenche a coluna esquerda e todos os textos ficam à direita. A primeira tela apresenta o encontro antes da fala em inglês. Histórico, pistas e retrospectiva são paginados para não acumularem conteúdo abaixo da atividade. A conferência visual final e seus limites estão registrados em `docs/plano-nova-demo/ANDAMENTO.md`.

Os três apoios mudam a atividade: **Guiado** usa preparação por áudio e montagem/reconhecimento; **Com pistas** usa estruturas incompletas e distratores; **Mais autônomo** começa pela escrita e permite recorrer às peças. A troca de perfil começa na próxima atividade e preserva o rascunho atual. A escrita é validada localmente e não é enviada ao TTS. A versão da história é cafe-v7: situação, contexto, escuta de Lucas, orientação e atividade têm uma ordem de leitura explícita nas dez partes. A preparação da resposta mostra a intenção em português; ouvir o modelo inglês não revela sua escrita. A solução completa fica na Ajuda voluntária. Peças incorretas retornam às opções; a cada terceiro erro, toda a montagem retorna. Não há dicas automáticas. O envio correto leva imediatamente à reação de Lucas.

Tentativas cafe-v2–v6 compatíveis são recuperadas sem repetir envios nem registrar leitura antiga como escuta. Recuperação ambígua informa incompatibilidade sem apagar o original. Voltar retorna um avanço por clique, incluindo os cartões e a escuta, preservando posição e rascunhos. A validação final inclui 168 testes em 27 arquivos, lint, TypeScript e build, além dos 50 IDs de áudio/46 MP3s existentes, com download e decodificação reais, índice compatível e nenhuma nova tentativa de geração.

## Áudio no servidor

A revisão aprovada em `docs/plano-nova-demo/REVISAO-EXPERIENCIA-E-AUDIO.md` define geração somente no servidor e cache global persistente. O servidor resolve texto e configuração, usa SHA-256 determinístico, coordena a tentativa por transação Firestore e salva MP3 imutável no Vercel Blob. Frases idênticas com os mesmos parâmetros compartilham o arquivo em todo o site. Abertura e retomada não geram nem baixam áudios; velocidade local reutiliza o arquivo.

Os 50 IDs/46 MP3s já existentes têm um índice versionado em `src/server/speech/published-catalog.json`, contendo somente chaves opacas e URLs públicas. Antes de entregá-lo com a página, o servidor compara cada chave ao texto e à configuração atual. Uma sessão nova começa a reprodução diretamente pelo arquivo no Blob, sem POST, banco ou rate limit no caminho de leitura; cerca de 2,12 KiB gzip de referências, sem pré-carregar os cinquenta MP3s. A API também serve entradas publicadas sem consultar o banco. Voz/configuração diferente não reutiliza o índice antigo.

IDs ausentes do índice enviam somente audioId para `POST /api/demo/audio`, mantendo o rate limit e a coordenação global antes de qualquer geração. A consulta ao registro persistente e a recuperação continuam disponíveis nesse caminho. O índice não substitui nem apaga o ledger; é uma referência aos mesmos arquivos globais já publicados. O indicador fica junto ao botão Ouvir: gira durante preparação/buffering, acompanha a reprodução e fecha o círculo ao terminar. Falhas aparecem junto ao botão e não disparam nova síntese. Se um MP3 for removido externamente, o download falha e o marcador persistente continua impedindo regeneração automática.

Para verificar os arquivos existentes e atualizar apenas o índice local: `node --experimental-transform-types --conditions=react-server scripts/media-production/verify-cached-audio.mjs --publish` (Node 24+/macOS). O comando exige registros ready, confere bytes/hashes e decodifica os MP3s antes de escrever o JSON; nunca gera frases ausentes. `--indexed` verifica novas sessões com acesso à API proibido e compara os registros antes/depois. São ferramentas manuais, fora do build e sem gravação remota.

São necessários `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `BLOB_READ_WRITE_TOKEN` e o Firebase Admin já documentado. Sem configuração, o texto continua funcionando. Segredos nunca são retornados ao cliente. Modelo `eleven_flash_v2_5`, MP3 `mp3_44100_128`, idioma inglês e síntese a `0.78`.

O ledger `speech_audio_cache_v3` não deve ter TTL nem ser apagado: após registrar o início de uma tentativa, uma falha incerta bloqueia nova geração automática da mesma chave. O serviço procura um Blob já salvo para recuperação. Essa política preserva o limite de custo mesmo após timeout ou reinício. O cache antigo permanece intacto e não é lido. Testes automáticos usam provedores simulados. Após autorização específica, todos os 50 IDs foram verificados: o ledger real registra uma única tentativa para cada um dos 46 textos únicos. Repetições entre IDs, concorrência e reinício reutilizaram os mesmos arquivos; ver `docs/plano-nova-demo/VALIDACAO-AUDIO-COMPLETA.md`. O token do Blob existente foi sincronizado somente para o arquivo local ignorado pelo Git.

## Código

- `src/features/demo/content/parts/`: roteiro aprovado em dez partes; `content/media.ts`: inventário de mídia.
- `src/features/demo/model/`: transições puras, histórico e retrospectiva. `session/`: persistência local versionada; nenhum Firebase no cliente da demo.
- `src/client/auth/`: SDK browser, perfil mínimo, navegação e sincronização de cookie para futuras telas autenticadas.
- `src/server/`: Firebase Admin lazy, autorização, convites, entitlement financeiro, pagamentos, reservas/locks e adaptadores Asaas, Calendar, ElevenLabs/Blob.
- `src/contracts/`: contratos compartilháveis sem SDKs. `src/app/api/`: URLs preservadas.
- `src/lib/page-aliases.ts` e `src/proxy.ts`: somente os 22 aliases inventariados respondem 307 para `/`, sem query. Rotas desconhecidas retornam 404. Seis APIs aposentadas respondem JSON 410 em seus métodos originais; outros métodos permanecem 405.

Nenhuma tela ou modelo de aluno/admin, currículo, prova, ranking ou motor órbita foi arquivado dentro do produto.

## Integrações reservadas

O detalhe está em `docs/plano-nova-demo/INTEGRACOES.md`. Handlers protegidos verificam identidade e papel no servidor; o proxy não autoriza acesso. Uma tela futura deve importar um helper específico ou chamar a API apropriada, sem trazer credenciais/SDK Admin para o browser.

A sessão cria um perfil mínimo após verificar o token Firebase. Não escreve progresso ou streak. As regras/índices locais antigos foram revisados e preservados; sua publicação não faz parte desta mudança. A criação mínima de perfil passa pelo servidor, sem depender das regras curriculares antigas de criação pelo browser.

A agenda mantém identificadores/metadados históricos para não duplicar reservas. Nenhuma aprovação de prova é consultada. Uma operação server-only autorizada chama `releaseLiveSession({ userId })`; então o cliente autenticado pode consultar disponibilidade/pedir um horário. Os locks, revisões e IDs determinísticos do Calendar permanecem.

Os scripts `scheduling:health`, `payments:audit` e `auth:admins` são operacionais e podem consultar/alterar serviços externos. Não fazem parte do build nem foram executados nesta substituição. O antigo caminho direto de produção de voz em `scripts/media-production/produce.mjs` foi desativado para impedir geração fora do cache compartilhado.

## Plano e recuperação

`docs/plano-nova-demo/ANDAMENTO.md` registra commits/lotes e verificações; `ARQUIVOS.csv` e `ROTAS.csv` mantêm o inventário-base e o resultado de execução. A base anterior é o commit `b881b3e`, com tag local `basedspeak-pre-demo-b881b3e`.

Não houve deploy, publicação de regras/índices, migração/exclusão de dados remotos, alteração de credenciais ou mudança de configuração externa.

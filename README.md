# BasedSpeak

Visão de evolução do produto: [curso por histórias e aprofundamento após a demo](docs/VISAO-GERAL-DO-PRODUTO.md). O primeiro estudo da cafeteria está implementado em `/demo/estudo`; o curso com outras histórias permanece em discussão.

Depois da retrospectiva, “Entender minha conversa” abre oito blocos com 24 práticas de compreensão, montagem e escrita curta. Explicações e aprofundamento opcional cobrem o inglês da cafeteria; a consulta reúne expressões de todos os caminhos, identificando as presentes na tentativa local. Progresso de estudo e conversa é salvo na conta autenticada, em snapshots separados, com sincronização no servidor. Áudio usa somente referências publicadas existentes, sem endpoint de síntese. Pesquisa, prompt editorial e limites: [Teoria e pedagogia](docs/TEORIA-PEDAGOGIA.md).

O fluxo principal é `/` → `/comecar` → `/dashboard` → `/demo`. Cadastro, Google, e-mail/senha e recuperação usam autenticação real. Contas novas ficam pendentes até aprovação; o painel e o contato com professor permanecem disponíveis. O dashboard reúne história, avanço, atividades e conversas com professor, com dados da própria conta. A história da cafeteria mantém os três apoios e os caminhos existentes. Detalhes: [dashboard](docs/DASHBOARD.md).

A área administrativa está em `/adm`, com login separado em `/adm/entrar` e claim de manager validada no servidor. Lista e métricas usam contas reais de Firebase Auth; criação, edição, aprovação, suspensão, resets, histórico e respostas ao aluno usam a mesma base do dashboard. Não há modo visual nem dados de exemplo no produto. A aba **Alunos** reúne a etapa de cada pessoa, as práticas concluídas e a aula, com filtros e atalhos para conta, mensagens e agendamento. Contratos, medidas de progresso e funcionamento: [Administração](docs/ADMINISTRACAO.md).

A landing preserva sua composição tipográfica e o painel de informações. As credenciais passam pelo SDK Firebase e pela confirmação da sessão no servidor; progresso antigo anônimo não é importado silenciosamente para contas. A avaliação final da conversa pode ser enviada ao professor pelo contato persistido.

A aula gratuita da cafeteria aparece em **Minha aula ao vivo** no painel: concluir as 24 práticas do estudo libera a agenda. Pedidos e confirmações são persistidos e acompanhados em **ADM → Agenda**, com uma aula por conta e proteção contra reservas concorrentes. Funcionamento e limites: [Aula ao vivo](docs/AULA-AO-VIVO.md).

## Desenvolvimento local

Node.js 22 ou superior e npm. Use `npm ci`, `npm run dev` e abra `http://localhost:3000`. As rotas autenticadas exigem a configuração Firebase válida; o motor puro da história continua testável sem credenciais. Os exemplos de integração estão em `.env.example`; não copie valores reais para o Git.

`npm test`, `npm run lint`, `npx tsc --noEmit --incremental false` e `npm run build` verificam a aplicação. Após remover rotas com um dev server aberto, pare o servidor e regenere os tipos (`npx next typegen`); arquivos em `.next` são artefatos regeneráveis.

## Estado da entrega

A conversa, os 128 caminhos narrativos, os três perfis, ajuda, retrospectiva e recuperação local estão implementados. As 12 imagens aprovadas de Lucas e BASEDSPEAK estão integradas, com variantes WebP de 640 e 960px (449/907 KiB no total por resolução); originais preservados em `output/image-tests/cafe`. O áudio sob demanda está habilitado localmente e os 50 IDs foram validados tecnicamente com ElevenLabs, Blob e Firestore reais: 46 MP3s únicos, todos decodificados, com reutilização concorrente e após reinício sem nova geração. A escuta editorial permanece separada. Os JPGs provisórios anteriores foram substituídos. Ver `docs/plano-nova-demo/MIDIA.md`. O layout foi percorrido no Chrome nos três perfis, com dois caminhos complementares por perfil e variantes adicionais das partes 3–10, em 1440×900 e 320×568. Os grupos de corte móvel encontrados foram corrigidos e reconferidos. Isso não substitui validação de duração com participantes nem teste em aparelho físico.

A sessão usa cookie HTTP-only e o progresso é associado ao UID no servidor. Recomeçar pede confirmação e substitui somente a tentativa da história da conta. Resets administrativos incrementam a revisão para impedir que abas antigas restaurem o avanço anterior.

Atividades de aprendizagem, decisões administrativas e mensagens ao professor são registradas na conta. O envio da avaliação final confirma sucesso somente após persistência. Não há telemetria de terceiros nova nem envio de respostas para síntese de voz.

A interface usa a altura disponível da janela, com cena e atividade compactas. Um frame compartilhado mede o espaço de cada etapa e ajusta a densidade dos espaçamentos, sem separar Cena/Atividade e sem ocultar a imagem durante a escrita. Os controles de responder/continuar ficam separados do conteúdo. A arte mantém pelo menos 144px no celular, falas usam no mínimo 18px e instruções 15px; instruções móveis concisas evitam repetições. Em densidades compactas, a resposta anterior continua no Histórico e a fala atual permanece na tela. O teclado é acompanhado pela VisualViewport; a conversa principal não usa rolagem interna. No celular, Áudio e Apoio abrem diálogos próprios; os campos têm fonte de 16px e a altura do quadro ilustrado se adapta ao espaço disponível, mantendo imagem e conversa juntas. Áreas seguras do dispositivo são respeitadas e a identificação dos copos aparece junto da situação nas etapas de comparação. No celular, a situação vem antes da imagem. No computador e tablet acima de 760px, a imagem preenche a coluna esquerda e todos os textos ficam à direita. A primeira tela apresenta o encontro antes da fala em inglês. Histórico, pistas e retrospectiva são paginados para não acumularem conteúdo abaixo da atividade. A conferência visual final e seus limites estão registrados em `docs/plano-nova-demo/ANDAMENTO.md`.

Os três apoios mudam a atividade: **Guiado** usa preparação por áudio e montagem/reconhecimento; **Com pistas** usa estruturas incompletas e distratores; **Mais autônomo** começa pela escrita e permite recorrer às peças. A troca de perfil começa na próxima atividade e preserva o rascunho atual. A escrita é validada localmente e não é enviada ao TTS. A versão da história é cafe-v7: situação, contexto, escuta de Lucas, orientação e atividade têm uma ordem de leitura explícita nas dez partes. A preparação da resposta mostra a intenção em português; ouvir o modelo inglês não revela sua escrita. A solução completa fica na Ajuda voluntária. Peças incorretas retornam às opções; a cada terceiro erro, toda a montagem retorna. Não há dicas automáticas. O envio correto leva imediatamente à reação de Lucas.

Tentativas cafe-v2–v6 compatíveis são recuperadas sem repetir envios nem registrar leitura antiga como escuta. Recuperação ambígua informa incompatibilidade sem apagar o original. Voltar retorna um avanço por clique, incluindo os cartões e a escuta, preservando posição e rascunhos. A validação final inclui 168 testes em 27 arquivos, lint, TypeScript e build, além dos 50 IDs de áudio/46 MP3s existentes, com download e decodificação reais, índice compatível e nenhuma nova tentativa de geração.

A navegação temporária de teste foi retirada: o cabeçalho mantém Voltar e Recomeçar; continuar exige as ações da própria atividade. Em falha de áudio, a alternativa textual permanece disponível e não conta como escuta. `TEST_FORWARD` é recusado nas ações atuais e preservado somente no replay de tentativas antigas, sem criar respostas ou evidências. Voltar conserva a regra existente: restaura o estado anterior ao avanço e descarta a continuação posterior, permitindo mudar de ramo sem duplicar envios. Uma tentativa antiga sem respostas recebe uma retrospectiva vazia explícita. Ver a etapa 2 em `docs/plano-nova-demo/ANDAMENTO.md`.

A conferência integrada da etapa 3 cobre os três apoios, ramos complementares, retomada e ligação painel → conversa → retrospectiva → estudo. Os destaques preservam a escrita realmente enviada, identificam apoio quando registrado e chamam a reprodução canônica de uma resposta escrita de “Ouvir modelo”. Matriz e limites da validação local em `docs/plano-nova-demo/ANDAMENTO.md`; essa conferência não substitui as etapas de conta real, aprovação editorial de mídia ou aparelhos físicos.

A etapa 4 revisou os oito blocos e validou erro/acerto nas 24 práticas do estudo. Nova tentativa reinicia a consulta ao modelo daquela tentativa; um acerto posterior sem nova consulta atualiza o progresso. A conclusão descreve o percurso realizado, sem inferir aprendizagem. 267 testes em 41 arquivos, lint, TypeScript e build aprovados; matriz, percursos no Chrome e limites em [Teoria e pedagogia](docs/TEORIA-PEDAGOGIA.md). Alterações locais, sem novo commit ou deploy.

A etapa 5 revalidou os 50 IDs e os 46 MP3s existentes: downloads, decodificação e identidade aprovados; tamanhos iguais aos metadados e SHA-256 iguais aos arquivos originais locais. O ledger atual não informa checksum. Campos auditados do ledger e arquivos originais preservados, sem geração. 44 testes de áudio/cache aprovados. Pronúncia, naturalidade e correspondência audível permanecem pendentes, conforme a decisão de Roger. Matriz e limites em [Validação de áudio](docs/plano-nova-demo/VALIDACAO-AUDIO-COMPLETA.md); nenhum commit ou deploy nesta rodada.

A etapa 6 documenta a reativação original do acesso real e uma publicação intermediária de prévia visual. A integração atual de aluno/gestão substitui aquela prévia: Google e e-mail/senha autenticam de verdade, os perfis novos começam pendentes e a recuperação usa o Firebase. Progresso e contato são persistidos na conta. Os registros de etapas anteriores permanecem como histórico em [ANDAMENTO](docs/plano-nova-demo/ANDAMENTO.md).

## Áudio no servidor

A revisão aprovada em `docs/plano-nova-demo/REVISAO-EXPERIENCIA-E-AUDIO.md` define geração somente no servidor e cache global persistente. O servidor resolve texto e configuração, usa SHA-256 determinístico, coordena a tentativa por transação Firestore e salva MP3 imutável no Vercel Blob. Frases idênticas com os mesmos parâmetros compartilham o arquivo em todo o site. Abertura e retomada não geram nem baixam áudios; velocidade local reutiliza o arquivo.

Os 50 IDs/46 MP3s já existentes têm um índice versionado em `src/server/speech/published-catalog.json`, contendo somente chaves opacas e URLs públicas. Antes de entregá-lo com a página, o servidor compara cada chave ao texto e à configuração atual. Uma sessão nova começa a reprodução diretamente pelo arquivo no Blob, sem POST, banco ou rate limit no caminho de leitura; cerca de 2,12 KiB gzip de referências, sem pré-carregar os cinquenta MP3s. A API também serve entradas publicadas sem consultar o banco. Voz/configuração diferente não reutiliza o índice antigo.

IDs ausentes do índice enviam somente audioId para `POST /api/demo/audio`, mantendo o rate limit e a coordenação global antes de qualquer geração. A consulta ao registro persistente e a recuperação continuam disponíveis nesse caminho. O índice não substitui nem apaga o ledger; é uma referência aos mesmos arquivos globais já publicados. O indicador fica junto ao botão Ouvir: gira durante preparação/buffering, acompanha a reprodução e fecha o círculo ao terminar. Falhas aparecem junto ao botão e não disparam nova síntese. Se um MP3 for removido externamente, o download falha e o marcador persistente continua impedindo regeneração automática.

Para verificar os arquivos existentes e atualizar apenas o índice local: `node --experimental-transform-types --conditions=react-server scripts/media-production/verify-cached-audio.mjs --publish` (Node 24+/macOS). O comando exige registros ready, confere bytes/hashes e decodifica os MP3s antes de escrever o JSON; nunca gera frases ausentes. `--indexed` verifica novas sessões com acesso à API proibido e compara os registros antes/depois. São ferramentas manuais, fora do build e sem gravação remota.

São necessários `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `BLOB_READ_WRITE_TOKEN` e o Firebase Admin já documentado. Sem configuração, o texto continua funcionando. Segredos nunca são retornados ao cliente. Modelo `eleven_flash_v2_5`, MP3 `mp3_44100_128`, idioma inglês e síntese a `0.78`.

O ledger `speech_audio_cache_v3` não deve ter TTL nem ser apagado: após registrar o início de uma tentativa, uma falha incerta bloqueia nova geração automática da mesma chave. O serviço procura um Blob já salvo para recuperação. Essa política preserva o limite de custo mesmo após timeout ou reinício. O cache antigo permanece intacto e não é lido. Testes automáticos usam provedores simulados. Após autorização específica, todos os 50 IDs foram verificados: o ledger real registra uma única tentativa para cada um dos 46 textos únicos. Repetições entre IDs, concorrência e reinício reutilizaram os mesmos arquivos; ver `docs/plano-nova-demo/VALIDACAO-AUDIO-COMPLETA.md`. O token do Blob existente foi sincronizado somente para o arquivo local ignorado pelo Git.

## Código

- `src/features/demo/content/parts/`: roteiro aprovado em dez partes; `content/media.ts`: inventário de mídia.
- `src/features/demo/model/`: transições puras, histórico e retrospectiva. `session/`: replay versionado e snapshots vinculados à conta pelo workspace; nenhum SDK Admin no cliente da história.
- `src/client/auth/`: SDK browser, acesso por e-mail/senha, perfil mínimo e sincronização do cookie verificado.
- `src/server/`: Firebase Admin lazy, autorização, convites, entitlement financeiro, pagamentos, reservas/locks e adaptadores Asaas, Calendar, ElevenLabs/Blob.
- `src/contracts/`: contratos compartilháveis sem SDKs. `src/app/api/`: URLs preservadas.
- `src/lib/page-aliases.ts` e `src/proxy.ts`: os 21 aliases ainda aposentados respondem 307 para `/`, sem query. `/dashboard` foi reativada para o novo painel, com sessão Firebase validada; não restaura o curso antigo. Rotas desconhecidas retornam 404. Seis APIs aposentadas respondem JSON 410 em seus métodos originais; outros métodos permanecem 405.

As telas antigas de currículo, provas, ranking e motor órbita continuam fora do produto; as áreas atuais de aluno e administração foram construídas sobre os contratos de workspace.

## Integrações de plataforma

O detalhe está em `docs/plano-nova-demo/INTEGRACOES.md`. Handlers protegidos verificam identidade e papel no servidor; o proxy não autoriza acesso. As telas de aluno e administração chamam APIs específicas, sem trazer credenciais/SDK Admin para o browser.

A sessão cria um perfil mínimo após verificar o token Firebase. Não escreve progresso ou streak. As regras Firestore foram publicadas com autorização por claims, perfil criado no servidor e negação por padrão; índices existentes foram preservados. A criação mínima de perfil passa pelo servidor, sem depender das regras curriculares antigas de criação pelo browser.

A agenda mantém identificadores/metadados históricos para não duplicar reservas. Nenhuma aprovação de prova é consultada. Uma operação server-only autorizada chama `releaseLiveSession({ userId })`; então o cliente autenticado pode consultar disponibilidade/pedir um horário. Os locks, revisões e IDs determinísticos do Calendar permanecem.

Os scripts `scheduling:health`, `payments:audit` e `auth:admins` são operacionais e podem consultar/alterar serviços externos. Não fazem parte do build nem foram executados nesta substituição. O antigo caminho direto de produção de voz em `scripts/media-production/produce.mjs` foi desativado para impedir geração fora do cache compartilhado.

## Plano e recuperação

`docs/plano-nova-demo/ANDAMENTO.md` registra commits/lotes e verificações; `ARQUIVOS.csv` e `ROTAS.csv` mantêm o inventário-base e o resultado de execução. A base anterior é o commit `b881b3e`, com tag local `basedspeak-pre-demo-b881b3e`.

A solicitação de 27/10/2026 autoriza consolidar as etapas na branch principal existente, `master`, e publicar no projeto Vercel original. Os registros anteriores de “sem commit ou deploy” descrevem o encerramento de cada etapa antes dessa autorização. A integração atual publicou as regras de acesso e configurou a claim de manager do titular indicado. Credenciais não entram no Git; dados financeiros, índices existentes e cache de áudio permanecem preservados.

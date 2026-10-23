# BasedSpeak

Demo pública de uma conversa em uma cafeteria. Sem login, conta, pagamento ou microfone. A pessoa escolhe seu apoio, participa de dez partes, percorre escolhas e recebe uma retrospectiva da conversa que realmente aconteceu.

## Desenvolvimento local

Node.js 22 ou superior e npm. Use `npm ci`, `npm run dev` e abra `http://localhost:3000`. O motor local não exige credenciais. Os exemplos de integração estão em `.env.example`; não copie valores reais para o Git.

`npm test`, `npm run lint`, `npx tsc --noEmit --incremental false` e `npm run build` verificam a aplicação. Após remover rotas com um dev server aberto, pare o servidor e regenere os tipos (`npx next typegen`); arquivos em `.next` são artefatos regeneráveis.

## Estado da entrega

A conversa, os 128 caminhos narrativos, os três perfis, ajuda, retrospectiva e recuperação local estão implementados. As nove imagens finais ainda estão pendentes. O áudio sob demanda está habilitado localmente e os 50 IDs foram validados tecnicamente com ElevenLabs, Blob e Firestore reais: 46 MP3s únicos, todos decodificados, com reutilização concorrente e após reinício sem nova geração. A escuta editorial permanece separada. As quatro artes de apresentação são referências conceituais explicitamente identificadas. Ver `docs/plano-nova-demo/MIDIA.md`. Ainda não declarar a prévia pronta para publicação.

A sessão e o rascunho de avaliação ficam neste navegador. Storage indisponível não bloqueia a história. Recomeçar pede confirmação e limpa somente as chaves da demo. Não há sincronização entre dispositivos.

Coleta de eventos e envio de avaliação remotos estão desativados, conforme a opção aprovada de teste local + observação humana. O formulário não confirma recebimento. Responsável, contato e retenção devem estar definidos antes de implementar/ativar os endpoints de sessão, eventos e avaliação.

## Áudio no servidor

A revisão aprovada em `docs/plano-nova-demo/REVISAO-EXPERIENCIA-E-AUDIO.md` substitui a biblioteca estática de voz. Ao clicar em Ouvir, o cliente envia somente um ID permitido para `POST /api/demo/audio`. O servidor resolve texto e configuração, usa SHA-256 determinístico, coordena a tentativa por transação Firestore e salva MP3 imutável no Vercel Blob. Frases idênticas com os mesmos parâmetros compartilham o arquivo em todo o site. Abertura e retomada não geram áudio; velocidade local reutiliza o arquivo.

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

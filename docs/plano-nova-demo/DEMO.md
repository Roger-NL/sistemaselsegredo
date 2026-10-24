# Projeto técnico da demo pública

## Correção do início — cafe-v3, 24/10/2026

Esta revisão prevalece sobre a sequência preparatória descrita nas versões anteriores. Depois de `p2.question`, o roteiro vai diretamente para `p2.send`: Guiado apresenta o modelo uma vez e permite montar; Com pistas começa na montagem; Mais autônomo começa na escrita. Um envio correto passa diretamente a `p2.reaction` (Oh! Sorry!), com U01 registrado uma única vez. Não existem telas separadas p2.model/p2.prepare/p2.meaning nem montagem preparationOnly. O rótulo do modelo é Você pode dizer; Tentar responder abre o exercício e Enviar envia de fato. Ajuda completa oferece Enviar com apoio.

Recuperação cafe-v2 filtra telas antigas e mantém envios reais. Quando só havia treino parcial, mantém rascunho/peças sem inventar um envio. Mudanças de apoio em etapas removidas que não possam ser reproduzidas com segurança resultam em incompatibilidade, preservando o snapshot original. Story version cafe-v3 mantém o mesmo catálogo de voz e as 12 imagens.

## Revisão de continuidade nos três níveis — 24/10/2026

Cada envio aceito registra uma única fala sua e entra diretamente na resposta de Lucas, sem outra tela de preparação da mesma resposta. A exceção natural é o último Bye: Lucas já respondeu You too. Bye! e a sua despedida encerra o encontro. Modelos, pistas, conferência mental e respostas não aceitas não são registrados como fala enviada.

No convite para sentar, Responder ao convite abre a atividade; o envio de Yeah, sure. agora recebe Nice! de Lucas na própria escolha do próximo assunto, com os dois já à mesa. Não há tela intermediária adicional. A fala reutiliza C04 e seu áudio persistente existente; IDs de etapas, destinos, textos de voz, regras de nível e imagens permanecem os mesmos.

Regressões percorrem as 128 combinações de história em cada nível, tanto com envio normal quanto com envio por apoio completo (768 percursos). Em cada resposta, conferem a fala única, reação imediata, ausência de envio durante preparação/erro/ajuda e proteção contra cliques atrasados. A repetição contextual de expressões conhecidas continua sendo prática em novas situações, sem repetir a preparação e o envio da mesma ocorrência.


Projeto do roteiro aprovado. A revisão de 23/10/2026 em [REVISAO-EXPERIENCIA-E-AUDIO.md](REVISAO-EXPERIENCIA-E-AUDIO.md) define a identidade Orbit, a conversa contínua e o áudio sob demanda; prevalece sobre decisões antigas de voz estática. Este documento não substitui o diálogo completo nem autoriza adicionar cenas.

Execução: motor e interface locais implementados no Lote 2; fonte literal complementar em `output/pdf/BasedSpeak_Demo_Experiencia_Visual.pdf` (55 páginas). Estado de produção de mídia em [MIDIA.md](MIDIA.md). Coleta remota adiada; a avaliação preserva rascunho e não confirma envio.

## Revisão implementada em 24/10/2026

A versão cafe-v2 integra as 12 imagens aprovadas de Lucas/BASEDSPEAK e substitui as referências antigas dos copos. Os três perfis agora alteram a tarefa: Guiado apresenta modelos antes da primeira construção, reduz distratores e oferece reconhecimento de expressões; Com pistas usa montagem/estruturas parciais e distratores contextuais; Mais autônomo oferece escrita com validação local e opção de recorrer às peças. Careful continua visível e traduzido antes do aviso; Really mantém a oportunidade de tentar antes de consultar.

Mudanças de perfil valem na próxima atividade: o perfil ativo fica fixo durante a tentativa. Escrita, peças e ajuda são preservadas; a escrita pode ser retomada após recorrer às peças. Evidências distinguem escrita, reconhecimento, montagem, adaptação e apoio. A grafia digitada aceita é preservada no transcript; o áudio reproduz o modelo do catálogo, sem sintetizar texto livre. Validação aceita caixa, pontuação, espaços e contrações equivalentes previstas, sem declarar incorreta uma formulação fora do repertório reconhecido.

O roteiro mantém dez partes, 128 combinações narrativas por perfil e três finais equivalentes. Versão de história incrementada para cafe-v2: snapshots anteriores não são reexecutados sob regras novas; a entrada informa incompatibilidade e permite começar outra tentativa. Nenhum dado remoto é migrado ou excluído.

As seções históricas abaixo descrevem a base original. Esta revisão prevalece nos pontos de imagem, nomes dos copos e perfil de atividade.

## Superfícies e limites

- `/`: título, proposta curta, duração estimada, aviso de microfone dispensável e escolha de apoio sem opção pré-selecionada.
- `/demo`: uma experiência com estados internos para partes 1-10, retrospectiva, conversa completa, conclusão e avaliação opcional.
- Nenhum `AuthProvider`, Firebase cliente, plano/pagamento, progresso de pilares ou motor órbita no caminho de renderização da demo.
- Nenhuma chamada a Asaas, Calendar, Google Translate TTS, Youdao ou geração de imagem. ElevenLabs somente pelo servidor após clique, com cache global persistente. Carregar a demo não inicia serviços externos.
- React `useReducer` e funções TypeScript puras são suficientes. Não adotar uma plataforma genérica de cursos nem interpretar HTML arbitrário dentro do conteúdo.

## Conteúdo e transições

Cada momento terá um ID estável, parte narrativa, tipo de atividade, fala/contexto, intenção, controles permitidos, blocos/distratores, ajuda e destinos. Os IDs não serão textos traduzidos nem índices de array. Os destinos são validados contra o catálogo.

Tipos necessários: cena/fala; compreensão com tentativa; decisão de intenção; apresentação de expressão; montagem; tentativa mental seguida de conferência; recombinação; reação; retrospectiva; avaliação. Não transformar toda frase em montagem nem toda passagem em decisão.

| Parte | Invariante de código |
|---|---|
| 1 | `Entender a pergunta` é a ponte para 2; antes disso não revelar tradução completa ou resposta |
| 2 | Distinguir preparação e envio real; `No / it’s not / mine` com distrator `it’s`; erro conserva montagem; reação só após envio real |
| 3 | Duas intenções; pedido em dois blocos, `It’s okay.` inteiro; cada ramo com a carga própria |
| 4 | Pedido igual usa `Me too.` inteiro; outro ramo adapta para `Yes / it’s / mine` com contraste `it’s not`; #24 consultável |
| 5 | Gosto/não muito são opiniões; `Really?` ouvido nos dois caminhos; provar o café antes da opinião |
| 6 | Quadro estático, sem relógio; `Careful!` e tradução aparecem antes de Avisar; confirmação de que segurou o copo; `That was close.` receptivo |
| 7 | `Really?` oculto antes de Conferir/ajuda; tentativa mental não é resposta observável; Me too/Not really dependem do histórico real |
| 8 | Convite a sentar é progressão guiada; inglês/trabalho são a decisão; recombinação com `your job` no caminho trabalho |
| 9 | Caminhos próprios; recombinação com `this café` no caminho inglês; respostas conhecidas sem remontagem obrigatória; ambos alcançam ficar/sair |
| 10 | Quem fica pode recombinar com `here`; ambos podem manter contato; despedida inteira apoiada; três finais equivalentes |

O grafo possui sete decisões binárias de intenção/resposta relevantes (3, 5, 7, 8, opinião na abertura de 9, ficar/sair em 9, contato em 10). Isso fornece **128 combinações narrativas de referência**, a confirmar automaticamente ao construir o grafo. Perfis, erros de compreensão e ajuda não criam finais novos. Percorrer combinações em funções puras é viável; não executar 128 sessões completas de 30 minutos em browser como condição de desenvolvimento.

## Estado mínimo e responsabilidade

| Grupo | Campos conceituais | Observação |
|---|---|---|
| Versão | schemaVersion, storyVersion | Separar versão do formato da versão do conteúdo |
| Identidade local | runId | Tentativa da demo; nunca Firebase UID obrigatório |
| Preferência | supportProfile, locale | Apoio pode mudar; idioma é outra dimensão |
| Posição | nodeId, phase | Parte 2 precisa fases distintas; não inferir fase pelo texto |
| Decisões | choiceId por momento | Apenas intenções selecionadas/enviadas conforme fluxo |
| Construção | IDs e ordem de blocos atuais | Validar contra a atividade; não aceitar blocos de outro momento |
| Ajuda | pistas/modelo revelados por atividade | Alterar apoio não fecha o que foi aberto |
| Histórico | exposições, consultas, montagens, recombinações, envios | Eventos separados; ouvir não equivale a compreender |
| Conversa | utteranceId, papel, ordem, contexto | Só falas narrativas efetivamente ocorridas |
| Avaliação | opção/comentário/rótulo de envio | Rascunho preservado se envio falhar; sucesso é confirmado pelo servidor |

Separar `transition(state, event)` puro dos efeitos: áudio, persistência local e POST de telemetria. Uma transição aceita produz estado e intenção de efeito; repetir um clique durante envio/transição não acrescenta fala duplicada. O servidor não precisa decidir o enredo nem receber cada movimento de bloco.

Eventos de domínio não são mensagens de analytics. Exemplo: `SUBMIT_RESPONSE` pode ser validado e produzir `utterance_sent`; `AUDIO_REPLAY` nunca produz `comprehension_succeeded`. Eventos sem validade na fase atual não avançam a cena.

## Apoio e evidência

- Os três perfis apenas regulam complementos iniciais. Nenhum perfil muda blocos, distratores, caminhos ou falas.
- `Careful!` conserva a tradução obrigatória; `Really?` conserva a oportunidade de tentar antes de revelar.
- Histórico consulta a expressão e o contexto realmente vividos. Quem não encontrou `Me too.` antes não recebe instrução falsa de que já a usou.
- Ajuda tem contexto, estrutura e modelo quando a atividade prevê isso. Não impor essa escada a uma expressão inteira que só precisa de explicação de uso.
- `Usar com apoio` é um resultado legítimo; não reduz conquista nem altera final.
- Classificações possíveis para retrospectiva: ouviu; construiu com blocos; recombinou com peça disponível; usou com apoio. Nunca derivar domínio ou lembrança independente de um clique em Conferir.
- Retrospectiva deriva do histórico local de conversa/atividade, não do recebimento completo dos eventos no servidor. Falha de telemetria não altera o que a pessoa viveu.

## Persistência e retorno: proposta fechada para execução

JSON local versionado, por exemplo chave `basedspeak.demo.cafe.v1`. Não reutilizar `secure-storage.ts`, nem seus IDs de progresso, nem chamar isso de criptografia.

Salvar após transições significativas e alterações de montagem/ajuda. Validar versão, nodeId, blocos, decisões e tipos ao restaurar. Não executar nada vindo do storage como script/HTML. Snapshot corrompido não deve quebrar a entrada; explicar que a tentativa não pôde ser recuperada e oferecer reinício. Versão incompatível não é traduzida arbitrariamente para outra cena.

Retomar a tentativa atual no mesmo dispositivo sem reproduzir áudio. Preservar pistas abertas, perfil, ordem dos blocos e falas já enviadas. Sem promessa de sincronização entre dispositivos. Não guardar áudio em base64 no storage.

Reinício explícito cria runId novo, limpa somente chaves da demo e volta à entrada sem apoio escolhido. Se houver tentativa em andamento, confirmação protege esse descarte concreto. O botão voltar do browser não deve desfazer a história nem permitir duplicar envio; voltando à rota, restaurar o estado aceito.

Se storage falhar/quota estiver indisponível, manter estado em memória e permitir concluir. A interrupção pode perder retomada; não bloquear a conversa com exigência de conta.

## Mídia

Manifesto `src/features/demo/content/media.ts`: imagens V01–V09 e falas C01–C30/U01–U20, com papel, texto, significado e contexto. IDs narrativos distintos podem compartilhar o mesmo áudio quando os parâmetros forem iguais.

Imagens locais em `public/demo/cafe/v1/`. Voz via `POST /api/demo/audio`, somente ID permitido: chave SHA-256 normalizada, reserva transacional Firestore, no máximo uma tentativa de provedor por chave e MP3 imutável no Blob. Detalhes, parâmetros e política de falha incerta na revisão aprovada. Não há fallback direto ao provedor. Segredos somente no servidor.

Player único com play/pause/cancel, replay e tratamento de falha. Nova reprodução interrompe a anterior. Ao avançar, parar áudio abandonado. A fala de referência do aluno e a reação seguem ordem causal; erro/autoplay bloqueado não impede o texto e não força permissão de microfone. Cancelar efeitos ao desmontar/alterar fase. Não marcar ouvir apenas porque o usuário tentou play se a reprodução falhou.

Carregar imagem atual e antecipar a próxima provável; não baixar os cinquenta áudios na entrada. Replays reutilizam recurso/cache; não geram novo arquivo nem nova fala narrativa. Textos, foco de teclado e clique por seleção continuam suficientes para montar blocos; arrastar não é obrigatório.

## API de áudio implementada e coleta remota adiada

`POST /api/demo/audio` é público, mesma origem, payload até 1 KiB, sem login e com rate limit persistente (120 pedidos/minuto/IP). Recebe somente audioId e retorna 200 com URL opaca de Blob, 202 com Retry-After durante preparação ou erro sanitizado. O cliente faz espera limitada e pode cancelar sem avançar a história. Velocidade local 1×/0,9× não muda a síntese fixa a 0.78.

Os contratos abaixo de sessão, eventos e avaliação permanecem propostas **não implementadas**, conforme a decisão de coleta local.

Os atuais endpoints curriculares não são reaproveitados para analytics da demo. Usar três handlers finos e serviços em `src/server/demo`.

| Endpoint | Entrada e autoridade | Resultado e persistência |
|---|---|---|
| POST `/api/demo/session` | Versão de história; mesma origem; tamanho limitado; rate-limit | Cria/renova sessão anônima opaca em cookie HttpOnly; devolve runId/versão; registra sessão. Não cria conta Firebase |
| POST `/api/demo/events` | Cookie validado; runId vinculado; lote de eventos permitidos | Grava eventos deduplicados por ID; 202 após aceite persistido, ou erro; sem conteúdo livre de respostas |
| POST `/api/demo/feedback` | Mesma sessão; submissionId; opção permitida e/ou comentário não vazio | 201 após gravação; replay idempotente 200 com mesmo registro; erro conserva rascunho na UI |

Sessão anônima é identificação da tentativa, não autenticação de aluno. Recomenda-se token opaco aleatório emitido pelo servidor, cookie com escopo adequado e hash/validade verificados no banco. Não confiar em runId enviado pelo cliente, IP como identidade ou cookie arbitrário sem validação. Não compartilhar `es_auth_session`. Esse mecanismo dispensa adicionar uma nova chave de assinatura se a verificação for por registro persistido.

Parâmetros iniciais explícitos para implementação: JSON de sessão até 2 KiB; feedback até 8 KiB e comentário até 2.000 caracteres; lote até 50 eventos/64 KiB. Valores são limites operacionais propostos, a ajustar por observação. Não coletar texto digitado fora do comentário opcional. Rate-limit usa o helper existente, com namespaces separados e valores testados para retries normais; limites nunca devem invalidar resposta narrativa local.

Coleções novas propostas: `demo_sessions/{runId}`, `demo_sessions/{runId}/events/{eventId}`, `demo_feedback/{submissionId}`. Snapshot de exercício permanece local; servidor recebe auditoria/feedback, evitando escrita remota por clique. Leitura pública dessas coleções negada. Firebase Admin ignora Security Rules; validação e autorização precisam estar no handler/serviço, além de IAM apropriado. [Referência Firebase](https://firebase.google.com/docs/firestore/security/rules-conditions).

Não retornar sucesso antes da gravação do feedback. A transação deve validar sessão e idempotência sem chamadas externas dentro de retry. [Referência de transações Firestore](https://firebase.google.com/docs/firestore/manage-data/transactions).

Falha em criar sessão remota ou enviar eventos não bloqueia a história; o cliente tenta novamente com fila local limitada. Sem sessão remota validada, feedback fica pendente/retry ou pode ser abandonado, nunca falsamente recebido. Eventos não recebidos permanecem lacuna; não inventar abandono ou compreensão.

## Telemetria e seis testes

Registrar IDs e instantes de: início/fim de parte; escolha de intenção; perfil inicial/mudança; abertura de ajuda e nível; modelo consultado; expressão conferida; replay iniciado/erro; envio que exigiu revisão; fala narrativa enviada; conclusão; retrospectiva; avaliação.

Cada evento inclui eventId, runId, storyVersion, nodeId/partId, sequência local e horário de recebimento no servidor. Nenhum evento chamado `mastered`, `learned_independently` ou equivalente. Tentativa mental só registra que a tela foi alcançada e se houve conferência/ajuda.

Tempo total decorrido, por parte, retrospectiva e avaliação são medidas separadas. Visibilidade/pausa são indicadores, não prova de atenção. Não subtrair automaticamente tempo de ajuda. Saída não observada fica desconhecida; último evento não prova motivo de abandono.

Primeiros seis participantes continuam com ficha de observação humana. Não construir painel admin novo para esse teste: exportação read-only pelo console/pequeno script restrito basta, com dados mínimos necessários e acesso administrativo. Estabelecer prazo de retenção antes de coleta pública; não ativar TTL silenciosamente com base em conveniência técnica.

## Critérios de prontidão específicos

1. Todos os caminhos válidos alcançam final e retrospectiva sem exceção nem estado impossível.
2. Nenhum perfil revela conteúdo protegido antes da tentativa; troca preserva estado.
3. A Parte 2 nunca registra a primeira montagem como fala enviada.
4. Os três finais são consequências, sem hierarquia ou score.
5. Transcript contém somente falas da tentativa, e transformação só aparece quando aconteceu.
6. Recarregar não duplica áudio, fala, decisão, avaliação ou evento.
7. Falha de rede não trava a história nem fabrica confirmação de feedback.
8. As nove imagens finais e os cinquenta contextos de fala são revisados; áudio sob demanda reutiliza arquivos globais, sem depender da pasta órbita. Não gerar novamente após resultado incerto.

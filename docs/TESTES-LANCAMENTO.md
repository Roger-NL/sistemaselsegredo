# Testes de lançamento — rodadas 1, 2 e acompanhamento da 3, 03/11/2026

Executor: conversa **Testes**. Revisão e aceite: **Ideia geral do projeto** (`01a13326-bfa1-7193-b54f-76ad008e134c`, local). **PASSOU é resultado do executor no ambiente indicado; não equivale a aprovação da central nem do lançamento.** O lote 1 permanece como histórico; os aceites posteriores e os resultados do lote 2 estão registrados em seções próprias ao final.

## Rodada 1 — ambiente e evidência

- Diretório: `/Users/rogera/Documents/projetos/ES`, checkout compartilhado, sem worktree, troca de branch, restore ou alteração de dados reais.
- Início: HEAD `6a150ae854f7c016752163ff7a96b2bda8ebd476` e alterações locais de outros trabalhos. Durante a rodada outro trabalho registrou `dde59f527377f42cb0d85789a0f95b57bc53ddf3` (tradução do navegador). Este executor não fez commit. A correção descrita abaixo permanece local sobre esse segundo HEAD.
- Node `v24.14.0`, npm `11.9.0`; servidor preexistente em `127.0.0.1:3000`, PID observado no início `2569`, preservado. Sem build no `.next` compartilhado, restart ou deploy.
- Local HTTP: `http://127.0.0.1:3000`. Domínio conferido: `https://www.basedspeak.com`.
- Evidências desta rodada: `output/testes-lancamento/2026-11-03-rodada1/` (ignorado pelo Git). Horários dos logs em UTC/Lisboa, data 03/11/2026. Logs não incluem credenciais, tokens reais ou respostas de contas reais.
- Fontes lidas: AGENTS, README, CONTEXTO-CENTRAL-2026-11-03, ENTREGA-CONSOLIDADA-2026-11-02, ALUNO-INTEGRACAO, DASHBOARD, AULA-AO-VIVO, AUTENTICACAO, APRESENTACAO e seções pertinentes de ADMINISTRACAO/TEORIA-PEDAGOGIA. Evidências históricas permanecem históricas.

Convenções da matriz: **A** = serviço/modelo/componente real, dependências externas simuladas pelo Vitest; **H** = HTTP real sem sessão ou com cookie deliberadamente inválido; **B** = navegador desta rodada; **L** = leitura de código/contratos. Em todas as linhas a coluna “Esperado” descreve o requisito, e “Observado / limite” delimita o que foi executado.

O arquivo `vitest-final-verbose.log` enumera cada um dos **549 testes efetivamente executados**, com nome, arquivo e resultado. A matriz agrupa cenários por requisito sem transformar os testes simulados em integrações reais.

## Inventário e regressão

| ID | Ambiente / procedimento | Esperado | Estado | Observado / limite / evidência |
| --- | --- | --- | --- | --- |
| INV-01 | Local; `git status --short`, `git rev-parse HEAD`, `node --version`, `npm --version`, `lsof -nP -iTCP:3000 -sTCP:LISTEN` | Identificar checkout e preservar trabalho compartilhado | PASSOU | Versões acima; nenhum arquivo de outro trabalho restaurado. Manifesto final registra hashes dos arquivos da correção. |
| REG-01 | A; `npm test` antes do reprodutor novo | Baseline oficial verde | PASSOU | 530 testes/71 arquivos; `vitest.log`. É o baseline anterior à descoberta PER-02. |
| REG-02 | A; `npm test -- --reporter=verbose` após a correção | Suíte incluindo regressão de conflito verde | PASSOU | **549 testes/74 arquivos**; `vitest-final-verbose.log`. Nova cobertura: 5 testes de serviço/rota, 11 corridas do store, 2 de UI e 1 de controles. |
| REG-03 | Local; `npm run lint` | Sem erros ou avisos | PASSOU | Exit 0, `lint-final.log`. |
| REG-04 | Local; `npx tsc --noEmit --incremental false` | TypeScript válido | PASSOU | Exit 0, `typescript-final.log`. Não gera tipos/build no servidor ativo. |
| REG-05 | Local; `git diff --check` | Sem erros de whitespace | PASSOU | Exit 0; comando também registrado em `checks.json`. |
| REG-06 | `npm run build` | Build de produção compatível com checkout final | NÃO EXECUTADO | Servidor compartilhado usa `.next`; não houve coordenação para reconstruí-lo. TypeScript/lint não substituem build. |

## Cafeteria e estudo

| ID | Ambiente / procedimento | Esperado | Estado | Observado / limite / evidência |
| --- | --- | --- | --- | --- |
| CAF-01 | A; `demo-model`, `demo-presentation`, `demo-integrated-paths` | Dez partes, caminhos e finais coerentes | PASSOU | Grafo verifica 128 caminhos por apoio; percursos dirigidos cobrem nós, alternativas e finais. Não são percursos humanos no navegador. Log final identifica os testes. |
| CAF-02 | A; `demo-model`, `demo-response-practice` | Três apoios alteram a atividade; troca conserva edição atual | PASSOU | Guiado, pistas e escrita têm estados distintos; troca vale na próxima atividade e preserva rascunho/peças. |
| CAF-03 | A; `demo-response-practice`, `demo-listening` | Erros não dão ajuda automática; resposta válida avança uma vez; texto alternativo não conta como escuta | PASSOU | Peças incorretas retornam, terceira falha reinicia montagem, escrita incorreta é preservada, ajuda/modelo voluntários e escuta/texto distintos. |
| CAF-04 | A; `consolidated-release`, `content-corrections`, `demo-conversation-replay`, recuperação em `demo-model` | cafe-v8 recupera tentativas compatíveis e replay mantém falas históricas | PASSOU | Fixtures históricas e roundtrip preservados; replay não reescreve respostas anteriores. Sem leitura/escrita em tentativas reais de Roger. |
| CAF-05 | A; `demo-retrospective`, `demo-integrated-paths` | Retrospectiva usa evidências reais do percurso e não certifica domínio | PASSOU | Escrita literal, apoio e histórico conferidos; mensagem explícita de que a conversa não comprova domínio/memorização. |
| EST-01 | A; `theory-study-validation`, `theory-progress` | Oito blocos, exatamente 24 IDs, erro/acerto e montagem válida | PASSOU | Casos das 24 práticas aceitam propostas previstas e recusam sentidos/ordens indevidos; peças ausentes/extras rejeitadas. Não mediu eficácia pedagógica. |
| EST-02 | A; `theory-study-validation` | Repetição distingue apoio da tentativa posterior; sem conclusão falsa por navegação | PASSOU | Nova tentativa sem modelo pode substituir marca de apoio; IDs duplicados/desconhecidos e navegação não aumentam conclusão. |

## Persistência, conflitos e recuperação

| ID | Ambiente / procedimento | Esperado | Estado | Observado / limite / evidência |
| --- | --- | --- | --- | --- |
| PER-01 | A; `public-practice`; B, começar tentativa anônima nova em `/demo`, ouvir primeira fala, sair/voltar e recarregar | Visitante continua sem conta e retoma seu ponto | PASSOU | Modelo/restauração simulados; no navegador a tentativa QA retomou Parte 1, “Is this yours?”, após reload. `demo-anon-resumed.txt/png`, `demo-anon-after-reload.txt/png`. Só primeira parte foi percorrida nesta QA, sem controles artificiais. |
| PER-02 | A; `npx vitest run tests/launch-progress-conflict.test.ts --reporter=verbose` antes da correção | Uma gravação obsoleta não apaga progresso mais recente | FALHOU | Duas submissões com revision 0 salvaram 2 e depois 1 prática. `progress-conflict.log`: expected 1 to be 2. Serviço real com armazenamento simulado, sequência possível de duas abas; **não são duas abas reais no Firebase**. Central reproduziu e **REPROVOU** o comportamento. |
| PER-02R | A; `launch-progress-conflict`, `launch-workspace-races`, `launch-conflict-ui`, caso novo em `superuser` | Token por save, 409 distinto, snapshots intactos, escolha explícita e isolamento | PASSOU | Correção autorizada pela central; 19 casos novos cobrem o risco. Suíte final verde. **APROVADO PELA CENTRAL NO ESCOPO LOCAL** de lógica, contrato e recuperação com dependências simuladas, em 03/11/2026. A central reexecutou 75 testes em seis arquivos às 03:07 UTC/Lisboa, com exit 0. Sem aprovação de integração real, build/deploy ou lançamento; ver registro de aceite abaixo. |
| PER-03 | A; `student-workspace-client`, `client-auth-entry`, `public-practice` | Conta, recarga, logout e login não misturam caches nem ressuscitam callbacks antigos | PASSOU | Namespace UID/revisão, resposta em voo após saída, sessão expirada e mudança de identidade exercitados com transporte/SDK simulados. |
| PER-04 | A; `public-practice`, `workspace-services` | Importação é explícita, atômica e só para conta vazia; guest só é limpo após confirmação | PASSOU | Recusa progresso prévio, reset, agendamento e conta suspensa; leitura antiga não apaga importação confirmada. Token saveVersion também exigido após a correção. |
| PER-05 | A; `student-workspace-client`, `launch-workspace-races` | Falha de rede/servidor conserva gravação pendente; reset tem tratamento próprio | PASSOU | Retentativa revalida identidade/base; resposta perdida não provoca reenvio com token novo; reset/UID/expiração limpam conteúdo privado obsoleto. |
| PER-06 | Integração real com duas identidades QA, duas abas, reload e logout/login | Mesmos resultados em Firebase/HTTP/browser reais | NÃO EXECUTADO | Sem identidades QA autorizadas já isoladas de avisos externos. Criar conta/solicitar aula pode acionar outbox/Resend configurados. Não usei Roger nem alterei configuração para contornar esse limite. |

### Correção local de PER-02 — aceite delimitado

1. `LearningProgress.saveVersion` é independente da `revision` de reset. Leitura de documento legado usa zero; não foi feita migração de registros reais. Save/import exigem token; ausência não cai em compatibilidade permissiva.
2. A transação confere os dois valores. Gravação com base antiga retorna **HTTP 409, `code: LEARNING_SAVE_CONFLICT`**, antes de substituir snapshots ou registrar atividades/avisos. Reset continua no tratamento próprio. Gestão e controles incrementam também saveVersion; controles exigem a versão atual.
3. A versão-base vem do estado editado, não do GET preflight. Edição do formulário de estudo inicia proteção antes da criação de um snapshot. Somente o save confirmado da própria aba avança a base de edições que ficaram na fila.
4. No conflito, o store separa snapshots rejeitados e versão remota; interrompe a fila, conserva a montagem do formulário e não reenvia automaticamente. A recuperação é guardada em **sessionStorage da aba**, validada e mostrada só após conferir o mesmo UID e revisão no servidor. Reset, saída, expiração e troca de conta removem esse contexto.
5. O diálogo permite baixar cópia, retomar a conta ou escolher explicitamente o percurso desta aba para substituir apenas os campos editados. A escolha local revalida a versão remota; se mudou novamente, exige nova escolha. Não há merge de journals nem regra de maior contagem. Voltar/recomeçar continuam possíveis com token atual.
6. Retry idêntico da gravação imediatamente anterior pode confirmar o resultado sem incrementar versão nem repetir atividade/aviso. A notificação de conclusão continua deduplicada no teste de outbox.

Limites: sessionStorage bloqueado mantém recuperação em memória e aviso antes de fechar; não oferece durabilidade após fechar a aba. A cópia contém os snapshots rejeitados. Um texto do formulário de estudo ainda não conferido permanece na montagem atual; não se tornou um novo campo persistido no servidor. Não há alegação de reconstrução desse texto bruto após fechar/recarregar. Clientes antigos sem token serão recusados, devendo recarregar a aplicação quando a mudança for publicada.

## Permissões e HTTP real

Procedimento reproduzível: `node output/testes-lancamento/2026-11-03-rodada1/http-audit.mjs`. O script faz **50 requisições**: 25 por ambiente, sem credenciais válidas, sem seguir redirecionamentos automaticamente. Corpos das mutações são `{}`; o UID é fictício. Resultados completos em `http.json` e resumo em `http-summary.log`.

| ID | Ambiente / procedimento | Esperado | Estado | Observado / limite / evidência |
| --- | --- | --- | --- | --- |
| AUT-01 | H local + domínio; GET workspace, apresentação, aula, ADM, test-controls e checkout sem sessão; workspace com cookie inválido | Recusar acesso privado | PASSOU | APIs responderam 401; `/dashboard` e `/adm` responderam 307 para entradas próprias. Cookie inválido não é uma sessão realmente expirada: expiração/revogação têm cobertura A. |
| AUT-02 | H local + domínio; PUT learning e POST import/aula/decisão ADM anônimos, origem igual | Requisição direta não contorna sessão | PASSOU | Todos 401. Não prova permissões entre duas contas autenticadas reais. |
| AUT-03 | H local + domínio; PUT learning, POST apresentação e POST decisão ADM com `Origin: https://audit.invalid` | Recusar origem externa | PASSOU | Todos 403. Nenhuma mutação autorizada atingiu dados reais. |
| AUT-04 | A; `workspace-route-guards`, `workspace-principal`, `workspace-services`, `superuser` | Aluno não administra, não acessa dados de outro UID, não se autoaprova ou concede controles | PASSOU | Claims atuais, status, propriedade, header UID divergente/ausente e campos forjados recusados antes do handler. Firebase/regras reais não foram alterados nem reexercitados com QA. |
| AUT-05 | H; `/dev/testes`; A `local-testing`, `superuser` | Controles locais não existem na produção; controles persistentes exclusivos do titular | PASSOU | Rota local 200 e pública 404. Permissão de aluno comum validada em testes simulados; nenhum controle foi usado para inventar evidência de aprendizado. |

## Aula gratuita e autenticação

| ID | Ambiente / procedimento | Esperado | Estado | Observado / limite / evidência |
| --- | --- | --- | --- | --- |
| AUL-01 | A; `live-class`, `student-next-step`, `workspace-services` | 23/24 bloqueia, 24 IDs válidos liberam conta active/pending; progresso sintético não libera | PASSOU | Consulta e booking direto recusados com 23; com 24 liberados; contas rejeitadas/suspensas recusadas; benefício não exige plano pago. |
| AUL-02 | A; `live-class` | Uma por conta, retries idempotentes e horário ocupado indisponível | PASSOU | Mesmo pedido retorna registro; segundo UID após reserva recebe 409; slot desaparece. **O teste atual de slot é sequencial e o double não reproduz disputa transacional real; não chamar isso de concorrência simultânea comprovada.** |
| AUL-03 | A; `live-class` | Confirmação/link, revisão obsoleta, cancelamento/remarcação e realização persistem | PASSOU | Mesmo serviço lido pelo aluno/gestão; HTTPS validado; cancelamento libera slot; realização só após término e bloqueia segundo benefício; reset não apaga aula existente. Persistência é simulada. |
| AUL-04 | Integração real, dois UIDs disputando horário e ciclo operacional com professor | Um vencedor e operação real completa | NÃO EXECUTADO | Limite de identidades/avisos externos e horários humanos ainda não confirmados. Não criou reserva, cancelamento, confirmação, sala ou evento real. Testes antigos em `live-class-qa` são históricos. |
| AUTH-01 | A; `client-auth-entry`, `client-session`, `auth-session-route`, `auth-navigation-csp`, `real-access-form`, `admin-login-recovery` | Cadastro, senha, Google, recuperação e erros respeitam sessão verificada | PASSOU | SDK/transportes simulados; token antes de navegação, limpeza parcial, erro condicional, cancelamento/popup/rede e preservação do progresso. Não enviou e-mail nem mudou senha. |
| AUTH-02 | SDK real e fluxo humano atual: cadastro/senha, Google e handler de recuperação | Autenticação/recebimento/ação humana de ponta a ponta | NÃO EXECUTADO | Não recriou QA nem utilizou sessão Google de Roger. Documento AUTENTICACAO contém sucessos históricos delimitados; **nenhum OAuth humano foi concluído nesta rodada**. |

## Rede, mídia, interface e publicação

| ID | Ambiente / procedimento | Esperado | Estado | Observado / limite / evidência |
| --- | --- | --- | --- | --- |
| RES-01 | A; `public-practice`, `student-workspace-client`, `launch-workspace-races` | API/armazenamento indisponíveis têm erro honesto e recuperação sem falsa sincronização | PASSOU | Guest offline permanece local; storage bloqueado é informado; gravação falha fica pendente; conflito/reset separados. Não derrubou rede real. |
| RES-02 | A; `demo-audio-client`, `demo-audio-route`, `demo-audio`, `speech-cache`, `published-audio` | Falha de áudio mantém caminho textual, não vira escuta e não causa geração duplicada | PASSOU | Casos de erro/cache/polling/cancelamento simulados. B observou “Reproduzindo áudio” na primeira fala publicada; isso não aprova pronúncia nem 46 MP3s. Nenhuma geração de mídia executada. |
| UI-01 | B; landing, “Dê uma espiada”, Escape | Modal explica acesso livre e devolve foco ao abrir/fechar | PASSOU | DOM real mostrou “sem cadastro e sem aprovação”, link `/demo`; Escape fechou e foco voltou ao botão. `landing-local.txt/png`; não é revisão completa da landing móvel. |
| UI-02 | B; demo anônima, apoio autônomo, cartões iniciais, escuta, retorno e reload | Entrada pública e retomada básica sem resets | PASSOU | Retomou Parte 1 na fala inicial. Janela final 319×504: documento 319×504, sem overflow horizontal. Carregamento foi observado durante recompilações/HMR; tempo de retomada não foi cronometrado nem aprovado. Não percorreu dez partes no browser nesta rodada. |
| UI-03 | B; componente `LearningConflict` real em Vite isolado, hooks/conta simulados; teclado Tab/Escape e escolha | Diálogo sem corte externo, foco inicial, decisões acessíveis e nenhuma gravação automática | PASSOU | Corrigido dimensionamento da prévia; diálogo em 319×504 ficou em x19/y16, 281×472, rolagem interna. Tab alcançou decisões; Escape não descarta rascunho; escolha simulada fechou modal e manteve textarea externa. Capturas `conflict-narrow-initial.png`, `conflict-narrow-actions.png`, `conflict-explicit-choice.png`; harness `preview-*`. **Prévia com dados simulados; não é conflito autenticado real.** |
| UI-04 | B; conta, apresentação obrigatória/revisão, painel, estudo completo, agenda e ADM desktop/mobile/zoom | Cobertura visual integrada de todos os estados | NÃO EXECUTADO | Suítes de UI/modelo passaram, mas não equivalem a essa matriz completa de navegador. Prévia móvel por iframe não foi concluída. Zoom e aparelhos físicos não foram testados; não há auditoria integral WCAG. |
| DOC-01 | H/L; `/termos` e `/privacidade` nos dois ambientes | Informação pública coerente com demo/estudo livres | FALHOU | Ambos ainda dizem exigir conta ativa e aprovação. Termos ainda citam estimativa de cerca de 20 minutos. Texto integral público e links em `http.json`. Não corrigido sem orientação específica da central. |
| CTA-01 | H/B; landing nos dois ambientes | Entrada principal coerente com acesso livre | FALHOU | CTA principal “Criar conta e experimentar” leva a `/comecar`; acesso sem cadastro fica no modal. Achado de coerência já apontado pela central, confirmado aqui; mudança de CTA depende de orientação. |
| PUB-01 | H; `fingerprint.mjs`, comparar scripts e bytes da V01 | Comparação verificável além de HTTP 200 | PASSOU | 23 scripts locais e 13 públicos inspecionados; cafe-v8 encontrado nos dois. `LEARNING_SAVE_CONFLICT` encontrado só nos scripts locais. V01-960.webp coincide com arquivo aprovado nos dois. `fingerprint.json/log` guarda hashes e URLs. Não prova igualdade integral, commit ativo do domínio ou paridade de todos os fluxos. |
| HUM-01 | Escuta editorial dos 46 MP3s; horários humanos da agenda | Aprovação humana de mídia/atendimento | NÃO EXECUTADO | Continuam pendências humanas. Integridade técnica passada e gravação sintética não substituem essas decisões. |

## Pagamentos

| ID | Ambiente / procedimento | Esperado | Estado | Observado / limite / evidência |
| --- | --- | --- | --- | --- |
| PAG-01 | L/A; `payments-beta-mode`, `payment-reconciliation`, `access-entitlement`, `payment-mode`, `integration-route-auth`, `asaas` | Beta falha fechado e não cobra por chamada direta; contratos legados protegidos | PASSOU | Sem flag, beta é gratuito; somente `false` explícito habilita pagamento. Serviço bloqueia antes de Asaas; propriedade e reconciliação testadas com provedores simulados. Não executou scripts de auditoria remota, compra, webhook externo ou cobrança. O 401 de checkout anônimo não comprova a flag do ambiente remoto. |
| PAG-02 | L; `src/server/payments/types.ts`, fluxo de checkout e contexto central | Validar futuras assinaturas mensais | NÃO DISPONÍVEL | Contrato vigente é `lifetime`/`specialty`; os novos planos mensais não estão implementados. Não foram implementados aqui. **Esta rodada não aprova lançamento pago.** |

## Encaminhamento do lote 1 — histórico

- PER-02 foi enviado com reprodutor e log, reproduzido e reprovado pela central. A central autorizou estritamente a correção local e os retestes descritos acima.
- Correção, diff, hashes, resultados finais e achados DOC-01/CTA-01 devem ser revisados pela central. O próximo relatório de lote apresenta PER-02R como PASSOU local, aguardando aceite, e mantém integrações reais/build/matriz visual completa como não executados.
- Propostas sem implementação nesta rodada: alinhar termos/privacidade ao acesso público e retirar duração não validada; definir CTA principal; disponibilizar identidades QA realmente isoladas de comunicações e agenda humana para E2E; coordenar build final sem interferir no servidor.
- Não houve publicação, compra, cobrança, e-mail/WhatsApp a alunos, mudança de credenciais/configuração externa, regeneração de mídia, exclusão de dados reais ou alteração do progresso/reservas de Roger. A prévia isolada foi encerrada após a captura. Aguarda-se orientação da central para correções adicionais e retorno.


## Aceite da central recebido após o lote 1

A central manteve **PER-02 original REPROVADO como achado histórico** e aprovou **PER-02R apenas no escopo local de lógica, contrato e recuperação com dependências simuladas**. A revisão incluiu o diff de serviço, store, gestão, controles e UI; os testes; a captura `conflict-narrow-actions.png`; e a comparação dos 25 hashes de `rodada1/checks.json`, sem divergências naquele momento.

Em **03/11/2026, às 03:07 UTC/Lisboa**, a central reexecutou independentemente `launch-progress-conflict`, `launch-workspace-races`, `launch-conflict-ui`, `student-workspace-client`, `workspace-services` e `superuser`: **75 testes passaram em seis arquivos, exit 0**. Esses 75 são uma reexecução independente de um subconjunto, não uma adição aos **549 testes executados pelo executor no lote 1**. A central aceitou o lote reportado como evidência automatizada local, sem converter integrações reais ou a matriz visual ainda não executadas em sucesso. Não houve aprovação de lançamento.

A central também reprovou DOC-01/CTA-01 e autorizou sua correção factual local, mais build em cópia isolada, ampliação de navegador e testes QA segregados dentro dos limites de comunicação e dados já descritos.

## Rodada 2 — evidência anterior à nova direção visual

**Corte de versão:** o build, a suíte de 552 testes e as capturas desta seção antecedem a implementação do tema de gibi. Não validam, por si só, esse tema. O pedido direto de Roger priorizou primeiro o visual do painel; ele rejeitou a primeira proposta e definiu uma linguagem de gibi maduro, coesa em todo o site, **incluindo explicitamente a demo**. As conferências posteriores do tema e seus aceites delimitados estão nas seções seguintes. Não há aceite estético em nome de Roger nem aprovação de lançamento.

As evidências deste lote ficam em `output/testes-lancamento/2026-11-03-rodada2/`. Os resultados abaixo foram conferidos nesses arquivos. O estado histórico das linhas do lote 1 permanece preservado; os IDs com sufixo R ou novos números registram os retestes posteriores.

### Versão e isolamento

- O snapshot foi criado em **03:11:34 UTC/Lisboa**, sobre HEAD `dde59f527377f42cb0d85789a0f95b57bc53ddf3`, com as alterações locais então presentes. `build-snapshot.json` contém **339 arquivos e respectivos SHA-256**.
- `npm run build` foi executado em uma **cópia temporária fora do checkout, sem worktree Git**. Dependências foram copiadas com APFS copy-on-write, sem instalação. Não foram copiados `.env` ou credenciais. `build-result.json` registra **exit 0**; `build.log` registra a compilação e as rotas.
- A configuração do build usou allowlist de ambiente, beta gratuito, notificações e cron desabilitados, sem credenciais de serviços externos. Isso testa compilação e operação pública nessa configuração; não comprova paridade com segredos e serviços de produção.
- O browser público usou o Next isolado em `127.0.0.1:3220`, por proxies QA em `3219`, `3221` e `3222`. Os proxies não encaminham cookies/Authorization e bloqueiam escritas. O `.next` e o servidor compartilhado da porta 3000 não foram reconstruídos ou reiniciados por esse build.

### Correções factuais, regressão e build

| ID | Ambiente / procedimento | Esperado | Estado | Observado / limite / evidência |
| --- | --- | --- | --- | --- |
| DOC-01R | H/B/L; revisar termos e privacidade locais e renderizados no build isolado | Descrever acesso público, progresso anônimo, sincronização e importação explícita, revisão cadastral sem bloqueio, benefício 24/24 e avisos operacionais sem promessas indevidas | PASSOU | Textos locais corrigidos; removida a estimativa não validada de 20 minutos. Aula descrita como individual, uma hora, uma por conta, após 24 práticas salvas, dependente de disponibilidade e confirmação. Privacidade identifica Resend e avisos ao responsável, sem conteúdo integral de mensagens/exercícios nem alegação de lembretes integrais ao aluno. `public-text.json`, `terms-rendered-full.png`, `privacy-rendered-full.png` e estados DOM. Correção factual APROVADA LOCALMENTE pela central no aceite posterior do lote 2; o FALHOU original permanece histórico. Não houve publicação. |
| CTA-01R | H/B; landing e metadata locais; navegar pelo CTA principal | “Começar a conversa” leva diretamente a `/demo`, com conta/login acessíveis | PASSOU | CTA e metadata alinhados localmente, sem refazer o visual nesse momento. Link funcionou sem cadastro. `landing-desktop.png`, `landing-corrected-mobile.png`, `public-text.json`. Correção factual APROVADA LOCALMENTE pela central. Esta evidência é anterior ao tema de gibi e não equivale a seu aceite visual. |
| REG-07 | Cópia isolada; `python3 output/testes-lancamento/2026-11-03-rodada2/isolated-build.py`, que executa `npm run build` | Build de produção sem interferir no servidor compartilhado | PASSOU | Exit 0; snapshot/hash, configuração e limites acima. `build-snapshot.json`, `build-result.json`, `build.log`. Não é build do estado visual posterior. |
| REG-08 | A; `npm test -- --reporter=verbose` | Suíte incluindo novos cenários de concorrência verde | PASSOU | **552 testes em 75 arquivos**, iniciados às **03:30:44 UTC/Lisboa**; `vitest-final.log` enumera cada teste. São os 549 anteriores mais três novos casos de reserva. Não somar às reexecuções da central. |
| REG-09 | Local; `npm run lint`, `npx tsc --noEmit --incremental false`, `git diff --check` | Sem erros | PASSOU | Executor registrou exit 0 nos três; `lint-final.log` e `typescript-final.log` sem erros. Executados antes das novas alterações visuais. |
| PUB-02 | H; `node output/testes-lancamento/2026-11-03-rodada2/public-text-audit.mjs` | Comparar conteúdo e metadata servidos, não apenas status HTTP | PASSOU | 12 respostas conferidas: `/`, `/termos`, `/privacidade` e `/comecar` em localhost 3000, build isolado 3219 e domínio oficial. Em **03:31:12 UTC/Lisboa**, local/isolado tinham CTA `/demo`; produção ainda tinha “Criar conta e experimentar” → `/comecar` e os textos anteriores. `public-text.json/log`. Produção permanece divergente até publicação coordenada; nenhuma publicação foi feita. |

### Automação pública no navegador

Os **775 registros** de `browser-states.json` são observações/estados da automação no navegador, não 775 testes independentes, percursos humanos ou evidências de aprendizagem. As entradas registram DOM, horário e dimensões efetivamente observadas. Os inputs esperados foram enviados pelos controles visíveis; não houve injeção de estado, avanço por controles de teste ou atribuição desses dados a participantes.

| ID | Ambiente / procedimento | Esperado | Estado | Observado / limite / evidência |
| --- | --- | --- | --- | --- |
| UI-05 | B; ações normais na cafeteria, três origens QA anônimas | Completar as dez partes nos três apoios e caminhos relevantes | PASSOU | Guiado/caminho A, com pistas/caminho B complementar e autônomo/caminho A chegaram ao fim. `guided-end-mobile.png`, `some-complete-desktop.png`, `less-complete-desktop.png`; passos em `browser-states.json` e inputs em `answer-plan.json`. É automação pública real na UI, sem integração autenticada com Firebase, não execução humana. Não percorreu todos os 128 caminhos no navegador. |
| UI-06 | B; replay guiado e resumos | Replay preserva falas e resumo não infere domínio | PASSOU | Replay guiado percorrido até a **fala 41 de 41**. Resumos distinguiram apoio e respostas escritas e exibiram que a conversa não comprova domínio/memorização. Replay complementar conferido também em viewport móvel emulado de 390×844. `guided-replay-last.png`, `guided-summary.png`, `less-summary-written.png`, `some-mobile-response-actual.png`. |
| EST-03 | B; entrar no estudo pelo final da conversa e exercitar cada prática | Erro, acerto, reapresentação e modelo voluntário funcionam nas 24 práticas | PASSOU | `study-results.json` contém **24 IDs únicos**, todos com erro, acerto, retry e modelo voluntário. A conclusão mostrou **24/24, 24 com consulta ao modelo na tentativa registrada**, sem certificar nível. `study24-finished-mobile.png`; estados de cada prática em `browser-states.json`. Não são evidências de domínio de aluno. |
| PER-07 | B; recarregar estudo concluído e abri-lo em outra aba na mesma origem | Progresso anônimo persiste e não vira progresso autenticado | PASSOU | Reload e segunda aba mostraram 24/24; a UI continuou identificando salvamento no navegador e pedindo conta/importação para a aula. `study24-reloaded.png`, `study24-second-tab.png`. Não comprova sincronização de conta em outro dispositivo. |
| PER-08 | B; escrita autônoma incorreta, reload e troca de apoio durante a atividade | Erro não apaga rascunho; mudança de apoio conserva a resposta atual | PASSOU | “This coffee is mine.” permaneceu após erro e reload em 320×568, com feedback de repertório e sem envio válido. Troca para pistas e retorno ao autônomo manteve a escrita e a atividade atual. `less-write-error-mobile.png`, `less-draft-reloaded.png`, `less-draft-after-support-change.png`. Depois a QA corrigiu a resposta por controles normais. |
| RES-03 | B; build sem credenciais e proxy bloqueando POST de áudio | Falha explícita de áudio permite continuação textual, sem geração ou falsa escuta | PASSOU | **87 requisições POST `/api/demo/audio` foram bloqueadas pelo proxy**; nenhuma outra escrita consta desse log. Fallback textual permitiu os percursos. `blocked-requests.jsonl`, `audio-unavailable.png`, `public-server.mjs`. Trata-se de falha injetada no ambiente QA, não indisponibilidade comprovada do provedor em produção nem escuta editorial. |
| UI-07 | B; medir layout e conferir capturas nos percursos | Sem overflow horizontal nos estados medidos; controles e foco utilizáveis nos casos conferidos | PASSOU | 775 estados medidos: **320 em 1440×900, 243 em 390×844, 122 em 320×568 e 90 em 1280×720**; nenhum com `scrollWidth > width`. Houve conferência de erro, escrita, replay, estudo, landing, textos legais e entrada pública da conta. Tab abriu o modal de informações e Escape devolveu o foco. Dimensões vêm das métricas, não do nome do arquivo. Emulação não é aparelho físico nem auditoria integral WCAG. |
| UI-08 | B; tentativa de reiniciar a tentativa QA pelo menu | Confirmar reinício e preservação do estudo pela UI | NÃO EXECUTADO | O clique abriu confirmação nativa e o controle da aba bloqueou; inventário informou Mac bloqueado. A aba QA foi fechada e os outros percursos usaram origens QA independentes. Não atribuído como defeito de produto sem reprodutor independente; não contar como reinício concluído. |
| UI-09 | B; atalhos de zoom e leitura de escala/DPR | Testar zoom real, distinto de reduzir viewport | NÃO EXECUTADO | `Meta++` e `Control++` não alteraram dimensões, DPR ou escala observados: 1440×900, DPR 1, escala 1. `zoom-attempt.json`. Não foi comprovado zoom a 200%; alterar viewport não substitui esse teste. |

### Reservas e integrações que continuam limitadas

| ID | Ambiente / procedimento | Esperado | Estado | Observado / limite / evidência |
| --- | --- | --- | --- | --- |
| AUL-05 | A; `npx vitest run tests/launch-booking-concurrency.test.ts --reporter=verbose` | Um vencedor por slot, retries idempotentes e uma reserva por conta sob sobreposição | PASSOU | **Três testes passaram**. O double captura versões de leitura, confere commits atomicamente e reexecuta callbacks após conflito; os testes exigem retries efetivos. Casos: dois UIDs disputam um slot; mesmo UID repete o mesmo pedido; mesmo UID solicita dois horários. Conferem booking/lock e ausência de duplicação de atividade/aviso. `booking-concurrency.log`. É serviço real com double OCC isolado, **não disputa simultânea em Firestore real**. |
| INT-01 | Preparação local para QA autenticada descartável | Garantir segregação de dados e ausência de comunicações externas antes de criar identidades | NÃO EXECUTADO | A inspeção identificou cron de produção que consome a fila global: desabilitar Resend apenas no processo local não impediria outro consumidor de enviar eventos QA gravados nessa fila. Não havia emulador disponível nem Java Runtime funcional para a segregação planejada. Não foi possível garantir ausência de gatilho remoto independente; nenhuma conta/documento QA autenticado ou reserva em slots reais foi criado. Não se alteraram rules, configuração Firebase, destinatário global ou dados de Roger. |
| AUTH-03 | Fluxos humanos Google e recebimento/handler de recuperação | Autenticação e e-mail reais com identidade autorizada/isolada | NÃO EXECUTADO | Não usou sessão Google de Roger, não criou identidade real e não enviou recuperação/verificação. Testes simulados e a tela pública de login não são OAuth humano concluído. |
| UI-10 | Painel/ADM/agenda e apresentação autenticados integrados no browser | Cobrir a matriz autenticada completa | NÃO EXECUTADO | Os percursos públicos e os testes automatizados não substituem essa matriz. O tema integrado exige regressão própria; não aproveitar o build/capturas anteriores ao tema como aceite dos novos estilos. |

O lote 2 não publicou código, cobrou, enviou mensagens externas, regenerou mídia ou alterou progresso/reservas de Roger. Os novos planos mensais continuam **NÃO DISPONÍVEIS**, e o lançamento pago continua sem aprovação. DOC-01R/CTA-01R e os resultados acima receberam os aceites delimitados registrados ao final; isso não constitui aceite global de lançamento.


## Revisão visual priorizada por Roger — identidade de gibi

Pedido direto posterior de Roger: priorizar o painel; a primeira tentativa de cores/serifas foi rejeitada. O pedido vigente é uma linguagem de **gibi maduro e coerente em todo o site**, com reforço explícito para incluir a demo. Esta alteração visual foi autorizada diretamente por Roger e não representa aceite de lançamento pela central.

A tentativa anterior foi removida. A nova identidade usa tokens de papel/tinta/amarelo/teal/coral/azul, contornos, sombras sólidas, retícula discreta e fontes locais Bangers/Barlow. Landing, entrada, apresentação, painel, demo, estudo, páginas legais e seletores da gestão compartilham esses tokens. Inglês de falas, exercícios e campos mantém caixa, pontuação e fonte de leitura. Não se regeneraram as ilustrações e os MP3s. Os handlers, timers, transições e keyframes existentes foram preservados; o layout raiz apenas importa os estilos novos.

| ID | Procedimento / evidência | Estado | Escopo e limites |
| --- | --- | --- | --- |
| VIS-01 | Revisão dos cinco estilos do tema e importação no layout; fontes/OFL em `public/fonts/` | PASSOU | Implementação local de aparência. Satisfação visual final pertence a Roger. A primeira versão rejeitada não foi mantida. |
| VIS-02 | Build final na cópia temporária sem `.env`/credenciais; `output/comic-design-2026-11-03/build.log`, `build-result.json`, `build-snapshot.json` | PASSOU | `npm run build` exit 0; 350 arquivos de snapshot, sem divergência na conferência do código compilado. Acréscimo posterior de README de atribuição de fontes não altera o runtime. O primeiro build dentro da sandbox foi interrompido após bloqueio de recursos locais; a execução isolada autorizada concluiu. A central APROVOU o build isolado (REG-07/VIS-02) e conferiu os 350 hashes atuais: zero divergências. Sem restart do servidor compartilhado. |
| VIS-03 | Suíte local, lint, tsc; `vitest.log`, `lint.log`, `typescript.log` no mesmo diretório | PASSOU | Executor: 552 testes/75 arquivos, iniciados às 03:55:16 UTC/Lisboa, mais lint/tsc exit 0. A central reexecutou 552 testes/75 arquivos em 03/11/2026, início às 04:06:53 UTC/Lisboa, exit 0 (REG-08/VIS-03). São execuções distintas da mesma suíte, não testes adicionais a somar. Cobertura de lógica/componentes; não substitui regressão completa no navegador ou integração real. |
| VIS-04 | Navegador real sobre build isolado: entrada, demo até parte 4, erro/acerto de escrita, consulta voluntária, recarga/retomada, estudo e feedback | PASSOU | Capturas e estados em `output/comic-design-2026-11-03/`. Proxy recusa gravações e geração de áudio; contexto anônimo QA, sem dados de Roger. Não foram repetidos os três percursos completos ou as 24 práticas após o novo tema. |
| VIS-05 | Demo em 320×568: escrita/consulta e ação de continuar; landing em 320×568: CTA e rodapé | PASSOU | Demo: documento 320×568 e ação até y554,69; landing: CTA y237,34–281,34, rodapé y536–568. Sem overflow horizontal nesses estados. Viewport emulado, não aparelho físico/teclado real. |
| VIS-06 | Painel em 320 px e desktop, markup real renderizado pela suíte existente; `painel-final-mobile.png`, `painel-final-desktop.png` | PASSOU | Prévia estática isolada de conta vazia, sem Firebase ou envio; não é novo teste autenticado do painel. Documento móvel com 320 px sem overflow. |
| VIS-07 | Gestão/apresentação/conta autenticadas reais após o tema | NÃO EXECUTADO | Estilos foram integrados e seletores revisados. Permanecem as limitações de QA autenticada, comunicações externas e agenda humana do lote 2. |

Capturas desktop em viewport maior que o painel físico do navegador podem ficar recortadas pelo mecanismo de captura; não devem ser usadas sozinhas para inferir corte do produto. Foram conferidas também as caixas DOM dos controles e registradas capturas móveis completas. A prévia final da demo foi deixada aberta em ambiente local, com gravações bloqueadas. Produção permanece sem esta publicação, e assinaturas mensais continuam NÃO DISPONÍVEIS.


## Aceites centrais do lote 2 e das conferências iniciais do tema

Registro recebido da central em 03/11/2026. Os aceites abaixo pertencem à central no alcance expresso; não autorizam publicação nem constituem aprovação estética em nome de Roger.

| Referência | Decisão central registrada | Alcance e limite preservado |
| --- | --- | --- |
| DOC-01R / CTA-01R | APROVADOS LOCALMENTE | Coerência factual dos termos, privacidade, CTA e metadata. Produção permanece divergente até uma publicação coordenada; achados originais reprovados continuam no histórico. |
| REG-07 / VIS-02 | Build isolado APROVADO | A central conferiu os **350 hashes** do snapshot visual atual e encontrou **zero divergências**. O snapshot de 339 arquivos do começo do lote 2 é uma evidência anterior, distinta. Sem novo build/deploy em produção por este aceite. |
| REG-08 / VIS-03 | Regressão automatizada local APROVADA | A central reexecutou **552 testes em 75 arquivos**, em **03/11/2026, início 04:06:53 UTC/Lisboa, exit 0**. Não somar essa reexecução às execuções de 552 do executor, aos 549 testes do lote 1 ou aos 75 reexecutados pela central na revisão daquele lote. |
| UI-05 / UI-06 / EST-03 / PER-07 / PER-08 / RES-03 / UI-07 | Evidências públicas anteriores ao tema ACEITAS | Aceite dos **775 estados anteriores ao tema**, dos três percursos e dos **24 IDs** de estudo com `error`, `correct`, `retry` e `voluntaryModel` verdadeiros. Não transferir esse resultado para os novos estilos nem tratar automação QA como domínio de participantes. |
| AUL-05 | Double OCC APROVADO no escopo simulado | A sobreposição, retries e invariantes de reserva passaram no double. Concorrência e ciclo autenticado em Firestore real continuam pendentes. |
| VIS-05 / VIS-06 | Capturas ACEITAS para os estados e dimensões apresentados | `demo-final-320.png`, `landing-final-320-real.png` e `painel-final-mobile.png`, em **320×568**, foram aceitas como evidência desses estados. O painel é prévia estática isolada. Isso não é aceite estético de Roger, cobertura de todos os estados ou teste de aparelho físico. |

A central orientou continuar pela regressão no navegador após o tema e por prévias dos componentes reais de apresentação, agenda e gestão. Não foi autorizada uma nova direção estética; eventuais correções CSS adicionais devem partir de reprodutor e proposta à central. As integrações reais limitadas por cron/outbox e ausência de emulador, o zoom real e o teclado físico continuam pendentes.

## Rodada 3 — resultados após o tema, aprovados pela central no escopo local

A rodada 3 ampliou a conferência inicial VIS-04 sem alterar novamente o CSS. Foram usados o build isolado pós-tema e prévias dos componentes reais com fixtures, sem dados de Roger. **UI-11, EST-04 e VIS-08 foram APROVADOS pela central no escopo local e nas prévias indicadas**, após a entrega das evidências. O aceite não abrange estética ou integração real. Não houve nova reprovação reproduzível nos casos percorridos nem nova direção estética.

Evidência final: `output/testes-lancamento/2026-11-03-rodada3/evidence-summary.json`, com hashes, timestamps e análise do snapshot final de `browser-states.json` e `study-results.json`. São **771 observações**, não 771 testes independentes: **733 de conversa/estudo** e **38 de prévias** (12 apresentação, 11 gestão e 15 agenda). A observação intermediária da parte 10 foi apenas renomeada para `guided-theme-part10-before-ending`; seu snapshot foi preservado.

| ID | Ambiente / procedimento | Estado | Resultado, evidência e limite |
| --- | --- | --- | --- |
| UI-11 | B; três apoios e dez partes por controles normais, scripts `browser-actor.mjs` e estados pós-tema | PASSOU | Guiado, pistas e autônomo cobriram partes 1–10, conclusão, resumo e link ao estudo. Replay guiado observou as **41 posições de 41**; ajuda voluntária, erro de peças/escrita e rascunho após reload foram conferidos. Capturas `guided-theme-*`, `some-theme-*`, `less-theme-*` e `browser-states.json`. Automação pública anônima QA, não participantes, domínio de inglês ou integração autenticada. Não cobre todos os 128 caminhos no navegador. |
| EST-04 | B; 24 práticas após o tema, por controles visíveis, `study-actor.mjs` | PASSOU | **24 IDs únicos**, todos com `error`, `correct`, `retry` e `voluntaryModel` verdadeiros. Conclusão mostrou 24/24 e 24 tentativas registradas com modelo; reload manteve 24/24. `study-results.json`, `study-theme-24-finished.png`, `study-theme-24-reloaded.png`. Persistência anônima no navegador; não certifica aprendizagem ou sincronização autenticada. |
| VIS-08 | B; componentes reais Presentation, AdminWorkspace, StudentLiveClass e AdminLiveClasses com fixtures locais | PASSOU | Presentation: nove quadros em ordem, salto na revisão, prop de erro e callback final local. AdminWorkspace: visão geral, usuários, filtro, diálogo de edição/foco, mensagens e agenda. StudentLiveClass: fixtures 23 bloqueado/24 com calendário, seleção de slot, confirmação estática, falha de leitura e envio lento recusado. AdminLiveClasses: três status sintéticos e formulário de confirmação com salvamento/falha. **Somente prévias de UI:** sem autenticação, Firebase, sucesso de reserva/decisão, conta criada, e-mail ou persistência. Estados e harnesses em `previews/public-admin/` e `agenda-preview/`; writes sempre recusados. |
| INT-02 | Integrações autenticadas reais com segregação de cron/outbox e dados QA | NÃO EXECUTADO | Permanecem a fila global/consumidor cron e a ausência de ambiente segregado/emulador que garanta não enviar comunicações. Não usou Roger, sessões Google, documentos reais ou slots públicos da operação. Prévias e double OCC não removem esse limite. |
| UI-12 | Zoom real, aparelho e teclado físico | NÃO EXECUTADO | As tentativas anteriores não comprovaram mudança de escala. Viewports emulados e foco por CUA não substituem zoom real ou teclado/dispositivo físico. |

As métricas finais incluem **280 observações em 1200×900, 355 em 320×568 e 136 em 390×844**. Não houve `scrollWidth > width` nos **12 registros com status explícito de transição de entrada**, nem nos **759 demais**; nenhuma caixa de ação medida ultrapassou horizontalmente a janela. Essa amostragem não certifica ausência de todo corte vertical, sobreposição ou estado de animação; a classificação de transição usa o status explícito, não toda animação CSS.

O proxy público recusou **87 POSTs**, todos de `/api/demo/audio`, sem geração. O log da agenda contém **quatro POSTs recusados sem gravação: um smoke HTTP e três da inspeção CUA** (aluno disponível, aluno lento e gestão lenta). A confirmação exibida é fixture, e os estados de envio terminam em recusa explícita; não foram simulados sucessos operacionais. As origens QA 3230–3232 e os servidores de prévia 3227/3228 foram encerrados; evidências preservadas e servidor compartilhado 3000 intacto. Permaneceram apenas o build isolado 3225 e o painel estático 3223. A conferência final do snapshot de 350 arquivos continuou sem divergências.

### Aceite central da rodada 3

Aceite recebido em **03/11/2026**. A central leu esta seção e `evidence-summary.json`, conferiu os SHA-256 dos dois arquivos-fonte contra o resumo e reconfirmou os **771 registros**, a distribuição **280/355/136** e a ausência de `scrollWidth > width` nas observações. Reextraiu das snapshots as partes 1–10 dos três grupos (`guided` + `beginner`, `some`, `less`), conferiu os **24 IDs únicos** e todos os indicadores `error`, `correct`, `retry` e `voluntaryModel` verdadeiros. Recomparou os **350 hashes** do build temático, sem divergências.

A revisão central examinou diretamente `guided-theme-dense-building.png`, `agenda-theme-admin-confirm-dialog-mobile.png` e `presentation-theme-frame3-mobile.png`, além das capturas já revistas no lote 2. O aceite não certifica todos os estados ou quadros de animação; prévia com fixture não equivale a conta, reserva ou autenticação real. A suíte de **552 testes** e o build mantêm a evidência anterior, sem reexecução adicional por este aceite.

A execução desta rodada foi encerrada. As prévias de demonstração utilizadas por Roger foram mantidas, sem encerrar servidor compartilhado ou abas dele. Naquele fechamento, não houve publicação, cobrança ou alteração de serviços remotos; PER-02R/DOC-01R/CTA-01R aguardavam publicação e conferência no domínio. A entrega e o aceite central posteriores estão registrados na seção de publicação abaixo; os não verificados permanecem pendentes.

### Classificação consolidada após a revisão central

- **APROVADO — execução/evidência nos escopos indicados:** correção PER-02R, DOC-01R/CTA-01R, builds/regressões locais, double OCC de AUL-05 e evidências públicas receberam os aceites centrais delimitados já registrados. **UI-11, EST-04 e VIS-08 também receberam o aceite central no escopo local e nas prévias indicadas. PER-02R/DOC-01R/CTA-01R foram posteriormente entregues no domínio e a publicação recebeu o aceite central descrito abaixo.** Capturas aceitas ou testes verdes não equivalem a aprovação estética, de integração real ou de lançamento.
- **REPROVADO — achados históricos corrigidos:** PER-02 original (sobrescrita de progresso), DOC-01 e CTA-01 originais. As respectivas correções passaram no escopo local e foram incluídas na publicação posterior descrita abaixo. A primeira proposta visual também foi rejeitada por Roger e substituída, sem presumir aceite estético do tema novo.
- **NÃO VERIFICADO:** autenticação e persistência/concorrência em Firestore real nesta rodada, OAuth humano, entrega de recuperação/avisos/outbox e ciclo operacional real de aula; zoom real, aparelho/teclado físico; escuta editorial dos 46 MP3s e disponibilidade humana; aprovação estética final de Roger, piloto pago e lançamento. As novas assinaturas mensais permanecem **NÃO DISPONÍVEIS**. Não há aprovação de lançamento gratuito ou pago neste relatório.

## Publicação posterior — pedido direto de Roger em 03/11/2026

Após o fechamento da rodada 3, Roger pediu explicitamente publicar a versão e incluir a landing no mesmo estilo de gibi. A landing já estava coberta pelos estilos compartilhados: foi conferida em desktop e mobile, incluindo a amostra interativa, o painel de informações e o CTA para a demo. **Não houve nova edição de produto ou CSS após o snapshot aprovado.** Os registros anteriores de ausência de publicação descrevem o momento de cada lote; o estado atual de publicação é o desta seção.

- Projeto original: **Vercel `novoessite`**, sem criação de outro projeto ou hospedagem.
- Domínio: **https://www.basedspeak.com**. O alias de produção foi conferido apontando para **`dpl_AdDT9cF1DtaMJKWHatKnBZoKaLZ3`**, estado **READY**; `basedspeak.com` também consta entre os aliases.
- Deployment: `https://novoessite-h3avghp2z-roger-chaves-projects.vercel.app`.
- Base Git: **`dde59f527377f42cb0d85789a0f95b57bc53ddf3` mais as alterações locais de runtime aprovadas**, incluindo tema, conflitos de progresso e correções factuais/CTA. Não houve novo commit ou push por esta publicação.
- O pacote partiu de uma cópia sanitizada dos **350 arquivos** do snapshot temático aprovado, com `vercel.json` e configuração de exclusões do projeto original. A CLI conferiu **347 entradas de envio**, sem `.env`, credenciais, relatórios, artefatos de QA ou arquivos de outros trabalhos. Os 350 hashes do checkout e da cópia de publicação foram reconferidos sem divergência. SHA-256 do manifesto aprovado: `40fa95c3b32395fe88e3aff7a60795a1bcb9386a4356d9c6c3b08a7f2109fe7d`.
- Build de produção: `npm run build`, Next.js 16.2.10, concluído pela Vercel em 03/11/2026, com `Build Completed in /vercel/output [1m]` às **04:34:04 UTC** e promoção posterior confirmada como READY. Não se repetiu a suíte de 552 testes sem mudança de código.

Conferência do executor após a publicação:

| Escopo | Resultado / evidência | Limite |
| --- | --- | --- |
| Landing, demo, estudo, termos, privacidade e login | Seis rotas responderam 200 em produção, localhost 3000 e build isolado 3225. Além do status, os estilos publicados de cada rota tiveram **SHA-256 idêntico aos do build isolado aprovado**; fontes e tokens compartilhados foram encontrados também no localhost. | Não certifica autenticação ou todos os estados das páginas. |
| CTA, amostra e navegação | No navegador, a amostra da landing formou a frase e exibiu o feedback; informações abriram/fecharam; “Começar a conversa” abriu `/demo`. A demo e o estudo carregaram no contexto anônimo, sem começar práticas ou salvar progresso na conta. | Não repetiu os três percursos completos em produção. |
| Fontes e imagens | **24 WebPs e três fontes TTF** baixados do domínio tiveram SHA-256 idêntico aos arquivos locais. Bangers/Barlow foram conferidas na renderização e no estado de fontes carregadas. | Leituras iniciais de fonte/estudo ainda em preparação foram preservadas junto às observações posteriores carregadas; não equivalem a falha de carregamento. Não houve geração ou escuta editorial de áudio. |
| Proteção de conflito entregue | Chunks públicos contêm `LEARNING_SAVE_CONFLICT`, `saveVersion`, título de recuperação e as três ações explícitas de cópia/retomada/escolha. Os arquivos de serviço correspondem ao snapshot incluído no build. | Confirma entrega dos marcadores e fontes; não exercita uma transação de conflito em Firestore real. |
| Desktop/mobile | **32 observações** locais/publicadas em `browser-states.json`; capturas e DOM de páginas em 1000×760 e 390×844, incluindo estados carregados. Landing publicada ficou aberta para Roger; prévias anteriores e servidor compartilhado foram preservados. | São observações de UI, não testes independentes, dispositivo físico ou aceite estético. |

Evidências em **`output/publicacao-gibi-2026-11-03/`**: `publication.json`, `source-snapshot.json`, `deploy-inputs.json`, `deployment.json`, `production-alias.json`, `build.log`, `http-verification.json`, `computed-styles.json`, `browser-states.json`, `landing-publicada-desktop.png` e `landing-publicada-mobile.png`.

### Aceite central da publicação

**PUBLICAÇÃO APROVADA pela central no escopo da entrega pública conferida.** A revisão independente, somente leitura, foi registrada em **03/11/2026 às 04:38:47 UTC/Lisboa**, em `output/publicacao-gibi-2026-11-03/central-review.json`. A central examinou `publication.json`, `build.log`, o alias READY do deployment **`dpl_AdDT9cF1DtaMJKWHatKnBZoKaLZ3`** e `landing-publicada-mobile.png`.

A central confirmou as seis rotas públicas com HTTP 200 e os hashes de todos os CSS servidos iguais à evidência do build isolado/publicação; CTA principal para `/demo`; termos sem a antiga duração ou exigência de aprovação; privacidade com Resend; marcadores `LEARNING_SAVE_CONFLICT`, `saveVersion` e título de recuperação nos chunks públicos. As três fontes responderam 200 e seus hashes conferiram com os arquivos locais; `/dev/testes` respondeu 404. Recomparou as **353 entradas** do `source-snapshot.json` — 350 aprovadas mais itens de empacotamento — e encontrou **zero diferenças** no checkout.

**PER-02R/DOC-01R/CTA-01R já foram entregues no domínio no limite verificado**, mantendo os achados originais como históricos. Os marcadores de bundle e a conferência de fontes não comprovam um conflito transacional real em Firestore. Os 552 testes locais permanecem como evidência anterior, sem nova execução por este aceite.

Os demais limites permanecem: esta publicação não concede aceite de autenticação real, recuperação/avisos, ciclo real de aula, áudio editorial, disponibilidade humana, zoom/dispositivo físico, estética final ou lançamento comercial. Não houve cobrança, envio de mensagens, regeneração de mídia, alteração de configurações remotas ou uso do progresso de Roger. Assinaturas mensais continuam NÃO DISPONÍVEIS. Nenhuma nova ação operacional foi executada para registrar o aceite.

## Revisão visual ampliada após a captura do cabeçalho

Novo pedido direto de Roger em 03/11/2026: corrigir o topo da landing e fazer uma conferência visual maior. A revisão pública anterior não detectou a moldura indevida; métricas de overflow e controles visíveis não bastavam para aceitar bordas e sombras. A investigação/correção desta rodada está detalhada por achado em `output/revisao-visual-2026-11-03/RELATORIO.md`, com diff, imagens e geometria antes/depois.

| ID | Achado / tratamento | Resultado local |
| --- | --- | --- |
| V-01 | Border-width ativava os quatro lados de headers/footers sobre o preflight. Separadores direcionais explícitos, com folga para a sombra do Entrar. | PASSOU |
| V-02 | Footer compacto não contabilizava a borda e podia gerar cerca de 1px de rolagem. Alturas mínimas corrigidas sem esconder overflow global. | PASSOU |
| V-03 | Cadastro pequeno iniciava recortado; já havia acesso por scroll. Espaçamento e composição baixos agora preservam cartão/sombra no primeiro enquadramento nos casos conferidos. | PASSOU |
| V-04 | Em 1280×720, pintura do cadastro ultrapassava o main apesar de os controles caberem. Espaçamento compacto estendido ao desktop baixo. | PASSOU |
| V-05 | Em 768×1024, sombra de 5px cortada nos três modos de acesso. Área externa do scroll estendida em 6px por lado, mantendo a geometria interna. | PASSOU |
| V-06 | Demo horizontal exigia scroll sob o header; construção/pistas mostravam peças parcialmente. Grade e espaços baixos corrigidos, preservando arte, texto e ações; dica junto à resposta em pistas. | PASSOU |
| V-07 | Cobertura de entrada começava em 64px enquanto header terminava em 50px. Token alinhado: header/cover/token 50/50/50 durante a cobertura, sem mudar timers/keyframes. | PASSOU |

A suspeita de arcos fechados no painel **NÃO FOI CONFIRMADA**: os lados intencionalmente abertos continuam `0px none`, sem alteração em `comic-dashboard.css`. A faixa preta da captura **NÃO FOI REPRODUZIDA** nem atribuída ao produto. A largura representativa de 1239px CSS foi incluída sem presumir que os 2478px físicos da captura fossem pixels CSS.

Matriz CSS: **320×568, 390×844, 768×1024, 1024×768, 1239×780, 1280×720, 1440×900, 1920×1080, 568×320 e 844×390**. Capturas/JSON incluem versões intermediárias e finais de landing/drawer, acesso e erros simulados, três apoios/ajuda/histórico/escrita, estudo, painel, apresentação, agenda e gestão. A pintura do cartão e sua sombra foram verificados contra todos os ancestrais de overflow, além de foco/controles. **42 verificações geométricas passaram**, incluindo os **30 estados comuns finais de signup/login/reset**; o mesmo cálculo identifica os quatro recortes antigos de V-04/V-05. Evidência: `verify-layout.py` e `layout-verification.json`. Não são novos testes de lógica nem uma auditoria de cada pixel.

Erros extensos, tabelas e diálogos mantêm rolagem intencional e têm evidência de foco/alcance. Áreas privadas e erros de autenticação são componentes reais com fixtures/adapters, sem Firebase ou operações externas. As capturas estáticas adicionais da apresentação usam sua preferência real de movimento reduzido na fixture. Não se repetiram os 552 testes ou os percursos públicos completos sem mudança de lógica. Dispositivo/teclado físico, zoom real, autenticação real, e-mail, aula operacional e áudio editorial continuam não verificados.

O build **final2 da central** passou, com **351 arquivos**, manifesto SHA-256 `253c6144a0ee45d6de1c4f29d7b931ce4f728adee56c949fa0255633cefcc74b`, sem diferenças contra o checkout. CSS congelado: `comic-public.css` = `4bef624e213b9ff4764af371530bb07bd1fa2328ab98efac3c499440fcc5005f`; `comic-demo.css` = `457b9f5f77fa481d7f4199b5fc35448fab91667a7bd37141fdef9a53d4cfaa8c`. Somente esses dois arquivos de runtime foram alterados; o servidor/.next compartilhado 3000 foi preservado.

O deployment READY **`dpl_6TsZL7C69H9bzLs5b5uYkeFCxnJf`** entregou o snapshot intermediário `92e0…` antes de V-04/V-05. **Não contém final2.** Foi substituído pela entrega definitiva abaixo; os achados originais e limites anteriores permanecem históricos/delimitados.

### Publicação e aceite final2 desta revisão

**FINAL2 PUBLICADO E APROVADO PELA CENTRAL no escopo visual conferido.** Deployment **`dpl_5qfuQFnkifhcSWEbZhMxcLEzTgEU`**, **READY**, alias efetivo **https://www.basedspeak.com**; URL `https://novoessite-7psr92e72-roger-chaves-projects.vercel.app`. Build remoto concluído em **03/11/2026 às 05:35:12 UTC/Lisboa**, em 48s. Foi enviado somente o snapshot final2 `253c…` mais configuração original de deploy, sem credenciais/artefatos de QA. Base Git `dde59f527377f42cb0d85789a0f95b57bc53ddf3` mais alterações locais aprovadas, sem novo commit ou push.

A central leu o relatório e o verificador, reexecutou as **42 verificações geométricas**, encontrou zero falhas e confirmou que o mesmo cálculo detecta os quatro recortes históricos. Revalidou os 351 hashes do build e os hashes congelados dos dois CSS, liberando a publicação definitiva. Na revisão independente do domínio às **05:38:14 UTC/Lisboa**, conferiu seis rotas 200, todos os CSS com hash igual à versão aprovada, **354 entradas do snapshot de fonte sem divergência** e manifesto final2 correto. Evidência: `output/revisao-visual-2026-11-03/publication-final2/central-review.json`.

Conferência independente no navegador do domínio, com fontes carregadas: landing 1239×780 com header [0,0,2,0] e folga Entrar4px; landing320×568 com doc568/footer34; cadastro1280 com sombraBottom663,375 < main680; cadastro/login768 com sombraRight741 < main742; cadastro320 com sombraBottom526,125 < main534. Artefatos independentes em `output/revisao-visual-central-2026-11-03/paint-publicado-final2.json` e `publicado-*`.

O executor também conferiu cadastro320/768/1280/844, login/reset768, estudo320, demo guiada568 e diálogo dos três apoios. Cobertura em produção: header/cover/token **50/50/50**. CSS das seis rotas é idêntico ao build final isolado3247; **24 imagens e três fontes** conferiram bytes/hash; CTA, marcadores de conflito e marcadores CSS finais foram encontrados. Os 46 URLs únicos do catálogo existente foram entregues no HTML, sem regeneração de áudio. Leituras transitórias de navegação/resize foram preservadas; o aceite se apoia em estados carregados e revisão independente, não em cada captura imediata. Os três apoios ativos foram amostrados nas prévias; não foram repetidos todos os percursos no domínio.

Registro final em `output/revisao-visual-2026-11-03/publication-final2/{publication.json,deployment.json,production-alias.json,build.log,source-snapshot.json,http-verification.json,published-*}` e no relatório por achado. A revisão encerrou sem reprovação visual conhecida pendente nos casos finais conferidos. Prévias privadas continuam **PRÉVIAS**, e não integração autenticada. Não há novo aceite de autenticação/Firestore/e-mail, operação real de aula, áudio editorial, zoom/dispositivo físico, estética final ou oferta paga; assinaturas mensais continuam NÃO DISPONÍVEIS. Nenhuma nova edição de runtime/deploy será feita por mero registro deste aceite.

Auxiliares próprios da auditoria encerrados; listeners 3000, 3223 e 3225 e páginas entregues foram preservados. A landing final publicada ficou aberta. Registro da limpeza em `publication-final2/cleanup.json`; nenhum novo ciclo de testes/deploy foi iniciado para documentar o aceite.


### Publicação definitiva — aceite central (03/11/2026, 05:38 UTC)

**Entrega visual final2 publicada e aprovada pela central no escopo conferido.** O deployment `dpl_5qfuQFnkifhcSWEbZhMxcLEzTgEU` está READY em produção, com alias `https://www.basedspeak.com` (e `basedspeak.com`). O deployment `dpl_6TsZL7C69H9bzLs5b5uYkeFCxnJf` descrito acima é somente intermediário; o estado vigente é esta publicação definitiva.

A fonte corresponde ao manifesto final2 `253c6144a0ee45d6de1c4f29d7b931ce4f728adee56c949fa0255633cefcc74b`, com 351 arquivos aprovados e build isolado de produção concluído com exit 0. A revisão independente da central comparou as 354 entradas do pacote de publicação (fonte e configuração de empacotamento) ao checkout, sem divergências. Em seis rotas públicas, os HTTP 200 foram acompanhados de conferência dos hashes de todos os CSS servidos, iguais aos da versão aprovada. Evidência: `output/revisao-visual-2026-11-03/publication-final2/central-review.json`.

No navegador do domínio, a central conferiu novamente a landing em 1239×780 e 320×568, o cadastro em 1280×720, 768×1024 e 320×568 e o login em 768×1024. As fontes carregaram, o cabeçalho ficou com somente o separador inferior e 4px de folga para a sombra de Entrar. As pinturas do cadastro ficaram dentro do main: no desktop, sombra inferior em 663,375px para limite de 680px; no tablet, sombra direita em 741px para limite de 742px; no celular, sombra inferior em 526,125px para limite de 534px. A observação inicial do desktop com fonte ainda carregando foi reconferida após `document.fonts.ready`, sem mudança de geometria. Capturas e medidas independentes estão em `output/revisao-visual-central-2026-11-03/`, incluindo `paint-publicado-final2.json` e `landing-corrigida-publicada-desktop.png`.

A central leu o relatório de achados, revisou as correções CSS e reexecutou `verify-layout.py`: **42 verificações passaram**, e o mesmo cálculo identificou os quatro recortes anteriores. Os aceites V-01–V-07 referem-se aos casos finais e ambientes documentados, sem garantir todos os estados ou pixels. Prévias de áreas privadas continuam sendo componentes reais com dados simulados; dispositivo/teclado físico, zoom real, autenticação real, e-mails e operação real de aula não foram comprovados por esta revisão. O aceite visual/publicação não equivale a aprovação comercial do curso.

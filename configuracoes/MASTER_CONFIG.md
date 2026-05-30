# ES ACADEMY - MASTER CONFIG & LOG
**REGRA DE OURO:** NUNCA apagar ou modificar linhas antigas. Apenas adicionar novas linhas ao final do arquivo. Modificações são permitidas apenas para marcar os checkmarks [ ] como [x].

**REGRA DE ISOLAMENTO:** Ao editar conteúdos (Pilares), selecionar SEMPRE apenas uma "Parte" (Módulo) por vez. NUNCA modificar partes não selecionadas. O restante do arquivo deve permanecer INTACTO para evitar erros de contexto.

## 📋 STATUS GERAL DO PROJETO
- [x] Implementação de TTS (Google/Web Speech) - **CONCLUÍDO**
- [x] Conteúdo Real: Pilar 1 - **CONCLUÍDO**
- [x] Conteúdo Real: Pilar 2 - **CONCLUÍDO**
- [ ] Conteúdo Real: Pilar 3
- [x] Conteúdo Real: Pilar 4
- [x] Conteúdo Real: Pilar 5
- [x] Conteúdo Real: Pilar 6
- [ ] Conteúdo Real: Pilar 7
- [ ] Conteúdo Real: Pilar 8
- [ ] Conteúdo Real: Pilar 9
- [ ] Conteúdo Real: Especialidades (Todas)
- [ ] Integração de Pagamento Real (Stripe/Mercado Pago)
- [ ] Painel Admin: Gestão de Alunos e Aprovação

---

## 🛠️ LOG DE EXECUÇÃO (HISTÓRICO)
- [x] Criar pasta `configuracoes` no diretório raiz. (24/02/2026)
- [x] Criar arquivo `MASTER_CONFIG.md` com as regras de preservação. (24/02/2026)
- [x] Criar arquivo `TTS_CONFIG.md`.
- [x] Criar arquivos de conteúdo `PILAR_01.md` até `PILAR_09.md`.
- [x] Definir estratégia técnica para TTS ilimitado.
- [x] Iniciar implementação técnica do TTS.
- [x] Concluir criação do Hook `useTTS.ts`, Componente `AudioButton.tsx` e injeção em `PillarOperationalView` e `TranslatablePhrase`.
- [x] Conferência e validação técnica do sistema TTS concluída. (24/02/2026)
- [ ] Refinar qualidade da voz para modelos mais humanos e naturais (Neural/Natural).
- [x] Implementada lógica de seleção de vozes "Neural" e "Online" para máxima qualidade gratuita. (24/02/2026)
- [!] Ajuste 1: A qualidade da voz ainda soa robótica. Iniciando refinamento profundo de seleção de motores de voz. (24/02/2026)
- [x] FIX: Erro '{}' na Web Speech API corrigido com lógica de fallback resiliente e debounce. (24/02/2026)
- [x] Ajuste 2: Falha detectada no fallback do Google (Erro 403 ou CORS). Implementando URL alternativa e tratamento de erro silencioso. (24/02/2026)
- [x] Ajuste 3: VOZES ROBÓTICAS BLOQUEADAS. Implementado sistema de prioridade de vozes Premium (Neural/Natural/Online) e fallback nativo de nuvem (Youdao Neural). (24/02/2026)
- [ ] Validar e testar no browser (Chrome/Edge/Safari).
- [x] Refatorar `pillars-content.ts` dividindo em arquivos individuais e criar novo conteúdo exclusivo para Pilar 2. (24/02/2026)

---

## 🔄 ATUALIZAÇÃO CONSOLIDADA (22/05/2026)

### ✅ CONCLUÍDO
- [x] Pilar 4 reestruturado em módulos (`p4-m1` até `p4-m6`) com lógica moderna de progressão e validação embutida.
- [x] Pilar 4 revisado com foco em engenharia da frase, menos repetição e mais clareza operacional.
- [x] Pilar 5 redefinido oficialmente para `Números, Dinheiro e Decisões`.
- [x] Pilar 5 reescrito em módulos (`p5-m1` até `p5-m6`) cobrindo números, preços, datas, horários, pagamento, salário e negociação.
- [x] Currículo alinhado com o novo Pilar 5.
- [x] Página inicial alinhada com os títulos e descrições oficiais dos pilares.
- [x] Removida a lógica de fallback genérico de perguntas repetidas no fechamento dos módulos.
- [x] Corrigida a regra: se o módulo já termina com avaliação própria, essa avaliação já vale como avanço.
- [x] Corrigida renderização de trechos bilíngues em blocos que estavam descartando tradução.
- [x] Revisão de repetição feita nos pilares 1 a 5, com checagem de quizzes duplicados retornando `0` grupos repetidos.

### ⏳ FALTA FAZER
- [ ] Fechar `Conteúdo Real: Pilar 3` no mesmo padrão já consolidado dos pilares 4 e 5.
- [ ] Construir `Conteúdo Real: Pilar 6`.
- [ ] Construir `Conteúdo Real: Pilar 7`.
- [ ] Construir `Conteúdo Real: Pilar 8`.
- [ ] Construir `Conteúdo Real: Pilar 9`.
- [ ] Construir `Conteúdo Real: Especialidades (Todas)`.
- [ ] Fazer revisão visual em browser dos pilares já refeitos para validar ritmo, espaçamento, travas e UX final.
- [ ] Validar se os quizzes finais por pilar continuam coerentes com os conteúdos mais recentes, especialmente do Pilar 4 em diante.

### 🚫 NÃO PRECISA MAIS
- [x] Não faz mais sentido tratar o Pilar 5 como `Pronúncia & Fluência`.
- [x] Não faz mais sentido manter desafio extra genérico no fim de módulo que já se encerra com quiz, jogo ou checagem própria.
- [x] Não faz mais sentido manter nomes antigos divergentes entre currículo, conteúdo interno e página inicial para os pilares já alinhados.

### 🧭 REGRA OPERACIONAL ATUAL
- [x] Sempre que um pilar for concluído ou reestruturado de verdade, atualizar este arquivo no mesmo ciclo.
- [x] Sempre registrar aqui quando algo saiu de escopo, foi substituído por outra decisão ou deixou de fazer sentido.

---

## 🔄 ATUALIZAÇÃO CONSOLIDADA (22/05/2026 - PILAR 6 INICIADO)

### ✅ CONCLUÍDO NESTE CICLO
- [x] Pilar 6 reconstruído do formato legado para o formato modular novo.
- [x] Definida oficialmente a direção do Pilar 6 como `Conversação Prática`, alinhada ao currículo.
- [x] Escritos `p6-m1` e `p6-m2` com foco em resposta sem colapso, turn-taking, small talk, follow-up e fechamento educado.
- [x] Criado esqueleto alinhado para `p6-m3` até `p6-m6`, mantendo a progressão do pilar organizada desde já.

### ⏳ FALTA FAZER NESTE PILAR
- [ ] Escrever `p6-m3` com foco em falar da propria vida, rotina, trabalho, cidade e gostos.
- [ ] Escrever `p6-m4` com foco em opiniao, concordancia, discordancia e reacao.
- [ ] Escrever `p6-m5` com foco em historias curtas e situacoes reais.
- [ ] Escrever `p6-m6` com foco em conversa encadeada e consolidacao final.
- [ ] Revisar o quiz final do Pilar 6 quando o pilar estiver completo, para nao deixar prova antiga de outro tema.

### 🚫 NAO FAZ SENTIDO MANTER
- [x] Nao faz mais sentido manter no Pilar 6 o conteudo antigo de `Laboratorio de Fala` com foco central em fonoaudiologia, shadowing e prosodia como eixo do pilar.
- [x] Nao faz mais sentido deixar o Pilar 6 em formato legado de bloco unico enquanto os pilares 4 e 5 ja operam em modulos claros.

---

## 🔄 ATUALIZAÇÃO CONSOLIDADA (22/05/2026 - PILAR 6 AVANCO 2)

### ✅ CONCLUÍDO NESTE CICLO
- [x] Escritos `p6-m3` e `p6-m4` no mesmo padrao dos modulos 1 e 2.
- [x] `p6-m3` agora cobre origem, cidade, trabalho, rotina e interesses com respostas mais conversaveis.
- [x] `p6-m4` agora cobre opiniao, pedido de opiniao, concordancia, discordancia e reacao com mais tato e naturalidade.
- [x] Validacao tecnica do Pilar 6 atualizada com `eslint` e `tsc --noEmit` sem erro.

### ⏳ FALTA FAZER NESTE PILAR
- [ ] Escrever `p6-m5` com foco em historias curtas e situacoes reais.
- [ ] Escrever `p6-m6` com foco em conversa encadeada e consolidacao final.
- [ ] Revisar o quiz final do Pilar 6 quando o pilar estiver completo, para substituir de vez a prova antiga.

---

## 🔄 ATUALIZAÇÃO CONSOLIDADA (22/05/2026 - PILAR 6 CONCLUÍDO)

### ✅ CONCLUÍDO NESTE CICLO
- [x] Escritos `p6-m5` e `p6-m6` no mesmo padrao dos modulos anteriores.
- [x] `p6-m5` agora cobre historias curtas, sequencia de fatos, explicacao de problema e fechamento com resultado ou aprendizado.
- [x] `p6-m6` agora integra resposta, small talk, fala pessoal, opiniao, retomada e fechamento em conversa encadeada.
- [x] Quiz final do Pilar 6 substituido para refletir o conteudo novo do pilar.
- [x] `Conteúdo Real: Pilar 6` marcado como concluido no status geral.

### ⏳ O QUE AINDA FALTA NO PROJETO
- [ ] Fechar `Conteúdo Real: Pilar 3` no mesmo padrão já consolidado dos pilares 4, 5 e 6.
- [ ] Construir `Conteúdo Real: Pilar 7`.
- [ ] Construir `Conteúdo Real: Pilar 8`.
- [ ] Construir `Conteúdo Real: Pilar 9`.
- [ ] Fazer revisão visual em browser dos pilares já refeitos para validar ritmo, espaçamento, travas e UX final.

---

## 🔄 ATUALIZAÇÃO CONSOLIDADA (28/05/2026 - PACOTE A / PROGRESS CONTRACT SEED)

### ✅ CONCLUÍDO NESTE CICLO
- [x] Criada a base técnica inicial de progressão em `src/lib/progress/contract.ts`.
- [x] Congelada a matriz de decisão para transição `Pilar 1 -> Pilar 2`.
- [x] Congelada a matriz de decisão para transição `Pilar 2 -> Pilar 3`.
- [x] Formalizados os campos iniciais de contrato: `blockedReason`, `nextAction`, `ProgressDecisionSeed` e `ProgressSnapshotSeed`.
- [x] Formalizada a regra de fase atual: `Pilar 2` só abre com `premium/admin` + `Pilar 1` academicamente fechado (`módulos completos + prova enviada/aprovada`).
- [x] Formalizada a regra de fase atual: `Pilar 3` só abre com `premium/admin` + `Pilar 2` com módulos completos + prova aprovada + aula ao vivo confirmada/concluída.
- [x] Registrado `legacyAccessOverride` como escape temporário de migração para evitar corte abrupto de acesso já concedido por regra antiga.

### ⏳ FALTA FAZER NESTA FRENTE
- [ ] Plugar o contrato novo em um serviço server-side de derivação de `progressSnapshot`.
- [ ] Parar de usar `approvedPillar` como mistura de progressão acadêmica e desbloqueio comercial.
- [ ] Parar de persistir `localPillarStatus` como fonte remota de gating.
- [ ] Migrar leitores do app (`dashboard`, `PillarPageClient`, `ExamFeedbackPopup`, SSR e `ProgressContext`) para o snapshot novo sem regressão.

### 🚫 AINDA NAO DEVE ACONTECER NESTA RODADA
- [x] Nao foi alterado o gating global do app nesta rodada.
- [x] Nao foi reescrito o `ProgressContext` em profundidade nesta rodada.
- [x] Nao foi trocado ainda o comportamento legada de `approvedPillar`; apenas foi congelado o contrato tecnico que vai substituir essa ambiguidade.

---

## 🔄 ATUALIZAÇÃO CONSOLIDADA (28/05/2026 - PACOTE C / CAMADA PUBLICA DE RECONCILIACAO)

### ✅ CONCLUÍDO NESTE CICLO
- [x] `/api/verify-payment` passou a normalizar a resposta publica de verificacao em um contrato explicito com `success`, `isPaid`, `status`, `reconciliationState`, `message` e `shouldStopPolling`.
- [x] A camada publica ficou preparada para estados controlados de reconciliacao como `manual-reconciliation` e `unresolved`, mesmo sem quebrar o fluxo feliz atual de PIX/cartao.
- [x] `PagamentoPageClient` deixou de tratar falha de reconciliacao como silencio total e agora mostra mensagens seguras quando a cobranca precisa de conferencia manual ou cai em estado nao confiavel.
- [x] O polling da pagina passou a poder pausar com seguranca quando a API sinaliza reconciliacao manual/controlada, mantendo o redirecionamento feliz quando o premium entra de fato.

### ⏳ FALTA FAZER NESTA FRENTE
- [ ] Endurecer `payments/service.ts` para devolver estados autoritativos de reconciliacao manual/orfa, sem fallback automatico para `lifetime`.
- [ ] Unificar o contrato de concessao premium entre pagamento e convite em uma rotina server-side unica.
- [ ] Reduzir o fallback legado de sessao/cookies na camada publica assim que o restante do Pacote C e o Pacote D estiverem integrados.

### 🚫 NAO FOI ALTERADO NESTA RODADA
- [x] Nao foi mexido em `payments/service.ts`.
- [x] Nao foi mexido em `auth/service.ts`, `AuthContext.tsx` ou `api/auth/*`.
- [x] Nao foi alterado o fluxo feliz de redirecionamento para `thank-you` quando o pagamento entra como confirmado.

---

## 🔄 ATUALIZAÇÃO CONSOLIDADA (28/05/2026 - PACOTE D / LEITORES DO APP E LIMPEZA CLIENT-SIDE)

### ✅ CONCLUÍDO NESTE CICLO
- [x] `ProgressContext` passou a preferir `progressSnapshot` quando ele existir para `currentPillar`, `highestUnlockedPillar`, `completedPillars` e `eligibleForSpecialization`.
- [x] `ProgressContext` parou de persistir `localPillarStatus` no sync remoto padrão, removendo o client como autoridade remota de gating no fluxo normal.
- [x] O auto-unlock premium client-side foi removido de `AuthContext`.
- [x] O unlock no submit premium do `PillarExamModal` foi removido; o modal agora apenas refresca o perfil quando necessário.
- [x] `dashboard`, `PillarPageClient` e `ExamFeedbackPopup` passaram a preferir `progressSnapshot.nextAction` e `highestUnlockedPillar` antes da lógica legada espalhada.
- [x] O SSR de especialidade passou a preferir `progressSnapshot.eligibleForSpecialization`, mantendo fallback para `localPillarStatus` apenas como compatibilidade transitória.

### ⏳ FALTA FAZER NESTA FRENTE
- [ ] Migrar o backend escritor para gravar `progressSnapshot` de forma consistente em todos os caminhos de progressão.
- [ ] Reduzir o fallback legado baseado em `approvedPillar` assim que o snapshot estiver presente para todos os usuários relevantes.
- [ ] Remover o fallback de `localPillarStatus` do SSR de especialidades depois do backfill do snapshot.
- [ ] Revisar `setPillarLevel` e demais ferramentas de dev/admin para alinhar overrides explícitos ao modelo novo sem depender de `approvedPillar`.

### 🚫 NAO FOI ALTERADO NESTA RODADA
- [x] Nao foi mexido em `src/lib/progress/*`.
- [x] Nao foi mexido em `exam/service.ts`, `scheduling/service.ts`, `payments/service.ts` ou `auth/premium-access.ts`.
- [x] Nao foi eliminado totalmente o fallback legado de `approvedPillar`; ele segue ativo apenas para transicao segura enquanto o snapshot ainda nao cobre todos os casos.

---

## 🔄 ATUALIZAÇÃO CONSOLIDADA (30/05/2026 - PACOTE D FECHADO / PACOTE E ENDURECIMENTO DE REGRAS)

### ✅ CONCLUÍDO NESTE CICLO
- [x] O backend escritor passou a gravar `progressSnapshot` nos caminhos principais de progressão: convite, pagamento, prova e scheduling.
- [x] `auth/premium-access.ts` foi transformado em adaptador do contrato novo, removendo a derivação paralela de snapshot que competia com `src/lib/progress/service.ts`.
- [x] A ativação por convite em `api/auth/invite` passou a recomputar `progressSnapshot` e a espelhar `approvedPillar` só como compatibilidade transitória.
- [x] O `Pacote D` foi validado com `tsc`, `eslint` focado e `build` de produção.
- [x] O fallback global de `firestore.rules` foi removido.
- [x] `firestore.rules` agora restringe `users`, `pillar_exams`, `live_sessions`, `access_requests`, `invite_codes`, `payment_attempts` e `webhook_events` explicitamente, em vez de confiar em `allow read, write` amplo para autenticados.
- [x] Escritas sensíveis de conta (`subscriptionStatus`, `paymentId`, `progressSnapshot`, `inviteCodeUsed`, entre outras) deixaram de ser permitidas para o próprio aluno via regra genérica de `users`.
- [x] O `leaderboard` deixou de depender de leitura aberta da coleção `users` e passou a usar a rota protegida `api/leaderboard`.
- [x] `access_requests` ganhou validação mínima de payload nas regras, reduzindo margem para escrita frouxa por cliente autenticado.

### ⏳ FALTA FAZER NESTA FRENTE
- [ ] Reduzir o fallback legado baseado em `approvedPillar` assim que o snapshot estiver presente para todos os usuários relevantes.
- [ ] Remover o fallback de `localPillarStatus` do SSR de especialidades depois do backfill do snapshot.
- [ ] Revisar `setPillarLevel` e demais ferramentas de dev/admin para alinhar overrides explícitos ao modelo novo sem depender de `approvedPillar`.
- [ ] Fazer uma passada de QA dirigida nas superfícies admin que ainda usam Firestore client-side sob as regras novas.

### 🚫 NAO PRECISA MAIS
- [x] Nao existe mais `fallback` global de leitura/escrita para qualquer autenticado em `firestore.rules`.
- [x] Nao existe mais derivação duplicada de snapshot competindo entre `auth/premium-access` e `progress/service`.

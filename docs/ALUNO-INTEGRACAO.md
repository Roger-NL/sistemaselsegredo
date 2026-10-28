# Integração da experiência do aluno

Registro da integração do aluno. As etapas históricas e seus testes estão preservados abaixo; o fluxo vigente de acesso gratuito foi atualizado em 28/10/2026.

## Demo livre e continuidade na conta — 28/10/2026

`/demo` e `/demo/estudo` abrem sem cadastro ou aprovação. O avanço anônimo fica no cache separado `basedspeak.learning.guest.v1`, sem ler caches antigos ou dados privados de contas. A interface informa que esse avanço está neste navegador. Contas `pending` e `active` também podem praticar e sincronizar; suspensão e rejeição continuam impedindo a prática naquela conta. Painel, mensagens, agenda e ADM mantêm autenticação e validação de identidade.

Ao entrar numa conta vazia, a pessoa pode escolher **Salvar este percurso na minha conta**, com confirmação que identifica a conta. Não há associação automática. O endpoint `/api/student/learning/import` valida origem, UID e snapshots, e recusa atomicamente contas com revisão posterior a zero, qualquer snapshot salvo ou agendamento. O cache anônimo é removido somente após confirmação do servidor. Leituras concorrentes são serializadas durante a importação; uma leitura anterior não pode apagar o percurso recém-salvo. Progresso existente em qualquer dispositivo é preservado.

O agendamento continua liberado apenas com as **24 práticas salvas** e exige conta; não exige aprovação da demo. Quem conclui sem entrar pode criar a conta, confirmar a associação do percurso e pedir a aula sem refazer o estudo. As aprovações administrativas permanecem como revisão cadastral, sem travar a experiência gratuita.

Validação real no Chrome: visitante iniciou a cafeteria, retomou após recarregar, concluiu a primeira prática do estudo e manteve 1/24 após reload. Ao entrar numa conta QA vazia, confirmou a associação na própria página; a conversa e o estudo passaram a aparecer nessa conta, inclusive pela API de produção. Nove verificações HTTP confirmaram persistência, recusa de importação sobre progresso existente, identidade protegida, ADM privada e agenda ainda bloqueada em 1/24. A QA foi removida ao final, preservando as 15 contas originais, estudo e agendamento do proprietário. Evidências em `output/reception-qa/public-integration.json` e capturas `public-*`/`guest-import-*`.

## Integrações já implementadas

- `/dashboard` agora exige conta real (removido bypass visual da página), com Minha história, Meu avanço, Minhas atividades e contato com professor.
- Conversa e estudo usam `GET /api/student/workspace` e `PUT /api/student/learning`, com snapshots completos e `learning.revision`.
- Cache novo tem namespace por uid + revisão; nunca se leem/importam caches antigos anônimos, nem se vinculam automaticamente a uma conta.
- Toda gravação valida novamente o uid/status/revisão por GET; `409` descarta pendências, remove cache obsoleto, invalida componentes antigos e recarrega GET. Resposta tardia após logout é ignorada.
- `pending` pode usar painel, contato, conversa e estudo; o requisito da aula é concluir as 24 práticas.
- Nova conversa/resposta via APIs do contrato, confirmação somente após persistência, rascunho mantido em memória em falha, respostas do professor disponíveis em Atualizar painel e ao voltar à aba.
- A avaliação final da história agora envia conversa real ao professor (assunto Avaliação da conversa da cafeteria); removidos texto de prévia e rascunho compartilhado em storage.

## Coordenação com a conversa principal

`src/config/access.ts` e a entrada `/comecar` ainda mostravam acesso visual no browser durante a primeira verificação, em 27/10. Esta conversa removeu o bypass somente nas páginas `/dashboard` e `/demo`, deixando configuração e auth principal com o trabalho central. É necessário que a entrada real de login/cadastro esteja habilitada na integração final.

## Validação concluída

- Suíte completa executada: **50 arquivos e 348 testes passando** (antes dos testes adicionais de backend/origem da conversa principal).
- Última rodada direcionada após ajustes finais: **6 arquivos e 52 testes passando**: sincronização do workspace, UI do aluno, acesso autenticado, percurso conversa/estudo, navegação e layout da história.
- ESLint dos arquivos cliente e testes alterados: sem erros.
- TypeScript conjunto: `npx tsc --noEmit` concluído sem erros após o último ajuste da conversa principal nos testes administrativos.
- `git diff --check`: sem problemas de whitespace.
- Revisão visual estática do dashboard vazio, a partir do próprio componente e CSS, em 1440×1000, 390×844 e 320×740; sem overflow horizontal. O harness fica em `/tmp`, fora da aplicação, e não adiciona rota ou modo demonstração ao produto. Evidências: `/tmp/basedspeak-aluno-desktop.jpg` e `/tmp/basedspeak-aluno-mobile.jpg`.
- Conferido no navegador que `/dashboard` sem sessão redireciona para login. A verificação autenticada end-to-end em Firebase e o build conjunto ficam com a conversa principal, que informou estar usando uma conta QA temporária; não criei contas/dados paralelos e não executei build durante seu E2E.

## Arquivos principais

- `src/features/dashboard/workspace-store.ts`: store testável, fila serial de gravação, revalidação de UID/revisão, recuperação de erros e descarte de épocas antigas.
- `src/features/dashboard/use-student-workspace.ts`: carga validada por montagem, atualização ao retomar a aba/conexão e aviso antes de fechar com salvamento pendente.
- `src/features/dashboard/StudentSections.tsx` e `dashboard.css`: avanço, atividades e mensagens responsivos; sem exemplos, contatos ou métricas inventadas.
- `src/features/demo/session/browser.ts`, `DemoHost.tsx`, `DemoExperience.tsx`: snapshots da conta e token de geração para impedir callbacks obsoletos após reset/troca de usuário. O armazenamento anônimo legado permanece intacto, mas não é usado pela UI autenticada.
- `src/features/theory/TheoryExperience.tsx`: estudo derivado do snapshot remoto, gravação no workspace e preservação do rascunho em memória durante revalidações da mesma conta.
- `src/features/demo/components/Feedback.tsx`: avaliação opcional persistida na conversa com professor, sem sucesso fictício.
- `src/components/navigation/AppHeader.tsx`: atalhos para atividades, avanço e professor.
- `tests/student-workspace-client.test.ts` e `tests/student-dashboard-ui.test.ts`: 21 testes novos; mocks antigos de UI/acesso ajustados à autenticação real.

## Comportamento de retomada

Snapshots vindos do GET são a fonte de verdade. O cache de escrita é isolado por UID e revisão, mas não é importado automaticamente ao abrir novamente uma página, evitando reenvio silencioso de tentativas antigas. Em falha de rede, a fila fica em memória, a prática é pausada e o botão de tentar novamente valida UID/revisão antes de reenviar. O status só informa sincronização após confirmação do servidor; a UI avisa antes de fechar a página com trabalho em salvamento. O contato mantém o texto após uma falha de envio e só adiciona conversas/mensagens confirmadas pela API.

### Verificação de UID em mutações (integrada)

O cliente faz GET de validação antes de cada PUT/POST, mas há uma janela entre essa leitura e a gravação em que outra aba pode substituir o cookie da sessão. Por isso, os PUT/POST do workspace agora enviam também `X-Workspace-Uid` com o UID validado. Para garantir a separação de contas inclusive nessa corrida, a conversa principal deve comparar esse header com `principal.uid` nas mutações de aluno em `workspaceApi`, antes de chamar o handler (retornar 401/409 quando diferente). Isso complementa, sem substituir, a autenticação do backend; não altera os corpos do contrato. Testes cliente verificam que o UID validado é enviado. Sem essa comparação no servidor, o preflight GET cobre a troca normal de conta, mas não pode garantir a janela entre duas requisições.

A integração principal implementou a exigência de `X-Workspace-Uid` nas mutações de aluno em `workspaceApi`: ausência ou divergência retorna 409 antes do handler. Foram adicionados testes de correspondência, divergência e ausência. A entrada `/comecar` também foi reativada com autenticação real e os componentes/flag de prévia foram removidos.

## Correção da navegação do dashboard

Roger relatou atalhos sem resultado e demora para voltar da conversa. Os destinos de seção podiam ser procurados antes de o workspace renderizar, e cada montagem de tela validava novamente e ocultava a sessão já carregada.

A validação e os eventos de sessão agora pertencem a `StudentWorkspaceSession`, persistente no layout raiz. Painel, conversa e estudo compartilham o estado validado; a troca entre essas rotas atualiza atividade e respostas em segundo plano, após confirmar as gravações pendentes. A entrada em autenticação limpa a sessão anterior; retomada da aba, falhas, logout, revisão e mudança de acesso conservam as verificações. Respostas antigas de leitura não substituem progresso mais novo salvo enquanto a requisição estava em andamento.

Os atalhos do menu repetem a localização da seção depois da carga, inclusive no próprio painel e saindo da abertura em diálogo. O título recebe foco e fica abaixo do cabeçalho fixo. A troca entre seções do painel substitui o fragmento diretamente, sem nova navegação de servidor nem acúmulo de fragmentos. As rotas principais são pré-carregadas. O cartão e Meu avanço mostram a parte real do journal e oferecem retomada da mesma conversa, sem converter posição na história em porcentagem de aprendizagem.

Conferência autenticada no Chrome com uma conta QA temporária: atalhos para avanço, atividades, professor e estudo; conversa percorrida até a parte 3; retorno ao painel em aproximadamente 0,8 s no servidor local de desenvolvimento; retomada na parte 3 com o apoio iniciante preservado; reload também restaurou a parte 3 a partir do Firebase. Em 390×844, o contato abriu com o título abaixo da barra, sem overflow horizontal. Não foram enviadas mensagens ao professor. Evidências em `output/navigation-qa/`.

# Administração e experiência do aluno

A área `/adm` usa Firebase Authentication e Firestore reais. Não há contas ilustrativas, armazenamento administrativo em `localStorage` ou operações simuladas. `/dashboard` reúne história, avanço, atividades e contato com professor, usando a mesma base.

## Acesso e contas

`/adm/entrar` oferece e-mail/senha, Google e recuperação de senha. A sessão é um cookie HTTP-only verificado no servidor, inclusive revogação. Cada API administrativa exige a claim verificada `admin: true`, confere a claim atual no Firebase e exige conta ativa. A permissão inicial do titular foi configurada conforme o e-mail indicado pelo usuário. A rota não aparece nos menus públicos, tem `noindex, nofollow` e está excluída do sitemap e do robots; a autorização é feita independentemente dessas medidas de descoberta.

As métricas e a lista usam contas de Firebase Auth, combinadas por UID com perfis e progresso. Perfis órfãos não aumentam o total. Contas antigas com perfil, sem `accountStatus`, mantêm acesso ativo. Novas contas e identidades sem perfil começam como pendentes. Um erro de consulta aparece como erro, sem preencher exemplos nem apresentar zero como se fosse uma leitura bem-sucedida.

## Operações

- Criar conta cria um login real no Firebase e um perfil pendente. O link de definição de senha é exibido para compartilhamento com o titular; essa operação não envia e-mail.
- Editar atualiza nome/e-mail no Firebase Auth, nome/e-mail/observações no perfil e a claim de manager quando aplicável. Campos financeiros permanecem preservados.
- Aprovar libera a prática; reprovar e suspender desabilitam o login e revogam sessões. Reativar habilita o login novamente. O manager não pode suspender, rebaixar ou redefinir o próprio login pelo painel.
- Redefinir login gera um link real de senha e revoga os refresh tokens. O link não é salvo no histórico nem no banco. A recuperação solicitada pelo próprio titular na tela de login usa o envio padrão do Firebase.
- Zerar progresso apaga os snapshots de conversa/estudo e incrementa a revisão. Escritas antigas recebem 409, descartam as pendências da época anterior e recarregam a conta. O histórico registra o reset sem apagar as atividades anteriores.
- Atividade mostra os últimos 150 registros de gestão persistidos, com titular, autor e horário. O aluno vê os últimos 100 registros de sua própria atividade.

Mutações de uma mesma conta são serializadas por uma trava no Firestore, com expiração. Firebase Auth e Firestore não compartilham transação; quando uma gravação de perfil falha, o serviço tenta restaurar a identidade anterior e nunca confirma uma gravação não persistida. Uma falha parcial não compensada é apresentada para revisão.

## Progresso e contato

`learning_states/{uid}` armazena snapshots completos, métricas derivadas, revisão e atualização. A conversa é validada por replay do journal; sua porcentagem usa atividades de resposta/compreensão com evidência, não avanço manual de teste. Estudo usa os IDs das 24 práticas. A porcentagem geral na lista administrativa é a média entre a porcentagem da conversa e a proporção de práticas de estudo concluídas. O detalhe da conta separa essas medidas; não é uma nota nem avaliação de proficiência.

O cliente não importa tentativas anônimas antigas para uma conta. Revalida identidade/status/revisão antes de gravar; o header `X-Workspace-Uid` também precisa corresponder à sessão na própria mutação para impedir corridas entre abas com contas diferentes. A prática fica bloqueada para pendentes, mas painel e contato continuam disponíveis.

Mensagens de alunos são persistidas em `teacher_conversations` e aparecem em **Mensagens** no ADM. A resposta do professor volta à mesma conversa e gera atividade no aluno. O manager pode responder e encerrar uma conversa; o aluno pode responder enquanto aberta ou iniciar outra. Cada conversa admite até 100 mensagens, corpo até 4.000 caracteres e documento até 750 KB. Não há contato fictício, e-mail externo ou WhatsApp inventado. Os painéis administrativo e do aluno consultam novamente a cada 30 segundos enquanto visíveis, ao retomar a janela e pelo botão Atualizar. O painel do aluno destaca respostas disponíveis e abre a conversa correspondente, sem contagem fictícia de não lidas.

## Acompanhamento dos alunos

A aba **Alunos** reúne, por conta, a posição real na conversa, as práticas de estudo concluídas, o último avanço salvo e o estado da aula gratuita. A visão geral tem contadores clicáveis para aprovação, ausência de início, conversa, estudo, liberação da agenda, pedido de aula, confirmação e aula realizada. Os filtros também permitem consultar acessos indisponíveis, buscar nome/e-mail e limpar uma seleção sem resultados.

Os totais consideram somente identidades Auth com perfil de aluno. A opção **Incluir contas de manager** permite conferir contas de gestão que também praticam, sem misturá-las aos totais iniciais. Perfis e reservas órfãos não criam alunos. A classificação usa o ponto recuperável da conversa, em vez de exigir 100% das atividades de todos os ramos, e deriva o estudo dos IDs válidos no snapshot salvo. A mesma função confere elegibilidade no agendamento e na gestão; contadores antigos isolados não liberam uma aula.

Um pedido ou aula já existente continua visível mesmo após reset do progresso ou suspensão de acesso. Conta, avanço e reserva são apresentados separadamente. Cancelamentos liberam nova escolha somente se a conta estiver ativa e o estudo concluído; aulas realizadas não voltam a ser classificadas como disponíveis para agendamento. Último acesso ao login não é tratado como prática de estudo.

**Ver conta** abre os controles da pessoa selecionada. **Ver agendamento/Conferir pedido** abre a agenda filtrada por UID. **Mensagens** abre somente as conversas daquela pessoa, com a quantidade que aguarda resposta. Um aviso de contexto oferece retorno aos alunos ou remoção do filtro. As ações administrativas existentes continuam exigindo confirmação e autorização; navegar nestas áreas não cria reservas nem envia mensagens.

Dados são reunidos no `GET /api/admin/workspace`, com a autorização e os headers privados existentes. Os reads de progresso e reservas são feitos em lote, sem uma consulta adicional por aluno. Erro de leitura continua sendo erro, sem preencher dados fictícios. Datas de avanço usam o fuso do navegador; datas de aulas mostram o fuso gravado na reserva.

Verificação desta entrega: 379 testes em 55 arquivos, lint, TypeScript e build; testes cobrem elegibilidade por práticas válidas, posição da conversa, reservas após reset, separação de managers, busca, ordenação e associação de reservas à conta. Navegação real conferida no Chrome em computador e celular, abrindo conta, mensagens e agendamento a partir do acompanhamento.

## Agenda da aula gratuita

A aba **Agenda** recebe pedidos reais da aula gratuita liberada após as 24 práticas do estudo. Permite confirmar, fornecer/editar link da aula, cancelar com motivo e registrar realização. Estado e link ficam disponíveis no painel do aluno, com histórico nos dois lados. O benefício não exige Premium. Contratos, limites da disponibilidade inicial e validação estão em [Aula ao vivo](AULA-AO-VIVO.md).

## API e persistência

Contratos em `src/contracts/workspace.ts` e `src/contracts/management.ts`. Serviços em `src/server/workspace` e `src/server/management`; interfaces em `src/features/dashboard` e `src/features/admin`.

- `GET /api/admin/workspace`: contas, progresso, histórico e conversas reais.
- `POST /api/admin/users`: criação, edição, decisões e resets.
- `POST /api/admin/conversations/[id]/messages`: resposta do professor.
- `GET /api/student/workspace`: dados do próprio aluno.
- `PUT /api/student/learning`: progresso validado com revisão.
- `POST /api/student/conversations` e `/[id]/messages`: contato com professor.

Respostas de workspace são privadas e sem cache. Mutações exigem mesma origem usando o Host real; não se confia em `x-forwarded-host`. Novas coleções são acessíveis somente pelo servidor. As novas funções usam Node e região `iad1`, na América do Norte, próxima à base Firestore `nam5`. As regras publicadas no Firestore usam claims e negação por padrão; usuários não podem criar o próprio perfil nem escrever aprovação, progresso, histórico ou conversas diretamente pelo SDK. Leitura do próprio perfil e edição limitada de campos pessoais foram preservadas.

## Validação

Testes de unidade e integração cobrem autorização, origem, UID, validação, criação/compensação, suspensão, revisão de progresso, histórico, propriedade de mensagens e sincronização no cliente. A verificação no navegador usa Firebase real e uma conta temporária removida ao finalizar; não deixa exemplos na base. A integração conjunta aprovou 354 testes em 51 arquivos, lint, TypeScript e build de produção. No build de produção local, a verificação autenticada confirmou login real por senha definida pelo link gerado, aprovação, exercício de estudo persistido/visível no ADM, início e retomada da conversa após reload, contato/resposta, reset por revisão, revogação, suspensão/reativação e logout. Requisições diretas de um aluno ao perfil de outra pessoa ou à própria aprovação foram recusadas pelas regras publicadas. Desktop e mobile foram conferidos. O OAuth completo do Google depende da interação do titular e não foi automatizado nesta verificação.

Referências de integração: [gerenciamento de usuários](https://firebase.google.com/docs/auth/admin/manage-users), [links de ação de e-mail](https://firebase.google.com/docs/auth/admin/email-action-links), [revogação de sessões](https://firebase.google.com/docs/auth/admin/manage-sessions) e [publicação de regras](https://firebase.google.com/docs/reference/rules/rest/v1/projects.releases/patch).

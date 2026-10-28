# Coordenação das áreas de aluno e administração

A implementação integrada compartilha `src/contracts/workspace.ts` e o Firebase já configurado no projeto.

Responsabilidade da conversa principal: todos os serviços em `src/server`, rotas em `src/app/api`, contratos em `src/contracts`, área `/adm`, política de contas e integração final no Git.

Responsabilidade da conversa Aluno: UI do aluno, navegação de aluno, hooks no cliente e sincronização da conversa e do estudo nas features correspondentes. Não editar backend nem contratos sem coordenação.

As rotas e os corpos de requisição estão descritos no contrato. A API sempre retorna dados reais ou um erro; não retorna exemplos. As contagens iniciais podem ser zero. `learning.revision` é uma época incrementada apenas quando o manager zera o progresso. Escritas de épocas anteriores retornam 409 e o cliente deve recarregar o estado, remover snapshots obsoletos e não reenviar o progresso anterior.

Contas antigas sem status explícito são ativas. Contas novas ficam pendentes de revisão cadastral, com painel, contato, conversa e estudo disponíveis; a demo gratuita não depende de aprovação. O agendamento exige conta válida e 24/24 práticas salvas. Contas suspensas ou rejeitadas permanecem bloqueadas. Managers são identificados pela claim Firebase `admin: true`, não por campos editáveis do perfil. A área administrativa tem login próprio com as mesmas credenciais Firebase e validação dessa claim. Visitantes podem praticar anonimamente com cache separado no navegador; a continuidade explícita numa conta vazia está documentada em `ALUNO-INTEGRACAO.md`.

Coleções novas, somente pelo servidor: `learning_states`, `student_activity` (subcoleção de users), `teacher_conversations`, `management_activity`. Mensagens ficam no array da conversa, com limite de 100 e conteúdo textual até 4.000 caracteres. O assunto aceita até 160 caracteres. A criação é um pedido real ao professor; o manager lê e responde no painel.

O responsável pela integração roda a suíte e o build após ambas as áreas concluídas e faz commit/push em `master`, sem criar branch.

Integração concluída: a conversa Aluno entregou os componentes e o cliente; a principal implementou o backend e a comparação de `X-Workspace-Uid`, retirou o bypass visual restante e validou as duas áreas no Firebase real. O documento ADMINISTRACAO.md descreve o estado vigente.

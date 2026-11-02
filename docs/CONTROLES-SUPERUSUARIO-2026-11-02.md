# Controles exclusivos de teste — 02/11/2026

## Identidade e limites

A única identidade autorizada é a conta Firebase já existente solicitada por Roger. O UID foi localizado por `getUserByEmail`, com e-mail verificado e conta habilitada. A política `src/server/superuser/policy.ts` exige simultaneamente o UID fixado no servidor, o e-mail canônico atual, verificação e conta habilitada. Nenhum UID, e-mail, papel ou flag enviados pelo navegador concede acesso. Um papel de manager, sozinho, não concede acesso.

A consulta dos usuários do Firebase não encontrou claims anteriores de superusuário/teste. Portanto não houve permissões antigas para remover. Papéis administrativos existentes foram preservados. Não foi criada outra conta nem alterada a identidade do Roger.

A engrenagem aparece no topo do painel, conversa, estudo, apresentação e ADM apenas depois de o servidor reconhecer essa identidade. A rota privada é `/api/student/test-controls`: GET consulta acesso; POST aplica a ação à própria conta da sessão. Cada ação revalida a identidade atual via Firebase Admin, sessão válida, origem, UID da sessão, revisão e payload limitado. Visitantes recebem 401; outras contas, inclusive managers, 403. Alterar o browser para mostrar o botão não autoriza a API.

## Estudo e controles implementados

| Área | Controles | Efeito no banco e coerência |
| --- | --- | --- |
| Introdução da conta | Reexibir introdução; marcar como vista | Altera `presentationCompletedAt` e incrementa `presentationRevision`. Não altera status, assinatura ou papel. |
| Entrada da conversa | Mostrar apresentação da demo; iniciar em um dos três apoios | Remove ou recria a tentativa da conversa. O estudo permanece independente. |
| Conversa | Recuar uma tela; avançar um momento; avançar uma parte | Usa o mesmo reducer da demo. O avanço produz respostas simuladas válidas; recuar descarta o futuro daquele percurso. |
| Partes | Ir a qualquer parte; completar a parte escolhida | Reconstrói um prefixo coerente da conversa, incluindo pré-requisitos. Não grava uma conclusão isolada sem história anterior. |
| Momentos e apoio | Ir a um nó, incluindo ramificações; aplicar apoio | Escolhe o caminho necessário e mantém diário serializável. O apoio segue as regras da demo, sem trocar retroativamente evidências antigas. |
| Estudo | Posicionar em qualquer prática; marcar concluída ou pendente; completar ou zerar estudo | Preserva as demais práticas. Conclusões simuladas são marcadas com apoio. Abrir prática selecionada usa a posição persistida. |
| Retrospectiva | Preparar final, resumo, despedida ou conclusão | Completa o caminho simulado antes da tela escolhida. |
| Replay | Abrir cenas e áudios da conversa concluída | Consulta as falas registradas, sem reiniciar nem criar outra tentativa. O atalho só aparece quando a conversa está concluída. |
| Processo inteiro | Completar tudo; zerar todo o progresso; recomeçar como percurso normal | Inclui introdução, conversa e estudo. Reset completo também remove os eventos de aprendizagem da própria conta. Voltar ao modo normal sempre exige reset: não converte conclusões simuladas em aprendizagem real. |
| Acesso à aula | Consultar o estado existente pelo painel | Progresso simulado não libera novas reservas. Reserva já existente permanece intacta. |

As ações alteram `learning_states/{uid}` de verdade. Cada ajuste incrementa `revision`; o registro técnico de ação/revisão fica em `learning_test_audit`. Reset completo não apaga esse registro de auditoria. Por solicitação posterior de Roger, os resets agora são **imediatos, com um clique**. Não há frase digitada, tela de confirmação nem campo de confirmação na API. A exclusividade da identidade, origem e revisão permanece obrigatória.

“Zerar tudo” não apaga usuário, pagamentos, reservas, mensagens, mídia, cache global ou dados de outras pessoas. Histórico antigo de mensagens/agendamento e auditoria administrativa não é progresso de aprendizagem e permanece preservado. Para manter o reset atômico, mais de 449 eventos de aprendizagem recusam a operação inteira, sem reset parcial; nesse caso é necessária uma rotina administrativa paginada específica.

## Sincronização e efeitos externos

- Uma revisão antiga não pode salvar depois de reset, salto ou conclusão via controles. A transação recusa a escrita com 409, inclusive quando uma aba já havia verificado o estado antes do ajuste.
- A UI descarta edições pendentes e invalida componentes antigos; outras abas recebem um sinal de atualização. Esse sinal só pede uma leitura ao servidor, sem conceder permissões ou fornecer o novo progresso.
- A apresentação também tem revisão: uma conclusão enviada por uma tela anterior ao reset é recusada. Respostas antigas de leitura não substituem o estado novo da apresentação.
- Ajustes mantêm `testMode` persistido. O botão passa a indicar “Teste”. Novas respostas nesse percurso não enfileiram notificações de conclusão nem eventos que aparentem aprendizagem legítima.
- Avaliações são desativadas na UI e recusadas no servidor para teste ou revisão antiga. Respostas simuladas não liberam uma nova reserva, inclusive por chamada direta. A gestão não contabiliza esse progresso como avanço normal.
- Contato manual, gestão e reservas reais já existentes continuam funcionalidades independentes: o painel de teste não as simula nem executa automaticamente.
- O painel `/dev/testes` existente continua sendo uma **simulação local isolada**, claramente distinta da engrenagem que grava na conta. Ele permanece bloqueado em produção.

## O que foi verificado

- 523 testes em 70 arquivos passaram, incluindo os testes anteriores de migração cafe-v8, replay e isolamento local.
- Testes das rotas: visitante, manager diferente, UID/e-mail forjado, e-mail não verificado, conta desabilitada, origem cruzada, revisão antiga, payload extra, índices e nós inválidos e campos extras.
- Modelo: todos os dez saltos de parte e conclusão por parte, todos os nós/ramificações nos três apoios, avanço/recuo, retrospectiva e alteração individual das 24 práticas. Os snapshots continuam aceitos pelo validador normal.
- Serviços com banco isolado: conclusão e reset persistem no documento correto; ações concorrentes com a mesma revisão têm apenas um vencedor; saves antigos são recusados; introdução é realmente reiniciada; mensagens, reserva, mídia e outra conta permanecem idênticas.
- Novas reservas e avaliações são recusadas para conclusão simulada. A continuidade normal de um percurso de teste não produz aviso de conclusão.
- Cliente: invalidação de componentes/edições antigas, substituição pela resposta do banco, recarga após conflito e recusa de controles para conta comum.
- A primeira versão tinha confirmação digitada; foi substituída por comandos diretos após a revisão de Roger. O menu agora traz ações rápidas, links para as páginas e grupos curtos: introdução, conversa, apoio/partes, estudo e final. No QA da conta real, apenas o menu é aberto; nenhum reset é acionado.

Lint sem avisos, TypeScript e compilação passaram. No computador (1440×900), o painel inteiro coube na janela e seus botões não transbordaram horizontalmente; o conteúdo longo usa rolagem interna. O resultado da publicação e as evidências locais ficam em `output/superuser-2026-11-02/`. A verificação da conta real é exclusivamente de leitura, incluindo comparação de hashes do progresso e reserva antes/depois. Os testes de mutação usam banco em memória; não houve reset, conclusão ou reserva real do Roger para QA.

## Controles deliberadamente fora do painel

Não há troca de identidade, alteração de papéis ou assinatura, remoção de usuário, pagamento, reserva real, mensagem, disparo de e-mail ou geração de mídia. A disponibilidade do professor e a aprovação auditiva humana continuam pendentes da entrega anterior. Simular novos estados operacionais de reserva/mensagens exigiria um ambiente de dados separado; não deve ser feito sobre registros reais para acelerar testes da demo.

## Simplificação do menu

A engrenagem abre todas as áreas em um único menu. “Apagar tudo” e “Completar tudo” ficam no início. Há atalhos visíveis para painel, conversa, estudo, cenas/áudios quando disponíveis, aula e ADM quando a conta é manager. Todos os comandos existentes permanecem disponíveis, organizados em cartões curtos, em duas colunas no computador e uma coluna no celular. Cabeçalho e retorno do comando ficam visíveis enquanto o conteúdo rola.

## Retorno ao começo e ao ponto salvo

Depois de “Apagar tudo” ou “Começar do zero, sem simulação”, o painel fecha e abre `/dashboard` sem fragmentos antigos como `#aula-ao-vivo`. A introdução é carregada novamente a partir do estado reiniciado no banco. A reserva existente continua preservada em sua seção, mas não toma a prioridade do novo percurso: em uma revisão reiniciada, o cartão principal oferece começar/continuar a conversa, depois o estudo. Conclusões simuladas não mostram agenda liberada.

Os cartões inteiros de conversa e estudo são links acessíveis por mouse, toque e teclado, inclusive quando ainda não há conversa iniciada. O cartão da conversa abre `/demo` com a tentativa salva; o estudo abre a prática selecionada. Testes cobrem início vazio e parte 2 com reserva confirmada preservada, avanço para estudo, conclusão simulada, destino limpo de reset e os links dos cartões.

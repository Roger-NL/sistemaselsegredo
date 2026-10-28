# Aula gratuita da cafeteria

Implementada em 28/10/2026. No painel, Minha aula ao vivo aparece junto da conversa e do estudo, com atalho no menu compartilhado. A agenda é bloqueada até que a conta ativa tenha as 24 práticas concluídas no snapshot de estudo salvo. O servidor deriva essa condição dos IDs válidos; não utiliza a porcentagem geral nem exige Premium, pagamento ou espera de sete dias.

A agenda inicial oferece todos os dias e horários futuros, em intervalos de uma hora, no mês atual e nos dois seguintes. O fuso aparece explicitamente nas duas áreas: `LIVE_CLASS_TIMEZONE`, depois `GOOGLE_CALENDAR_TIMEZONE`, depois `Europe/Lisbon`. Horas locais inexistentes por mudança de horário são omitidas. A disponibilidade é a da agenda interna do BasedSpeak; não representa consulta ou sincronização com o Google Calendar.

O aluno escolhe dia/horário e solicita a aula. O pedido persistido aparece em ADM → Agenda, com aluno, e-mail, horário, fuso e status. A gestão pode confirmar e fornecer link HTTPS da sala, atualizar o link, cancelar com motivo ou registrar a aula como realizada após seu horário de término. Sem link, a interface orienta enviar instruções pelo contato existente. Nenhuma sala de vídeo é criada automaticamente, nem são enviados e-mails ou convites externos.

A confirmação, o motivo de cancelamento e o link ficam disponíveis no mesmo cartão do aluno. Agenda e status atualizam ao retomar a janela e a cada 30 segundos, com atualização manual na ADM e pelo painel. O calendário mostra dias/horas realmente disponíveis; horários passados e já reservados não são selecionáveis.

Cada UID possui um único registro em `demo_live_classes`. Repetições do mesmo pedido são idempotentes; uma reserva pendente, confirmada ou realizada impede outra aula. Cancelar libera o horário e permite uma nova escolha no mesmo registro. Reiniciar o estudo ou zerar o progresso não apaga reservas nem cria outro direito; após um cancelamento, a conclusão do estudo é novamente exigida para reservar.

As reservas de horário usam documentos em `demo_live_class_slots`, criados na mesma transação do pedido. Uma disputa concorrente pelo mesmo horário tem um único vencedor. As decisões usam revisão para recusar formulários antigos e não podem reabrir uma aula realizada. Pedidos e decisões geram atividade para o aluno e para a gestão na mesma transação. As coleções novas são acessadas apenas pelo servidor e já estão cobertas pela negação por padrão das regras existentes.

Rotas privadas, Node, região iad1:

- `GET /api/student/live-class?month=YYYY-MM`: progresso conferido, estado da aula e disponibilidade da própria conta.
- `POST /api/student/live-class` com `{ start }`: solicita uma reserva; sessão, origem, UID e conta ativa conferidos; rate limit aplicado.
- `GET /api/admin/live-classes`: agenda real, exclusiva para manager ativo.
- `POST /api/admin/live-classes` com `{ id, revision, decision, reason?, meetingUrl? }`: confirma, cancela ou conclui; mesma origem e autorização administrativa.

As integrações antigas de agenda/pagamento continuam preservadas. As novas coleções tratam exclusivamente da aula gratuita da demo; não substituem reservas Premium históricas nem sincronizam bloqueios de outras agendas. A disponibilidade inicial ampla deve ser substituída pela disponibilidade real do professor quando ele definir seus horários.

Validação: 373 testes em 54 arquivos, lint e build de produção aprovados. Testes de elegibilidade, reservas/repetições, colisão, cancelamento/remarcação, confirmação, revisão, consumo do benefício e mudança de horário. QA com Firebase/Auth reais e rotas HTTP: 23/24 bloqueado, requisição direta recusada, 24/24 liberado, UID/origem inválidos recusados, aluno sem acesso à ADM, dois alunos concorrendo pelo mesmo horário com um vencedor, pedido visível na ADM, confirmação no aluno e liberação após cancelamento. Evidências locais em `output/live-class-qa/` (ignoradas pelo Git); identidades de QA são temporárias e removidas ao final. No Chrome, conferidos cartão bloqueado, agenda mobile, pedido enviado, recebimento na ADM e confirmação, em 1440×900, 390×844 e 320×568 sem overflow horizontal nos estados medidos.

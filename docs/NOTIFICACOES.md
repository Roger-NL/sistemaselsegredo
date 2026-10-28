# Avisos operacionais por e-mail

O destinatário responsável escolhido é **raugerac@gmail.com**. A ADM permite salvar outro e-mail, pausar os envios e consultar a fila e os últimos 20 eventos. A preferência é persistida em `settings/operational_notifications`; o navegador nunca recebe a chave de envio.

## Eventos conectados

- Novo perfil após um cadastro autenticado: uma vez por aluno. A demo e o estudo são livres; a revisão cadastral na ADM não bloqueia essa experiência gratuita.
- Conclusão da conversa da cafeteria: uma vez por aluno, com um percurso salvo e replayável até o fim. Atalhos antigos `TEST_FORWARD` não contam. As ramificações não escolhidas não impedem o aviso.
- Conclusão de todas as 24 práticas do estudo guiado: uma vez por aluno. Contadores antigos sem atividades salvas não comprovam conclusão.
- Pedido de aula gratuita: um aviso por pedido real; tentativas repetidas do mesmo agendamento não duplicam o aviso. Uma nova solicitação após cancelamento é um novo evento.
- Nova mensagem do aluno ao professor. O e-mail contém a identificação do aluno e um link para a ADM; o assunto e o corpo da conversa ficam no painel.

Os avisos são gravados em `operational_notifications` na mesma transação ou lote Firestore do evento correspondente. Uma falha de entrega não desfaz cadastro, progresso, mensagem ou agendamento. Eventos anteriores à implementação não são reconstruídos nem enviados em massa. Reiniciar o estudo e concluí-lo outra vez não duplica avisos de conclusão já registrados.

## Ativação do envio

Configure exclusivamente no ambiente de servidor da Vercel:

| Variável | Uso |
| --- | --- |
| `RESEND_API_KEY` | Credencial do serviço transacional Resend. |
| `NOTIFICATION_FROM_EMAIL` | Caixa remetente em um domínio verificado no Resend, por exemplo `avisos@notify.basedspeak.com`; sem nome de exibição. |
| `CRON_SECRET` | Segredo aleatório de no mínimo 16 caracteres, enviado pela Vercel como `Authorization: Bearer ...`. |

A ausência de remetente ou chave mantém os avisos pendentes, sem tentativas externas. A ADM informa que falta conectar o serviço. Informar o destinatário não comprova que o domínio remetente ou o serviço de entrega já estejam configurados. O estado “aceito pelo serviço de e-mail” comprova a resposta da API; não comprova chegada à caixa de entrada ou leitura.

Após configurar as variáveis e publicar, valide o remetente no Resend e o envio de um evento autorizado. Contas técnicas usadas para QA e seus registros de outbox devem ser removidos antes da ativação para evitar avisos de teste na caixa do responsável. Não remova avisos legítimos de alunos.

### Ativação concluída — 28/10/2026

O domínio `notify.basedspeak.com` foi verificado no Resend, região Irlanda, com recebimento desativado. Foram adicionados apenas o TXT DKIM e os dois CNAMEs de envio; os 14 registros anteriores da zona Amen foram preservados. O remetente é `avisos@notify.basedspeak.com`. A chave criada possui somente permissão de envio e está nas variáveis privadas da Vercel e no ambiente local ignorado pelo Git. O plano pago não foi contratado: a integração nativa da Vercel recusou o plano Free, então foi usada a conta direta existente do Resend.

Um cadastro QA pelo serviço real em produção gerou o evento às **16:53:18 UTC**, e o Gmail de `raugerac@gmail.com` recebeu o aviso às **16:53:20 UTC**, na caixa de entrada. Os cabeçalhos confirmaram **SPF e DKIM aprovados** para o domínio configurado. A ADM mostrou envio ativo, um evento aceito e fila vazia. Esse teste comprova o cadastro e a entrega desse aviso; os demais eventos têm cobertura automatizada dos seus gatilhos, deduplicação e fila. Evidências sanitizadas: `output/reception-qa/notification-delivery.json`, `resend-domain-verified.png` e `notifications-active.png`.

## Entrega e recuperação

O `after()` do Next executa uma tentativa após a resposta ao evento, usando o `waitUntil` da plataforma. Além do evento novo, até dois avisos anteriores já vencidos são processados. O envio HTTP possui timeout de 8 segundos; cada processamento usa no máximo cinco eventos. Não há fila em memória nem daemon.

O endpoint `/api/cron/notifications` exige `CRON_SECRET`. O cron em `vercel.json` roda diariamente às **08:00 UTC**, frequência compatível com Vercel Hobby. O cron diário é uma recuperação adicional e não promete novas tentativas a cada minuto. O botão “Processar pendentes” na ADM permite conferir os avisos vencidos; também respeita os limites, leases e prazos de segurança. O cron só é ativado no deploy de produção.

Cada aviso tem um ID de evento determinístico, lease transacional de um minuto e uma chave de idempotência no Resend. Após a primeira tentativa, o envelope (remetente, destinatário e conteúdo) fica fixo; trocar o responsável afeta os avisos ainda não iniciados e os próximos eventos, sem modificar uma tentativa incerta.

Falhas transitórias (rede, HTTP 429 e 5xx) recebem tentativas com intervalo crescente. Erros definitivos ficam como `failed`. Uma tentativa incerta com mais de **23 horas** desde o primeiro envio vai para `needs_review` em vez de ser reenviada: a chave de idempotência do Resend expira após 24 horas. Confira os logs do provedor antes de qualquer novo envio manual. A aplicação não reenvia automaticamente eventos nessa condição e não garante entrega exatamente uma vez fora da janela do provedor.

## Verificação

Testes cobrem criação atômica, primeira conclusão, repetição após reset, ausência de backfill, isolamento do conteúdo de mensagens, configuração e pausa, concorrência de processadores, idempotência, recuperação de lease, envelope estável, prazo de segurança, erros do serviço e autenticação do cron. Os testes usam um provedor simulado e não enviam e-mails externos.

Referências primárias consultadas: [API de envio do Resend](https://resend.com/docs/api-reference/emails/send-email), [idempotência e validade de 24 horas](https://resend.com/docs/dashboard/emails/idempotency-keys), [Next.js after](https://nextjs.org/docs/app/api-reference/functions/after), [segurança e limites de cron na Vercel](https://vercel.com/docs/cron-jobs/manage-cron-jobs).

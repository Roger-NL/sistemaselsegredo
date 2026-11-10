# Reset completo da conta de teste — 04/11/2026

Pedido direto de Roger: tornar o botão Teste identificável no mobile e fazer **Apagar tudo** limpar o percurso e os agendamentos da sua única conta ADM, inclusive nos outros aparelhos. Este contrato substitui a preservação de mensagens/reservas descrita no histórico de 02/11.

## Exclusividade e efeito

O servidor continua exigindo a identidade proprietária fixa, e-mail canônico verificado e conta habilitada, além de sessão, origem, UID e tokens atuais. Ser manager/ADM não basta. O comando não recebe um UID alvo arbitrário e não atinge outras contas.

`reset-all` apaga introdução concluída, conversa, estudo, atividades, mensagens com o professor, agendamentos e locks próprios de horário, incluindo os registros legados reconhecidos. A operação incrementa `learning.revision`, `saveVersion` e `presentationRevision` na mesma transação. Identidade, login, acesso ADM, registros financeiros, mídia e configurações globais são preservados. O registro técnico do comando permanece como auditoria.

Os controles parciais e **Começar do zero, sem simulação** mantêm seus escopos anteriores; somente **Apagar tudo** tem essa remoção operacional ampliada. Conclusão simulada continua sem liberar novas reservas.

As exclusões são planejadas antes das escritas e restritas a documentos próprios. Locks com UID explícito de outra conta são preservados. Lock legado sem UID exige vínculo com sessão comprovadamente própria. Documento canônico com proprietário incompatível, volume acima do limite seguro ou aviso em processamento recusam a operação inteira, sem sucesso parcial. O reset não chama provedores externos: eventos já criados no Google Calendar e e-mails já enviados não são apagados no provedor.

## Outros aparelhos e requisições antigas

Enquanto visível, a conta proprietária consulta o estado do servidor a cada cinco segundos no painel, demo, estudo e gestão; retorno ao app e reconexão também verificam o estado. A verificação não aguarda salvamentos/importações pendentes. A mesma frequência não é adicionada à prática de alunos comuns. Um aparelho offline só recebe o novo estado quando consegue comunicar com o servidor.

Ao receber revisão diferente, o cliente descarta rascunhos e recuperação da época antiga, invalida respostas pendentes e remonta estudo, agenda e contato. A apresentação é reconsultada. Mudança apenas de `saveVersion` preserva a base de edição; não transforma uma gravação concorrente em reset. Um sinal local de outra aba pede validação no servidor e não apaga rascunhos por si só.

Após o comando, o cliente recarrega o workspace completo. Se essa leitura falhar depois do reset confirmado, os dados operacionais removidos não reaparecem na cópia local. Respostas antigas de controle, gravação ou importação não substituem a revisão nova nem liberam a fila de um comando mais recente. Mensagens novas do proprietário exigem a revisão de aprendizagem e são criadas transacionalmente, para uma aba anterior ao reset não recriar dados. A sincronização legada de agenda revalida existência/proprietário/estado após I/O externo e não recria sessões apagadas.

## Botão e verificação

**Teste** fica rotulado tanto no percurso normal quanto no simulado, com alvo mínimo de 44 px, contorno e amarelo da identidade de gibi. O cabeçalho se compacta quando o controle existe em larguras até 390 px; convidados e demais usuários continuam sem o botão. O painel bloqueia clique duplicado antes do próximo render.

Evidências em `output/owner-reset-2026-11-04/`: `backend`, `ui`, `auditoria`, `cliente`, `integrado` e publicação. Testes usam componentes/regras reais com transporte e persistência simulados, incluindo dois clientes, PUT/importação/controle retidos, recuperação antiga, exclusividade, locks e atomicidade. Houve reproduções vermelhas antes e validações verdes depois. Nenhum reset real, reserva ou envio foi usado no QA. A geometria do cabeçalho foi analisada com fontes locais e restrições CSS; não é uma inspeção visual em dispositivo. A autorização anterior do navegador para localhost permanece bloqueada e não foi contornada.

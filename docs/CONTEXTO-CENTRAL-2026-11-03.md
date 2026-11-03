# BasedSpeak — contexto central de planejamento

Consolidação de 03/11/2026 solicitada por Roger para reduzir a quantidade de conversas. A referência para produto, avaliação, mercado, lançamento, divulgação e próximos passos é **Ideia geral do projeto**, conversa `01a13326-bfa1-7193-b54f-76ad008e134c`, host local.

Este documento é um índice de continuidade; os detalhes, debates e evidências permanecem nos arquivos vinculados. Não transforma propostas em decisões nem executa código, deploy, convite ou cobrança.

## Conversas reunidas

| Conversa | Contexto incorporado | Registro de origem |
| --- | --- | --- |
| Avaliar chance de sucesso no início | Operação solo, preços, receitas, mercado, divulgação, mensagens e estudo atualizado | [Histórico](historico/2026-11-03-avaliar-chance-de-sucesso.md) |
| Avaliar conteúdo de estudo | Parecer original, critérios, 13 correções, auditoria, aceite e publicação | [Histórico](historico/2026-11-03-avaliar-conteudo-de-estudo.md) |
| Mapear requisitos para o lançamento | Jornada aluno/gestão, aula gratuita, agenda, contato, avisos, apresentação e entrada | [Histórico](historico/2026-11-03-mapear-requisitos-para-lancamento.md) |
| Planejar convite das primeiras pes | Atrair, receber e aprender com os primeiros participantes | [Histórico](historico/2026-11-03-planejar-convite-primeiras-pessoas.md) |

As quatro conversas foram lidas até o fim da paginação disponível: 33 turnos no total, incluindo o turno de organização em andamento. O contexto de Código Base Geral já havia sido reunido e arquivado em 27/10, com [origem preservada](historico/2026-10-27-codigo-base-geral-origem.md). A ideia inicial também possui [registro anterior](historico/2026-10-27-ideia-geral-origem.md).

Os históricos de origem preservam mensagens de usuário e assistente; comandos, saídas de ferramentas e raciocínio interno não são duplicados. Códigos temporários de autenticação não foram copiados para o projeto. O histórico integral original permanece recuperável pelo aplicativo.

## Direção de produto e público

O produto ensina inglês a brasileiros por histórias participativas e aprofundamento do inglês usado nelas. A motivação de Roger é organizar a aprendizagem por comunicação cotidiana: ouvir, perguntar, tentar responder e descobrir. O foco inicial proposto são adultos iniciantes que precisam de clareza e apoio para constância, confiança e aplicação. Não vender como tratamento ou curso específico para TDAH.

Uma ação por vez, explicações breves, prática guiada, feedback e retomada são princípios. A história não é o curso inteiro: viver uma situação → entender palavras, expressões e estruturas → praticar variações → aplicar em outra situação. Outras histórias e sua progressão permanecem em definição.

Fonte principal: [Visão geral do produto](VISAO-GERAL-DO-PRODUTO.md). Onboarding antigo com nivelamento obrigatório, seis pilares e chat de cinco alunos são ideias históricas, não escopo atual. O chat de cinco alunos é distinto das aulas propostas em dupla.

## O que está entregue e o que foi superado

| Área | Estado registrado nos documentos e conversas |
| --- | --- |
| Cafeteria | Dez partes, Lucas, três apoios distintos, escolhas, escuta, resposta, retrospectiva e replay; cafe-v8 preserva tentativas antigas |
| Estudo | Oito blocos, 24 práticas, consulta de expressões e referências de áudio existentes |
| Acesso | Conversa e estudo livres por link; cadastro para recursos da conta e aula; não há espera de aprovação para experimentar |
| Conta e painel | Progresso salvo, retomada, próximo passo e contato com professor; importação anônima explícita para conta vazia |
| Gestão | Contas reais, acompanhamento de alunos, mensagens, decisões e agenda conectados |
| Aula gratuita | Uma hora, uma por conta; concluir 24/24 práticas válidas libera pedido; confirmação e acesso à sala dependem da operação do professor |
| Reservas | Horário exclusivo por conta, confirmação/link/cancelamento/realização; não forma automaticamente duplas recorrentes |
| Apresentação | Primeira apresentação da conta obrigatória uma vez, sem pular; revisão posterior livre. Substitui a versão anterior pulável; não bloqueia a demo pública |
| Avisos | Avisos ao responsável via Resend configurados; entrega de um cadastro foi testada. Isso não comprova automaticamente todos os lembretes e avisos externos ao aluno |
| Curso pago | Catálogo seguinte, oferta final, assinaturas e direitos dos novos planos ainda precisam ser definidos/entregues |

O pedido de mapear requisitos incluía recursos de produto e atendimento, não apenas revisar código. Não reabrir como pendentes as funcionalidades já entregues. A lista inicial de 12 itens é histórica: várias etapas de painel, agenda, acompanhamento, autenticação, apresentação e avisos já foram executadas.

O estado atual deve ser confirmado no [README](../README.md) e nos documentos específicos: [painel](DASHBOARD.md), [integração do aluno](ALUNO-INTEGRACAO.md), [administração](ADMINISTRACAO.md), [aula ao vivo](AULA-AO-VIVO.md), [avisos](NOTIFICACOES.md), [apresentação](APRESENTACAO.md) e [autenticação](AUTENTICACAO.md). Registros antigos dentro desses arquivos não substituem as seções vigentes.

## Avaliação pedagógica e correções

O parecer original de 28/10 foi **SUFICIENTE**: história com partes 4, 9 e 10 suficientes; demais partes boas; oito lições boas; 16 práticas boas e oito suficientes. Foram identificadas contradição em 16 caminhos, restrições de escrita, continuidade dos copos, lacunas artificiais e oportunidades de usar áudios já existentes, entre outros itens.

Depois, todos os itens F01–F13 e retrabalhos foram conferidos. O aceite passou a **BOM no escopo editorial e funcional**, incluindo as dez partes e as oito lições. Não é avaliação empírica de eficácia, pronúncia ou retenção e não significa perfeito. A publicação posterior de 29/10 e a consolidação de 02/11 registram validações adicionais; não tratar o parecer inicial como retrato dos erros atuais.

Consultar: [parecer original](VALIDACAO-CONTEUDO-2026-10-28.md), [prompt de correções](PROMPT-CORRECOES-CONTEUDO-2026-10-28.md), [implementação](CORRECOES-CONTEUDO-2026-10-28.md), [auditoria e aceite](AUDITORIA-CORRECOES-CONTEUDO-2026-10-28.md), [pedagogia](TEORIA-PEDAGOGIA.md) e [entrega consolidada](ENTREGA-CONSOLIDADA-2026-11-02.md).

Preservar as mídias e o cache global: não regenerar imagens ou áudios para fazer essa organização. As 24 práticas não são 24 aulas ao vivo. Conclusão, uso de ajuda e execução de teste não certificam domínio ou nível.

## Operação solo, planos e viabilidade

Roger desenvolve, produz, atende, divulga e dá as aulas. Não há professor contratado nem equipe para presumir custos fictícios. Separar receita bruta, gastos reais e tempo próprio.

Última sugestão de preços para teste, sem aprovação definitiva:

| Plano | Mensalidade por pessoa | Aulas de 60 minutos em dupla |
| --- | --- | --- |
| Curso | R$ 49,90 | Nenhuma |
| Curso + prática | R$ 129,90 | Duas por mês |
| Curso + prática frequente | R$ 199,90 | Quatro por mês |

O curso-base seria o mesmo. Valores anteriores e a venda única de R$ 299/599 fazem parte da exploração. Três participantes foram cogitados, sem decisão para substituir as duplas. Quatro aulas por mês não equivalem sempre a semanal. Horários, pares, faltas, reposições e cobrança ainda precisam de definição.

No estudo atualizado, o plano digital precisa de continuidade paga além da cafeteria já gratuita. O plano de R$ 129,90 é candidato a primeira oferta de acompanhamento, não decisão fechada. Checkout antigo e proteção de beta gratuito não implementam as três assinaturas.

Mercado, fontes, condições anuais/promocionais e limites da comparação: [estudo de 02/11](ESTUDO-COMERCIAL-2026-11-02.md). Não afirmar menor preço universal nem uma média nacional com base na amostra pesquisada.

## Alunos e receitas: hipóteses, não previsões

| Cenário | Distribuição curso / duas aulas / quatro aulas | Ativos | Receita mensal bruta |
| --- | --- | --- | --- |
| Conservador | 6 / 3 / 1 | 10 | R$ 889 |
| Meta | 10 / 7 / 3 | 20 | R$ 2.008 |
| Resultado forte | 15 / 10 / 5 | 30 | R$ 3.047 |

Não há base estatística de conversão ou retenção para prever esses números. São cenários no fim dos primeiros 60 dias comerciais, não lucro, receita acumulada ou resultado esperado de um piloto gratuito. Pode haver menos compras. Na composição de 20, são 13 horas mensais ao vivo com todos os pares completos, podendo chegar a 26 sem pares.

A aula gratuita exige tempo adicional: se todos os 20 compradores viessem depois de uma aula individual e a compra após comparecer fosse 25%, seriam 80 aulas/horas gratuitas; a 40%, 50. São sensibilidades matemáticas, não taxas de mercado nem resultados do BasedSpeak. Vendas diretas e indicações podem mudar esse percurso.

## Divulgação, convite e acompanhamento

Começar pelos conhecidos para observar a experiência, sem confundir elogio ou favor com intenção de pagar. Canais discutidos: conversas individuais, WhatsApp, Instagram, indicações, comunidades/parcerias e anúncios futuros. Nenhuma campanha ou convite é executado por esta consolidação.

Sugestões do assistente a testar, sem compromisso já assumido: cerca de cinco convites personalizados em quatro dias da semana enquanto houver contatos adequados; primeira rodada com 10–15 participantes; duas publicações semanais reaproveitando demonstração do site e explicação feita por Roger. Oferecer continuidade apenas quando a entrega estiver definida.

Roger prefere uma mensagem natural para amigos, apresentando-se como professor do BasedSpeak sem abrir dizendo que criou tudo sozinho. Não inventar comissão por testes nem vínculo com terceiros. Rascunho:

> Cara, tô trabalhando com uma plataforma de inglês chamada BasedSpeak e também dou as aulas por lá. Tem uma parte interativa em que você participa de histórias e vai construindo suas respostas em inglês.
>
> Liberamos uma demo gratuita de uma conversa numa cafeteria. Dá uma olhada quando tiver um tempinho e depois me conta o que achou 🙂
>
> [link]

Se as aulas ainda não começaram, ajustar para “vou dar as aulas por lá”. A explicação completa deve informar que a aula gratuita depende de 24/24, conta, disponibilidade e confirmação; não prometer horário imediato.

Depois do teste, perguntar onde precisou de ajuda, o que percebeu que aprendeu e o que esperava depois. Acompanhar início, conclusão, 24/24, pedido, confirmação, comparecimento, oferta, compra e renovação. Fazer retorno breve aos interessados e pedir indicações após boa experiência. Não presumir que visitantes anônimos, intenção de compra ou todos os eventos já estejam medidos.

## Pendências de planejamento que permanecem

1. Aprovação auditiva humana dos 46 áudios existentes; conferência técnica não substitui escuta editorial.
2. Horários reais de Roger; a configuração ampla da agenda não é disponibilidade pessoal confirmada.
3. Regras de comparecimento, cancelamento, reposição e acesso à sala; separar recursos existentes de regras ainda não fechadas.
4. Conteúdo da continuidade paga e progressão entre histórias; explicar o que muda após a etapa gratuita.
5. Valores finais, cobrança recorrente e direitos dos planos; formação das duplas e capacidade total de trabalho.
6. Observação dos primeiros participantes e coleta de dados reais antes de ampliar divulgação e prever receita.

Não foi feita nova auditoria de produção, escuta de áudio ou validação com consumidores nesta organização. O usuário pediu reunir contexto e limpar a lista de conversas; não implementar essas pendências.

## Conversas técnicas preservadas

| Conversa | Por que fica separada |
| --- | --- |
| BasedSpeak — demo atual | Implementação da história, integração e publicação |
| BasedSpeak — demo teoria | Conteúdo e implementação do estudo |
| Correções | Implementação das correções editoriais e funcionais |
| landing page | Interface e entrada pública |
| dashboard | Painel e integração de progresso |
| Aluno | Área do aluno e contratos de integração |
| Criar área de management | Gestão/ADM |
| Apresentação | Implementação da apresentação da conta |
| Autenticação | Login, recuperação e configurações |
| Retomar o BasedSpeak | Contém implementação dos controles reais de superusuário; não é somente planejamento |

Conversas de outros assuntos reutilizadas no mesmo diretório não entram nesta consolidação. Conversas internas de revisão automática não foram tratadas como chats de planejamento do usuário. Nenhuma conversa técnica precisa perder seu contexto ou seu ponto de continuidade.

## Como continuar

Usar Ideia geral do projeto para debates e decisões gerais. Consultar este índice e os documentos especializados antes de criar novas listas; registrar o que foi concluído para não reabrir tarefas históricas. Uma decisão de produto não autoriza por si só código, deploy, exclusão de dados, mensagens externas ou mudança de pagamento. Pedidos posteriores explícitos de Roger definem o trabalho técnico autorizado.

Arquivamento remove as conversas redundantes da lista ativa e preserva recuperação no aplicativo. Não houve exclusão permanente.

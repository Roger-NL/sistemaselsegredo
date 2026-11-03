# BasedSpeak — estudo comercial atualizado em 02/11/2026

## Conclusão

O BasedSpeak evoluiu de uma história demonstrativa para uma primeira experiência integrada: história → estudo → progresso na conta → contato e aula com o professor. Isso torna mais concreta a apresentação e permite observar o uso antes da compra. Não comprova eficácia pedagógica, procura, conversão ou retenção.

A conclusão comercial é condicional: existe uma oferta inicial plausível de acompanhamento com Roger, mas a assinatura exclusivamente digital precisa de uma continuidade paga que se diferencie claramente do material gratuito. Os três preços continuam hipóteses. Vinte pagantes em 60 dias é uma meta a testar, não uma previsão demonstrada pelas atualizações técnicas.

O principal novo fator operacional é a aula gratuita de uma hora. O sistema atual reserva um horário exclusivo por conta; não forma duplas. Esse tempo de aquisição precisa ser contado além das aulas dos futuros assinantes.

## Escopo e qualidade da evidência

Consulta realizada em 02/11/2026. Foram examinados README, visão do produto, entrega consolidada de 02/11, documentos de estudo, painel e aula ao vivo, contratos e serviços relevantes de agendamento/pagamentos, registro local de publicação e as conversas de planejamento pertinentes. As fontes locais são registros de implementação e decisões, não pesquisa com consumidores.

Fontes técnicas principais:

- [README](../README.md).
- [Visão geral](VISAO-GERAL-DO-PRODUTO.md).
- [Entrega consolidada](ENTREGA-CONSOLIDADA-2026-11-02.md).
- [Teoria e pedagogia](TEORIA-PEDAGOGIA.md).
- [Aula gratuita](AULA-AO-VIVO.md).
- [Painel](DASHBOARD.md).
- [Contrato de aula](../src/contracts/live-class.ts) e [serviço de reservas](../src/server/live-class/service.ts).
- [Configuração de pagamentos](../src/server/payments/config.ts) e [rota de checkout](../src/app/api/checkout/route.ts).

O registro local `output/release-2026-11-02/publication.json` documenta uma publicação verificada em 02/11, com páginas públicas, retomada e consultas administrativas. Não foi repetida nesta análise uma auditoria visual/funcional de todo o domínio nem foram consultados dados privados de alunos para apurar conversões. Esse arquivo é evidência local ignorada pelo Git e não integra o relatório versionável.

Não há neste estudo contagem validada de público interessado, funil real, compras, renovações ou desistências. Não se presumem zero alunos nem zero receita preexistente; simplesmente esses dados não foram levantados. Testes automáticos, contas de QA e progresso de teste não devem ser tratados como usuários ou aprendizado comprovado.

## O que mudou desde o estudo anterior

| Área | Situação anterior usada na análise | Situação encontrada agora | Consequência comercial inferida |
| --- | --- | --- | --- |
| Experiência | História da cafeteria | História + oito blocos e 24 práticas | Mais conteúdo real para demonstrar o método |
| Entrada | Cadastro no fluxo principal | Demo e estudo podem começar sem cadastro | Menos etapas antes de experimentar; efeito na conversão não medido |
| Continuidade | Progresso sobretudo local | Salvamento autenticado e painel | Mais condições de retomar e observar avanço |
| Relação humana | Professor nos planos futuros | Contato e uma aula gratuita após conclusão | O participante pode conhecer a didática de Roger antes de contratar |
| Operação | Integrações preservadas | ADM de alunos, mensagens e reservas | Mais instrumentos para acompanhar participantes |
| Oferta paga | Três planos sugeridos | Continuam sem implementação como novas assinaturas | Não confundir melhoria do piloto com lançamento comercial |
| Catálogo | Uma história | Continua uma história | Permanência mensal depende da entrega seguinte |

As 24 práticas são atividades dentro da primeira experiência, não 24 aulas ao vivo, 24 histórias nem prova de que a pessoa aprendeu todo o conteúdo.

Há duas pendências humanas explicitadas na entrega: aprovar a escuta editorial dos 46 áudios e definir horários reais de Roger. A disponibilidade ampla na agenda não comprova disponibilidade pessoal. O relatório comercial não reabre correções já concluídas nem usa quantidade de testes como evidência de demanda.

## Comparação atual de ofertas no Brasil

Preços são os exibidos nas páginas oficiais consultadas, sujeitos a campanhas, regras e mudanças. Não foi simulada a contratação final. A amostra não permite calcular uma média nacional; frequência, duração, tamanho dos grupos, catálogo e compromisso contratual variam.

| Referência | Valor anunciado | Entrega e condição relevante |
| --- | --- | --- |
| SeedPlus sem conversação | R$ 97/mês | Plano mensal; curso gravado e materiais |
| SeedPlus com conversação | R$ 147/mês | Plano mensal; curso e conversação ao vivo pelo menos duas vezes por semana; não se infere duração nem tamanho dos grupos |
| Fluencypass Starter | R$ 149/mês | Oferta no plano anual; plataforma e aulas em grupo; a página consultada contém descrições divergentes de frequência, portanto não se fixa aqui um número |
| Cambly Pequenos Grupos | R$ 55/mês na vitrine consultada | 30 minutos semanais; tutor e mais um ou dois alunos; página contextualiza compromisso anual e política de cancelamento, não serve como equivalente de assinatura mensal livre |
| Open English | A partir de R$ 220/mês | Plano anual; aulas em grupo ilimitadas e plataforma |

Fontes primárias:

- [SeedPlus — planos](https://seedplus.com.br/periodo-gratis/).
- [Fluencypass — preços próprios no comparativo oficial](https://blog.fluencypass.com/fluencypass-ou-fluency-academy/).
- [Cambly — apresentação brasileira dos planos](https://try.cambly.com/realenglish-br).
- [Open English — oferta e FAQ de preço](https://www.openenglish.com.br/promocao-open-english).

Não é correto concluir que todo curso com professor começa em R$ 147 ou que o BasedSpeak será sempre o mais barato. A vitrine do Cambly tem valores menores, com condições distintas. Tampouco é correto comparar duas aulas por mês com aulas ilimitadas como se fossem a mesma entrega.

Histórias também não são exclusividade: a [Hello Nabu](https://www.hellonabu.com/pt/learn-english/) apresenta aprendizagem em histórias com personagens e atividades. O [Speak](https://www.speak.com/pt-br) apresenta prática de comunicação e tutor de IA. Essas páginas comprovam posicionamentos concorrentes, não desempenho pedagógico comparado ou participação de mercado.

Hipótese de posicionamento para testar: inglês guiado para brasileiros iniciantes, em histórias compreensíveis, com explicações em português e aplicação com o mesmo professor. Os componentes precisam funcionar em conjunto; “interativo”, “histórias”, “IA” ou “professor” isoladamente não demonstram preferência pelo BasedSpeak.

## Revisão dos três planos propostos

| Plano em discussão | Preço | Avaliação atual |
| --- | --- | --- |
| Curso, sem aulas ao vivo | R$ 49,90/mês | Preço de entrada testável, mas somente com conteúdo/serviço contínuo adicional ao gratuito. A cafeteria e suas práticas já gratuitas não justificam sozinhas uma nova cobrança mensal. |
| Curso + duas aulas de 60 minutos em dupla | R$ 129,90/mês | Candidato a oferta principal do piloto pago: benefício humano verificável, desde que existam duplas, horários e sequência de estudo. |
| Curso + quatro aulas de 60 minutos em dupla | R$ 199,90/mês | Opção para quem quer frequência e aceita o preço; precisa de agenda e plano de aprendizagem compatíveis. Não assumir que será preferido por custar menos que uma escola maior. |

Manter esses valores como preços de teste é mais justificável que reduzi-los automaticamente por falta de catálogo. Se a entrega digital ainda for insuficiente, reduzir preço não resolve o que falta entregar. É possível testar uma oferta de aulas com material inicial, desde que isso seja descrito assim e não como um curso completo já existente.

Não é necessário terminar um catálogo enorme para iniciar um piloto. É necessário definir o que o primeiro mês pago entrega, a sequência seguinte e como o aluno segue estudando após a cafeteria. O número de histórias e as datas de entrega ainda dependem de decisão de Roger.

O código examinado mantém proteção de beta gratuito por padrão e um checkout com contratos antigos (`lifetime` e `specialty`). Isso não demonstra que as três assinaturas e seus direitos já estejam prontas. Não foram lidas variáveis secretas de produção para afirmar o estado efetivo do pagamento remoto. Ativar um fluxo antigo não equivale a implementar os novos planos.

## Economia do trabalho de Roger

Não há professor contratado nesta operação. O tempo de Roger é capacidade e trabalho próprio, não uma despesa fictícia paga a terceiros.

Com pares completos e plano digital de R$ 49,90 como base:

- Plano de R$ 129,90: R$ 80 adicionais por pessoa por duas aulas; dois participantes geram R$ 160 adicionais para duas horas, ou R$ 80 brutos por hora ao vivo.
- Plano de R$ 199,90: R$ 150 adicionais por pessoa por quatro aulas; dois participantes geram R$ 300 adicionais para quatro horas, ou R$ 75 brutos por hora ao vivo.

Esses valores não são lucro nem remuneração líquida total: não descontam despesas reais ou tempo de preparação, divulgação, conteúdo e atendimento. A receita do curso continua existindo em paralelo. Com apenas uma pessoa em cada encontro, a receita incremental por hora cai pela metade. A agenda da aula gratuita atual não implementa automaticamente pares e créditos de assinaturas recorrentes.

## A aula gratuita muda o custo de conseguir clientes

O mecanismo atual exige 24 práticas concluídas e uma conta para solicitar uma aula gratuita de uma hora, uma por conta. Uma conclusão não garante comparecimento nem compra. A exigência de completar o estudo pode ajudar a identificar interesse, mas isso é hipótese sem medição.

O serviço examinado reserva cada horário para um UID. Para planejar a operação atual, uma aula realizada representa uma hora de Roger; não se deve dividir esse custo por dois como nos futuros planos em dupla.

Se todos os novos pagantes viessem depois de uma aula gratuita individual, a conta seria:

| Hipótese de compra após aula gratuita realizada | Aulas gratuitas necessárias para 20 compras | Horas ao vivo gratuitas |
| --- | --- | --- |
| 20% | 100 | 100 |
| 25% | 80 | 80 |
| 40% | 50 | 50 |
| 50% | 40 | 40 |

São sensibilidades matemáticas, não taxas observadas, referências de mercado ou probabilidades atribuídas ao produto. Remarcações, faltas, atendimento e preparação acrescentam carga. O cálculo não afirma que todo comprador precise fazer a aula gratuita; vendas diretas e indicações podem reduzir a dependência desse caminho.

Assim, a aula gratuita pode ser um bom momento de demonstração e diagnóstico, mas não deve ser tratada como recurso ilimitado. Recomenda-se definir disponibilidade real antes de ampliar convites, abrir novas vagas conforme capacidade e medir procura, comparecimento e continuidade. Qualquer mudança futura de benefício deve ser comunicada sem retirar silenciosamente o que já tiver sido prometido.

## Primeiros 60 dias: o que é possível estimar

As melhorias do site não fornecem uma base estatística para aumentar a previsão de alunos. A estimativa anterior de 10–20 deve ser tratada como cenário de planejamento; o teto de 20 continua sendo meta de lançamento, não previsão validada.

Se houver oferta paga pronta, entrega contínua e as seguintes distribuições de assinantes ativos no fim do período, a aritmética continua:

| Cenário ilustrativo | Curso | Duas aulas | Quatro aulas | Ativos | Receita mensal bruta |
| --- | --- | --- | --- | --- | --- |
| Conservador | 6 | 3 | 1 | 10 | R$ 889 |
| Meta | 10 | 7 | 3 | 20 | R$ 2.008 |
| Resultado forte | 15 | 10 | 5 | 30 | R$ 3.047 |

Esses cenários não esgotam os resultados possíveis: pode haver menos de dez ou nenhuma compra. Na oferta atual gratuita, novas participações não geram receita de assinatura por si só. Se os 60 dias forem inteiramente dedicados à validação gratuita, não faz sentido atribuir receita hipotética de planos ainda não lançados ao mesmo período.

A receita da tabela é mensal ao final dos 60 dias, antes de despesas e tributos. Não representa receita acumulada dos dois meses, lucro nem garantia de renovação. A mesma quantidade de alunos pode gerar outra receita se escolher planos diferentes.

No cenário de 20, há 26 participações em aulas pagas por mês: sete alunos × duas + três alunos × quatro. Com todos os encontros em dupla, isso representa 13 horas mensais; sem pares, pode chegar a 26. A carga de aquisição das aulas gratuitas é adicional e depende de quando essas aulas forem realizadas. Não somar horas de aquisição de dois meses a uma carga mensal como se fossem a mesma unidade de tempo.

## Proposta de validação em 60 dias

Este é um plano sugerido, sem alterar o benefício existente nem executar convites ou mudanças técnicas.

1. Antes da primeira rodada, concluir a escuta editorial e definir a agenda humana real. Explicitar que a aula requer conclusão do estudo, conta, disponibilidade e confirmação.
2. Convidar uma primeira leva de 10–15 pessoas do público relevante. Observar dificuldades na história, nas práticas e no agendamento. Não confundir favor de conhecido com intenção de compra.
3. Acompanhar a passagem entre início da história, conclusão, estudo iniciado, 24/24, pedido, confirmação e comparecimento. Usar informações operacionais reais e relatos; não presumir que toda visita anônima já seja mensurada.
4. Definir a entrega do primeiro mês pago e testar uma oferta clara com os participantes interessados, com R$ 129,90 por duas aulas em dupla como candidato principal. Apresentar alternativas conforme necessidade, sem esconder preços ou forçar upgrade.
5. Medir ofertas efetivamente apresentadas, compras, planos escolhidos, formação de pares e carga total de trabalho. Quando chegar a renovação, registrar permanência e motivos de saída. Para compradores tardios, esperar tempo suficiente antes de concluir que há retenção mensal.
6. Só ampliar divulgação ou anúncios depois de saber onde há abandono e como a agenda comporta as aulas. Uma rodada orgânica não prevê automaticamente conversão de público frio em anúncios.

Um primeiro grupo pequeno pode justificar continuar se houver uso, compras e retorno; não basta bater uma contagem de cadastros. Um grupo que conclui e elogia, mas não compra, pode sinalizar preço, entrega seguinte, perfil de público, agenda ou necessidade de mais evidência. Investigar antes de atribuir tudo a falta de divulgação.

## O que permanece em aberto

- Tamanho e perfil da rede alcançável de Roger e canais com procura real.
- Quantos iniciam, concluem e agendam; quantos comparecem.
- Quais dificuldades persistem depois do estudo e como são trabalhadas na aula.
- Qual conteúdo/serviço distingue a assinatura digital da experiência gratuita.
- Horários, formação de duplas, faltas, reposições e acompanhamento.
- Cobrança recorrente, direitos dos novos planos e calendário comercial.
- Compras, renovação, motivos de saída e tempo total por aluno.

Nenhuma faixa de probabilidade de sucesso foi atribuída porque falta uma amostra real. O produto está mais preparado para um piloto acompanhado; as evidências comerciais ainda precisam ser produzidas.

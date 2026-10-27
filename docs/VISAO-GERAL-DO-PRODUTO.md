# BasedSpeak — visão geral do produto

Atualizado em 27/10/2026. Consolidação solicitada por Roger das conversas “Ideia geral do projeto”, “Código Base Geral” e das propostas comerciais e de divulgação debatidas em “Avaliar chance de sucesso no início”. A conversa central para continuar o planejamento passa a ser **“Ideia geral do projeto”** (`01a13326-bfa1-7193-b54f-76ad008e134c`). “Código Base Geral” foi arquivada após a confirmação de leitura e incorporação na conversa central, com seu contexto preservado nos registros abaixo. Valores e cenários abaixo são propostas de trabalho, sem aprovação comercial definitiva.

## Referência central e preservação do histórico

“Ideia geral do projeto” foi criada explicitamente para organizar o blueprint do produto; “Código Base Geral” começou com inspeção e evolução técnica, mas depois recebeu a proposta de aprofundamento após a cafeteria. As duas foram lidas até o fim da paginação disponível antes desta consolidação. Conteúdo de origem, incluindo ideias anteriores e mensagens de debate, foi preservado separadamente para permitir consulta sem transformar versões antigas em decisões atuais:

- [Contexto original de Ideia geral do projeto](historico/2026-10-27-ideia-geral-origem.md).
- [Contexto e debate de Código Base Geral](historico/2026-10-27-codigo-base-geral-origem.md).

A organização não restaura o curso antigo nem modifica o site. Atualizações futuras devem manter distinguíveis direção de Roger, hipóteses, sugestões do assistente, implementação e resultados observados. O histórico da conversa arquivada permanece recuperável no aplicativo.

## Fundamentos preservados da ideia original

O BasedSpeak ensina inglês a brasileiros. A motivação de Roger é transformar sua experiência de aprendizagem por comunicação cotidiana — ouvir pessoas, perguntar significados, tentar responder, errar e descobrir — em um percurso estruturado e guiado.

O público inicial é uma hipótese: adultos brasileiros que querem aprender inglês, mas têm dificuldade de atenção, constância, confiança ou aplicação prática. Pode incluir pessoas com TDAH, sem posicionar o produto como um curso clínico ou específico para TDAH. Pouca exposição, insegurança, ensino anterior e excesso de consumo passivo também precisam ser considerados; concentração não explica todas as dificuldades.

Princípios de experiência preservados:

- Transformar reconhecimento passivo em uso: compreender, construir respostas, escrever algo curto e perceber progresso.
- Uma ação por vez, leitura clara, pouca distração, feedback útil e possibilidade de recomeçar.
- Prática guiada e explicações curtas, evitando aulas longas e excesso de teoria desconectada de situações.
- Experiência adulta, simples e envolvente, sem dashboard pesado, excesso de cards ou gamificação infantil.
- Reunir várias evidências antes de inferir o ponto de partida. Reconhecer uma palavra não comprova nível; desconhecer outra não define nível zero. Apoios escolhidos na demo não são certificação de nível.

## Estado atual e limites técnicos conhecidos

O estado de implementação deve ser conferido no README e nos registros técnicos, especialmente quando outro chat estiver trabalhando no projeto. Atualmente há landing, cadastro, painel, demo da cafeteria e a primeira etapa de estudo em `/demo/estudo`: oito blocos, 24 práticas e consulta de expressões. O curso de várias histórias permanece como proposta. Demo e estudo também permanecem acessíveis diretamente. O cadastro não implica sincronização do progresso entre dispositivos. Pesquisa e limites pedagógicos estão em [Teoria e pedagogia](TEORIA-PEDAGOGIA.md).

Na demo, preservar roteiro em dez partes, Lucas, três apoios distintos (Guiado, Com pistas e Mais autônomo), imagens aprovadas, ajuda voluntária, retrospectiva, recuperação local e áudio compartilhado persistente. Não regenerar áudio já existente por causa de alterações de planejamento. A experiência não usa microfone nem deve ser anunciada como conversa generativa ilimitada ou avaliação de pronúncia. Não há duração de uso validada com participantes nem resultado de aprendizagem comprovado.

As telas antigas de currículo, Globo/órbita, aluno/admin, provas e ranking foram removidas; aliases e APIs aposentadas mantêm compatibilidade. Auth, pagamentos, agenda e áudio permanecem como integrações compartilhadas. Contratos comerciais antigos não aprovam os novos planos. Nenhuma proposta deste documento autoriza excluir dados, mexer em credenciais ou reutilizar automaticamente regras antigas de acesso.

Referências para consulta:

| Assunto | Registro |
| --- | --- |
| Estado implementado, execução e comandos | [README](../README.md) |
| Histórico de entrega e verificação da demo | [Andamento](plano-nova-demo/ANDAMENTO.md) |
| Integrações preservadas | [Integrações](plano-nova-demo/INTEGRACOES.md) |
| UX e decisões da landing | [Landing UX](landing-ux.md), [direção visual](landing-visual-direction.md) |
| Pesquisa e limites das alegações de mercado | [Pesquisa da landing](research-landing.md) |
| Cache e arquivos de áudio existentes | [Validação de áudio](plano-nova-demo/VALIDACAO-AUDIO-COMPLETA.md) |

Regra de trabalho preservada de Roger: ao alterar o site, manter localhost e domínio publicado alinhados e verificar ambos, sem alegar igualdade sem conferência. Endereços conhecidos: `http://localhost:3100/` e `https://basedspeak.com`; Vercel `novoessite`. Mudanças só de planejamento/documentação não exigem alterar ou publicar a interface. Datas e verificações históricas não atestam automaticamente o estado de uma publicação posterior.

## Direção apresentada por Roger

O curso será organizado em várias histórias interativas. A conversa da cafeteria é a primeira experiência, não o curso inteiro. Depois de viver essa história, o aluno começa a estudar com profundidade o inglês que apareceu nela, com explicações extremamente simples e módulos ligados à conversa.

O aprofundamento deve cobrir as palavras e expressões utilizadas, seus significados, os verbos e as estruturas por trás das falas. O aluno já terá visto essas formas em uma situação concreta antes de entrar na teoria. Por exemplo, a família de construções com “this”, “is” e “yours” permite explorar o que está por trás de identificar um objeto e perguntar a quem ele pertence. A pergunta da demo é “Is this yours?”; exemplos novos não substituem o roteiro aprovado.

A intenção é que a demo e uma primeira etapa de aprofundamento antecedam a entrada no curso completo, onde o aluno poderá selecionar outras histórias. Uma segunda história poderá ter mais profundidade, intensidade e ritmo. Catálogo, quantidade de histórias, critérios de progressão e acesso comercial ainda serão debatidos.

## Jornada conceitual

Landing → cadastro → painel → conversa da cafeteria → aprofundamento daquela conversa → curso com seleção de histórias. O primeiro aprofundamento está implementado; seleção de outras histórias permanece futura. Conferir no README o estado atual de acesso e cadastro.

Dentro do curso, a proposta em discussão é repetir o ciclo: viver uma história → entender o inglês usado nela → praticar variações → usar o aprendido em outra situação. A cafeteria já conta com um primeiro estudo; a continuidade em outras histórias ainda não está implementada.

## Sugestões para debate, sem decisão final

- Organizar o aprofundamento por intenções e expressões úteis, explicando também as palavras individuais em contexto. Evitar uma aula obrigatória isolada para cada palavra.
- Alternar explicações curtas com ações: compreender, comparar, montar, escutar e responder. Retornar à cena para dar sentido à teoria.
- Reutilizar estruturas em situações e objetos diferentes para verificar se o aluno consegue transferir o que aprendeu, além de repetir a fala da história.
- Planejar as histórias com uma progressão pedagógica comum, mesmo quando houver escolha de narrativa. Reaproveitar conteúdos anteriores e dosar novidades.
- Separar intensidade narrativa de dificuldade linguística. Uma história pode ser mais envolvente sem acelerar o áudio ou aumentar de uma vez o vocabulário, o tamanho das falas e a autonomia exigida.
- Considerar novas tentativas com menos apoio e revisões entre histórias, sem tratar a conclusão de uma conversa como prova de domínio.

## Questões abertas

- Qual será a extensão da primeira etapa de aprofundamento antes do curso completo?
- Como apresentar teoria sem interromper a sensação de participação?
- Quais histórias poderão ser escolhidas livremente e quais dependerão de conhecimentos anteriores?
- Como verificar compreensão e aplicação em exemplos novos?
- Qual será a segunda história e quais objetivos de comunicação ela introduzirá?
- Quais limites comerciais e de acesso serão definidos? A proposta de assinatura está registrada abaixo, mas os planos e preços ainda precisam ser validados.

## Operação e modelo comercial em discussão

Roger trabalha sozinho: desenvolve o site, produz o conteúdo, divulga, atende e será o professor das aulas. Não há equipe ou professor contratado neste estágio. As contas não devem presumir pagamentos fictícios a terceiros; devem separar despesas reais, receita bruta e tempo de trabalho de Roger. Ser dono do site não elimina eventuais custos de hospedagem, serviços, pagamentos e tributos, mas nenhum valor desses foi apurado aqui.

A ideia inicial de vender acesso por valor fixo, como R$ 299 ou R$ 599, evoluiu para a hipótese de assinaturas mensais. Roger propôs ter uma opção de curso sem aulas e opções com aulas ao vivo. O mesmo curso seria a base dos três planos; a frequência das aulas distinguiria as opções com professor.

As aulas discutidas têm 60 minutos e são em dupla. Roger mencionou a possibilidade de três participantes se houver muita demanda, mas a proposta de lançamento e os cálculos atuais usam dois. Essa possibilidade não é uma decisão de alterar a oferta de quem contratar aulas em dupla.

### Última sugestão de preços, ainda para teste

| Plano provisório | Entrega futura proposta | Mensalidade por pessoa |
| --- | --- | --- |
| Curso | Histórias, explicações, áudio e exercícios, sem aulas ao vivo | R$ 49,90 |
| Curso + prática | Mesmo curso + duas aulas mensais de 60 minutos em dupla | R$ 129,90 |
| Curso + prática frequente | Mesmo curso + quatro aulas mensais de 60 minutos em dupla | R$ 199,90 |

Esses valores foram sugeridos pelo assistente como ponto de partida; Roger pediu estimativas e divulgação com base neles, sem fechar preços exatos. Valores anteriores (R$ 39/49/59 sem aulas; R$ 79,99/99 com aulas; R$ 180 com maior frequência) fazem parte da exploração, não são planos simultaneamente oferecidos. Os nomes também são provisórios.

Com duplas completas, o acréscimo sobre o plano de curso corresponde a R$ 80 brutos por hora ao vivo no plano de duas aulas e R$ 75 no plano de quatro aulas. É receita incremental atribuída à inclusão das aulas, não lucro nem salário líquido. Atender uma pessoa sozinha pelo mesmo preço reduz esses valores pela metade. Preparação, atendimento e organização também ocupam tempo.

Quatro aulas por mês e uma aula por semana não são a mesma promessa: alguns meses têm cinco encontros semanais. A frequência contratada, os horários, a formação das duplas e a política para vagas sem par precisam ser definidos antes das vendas. Uma mensalidade precisa ter valor contínuo para o aluno; conteúdo, progressão e acompanhamento ainda serão desenhados.

## Primeiros dois meses: cenários de planejamento

A demo será aberta inicialmente aos conhecidos de Roger para experimentar e avaliar a prática. Essa etapa gratuita não equivale a validação de compra. A oferta paga depende da entrega do curso inicial; não se deve iniciar uma contagem de lançamento comercial como se essa entrega já estivesse disponível.

O assistente sugeriu trabalhar com 10–20 pagantes ativos ao final dos primeiros 60 dias comerciais e buscar 20 como meta. Não existe pesquisa de conversão, levantamento do tamanho da rede, demanda comprovada ou base estatística para prever esse resultado. Os cenários são exercícios, não probabilidades nem promessa de receita.

| Cenário ilustrativo | Curso | Duas aulas | Quatro aulas | Alunos ativos | Receita mensal bruta |
| --- | --- | --- | --- | --- | --- |
| Conservador | 6 | 3 | 1 | 10 | R$ 889 |
| Meta inicial | 10 | 7 | 3 | 20 | R$ 2.008 |
| Resultado forte | 15 | 10 | 5 | 30 | R$ 3.047 |

As distribuições entre planos são hipotéticas. A receita é mensal no encerramento do período, não a soma arrecadada nos dois meses nem lucro. No cenário de 20 alunos, as aulas ocupam 13 horas mensais se todos os encontros tiverem dois participantes; compatibilidade de nível e agenda pode aumentar a carga. Renovação e continuidade de estudo precisam ser observadas junto das primeiras compras.

## Divulgação inicial e acompanhamento

Direção apresentada por Roger: começar pelos conhecidos e usar uma mensagem natural, de amigo para amigo, apresentando sua atuação como professor do BasedSpeak. Ele não quer iniciar o convite com “estou criando um curso” nem com uma apresentação publicitária formal.

Sugestões do assistente, ainda como plano de trabalho:

- Concentrar inicialmente as conversas comerciais em adultos brasileiros iniciantes que querem aprender inglês e precisam de orientação. A demo pode continuar aberta a outras pessoas.
- Organizar contatos por interesse, teste da demo, dificuldade percebida e próximo contato. Começar com cerca de cinco convites personalizados por dia, quatro dias por semana, enquanto houver contatos relevantes.
- Observar alguns dos primeiros 10–15 participantes e perguntar onde precisaram de ajuda, o que perceberam que aprenderam e o que esperavam depois da história.
- Quando o curso inicial estiver pronto, apresentar conteúdo, preços, horários e uma opção adequada à necessidade da pessoa. Verificar nível e agenda antes de confirmar uma dupla.
- Se houver interesse sem conclusão, fazer um retorno breve alguns dias depois para esclarecer dúvidas sobre curso, planos ou horários; não tratar ausência de resposta como intenção de compra.
- Publicar cerca de dois conteúdos por semana nos canais já usados por Roger (WhatsApp e Instagram): uma demonstração da experiência e uma explicação de inglês feita por ele. Reaproveitar material para caber na operação individual.
- Pedir indicações após uma boa experiência. Para quem quer aulas, explorar a possibilidade de trazer alguém de nível e disponibilidade compatíveis para formar a dupla.
- Reservar inicialmente quatro a cinco horas semanais para divulgação e acompanhamento, ajustando conforme a procura. Medir convites, testes, interessados, compras e renovações; essa rotina não significa que a telemetria do site esteja implementada.

### Última mensagem de WhatsApp sugerida

> Cara, tô trabalhando com uma plataforma de inglês chamada BasedSpeak e também dou as aulas por lá. Tem uma parte interativa em que você participa de histórias e vai construindo suas respostas em inglês.
>
> Liberamos uma demo gratuita de uma conversa numa cafeteria. Dá uma olhada quando tiver um tempinho e depois me conta o que achou 🙂
>
> [link]

É um rascunho para o momento em que a demo estiver liberada e a atuação descrita estiver acontecendo. Se as aulas ainda não tiverem começado, ajustar “também dou as aulas por lá” para “vou dar as aulas por lá”. Roger pode se apresentar como professor da empresa sem abrir a conversa com a história do desenvolvimento; não deve afirmar que é funcionário de terceiros. A ideia de dizer que recebe comissões por testes foi discutida, mas o assistente recomendou não usá-la sem existir tal comissão; o rascunho atual não faz essa alegação. Nenhuma mensagem foi enviada a conhecidos nesta atualização.

## Próximas decisões comerciais

- Confirmar valores, nomes, regras de acesso e conteúdo disponível no lançamento.
- Definir calendário, formação das duplas, faltas, reposições e funcionamento quando houver somente uma pessoa compatível.
- Definir a experiência de continuidade entre histórias, estudo independente e aulas.
- Levantar alcance real dos contatos, interesse, compras e renovações antes de revisar metas.
- Ajustar convite, retorno e oferta com base nas respostas recebidas, preservando a distinção entre demo gratuita e curso pago futuro.

## Ideias anteriores preservadas para reavaliação

O blueprint inicial incluía uma entrada obrigatória única depois da conta, em chat limpo: nome, motivação, contato anterior, pequenos desafios, perfil inicial e primeira vitória. Essa entrada e seu nivelamento não foram aprovados como etapas adicionais do fluxo atual de landing → cadastro → cafeteria. Evitar introduzir barreiras ou restaurar esse fluxo como se fosse implementação pendente obrigatória.

Nesse desenho antigo, a entrada podia anunciar cerca de dez minutos e ter progresso baseado em etapas reais, nunca contagem regressiva falsa. O tempo não foi validado e não deve ser transferido para a demo atual. Havia intenção de oferecer “não sei” em desafios e descrições humanas do ponto de partida, em vez de rótulos frios como “nível 0”; são princípios a considerar num eventual nivelamento futuro, não recursos já existentes.

Seis pilares foram sugeridos originalmente: destravar e responder; ouvir inglês real; construir frases úteis; resolver situações da vida real; sustentar uma conversa; continuar de forma independente. Seus nomes e organização permanecem como material histórico para debate. A direção atual é organizar o curso por histórias e aprofundamento, sem recuperar automaticamente o currículo antigo ou esses pilares.

Outra ideia guardada é um chat com cerca de cinco alunos, escrevendo em português com ajuda para transformar partes em inglês. Não faz parte da demo nem dos planos atuais. Esse chat é diferente das aulas ao vivo em dupla com Roger. Gravação/envio de voz, reconhecimento de fala e IA conversacional complexa também ficaram fora do piloto original e não se tornam escopo por esta consolidação.

O contexto original mencionava checkout em `master` e recuperação por stash. É um retrato técnico antigo, não uma instrução de reset: confirmar sempre a branch e o Git atuais e preservar trabalho em andamento. A proposta inicial de landing em várias seções e com imagem da cafeteria foi superada pelas decisões posteriores documentadas para a landing de uma tela; slogans e durações antigos não devem voltar automaticamente.

## Limites desta atualização

Este documento registra visão e hipóteses; não autoriza implementar os módulos, alterar a demo, restaurar o curso antigo ou prometer na landing recursos já disponíveis. Preservam-se roteiro, três apoios distintos, mídias aprovadas, áudio existente, cache global e integrações compartilhadas. O produto novo não implica recuperar o antigo Globo/órbita nem seu currículo.

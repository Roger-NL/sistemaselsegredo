# Auditoria independente das correções de conteúdo

28/10/2026 · Conversa líder · Implementação na conversa **Correções** (`01a184cd-d8f9-7692-bbc8-3991d11d7dff`).

**Aceite do líder: APROVADO COMO BOM no escopo editorial e funcional local.** O [registro final do executor](CORRECOES-CONTEUDO-2026-10-28.md) foi conferido após o encerramento da rodada. F01–F13 e os retrabalhos abaixo estão resolvidos nesse escopo; não há pendência implementável identificada nesta revisão.

O escopo é o conteúdo editorial e o funcionamento local da história `cafe-v8`, dos três apoios e do estudo de oito blocos/24 práticas. O [parecer original](VALIDACAO-CONTEUDO-2026-10-28.md) permanece como registro histórico. O [prompt de execução](PROMPT-CORRECOES-CONTEUDO-2026-10-28.md) contém todas as recomendações e critérios de aceite, inclusive as de menor prioridade.

**Conferência dos itens originais**

| Item | Implementação conferida | Resultado no escopo local |
| --- | --- | --- |
| F01 — Preferência contrariada | O ramo negativo pode ficar, mas segue sem enviar `I like it here`. A resposta e o destaque não são inventados; os outros ramos mantêm a atividade. | Bom |
| F02 — Escrita e repertório | Alternativas curadas por contexto; instrução prévia explica o repertório; recusas não afirmam erro geral de inglês. Rascunho e escrita aceita são preservados. Consultar a lista registra apoio. | Bom |
| F03 — Copos e continuidade | Texto trata os cafés como já presentes, usa BASEDSPEAK e LUCAS e esclarece quem identifica cada copo. Conferidos cartões efetivos e imagens. | Bom |
| F04 — Lacunas artificiais | `Really? ___` e `Bye! ___` removidos; recombinações que têm um trecho ausente mantêm estrutura legítima. | Bom |
| F05 — Áudios no estudo | Referências explícitas a arquivos existentes; trechos avisam que a gravação é a fala completa; falas combinadas têm controles separados. Exemplo novo sem gravação é identificado. | Bom |
| F06 — Excesso | `Too much work` traduzido como trabalho demais, consistente com a explicação. | Bom |
| F07 — Elipse no pedido | Um cartão explica que “Eu também” retoma “também pedi isso”, sem apresentar uma frase nova como conteúdo do áudio antigo. | Bom |
| F08 — `this` | Pistas distinguem palavra e referente da cena; não ensinam “café” como tradução fixa. | Bom |
| F09 — Microtexto | Referência ao nome da bebida/objeto fica inequívoca; gostar do idioma não é definido obrigatoriamente como gostar de estudá-lo. | Bom |
| F10 — Pontuação | Grafias fragmentadas são recusadas nas novas respostas; caixa, espaços, apóstrofos e contrações previstas continuam funcionando. A aceitação antiga é preservada no replay histórico. | Bom |
| F11 — Contato | Texto interno registra aceitação da proposta, sem inventar combinação de canal. | Bom |
| F12 — Permanência | A passagem de tempo está num cartão renderizado, somente para quem decidiu ficar. | Bom |
| F13 — Práticas | Oito práticas fracas foram revistas, com contrastes pertinentes e feedback. Possessivos, artigo, passado, estrutura de like, atividade/estado, trabalho/excesso, aceitação e necessidade recebem prática mais diagnóstica. IDs e total de 24 permanecem. | Bom |

As dez partes da história e as oito lições recebem **bom** no escopo editorial/funcional revisto. As 24 práticas passam a ser adequadas à primeira exploração proposta; isso não é uma afirmação de eficácia observada, domínio ou retenção. “Bom” permite refinamentos futuros e não equivale a “perfeito”.

**Retrabalhos exigidos pelo líder e conferidos novamente**

1. A consulta de expressões aceitas mostrava a solução sem registrar ajuda: passou a registrar `REVEAL_MODEL`, preservando o rascunho.
2. Uma prática atribuía a Lucas ter pegado o copo do aluno: a descrição passou a falar do engano efetivo do roteiro.
3. A primeira conferência visual usava fonte serifada: o ensaio passou a carregar a Geist local. Uma captura estreita também foi reenquadrada para mostrar contexto e ação; a barra de QA é distinguida da altura útil do produto.
4. Variantes novas eram tratadas como prova de uso literal do modelo: histórico, glossário e descrição do destaque passaram a respeitar a escrita real e o tópico. `I ordered the same` não prova uso de `Me too`; `Oh, really?` contém a expressão realmente usada.
5. Essa regra lexical tornou incompatível um journal antigo legítimo: o líder gerou um caso com o código original, demonstrou a falha, pediu retrabalho e confirmou a restauração com a regra histórica preservada. O texto `M.e too.` continua no registro antigo, sem ser aceito como nova resposta correta.
6. A prática de possessivos concentrava quatro lacunas e traduções num parágrafo: passou a apresentar frases e traduções em itens separados, com comando de resposta separado.

Nenhum desses itens foi aceito apenas com a explicação de que o teste anterior passava. Houve leitura do diff, reprodução ou conferência visual conforme o caso e uma nova checagem após o ajuste.

**Evidências executadas pelo líder**

- Enumeração independente de **768 execuções**: 128 caminhos × três apoios × sem/com consulta ao modelo, usando eventos atuais e acesso textual simulado. Cobertura dos 68 nós, finais alcançados, ausência da contradição, fala única por envio e retrospectiva sem destaque de resposta pulada.
- **768 round-trips** de snapshot dos finais, com equivalência do estado restaurado.
- Nove snapshots reais gerados a partir do código original `f6e7cd4`: rascunho, posição anterior à resposta contraditória e histórico concluído, nos três apoios. Falas, evidências e decisões preservadas; rascunhos parciais conferidos. Um décimo caso cobre o recall da grafia que a versão antiga aceitava.
- Cinco respostas alternativas adequadas e seis de intenção, referente ou contexto incorretos verificadas independentemente; palavras fragmentadas recusadas; respostas canônicas e referências de áudio das 24 práticas válidas.
- **60 testes em quatro arquivos**, executados nesta conversa: `content-corrections`, `theory-study-validation`, `demo-integrated-paths` e `demo-retrospective`, todos aprovados.
- Comparação independente com o commit-base: **50 IDs e seus textos ingleses de áudio permanecem idênticos**. O ajuste de tradução não troca a fala associada a um MP3.
- `git diff --check` aprovado.

Evidências locais: [percursos independentes](../output/corrections-leader-audit-2026-10-28/percursos-independentes.json), [snapshots e respostas](../output/corrections-leader-audit-2026-10-28/snapshots-e-respostas.json) e [caso antigo de recall](../output/corrections-leader-audit-2026-10-28/legacy-punctured-recall-v7.json).

**Conferência visual e limites**

O líder inspecionou as capturas finais dos componentes em 320 px, 390 px e desktop, incluindo escrita com altura reduzida, identificação dos copos, a prática de possessivos organizada em itens e os controles de duas falas. Também inspecionou as 12 variantes de imagem de 640 px em [prancha](../output/corrections-leader-audit-2026-10-28/ilustracoes-640.png), em complemento à inspeção anterior das 12 variantes de 960 px.

O executor registrou erro, acerto e modelo das 24 práticas no navegador e funcionamento dos controles de reprodução, usando os MP3s já publicados. O ambiente visual usa componentes reais, com cabeçalho, serviços e persistência substituídos para isolamento. Isso não é um novo teste da aplicação conectada em produção, em aparelho físico ou com conta real.

Não houve escuta editorial dos 46 MP3s, medição de retenção ou teste com alunos. Pronúncia, entonação, duração real com participantes e eficácia continuam fora do aceite. As mensagens do produto não devem transformar conclusão ou consulta ao modelo em certificação dessas capacidades. A estimativa não medida de 20 minutos foi retirada da entrada.

O executor informou **492 testes em 66 arquivos**, lint, TypeScript e build de produção aprovados. O líder conferiu também os resultados dos comandos da rodada final: `npm test`, `npm run lint` e `npx tsc --noEmit && npm run build` encerraram com código 0. O último status de processo 143 era o encerramento deliberado do servidor descartável de QA, não uma falha de build. As execuções acima especificadas foram feitas separadamente pelo líder; os números não devem ser somados como se fossem testes distintos.

As correções são locais. Não houve autorização nesta atividade para commit, push ou deploy, e este parecer não declara publicação. O avanço de estudo existente e a elegibilidade anterior para aula foram preservados nos contratos conferidos.

O marcador de uso começou em 8% e a última leitura disponível nesta conferência foi 10%: diferença observada de dois pontos percentuais, dentro do teto conservador de dez pontos adicionais. É um indicador agregado, não uma medição exata dos créditos deste trabalho. Nenhum reset foi solicitado.

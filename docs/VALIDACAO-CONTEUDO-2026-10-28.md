# Validação do conteúdo de estudo — BasedSpeak

28/10/2026 · História `cafe-v7` · Parecer editorial e pedagógico sobre o material implementado.

**Resultado geral: SUFICIENTE para a entrega completa no estado auditado. A base linguística e a teoria são BOAS.** O conjunto ainda precisa de ajustes antes de ser apresentado como conteúdo inteiramente revisado para lançamento. O principal problema é uma preferência do aluno contrariada pelo próprio roteiro; o segundo é a diferença entre uma instrução comunicativa aberta e a escrita aceita pelo exercício.

Não encontrei um erro gramatical central que torne o material inadequado para aprender inglês. Isso não torna todas as variantes igualmente boas. A classificação geral considera as falhas materiais que sobrevivem aos testes, sem fazer uma média que esconda um ramo problemático.

**Escala aplicada**

| Nível | Critério nesta revisão |
| --- | --- |
| Péssimo | O objetivo central falha: ensina erros fundamentais ou torna o percurso essencialmente inutilizável. |
| Ruim | Há falha relevante de sentido, coerência ou avaliação que exige correção para essa parte cumprir sua proposta. |
| Suficiente | Cumpre a proposta básica, com limitações importantes ou ajustes materiais ainda necessários. |
| Bom | Conteúdo correto, claro e adequado à introdução proposta, com melhorias localizadas. |
| Perfeito | Nenhuma ressalva material identificada dentro do escopo efetivamente conferido. Não significa perfeição absoluta nem eficácia universal. |

Não é necessário distribuir artificialmente os itens entre os cinco níveis. Nenhuma parte recebeu “péssimo”; não há base para dar “perfeito” ao conjunto.

**O que foi coberto**

- Leitura editorial integral dos 68 nós das dez partes, dos 50 IDs de fala e seus significados, dos modelos, pistas, alternativas, blocos e distratores, dos cartões efetivos de apresentação e das instruções móveis.
- Oito lições completas: explicação principal, aprofundamento, 24 enunciados, respostas previstas, alternativas, feedback e consulta ao modelo.
- Os três apoios: Guiado (`beginner`), Com pistas (`some`) e Mais autônomo (`less`), incluindo diferenças por histórico e a possibilidade de recorrer às peças.
- Enumeração de todos os 128 caminhos narrativos e execução dos 384 casos pelo motor atual: 128 caminhos × três apoios. Todos chegaram ao final; nenhum nó ficou inacessível.
- Inspeção visual das 12 ilustrações WebP de 960 px em uma prancha de conferência. As variantes de resolução de 640 px não receberam inspeção visual independente.
- Retrospectiva, consulta de expressões, passagem da história ao estudo, apresentação inicial e mensagens de conclusão.
- Execução de 152 testes existentes em 16 arquivos, todos aprovados.

As execuções adicionais usaram acesso textual explícito em lugar da reprodução, com eventos atuais (`AUDIO_ACCESS`, `ADVANCE_PRESENTATION`, `ANSWER_MEANING`, `PLACE_BLOCK`, `SEND_RESPONSE`). Não simularam sucesso de escuta como evidência real. Os testes existentes também percorrem 128 caminhos × três apoios × envio normal/com apoio completo; isso verifica transições, não aprendizagem nem qualidade editorial de todas as falas.

**Limites importantes da conclusão:** não houve escuta dos 46 arquivos de áudio únicos, teste com alunos, medição de retenção, produção oral, navegação nova em aparelho físico ou auditoria de acessibilidade. O inventário textual de áudio foi integralmente revisado; pronúncia, entonação e naturalidade sonora permanecem **pendentes de avaliação**, que é um status de cobertura, não um sexto nível de qualidade. Os registros anteriores de decodificação e integridade de mídia não substituem essa escuta. Também não se declara revisão do currículo antigo aposentado, dos PDFs históricos ou de cursos futuros: a fonte de conteúdo atual é a implementação desta história e deste estudo.

**Classificação das partes da história**

| Parte | Nível | Avaliação e variantes |
| --- | --- | --- |
| 1 — Encontro | Bom | Pergunta útil e situação concreta, com apresentação breve. A imagem já mostra os dois cafés; essa continuidade precisa ser conciliada com a chegada posterior. |
| 2 — De quem é o copo? | Bom | Contexto, posse e negativa se conectam. O contraste `it's / it's not` é pertinente. A escolha de significado é introdutória e fortemente apoiada. |
| 3 — Continuar a conversa | Bom | Perguntar pelo pedido e tranquilizar Lucas são intenções válidas. `What did you order?` e `It's okay.` são adequados. |
| 4 — Pedido e identificação | Suficiente | Confirmar `mine` após `not mine` é boa transferência. O ramo `Me too.` após uma resposta nominal depende de elipse; a chegada do café e a identidade escrita no copo precisam de alinhamento. |
| 5 — Opinião sobre a bebida | Bom | Gostar e não gostar muito são posições legítimas; as reações não punem a escolha negativa. `Not really.` é apropriado aqui. |
| 6 — Avisar e aliviar | Bom | `Careful!` antes do risco e `That was close.` depois formam contraste funcional claro. A cena sem pressão temporal é apropriada ao iniciante. |
| 7 — Cansaço | Bom | Ambos os ramos são coerentes: `Me too.` e `Not really.` retomam o estado. No apoio Com pistas há um esqueleto inadequado em `Really? ___`. |
| 8 — Sentar e escolher assunto | Bom | Convite, aceitação e mudança para a mesa são naturais. Inglês e trabalho permitem usos diferentes, com recombinação pertinente de `Do you like…?`. |
| 9 — Conversa e permanência | Suficiente | Os quatro ramos de opinião são bons localmente. A combinação “não gosto muito da cafeteria → ficar” desemboca numa continuação ruim na parte 10. |
| 10 — Continuação e despedida | Suficiente | Ir, despedir-se e propor contato funcionam. O ramo que obriga `I like it here.` após uma opinião negativa é ruim; a transição depois de ficar também é curta demais. |

O nível “bom” de uma parte avalia seu conteúdo introdutório. Não elimina as limitações transversais do apoio de escrita nem substitui as notas específicas dos nós e combinações nos anexos.

**Classificação das oito lições de teoria**

| Lição | Nível | Julgamento |
| --- | --- | --- |
| De quem é? | Bom | Explica corretamente `my/mine`, `your/yours`, ordem da pergunta e `no/not`. Falta praticar diretamente a escolha entre possessivo antes do nome e pronome que o substitui. |
| O que você pediu? | Bom | `did + order`, artigo pelo som, porção de café e retomada com `And you?` estão bem explicados. Nem todos esses pontos são verificados pelas práticas. |
| Reagir com naturalidade | Bom | Distingue surpresa, concordância, desculpa e alerta, com limites de tom e ironia. Há muitas expressões reunidas em poucos passos. |
| Do que você gosta? | Bom | Evita copiar a preposição de “gostar de”, explica `do` e contextualiza `I like it here.`. Duas frases de explicação podem ficar mais precisas. |
| Um pouco sobre você | Bom | Boa distinção entre estado (`tired`) e atividade (`learning`), inclusive aprendizagem ao longo de um período. `work/job` e excesso estão corretos. |
| Senta comigo? | Bom | Marca informalidade e contexto; o novo pedido `Can I sit here?` é claramente identificado e amplia a aplicação. |
| Ficar mais ou ir? | Bom | Possibilidade, necessidade e duração extra são bem separadas. A comparação `can go / have to go` é correta. |
| Até a próxima | Bom | Explica função social, expressão fixa, `me too/you too` e o limite de analisar `-ing` isoladamente. |

As distinções entre possessivo antes do nome e pronome possessivo, e o uso de `do` nas perguntas com `like`, estão alinhados às referências oficiais do [British Council sobre possessivos](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/possessives-pronouns) e [presente simples](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/present-simple), consultadas nesta rodada. São referências linguísticas; não validam empiricamente a eficácia desta interface.

**Achados que mudam a decisão de lançamento**

**F01 — Alta prioridade: o roteiro contraria a opinião escolhida.** Depois de `Do you like this café?`, a pessoa escolhe `Not really.`, decide ficar e é obrigada a dizer `I like it here.` no mesmo local. Uma pessoa poderia apreciar um aspecto do lugar apesar de não gostar muito da cafeteria, mas o roteiro não oferece essa intenção, uma ressalva nem uma mudança de opinião. Não cabe inferir essa nuance pelo aluno.

Reprodução confirmada nos três apoios:

> Lucas: Do you like this café? → Você: Not really. → Você: I can stay a little longer. → Lucas: It's quiet here. → Você: I like it here.

O problema ocorre em **16/128 caminhos narrativos e 48/384 casos de apoio**. São 12,5% das combinações enumeradas; não é uma estimativa da frequência entre usuários reais. Fontes: [opinião negativa e permanência](../src/features/demo/content/parts/part-09.ts), linhas 10–19, e [continuação obrigatória](../src/features/demo/content/parts/part-10.ts), linhas 4–6.

Correção recomendada: preservar a preferência anterior. Por exemplo, depois de `It's quiet here.`, encaminhar quem havia respondido negativamente à despedida sem exigir `I like it here.`; quem expressou gosto pode continuar a adaptação. Não é necessário inventar fala ou gravar áudio novo para resolver a incoerência. Ao corrigir, conferir também retrospectiva e retomada do ramo.

**F02 — Alta prioridade no apoio Mais autônomo: intenção ampla, resposta única.** O enunciado pede aceitar um convite ou despedir-se, mas a validação compara com apenas um modelo normalizado. Foram confirmadas recusas de `No, not mine.`, `Sure!` e `Goodbye!` nos respectivos exercícios. Essas formulações podem cumprir a intenção; a recusa não demonstra erro de inglês. Fontes: [practice.ts](../src/features/demo/model/practice.ts), linhas 30–37; [reducer.ts](../src/features/demo/model/reducer.ts), linhas 177–179; [campo de escrita](../src/features/demo/DemoExperience.tsx), linhas 127–129.

O feedback diz que não reconheceu a resposta, o que evita afirmar explicitamente que toda alternativa está errada. Ainda assim, a instrução não torna a restrição clara antes da tentativa. Recomendo explicitar “recupere a expressão praticada” e o repertório aceito, ou aceitar um conjunto curado de variantes por intenção. Na teoria, lacunas como “complete só a palavra” já delimitam melhor a tarefa; não há motivo para aceitar qualquer sinônimo nelas.

**F03 — Prioridade moderada: continuidade visual e nome do copo.** V01 já mostra os dois cafés sobre o balcão; depois, o cartão de `p4.arrival-a` anuncia “Seu café chegou”. Além disso, a imagem escreve **BASEDSPEAK**, enquanto as pistas pedem reconhecer **based** como o nome no copo. São referências aproximadas, mas o iniciante depende delas justamente para decidir pertencimento. Fontes: [V01](../public/demo/cafe/v2/images/V01-960.webp), [V04](../public/demo/cafe/v2/images/V04-960.webp), [cartão de chegada](../src/features/demo/content/presentation.ts), linha 5, e [pistas de posse](../src/features/demo/content/parts/part-02.ts), linha 5. Recomendo ajustar o texto ao que as imagens já mostram: “Vocês conferem os cafés” e uma identificação consistente como BASEDSPEAK, sem regenerar as ilustrações.

**F04 — Prioridade moderada: lacunas sem trecho ausente.** No apoio Com pistas, a regra automática gera `Really? ___` e `Bye! ___`, embora a resposta inteira já esteja antes da lacuna. Confirmado para `p7.tired` e `p10.bye`; os esqueletos são apresentados na fase de montagem. `Careful!` também recebe um esqueleto internamente, mas usa outra fase e não foi contado como problema visível. Fontes: [fallback](../src/features/demo/model/practice.ts), linha 15; [renderização](../src/features/demo/DemoExperience.tsx), linha 122. Recomendo omitir o esqueleto nessas falas de uma palavra.

**F05 — Prioridade moderada: cinco passos da teoria não ligam ao áudio existente.** A correspondência exige que toda a frase do cartão seja igual a uma entrada do inventário. Por isso, `iced-coffee`, `sorry-okay`, `careful-close`, `work-job` e `break-quiet` ficam sem esse apoio: são trechos ou combinações de falas, mesmo havendo gravações catalogadas para suas partes. O exemplo novo `can-sit` também não tem correspondência, como esperado; não é a mesma lacuna. Fonte: [CachedAudio](../src/features/theory/TheoryExperience.tsx), linhas 21–24. Recomendo associar IDs explícitos dos áudios já publicados e permitir ouvir cada fala pertinente separadamente, sem geração nova. O achado é de ligação entre texto e inventário, não de qualidade sonora.

**Ajustes editoriais e pedagógicos de menor gravidade**

| ID | Evidência | Efeito e recomendação |
| --- | --- | --- |
| F06 | `media.ts:11` versus `theory/content.ts:127–130` | `Too much work` aparece como “Muito trabalho” no inventário e “Trabalho demais” na teoria. A segunda preserva melhor o excesso. Padronizar o significado contextual. O sentido de excesso é também indicado pela [referência oficial Cambridge](https://dictionary.cambridge.org/grammar/british-grammar/too-enough), recuperada na busca; a abertura direta retornou 403. |
| F07 | `part-04.ts:3–4` | `Me too.` depois de `An iced coffee. And you?` é compreensível por elipse, sem erro gramatical inequívoco. Como modelo de primeiro contato, uma resposta explícita sobre o pedido seria mais transparente. Não considero isso isoladamente um bloqueador, nem recomendo alterar áudio nesta avaliação. |
| F08 | `part-02.ts:8` | A pista `this → o café` mistura referente e significado. Preferir “this aponta para este objeto; aqui, o copo/café”. Não ensinar “café” como tradução fixa de `this`. |
| F09 | `theory/content.ts:93,105` | Trocar “sem repetir seu nome” por “sem repetir o nome da bebida ou do objeto”; em `I like English`, dizer “idioma de que a pessoa gosta”, sem atribuir obrigatoriamente “gosta de estudar” à frase isolada. |
| F10 | `theory/progress.ts:20–25` | A normalização aceita `n.o.t`, `s,u,r,e` e `t.o`, por apagar pontuação em qualquer posição. Não muda polaridade, mas não avalia ortografia. Se esse for um objetivo, limitar tolerância à pontuação nas bordas. |
| F11 | `part-10.ts:9` e apresentação efetiva | O contexto interno diz “Vocês combinam como manter contato”, mas a única fala é `Sure!`. Preferir “Lucas aceita manter contato”. **Na UI atual, esse contexto de cena é suprimido pela apresentação de diálogo**; é uma imprecisão da fonte editorial, não uma afirmação visível que foi observada em uso. |
| F12 | `DemoExperience.tsx:36,104–107`; `presentation.ts:11` | A passagem “Depois de mais alguns minutos” está num cabeçalho que não aparece nessa sequência. Quem ficou logo chega à despedida após uma troca adicional. Inserir a passagem de tempo num cartão efetivo, se quiser comunicar permanência mais longa. |
| F13 | Práticas detalhadas abaixo | Oito práticas são suficientes, com distratores distantes ou montagem muito previsível. Uma segunda aplicação em outro contexto melhoraria a cobertura, sobretudo `my/mine`, `a/an`, `order/ordered`, `work/job` e estado/atividade. Não é necessário transformar a introdução numa prova extensa. |

**O que o material consegue avaliar**

As 24 práticas são dez escolhas, oito montagens e seis escritas curtas. Avaliam reconhecimento de intenção, reconstrução de ordem e recuperação restrita de uma palavra ou expressão. Vocabulário fornecido, capitalização e pontuação reduzem a dificuldade das montagens. Isso é aceitável para uma primeira exploração, mas acerto não comprova transferência espontânea.

Consultar o modelo pode concluir uma prática com apoio, como o próprio botão informa. Uma nova tentativa correta pode remover essa marca; revisão da explicação, pista e feedback também ajudam sem serem registrados como “consulta ao modelo”. Portanto, `supported` indica uma condição específica da tentativa, não ausência de todo apoio, autonomia, retenção ou domínio. A interface contém ressalvas adequadas: concluir não é avaliação de nível; o percurso é uma primeira exploração. Não encontrei falsa certificação nesse texto.

A retrospectiva usa o histórico efetivo, preserva a escrita aceita, distingue apoio e não inventa falas de ramos ausentes. “Ouvir modelo” é uma boa distinção quando a reprodução é canônica. O convite ao estudo não exige avaliação da experiência. Esses são pontos fortes do conjunto.

**Decisão recomendada**

Corrigir F01 e resolver a expectativa de F02 antes de declarar a revisão de lançamento concluída. Corrigir também F03 e F04, que afetam diretamente as referências fornecidas ao iniciante. F05 melhora o apoio disponível sem exigir áudio novo. Os demais itens podem ser tratados como refinamento editorial, conforme prioridade do lançamento.

Depois das correções, o alvo razoável é **BOM**, com nova conferência dos caminhos afetados. Não atribuo essa nota futura antecipadamente. A aprovação integral de mídia continua dependendo da escuta dos arquivos; a duração anunciada de cerca de 20 minutos e a adequação a alunos reais ainda precisam de observação, sem estimativa inventada nesta revisão.

Esta atividade produziu um parecer e evidências locais. Não alterou o conteúdo do produto, não fez commit/deploy e não gerou áudio ou imagem de produção.

**Evidências e rastreabilidade**

- [Matriz individual dos 384 percursos](../output/content-audit-2026-10-28/matriz-384-percursos.csv): cada combinação, apoio, notas das partes críticas, justificativas e sequência de nós. O nível do percurso considera também as limitações da parte 4; não é uma média matemática das telas.
- [Dados e transcrições reproduzidas](../output/content-audit-2026-10-28/evidencias.json): 128 caminhos, 384 execuções, exemplos nos três apoios, respostas recusadas e tolerâncias confirmadas.
- [Identidade das fontes por SHA-256](../output/content-audit-2026-10-28/fontes-sha256.json): commit-base e conteúdo dos arquivos auditados, para identificar alterações posteriores.
- [Prancha das 12 ilustrações](../output/content-audit-2026-10-28/ilustracoes.png).

O commit-base registrado nas evidências é `f6e7cd4f04c5547caa721080be6fd80c1b518842`. As notas pertencem ao conteúdo identificado nesse registro, não a modificações futuras.

Comando de testes executado: `npm test -- tests/demo-model.test.ts tests/demo-integrated-paths.test.ts tests/demo-listening.test.ts tests/demo-response-practice.test.ts tests/demo-study-journey.test.ts tests/theory-study-validation.test.ts tests/theory-progress.test.ts tests/demo-retrospective.test.ts tests/demo-presentation.test.ts tests/demo-opening.test.ts tests/demo-media.test.ts tests/demo-test-navigation.test.ts tests/conversation-position.test.ts tests/published-audio.test.ts tests/demo-audio.test.ts tests/demo-layout.test.ts`.

Resultado: **16 arquivos aprovados; 152 testes aprovados**. Não foram executados build/lint adicionais, pois não houve mudança de implementação; esses testes não são uma validação de serviços remotos nem uma prova de aprendizagem.

O uso da conta foi acompanhado a partir de um marcador inicial de **8%**. O limite solicitado foi tratado como, no máximo, dez pontos percentuais adicionais da capacidade total. A ferramenta não oferece bloqueio por atividade nem atribuição exata de créditos a este parecer; sua leitura é agregada e pode ter atraso. Não foi consumido crédito de reset nem contratado serviço adicional. A leitura final está registrada ao fim deste documento.


**Conferência das 24 práticas, uma a uma**

A nota abaixo avalia a prática, que pode ser mais limitada que a explicação do mesmo passo. “Escrita” significa preenchimento ou expressão delimitada; não produção livre. A normalização aceita caixa, espaços, apóstrofos previstos e algumas contrações equivalentes.

| Lição / ID | Tipo | Alvo aceito | Nível | Justificativa |
| --- | --- | --- | --- | --- |
| De quem é? / `this-yours` | Escolha | `Se o copo é seu.` | Bom | Identifica pertencimento numa situação clara; alternativas distinguem preferência e saída. |
| De quem é? / `mine-your` | Montagem | `This is mine.` | Suficiente | Ordem correta, mas três peças com pistas gráficas; não contrasta my/mine ou your/yours. |
| De quem é? / `its-not` | Escrita | `not` | Bom | Pede só a palavra negativa; not resolve a intenção e a pista é pertinente. |
| O que você pediu? / `did-order` | Montagem | `What did you order?` | Bom | Reconstrói a ordem What + did + you + order; não testa escolher order em vez de ordered. |
| O que você pediu? / `iced-coffee` | Escolha | `An iced coffee.` | Suficiente | Tradução correta; sweet é pertinente, quiet é distante; não testa a/an ou som inicial. |
| O que você pediu? / `and-you` | Escrita | `And you?` / `And you` | Bom | Pedido de duas palavras delimita a resposta; pontuação e caixa são toleradas. |
| Reagir com naturalidade / `really-too` | Escolha | `Me too.` | Bom | Bom contraste de função entre surpresa, concordância positiva e negativa atenuada. |
| Reagir com naturalidade / `sorry-okay` | Escolha | `It's okay.` | Suficiente | Resposta social correta, com alternativas pouco competitivas; não contrasta Thanks/Sorry/Okay. |
| Reagir com naturalidade / `careful-close` | Escolha | `Careful!` | Bom | Contrasta avisar durante o risco com comentar o alívio depois dele. |
| Do que você gosta? / `like-it` | Montagem | `I like it.` | Suficiente | Três peças previsíveis; não exige evitar am ou a preposição copiada do português. |
| Do que você gosta? / `do-you-like` | Montagem | `Do you like this café?` | Bom | Cinco peças praticam auxiliar, sujeito e complemento, transferindo o padrão à cafeteria. |
| Do que você gosta? / `like-here` | Escolha | `I like it here.` | Bom | Distingue estar no lugar, gostar do idioma e pertencimento; resposta inequívoca. |
| Um pouco sobre você / `im-tired` | Escrita | `I'm` / `I’m` / `I am` | Bom | Aceita I am por normalização, além da contração; a explicação informa ambas as formas. |
| Um pouco sobre você / `learning` | Montagem | `I'm learning English.` | Suficiente | Frase correta, mas três peças; não discrimina estado, simples e atividade em andamento. |
| Um pouco sobre você / `work-job` | Escolha | `Too much work.` | Suficiente | Identifica excesso, mas distratores fáceis; não testa diferença fina entre work/job e quantidade/excesso. |
| Senta comigo? / `sit-me` | Escolha | `Que você se sente com ela.` | Bom | Confere a intenção social do convite; deixa claro que a tarefa é receptiva. |
| Senta comigo? / `yeah-sure` | Escrita | `sure` | Suficiente | Recupera uma palavra da fala especificada; não verifica alternativas de aceitação ou registro. |
| Senta comigo? / `can-sit` | Montagem | `Can I sit here?` | Bom | Exemplo novo identificado, com inversão Can I e posição de here. |
| Ficar mais ou ir? / `stay-longer` | Montagem | `I can stay a little longer.` | Bom | Seis peças reconstroem possibilidade e duração adicional; maior demanda de ordem. |
| Ficar mais ou ir? / `have-go` | Escrita | `to` | Suficiente | Lacuna de to é correta e bem delimitada, mas não verifica contraste funcional com can. |
| Ficar mais ou ir? / `break-quiet` | Escolha | `I need a break.` | Bom | Distingue necessidade pessoal de comentários plausíveis sobre o lugar. |
| Até a próxima / `keep-touch` | Montagem | `Can we keep in touch?` | Bom | Reconstrói pergunta e expressão fixa; não pressupõe canal ou dados de contato. |
| Até a próxima / `nice-talking` | Escolha | `Ao encerrar uma conversa agradável.` | Bom | Confere adequação pragmática ao fim de uma conversa; análise de ing não é exigida. |
| Até a próxima / `you-too-bye` | Escrita | `You` | Bom | Lacuna mira o contraste you/me numa gentileza concreta; resposta da história delimita a forma. |

**Conferência dos 68 nós da história**

Todos os nós abaixo foram lidos. As notas locais não substituem a avaliação das combinações: a contradição de F01 depende de nós anteriores e atinge qualquer apoio. Notas “Bom” de cenas sem exercício significam adequação narrativa, não evidência de aprendizagem.

| Parte / nó | Nível | Julgamento local |
| --- | --- | --- |
| 1 / `p1.first` | Bom | Introdução curta; a arte inicial deve ser conciliada com a chegada posterior do café (F03). |
| 1 / `p1.context` | Bom | Situação adulta e concreta, antes da pergunta. |
| 1 / `p1.lucas` | Bom | Is this yours? é funcional; o referente depende do gesto e do copo. |
| 2 / `p2.prompt` | Bom | Orienta a compreensão sem acumular tarefas. |
| 2 / `p2.question` | Suficiente | Posse versus desejo é pertinente, mas duas opções e pistas fortes limitam a evidência. |
| 2 / `p2.send` | Bom | Negativa corresponde ao copo de Lucas; distrator opõe polaridade. |
| 2 / `p2.reaction` | Bom | Desculpa plausível, imediatamente após o envio. |
| 3 / `p3.prompt` | Bom | Prepara a escolha de intenção. |
| 3 / `p3.intent` | Bom | Perguntar e tranquilizar são escolhas legítimas. |
| 3 / `p3.ask` | Bom | Pergunta correta; duas peças grandes reduzem a demanda. |
| 3 / `p3.okay` | Bom | Resposta natural à desculpa. |
| 4 / `p4.order` | Bom | Pedido e And you? mantêm reciprocidade. |
| 4 / `p4.same` | Suficiente | Me too é compreensível por elipse, menos transparente para o primeiro modelo de pedido (F07). |
| 4 / `p4.nice-a` | Bom | Reação positiva breve acompanha a resposta. |
| 4 / `p4.arrival-a` | Suficiente | Anuncia chegada de café já visível em V01 (F03). |
| 4 / `p4.new-cup` | Suficiente | Reutiliza a pergunta com outro referente; nome escrito e pista precisam ser consistentes (F03). |
| 4 / `p4.mine` | Bom | Boa adaptação de negativa para confirmação de posse; preservar referência visual. |
| 4 / `p4.nice-b` | Bom | Reação acolhe a confirmação. |
| 4 / `p4.arrival-b` | Suficiente | Reconhecimento do próprio copo fica pouco marcado visualmente; o contexto interno é mais explícito que o diálogo efetivo. |
| 5 / `p5.taste` | Bom | Experimentar antes da opinião dá contexto ao sentido. |
| 5 / `p5.opinion` | Bom | Ambas as preferências são válidas. |
| 5 / `p5.like` | Bom | I like it retoma a bebida de forma adequada. |
| 5 / `p5.not` | Bom | Not really suaviza a resposta negativa. |
| 5 / `p5.reaction-like` | Bom | Surpresa e concordância combinam com a opinião positiva. |
| 5 / `p5.reaction-not` | Bom | Preferência diferente de Lucas não invalida a resposta do aluno. |
| 6 / `p6.warn` | Bom | Careful avisa no momento adequado, sem corrida contra relógio. |
| 6 / `p6.safe` | Bom | Agradecimento e alívio fecham o incidente. |
| 7 / `p7.tired` | Bom | Really mostra interesse/surpresa; corrigir esqueleto Com pistas (F04). |
| 7 / `p7.work` | Bom | Explica cansaço e devolve a vez; melhorar tradução de too much (F06). |
| 7 / `p7.opinion` | Bom | As duas opções de estado são plausíveis. |
| 7 / `p7.too` | Bom | Me too retoma uma afirmação positiva de cansaço. |
| 7 / `p7.not` | Bom | Not really funciona como resposta atenuada ao estado proposto. |
| 7 / `p7.long-day` | Bom | Comentário acolhe a experiência compartilhada. |
| 7 / `p7.lucky` | Bom | Lucky you é compatível com ter menos cansaço; tom real ainda requer escuta. |
| 8 / `p8.table` | Bom | Mesa livre motiva mudança de cena. |
| 8 / `p8.accept` | Bom | Yeah, sure aceita claramente o convite. |
| 8 / `p8.topic` | Bom | Reação e contexto de sentar antecedem nova escolha. |
| 8 / `p8.english` | Bom | Apresenta atividade atual de aprendizado de forma natural. |
| 8 / `p8.nice` | Bom | Reação positiva abre pergunta sobre aprender inglês. |
| 8 / `p8.job` | Bom | Boa recombinação de pergunta com your job. |
| 8 / `p8.job-reaction` | Bom | Gostar do trabalho e estar cansado são compatíveis. |
| 9 / `p9.english-opinion` | Bom | Contexto português esclarece referente da pergunta sobre gostar. |
| 9 / `p9.english-like` | Bom | Opinião positiva é coerente com o assunto. |
| 9 / `p9.english-not` | Bom | É possível aprender inglês e não gostar muito; ramo válido. |
| 9 / `p9.english-positive` | Bom | Me too retoma opinião positiva, sem problema de polaridade. |
| 9 / `p9.english-negative` | Bom | Really pode reagir à opinião inesperada; naturalidade sonora pendente. |
| 9 / `p9.cafe` | Bom | Recombinação para this café transfere o padrão da pergunta. |
| 9 / `p9.cafe-reaction` | Bom | Resposta afirmativa de Lucas fecha o tópico. |
| 9 / `p9.break` | Bom | Pausa é plausível depois do cansaço do trabalho. |
| 9 / `p9.cafe-opinion` | Bom | Pergunta sobre o lugar é direta. |
| 9 / `p9.cafe-like` | Bom | Yeah, I like it corresponde à opinião positiva. |
| 9 / `p9.cafe-not` | Bom | Negativa é adequada localmente; sua combinação com ficar é ruim (F01). |
| 9 / `p9.work-positive` | Bom | Me too acompanha opinião positiva. |
| 9 / `p9.work-negative` | Bom | Surpresa pode acompanhar opinião negativa sem negá-la. |
| 9 / `p9.pause` | Bom | Ficar ou sair são escolhas válidas; ficar não deveria obrigar gostar do lugar. |
| 9 / `p9.stay` | Bom | Possibilidade e duração extra são claras; conferir continuação em F01. |
| 9 / `p9.go` | Bom | Necessidade de sair é natural e não exige explicar o motivo. |
| 9 / `p9.stay-reaction` | Bom | Lucas acompanha disponibilidade para continuar. |
| 9 / `p9.go-reaction` | Bom | Oh, okay aceita a saída. |
| 10 / `p10.quiet` | Bom | Comentário sobre ambiente tranquilo é pertinente à pausa. |
| 10 / `p10.here` | Suficiente | Boa adaptação isolada; ruim quando o aluno havia negado gostar da cafeteria (F01). |
| 10 / `p10.here-reaction` | Bom | Concordância de Lucas é adequada à fala positiva efetivamente enviada. |
| 10 / `p10.contact` | Bom | Propor contato e apenas despedir-se são legítimos; passagem de tempo pode melhorar (F12). |
| 10 / `p10.keep` | Bom | Pergunta natural, sem exigir dados pessoais. |
| 10 / `p10.sure` | Bom | Sure aceita a proposta; corrigir somente o contexto interno impreciso (F11). |
| 10 / `p10.farewell` | Bom | Nice talking to you valoriza a conversa e sinaliza encerramento. |
| 10 / `p10.bye` | Bom | Despedida final natural; corrigir esqueleto Com pistas (F04). |
| 10 / `end` | Bom | Fechamento e retrospectiva distinguem participação de domínio. |

**Variantes dos 25 exercícios de resposta nos três apoios**

Esta tabela explicita as peças e alternativas efetivas produzidas pelo catálogo. No Guiado, uma expressão nova passa pelo modelo antes da atividade. Expressões já encontradas podem entrar em “tente lembrar” antes da conferência; isso varia pelo histórico real do percurso. Em Com pistas, o esqueleto é uma estrutura de apoio, não uma resposta adicional. Mais autônomo permite recorrer às peças preservando a escrita.

A Ajuda das respostas abre atualmente o modelo completo; listas de pistas nos dados não significam que a interface ofereça sempre uma escada de pistas graduais. `Careful!` é uma exceção deliberada: todos recebem a expressão antes do envio.

| Nó / alvo | Guiado | Com pistas | Mais autônomo |
| --- | --- | --- | --- |
| `p2.send`: `No, it’s not mine.` | Bom: peças `mine` / `No` / `it’s not` | Bom: peças `mine` / `No` / `it’s not` / `it’s`; estrutura `No ___` | Suficiente: escrita do modelo normalizado; F02 |
| `p3.ask`: `What did you order?` | Bom: peças `order?` / `What did you` | Bom: peças `order?` / `What did you` / `What do you`; estrutura `What did you ___` | Suficiente: escrita do modelo normalizado; F02 |
| `p3.okay`: `It’s okay.` | Bom: reconhecimento entre `It’s okay.` / `Not really.` / `Me too.` | Bom: peças `It’s` / `okay.`; estrutura `It’s ___` | Suficiente: escrita do modelo normalizado; F02 |
| `p4.same`: `Me too.` | Bom: reconhecimento entre `Not really.` / `Me too.` / `It’s okay.` | Bom: peças `Me` / `too.`; estrutura `Me ___` | Suficiente: escrita do modelo normalizado; F02 |
| `p4.mine`: `Yes, it’s mine.` | Bom: peças `mine` / `Yes` / `it’s` | Bom: peças `mine` / `it’s not` / `Yes` / `it’s`; estrutura `Yes ___` | Suficiente: escrita do modelo normalizado; F02 |
| `p5.like`: `I like it.` | Bom: peças `it` / `I like` | Bom: peças `it` / `I like` / `I don’t like`; estrutura `I like ___` | Suficiente: escrita do modelo normalizado; F02 |
| `p5.not`: `Not really.` | Bom: reconhecimento entre `Me too.` / `Not really.` / `It’s okay.` | Bom: peças `Not` / `really.`; estrutura `Not ___` | Suficiente: escrita do modelo normalizado; F02 |
| `p6.warn`: `Careful!` | Bom: envio apoiado de Careful! | Bom: envio apoiado de Careful! | Bom: envio apoiado de Careful! |
| `p7.tired`: `Really?` | Bom: reconhecimento entre `Not really.` / `Really?` / `It’s okay.` | Suficiente: `Really? ___`; F04 | Suficiente: escrita do modelo normalizado; F02 |
| `p7.too`: `Me too.` | Bom: reconhecimento entre `Not really.` / `Me too.` / `It’s okay.` | Bom: peças `Me` / `too.`; estrutura `Me ___` | Suficiente: escrita do modelo normalizado; F02 |
| `p7.not`: `Not really.` | Bom: reconhecimento entre `It’s okay.` / `Me too.` / `Not really.` | Bom: peças `Not` / `really.`; estrutura `Not ___` | Suficiente: escrita do modelo normalizado; F02 |
| `p8.accept`: `Yeah, sure.` | Bom: reconhecimento entre `It’s okay.` / `Not really.` / `Yeah, sure.` | Bom: peças `Yeah,` / `sure.`; estrutura `Yeah, ___` | Suficiente: escrita do modelo normalizado; F02 |
| `p8.english`: `I’m learning English.` | Bom: peças `English` / `I’m learning` | Bom: peças `English` / `I’m learning` / `I’m teaching`; estrutura `I’m learning ___` | Suficiente: escrita do modelo normalizado; F02 |
| `p8.job`: `Do you like your job?` | Bom: peças `your job` | Bom: peças `your job` / `your coffee`; estrutura `Do you like ___?` | Suficiente: escrita do modelo normalizado; F02 |
| `p9.english-like`: `I like it.` | Bom: reconhecimento entre `Not really.` / `I like it.` / `It’s okay.` | Bom: peças `I` / `like` / `it.` / `I don’t like`; estrutura `I ___` | Suficiente: escrita do modelo normalizado; F02 |
| `p9.english-not`: `Not really.` | Bom: reconhecimento entre `Me too.` / `Not really.` / `It’s okay.` | Bom: peças `Not` / `really.`; estrutura `Not ___` | Suficiente: escrita do modelo normalizado; F02 |
| `p9.cafe`: `Do you like this café?` | Bom: peças `this café` | Bom: peças `this café` / `your job`; estrutura `Do you like ___?` | Suficiente: escrita do modelo normalizado; F02 |
| `p9.cafe-like`: `Yeah, I like it.` | Bom: reconhecimento entre `Yeah, I like it.` / `It’s okay.` / `Not really.` | Bom: peças `Yeah,` / `I` / `like` / `it.`; estrutura `Yeah, ___` | Suficiente: escrita do modelo normalizado; F02 |
| `p9.cafe-not`: `Not really.` | Bom: reconhecimento entre `Not really.` / `It’s okay.` / `Me too.` | Bom: peças `Not` / `really.`; estrutura `Not ___` | Suficiente: escrita do modelo normalizado; F02 |
| `p9.stay`: `I can stay a little longer.` | Bom: peças `a little longer` / `I can stay` | Bom: peças `a little longer` / `I can stay` / `I can’t stay`; estrutura `I can stay ___` | Suficiente: escrita do modelo normalizado; F02 |
| `p9.go`: `I have to go.` | Bom: peças `go` / `I have to` | Bom: peças `go` / `I have to` / `I don’t have to`; estrutura `I have to ___` | Suficiente: escrita do modelo normalizado; F02 |
| `p10.here`: `I like it here.` | Bom: peças `here` | Bom: peças `here` / `there`; estrutura `I like it ___` | Suficiente: escrita do modelo normalizado; F02 |
| `p10.keep`: `Can we keep in touch?` | Bom: peças `keep in touch?` / `Can we` | Bom: peças `keep in touch?` / `Can we` / `Can we leave?`; estrutura `Can we ___` | Suficiente: escrita do modelo normalizado; F02 |
| `p10.farewell`: `Nice talking to you.` | Bom: reconhecimento entre `It’s okay.` / `Not really.` / `Nice talking to you.` | Bom: peças `Nice` / `talking` / `to` / `you.`; estrutura `Nice ___` | Suficiente: escrita do modelo normalizado; F02 |
| `p10.bye`: `Bye!` | Bom: reconhecimento entre `Not really.` / `Bye!` / `It’s okay.` | Suficiente: `Bye! ___`; F04 | Suficiente: escrita do modelo normalizado; F02 |

As notas de apoio acima avaliam o formato local. Nos 48 casos afetados por F01, a coerência do percurso permanece ruim independentemente de a atividade de montagem ou escrita funcionar. As respostas certas, a ausência de peças e a ordem inversa foram verificadas pelos testes existentes; a aceitação de uma formulação fora do repertório não é avaliação semântica geral.

**Conferência textual das 50 falas e significados**

“Nível” refere-se ao texto e à tradução contextual. Nenhuma linha desta tabela aprova a gravação sonora. Os quatro pares de IDs que compartilham arquivo não eliminam seu contexto individual.

| ID / papel | Inglês | Significado no produto | Nível / ressalva |
| --- | --- | --- | --- |
| C01 / Lucas | Is this yours? | Esse café é seu? | Bom |
| C02 / Lucas | Oh! Sorry! | Ah! Desculpa! | Bom |
| C03 / Lucas | An iced coffee. And you? | Um café com gelo. E você? | Bom |
| C04 / Lucas | Nice! | Legal! | Bom |
| C05 / Lucas | Oh! This is mine. | Ah! Este é meu. | Bom |
| C06 / Lucas | Oh… it’s sweet. | Ah… é doce. | Bom |
| C07 / Lucas | Do you like it? | Você gosta? | Bom |
| C08 / Lucas | Really? Me too! | Sério? Eu também! | Bom no texto; tom e entonação ainda precisam de escuta. |
| C09 / Lucas | Really? I like it. | Sério? Eu gosto. | Bom no texto; tom e entonação ainda precisam de escuta. |
| C10 / Lucas | Oh! Thanks! | Ah! Obrigado! | Bom |
| C11 / Lucas | That was close. | Foi por pouco. | Bom |
| C12 / Lucas | I’m tired. | Estou cansado. | Bom |
| C13 / Lucas | Yeah. Too much work. And you? | Sim. Muito trabalho. E você? | Suficiente: traduzir excesso como trabalho demais (F06). |
| C14 / Lucas | Yeah… long day. | É… um dia longo. | Bom |
| C15 / Lucas | Lucky you! | Que sorte a sua! | Bom no texto; tom e entonação ainda precisam de escuta. |
| C16 / Lucas | Oh, a table! | Ah, uma mesa! | Bom |
| C17 / Lucas | Sit with me? | Senta comigo? | Bom |
| C18 / Lucas | Oh, nice! | Ah, legal! | Bom |
| C19 / Lucas | Yeah, I like it. But I’m tired. | Sim, eu gosto. Mas estou cansado. | Bom |
| C20 / Lucas | Me too. I like English. | Eu também. Gosto de inglês. | Bom |
| C21 / Lucas | Really? | Sério? | Bom no texto; tom e entonação ainda precisam de escuta. |
| C22 / Lucas | Yeah, I like it. | Sim, eu gosto. | Bom |
| C23 / Lucas | I need a break. | Preciso de uma pausa. | Bom |
| C24 / Lucas | Do you like this café? | Você gosta desta cafeteria? | Bom |
| C25 / Lucas | Me too. | Eu também. | Bom |
| C26 / Lucas | Oh, okay. | Ah, tudo bem. | Bom |
| C27 / Lucas | It’s quiet here. | É tranquilo aqui. | Bom |
| C28 / Lucas | Sure! | Claro! | Bom |
| C29 / Lucas | You too. Bye! | Também gostei. Tchau! | Bom: tradução contextual da gentileza, não regra literal para you too. |
| C30 / Lucas | Me too! | Eu também! | Bom |
| U01 / você | No, it’s not mine. | Não, não é meu. | Bom |
| U02 / você | What did you order? | O que você pediu? | Bom |
| U03 / você | It’s okay. | Tudo bem. | Bom |
| U04 / você | Me too. | Eu também. | Bom como concordância; suficiente no pedido nominal de p4.same (F07). |
| U05 / você | Yes, it’s mine. | Sim, é meu. | Bom |
| U06 / você | I like it. | Eu gosto. | Bom |
| U07 / você | Not really. | Não muito. | Bom |
| U08 / você | Careful! | Cuidado! | Bom |
| U09 / você | Really? | Sério? | Bom |
| U10 / você | Yeah, sure. | Sim, claro. | Bom |
| U11 / você | I’m learning English. | Estou aprendendo inglês. | Bom |
| U12 / você | Do you like your job? | Você gosta do seu trabalho? | Bom |
| U13 / você | Do you like this café? | Você gosta desta cafeteria? | Bom |
| U14 / você | Yeah, I like it. | Sim, eu gosto. | Bom |
| U15 / você | I can stay a little longer. | Posso ficar mais um pouco. | Bom |
| U16 / você | I have to go. | Tenho que ir. | Bom |
| U17 / você | I like it here. | Eu gosto daqui. | Bom isoladamente; ruim quando imposto no ramo negativo de F01. |
| U18 / você | Can we keep in touch? | Podemos manter contato? | Bom |
| U19 / você | Nice talking to you. | Foi bom conversar com você. | Bom |
| U20 / você | Bye! | Tchau! | Bom |

**Conferência das 12 ilustrações**

Avaliação do conteúdo visual em prancha, sem validação de recorte e legibilidade na interface móvel. Os personagens, o ambiente e a sequência do incidente se mantêm reconhecíveis. A continuidade dos copos e a identificação escrita são as ressalvas relevantes.

| Imagem | Nível | Observação |
| --- | --- | --- |
| V01 | Suficiente | Arte clara, mas já mostra os dois cafés; conflita com anúncio posterior de chegada. |
| V02 | Bom | Nome LUCAS destacado e gesto de recusa apoiam a negativa de posse. |
| V03 | Bom | Gesto de desculpa é compatível com o engano; copo de Lucas identificável. |
| V04 | Suficiente | Mostra o copo BASEDSPEAK sendo alcançado; padronizar o nome usado nas instruções. |
| V05 | Bom | Ambos com cafés, adequados à prova/opinião sobre bebida. |
| V06 | Bom | Copo inclinado e gesto de aviso comunicam risco sem precisar de animação. |
| V07 | Bom | Copo seguro representa o alívio e preserva os personagens. |
| V08 | Bom | Posturas e conversa são compatíveis com cansaço; identificação BASEDSPEAK deve permanecer consistente. |
| V09 | Bom | Mesa livre e convite visual apoiam a mudança de lugar. |
| V10 | Bom | Conversa à mesa serve aos dois tópicos sem conflito visual material. |
| V11 | Bom | Gesto de fala e escuta combina com o caminho de aprender inglês, sem exigir texto dentro da arte. |
| V12 | Bom | Gestos de despedida encerram o encontro de modo claro. |

**Síntese das dimensões avaliadas**

| Dimensão | Nível | Motivo determinante |
| --- | --- | --- |
| Correção do inglês escrito | Bom | Não foi encontrado erro central; dependência de contexto e elipse foi explicitada. |
| Traduções e explicações | Bom | Predominam traduções funcionais; excesso e algumas referências pedem precisão. |
| Coerência entre todas as escolhas | Suficiente | Uma combinação relevante contraria a preferência; o ramo específico é ruim. |
| Progressão e transferência inicial | Bom | Reuso de perguntas, pronomes e intenções; oportunidades variam entre os ramos. |
| Práticas de teoria | Bom | 16 boas e oito suficientes; alcance introdutório e restrito. |
| Escrita no apoio Mais autônomo | Suficiente | Repertório aceito é mais estreito que a instrução de intenção. |
| Relação entre imagens e roteiro | Suficiente | Chegada do café e identificação do copo pedem alinhamento. |
| Retrospectiva e honestidade das conclusões | Bom | Usa histórico real e não atribui domínio a cliques/acertos. |
| Apresentação e convite ao estudo | Bom | Apoios, ausência de microfone e próxima etapa são claros; duração anunciada não foi medida. |
| Conjunto atual, para lançamento | Suficiente | Conteúdo bom em grande parte, com correções materiais ainda abertas. |

Essas dimensões não são uma escala numérica disfarçada; o parecer considera a natureza e o impacto dos problemas, especialmente os que podem ensinar ao aluno que sua intenção está errada ou ser contrariada pelo roteiro.

**Consumo observado ao encerrar:** marcador inicial 8%; última consulta 8%; diferença observável 0 pontos percentuais. Não houve aumento detectável no marcador durante a atividade. Isso não significa custo zero: a leitura é agregada e não informa o consumo exato deste trabalho nem sua atualização posterior. [Registro sanitizado](../output/content-audit-2026-10-28/consumo-observado.json).

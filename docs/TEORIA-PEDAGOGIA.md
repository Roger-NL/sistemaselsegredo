# Teoria depois da cafeteria

Registro editorial de 27/10/2026. Conteúdo original em português para adultos iniciantes; o inventário de referência é `src/features/demo/content/media.ts`. A teoria é uma etapa conectada à retrospectiva, conceitualmente separada da narrativa.

## Prompt de trabalho

> Crie uma continuação pedagógica que ajude um adulto iniciante a compreender e reutilizar o inglês da cafeteria. Parta da intenção comunicativa, explique a forma com linguagem simples e mostre quando usar. Cubra palavras, expressões, verbos e estruturas realmente presentes no inventário. Organize oito lições de três passos: uma ideia central por tela, explicação breve com densidade, aprofundamento opcional e uma prática verificável. Alterne decisão de sentido, montagem de frase e recuperação escrita restrita. Cada resposta deve receber uma explicação útil. Preserve contexto e pragmática; não ensine tradução palavra por palavra como regra. Identifique exemplos novos e não afirme que a pessoa viu um ramo que não percorreu. Não infira fluência, nível ou domínio a partir de acertos. Pense em leitura confortável, teclado e toque em mobile e computador. Mantenha creme, preto e Geist, sem imagens nem áudio novo. Separe decisões implementadas de hipóteses a validar.

## Decisões de conteúdo

O percurso tem 24 passos em oito lições: pertencimento; pedido; reações; gostar; falar de si; convite; ficar ou sair; despedida. O texto principal segue significado → forma → uso. O campo `detail` aprofunda sem bloquear o percurso. Os exemplos centrais reaproveitam o inventário; variações externas são identificadas como exemplos novos.

As práticas alternam escolha de intenção, montagem e escrita curta. A escolha distingue sentidos próximos; a montagem evidencia ordem; a escrita exige recuperar uma palavra ou expressão com limites claros. As respostas são restritas, sem pretender avaliar produção livre. O feedback explica o motivo e permite nova tentativa, sem cronômetro, punição ou promessa de domínio.

Cuidados explícitos: `mine` não acompanha um nome como `my`; `it's` é `it is` neste contexto; `did` já marca o passado de perguntas com `order`; `like` se liga ao complemento sem copiar o `de` do português; `I'm tired` difere de `I'm learning`; `can` precede verbo básico sem `to`, enquanto `have to go` mantém `to`; `talking` sozinho não caracteriza presente contínuo. Expressões sociais são ensinadas com função e contexto, incluindo os limites de `me too`, `you too`, `really` e `not really`.

## Cobertura do inventário

| Lição | Falas e formas cobertas |
| --- | --- |
| De quem é? | Is this yours?; This is mine.; Yes, it's mine.; No, it's not mine.; this, it, is, not, my/your/mine/yours |
| O que você pediu? | What did you order?; An iced coffee.; And you?; It's sweet. |
| Reagir com naturalidade | Really?; Me too!; Not really.; Oh!; Sorry!; Thanks!; It's okay.; Oh, okay.; Careful!; That was close.; Nice!; Oh, nice!; Lucky you! |
| Do que você gosta? | I like it.; Do you like it?; Do you like your job?; Do you like this café?; I like it here.; I like English. |
| Um pouco sobre você | I'm tired.; I'm learning English.; Too much work.; Long day.; Yeah.; But I'm tired. |
| Senta comigo? | Oh, a table!; Sit with me?; Yeah, sure.; Sure!; exemplo novo Can I sit here? |
| Ficar mais ou ir? | I can stay a little longer.; I have to go.; I need a break.; It's quiet here. |
| Até a próxima | Can we keep in touch?; Nice talking to you.; You too.; Bye! |

Combinações como “Really? I like it.”, “Yeah, I like it. But I'm tired.” e “Me too. I like English.” são cobertas pelos seus componentes. Não se afirma que todas apareceram no caminho individual.

## Pesquisa e limites da evidência

Fontes primárias consultadas em 27/10/2026; explicações e atividades foram redigidas para este produto, sem copiar exercícios das fontes.

- [British Council — Possessives: pronouns](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/possessives-pronouns): referência para `my/mine` e `your/yours`, substituição do nome e ausência de apóstrofo nos possessivos.
- [British Council — Present simple](https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/present-simple?page=0): referência para perguntas com `do` e afirmações com `like`.
- [British Council — Present continuous](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/present-continuous): referência para `be + ing`, atividades em andamento e distinção de verbos de estado. O produto restringe a explicação ao aprendizado neste período.
- [British Council — Past simple](https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/past-simple): referência para perguntas com `did` e passado de `be`.
- [Cambridge — Requests](https://dictionary.cambridge.org/pl/grammar/british-grammar/requests): referência para perguntas com `can` em pedidos. A página oficial consultada está na versão de navegação polonesa, com explicação em inglês.
- [Cambridge — Can](https://dictionary.cambridge.org/uk/grammar/british-grammar/can-): referência oficial localizada na pesquisa para pedidos e usos de `can`; a recuperação direta posterior retornou bloqueio HTTP. A explicação de pedidos foi conferida também em Requests.
- [Cambridge — Have to ou must?](https://dictionaryblog.cambridge.org/2014/09/03/you-must-read-this-have-to-or-must/): referência editorial oficial para necessidade e o padrão `have to`.
- [Roediger e Karpicke, 2006 — Test-Enhanced Learning](https://www.psychologicalscience.org/journals/psychological-science/j.1467-9280.2006.01693.x/): resumo oficial do artigo original; recuperar informações favoreceu retenção posterior nos experimentos com textos. Isso inspira pequenas tentativas de lembrar; não demonstra, por si só, a eficácia desta interface nem uma transferência garantida para conversação.
- [Cepeda e colegas, 2008 — Spacing Effects in Learning](https://www.psychologicalscience.org/journals/psychological-science/j.1467-9280.2008.02209.x/): resumo oficial do artigo original; o intervalo entre estudo e revisão interagiu com o tempo até o teste. Apoia considerar revisitas ao longo do tempo, sem prescrever aqui uma agenda universal.

As fontes linguísticas são referências de uso; não provam uma ordem ótima para estas oito lições. Os dois estudos de memória foram consultados pelos resumos oficiais: não se declara revisão integral de todos os métodos e materiais. A combinação entre leitura breve, detalhe opcional e três tipos de prática é uma decisão editorial informada por essas referências, ainda sem validação com pessoas.

## Experiência e sugestões futuras

A implementação vive em `/demo/estudo`, com acesso depois da retrospectiva, sem exigir avaliação. Usa creme/preto e Geist, sem imagens. A página permite rolagem natural, mantém uma coluna em telas estreitas e uma navegação lateral no computador. A referência de acessibilidade é [W3C — Reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow), com conferência a 320 CSS pixels; controles de toque têm pelo menos 44 pixels quando não são controles nativos de mídia. Isso não constitui auditoria integral de conformidade WCAG.

O progresso do estudo fica na chave local `basedspeak.study.cafe.v1`, separada da narrativa; falha de storage não bloqueia as atividades. Consulta ao modelo é registrada separadamente de uma tentativa posterior sem consulta. O catálogo de expressões inclui todos os caminhos e só identifica “Na sua conversa” quando a frase está no transcript local. Áudio reutiliza exclusivamente URLs já publicadas com `preload="none"`; não há chamada de geração nesta etapa.

Decisão: um passo principal por vez; frases e controles legíveis em telas estreitas; conteúdo sem depender de fotos, cenas ou som; ações acessíveis por toque e teclado. A montagem deve funcionar com botões, sem exigir arrastar. O aprofundamento não pode esconder instruções indispensáveis. O progresso indica percurso realizado, não nível de inglês.

Sugestões a validar: tempo confortável por sessão, equilíbrio entre os três tipos de atividade, clareza de `it` e naturalidade da tradução de `You too`. Observar adultos iniciantes no mobile e no computador antes de afirmar adequação pedagógica ou facilidade de uso. Revisitas em dias posteriores podem ser úteis; revisão dentro da mesma sessão não constitui um sistema de repetição espaçada agendado. Não há calendário adaptativo ou promessa de retenção de longo prazo neste conteúdo.

## Verificação e publicação — 27/10/2026

196 testes em 33 arquivos, lint, TypeScript e build de produção aprovados. Testes do estudo verificam soluções, integridade do inventário, progresso inválido, contrações equivalentes, consulta ao modelo e a ligação posterior à retrospectiva sem exigir avaliação. No Chrome local foram exercitados erro/acerto, montagem por toque, escrita, busca e recuperação após recarregar. Visão geral conferida em 320×568, 390×844, 844×390 e 1440×900 sem overflow horizontal; lição e montagem também conferidas a 320px. Não substitui teste em aparelho físico ou com alunos.

Publicação autorizada por Roger no projeto Vercel existente `novoessite`: deployment `dpl_EPaDvLizEEQnwF4HdoNrFTLh7vh8`, estado Ready, domínio [www.basedspeak.com/demo/estudo](https://www.basedspeak.com/demo/estudo). Página pública, primeira lição e layout de 390px conferidos no navegador; capturas em `output/theory-qa/` (ignorado pelo Git). A publicação preserva o estado local pré-existente de cadastro/painel, incluindo o modo visual já solicitado em outra conversa. Não houve geração de áudio, migração de dados, alteração de credenciais nem commit.

## Etapa 4 — revisão das 24 práticas — 27/10/2026

Revisados os oito blocos de `src/features/theory/content.ts`: inglês, tradução contextual, explicação principal, aprofundamento, alternativas, respostas previstas e feedback. A matriz abaixo registra o recorte de cada prática. Escolha e montagem não são produção livre; uma frase diferente pode ser válida em inglês e ainda ficar fora da tarefa proposta. Na escrita, a resposta corresponde ao trecho solicitado, sem exigir que a pessoa redigite a frase inteira.

| Bloco | ID | Tipo | Alvo / formas aceitas | Limite editorial |
| --- | --- | --- | --- | --- |
| De quem é? | `this-yours` | Escolha | “Se o copo é seu.” | Pergunta sobre pertencimento, não preferência ou saída. |
| De quem é? | `mine-your` | Montagem | `This is mine.` | Afirmação; `mine` substitui o conjunto `my coffee`, sem acompanhar outro nome. |
| De quem é? | `its-not` | Escrita | `not` | Uma palavra em `No, it's ___ mine.`; `no` não substitui a negativa interna. |
| O que você pediu? | `did-order` | Montagem | `What did you order?` | Pedido já feito; `did` marca o passado e `order` permanece na forma básica. |
| O que você pediu? | `iced-coffee` | Escolha | `An iced coffee.` | Café com gelo; `sweet` trata de sabor e `quiet` descreve o ambiente. |
| O que você pediu? | `and-you` | Escrita | `And you?` / `And you` | A expressão de duas palavras devolve a pergunta sobre o assunto atual. |
| Reagir com naturalidade | `really-too` | Escolha | `Me too.` | Compartilha a opinião positiva; `Really?` e `Not really.` cumprem outras funções. |
| Reagir com naturalidade | `sorry-okay` | Escolha | `It's okay.` | Tranquilizar depois da desculpa, sem confundir agradecimento, aviso ou pergunta. |
| Reagir com naturalidade | `careful-close` | Escolha | `Careful!` | Aviso durante o risco; `That was close.` comenta o alívio depois. |
| Do que você gosta? | `like-it` | Montagem | `I like it.` | `like` se liga ao complemento sem copiar o `de` de “gostar de”. |
| Do que você gosta? | `do-you-like` | Montagem | `Do you like this café?` | Pergunta sobre a cafeteria; as peças fixam o complemento desta tarefa. |
| Do que você gosta? | `like-here` | Escolha | `I like it here.` | Gostar de estar no lugar; `English` identifica outro assunto e `mine`, pertencimento. |
| Um pouco sobre você | `im-tired` | Escrita | `I'm`, `I’m` / `I am` | Completar `___ tired.` com o mesmo sentido; `I tired.` não faz a ligação necessária. |
| Um pouco sobre você | `learning` | Montagem | `I'm learning English.` | Atividade em andamento neste período; não exige estudar naquele segundo. |
| Um pouco sobre você | `work-job` | Escolha | `Too much work.` | Excesso de trabalho; `your job` identifica o emprego e `Me too.` retoma outra ideia. |
| Senta comigo? | `sit-me` | Escolha | “Que você se sente com ela.” | Convite curto dependente de contexto e entonação; não é pedido de outro café. |
| Senta comigo? | `yeah-sure` | Escrita | `sure` | Completar a aceitação da história: `Yeah, ___.`; não avaliar todas as formas de aceitar convites. |
| Senta comigo? | `can-sit` | Montagem | `Can I sit here?` | Exemplo novo de pedido de permissão, identificado no conteúdo e na prática. |
| Ficar mais ou ir? | `stay-longer` | Montagem | `I can stay a little longer.` | Possibilidade de continuar por mais um pouco, sem tempo exato; `can` seguido do verbo básico. |
| Ficar mais ou ir? | `have-go` | Escrita | `to` | Uma palavra em `I have ___ go.`; o padrão é `have to`, diferente de `can go`. |
| Ficar mais ou ir? | `break-quiet` | Escolha | `I need a break.` | Necessidade de uma pausa; as outras opções comentam o lugar. |
| Até a próxima | `keep-touch` | Montagem | `Can we keep in touch?` | Proposta de manter contato; não exige fornecer telefone ou outro dado. |
| Até a próxima | `nice-talking` | Escolha | “Ao encerrar uma conversa agradável.” | Despedida cordial; `talking` sozinho não identifica presente contínuo. |
| Até a próxima | `you-too-bye` | Escrita | `You` | Completar a resposta da história `___ too. Bye!`; não tornar `me too` e `you too` intercambiáveis em qualquer contexto. |

As 24 práticas foram consideradas editorialmente coerentes com esses objetivos após o ajuste de enunciado de `im-tired`. Os distratores distinguem intenções ou sentidos relevantes; o feedback explica o recorte sem transformar erro em diagnóstico de nível. As explicações preservam os limites de `it`, `mine/yours`, `did`, `do`, `be + ing`, `can`, `have to` e das expressões sociais. Maiúsculas, espaços e pontuação usual são normalizados; contrações equivalentes já reconhecidas pelo validador continuam aceitas. Por exemplo, ` AND   YOU! ` corresponde a `And you?`, enquanto a resposta inteira `No, it's not mine.` fica fora do preenchimento de uma palavra em `its-not`.

As frases centrais reutilizam o inventário da cafeteria ou trechos dele; diálogos compostos juntam falas para explicar sua função, sem afirmar que foram uma única fala ou que apareceram em todos os percursos. As variações externas são apresentadas como novas ou possíveis, incluindo `I ordered a coffee.`, `I like coffee. And you?`, `Me neither`, o convite mais completo e `Can I sit here?`. O catálogo continua distinguindo as expressões presentes no transcript local das demais expressões da história. Essa identificação não transforma os exemplos novos em acontecimentos da tentativa.

O uso contextual de `You too.` como resposta a uma despedida que valoriza a conversa foi conferido na fonte primária [Pearson — Roadmap B2+ Teacher's Book, página 133 do PDF](https://pearsonssha.blob.core.windows.net/teacher/Samples/roadmap-sample-pack/B2%2B/Roadmap%20B2%2B%20-%20Teacher%27s%20Book.pdf#page=133). A referência apoia esse uso linguístico, sem demonstrar que a atividade desta demo seja adequada a iniciantes ou comprovar aprendizagem. O conteúdo e o exercício permanecem originais; não foi reproduzido trecho da fonte.

Três ajustes mínimos acompanham a revisão:

- Em `im-tired`, o enunciado passou a pedir o sentido de “Estou cansado”, em vez de exigir especificamente uma contração. Isso alinha a instrução às formas `I'm` / `I’m` e `I am`, que a normalização já tratava como equivalentes. A pista apresenta a contração como uma opção, e o feedback explicita as duas possibilidades; não foi estreitada a aceitação existente.
- “Tentar outra vez” inicia uma nova tentativa da prática: fecha o modelo e a pista, limpa resposta e peças e reinicia a indicação de consulta daquela tentativa. A conclusão anterior com modelo continua registrada até haver um acerto posterior sem nova consulta. Essa distinção registra o que ocorreu na interface; não afirma autonomia, domínio ou retenção porque alguém respondeu após ver o modelo.
- A conclusão passa a usar “Você concluiu este percurso.” quando as 24 práticas foram realizadas e “Seu percurso até aqui.” quando ainda faltam práticas. O texto conserva a contagem real e a indicação de consultas ao modelo, sem inferir que as frases ficaram mais claras ou que houve ganho de proficiência.

### Evidências locais desta revisão

**267 testes em 41 arquivos, lint, TypeScript e build de produção aprovados.** O novo `tests/theory-study-validation.test.ts` acrescenta 30 regressões: alvos literais das 24 práticas escritos independentemente dos campos de resposta, distratores, ordens distintas, peças ausentes ou extras, limites do preenchimento, equivalências de contração e progresso. A forma `I am` é aceita em `im-tired`; `am` e a frase inteira `I’m tired` ficam fora do espaço pedido.

No Chrome, em `127.0.0.1:3404`, as **24 práticas passaram por resposta incorreta e correta**, com leitura da explicação principal, aprofundamento e feedback. Nenhum primeiro erro concluiu a prática. Em seis práticas, cobrindo os três tipos, consulta ao modelo → nova tentativa incorreta → acerto preservou a conclusão anterior durante o erro e retirou a marca de modelo no novo acerto. Em outras quatro, a consulta foi mantida: encerramento mostrou **24/24 e quatro com modelo**. Revisitar levou à primeira dessas quatro; um acerto posterior reduziu a contagem para três, sem duplicar conclusões. Isso descreve ações na interface, sem atestar recuperação independente depois de ver a solução.

Posicionar no último passo sem realizar os anteriores produziu **1/24**, título parcial e retorno ao primeiro pendente. Reload após 12 práticas retomou o passo 13; Anterior e reload final conservaram posição e contagens. A pista foi fechada em nova tentativa, `I am` foi conferido na interface, e uma montagem foi enviada pelo teclado. Os passos 13–24 e a conclusão foram exercitados a 320×568, com rolagem natural; os estados medidos permaneceram com largura de documento de 320 px. É emulação no Chrome, sem teclado virtual de aparelho físico e sem auditoria integral de acessibilidade.

A consulta mostrou 45 expressões, buscou em inglês e português e apresentou o estado sem resultados. As 45 marcações “Na sua conversa” foram comparadas ao transcript da tentativa de referência: todas concordaram. Um MP3 publicado terminou pelo player nativo sem erro; o estudo usa `preload="none"`, sem gerar áudio. O registro bruto da narrativa permaneceu idêntico após práticas, consultas, reprodução e retorno à conversa. Código de aplicação, recursos públicos e configurações do build isolado foram comparados byte a byte com o checkout: 174 arquivos iguais.

Roteiro, estados e capturas estão em `output/stage4-qa/` (ignorado pelo Git): `plano-navegador.json`, `navegador-log.json`, `estudo-24.json`, `retomada-12.json`, `glossario.json`, `fluxos-complementares.json`, `validacao.json`, `conclusao-parcial.png`, `escrita-I-am-mobile-320.png` e `conclusao-24-desktop.png`. Limites e preservação do trabalho anterior: [registro da etapa 4](plano-nova-demo/ANDAMENTO.md#etapa-4-do-lançamento-oito-blocos-e-24-práticas--27102026).

O registro de publicação anterior não aprova automaticamente esta versão. Não houve commit, deploy, geração de mídia ou escrita no ledger/cache remoto. A validação local não demonstra eficácia pedagógica, duração confortável com iniciantes ou retenção posterior; essas hipóteses continuam abertas.

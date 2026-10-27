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

# Direção visual da landing BasedSpeak

> Direção final solicitada por Roger em 27/10: **ousada e experimental, sem imagens da demo, uma única tela sem rolagem**. Proposta, cadastro e login ficam visíveis; “Dê uma espiada” abre um painel de informações por clique. A implementação usa tipografia cinética creme/preto e amostra de palavras, com pausa e movimento reduzido. As recomendações de cafeteria/seções abaixo documentam a primeira proposta e foram substituídas por essa decisão.

Pesquisa e inspeção visual: 27/10/2026. Proposta para implementação, sem alterar a narrativa aprovada da demo.

## Decisão

Uma landing editorial, clara e tátil: papel quente, tipografia preta, cenas da cafeteria e uma pequena interação que mostra como o aluno constrói uma resposta. A sofisticação vem da composição, do espaço e da qualidade do produto mostrado. A imagem da demo já tem personalidade suficiente; não é necessário gerar novos assets.

Preservar a identidade aprovada em `docs/plano-nova-demo/REVISAO-EXPERIENCIA-E-AUDIO.md`: marca com quatro barras inclinadas, Geist local, fundo `#F4F0E8`, tinta e CTA `#191919`, superfície `#FCFAF6`, borda `#DED8CD`, texto secundário `#716C64`. O documento explicitamente não adota terracota ou verde como identidade. Cores próprias da ilustração permanecem.

## O que as referências ensinam

As observações de composição abaixo vêm da inspeção dos sites, e sua aplicação ao curso é uma interpretação de design, não uma garantia de conversão.

| Referência primária | Observação da página consultada | Aplicação BasedSpeak |
| --- | --- | --- |
| [Grok](https://grok.com/) | Entrada centrada em uma pergunta e um único campo de ação, amplo respiro, poucos elementos concorrentes. | Uma promessa e uma ação principal na primeira dobra. Não copiar chat vazio ou visual escuro. |
| [ChatGPT](https://chatgpt.com/overview/) | Tipografia de grande escala e agrupamento por atividades compreensíveis. | Headline curta que se lê imediatamente; mostrar atividade concreta em vez de uma explicação sobre IA. |
| [Toki](https://toki.com/) | Mascote compacto, promessa humana, ações reconhecíveis e exemplos de pedidos conectados a funções. | Personagens já existentes, pedido/resposta visível e valor explicado por um gesto. Não transportar sua longa lista de funcionalidades. |
| [Cursor](https://cursor.com/) | Promessa curta e interface real colocada sobre um cenário visual rico; contraste entre uma moldura sóbria e o conteúdo. | A cafeteria é o cenário rico; a pequena atividade pertence à mesma janela. Não inventar um dashboard. |
| [Linear](https://linear.app/) | Tipografia muito controlada, poucas cores, mockup detalhado que sustenta a promessa. | Precisão nas bordas, espaçamento, alinhamento e tipografia; uma prova de produto com bastante área. Não copiar densidade da interface B2B. |
| [Lovable](https://lovable.dev/) | Hero em torno de uma tarefa simples que a pessoa pode começar, com instrução curta. | Fazer a pessoa experimentar uma construção simples; CTA principal continua sendo cadastro para a demo. |

Não se verificou nesta pesquisa visual que Toki tenha sido criado majoritariamente com IA. Isso não deve aparecer como fato da landing ou justificativa factual do design. Valuações, nomes e logos das referências também não são prova da qualidade do curso.

## Composição recomendada

Header de 72–84 px: marca à esquerda, no máximo “Como funciona”, “Dúvidas”, “Entrar”. A ação principal pode ocupar o lado direito no desktop. Sem faixa de urgência, newsletter ou navegação do curso inteiro.

Hero em duas colunas, largura máxima 1240 px, margens fluidas de 24–64 px e gap de 64 px no desktop. Texto com 44–48% da largura; produto com 52–56%. Usar linha de contexto pequena, título de 3 linhas no máximo, apoio de até duas linhas, CTA e uma linha de fatos. Abaixo, mostrar visualmente o caminho “Cadastro → Demo → Curso”.

Proposta de hierarquia: “Seu inglês começa / numa conversa.” em Geist de 64–84 px, peso 450–550, entrelinha 0.98–1.05 e tracking -0.05em. Texto de apoio 18–20 px com entrelinha 1.5. Não misturar serifas decorativas nem colocar muitas palavras em caps; o logo já tem caráter próprio.

Janela do produto com borda de 1 px, raio de 18–22 px e fundo claro. Pequena barra superior com “Uma prévia do método” e “Cafeteria”. Cena V01 em proporção nativa 3:2, imagem em largura completa. Evitar o arco ou crop 4:5 da entrada atual: cortam os copos, gestos e contexto que tornam a cena inteligível. Também evitar balões flutuantes sobre os rostos.

Sob a cena, integrado à mesma janela: pedido “Como você pediria um café?” e uma montagem com três peças. Exemplo independente possível: “A coffee, please.”. Rotular explicitamente como prévia do método, pois essa frase não pertence ao roteiro atual. Não entregar “Is this yours?” e sua resposta, que são parte da descoberta na demo.

Interação sem drag obrigatório: tocar/clicar adiciona a peça; tocar na resposta remove; botão de reinício discreto. Ordem inicial embaralhada, mas sem treino de memorização ou falso chat. Ao completar, revelar somente uma confirmação proporcional: “É assim: você constrói, com apoio.”. Não declarar que a pessoa “já fala inglês”, nem avaliar fluência. Se o usuário não interagir, a composição ainda explica o produto.

Depois do hero, no máximo três blocos curtos: três passos de aprendizagem; apoio ajustável e retrospectiva com evidência real da demo; três dúvidas frequentes com CTA. Conteúdo total curto o suficiente para aproximadamente 3–4 telas de desktop. Não usar números de alunos, notas, estrelas ou depoimentos sem comprovação.

## Detalhes de acabamento

- CTA preto, texto creme, altura 52–56 px, raio 8–10 px, seta pequena e espaço suficiente ao redor. Feedback com texto/check/contorno; não depender de cor.
- Bordas discretas e uma única sombra ampla, por exemplo `0 18px 50px -34px rgba(25,25,25,.35)`. Evitar sombras empilhadas e efeito vidro.
- Chips com superfície branca e borda bege, alvos de 44 px e foco escuro de 3 px. As opções precisam parecer apertáveis em repouso.
- No máximo uma entrada suave, 300–450 ms; interação 140–180 ms. Nada de typewriter, rolagem travada, autoplay de voz, parallax ou elementos orbitando. Respeitar `prefers-reduced-motion`.
- A moldura deve servir ao conteúdo. Não simular barras de browser com semáforos, marcas de ferramentas ou menus sem função.

## Mobile e performance

Em 360–390 px, texto vem primeiro, CTA e fatos em seguida, janela de produto imediatamente abaixo. Título 43–50 px com quebra editorial, margens 20 px. Header compacto com marca e “Entrar”; não reduzir a marca até ficar ilegível. CTA ocupa a largura disponível. A interação passa a duas linhas sem scroll horizontal e a foto mantém 3:2. Evitar barras fixas que cubram a atividade ou o teclado do cadastro.

V01-960.webp tem cerca de 68 KiB; V01-640.webp cerca de 36 KiB. Reutilizar esses arquivos com `picture`/`srcSet`, dimensões explícitas e prioridade somente na primeira imagem. Outras cenas carregam depois. Geist já está local; não introduzir bibliotecas de motion, player, canvas ou vídeo para este hero. Conteúdo estático pode ser Server Component e a pequena montagem um Client Component isolado.

## Critérios para revisão

Antes de concluir, verificar em 390 px e 1440 px: promessa e CTA se entendem em 5 segundos; copos e personagens não são cortados; a pessoa consegue usar a prévia só com teclado; imagem não muda altura depois de carregar; nenhuma interação é necessária para descobrir o CTA; cadastro e demo mantêm o contexto visual. O resultado precisa parecer a entrada do mesmo curso, com acabamento superior à demo, sem prometer um produto diferente.

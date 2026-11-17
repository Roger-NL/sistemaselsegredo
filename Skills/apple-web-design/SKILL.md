---
name: apple-web-design
description: Criar ou refinar interfaces web inspiradas no design da Apple, com hierarquia tipográfica, materiais discretos, interações acessíveis e preview responsivo. Usar quando o usuário pedir estilo Apple, HIG ou Liquid Glass para websites; preservar a identidade existente fora do escopo pedido.
---

# Apple Web Design

Skill local independente inspirada nas Human Interface Guidelines, não oficial da Apple. As escolhas CSS são adaptações para a web, não especificações oficiais para plataformas Apple.

## Direção visual

- Leia briefing, componentes, tokens e telas existentes. Identifique público, tarefa principal e conteúdo real. Referências e escolhas explícitas do usuário prevalecem sobre preferências desta skill.
- Distinga página editorial de produto (hierarquia expressiva, ritmo e espaço) de ferramenta de trabalho (densidade útil, navegação estável, ações próximas ao conteúdo). Não transforme toda tela em uma landing page.
- Apresente uma direção curta com paleta, tipografia, composição e função dos materiais. Prossiga com decisões razoáveis quando o briefing permitir, sem etapa obrigatória de aprovação. Produza variantes quando solicitadas ou úteis para resolver uma ambiguidade visual real.
- Para valores iniciais ajustáveis e exemplos, leia [references/web-recipes.md](references/web-recipes.md).

## Implementação

- Priorize legibilidade, hierarquia, poucas famílias tipográficas, espaçamento consistente e alinhamento óptico. Use fontes do sistema por CSS quando apropriado; não baixe nem redistribua fontes Apple ou SF Symbols como recursos web livres. Preserve fontes licenciadas do produto quando fizer sentido.
- Use profundidade para distinguir navegação, conteúdo e sobreposições. Materiais translúcidos são opcionais: concentre-os em navegação ou controles flutuantes, com fundo sólido de fallback e contraste verificado. Evite blur em todo card; backdrop-filter não reproduz o material nativo Liquid Glass.
- Reutilize componentes e dependências existentes. No BasedSpeak, preserve histórias, ilustrações, vocabulário pedagógico e identidade visual, exceto nos elementos explicitamente redesenhados. Não substitua a identidade por uma estética corporativa genérica.
- Use HTML semântico, links para navegação, botões para ações, nomes acessíveis e foco visível. Menus e diálogos devem funcionar por teclado com gestão de foco. Não dependa apenas de cor, hover ou gesto.
- Faça layout fluido com Grid/Flex, rem, clamp e quebra de texto. Evite altura fixa em blocos de texto e medições JS para problemas que CSS resolve. Permita zoom e textos longos. Alvos de toque de 44 CSS px são um objetivo prático web, não conversão universal de pontos nativos.
- Anime para esclarecer mudanças de estado. Respeite prefers-reduced-motion, evite transition: all e mantenha controles utilizáveis. Ofereça fundo sólido quando blur estiver indisponível ou houver preferência por transparência reduzida.
- Desenhe estados relevantes de carregamento, vazio, erro, sucesso, seleção e desabilitado. Áudio começa por ação do usuário; mantenha texto equivalente e controles nomeados para conteúdo falado.
- Em Next.js/React, mantenha pequena a fronteira client e preserve autenticação e dados. Não acrescente bibliotecas sem necessidade concreta. Não trate memória ou FS efêmeros de Vercel como armazenamento durável.

## Preview e entrega

- Para implementar UI, execute pelo fluxo existente e abra a rota com ferramenta de navegador disponível. Inspecione pelo menos mobile e desktop, conteúdo longo, foco por teclado e fluxo principal. Corrija overflow, clipping e ações sem resposta observadas.
- Capture e inspecione screenshots quando a ferramenta permitir; entregue link de preview e/ou imagens úteis. Se execução ou navegador estiverem indisponíveis, explique o que foi validado e o que ficou sem verificar. Nunca afirme ter visto uma tela sem abri-la.
- Para comparação visual, mantenha tela e conteúdo iguais entre propostas. Identifique mockup estático como mockup; não o apresente como interface funcional.
- Rode verificações existentes pertinentes ao código alterado. Informe resultados e limites sem alegar conformidade completa de acessibilidade só por inspeção visual.

## Fontes

Leia a fonte relevante quando precisar de detalhes atuais; não carregue todas por padrão:

- [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/): princípios por plataforma.
- [Typography](https://developer.apple.com/design/human-interface-guidelines/typography): legibilidade e hierarquia.
- [Materials](https://developer.apple.com/design/human-interface-guidelines/materials): profundidade e materiais nativos a adaptar à web.
- [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility): necessidades de acesso.
- [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines): revisão específica para web.

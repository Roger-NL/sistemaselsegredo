# Compatibilidade com a tradução do navegador — 03/11/2026

## Escopo

Permitir que o tradutor nativo do Google/Chrome leia e traduza os textos do site, inclusive cards e conteúdo revelado depois de cliques, sem criar traduções próprias e sem mudar o design aprovado. A escolha do idioma de destino e a opção de tradução automática continuam sendo preferências do navegador.

Não foi adicionado widget, serviço, catálogo de idiomas, chamada de API de tradução ou dependência de tradução em produção. Português continua sendo o idioma de origem declarado; o documento permite tradução explicitamente. Frases em inglês mantêm seus atributos de idioma. Áudios, imagens e conteúdo pedagógico não foram alterados.

## Problema reproduzido

Com a tradução nativa para inglês ativa, a busca do glossário filtrava três expressões, mas o contador visível ficava preso em “45 expressions”. Atualizar um nó de texto que o tradutor já substituiu não atualizava o texto visível. Uma tradução atrasada também podia repor o valor anterior depois de uma atualização do React.

Referências primárias sobre esse conflito de DOM: [React #11538](https://github.com/facebook/react/issues/11538), [Chromium #41407169](https://issues.chromium.org/issues/41407169).

## Implementação

`BrowserText` coloca os textos dinâmicos em elementos estáveis e substitui apenas essa fronteira quando muda o texto de origem. Assim, a tradução antiga fica associada ao elemento antigo, sem sobrescrever o valor novo. O componente sempre mostra o texto original; quem traduz continua sendo o navegador.

A estrutura foi aplicada nos pontos de texto da conversa, estudo, apresentação, painel, menus, cadastro, aula e gestão. Não há interceptação de `Node.prototype`, supressão de erros do reconciliador nem observador que tente traduzir a página por conta própria.

As fronteiras usam `display: contents` e herdam a aparência do elemento original. Cores, tipografia, tamanhos, espaçamentos, composição visual, arquivos de estilo existentes, imagens e áudios foram preservados. A única regra nova de estilo neutraliza a caixa e os estilos dessas fronteiras técnicas; ela não redefine o design.

## Verificações

- **530 testes em 71 arquivos** aprovados, além de lint sem avisos, TypeScript e compilação.
- Regressão com React DOM e DOM isolado: substituição de texto por elementos `font`, atualização real da busca, tradução atrasada do contador antigo e troca entre explicação/atividade. A busca continua mostrando três cards e contador três.
- Testes existentes de conteúdo e evidências continuam verificando as mesmas frases e regras. Algumas leituras de HTML foram adaptadas para ignorar as fronteiras sem significado visual e consultar o texto do DOM.
- Chrome real, com dados locais isolados: tradução nativa para inglês ativa, contador três estável, cards traduzidos após clique, navegação entre conversa e estudo e tradução automática depois de recarregar. Nenhum erro de DOM foi registrado nessas trocas.
- Comparação visual pareada de cards, com o mesmo conteúdo e a mesma fonte local: HTML sem as fronteiras com CSS original versus HTML com as fronteiras neutras. Em **1440×900** e **390×844**, 47 elementos comparados mantiveram posição, tamanho, fonte e cor. Capturas e métricas ficam em `output/browser-translation-2026-11-03/`.
- O teste nativo foi feito com inglês. Não é uma certificação de todos os idiomas nem da qualidade da tradução do Google. Textos incorporados em imagens e áudio continuam sendo os arquivos aprovados; não foram traduzidos nem regenerados.
- Não houve reset nem conclusão do progresso real, reservas, mensagens ou alteração de permissões durante o QA.

## Uso

O usuário escolhe o idioma no tradutor do próprio navegador e pode ativar “Traduzir sempre português”. O site não força nem salva essa escolha por conta própria. [Orientações oficiais do Google Chrome](https://support.google.com/chrome/answer/173424?hl=pt-BR).

O commit e a publicação no projeto `novoessite`, no domínio original, são registrados ao concluir em `output/browser-translation-2026-11-03/publication.json`. Documentos paralelos de planejamento e histórico não fazem parte desta mudança.

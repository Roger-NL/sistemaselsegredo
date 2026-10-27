# Landing BasedSpeak — implementação

27/10/2026. Decisões finais de Roger: visual ousado e experimental, nenhuma imagem da demo, tudo essencial na primeira tela, sem conteúdo revelado por rolagem. Informações adicionais aparecem apenas por clique em “Dê uma espiada”.

## Experiência

- `/`: tela única com proposta, cadastro, login e uma composição tipográfica interativa. A amostra não acessa o estado real da demo.
- “Dê uma espiada”: painel modal nativo, com foco contido, botão de fechar sempre visível, Escape e retorno de foco. O painel pode rolar; a página de fundo não cresce.
- Animações em CSS (transform), controle de pausa e respeito a movimento reduzido. Telas baixas dispensam a composição decorativa para preservar as ações essenciais.
- `/comecar`: Google ou e-mail/senha; entrada e recuperação de senha na mesma tela. O nome não é solicitado. Sessões existentes só pulam o formulário após verificação no servidor, incluindo revogação.
- Pós-autenticação fixo em `/demo`. Cadastro não cria cobrança nem sincroniza a tentativa local.
- A demo direta continua pública. Reiniciar fica em `/demo`; não retorna à landing.

Não há promessa de curso completo disponível, preço, prazo de fluência ou novos módulos. A próxima etapa pedagógica é apresentada no painel como proposta em preparação, de acordo com `VISAO-GERAL-DO-PRODUTO.md`.

## Verificação

Verificação visual em 320×568, 390×844 e 1280×654: página ocupa a altura disponível, sem overflow horizontal e sem seções abaixo. Montagem, erro, sucesso e reinício da amostra foram exercitados no navegador. O painel recebe foco, fecha por Escape e preserva o botão de fechar ao rolar; a pausa interrompe as três animações.

Os 171 testes existentes passaram e os quatro testes novos de entrada autenticada passaram. TypeScript e build de produção foram verificados. O login/cadastro remoto não foi exercitado com uma conta real; nenhuma conta de teste foi criada e nenhum deploy foi feito.

### Revisão de centralização e altura

Em 27/10, Roger solicitou centralização no mobile e cadastro/login também em um único frame. O formulário passou a usar uma grade com a altura disponível, cartão menor e espaçamentos adaptados à altura. Inputs mantêm fonte de 16 px; campos e ação principal preservam áreas confortáveis. Informações repetidas foram retiradas do login. Na horizontal de telas baixas, o formulário reorganiza campos/alternativas em colunas, em vez de cortar o conteúdo.

Landing, cadastro e login foram conferidos no Chrome com viewport de 320×568, 375×667, 390×844, 820×1180, 1280×654, 1440×900, 844×390 e 568×320. A altura/largura da página coincide com a janela, os controles não ficam fora da tela e os cartões não sobrepõem o rodapé. No mobile, o título, a descrição, as ações e a amostra da landing estão centralizados. Login, cadastro, recuperação e mostrar/ocultar senha foram percorridos sem criar contas remotas.

Exemplos medidos: em 1280×654, o cartão de login ocupa cerca de 463 px; em 320×568, cadastro e login ocupam aproximadamente 441 e 414 px. Os 175 testes passaram, assim como lint e build de produção. Essas verificações usam o navegador com dimensões móveis; não substituem testes em aparelhos físicos.

### Correção do corte com zoom no Chrome

A captura posterior de Roger revelou um caso que a matriz anterior não cobria: o layout do Chrome tinha 440×956 px, mas a área realmente visível era aproximadamente 348,83×757,91 px, com escala de 1,261. As regras baseadas apenas na largura da janela e em `100svh` deixavam ações e rodapé fora dessa área. O corte foi confirmado na aba afetada, sem alterar seu zoom antes da verificação.

Landing e entrada agora compartilham `ViewportFrame`, que acompanha tamanho e deslocamento de `VisualViewport`. Os pontos de adaptação e a tipografia usam o tamanho desse frame por container queries, incluindo a altura. O painel de informações também se limita à área visível. O zoom continua permitido; não foi adicionado limite de escala ao navegador.

A correção foi conferida na própria aba com a diferença de tamanho acima: o frame passou a medir 348×757 px e os controles ficaram visíveis. Foram adicionados três testes para a regressão de dimensões, redução da altura e fallback. Os 178 testes, lint e build passaram. As verificações de layout agora comparam os controles com os limites de `VisualViewport`, em vez de verificar somente a largura/altura do documento.

A matriz passou a incluir 348×757 e 440×956, além das oito dimensões anteriores, cobrindo landing, cadastro e login. Também verifica links do cabeçalho e rodapé. Essa conferência encontrou e corrigiu o alvo de “Voltar” ultrapassando em 2 px o cabeçalho na horizontal de 568×320. O painel de informações foi aberto e fechado por teclado no cenário com zoom.

### Composição sem sobreposição

Roger solicitou que “LET’S TALK” também ficasse inteiro e centralizado. O título e o cartão agora ocupam linhas separadas de uma grade, com tamanho da tipografia limitado ao espaço disponível para o título. O cartão permanece no fluxo e não usa rotação ou posicionamento absoluto. A decoração “YOUR TURN” foi retirada. Em telas compactas, “LET’S TALK” ocupa uma única linha; na horizontal, a proposta e a amostra dividem a tela sem esconder a amostra.

Conferência de geometria e captura em 320×480, 320×568, 348×757, 360×740, 375×667, 390×844, 440×956, 820×1180, 1280×654, 1440×900, 844×390 e 568×320. Em todas, título e cartão ficam inteiros e separados; o centro horizontal do título coincide com o do quadro (diferença inferior a 0,01 px de arredondamento). A checagem compara o título com o cartão, além de conferir os limites visíveis, para detectar sobreposições internas que a matriz anterior não verificava.

A pesquisa e propostas iniciais estão em `research-landing.md`, `landing-visual-direction.md` e `landing-ux.md`. As recomendações iniciais de imagem da cafeteria e seções foram substituídas pelas instruções finais acima.

### Retorno do estilo de colagem

Roger preferiu recuperar a personalidade da composição anterior. “LET’S TALK” voltou a ter inclinação, a etiqueta “YOUR TURN” ocupa seu próprio espaço à direita e o cartão tem uma rotação suave. O conjunto permanece centralizado, com título e exercício em linhas separadas e folgas para as rotações. A etiqueta participa do fluxo; não cobre a tipografia. Em áreas baixas, o título passa a uma linha para preservar sua legibilidade.

A composição restaurada foi medida nos mesmos 12 tamanhos acima: título, etiqueta e cartão ficaram dentro do quadro, sem interseção entre título e etiqueta ou entre título e cartão, e os controles ficaram dentro da área visível. Depois dessa medição, foi acrescentada uma regra que aplica a versão em uma linha quando a área do título tem até 120 px de altura. O Chrome deixou de responder antes da conferência visual dessa última regra e da gravação das novas capturas. Os 178 testes, lint e build passaram com a regra final.

### Conferência final no Chrome reconectado

A última regra foi conferida após liberar a sessão de depuração que havia ficado presa. A matriz mobile cobriu 320×480, 320×568, 348×757, 360×740, 375×667, 390×844, 412×924, 440×956 e 844×390. Em todas, título, etiqueta e cartão ficaram inteiros, separados e dentro do quadro; nenhum controle saiu da área visível. A diferença entre o centro visual do conjunto título/etiqueta e o centro do quadro ficou abaixo de 2,2 px, considerando as rotações. A largura e a altura do documento coincidiram com as da janela, sem conteúdo adicional para revelar por rolagem.

As dicas de erro, a frase completa e o reinício foram exercitados em 320×480 sem aumentar a altura da página. A versão de produção local também foi aberta em 320×480, 360×740 e 390×844, incluindo tentativa de rolagem na menor tela. Capturas e medições estão em `output/landing/mobile-final-*.png` e `output/landing/mobile-final-qa.json` (artefatos locais ignorados pelo Git). Nenhuma alteração adicional de código foi necessária.

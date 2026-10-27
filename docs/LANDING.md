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

A pesquisa e propostas iniciais estão em `research-landing.md`, `landing-visual-direction.md` e `landing-ux.md`. As recomendações iniciais de imagem da cafeteria e seções foram substituídas pelas instruções finais acima.

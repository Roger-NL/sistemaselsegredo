# BasedSpeak

Inglês na prática para quem começa do zero. A demo principal ensina **I am, you are, we are e they are** por meio de cenas visuais, escuta, cliques, montagem, arraste e escrita curta. A identidade de gibi, os personagens animados e as vozes acompanham todo o percurso.

## Percurso principal

`/` apresenta o produto; `/demo` abre a aula gratuita, sem cadastro nem microfone. A ordem é **Apresentação → Como funciona → Aula → Teoria → Teste**. São 49 unidades de progresso: três na apresentação, seis no guia, 29 atividades distribuídas nas seis mecânicas da aula, cinco etapas de teoria e seis questões finais.

O guia explica cada mecânica em português, com voz e mão animada, e permite experimentar durante a explicação. As falas dos personagens são reproduzidas automaticamente quando permitido pelo navegador; Ouvir repete a fala. A escrita aceita variações compreensíveis e explica ajustes de forma sem bloquear respostas equivalentes.

`/comecar` oferece cadastro, Google, e-mail/senha e recuperação reais. `/dashboard` exige uma sessão verificada e reúne **Meu percurso, Meu avanço, Minhas atividades, Minha aula ao vivo e Professor**. Começar ou Continuar abre a mesma demo, na etapa salva. No desktop, o painel e a aula aproveitam a altura da janela; no celular, textos e controles permanecem legíveis.

O progresso autenticado usa `lessonSnapshot` em `learning_states`, associado ao UID no servidor, com revisão e versão de salvamento para tratar conflitos entre abas. O progresso de visitante fica separado no navegador; sua importação para uma conta exige ação explícita e uma conta elegível sem progresso anterior. Recomeçar a aula preserva a conta, mensagens e reservas. Snapshots antigos não contam como avanço do novo curso.

A agenda depende da conclusão da aula e do teste, do salvamento confirmado e da elegibilidade da conta. Pedidos de aula e mensagens ao professor usam as integrações existentes; controles de simulação ficam separados do uso normal.

A antiga cafeteria e seu estudo foram substituídos como experiência principal. `/demo/estudo` redireciona ao novo percurso, que exige a conclusão da prática antes de abrir a teoria. Os aliases de prévia de primeiros encontros também apontam para a demo principal.

## Código e mídia

- `src/features/first-encounters/`: aula, apresentação, guia, teoria, teste, painel, animações e adaptador de progresso da conta.
- `src/features/dashboard/`: sessão de workspace, sincronização, permissões e contato com o professor.
- `src/client/auth/` e `src/server/`: autenticação Firebase, autorização, progresso, administração, notificações, pagamentos e agenda.
- `src/app/product-base.css` e `src/app/comic-*.css`: identidade compartilhada, com Barlow, Bangers e a marca de quatro traços.
- `public/first-encounters/`: personagens Rive, runtime WASM e gravações de voz já produzidas. Falas repetidas reutilizam arquivos; navegar na aula não chama síntese de voz.
- `assets/first-encounters/characters/`: fontes editáveis dos personagens. Os scripts manuais de mídia ficam em `scripts/media-production/`, fora do build.

O Firebase Admin e todas as credenciais de serviço permanecem no servidor. `.env.local`, `.vercel/`, `output/` e arquivos temporários são ignorados pelo Git. O cache histórico de voz, as mensagens e as reservas existentes não devem ser apagados ao alterar o currículo.

## Desenvolvimento e verificação

Use Node.js 22 ou superior e npm. Execute `npm ci`, configure as variáveis necessárias conforme `.env.example` e rode `npm run dev` na porta 3000. A demo pública funciona sem credenciais; login e sincronização da conta exigem Firebase válido.

Verificações: `npm test`, `npm run lint`, `npx tsc --noEmit --incremental false` e `npm run build`. Testes de interface podem ser executados em navegador headless, sem abrir janelas nem usar mouse e teclado do computador. Saídas e capturas locais ficam em `output/`.

`/dev/testes` é restrita a desenvolvimento em loopback; simulações não substituem o progresso normal. Os scripts `scheduling:health`, `payments:audit` e `auth:admins` são operacionais e podem consultar ou alterar serviços externos; não fazem parte do build.

## Documentação das integrações

[Autenticação](docs/AUTENTICACAO.md), [Administração](docs/ADMINISTRACAO.md), [Notificações](docs/NOTIFICACOES.md) e [Integrações](docs/plano-nova-demo/INTEGRACOES.md) descrevem a infraestrutura preservada. Documentos anteriores que mencionam cafeteria, histórias ou estudo de 24 práticas são registros da versão substituída; a implementação de `first-encounters` define o currículo atual.

# Painel BasedSpeak

## Estado vigente — gestão e aluno conectados

Desde a integração de 27/10/2026, o painel exige autenticação real, reúne **Minha história, Meu avanço, Minhas atividades e Professor**, e usa os contratos de `src/contracts/workspace.ts`. Conversa e estudo são persistidos por UID no Firestore. Contas novas aguardam aprovação, com contato disponível; contas antigas com perfil mantêm seu acesso. O ADM lê esse mesmo progresso, decide acessos e responde às conversas do aluno.

O modo visual foi removido da entrada, do dashboard e da história. Não se usam conta ilustrativa, dados de exemplo ou sucesso simulado. Cache anônimo antigo não é associado automaticamente a contas. Mutações de aluno exigem sessão, mesma origem, UID correspondente e revisão válida; resets recebidos descartam tentativas antigas. Os detalhes atuais, incluindo APIs, frequência de atualização e medidas de avanço, estão em [ADMINISTRACAO.md](ADMINISTRACAO.md).

## Histórico das etapas anteriores

Os registros abaixo documentam entregas anteriores e seus limites à época. As descrições de prévia visual, progresso exclusivamente local e integrações reservadas foram substituídas pelo estado vigente acima.


27/10/2026. Implementação da prévia “Sua jornada” aprovada por Roger na conversa **dashboard**. Rota escolhida por ele: `/dashboard`; nomes na interface: “Meu painel” e “Seu espaço”. Este chat centraliza futuras mudanças no painel.

## Fluxo e apresentação

`/` → `/comecar` → `/dashboard` → abertura da cafeteria → `/demo`.

**Estado vigente — correção de Roger em 27/10/2026:** acesso visual livre. Google e e-mail/senha permanecem na interface; ambos abrem o painel sem exigir conta, preencher campos ou chamar Firebase. O painel usa a conta ilustrativa, salvar nome altera somente a prévia em memória e sair retorna à entrada visual sem apagar demo ou estudo. Autenticação real permanece implementada, mas não participa desta entrada de teste. As APIs reais continuam protegidas. A principal é `master`.

**Histórico anterior à etapa 6:** Roger havia solicitado acesso visual para acelerar os testes. A função `isVisualAccessMode()` retornava `true`; os botões abriam o painel sem autenticar, com nome/e-mail ilustrativos. Salvar nome alterava somente a prévia em memória e sair voltava à entrada visual. Esse comportamento foi encerrado no checkout local. A landing não foi alterada.

Verificação desta atualização: 191 testes, lint, TypeScript e build passaram. `/dashboard` e a entrada visual responderam 200 sem sessão; a API real de perfil continuou respondendo 401. No Chrome, o botão com campos vazios abriu o painel, e a abertura animada revelou o acesso à tentativa já existente sem reiniciar a demo. O painel ficou aberto para Roger testar. Não houve publicação de produção.

O painel preserva creme/preto, Geist local e a marca existente. Cabeçalho com conta, configurações e nome quando disponível. “Sua jornada” oferece uma única ação dominante: “Começar.”, “Continuar.” ou “Rever.”, de acordo com a tentativa deste navegador. Contas sem nome recebem uma saudação neutra; não se exibe o placeholder “Usuário” nem se exige mais um campo no cadastro.

A cafeteria aparece só após clicar: a superfície preta se abre, apresenta “Let’s talk.” e revela a imagem aprovada com o acesso à demo. Há “Pular abertura”, retorno ao painel, Escape e preferência de movimento reduzido. A preferência do dispositivo também é respeitada. A escolha de apoio e o estado da conversa continuam no motor existente da demo; a abertura não inicia nem reinicia uma tentativa, não baixa áudio e não faz síntese.

Minha conta permite consultar o e-mail, salvar o nome e sair. Configurações guarda somente a preferência de animação neste navegador. Diálogos nativos mantêm o foco e devolvem ao controle de origem. O painel pode rolar em telas pequenas; a landing continua independente, com seu comportamento de tela única.

## Navegação comum e entrada na jornada

A barra superior é compartilhada entre painel, demo, abertura preta e área de estudo. Marca e menu ocupam a mesma posição: 72 px de altura no computador, 64 px no mobile, com margens compartilhadas. A marca leva ao painel. O menu permite acessar painel, conversa, estudo, conta e configurações; na demo também conserva Voltar e Recomeçar. O atalho de avanço sem responder foi retirado na etapa 2 de preparação do lançamento; os avanços normais ficam nas próprias atividades. Funciona com teclado, Escape e toque fora. A landing e a tela de entrada mantêm sua composição própria.

Correção da faixa clara relatada por Roger: durante a abertura e a cobertura da jornada, cabeçalho, marca e menu expandido usam a versão escura. A cor persiste na troca de rota e retorna suavemente ao creme durante a revelação da conversa. O fundo da barra cobre também as margens laterais; as posições dos controles permanecem iguais. Movimento reduzido elimina essa mudança animada de cor.

“Let’s talk.” continua como primeira abertura. O acesso seguinte usa uma transição diferente: “Sua vez na história.” para começar ou “De volta à conversa.” para retomar, com uma linha em movimento e a revelação da cena. Uma cobertura persiste durante a navegação e só sai depois de a imagem responsiva selecionada ser decodificada e o layout ter se ajustado. A abertura anterior fecha depois que a cobertura existe, evitando o flash do painel. O menu fica disponível no topo durante todo o percurso. Movimento reduzido dispensa as animações. A transição não reinicia a tentativa, não pré-carrega áudios nem gera mídia.

Em telefones na horizontal e com pouca altura, a abertura e a primeira cena usam duas colunas para manter imagem e ação acessíveis abaixo da barra.

Validação desta navegação: 202 testes, lint, TypeScript e build padrão passaram. No Chrome, foram percorridos início com escolha de apoio, retomada da tentativa existente, retorno ao painel, menu de estudo e configurações; a barra também permaneceu no topo ao rolar o estudo. Foram comparadas as posições da barra em 320×568, 390×844, 440×956, 1024×768, 1440×900, 568×320 e 844×390. O corte encontrado na abertura horizontal foi corrigido; imagem e ação da primeira cena também ficaram dentro da janela nessa orientação. A atividade fica temporariamente inerte sob a cobertura, mantendo o menu acessível, e recupera o foco na chegada. Evidências: `output/navigation-qa/`. A tentativa original foi preservada; a primeira entrada foi testada em uma origem local separada. Sem publicação de produção.

## Identidade e dados no acesso real (reservado durante a prévia)

- `/dashboard` verifica o cookie Firebase no servidor, incluindo revogação; sem sessão válida, redireciona para `/comecar?modo=entrar`.
- O browser recebe somente nome e e-mail. Falha na leitura do perfil mantém a identidade verificada, usando o nome do provedor quando disponível.
- `PATCH /api/account/profile` aceita somente `name`, de origem igual à da requisição e com sessão verificada. A identidade vem do cookie. A operação atualiza apenas nome e `updatedAt` do próprio usuário; não recebe UID, papel, plano ou e-mail do cliente.
- Sair limpa primeiro o cookie HTTP-only; o Firebase browser é carregado sob demanda para encerrar também sua sessão local. Não se apagam tentativas ou outras chaves do navegador.
- Progresso da demo permanece local, sem vinculação ou sincronização por conta. O painel informa esse limite. Curso, pagamentos, agenda, mídias e cache de áudio não foram alterados.

Durante a prévia, o modo visual não concedia acesso às APIs reais. `PATCH /api/account/profile` e demais endpoints protegidos continuam exigindo sessão verificada. Não foram alterados regras Firebase, papéis, configuração de provedores ou dados de contas existentes para reativar o acesso.

### Evidência da reativação — etapa 6

Em 27/10/2026, 19:11:00–19:11:17 UTC, uma conta exclusiva de QA foi cadastrada pelo SDK real e autenticada pelo servidor em um build local isolado. Dezoito verificações aprovaram cadastro, perfil mínimo, cookie de sete dias com `HttpOnly`/`Secure`/`SameSite=Lax`, identidade, painel, desvio da entrada quando autenticado, salvamento do próprio nome, recusa de origens externas, logout, senha incorreta, novo login, revogação real e novo login após revogação. A conta e seu documento foram removidos, e as credenciais temporárias excluídas; contas existentes não foram alteradas.

`POST /api/auth/session` e `DELETE /api/auth/session` exigem a mesma origem. Criar uma sessão exige token verificado, não revogado e login recente, até cinco minutos. A consulta `GET` usa `Cache-Control: private, no-store`, inclusive quando não autenticada. Falhas na confirmação da sessão tentam limpar o cookie anterior e encerram a identidade Firebase local. A leitura opcional do perfil no navegador pode falhar sem invalidar a sessão já confirmada pelo servidor. A transação do perfil permanece no servidor e não altera permissões ou campos de curso. Referência: [Firebase — Manage Session Cookies](https://firebase.google.com/docs/auth/admin/manage-cookies).

291 testes em 44 arquivos, lint, TypeScript e build aprovados. Regressão com fixture antiga compara a tentativa e o progresso do estudo byte a byte após cadastro, login e logout. Isso usa armazenamento simulado; a navegação visual do fluxo real não foi exercitada porque o navegador recusou a permissão da origem local. Não houve contorno. Google está habilitado no projeto, com domínio local e de produção autorizados; o popup/login Google passou nos testes simulados, sem OAuth completo com uma conta Google real. Nenhum e-mail de recuperação foi enviado.

Após o ajuste final dos headers da consulta de sessão, oito verificações HTTP somente leitura reconferiram entrada, cookies inválidos e rotas públicas no novo build; a resposta 401 da consulta traz `private, no-store`. A resposta autenticada usa o mesmo header e passou no teste de rota. O fluxo autenticado das 18 verificações reais permaneceu igual.

Evidências em `output/stage6-qa/`, ignorado pelo Git: `acesso-real.json`, `entrada-http.json`, `configuracao-provedores.json`, `validacao-etapa6.json`, `base-etapa6.json` e `preservacao.json`. O servidor e o helper de QA ficaram em cópia temporária, sem reconstruir o `.next` principal. Não houve geração de mídia, mudança de cache, commit ou deploy.

## Escopo dos arquivos compartilhados

Orientação vigente, corrigida por Roger após a primeira publicação: Google deve permanecer, assim como e-mail/senha. A prévia permite entrada por qualquer um dos botões sem validar credenciais, abrir popup, criar conta ou enviar recuperação de senha. Formulário, estilos e integração Google foram restaurados; a flag de acesso visual está ativa. Essa correção substitui a interpretação anterior de publicar somente e-mail/senha reais.

Landing (`src/app/page.tsx`, composição, estilos e modal de informações) preservada. Na tela de cadastro/login, mudam somente destino de sucesso e textos que anunciavam entrada direta na demo. Sessões válidas em `/comecar` também passam a seguir para `/dashboard`.

`/dashboard` sai da lista de aliases aposentadas; os outros 21 e as seis APIs aposentadas permanecem. `ROTAS.csv` é inventário histórico da substituição da demo e registra a retirada anterior do painel antigo, sem descrever esta nova tela.

## Verificação

Os testes cobrem o acesso com cookie ausente, inválido/revogado e válido; perfil mínimo entregue ao cliente; recuperação quando a leitura de perfil falha; destino autenticado de `/comecar`; manutenção dos aliases; origem, identidade e campos permitidos na atualização do nome. Testes usam provedores simulados e não criam contas ou gravam dados remotos.

Os 189 testes, lint sem avisos, TypeScript e build de produção passaram. No servidor da aplicação, o acesso anônimo e com cookie forjado redirecionou para o login; a atualização do nome sem sessão respondeu 401, e com origem externa respondeu 403.

Conferência visual do componente real com conta ilustrativa em servidor de QA separado, fora das rotas da aplicação: 320×568, 348×757, 390×844, 820×1180, 1024×768, 1440×900, 568×320 e 844×390. A conferência encontrou o acesso da abertura abaixo da área visível em 568×320; a abertura foi reorganizada em duas colunas nessa orientação. A matriz final ficou sem overflow horizontal e com acesso à demo visível em todas as dimensões. Também foram conferidos abertura animada, movimento reduzido, retorno de foco por Escape, escolha de apoio no motor existente e retorno ao painel com “Continuar.” sem apagar a tentativa. Login remoto e gravação real do nome não foram exercitados com conta de usuário. Capturas, matrizes e o código do servidor de QA arquivado ficam em `output/dashboard-qa/`, ignorado pelo Git; o servidor de QA foi encerrado.

As mudanças desta entrega estão no checkout local. Não houve publicação de produção, alteração da landing publicada, novas regras Firebase, migração de dados ou geração de áudio.

## Publicação no domínio original

Após Roger esclarecer que esperava a atualização no site original, a versão foi publicada em `https://www.basedspeak.com`, deployment `dpl_6K7rkmH2xZ5yAUfoe18M8C1uP5TA`, com código de `b797784`. O push anterior para a branch de trabalho não havia atualizado produção. Não foi criada outra branch.

A conferência identificou que o estudo já estava publicado, apesar de seus arquivos ainda não estarem registrados no Git. Esses arquivos foram preservados e versionados; a diferença na experiência de estudo é somente a adoção do cabeçalho compartilhado. A landing publicada foi comparada com a cópia do deployment anterior: página inicial e CSS permanecem iguais.

Build remoto concluído e domínio associado. No Chrome, entrada visual sem preencher campos → dashboard → abertura escura → seleção de apoio na demo; estudo também respondeu com a página e o menu compartilhado. Cabeçalho da abertura confirmado escuro e sem overflow horizontal. Os 202 testes passaram antes da publicação. Evidência: `output/navigation-qa/menu-publicado.png`.

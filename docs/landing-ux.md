# Landing BasedSpeak — direção de UX

> Atualização de Roger em 27/10: a landing **não tem rolagem nem imagens da demo**. Tudo essencial ocupa a primeira tela; conteúdo adicional só aparece ao clicar em “Dê uma espiada”, em um painel modal acessível. A direção é ousada e experimental. A estrutura em seções abaixo é a proposta inicial e não descreve a implementação final. Cadastro final: Google ou apenas e-mail e senha; nome não é solicitado porque a demo não usa esse dado.

Data: 27/10/2026. Escopo: proposta para implementação local da landing e entrada de cadastro, orientada pelo pedido atual. Este pedido passa a prever cadastro antes da demo; a documentação anterior descreve uma demo sem conta.

## Objetivo e promessa

Fluxo principal: landing → criar conta → escolher apoio → demo → conhecer o curso quando houver uma oferta ativa. A interface deve demonstrar a mecânica da conversa antes de explicar o método em texto. Não apresentar curso, preço, depoimentos, número de alunos, nível certificado ou professor de IA aberto sem evidência.

Promessa sustentada pelo produto atual: participar de uma conversa em inglês, escolher o que dizer e construir respostas com apoio. A demo tem contexto visual, áudio por clique, três perfis de apoio, montagem/escrita e uma retrospectiva do caminho realmente percorrido. Não exige microfone.

## Estrutura e copy propostas

1. Header: marca existente; âncora “Como funciona”; “Entrar”. Sem menu extenso.
2. Hero: eyebrow “INGLÊS, NA PRÁTICA”; título “Seu inglês começa com uma conversa.”; apoio “Entre na história, escolha o que dizer e monte suas respostas. Com apoio no seu ritmo.”; CTA “Experimentar a demo”; microcopy “Demo gratuita · Sem microfone”. A duração pode ser omitida, pois há estimativas divergentes de 20 e 30 minutos na base.
3. Prévia no hero: imagem da cafeteria com proporção 3:2 e sem recortar os copos; rótulo “Uma prévia do método”; instrução simples e blocos clicáveis para uma frase ilustrativa independente do roteiro: “A coffee, please.”. Ao concluir: “É assim: você constrói, com apoio.” Não pontuar, não testar velocidade, não fazer alegação de domínio. Não baixar áudio na landing.
4. Como funciona: “Uma conversa. Um passo de cada vez.”; três itens “Crie sua conta” / “Entre na conversa” / “Reveja o que construiu”. Uma linha de explicação por item.
5. Apoio: “Comece de onde você está.”; “Guiado” / “Com pistas” / “Mais autônomo”; “O apoio muda. A conversa continua.” Alternar o exemplo visual é útil somente quando o exemplo realmente muda; evitar tabs decorativas.
6. FAQ nativa com três perguntas: “Preciso saber inglês?” → “Você pode começar do zero e escolher mais apoio.”; “Preciso usar o microfone?” → “Não. Você participa escolhendo e construindo respostas. O áudio fica disponível quando quiser ouvir.”; “O que acontece depois da demo?” → “Você pode rever as respostas que construiu e os momentos da sua conversa.”
7. Último CTA: “Sua próxima conversa começa aqui.” / “Experimentar a demo”. Footer com marca, termos e privacidade.

Os rótulos de CTA principal se repetem sem criar objetivos concorrentes. O CTA deve levar a uma entrada concreta e funcional de cadastro.

## Rotas e cadastro

- `/` e `/demo` atualmente usam `DemoHost`; a nova landing substitui apenas a home.
- `/login` e `/cadastro` são aliases aposentadas e redirecionam para `/` em `src/proxy.ts`; não apontar a nova landing para essas rotas.
- Usar `/comecar` como rota nova, com modo de entrada opcional (`?mode=login`) e callback interno seguro `/demo`.
- Preservar rotas aposentadas e os testes existentes. O helper `resolvePostAuthTarget` usa `/` como fallback, portanto a nova tela deve fornecer callback `/demo` explicitamente.
- Reutilizar Firebase Auth + sincronização da sessão existente. Carregar o módulo de autenticação somente na rota de entrada ou na interação, sem alcançar o bundle da landing.
- Recomenda-se Google e e-mail/senha; pedir somente dados exigidos pelo provedor. Não coletar telefone, cargo, objetivo, empresa ou questionário na conversão.
- Se houver senha, usar `autocomplete=new-password`, mostrar/ocultar e orientação junto ao campo. Dispensar um segundo campo de confirmação quando o serviço puder receber a mesma senha duas vezes.
- Conta já existente deve oferecer entrada no mesmo local, preservando e-mail e destino. Erro deve permanecer junto ao formulário sem apagar campos.
- Tela de cadastro deve explicar a próxima ação: “Crie sua conta para começar a conversa.”; botão Google “Continuar com Google”; submit “Criar conta e começar”; link “Já tenho conta”. Após sucesso, abrir `/demo`, cuja escolha de apoio continua necessária.
- Não prometer persistência entre dispositivos: a demo atual guarda o progresso no navegador. Conta e snapshot local são estados distintos.

## Comportamento e acessibilidade

- Blocos interativos são botões reais; funcionam por clique, Enter e Espaço. Não exigir arrastar. Permitir remover uma peça ou recomeçar.
- Usar `aria-live=polite` para feedback, sem mover foco automaticamente a cada clique. Associar instrução e status à atividade.
- Em uma falha de montagem, manter as peças e fornecer uma pista curta, sem sacudir ou marcar erro vermelho punitivo.
- Garantir foco visível, contraste, alvo mínimo de 44 px, inglês marcado com `lang=en`, uma única `h1` e headings em ordem.
- Accordions com `details`/`summary` funcionam sem JavaScript. Controles não dependem apenas de cor.
- Respeitar `prefers-reduced-motion`; evitar autoplay, parallax, ticker, scroll preso e animação de digitação.
- Mobile: hero começa por promessa + CTA; prévia visual imediatamente abaixo, sem texto de abertura longo. Nav reduzida; CTA largo; não fixar botão que cubra a atividade.
- Manter margens seguras e nenhum overflow em 320 px ou zoom a 200%. Esconder elementos decorativos, nunca instruções necessárias.

## Direção visual e performance

Preservar a identidade aprovada: fundo `#F4F0E8`, texto/CTA `#191919`, superfícies `#FFFFFF`/`#FCFAF6`, bordas `#DED8CD`, Geist local e marca original. A revisão aprovada pede que verde e terracota não sejam introduzidos como identidade da interface. Feedback pode usar check, borda e texto.

Servidor para estrutura e copy; pequenas ilhas client para prévia e formulário. Nenhum SDK Firebase, animação, áudio ou conteúdo integral da demo na home. Reutilizar WebP local com dimensões explícitas e tamanhos responsivos; priorizar somente imagem principal. Imagens abaixo da dobra com lazy loading. Não adicionar fonte externa ou biblioteca para interações nativas simples.

Verificar o resultado em produção local, mobile, teclado e movimento reduzido. Medir bundle e métricas reais antes de dizer “performática”; a proposta não constitui benchmark nem garantia de conversão.

## Evidência local

- `src/features/demo/DemoHost.tsx`: entrada, retomada, estado local e transição `/demo`.
- `src/features/demo/DemoEntry.tsx`: perfis de apoio e copy atual sem microfone.
- `src/features/demo/components/Retrospective.tsx`: resultado e encerramento sem oferta de curso ativa.
- `src/lib/page-aliases.ts` e `src/proxy.ts`: rotas antigas aposentadas.
- `src/client/auth/service.ts`: serviços Firebase preservados.
- `src/client/auth/navigation.ts`: callback de autenticação.
- `docs/plano-nova-demo/REVISAO-EXPERIENCIA-E-AUDIO.md`: identidade visual aprovada.

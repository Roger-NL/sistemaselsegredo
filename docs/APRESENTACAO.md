# Apresentação inicial do BasedSpeak

Este documento e o chat **Apresentação** são a referência para mudanças nesta área. Implementação local de 28/10/2026, integrada ao checkout compartilhado; publicação e build são responsabilidade do chat principal.

## Experiência

Orientação vigente de Roger em 28/10/2026: conversa e estudo da demo devem abrir diretamente por link, sem cadastro nem aprovação. Autenticação permanece para recursos da conta e agendamento. A apresentação não deve anunciar espera por liberação do professor. A integração transversal desse acesso público é coordenada pelo chat principal; os arquivos deste chat alteram o conteúdo e a entrada do modal da landing.

No percurso da conta, entre a entrada autenticada e a primeira exibição completa do Meu painel, a conta vê cinco passos com navegação manual:

1. Boas-vindas após cadastro: a conta já está pronta; convite para começar a conversa e o estudo, sem espera por aprovação.
2. Cafeteria com Lucas: escuta e construção das respostas, três apoios e nenhum microfone.
3. Estudo guiado: oito blocos e 24 práticas, um pequeno passo por vez.
4. Aula gratuita: concluir 100% das 24 práticas libera o pedido de uma aula de 1 hora com professor, uma por conta; horário depende de disponibilidade e confirmação.
5. Meu painel: conversa, avanço, estudo, aula e contato com professor no mesmo lugar.

A revisão visual solicitada por Roger em 28/10 substitui o layout inicial de ilustração e parágrafos por uma abertura preta cinematográfica. Os cinco capítulos têm nove momentos curtos (2 + 2 + 2 + 2 + 1): cada clique revela uma ideia. Marca animada com órbitas, cafeteria com cartões de apoio, oito blocos com três práticas cada, anel de 100% que se transforma no benefício de 1h e representação gráfica do painel. Título em duas linhas e uma frase curta por momento; sobrancelha, linhas e descrição entram em sequência, em aproximadamente dois segundos. Os efeitos são finitos e nunca condicionam a disponibilidade dos controles.

A instrução vigente de Roger exige a primeira apresentação completa uma única vez para cada conta, antiga ou nova. Avançar e voltar percorrem os nove momentos; atalhos de capítulos só liberam os capítulos já alcançados. Não há botão Pular nem saída para o painel antes do último momento. O logo aponta para `/dashboard`, onde o mesmo gate continua ativo até a conclusão. Não há autoplay. Somente “Abrir meu painel”, no último momento, solicita a conclusão. Ao rever uma apresentação já concluída, todos os capítulos ficam disponíveis e “Voltar ao painel” fecha a revisão. Não há inferência de aprovação, conclusão de estudo ou aprendizagem a partir da apresentação. A apresentação não inicia a conversa nem solicita/reserva aula.

O layout usa fundo preto, tipografia creme, acentos quentes, Geist existente e composição responsiva. O estado de carregamento também usa fundo preto, evitando a troca brusca de fundo ao abrir a apresentação. A arte da cafeteria reutiliza `/demo/cafe/v2/images/V01-960.webp`. Os demais quadros usam texto, CSS e ícones existentes. Nenhuma imagem ou áudio é gerado; nenhum áudio é reproduzido ou pré-carregado.

## Integração e persistência

`Dashboard` envolve seu conteúdo em `PresentationGate`. O conteúdo completo e seus hooks só montam após uma resposta válida que confirme a apresentação concluída. A consulta inicial mostra somente “Preparando seu espaço…”, sem flash de progresso, mensagens ou agenda. Uma falha de consulta oferece nova tentativa e retorno à entrada; não é tratada como apresentação concluída.

- `GET /api/student/presentation` responde `{ uid, completed }` usando a sessão HTTP-only verificada, com revogação e sem bearer. `completed` deriva exclusivamente de `users/{uid}.presentationCompletedAt`.
- `POST` aceita somente `{ completed: true }`, até 128 bytes, com JSON, mesma origem e `X-Presentation-Uid` igual ao UID verificado. Não aceita UID ou privilégios no corpo.
- Uma transação atualiza somente `presentationCompletedAt` com timestamp ISO do servidor se ainda não houver conclusão. Repetições não substituem o timestamp. Perfil inexistente não é criado pela apresentação.
- Todas as respostas, inclusive erros, usam `Cache-Control: private, no-store`. Node e região `iad1`, como as APIs atuais.
- Nenhuma alteração nos contratos/serviço de workspace, autorização, reservas, snapshots, atividades ou progresso anônimo. O campo é próprio e as regras atuais já impedem atualização direta desse campo pelo aluno.

A conclusão é consultada no servidor em cada montagem do painel. Assim, a próxima entrada em outro navegador/dispositivo não repete os passos após o salvamento confirmado. Todas as contas antigas ou novas sem o campo também verão a apresentação uma vez, independentemente da data de criação ou do progresso de estudo. Nenhuma data de lançamento limita a elegibilidade; conclusões já salvas são preservadas e não há reset em massa. Abas que já tenham a apresentação aberta não são fechadas remotamente quando outra aba a conclui; um novo envio é idempotente.

O botão **Rever apresentação** fica sob o cartão da jornada. A revisão não grava nada e mantém o painel montado, oculto, preservando rascunhos. Ao fechar, restaura foco e posição de rolagem. A conclusão inicial monta o painel e encaminha o foco ao título. Durante consulta/envio há feedback; falha de gravação mantém os passos abertos e permite tentar novamente. Sessão expirada ou UID divergente pede nova entrada.

## Acessibilidade

Controles nativos com foco visível, títulos focáveis a cada passo, indicação textual da etapa, `aria-current="step"` na navegação e mensagens de erro com `role="alert"`. O passo volta ao topo ao trocar. Movimento reduzido do sistema e a preferência existente do painel desativam animações. A página rola naturalmente em janelas pequenas, sem cortar conteúdo para caber na altura. Quadros decorativos não duplicam a leitura do conteúdo.

## Arquivos

- `src/features/onboarding/PresentationGate.tsx`: consulta, conclusão, falhas, revisão e preservação do painel.
- `src/features/onboarding/Presentation.tsx`, `content.ts`, `presentation.css`: passos, navegação e composição visual.
- `src/server/presentation/service.ts` e `src/app/api/student/presentation/route.ts`: persistência exclusiva da conta.
- `src/features/dashboard/Dashboard.tsx`: gate e atalho de revisão.
- `src/features/landing/MoreInformation.tsx`: informação pública alinhada à demo sem cadastro, estudo e benefício, com CTA direto para `/demo`.
- `tests/student-presentation-*.test.ts`: proteção de API, persistência e conteúdo inicial. Os testes existentes de dashboard/navegação mockam somente o gate para continuar cobrindo o painel após a conclusão.

## Validação e limites

35 testes passaram em cinco arquivos direcionados nesta revisão: apresentação, persistência, painel do aluno, percurso de estudo e navegação da conversa. Lint direcionado sem avisos, TypeScript (`--noEmit --incremental false`) e diff sem erros aprovados. Provedores Firebase são simulados; nenhuma conta real, reserva, progresso, mídia ou credencial foi alterada. Nenhum build, restart do servidor compartilhado, commit, push ou deploy foi executado por este chat.

A prévia local isolada em `http://127.0.0.1:3217/apresentacao` foi regenerada a partir do componente real para mostrar os nove momentos sem autenticação ou gravações. O helper está em `/private/tmp/basedspeak-presentation-preview.cjs`; o HTML e as evidências ficam em `output/presentation-preview/`, ignorado pelo Git. Não há rota de prévia no produto. Foram conferidas a abertura, a passagem entre os momentos de boas-vindas e a cafeteria com os apoios no navegador interno, na dimensão corrente do painel. Essa prévia não substitui a validação React/autenticada descrita abaixo. A evidência visual anterior à revisão descreve o layout antigo.

Na revisão de acesso livre, o segundo momento usava “É só chegar. E participar.”. Roger corrigiu esse texto por se tratar de uma apresentação exibida após o cadastro. O texto vigente é “Tudo pronto. A conversa é sua.” / “Sua conta está pronta. Comece a conversa e o estudo no seu ritmo.”, com ligação gráfica entre conversa e estudo. Isso não muda a disponibilidade pública da demo: apenas mantém a mensagem da apresentação coerente com a conta já criada. Foi removida a promessa genérica de salvamento na conta para quem visita a demo anônima. A landing informa o acesso sem cadastro e seu CTA abre `/demo`. Os 12 testes direcionados de conteúdo/apresentação, formulário e entrada da landing passaram, assim como lint direcionado. O gate/API próprios da conta não foram alterados; a autorização do agendamento continua sob responsabilidade do chat principal.

### Validação integrada pelo chat principal

Os nove momentos foram percorridos na aplicação React com conta QA e em telas de 390×844 e 320×568, com foco no título e sem rolagem horizontal. O último CTA passou a ser **Abrir meu painel**, com espaço compacto entre controles para manter o botão dentro da tela de 320×568. A confirmação do primeiro acesso é persistida pela API e não altera aprovação, estudo ou agendamento. Evidências em `output/reception-qa/presentation-react-mobile.json`, `presentation-react-small-mobile.json` e `presentation-small-final.png`.

Ajuste pontual solicitado por Roger: a foto de Lucas aparece somente no primeiro momento da cafeteria. O segundo momento, sobre os três apoios, usa três cartões gráficos com ícones e entrada escalonada; não repete a foto. O estilo, texto e navegação permanecem iguais.

Na alteração de primeira exibição obrigatória, passaram 15 testes direcionados de UI/persistência, lint dos arquivos alterados e TypeScript. A cobertura inclui ausência de Pular/saída antecipada, bloqueio de atalhos futuros, revisão livre, contas antigas/novas com estudo existente, idempotência e isolamento entre UIDs. Não foram alterados registros reais de conclusão.

Validação integrada no Chrome com uma QA isolada: sem Pular e sem painel antes da conclusão, último capítulo bloqueado nos oito primeiros momentos, reload incompleto mantendo a apresentação obrigatória, nove momentos percorridos e conclusão confirmada no servidor. Após reload, o painel abriu sem repetir; a revisão permitiu saltar ao último capítulo e voltar ao painel. A conclusão não alterou estudo, status cadastral nem aula. A conta QA foi removida, preservando as 15 contas originais e o estudo/agendamento do proprietário. A suíte completa passou com **472 testes em 65 arquivos**, além de lint, TypeScript e build. Evidências em `output/mandatory-presentation-qa/`.

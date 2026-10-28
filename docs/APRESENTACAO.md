# Apresentação inicial do BasedSpeak

Este documento e o chat **Apresentação** são a referência para mudanças nesta área. Implementação local de 28/10/2026, integrada ao checkout compartilhado; publicação e build são responsabilidade do chat principal.

## Experiência

Entre a entrada autenticada e a primeira exibição completa do Meu painel, a conta vê cinco passos com navegação manual:

1. Boas-vindas e aprovação: o professor aprova novos cadastros antes de liberar conversa/estudo; painel e contato permanecem disponíveis enquanto pendentes.
2. Cafeteria com Lucas: escuta e construção das respostas, três apoios e nenhum microfone.
3. Estudo guiado: oito blocos, 24 práticas e retomada após salvamento na conta.
4. Aula gratuita: concluir 100% das 24 práticas libera o pedido de uma aula de 1 hora com professor, uma por conta; horário depende de disponibilidade e confirmação.
5. Meu painel: conversa, avanço, estudo, aula e contato com professor no mesmo lugar.

Avançar, voltar, selecionar uma etapa e pular são ações explícitas; não há autoplay. Pular e concluir registram a mesma confirmação. Não há inferência de aprovação, conclusão de estudo ou aprendizagem a partir da apresentação. A apresentação não inicia a conversa nem solicita/reserva aula.

O layout usa creme/preto, Geist existente e composição responsiva. A arte da cafeteria reutiliza `/demo/cafe/v2/images/V01-960.webp`. Os demais quadros usam texto, CSS e ícones existentes. Nenhuma imagem ou áudio é gerado; nenhum áudio é reproduzido ou pré-carregado.

## Integração e persistência

`Dashboard` envolve seu conteúdo em `PresentationGate`. O conteúdo completo e seus hooks só montam após uma resposta válida que confirme a apresentação concluída. A consulta inicial mostra somente “Preparando seu espaço…”, sem flash de progresso, mensagens ou agenda. Uma falha de consulta oferece nova tentativa e retorno à entrada; não é tratada como apresentação concluída.

- `GET /api/student/presentation` responde `{ uid, completed }` usando a sessão HTTP-only verificada, com revogação e sem bearer. `completed` deriva exclusivamente de `users/{uid}.presentationCompletedAt`.
- `POST` aceita somente `{ completed: true }`, até 128 bytes, com JSON, mesma origem e `X-Presentation-Uid` igual ao UID verificado. Não aceita UID ou privilégios no corpo.
- Uma transação atualiza somente `presentationCompletedAt` com timestamp ISO do servidor se ainda não houver conclusão. Repetições não substituem o timestamp. Perfil inexistente não é criado pela apresentação.
- Todas as respostas, inclusive erros, usam `Cache-Control: private, no-store`. Node e região `iad1`, como as APIs atuais.
- Nenhuma alteração nos contratos/serviço de workspace, autorização, reservas, snapshots, atividades ou progresso anônimo. O campo é próprio e as regras atuais já impedem atualização direta desse campo pelo aluno.

A conclusão é consultada no servidor em cada montagem do painel. Assim, a próxima entrada em outro navegador/dispositivo não repete os passos após o salvamento confirmado. Contas antigas sem o campo também verão a apresentação uma vez. Abas que já tenham a apresentação aberta não são fechadas remotamente quando outra aba a conclui; um novo envio é idempotente.

O botão **Rever apresentação** fica sob o cartão da jornada. A revisão não grava nada e mantém o painel montado, oculto, preservando rascunhos. Ao fechar, restaura foco e posição de rolagem. A conclusão inicial monta o painel e encaminha o foco ao título. Durante consulta/envio há feedback; falha de gravação mantém os passos abertos e permite tentar novamente. Sessão expirada ou UID divergente pede nova entrada.

## Acessibilidade

Controles nativos com foco visível, títulos focáveis a cada passo, indicação textual da etapa, `aria-current="step"` na navegação e mensagens de erro com `role="alert"`. O passo volta ao topo ao trocar. Movimento reduzido do sistema e a preferência existente do painel desativam animações. A página rola naturalmente em janelas pequenas, sem cortar conteúdo para caber na altura. Quadros decorativos não duplicam a leitura do conteúdo.

## Arquivos

- `src/features/onboarding/PresentationGate.tsx`: consulta, conclusão, falhas, revisão e preservação do painel.
- `src/features/onboarding/Presentation.tsx`, `content.ts`, `presentation.css`: passos, navegação e composição visual.
- `src/server/presentation/service.ts` e `src/app/api/student/presentation/route.ts`: persistência exclusiva da conta.
- `src/features/dashboard/Dashboard.tsx`: gate e atalho de revisão.
- `src/features/landing/MoreInformation.tsx`: informação pública alinhada à aprovação, estudo e benefício.
- `tests/student-presentation-*.test.ts`: proteção de API, persistência e conteúdo inicial. Os testes existentes de dashboard/navegação mockam somente o gate para continuar cobrindo o painel após a conclusão.

## Validação e limites

45 testes passaram em oito arquivos direcionados: apresentação, painel do aluno, próximo passo, entrada/cadastro da landing, percurso de estudo e navegação da conversa. Lint direcionado sem avisos e TypeScript (`--noEmit --incremental false`) aprovados. Provedores Firebase são simulados; nenhuma conta real, reserva, progresso, mídia ou credencial foi alterada. Nenhum build, restart do servidor compartilhado, commit, push ou deploy foi executado por este chat.

Não houve QA visual nesta rodada do chat Apresentação. A conferência interativa de layout em 320×568, 390×844 e desktop, teclado e gravação real em conta temporária será feita pelo chat principal na validação conjunta. Não apresentar testes estáticos como evidência dessa conferência.

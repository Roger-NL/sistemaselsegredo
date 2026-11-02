# Entrega consolidada — 02/11/2026

Esta entrega reúne as correções cafe-v8 aprovadas na auditoria de 28/10, preservando o replay com cenas e áudios e os controles exclusivos do desenvolvimento local. Os quatro documentos históricos de auditoria e validação permanecem como registro da aprovação anterior; suas observações corrigidas não são pendências reabertas.

## O que foi consolidado

- Coerência dos caminhos da conversa: a resposta negativa sobre o café não produz depois uma declaração inventada de que o aluno gostou dele. Identificação dos copos, alternativas de compreensão e feedback acompanham a situação apresentada.
- Escrita com alternativas contextuais delimitadas e normalização que não apaga pontuação inserida dentro das palavras. Ajuda e repertório são voluntários e contam como apoio; rascunhos são preservados.
- Migração de tentativas v2–v7 para cafe-v8 preservando diário, falas efetivamente enviadas, evidências e apresentação histórica. A conversa antiga não é reescrita pelo conteúdo novo.
- As mesmas 24 práticas, com explicações revistas, exemplos precisos e referências explícitas aos áudios existentes. Exemplos que usam gravações completas ou dois trechos separados são identificados como tal.
- Retirada da estimativa de duração não medida. Apresentação atual: “Sem microfone”. Retrospectiva funciona também para visitantes, sem prometer conta ou sincronização inexistente.
- Acesso aos controles locais pelo Menu, com indicador “Teste”, substituindo o controle flutuante que encobria ações no celular. Simulação isolada por aba; progresso normal e conta preservados; rota bloqueada em produção.
- Na escrita em telas estreitas, imagem pode diminuir até 96 px quando necessário. Ações ficam preservadas; conteúdo expandido pode rolar dentro do formulário. Removido o indicador flutuante de desenvolvimento do Next.
- Diretórios de artefatos e worktrees temporários excluídos das varreduras de lint/TypeScript e do envio à Vercel, sem excluir os testes oficiais.

## Verificações efetivamente realizadas

### Automação e compilação

- `npm test`: **508 testes em 69 arquivos**, aprovados.
- `npm run lint`, `npx tsc --noEmit`, `npm run build` e `git diff --check`: aprovados.
- Cobertura de modelo: 128 caminhos narrativos × três apoios × com/sem modelo = **768 execuções**. Isso é cobertura automatizada, não 768 percursos manuais no navegador.
- Fixtures históricas v7, retomada, aceitação pelo validador do servidor, replay das falas antigas e conclusão via controles locais verificados. Os testes novos não alteram as tentativas originais.
- Depois da conferência do painel local, os nove testes selecionados de isolamento, progresso e consolidação também passaram.

### Navegador local

- Nos três níveis, verificadas cenas selecionadas de compreensão e resposta, orientação em português, modelo por escuta, atividade correspondente ao apoio e reação de Lucas após envio. Escrita incorreta mantém o rascunho; alternativa aceita avança; peças incorretas retornam na montagem guiada.
- Retomada após recarregar preservou rascunho. Replay mostrou a alternativa realmente registrada, com imagem e modelo de áudio, e permitiu retornar ao resumo e ao estudo.
- **Todas as 24 práticas** foram percorridas: tentativa incorreta, tentativa correta, repetição com modelo voluntário e avanço. Conclusão mostrou 24/24 com apoio, sem esconder como foram realizadas. Foram registrados 97 estados de verificação.
- Estudo em 390×844; prática densa de posse também em 320×568 e 1440×900. Sem transbordamento horizontal ou botões cortados pelos contêineres. O estudo permite rolagem normal da página.
- Escrita em 320×568: altura do documento igual à janela, imagem preservada e ações completas. Em 320×480, formulário expandido manteve imagem de 96 px e botões utilizáveis. Essa última dimensão simula pouco espaço; não é teste de teclado físico.
- Dois players reais acionados em sequência: o primeiro pausou antes do fim quando o segundo começou.
- Controles locais: reset total, avanço de parte, salto à parte 7, abertura da cena correspondente, conclusão da demo e das 24 práticas. Acesso pelo Menu confirmado.

### Mídia

- Os 50 identificadores/frases em inglês e os 24 arquivos WebP das 12 imagens aprovadas são idênticos à versão anterior.
- Os **46 MP3s únicos** foram baixados do cache e decodificados novamente. Hashes e tamanhos coincidem com a verificação anterior; ledger preservado, zero leituras de metadados durante resolução de reprodução e zero novas tentativas no provedor.
- Nenhuma imagem, frase ou gravação foi gerada. Essa conferência técnica não substitui escuta humana editorial.

### Conta, aula e ADM

- Sessão já existente consultada em leitura: painel do aluno, agenda administrativa e mensagens carregaram. Nenhum cadastro, reserva, confirmação, cancelamento ou mensagem foi criado.
- Testes dos serviços cobrem elegibilidade com 24 práticas válidas, bloqueio com 23, estados de conta, sincronização/importação, propriedade dos dados, idempotência de reservas e permissões administrativas. Isso não equivale a uma nova reserva real nem comprova entrega de e-mail.
- Antes da publicação, o domínio servia a versão anterior e uma tentativa existente não podia ser retomada. A conferência após publicação deve confirmar a migração na mesma sessão, sem reset.

## Publicação e rastreabilidade

Destino autorizado: repositório `Roger-NL/sistemaselsegredo`, branch atual `master`, projeto Vercel `novoessite`, domínio **https://www.basedspeak.com**. O localhost é servido pelo mesmo checkout em **http://127.0.0.1:3000**.

O commit publicado, deployment efetivo, respostas HTTP e resultado da retomada serão registrados ao concluir a publicação em `output/release-2026-11-02/publication.json`. Evidências de navegador e mídia estão no mesmo diretório local, ignorado pelo Git. Este documento não deve ser interpretado como prova de publicação sem esse registro final.

## Limites para primeiros participantes

1. **Roger precisa confirmar horários reais do professor.** A agenda implementada oferece uma faixa ampla de horários; ela não representa disponibilidade humana confirmada.
2. **Aprovação auditiva humana dos 46 arquivos permanece pendente.** Integridade, cache e decodificação passaram; naturalidade e adequação pedagógica precisam da escuta humana.

Não houve convite a participantes, envio de mensagens/e-mails nem nova reserva real. O fluxo operacional de uma nova solicitação até confirmação e recebimento deve ser validado quando houver agenda real definida. Também não foram medidos duração de aprendizagem, resultados pedagógicos nem comportamento em aparelho físico com teclado aberto.

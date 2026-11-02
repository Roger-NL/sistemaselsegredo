# Correções — instruções de implementação e aceite

Você é o executor responsável pelas correções editoriais, pedagógicas e funcionais do conteúdo BasedSpeak. O usuário solicitou uma nova conversa chamada **Correções**, a implementação de todas as recomendações da auditoria, inclusive as de baixa prioridade, e revisão independente pela conversa líder. Faça o trabalho; não pare numa proposta. A conversa líder vai ler o diff, executar verificações e devolver qualquer pendência para retrabalho. Sua primeira entrega é **pronta para auditoria**, não aprovação independente do próprio trabalho.

Trabalhe em `/Users/rogera/Documents/projetos/ES`, no checkout local atual. Leia `AGENTS.md`, o estado Git e as instruções aplicáveis antes de editar. Preserve mudanças de outras conversas. Não crie worktree, não faça commit, push ou deploy. Não gere áudios ou imagens, não altere credenciais nem serviços remotos. Use os arquivos e recursos já existentes. Não lance agentes adicionais: há um executor nesta conversa e um auditor na conversa líder.

Leia integralmente `docs/VALIDACAO-CONTEUDO-2026-10-28.md`, incluindo os anexos de 68 nós, 25 atividades de resposta, 24 práticas, 50 falas e 12 imagens. Consulte `output/content-audit-2026-10-28/evidencias.json`, `matriz-384-percursos.csv`, `fontes-sha256.json` e `ilustracoes.png`. O relatório é uma avaliação do estado anterior, não uma regra a cumprir cegamente: confirme cada achado no código atual. Se uma observação não se sustentar, traga a prova ao auditor; não modifique conteúdo correto apenas para satisfazer uma descrição equivocada.

OBJETIVO: resolver todos os itens F01–F13 e as limitações materiais indicadas nas tabelas, para que história, variantes de apoio e práticas atinjam pelo menos **bom** no escopo editorial/funcional. Não basta editar notas, enfraquecer testes, adicionar avisos genéricos ou chamar pendências de resolvidas. Não expanda a demo para um curso novo. Preserve o tom adulto, breve e acolhedor, a intenção comunicativa, os três apoios, os finais sem hierarquia e as 24 práticas com IDs estáveis, salvo necessidade real demonstrada e compatibilidade resolvida.

ORÇAMENTO COMPARTILHADO: o marcador no começo da auditoria era 8% e continua em 8% na preparação desta conversa. O usuário limitou o trabalho a dez pontos percentuais adicionais da capacidade total. Trate 18% como teto conservador para implementação + auditoria + retrabalho, sem alegar que o marcador fornece atribuição exata por tarefa. Consulte `get_usage_limits` antes de começar e em marcos. Ao chegar perto de 16%, reduza expansão e entregue o estado concreto para a revisão do líder; não ultrapasse o teto, não use reset e não compre créditos. Não inicie geração paga, chamadas de avaliação por LLM ou pesquisas redundantes. Use raciocínio cuidadoso e verificações locais focadas.

F01 — PRESERVAR PREFERÊNCIA EM TODOS OS CAMINHOS

- Confirme o caso `p8.topic=job → p9.cafe-opinion=not → p9.pause=stay`: atualmente leva `Not really` sobre a cafeteria a `I like it here` obrigatório. Foram encontrados 16/128 caminhos, nos três apoios.
- Faça a continuação respeitar a opinião. Solução preferida sem mídia nova: quem declarou não gostar muito pode permanecer e seguir de `It's quiet here` ao encerramento sem ser obrigado a afirmar gostar daqui. Quem expressou gosto ou não negou isso pode fazer a adaptação de `here`.
- Não impeça o aluno de escolher ficar só por não gostar do local. Não invente mudança de opinião nem faça a pessoa dizer outra preferência sem escolha.
- Trate roteamento, cartões, evidências, transcrição, retrospectiva, Voltar, retomada e replay. Não registre como enviada uma resposta pulada. A transformação para `U17` só pode ser destacada se ocorreu.
- Cuide de versão e snapshots anteriores: não apague progresso silenciosamente nem reescreva falas realmente registradas. Migração precisa ser determinística e honesta; incompatibilidade só quando necessária, preservando o original. Não reexecute histórico com regras novas que fabriquem ou removam envios.

F02 — ESCRITA, VARIANTES E EXPECTATIVA DA TAREFA

- O modo Mais autônomo pede intenção ampla, mas só aceita a formulação canônica. Resolva a incompatibilidade antes da tentativa, em todos os 25 nós de resposta.
- Prefira um repertório curado por intenção para alternativas claras, junto de instruções precisas. Verifique pelo menos `No, not mine.`, `Sure!` ao aceitar e `Goodbye!` na despedida. Não aceite respostas de polaridade oposta, de outro referente ou outro tempo sem justificativa. Não implemente avaliação semântica por API.
- Onde se pratica uma expressão específica, diga isso claramente e explique a diferença entre uma formulação fora do repertório e inglês incorreto. Não reduza todo o modo autônomo a copiar uma resposta já mostrada.
- Preserve caixa, espaços, apóstrofos e contrações equivalentes adequadas, o rascunho rejeitado e a grafia realmente aceita. Áudio de modelo continua canônico e deve ser rotulado como modelo; nunca envie a escrita livre ao TTS.
- Na teoria, preserve a restrição legítima de lacunas que pedem só uma palavra. Não aceite frase inteira ou sinônimo indiscriminado só para aumentar taxa de acerto.

F03 — CONTINUIDADE DOS CAFÉS E IDENTIFICAÇÃO VISUAL

- V01 já mostra os dois cafés. Elimine a chegada posterior contraditória nas cópias efetivamente renderizadas, nos botões e nos contextos. Prefira conferência/identificação dos cafés já presentes.
- A arte escreve `LUCAS` e `BASEDSPEAK`. Padronize as referências ao nome no copo nas pistas, instruções, apresentação, texto móvel e alt text; não finja que a arte escreve apenas `based`.
- Reforce a referência de `This is mine` onde necessário: Lucas identifica o próprio copo. O ramo B não pode depender apenas de um contexto interno que a UI não exibe. Não gere novas imagens nem altere identidade visual aprovada.

F04 — ESQUELETOS COERENTES

- Remova `Really? ___` e `Bye! ___` onde a resposta completa já precede a lacuna. A lacuna deve representar algo realmente ausente, ou não aparecer.
- Confira as demais estruturas dos três apoios. `Careful!` usa envio apoiado; não crie um problema visível ao tentar corrigir um fallback que não aparecia.

F05 — ÁUDIO EXISTENTE NA TEORIA

- Substitua a dependência exclusiva de igualdade da frase por referências explícitas e tipadas a IDs de áudio da história.
- Corrija `iced-coffee`, `sorry-okay`, `careful-close`, `work-job` e `break-quiet`. Para trechos, rotule que se ouve a fala completa existente; para duas falas, permita ouvir cada uma de modo claro, sem apresentar uma gravação como se dissesse só o trecho.
- O exemplo novo `can-sit` não tem gravação da história; não finja que tem, nem gere uma.
- Use apenas URLs já publicadas, sem chamada a síntese, sem preload geral e sem regressão dos 50 IDs/46 arquivos existentes. Confirme o comportamento do player e a não sobreposição indesejada.

F06 — EXCESSO NA TRADUÇÃO

- Padronize `Too much work` como trabalho demais/em excesso em inventário, glossário, explicações e ajudas pertinentes. Preserve o inglês original dos áudios para não invalidar suas chaves.

F07 — MODELO ELÍPTICO NA RESPOSTA AO PEDIDO

- `Me too` após `An iced coffee. And you?` é uma elipse compreensível, não um erro gramatical inequívoco. Torne a relação explícita para o iniciante.
- Resolva sem nova gravação: a intenção/cartão/pista pode esclarecer que Lucas pediu um café com gelo e que o aluno pediu o mesmo, de modo que “Eu também” retoma “também pedi isso”. Essa explicação precisa aparecer no percurso efetivo, sem entregar compulsoriamente a resposta escrita ao apoio autônomo.
- Não troque o texto associado ao MP3 de `Me too` por outra frase e não retire agência dos ramos. As oportunidades de transferência podem diferir, mas a teoria deve cobrir ambos os casos sem afirmar que todos ocorreram na conversa individual.

F08 — `THIS` E REFERENTE

- Corrija `this → o café` como se fosse tradução lexical. Explique brevemente que `this` aponta para este objeto e, na cena, se refere ao copo/café indicado. Preserve o desafio de compreensão; não revele a resposta antes da tentativa sem escolha do aluno.

F09 — DUAS FORMULAÇÕES DA TEORIA

- Em `like-it`, trocar “sem repetir seu nome” por referência inequívoca ao nome da bebida/objeto.
- Em `like-here`, `I like English` significa gostar do idioma; não atribua obrigatoriamente gostar de estudar à frase isolada. Mantenha a contextualização de aprendizado quando ela vier do roteiro.

F10 — NORMALIZAÇÃO E ORTOGRAFIA

- Pare de aceitar `n.o.t`, `s,u,r,e` e `t.o` como palavras normais por remoção indiscriminada de pontuação interna.
- Preserve tolerância razoável a caixa, espaços, NFC, apóstrofos e contrações equivalentes. Defina e teste a política de pontuação de borda/separação; não quebre contrações nem torne uma tarefa simples desnecessariamente rígida.
- Confira normalizadores da história e teoria e seus consumidores de glossário/identificação de frases. Não unifique regras de resposta que têm objetivos diferentes sem necessidade.

F11 — CONTATO: TEXTO INTERNO PRECISO

- Troque “Vocês combinam como manter contato” por “Lucas aceita manter contato” ou equivalente, pois só ocorre `Sure!`.
- O contexto antigo não aparece na apresentação atual. Corrija a fonte sem alegar que se observou uma mensagem logística visível. Não crie formulário ou coleta de dados pessoais.

F12 — PASSAGEM DE TEMPO EFETIVA

- Quem escolhe ficar precisa de transição narrativa coerente antes da despedida. “Depois de mais alguns minutos” deve estar num cartão renderizado e condicionado a essa escolha, em vez de num cabeçalho suprimido por `sequenced`.
- Quem escolhe sair não deve receber a mesma passagem de permanência. Não introduza espera real, relógio ou etapas vazias.

F13 — MELHORAR PRÁTICAS E COBERTURA DOS OBJETIVOS

- Reavalie as 24 práticas e corrija todas as oito classificadas como suficientes: `mine-your`, `iced-coffee`, `sorry-okay`, `like-it`, `learning`, `work-job`, `yeah-sure`, `have-go`.
- Faça a tarefa verificar a dificuldade relevante, não só rearranjar três palavras com maiúscula e ponto. Use contexto e alternativas próximas, com uma resposta justificável; não dificuldade artificial.
- Cubra de forma prática `my/mine` e `your/yours`; artigo por som em `a/an`; `did + order` versus `ordered`; `like` sem `am`/preposição copiada do português; estado `tired` versus atividade `learning`; `work/job` e quantidade grande versus excesso; aceitação real de convite; possibilidade versus necessidade em `can/have to`.
- `did-order` era bom, mas sua atividade não verificava diretamente `order/ordered`; inclua esse contraste de maneira leve. Faça o mesmo com os demais objetivos não verificados apontados nas tabelas, mantendo 24 passos, IDs estáveis, variedade e carga confortável.
- Melhore também a compreensão inicial `p2.question` (suficiente pela escolha binária/pistas fortes), a clareza referencial de `p4.new-cup` e `p4.arrival-b`, e a transferência em `p4.same`. Não transforme o Guiado numa prova ou faça todas as atividades virarem múltipla escolha.
- Cada alternativa errada deve ter feedback útil e respeitoso. Não ensine uma regra falsa para justificar um distrator. Exemplos novos devem ser identificados; não afirme que o aluno viveu ramos ausentes.

OBSERVAÇÕES TRANSVERSAIS A RESOLVER COM HONESTIDADE

- `supported` mede consulta ao modelo naquela condição de tentativa; não todo apoio, independência ou retenção. Preserve essa semântica ou renomeie/explicite consumidores que possam insinuar algo maior. Não transforme conclusão em certificação. Reveja as mensagens de painel, retrospectiva e aula para manter essa distinção.
- Corrija qualquer promessa textual de duração garantida ou aprendizagem demonstrada que não tenha medição; prefira “no seu ritmo” quando a estimativa não foi validada. Não invente tempos nem teste com participantes fictícios.
- A teoria contém passos densos: mantenha uma ideia principal por tela e aprofundamento opcional; redistribua explicações dentro dos oito blocos se necessário sem esconder instrução indispensável.
- Inspecione as ilustrações de 640 e 960 px e a interface nas larguras relevantes. Não confunda integridade de arquivo com leitura de nome no celular.
- A auditoria anterior não ouviu os MP3s, não mediu retenção e não usou alunos reais. Nenhum teste local pode eliminar essas limitações empíricas. Se não houver recurso para uma escuta real, registre separadamente esse limite; não marque como “pronúncia aprovada”. Isso não autoriza deixar defeitos implementáveis sem correção.

VERIFICAÇÃO E CRITÉRIOS DE ENTREGA

1. Crie um registro rastreável em `docs/CORRECOES-CONTEUDO-2026-10-28.md`, com F01–F13 e os itens transversais: causa, implementação, arquivos, evidência, resultado e limitações reais. Preserve o parecer original como histórico; não mude suas notas retroativamente.
2. Implemente os ajustes com alterações focadas. Registre e explique qualquer mudança de story/schema version ou formato de progresso e como lida com snapshots anteriores.
3. Adicione testes significativos para as causas corrigidas, especialmente a preferência no caminho completo, aceitação/rejeição contextual da escrita, pontuação interna, áudio vinculado a trechos, esqueletos, cartões condicionais e práticas diagnósticas. Não escreva testes que apenas reproduzam os dados ou substitua expectativas para esconder regressões.
4. Reenumere todos os caminhos válidos e execute cada um nos três apoios com eventos atuais. Reconfira normal/com apoio, Voltar, mudança de ramo, retomada e retrospectiva. Se o total mudar, explique a razão legítima e comprove que nenhuma escolha foi perdida; não force o número 128 removendo alternativas.
5. Confira erro/acerto/modelo nas 24 práticas, variantes de texto, renderização das peças, feedback e conclusão; conclua e retome o estudo sem falsificar evidências. Proteja a liberação de aula e os dados já salvos.
6. Faça conferência visual real em navegador quando disponível: pelo menos 320 px, ~390 px e desktop, cobrindo as mudanças. Use conectores/UI autorizados, sem contornar restrições. Declare exatamente o que foi visto e o que foi apenas teste estático.
7. Rode os testes apropriados, lint, TypeScript e build de produção. Comece pelos testes afetados e depois faça uma rodada integrada; repita somente o necessário após falhas/novas mudanças.
8. Não chame serviços de pagamento, calendário, Firebase de produção nem geração de voz para testar correção editorial. O áudio precisa continuar reutilizando os arquivos publicados; qualquer impedimento de ambiente deve ser descrito de forma concreta, sem “aprovado” inventado.
9. Entregue tabela de todos os itens com evidências e nenhum “depois” silencioso, resumo do diff, comandos/resultados, cenários visuais conferidos, alterações de compatibilidade e consumo observado. Separe defeitos corrigidos de limites de validação empírica.
10. Ao concluir, deixe tudo pronto para o líder auditar e finalize esta rodada. Não declare aceite pelo usuário nem se dê nota final. A conversa líder fará revisão independente e poderá enviar pedidos de retrabalho; trate cada pedido como continuação até que todos os defeitos implementáveis estejam resolvidos e o material alcance bom.

Comece a implementação agora. Faça escolhas rotineiras com julgamento técnico, sem parar para pedir aprovação de cada texto. Se algo exigir nova mídia paga, mudança destrutiva ou extrapolar o orçamento, entregue uma alternativa concreta dentro do escopo ou descreva o impedimento ao líder. Não se limite a repetir este prompt.

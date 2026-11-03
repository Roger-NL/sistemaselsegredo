# Estudo guiado: ensinar com clareza

Atualização de 3 de novembro de 2026. O percurso explica o inglês da conversa com frases, exemplos e um porquê curto. A prática entra em pontos escolhidos para experimentar uma diferença importante.

## Estrutura pedagógica

As 24 etapas apresentam a frase e o sentido, uma explicação causal visível e contrastes curtos quando ajudam a entender. O aprofundamento fica em “Mais detalhes”. Abrir uma explicação ou ouvir um áudio não registra conclusão.

- **16 etapas de explicação:** a pessoa lê, compara e escolhe “Entendi, continuar”.
- **8 etapas com prática:** a explicação vem primeiro; “Praticar” abre uma tarefa ligada à diferença ensinada.

| Prática | Forma | Por que praticar aqui |
| --- | --- | --- |
| `mine-your` | Escrever nas frases | Distinguir my/your com nome de mine/yours sem repetir o nome. |
| `did-order` | Ordenar palavras | Usar did e manter order na forma básica. |
| `careful-close` | Escolher pela situação | Avisar durante o risco ou comentar depois dele. |
| `do-you-like` | Ordenar palavras | Perceber a ordem da pergunta com do. |
| `im-tired` | Escrever na frase | Ligar quem fala ao estado com I am/I'm. |
| `can-sit` | Ordenar palavras | Fazer um pedido de permissão com can antes de I. |
| `have-go` | Escolher pela situação | Distinguir necessidade de possibilidade. |
| `you-too-bye` | Escrever na frase | Retribuir a gentileza com you too no contexto adequado. |

São três montagens com arraste, duas escolhas e três escritas. As demais etapas seguem como ensino guiado. O porquê reaparece brevemente depois da resposta; pistas, explicação completa e modelo continuam disponíveis sob demanda.

## Interface

O estudo usa uma superfície lisa, bordas finas, cantos arredondados e um botão principal por estado. A prática mostra a intenção, um comando de arraste junto das peças e um destino único. As peças escolhidas saem do banco. O contador da montagem é curto; anúncios mais completos ficam disponíveis para tecnologia assistiva.

Arrastar, tocar e usar teclado têm resultados equivalentes. O foco acompanha a peça movida por teclado. Cancelar ou soltar fora mantém a resposta. O gesto não avalia o inglês: a conferência acontece no botão explícito.

## Progresso e compatibilidade

Os 24 IDs, o formato do progresso, as respostas aceitas e os áudios publicados permanecem compatíveis. O contador agora descreve **etapas concluídas**. A confirmação de leitura grava a etapa e a próxima posição numa única alteração; se o salvamento for recusado, a tela não avança. Uma etapa prática depende de resposta correta ou consulta explícita ao modelo. O uso de modelo permanece identificado; o avanço ADM salva só a posição.

A conclusão representa o percurso realizado, não uma avaliação de nível. As correções anteriores de menu, retorno ao estudo salvo, sessão válida e sons permanecem no projeto.

## Base consultada

- [Nielsen Norman Group — Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/): apresentar o essencial e deixar apoio adicional disponível sob demanda.
- [Agarwal, Roediger, McDaniel e McDermott — Retrieval Practice Guide, 2020](https://pdf.retrievalpractice.org/RetrievalPracticeGuide.pdf): combinar tentativa de recuperação com feedback. A quantidade e a localização das oito práticas são decisões pedagógicas deste percurso.
- [W3C — Understanding 2.5.7 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html): oferecer uma alternativa equivalente ao arraste.

A distribuição entre explicações e práticas atende ao conteúdo e ao pedido do usuário. A interface deve ser observada em uso para avaliar compreensão e fluidez; o gesto de arrastar, por si só, não demonstra aprendizagem.

## Verificação desta versão

- 611 testes em 80 arquivos, lint e compilação de produção aprovados.
- Regressões cobrem as 16 explicações sem formulário, o porquê visível, as oito práticas, confirmação explícita de leitura, gravação atômica, recusa de salvamento e preservação do histórico de consulta ao modelo.
- No navegador local: leitura → confirmação → próxima explicação → prática pontual; erro e correção com o porquê visível no resultado. Arraste, toque, cancelamento, escrita nas frases e teclado mantêm cobertura automatizada.
- Leitura conferida em 320 × 740 e 390 × 844; desktop em 1280 × 900, com largura de documento igual à viewport. Áudios continuam publicados, sob demanda e sem geração.
- Capturas locais em `output/ux-study-refinement-2026-11-03/`: `teoria-mobile.png`, `teoria-320.png` e `teoria-desktop.png`. O diretório de evidências é ignorado pelo Git.

As verificações não substituem observação com alunos ou teste no aparelho físico.

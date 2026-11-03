# Estudo guiado: intenção, percurso e interação

Pedido de 3 de novembro de 2026: preservar o visual e a estrutura atuais, tornar o próximo movimento evidente e acrescentar arraste com propósito, mantendo escrita em parte das atividades.

## O que orientou a mudança

- **Uma ação principal por vez.** A divulgação progressiva apresenta primeiro as ações essenciais e deixa detalhes para consulta. Aplicação: manter o cartão e explicitar o percurso “Entenda → Monte/Responda/Escreva → Confira”, com a etapa atual marcada. [Nielsen Norman Group, Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/).
- **Tentativa seguida de explicação.** O guia dos pesquisadores Agarwal, Roediger, McDaniel e McDermott recomenda recuperar o conteúdo da memória e receber feedback. Aplicação: a pessoa monta, escolhe ou escreve antes de conferir; pistas e modelos continuam disponíveis; a explicação apresenta o motivo da resposta. A escrita permanece para exigir produção além do reconhecimento. [How to Use Retrieval Practice to Improve Learning, 2020](https://pdf.retrievalpractice.org/RetrievalPracticeGuide.pdf).
- **Arraste com alternativa equivalente.** A WCAG 2.2 exige que uma função de arrastar também possa ser realizada por um ponteiro sem arraste, além dos requisitos de teclado. Aplicação: arrastar, tocar ou usar teclado produzem a mesma resposta; cancelar um gesto mantém a tentativa. [W3C, Understanding 2.5.7 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html).

Essas fontes sustentam os critérios de aprendizagem e usabilidade. A escolha de 12 atividades com arraste é uma decisão de produto para este conteúdo; o gesto sozinho não demonstra ganho de aprendizagem. A avaliação posterior deve observar compreensão, conclusão e dificuldades no telemóvel.

## Aplicação no percurso existente

| Atividade | Quantidade | Intenção |
| --- | ---: | --- |
| Arrastar palavras para montar uma fala | 7 | Perceber ordem e selecionar formas como `order` depois de `did`. |
| Arrastar uma resposta para a fala em contexto | 5 | Decidir o que dizer diante de uma desculpa, gosto compartilhado, risco, necessidade de sair ou pausa. |
| Escolher pelo sentido | 6 | Distinguir intenções e significados, incluindo alternativas longas. |
| Escrever | 6 | Recuperar palavras e expressões; quatro atividades têm lacunas dentro da frase. |

As sete montagens são `did-order`, `like-it`, `do-you-like`, `learning`, `can-sit`, `stay-longer` e `keep-touch`. As cinco respostas em contexto são `really-too`, `sorry-okay`, `careful-close`, `have-go` e `break-quiet`.

Cada um dos 24 passos apresenta uma meta curta ligada à conversa. O destino de uma peça e o próximo espaço ficam visíveis; o contador indica o que falta montar. Depois de conferir, a pessoa vê a explicação e o título do próximo passo. A conclusão continua dependendo de uma resposta correta ou consulta explícita ao modelo. Avanço administrativo registra somente a posição.

O arraste usa Pointer Events para rato e toque. Apenas as peças capturam o gesto; a página mantém sua rolagem. Soltar fora, cancelar o ponteiro ou pressionar Escape cancela a movimentação. Os sons de movimentação e de resultado têm funções distintas e podem ser silenciados.

Os IDs, as 24 práticas, as respostas aceitas, as referências dos áudios da história e o formato do progresso permanecem compatíveis. As correções anteriores de navegação, entrada com sessão válida, pistas, lacunas e menu acompanham esta mudança.

## Verificação local

- 603 testes aprovados em 80 arquivos; ESLint e compilação de produção aprovados.
- Navegador em 390 × 844: arraste real de palavra para a frase e de resposta para a conversa, complemento por toque, conferência, erro por lacuna e correção com as demais respostas mantidas.
- Navegação conversa → retorno direto ao passo salvo; menu Voltar e confirmação de Recomeçar verificados na sessão local isolada.
- Testes cobrem cancelamento do gesto, reordenação, devolução ao banco, teclado, bloqueio após conferência, silenciamento e avanço ADM sem conclusão fictícia.
- Evidência visual: [resposta arrastada no telemóvel](../output/ux-guided-2026-11-03/resposta-arrastada-mobile.png).

A validação usa ambiente local e testes automatizados. A audição no aparelho físico e o comportamento de uma sessão real no Chrome móvel ainda devem ser conferidos após a publicação. Estas alterações ainda não foram publicadas.

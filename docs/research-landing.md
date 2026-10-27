# Pesquisa para a landing page BasedSpeak

> Decisão posterior à pesquisa, apresentada por Roger em 27/10: landing de **uma única tela, sem rolagem e sem imagens da demo**, com visual ousado/experimental. “Dê uma espiada” abre as informações por clique; cadastro e login são as ações principais. As referências continuam válidas como pesquisa; a proposta inicial com imagem da cafeteria e seções não foi adotada na versão final.

Consulta: **27 de outubro de 2026**. Escopo: páginas oficiais de produtos de IA e de aprendizagem, anúncios primários de investimento e recomendações técnicas oficiais. As páginas de produto sem data representam o conteúdo acessível nesta consulta; não constituem um arquivo histórico. Valores são anúncios datados, em dólares americanos, e não estimativas de valor atual. Não foram usados dados futuros.

## 1. Decisão editorial

A landing deve responder em uma tela: **o que vou praticar, como funciona e qual é o próximo passo**. A prova central é a própria conversa da cafeteria. O objetivo de conversão pedido é **landing → cadastro → demo → curso**; a landing não precisa antecipar o currículo inteiro nem apresentar todas as integrações.

Recomendação de mensagem: **“Seu inglês começa numa conversa.”** Apoio: “Entre na cafeteria, entenda Lucas e construa sua resposta — com o apoio que fizer sentido para você.” A ação principal pode ser **“Criar conta e experimentar”** se levar realmente ao cadastro, ou **“Começar a demo”** com a indicação explícita de que haverá cadastro. Evitar chamar de entrada imediata se houver uma etapa intermediária.

Isso é uma hipótese de design informada pelas referências, **não uma conclusão estatística sobre conversão**. Nenhuma fonte pública examinada permite afirmar que copiar um visual ou CTA aumentará a conversão de BasedSpeak em determinada porcentagem.

## 2. O que existe no produto

Evidência local: `README.md`, `src/features/demo/content/copy.pt-BR.ts`, `src/features/demo/content/parts/part-01.ts`, `part-02.ts` e documentação em `docs/plano-nova-demo/`.

- A demo é uma história de cafeteria com Lucas, dez partes, escolhas narrativas, compreensão e construção/escrita de respostas.
- Três formas de apoio: Guiado, Com pistas e Mais autônomo. São apoios escolhidos pela pessoa; não equivalem a um diagnóstico de nível certificado.
- A pessoa pode ouvir as falas e usar ajuda voluntária; a resposta enviada desencadeia a reação de Lucas.
- Há retrospectiva do percurso realizado e retomada no mesmo navegador.
- Atualmente a demo é pública; cadastro/login foram aposentados como telas. A nova instrução do usuário pede um novo fluxo com cadastro.
- Não existe curso novo ativo ou oferta comercial validada nesta base. As integrações de auth, pagamentos e agenda preservadas não são prova de entrega curricular.
- A demo não utiliza microfone nem avaliação aberta de pronúncia. O roteiro é fechado; não deve ser vendido como conversa ilimitada com um tutor generativo.
- A duração com participantes não foi validada. Não escrever “3 minutos”, “fluente em X dias” ou resultado garantido.

**Consequência:** o texto pode mostrar aprendizagem por situação, escuta, resposta e apoio. Deve aguardar definição comercial para preço, carga horária, professor, certificado, garantia, prazo de acesso e disponibilidade do curso.

## 3. Referências de produto e padrões observáveis

### Grok / xAI

**Fato observado:** a entrada de [Grok](https://grok.com/) reduz a superfície a uma pergunta curta, uma caixa de mensagem e entrada/cadastro. A [página de preços oficial](https://x.ai/pricing) apresenta começar gratuitamente e depois expandir o uso. Consulta em 27/10/2026; páginas sem data editorial.

**Aplicação inferida:** usar uma situação concreta em vez de um manifesto. O visitante deve entender a ação pela interface. A prévia da cafeteria pode ser tão direta quanto uma pergunta de Lucas e uma resposta montável. Não precisamos importar a estética escura ou a complexidade de modelos/planos.

### OpenAI / ChatGPT

**Fato observado:** a [página de apresentação](https://chatgpt.com/overview/) combina uma proposta curta, ação de experimentar e demonstrações visuais de resultados concretos. O [anúncio de Study Mode](https://openai.com/index/chatgpt-study-mode/), de 29/07/2025, explica aprendizagem ativa por perguntas, etapas e verificações de conhecimento.

**Aplicação inferida:** mostrar como a pessoa participa, em vez de apenas dizer “interativo”. No nosso caso, uma fala, a intenção em português, a construção da resposta e a reação subsequente. A referência pedagógica não comprova eficácia de BasedSpeak nem vínculo com OpenAI.

### Lovable

**Fato observado:** a [home oficial](https://lovable.dev/) expõe criação a partir de uma descrição e dá prioridade a começar. O visitante vê possibilidades e exemplos antes de ter de compreender arquitetura. Consulta em 27/10/2026.

**Aplicação inferida:** oferecer um exemplo utilizável, com estado inicial compreensível e uma pequena ação que revele o resultado. No curso, a pessoa não deve precisar interpretar “metodologia”, “pilares”, “órbitas” ou mecanismos de IA antes de experimentar.

### Cursor

**Fato observado:** a [home oficial](https://cursor.com/) usa uma promessa curta, início/download e uma demonstração extensa da interface real. Demonstrações e casos aparecem no corpo da página; as informações corporativas ocupam uma camada posterior. Consulta em 27/10/2026.

**Aplicação inferida:** o quadro real da cafeteria vale mais do que uma ilustração abstrata de tecnologia. Uma prévia editada deve continuar fiel à demo; controles precisam funcionar e estados não podem sugerir recursos inexistentes.

### Replit

**Fato observado:** a [home oficial](https://replit.com/) parte de uma pergunta sobre o que criar, oferece exemplos de entradas e explica o baixo custo de experimentar. Consulta em 27/10/2026.

**Aplicação inferida:** remover a exigência de a pessoa inventar o que fazer. Na prévia, uma instrução simples e uma resposta possível dão início ao entendimento. No cadastro, explicar exatamente o que vem depois reduz a incerteza.

### Granola

**Fato observado:** a [home oficial](https://www.granola.ai/) define um uso específico, demonstra transformação de notas e organiza o valor em antes/durante/depois das reuniões. Consulta em 27/10/2026.

**Aplicação inferida:** estruturar a página pela experiência da pessoa: entender a situação → responder com apoio → perceber o que fez. Antes/depois deve mostrar uma mudança real de interface ou ação; não deve fabricar uma transformação de competência.

### Speak

**Fato observado:** a [home oficial](https://www.speak.com/) apresenta o resultado de comunicação e um ciclo de aprender, praticar e aplicar, ilustrado por situações e produto. Consulta em 27/10/2026.

**Aplicação inferida:** explicar o método em três verbos e mostrar uma conversa reconhecível. Não copiar “fluência” como resultado garantido nem importar alegações de currículo, tutor, evidência ou escala da Speak.

### Praktika

**Fato observado:** a [home oficial](https://praktika.ai/) torna os personagens visíveis, mostra exemplos de conversa e exibe suporte e modos de correção. Consulta em 27/10/2026.

**Aplicação inferida:** Lucas pode servir como âncora humana da primeira experiência. A escolha de apoio pode aparecer como “Começando”, “Com pistas” e “Mais autonomia”, sem criar três funis separados. Evitar simular reconhecimento de voz ou correção de pronúncia presentes em concorrentes e ausentes na demo.

### Toki: identificação e limite da pesquisa

**Fato confirmado:** o calendário/assistente solicitado corresponde a [Toki, em toki.com](https://toki.com/). A página descreve organização de agenda por linguagem natural e mostra pedidos concretos. A [página oficial de AI Scheduling](https://toki.com/features/ai-scheduling), publicada em 24/07/2026, descreve eventos a partir de voz, texto, screenshots e emails. O [changelog](https://toki.com/updates) registra refinamentos de navegação, visualização de calendário e personalização.

**Não confirmado:** não foi encontrada fonte primária que comprove que o produto tenha sido “basicamente criado com IA”. Usar IA no produto e usar IA para desenvolver o produto são afirmações diferentes. Também existem várias empresas homônimas; não misturar o calendário com serviços de software, turismo, fidelidade Shopify ou monitor de agentes chamado Toki.

**Identidade e escala adicionais:** a [página oficial da Orion Arm](https://orionarm.ai/about/) identifica Toki e Syft como seus produtos e confirma a mudança de yestoki.com para toki.com. Um [comunicado da própria Orion Arm no LinkedIn](https://www.linkedin.com/posts/orionarmco_orionarm-tokiai-syftai-activity-7343567342645276672-MOLi) anuncia US$11 milhões captados e avaliação corporativa de US$100 milhões. A data exata não aparece no conteúdo recuperado; por isso não entrou na tabela datada abaixo. O valor é da empresa por trás de Toki e Syft, não receita nem avaliação independente do aplicativo Toki.

**Aplicação inferida:** a linguagem deve parecer uma ação cotidiana. Um pequeno diálogo visual pode explicar o método com menos esforço que um bloco de conceitos. Um sistema caloroso e pessoal funciona melhor para esta demo que ornamentos tecnológicos sem relação com a cafeteria. Os números exibidos por Toki são alegações da própria empresa e não prova emprestável para BasedSpeak.

## 4. Empresas em escala: o que foi realmente anunciado

Os marcos abaixo explicam a seleção de referências pedida pelo usuário. **Investimento, avaliação, receita e número de usuários são coisas distintas**. O êxito financeiro não demonstra que uma landing específica causou crescimento.

| Empresa | Anúncio primário datado | Marco divulgado | Leitura útil |
| --- | --- | --- | --- |
| OpenAI | [31/03/2026](https://openai.com/index/accelerating-the-next-phase-ai/) | US$122 bilhões de capital comprometido; avaliação pós-investimento de US$852 bilhões | Ampla distribuição; ainda assim a apresentação do produto privilegia tarefas concretas. |
| xAI | [06/01/2026](https://x.ai/news/series-e) | Captação de US$20 bilhões na Série E | Captação não é receita nem avaliação; o anúncio não oferece uma avaliação para esta tabela. |
| Lovable | [12/08/2026](https://lovable.dev/blog/series-c) | US$400 milhões; avaliação de US$13,3 bilhões | A promessa de criação acessível continua compreensível apesar da expansão do produto. |
| Cursor | [13/11/2025](https://cursor.com/blog/series-d) | US$2,3 bilhões; avaliação pós-investimento de US$29,3 bilhões; receita anualizada acima de US$1 bilhão | Marco histórico confirmado; não assumir que seja a avaliação atual. |
| Replit | [11/03/2026](https://replit.com/blog/replit-raises-400-million-dollars) | US$400 milhões; avaliação de US$9 bilhões | Explicação da tarefa central permanece simples. |
| Granola | [25/03/2026](https://www.granola.ai/blog/series-c) | US$125 milhões; avaliação de US$1,5 bilhão | Um problema delimitado pode sustentar identidade de marca própria. |
| Speak | [10/12/2024](https://www.speak.com/blog/series-c) | US$78 milhões; avaliação de US$1 bilhão | Referência diretamente ligada a idiomas; marco histórico, não notícia recente. |

Não foram usadas estimativas de mercado secundário nem negociações reportadas sem confirmação para atualizar estes valores. Não há necessidade de colocar nenhum desses números ou logotipos na landing de BasedSpeak.

## 5. Arquitetura recomendada da landing

1. **Cabeçalho:** marca, um link “Como funciona” e CTA. Entrar pode ser um link discreto se a conta existir.
2. **Hero:** uma promessa de no máximo duas linhas, descrição em linguagem cotidiana, CTA claro, indicação curta de cadastro/demo e cena real da cafeteria. A imagem não deve parecer um curso por vídeo gravado.
3. **Prévia interativa:** quadro com Lucas, uma fala real e duas/três peças de resposta. Uma ação produz uma mudança visível; a legenda identifica que se trata de prévia. Pode estar no próprio hero.
4. **Método em três passos:** “Entenda a situação”, “Construa sua resposta”, “Veja a conversa avançar”. Cada passo com uma frase; detalhes aparecem por interação voluntária.
5. **Apoio escolhido pela pessoa:** uma seleção pequena, sem formulário de diagnóstico ou quiz antes do cadastro. Se usada apenas como amostra, deixar explícito e não fingir que configura permanentemente a conta.
6. **FAQ curta:** “Preciso saber inglês?”, “Preciso usar o microfone?”, “O que acontece depois do cadastro?” e “O que vou encontrar na demo?”. Só responder sobre curso quando houver oferta definida.
7. **CTA final e rodapé:** repetir o mesmo próximo passo, termos e privacidade. Não acrescentar urgência, timer, desconto ou depoimentos não comprovados.

Meta editorial sugerida: aproximadamente **250–400 palavras visíveis**, sem contar respostas recolhidas de FAQ, termos e diálogo da prévia. Isso é um orçamento de design, não uma regra universal de conversão.

## 6. Interação que explica

Uma boa interação elimina uma dúvida. Para esta página:

- A pessoa toca em uma peça, vê a resposta se completar e entende o tipo de participação da demo.
- “Ouvir” só reproduz após ação; não há som na abertura.
- Trocar o apoio muda a explicação ou a forma da mesma atividade. A pessoa não deve precisar começar de novo para entender.
- Toda ação tem estado visível, foco por teclado e texto acessível. Nunca depender só de hover ou gesto.
- “Recomeçar a prévia” devolve a amostra ao início sem apagar a demo existente.
- A prévia não deve iniciar uma sessão real nem registrar conclusão falsa.

Evitar animações de entrada em cada parágrafo, carrosséis automáticos, contadores inventados, partículas, vídeo pesado de fundo e controles que apenas decoram a tela. Isso é recomendação para o contexto do produto, não julgamento universal sobre as referências.

## 7. Performance com critérios verificáveis

A [documentação oficial do Google](https://developers.google.com/search/docs/appearance/core-web-vitals) recomenda LCP de até 2,5 s, INP abaixo de 200 ms e CLS abaixo de 0,1. A [definição de LCP](https://web.dev/articles/lcp) orienta avaliar o percentil 75 e separar mobile/desktop. Esses números são **metas**, não resultados medidos nesta entrega.

Aplicação técnica: conteúdo principal no HTML inicial; uma imagem WebP responsiva prioritária; dimensões reservadas; imagens secundárias sob demanda; fontes locais já presentes no projeto; pouca lógica de cliente. Não importar o motor completo da demo, Firebase ou player de áudio na landing só para mostrar uma amostra. A escolha deve ser confirmada pela medição dos chunks.

A [orientação oficial de LCP](https://web.dev/articles/optimize-lcp) explica que a imagem principal precisa ser descoberta cedo e não deve usar lazy loading. Dar prioridade a uma imagem, sem baixar o catálogo inteiro da cafeteria. Adiar mídia e JavaScript dispensáveis até a interação.

A [W3C, critério 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide), exige controle para conteúdo que começa automaticamente e se move por mais de cinco segundos em paralelo ao restante, salvo exceções essenciais. Preferir movimento curto disparado pelo usuário e respeitar redução de movimento. O carregamento não pode esconder a mensagem ou bloquear a ação principal.

Verificar em largura pequena e grande, teclado, zoom, foco, modo de redução de movimento, rede lenta, falha de áudio e JavaScript indisponível para o conteúdo essencial. Lighthouse local não substitui dados reais de campo.

## 8. Medição e perguntas abertas

Funil recomendado para quando houver decisão de coleta: visita → clique no CTA → cadastro iniciado → cadastro concluído → demo iniciada → primeira resposta enviada → demo concluída → interesse/entrada no curso. Observar abandono e erros do cadastro separadamente; não atribuir todo abandono à copy.

**Estado atual:** eventos remotos e avaliação remota estão desativados por decisão anterior. Este relatório não autoriza ativá-los nem inventa painel de conversão. Definir responsabilidade, contato, retenção e significado de cada evento antes da implementação.

Hipóteses a testar com pessoas: entendem que a cena exige participação? Percebem por que há cadastro? Entendem as três formas de apoio? Confundem o personagem com professor ao vivo? A ação principal aparece antes de qualquer rolagem desnecessária no celular? A prévia ajuda ou desvia da entrada?

Uma entrega visual pode estar pronta para revisão sem essas respostas, mas não pode ser descrita como “conversão comprovada”. A perfeição aqui significa clareza, fidelidade ao produto e acabamento verificável; o desempenho comercial depende de observação real.

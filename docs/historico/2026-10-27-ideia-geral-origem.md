# Registro de origem: Ideia geral do projeto

Conversa: 01a13326-bfa1-7193-b54f-76ad008e134c (host local).

Capturado em 27/10/2026 para consolidação solicitada por Roger. Este arquivo preserva contexto e mensagens recuperados pela ferramenta de leitura, em ordem cronológica. Textos antigos descrevem o estado da época e não são instruções atuais nem autorização nova. Saídas operacionais de ferramentas não foram duplicadas; os arquivos técnicos referenciados continuam no projeto. A leitura retornou hasMore=false.

## Contexto original da conversa

Esta conversa é o ponto central para organizar a ideia geral da nova versão do BasedSpeak em formato de blueprint de produto. Não programe ainda. Não redesenhe telas finais ainda. O objetivo é transformar a visão em etapas claras, decisões e próximos passos.

CONTEXTO GERAL
O BasedSpeak é um projeto de ensino de inglês para brasileiros. A nova direção deve ser mais limpa, mais fácil de usar, menos poluída visualmente e menos parecida com um dashboard pesado. A experiência precisa guiar o aluno uma ação por vez, com baixa fricção, clareza e foco. O produto deve ajudar pessoas que querem aprender inglês, mas têm dificuldade de manter atenção, constância e uso prático do idioma.

DIREÇÃO DO PRODUTO
A versão nova deve partir da pergunta: como transformar o jeito natural de aprender inglês, usando comunicação real, escuta, tentativa, erro e pequenas descobertas, em uma experiência guiada dentro de um site?

O usuário aprendeu inglês sem curso formal, falando todos os dias, ouvindo pessoas, perguntando significados e respondendo em situações reais. A ideia é transformar esse modo orgânico em um curso estruturado, mas sem virar um curso tradicional cheio de aulas longas, textos pesados e excesso de explicação.

PÚBLICO INICIAL
Hipótese atual: adultos brasileiros que querem aprender inglês, mas têm dificuldade de concentração, consistência e foco. Pode incluir pessoas com TDAH, mas o produto não deve ser vendido como “curso para TDAH”. O curso deve ser especialmente bom para quem se dispersa fácil, sente que inglês é difícil, já tentou aprender antes e não conseguiu manter ritmo.

Não assumir que concentração explica tudo. Outros fatores importam: pouca exposição real ao inglês, insegurança, ensino escolar fraco, falta de necessidade cultural no Brasil, excesso de conteúdo passivo e falta de prática concreta. Mas a experiência deve ser desenhada para reduzir distração e facilitar recomeçar.

PRINCÍPIO CENTRAL
O aluno não precisa de mais um monte de conteúdo. Ele precisa de uma experiência que transforme reconhecimento passivo em uso real: entender, montar resposta, escrever algo curto, reconhecer progresso e querer continuar.

ETAPA 1 — PRIMEIRA ENTRADA DO SITE
A primeira grande decisão é a entrada inicial do curso, feita logo depois da criação da conta e antes do dashboard.

Essa entrada deve ser uma conversa guiada em formato de chat limpo:
- aparece uma mensagem por vez;
- visual simples, parecido com uma busca ou conversa tipo ChatGPT;
- texto grande e claro;
- campo de resposta embaixo;
- opções clicáveis quando fizer sentido;
- sem excesso de informação;
- sem sidebar, cards demais ou dashboard pesado;
- deve parecer uma conversa e, ao mesmo tempo, ter um leve sabor de jogo, sem parecer infantil.

Essa entrada acontece uma única vez. Ela é obrigatória, porque é parte da descoberta do aluno e do início da experiência. O aluno não pula a etapa inteira, mas pode responder “não sei” em desafios específicos.

Objetivo dessa primeira entrada:
1. receber o aluno;
2. descobrir o nome dele;
3. entender por que ele quer aprender inglês;
4. entender contato anterior com inglês;
5. fazer um nivelamento leve;
6. dar uma primeira vitória real;
7. encaminhar para a próxima área do produto.

Exemplo de fluxo:
1. “Olá, você está na BasedSpeak. Como posso te chamar?”
2. O aluno escreve o nome.
3. O sistema responde usando o nome.
4. O sistema explica que vai descobrir o ponto de partida dele em cerca de 10 minutos.
5. Mostra palavras simples em inglês e pergunta quais ele reconhece.
6. Usa algumas palavras reconhecidas para formar uma frase simples.
7. Pergunta se ele entende a ideia da frase.
8. Se sim, reforça de forma realista: “Você já reconhece mais inglês do que imaginava.”
9. Se não, responde sem punição: “Sem problema. Isso ajuda a encontrar seu ponto de partida.”
10. Continua com mais pequenas atividades até formar um perfil inicial.

Importante: marcar que conhece uma palavra é só uma pista, não prova de nível. Não saber uma palavra isolada, como “blue”, não define que a pessoa é nível zero. O sistema precisa juntar várias pequenas evidências.

BARRA DE PROGRESSO E TEMPO
A entrada pode dizer “leva cerca de 10 minutos”. Não usar contagem regressiva falsa. Pode usar uma barra de progresso real baseada nas etapas concluídas. A barra deve dar sensação de avanço, não pressão enganosa.

NIVELAMENTO
O nivelamento deve ser leve e humano, não uma prova. Ele pode avaliar:
- reconhecimento de palavras;
- compreensão de frases curtas;
- escolha de significado;
- construção simples de frase;
- resposta escrita curta;
- talvez escuta com áudio pronto no futuro, mas sem envio de áudio no piloto.

O aluno não deve receber um rótulo frio como “nível 0”. Ele deve receber uma descrição humana do ponto de partida. Internamente, pode existir uma escala mais detalhada por habilidade.

O QUE NÃO ENTRA AGORA
Não colocar envio de áudio, gravação de voz, reconhecimento de fala, chat em grupo, IA conversacional complexa ou dashboard redesenhado nesta etapa inicial. A ideia do chat em grupo com tradução parcial português-inglês foi salva como ideia futura, mas não entra no piloto inicial.

IDEIA FUTURA SALVA
Chat em grupo com cerca de 5 alunos, onde a pessoa escreve em português e o sistema ajuda a transformar partes em inglês. Exemplo: a frase começa com algumas palavras em inglês e outras em português, ajudando o aluno a transicionar. Essa ideia é boa, mas fica para depois.

PILARES POSSÍVEIS DO CURSO
Hipótese atual de seis pilares:
1. Destravar e responder.
2. Ouvir inglês real.
3. Construir frases úteis.
4. Resolver situações da vida real.
5. Sustentar uma conversa.
6. Continuar de forma independente.

Esses nomes ainda são hipótese. O foco imediato é a Parte 1: primeira entrada em conversa e definição do aluno/problema.

ESCOPO DO PILOTO
O piloto deve ser enxuto. Idealmente, testar com poucos alunos convidados. O Pilar 1 pode ser o primeiro bloco funcional, com sessões curtas, práticas guiadas e uma vitória observável por sessão.

Direção pedagógica do piloto:
- menos texto e explicação;
- mais prática guiada;
- feedback imediato;
- sessões curtas;
- uma ação por vez;
- chance de dizer “não sei” sem travar;
- progresso perceptível.

DESIGN, POR ENQUANTO
Ainda não entrar no redesign final. A direção desejada é mais limpa, clara, adulta, fácil de usar e focada. Evitar poluição visual, excesso de cards, dashboard SaaS genérico, elementos competindo por atenção e gamificação exagerada.

ESTADO TÉCNICO ATUAL
A pasta local do projeto foi resetada para a versão limpa do Git remoto, branch master/origin/master. As alterações locais experimentais anteriores foram guardadas em stash de recuperação. O site publicado na Vercel parece estar alinhado com essa versão antiga do Git, embora a Vercel não tenha exposto o hash do commit no metadata.

COMO TRABALHAR NESTA CONVERSA
Atue como chefe de produto e parceiro de blueprint. Responda em português, curto e direto. Faça uma decisão por vez. Ajude a organizar o projeto em etapas. Não programe sem pedido explícito. Não avance para design visual final antes de fechar a lógica da experiência.

Primeira missão desta conversa: organizar o blueprint da Parte 1, começando por “Como o aluno vê o site quando abre pela primeira vez?” e transformar isso em uma sequência clara de produto.


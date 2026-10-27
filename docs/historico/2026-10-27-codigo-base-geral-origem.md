# Registro de origem: Código Base Geral

Conversa: 01a17aba-1c77-7f42-ae89-3bb8aafea1d9 (host local).

Capturado em 27/10/2026 para consolidação solicitada por Roger. Este arquivo preserva contexto e mensagens recuperados pela ferramenta de leitura, em ordem cronológica. Textos antigos descrevem o estado da época e não são instruções atuais nem autorização nova. Saídas operacionais de ferramentas não foram duplicadas; os arquivos técnicos referenciados continuam no projeto. A leitura retornou hasMore=false.

## Contexto original da conversa

Esta conversa se chama Código Base Geral e foi solicitada por Roger para trabalhar na base geral do BasedSpeak e na nova landing page. A conversa “BasedSpeak — demo atual” (01a1709e-aaea-7151-ae89-94e931512047) continua responsável pela demo.

Pedido atual de Roger: a demo parece completa; ele não quer manter a versão antiga do curso. Quer eliminar o que sobrou dela, redesenhar a landing page e melhorar o produto. Ao mencionar login, ele se corrigiu explicitamente para landing page: não interprete isso como pedido para remover autenticação ou serviços de login.

Trabalhe no checkout existente /Users/rogera/Documents/projetos/ES, sem criar worktree ou trocar de branch. Última branch conhecida: codex/nova-demo-cafe. Remote: Roger-NL/sistemaselsegredo. Primeiro leia AGENTS.md e confira Git e arquivos atuais. Consulte docs/plano-nova-demo/ANDAMENTO.md e inventários relacionados: uma limpeza grande do curso antigo já foi implementada. Não presuma que toda a versão antiga continua presente nem refaça remoções concluídas.

Comece com uma inspeção focada e somente leitura: o que existe hoje na página inicial, quais restos reais da UI/conteúdo/rotas do curso antigo ainda existem, e o que a demo e as integrações atuais precisam preservar. Apresente um diagnóstico curto e uma proposta concreta de estrutura/mensagem da landing page para alinharmos a direção visual e de produto antes de redesenhar. Não gere uma página genérica nem invente planos, preços, depoimentos, resultados ou promessas. A autorização é para evoluir a base e substituir a apresentação antiga, não para excluir dados remotos, credenciais ou configurações externas. Não remova serviços compartilhados necessários à demo ou integrações futuras sem verificar dependências.

Preserve a demo funcional em /demo: história da cafeteria, Lucas, based em minúsculas nos textos, BASEDSPEAK nas 12 imagens aprovadas, três apoios realmente distintos, identidade visual, imagem junto da conversa no celular, áudios já existentes e cache global sem regeneração. Fluxo de iniciante: intenção em português, escuta do modelo inglês sem entregar sua escrita, atividade, Ajuda voluntária e reação imediata após envio. Navegação Voltar/Avançar está temporariamente liberada para testes; não transforme pulos em acertos ou escutas fictícias. A apresentação atual diz “Cerca de 20 minutos · Sem microfone”, sem “Gratuita”.

Regra persistente de Roger: sempre que alterar o site, manter localhost e site publicado na mesma versão e verificar ambos. Localhost: http://localhost:3100/demo; está em modo desenvolvimento para atualizar ao salvar. Domínio existente: https://basedspeak.com (redireciona normalmente para www); não substituir por link longo de preview. Vercel: projeto novoessite, vínculo em .vercel/project.json. Publicações no domínio e push GitHub foram autorizados no fluxo anterior; mudanças comuns e reversíveis não exigem perguntas de permissão repetidas. Preserve segredos fora do Git e cliente. Avise se alguma publicação falhar e não alegue sincronização sem verificar.

Roger pediu economia de tokens sem trocar modelo nem reduzir cobertura: agrupe verificações independentes, use saídas compactas e confira somente o que é pertinente à mudança, sem inventar testes para redação trivial. Comunique achados e limites com clareza em português. Inicie pela inspeção e proposta, mantendo os arquivos intactos nessa primeira etapa.

## Turno 01a17aba-1e29-72e0-8fe6-1aafa8f2d8b9

Estado: completed.

### Assistente — commentary

Vou conferir o estado atual do projeto, a página inicial e os registros da limpeza já feita. Nesta etapa, manterei os arquivos intactos e trarei um diagnóstico curto com uma proposta para a landing page.

### Assistente — commentary

A limpeza principal já foi feita: as telas de curso, aluno, admin, provas e ranking foram retiradas. Hoje a página inicial é a própria entrada da demo. Os vestígios encontrados estão sobretudo nos redirecionamentos de URLs antigas e em contratos de integrações preservadas; eles precisam ser avaliados pelas dependências, não removidos em bloco.

### Assistente — final_answer

Roger, **a versão antiga do curso já foi retirada da interface**. O trabalho agora é dar ao BasedSpeak uma apresentação própria: hoje `/` abre a seleção de apoio da demo, sem uma landing page que explique o produto.

A inspeção confirmou:

- Não há mais telas de curso, aluno, admin, provas ou ranking.
- Restam 22 redirecionamentos de endereços antigos e seis APIs aposentadas que respondem `410`. São compatibilidade técnica.
- Pagamentos e agenda ainda carregam referências comerciais antigas, como Premium e planos anteriores. Isso merece revisão específica antes de reutilizar essas integrações.
- Autenticação, pagamentos, agenda e cache de áudio continuam preservados. Não há motivo para apagá-los para redesenhar a apresentação.

**Minha proposta para a landing:**

1. **Abertura:** “Uma conversa em inglês começa com o que você quer dizer.”  
   Texto de apoio: “Na demo do BasedSpeak, você encontra Lucas em uma cafeteria, escuta e constrói suas respostas com o apoio que escolher.”  
   Botão: **Experimentar a conversa**. Abaixo: “Cerca de 20 minutos · Sem microfone”.

2. **Uma amostra da experiência:** usar uma imagem aprovada da cafeteria junto de uma intenção em português. Mostrar como a pessoa participa, sem criar um exercício paralelo.

3. **Como funciona:** você entende a situação, escuta e responde; a conversa reage ao que você envia. A ajuda fica disponível quando precisar.

4. **Três formas de começar:** explicar brevemente as diferenças entre Guiado, Com pistas e Mais autônomo. A escolha continua dentro da demo.

5. **Convite final:** repetir o acesso à experiência, seguido de privacidade e termos.

Visualmente, proponho manter marca, fundo creme, tipografia e imagens atuais, com mais espaço e hierarquia editorial. A cafeteria seria o elemento central da página. A experiência em `/demo` permanece preservada.

Não alterei arquivos. Localhost e domínio público responderam `200` na inicial e em `/demo`; essa checagem foi HTTP, sem comparação visual nem comprovação de igualdade entre versões.

Essa é a direção que proponho alinharmos antes da implementação.

## Turno 01a17ac0-88d9-7353-9a3f-9ac1e0a7c4d0

Estado: completed.

### Roger

Ok, se você tem certeza que os outros endereços já foram pro caralho, já não tem mais página, aquele Globo, aquela coisa que já não existe mais, beleza. O que eu quero que a gente faça nesse exato momento é começar o pensamento sobre o processo depois de terminar a conversa da demo. O que eu tava pensando é: a gente teve a demo, né, com uma conversa, e o curso realmente não vai ser só isso. Depois que a pessoa fazer essa demo, ali vai ser o momento que ela vai começar a aprender profundamente sobre cada coisa que foi conversada naquela história, entendeu? Ou seja, a gente vai pegar todas as palavras que foram faladas, aí a gente vai começar a entrar um pouco na teoria sobre cada uma daquelas palavras. Aí a gente vai entrar como um curso mesmo, entende? de aprender com alguns módulos, entende? Mas focado naquela conversa, porque a pessoa já teve a noção daquela conversa, tipo assim, this is yours. A gente vai focar em ensinar this is, e o verbo, e o que tá por trás disso, mas de uma maneira extremamente fácil de a pessoa entender também, entende? E o que a gente vai fazer? A ideia, né? Que depois da pessoa terminar, digamos que a demo e essa partezinha, vai passar ao curso de verdade, e ali ela vai selecionar várias histórias. E eu quero que você me fale sobre isso, o que você acha sobre ter várias histórias e essas histórias ensinar a pessoa inglês, entende? Por exemplo, essa primeira, vamos dizer que a segunda história seja um pouco mais profunda, mais intensa, com mais ritmo, você me entende? Vamos debater um pouco sobre isso. Mas primeiro entenda a ideia e também quero que você coloque, atualize isso na ideia geral do projeto, que tem aqui numa conversa pra Speak também. Mas essa conversa a gente vai ter aqui.


### Assistente — commentary

Vou conferir onde está registrada a visão geral do BasedSpeak e localizar a outra conversa que você mencionou. Vou registrar essa direção como proposta em discussão, sem mexer na demo nem na landing agora.

### Assistente — commentary

Entendi a sequência: a pessoa vive a conversa, depois estuda o inglês daquela história e, a partir daí, segue para outras histórias. Encontrei também a conversa da landing em andamento; vou registrar essa visão no projeto e compartilhar o contexto, deixando o debate pedagógico aqui.

Minha principal sugestão é ensinar palavras dentro de expressões e situações. Assim, dá para aprofundar tudo o que apareceu sem transformar o pós-demo numa lista longa de definições.

### Assistente — final_answer

Entendi, Roger. **A conversa é o ponto de partida do aprendizado.** A pessoa vive a história, entende a situação e depois descobre como funciona o inglês que acabou de usar. Esse aprofundamento prepara a entrada num curso organizado em outras histórias.

Eu gosto dessa direção porque ela dá um motivo concreto para estudar a teoria: “Eu usei isso com Lucas; agora quero entender como consigo usar de novo.”

Por exemplo, podemos voltar ao momento do copo:

- **“Is this yours?”** — Isso é seu?
- **this** — aponta para aquilo que está sendo mostrado.
- **yours** — indica que aquilo pertence à pessoa com quem você está falando.
- **“This is yours.”** — agora estamos afirmando.
- **“Is this yours?”** — mudamos a ordem para perguntar.

A pessoa pode perceber essa diferença mexendo nas peças e vendo o significado mudar. Depois vem uma explicação curta sobre o **is**, sempre ligada ao que aconteceu. Não precisamos despejar toda a teoria do verbo *to be* nesse primeiro contato.

**Meu cuidado seria com transformar “todas as palavras” em uma aula separada para cada palavra.** Podemos cobrir tudo, mas agrupar pelo que a pessoa quer comunicar: identificar algo, perguntar de quem é, pedir desculpas, expressar uma opinião, despedir-se. Dentro desses pequenos módulos, explicamos palavras, expressões e estruturas.

E cada explicação deveria desembocar numa aplicação nova. Depois do copo, apresentar uma mochila ou um telefone, por exemplo: a pessoa consegue entender e construir a pergunta em outro contexto? Isso ajuda a distinguir compreensão de simples repetição da cena.

Sobre ter várias histórias: **acho uma boa estrutura, desde que exista um percurso de aprendizado por trás da escolha.** Uma história pode recuperar algo da anterior, acrescentar poucas novidades e pedir um pouco mais de autonomia. Assim, elas formam um curso conectado.

A segunda pode ter mais intensidade narrativa: alguém precisa resolver um pequeno problema, tomar uma decisão ou lidar com um mal-entendido. Eu aumentaria a tensão da situação antes de aumentar simultaneamente velocidade, vocabulário e tamanho das falas. Dá para criar uma história envolvente com inglês ainda acessível.

Registrei essa visão no [documento geral do produto](/Users/rogera/Documents/projetos/ES/docs/VISAO-GERAL-DO-PRODUTO.md), vinculei no README e atualizei as conversas da demo e da landing. O debate continua aqui; não alterei o site.

Para começarmos a desenhar esse pós-demo: **você imagina voltar à própria cena e abrir pequenas explicações sobre ela, ou entrar numa sequência de aulas curtas que usam os trechos da conversa como exemplos?** Minha preferência inicial é voltar à cena, para manter a continuidade com a experiência que a pessoa acabou de viver.

## Turno 01a17b02-ac71-71a0-8b2c-631ca5274ead

Estado: completed.

### Assistente — commentary

Vou ler a atualização da visão geral para incorporar os pontos comerciais e de divulgação, sem alterar arquivos ou o site.

### Assistente — final_answer

Li a atualização e incorporei o contexto: curso por histórias, três assinaturas propostas, aulas em dupla dadas por você e divulgação inicial aos conhecidos com acompanhamento posterior.

Preços, metas e cadência seguem como hipóteses em discussão. Continuaremos o debate geral aqui. Não alterei arquivos, site nem enviei mensagens.


import { PillarData } from "@/types/study";

export const PILAR_4_DATA: PillarData = {
    id: 4,
    title: "Pilar 4: Engenharia da Frase",
    subtitle: "A estrutura que organiza sua fala: sujeito, verbo, tempo, operador e direcao da frase.",
    modules: [
        {
            id: "p4-m1",
            title: "MODULO 1: O ESQUELETO DA FRASE",
            subtitle: "A ordem base da frase em ingles, com exemplos naturais, sem peso de gramatica escolar.",
            status: "active",
            blocks: [
                {
                    type: "system-status",
                    content: "{{SYNTAX ENGINE|MOTOR DE SINTAXE}}: {{ONLINE|ATIVO}}. {{Sentence order lock engaged|Trava de ordem da frase ativada}}."
                },
                {
                    type: "h2",
                    content: "Aqui voce para de empilhar palavras e comeca a montar frase com ordem"
                },
                {
                    type: "paragraph",
                    content: "Muita gente trava achando que o problema e vocabulario. So que, muitas vezes, a pessoa ate sabe algumas palavras e mesmo assim monta a frase na ordem do portugues. O resultado e uma fala quebrada, cansativa e insegura. Neste modulo, o foco e simples: entender a ordem que sustenta a frase em ingles para voce nao precisar improvisar arquitetura toda vez que abrir a boca."
                },
                {
                    type: "box-insight",
                    title: "Por que este pilar importa",
                    content: "Quando a estrutura fica clara, sua cabeca para de resolver tudo no susto. Isso reduz cansaco mental, acelera resposta e aumenta a confianca porque voce passa a trabalhar com um molde repetivel."
                },
                {
                    type: "h3",
                    content: "1.1 A ordem base que segura a frase: {{subject + verb + object|sujeito + verbo + objeto}}"
                },
                {
                    type: "paragraph",
                    content: "Na frase simples em ingles, o caminho mais comum e direto: {{subject|sujeito}}, {{verb|verbo}} e {{object|objeto}}. Primeiro vem quem faz a acao. Depois, a acao em si. E, quando existir, vem o alvo dessa acao. Em vez de montar por sensacao, voce monta por funcao."
                },
                {
                    type: "terminal-view",
                    content: [
                        "{{Sentence blueprint|Blueprint da frase}}:",
                        "[ {{subject|quem}} ] + [ {{verb|acao}} ] + [ {{object|alvo}} ]",
                        "{{I need help.|Eu preciso de ajuda.}}",
                        "{{She likes music.|Ela gosta de musica.}}",
                        "{{They watch movies.|Eles assistem a filmes.}}"
                    ]
                },
                {
                    type: "table",
                    title: "Leitura rapida da estrutura",
                    content: [
                        "Parte|Pergunta que ela responde|Exemplo",
                        "{{Subject|Sujeito}}|{{Who?|Quem?}}|{{She|Ela}}",
                        "{{Verb|Verbo}}|{{Does what?|Faz o que?}}|{{likes|gosta}}",
                        "{{Object|Objeto}}|{{What?/Whom?|O que?/Quem?}}|{{music|musica}}"
                    ]
                },
                {
                    type: "box-warning",
                    title: "O erro mais comum de quem traduz do portugues",
                    content: "No portugues, o sujeito pode ficar escondido em varios momentos: 'quero', 'fui', 'preciso'. Em ingles, a frase normalmente precisa mostrar esse sujeito com clareza: {{I|eu}}, {{you|voce}}, {{she|ela}}. A excecao mais comum sao ordens e instrucoes curtas, como {{Come here.|Vem aqui.}} ou {{Sit down.|Senta.}}. Fora disso, esconder o sujeito costuma quebrar a frase."
                },
                {
                    type: "comparison",
                    content: [
                        "{{Quero agua.|Quero agua.}}|Em portugues, o sujeito pode ficar implicito.",
                        "{{I want water.|Eu quero agua.}}|Em ingles, o sujeito aparece.",
                        "{{Need help.|Preciso de ajuda.}}|Fica telegráfico demais em ingles comum.",
                        "{{I need help.|Eu preciso de ajuda.}}|Fica completo e natural."
                    ]
                },
                {
                    type: "h3",
                    content: "1.2 Nem toda frase precisa de objeto"
                },
                {
                    type: "paragraph",
                    content: "Esse ponto precisa ficar bem limpo: muita frase usa {{subject + verb + object|sujeito + verbo + objeto}}, mas nem toda frase precisa de objeto. Alguns verbos fecham a ideia sozinhos. O importante, neste modulo, nao e decorar nome tecnico. E perceber que a frase em ingles costuma pedir uma ordem clara, mesmo quando ela termina no verbo ou continua com um complemento."
                },
                {
                    type: "cards-grid",
                    content: [
                        "{{I work.|Eu trabalho.}}|Aqui a frase para no verbo. Ela continua correta.",
                        "{{They arrived early.|Eles chegaram cedo.}}|Aqui o final e um complemento de tempo, nao um objeto.",
                        "{{She bought a jacket.|Ela comprou uma jaqueta.}}|Aqui existe objeto.",
                        "{{We live in Lisbon.|Nos moramos em Lisboa.}}|Aqui o final mostra lugar."
                    ]
                },
                {
                    type: "box-insight",
                    title: "A ideia certa para nao se confundir",
                    content: "Pense assim: o ingles gosta de ordem clara. As vezes a frase para em {{subject + verb|sujeito + verbo}}. As vezes ela vai para {{subject + verb + object|sujeito + verbo + objeto}}. E as vezes fecha com informacao de lugar, tempo ou estado. O ganho real e perceber a direcao da frase."
                },
                {
                    type: "h3",
                    content: "1.3 O que muda quando voce pensa por funcao, nao por traducao"
                },
                {
                    type: "paragraph",
                    content: "Traduzir palavra por palavra cansa porque obriga seu cerebro a resolver duas coisas ao mesmo tempo: vocabulario e arquitetura. Quando voce pensa por funcao, a montagem fica mais limpa. Primeiro voce escolhe a posicao da peca. Depois escolhe a palavra."
                },
                {
                    type: "scramble-exercise",
                    content: "{\"sentence\":\"I need some help.\",\"translation\":\"Eu preciso de ajuda.\"}"
                },
                {
                    type: "list",
                    content: [
                        "Pergunta 1: {{Who is leading the sentence?|Quem esta liderando a frase?}}",
                        "Pergunta 2: {{What is the main action?|Qual e a acao principal?}}",
                        "Pergunta 3: {{Does the action land on something, or does it stop there?|A acao cai em algo ou termina ali?}}"
                    ]
                },
                {
                    type: "box-action",
                    title: "Atalho mental",
                    content: "Toda vez que travar, volte para esta triagem curta: quem, faz o que, termina onde. Isso evita frase inchada e te devolve controle rapido."
                },
                {
                    type: "interactive-quiz",
                    content: "Qual frase segue melhor a ordem base do ingles?|{{Want I coffee.|Quero eu cafe.}}|{{I want coffee.|Eu quero cafe.}}|{{Coffee want I.|Cafe quero eu.}}|1"
                },
                {
                    type: "interactive-quiz",
                    content: "Numa frase simples em ingles, o que normalmente vem primeiro?|{{The verb.|O verbo.}}|{{The subject.|O sujeito.}}|{{The object.|O objeto.}}|1"
                },
                {
                    type: "interactive-quiz",
                    content: "Qual frase mostra que nem toda frase precisa de objeto?|{{She bought a car.|Ela comprou um carro.}}|{{They arrived early.|Eles chegaram cedo.}}|{{I want some water.|Eu quero um pouco de agua.}}|1"
                },
                {
                    type: "micro-win",
                    content: "Voce nao precisa pensar em frase bonita ainda. Se a direcao base da frase ficou clara, metade do caos ja saiu da frente."
                }
            ]
        },
        {
            id: "p4-m2",
            title: "MODULO 2: QUEM PILOTA A FRASE",
            subtitle: "Pronomes de sujeito, {{to be|to be}} no presente e a base que deixa a frase clara sem pesar.",
            status: "locked",
            blocks: [
                {
                    type: "system-status",
                    content: "{{SUBJECT MAP|MAPA DOS SUJEITOS}}: {{SYNCED|SINCRONIZADO}}. {{Identity markers loaded|Marcadores de identidade carregados}}."
                },
                {
                    type: "h2",
                    content: "Se o sujeito nao estiver claro, o resto da frase perde firmeza"
                },
                {
                    type: "paragraph",
                    content: "Pronomes parecem basicos demais, mas eles seguram uma parte enorme da estrutura. Sao eles que mostram quem entra na frase e ajudam voce a escolher o verbo certo depois. Quando essa base fica estavel, a leitura fica mais leve e a fala para de parecer remendada."
                },
                {
                    type: "box-insight",
                    title: "Regra pratica",
                    content: "Em ingles, a frase normalmente precisa mostrar o sujeito de forma explicita. Isso vale para frases comuns do dia a dia, como {{I am tired.|Estou cansado(a).}}, {{She is here.|Ela esta aqui.}} e {{They live nearby.|Eles moram aqui perto.}}"
                },
                {
                    type: "h3",
                    content: "2.1 Os pronomes que entram na posicao de sujeito"
                },
                {
                    type: "table",
                    content: [
                        "Pronome|Uso principal|Exemplo",
                        "{{I|I}}|quem fala|{{I am ready.|Eu estou pronto(a).}}",
                        "{{You|You}}|quem ouve, no singular ou no plural|{{You are late.|Voce esta atrasado(a).}}",
                        "{{He|He}}|homem ou menino|{{He works here.|Ele trabalha aqui.}}",
                        "{{She|She}}|mulher ou menina|{{She is my friend.|Ela e minha amiga.}}",
                        "{{It|It}}|coisa, animal, tempo, clima ou situacao|{{It is cold.|Esta frio.}}",
                        "{{We|We}}|grupo com voce dentro|{{We need more time.|Nos precisamos de mais tempo.}}",
                        "{{They|They}}|grupo geral de pessoas ou coisas|{{They live nearby.|Eles moram aqui perto.}}"
                    ]
                },
                {
                    type: "paragraph",
                    content: "Dois detalhes aqui valem ouro. Primeiro: {{you|you}} serve tanto para singular quanto para plural. Segundo: {{it|it}} nao aparece so para coisa ou animal. Ele tambem entra quando o ingles precisa de um sujeito para falar de clima, horario ou situacao, como em {{It is raining.|Esta chovendo.}} e {{It is late.|Esta tarde.}}"
                },
                {
                    type: "h3",
                    content: "2.2 O {{to be|to be}} no presente nao e detalhe. E base."
                },
                {
                    type: "paragraph",
                    content: "Um monte de frase essencial do dia a dia gira em torno de identidade, estado, localizacao e descricao. E boa parte disso passa pelo {{to be|to be}}. Se essa parte nao estiver automatizada, cada frase simples vira uma pequena negociacao mental."
                },
                {
                    type: "cards-grid",
                    content: [
                        "{{I am|I am}}|{{I am busy.|Eu estou ocupado(a).}}",
                        "{{You are|You are}}|{{You are early.|Voce chegou cedo.}}",
                        "{{He is / She is / It is|He is / She is / It is}}|{{She is at home.|Ela esta em casa.}}",
                        "{{We are / They are|We are / They are}}|{{They are ready.|Eles estao prontos.}}"
                    ]
                },
                {
                    type: "table",
                    title: "Mapa rapido do presente",
                    content: [
                        "Sujeito|Forma do verbo|Exemplo",
                        "{{I|I}}|{{am|am}}|{{I am tired.|Eu estou cansado(a).}}",
                        "{{You / We / They|You / We / They}}|{{are|are}}|{{We are late.|Nos estamos atrasados.}}",
                        "{{He / She / It|He / She / It}}|{{is|is}}|{{It is ok.|Esta tudo bem.}}"
                    ]
                },
                {
                    type: "h3",
                    content: "2.3 O erro que mais denuncia traducao bruta"
                },
                {
                    type: "comparison",
                    content: [
                        "{{She teacher.|Ela professora.}}|Falta o elo da frase.",
                        "{{She is a teacher.|Ela e professora.}}|Estrutura completa.",
                        "{{They happy.|Eles felizes.}}|Soa quebrado.",
                        "{{They are happy.|Eles estao felizes.}}|Soa natural.",
                        "{{It raining.|Chovendo.}}|Falta o sujeito e falta o verbo.",
                        "{{It is raining.|Esta chovendo.}}|Forma natural."
                    ]
                },
                {
                    type: "box-warning",
                    title: "Nao corte o que segura a frase",
                    content: "Em portugues, varias frases sobrevivem no contexto: 'ela pronta', 'eu cansado', 'chovendo'. Em ingles comum, isso costuma soar quebrado. O sujeito e o {{to be|to be}} precisam aparecer: {{She is ready.|Ela esta pronta.}}, {{I am tired.|Eu estou cansado(a).}}, {{It is raining.|Esta chovendo.}}"
                },
                {
                    type: "h3",
                    content: "2.4 Como deixar isso mais leve na pratica"
                },
                {
                    type: "paragraph",
                    content: "Voce nao precisa decorar uma tabela inteira de uma vez. O ganho real vem de tratar pequenos blocos como unidades prontas. Quando {{I am|I am}}, {{you are|you are}} e {{she is|she is}} deixam de ser tres palavras separadas e viram um bloco unico, a producao fica muito mais leve."
                },
                {
                    type: "list",
                    content: [
                        "Treine em pares curtos: {{I am / you are|I am / you are}}.",
                        "Troque so o final: {{I am tired / I am ready / I am fine|I am tired / I am ready / I am fine}}.",
                        "Observe o bloco de terceira pessoa: {{he is / she is / it is|he is / she is / it is}}.",
                        "Repare que {{you are|you are}} continua igual no singular e no plural."
                    ]
                },
                {
                    type: "scramble-exercise",
                    content: "{\"sentence\":\"She is at work.\",\"translation\":\"Ela esta no trabalho.\"}"
                },
                {
                    type: "box-insight",
                    title: "O foco deste modulo",
                    content: "Voce nao esta estudando pronomes por estudar. Voce esta estabilizando o comeco da frase. Quando o sujeito entra limpo e o {{to be|to be}} encaixa certo, o resto da estrutura respira melhor."
                },
                {
                    type: "interactive-quiz",
                    content: "Qual frase esta completa?|{{He my brother.|Ele meu irmao.}}|{{He is my brother.|Ele e meu irmao.}}|{{He are my brother.|Ele sao meu irmao.}}|1"
                },
                {
                    type: "interactive-quiz",
                    content: "Qual dupla combina corretamente?|{{They is|They is}}|{{I are|I are}}|{{We are|We are}}|2"
                },
                {
                    type: "interactive-quiz",
                    content: "Qual frase usa {{it|it}} do jeito certo?|{{It is raining.|Esta chovendo.}}|{{Is raining.|Esta chovendo.}}|{{He is raining.|Ele esta chovendo.}}|0"
                },
                {
                    type: "micro-win",
                    content: "Quando sujeito e {{to be|to be}} ficam estaveis, a frase para de pedir conserto o tempo todo. E isso ja alivia bastante a sua cabeca."
                }
            ]
        },
        {
            id: "p4-m3",
            title: "MODULO 3: O PRESENTE QUE REALMENTE FUNCIONA",
            subtitle: "Afirmacao, pergunta e negacao no presente simples, com logica clara e uso real.",
            status: "locked",
            blocks: [
                {
                    type: "system-status",
                    content: "{{PRESENT ENGINE|MOTOR DO PRESENTE}}: {{ACTIVE|ATIVO}}. {{Operator routing available|Roteamento de operadores disponivel}}."
                },
                {
                    type: "h2",
                    content: "O presente simples parece basico, mas segura uma parte enorme do ingles real"
                },
                {
                    type: "paragraph",
                    content: "Rotina, gosto, trabalho, preferencia, habito e opiniao passam por aqui. O problema e que muita gente mistura tres mecanismos diferentes: afirmacao, pergunta e negacao. Quando essas tres funcoes se embaralham, o presente simples parece uma bagunca. Quando voce separa cada uma, a estrutura fica muito mais limpa."
                },
                {
                    type: "box-insight",
                    title: "Como pensar este modulo",
                    content: "Nao trate tudo como uma regra gigante. Pense em tres portas diferentes. Uma porta para afirmar. Outra para perguntar. Outra para negar. O verbo continua sendo o centro, mas a organizacao da frase muda conforme a funcao."
                },
                {
                    type: "h3",
                    content: "3.1 Primeiro bloco: a afirmacao"
                },
                {
                    type: "paragraph",
                    content: "Na afirmacao, voce normalmente nao precisa de operador. Precisa de sujeito, verbo principal e, quando for o caso, complemento ou objeto. O ponto tecnico mais importante aqui e o comportamento de {{he|he}}, {{she|she}} e {{it|it}} no presente."
                },
                {
                    type: "table",
                    content: [
                        "Sujeito|Padrao|Exemplo",
                        "{{I/You/We/They|I/You/We/They}}|verbo base|{{They work late.|Eles trabalham ate tarde.}}",
                        "{{He/She/It|He/She/It}}|verbo com S|{{She works late.|Ela trabalha ate tarde.}}"
                    ]
                },
                {
                    type: "cards-grid",
                    content: [
                        "{{I work from home.|Eu trabalho de casa.}}|rotina simples",
                        "{{You speak very fast.|Voce fala muito rapido.}}|descricao de habito",
                        "{{He lives nearby.|Ele mora aqui perto.}}|terceira pessoa com {{s|s}}",
                        "{{It looks good.|Parece bom.}}|avaliacao com {{it|it}}"
                    ]
                },
                {
                    type: "box-insight",
                    title: "O S nao e enfeite",
                    content: "Esse {{s|s}} marca terceira pessoa no presente afirmativo. Ele nao aparece porque a frase esta 'mais bonita'. Ele aparece porque o sujeito pede isso. Sem ele, a frase fica com cara de estrutura incompleta."
                },
                {
                    type: "comparison",
                    content: [
                        "{{She work here.|Ela trabalha aqui.}}|Falta a marca da terceira pessoa.",
                        "{{She works here.|Ela trabalha aqui.}}|Forma correta.",
                        "{{He like coffee.|Ele gosta de cafe.}}|Estrutura quebrada.",
                        "{{He likes coffee.|Ele gosta de cafe.}}|Estrutura certa."
                    ]
                },
                {
                    type: "h3",
                    content: "3.2 Segundo bloco: a pergunta"
                },
                {
                    type: "paragraph",
                    content: "Quando a frase vira pergunta no presente simples, o ingles chama um operador para abrir a porta: {{do|do}} ou {{does|does}}. E aqui nasce um erro muito comum: usar o operador e, ao mesmo tempo, deixar o verbo principal marcado como se ainda fosse afirmacao."
                },
                {
                    type: "decision-tree",
                    content: [
                        "Quem e o sujeito?|{{I, you, we, they|I, you, we, they}}|{{he, she, it|he, she, it}}",
                        "Use {{do|do}}|{{Do you work here?|Voce trabalha aqui?}}|Use {{does|does}}|{{Does she work here?|Ela trabalha aqui?}}"
                    ]
                },
                {
                    type: "box-warning",
                    title: "Erro classico",
                    content: "Se entrou {{does|does}}, o verbo principal volta limpo: {{Does she work?|Ela trabalha?}} e nao {{Does she works?|Ela trabalha?}}."
                },
                {
                    type: "cards-grid",
                    content: [
                        "{{Do you live here?|Voce mora aqui?}}|pergunta com {{do|do}}",
                        "{{Do they need help?|Eles precisam de ajuda?}}|plural no presente",
                        "{{Does he drive to work?|Ele vai de carro para o trabalho?}}|terceira pessoa",
                        "{{Does it make sense?|Isso faz sentido?}}|uso comum com {{it|it}}"
                    ]
                },
                {
                    type: "scramble-exercise",
                    content: "{\"sentence\":\"Does she work here?\",\"translation\":\"Ela trabalha aqui?\"}"
                },
                {
                    type: "h3",
                    content: "3.3 Terceiro bloco: a negacao"
                },
                {
                    type: "paragraph",
                    content: "Negar no presente segue a mesma logica da pergunta: o operador entra e o verbo principal volta para a forma base. Quando voce entende isso como sistema, para de decorar frase isolada e passa a montar com criterio."
                },
                {
                    type: "cards-grid",
                    content: [
                        "{{I do not know.|Eu nao sei.}}|negacao com {{do|do}}",
                        "{{They do not live here.|Eles nao moram aqui.}}|plural e rotina",
                        "{{He does not like coffee.|Ele nao gosta de cafe.}}|terceira pessoa",
                        "{{She does not work on Fridays.|Ela nao trabalha nas sextas.}}|habito negado"
                    ]
                },
                {
                    type: "h3",
                    content: "3.4 O desenho completo do presente simples"
                },
                {
                    type: "table",
                    title: "Mapa funcional",
                    content: [
                        "Funcao|Estrutura|Exemplo",
                        "Afirmacao|{{subject + verb|subject + verb}}|{{She works late.|Ela trabalha ate tarde.}}",
                        "Pergunta|{{do/does + subject + verb|do/does + subject + verb}}|{{Does she work late?|Ela trabalha ate tarde?}}",
                        "Negacao|{{subject + do/does not + verb|subject + do/does not + verb}}|{{She does not work late.|Ela nao trabalha ate tarde.}}"
                    ]
                },
                {
                    type: "h3",
                    content: "3.5 O que deixa a leitura mais leve"
                },
                {
                    type: "list",
                    content: [
                        "Afirmacao: sujeito + verbo.",
                        "Pergunta: operador + sujeito + verbo.",
                        "Negacao: sujeito + operador + not + verbo."
                    ]
                },
                {
                    type: "box-action",
                    title: "Formula de bolso",
                    content: "Em vez de decorar dezenas de frases, memorize so a mudanca de funcao. A frase nao muda inteira. O que muda e a posicao do operador e a forma do verbo."
                },
                {
                    type: "box-insight",
                    title: "O ganho real deste modulo",
                    content: "Quando voce estabiliza afirmacao, pergunta e negacao, o presente simples deixa de parecer materia de escola e vira ferramenta de uso diario. E isso muda muita coisa, porque esse tempo verbal aparece o tempo inteiro."
                },
                {
                    type: "interactive-quiz",
                    content: "Qual pergunta esta correta?|{{Does she works here?|Ela trabalha aqui?}}|{{Does she work here?|Ela trabalha aqui?}}|{{Do she work here?|Ela trabalha aqui?}}|1"
                },
                {
                    type: "interactive-quiz",
                    content: "Qual frase afirmativa esta correta?|{{He work at home.|Ele trabalha em casa.}}|{{He does work at home.|Ele trabalha em casa.}}|{{He works at home.|Ele trabalha em casa.}}|2"
                },
                {
                    type: "interactive-quiz",
                    content: "Qual negacao esta montada do jeito certo?|{{She does not likes tea.|Ela nao gosta de cha.}}|{{She does not like tea.|Ela nao gosta de cha.}}|{{She not like tea.|Ela nao gosta de cha.}}|1"
                },
                {
                    type: "micro-win",
                    content: "Se voce entendeu o jogo entre sujeito, operador e verbo base, ja saiu do nivel de frase improvisada."
                }
            ]
        },
        {
            id: "p4-m4",
            title: "MODULO 4: MEXENDO NO TEMPO SEM COMPLICAR",
            subtitle: "Passado e futuro simples sem caos: como mover a frase no tempo sem desmontar a estrutura.",
            status: "locked",
            blocks: [
                {
                    type: "system-status",
                    content: "{{TIME CONTROL|CONTROLE DE TEMPO}}: {{READY|PRONTO}}. {{Past and future operators armed|Operadores de passado e futuro armados}}."
                },
                {
                    type: "h2",
                    content: "O ingles muda o tempo de forma mais previsivel do que parece"
                },
                {
                    type: "paragraph",
                    content: "Muita gente se assusta com tempos verbais porque imagina uma parede de tabelas. Mas, na fala basica, muita coisa se resolve com uma troca clara de operador ou com uma marca simples de tempo. A ideia deste modulo e mostrar que a estrutura da frase continua respirando, mesmo quando voce move a acao para ontem ou para depois."
                },
                {
                    type: "box-insight",
                    title: "Como pensar este modulo",
                    content: "Voce nao vai aprender tudo sobre passado e futuro aqui. Vai aprender o suficiente para mover a frase no tempo sem desmontar sua base. Esse e o foco certo para esta etapa."
                },
                {
                    type: "h3",
                    content: "4.1 O passado: quando o did entra, o verbo principal limpa"
                },
                {
                    type: "paragraph",
                    content: "Em perguntas e negacoes no passado, o operador {{did|did}} assume a marcacao de tempo. Por isso, o verbo principal volta para a forma base. Esse ponto e simples, mas muito importante: o passado nao precisa aparecer duas vezes na mesma frase."
                },
                {
                    type: "comparison",
                    content: [
                        "{{You went yesterday.|Voce foi ontem.}}|afirmacao no passado",
                        "{{Did you go yesterday?|Voce foi ontem?}}|pergunta com operador",
                        "{{You did not go yesterday.|Voce nao foi ontem.}}|negacao com operador",
                        "{{Did you went yesterday?|Voce foi ontem?}}|erro: passado duplicado"
                    ]
                },
                {
                    type: "box-warning",
                    title: "Nao marque o passado duas vezes",
                    content: "Se o operador ja carregou o tempo, o verbo principal nao precisa carregar de novo. Isso evita frases como {{Did she arrived?|Ela chegou?}}, que soam quebradas."
                },
                {
                    type: "cards-grid",
                    content: [
                        "{{I called you last night.|Eu te liguei ontem a noite.}}|afirmacao no passado",
                        "{{Did you call her back?|Voce retornou para ela?}}|pergunta no passado",
                        "{{We did not finish on time.|Nos nao terminamos a tempo.}}|negacao no passado",
                        "{{Did they leave early?|Eles sairam cedo?}}|passado com {{did|did}}"
                    ]
                },
                {
                    type: "scramble-exercise",
                    content: "{\"sentence\":\"Did you call me yesterday?\",\"translation\":\"Voce me ligou ontem?\"}"
                },
                {
                    type: "h3",
                    content: "4.2 O futuro: will como ferramenta de projecao"
                },
                {
                    type: "paragraph",
                    content: "Para muita frase simples de futuro, {{will|will}} ja resolve. Ele entra antes do verbo principal e o verbo continua na forma base. A vantagem e que a estrutura fica direta e facil de prever."
                },
                {
                    type: "cards-grid",
                    content: [
                        "{{I will call you.|Eu vou te ligar.}}|promessa ou decisao",
                        "{{We will see.|Nos vamos ver.}}|projecao simples",
                        "{{Will they join us?|Eles vao se juntar a nos?}}|pergunta no futuro",
                        "{{She will not stay.|Ela nao vai ficar.}}|negacao no futuro"
                    ]
                },
                {
                    type: "comparison",
                    content: [
                        "{{She will go later.|Ela vai depois.}}|estrutura correta",
                        "{{She will goes later.|Ela vai depois.}}|erro: verbo marcado sem necessidade",
                        "{{Will you be there?|Voce vai estar la?}}|pergunta no futuro",
                        "{{You will not need this.|Voce nao vai precisar disso.}}|negacao no futuro"
                    ]
                },
                {
                    type: "h3",
                    content: "4.3 O mapa que evita confusao"
                },
                {
                    type: "table",
                    title: "Tempo e estrutura",
                    content: [
                        "Tempo|Estrutura|Exemplo",
                        "Passado afirmativo|{{subject + past form|subject + past form}}|{{She arrived early.|Ela chegou cedo.}}",
                        "Passado com pergunta|{{did + subject + verb|did + subject + verb}}|{{Did she arrive early?|Ela chegou cedo?}}",
                        "Futuro simples|{{will + verb|will + verb}}|{{She will arrive early.|Ela vai chegar cedo.}}"
                    ]
                },
                {
                    type: "h3",
                    content: "4.4 Como pensar sem cansar"
                },
                {
                    type: "list",
                    content: [
                        "Presente simples: verbo principal carrega a rotina.",
                        "Passado com pergunta/negacao: {{did|did}} carrega o tempo.",
                        "Futuro simples: {{will|will}} empurra a acao para frente."
                    ]
                },
                {
                    type: "box-insight",
                    title: "O ganho real aqui",
                    content: "Voce nao esta estudando tempo verbal como teoria escolar. Voce esta aprendendo a deslocar a frase no tempo sem desmontar a estrutura. Isso deixa sua fala mais rapida e menos cansativa."
                },
                {
                    type: "box-action",
                    title: "Atalho mental",
                    content: "Se a frase e pergunta ou negacao no passado, pense em {{did|did}} primeiro. Se a frase aponta para o futuro simples, pense em {{will|will}} primeiro. Esse atalho ja resolve muito sem sobrecarregar a cabeca."
                },
                {
                    type: "interactive-quiz",
                    content: "Qual pergunta no passado esta correta?|{{Did you went home?|Voce foi para casa?}}|{{Did you go home?|Voce foi para casa?}}|{{Do you went home?|Voce foi para casa?}}|1"
                },
                {
                    type: "interactive-quiz",
                    content: "Qual frase de futuro esta correta?|{{She will goes later.|Ela ira depois.}}|{{She will go later.|Ela ira depois.}}|{{She goes will later.|Ela ira depois.}}|1"
                },
                {
                    type: "micro-win",
                    content: "Agora voce ja consegue enxergar uma frase como estrutura movel: mesma base, tempo diferente."
                }
            ]
        },
        {
            id: "p4-m5",
            title: "MODULO 5: PERGUNTAS QUE ABREM CONVERSA",
            subtitle: "WH questions, ordem da pergunta e perguntas uteis que realmente puxam conversa.",
            status: "locked",
            blocks: [
                {
                    type: "system-status",
                    content: "{{QUESTION LAB|LABORATORIO DE PERGUNTAS}}: {{OPEN|ABERTO}}. {{Information prompts calibrated|Disparadores de informacao calibrados}}."
                },
                {
                    type: "h2",
                    content: "Saber perguntar bem te devolve controle da conversa"
                },
                {
                    type: "paragraph",
                    content: "Boa parte da comunicacao real nao depende de frases longas. Depende de pergunta clara. Quando voce monta perguntas com ordem certa, consegue pedir informacao, checar entendimento, ganhar contexto e conduzir conversa com muito menos esforco."
                },
                {
                    type: "box-insight",
                    title: "A logica por tras das perguntas",
                    content: "Perguntar bem nao e floreio. E controle. Quem sabe perguntar consegue destravar situacao, pedir contexto, confirmar detalhe e empurrar a conversa para frente sem ficar preso em resposta curta."
                },
                {
                    type: "h3",
                    content: "5.1 A ordem das perguntas com WH"
                },
                {
                    type: "paragraph",
                    content: "Em geral, o caminho e este: palavra de pergunta + operador + sujeito + verbo principal. Em perguntas com verbo to be, o desenho muda um pouco, mas a logica de organizacao continua visivel."
                },
                {
                    type: "table",
                    content: [
                        "Palavra|Uso principal|Exemplo",
                        "{{What|What}}|coisa, informacao|{{What do you need?|O que voce precisa?}}",
                        "{{Where|Where}}|lugar|{{Where do they live?|Onde eles moram?}}",
                        "{{When|When}}|tempo|{{When does she start?|Quando ela comeca?}}",
                        "{{Why|Why}}|motivo|{{Why did you leave?|Por que voce saiu?}}",
                        "{{How|How}}|modo, estado|{{How are you feeling?|Como voce esta se sentindo?}}",
                        "{{Who|Who}}|pessoa|{{Who is that?|Quem e aquela pessoa?}}"
                    ]
                },
                {
                    type: "cards-grid",
                    content: [
                        "{{What do you need?|O que voce precisa?}}|pergunta de necessidade",
                        "{{Where do we go now?|Para onde vamos agora?}}|direcao e proximo passo",
                        "{{When does it start?|Quando isso comeca?}}|tempo e horario",
                        "{{Why did they cancel?|Por que eles cancelaram?}}|motivo"
                    ]
                },
                {
                    type: "box-insight",
                    title: "O segredo para nao soar robotico",
                    content: "Voce nao precisa inventar pergunta sofisticada. Precisa montar pergunta limpa. Pergunta curta e bem ordenada costuma soar melhor do que pergunta longa e torta."
                },
                {
                    type: "h3",
                    content: "5.2 Comparando uma pergunta solta com uma pergunta bem montada"
                },
                {
                    type: "comparison",
                    content: [
                        "{{Where you work?|Onde voce trabalha?}}|Entendivel, mas estruturalmente solta.",
                        "{{Where do you work?|Onde voce trabalha?}}|Estrutura completa.",
                        "{{Why she left?|Por que ela saiu?}}|Falta operador.",
                        "{{Why did she leave?|Por que ela saiu?}}|Pergunta montada direito."
                    ]
                },
                {
                    type: "h3",
                    content: "5.3 Quando entra {{do|do}} e quando ele nao entra"
                },
                {
                    type: "paragraph",
                    content: "Nem toda pergunta com {{wh|wh}} usa {{do|do}} ou {{does|does}}. Se a pergunta vier com {{to be|to be}}, o verbo sobe e o operador nao entra: {{Where are you?|Onde voce esta?}}. E, em alguns casos com {{who|who}} como sujeito, tambem nao aparece {{do|do}}: {{Who called you?|Quem te ligou?}}"
                },
                {
                    type: "comparison",
                    content: [
                        "{{Where do you work?|Onde voce trabalha?}}|usa operador porque o verbo principal e {{work|work}}.",
                        "{{Where are you?|Onde voce esta?}}|nao usa {{do|do}} porque a pergunta ja gira em torno de {{are|are}}.",
                        "{{Who called you?|Quem te ligou?}}|{{who|who}} funciona como sujeito da frase.",
                        "{{Who did call you?|Quem te ligou?}}|nao e a forma normal para essa pergunta."
                    ]
                },
                {
                    type: "h3",
                    content: "5.4 Perguntas que ja servem para a vida real"
                },
                {
                    type: "cards-grid",
                    content: [
                        "Rotina|{{What time do you start?|Que horas voce comeca?}}",
                        "Localizacao|{{Where is the meeting?|Onde e a reuniao?}}",
                        "Confirmacao|{{How does this work?|Como isso funciona?}}",
                        "Motivo|{{Why did they cancel?|Por que eles cancelaram?}}"
                    ]
                },
                {
                    type: "scramble-exercise",
                    content: "{\"sentence\":\"Where do you live now?\",\"translation\":\"Onde voce mora agora?\"}"
                },
                {
                    type: "dialogue",
                    title: "Pergunta curta, conversa viva",
                    content: [
                        "You: {{Where do I check in?|Onde eu faco o check-in?}}",
                        "Staff: {{Right over there, by the desk.|Ali, perto do balcao.}}",
                        "You: {{What time does it open?|Que horas abre?}}",
                        "Staff: {{At eight.|As oito.}}"
                    ]
                },
                {
                    type: "box-action",
                    title: "Metodo para nao cansar lendo nem praticando",
                    content: "Em vez de estudar listas enormes, escolha 5 perguntas que voce realmente usaria nesta semana. Repita o molde, troque o final e observe como a estrutura continua a mesma. Isso gera utilidade imediata e evita estudo pesado demais."
                },
                {
                    type: "interactive-quiz",
                    content: "Qual versao mantem a ordem natural da pergunta?|{{Where you live?|Onde voce mora?}}|{{Where do you live?|Onde voce mora?}}|{{Where does you live?|Onde voce mora?}}|1"
                },
                {
                    type: "interactive-quiz",
                    content: "Qual pergunta no passado ficou montada do jeito certo?|{{Why did he leave early?|Por que ele saiu cedo?}}|{{Why he did leave early?|Por que ele saiu cedo?}}|{{Why left he early?|Por que ele saiu cedo?}}|0"
                },
                {
                    type: "interactive-quiz",
                    content: "Qual pergunta usa {{who|who}} de forma natural como sujeito?|{{Who called you?|Quem te ligou?}}|{{Who did call you?|Quem te ligou?}}|{{Who do called you?|Quem te ligou?}}|0"
                },
                {
                    type: "micro-win",
                    content: "Voce terminou este modulo com algo muito pratico: nao so responder em ingles, mas puxar informacao com ordem e clareza."
                }
            ]
        },
        {
            id: "p4-m6",
            title: "MODULO 6: MONTAGEM CONTROLADA",
            subtitle: "Fechando o pilar com consolidacao, menos ruido e mais criterio para montar frase sem colapsar.",
            status: "locked",
            blocks: [
                {
                    type: "system-status",
                    content: "{{ASSEMBLY MODE|MODO DE MONTAGEM}}: {{STABLE|ESTAVEL}}. {{Core sentence pieces ready for deployment|Pecas centrais da frase prontas para uso}}."
                },
                {
                    type: "h2",
                    content: "Agora a meta nao e saber a regra. E conseguir usar a regra sem se perder"
                },
                {
                    type: "paragraph",
                    content: "Ao longo deste pilar, voce viu que a frase em ingles nao depende de inspiracao. Depende de ordem, funcao e alguns gatilhos tecnicos bem claros. Este fechamento existe para te mostrar como juntar essas pecas sem transformar o estudo num peso."
                },
                {
                    type: "box-insight",
                    title: "O objetivo agora nao e decorar mais",
                    content: "A meta aqui e integrar. Se voce ainda tentar lembrar regra isolada para tudo, vai cansar. Se voce comecar a ver a frase como um sistema simples de montagem, a producao fica muito mais estavel."
                },
                {
                    type: "box-goal",
                    title: "O que precisa ficar de pe",
                    content: "Se voce sair deste pilar sabendo identificar sujeito, montar afirmacao simples, abrir pergunta com operador, negar sem quebrar o verbo e deslocar a frase no tempo, a base estrutural ja esta fazendo o trabalho dela."
                },
                {
                    type: "h3",
                    content: "6.1 O mapa final da engenharia"
                },
                {
                    type: "list",
                    content: [
                        "Frase simples: {{subject + verb + object|subject + verb + object}}.",
                        "Com verbo to be: sujeito + {{am/is/are|am/is/are}} + complemento.",
                        "Pergunta no presente: {{do/does + subject + verb|do/does + subject + verb}}.",
                        "Pergunta no passado: {{did + subject + verb|did + subject + verb}}.",
                        "Futuro simples: {{will + verb|will + verb}}."
                    ]
                },
                {
                    type: "table",
                    title: "Mapa final de montagem",
                    content: [
                        "Situacao|Estrutura base|Exemplo",
                        "Descrever estado|{{subject + to be + complement|subject + to be + complement}}|{{She is ready.|Ela esta pronta.}}",
                        "Falar rotina|{{subject + verb|subject + verb}}|{{They work late.|Eles trabalham ate tarde.}}",
                        "Perguntar no presente|{{do/does + subject + verb|do/does + subject + verb}}|{{Does he work here?|Ele trabalha aqui?}}",
                        "Perguntar no passado|{{did + subject + verb|did + subject + verb}}|{{Did they call you?|Eles te ligaram?}}",
                        "Projetar futuro|{{will + verb|will + verb}}|{{I will text you later.|Vou te mandar mensagem depois.}}"
                    ]
                },
                {
                    type: "h3",
                    content: "6.2 O que fazer quando der branco"
                },
                {
                    type: "paragraph",
                    content: "Quando a cabeca pesar, volte para a estrutura minima. Em vez de tentar falar tudo, monte o essencial primeiro. A fluidez comeca quando voce para de exigir perfeicao total e passa a proteger a ordem basica da frase."
                },
                {
                    type: "cards-grid",
                    content: [
                        "{{I need help.|Eu preciso de ajuda.}}|quando voce precisa destravar rapido",
                        "{{Can you repeat that?|Pode repetir isso?}}|quando precisa ganhar tempo",
                        "{{Did you send it?|Voce enviou isso?}}|quando precisa checar uma acao passada",
                        "{{I will do it today.|Eu vou fazer isso hoje.}}|quando precisa projetar acao futura"
                    ]
                },
                {
                    type: "box-action",
                    title: "Protocolo de emergencia",
                    content: "1) Escolha o sujeito.\n2) Defina se e afirmacao, pergunta ou negacao.\n3) Descubra se precisa de operador.\n4) Use o verbo principal limpo quando o operador carregar a estrutura.\n5) Complete com o minimo necessario."
                },
                {
                    type: "scramble-exercise",
                    content: "{\"sentence\":\"Will they send the file today?\",\"translation\":\"Eles vao enviar o arquivo hoje?\"}"
                },
                {
                    type: "dialogue",
                    title: "Da estrutura para a vida real",
                    content: [
                        "You: {{I need some help with this.|Eu preciso de ajuda com isso.}}",
                        "Staff: {{Sure. What do you need?|Claro. Do que voce precisa?}}",
                        "You: {{Where do I sign?|Onde eu assino?}}",
                        "Staff: {{Right here.|Bem aqui.}}",
                        "You: {{Will they send me a copy later?|Eles vao me enviar uma copia depois?}}",
                        "Staff: {{Yes, they will.|Sim, vao.}}"
                    ]
                },
                {
                    type: "interactive-quiz",
                    content: "Qual frase ficou mais bem montada estruturalmente?|{{Did she called you?|Ela te ligou?}}|{{She is ready for the meeting.|Ela esta pronta para a reuniao.}}|{{Where you are going?|Onde voce esta indo?}}|1"
                },
                {
                    type: "interactive-quiz",
                    content: "Qual estrutura serve para perguntar no presente simples?|{{subject + verb + object|subject + verb + object}}|{{do/does + subject + verb|do/does + subject + verb}}|{{will + past verb|will + past verb}}|1"
                },
                {
                    type: "box-insight",
                    title: "O ganho mais importante",
                    content: "A partir daqui, voce nao depende mais so de frases memorizadas. Voce comeca a enxergar a arquitetura por tras delas. Isso torna leitura, escuta e producao menos cansativas porque tudo deixa de parecer aleatorio."
                },
                {
                    type: "pillar-end",
                    title: "Base estrutural consolidada",
                    content: "Voce fechou o Pilar 4 com algo muito valioso: criterio. Agora sua frase nao depende apenas de intuicao. Ela ja tem ordem, ponto de apoio e logica para crescer com mais seguranca nos proximos pilares."
                }
            ]
        }
    ]
};

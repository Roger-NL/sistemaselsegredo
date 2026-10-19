import type { BarrierId } from "./language";
import { answer, reaction, reply, unit as u, type GuidedScenarioContent } from "./guided-content-types";

const like = u("like", ["gosto de", "aprecio", "mag"], [
  "Like conta do que você gosta. I like já diz eu gosto; a ideia vem logo depois.",
  "Like expresa que algo te gusta. I like puede decirse me gusta o yo aprecio, según el contexto.",
  "Like sagt, was du magst. I like heißt ich mag; danach kommt, was du magst.",
]);
const love = u("love", ["adoro", "adoro", "liebe"], [
  "Love é mais forte que like: você adora a ideia. A ordem da frase continua igual.",
  "Love es más fuerte que like: adoras la idea. El orden de las palabras sigue igual.",
  "Love ist stärker als like: Du liebst die Idee. Die Reihenfolge bleibt gleich.",
]);
const yourIdea = u("your idea.", ["sua ideia.", "tu idea.", "deine Idee."], [
  "Your aponta para a outra pessoa: sua ideia. Em inglês, your vem antes de idea.",
  "Your señala a la otra persona: tu idea. En inglés también va antes de idea.",
  "Your zeigt auf die andere Person: deine Idee. Es steht direkt vor idea.",
]);
const iLike = u("I like", ["Eu gosto", "Me gusta", "Ich mag"], [
  "I like apresenta sua opinião: eu gosto. Em português, completamos com da sua ideia; em inglês, your idea vem direto.",
  "I like expresa me gusta. El inglés empieza por I; aprende el bloque completo para no copiar el orden del español.",
  "I like heißt ich mag. Damit nennst du deine Meinung; danach folgt die Idee, die du magst.",
]);
const iLove = u("I love", ["Eu adoro", "Adoro", "Ich liebe"], [
  "I love é eu adoro. É uma opinião mais forte que I like; a ideia que você adora vem logo depois.",
  "I love es adoro. Es una opinión más fuerte que I like; después viene lo que adoras.",
  "I love heißt ich liebe. Das ist stärker als I like; danach folgt, was du liebst.",
]);
const likedIdea = { ...yourIdea, meaning: ["da sua ideia.", "tu idea.", "deine Idee."] as const };
const yes = u("Yes,", ["Sim,", "Sí,", "Ja,"], [
  "Yes confirma que você pode compartilhar. A vírgula abre espaço para explicar como.",
  "Yes confirma que puedes compartirla. La coma deja espacio para explicar cómo.",
  "Yes bestätigt, dass du deine Idee teilen kannst. Danach erklärst du, wie.",
]);
const moment = u("give me a moment.", ["me dê um momento.", "dame un momento.", "gib mir einen Moment."], [
  "Give me a moment é um pedido pronto para ganhar tempo. Você pode usá-lo quando der branco.",
  "Give me a moment es una petición para ganar tiempo. Úsala si te quedas en blanco.",
  "Give me a moment ist eine fertige Bitte um etwas Zeit. Sie hilft, wenn du kurz blockierst.",
]);
const explain = u("let me explain.", ["deixa eu explicar.", "déjame explicar.", "lass mich das erklären."], [
  "Let me + uma ação pede espaço para agir. Aqui, explain é explicar sua ideia.",
  "Let me + una acción pide espacio para hacerla. Explain significa explicar tu idea.",
  "Let me mit einer Handlung bittet um Raum dafür. Explain heißt, deine Idee zu erklären.",
]);
const need = u("We need", ["Precisamos de", "Necesitamos", "Wir brauchen"], [
  "We inclui você e o grupo. Need apresenta o que está faltando, sem precisar montar uma frase longa.",
  "We te incluye a ti y al grupo. Need presenta lo que hace falta de forma directa.",
  "We meint dich und die Gruppe. Need leitet ein, was fehlt: Wir brauchen etwas.",
]);
const plan = u("a clearer plan", ["um plano mais claro", "un plan más claro", "einen klareren Plan"], [
  "Clear é claro; clearer é mais claro. A palavra que descreve o plano vem antes de plan.",
  "Clear es claro; clearer es más claro. La descripción va antes de plan en inglés.",
  "Clear heißt klar; clearer heißt klarer. Die Beschreibung steht vor plan.",
]);
const time = u("more time", ["mais tempo", "más tiempo", "mehr Zeit"], [
  "More aumenta a quantidade: mais tempo. Com time nessa ideia, você não coloca a antes.",
  "More aumenta la cantidad: más tiempo. Aquí no se pone a delante de time.",
  "More erhöht die Menge: mehr Zeit. Vor time steht hier kein a.",
]);
const project = u("for this project.", ["para este projeto.", "para este proyecto.", "für dieses Projekt."], [
  "For liga a necessidade ao objetivo: para este projeto. This aponta para o projeto da conversa.",
  "For conecta la necesidad con el objetivo: para este proyecto. This señala el proyecto del que hablan.",
  "For verbindet den Bedarf mit dem Ziel: für dieses Projekt. This meint das aktuelle Projekt.",
]);
const think = u("I think", ["Eu acho que", "Creo que", "Ich denke,"], [
  "I think apresenta uma opinião e deixa espaço para o grupo responder. Em português, o que já entra no sentido do bloco.",
  "I think presenta tu opinión y deja espacio para responder. En español se expresa como creo que.",
  "I think leitet deine Meinung ein. Auf Deutsch folgt oft ein Nebensatz; hier lernst du den englischen Einstieg als Block.",
]);
const should = u("we should start", ["deveríamos começar", "deberíamos empezar", "wir sollten … anfangen"], [
  "Should sugere uma ação ao grupo. Depois dele, start fica na forma simples: não precisa de to.",
  "Should propone una acción al grupo. Después, start va en su forma simple, sin to.",
  "Should schlägt etwas vor. Im Englischen folgt start direkt auf should; im Deutschen steht mit dem Hauptproblem zwischen sollten und anfangen.",
]);
const issue = u("with the main issue.", ["pelo problema principal.", "por el problema principal.", "mit dem Hauptproblem."], [
  "Start with significa começar por algo. Main issue é o problema principal, o ponto que vem primeiro.",
  "Start with significa empezar por algo. Main issue es el problema principal que conviene tratar primero.",
  "Start with heißt mit etwas anfangen. Main issue ist das Hauptproblem, das zuerst dran ist.",
]);
const rather = u("I'd rather", ["Eu preferiria", "Preferiría", "Ich würde lieber"], [
  "I'd rather é um bloco para dizer sua preferência. Ele pede uma ação logo depois, sem to no meio.",
  "I'd rather expresa una preferencia. La acción va después en su forma simple, sin to.",
  "I'd rather drückt eine Präferenz aus. Danach kommt die Handlung in der Grundform, ohne to.",
]);
const test = u("test a small change", ["testar uma pequena mudança", "probar un pequeño cambio", "eine kleine Änderung testen"], [
  "Test é a ação que você prefere fazer. Small descreve change antes do nome: uma mudança pequena.",
  "Test es la acción que prefieres. Small describe change y va antes del nombre en inglés.",
  "Test ist die Handlung, die du bevorzugst. Small beschreibt change und steht davor.",
]);
const before = u("before we decide.", ["antes de decidirmos.", "antes de decidir.", "bevor wir entscheiden."], [
  "Before liga duas ações no tempo. We decide mostra quem decide; a frase não termina só em before.",
  "Before conecta dos acciones en el tiempo. We decide indica quién decide y completa la idea.",
  "Before verbindet zwei Handlungen zeitlich. We decide nennt, wer entscheidet, und vervollständigt den Gedanken.",
]);

export const guidedWork: Record<BarrierId, GuidedScenarioContent> = {
  start: {
    context: ["Um colega mostra uma ideia.", "Un compañero te muestra una idea.", "Jemand aus deinem Team zeigt dir eine Idee."],
    setting: ["Na reunião, um colega mostra uma ideia e pergunta:", "En una reunión, un compañero te muestra una idea y pregunta:", "Im Meeting zeigt dir jemand eine Idee und fragt:"],
    question: "Do you like my idea?", questionMeaning: ["Você gosta da minha ideia?", "¿Te gusta mi idea?", "Magst du meine Idee?"],
    answers: [
      answer("first", [iLike, likedIdea], ["Eu gosto da sua ideia.", "Me gusta tu idea.", "Ich mag deine Idee."], reaction("Thank you!", ["Obrigado(a)!", "¡Gracias!", "Danke!"], ["Thank you é um agradecimento pelo que você acabou de dizer.", "Thank you agradece lo que acabas de decir.", "Thank you bedankt sich für das, was du gesagt hast."])),
      answer("second", [iLove, yourIdea], ["Eu adoro sua ideia.", "Adoro tu idea.", "Ich liebe deine Idee."], reaction("That's great!", ["Que bom!", "¡Qué bien!", "Das ist toll!"], ["That's great mostra alegria com sua reação. That's junta that e is numa forma curta.", "That's great muestra alegría por tu reacción. That's une that e is.", "That's great zeigt Freude über deine Reaktion. That's ist die Kurzform von that is."])),
    ], contrast: [like, love],
  },
  freeze: {
    context: ["Sua vez de falar na reunião.", "Te toca hablar en la reunión.", "Im Meeting bist du an der Reihe."],
    setting: ["Na reunião, chega sua vez. Uma pessoa pergunta:", "En la reunión llega tu turno. Alguien pregunta:", "Im Meeting bist du dran. Jemand fragt:"],
    question: "Can you share your idea?", questionMeaning: ["Você pode compartilhar sua ideia?", "¿Puedes compartir tu idea?", "Kannst du deine Idee vorstellen?"],
    answers: [
      answer("first", [yes, moment], ["Sim, me dê um momento.", "Sí, dame un momento.", "Ja, gib mir einen Moment."], reaction("Take your time.", ["Fique à vontade, sem pressa.", "Tómate tu tiempo.", "Lass dir Zeit."], ["Take your time dá espaço para você pensar. É uma expressão pronta, sem cobrança de rapidez.", "Take your time te permite pensar sin prisa. Aprende la expresión completa.", "Take your time gibt dir Zeit zum Nachdenken. Lerne den Ausdruck als Ganzes."])),
      answer("second", [yes, explain], ["Sim, deixa eu explicar.", "Sí, déjame explicar.", "Ja, lass mich das erklären."], reaction("I'm listening.", ["Estou ouvindo.", "Te escucho.", "Ich höre zu."], ["I'm listening mostra que a pessoa está pronta para ouvir sua ideia. I'm é a forma curta de I am.", "I'm listening indica que la persona está lista para escucharte. I'm es la forma corta de I am.", "I'm listening zeigt, dass die Person dir zuhört. I'm ist die Kurzform von I am."])),
    ], contrast: [moment, explain],
  },
  words: {
    context: ["O grupo quer melhorar um projeto.", "El equipo quiere mejorar un proyecto.", "Das Team möchte ein Projekt verbessern."],
    setting: ["O grupo conversa sobre um projeto. Alguém pergunta:", "El equipo habla de un proyecto. Alguien pregunta:", "Das Team spricht über ein Projekt. Jemand fragt:"],
    question: "What could we improve?", questionMeaning: ["O que poderíamos melhorar?", "¿Qué podríamos mejorar?", "Was könnten wir verbessern?"],
    answers: [
      answer("first", [need, plan, project], ["Precisamos de um plano mais claro para este projeto.", "Necesitamos un plan más claro para este proyecto.", "Wir brauchen einen klareren Plan für dieses Projekt."], reaction("Let's write the steps down.", ["Vamos anotar as etapas.", "Anotemos los pasos.", "Schreiben wir die Schritte auf."], ["Let's convida o grupo a agir. Write down é anotar; steps são as etapas do plano.", "Let's invita al grupo a actuar. Write down es anotar; steps son los pasos del plan.", "Let's lädt die Gruppe zum Handeln ein. Write down heißt aufschreiben; steps sind die Schritte des Plans."])),
      answer("second", [need, time, project], ["Precisamos de mais tempo para este projeto.", "Necesitamos más tiempo para este proyecto.", "Wir brauchen mehr Zeit für dieses Projekt."], reaction("Let's review the deadline.", ["Vamos rever o prazo.", "Revisemos el plazo.", "Prüfen wir die Frist noch einmal."], ["Review é rever e deadline é prazo final. A pessoa propõe revisar o prazo porque você pediu mais tempo.", "Review es revisar y deadline es plazo. La persona propone revisarlo porque necesitas más tiempo.", "Review heißt überprüfen, deadline ist die Frist. Die Person greift deinen Wunsch nach mehr Zeit auf."])),
    ], contrast: [plan, time],
  },
  translate: {
    context: ["O time procura uma forma de resolver um problema.", "El equipo busca cómo resolver un problema.", "Das Team sucht nach einer Lösung für ein Problem."],
    setting: ["O time quer ouvir sua proposta. Uma pessoa pergunta:", "El equipo quiere escuchar tu propuesta. Alguien pregunta:", "Das Team möchte deinen Vorschlag hören. Jemand fragt:"],
    question: "How would you approach this problem?", questionMeaning: ["Como você abordaria este problema?", "¿Cómo abordarías este problema?", "Wie würdest du dieses Problem angehen?"],
    answers: [
      answer("first", [think, should, issue], ["Acho que deveríamos começar pelo problema principal.", "Creo que deberíamos empezar por el problema principal.", "Ich denke, wir sollten mit dem Hauptproblem anfangen."], reaction("That sounds like a good place to start.", ["Parece um bom ponto de partida.", "Parece un buen punto de partida.", "Das klingt nach einem guten Ausgangspunkt."], ["Sounds like apresenta uma impressão: parece. A good place to start aqui é um bom ponto de partida para a solução.", "Sounds like expresa una impresión: parece. A good place to start es un buen punto de partida para la solución.", "Sounds like drückt einen Eindruck aus: klingt nach. A good place to start meint einen guten Ausgangspunkt für die Lösung."])),
      answer("second", [rather, test, before], ["Eu preferiria testar uma pequena mudança antes de decidirmos.", "Preferiría probar un pequeño cambio antes de decidir.", "Ich würde lieber eine kleine Änderung testen, bevor wir entscheiden."], reply([
        u("Good idea.", ["Boa ideia.", "Buena idea.", "Gute Idee."], ["Good idea aceita sua proposta sem repetir o que você disse.", "Good idea acepta tu propuesta sin repetirla.", "Good idea stimmt deinem Vorschlag zu, ohne ihn zu wiederholen."]),
        u("Let's see what happens.", ["Vamos ver o que acontece.", "Veamos qué pasa.", "Schauen wir, was passiert."], ["Let's see propõe observar juntos. What happens é o resultado do teste que você sugeriu.", "Let's see propone observar juntos. What happens es el resultado de la prueba que sugeriste.", "Let's see schlägt vor, gemeinsam hinzusehen. What happens ist das Ergebnis des vorgeschlagenen Tests."]),
      ], ["Boa ideia. Vamos ver o que acontece.", "Buena idea. Veamos qué pasa.", "Gute Idee. Schauen wir, was passiert."])),
    ], contrast: [
      u("I think we should start with the main issue.", ["Acho que deveríamos começar pelo problema principal.", "Creo que deberíamos empezar por el problema principal.", "Ich denke, wir sollten mit dem Hauptproblem anfangen."], [
        "I think apresenta uma opinião. Aqui, você sugere por onde começar.",
        "I think presenta una opinión. Aquí propones por dónde empezar.",
        "I think leitet eine Meinung ein. Hier schlägst du vor, womit ihr anfangen solltet.",
      ]),
      u("I'd rather test a small change before we decide.", ["Eu preferiria testar uma pequena mudança antes de decidirmos.", "Preferiría probar un pequeño cambio antes de decidir.", "Ich würde lieber eine kleine Änderung testen, bevor wir entscheiden."], [
        "I'd rather apresenta uma preferência. Aqui, você prefere testar antes de decidir; não basta trocar apenas o começo da outra frase.",
        "I'd rather expresa una preferencia. Aquí prefieres probar antes de decidir; no basta con cambiar solo el comienzo de la otra frase.",
        "I'd rather drückt eine Vorliebe aus. Hier möchtest du vor der Entscheidung etwas testen; dafür reicht es nicht, nur den Anfang des anderen Satzes auszutauschen.",
      ]),
    ],
  },
};

import type { BarrierId } from "./language";
import { reaction, unit, type GuidedScenarioContent } from "./guided-content-types";

export const guidedTravel: Record<BarrierId, GuidedScenarioContent> = {
  start: {
    context: ["Você está em um café durante uma viagem.", "Estás en una cafetería durante un viaje.", "Du bist auf einer Reise in einem Café."],
    setting: ["Você está em um café durante uma viagem. A pessoa no balcão pergunta:", "Estás en una cafetería durante un viaje. La persona que atiende pregunta:", "Du bist auf einer Reise in einem Café. Die Person hinter der Theke fragt:"],
    question: "Do you like coffee?",
    questionMeaning: ["Você gosta de café?", "¿Te gusta el café?", "Magst du Kaffee?"],
    answers: [
      {
        id: "first",
        phrase: "I like coffee.",
        meaning: ["Eu gosto de café.", "Me gusta el café.", "Ich mag Kaffee."],
        parts: [
          unit("I like", ["Eu gosto de", "Me gusta", "Ich mag"], ["I like é um começo pronto para dizer do que você gosta. Em português, o de já entra nesse sentido.", "I like equivale a me gusta. Aprende el bloque junto: el orden del inglés es distinto al del español.", "I like heißt ich mag. Lerne den Einstieg als Ganzes und ergänze danach, was du magst."]),
          unit("coffee.", ["café.", "el café.", "Kaffee."], ["Coffee completa a ideia: é o café de que você gosta. Em inglês, não precisa de uma palavra extra antes.", "Coffee completa la idea. En inglés no necesitas el artículo the antes de coffee aquí.", "Coffee vervollständigt den Gedanken. Hier braucht das Wort im Englischen keinen Artikel."]),
        ],
        reaction: reaction("Me too!", ["Eu também!", "¡A mí también!", "Ich auch!"], ["A pessoa também gosta de café; ‘Me too’ evita repetir a frase inteira.", "A la otra persona también le gusta el café; ‘Me too’ evita repetir toda la frase.", "Die andere Person mag ebenfalls Kaffee; mit ‘Me too’ muss sie den Satz nicht wiederholen."]),
      },
      {
        id: "second",
        phrase: "No, I like tea.",
        meaning: ["Não, eu gosto de chá.", "No, me gusta el té.", "Nein, ich mag Tee."],
        parts: [
          unit("No,", ["Não,", "No,", "Nein,"], ["No responde à pergunta sobre café. Depois você conta do que gosta.", "No responde a la pregunta sobre el café. Después dices lo que te gusta.", "No beantwortet die Frage nach Kaffee. Danach sagst du, was du magst."]),
          unit("I like", ["Eu gosto de", "Me gusta", "Ich mag"], ["O começo continua igual: você está dizendo do que gosta.", "El comienzo no cambia: sigues expresando lo que te gusta.", "Der Anfang bleibt gleich: Du sagst weiterhin, was du magst."]),
          unit("tea.", ["chá.", "el té.", "Tee."], ["Trocar coffee por tea muda só a sua preferência.", "Cambiar coffee por tea cambia solo tu preferencia.", "Wenn du coffee durch tea ersetzt, ändert sich nur deine Vorliebe."]),
        ],
        reaction: reaction("Oh, OK!", ["Ah, tudo bem!", "¡Ah, vale!", "Ach so, okay!"], ["A pessoa reconhece sua resposta; não está dizendo que também gosta de chá.", "La persona reconoce tu respuesta; no está diciendo que también le guste el té.", "Die Person nimmt deine Antwort auf; sie sagt damit nicht, dass sie auch Tee mag."]),
      },
    ],
    contrast: [
      unit("I like coffee.", ["Eu gosto de café.", "Me gusta el café.", "Ich mag Kaffee."], ["Esta resposta confirma que você gosta de café.", "Esta respuesta confirma que te gusta el café.", "Diese Antwort bestätigt, dass du Kaffee magst."]),
      unit("No, I like tea.", ["Não, eu gosto de chá.", "No, me gusta el té.", "Nein, ich mag Tee."], ["Esta resposta diz não ao café e apresenta o chá como sua preferência.", "Esta respuesta dice no al café y presenta el té como tu preferencia.", "Diese Antwort verneint die Frage nach Kaffee und nennt Tee als deine Vorliebe."]),
    ],
  },
  freeze: {
    context: ["Você está em um café durante uma viagem.", "Estás en una cafetería durante un viaje.", "Du bist auf einer Reise in einem Café."],
    setting: ["Você está em um café durante uma viagem. A pessoa no balcão pergunta:", "Estás en una cafetería durante un viaje. La persona que atiende pregunta:", "Du bist auf einer Reise in einem Café. Die Person hinter der Theke fragt:"],
    question: "What would you like?",
    questionMeaning: ["O que você gostaria de pedir?", "¿Qué te gustaría pedir?", "Was möchtest du bestellen?"],
    answers: [
      {
        id: "first",
        phrase: "A coffee, please.",
        meaning: ["Um café, por favor.", "Un café, por favor.", "Einen Kaffee, bitte."],
        parts: [
          unit("A coffee,", ["um café,", "un café,", "einen Kaffee,"], ["Se der branco, comece pelo pedido: ‘A coffee’. A pausa te dá tempo.", "Si te quedas en blanco, empieza por el pedido: ‘A coffee’. La pausa te da tiempo.", "Wenn du blockierst, beginne mit der Bestellung: ‘A coffee’. Die Pause gibt dir Zeit."]),
          unit("please.", ["por favor.", "por favor.", "bitte."], ["Please completa o pedido com educação; você pode acrescentá-lo depois.", "Please hace la petición más amable; puedes añadirlo después.", "Please macht die Bestellung höflich; du kannst es danach ergänzen."]),
        ],
        reaction: reaction("Here's your coffee.", ["Aqui está seu café.", "Aquí tienes tu café.", "Hier ist dein Kaffee."], ["A pessoa entrega o café. ‘Here’s’ é a forma curta de ‘Here is’.", "Te entregan el café. ‘Here’s’ es la forma corta de ‘Here is’.", "Du bekommst deinen Kaffee. ‘Here’s’ ist die Kurzform von ‘Here is’. "]),
      },
      {
        id: "second",
        phrase: "A tea, please.",
        meaning: ["Um chá, por favor.", "Un té, por favor.", "Einen Tee, bitte."],
        parts: [
          unit("A tea,", ["um chá,", "un té,", "einen Tee,"], ["Comece só com ‘A tea’. Isso já mostra o que você quer.", "Empieza solo con ‘A tea’. Ya indica lo que quieres.", "Beginne nur mit ‘A tea’. Damit ist dein Wunsch schon klar."]),
          unit("please.", ["por favor.", "por favor.", "bitte."], ["Depois da pausa, acrescente please para deixar o pedido gentil.", "Después de la pausa, añade please para pedirlo con amabilidad.", "Nach der Pause ergänzt du please und klingst höflich."]),
        ],
        reaction: reaction("Here's your tea.", ["Aqui está seu chá.", "Aquí tienes tu té.", "Hier ist dein Tee."], ["A pessoa entrega o chá. Você reconhece tea, a palavra do seu pedido.", "Te entregan el té. Reconoces tea, la palabra que pediste.", "Du bekommst deinen Tee. Das Wort tea kennst du aus deiner Bestellung."]),
      },
    ],
    contrast: [
      unit("A coffee,", ["um café,", "un café,", "einen Kaffee,"], ["Este é o começo que você pode usar sem montar uma frase longa.", "Este comienzo funciona sin formar una frase larga.", "Mit diesem Anfang brauchst du keinen langen Satz zu bilden."]),
      unit("A tea,", ["um chá,", "un té,", "einen Tee,"], ["Troque a bebida e mantenha please no final.", "Cambia la bebida y conserva please al final.", "Tausche das Getränk aus und lass please am Ende stehen."]),
    ],
  },
  words: {
    context: ["Você está procurando um lugar durante uma viagem.", "Buscas un lugar durante un viaje.", "Du suchst auf einer Reise einen Ort."],
    setting: ["Você está procurando um lugar durante uma viagem. Alguém pergunta:", "Buscas un lugar durante un viaje. Alguien pregunta:", "Du suchst auf einer Reise einen Ort. Jemand fragt:"],
    question: "What are you looking for?",
    questionMeaning: ["O que você está procurando?", "¿Qué estás buscando?", "Wonach suchst du?"],
    answers: [
      {
        id: "first",
        phrase: "I'm looking for a quiet café.",
        meaning: ["Estou procurando um café tranquilo.", "Busco una cafetería tranquila.", "Ich suche ein ruhiges Café."],
        parts: [
          unit("I'm looking for", ["estou procurando", "busco", "ich suche"], ["Este bloco diz sua intenção inteira: procurar algo. ‘I'm’ é ‘I am’.", "Este bloque expresa la intención: buscar algo. ‘I'm’ es ‘I am’.", "Dieser Baustein sagt, was du tust: etwas suchen. ‘I'm’ ist ‘I am’. "]),
          unit("a quiet café.", ["um café tranquilo.", "una cafetería tranquila.", "ein ruhiges Café."], ["Quiet descreve o café: tranquilo. Em inglês, a característica vem antes do lugar: quiet café.", "Quiet describe la cafetería: tranquila. En inglés, la característica va antes del lugar: quiet café.", "Quiet beschreibt das Café: ruhig. Wie im Deutschen steht die Eigenschaft hier vor dem Ort: quiet café."]),
        ],
        reaction: reaction("There's one near the station.", ["Há um perto da estação.", "Hay una cerca de la estación.", "In der Nähe des Bahnhofs gibt es eins."], ["‘One’ retoma o café que você acabou de mencionar; a pessoa indica onde fica.", "‘One’ se refiere a la cafetería mencionada; te dicen dónde está.", "‘One’ verweist auf das Café; die Person sagt dir, wo es ist."]),
      },
      {
        id: "second",
        phrase: "I'm looking for a good restaurant.",
        meaning: ["Estou procurando um bom restaurante.", "Busco un buen restaurante.", "Ich suche ein gutes Restaurant."],
        parts: [
          unit("I'm looking for", ["estou procurando", "busco", "ich suche"], ["Guarde este bloco: ele serve para procurar muitos lugares diferentes.", "Recuerda este bloque: sirve para buscar muchos lugares distintos.", "Merke dir diesen Baustein: Er passt zu vielen Orten."]),
          unit("a good", ["um bom", "un buen", "ein gutes"], ["Good acrescenta o que você espera do restaurante.", "Good indica cómo quieres que sea el restaurante.", "Good sagt, wie das Restaurant sein soll."]),
          unit("restaurant.", ["restaurante.", "restaurante.", "Restaurant."], ["Restaurant é o destino; com o bloco anterior, seu pedido fica completo.", "Restaurant es el destino; con el bloque anterior, tu petición queda completa.", "Restaurant ist dein Ziel; zusammen mit dem vorherigen Teil ist die Bitte vollständig."]),
        ],
        reaction: reaction("There's one near the hotel.", ["Há um perto do hotel.", "Hay uno cerca del hotel.", "In der Nähe des Hotels gibt es eins."], ["A pessoa fala de um restaurante e indica que há um perto do hotel.", "La persona se refiere a un restaurante y dice que hay uno cerca del hotel.", "Die Person meint ein Restaurant und sagt dir, dass es eines nahe dem Hotel gibt."]),
      },
    ],
    contrast: [
      unit("a quiet café", ["um café tranquilo", "una cafetería tranquila", "ein ruhiges Café"], ["Use estas palavras quando o tipo de lugar importa.", "Usa estas palabras cuando importa cómo es el lugar.", "Nutze diese Wörter, wenn die Art des Ortes wichtig ist."]),
      unit("a good restaurant", ["um bom restaurante", "un buen restaurante", "ein gutes Restaurant"], ["Troque o lugar e a característica; ‘I'm looking for’ continua útil.", "Cambia el lugar y la característica; ‘I'm looking for’ sigue sirviendo.", "Tausche Ort und Eigenschaft aus; ‘I'm looking for’ bleibt nützlich."]),
    ],
  },
  translate: {
    context: ["Você está conhecendo uma cidade durante uma viagem.", "Estás descubriendo una ciudad durante un viaje.", "Du erkundest auf einer Reise eine Stadt."],
    setting: ["Você está conhecendo uma cidade. Uma pessoa puxa conversa e pergunta:", "Estás descubriendo una ciudad. Una persona entabla conversación y pregunta:", "Du erkundest eine Stadt. Jemand beginnt ein Gespräch und fragt:"],
    question: "Is this your first time in the city?",
    questionMeaning: ["É sua primeira vez na cidade?", "¿Es tu primera vez en la ciudad?", "Bist du zum ersten Mal in der Stadt?"],
    answers: [
      {
        id: "first",
        phrase: "Yes, and I'd love to try the local food.",
        meaning: ["Sim, e eu adoraria provar a comida local.", "Sí, y me encantaría probar la comida local.", "Ja, und ich würde gern das lokale Essen probieren."],
        parts: [
          unit("Yes, and", ["sim, e", "sí, y", "ja, und"], ["Confirme a pergunta e abra espaço para acrescentar sua intenção.", "Confirma la respuesta y abre espacio para añadir tu intención.", "Antworte auf die Frage und leite zu deinem Wunsch über."]),
          unit("I'd love to try", ["eu adoraria provar", "me encantaría probar", "ich würde gern probieren"], ["Este bloco mostra vontade. ‘I'd’ é a forma curta de ‘I would’.", "Este bloque expresa un deseo. ‘I'd’ es la forma corta de ‘I would’.", "Dieser Baustein drückt einen Wunsch aus. Im Englischen steht try vor dem Essen; im Deutschen kommt probieren ans Ende."]),
          unit("the local food.", ["a comida local.", "la comida local.", "das lokale Essen."], ["É o que você quer provar. Guarde a ideia completa, sem remontar palavra por palavra.", "Es lo que quieres probar. Quédate con la idea completa sin reconstruir cada palabra.", "Das möchtest du probieren. Merke dir den ganzen Gedanken statt jedes Wort einzeln zu übersetzen."]),
        ],
        reaction: reaction("You should try the market.", ["Você deveria conhecer o mercado.", "Deberías visitar el mercado.", "Du solltest den Markt besuchen."], ["‘You should’ é uma sugestão; a pessoa indica o mercado como lugar para experimentar a comida local.", "‘You should’ presenta una sugerencia; te recomiendan el mercado para probar comida local.", "‘You should’ leitet einen Vorschlag ein; die Person empfiehlt den Markt für lokales Essen."]),
      },
      {
        id: "second",
        phrase: "No, but I'd like to explore a new neighborhood.",
        meaning: ["Não, mas eu gostaria de explorar um bairro novo.", "No, pero me gustaría explorar un barrio nuevo.", "Nein, aber ich würde gern ein neues Viertel erkunden."],
        parts: [
          unit("No, but", ["não, mas", "no, pero", "nein, aber"], ["Responda à pergunta e mostre que ainda há algo novo que você quer fazer.", "Responde a la pregunta y anuncia algo nuevo que todavía quieres hacer.", "Beantworte die Frage und leite zu etwas Neuem über, das du noch tun möchtest."]),
          unit("I'd like to explore", ["eu gostaria de explorar", "me gustaría explorar", "ich würde gern erkunden"], ["Este bloco apresenta seu objetivo; ‘I'd like to’ soa educado e natural.", "Este bloque presenta tu objetivo; ‘I'd like to’ suena amable y natural.", "Dieser Baustein nennt deinen Wunsch. Im Englischen folgt das Ziel auf explore; im Deutschen steht erkunden am Satzende."]),
          unit("a new neighborhood.", ["um bairro novo.", "un barrio nuevo.", "ein neues Viertel."], ["É o lugar que você quer descobrir. O bloco anterior funciona com outros destinos também.", "Es el lugar que quieres descubrir. El bloque anterior sirve con otros destinos.", "Das ist der Ort, den du entdecken möchtest. Der vorherige Baustein passt auch zu anderen Zielen."]),
        ],
        reaction: reaction("The old town is worth a visit.", ["Vale a pena conhecer o centro histórico.", "Vale la pena visitar el casco antiguo.", "Die Altstadt ist einen Besuch wert."], ["‘Worth a visit’ recomenda um lugar sem dar uma ordem: vale a pena visitar.", "‘Worth a visit’ recomienda un lugar sin dar una orden: vale la pena visitarlo.", "‘Worth a visit’ empfiehlt einen Ort: Er ist einen Besuch wert."]),
      },
    ],
    contrast: [
      unit("I'd love to try", ["eu adoraria provar", "me encantaría probar", "ich würde gern probieren"], ["Use este bloco para dizer o que você quer experimentar.", "Usa este bloque para decir qué te gustaría probar.", "Mit diesem Baustein sagst du, was du gern probieren möchtest."]),
      unit("I'd like to explore", ["eu gostaria de explorar", "me gustaría explorar", "ich würde gern erkunden"], ["A intenção muda para explorar; repare que ambos começam com ‘I'd’.", "La intención cambia a explorar; ambos bloques empiezan por ‘I'd’.", "Jetzt geht es ums Erkunden; beide Bausteine beginnen mit ‘I'd’. "]),
    ],
  },
};

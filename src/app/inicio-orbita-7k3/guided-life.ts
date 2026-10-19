import type { BarrierId } from "./language";
import { musicAnswers, musicStarterCopy, type MusicAnswer } from "./music-starter";
import { answer, reaction, unit as u, type GuidedScenarioContent, type Translation } from "./guided-content-types";

function musicText(read: (copy: typeof musicStarterCopy.pt) => string): Translation {
  return [read(musicStarterCopy.pt), read(musicStarterCopy.es), read(musicStarterCopy.de)];
}
function musicAnswer(id: MusicAnswer) {
  const english = musicAnswers[id];
  return answer(id, ["I", english.verb, "music."].map((word, index) =>
    u(word, musicText((copy) => copy.answers[id].parts[index]), musicText((copy) => copy.answers[id].notes[index]))),
  musicText((copy) => copy.answers[id].meaning),
  reaction(english.reply, musicText((copy) => copy.answers[id].replyMeaning), musicText((copy) => copy.answers[id].replyNote)));
}
const like = u("I like", ["Eu gosto de", "Me gustan", "Ich mag"], [
  "I like é um começo pronto para contar do que você gosta. Você só troca o assunto depois.",
  "I like es un comienzo para contar lo que te gusta. El inglés mantiene I like aunque después haya varias cosas.",
  "I like ist ein fertiger Einstieg, um Vorlieben zu nennen. Danach tauschst du nur das Thema aus.",
]);
const musicMovies = u("music and movies.", ["música e filmes.", "la música y las películas.", "Musik und Filme."], [
  "And junta duas coisas: música e filmes. Você pode guardar esse par como uma pequena lista.",
  "And une dos cosas: música y películas. Puedes recordar la pareja como una lista pequeña.",
  "And verbindet zwei Dinge: Musik und Filme. Merke dir das Paar als kleine Liste.",
]);
const booksGames = u("books and games.", ["livros e jogos.", "los libros y los juegos.", "Bücher und Spiele."], [
  "And continua juntando duas coisas. O começo I like fica igual; só seus interesses mudam.",
  "And sigue uniendo dos cosas. I like no cambia; solo cambian tus intereses.",
  "And verbindet wieder zwei Dinge. I like bleibt gleich; nur deine Interessen ändern sich.",
]);
const enjoy = u("I enjoy", ["Eu gosto de", "Disfruto", "Ich genieße"], [
  "Enjoy mostra que uma atividade dá prazer. Depois dele, a ação seguinte costuma ganhar ing.",
  "Enjoy expresa que disfrutas una actividad. La acción que viene después suele terminar en ing.",
  "Enjoy sagt, dass dir eine Tätigkeit Freude macht. Die folgende Handlung endet meist auf ing.",
]);
const cooking = u("cooking", ["cozinhar", "cocinar", "Kochen"], [
  "Cook é cozinhar. Depois de enjoy, vira cooking: a atividade de cozinhar, sem indicar que acontece agora.",
  "Cook es cocinar. Después de enjoy pasa a cooking: la actividad, sin indicar que ocurra ahora.",
  "Cook heißt kochen. Nach enjoy wird daraus cooking: die Tätigkeit, nicht unbedingt etwas, das gerade passiert.",
]);
const hiking = u("hiking", ["fazer trilhas", "hacer senderismo", "Wandern"], [
  "Hiking é caminhar em trilhas. Você ganha uma palavra específica para um interesse seu.",
  "Hiking es hacer senderismo. Aprendes una palabra concreta para hablar de tus intereses.",
  "Hiking heißt Wandern. Du lernst ein konkretes Wort, um über deine Interessen zu sprechen.",
]);
const friends = u("with my friends.", ["com meus amigos.", "con mis amigos.", "mit meinen Freunden."], [
  "With conta com quem você cozinha. My friends são seus amigos; esse pedaço completa a cena.",
  "With cuenta con quién cocinas. My friends son tus amigos; este bloque completa la escena.",
  "With sagt, mit wem du kochst. My friends sind deine Freunde; der Baustein ergänzt die Szene.",
]);
const weekends = u("on the weekends.", ["nos fins de semana.", "los fines de semana.", "an den Wochenenden."], [
  "On the weekends situa o hábito nos fins de semana. Guarde esse conjunto para falar da sua rotina.",
  "On the weekends sitúa el hábito los fines de semana. Recuerda el bloque para hablar de tu rutina.",
  "On the weekends ordnet die Gewohnheit den Wochenenden zu. Merke dir die Wortgruppe für deinen Alltag.",
]);
const listen = u("I usually listen to music", ["Eu geralmente ouço música", "Normalmente escucho música", "Ich höre meistens Musik"], [
  "Usually mostra um hábito. Listen to music é ouvir música; o to faz parte desse bloco, mesmo sem aparecer na tradução.",
  "Usually indica un hábito. Listen to music es escuchar música; to pertenece al bloque aunque no se traduzca aparte.",
  "Usually zeigt eine Gewohnheit. Listen to music heißt Musik hören; to gehört im Englischen dazu.",
]);
const need = u("when I need", ["quando preciso de", "cuando necesito", "wenn ich … brauche"], [
  "When conecta o hábito a uma situação: quando preciso. O que você precisa vem no próximo pedaço.",
  "When conecta el hábito con una situación: cuando necesito. Lo que necesitas viene después.",
  "When verbindet zwei Gedanken. Im Deutschen steht brauche am Ende: Der nächste Baustein gehört zwischen ich und brauche.",
]);
const breakTime = u("a break.", ["uma pausa.", "una pausa.", "eine Pause."], [
  "Break aqui é uma pausa, não o verbo quebrar. O contexto decide o sentido da palavra.",
  "Break aquí es una pausa, no romper. El contexto decide el significado de la palabra.",
  "Break bedeutet hier Pause, nicht brechen. Der Zusammenhang entscheidet über die Bedeutung.",
]);
const walk = u("I prefer going for a walk", ["Eu prefiro sair para caminhar", "Prefiero salir a caminar", "Ich gehe lieber spazieren"], [
  "I prefer apresenta sua preferência. Going for a walk é uma atividade inteira: sair para caminhar.",
  "I prefer expresa tu preferencia. Going for a walk es una actividad completa: salir a caminar.",
  "I prefer zeigt deine Vorliebe. Going for a walk ist eine ganze Tätigkeit: spazieren gehen.",
]);
const feel = u("when I feel", ["quando me sinto", "cuando me siento", "wenn ich mich … fühle"], [
  "When I feel liga a escolha ao que você sente. Falta só completar com o estado ou a emoção.",
  "When I feel conecta la elección con lo que sientes. Solo falta el estado o la emoción.",
  "When I feel verbindet deine Wahl mit einem Gefühl. Im Deutschen kommt das Gefühl vor fühle: wenn ich mich gestresst fühle.",
]);
const stressed = u("stressed.", ["estressado(a).", "estresado/a.", "gestresst."], [
  "Stressed descreve como você se sente. I feel stressed é me sinto estressado, sem uma palavra extra entre os dois.",
  "Stressed describe cómo te sientes. I feel stressed equivale a me siento estresado.",
  "Stressed beschreibt dein Gefühl. I feel stressed heißt ich fühle mich gestresst.",
]);

export const guidedLife: Record<BarrierId, GuidedScenarioContent> = {
  start: {
    context: musicText((copy) => copy.context),
    setting: ["Você está conhecendo alguém. A pessoa pergunta:", "Estás conociendo a alguien. La persona pregunta:", "Du lernst jemanden kennen. Die Person fragt:"],
    question: "Do you like music?", questionMeaning: ["Você gosta de música?", "¿Te gusta la música?", "Magst du Musik?"],
    answers: [musicAnswer("love"), musicAnswer("hate")],
    contrast: [
      u("love", musicText((copy) => copy.love), musicText((copy) => copy.answers.love.notes[1])),
      u("hate", musicText((copy) => copy.hate), musicText((copy) => copy.answers.hate.notes[1])),
    ],
  },
  freeze: {
    context: ["Você está conhecendo alguém.", "Estás conociendo a alguien.", "Du lernst jemanden kennen."],
    setting: ["Você conhece uma pessoa nova. Ela pergunta:", "Conoces a una persona nueva. Te pregunta:", "Du lernst eine neue Person kennen. Sie fragt:"],
    question: "What do you like?", questionMeaning: ["Do que você gosta?", "¿Qué te gusta?", "Was magst du?"],
    answers: [
      answer("first", [like, musicMovies], ["Eu gosto de música e filmes.", "Me gustan la música y las películas.", "Ich mag Musik und Filme."], reaction("What's your favorite movie?", ["Qual é seu filme favorito?", "¿Cuál es tu película favorita?", "Was ist dein Lieblingsfilm?"], ["What's é what is: qual é. A pessoa pega movies, que você citou, e pede seu filme favorito.", "What's es what is: cuál es. La persona retoma movies y pregunta por tu película favorita.", "What's ist die Kurzform von what is. Die Person greift movies auf und fragt nach deinem Lieblingsfilm."])),
      answer("second", [like, booksGames], ["Eu gosto de livros e jogos.", "Me gustan los libros y los juegos.", "Ich mag Bücher und Spiele."], reaction("What's your favorite game?", ["Qual é seu jogo favorito?", "¿Cuál es tu juego favorito?", "Was ist dein Lieblingsspiel?"], ["Favorite game é seu jogo favorito. A pergunta aproveita games para manter a conversa no seu assunto.", "Favorite game es tu juego favorito. La pregunta retoma games para seguir con tus intereses.", "Favorite game heißt Lieblingsspiel. Die Frage greift games auf und bleibt bei deinem Thema."])),
    ], contrast: [musicMovies, booksGames],
  },
  words: {
    context: ["Uma conversa sobre tempo livre.", "Una conversación sobre el tiempo libre.", "Ein Gespräch über Freizeit."],
    setting: ["A conversa chega ao tempo livre. Alguém pergunta:", "La conversación llega al tiempo libre. Alguien pregunta:", "Das Gespräch kommt auf Freizeit. Jemand fragt:"],
    question: "What do you do in your free time?", questionMeaning: ["O que você faz no tempo livre?", "¿Qué haces en tu tiempo libre?", "Was machst du in deiner Freizeit?"],
    answers: [
      answer("first", [enjoy, cooking, friends], ["Eu gosto de cozinhar com meus amigos.", "Disfruto cocinar con mis amigos.", "Ich koche gern mit meinen Freunden."], reaction("What's your favorite dish?", ["Qual é seu prato favorito?", "¿Cuál es tu plato favorito?", "Was ist dein Lieblingsgericht?"], ["Dish aqui é um prato de comida, não a louça. A pessoa usa o assunto cooking para perguntar do que você mais gosta.", "Dish aquí es un plato de comida. La persona retoma cooking para preguntar por tu favorito.", "Dish meint hier ein Gericht, nicht das Geschirr. Die Person knüpft an cooking an und fragt nach deinem Favoriten."])),
      answer("second", [enjoy, hiking, weekends], ["Eu gosto de fazer trilhas nos fins de semana.", "Disfruto hacer senderismo los fines de semana.", "Ich gehe an den Wochenenden gern wandern."], reaction("Where do you usually go?", ["Onde você costuma ir?", "¿Adónde sueles ir?", "Wohin gehst du normalerweise?"], ["Where pergunta o lugar; usually indica costume. A pessoa quer saber onde você faz suas trilhas.", "Where pregunta el lugar; usually indica costumbre. La persona quiere saber adónde vas de excursión.", "Where fragt nach dem Ort; usually bezeichnet eine Gewohnheit. Die Person fragt nach deinen Wanderzielen."])),
    ], contrast: [cooking, hiking],
  },
  translate: {
    context: ["Você conversa sobre como relaxar.", "Hablas de cómo relajarte.", "Du sprichst darüber, wie du dich entspannst."],
    setting: ["A pessoa quer conhecer sua rotina. Ela pergunta:", "La persona quiere conocer tu rutina. Te pregunta:", "Die Person möchte deinen Alltag kennenlernen. Sie fragt:"],
    question: "What do you usually do to relax?", questionMeaning: ["O que você costuma fazer para relaxar?", "¿Qué sueles hacer para relajarte?", "Was machst du normalerweise, um dich zu entspannen?"],
    answers: [
      answer("first", [listen, need, breakTime], ["Eu geralmente ouço música quando preciso de uma pausa.", "Normalmente escucho música cuando necesito una pausa.", "Ich höre meistens Musik, wenn ich eine Pause brauche."], reaction("What kind of music helps you relax?", ["Que tipo de música ajuda você a relaxar?", "¿Qué tipo de música te ayuda a relajarte?", "Welche Art von Musik hilft dir beim Entspannen?"], ["What kind of pergunta pelo tipo. Helps you relax liga essa música ao efeito que ela tem em você.", "What kind of pregunta por el tipo. Helps you relax conecta esa música con el efecto que tiene en ti.", "What kind of fragt nach der Art. Helps you relax verbindet die Musik mit ihrer entspannenden Wirkung."])),
      answer("second", [walk, feel, stressed], ["Eu prefiro sair para caminhar quando me sinto estressado(a).", "Prefiero salir a caminar cuando me siento estresado/a.", "Ich gehe lieber spazieren, wenn ich mich gestresst fühle."], reaction("A walk always helps me too.", ["Uma caminhada sempre me ajuda também.", "Un paseo siempre me ayuda a mí también.", "Ein Spaziergang hilft mir auch immer."], ["A walk retoma a caminhada que você citou. Always é sempre; me too mostra que a pessoa tem esse hábito em comum.", "A walk retoma el paseo. Always significa siempre; me too indica que la otra persona comparte la experiencia.", "A walk greift den Spaziergang auf. Always heißt immer; me too zeigt, dass ihr diese Erfahrung teilt."])),
    ], contrast: [listen, walk],
  },
};

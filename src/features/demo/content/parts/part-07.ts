import { choice, response, scene } from "../builders";
export const part07 = [
  response({ id: "p7.tired", part: 7, image: "V06", context: "Demonstre interesse e uma pequena surpresa. Tente lembrar a expressão curta que ela usou quando você falou do café.", heard: ["C12"], response: "U09", mode: "recall", next: "p7.work", help: ["I’m tired. → Estou cansada. Quando você comentou sobre o café, ela reagiu com uma expressão curta de surpresa e interesse.", "Really? → Sério?"] }),
  scene("p7.work", 7, "V06", "Ela conta um pouco mais sobre seu cansaço e pergunta sobre você.", ["C13"], "p7.opinion"),
  choice("p7.opinion", 7, "V06", "E você, como está?", "O que você quer responder?", [{ id: "too", label: "Também estou cansado", next: "p7.too" }, { id: "not", label: "Não muito", next: "p7.not" }]),
  response({ id: "p7.too", part: 7, image: "V06", context: "Dizer que você também está cansado.", response: "U04", mode: "recall", next: "p7.long-day" }),
  response({ id: "p7.not", part: 7, image: "V06", context: "Dizer que você não está muito cansado.", response: "U07", mode: "recall", next: "p7.lucky" }),
  scene("p7.long-day", 7, "V06", "Ela reage ao que você contou.", ["C14"], "p8.table"),
  scene("p7.lucky", 7, "V06", "Ela reage ao que você contou.", ["C15"], "p8.table"),
];

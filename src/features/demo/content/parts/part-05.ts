import { choice, response, scene } from "../builders";
export const part05 = [
  scene("p5.taste", 5, "V05", "Você experimenta seu café. Ele também prova o dele.", ["C06"], "p5.opinion"),
  choice("p5.opinion", 5, "V05", "Agora ele quer saber sua opinião sobre o café. As duas respostas são válidas.", "O que você quer responder?", [{ id: "like", label: "Sim, eu gosto", next: "p5.like" }, { id: "not", label: "Não muito", next: "p5.not" }], ["C07"]),
  response({ id: "p5.like", part: 5, image: "V05", context: "Dizer que você gosta do café.", response: "U06", mode: "blocks", teach: true, blocks: [{ id: "it", text: "it" }, { id: "like", text: "I like" }], answer: ["like", "it"], next: "p5.reaction-like" }),
  response({ id: "p5.not", part: 5, image: "V05", context: "Dizer que não gosta muito do café.", response: "U07", mode: "whole", next: "p5.reaction-not" }),
  scene("p5.reaction-like", 5, "V05", "Ele reage à sua opinião.", ["C08"], "p6.warn"),
  scene("p5.reaction-not", 5, "V05", "Ele reage à sua opinião.", ["C09"], "p6.warn"),
];

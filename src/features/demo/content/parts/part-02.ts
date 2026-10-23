import { response, scene } from "../builders";
import type { DemoNode } from "../../model/types";
const blocks = [{ id: "mine", text: "mine" }, { id: "no", text: "No" }, { id: "negative", text: "it’s not" }, { id: "positive", text: "it’s" }];
const answer = ["no", "negative", "mine"];
const help = ["Seu copo leva BASEDSPEAK. O copo mostrado leva LUCAS. Ele não é seu.", "No, ___ ___. Peças: it’s not / mine.", "No, it’s not mine. → Não, não é meu."];
export const part02: DemoNode[] = [
  { id: "p2.question", part: 2, image: "V02", kind: "comprehension", context: "Observe o copo e o gesto. O que ele está perguntando?", next: "p2.model", help: ["this → o café; yours → relação com você. Observe para onde ele está apontando."] },
  scene("p2.model", 2, "V02", "Seu copo leva BASEDSPEAK. O primeiro copo leva LUCAS. Você quer dizer que não é seu.", [], "p2.prepare", "Preparar resposta"),
  response({ id: "p2.prepare", part: 2, image: "V02", context: "Monte a resposta. Aqui você está preparando a frase, antes de responder à personagem.", response: "U01", mode: "blocks", blocks, answer, preparationOnly: true, next: "p2.meaning", help }),
  scene("p2.meaning", 2, "V02", "No → Não · it’s not → não é · mine → meu. A frase está preparada. Na próxima etapa, responda à personagem.", [], "p2.send"),
  response({ id: "p2.send", part: 2, image: "V02", context: "Agora responda à personagem. Seu pedido continua consultável: BASEDSPEAK.", response: "U01", mode: "blocks", blocks, answer, next: "p2.reaction", help }),
  scene("p2.reaction", 2, "V03", "O mal-entendido terminou. Ele começa a voltar à própria espera.", ["C02"], "p3.intent"),
];

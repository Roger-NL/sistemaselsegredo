import { response, scene } from "../builders";
import type { DemoNode } from "../../model/types";
const blocks = [{ id: "mine", text: "mine" }, { id: "no", text: "No" }, { id: "negative", text: "it’s not" }, { id: "positive", text: "it’s" }];
const answer = ["no", "negative", "mine"];
const help = ["Seu copo leva based. O copo mostrado leva LUCAS. Ele não é seu.", "No, ___ ___. Peças: it’s not / mine.", "No, it’s not mine. → Não, não é meu."];
export const part02: DemoNode[] = [
  { ...scene("p2.prompt", 2, "V02", "O que ele está perguntando?", [], "p2.question", "Ver a pergunta e as opções"), presentation: "prompt" },
  { id: "p2.question", part: 2, image: "V02", kind: "comprehension", context: "Observe o copo e o gesto. O que ele está perguntando?", next: "p2.send", help: ["this → o café; yours → relação com você. Observe para onde ele está apontando."] },
  response({ id: "p2.send", part: 2, image: "V02", context: "O copo mostrado é de Lucas. Diga a ele que não é seu.", response: "U01", mode: "blocks", blocks, answer, next: "p2.reaction", help }),
  scene("p2.reaction", 2, "V03", "O mal-entendido terminou. Ele começa a voltar à própria espera.", ["C02"], "p3.prompt"),
];

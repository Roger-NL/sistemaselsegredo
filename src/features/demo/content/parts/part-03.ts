import { choice, response, scene } from "../builders";
import type { DemoNode } from "../../model/types";
export const part03: DemoNode[] = [
  { ...scene("p3.prompt", 3, "V03", "Como você quer continuar a conversa?", [], "p3.intent", "Ver minhas opções"), presentation: "prompt" },
  choice("p3.intent", 3, "V03", "O mal-entendido terminou.", "O que você quer fazer?", [
    { id: "ask", label: "Perguntar o que ele pediu", next: "p3.ask" },
    { id: "okay", label: "Dizer que está tudo bem", next: "p3.okay" },
  ]),
  response({ id: "p3.ask", part: 3, image: "V03", context: "Perguntar o que ele pediu.", response: "U02", mode: "blocks", teach: true, blocks: [{ id: "order", text: "order?" }, { id: "what", text: "What did you" }], answer: ["what", "order"], next: "p4.order" }),
  response({ id: "p3.okay", part: 3, image: "V03", context: "Responder à desculpa, dizendo que está tudo bem.", response: "U03", mode: "whole", next: "p4.new-cup" }),
];

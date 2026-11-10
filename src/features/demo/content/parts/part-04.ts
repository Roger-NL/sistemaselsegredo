import { response, scene } from "../builders";
export const part04 = [
  scene("p4.order", 4, "V03", "Ele volta sua atenção à conversa e conta o que pediu.", ["C03"], "p4.same"),
  response({ id: "p4.same", part: 4, image: "V03", context: "Lucas pediu um café com gelo. Diga que você também pediu isso.", response: "U04", mode: "whole", next: "p4.nice-a" }),
  scene("p4.nice-a", 4, "V03", "Vocês conferem os cafés no balcão.", ["C04"], "p4.arrival-a"),
  scene("p4.arrival-a", 4, "V04", "Lucas reconhece seu copo LUCAS. O seu copo já está no balcão com BASEDSPEAK.", ["C05"], "p5.taste"),
  scene("p4.new-cup", 4, "V04", "Lucas pergunta sobre outro café no balcão. Desta vez, o café é seu.", ["C01"], "p4.mine"),
  response({ id: "p4.mine", part: 4, image: "V04", context: "Agora Lucas pergunta sobre o seu café. Confirme que ele é seu.", response: "U05", mode: "blocks", blocks: [{ id: "mine", text: "mine" }, { id: "negative", text: "it’s not" }, { id: "yes", text: "Yes" }, { id: "positive", text: "it’s" }], answer: ["yes", "positive", "mine"], next: "p4.nice-b", help: ["Desta vez o café é seu. Yes → Sim.", "Yes, ___ ___. Peças: it’s / mine.", "Yes, it’s mine. → Sim, é meu."] }),
  scene("p4.nice-b", 4, "V04", "Você pega o café BASEDSPEAK.", ["C04"], "p4.arrival-b"),
  scene("p4.arrival-b", 4, "V05", "Lucas confirma o nome LUCAS no próprio copo. Agora ambos estão com seus cafés.", ["C05"], "p5.taste"),
];

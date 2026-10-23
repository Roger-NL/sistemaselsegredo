import { response, scene } from "../builders";
export const part04 = [
  scene("p4.order", 4, "V03", "Ele volta sua atenção à conversa e conta o que pediu.", ["C03"], "p4.same"),
  response({ id: "p4.same", part: 4, image: "V03", context: "Dizer que você pediu o mesmo.", response: "U04", mode: "whole", next: "p4.nice-a" }),
  scene("p4.nice-a", 4, "V03", "Vocês continuam esperando seus pedidos.", ["C04"], "p4.arrival-a"),
  scene("p4.arrival-a", 4, "V04", "Lucas reconhece seu copo LUCAS. O seu café chega com BASEDSPEAK.", ["C05"], "p5.taste"),
  scene("p4.new-cup", 4, "V04", "Ao conferir os cafés, Lucas aponta para o copo identificado como BASEDSPEAK.", ["C01"], "p4.mine"),
  response({ id: "p4.mine", part: 4, image: "V04", context: "Agora o café é seu. Confira BASEDSPEAK no copo e no seu pedido e adapte a resposta.", response: "U05", mode: "blocks", blocks: [{ id: "mine", text: "mine" }, { id: "negative", text: "it’s not" }, { id: "yes", text: "Yes" }, { id: "positive", text: "it’s" }], answer: ["yes", "positive", "mine"], next: "p4.nice-b", help: ["Compare BASEDSPEAK no pedido e no copo. Yes → Sim.", "Yes, ___ ___. Peças: it’s / mine.", "Yes, it’s mine. → Sim, é meu."] }),
  scene("p4.nice-b", 4, "V04", "Você pega o café BASEDSPEAK.", ["C04"], "p4.arrival-b"),
  scene("p4.arrival-b", 4, "V05", "Lucas confirma o nome LUCAS no próprio copo. Agora ambos estão com seus cafés.", ["C05"], "p5.taste"),
];

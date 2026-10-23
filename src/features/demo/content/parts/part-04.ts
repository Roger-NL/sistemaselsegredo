import { response, scene } from "../builders";
export const part04 = [
  scene("p4.order", 4, "V04", "Ela volta sua atenção à conversa e conta o que pediu.", ["C03"], "p4.same"),
  response({ id: "p4.same", part: 4, image: "V04", context: "Dizer que você pediu o mesmo.", response: "U04", mode: "whole", next: "p4.nice-a" }),
  scene("p4.nice-a", 4, "V04", "Vocês continuam esperando seus pedidos.", ["C04"], "p4.arrival-a"),
  scene("p4.arrival-a", 4, "V05", "Ela pega seu café. Depois chega seu pedido #24. O café dela não é o copo SARAH / #18.", ["C05"], "p5.taste"),
  scene("p4.new-cup", 4, "V05", "Os dois esperam. Chega outro café, identificado como #24.", ["C01"], "p4.mine"),
  response({ id: "p4.mine", part: 4, image: "V05", context: "Agora o café é seu. Confira #24 no copo e no seu pedido e adapte a resposta.", response: "U05", mode: "blocks", blocks: [{ id: "mine", text: "mine" }, { id: "negative", text: "it’s not" }, { id: "yes", text: "Yes" }, { id: "positive", text: "it’s" }], answer: ["yes", "positive", "mine"], next: "p4.nice-b", help: ["Compare #24 no pedido e no copo. Yes → Sim.", "Yes, ___ ___. Peças: it’s / mine.", "Yes, it’s mine. → Sim, é meu."] }),
  scene("p4.nice-b", 4, "V05", "Você pega o café #24.", ["C04"], "p4.arrival-b"),
  scene("p4.arrival-b", 4, "V06", "Depois chega o pedido dela. Agora ambos estão com seus cafés.", ["C05"], "p5.taste"),
];

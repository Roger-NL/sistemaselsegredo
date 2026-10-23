import { response, scene } from "../builders";
export const part06 = [
  response({ id: "p6.warn", part: 6, image: "V06", context: "O copo de Lucas está prestes a cair. Você quer avisá-lo. Sem pressa: a cena espera por você.", response: "U08", mode: "whole", button: "Avisar", next: "p6.safe", help: ["Careful! → Cuidado! Serve para alertar alguém sobre um risco."] }),
  scene("p6.safe", 6, "V07", "Ele segura o copo a tempo. O risco passou.", ["C10", "C11"], "p7.tired"),
];

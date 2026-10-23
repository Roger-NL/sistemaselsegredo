import { choice, response, scene } from "../builders";
import type { DemoNode } from "../../model/types";
export const part10: DemoNode[] = [
  scene("p10.quiet", 10, "V10", "Vocês continuam conversando no mesmo lugar.", ["C27"], "p10.here", "Dizer que gosto daqui"),
  response({ id: "p10.here", part: 10, image: "V10", context: "Dizer que você gosta daqui. here → aqui.", response: "U17", mode: "recombine", skeleton: "I like it ___", blocks: [{ id: "here", text: "here" }], answer: ["here"], next: "p10.here-reaction", button: "Responder" }),
  scene("p10.here-reaction", 10, "V10", "Vocês compartilham mais um pouco do café.", ["C25"], "p10.contact"),
  choice("p10.contact", 10, "V12", "Antes de se despedir.", "O que você quer fazer?", [{ id: "bye", label: "Apenas me despedir", next: "p10.farewell" }, { id: "contact", label: "Sugerir manter contato", next: "p10.keep" }]),
  response({ id: "p10.keep", part: 10, image: "V12", context: "Sugerir manter contato, sem preencher dados pessoais.", response: "U18", mode: "blocks", teach: true, blocks: [{ id: "touch", text: "keep in touch?" }, { id: "can", text: "Can we" }], answer: ["can", "touch"], next: "p10.sure" }),
  scene("p10.sure", 10, "V12", "Vocês combinam como manter contato.", ["C28"], "p10.farewell"),
  response({ id: "p10.farewell", part: 10, image: "V12", context: "Me despedir em inglês.", response: "U19", mode: "whole", next: "p10.bye" }),
  response({ id: "p10.bye", part: 10, image: "V12", context: "Uma última troca antes de encerrar o encontro.", heard: ["C29"], response: "U20", mode: "whole", next: "end" }),
  { id: "end", part: 10, image: "V12", context: "Você participou desta conversa em inglês.", kind: "end", help: [] },
];

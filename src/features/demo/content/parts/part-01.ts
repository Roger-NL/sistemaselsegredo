import { scene } from "../builders";
import type { SceneNode } from "../../model/types";
export const part01: SceneNode[] = [
  { ...scene("p1.first", 1, "V01", "Um encontro na cafeteria.", [], "p1.context", "Avançar"), presentation: "title" },
  { ...scene("p1.context", 1, "V01", "Você e Lucas se encontram no balcão da cafeteria. Ele aponta para um copo e pergunta.", [], "p1.lucas", "Começar a história"), presentation: "context" },
  { ...scene("p1.lucas", 1, "V01", "", ["C01"], "p2.prompt", "Entender a pergunta"), presentation: "dialogue", help: [] },
];

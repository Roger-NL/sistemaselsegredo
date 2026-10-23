import type { AudioId, ImageId } from "../model/types";

// Approved inventory, PDF pages 47–52. Voices resolve through the global server cache on explicit request; final illustrations remain pending.
const character = [
  ["Is this yours?", "Esse café é seu?"], ["Oh! Sorry!", "Ah! Desculpa!"],
  ["An iced coffee. And you?", "Um café com gelo. E você?"], ["Nice!", "Legal!"],
  ["Oh! This is mine.", "Ah! Este é meu."], ["Oh… it’s sweet.", "Ah… é doce."],
  ["Do you like it?", "Você gosta?"], ["Really? Me too!", "Sério? Eu também!"],
  ["Really? I like it.", "Sério? Eu gosto."], ["Oh! Thanks!", "Ah! Obrigado!"],
  ["That was close.", "Foi por pouco."], ["I’m tired.", "Estou cansado."],
  ["Yeah. Too much work. And you?", "Sim. Muito trabalho. E você?"],
  ["Yeah… long day.", "É… um dia longo."], ["Lucky you!", "Que sorte a sua!"],
  ["Oh, a table!", "Ah, uma mesa!"], ["Sit with me?", "Senta comigo?"],
  ["Oh, nice!", "Ah, legal!"], ["Yeah, I like it. But I’m tired.", "Sim, eu gosto. Mas estou cansado."],
  ["Me too. I like English.", "Eu também. Gosto de inglês."], ["Really?", "Sério?"],
  ["Yeah, I like it.", "Sim, eu gosto."], ["I need a break.", "Preciso de uma pausa."],
  ["Do you like this café?", "Você gosta desta cafeteria?"], ["Me too.", "Eu também."],
  ["Oh, okay.", "Ah, tudo bem."], ["It’s quiet here.", "É tranquilo aqui."],
  ["Sure!", "Claro!"], ["You too. Bye!", "Também gostei. Tchau!"], ["Me too!", "Eu também!"],
] as const;
const you = [
  ["No, it’s not mine.", "Não, não é meu."], ["What did you order?", "O que você pediu?"],
  ["It’s okay.", "Tudo bem."], ["Me too.", "Eu também."], ["Yes, it’s mine.", "Sim, é meu."],
  ["I like it.", "Eu gosto."], ["Not really.", "Não muito."], ["Careful!", "Cuidado!"],
  ["Really?", "Sério?"], ["Yeah, sure.", "Sim, claro."],
  ["I’m learning English.", "Estou aprendendo inglês."], ["Do you like your job?", "Você gosta do seu trabalho?"],
  ["Do you like this café?", "Você gosta desta cafeteria?"], ["Yeah, I like it.", "Sim, eu gosto."],
  ["I can stay a little longer.", "Posso ficar mais um pouco."], ["I have to go.", "Tenho que ir."],
  ["I like it here.", "Eu gosto daqui."], ["Can we keep in touch?", "Podemos manter contato?"],
  ["Nice talking to you.", "Foi bom conversar com você."], ["Bye!", "Tchau!"],
] as const;

export type AudioAsset = { id: AudioId; text: string; meaning: string; role: "character" | "you"; delivery: "server-cache" };
export const audio = Object.fromEntries([
  ...character.map(([text, meaning], i) => ({ id: `C${String(i + 1).padStart(2, "0")}` as AudioId, text, meaning, role: "character" as const })),
  ...you.map(([text, meaning], i) => ({ id: `U${String(i + 1).padStart(2, "0")}` as AudioId, text, meaning, role: "you" as const })),
].map(asset => [asset.id, { ...asset, delivery: "server-cache" }])) as Record<AudioId, AudioAsset>;

export type ImageAsset = { id: ImageId; description: string; path: string; mobile: string; ready: true };
const scenes = [
 "Lucas e BASEDSPEAK se encontram no balcão da cafeteria.",
 "Lucas aponta o copo escrito LUCAS; o seu copo leva BASEDSPEAK.",
 "Lucas pede desculpas pelo mal-entendido.",
 "Chega o café com o nome BASEDSPEAK. Lucas segura o copo LUCAS.",
 "Os dois provam seus cafés.",
 "O copo de Lucas está prestes a cair. A cena espera por você.",
 "Lucas segura o copo a tempo.",
 "Lucas conta sobre um dia cansativo.",
 "Lucas convida BASEDSPEAK para uma mesa livre.",
 "Lucas e BASEDSPEAK conversam à mesa.",
 "BASEDSPEAK conta que está aprendendo inglês.",
 "Lucas e BASEDSPEAK se despedem na cafeteria.",
] as const;
export const images = Object.fromEntries(scenes.map((description, i) => {
 const id = `V${String(i + 1).padStart(2, "0")}` as ImageId;
 return [id, { id, description, path: `/demo/cafe/v2/images/${id}-960.webp`, mobile: `/demo/cafe/v2/images/${id}-640.webp`, ready: true }];
})) as Record<ImageId, ImageAsset>;

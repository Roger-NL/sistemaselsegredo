import type { AudioId, ImageId } from "../model/types";

// Approved inventory, PDF pages 47–52. Pending media must never be called production-ready.
const character = [
  ["Is this yours?", "Esse café é seu?"], ["Oh! Sorry!", "Ah! Desculpa!"],
  ["An iced coffee. And you?", "Um café com gelo. E você?"], ["Nice!", "Legal!"],
  ["Oh! This is mine.", "Ah! Este é meu."], ["Oh… it’s sweet.", "Ah… é doce."],
  ["Do you like it?", "Você gosta?"], ["Really? Me too!", "Sério? Eu também!"],
  ["Really? I like it.", "Sério? Eu gosto."], ["Oh! Thanks!", "Ah! Obrigada!"],
  ["That was close.", "Foi por pouco."], ["I’m tired.", "Estou cansada."],
  ["Yeah. Too much work. And you?", "Sim. Muito trabalho. E você?"],
  ["Yeah… long day.", "É… um dia longo."], ["Lucky you!", "Que sorte a sua!"],
  ["Oh, a table!", "Ah, uma mesa!"], ["Sit with me?", "Senta comigo?"],
  ["Oh, nice!", "Ah, legal!"], ["Yeah, I like it. But I’m tired.", "Sim, eu gosto. Mas estou cansada."],
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

export type AudioAsset = { id: AudioId; text: string; meaning: string; role: "character" | "you"; path: string; ready: boolean };
export const audio = Object.fromEntries([
  ...character.map(([text, meaning], i) => ({ id: `C${String(i + 1).padStart(2, "0")}` as AudioId, text, meaning, role: "character" as const })),
  ...you.map(([text, meaning], i) => ({ id: `U${String(i + 1).padStart(2, "0")}` as AudioId, text, meaning, role: "you" as const })),
].map(asset => [asset.id, { ...asset, path: `/demo/cafe/v1/audio/${asset.id}.mp3`, ready: false }])) as Record<AudioId, AudioAsset>;

export type ImageAsset = { id: ImageId; description: string; path: string; preview: string; ready: boolean };
const scenes = [
  ["Cliente aponta para o copo no balcão de retirada.", "counter"],
  ["Primeiro copo: SARAH / #18. Seu pedido é #24.", "counter"],
  ["O mal-entendido acabou. Ela volta à espera.", "counter"],
  ["Ela volta sua atenção à conversa.", "counter"],
  ["Chega o pedido #24, seu café com gelo.", "counter"],
  ["Ambos estão com seus cafés.", "tasting"],
  ["O copo está inclinado, prestes a cair. A cena espera por você.", "careful"],
  ["Uma mesa próxima fica livre.", "seated"],
  ["Vocês estão sentados, com os cafés sobre a mesa.", "seated"],
] as const;
export const images = Object.fromEntries(scenes.map(([description, preview], i) => {
  const id = `V0${i + 1}` as ImageId;
  return [id, { id, description, path: `/demo/cafe/v1/images/${id}.webp`, preview: `/demo/cafe/v1/previews/${preview}.jpg`, ready: false }];
})) as Record<ImageId, ImageAsset>;

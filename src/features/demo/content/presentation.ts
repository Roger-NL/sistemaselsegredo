import type { DemoNode, SceneNode } from "../model/types";

type Card = Pick<SceneNode, "presentation" | "context" | "heard" | "button">;
const moments: Record<string, [string, string]> = {
  "p4.arrival-a": ["Seu café chegou.", "Lucas confere o nome no próprio copo. O café com o nome based chega ao balcão."],
  "p5.taste": ["O primeiro gole.", "Vocês experimentam os cafés. Lucas comenta o sabor do dele."],
  "p6.warn": ["Cuidado com o copo!", "O copo de Lucas está prestes a cair. Você pode avisá-lo. Sem pressa: a cena espera por você."],
  "p7.tired": ["Um dia longo.", "Com o copo seguro, a conversa recomeça. Lucas conta como está se sentindo."],
  "p8.table": ["Uma mesa para dois.", "Uma mesa próxima fica livre. Lucas olha para ela e faz um convite."],
  "p9.pause": ["Mais um pouco de conversa?", "Há uma pequena pausa. Você pode ficar mais um pouco ou começar a se despedir."],
  "p10.contact": ["Até a próxima conversa.", "Chegou a hora de se despedir. Você pode encerrar o encontro ou sugerir manter contato."],
};
const prompts: Record<string, string> = {
  "p3.ask": "Pergunte o que Lucas pediu.", "p3.okay": "Responda à desculpa: diga que está tudo bem.",
  "p4.same": "Diga que você pediu o mesmo.", "p4.mine": "O copo com o nome based é seu. Como confirmar isso?",
  "p5.like": "Diga que você gosta do café.", "p5.not": "Diga que não gosta muito do café.",
  "p6.warn": "Como avisar Lucas sobre o copo?", "p7.tired": "Mostre interesse e surpresa com o que Lucas contou.",
  "p7.too": "Diga que você também está cansado.", "p7.not": "Diga que você não está muito cansado.",
  "p8.accept": "Aceite o convite para sentar.", "p8.english": "Conte que você está aprendendo inglês.",
  "p8.job": "Pergunte se Lucas gosta do trabalho. your job significa seu trabalho.",
  "p9.english-like": "Diga que você gosta de aprender inglês.", "p9.english-not": "Diga que não gosta muito de aprender inglês.",
  "p9.cafe": "Pergunte se Lucas gosta desta cafeteria. this café significa esta cafeteria.",
  "p9.cafe-like": "Diga que você gosta desta cafeteria.", "p9.cafe-not": "Diga que não gosta muito desta cafeteria.",
  "p9.stay": "Diga que você pode ficar mais um pouco.", "p9.go": "Diga que você precisa ir.",
  "p10.here": "Diga que você gosta daqui. here significa aqui.",
  "p10.keep": "Sugira manter contato, sem preencher dados pessoais.",
  "p10.farewell": "Diga que foi bom conversar com Lucas.", "p10.bye": "Responda à despedida com um tchau.",
};
// Choosing one of these intentions already gives the instruction. Go straight
// to that level's model or activity instead of asking the learner to read it twice.
const chosenIntent = new Set(["p3.ask", "p3.okay", "p5.like", "p5.not", "p7.too", "p7.not", "p8.english", "p9.english-like", "p9.english-not", "p9.cafe-like", "p9.cafe-not", "p10.keep"]);
/** Reading cards never send a reply. Reaction audio is always the first card. */
export function presentationCards(node: DemoNode): Card[] {
  if (node.part < 3 || node.kind === "end" || (node.kind === "scene" && node.presentation)) return [];
  const cards: Card[] = [];
  const moment = moments[node.id];
  if (moment) cards.push(
    { presentation: "title", context: moment[0], button: "Ver o que acontece" },
    { presentation: "context", context: moment[1], button: node.heard?.length ? "Ouvir o que Lucas diz" : "Ver como participar" },
  );
  if (node.kind === "scene") return cards;
  if (node.heard?.length) cards.push({ presentation: "dialogue", context: "", heard: node.heard, button: node.id === "p8.topic" ? "Acompanhar até a mesa" : "Pensar na resposta" });
  if (node.id === "p8.topic") cards.push({ presentation: "context", context: "Vocês se sentam com os cafés sobre a mesa. Agora você pode puxar um assunto.", button: "Escolher um assunto" });
  if (node.id === "p9.english-opinion") cards.unshift({ presentation: "context", context: "Lucas quer saber sua opinião sobre aprender inglês.", button: "Ouvir a pergunta" });
  if (node.id === "p9.cafe-opinion") cards.unshift({ presentation: "context", context: "O assunto agora é a cafeteria. Lucas quer saber o que você acha daqui.", button: "Ouvir a pergunta" });
  // Part 3 already has its own instruction card. The pause/contact contexts
  // introduce those choices completely, without repeating the same question.
  if (node.kind === "response" && !chosenIntent.has(node.id)) cards.push({ presentation: "prompt", context: prompts[node.id] ?? node.context, button: "Preparar minha resposta" });
  else if (node.kind === "choice" && node.id !== "p3.intent" && !moment && node.id !== "p8.topic") cards.push({ presentation: "prompt", context: node.id === "p7.opinion" ? "E você, como está?" : node.prompt, button: "Ver minhas opções" });
  return cards;
}

export const nextSceneLabels: Record<string, string> = {
  "p2.reaction": "Escolher como seguir",
  "p4.order": "Responder sobre meu pedido", "p4.nice-a": "Ver os cafés chegarem", "p4.arrival-a": "Provar meu café",
  "p4.new-cup": "Responder sobre o copo", "p4.nice-b": "Conferir os dois cafés", "p4.arrival-b": "Provar meu café",
  "p5.taste": "Ouvir a próxima pergunta", "p5.reaction-like": "Acompanhar a cena", "p5.reaction-not": "Acompanhar a cena",
  "p6.safe": "Retomar a conversa", "p7.work": "Pensar em como estou", "p7.long-day": "Ver o que acontece", "p7.lucky": "Ver o que acontece",
  "p8.table": "Responder ao convite", "p8.nice": "Ouvir a próxima pergunta", "p8.job-reaction": "Ouvir mais sobre o trabalho",
  "p9.break": "Ouvir a pergunta sobre a cafeteria", "p9.cafe-reaction": "Decidir como seguir",
  "p9.work-positive": "Decidir como seguir", "p9.work-negative": "Decidir como seguir",
  "p9.stay-reaction": "Aproveitar mais um pouco", "p9.go-reaction": "Preparar a despedida",
  "p10.here-reaction": "Preparar a despedida", "p10.sure": "Me despedir de Lucas",
};

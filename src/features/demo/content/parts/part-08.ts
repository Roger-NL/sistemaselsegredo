import { choice, response, scene } from "../builders";
export const part08 = [
  scene("p8.table", 8, "V09", "Uma mesa próxima fica livre. Ele convida você para sentar.", ["C16", "C17"], "p8.accept", "Sim, vamos"),
  response({ id: "p8.accept", part: 8, image: "V09", context: "Aceitar o convite para sentar.", response: "U10", mode: "whole", next: "p8.topic" }),
  choice("p8.topic", 8, "V10", "Vocês se sentam, com os cafés sobre a mesa.", "O que você quer fazer?", [{ id: "english", label: "Contar que você está aprendendo inglês", next: "p8.english" }, { id: "job", label: "Perguntar se ele gosta do trabalho", next: "p8.job" }]),
  response({ id: "p8.english", part: 8, image: "V11", context: "Compartilhar algo sobre você.", response: "U11", mode: "blocks", teach: true, blocks: [{ id: "english", text: "English" }, { id: "learning", text: "I’m learning" }], answer: ["learning", "english"], next: "p8.nice" }),
  scene("p8.nice", 8, "V11", "Ele demonstra interesse no que você contou.", ["C18"], "p9.english-opinion"),
  response({ id: "p8.job", part: 8, image: "V10", context: "Perguntar se ele gosta do trabalho. your job → seu trabalho.", response: "U12", mode: "recombine", skeleton: "Do you like ___?", blocks: [{ id: "job", text: "your job" }], answer: ["job"], next: "p8.job-reaction" }),
  scene("p8.job-reaction", 8, "V10", "O trabalho e o cansaço dele viram assunto.", ["C19"], "p9.break"),
];

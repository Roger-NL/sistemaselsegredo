/** One small idea per click. Scene navigation always starts at that scene's first frame. */
export const presentationSteps = [
  {
    label: "Boas-vindas", visual: "welcome",
    frames: [
      { sound: "presentation-welcome", eyebrow: "Um encontro de cada vez", title: "Seu inglês|começa aqui.", description: "Uma história. Sua participação. Novas possibilidades." },
      { sound: "presentation-ready", eyebrow: "Boas-vindas ao BasedSpeak", title: "Tudo pronto.|A conversa é sua.", description: "Sua conta está pronta. Comece a conversa e o estudo no seu ritmo." },
    ],
  },
  {
    label: "Conversa", visual: "cafe",
    frames: [
      { sound: "presentation-cafe", eyebrow: "01 / A cafeteria", title: "Um café.|Você e Lucas.", description: "Escute. Escolha. Construa sua resposta." },
      { sound: "presentation-support", eyebrow: "Você escolhe o apoio", title: "Do seu jeito.|No seu ritmo.", description: "Três apoios: Guiado, Com pistas ou Mais autônomo. Sem microfone." },
    ],
  },
  {
    label: "Estudo", visual: "study",
    frames: [
      { sound: "presentation-study", eyebrow: "02 / Estudo guiado", title: "A história continua.|Agora, tudo faz sentido.", description: "Oito blocos para explorar o inglês da sua conversa." },
      { sound: "presentation-practice", eyebrow: "Um pequeno passo por vez", title: "Ouvir. Montar.|Escrever. Descobrir.", description: "24 etapas para explorar o inglês. Um pequeno passo por vez." },
    ],
  },
  {
    label: "Aula gratuita", visual: "class",
    frames: [
      { sound: "presentation-unlock", eyebrow: "03 / Uma conquista sua", title: "Estudo em 100%.|Uma nova porta aberta.", description: "Concluir as 24 etapas libera uma aula gratuita com professor." },
      { sound: "presentation-lesson", eyebrow: "Da história para uma conversa ao vivo", title: "Uma hora.|Com professor.", description: "Uma aula por conta. Peça um horário e acompanhe a confirmação no painel." },
    ],
  },
  {
    label: "Meu painel", visual: "dashboard",
    frames: [
      { sound: "presentation-dashboard", eyebrow: "Seu próximo passo está aqui", title: "Tudo no seu lugar.|Vamos começar?", description: "Conversa, estudo, aula e professor. Encontre tudo no Meu painel." },
    ],
  },
] as const;

export const presentationFrames = presentationSteps.flatMap((step, stepIndex) => step.frames.map((frame, frameIndex) => ({ ...frame, stepIndex, frameIndex, visual: step.visual })));
export const presentationSceneStart = (stepIndex: number) => presentationFrames.findIndex(frame => frame.stepIndex === stepIndex);

/** First viewing follows the frames in order; review can jump freely. */
export function canVisitPresentationScene(stepIndex: number, furthestFrame: number, review: boolean) {
  const start = presentationSceneStart(stepIndex);
  return start >= 0 && (review || start <= furthestFrame);
}

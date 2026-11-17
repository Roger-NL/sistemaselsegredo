/** Exact copy for the locally recorded Portuguese guide clips. */
const SCRIPT = {
  welcome: "Primeiro, escute a Ana.",
  repeat: "Para ouvir de novo, clique neste botão.",
  next: "Agora, clique aqui para experimentar.",
  drag: "Olhe só. Segure esta fala, arraste até aqui e solte.",
  "your-turn": "Agora é com você. Arraste a fala até a Ana.",
  click: "Você também pode clicar na fala e depois clicar na Ana.",
  success: "Isso! Você conseguiu. Clique aqui para começar a aula.",
  "word-pieces": "Monte a fala com estas peças. Para tentar de novo, toque em Refazer.",
  "write-check": "Agora escreva a fala e toque em Conferir. Para corrigir o texto, use Apagar.",
} as const;

export type TutorialNarrationId = keyof typeof SCRIPT;
export type TutorialNarration = {
  id: TutorialNarrationId;
  person: "nina";
  role: "narration";
  text: string;
  key: string;
  url: string;
};

export const TUTORIAL_NARRATIONS = Object.freeze(Object.fromEntries(
  Object.entries(SCRIPT).map(([id, text]) => [id, Object.freeze({ id, text, person: "nina", role: "narration", key: `nina:${text}`, url: `/first-encounters/audio/tutorial-pt/nina-${id}.m4a` })]),
) as Record<TutorialNarrationId, TutorialNarration>);

export function getTutorialNarration(id: TutorialNarrationId): TutorialNarration {
  return TUTORIAL_NARRATIONS[id];
}

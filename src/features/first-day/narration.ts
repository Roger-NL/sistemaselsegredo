export const FIRST_DAY_AUDIO_RATE = 1.3;

export const coverCopy = {
  title: "First Day",
  subtitle: ["Uma cadeira livre.", "Uma primeira conversa em inglês."],
  start: "Começa a história",
} as const;

export const examplesCopy = {
  title: "Três pedidos, uma ideia",
  description: "Na janela, à mesa e com o gibi, você está pedindo permissão. A situação muda, mas a forma de pedir é a mesma.",
} as const;

export const permissionRuleCopy = {
  title: "Peça permissão",
  lead: "“Can I…?” é um jeito de pedir permissão.",
  detail: "Depois de Can I, diga o que você quer fazer. Por exemplo, sentar ou abrir.",
} as const;

export const narration = {
  cover: { text: `${coverCopy.title}. ${coverCopy.subtitle.join(" ")} ${coverCopy.start}.` },
  lunchtime: {
    text: "It’s lunchtime. You pick up your tray and look for a seat.",
    translation: "No intervalo, você pega a bandeja e procura um lugar.",
  },
  "empty-chair": {
    text: "Ana is reading a comic. There’s an empty chair next to her.",
    translation: "Ana lê um gibi. Há uma cadeira livre ao lado dela.",
  },
  "ana-looks-up": {
    text: "Ana looks up and moves her bag.",
    translation: "Ana levanta os olhos e afasta a bolsa.",
  },
  "sit-beside-ana": {
    text: "You put your tray down and sit beside her.",
    translation: "Você põe a bandeja na mesa e se senta ao lado de Ana.",
  },
  "ana-introduces-herself": {
    text: "Ana smiles and introduces herself.",
    translation: "Ana sorri e se apresenta.",
  },
  "three-requests": { text: `${examplesCopy.title}. ${examplesCopy.description}` },
  "permission-rule": { text: `${permissionRuleCopy.title}. ${permissionRuleCopy.lead} ${permissionRuleCopy.detail}` },
  "door-instruction-en": { text: "The door is open. Before you close it, ask Ana for permission." },
  "door-instruction-pt": { text: "A porta está aberta. Antes de fechá-la, peça permissão à Ana." },
  "door-answer-pt": { text: "Posso fechar a porta?" },
  "comic-open": { text: "The comic is still open. A picture catches your eye." },
  "leo-arrives": { text: "Leo walks over. Ana hands him the comic." },
  "bell-rings": { text: "The bell rings. It’s time for class." },
} as const;

export type NarrationClip = keyof typeof narration;

export const dialogue = {
  "learner-seat": { text: "Hi, can I sit here?" },
  "ana-sure": { text: "Sure!" },
  "learner-intro": { text: "I’m Roger, by the way." },
  "ana-intro": { text: "I’m Ana." },
  "example-window": { text: "Can I open it?" },
  "example-seat": { text: "Can I sit here?" },
  "example-comic": { text: "Can I see it?" },
  "challenge-door": { text: "Can I close the door?" },
} as const;

export type DialogueClip = keyof typeof dialogue;
export type FirstDayVoiceClip = NarrationClip | DialogueClip;

export function firstDayVoiceUrl(clip: FirstDayVoiceClip) {
  return `/first-day/${clip in dialogue ? "dialogue" : "narration"}/${clip}.mp3`;
}

export const arrivalNarration = ["lunchtime", "empty-chair"] as const;
export const coverNarration = ["cover"] as const;
export const seatedNarration = ["sit-beside-ana"] as const;

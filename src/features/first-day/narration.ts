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

export const explanationEnglish = {
  1: {
    title: "Ask for permission",
    caption: "“Can I…?” is a way to ask for permission.\nAfter “Can I”, say what you want to do, like sit down or open something.",
  },
  2: {
    title: "Who does what?",
    caption: "The word after “can” shows who does the action.\nUse the base verb next, like “see” or “show”.",
  },
  3: {
    title: "When someone introduces you",
    caption: "Ana introduces Rafael by saying “This is Rafael.”\nRafael says “Hello, Leo” and they both say “Nice to meet you.”",
  },
  4: {
    title: "How to ask to borrow something",
    caption: "To borrow the comic, ask “Would you lend me this one?”\nTo confirm you can take it today, ask “Can I take this one today?”",
  },
  5: {
    title: "How to make plans and say goodbye",
    caption: "“Tomorrow at lunch” says when and “Right here” says where.\nBefore leaving, say “Thanks, everyone!”, “I have to go” and “See you tomorrow!”",
  },
} as const;

const anaIntroductionCaption = "Ana dá um sorriso e se apresenta.";

export const narration = {
  "lunchtime-pt": { text: "No intervalo, você pega a bandeja e procura um lugar.", bundled: true },
  "empty-chair-pt": { text: "Ana lê um gibi. Há uma cadeira livre ao lado dela.", bundled: true },
  "ana-looks-up-pt": { text: "Ana levanta os olhos e afasta a bolsa.", bundled: true },
  "ana-introduces-herself-pt": { text: anaIntroductionCaption, bundled: true },
  "learner-seat-pt": { text: "Oi! Posso sentar aqui?", bundled: true },
  "ana-sure-pt": { text: "Claro!", bundled: true },
  "ana-intro-pt": { text: "Eu sou a Ana.", bundled: true },
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
  "rafael-sits": { text: "Rafael puts his tray down and sits beside Ana. It’s time to introduce himself.", bundled: true },
  "rafael-sits-pt": { text: "Rafael põe a bandeja na mesa e se senta ao lado de Ana. É hora de se apresentar.", bundled: true },
  "rafael-intro-pt": { text: "Aliás, eu sou o Rafael.", bundled: true },
  "ana-introduces-herself": {
    text: "Ana smiles and introduces herself.",
    translation: anaIntroductionCaption,
  },
  "three-requests": { text: `${examplesCopy.title}. ${examplesCopy.description}` },
  "permission-rule": { text: `${permissionRuleCopy.title}. ${permissionRuleCopy.lead} ${permissionRuleCopy.detail}` },
  "door-instruction-en": { text: "The door is open. Before you close it, ask Ana for permission." },
  "door-instruction-pt": { text: "A porta está aberta. Antes de fechá-la, peça permissão à Ana." },
  "door-answer-pt": { text: "Posso fechar a porta?" },
  "ana-door-reply-pt": { text: "Claro! Está barulhento lá fora.", bundled: true },
  "comic-open": { text: "The comic is still open. A picture catches your eye." },
  "leo-arrives": { text: "Leo walks over. Ana hands him the comic." },
  "bell-rings": { text: "The bell rings. It’s time for class." },
} as const;

export type NarrationClip = keyof typeof narration;

export const dialogue = {
  "learner-seat": { text: "Hi, can I sit here?" },
  "ana-sure": { text: "Sure!" },
  "rafael-intro": { text: "I’m Rafael, by the way.", bundled: true },
  "ana-intro": { text: "I’m Ana." },
  "example-window": { text: "Can I open it?" },
  "example-seat": { text: "Can I sit here?" },
  "example-comic": { text: "Can I see it?" },
  "challenge-door": { text: "Can I close the door?" },
  "ana-door-reply": { text: "Sure! It’s noisy out there.", bundled: true },
} as const;

export type DialogueClip = keyof typeof dialogue;
export type StudyDialogueClip = Extract<DialogueClip, `example-${string}`>;

export const wordVoices = {
  "Hi,": "word-hi", can: "word-can", Can: "word-can", I: "word-i", sit: "word-sit",
  "here?": "word-here", "I’m": "word-im", "Rafael,": "word-rafael", by: "word-by",
  the: "word-the", "way.": "word-way", close: "word-close", "door?": "word-door",
} as const;

export type FirstDayWord = keyof typeof wordVoices;
type WordClip = (typeof wordVoices)[FirstDayWord];
export type FirstDayVoiceClip = NarrationClip | DialogueClip | WordClip
  | "tutorial-lookup" | "tutorial-place" | "tutorial-switch" | "tutorial-arrival"
  | "tutorial-door-en" | "tutorial-door-pt" | "tutorial-yes" | "tutorial-there";

export function firstDayVoiceRate(clip: FirstDayVoiceClip) {
  if (clip.startsWith("word-") || clip === "tutorial-yes" || clip === "tutorial-there") return 0.85;
  if (clip.startsWith("tutorial-")) return 1;
  return FIRST_DAY_AUDIO_RATE;
}
const voiceLines: Partial<Record<FirstDayVoiceClip, { text: string; bundled?: boolean }>> = { ...narration, ...dialogue };

export function firstDayVoiceUrl(clip: FirstDayVoiceClip) {
  if (clip.startsWith("tutorial-")) return `/first-day-part-one/audio/${clip}.mp3`;
  if (clip.startsWith("word-") || voiceLines[clip]?.bundled) return `/first-day-part-one/audio/${clip}.mp3`;
  return `/first-day/${clip in dialogue ? "dialogue" : "narration"}/${clip}.mp3`;
}

export const arrivalNarration = ["lunchtime", "empty-chair"] as const;
export const coverNarration = ["cover"] as const;
export const seatedNarration = ["rafael-sits"] as const;

export const portugueseNarration: Partial<Record<NarrationClip, NarrationClip>> = {
  lunchtime: "lunchtime-pt",
  "empty-chair": "empty-chair-pt",
  "ana-looks-up": "ana-looks-up-pt",
  "rafael-sits": "rafael-sits-pt",
  "ana-introduces-herself": "ana-introduces-herself-pt",
  "door-instruction-en": "door-instruction-pt",
};

export const portugueseDialogue: Partial<Record<DialogueClip, NarrationClip>> = {
  "learner-seat": "learner-seat-pt",
  "ana-sure": "ana-sure-pt",
  "rafael-intro": "rafael-intro-pt",
  "ana-intro": "ana-intro-pt",
  "challenge-door": "door-answer-pt",
  "ana-door-reply": "ana-door-reply-pt",
};

export function spokenDialogue(clip: DialogueClip, englishVoice: boolean): FirstDayVoiceClip {
  return englishVoice ? clip : portugueseDialogue[clip] ?? clip;
}

import type { BalloonPrint } from "./StoryPanel";
import type { Bilingual } from "./part-two-content";

type Edition = BalloonPrint["desktop"];

function lettering(mouth: NonNullable<Edition["mouth"]>, space: NonNullable<Edition["space"]>, width: number,
  readingOrder: Edition["readingOrder"] = "row"): Edition {
  return { mouth, space, oval: [0, 0, width, 0], headTop: .025, readingOrder };
}

// Positions are fractions of the actual desktop and portrait drawings. The
// rectangles leave the faces, gestures and comic book outside the lettering.
export const sequelBalloonPrints: Readonly<Record<string, BalloonPrint>> = {
  "v2-leo-chega": {
    desktop: lettering([.474, .221], [.515, .02, .77, .26], 306, "stack"),
    portrait: lettering([.446, .292], [.09, .022, .94, .217], 316),
  },
  "v2-ana-apresenta": {
    desktop: { ...lettering([.295, .373], [.065, .018, .56, .17], 552), tailBeat: 1 },
    portrait: lettering([.208, .454], [.125, .021, .94, .279], 318),
  },
  "v2-rafael-cumprimenta": {
    desktop: lettering([.738, .384], [.50, .023, .72, .29], 235),
    portrait: lettering([.811, .460], [.14, .024, .85, .30], 236),
  },
  "v2-leo-retribui": {
    desktop: lettering([.505, .395], [.34, .019, .70, .17], 418),
    portrait: lettering([.634, .444], [.125, .017, .86, .235], 295),
  },
  "v2-ana-explica": {
    desktop: { ...lettering([.300, .380], [.04, .018, .535, .148], 573), tailBeat: 1 },
    portrait: lettering([.279, .450], [.07, .018, .95, .237], 330),
  },
  "v2-rafael-pede": {
    desktop: lettering([.732, .384], [.46, .022, .709, .26], 286),
    portrait: lettering([.715, .420], [.09, .022, .85, .242], 246),
  },
  "v2-leo-empresta": {
    desktop: lettering([.429, .383], [.503, .018, .745, .292], 320, "stack"),
    portrait: { ...lettering([.429, .423], [.095, .018, .95, .235], 328), tailBeat: 1 },
  },
  "v2-rafael-combina": {
    desktop: lettering([.713, .384], [.454, .022, .691, .28], 280),
    portrait: lettering([.745, .43], [.16, .022, .83, .25], 238),
  },
  "v2-leo-confirma": {
    desktop: lettering([.50, .37], [.51, .018, .726, .28], 250),
    portrait: lettering([.54, .42], [.25, .02, .82, .229], 218),
  },
  "v2-rafael-agradece": {
    desktop: lettering([.663, .39], [.474, .018, .652, .258], 205),
    portrait: lettering([.74, .44], [.23, .02, .85, .269], 226),
  },
  "v2-ana-concorda": {
    desktop: lettering([.325, .435], [.385, .024, .66, .177], 192),
    portrait: lettering([.30, .52], [.36, .024, .90, .249], 202),
  },
  "v2-rafael-despede": {
    desktop: lettering([.698, .197], [.29, .018, .644, .167], 445),
    portrait: lettering([.68, .272], [.035, .023, .516, .338], 185, "stack"),
  },
  "v2-ana-leo-acenam": {
    desktop: lettering([.535, .455], [.328, .022, .67, .236], 263),
    portrait: lettering([.68, .47], [.32, .024, .89, .30], 225),
  },
};

export const sequelSpeechBeats: Readonly<Record<string, readonly [Bilingual, Bilingual]>> = {
  "v2-leo-chega": [
    { en: "Hi, Ana! I see you finished the comic.", pt: "Olá, Ana! Vi que você já terminou o gibi." },
    { en: "Did you like it?", pt: "Gostou?" },
  ],
  "v2-ana-apresenta": [
    { en: "I loved it!", pt: "Adorei!" },
    { en: "Oh, Leo, this is Rafael, our new classmate.", pt: "Ah, Léo, esse é o Rafael, nosso colega novo." },
  ],
  "v2-leo-retribui": [
    { en: "Nice to meet you, Rafael!", pt: "Prazer em te conhecer, Rafael!" },
    { en: "Do you like comics too?", pt: "Você também gosta de gibi?" },
  ],
  "v2-ana-explica": [
    { en: "Oh, Rafael, this is actually Leo’s comic. He lent it to me.", pt: "Ah, Rafael, esse gibi é do Léo, na verdade. Foi ele que me emprestou." },
    { en: "He loves comics and has a huge collection.", pt: "Ele adora gibis e tem uma coleção enorme." },
  ],
  "v2-leo-empresta": [
    { en: "Sure, man! You can take this one today.", pt: "Claro, cara! Pode levar esse hoje." },
    { en: "And if you want, I can bring the new issue tomorrow, too.", pt: "E, se quiser, amanhã eu trago a edição nova também." },
  ],
  "v2-rafael-despede": [
    { en: "Thanks, everyone! I have to go.", pt: "Valeu, pessoal! Tenho que ir." },
    { en: "See you tomorrow, okay?", pt: "Mas até amanhã, hein?" },
  ],
};

export function sequelSpeechSplit(id: string, lang: keyof Bilingual, fullLine: string | undefined, pieces: readonly string[]) {
  const beats = sequelSpeechBeats[id];
  if (!beats || pieces.join(" ") !== fullLine) return 0;
  return pieces.findIndex((_, index) => pieces.slice(0, index + 1).join(" ") === beats[0][lang]) + 1;
}

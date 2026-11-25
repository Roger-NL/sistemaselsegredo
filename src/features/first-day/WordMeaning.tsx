import { createContext, useContext, Fragment } from "react";

const glossary: Record<string, string> = {
  yes: "sim", still: "ainda", closed: "fechada", hi: "oi", can: "poder · Can I…? = Posso…?", i: "eu", sit: "sentar", here: "aqui",
  "i'm": "eu sou / estou", rafael: "Rafael (nome)", by: "by the way = aliás", the: "o / a", way: "by the way = aliás",
  sure: "claro", ana: "Ana (nome)", close: "fechar", door: "porta", "it's": "é / está",
  noisy: "barulhento", out: "fora", there: "lá", open: "abrir / aberta", it: "isso", see: "ver",
  of: "of course = claro", course: "of course = claro", go: "ir", ahead: "go ahead = pode ir",
  no: "nenhum", problem: "problema", you: "você", call: "chamar", me: "me", lunchtime: "hora do almoço",
  pick: "pick up = pegar", up: "para cima", your: "sua / seu", tray: "bandeja", and: "e", look: "olhar",
  for: "para · look for = procurar", a: "um / uma", seat: "lugar para sentar", is: "é / está",
  reading: "lendo", comic: "gibi", "there's": "há", an: "um / uma", empty: "vazia", chair: "cadeira",
  next: "next to = ao lado de", to: "a / para", her: "ela / dela", looks: "olha", moves: "afasta", bag: "bolsa",
  puts: "coloca", his: "dele", down: "para baixo", sits: "senta", beside: "ao lado de", time: "hora",
  introduce: "apresentar", himself: "a si mesmo", smiles: "sorri", introduces: "apresenta",
  herself: "a si mesma", before: "antes", ask: "pedir", permission: "permissão",
};
export const MeaningContext = createContext<(word: string) => void>(() => {});
export function meaningOf(word: string) {
  const key = word.toLowerCase().replaceAll("’", "'").replace(/^[^a-z]+|[^a-z]+$/g, "");
  return glossary[key];
}
export function EnglishWords({ text }: { text: string }) {
  const show = useContext(MeaningContext);
  return <>{text.split(/(\s+)/).map((word, i) => meaningOf(word)
    ? <button key={i} type="button" className="fd-gloss-word" onClick={event => {
      if (event.currentTarget.closest('[data-drop-available="true"]')) return;
      event.stopPropagation();
      show(word);
    }}>{word}</button> : <Fragment key={i}>{word}</Fragment>)}</>;
}

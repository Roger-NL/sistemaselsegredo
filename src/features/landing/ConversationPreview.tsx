"use client";

import { Check, Pause, Play, RotateCcw } from "lucide-react";
import { useState } from "react";

const pieces = ["English.", "I’m", "learning"];
const answer = [1, 2, 0];

/** An independent sample of the method, with no access to the real demo state. */
export function ConversationPreview() {
  const [selected, setSelected] = useState<number[]>([]);
  const [notice, setNotice] = useState("");
  const [motion, setMotion] = useState(true);
  const complete = selected.length === answer.length;

  function choose(index: number) {
    if (index !== answer[selected.length]) {
      setNotice(selected.length === 0 ? "Comece com “I’m” — eu estou." : "Depois vem “learning” — aprendendo.");
      return;
    }
    setSelected(current => [...current, index]);
    setNotice(selected.length === 2 ? "Isso! Estou aprendendo inglês." : `Sua frase: ${[...selected, index].map(piece => pieces[piece]).join(" ")}`);
  }

  return <section className={`language-stage ${complete ? "is-complete" : ""}`} data-motion={motion ? "on" : "off"} aria-label="Uma amostra interativa do método">
    <div className="language-stage-top"><span>DO PENSAMENTO À CONVERSA</span><span aria-hidden="true">↗</span></div>
    <div className="language-heading" aria-hidden="true"><div className="language-poster"><span>LET’S</span><span>TALK<span className="language-star">✳</span></span></div></div>
    <div className="language-paper">
      <div className="language-paper-heading"><span>UMA FRASE SUA.</span><button type="button" className="language-reset" onClick={() => { setSelected([]); setNotice(""); }} aria-label="Recomeçar a amostra" disabled={selected.length === 0 && !notice}><RotateCcw size={15} aria-hidden="true" /></button></div>
      <p className="language-intention">“Estou aprendendo inglês.”</p>
      <div className={`language-answer ${complete ? "is-complete" : ""}`} aria-label="Sua frase em inglês"><span lang={selected.length ? "en" : "pt-BR"}>{selected.map(index => pieces[index]).join(" ") || <span className="language-placeholder">Monte sua resposta com as peças.</span>}</span>{complete && <Check size={18} aria-hidden="true" />}</div>
      <div className="language-word-bank" aria-label="Peças da frase">{pieces.map((piece, index) => <button key={piece} type="button" lang="en" disabled={selected.includes(index)} onClick={() => choose(index)}>{piece}</button>)}</div>
      <p className="language-notice" role="status" aria-live="polite">{notice || "Toque nas palavras. Veja acontecer."}</p>
    </div>
    <div className="language-stage-bottom"><span>THINK IT. BUILD IT. SAY IT.</span><button type="button" className="language-motion-toggle" onClick={() => setMotion(value => !value)} aria-label={motion ? "Pausar animações" : "Retomar animações"}>{motion ? <Pause size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}</button></div>
  </section>;
}

"use client";
import { BrowserText } from "@/components/i18n/BrowserText";


import { useState } from "react";
import { ArrowRight, Check, Lightbulb, PencilLine, Puzzle } from "lucide-react";

const supports = [
  { name: "Guiado", Icon: Puzzle, title: "Comece com as peças.", description: "Conheça o modelo e monte sua resposta, uma parte de cada vez.", note: "Mais apoio para começar.", pieces: ["I’m", "learning", "English."] },
  { name: "Com pistas", Icon: Lightbulb, title: "Você completa o caminho.", description: "Use uma estrutura como ponto de partida e encontre a peça que falta.", note: "Uma pista quando precisar.", pieces: ["I’m", "learning", "___"] },
  { name: "Mais autônomo", Icon: PencilLine, title: "Dê espaço ao que já sabe.", description: "Escreva sua resposta em inglês. As pistas continuam por perto.", note: "Mais liberdade para tentar.", pieces: null },
] as const;

export function SupportPreview() {
  const [active, setActive] = useState(0);
  const support = supports[active];
  return <div className="landing-support-preview">
    <div className="landing-support-tabs" role="group" aria-label="Veja os tipos de apoio">{supports.map(({ name }, index) => <button key={name} type="button" aria-pressed={index === active} aria-controls="support-example" onClick={() => setActive(index)}><BrowserText>{name}</BrowserText></button>)}</div>
    <div id="support-example" className="landing-support-example" aria-live="polite" aria-atomic="true"><span className="landing-support-icon"><support.Icon size={22} strokeWidth={1.5} aria-hidden="true" /></span><h3><BrowserText>{support.title}</BrowserText></h3><p><BrowserText>{support.description}</BrowserText></p><div className="landing-support-demo" lang="en">{support.pieces ? support.pieces.map((piece, index) => <span className={piece === "___" ? "is-blank" : ""} key={index}>{piece === "___" ? <BrowserText>{"English?"}</BrowserText> : <BrowserText>{piece}</BrowserText>}</span>) : <span className="landing-writing">I’m learning English.<span className="landing-caret" aria-hidden="true" /></span>}<ArrowRight size={17} aria-hidden="true" /></div><p className="landing-support-note"><Check size={14} aria-hidden="true" /><BrowserText>{support.note}</BrowserText></p></div>
  </div>;
}

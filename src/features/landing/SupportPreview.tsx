"use client";
import { useState } from "react";
import { Check, MessageCircle, PencilLine, Puzzle } from "lucide-react";
import { BrowserText } from "@/components/i18n/BrowserText";

const examples = [
  {
    name: "Escolher", Icon: MessageCircle, title: "Quem são os amigos?",
    description: "Maya conta a Nina que ela e Sam são amigos. Qual balão combina com o que Maya quer dizer?",
    words: ["We are friends."], note: "“Nós somos amigos.” Maya faz parte da dupla.",
  },
  {
    name: "Montar", Icon: Puzzle, title: "Como Sam se apresenta?",
    description: "É a vez de Sam falar com Maya. Você junta as peças na ordem em que ele diria seu nome.",
    words: ["I", "am", "Sam."], note: "“Eu sou o Sam.” Ele está falando de si.",
  },
  {
    name: "Escrever", Icon: PencilLine, title: "Leo está pronto?",
    description: "Nina pergunta se Leo está pronto para a aula. Você escreve a resposta dele e confere a explicação.",
    writing: "I am ready.", note: "“Estou pronto.” É Leo quem responde.",
  },
] as const;

export function SupportPreview() {
  const [active, setActive] = useState(0);
  const example = examples[active];
  return <div className="landing-support-preview">
    <div className="landing-support-tabs" role="group" aria-label="Exemplos de atividades">
      {examples.map(({ name }, index) => (
        <button key={name} type="button" aria-pressed={index === active} aria-controls="support-example" onClick={() => setActive(index)}>
          <BrowserText>{name}</BrowserText>
        </button>
      ))}
    </div>
    <div id="support-example" className="landing-support-example" aria-live="polite" aria-atomic="true">
      <span className="landing-support-icon"><example.Icon size={22} strokeWidth={1.5} aria-hidden="true" /></span>
      <h3><BrowserText>{example.title}</BrowserText></h3>
      <p><BrowserText>{example.description}</BrowserText></p>
      <div className="landing-support-demo" lang="en" translate="no">
        {"words" in example ? example.words.map(word => <span key={word}><BrowserText>{word}</BrowserText></span>) : (
          <span className="landing-writing"><BrowserText>{example.writing}</BrowserText><span className="landing-caret" aria-hidden="true" /></span>
        )}
      </div>
      <p className="landing-support-note"><Check size={14} aria-hidden="true" /><BrowserText>{example.note}</BrowserText></p>
    </div>
  </div>;
}

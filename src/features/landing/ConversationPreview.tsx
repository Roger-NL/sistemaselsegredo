"use client";

import { Check, Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { BrowserText } from "@/components/i18n/BrowserText";
import { InterfaceIcon } from "@/components/ui/InterfaceIcon";

const words = ["I", "am", "Ana."];
const wordBank = [2, 0, 1];
const hints = [
  "A Ana fala de si. Comece com “I”, que quer dizer “eu”.",
  "Para dizer “sou”, junte “am” a “I”.",
  "Agora falta o nome dela, Ana.",
];

export function ConversationPreview() {
  const [count, setCount] = useState(0);
  const [hint, setHint] = useState("");
  const [motion, setMotion] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const recording = useRef<HTMLAudioElement>(null);
  const complete = count === words.length;
  const sentence = words.slice(0, count).join(" ");

  function choose(index: number) {
    if (index !== count) {
      setHint(hints[count]);
      return;
    }
    setHint("");
    setCount(count + 1);
  }

  function toggleRecording() {
    const clip = recording.current;
    if (!clip) return;
    setAudioError(false);
    if (clip.paused) {
      clip.currentTime = 0;
      void clip.play().catch((error: Error) => {
        if (error.name !== "AbortError") setAudioError(true);
      });
    } else {
      clip.pause();
    }
  }

  return (
    <section className={`language-stage${complete ? " is-complete" : ""}`} data-motion={motion ? "on" : "off"} aria-label="Uma atividade de Primeiros encontros">
      <Link className="language-stage-top" href="/demo" prefetch={false} aria-label="Abrir a aula Primeiros encontros">
        <span className="language-lesson-number">Aula 01</span>
        <span>Primeiros encontros</span>
        <InterfaceIcon name="arrow-up-right" />
      </Link>
      <div className="language-heading">
        <p className="language-poster">
          <span>Eu sou </span>
          <span>Ana.<span className="language-star"><InterfaceIcon name="starburst" /></span></span>
        </p>
        <div className="language-portrait">
          <Image src="/landing/ana.webp" alt="Ana aponta para si mesma." width={464} height={1000} loading="eager" unoptimized />
        </div>
      </div>
      <div className="language-paper">
        <span className="language-sticker" aria-hidden="true">Sua vez <InterfaceIcon name="arrow-down-right" /></span>
        <button type="button" className="language-reset" aria-label="Recomeçar a amostra" disabled={!count && !hint}
          onClick={() => { setCount(0); setHint(""); }}>
          <RotateCcw size={16} aria-hidden="true" />
        </button>
        <p className="language-intention">Como a Ana se apresenta?</p>
        <div className="language-answer" aria-live="polite" aria-atomic="true">
          {count > 0 ? <span lang="en" translate="no"><BrowserText>{sentence}</BrowserText></span> : <span className="language-placeholder">Monte a fala da Ana.</span>}
          {complete && <Check size={19} aria-label="Resposta correta" />}
        </div>
        <div className="language-word-bank" role="group" aria-label="Palavras para montar a frase" translate="no" lang="en">
          {wordBank.map(index => (
            <button key={index} type="button" disabled={index < count} onClick={() => choose(index)}>{words[index]}</button>
          ))}
        </div>
        <p className="language-notice" role="status"><BrowserText>{hint || (complete ? "Isso! A Ana usou “I” para falar de si." : "Toque nas palavras na ordem da fala.")}</BrowserText></p>
      </div>
      <div className="language-stage-bottom">
        <audio ref={recording} src="/first-encounters/audio/lesson-one/ana-i-am-ana.m4a" preload="none"
          onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
        <button type="button" className="language-listen" onClick={toggleRecording} data-ui-sound="none"
          aria-label={playing ? "Pausar a fala" : "Ouvir a Ana"}>
          {playing ? <Pause size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
          <span className="language-listen-label"><BrowserText>{playing ? "Pausar a fala" : "Ouvir a Ana"}</BrowserText></span>
        </button>
        {audioError && <span className="language-audio-error" role="status">Áudio indisponível. Tente de novo.</span>}
        <button type="button" className="language-motion-toggle" onClick={() => setMotion(value => !value)}
          aria-label={motion ? "Pausar animações" : "Retomar animações"}>
          {motion ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
        </button>
      </div>
    </section>
  );
}

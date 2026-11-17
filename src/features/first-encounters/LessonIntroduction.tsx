"use client";

import { useLessonStorage } from "./lesson-storage";

import { LessonButton } from "./LessonButton";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Bell, BellOff, Pause, RotateCcw, Volume2, X } from "lucide-react";
import { TutorialCaption, type TutorialClipTiming } from "./TutorialCaption";
import { PERSON_NAMES, type PersonId } from "./lesson-one";
import { IntroductionStage } from "./IntroductionStage";
import { LessonJourney } from "./LessonJourney";
import { isLessonButtonClick } from "./lesson-sound-events";
import { useLessonAudio } from "./useLessonAudio";
import { useLessonSounds } from "./useLessonSounds";
import { INTRODUCTION_POSITION_STORAGE, restorePosition } from "./lesson-position";
import { createIntroductionAudioController, getIntroductionClips, LESSON_INTRODUCTION_SCENES, type IntroductionSceneId, type IntroductionClip } from "./lesson-introduction";
import timingJSON from "./lesson-introduction-timing.json";
import "./lesson-introduction.css";

const TIMING = timingJSON as Partial<Record<IntroductionSceneId, TutorialClipTiming>>;
type Presentation = IntroductionClip & { token: number; scene: IntroductionSceneId; complete: boolean };
function PathIllustration() {
  return <ol className="li-demo-path" aria-label="Percurso completo da demonstração">
    {["Apresentação", "Como funciona", "Aula", "Teoria", "Teste"].map((label, index) =>
      <li key={label} aria-current={index === 0 ? "step" : undefined}><span>{index + 1}</span><strong>{label}</strong></li>)}
  </ol>;
}

/** A passive content introduction, separate from the lesson's interaction guide. */
export function LessonIntroduction({ onFinish, onSkip, finishLabel = "Iniciar aula" }: { onFinish: () => void; onSkip?: () => void; finishLabel?: string }) {
  const lessonStorage = useLessonStorage();
  const dialog = useRef<HTMLDialogElement>(null);
  const generation = useRef(0);
  const readyPeople = useRef(new Set<PersonId>());
  const pendingClip = useRef<{ ticket: number; person: PersonId; play: () => void } | null>(null);
  const [step, setStep] = useState(0);
  const [positionReady, setPositionReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [sequenceActive, setSequenceActive] = useState(false);
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const audio = useLessonAudio("lesson-introduction", createIntroductionAudioController);
  const { request: requestAudio, stop: stopAudio } = audio;
  const sounds = useLessonSounds();
  const { play: playSound } = sounds;
  const scene = LESSON_INTRODUCTION_SCENES[step];
  const current = presentation?.scene === scene.id ? presentation : null;
  const displayedText = current?.text ?? scene.text;
  const displayedKey = current?.key ?? scene.key;

  useEffect(() => { dialog.current?.showModal(); }, []);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      let restored = 0;
      try { restored = restorePosition(lessonStorage.getItem(INTRODUCTION_POSITION_STORAGE), LESSON_INTRODUCTION_SCENES.length); } catch { /* The presentation also works without browser storage. */ }
      setStep(restored); setPositionReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [lessonStorage]);
  useEffect(() => {
    if (!positionReady) return;
    try { lessonStorage.setItem(INTRODUCTION_POSITION_STORAGE, JSON.stringify({ version: 1, index: step })); } catch { /* The cursor remains available for this visit. */ }
  }, [step, positionReady, lessonStorage]);
  useEffect(() => {
    const invalidateSequence = () => { generation.current++; pendingClip.current = null; stopAudio(); };
    const cancelHidden = () => {
      if (!document.hidden) return;
      invalidateSequence(); setSequenceActive(false);
      setPresentation(value => value ? { ...value, complete: true } : value);
    };
    document.addEventListener("visibilitychange", cancelHidden);
    return () => { invalidateSequence(); document.removeEventListener("visibilitychange", cancelHidden); };
  }, [stopAudio]);

  function stop() {
    generation.current++; pendingClip.current = null; stopAudio(); setSequenceActive(false);
    setPresentation(value => value ? { ...value, complete: true } : value);
  }
  function playScene(index: number) {
    stopAudio();
    const ticket = ++generation.current;
    const selected = LESSON_INTRODUCTION_SCENES[index];
    const clips = getIntroductionClips(selected);
    setSequenceActive(true);
    function playClip(position: number) {
      if (generation.current !== ticket) return;
      const clip = clips[position];
      setPresentation({ ...clip, scene: selected.id, token: ticket, complete: false });
      function begin() {
        if (generation.current !== ticket) return;
        pendingClip.current = null;
        void requestAudio(clip.person, clip.text, { role: clip.role, autoplay: position > 0, onEnded: () => {
          if (generation.current !== ticket) return;
          if (position + 1 < clips.length) playClip(position + 1);
          else {
            setSequenceActive(false);
            setPresentation(value => value?.token === ticket ? { ...value, complete: true } : value);
          }
        } }).then(playing => {
          if (playing || generation.current !== ticket) return;
          setSequenceActive(false);
          setPresentation(value => value?.token === ticket ? { ...value, complete: true } : value);
        });
      }
      if (readyPeople.current.has(clip.person)) begin();
      else pendingClip.current = { ticket, person: clip.person, play: begin };
    }
    playClip(0);
  }
  function characterReady(person: PersonId) {
    readyPeople.current.add(person);
    const pending = pendingClip.current;
    if (pending?.person === person && pending.ticket === generation.current) pending.play();
  }
  function finish(skip = false) {
    stop(); dialog.current?.close();
    if (skip && onSkip) onSkip(); else onFinish();
  }
  function advance() {
    if (!started) {
      playSound("advance"); setStarted(true); playScene(step); return;
    }
    if (step === LESSON_INTRODUCTION_SCENES.length - 1) { finish(); return; }
    playSound("advance"); stop(); setStep(step + 1); playScene(step + 1);
  }
  function goBack() {
    if (!step) return;
    playSound("advance"); stop(); setStep(step - 1);
    if (started) playScene(step - 1);
  }
  function unlock() {
    setSequenceActive(true);
    setPresentation(value => value ? { ...value, complete: false } : value);
    void audio.unlock().then(playing => { if (!playing) setSequenceActive(false); });
  }

  return <dialog ref={dialog} className="li-introduction" aria-labelledby="li-title" aria-busy={!positionReady} data-ui-sound-scope="local"
    data-introduction-step={step} data-introduction-scene={scene.id} data-introduction-started={started}
    data-introduction-speaking={sequenceActive} data-introduction-language={current?.english ? "en" : "pt"}
    onCancel={event => { event.preventDefault(); finish(true); }}
    onClickCapture={event => { if (isLessonButtonClick(event.target)) playSound("tap"); }}>
    <header className="li-header"><LessonJourney stage="introduction" completed={step} label={`Apresentação · ${step + 1}/3`}/>
      <div className="li-header-actions"><button type="button" className="li-icon-button" aria-label={sounds.muted ? "Ativar efeitos sonoros" : "Silenciar efeitos sonoros"} aria-pressed={sounds.muted} data-sound-silent="true" onClick={() => { sounds.toggleMuted(); if (sounds.muted) playSound("tap"); }}>{sounds.muted ? <BellOff size={19}/> : <Bell size={19}/>}</button><button type="button" className="li-icon-button" aria-label="Fechar apresentação" onClick={() => finish(true)}><X size={21}/></button></div>
    </header>
    <div className="li-heading"><h1 id="li-title">{scene.title}</h1><p>{scene.subtitle}</p></div>
    <div className={`li-visual li-visual--${scene.id}`}>
      <IntroductionStage scene={scene} modelIndex={current?.english ? current.modelIndex : null} speech={audio.speech} onCharacterReady={characterReady}/>
      {scene.models.length ? <div className="li-models" aria-label="O que você vai aprender">{scene.models.map((model, index) => <div className="li-model" key={model.text}
        data-example-speaking={current?.english && current.modelIndex === index && audio.playingKey === current.key}>
        <span className="li-model-context">{scene.id === "self-and-you" ? index === 0 ? "Ana fala de si" : "Leo fala com Ana" : index === 0 ? "Ana faz parte da equipe" : "Maya fala de outra equipe"}</span>
        <strong lang="en">{model.text}</strong><span className="li-model-translation">{model.translation}</span>
      </div>)}</div> : <PathIllustration/>}
    </div>
    <section className="li-narration" aria-label={current?.english ? "Exemplo em inglês" : "Apresentação em português"}>
      <div className="li-narration-heading"><span><Volume2 size={16}/>{current?.english ? `${PERSON_NAMES[current.person]} fala em inglês` : "Nina apresenta a aula"}</span>
        {audio.blocked ? <button type="button" className="li-audio-notice" onClick={unlock}>Som bloqueado. Ativar</button>
          : audio.error ? <button type="button" className="li-audio-notice" onClick={() => playScene(step)}>Áudio indisponível. Tentar novamente</button>
            : started && <button type="button" className="li-audio-button" onClick={() => sequenceActive ? stop() : playScene(step)} aria-label={sequenceActive ? "Pausar apresentação" : "Repetir apresentação"}>{sequenceActive ? <Pause size={16}/> : <RotateCcw size={16}/>}<span>{sequenceActive ? "Pausar" : "Repetir"}</span></button>}
      </div>
      <div className="li-caption-slot" lang={current?.english ? "en" : "pt-BR"}><TutorialCaption key={`${current?.token ?? "preview"}:${displayedKey}`} speech={audio.speech} text={displayedText} clipKey={displayedKey} timing={!current?.english ? TIMING[scene.id] : undefined} complete={!started || current?.complete === true}/></div>
    </section>
    <footer className="li-footer"><button type="button" className="li-back" disabled={!positionReady || step === 0} onClick={goBack}><ArrowLeft size={18}/><span>Voltar</span></button>
      <button type="button" className="li-skip" onClick={() => finish(true)}>Pular apresentação</button>
      <LessonButton type="button" className="li-primary" aria-label={!started ? "Começar com som" : step === 2 ? finishLabel : "Continuar"} disabled={!positionReady} onClick={advance}>{!started ? <Volume2 size={19}/> : null}<span>{!started ? "Começar com som" : step === 2 ? "Ver guia" : "Continuar"}</span>{started ? <ArrowRight size={19}/> : null}</LessonButton>
    </footer>
  </dialog>;
}

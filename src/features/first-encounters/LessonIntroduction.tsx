"use client";

import { SpeechText } from "./SpeechText";

import { useLessonStorage } from "./lesson-storage";

import { LessonButton } from "./LessonButton";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Bell, BellOff, Pause, RotateCcw, Volume2, X } from "lucide-react";
import { TutorialCaption } from "./TutorialCaption";
import { PERSON_NAMES, type PersonId } from "./lesson-one";
import { IntroductionStage } from "./IntroductionStage";
import { LessonJourney } from "./LessonJourney";
import { LessonStepTransition } from "./LessonStepTransition";
import { isLessonButtonClick } from "./lesson-sound-events";
import { useLessonAudio } from "./useLessonAudio";
import { useLessonSounds } from "./useLessonSounds";
import { INTRODUCTION_POSITION_STORAGE, restoreIntroductionPosition } from "./lesson-position";
import { createIntroductionAudioController, getIntroductionClips, LESSON_INTRODUCTION_SCENES, type IntroductionSceneId, type IntroductionClip } from "./lesson-introduction";
import "./lesson-introduction.css";

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
  const [block, setBlock] = useState(0);
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
  const clips = getIntroductionClips(scene);
  const displayed = current ?? clips[block];
  const isLast = step === LESSON_INTRODUCTION_SCENES.length - 1 && block === clips.length - 1;

  useEffect(() => { dialog.current?.showModal(); }, []);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const restored = restoreIntroductionPosition(lessonStorage.getItem(INTRODUCTION_POSITION_STORAGE));
        setStep(restored.index); setBlock(restored.block ?? 0);
      } catch { /* The presentation also works without browser storage. */ }
      setPositionReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [lessonStorage]);
  useEffect(() => {
    if (!positionReady) return;
    try { lessonStorage.setItem(INTRODUCTION_POSITION_STORAGE, JSON.stringify({ version: 1, index: step, ...(block ? { block } : {}) })); } catch { /* The cursor remains available for this visit. */ }
  }, [step, block, positionReady, lessonStorage]);
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
  function playBlock(index: number, position: number) {
    stopAudio();
    const ticket = ++generation.current;
    const selected = LESSON_INTRODUCTION_SCENES[index];
    const clip = getIntroductionClips(selected)[position];
    const end = () => {
      if (generation.current !== ticket) return;
      setSequenceActive(false);
      setPresentation(value => value?.token === ticket ? { ...value, complete: true } : value);
    };
    function begin() {
      if (generation.current !== ticket) return;
      pendingClip.current = null;
      void requestAudio(clip.person, clip.text, { role: clip.role, onEnded: end })
        .then(playing => { if (!playing) end(); });
    }
    setPresentation({ ...clip, scene: selected.id, token: ticket, complete: false });
    setSequenceActive(true);
    if (readyPeople.current.has(clip.person)) begin();
    else pendingClip.current = { ticket, person: clip.person, play: begin };
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
  function move(index: number, position: number) {
    playSound("advance"); setStep(index); setBlock(position); playBlock(index, position);
  }
  function advance() {
    if (!started) { setStarted(true); move(step, block); return; }
    if (isLast) { finish(); return; }
    if (block + 1 < clips.length) move(step, block + 1);
    else move(step + 1, 0);
  }
  function goBack() {
    const index = block > 0 ? step : Math.max(0, step - 1);
    const position = block > 0 ? block - 1 : LESSON_INTRODUCTION_SCENES[index].blocks.length - 1;
    if (started) move(index, position);
    else { setStep(index); setBlock(position); }
  }
  function unlock() {
    setSequenceActive(true);
    setPresentation(value => value ? { ...value, complete: false } : value);
    void audio.unlock().then(playing => { if (!playing) setSequenceActive(false); });
  }

  return <dialog ref={dialog} className="li-introduction" aria-labelledby="li-title" aria-busy={!positionReady} data-ui-sound-scope="local"
    data-introduction-step={step} data-introduction-block={block} data-introduction-scene={scene.id} data-introduction-started={started}
    data-introduction-speaking={sequenceActive} data-introduction-language={displayed.english ? "en" : "pt"}
    onCancel={event => { event.preventDefault(); finish(true); }}
    onClickCapture={event => { if (isLessonButtonClick(event.target)) playSound("tap"); }}>
    <header className="li-header"><LessonJourney stage="introduction" completed={step} label={`Apresentação · ${step + 1}/3`}/>
      <div className="li-header-actions"><button type="button" className="li-icon-button" aria-label={sounds.muted ? "Ativar efeitos sonoros" : "Silenciar efeitos sonoros"} aria-pressed={sounds.muted} data-sound-silent="true" onClick={() => { sounds.toggleMuted(); if (sounds.muted) playSound("tap"); }}>{sounds.muted ? <BellOff size={19}/> : <Bell size={19}/>}</button><button type="button" className="li-icon-button" aria-label="Fechar apresentação" onClick={() => finish(true)}><X size={21}/></button></div>
    </header>
    <LessonStepTransition stepKey={scene.id} className="li-content">
    <div className="li-heading"><h1 id="li-title">{scene.title}</h1><p>{scene.subtitle}</p></div>
    <div className={`li-visual li-visual--${scene.id}`}>
      <IntroductionStage scene={scene} modelIndex={displayed.modelIndex} speech={audio.speech} onCharacterReady={characterReady}/>
      {scene.models.length ? <div className="li-models" aria-label="O que você vai aprender">{scene.models.map((model, index) => <div className="li-model" key={model.text}
        data-example-speaking={current?.english && current.modelIndex === index && audio.playingKey === current.key}>
        <span className="li-model-context">{scene.id === "self-and-you" ? index === 0 ? "Ana fala de si" : "Leo fala com Ana" : index === 0 ? "Ana faz parte da equipe" : "Maya fala de outra equipe"}</span>
        <strong lang="en"><SpeechText onPlay={() => { stop(); void requestAudio(model.speaker, model.text, { role: "character" }); }}>{model.text}</SpeechText></strong><span className="li-model-translation"><SpeechText onPlay={() => { stop(); void requestAudio("nina", model.translation, { role: "narration" }); }}>{model.translation}</SpeechText></span>
      </div>)}</div> : <PathIllustration/>}
    </div>
    <section className="li-narration" aria-label={displayed.english ? "Exemplo em inglês" : "Apresentação em português"}>
      <div className="li-narration-heading"><span><Volume2 size={16}/>{displayed.english ? `${PERSON_NAMES[displayed.person]} fala em inglês` : "Nina apresenta a aula"}</span>
        {audio.blocked ? <button type="button" className="li-audio-notice" onClick={unlock}>Som bloqueado. Ativar</button>
          : audio.error ? <button type="button" className="li-audio-notice" onClick={() => playBlock(step, block)}>Áudio indisponível. Tentar novamente</button>
            : started && <button type="button" className="li-audio-button" onClick={() => sequenceActive ? stop() : playBlock(step, block)} aria-label={sequenceActive ? "Pausar apresentação" : "Repetir apresentação"}>{sequenceActive ? <Pause size={16}/> : <RotateCcw size={16}/>}<span>{sequenceActive ? "Pausar" : "Repetir"}</span></button>}
      </div>
      <div className="li-caption-slot" lang={displayed.english ? "en" : "pt-BR"}><TutorialCaption key={`${current?.token ?? "preview"}:${displayed.key}`} speech={audio.speech} text={displayed.text} clipKey={displayed.key} complete={!started || current?.complete === true}/></div>
    </section>
    </LessonStepTransition>
    <footer className="li-footer"><button type="button" className="li-back" disabled={!positionReady || step === 0 && block === 0} onClick={goBack}><ArrowLeft size={18}/><span>Voltar</span></button>
      <button type="button" className="li-skip" onClick={() => finish(true)}>Pular apresentação</button>
      <LessonButton type="button" className="li-primary" aria-label={!started ? "Começar com som" : isLast ? finishLabel : "Avançar"} disabled={!positionReady} onClick={advance}>{!started ? <Volume2 size={19}/> : null}<span>{!started ? "Começar com som" : isLast ? "Ver guia" : "Avançar"}</span>{started ? <ArrowRight size={19}/> : null}</LessonButton>
    </footer>
  </dialog>;
}

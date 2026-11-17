"use client";

import { useLessonStorage } from "./lesson-storage";

import { LessonButton } from "./LessonButton";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Bell, BellOff, Check, Grip, MousePointer2, Pause, RotateCcw, Volume2, X } from "lucide-react";
import { LessonDragProvider, DragSource, type DragItem } from "./LessonDrag";
import { LessonStage } from "./LessonStage";
import { LessonJourney } from "./LessonJourney";
import { LESSON_SCENES } from "./lesson-one";
import { useTutorialAudio } from "./useTutorialAudio";
import { TutorialHand } from "./TutorialHand";
import { TutorialCaption, type TutorialClipTiming } from "./TutorialCaption";
import { TutorialSkillPractice, applyTutorialWordDrop, type TutorialWordDraft, type TutorialWritingState } from "./TutorialSkillPractice";
import { getTutorialHandPlan } from "./tutorial-hand-plans";
import { getTutorialNarration } from "./tutorial-script";
import { useLessonSounds } from "./useLessonSounds";
import { TUTORIAL_POSITION_STORAGE, restorePosition } from "./lesson-position";
import { isLessonButtonClick } from "./lesson-sound-events";
import { TUTORIAL_STEPS, TUTORIAL_ENGLISH_MODEL, getTutorialStep, getTutorialStepAudio, getNextTutorialStep, type TutorialAudioId, type TutorialStepId, type TutorialStepAudio } from "./tutorial-steps";
import timingJSON from "./tutorial-timing.json";
import "./lesson-tutorial.css";

export const LESSON_TUTORIAL_STORAGE = "basedspeak.lesson-one.tutorial.v1";
const TIMING = timingJSON as Partial<Record<TutorialAudioId, TutorialClipTiming>>;
type PlaybackSource = "guide" | "model" | "alternative";
type Presentation = { context: string; token: number; clip: TutorialStepAudio; source: PlaybackSource; complete: boolean };

export function LessonTutorial({ onFinish }: { onFinish: (learned?: readonly ("bubbles" | "build" | "write")[]) => void }) {
  const lessonStorage = useLessonStorage();
  const sounds = useLessonSounds();
  const { play: playSound } = sounds;
  const dialog = useRef<HTMLDialogElement>(null);
  const [history, setHistory] = useState<TutorialStepId[]>(["welcome"]);
  const [positionReady, setPositionReady] = useState(false);
  const episode = getTutorialStep(history[history.length - 1]);
  const step = TUTORIAL_STEPS.findIndex(item => item.id === episode.id);
  const [started, setStarted] = useState(false);
  const [visit, setVisit] = useState(0);
  const [listened, setListened] = useState(false);
  const [repeated, setRepeated] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [words, setWords] = useState<TutorialWordDraft>({});
  const [writing, setWriting] = useState<TutorialWritingState>({ text: "", result: null });
  const [handEnabled, setHandEnabled] = useState(true);
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const playedContext = useRef("");
  const generation = useRef(0);
  const confirmedListening = useRef(new Set<TutorialStepId>());
  const audio = useTutorialAudio("tutorial-guide");
  const { request: requestAudio, stop: stopAudio, pause: pauseAudio } = audio;
  const context = `${episode.id}:${visit}`;
  const guideClip = getTutorialStepAudio(episode.id);
  const activePresentation = presentation?.context === context ? presentation : null;
  const displayedClip = activePresentation?.clip ?? guideClip;
  const timing = TIMING[displayedClip.id];
  const handPlan = useMemo(() => getTutorialHandPlan(displayedClip.id, timing), [displayedClip.id, timing]);
  const phraseScreen = episode.kind === "phrase";
  const skillScreen = episode.kind === "words" || episode.kind === "write";
  const listenScreen = started && (episode.kind === "listen" || episode.kind === "repeat");
  const isComplete = episode.kind === "listen" ? listened : episode.kind === "repeat" ? repeated
    : phraseScreen ? placed : episode.kind === "words" ? words.pronoun === "I" && words.verb === "am"
      : episode.kind === "write" ? Boolean(writing.result?.correct) : true;

  const playClip = useCallback((clip: TutorialStepAudio, source: PlaybackSource) => {
    stopAudio();
    const ticket = ++generation.current;
    setHandEnabled(source !== "model");
    setPresentation({ context, token: ticket, clip, source, complete: false });
    const acknowledgeModel = () => {
      if (generation.current !== ticket || clip.id !== "ana") return;
      setListened(true);
      if (episode.id === "repeat") setRepeated(true);
    };
    void requestAudio(clip.person, clip.text, { role: clip.role, autoplay: source === "guide", onEnded: () => {
      if (generation.current !== ticket) return;
      acknowledgeModel();
      if (clip.id === "ana" && (episode.id === "welcome" || episode.id === "repeat") && !confirmedListening.current.has(episode.id)) {
        confirmedListening.current.add(episode.id); playSound("success");
      }
      setPresentation(current => current?.token === ticket ? { ...current, complete: true } : current);
      // A recording ending never changes the screen or starts another recording.
    } }).then(playing => { if (playing) acknowledgeModel(); });
  }, [context, episode.id, requestAudio, stopAudio, playSound, setHandEnabled, setPresentation, setListened, setRepeated]);

  useEffect(() => { dialog.current?.showModal(); }, []);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      let restored = 0;
      try { restored = restorePosition(lessonStorage.getItem(TUTORIAL_POSITION_STORAGE), TUTORIAL_STEPS.length); } catch { /* The guide also works without browser storage. */ }
      setHistory(TUTORIAL_STEPS.slice(0, restored + 1).map(item => item.id)); setPositionReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [lessonStorage]);
  useEffect(() => {
    if (!positionReady) return;
    try { lessonStorage.setItem(TUTORIAL_POSITION_STORAGE, JSON.stringify({ version: 1, index: step })); } catch { /* The cursor remains available for this visit. */ }
  }, [step, positionReady, lessonStorage]);
  useEffect(() => {
    if (!positionReady || !started || playedContext.current === context) return;
    const frame = requestAnimationFrame(() => {
      if (playedContext.current === context) return;
      playedContext.current = context;
      playClip(guideClip, "guide");
    });
    return () => cancelAnimationFrame(frame);
  }, [positionReady, started, context, guideClip, playClip]);

  function stop() { generation.current++; stopAudio(); }
  function finish() {
    stop(); dialog.current?.close();
    const learned: ("bubbles" | "build" | "write")[] = [];
    if (placed) learned.push("bubbles");
    if (words.pronoun === "I" && words.verb === "am") learned.push("build");
    if (writing.result?.correct) learned.push("write");
    onFinish(learned);
  }
  function advance() {
    if (!started) { playSound("advance"); setStarted(true); setVisit(value => value + 1); return; }
    if (!isComplete) return;
    const next = getNextTutorialStep(episode.id);
    if (!next) { finish(); return; }
    playSound("advance");
    stop(); setHandEnabled(true); setVisit(value => value + 1);
    setHistory(previous => [...previous, next]);
  }
  function goBack() {
    if (history.length < 2) return;
    playSound("advance");
    stop(); setHandEnabled(true); setVisit(value => value + 1);
    setHistory(previous => previous.length > 1 ? previous.slice(0, -1) : previous);
  }
  function replay() { playClip(displayedClip, activePresentation?.source ?? "guide"); }
  function pause() { generation.current++; pauseAudio(); }
  function listenAna() { playClip(TUTORIAL_ENGLISH_MODEL, "model"); }
  function hearGuide() { playClip(guideClip, "guide"); }
  function interact() {
    stop(); setHandEnabled(false);
    setPresentation(current => current?.context === context ? { ...current, complete: true } : current);
  }
  function receive(item: DragItem, target: string) {
    if (phraseScreen && !placed && item.id === "tutorial:phrase" && target === "person:ana") {
      interact(); setPlaced(true); playSound("success");
    } else if (episode.kind === "words") {
      const next = applyTutorialWordDrop(words, item, target);
      if (next !== words) { interact(); setWords(next); playSound(next.pronoun && next.verb ? "success" : "place"); }
    }
  }
  function updateWriting(next: TutorialWritingState) {
    setWriting(next);
    if (next.result) playSound(next.result.correct ? "success" : "retry");
  }
  function resetPhrase() { interact(); setPlaced(false); }
  function phraseInput() { if (phraseScreen && !placed) interact(); }

  return <dialog ref={dialog} className={`lo-tutorial lo-tutorial--spoken${skillScreen ? " lo-tutorial--skill" : ""}`} aria-labelledby="lo-tutorial-title" aria-busy={!positionReady} data-ui-sound-scope="local"
    data-tutorial-step={step} data-tutorial-episode={episode.id} data-tutorial-started={started} data-tutorial-placed={placed} data-tutorial-complete={isComplete}
    onCancel={event => { event.preventDefault(); finish(); }}
    onClickCapture={event => { if (isLessonButtonClick(event.target)) playSound("tap"); }}>
    <div className="lo-tutorial-top"><LessonJourney stage="guide" completed={step}/><div className="lo-tutorial-top-actions">
      {started && <button type="button" className="lo-tutorial-replay" onClick={audio.playingKey ? pause : replay} aria-label={audio.playingKey ? "Pausar explicação" : "Repetir fala"}>{audio.playingKey ? <Pause size={17}/> : <Volume2 size={17}/>}<span>{audio.playingKey ? "Pausar" : "Repetir fala"}</span></button>}
      <button type="button" className="lo-icon lo-tutorial-sounds" aria-label={sounds.muted ? "Ativar sons de confirmação" : "Desativar sons de confirmação"} aria-pressed={!sounds.muted} title="Sons de confirmação" data-sound-silent="true" onClick={() => { sounds.toggleMuted(); if (sounds.muted) playSound("tap"); }}>{sounds.muted ? <BellOff size={18}/> : <Bell size={18}/>}</button>
      <button type="button" className="lo-icon" aria-label="Fechar tutorial" onClick={finish}><X size={21}/></button>
    </div></div>
    <div className="lo-tutorial-heading"><h2 id="lo-tutorial-title">{episode.title}</h2></div>
    <LessonDragProvider key={`${episode.id}:${visit}`} onDrop={receive} onSelect={() => playSound("tap")}>
      <div className="lo-tutorial-scene">
        <div className="lo-tutorial-world" onPointerDownCapture={phraseInput} onKeyDownCapture={event => { if (event.key === "Enter" || event.key === " ") phraseInput(); }}>
          <LessonStage round={LESSON_SCENES[0].rounds[0]} speech={audio.speech} phraseRecipients={phraseScreen && !placed ? ["ana"] : []} tutorialCuePerson="ana"
            allowIdleTaps={!started || episode.kind === "finish" || phraseScreen && placed}
            onPersonClick={listenScreen ? person => { if (person === "ana") listenAna(); } : undefined}/>
        </div>
        <div className="lo-tutorial-practice" onPointerDownCapture={phraseInput} onKeyDownCapture={event => { if (event.key === "Enter" || event.key === " ") phraseInput(); }}>
          {skillScreen ? <TutorialSkillPractice kind={episode.kind === "words" ? "words" : "write"} words={words} writing={writing} onWordsChange={setWords} onWritingChange={updateWriting} onInteraction={interact}/>
            : phraseScreen && !placed ? <div className="lo-tutorial-phrase-anchor" data-tutorial-cue="phrase"><DragSource item={{ id: "tutorial:phrase", kind: "phrase", value: "tutorial", label: "I am Ana." }} className="lo-phrase lo-tutorial-phrase"><Grip size={20}/><span>I am Ana.</span></DragSource></div>
              : phraseScreen && placed ? <div className="lo-tutorial-success"><Check size={21}/><strong lang="en">I am Ana.</strong><button type="button" onClick={resetPhrase}><RotateCcw size={16}/>Refazer treino</button></div>
                : listenScreen ? <button type="button" data-tutorial-cue="listen" className="lo-secondary" onClick={listenAna}><Volume2 size={18}/>{episode.kind === "listen" && !listened ? "Ouvir Ana" : "Ouvir de novo"}</button>
                  : <span className="lo-tutorial-spacer" aria-hidden="true"/>}
        </div>
      </div>
    </LessonDragProvider>
    {started && <div className="lo-tutorial-context-actions">
      {phraseScreen && <button type="button" onClick={() => playClip(getTutorialNarration("click"), "alternative")}><MousePointer2 size={15}/>Mostrar como clicar</button>}
      {skillScreen && <button type="button" data-tutorial-cue="listen" onClick={listenAna}><Volume2 size={15}/>Ouvir modelo</button>}
      {activePresentation && activePresentation.clip.id !== guideClip.id && <button type="button" onClick={hearGuide}>Ouvir orientação</button>}
    </div>}
    <div className="lo-tutorial-coach" aria-label="Fala do guia">
      <span className="lo-tutorial-coach-icon" aria-hidden="true"><Volume2 size={21}/></span>
      {started ? <TutorialCaption key={`${context}:${activePresentation?.token ?? "pending"}`} speech={audio.speech} text={displayedClip.text} clipKey={displayedClip.key} timing={timing} complete={activePresentation?.complete ?? false}/>
        : <p className="lo-tutorial-caption lo-tutorial-ready">Clique em Começar com som. Depois, experimente cada ação.</p>}
    </div>
    {(audio.blocked || audio.error) && <div className="lo-tutorial-playback-status" role="status">{audio.blocked ? <button type="button" className="lo-secondary" onClick={() => void audio.unlock()}><Volume2 size={17}/>Ativar som</button> : <><span>{audio.error}</span><button type="button" onClick={replay}>Tentar novamente</button></>}</div>}
    <div className="lo-tutorial-footer">
      <button type="button" className="lo-secondary lo-tutorial-back" disabled={!positionReady || !started || history.length < 2} onClick={goBack}><ArrowLeft size={17}/>Voltar</button>
      <button type="button" className="lo-text-button lo-tutorial-skip" onClick={finish}>Pular tutorial</button>
      <LessonButton type="button" className="lo-next" data-tutorial-cue={episode.kind === "finish" ? "start" : "next"} disabled={!positionReady || started && !isComplete} onClick={advance}>{!started ? "Começar com som" : episode.kind === "finish" ? "Começar a aula" : "Avançar"}<ArrowRight size={18}/></LessonButton>
    </div>
    <TutorialHand scopeRef={dialog} speech={audio.speech} plan={handPlan} active={started && handEnabled}/>
  </dialog>;
}

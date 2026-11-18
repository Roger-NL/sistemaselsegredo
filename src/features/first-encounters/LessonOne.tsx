"use client";

import { SpeechText } from "./SpeechText";

import { LessonWordCoach } from "./LessonWordCoach";
import { useLessonViewport } from "./useLessonViewport";
import { LessonButton } from "./LessonButton";
import { COMIC_LESSON_STYLE } from "./lesson-comic-theme";
import { Brand } from "@/components/ui/Brand";
import { LessonStorageContext, useLessonStorage } from "./lesson-storage";
import { useLessonAccountProgress } from "./useLessonAccountProgress";
import { INTRODUCTION_POSITION_STORAGE, TUTORIAL_POSITION_STORAGE } from "./lesson-position";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Bell, BellOff, Check, ChevronRight, Eraser, Grip, HelpCircle, Lightbulb, MoreHorizontal, Pause, PenLine, Play, RotateCcw, Sparkles, UsersRound, Volume2, X } from "lucide-react";
import { LessonDragProvider, DragSource, DropTarget, type DragItem } from "./LessonDrag";
import { LessonStage } from "./LessonStage";
import { LESSON_SCENES, PERSON_NAMES, phraseText, retryLessonVerb, evaluatePhrase, evaluateSpeaker, evaluateTeam, evaluateMessages, evaluateEnsemble, type Round, type Phrase, type PersonId, type Pronoun, type Verb, type Evaluation } from "./lesson-one";
import type { CharacterCue } from "./AnimatedCharacter";
import { getLessonAudioKey } from "./lesson-audio";
import { useLessonAudio } from "./useLessonAudio";
import { LessonTutorial, LESSON_TUTORIAL_STORAGE } from "./LessonTutorial";
import { LessonIntroduction } from "./LessonIntroduction";
import { LessonJourney } from "./LessonJourney";
import { LESSON_INTRODUCTION_STORAGE } from "./lesson-introduction";
import { LessonConclusion, type LessonCompletionProps } from "./LessonConclusion";
import { LESSON_CONCLUSION_STORAGE } from "./lesson-conclusion";
import { getAutomaticLessonSpeech, getLessonSceneGuide, type LessonSpokenTurn } from "./lesson-speech-plan";
import { LESSON_MECHANICS, LESSON_MECHANICS_STORAGE, getLessonMechanic, getLessonMechanicHandPlan, type LessonMechanicId } from "./lesson-mechanics";
import { createGuidedLessonAudioController, restoreSeenMechanics } from "./lesson-mechanics-audio";
import { TutorialCaption, type TutorialClipTiming } from "./TutorialCaption";
import { TutorialHand } from "./TutorialHand";
import { LessonTaskTransition } from "./LessonTaskTransition";
import { useLessonSounds } from "./useLessonSounds";
import { isLessonButtonClick } from "./lesson-sound-events";
import mechanicTimingJSON from "./lesson-mechanics-timing.json";
import tutorialTimingJSON from "./tutorial-timing.json";
import "./lesson-one.css";
import "./lesson-comic-theme.css";
import "./lesson-mobile.css";

import { LESSON_PROGRESS_STORAGE as STORAGE, createLessonProgress as fresh, restoreLessonProgress, type SavedProgress } from "./lesson-progress";
export { restoreLessonProgress } from "./lesson-progress";
const MECHANIC_TIMING = { ...mechanicTimingJSON, write: tutorialTimingJSON["write-check"] } as Partial<Record<LessonMechanicId, TutorialClipTiming>>;
const MECHANIC_HAND_PLANS = Object.fromEntries(Object.keys(LESSON_MECHANICS).map(key => {
  const id = key as LessonMechanicId;
  return [id, getLessonMechanicHandPlan(id, MECHANIC_TIMING[id])];
})) as Record<LessonMechanicId, ReturnType<typeof getLessonMechanicHandPlan>>;
type MechanicGuide = { id: LessonMechanicId; context: string; token: number; complete: boolean };
const PRONOUNS: Pronoun[] = ["I", "you", "we", "they"];
const VERBS: Verb[] = ["am", "are"];
const TITLES = ["O balão tem dono", "Entrar na equipe", "O motor da frase", "A mesma equipe, outra voz", "Mensagem sem remetente", "Quem completa esta conversa?"];
const MODELS = [
  ["I am Ana.", "Ana fala de si: eu sou Ana.", "You are Ana.", "Leo fala com Ana: você é Ana."],
  ["We are a team.", "Quem fala faz parte da equipe: nós somos uma equipe.", "They are a team.", "Quem fala descreve a equipe de fora: eles/elas são uma equipe."],
  ["I am", "Com I, usamos am.", "You are · We are · They are", "Com estes três pronomes, usamos are. You também pode ser uma pessoa."],
  ["We are a team.", "Ana ou Leo pode falar pela equipe Ana + Leo.", "They are a team.", "Maya fala dessa mesma equipe de fora. A equipe não mudou."],
  ["We are a team.", "Esta mensagem vem de uma integrante da equipe.", "They are a team.", "Esta mensagem vem de alguém que descreve a equipe de fora."],
  ["I am · You are", "Quem fala de si? Quem fala com a outra pessoa?", "We are · They are", "Quem fala faz parte da equipe descrita?"],
];
const MODEL_AUDIO: [string[], string[]][] = [
  [["I am Ana."], ["You are Ana."]],
  [["We are a team."], ["They are a team."]],
  [["I am Ana."], ["You are Ana.", "We are a team.", "They are a team."]],
  [["We are a team."], ["They are a team."]],
  [["We are a team."], ["They are a team."]],
  [["I am Nina.", "You are Nina."], ["We are a team.", "They are a team."]],
];

function AudioButton({ person, text, playingKey, play, pause, caption, className = "", label, available }: {
  person: PersonId; text: string; playingKey: string | null; play: (person: PersonId, text: string) => void;
  pause: () => void; caption?: string; className?: string; label?: string; available: boolean;
}) {
  if (!available) return null;
  const playing = playingKey === getLessonAudioKey(person, text);
  return <button type="button" className={`lo-audio-button ${caption ? "lo-audio-chip" : "lo-audio-icon"} ${className}`}
    data-audio-person={person} data-audio-text={text} data-audio-ready={available} aria-pressed={playing} data-sound-silent="true"
    aria-label={playing ? `Pausar leitura de ${text}` : label ?? `Ouvir leitura de ${text}`}
    title={playing ? "Pausar áudio" : "Leitura narrada. Ouvir não escolhe uma resposta."}
    onPointerDown={event => event.stopPropagation()}
    onClick={event => { event.preventDefault(); event.stopPropagation(); if (playing) pause(); else play(person, text); }}>
    {playing ? <Pause size={14} aria-hidden="true" /> : <Volume2 size={14} aria-hidden="true" />}
    {caption && <span lang="en">{caption}</span>}
  </button>;
}

function isCanonicalPreview(phrase: Phrase) {
  return phrase.verb === (phrase.pronoun === "I" ? "am" : "are")
    && (["ready", "here"].includes(phrase.complement) || (["a team", "friends"].includes(phrase.complement)
      ? ["we", "they"].includes(phrase.pronoun) : ["I", "you"].includes(phrase.pronoun)));
}


function writtenEvaluation(round: Round, raw: string): Evaluation {
  const original = raw.trim();
  let text = original.normalize("NFKC").toLowerCase().replace(/[’‘]/g, "'").replace(/[.,!?;]/g, " ").replace(/\s+/g, " ").trim();
  const contracted = /^(im|i'm|i m|iam)\b/.test(text);
  text = text.replace(/^(?:im|i'm|i m|iam)\b/, "i am").replace(/^(you|we|they)(?:'re| re)\b/, "$1 are");
  const question = /^(am|are|is) (i|you|we|they) /.test(text);
  if (question) text = text.replace(/^(am|are|is) (i|you|we|they) /, "$2 $1 ");
  const match = /^(i|you|we|they)\s+(?:(am|are|is)\s+)?(.+)$/.exec(text);
  if (!match) return { correct: false, meaningCorrect: false, corrections: [], feedback: "Diga quem é a pessoa ou a equipe. Você também pode montar a fala com as peças." };
  const pronoun = (match[1] === "i" ? "I" : match[1]) as Pronoun;
  const verb = (match[2] === "is" ? pronoun === "I" ? "am" : "are" : match[2] ?? (pronoun === "I" ? "am" : "are")) as Verb;
  const anna = round.expected.complement === "Ana" && match[3] === "anna";
  const complement = anna ? "Ana" : match[3].toLowerCase() === "a team" ? "a team" : Object.values(PERSON_NAMES).find(n => n.toLowerCase() === match[3]) ?? match[3];
  const evaluation = evaluatePhrase(round, { pronoun, verb, complement, question });
  if (!evaluation.correct) return evaluation;
  if (round.kind === "verb" && (!match[2] || match[2] === "is")) return retryLessonVerb(pronoun);
  const notes = [...evaluation.corrections];
  if (!match[2]) notes.push(`A fala completa usa ${pronoun} ${pronoun === "I" ? "am" : "are"}.`);
  if (match[2] === "is") notes.push(`O sentido ficou claro. Com ${pronoun}, usamos ${pronoun === "I" ? "am" : "are"}.`);
  if (pronoun === "I" && /^i/.test(original)) notes.push("I, o pronome eu, fica sempre com letra maiúscula.");
  if (contracted && !/['’]/.test(original)) notes.push("Na forma curta I'm, o apóstrofo marca a contração de I am. I am também está correto.");
  if (!round.vocabulary && round.referent !== "team" && !original.includes(round.expected.complement)) notes.push(`${round.expected.complement} é nome próprio e começa com letra maiúscula.`);
  if (anna) notes.push("Anna também é um nome; nesta cena, a personagem se chama Ana.");
  return { ...evaluation, corrections: [...new Set(notes)] };
}

function readMechanicMetadata(raw: string | null): Record<string, unknown> {
  try { const value = JSON.parse(raw ?? "{}"); return value && typeof value === "object" && !Array.isArray(value) ? value : {}; }
  catch { return {}; }
}

function phraseItem(phrase: Phrase, index = 0): DragItem {
  return { id: `phrase-${index}-${phraseText(phrase)}`, kind: "phrase", value: JSON.stringify(phrase), label: phraseText(phrase) };
}

export function LessonOne({ fontClassName = "" }: { fontClassName?: string } = {}) {
  const session = useLessonAccountProgress();
  useLessonViewport();
  if (!session.ready && !session.retryingCompletion) return <div className="lo-app lo-session-loading" data-lesson-theme="comic" style={COMIC_LESSON_STYLE}><Brand href="/dashboard"/><main><h1>{session.error ? "Vamos conferir seu acesso." : "Preparando sua aula…"}</h1><p role="status">{session.error || "Carregando o ponto certo do seu percurso."}</p>{session.error && <button type="button" onClick={session.refresh}>Tentar novamente</button>}<a href="/dashboard">Voltar ao painel</a></main></div>;
  return <LessonStorageContext.Provider value={session.storage}><LessonOneContent key={session.scopeKey} fontClassName={fontClassName} onInteraction={session.beginEdit} onDiscard={session.endEdit}
    completion={{ verify: session.verifyCompletion, leave: href => window.location.assign(href), version: session.completionVersion, account: session.hasAccount, saving: session.saving, error: session.hasAccount ? session.error : "" }}/></LessonStorageContext.Provider>;
}

function LessonOneContent({ fontClassName, onInteraction, onDiscard, completion }: { fontClassName: string; onInteraction?: () => void; onDiscard?: () => void; completion: LessonCompletionProps }) {
  const lessonStorage = useLessonStorage();
  useEffect(() => () => { onDiscard?.(); }, [onDiscard]);
  const sounds = useLessonSounds();
  const [progress, setProgress] = useState<SavedProgress>(fresh);
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState<Evaluation | null>(null);
  const [hint, setHint] = useState(false);
  const [picked, setPicked] = useState<{ pronoun?: Pronoun; verb?: Verb }>({});
  const [members, setMembers] = useState<PersonId[] | undefined>();
  const [speaker, setSpeaker] = useState<PersonId | undefined>();
  const [assignments, setAssignments] = useState<(PersonId | null)[]>([null, null]);
  const [ensemble, setEnsemble] = useState<(Phrase | null)[]>([null, null, null, null]);
  const [activeTurn, setActiveTurn] = useState(0);
  const [writing, setWriting] = useState(false);
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [inputActive, setInputActive] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [cue, setCue] = useState<{ person: PersonId; name: CharacterCue; key: number } | null>(null);
  const [modelOpen, setModelOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(true);
  const [introductionOpen, setIntroductionOpen] = useState(false);
  const [visit, setVisit] = useState(0);
  const [activeMessage, setActiveMessage] = useState(0);
  const [readyPeople, setReadyPeople] = useState<Set<PersonId>>(() => new Set());
  const [mechanicGuide, setMechanicGuide] = useState<MechanicGuide | null>(null);
  const seenMechanics = useRef(new Set<LessonMechanicId>());
  const guideGeneration = useRef(0);
  const app = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDialogElement>(null), model = useRef<HTMLDialogElement>(null), reset = useRef<HTMLDialogElement>(null), coaching = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null), title = useRef<HTMLHeadingElement>(null);
  const advancing = useRef(false);
  const finished = progress.scene >= LESSON_SCENES.length;
  const scene = LESSON_SCENES[Math.min(progress.scene, LESSON_SCENES.length - 1)];
  const round = scene.rounds[Math.min(progress.round, scene.rounds.length - 1)];
  const visualRound = round.kind === "ensemble" ? round.ensemble?.[activeTurn] ?? round : round.kind === "messages" && result?.correct ? { ...round.ensemble![activeMessage], anonymous: false } : round;
  const writable = ["bubbles", "verb", "build"].includes(round.kind);
  const isComplete = Boolean(result?.correct);
  const phraseReady = Boolean(picked.verb && (round.kind === "verb" || picked.pronoun));
  const canCheck = isComplete || writing && Boolean(text.trim()) || phraseReady || round.kind === "messages" && assignments.every(Boolean) || round.kind === "ensemble" && ensemble.every(Boolean);
  const completedScene = (index: number) => LESSON_SCENES[index].rounds.every(r => progress.completed.includes(r.id));
  const firstPending = LESSON_SCENES.findIndex((_, i) => !completedScene(i));
  const audio = useLessonAudio(`${visit}:${round.id}:${finished ? "finished" : "activity"}`, createGuidedLessonAudioController);
  const { stop: stopAudio, pause: pauseAudio, request: requestAudio } = audio;
  const lastAudio = useRef<LessonSpokenTurn | null>(null);
  const sequence = useRef(0);
  const outcomeSound = useRef<Promise<void> | undefined>(undefined);
  const answerVisit = useRef(0);
  const manualWord = useRef<(() => Promise<void> | undefined) | null>(null);
  const [confirmationPhase, setConfirmationPhase] = useState<"word" | "cue" | null>(null);
  useEffect(() => () => { answerVisit.current++; outcomeSound.current = undefined; }, []);
  const autoPlayed = useRef(new Set<string>());

  const stopSpeech = useCallback(() => { document.dispatchEvent(new Event("lesson-stop-word-coach")); sequence.current++; stopAudio(); setMechanicGuide(null); }, [stopAudio, setMechanicGuide]);
  const pauseSpeech = useCallback(() => { sequence.current++; pauseAudio(); }, [pauseAudio]);
  const characterReady = useCallback((person: PersonId) => setReadyPeople(previous => previous.has(person) ? previous : new Set([...previous, person])), []);
  const perform = useCallback((turns: LessonSpokenTurn[], autoplay = false, firstEnded?: () => void) => {
    document.dispatchEvent(new CustomEvent("lesson-stop-word-coach", { detail: turns[0]?.text }));
    const ticket = ++sequence.current;
    stopAudio();
    // Only the mechanic guide supplies this callback; explicit English playback
    // takes over the caption as well as the shared media channel.
    if (!firstEnded) setMechanicGuide(null);
    function playTurn(index: number) {
      if (sequence.current !== ticket || !turns[index]) return;
      const turn = turns[index];
      if (turn.turnIndex !== undefined) { setActiveTurn(turn.turnIndex); setActiveMessage(turn.turnIndex); }
      lastAudio.current = turn;
      void requestAudio(turn.person, turn.text, { autoplay, role: turn.role, onEnded: () => {
        if (sequence.current !== ticket) return;
        if (index === 0) firstEnded?.();
        playTurn(index + 1);
      } });
    }
    if (outcomeSound.current) void outcomeSound.current.then(() => playTurn(0));
    else playTurn(0);
  }, [requestAudio, stopAudio, setMechanicGuide]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const restored = restoreLessonProgress(lessonStorage.getItem(STORAGE));
        const launch = new URL(window.location.href);
        const showIntroduction = launch.searchParams.get("apresentacao") === "1";
        const resumeConclusion = !showIntroduction && launch.searchParams.get("retomar") === "conclusao"
          && restored.completed.length === LESSON_SCENES.reduce((total, item) => total + item.rounds.length, 0);
        if (showIntroduction) {
          lessonStorage.removeItem(INTRODUCTION_POSITION_STORAGE);
          lessonStorage.removeItem(TUTORIAL_POSITION_STORAGE);
        }
        const introduce = showIntroduction || !resumeConclusion && restored.scene === 0 && restored.round === 0 && restored.completed.length === 0 && lessonStorage.getItem(LESSON_INTRODUCTION_STORAGE) !== "done";
        setProgress(showIntroduction ? { ...restored, scene: 0, round: 0 } : resumeConclusion ? { ...restored, scene: LESSON_SCENES.length, round: 0 } : restored);
        setIntroductionOpen(introduce);
        setTutorialOpen(!resumeConclusion && (introduce || lessonStorage.getItem(LESSON_TUTORIAL_STORAGE) !== "done"));
        seenMechanics.current = restoreSeenMechanics(lessonStorage.getItem(LESSON_MECHANICS_STORAGE));
        // Presentation replays start the practice; an old review shortcut never unlocks it.
        if (showIntroduction || launch.searchParams.has("revisao") || launch.searchParams.has("retomar")) {
          launch.searchParams.delete("apresentacao"); launch.searchParams.delete("revisao"); launch.searchParams.delete("retomar");
          window.history.replaceState(window.history.state, "", launch.pathname + launch.search + launch.hash);
        }
      } catch { setStorageError(true); }
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [lessonStorage]);
  useEffect(() => {
    if (!ready) return;
    try { lessonStorage.setItem(STORAGE, JSON.stringify(progress)); } catch { queueMicrotask(() => setStorageError(true)); }
  }, [progress, ready, lessonStorage]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => title.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [progress.scene]);

  function clearAttempt() {
    answerVisit.current++; outcomeSound.current = undefined; setConfirmationPhase(null);
    onDiscard?.();
    stopSpeech(); setVisit(value => value + 1);
    setMechanicGuide(null);
    setResult(null); setPicked({}); setMembers(undefined); setSpeaker(undefined); setAssignments([null, null]); setEnsemble([null, null, null, null]);
    setActiveTurn(0); setActiveMessage(0); setText(""); setNote(""); setHint(false); setWriting(false); setCue(null); advancing.current = false;
  }
  function markSupport() { setProgress(p => ({ ...p, supported: [...new Set([...p.supported, round.id])] })); }
  function commit(evaluation: Evaluation) {
    const word = manualWord.current?.();
    const reading = word ?? audio.whenIdle(true);
    // The learner's chosen reading may finish while the grade appears immediately.
    if (reading) { sequence.current++; setMechanicGuide(null); }
    else stopSpeech();
    const visit = answerVisit.current;
    const cue = evaluation.correct ? "success" : "retry";
    const previous = outcomeSound.current ?? reading;
    if (previous && !sounds.muted) void sounds.unlock();
    const sound = previous ? previous.then(() => {
      if (visit !== answerVisit.current) return;
      setConfirmationPhase("cue");
      return sounds.play(cue);
    }) : sounds.play(cue);
    outcomeSound.current = sound;
    if (sound) {
      setConfirmationPhase(word ? "word" : "cue");
      void sound.then(() => {
        if (outcomeSound.current === sound) { outcomeSound.current = undefined; setConfirmationPhase(null); }
      });
    }
    setResult(evaluation); setNote("");
    if (evaluation.corrections.length) markSupport();
    if (evaluation.correct && ["bubbles", "verb", "build"].includes(round.kind)) {
      setCue(c => ({ person: round.speaker, name: round.expected.pronoun === "I" ? "self-point" : "idle", key: (c?.key ?? 0) + 1 }));
    }
  }
  function drop(item: DragItem, target: string) {
    if (result?.correct || finished) return;
    document.dispatchEvent(new Event("lesson-stop-word-coach"));
    takeControl();
    setNote("");
    if (round.kind === "join" && item.kind === "person" && target === "team") {
      const next = [...new Set([...round.team, item.value as PersonId])];
      setMembers(next); commit(evaluateTeam(round, next)); return;
    }
    if (round.kind === "messages" && item.kind === "person" && target.startsWith("message:")) {
      const index = Number(target.slice(8)); if (index !== 0 && index !== 1) return;
      setAssignments(old => old.map((v, i) => i === index ? item.value as PersonId : v === item.value ? null : v)); setResult(null); sounds.play("place"); return;
    }
    if (round.kind === "ensemble" && item.kind === "phrase" && target.startsWith("turn:")) {
      const index = Number(target.slice(5)); if (!Number.isInteger(index) || index < 0 || index > 3) return;
      const phrase = JSON.parse(item.value) as Phrase;
      setEnsemble(old => old.map((v, i) => i === index ? phrase : v && phraseText(v) === phraseText(phrase) ? null : v));
      setActiveTurn(index); setResult(null); sounds.play("place"); return;
    }
    if (["build", "verb"].includes(round.kind) && item.kind === "word") {
      if (target === "word:pronoun" && PRONOUNS.includes(item.value as Pronoun) && round.kind === "build") setPicked(p => ({ ...p, pronoun: item.value as Pronoun }));
      else if (target === "word:verb" && VERBS.includes(item.value as Verb)) setPicked(p => ({ ...p, verb: item.value as Verb }));
      else { setNote("Leve esta peça ao espaço correspondente no balão."); sounds.play("retry"); return; }
      setResult(null); sounds.play("place"); return;
    }
    if (round.kind === "bubbles" && item.kind === "phrase") {
      if (target !== `person:${round.speaker}` && target !== "speech") { setResult(null); setNote(`A vez de falar é de ${PERSON_NAMES[round.speaker]}. Entregue o balão a esse personagem.`); sounds.play("retry"); return; }
      const phrase = JSON.parse(item.value) as Phrase;
      setPicked({ pronoun: phrase.pronoun, verb: phrase.verb }); commit(evaluatePhrase(round, phrase));
    }
  }
  function choosePerson(person: PersonId) {
    takeControl();
    if (round.kind === "speaker" && !result?.correct) { setSpeaker(person); commit(evaluateSpeaker(round, person)); }
  }
  function next() {
    if (advancing.current) return;
    takeControl();
    if (finished) { sounds.play("advance"); clearAttempt(); setProgress(p => ({ ...p, scene: 0, round: 0 })); return; }
    if (!result?.correct) {
      if (writing) {
        app.current?.querySelector<HTMLInputElement>(".lo-write input")?.blur();
        commit(writtenEvaluation(round, text));
        return;
      }
      if (round.kind === "messages") { commit(evaluateMessages(round, assignments)); return; }
      if (round.kind === "ensemble") { commit(evaluateEnsemble(round, ensemble)); return; }
      if (phraseReady) commit(evaluatePhrase(round, { pronoun: round.kind === "verb" ? round.expected.pronoun : picked.pronoun!, verb: picked.verb!, complement: round.expected.complement }));
      return;
    }
    advancing.current = true;
    sounds.play("advance");
    const finalRound = progress.round === scene.rounds.length - 1;
    const nextScene = finalRound ? progress.scene + 1 : progress.scene;
    const nextRound = finalRound ? 0 : progress.round + 1;
    clearAttempt();
    // Keep the accepted turn's editing base until its new snapshot is staged.
    onInteraction?.();
    setProgress(p => ({ ...p, scene: nextScene, round: nextRound, completed: [...new Set([...p.completed, round.id])] }));
    // Prevent two clicks in the same browser event batch from skipping a new turn.
    advancing.current = true;
    requestAnimationFrame(() => { advancing.current = false; });
  }
  function navigate(sceneIndex: number) {
    if (sceneIndex === LESSON_SCENES.length && firstPending >= 0) return;
    sounds.play("advance");
    clearAttempt(); setProgress(p => ({ ...p, scene: sceneIndex, round: 0 })); menu.current?.close();
  }
  function showModel() { stopSpeech(); markSupport(); setModelOpen(true); model.current?.showModal(); }
  function resetCourse() {
    clearAttempt(); setProgress(fresh());
    seenMechanics.current = new Set(); autoPlayed.current.clear(); lastAudio.current = null;
    try {
      for (const key of [STORAGE, LESSON_INTRODUCTION_STORAGE, LESSON_TUTORIAL_STORAGE, LESSON_MECHANICS_STORAGE, LESSON_CONCLUSION_STORAGE, INTRODUCTION_POSITION_STORAGE, TUTORIAL_POSITION_STORAGE]) lessonStorage.removeItem(key);
    } catch { setStorageError(true); }
    setIntroductionOpen(true); setTutorialOpen(true); sounds.play("advance");
    reset.current?.close(); menu.current?.close();
  }
  function toggleWriting() { stopSpeech(); onDiscard?.(); setWriting(v => !v); setResult(null); setText(""); setPicked({}); }
  function listen(person: PersonId, phrase: string) {
    perform([{ person, text: phrase, role: "narration" }]);
  }
  function hearWord(element: HTMLButtonElement, word: string) {
    element.dispatchEvent(new Event("lesson-select-word", { bubbles: true }));
    listen("nina", word);
  }
  function spoken(text: string, recording = text) {
    return audio.has("nina", recording)
      ? <SpeechText onPlay={() => listen("nina", recording)}>{text}</SpeechText>
      : text;
  }
  function vocabularyCue(cue: string) {
    const word = round.expected.complement;
    return spoken(cue, cue.startsWith(word + " = ") ? word : cue);
  }
  function retryAudio() {
    const previous = lastAudio.current;
    if (activeGuide && previous?.person === "nina" && previous.text === mechanic?.text) { showMechanic(); return; }
    if (previous) perform([previous]);
  }

  const choices = round.bubbleChoices ?? [];
  const readChoices = isComplete || choices.every(choice => audio.has("nina", phraseText(choice)));
  const assembled = round.kind === "verb" || round.kind === "build";
  const currentPronoun = round.kind === "verb" ? round.expected.pronoun : picked.pronoun;
  const models = MODELS[scene.game - 1];
  const modelAudio = MODEL_AUDIO[scene.game - 1];
  const guide = getLessonSceneGuide(visualRound.kind === "speaker" && round.kind === "messages" ? round : visualRound, writing);
  const draft = !writing && picked.verb && currentPronoun
    ? { pronoun: currentPronoun, verb: picked.verb, complement: round.expected.complement } : null;
  const proposedAudio = isComplete
    ? round.kind === "messages" ? { person: visualRound.speaker, text: phraseText(visualRound.expected), narration: false }
      : { person: round.kind === "speaker" ? speaker ?? round.speaker : visualRound.speaker, text: phraseText(visualRound.expected), narration: false }
    : round.kind === "messages" ? { person: "nina" as PersonId, text: phraseText(round.ensemble![0].expected), narration: true }
      : round.kind === "join" || round.kind === "speaker" ? { person: "nina" as PersonId, text: phraseText(round.expected), narration: true }
        : round.kind === "ensemble" && ensemble[activeTurn] ? { person: "nina" as PersonId, text: phraseText(ensemble[activeTurn]!), narration: true }
          : draft && isCanonicalPreview(draft) ? { person: "nina" as PersonId, text: phraseText(draft), narration: true } : null;
  const mainAudio = proposedAudio && audio.has(proposedAudio.person, proposedAudio.text) ? proposedAudio : null;
  const exampleReader = round.vocabulary ? phraseText(round.expected) : modelAudio[0][0];
  function listenMain() {
    if (audio.blocked) { void audio.unlock(); return; }
    if (audio.playingKey) { pauseSpeech(); return; }
    if (activeGuide && !activeGuide.complete) { showMechanic(); return; }
    if (mainAudio) { perform([{ person: mainAudio.person, text: mainAudio.text, role: mainAudio.narration ? "narration" : "character" }]); return; }
    showModel(); listen("nina", exampleReader);
  }
  function readPortuguese(phrase: string) {
    return <AudioButton person="nina" text={phrase} label={`Ouvir em português: ${phrase}`} playingKey={audio.playingKey}
      play={listen} pause={pauseSpeech} available={audio.has("nina", phrase)}/>;
  }
  const automaticPlan = JSON.stringify(getAutomaticLessonSpeech(round, isComplete, speaker).filter(turn => audio.has(turn.person, turn.text)));
  const speechContext = `${visit}:${round.id}:${isComplete ? "accepted" : writing ? "write" : "prompt"}`;
  const mechanic = getLessonMechanic(round, writing);
  const activeGuide = mechanicGuide?.context === speechContext && mechanicGuide.id === mechanic?.id ? mechanicGuide : null;
  const mechanicId = mechanic?.id;
  const mechanicTiming = mechanic ? MECHANIC_TIMING[mechanic.id] : undefined;
  const mechanicHandPlan = mechanicId ? MECHANIC_HAND_PLANS[mechanicId] : null;
  const taskOrder = LESSON_SCENES.slice(0, progress.scene).reduce((count, item) => count + item.rounds.length, 0) + progress.round;

  function rememberMechanics(ids: readonly LessonMechanicId[]) {
    for (const id of ids) seenMechanics.current.add(id);
    try { lessonStorage.setItem(LESSON_MECHANICS_STORAGE, JSON.stringify({ ...readMechanicMetadata(lessonStorage.getItem(LESSON_MECHANICS_STORAGE)), version: 1, seen: [...seenMechanics.current] })); } catch { setStorageError(true); }
  }
  const startMechanic = useCallback((id: LessonMechanicId, context: string, turns: LessonSpokenTurn[], autoplay: boolean) => {
    const token = ++guideGeneration.current;
    setMechanicGuide({ id, context, token, complete: false });
    perform(turns, autoplay, () => setMechanicGuide(current => current?.token === token ? { ...current, complete: true } : current));
  }, [perform, setMechanicGuide]);
  function showMechanic() {
    if (!mechanic || finished || isComplete) return;
    rememberMechanics([mechanic.id]); autoPlayed.current.add(speechContext);
    startMechanic(mechanic.id, speechContext, [{ person: "nina", text: mechanic.text, role: "narration" }], false);
  }
  function takeControl() {
    if (!activeGuide || audio.whenIdle(true)) return;
    autoPlayed.current.add(speechContext);
    stopSpeech();
  }
  function activityInput(event: { target: EventTarget | null }) {
    // Playback controls must inspect the recording they were clicked for.
    // Cancelling it in capture would turn Pause into Play and unmount Retry.
    if (event.target instanceof Element && event.target.closest(".lo-audio-button,[data-audio-retry]")) return;
    onInteraction?.();
    takeControl();
  }
  useEffect(() => {
    if (!ready || finished || introductionOpen || tutorialOpen || modelOpen || autoPlayed.current.has(speechContext)) return;
    const turns = JSON.parse(automaticPlan) as LessonSpokenTurn[];
    if (turns.some(turn => turn.role === "character" && !readyPeople.has(turn.person))) return;
    let cancelled = false;
    const ticket = sequence.current;
    const start = () => {
      if (cancelled || document.hidden || ticket !== sequence.current || autoPlayed.current.has(speechContext)) return;
      autoPlayed.current.add(speechContext);
      if (!isComplete && mechanic && !seenMechanics.current.has(mechanic.id)) {
        seenMechanics.current.add(mechanic.id);
        try { lessonStorage.setItem(LESSON_MECHANICS_STORAGE, JSON.stringify({ ...readMechanicMetadata(lessonStorage.getItem(LESSON_MECHANICS_STORAGE)), version: 1, seen: [...seenMechanics.current] })); } catch { setStorageError(true); }
        startMechanic(mechanic.id, speechContext, [{ person: "nina", text: mechanic.text, role: "narration" }], true);
      } else if (turns.length) perform(turns, true);
    };
    const frame = requestAnimationFrame(() => {
      if (isComplete && outcomeSound.current) void outcomeSound.current.then(start);
      else start();
    });
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, [speechContext, automaticPlan, ready, finished, introductionOpen, tutorialOpen, modelOpen, readyPeople, perform, mechanic, isComplete, startMechanic, lessonStorage]);

  function finishIntroduction() {
    sounds.play("advance");
    try { lessonStorage.setItem(LESSON_INTRODUCTION_STORAGE, "done"); lessonStorage.removeItem(INTRODUCTION_POSITION_STORAGE); } catch { setStorageError(true); }
    setIntroductionOpen(false);
  }
  function openIntroduction() {
    try { lessonStorage.removeItem(INTRODUCTION_POSITION_STORAGE); lessonStorage.removeItem(TUTORIAL_POSITION_STORAGE); } catch { setStorageError(true); }
    clearAttempt(); setProgress(p => ({ ...p, scene: 0, round: 0 }));
    menu.current?.close(); setTutorialOpen(true); setIntroductionOpen(true);
  }

  function finishTutorial(learned: readonly LessonMechanicId[] = []) {
    sounds.play("advance");
    try { lessonStorage.setItem(LESSON_TUTORIAL_STORAGE, "done"); lessonStorage.removeItem(TUTORIAL_POSITION_STORAGE); } catch { setStorageError(true); }
    rememberMechanics(learned);
    setTutorialOpen(false);
  }
  function openTutorial() {
    try { lessonStorage.removeItem(TUTORIAL_POSITION_STORAGE); } catch { setStorageError(true); }
    stopSpeech(); setTutorialOpen(true);
  }
  function previousRound() {
    sounds.play("advance");
    clearAttempt();
    if (finished) { setProgress(p => ({ ...p, scene: LESSON_SCENES.length - 1, round: LESSON_SCENES.at(-1)!.rounds.length - 1 })); return; }
    if (progress.round > 0) setProgress(p => ({ ...p, round: p.round - 1 }));
    else if (progress.scene > 0) setProgress(p => ({ ...p, scene: p.scene - 1, round: LESSON_SCENES[p.scene - 1].rounds.length - 1 }));
  }
  function clearWriting() { stopSpeech(); onDiscard?.(); setText(""); setResult(null); }
  const sceneAction = round.kind === "ensemble" ? "Leve uma fala até o turno destacado." : guide.action;
  const feedbackText = result ? result.corrections[0] ?? result.feedback : hint ? scene.hint : note || (round.vocabulary
    ? writing ? "Escreva a frase em inglês." : round.kind === "build" ? "Complete a fala com as peças." : "Escolha a fala e leve até o balão."
    : round.instruction);
  const audioError = audio.error ? <div className="lo-audio-error" role="status"><span>{audio.error}</span><button type="button" data-audio-retry="true" onClick={retryAudio}>Tentar novamente</button></div> : null;
  const speechContent = isComplete && writable ? <div className="lo-fixed-speech"><strong>{spoken(phraseText(round.expected))}</strong></div>
    : assembled && !writing ? <div className="lo-sentence-area"><span>Fala de {PERSON_NAMES[round.speaker]}</span><div className="lo-sentence">
    {round.kind === "verb" ? <strong>{currentPronoun === "I" ? "I" : currentPronoun ? currentPronoun[0].toUpperCase() + currentPronoun.slice(1) : ""}</strong> : <div data-tutorial-cue="word-pronoun-slot"><DropTarget id="word:pronoun" accept={["word"]} label="Espaço de quem fala ou de quem se fala" disabled={isComplete} className="lo-word-slot">{currentPronoun ? currentPronoun === "I" ? "I" : currentPronoun[0].toUpperCase()+currentPronoun.slice(1) : <span>quem?</span>}</DropTarget></div>}
    <div data-tutorial-cue="word-verb-slot"><DropTarget id="word:verb" accept={["word"]} label="Espaço para am ou are" disabled={isComplete} className="lo-word-slot">{picked.verb ?? <span>am / are</span>}</DropTarget></div><strong>{spoken(round.expected.complement)}.</strong>
  </div></div> : round.kind === "bubbles" && !writing ? <div data-tutorial-cue="bubble-target"><DropTarget id="speech" accept={["phrase"]} label={`Balão da fala de ${PERSON_NAMES[round.speaker]}`} disabled={isComplete} className={`lo-speech-target ${isComplete ? "is-filled" : ""}`}>
    <span>Fala de {PERSON_NAMES[round.speaker]}</span><strong>{isComplete ? phraseText(round.expected) : "Solte a fala aqui"}</strong><span className="lo-drop-dots" aria-hidden="true">···</span>
  </DropTarget></div> : ["speaker", "join"].includes(round.kind) ? <div className="lo-fixed-speech"><span>{round.kind === "join" ? `Fala de ${PERSON_NAMES[round.speaker]}` : "Quem pode dizer?"}</span><strong>{spoken(phraseText(round.expected))}</strong></div>
    : round.kind === "ensemble" && ensemble[activeTurn] ? <div className="lo-fixed-speech"><strong>{phraseText(ensemble[activeTurn]!)}</strong></div>
      : round.kind === "messages" && isComplete ? <div className="lo-fixed-speech"><strong>{phraseText(visualRound.expected)}</strong></div> : null;

  return <div ref={app} className={`lo-app ${fontClassName}`} style={COMIC_LESSON_STYLE} data-lesson-theme="comic" data-ui-sound-scope="local" data-input-active={inputActive} data-ready={ready} data-scene={scene.id} data-round={round.id} data-finished={finished} data-mechanic-guide={activeGuide?.id} data-introduction-open={introductionOpen}
    onClickCapture={event => { if (!introductionOpen && isLessonButtonClick(event.target) && !outcomeSound.current && !audio.whenIdle(true)) sounds.play("tap"); }}>
    <a className="lo-skip" href="#lesson-title">Ir para a atividade</a>
    <header className="lo-header">
      <div className="lo-brand-row"><button type="button" ref={menuButton} className="lo-icon" aria-label="Abrir percurso da aula" onClick={() => { stopSpeech(); menu.current?.showModal(); }}><MoreHorizontal size={24}/></button><div className="lo-brand-desktop"><Brand href="/dashboard"/></div><div className="lo-brand-mobile"><Brand onMenu={() => { stopSpeech(); menu.current?.showModal(); }}/></div><span className="lo-header-divider"/><span className="lo-header-name">Primeiros encontros</span></div>
      <div className="lo-header-tools"><button type="button" className="lo-help-button" aria-label="Como funciona a aula" onClick={openTutorial}><HelpCircle size={18}/><span className="lo-help-full">Como funciona a aula</span><span className="lo-help-compact">Guia da aula</span></button><span className="lo-level"><Sparkles size={15}/> Inglês do zero</span></div>
    </header>
    {finished ? <LessonConclusion onReturnToPractice={() => navigate(10)} onRestartPractice={() => reset.current?.showModal()} completion={completion}/> : <>
    <main className="lo-main">
      <div className="lo-heading">
        <div><LessonJourney stage="lesson" completed={Math.min(29, progress.completed.length)}/><h1 id="lesson-title" tabIndex={-1} ref={title}>Eu, você, nós, eles</h1></div>
        <div className="lo-progress" aria-label={`${Math.min(progress.scene + 1, 12)} de 12 cenas`}><span>{finished ? "Percurso concluído" : `${progress.scene + 1} de 12 cenas`}</span><div>{LESSON_SCENES.map((s, i) => <span key={s.id} className={`${completedScene(i) ? "is-done" : ""} ${i === progress.scene ? "is-current" : ""}`}/>)}</div></div>
      </div>
      <LessonDragProvider onDrop={drop} onSelect={() => sounds.play("tap")}>
        <LessonTaskTransition transitionKey={`${round.id}:${visit}`} order={taskOrder} enabled={ready && !introductionOpen && !tutorialOpen}>
        <section className={`lo-learning lo-kind-${round.kind}`} aria-label="Cena interativa" data-vocabulary={round.vocabulary ? true : undefined}
          onPointerDownCapture={event => {
            // Keep a touch source under the finger until the browser dispatches its click.
            if (event.pointerType === "touch" && event.target instanceof Element && event.target.closest("[data-lesson-drag-source]")) return;
            activityInput(event);
          }} onPointerMoveCapture={event => {
            if (event.target instanceof Element && event.target.closest("[data-lesson-dragging]")) activityInput(event);
          }} onClickCapture={activityInput} onKeyDownCapture={event => { if (!(event.target instanceof HTMLInputElement) && ["Enter", " "].includes(event.key)) activityInput(event); }}>
          <LessonStage round={round.kind === "ensemble" ? { ...visualRound, kind: "ensemble" } : round.kind === "messages" && isComplete ? { ...visualRound, kind: "messages" } : round} speechContent={speechContent} teamOverride={members} speakerOverride={round.kind === "speaker" && !isComplete ? undefined : speaker} cue={cue} selectedPerson={speaker} onPersonClick={choosePerson} speech={audio.speech} onCharacterReady={characterReady} allowIdleTaps={isComplete}>
            <div className="lo-stage-topline"><span className={`lo-mode ${scene.mode === "use" ? "is-use" : ""}`}>{scene.mode === "game" ? `Atividade ${scene.game}` : "Agora, na conversa"}</span>{scene.rounds.length > 1 && <span>Fala {progress.round + 1} de {scene.rounds.length}</span>}</div>
            <div className="lo-scene-guide" aria-live="polite"><h2>{spoken(guide.title)}</h2>{readPortuguese(guide.title)}<p>{vocabularyCue(sceneAction)}</p>{readPortuguese(sceneAction)}</div>
            {round.kind === "messages" ? <div className="lo-messages" data-tutorial-cue="messages">
              {(round.ensemble ?? []).map((r, i) => <div className="lo-message-card" key={r.id}><DropTarget id={`message:${i}`} accept={["person"]} label={`Remetente da mensagem ${i === 0 ? "A" : "B"}`} disabled={isComplete} className="lo-message"><span className="lo-message-letter">{i === 0 ? "A" : "B"}</span><strong>{phraseText(r.expected)}</strong><span className="lo-message-sender">{assignments[i] ? PERSON_NAMES[assignments[i]!] : "Quem enviou?"}</span></DropTarget><AudioButton person={isComplete ? r.speaker : "nina"} text={phraseText(r.expected)} playingKey={audio.playingKey} play={(person,text) => perform([{person,text,role:isComplete ? "character" : "narration",turnIndex:i}])} pause={pauseSpeech} available={audio.has(isComplete ? r.speaker : "nina", phraseText(r.expected))} className="lo-message-audio" label={`Ouvir mensagem ${i === 0 ? "A" : "B"} narrada`}/></div>)}
            </div> : round.kind === "ensemble" ? <div className="lo-context-caption">{visualRound.instruction}</div> : null}
          </LessonStage>
          <div className="lo-workbench">
            <div className="lo-workbench-top"><div className="lo-workbench-tools">{(mainAudio || audio.has("nina", exampleReader) || audio.blocked || audio.playingKey) && <button type="button" className="lo-audio-button lo-audio-main" data-sound-silent="true" onClick={listenMain} aria-label={audio.blocked ? "Ativar som" : audio.playingKey ? "Pausar áudio" : activeGuide && !activeGuide.complete ? "Repetir orientação" : mainAudio ? round.kind === "messages" && mainAudio.narration ? "Ouvir mensagem A narrada" : mainAudio.narration ? "Ouvir frase narrada" : `Ouvir fala de ${PERSON_NAMES[mainAudio.person]}` : "Ouvir exemplo narrado"} data-audio-main="true" data-audio-role={mainAudio ? mainAudio.narration ? "narration" : "character" : undefined} data-audio-person={mainAudio?.person} data-audio-text={mainAudio?.text}>{audio.playingKey ? <Pause size={13}/> : <Volume2 size={13}/>}<span>{audio.blocked ? "Ativar som" : audio.playingKey ? "Pausar" : activeGuide && !activeGuide.complete ? "Repetir orientação" : mainAudio ? "Ouvir de novo" : "Ouvir exemplo"}</span>{!audio.playingKey && !audio.blocked && <small>{mainAudio && !mainAudio.narration ? PERSON_NAMES[mainAudio.person] : "leitura"}</small>}</button>}{writable && <button type="button" className="lo-write-toggle" onClick={toggleWriting}><PenLine size={13}/>{writing ? "Usar peças" : "Digitar"}</button>}</div></div>
            {writing && writable ? <form className="lo-write" onSubmit={(e: FormEvent) => { e.preventDefault(); next(); }}><input enterKeyHint="done" onFocus={() => setInputActive(true)} onBlur={() => setInputActive(false)} data-tutorial-cue="write-input" aria-label="Sua fala em inglês" maxLength={120} value={text} onChange={e => { const value = e.currentTarget.value; setText(value); setResult(null); if (value) onInteraction?.(); else onDiscard?.(); takeControl(); }} disabled={isComplete} placeholder="Escreva aqui…" autoComplete="off" autoCapitalize="off" spellCheck={false}/><button type="button" data-tutorial-cue="apagar" className="lo-clear-writing" disabled={!text} aria-label="Apagar o que escrevi" onClick={clearWriting}><Eraser size={16}/><span>Apagar</span></button><button type="submit" disabled={!text.trim() || isComplete} data-sound-silent="true" aria-label="Verificar fala"><ArrowRight size={20}/></button></form> : round.kind === "bubbles" ? <div className="lo-phrase-bank" data-tutorial-cue="bubble-bank">{choices.map((p, i) => <div className="lo-audio-option" key={phraseText(p)}><DragSource item={phraseItem(p, i)} onClick={() => listen("nina", phraseText(p))} disabled={isComplete} className="lo-phrase"><span className="lo-phrase-grip"><Grip size={15}/></span>{phraseText(p)}</DragSource><AudioButton person="nina" text={phraseText(p)} playingKey={audio.playingKey} play={listen} pause={pauseSpeech} available={readChoices && audio.has("nina", phraseText(p))}/></div>)}</div> : assembled ? <div className="lo-word-bank" data-tutorial-cue="word-bank">
              {round.kind === "build" && <div className="lo-word-family" data-family="pronoun"><button type="button" className="lo-word-family-label" onClick={() => document.dispatchEvent(new CustomEvent("lesson-explain-word", { detail: "I" }))}>De quem falamos <HelpCircle size={12}/></button>{PRONOUNS.map(word => <DragSource key={word} item={{ id: `word:${word}`, kind:"word", value:word, label:word }} onClick={element => hearWord(element, word)} disabled={isComplete} className="lo-word">{word}</DragSource>)}</div>}
              <div className="lo-word-family" data-family="verb"><button type="button" className="lo-word-family-label" onClick={() => document.dispatchEvent(new CustomEvent("lesson-explain-word", { detail: "are" }))}>Complete a fala <HelpCircle size={12}/></button>{VERBS.map(word => <DragSource key={word} item={{ id:`word:${word}`,kind:"word",value:word,label:word }} onClick={element => hearWord(element, word)} disabled={isComplete} className="lo-word lo-verb">{word}</DragSource>)}</div><span className="lo-piece-note">Escolha e depois toque no espaço.</span>
            </div> : round.kind === "messages" ? <div className="lo-context-note"><UsersRound size={18}/><span>Quem poderia enviar cada mensagem? Use cada pessoa uma vez.</span></div> : round.kind === "ensemble" ? <>
              <div className="lo-turns" data-tutorial-cue="turns">{(round.ensemble ?? []).map((r,i) => <DropTarget key={r.id} id={`turn:${i}`} accept={["phrase"]} label={`Turno ${i+1}: ${PERSON_NAMES[r.speaker]} fala para ${PERSON_NAMES[r.listener]}, sobre ${r.referent === "team" ? "a equipe" : PERSON_NAMES[r.referent]}`} disabled={isComplete} className={`lo-turn ${activeTurn === i ? "is-active" : ""}`}><button type="button" className="lo-turn-context" onClick={() => { setActiveTurn(i); if (isComplete) perform([{ person:r.speaker,text:phraseText(r.expected),role:"character",turnIndex:i }]); }}><span>{i+1}</span>{PERSON_NAMES[r.speaker]} <ArrowRight size={11}/>{PERSON_NAMES[r.listener]}<small>· sobre {r.referent === "team" ? "a equipe" : PERSON_NAMES[r.referent]}</small></button><strong>{ensemble[i] ? phraseText(ensemble[i]!) : "Solte a fala aqui"}</strong></DropTarget>)}</div>
              <div className="lo-phrase-bank lo-ensemble-bank" data-tutorial-cue="bubble-bank">{choices.map((p,i) => <div className="lo-audio-option" key={phraseText(p)}><DragSource item={phraseItem(p,i)} onClick={() => listen("nina", phraseText(p))} disabled={isComplete} className="lo-phrase"><Grip size={13}/>{phraseText(p)}</DragSource><AudioButton person="nina" text={phraseText(p)} playingKey={audio.playingKey} play={listen} pause={pauseSpeech} available={readChoices && audio.has("nina", phraseText(p))}/></div>)}</div>
            </> : <div className="lo-context-note"><UsersRound size={18}/><span>{round.kind === "join" ? "A área da equipe mostra quem faz parte dela." : "A equipe continua a mesma. Só muda quem fala."}</span></div>}
            {!modelOpen && audioError}
          </div>
        </section>
        </LessonTaskTransition>
      </LessonDragProvider>
      {activeGuide && mechanic ? <aside className="lo-feedback lo-mechanic-coach" aria-label="Como fazer esta atividade" data-lesson-mechanic={mechanic.id}>
        <Volume2 size={19} aria-hidden="true"/>
        <TutorialCaption key={`${activeGuide.context}:${activeGuide.token}`} speech={audio.speech} text={mechanic.text} clipKey={mechanic.key} timing={mechanicTiming} complete={activeGuide.complete}/>
        <div className="lo-mechanic-actions"><button type="button" aria-label="Repetir orientação" onClick={showMechanic}><Volume2 size={16}/></button><button type="button" aria-label="Fechar orientação" onClick={stopSpeech}><X size={17}/></button></div>
      </aside> : <aside className={`lo-feedback ${!result && !hint && !note ? "is-empty" : ""} ${result?.correct ? "is-correct" : result ? "is-retry" : ""}`} aria-live="polite" aria-atomic="true">
        {result?.correct ? <Check size={19}/> : <Lightbulb size={18}/>}<div>{result ? <><strong>{result.correct ? result.corrections.length ? "Você se fez entender." : "Faz sentido." : result.meaningCorrect ? "Ajuste apenas o verbo." : "Observe de outro jeito."}</strong><span>{feedbackText}</span>{readPortuguese(feedbackText)}{result.correct && result.corrections.length > 0 && <button type="button" onClick={() => { stopSpeech(); coaching.current?.showModal(); }}>Ver ajustes</button>}</> : <><strong>{hint ? "Uma pista" : note ? "Sobre o movimento" : scene.mode === "game" ? "Descubra a relação." : "Use a ideia em outra conversa."}</strong><span>{feedbackText}</span>{readPortuguese(feedbackText)}</>}</div>
        {result?.correct && <span className="lo-accepted"><Check size={12}/> Entendido</span>}
        {!finished && !isComplete && <button type="button" className="lo-mechanic-help" onClick={showMechanic}><HelpCircle size={16}/><span>Como fazer</span></button>}
      </aside>}
    </main>
    <footer className="lo-footer">
      <div className="lo-mobile-actions"><details className="lo-actions-menu" onKeyDown={event => { if (event.key === "Escape") event.currentTarget.open = false; }}><summary aria-label="Opções da aula"><MoreHorizontal size={24}/></summary><div className="lo-actions-panel" onClick={event => { if (event.target instanceof Element && event.target.closest("button")) event.currentTarget.closest("details")?.removeAttribute("open"); }}>
        <button type="button" disabled={progress.scene===0 && progress.round===0} onClick={previousRound}><ArrowLeft size={18}/>Voltar</button>
        <button type="button" onClick={clearAttempt}><RotateCcw size={18}/>Refazer atividade</button>
        <button type="button" onClick={showMechanic}><Volume2 size={18}/>Ouvir orientação</button>
        <button type="button" onClick={showModel}><Play size={18}/>Ver exemplo</button>
        <button type="button" onClick={() => { setHint(value => !value); markSupport(); }}><Lightbulb size={18}/>Uma pista</button>
        <button type="button" onClick={() => { stopSpeech(); reset.current?.showModal(); }}><RotateCcw size={18}/>Recomeçar do zero</button>
      </div></details></div>
      <div className="lo-navigation"><button type="button" className="lo-back" aria-label="Voltar" disabled={progress.scene===0 && progress.round===0} onClick={previousRound}><ArrowLeft size={17}/><span>Voltar</span></button>
        {!finished && <button type="button" className="lo-text-button lo-retry" aria-label="Refazer atividade" onClick={clearAttempt}><RotateCcw size={16}/><span>Refazer</span></button>}
        <button type="button" className="lo-text-button lo-restart" aria-label="Recomeçar aula do zero" onClick={() => { stopSpeech(); reset.current?.showModal(); }}><RotateCcw size={16}/><span>Recomeçar do zero</span></button>
      </div>
      {storageError && <span className="lo-footer-note">Avanço mantido nesta sessão.</span>}
      <div className="lo-footer-actions">{!finished && <><button type="button" className="lo-text-button lo-model-trigger" aria-label="Ver exemplo da relação" onClick={showModel}><Play size={15}/><span>Ver exemplo</span></button><button type="button" className={`lo-text-button ${hint ? "is-active" : ""}`} aria-pressed={hint} onClick={() => {setHint(h=>!h);markSupport();}}><Lightbulb size={17}/>Uma pista</button></>}
        <LessonButton type="button" className="lo-next" data-sound-silent={!isComplete} data-tutorial-cue="check" disabled={!ready || !finished && !canCheck} onClick={next}>{finished ? "Rever do início" : isComplete ? progress.scene===11 && progress.round===scene.rounds.length-1 ? "Concluir aula" : "Continuar" : "Conferir"}<ArrowRight size={18}/></LessonButton>
      </div>
    </footer>
    </>}
    <LessonWordCoach key={round.id} enabled={ready && !introductionOpen && !tutorialOpen && !finished && assembled && !writing && (confirmationPhase === "word" || !isComplete && !confirmationPhase)} onOpen={stopSpeech} manualReadingRef={manualWord}/>
    <TutorialHand scopeRef={app} speech={audio.speech} plan={mechanicHandPlan} active={Boolean(activeGuide) && !introductionOpen && !tutorialOpen && !modelOpen}/>
    {ready && introductionOpen && <LessonIntroduction onFinish={finishIntroduction} onSkip={finishIntroduction} finishLabel="Como funciona a aula"/>}
    {ready && !introductionOpen && tutorialOpen && <LessonTutorial onFinish={finishTutorial}/>}
    <dialog ref={menu} className="lo-menu" aria-labelledby="lo-menu-title" onClose={() => menuButton.current?.focus()} onClick={e => {if(e.target===e.currentTarget)menu.current?.close();}}><div className="lo-menu-inner"><div className="lo-dialog-heading"><span>Seu percurso</span><button type="button" className="lo-icon" aria-label="Fechar percurso" onClick={()=>menu.current?.close()}><X size={20}/></button></div><h2 id="lo-menu-title">Eu, você, nós, eles</h2><a className="lo-menu-dashboard" href="/dashboard">Voltar ao meu painel</a><button type="button" className="lo-menu-introduction" onClick={openIntroduction}><Play size={14}/><span>Apresentação da aula</span></button><nav aria-label="Atividades da aula">{TITLES.map((t,i)=><button type="button" key={t} disabled={firstPending>=0&&i*2>firstPending} aria-current={scene.game===i+1&&!finished?"step":undefined} onClick={()=>navigate(i*2)}><span>{completedScene(i*2+1)?<Check size={16}/>:i+1}</span><div><strong>{t}</strong><small>{completedScene(i*2+1)?"Atividade e conversa concluídas":"Atividade + uso na próxima cena"}</small></div><ChevronRight size={16}/></button>)}</nav>{firstPending < 0 && <button type="button" className="lo-menu-review" onClick={() => navigate(LESSON_SCENES.length)}><Check size={16}/><span>Teoria e teste da aula</span><ChevronRight size={16}/></button>}<button type="button" className="lo-sound-toggle" role="switch" aria-checked={!sounds.muted} aria-label="Sons de confirmação" data-sound-silent="true" onClick={() => { sounds.toggleMuted(); if (sounds.muted) sounds.play("tap"); }}>{sounds.muted ? <BellOff size={16}/> : <Bell size={16}/>}<span>Sons de confirmação</span><strong>{sounds.muted ? "Desativados" : "Ativados"}</strong></button><button type="button" className="lo-reset-button" onClick={()=>{ stopSpeech(); reset.current?.showModal(); }}><RotateCcw size={14}/>Recomeçar aula do zero</button></div></dialog>
    <dialog ref={model} className="lo-dialog lo-model-dialog" aria-labelledby="lo-model-title" onClose={() => { setModelOpen(false); stopSpeech(); }}>
      <div className="lo-dialog-heading"><span>{round.vocabulary ? "Exemplo da conversa" : "Veja a relação · exemplos narrados"}</span>
        <button type="button" className="lo-icon" aria-label="Fechar exemplo" onClick={() => model.current?.close()}><X size={20}/></button></div>
      <h2 id="lo-model-title">{round.vocabulary ? scene.title : TITLES[scene.game-1]}</h2>
      {round.vocabulary ? <>
        <p>{round.instruction}</p>{readPortuguese(round.instruction)}
        <div className="lo-example-pair"><div><strong lang="en">{spoken(phraseText(round.expected))}</strong><p>{spoken(round.vocabulary.translation)}</p>
          <AudioButton person="nina" text={exampleReader} playingKey={audio.playingKey} play={listen} pause={pauseSpeech} available={audio.has("nina", exampleReader)}/>
          {readPortuguese(round.vocabulary.translation)}
        </div></div>
        <p>{vocabularyCue(round.vocabulary.cue)}</p>{readPortuguese(round.vocabulary.cue)}
        <AudioButton person="nina" text={round.expected.complement} caption={round.expected.complement} playingKey={audio.playingKey} play={listen} pause={pauseSpeech} available={audio.has("nina", round.expected.complement)}/>
      </> : <>
        <div className="lo-example-pair">{([0,1] as const).map(index => <div key={index}><strong>{spoken(models[index*2])}</strong><p>{spoken(models[index*2+1])}</p>{readPortuguese(models[index*2+1])}
          <div className="lo-model-audio">{modelAudio[index].map(phrase => <AudioButton key={phrase} person="nina" text={phrase} caption={phrase} playingKey={audio.playingKey} play={listen} pause={pauseSpeech} available={audio.has("nina", phrase)}/>)}</div>
        </div>)}</div><p>{scene.insight}</p>{readPortuguese(scene.insight)}
      </>}
      {modelOpen && audioError}
      <LessonButton type="button" className="lo-next" onClick={() => model.current?.close()}>Vamos experimentar <ArrowRight size={17}/></LessonButton>
    </dialog>
    <dialog ref={coaching} className="lo-dialog" aria-labelledby="lo-coach-title"><div className="lo-dialog-heading"><span>Um ajuste de escrita</span><button type="button" className="lo-icon" aria-label="Fechar ajustes" onClick={()=>coaching.current?.close()}><X size={20}/></button></div><h2 id="lo-coach-title">Você se fez entender.</h2><p className="lo-coach-model">{phraseText(round.expected)}</p><ul>{result?.corrections.map(c=><li key={c}>{c}</li>)}</ul><LessonButton type="button" className="lo-next" onClick={()=>coaching.current?.close()}>Entendi <Check size={17}/></LessonButton></dialog>
    <dialog ref={reset} className="lo-dialog" aria-labelledby="lo-reset-title"><h2 id="lo-reset-title">Recomeçar a aula do zero?</h2><p>A apresentação, o tutorial, as atividades e o teste voltarão ao início neste navegador.</p><div className="lo-dialog-actions"><button type="button" className="lo-secondary" onClick={()=>reset.current?.close()}>Manter meu avanço</button><LessonButton type="button" className="lo-next" onClick={resetCourse}>Recomeçar</LessonButton></div></dialog>
  </div>;
}

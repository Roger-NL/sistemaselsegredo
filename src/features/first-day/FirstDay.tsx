"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useContext, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, GripVertical, ArrowUp, MoreHorizontal, Pause, RotateCcw, Volume2, X } from "lucide-react";
import { Brand } from "@/components/ui/Brand";
import { LessonButton } from "../first-encounters/LessonButton";
import { COMIC_LESSON_STYLE } from "../first-encounters/lesson-comic-theme";
import { DragSource, DropTarget, LessonDragProvider } from "../first-encounters/LessonDrag";
import { createLessonSoundsEngine } from "../first-encounters/lesson-sounds";
import type { LessonSoundCue } from "../first-encounters/lesson-sounds";
import { useLessonSounds } from "../first-encounters/useLessonSounds";
import { art, cleanReadingMedia, partOnePortraitMedia, coverSources, pages, usesCleanReading } from "./content";
import type { ChallengePage, CharacterReply, ExamplesPage, FirstDayArt, GuidedPage, ReactionPage, RulePage, WordSequence } from "./content";
import { prologue, prologueOrder, doorCaptionPt, type PrologueStep } from "./prologue";
import { EnglishWords, MeaningContext, meaningOf } from "./WordMeaning";
import { PartTwoMoment } from "./PartTwoMoment";
import { ChapterOpening, LessonEnding } from "./PartTwoOpening";
import { FirstDayAudioChoice } from "./FirstDayAudioChoice";
import { FirstDayProgressReset } from "./FirstDayProgressReset";
import { FirstDragTutorial, StoryPanel } from "./StoryPanel";
import { createFirstDayArtCache } from "./first-day-art";
import { chapterOpeningAt, createFirstDayProgressStore, resetFirstDayProgress, type ChallengeAttempt, type ComicChapter, type FirstDayResetTarget } from "./first-day-progress";
import { capturePanel, curlPanel, getTurnPanel, type PanelCapture } from "./page-curl";
import { arrivalNarration, coverCopy, coverNarration, dialogue, FIRST_DAY_AUDIO_RATE, seatedNarration, narration, portugueseNarration, spokenDialogue, wordVoices } from "./narration";
import type { DialogueClip, FirstDayVoiceClip, NarrationClip } from "./narration";
import { useFirstDayNarration } from "./useFirstDayNarration";
import { useFirstDayPaperSound } from "./useFirstDayPaperSound";
import { useFirstDayPullToRefresh } from "./useFirstDayPullToRefresh";
import "../first-encounters/lesson-one.css";
import "../first-encounters/lesson-comic-theme.css";
import "./first-day.css";
import "./first-day-desktop.css";
import "./first-day-spacing.css";
import "./first-day-spread.css";
import "./first-day-clean-reading.css";
import "./first-day-clean-reactions.css";
import "./first-day-clean-examples.css";
import "./first-day-clean-rule.css";
import "./first-day-clean-challenge.css";
import "./first-day-mobile-cover.css";
import "./first-day-turn.css";
import "./first-day-part-one.css";
import "./first-day-part-one-study.css";
import "./first-day-part-one-story.css";
import "./first-day-tutorial.css";
import "./part-two.css";

const previewSounds = createLessonSoundsEngine({ getStorage: () => undefined, playbackRate: FIRST_DAY_AUDIO_RATE });
const bubbleTarget = "first-day-bubble";
type VoicePlayer = ReturnType<typeof useFirstDayNarration>;

function pageNarration(page: (typeof pages)[number] | undefined, englishVoice: boolean): readonly NarrationClip[] {
  if (page?.part !== 1) return [];
  switch (page?.kind) {
    case "Ação": return (page.scene === "intro" ? seatedNarration : arrivalNarration).map(clip => englishVoice ? clip : portugueseNarration[clip] ?? clip);
    case "Reação": return [englishVoice ? page.narration : portugueseNarration[page.narration] ?? page.narration];
    case "Tirinha":
    case "Explicação": return [page.narration];
    case "Desafio": return [page.instruction[englishVoice ? "en" : "pt"]];
    default: return [];
  }
}

function sceneAudio(page: (typeof pages)[number] | undefined, englishVoice: boolean): readonly FirstDayVoiceClip[] {
  const clips = pageNarration(page, englishVoice);
  return page?.kind === "Reação" ? [...clips, spokenDialogue(page.reply.voice, englishVoice)] : clips;
}

function readCleanReadingMedia() {
  return window.matchMedia(cleanReadingMedia).matches;
}

function subscribeToCleanReadingMedia(listener: () => void) {
  const media = window.matchMedia(cleanReadingMedia);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

function readPartOnePortrait() {
  return window.matchMedia(partOnePortraitMedia).matches;
}

function subscribeToPartOnePortrait(listener: () => void) {
  const media = window.matchMedia(partOnePortraitMedia);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

function NarrationButton({ clips, player, language, showLabel = false }: {
  clips: readonly NarrationClip[];
  player: VoicePlayer;
  language: "inglês" | "português";
  showLabel?: boolean;
}) {
  const playing = clips.some(clip => clip === player.playing);
  const label = playing ? "Parar narração" : `Ouvir narração em ${language}`;
  return <button type="button" className="fd-narration-control" aria-label={label}
    title={playing ? label : clips.map(clip => narration[clip].text).join(" ")}
    onClick={() => playing ? player.stop() : player.play(clips)}>
    {playing ? <Pause size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
    {showLabel && <span>Narração</span>}
  </button>;
}

function SpeakButton({ clip, englishVoice = true, player, className, children, descriptionId }: {
  clip: DialogueClip;
  englishVoice?: boolean;
  player: VoicePlayer;
  className: string;
  children: ReactNode;
  descriptionId?: string;
}) {
  const spoken = spokenDialogue(clip, englishVoice);
  const playing = player.playing === spoken;
  const label = playing ? "Parar fala" : "Ouvir fala";
  return <div className={className}>{children}<button type="button" className="fd-inline-listen" aria-pressed={playing}
    aria-label={`${label}: ${spoken in narration ? narration[spoken as NarrationClip].text : dialogue[clip].text}`} aria-describedby={descriptionId}
    title={label} onClick={() => playing ? player.stop() : player.play([spoken])}>
    <span aria-hidden="true">
      {playing ? <Pause size={12} aria-hidden="true" /> : <Volume2 size={12} aria-hidden="true" />}
    </span>
  </button></div>;
}

function ReplyBalloon({ reply, player, englishVoice }: { reply: CharacterReply; player?: VoicePlayer; englishVoice: boolean }) {
  const line = <b className="fd1-spoken-line" lang={englishVoice ? "pt-BR" : "en"}>
    {englishVoice ? reply.translation : <EnglishWords text={dialogue[reply.voice].text}/>}
  </b>;
  return player ? <SpeakButton clip={reply.voice} englishVoice={englishVoice} player={player} className="fd1-bubble-body">{line}</SpeakButton>
    : <div className="fd1-bubble-body" role="group" aria-label={`Resposta de ${reply.speaker}`}>{line}</div>;
}

function ReactionMoment({ page, voice, cleanReading, englishVoice }: { page: ReactionPage; voice?: VoicePlayer; cleanReading: boolean; englishVoice: boolean }) {
  return <section className="fd1-story" data-kind="reaction" aria-label={page.title}>
    <StoryPanel page={page} portrait={cleanReading}><ReplyBalloon reply={page.reply} englishVoice={englishVoice} player={voice} /></StoryPanel>
    {page.tip && <aside className="fd1-story-strip fd1-tip">
      <h2>{page.tip.title}</h2>
      <ul lang="en">{page.tip.phrases.map(phrase => <li key={phrase}><EnglishWords text={phrase}/></li>)}</ul>
    </aside>}
  </section>;
}

function WordStrip({ words, order, placed, nextWord }: WordSequence & {
  placed: readonly number[];
  nextWord?: number;
}) {
  const show = useContext(MeaningContext);
  return <div className="fd1-words" role="group" aria-label="Faixa de palavras" lang="en">
    {order.map(index => <DragSource key={index}
      item={{ id: `word-${index}`, kind: "word", value: String(index), label: words[index] }}
      onClick={() => show(words[index])} disabled={placed.includes(index)} className={index === nextWord ? "fd1-word fd1-word-next" : "fd1-word"}>
      {words[index]}
    </DragSource>)}
  </div>;
}

function LearnerBalloon({ words, placed, translation, complete, locked = complete, speech, englishVoice }: {
  words: readonly string[];
  placed: readonly number[];
  translation?: string;
  complete: boolean;
  locked?: boolean;
  speech?: { clip: DialogueClip; player: VoicePlayer };
  englishVoice: boolean;
}) {
  const phrase = placed.map(index => words[index]).join(" ");
  if (complete) {
    const line = <b className="fd1-spoken-line" lang={englishVoice ? "pt-BR" : "en"}>{englishVoice ? translation : <EnglishWords text={phrase}/>}</b>;
    return speech ? <SpeakButton {...speech} englishVoice={englishVoice} className="fd1-bubble-body">{line}</SpeakButton>
      : <div className="fd1-bubble-body" role="status">{line}</div>;
  }
  return <DropTarget id={bubbleTarget} accept={["word"]} disabled={locked} className="fd1-bubble-body"
    label={phrase ? `Seu balão. Colocar palavra. Montagem até agora: ${phrase}` : "Seu balão. Colocar palavra"}>
    <span className="fd1-slots" lang="en">{words.map((word, slot) =>
      slot < placed.length ? <b key={word}><EnglishWords text={words[placed[slot]]}/></b> : <i key={word} aria-hidden="true" />)}</span>
    {translation && <span className="fd1-translation" aria-live="polite">{translation}</span>}
  </DropTarget>;
}

function GuidedMoment({ page, count, onPlace, cue, narrator, audioEnabled, cleanReading, englishVoice }: {
  page: GuidedPage;
  count: number;
  onPlace: (count: number) => void;
  cue: (sound: LessonSoundCue) => void;
  narrator: VoicePlayer;
  audioEnabled: boolean;
  englishVoice: boolean;
  cleanReading: boolean;
}) {
  const [mistake, setMistake] = useState(false);
  const placed = page.words.slice(0, count).map((_, index) => index);
  const done = count === page.words.length;
  const first = page.scene === "sit";

  function place(value: string) {
    if (done) return;
    if (Number(value) !== count) {
      setMistake(true);
      cue("retry");
      return;
    }
    const next = count + 1;
    setMistake(false);
    onPlace(next);
    if (!narrator.playing && !(audioEnabled && next === page.words.length)) {
      cue(next === page.words.length ? "success" : "place");
    }
  }

  return <LessonDragProvider onDrop={item => place(item.value)}
    onSelect={audioEnabled ? item => narrator.play([wordVoices[page.words[Number(item.value)]]]) : undefined}>
    <section className="fd1-story" data-kind="guided" data-complete={done} aria-label="Montagem guiada">
      <StoryPanel page={page} portrait={cleanReading} expanded={count > 0}>
        <LearnerBalloon englishVoice={englishVoice} words={page.words} placed={placed} translation={page.translations[count]} complete={done}
          speech={done && audioEnabled ? { clip: page.voice, player: narrator } : undefined} />
      </StoryPanel>
      {done ? <div className="fd1-story-strip fd1-finished" role="status">Continue quando quiser.</div>
        : <div className="fd1-story-strip fd1-guided-controls">
          {(first || mistake) && <p className="fd1-guidance" aria-live="polite">{mistake
            ? "Tente a peça destacada." : "Arraste a peça destacada ou toque nela e depois no balão."}</p>}
          <WordStrip words={page.words} order={page.order} placed={placed} nextWord={count} />
        </div>}
      {first && count === 0 && !mistake && <FirstDragTutorial />}
    </section>
  </LessonDragProvider>;
}

function StudyArt({ image, portraitImage }: { image: FirstDayArt; portraitImage: FirstDayArt }) {
  return <picture className="fd1-study-art">
    <source media={partOnePortraitMedia} srcSet={portraitImage.src} width={portraitImage.width} height={portraitImage.height} />
    <Image src={image.src} width={image.width} height={image.height} alt={image.alt} loading="eager" unoptimized />
  </picture>;
}

function StudyCaption({ clip, translation, voice, children }: {
  clip: DialogueClip; translation: string; voice?: VoicePlayer; children: ReactNode;
}) {
  const translationId = `fd-study-translation-${clip}`;
  const copy = <>
    <span className="fd1-study-line" lang="en">{children}</span>
    <span className="fd1-study-translation" id={translationId}>{translation}</span>
  </>;
  return voice ? <SpeakButton className="fd1-study-caption" player={voice} clip={clip} descriptionId={translationId}>
    {copy}
  </SpeakButton> : <div className="fd1-study-caption">{copy}</div>;
}

function ExamplesMoment({ page, voice }: { page: ExamplesPage; voice?: VoicePlayer }) {
  return <section className="fd-examples fd1-strip" aria-label="Pedidos em três situações">
    {page.panels.map(panel => <figure className="fd1-study-panel" key={panel.voice}>
      <StudyArt image={panel.image} portraitImage={panel.portraitImage} />
      <figcaption>
        <span className="fd1-study-label">{panel.context}</span>
        <StudyCaption clip={panel.voice} voice={voice} translation={panel.translation}>
          <EnglishWords text={panel.line}/>
        </StudyCaption>
      </figcaption>
    </figure>)}
  </section>;
}

function RuleMoment({ page, voice }: { page: RulePage; voice?: VoicePlayer }) {
  return <section className="fd-rule fd1-rule" aria-label="Estrutura do pedido de permissão">
    <ul className="fd1-rule-formula" aria-label="Partes da frase">
      {page.pieces.map((piece, index) => <Fragment key={piece.line}>
        {index > 0 && <li className="fd1-rule-plus" aria-hidden="true">+</li>}
        <li className="fd1-rule-piece" data-tone={piece.tone}>
          <b lang={piece.tone === "verb" ? undefined : "en"}>{piece.tone === "verb" ? piece.line : <EnglishWords text={piece.line}/>}</b>
          <span>{piece.meaning}</span>
        </li>
      </Fragment>)}
    </ul>
    <ol className="fd1-rule-examples" aria-label="Estrutura em dois pedidos">
      {page.examples.map(example => <li key={example.voice} className="fd1-study-panel">
        <StudyArt image={example.image} portraitImage={example.portraitImage} />
        <StudyCaption clip={example.voice} voice={voice} translation={example.translation}>
          {example.tokens.map((token, index) => <Fragment key={token.line}>
            {index > 0 && " "}<strong data-tone={token.tone}><EnglishWords text={token.line}/></strong>
          </Fragment>)}
        </StudyCaption>
      </li>)}
    </ol>
  </section>;
}

const emptyAttempt: ChallengeAttempt = { placed: [] };

function ChallengeReply({ reply, player, englishVoice }: { reply: ChallengePage["reply"]; player?: VoicePlayer; englishVoice: boolean }) {
  const line = <b lang={englishVoice ? "pt-BR" : "en"}>
    {englishVoice ? narration[reply.translationVoice].text : <EnglishWords text={dialogue[reply.voice].text}/>}
  </b>;

  return <section className="fd1-story-strip fd1-door-reply" aria-labelledby="fd-door-reply-speaker">
    <div className="fd1-door-reply-label">
      <strong id="fd-door-reply-speaker">{reply.speaker}</strong>
      <span role="status"><Check size={15} aria-hidden="true"/> Você acertou!</span>
    </div>
    {player ? <SpeakButton className="fd1-door-reply-line" player={player} clip={reply.voice}
      englishVoice={englishVoice} descriptionId="fd-door-reply-speaker">{line}</SpeakButton>
      : <div className="fd1-door-reply-line">{line}</div>}
  </section>;
}

function ChallengeMoment({ page, attempt, onAttempt, cue, voice, cleanReading, englishVoice }: {
  page: ChallengePage;
  attempt: ChallengeAttempt;
  englishVoice: boolean;
  onAttempt: (attempt: ChallengeAttempt) => void;
  cue: (sound: LessonSoundCue) => void;
  voice?: VoicePlayer;
  cleanReading: boolean;
}) {
  const [reset, setReset] = useState(0);
  const { placed, result, translated = false } = attempt;
  const full = placed.length === page.words.length;
  const solved = result === "correct";
  function place(value: string) {
    const index = Number(value);
    if (full || placed.includes(index)) return;
    onAttempt({ placed: [...placed, index], translated });
    cue("place");
  }

  function check() {
    if (!full) return;
    const correct = placed.every((index, slot) => page.words[index] === page.words[slot]);
    onAttempt({ placed, result: correct ? "correct" : "incorrect", translated });
    if (!correct || !voice) cue(correct ? "success" : "retry");
  }

  function clear() {
    voice?.stop();
    onAttempt({ ...emptyAttempt, translated });
    setReset(previous => previous + 1);
  }

  return <LessonDragProvider key={reset} onDrop={item => place(item.value)}
    onSelect={voice ? item => voice.play([wordVoices[page.words[Number(item.value)]]]) : undefined}>
    <section className="fd1-story" data-kind="challenge" data-complete={solved} aria-label="Pedido sem pistas">
      <StoryPanel page={page} portrait={cleanReading} expanded={placed.length > 0}>
        <LearnerBalloon englishVoice={englishVoice} words={page.words} placed={placed} complete={solved} locked={full}
          translation={solved ? narration[page.translationVoice].text : undefined}
          speech={solved && voice ? { clip: page.voice, player: voice } : undefined} />
      </StoryPanel>
      {solved ? <ChallengeReply reply={page.reply} player={voice} englishVoice={englishVoice} />
        : <div className="fd1-story-strip fd1-challenge-controls">
          <p className="fd1-guidance" role="status" data-result={result}>{result === "incorrect"
            ? "Comece pelo pedido, depois a ação. Limpe e tente de novo." : "Monte a frase e toque em Conferir."}</p>
          <WordStrip words={page.words} order={page.order} placed={placed} />
          <div className="fd1-check-actions">
            <button type="button" onClick={clear} disabled={!placed.length}>Limpar</button>
            <button type="button" onClick={check} disabled={!full || Boolean(result)}>Conferir <Check size={13} aria-hidden="true" /></button>
          </div>
        </div>}
    </section>
  </LessonDragProvider>;
}

export function FirstDay() {
  const [progress] = useState(createFirstDayProgressStore);
  const [imageCache] = useState(createFirstDayArtCache);
  const [artStatus, setArtStatus] = useState<"loading" | "retry" | null>(null);
  const navigationRequest = useRef({ id: 0 });
  const { position: savedPosition, chapterOpening, lessonFinished, counts, attempts, sound, readingLanguage } = useSyncExternalStore(
    progress.subscribe, progress.getSnapshot, progress.getServerSnapshot,
  );
  const englishVoice = readingLanguage === "pt-BR";
  const nextReadingLanguage = englishVoice ? "en" : "pt-BR";
  const languageAction = englishVoice ? "Ler em inglês e ouvir em português" : "Ler em português e ouvir em inglês";
  const position = Math.max(0, savedPosition);
  const portraitReading = useSyncExternalStore(subscribeToCleanReadingMedia, readCleanReadingMedia, () => false);
  const menu = useRef<HTMLDialogElement>(null);
  const [tutorial, setTutorial] = useState<PrologueStep | null>(null);
  const [lookedUp, setLookedUp] = useState("");
  const [practiceCount, setPracticeCount] = useState(0);
  const panel = tutorial ? prologue[tutorial] : null;
  const tutorialIndex = tutorial ? prologueOrder.indexOf(tutorial) : -1;
  const nextTutorialStep = prologueOrder[tutorialIndex + 1];
  const practicePieces = panel?.pieces ?? [];
  const practiced = practiceCount === practicePieces.length;
  const practiceMeaning = tutorial === "drag" && lookedUp === "there!" ? "Em “Hi there!”, o cumprimento inteiro quer dizer “Oi!”." : meaningOf(lookedUp);
  const replayClip = tutorial === "language" ? (englishVoice ? "tutorial-door-en" : "tutorial-door-pt") : panel?.audio;
  const replayLabel = tutorial === "language" ? `Ouvir exemplo em ${englishVoice ? "inglês" : "português"}`
    : tutorial === "arrival" ? "Ouvir Rafael" : "Ouvir instrução";
  const [changingAudio, setChangingAudio] = useState(false);
  const [resetNotice, setResetNotice] = useState<FirstDayResetTarget | null>(null);
  const editionPortrait = useSyncExternalStore(subscribeToPartOnePortrait, readPartOnePortrait, () => false);
  const audioMode = useRef<HTMLButtonElement>(null);
  const resetDialog = useRef<HTMLDialogElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const book = useRef<HTMLElement>(null);
  const turnSheet = useRef<HTMLCanvasElement>(null);
  const cancelTurn = useRef<(() => void) | null>(null);
  const nextTurn = useRef<{ direction: number; source: PanelCapture } | null>(null);
  const paperSound = useFirstDayPaperSound();
  useFirstDayPullToRefresh(book);
  const sounds = useLessonSounds(previewSounds);
  const speech = useFirstDayNarration();
  const narrator = { ...speech, play(clips: readonly FirstDayVoiceClip[], pauseMs?: number) {
    paperSound.stop();
    speech.play(clips, pauseMs);
  } };
  const page = pages[position - 1];
  const comic = page && page.part !== 1 && page.kind !== "Em preparação" ? page : undefined;
  const edition = page?.part === 1 || Boolean(comic);
  const mobileHeader = edition ? editionPortrait : portraitReading;
  const cleanReading = editionPortrait && usesCleanReading(page);
  const readingPage = page?.part === 1 && (page.kind === "Tirinha" || page.kind === "Explicação") ? page : undefined;
  const storyVoice = page?.kind === "Ação" || page?.kind === "Reação" || page?.kind === "Desafio";
  const captionClips = pageNarration(page, englishVoice);
  const comicAttempt = comic && attempts[comic.id];
  const comicSolved = comic?.kind === "Desafio" && comicAttempt?.round === 1 && comicAttempt.result === "correct";
  const comicCaption = comic?.kind === "Ação" && counts[comic.id] === comic.words.length ? comic.replyCaption
    : comic?.kind === "Desafio" && comicAttempt?.round === 1 ? (comicSolved && comic.completeCaption) || comic.revealCaption
    : comic?.caption;
  const caption = comicCaption ? comicCaption[readingLanguage === "en" ? "en" : "pt"]
    : storyVoice ? pageNarration(page, !englishVoice).map(clip => narration[clip].text).join(" ")
    : readingPage?.kind === "Tirinha" ? readingPage.description
    : readingPage?.kind === "Explicação" ? `${readingPage.lead} ${readingPage.detail}`
    : "";
  const chair = page?.part === 1 && page.kind === "Ação" ? page.detail : undefined;
  const comicPending = comic?.kind === "Ação" ? (counts[comic.id] ?? 0) < comic.words.length
    : comic?.kind === "Desafio" && !comicSolved;
  const finalChallenge = comic?.part === 4 && comic.kind === "Desafio" && position === pages.length;
  const nextPart = pages[position]?.part !== page?.part ? pages[position]?.part : undefined;
  const playingCover = narrator.playing === "cover";
  const openMenu = () => menu.current?.showModal();
  const leaveLesson = () => { menu.current?.close(); narrator.stop(); paperSound.stop(); };

  useEffect(() => {
    const requests = navigationRequest.current;
    return () => { requests.id++; };
  }, []);
  const artWarmPosition = chapterOpening ? position - 1 : savedPosition;
  useEffect(() => imageCache.warm(artWarmPosition), [imageCache, artWarmPosition, portraitReading, editionPortrait]);
  useEffect(() => {
    title.current?.focus({ preventScroll: true });
  }, [savedPosition, chapterOpening, lessonFinished, tutorial]);
  useLayoutEffect(() => {
    for (let node = book.current; node; node = node.parentElement) node.scrollTo?.({ top: 0, behavior: "instant" });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [position, chapterOpening, lessonFinished, tutorial]);
  useLayoutEffect(() => {
    const turn = nextTurn.current;
    nextTurn.current = null;
    const root = book.current;
    const sheet = turnSheet.current;
    if (!turn || !root || !sheet || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const panel = getTurnPanel(root);
    if (!panel) return;
    const bounds = panel.getBoundingClientRect();
    const origin = root.getBoundingClientRect();
    Object.assign(sheet.style, {
      left: `${bounds.left - origin.left}px`,
      top: `${bounds.top - origin.top}px`,
      width: `${bounds.width}px`,
      height: `${bounds.height}px`,
    });
    cancelTurn.current = curlPanel(sheet, turn.source, turn.direction);
  }, [position, chapterOpening, lessonFinished]);
  useEffect(() => () => {
    cancelTurn.current?.();
  }, []);

  function cue(effect: LessonSoundCue) {
    if (sound && !narrator.playing) void sounds.play(effect);
  }

  function go(next: number, opening?: ComicChapter, finished?: true) {
    navigationRequest.current.id++;
    setArtStatus(null);
    menu.current?.close();
    setLookedUp("");
    setTutorial(null);
    if (next === position && opening === chapterOpening && finished === lessonFinished) { narrator.stop(); return; }
    setResetNotice(null);
    narrator.stop();
    paperSound.stop();
    cancelTurn.current?.();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const source = capturePanel(getTurnPanel(book.current));
      if (source) nextTurn.current = {
        direction: next > position || (next === position && !opening && !lessonFinished) ? 1 : -1,
        source,
      };
    }
    const clips = opening || finished ? [] : next === 0 ? coverNarration
      : sceneAudio(pages[next - 1], progress.getSnapshot().readingLanguage === "pt-BR");
    if (sound && clips.length) {
      narrator.play(clips);
    }
    if (sound && !document.hidden) {
      paperSound.play(clips.length > 0);
    }
    progress.update(previous => ({ ...previous, position: next, chapterOpening: opening, lessonFinished: finished }));

  }

  function openAudioOptions() {
    navigationRequest.current.id++;
    setArtStatus(null);
    narrator.stop();
    paperSound.stop();
    setChangingAudio(true);
  }

  function chooseAudio(enabled: boolean) {
    if (enabled) {
      void sounds.unlock();
      paperSound.prepare();
      narrator.play(coverNarration);
    } else {
      narrator.stop();
      paperSound.stop();
    }
    progress.update(previous => ({ ...previous, position: Math.max(0, previous.position), sound: enabled }));
    setChangingAudio(false);
    if (changingAudio) audioMode.current?.focus({ preventScroll: true });
  }

  function openResetOptions(trigger: HTMLButtonElement) {
    navigationRequest.current.id++;
    setArtStatus(null);
    setResetNotice(null);
    trigger.focus({ preventScroll: true });
    resetDialog.current?.showModal();
  }

  function resetReading(target: FirstDayResetTarget) {
    narrator.stop();
    paperSound.stop();
    progress.update(previous => resetFirstDayProgress(previous, target));
    setResetNotice(target);
  }

  function changeReadingLanguage() {
    progress.update(previous => ({ ...previous, readingLanguage: nextReadingLanguage }));
    if (!sound) return;
    const clips = tutorial ? [nextReadingLanguage === "pt-BR" ? "tutorial-door-en" : "tutorial-door-pt"] as const
      : sceneAudio(page, nextReadingLanguage === "pt-BR");
    if (clips.length) narrator.play(clips);
  }

  function turnTo(next: number, showOpening = pages[next - 1]?.part !== page?.part) {
    const opening = showOpening ? chapterOpeningAt(next) : undefined;
    menu.current?.close();
    if (sound) paperSound.prepare();
    const request = ++navigationRequest.current.id;
    if (opening) return go(next, opening);
    const destination = pages[next - 1];
    let frame: 0 | 1 | undefined;
    if (destination && destination.part !== 1 && destination.kind !== "Em preparação") {
      if (destination.kind === "Ação") frame = counts[destination.id] === destination.words.length ? 1 : 0;
      if (destination.kind === "Desafio") frame = attempts[destination.id]?.round ?? 0;
    }
    const loading = imageCache.prepare(next, frame);
    if (!loading || (next === position && !chapterOpening)) return go(next, opening);
    setArtStatus("loading");
    void loading.then(ready => {
      if (request !== navigationRequest.current.id) return;
      if (ready.every(Boolean)) go(next, opening);
      else setArtStatus("retry");
    });
  }

  function turnBack() {
    if (chapterOpeningAt(position) && !chapterOpening) turnTo(position, true);
    else turnTo(position - 1);
  }

  const languageLabel = comic ? (englishVoice ? "Ler em inglês" : "Ler em português") : languageAction;
  const languageButton = <button type="button" className="fd1-language" aria-label={languageLabel} title={languageLabel}
    onClick={changeReadingLanguage}>{englishVoice ? "Ler em EN" : "Ler em PT"}</button>;
  const readingControls = <div className="fd1-listen">
    {sound && captionClips.length > 0 && <NarrationButton clips={captionClips} player={narrator}
      language={storyVoice && englishVoice ? "inglês" : "português"} />}
    {(comic || storyVoice) && languageButton}
  </div>;

  function showTutorial(step: PrologueStep) {
    narrator.stop();
    paperSound.stop();
    if (step === "intro" && !progress.getSnapshot().tutorialSeen) {
      progress.update(previous => ({ ...previous, tutorialSeen: true }));
    }
    setPracticeCount(0);
    setLookedUp("");
    setTutorial(step);
    if (sound) narrator.play([prologue[step].audio]);
  }

  function renderMoment() {
    if (!page) return null;
    if (page.part !== 1 && page.kind !== "Em preparação") return <PartTwoMoment key={page.id} page={page} portrait={editionPortrait}
      count={counts[page.id] ?? 0} attempt={attempts[page.id] ?? emptyAttempt} readingLanguage={readingLanguage} cue={cue}
      onPlace={count => progress.update(previous => ({ ...previous, counts: { ...previous.counts, [page.id]: count } }))}
      onAttempt={attempt => progress.update(previous => ({ ...previous, attempts: { ...previous.attempts, [page.id]: attempt } }))} />;
    switch (page.kind) {
      case "Ação":
        return <GuidedMoment key={page.id} page={page} count={counts[page.id] ?? 0} cue={cue} narrator={narrator} audioEnabled={sound} englishVoice={englishVoice} cleanReading={cleanReading}
          onPlace={count => {
            progress.update(previous => ({ ...previous, counts: { ...previous.counts, [page.id]: count } }));
            if (sound && count === page.words.length) {
              narrator.play([spokenDialogue(page.voice, englishVoice)]);
            }
          }} />;
      case "Reação":
        return <ReactionMoment page={page} englishVoice={englishVoice} voice={sound ? narrator : undefined} cleanReading={cleanReading} />;
      case "Tirinha":
        return <ExamplesMoment page={page} voice={sound ? narrator : undefined} />;
      case "Explicação":
        return <RuleMoment page={page} voice={sound ? narrator : undefined} />;
      case "Desafio":
        return <ChallengeMoment key={page.id} englishVoice={englishVoice} page={page} attempt={attempts[page.id] ?? emptyAttempt} cue={cue} voice={sound ? narrator : undefined}
          cleanReading={cleanReading}
          onAttempt={attempt => {
            progress.update(previous => ({ ...previous, attempts: { ...previous.attempts, [page.id]: attempt } }));
            if (sound && attempt.result === "correct" && attempts[page.id]?.result !== "correct") {
              narrator.play([spokenDialogue(page.voice, englishVoice), spokenDialogue(page.reply.voice, englishVoice)], 350);
            }
          }} />;
      case "Em preparação":
        return <section className="fd-placeholder"><p>{page.partTitle}</p><strong>Atividade em preparação.</strong></section>;
    }
  }

  return <MeaningContext.Provider value={setLookedUp}><main ref={book} className="lo-app fd" data-lesson-theme="comic" style={COMIC_LESSON_STYLE}
    data-fd-edition={edition || undefined} data-fd-comic={Boolean(comic) || undefined}
    data-fd-challenge={comic?.kind === "Desafio" && !lessonFinished || undefined}
    data-fd-study={readingPage || comic?.kind === "Tirinha" || comic?.kind === "Explicação" ? "" : undefined} data-fd-mobile-header={mobileHeader || undefined}
    data-ui-sound-scope="local" data-first-day-part={page?.part}
    data-first-day-page={tutorial ? "tutorial" : lessonFinished ? "finished" : chapterOpening ? page?.id.replace(/-1$/, "-opening") : page?.id ?? "cover"}>
    {savedPosition >= 0 && <header className="lo-header fd-header">
      <div className="lo-brand-row">
        <Brand onMenu={openMenu} />
        <span className="lo-header-divider" aria-hidden="true" />
        <span className="lo-header-name" lang="en">First Day</span>
      </div>
      <button type="button" className="lo-icon" aria-label="Abrir percurso da aula" aria-haspopup="dialog" onClick={openMenu}><MoreHorizontal size={24} aria-hidden="true" /></button>
    </header>}
    <dialog className="lo-dialog fd-menu" ref={menu} aria-labelledby="fd-menu-title">
      <div className="fd-menu-heading">
        <h2 id="fd-menu-title">Percurso</h2>
        <button type="button" className="lo-icon" aria-label="Fechar menu" onClick={() => menu.current?.close()}><X size={20} aria-hidden="true" /></button>
      </div>
      <Link href="/" className="lo-secondary" onClick={leaveLesson}>
        <ArrowLeft size={16} aria-hidden="true" /> Voltar ao painel
      </Link>
      <button type="button" onClick={() => turnTo(0)} aria-current={position === 0 ? "page" : undefined}>Capa</button>
      <ol>{pages.map((item, index) => <li key={item.id}>
        <button type="button" onClick={() => turnTo(index + 1)} aria-current={position === index + 1 && !chapterOpening && !lessonFinished ? "page" : undefined}>
          {item.kind === "Em preparação" ? item.moment : item.kind} · {item.title}
        </button>
      </li>)}</ol>
    </dialog>
    {changingAudio && <FirstDayAudioChoice
      required={false} shouldOpen={() => changingAudio}
      onChoose={chooseAudio} onDismiss={() => { setChangingAudio(false); audioMode.current?.focus({ preventScroll: true }); }}
    />}
    {savedPosition === 0 && <FirstDayProgressReset dialogRef={resetDialog} onReset={resetReading}
      onReplayTutorial={() => showTutorial("intro")} />}
    {tutorial && panel ? <LessonDragProvider animatePlacement key={tutorial} onDrop={item => {
      if (item.value !== String(practiceCount) || practiced) return;
      setPracticeCount(practiceCount + 1);
      setLookedUp("");
      if (sound) narrator.play([practicePieces[practiceCount].voice]);
    }}><section className="fd-tutorial" data-step={tutorial} aria-labelledby="fd-tutorial-title">
      <header className="fd-tutorial-heading">
        <div className="fd-tutorial-folio"><span>Prólogo · Mini tutorial</span><span>{String(tutorialIndex + 1).padStart(2, "0")} / {String(prologueOrder.length).padStart(2, "0")}</span></div>
        <div className="fd-tutorial-title-row">
          <h1 id="fd-tutorial-title" ref={title} tabIndex={-1}>{panel.title}</h1>
          {sound && replayClip && <button type="button" className="fd-tutorial-audio" aria-label={replayLabel} onClick={() => narrator.play([replayClip])}><Volume2 size={18}/></button>}
        </div>
      </header>
      <div className="fd-tutorial-panel">
        <p className="fd-tutorial-caption" lang={tutorial === "language" ? readingLanguage : "pt-BR"}>
          {tutorial === "language" && !englishVoice ? <EnglishWords text={panel.caption}/> : tutorial === "language" ? doorCaptionPt : panel.caption}
        </p>
        <div className="fd-tutorial-art">
          <Image src={`/first-day-part-one/prologo/${panel.image}.webp`}
            width={1400} height={788} alt={panel.alt} unoptimized priority />
        </div>
        {tutorial === "intro" && <div className="fd-tutorial-sample">
          <button type="button" lang="en" className="fd-tutorial-lookup" onClick={() => {
            setPracticeCount(1);
            if (sound) narrator.play([prologue.intro.pieces[0].voice]);
          }}>{prologue.intro.pieces[0].word}</button>
          <small aria-live="polite">{practiced && prologue.intro.pieces[0].translation}</small>
        </div>}
        {tutorial === "drag" && <DropTarget id="tutorial-balloon" label="Seu balão" accept={["word"]} disabled={practiced} className="fd-tutorial-sample">
          <span className="fd-tutorial-line" lang="en">{practicePieces.slice(0, practiceCount).map(({ word }) => <span key={word}><EnglishWords text={word}/>{" "}</span>)}
          {!practiced && <span className="fd-tutorial-slot" data-lesson-drop-anchor aria-hidden="true"/>}</span>
          {practiceCount > 0 && <small>{practicePieces[practiceCount - 1].translation}</small>}
        </DropTarget>}
        {tutorial === "arrival" && <div className="fd-tutorial-sample fd-tutorial-reply">
          <small>Rafael</small><strong>Cheguei ao refeitório.</strong>
        </div>}
      </div>
      <div className="fd-tutorial-copy">
        {tutorial === "intro" && <p>Clique na palavra para ver a tradução.</p>}
        {tutorial === "language" && <>
          <div className="fd-tutorial-pointer">{languageButton}</div>
          <p aria-live="polite">{sound
            ? (englishVoice ? "Você lê em português e ouve em inglês." : "Você lê em inglês e ouve em português.")
            : `Você lê em ${englishVoice ? "português" : "inglês"}. O áudio está desligado.`}</p>
        </>}
        {tutorial === "drag" && <>
          <ArrowUp className="fd-tutorial-arrow" aria-hidden="true" size={21}/>
          <div className="fd-tutorial-tray">{practicePieces.map(({ word }, index) =>
            <DragSource key={word} item={{id: word, kind: "word", value: String(index), label: word}}
              disabled={index !== practiceCount} onClick={() => setLookedUp(word)} className="fd1-word fd-tutorial-word"><GripVertical size={14} aria-hidden="true"/>{word}</DragSource>)}</div>
          <p aria-live="polite">{lookedUp ? lookedUp + " · " + practiceMeaning : practiced ? "Você cumprimentou seu colega." : practiceCount ? "Agora arraste a segunda palavra." : "Clique e arraste a palavra até o balão."}</p>
          <FirstDragTutorial prologue/>
        </>}
        {tutorial === "arrival" && <p>Na história, você monta as falas do Rafael.</p>}
      </div>
      <nav className="fd-tutorial-footer" aria-label="Passos do tutorial">
        <LessonButton disabled={!practiced} onClick={() => nextTutorialStep ? showTutorial(nextTutorialStep) : turnTo(1)}>
          {nextTutorialStep ? "Próximo passo" : "Começar a história"} <ArrowRight size={18}/>
        </LessonButton>
      </nav>
    </section></LessonDragProvider> : chapterOpening ? <ChapterOpening
      chapter={chapterOpening} language={readingLanguage} titleRef={title} languageButton={languageButton}
      onBack={turnBack} onOpen={() => turnTo(position, false)}/>
    : lessonFinished ? <LessonEnding language={readingLanguage} titleRef={title}
      onBack={() => turnTo(1, false)} onLeave={leaveLesson}/>
    : !page ? <section className="fd-cover" aria-labelledby="fd-cover-title">
      <picture className="fd-panels">
        {coverSources.map(({ media, src }) => <source key={src} media={media} srcSet={src} />)}
        <Image src={art.cover.src} width={art.cover.width} height={art.cover.height} alt={art.cover.alt}
          className="fd-room" loading="eager" unoptimized />
      </picture>
      <div className="fd-cover-copy">
        <h1 id="fd-cover-title" ref={title} tabIndex={-1} lang="en">{coverCopy.title}</h1>
        <p>{coverCopy.subtitle.map(line => <span key={line}>{line}</span>)}</p>
        <output aria-live="polite">{resetNotice !== null && <span className="fd-reset-status">
          <Check size={16} aria-hidden="true" /> {resetNotice === "all" ? "Progresso reiniciado." : `Parte ${resetNotice} reiniciada.`}
        </span>}</output>
      </div>
      <div className="fd-cover-controls">
        {sound && <div className="fd-cover-audio">
          <button type="button" className="fd-cover-listen" aria-pressed={playingCover}
            onClick={() => playingCover ? narrator.stop() : narrator.play(coverNarration)}>
            {playingCover ? <Pause size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
            {playingCover ? "Parar narração" : "Ouvir a capa"}
          </button>
        </div>}
        <div className="fd-start fd-cover-nav">
          <div className="fd-cover-tools">
            <button type="button" className="lo-secondary" ref={audioMode} aria-label="Trocar modo de áudio" aria-haspopup="dialog" aria-controls="fd-audio-options" onClick={openAudioOptions}>Modo de áudio</button>
            <button type="button" className="lo-secondary" aria-haspopup="dialog" aria-controls="fd-progress-reset"
              onClick={event => openResetOptions(event.currentTarget)}><RotateCcw size={16} aria-hidden="true" /> Reiniciar progresso</button>
            <Link href="/" className="lo-secondary" onClick={leaveLesson} aria-label="Voltar ao menu principal">Menu principal</Link>
          </div>
          <LessonButton onClick={() => progress.getSnapshot().tutorialSeen ? turnTo(1) : showTutorial("intro")}>{coverCopy.start} <ArrowRight size={18} aria-hidden="true" /></LessonButton>
        </div>
      </div>
    </section> : <section key={page.id} className={edition ? "fd1-page" : "fd-page"} aria-labelledby="fd-page-title">
      <div className={edition ? "fd1-progress" : "fd-progress"}>
        <span>Parte {page.part} de 4 · {page.kind === "Em preparação" ? page.moment : page.kind}</span><span>{position} / {pages.length}</span>
        <progress aria-label="Etapa no percurso" value={position} max={pages.length} />
        {edition && !editionPortrait && readingControls}
      </div>
      {edition ? <div className="fd1-heading">
        <div className="fd1-headline">
          <h1 id="fd-page-title" ref={title} tabIndex={-1} lang={comic ? readingLanguage : "pt-BR"}>{comic && readingLanguage === "en" ? comic.englishTitle : page.title}</h1>
          {editionPortrait && readingControls}
          {chair && !editionPortrait && <Image src={chair.src} width={chair.width} height={chair.height} className="fd1-chair" alt={chair.alt} unoptimized />}
        </div>
        <div className="fd1-caption">
          <p lang={comic || storyVoice ? readingLanguage : "pt-BR"}>{(comic || storyVoice) && readingLanguage === "en" ? <EnglishWords text={caption}/> : caption}</p>
        </div>
      </div> : <div className="fd-page-heading"><div className="fd-page-title">
        <h1 id="fd-page-title" ref={title} tabIndex={-1}>{page.title}</h1>
      </div></div>}
      <div key={page.id} className="fd-workspace">{renderMoment()}</div>
      <nav className={edition ? "fd1-nav" : "fd-nav"} aria-label="Navegação da página">
        <button type="button" className="lo-secondary" onClick={turnBack}><ArrowLeft size={19} aria-hidden="true" /> Anterior</button>
        <LessonButton disabled={comicPending} onClick={() => finalChallenge ? go(position, undefined, true) : turnTo(position < pages.length ? position + 1 : 0)}>
          {finalChallenge ? "Concluir aula" : nextPart ? `Ir para a Parte ${nextPart}`
            : page.kind === "Desafio" && !cleanReading ? "Continuar a história" : position < pages.length ? "Próxima" : "Voltar à capa"} <ArrowRight size={19} aria-hidden="true" />
        </LessonButton>
      </nav>
    </section>}
    {artStatus && <output className="fd-art-status" aria-live="polite">
      {artStatus === "loading" ? "Carregando o quadro…" : "A imagem ainda não carregou. Tente virar de novo."}
    </output>}
    {lookedUp && (!tutorial || tutorial === "language") && <aside className="fd-word-definition" aria-label="Tradução"><span role="status"><b lang="en">{lookedUp}</b> · {meaningOf(lookedUp)}</span><button type="button" aria-label="Fechar tradução" onClick={() => setLookedUp("")}><X size={16}/></button></aside>}
    <canvas ref={turnSheet} className="fd-turn-sheet" aria-hidden="true" />
  </main></MeaningContext.Provider>;
}

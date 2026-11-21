"use client";

import Image from "next/image";
import { Fragment, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, MoreHorizontal, Pause, Volume2, VolumeX, X } from "lucide-react";
import { Brand } from "@/components/ui/Brand";
import { LessonButton } from "../first-encounters/LessonButton";
import { COMIC_LESSON_STYLE } from "../first-encounters/lesson-comic-theme";
import { DragSource, DropTarget, LessonDragProvider } from "../first-encounters/LessonDrag";
import { createLessonSoundsEngine } from "../first-encounters/lesson-sounds";
import type { LessonSoundCue } from "../first-encounters/lesson-sounds";
import { useLessonSounds } from "../first-encounters/useLessonSounds";
import { art, cleanReadingMedia, coverSources, pages, storyImage, usesCleanReading } from "./content";
import type { ChallengePage, CharacterReply, ExamplesPage, FirstDayArt, GuidedPage, ReactionPage, RulePage, WordSequence } from "./content";
import { createFirstDayArtCache } from "./first-day-art";
import { createFirstDayProgressStore, type ChallengeAttempt } from "./first-day-progress";
import { capturePanel, curlPanel, getTurnPanel } from "./page-curl";
import { arrivalNarration, coverCopy, coverNarration, dialogue, FIRST_DAY_AUDIO_RATE, seatedNarration, narration } from "./narration";
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

const previewSounds = createLessonSoundsEngine({ getStorage: () => undefined, playbackRate: FIRST_DAY_AUDIO_RATE });
const bubbleTarget = "first-day-bubble";
type VoicePlayer = ReturnType<typeof useFirstDayNarration>;

function readCleanReadingMedia() {
  return window.matchMedia(cleanReadingMedia).matches;
}

function subscribeToCleanReadingMedia(listener: () => void) {
  const media = window.matchMedia(cleanReadingMedia);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

function NarrationButton({ clips, player, language, showLabel = false }: {
  clips: readonly NarrationClip[];
  player: VoicePlayer;
  language: "en" | "pt";
  showLabel?: boolean;
}) {
  const playing = clips.some(clip => clip === player.playing);
  const label = playing ? "Parar narração" : `Ouvir narração em ${language === "pt" ? "português" : "inglês"}`;
  return <button type="button" className="fd-narration-control" aria-label={label}
    title={playing ? label : clips.map(clip => narration[clip].text).join(" ")}
    onClick={() => playing ? player.stop() : player.play(clips)}>
    {playing ? <Pause size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
    {showLabel && <span>Narração</span>}
  </button>;
}

function SpeakButton({ clip, translationClip, player, className, children, descriptionId, balloon = false }: {
  clip: DialogueClip;
  translationClip?: NarrationClip;
  player: VoicePlayer;
  className: string;
  children: ReactNode;
  descriptionId?: string;
  balloon?: boolean;
}) {
  const playing = player.playing === clip || player.playing === translationClip;
  const label = playing ? "Parar fala" : translationClip ? "Ouvir fala e tradução" : "Ouvir fala";
  return <button type="button" className={`${className} fd-speak`} aria-pressed={playing}
    aria-label={`${label}: ${dialogue[clip].text}`} aria-describedby={descriptionId}
    title={label} onClick={() => playing ? player.stop() : player.play(translationClip ? [clip, translationClip] : [clip])}>
    {children}
    {balloon && <span className="fd-speak-icon">
      {playing ? <Pause size={12} aria-hidden="true" /> : <Volume2 size={12} aria-hidden="true" />}
    </span>}
  </button>;
}

function ComicPanels({ image, detail }: {
  image: FirstDayArt;
  detail?: FirstDayArt;
}) {
  return <div className="fd-panels">
    <Image src={image.src} width={image.width} height={image.height} alt={image.alt}
      className="fd-room" loading="eager" unoptimized />
    {detail && <Image src={detail.src} width={detail.width} height={detail.height} alt={detail.alt}
      className="fd-detail" loading="eager" unoptimized />}
  </div>;
}

function NarratedCaption({ text, clips, player }: {
  text: string;
  clips: readonly NarrationClip[];
  player?: VoicePlayer;
}) {
  return <div className="fd-reading-note fd-caption fd-caption-narrated">
    <span>{text}</span>
    {player && <NarrationButton clips={clips} player={player} language="en" />}
  </div>;
}

function StoryPanel({ image, detail, scene, complete, portrait, caption, children }: {
  image: FirstDayArt;
  detail?: FirstDayArt;
  scene: GuidedPage["scene"] | "reaction" | "challenge";
  complete?: boolean;
  portrait?: boolean;
  caption: ReactNode;
  children: ReactNode;
}) {
  return <div className="fd-comic">
    {caption}
    <div className="fd-scene" data-scene={scene} data-complete={complete} data-portrait-art={portrait || undefined}>
      <ComicPanels image={image} detail={detail} />
      <div className="fd-dialogue">{children}</div>
    </div>
  </div>;
}

function ReplyBalloon({ reply, player }: { reply: CharacterReply; player?: VoicePlayer }) {
  const line = <><b lang="en">{dialogue[reply.voice].text}</b> <span className="fd-reply-translation">{reply.translation}</span></>;
  return <div className="fd-reply" role="group" aria-label={`Resposta de ${reply.speaker}`}>
    {player ? <SpeakButton clip={reply.voice} player={player} className="fd-reply-body" balloon>{line}</SpeakButton>
      : <p className="fd-reply-body" role="status">{line}</p>}
  </div>;
}

function ReactionMoment({ page, voice, cleanReading }: { page: ReactionPage; voice?: VoicePlayer; cleanReading: boolean }) {
  return <section className="fd-story fd-reaction" aria-label={page.title}>
    <StoryPanel image={storyImage(page, cleanReading)} scene="reaction" portrait={cleanReading && Boolean(page.portraitImage)}
      caption={<NarratedCaption text={page.caption} clips={[page.narration]} player={cleanReading ? undefined : voice} />}>
      <ReplyBalloon reply={page.reply} player={voice} />
    </StoryPanel>
    {page.tip && <aside className="fd-story-tip">
      <h2>{page.tip.title}</h2>
      <ul lang="en">{page.tip.phrases.map(phrase => <li key={phrase}>{phrase}</li>)}</ul>
    </aside>}
  </section>;
}

function WordStrip({ words, order, placed, nextWord }: WordSequence & {
  placed: readonly number[];
  nextWord?: number;
}) {
  return <div className="fd-words" aria-label="Faixa de palavras" lang="en">
    {order.map(index => <DragSource key={index}
      item={{ id: `word-${index}`, kind: "word", value: String(index), label: words[index] }}
      disabled={placed.includes(index)} className={index === nextWord ? "fd-word fd-word-next" : "fd-word"}>
      {words[index]}
    </DragSource>)}
  </div>;
}

function LearnerBalloon({ words, placed, translation = "", full, speech }: {
  words: readonly string[];
  placed: readonly number[];
  translation?: string;
  full: boolean;
  speech?: { clip: DialogueClip; translationClip?: NarrationClip; player: VoicePlayer };
}) {
  const phrase = placed.map(index => words[index]).join(" ");
  const label = full ? `Sua fala: ${phrase}` : phrase
    ? `Seu balão. Colocar palavra. Montagem até agora: ${phrase}`
    : "Seu balão. Colocar palavra";
  const line = <>
      <span lang="en">
        {words.map((word, slot) => <span key={word} data-filled={slot < placed.length}
          aria-hidden={slot >= placed.length || undefined}>
          {slot < placed.length ? words[placed[slot]] : "···"}
        </span>)}
      </span>
      <span className="fd-translation" aria-live="polite">{translation}</span>
  </>;
  return <div className="fd-learner">
    {speech ? <SpeakButton {...speech} className="fd-bubble" balloon>{line}</SpeakButton>
      : <DropTarget id={bubbleTarget} accept={["word"]} label={label} className="fd-bubble" disabled={full}>{line}</DropTarget>}
  </div>;
}

function GuidedMoment({ page, count, onPlace, cue, narrator, audioEnabled, cleanReading }: {
  page: GuidedPage;
  count: number;
  onPlace: (count: number) => void;
  cue: (sound: LessonSoundCue) => void;
  narrator: VoicePlayer;
  audioEnabled: boolean;
  cleanReading: boolean;
}) {
  const [mistake, setMistake] = useState(false);
  const placed = page.words.slice(0, count).map((_, index) => index);
  const done = count === page.words.length;
  const clips = page.scene === "intro" ? seatedNarration : arrivalNarration;
  const voice = audioEnabled ? narrator : undefined;

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

  return <LessonDragProvider onDrop={item => place(item.value)}>
    <section className="fd-story fd-action" aria-label="Montagem guiada">
      <StoryPanel image={storyImage(page, cleanReading)} detail={cleanReading ? undefined : page.detail}
        scene={page.scene} complete={done} portrait={cleanReading && Boolean(page.portraitImage)}
        caption={<NarratedCaption text={page.caption} clips={clips} player={cleanReading ? undefined : voice} />}>
        <LearnerBalloon words={page.words} placed={placed} translation={page.translations[count]} full={done}
          speech={done && audioEnabled ? { clip: page.voice, player: narrator } : undefined} />
      </StoryPanel>
      <div className="fd-activity" data-complete={done} data-first-placement={count === 0} data-mistake={mistake}>
        <WordStrip words={page.words} order={page.order} placed={placed} nextWord={done ? undefined : count} />
        <p className="fd-instruction" aria-live="polite">
          {done ? "Continue quando quiser." : mistake ? "Tente a peça destacada." : "Arraste a peça destacada ou toque nela e depois no balão."}
        </p>
      </div>
    </section>
  </LessonDragProvider>;
}

function ExamplesMoment({ page, voice }: { page: ExamplesPage; voice?: VoicePlayer }) {
  return <section className="fd-examples" aria-label="Pedidos em três situações">
    {page.panels.map(panel => <figure className="fd-example" key={panel.line}>
      <Image src={panel.image.src} width={panel.image.width} height={panel.image.height} alt={panel.image.alt}
        className="fd-example-art" loading="eager" unoptimized />
      <figcaption className="fd-example-copy">
        <span className="fd-example-label">{panel.context}</span>
        {voice && <SpeakButton className="fd-narration-control fd-example-audio" clip={panel.voice} player={voice}>
          {voice.playing === panel.voice ? <Pause size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
        </SpeakButton>}
        <b className="fd-example-line" lang="en">{panel.line}</b>
        <span className="fd-example-translation">{panel.translation}</span>
      </figcaption>
    </figure>)}
  </section>;
}

function RuleMoment({ page, voice }: { page: RulePage; voice?: VoicePlayer }) {
  return <section className="fd-rule">
    <ul className="fd-rule-parts" aria-label="Partes da frase">
      {page.pieces.map((piece, index) => <Fragment key={piece.line}>
        {index > 0 && <li className="fd-rule-plus" aria-hidden="true">+</li>}
        <li className="fd-rule-token" data-tone={piece.tone}>
          <b lang={piece.tone === "verb" ? undefined : "en"}>{piece.line}</b><span>{piece.meaning}</span>
        </li>
      </Fragment>)}
    </ul>
    <ol className="fd-rule-examples" aria-label="Estrutura em dois pedidos">
      {page.examples.map(example => {
        const VoiceIcon = voice?.playing === example.voice ? Pause : Volume2;
        const translationId = `fd-rule-translation-${example.voice}`;
        const copy = <>
          <span lang="en" className="fd-rule-example-line">
            {example.tokens.map((token, index) => <Fragment key={token.line}>
              {index > 0 && " "}
              <strong className="fd-rule-token" data-tone={token.tone}>{token.line}</strong>
            </Fragment>)}
          </span>
          <span className="fd-rule-example-translation" id={translationId}>{example.translation}</span>
        </>;
        return <li className="fd-rule-example" key={example.translation}>
          <Image src={example.image.src} width={example.image.width} height={example.image.height} alt=""
            className="fd-rule-example-art" loading="eager" unoptimized />
          {voice ? <SpeakButton className="fd-rule-example-copy fd-spoken-rule" clip={example.voice} player={voice} descriptionId={translationId}>
            {copy}
            <VoiceIcon className="fd-rule-example-icon" size={16} aria-hidden="true" />
          </SpeakButton> : <div className="fd-rule-example-copy">{copy}</div>}
        </li>;
      })}
    </ol>
  </section>;
}

const emptyAttempt: ChallengeAttempt = { placed: [] };

function ChallengeMoment({ page, attempt, onAttempt, cue, voice, cleanReading }: {
  page: ChallengePage;
  attempt: ChallengeAttempt;
  onAttempt: (attempt: ChallengeAttempt) => void;
  cue: (sound: LessonSoundCue) => void;
  voice?: VoicePlayer;
  cleanReading: boolean;
}) {
  const [reset, setReset] = useState(0);
  const { placed, result, translated = false } = attempt;
  const full = placed.length === page.words.length;
  const solved = result === "correct";
  const instructionLanguage = translated ? "pt" : "en";
  const instructionClip = page.instruction[instructionLanguage];
  const translationLabel = translated ? "Voltar à instrução em inglês" : "Ver tradução da instrução em português";

  function toggleTranslation() {
    onAttempt({ ...attempt, translated: !translated });
    voice?.play([page.instruction[translated ? "en" : "pt"]]);
  }

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

  return <LessonDragProvider key={reset} onDrop={item => place(item.value)}>
    <section className="fd-story fd-challenge" aria-label="Pedido sem pistas" data-solved={solved || undefined}>
      <StoryPanel image={storyImage(page, cleanReading)} scene="challenge" complete={solved}
        portrait={cleanReading && Boolean(page.portraitImage)} caption={
        <div className="fd-reading-note fd-caption fd-caption-narrated fd-challenge-caption">
          <span lang={instructionLanguage === "pt" ? "pt-BR" : "en"}>{narration[instructionClip].text}</span>
          <div className="fd-challenge-caption-actions">
            {voice && <NarrationButton clips={[instructionClip]} player={voice} language={instructionLanguage} />}
            <button type="button" className="fd-narration-control fd-caption-language" aria-label={translationLabel}
              title={translationLabel} onClick={toggleTranslation}>
              {translated ? "EN" : "PT"}
            </button>
          </div>
        </div>
      }>
        <LearnerBalloon words={page.words} placed={placed} full={full}
          translation={solved ? narration[page.translationVoice].text : undefined}
          speech={solved && voice ? { clip: page.voice, translationClip: page.translationVoice, player: voice } : undefined} />
      </StoryPanel>
      <div className="fd-activity">
        {!solved && <>
          <WordStrip words={page.words} order={page.order} placed={placed} />
          <div className="fd-challenge-controls">
            <button type="button" className="lo-secondary" onClick={clear} disabled={!placed.length}>Limpar</button>
            <LessonButton onClick={check} disabled={!full || Boolean(result)}>Conferir <Check size={18} aria-hidden="true" /></LessonButton>
          </div>
        </>}
        <p className="fd-feedback" role="status" data-result={result}>
          {solved ? <><Check aria-hidden="true" /><strong>Você acertou!</strong></>
            : result === "incorrect" ? "Comece pelo pedido, depois a ação. Limpe e tente de novo."
              : "Monte a frase e toque em Conferir."}
        </p>
      </div>
    </section>
  </LessonDragProvider>;
}

export function FirstDay() {
  const [progress] = useState(createFirstDayProgressStore);
  const [imageCache] = useState(createFirstDayArtCache);
  const [artStatus, setArtStatus] = useState<"loading" | "retry" | null>(null);
  const navigationRequest = useRef({ id: 0 });
  const { position, counts, attempts, sound } = useSyncExternalStore(
    progress.subscribe, progress.getSnapshot, progress.getServerSnapshot,
  );
  const portraitReading = useSyncExternalStore(subscribeToCleanReadingMedia, readCleanReadingMedia, () => false);
  const menu = useRef<HTMLDialogElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const book = useRef<HTMLElement>(null);
  const turnSheet = useRef<HTMLCanvasElement>(null);
  const cancelTurn = useRef<(() => void) | null>(null);
  const nextTurn = useRef<{ direction: number; source: HTMLCanvasElement } | null>(null);
  const paperSound = useFirstDayPaperSound();
  useFirstDayPullToRefresh(book);
  const sounds = useLessonSounds(previewSounds);
  const speech = useFirstDayNarration();
  const narrator = { ...speech, play(clips: readonly FirstDayVoiceClip[]) {
    paperSound.stop();
    speech.play(clips);
  } };
  const page = pages[position - 1];
  const mobileHeader = portraitReading && position >= 0;
  const cleanReading = mobileHeader && usesCleanReading(page);
  const nextBlocked = cleanReading && page.kind === "Ação" && (counts[page.id] ?? 0) < page.words.length;
  const cleanReadingClips = cleanReading && page.kind !== "Desafio"
    ? page.kind === "Reação" ? [page.narration] : page.scene === "intro" ? seatedNarration : arrivalNarration
    : null;
  const readingPage = page?.kind === "Tirinha" || page?.kind === "Explicação" ? page : undefined;
  const cleanStudy = mobileHeader && readingPage?.part === 1;
  const choosingAudio = position < 0;
  const playingCover = narrator.playing === "cover";
  const openMenu = () => menu.current?.showModal();

  useEffect(() => {
    const requests = navigationRequest.current;
    imageCache.warm();
    return () => { requests.id++; };
  }, [imageCache]);
  useEffect(() => { title.current?.focus({ preventScroll: true }); }, [position]);
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
  }, [position]);
  useEffect(() => () => {
    cancelTurn.current?.();
  }, []);

  function cue(effect: LessonSoundCue) {
    if (sound && !narrator.playing) void sounds.play(effect);
  }

  function go(next: number, audioEnabled = sound) {
    menu.current?.close();
    if (next === position) return;
    narrator.stop();
    paperSound.stop();
    cancelTurn.current?.();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const source = capturePanel(getTurnPanel(book.current));
      if (source) nextTurn.current = { direction: next > position ? 1 : -1, source };
    }
    const nextPage = pages[next - 1];
    let clips: readonly FirstDayVoiceClip[] = [];
    if (next === 0) {
      clips = coverNarration;
    } else if (nextPage?.kind === "Ação") {
      clips = nextPage.scene === "intro" ? seatedNarration : arrivalNarration;
    } else if (nextPage?.kind === "Reação") {
      clips = [nextPage.narration, nextPage.reply.voice];
    } else if (nextPage?.kind === "Tirinha" || nextPage?.kind === "Explicação") {
      clips = [nextPage.narration];
    } else if (nextPage?.kind === "Desafio") {
      clips = [nextPage.instruction[attempts[nextPage.id]?.translated ? "pt" : "en"]];
    }
    if (audioEnabled && clips.length) {
      narrator.play(clips);
    }
    if (audioEnabled && position >= 0 && next >= 0 && !document.hidden) {
      paperSound.play(clips.length > 0);
    }
    progress.update(previous => ({
      ...previous,
      position: next,
      sound: next < 0 ? previous.sound : audioEnabled,
    }));
    window.scrollTo(0, 0);
  }

  function start(enabled: boolean) {
    if (enabled) {
      void sounds.unlock();
      paperSound.prepare();
    }
    go(0, enabled);
  }

  function turnTo(next: number) {
    menu.current?.close();
    if (sound && next >= 0) paperSound.prepare();
    const request = ++navigationRequest.current.id;
    const loading = imageCache.prepare(next);
    if (!loading || next === position) {
      setArtStatus(null);
      go(next);
      return;
    }
    setArtStatus("loading");
    void loading.then(ready => {
      if (request !== navigationRequest.current.id) return;
      if (ready.every(Boolean)) {
        setArtStatus(null);
        go(next);
      } else {
        setArtStatus("retry");
      }
    });
  }

  function renderMoment() {
    if (!page) return null;
    switch (page.kind) {
      case "Ação":
        return <GuidedMoment key={page.id} page={page} count={counts[page.id] ?? 0} cue={cue} narrator={narrator} audioEnabled={sound} cleanReading={cleanReading}
          onPlace={count => {
            progress.update(previous => ({ ...previous, counts: { ...previous.counts, [page.id]: count } }));
            if (sound && count === page.words.length) {
              narrator.play([page.voice]);
            }
          }} />;
      case "Reação":
        return <ReactionMoment page={page} voice={sound ? narrator : undefined} cleanReading={cleanReading} />;
      case "Tirinha":
        return <ExamplesMoment page={page} voice={sound ? narrator : undefined} />;
      case "Explicação":
        return <RuleMoment page={page} voice={sound ? narrator : undefined} />;
      case "Desafio":
        return <ChallengeMoment key={page.id} page={page} attempt={attempts[page.id] ?? emptyAttempt} cue={cue} voice={sound ? narrator : undefined}
          cleanReading={cleanReading}
          onAttempt={attempt => {
            progress.update(previous => ({ ...previous, attempts: { ...previous.attempts, [page.id]: attempt } }));
            if (sound && attempt.result === "correct" && attempts[page.id]?.result !== "correct") {
              narrator.play([page.voice, page.translationVoice]);
            }
          }} />;
      case "Em preparação":
        return <section className="fd-placeholder"><p>{page.partTitle}</p><strong>Atividade em preparação.</strong></section>;
    }
  }

  return <main ref={book} className="lo-app fd" data-lesson-theme="comic" style={COMIC_LESSON_STYLE}
    data-fd-clean-reading={cleanReading || undefined} data-fd-clean-study={cleanStudy || undefined} data-fd-mobile-header={mobileHeader || undefined}
    data-ui-sound-scope="local" data-first-day-part={page?.part} data-first-day-page={choosingAudio ? "audio" : page?.id ?? "cover"}>
    <header className="lo-header fd-header">
      <div className="lo-brand-row">
        <Brand onMenu={choosingAudio ? undefined : openMenu} />
        <span className="lo-header-divider" aria-hidden="true" />
        <span className="lo-header-name" lang="en">First Day</span>
      </div>
      {!choosingAudio && <button type="button" className="lo-icon" aria-label="Abrir percurso da aula" aria-haspopup="dialog" onClick={openMenu}><MoreHorizontal size={24} aria-hidden="true" /></button>}
    </header>
    <dialog className="lo-dialog fd-menu" ref={menu} aria-labelledby="fd-menu-title">
      <div className="fd-menu-heading">
        <h2 id="fd-menu-title">Percurso</h2>
        <button type="button" className="lo-icon" aria-label="Fechar menu" onClick={() => menu.current?.close()}><X size={20} aria-hidden="true" /></button>
      </div>
      <button type="button" onClick={() => turnTo(0)} aria-current={position === 0 ? "page" : undefined}>Capa</button>
      <ol>{pages.map((item, index) => <li key={item.id}>
        <button type="button" onClick={() => turnTo(index + 1)} aria-current={position === index + 1 ? "page" : undefined}>
          {item.kind === "Em preparação" ? item.moment : item.kind} · {item.title}
        </button>
      </li>)}</ol>
    </dialog>
    {choosingAudio ? <section className="fd-audio-selection" aria-labelledby="fd-audio-title">
      <div className="fd-audio-selection-copy">
        <span lang="en" className="fd-audio-kicker">First Day</span>
        <h1 id="fd-audio-title" ref={title} tabIndex={-1}>Como quer começar?</h1>
        <p>Com áudio, você escuta a narração e as falas. Se preferir, pode ler tudo na tela.</p>
        <div className="fd-start">
          <LessonButton onClick={() => start(true)}><Volume2 size={20} aria-hidden="true" /> Iniciar com áudio</LessonButton>
          <button type="button" className="lo-secondary" onClick={() => start(false)}><VolumeX size={20} aria-hidden="true" /> Iniciar sem áudio</button>
        </div>
      </div>
    </section> : !page ? <section className="fd-cover" aria-labelledby="fd-cover-title">
      <picture className="fd-panels">
        {coverSources.map(({ media, src }) => <source key={src} media={media} srcSet={src} />)}
        <Image src={art.cover.src} width={art.cover.width} height={art.cover.height} alt={art.cover.alt}
          className="fd-room" loading="eager" unoptimized />
      </picture>
      <div className="fd-cover-copy">
        <h1 id="fd-cover-title" ref={title} tabIndex={-1} lang="en">{coverCopy.title}</h1>
        <p>{coverCopy.subtitle.map(line => <span key={line}>{line}</span>)}</p>
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
          <button type="button" className="lo-secondary" aria-label="Trocar modo de áudio" onClick={() => turnTo(-1)}>Modo de áudio</button>
          <LessonButton onClick={() => turnTo(1)}>{coverCopy.start} <ArrowRight size={18} aria-hidden="true" /></LessonButton>
        </div>
      </div>
    </section> : <section className="fd-page" aria-labelledby="fd-page-title">
      <div className="fd-progress">
        <span>Parte {page.part} de 4 · {page.kind === "Em preparação" ? page.moment : page.kind}</span><span>{position}{mobileHeader ? "/" : " / "}{pages.length}</span>
        <progress aria-label="Etapa no percurso" value={position} max={pages.length} />
      </div>
      <div className="fd-page-heading">
        <div className="fd-page-title">
          <h1 id="fd-page-title" ref={title} tabIndex={-1}>{page.title}</h1>
          {cleanReadingClips && sound && <NarrationButton clips={cleanReadingClips} player={narrator} language="en" showLabel />}
          {readingPage && sound && <NarrationButton clips={[readingPage.narration]} player={narrator} language="pt" showLabel={cleanStudy} />}
        </div>
        {readingPage && <p className="fd-reading-note fd-page-description">
          {readingPage.kind === "Tirinha" ? readingPage.description : `${readingPage.lead} ${readingPage.detail}`}
        </p>}
      </div>
      <div key={page.id} className="fd-workspace">{renderMoment()}</div>
      <nav className="fd-nav" aria-label="Navegação da página">
        <button type="button" className="lo-secondary" onClick={() => turnTo(position - 1)}><ArrowLeft size={19} aria-hidden="true" /> Anterior</button>
        <LessonButton disabled={nextBlocked} onClick={() => turnTo(position < pages.length ? position + 1 : 0)}>
          {page.kind === "Desafio" && !cleanReading ? "Continuar a história" : position < pages.length ? "Próxima" : "Voltar à capa"} <ArrowRight size={19} aria-hidden="true" />
        </LessonButton>
      </nav>
    </section>}
    {artStatus && <output className="fd-art-status" aria-live="polite">
      {artStatus === "loading" ? "Carregando o quadro…" : "A imagem ainda não carregou. Tente virar de novo."}
    </output>}
    <canvas ref={turnSheet} className="fd-turn-sheet" aria-hidden="true" />
  </main>;
}

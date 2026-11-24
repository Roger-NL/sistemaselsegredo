"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, MoreHorizontal, Pause, Volume2, X } from "lucide-react";
import { Brand } from "@/components/ui/Brand";
import { LessonButton } from "../first-encounters/LessonButton";
import { COMIC_LESSON_STYLE } from "../first-encounters/lesson-comic-theme";
import { DragSource, DropTarget, LessonDragProvider } from "../first-encounters/LessonDrag";
import { createLessonSoundsEngine } from "../first-encounters/lesson-sounds";
import type { LessonSoundCue } from "../first-encounters/lesson-sounds";
import { useLessonSounds } from "../first-encounters/useLessonSounds";
import { art, cleanReadingMedia, partOnePortraitMedia, coverSources, pages, usesCleanReading } from "./content";
import type { ChallengePage, CharacterReply, ExamplesPage, FirstDayArt, GuidedPage, ReactionPage, RulePage, WordSequence } from "./content";
import { FirstDayAudioChoice } from "./FirstDayAudioChoice";
import { FirstDragTutorial, StoryPanel } from "./StoryPanel";
import { createFirstDayArtCache } from "./first-day-art";
import { createFirstDayProgressStore, type ChallengeAttempt } from "./first-day-progress";
import { capturePanel, curlPanel, getTurnPanel, type PanelCapture } from "./page-curl";
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
import "./first-day-part-one.css";
import "./first-day-part-one-study.css";
import "./first-day-part-one-story.css";

const previewSounds = createLessonSoundsEngine({ getStorage: () => undefined, playbackRate: FIRST_DAY_AUDIO_RATE });
const bubbleTarget = "first-day-bubble";
type VoicePlayer = ReturnType<typeof useFirstDayNarration>;

function pageNarration(page: (typeof pages)[number] | undefined, translated = false): readonly NarrationClip[] {
  switch (page?.kind) {
    case "Ação": return page.scene === "intro" ? seatedNarration : arrivalNarration;
    case "Reação":
    case "Tirinha":
    case "Explicação": return [page.narration];
    case "Desafio": return [page.instruction[translated ? "pt" : "en"]];
    default: return [];
  }
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

function ReplyBalloon({ reply, player }: { reply: CharacterReply; player?: VoicePlayer }) {
  const line = <><b className="fd1-spoken-line" lang="en">{dialogue[reply.voice].text}</b>
    <span className="fd1-translation">{reply.translation}</span></>;
  return player ? <SpeakButton clip={reply.voice} player={player} className="fd1-bubble-body" balloon>{line}</SpeakButton>
    : <div className="fd1-bubble-body" role="group" aria-label={`Resposta de ${reply.speaker}`}>{line}</div>;
}

function ReactionMoment({ page, voice, cleanReading }: { page: ReactionPage; voice?: VoicePlayer; cleanReading: boolean }) {
  return <section className="fd1-story" data-kind="reaction" aria-label={page.title}>
    <StoryPanel page={page} portrait={cleanReading}><ReplyBalloon reply={page.reply} player={voice} /></StoryPanel>
    {page.tip && <aside className="fd1-story-strip fd1-tip">
      <h2>{page.tip.title}</h2>
      <ul lang="en">{page.tip.phrases.map(phrase => <li key={phrase}>{phrase}</li>)}</ul>
    </aside>}
  </section>;
}

function WordStrip({ words, order, placed, nextWord }: WordSequence & {
  placed: readonly number[];
  nextWord?: number;
}) {
  return <div className="fd1-words" role="group" aria-label="Faixa de palavras" lang="en">
    {order.map(index => <DragSource key={index}
      item={{ id: `word-${index}`, kind: "word", value: String(index), label: words[index] }}
      disabled={placed.includes(index)} className={index === nextWord ? "fd1-word fd1-word-next" : "fd1-word"}>
      {words[index]}
    </DragSource>)}
  </div>;
}

function LearnerBalloon({ words, placed, translation, complete, locked = complete, speech }: {
  words: readonly string[];
  placed: readonly number[];
  translation?: string;
  complete: boolean;
  locked?: boolean;
  speech?: { clip: DialogueClip; translationClip?: NarrationClip; player: VoicePlayer };
}) {
  const phrase = placed.map(index => words[index]).join(" ");
  if (complete) {
    const line = <><b className="fd1-spoken-line" lang="en">{phrase}</b>
      <span className="fd1-translation">{translation}</span></>;
    return speech ? <SpeakButton {...speech} className="fd1-bubble-body" balloon>{line}</SpeakButton>
      : <div className="fd1-bubble-body" role="status">{line}</div>;
  }
  return <DropTarget id={bubbleTarget} accept={["word"]} disabled={locked} className="fd1-bubble-body"
    label={phrase ? `Seu balão. Colocar palavra. Montagem até agora: ${phrase}` : "Seu balão. Colocar palavra"}>
    <span className="fd1-slots" lang="en">{words.map((word, slot) =>
      slot < placed.length ? <b key={word}>{words[placed[slot]]}</b> : <i key={word} aria-hidden="true" />)}</span>
    {translation && <span className="fd1-translation" aria-live="polite">{translation}</span>}
  </DropTarget>;
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

  return <LessonDragProvider onDrop={item => place(item.value)}>
    <section className="fd1-story" data-kind="guided" data-complete={done} aria-label="Montagem guiada">
      <StoryPanel page={page} portrait={cleanReading} expanded={count > 0}>
        <LearnerBalloon words={page.words} placed={placed} translation={page.translations[count]} complete={done}
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
  const SoundIcon = voice?.playing === clip ? Pause : Volume2;
  const copy = <>
    <span className="fd1-study-line" lang="en">{children}</span>
    <span className="fd1-study-translation" id={translationId}>{translation}</span>
  </>;
  return voice ? <SpeakButton className="fd1-study-caption" player={voice} clip={clip} descriptionId={translationId}>
    {copy}<span className="fd1-study-audio"><SoundIcon size={17} aria-hidden="true" /></span>
  </SpeakButton> : <div className="fd1-study-caption">{copy}</div>;
}

function ExamplesMoment({ page, voice }: { page: ExamplesPage; voice?: VoicePlayer }) {
  return <section className="fd-examples fd1-strip" aria-label="Pedidos em três situações">
    {page.panels.map(panel => <figure className="fd1-study-panel" key={panel.voice}>
      <StudyArt image={panel.image} portraitImage={panel.portraitImage} />
      <figcaption>
        <span className="fd1-study-label">{panel.context}</span>
        <StudyCaption clip={panel.voice} voice={voice} translation={panel.translation}>
          {panel.line}
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
          <b lang={piece.tone === "verb" ? undefined : "en"}>{piece.line}</b>
          <span>{piece.meaning}</span>
        </li>
      </Fragment>)}
    </ul>
    <ol className="fd1-rule-examples" aria-label="Estrutura em dois pedidos">
      {page.examples.map(example => <li key={example.voice} className="fd1-study-panel">
        <StudyArt image={example.image} portraitImage={example.portraitImage} />
        <StudyCaption clip={example.voice} voice={voice} translation={example.translation}>
          {example.tokens.map((token, index) => <Fragment key={token.line}>
            {index > 0 && " "}<strong data-tone={token.tone}>{token.line}</strong>
          </Fragment>)}
        </StudyCaption>
      </li>)}
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
    <section className="fd1-story" data-kind="challenge" data-complete={solved} aria-label="Pedido sem pistas">
      <StoryPanel page={page} portrait={cleanReading} expanded={placed.length > 0}>
        <LearnerBalloon words={page.words} placed={placed} complete={solved} locked={full}
          translation={solved ? narration[page.translationVoice].text : undefined}
          speech={solved && voice ? { clip: page.voice, translationClip: page.translationVoice, player: voice } : undefined} />
      </StoryPanel>
      {solved ? <div className="fd1-story-strip fd1-finished fd1-success" role="status"><Check aria-hidden="true"/> Você acertou!</div>
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
  const { position: savedPosition, counts, attempts, sound } = useSyncExternalStore(
    progress.subscribe, progress.getSnapshot, progress.getServerSnapshot,
  );
  const position = Math.max(0, savedPosition);
  const portraitReading = useSyncExternalStore(subscribeToCleanReadingMedia, readCleanReadingMedia, () => false);
  const menu = useRef<HTMLDialogElement>(null);
  const [changingAudio, setChangingAudio] = useState(false);
  const editionPortrait = useSyncExternalStore(subscribeToPartOnePortrait, readPartOnePortrait, () => false);
  const audioMode = useRef<HTMLButtonElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const book = useRef<HTMLElement>(null);
  const turnSheet = useRef<HTMLCanvasElement>(null);
  const cancelTurn = useRef<(() => void) | null>(null);
  const nextTurn = useRef<{ direction: number; source: PanelCapture } | null>(null);
  const paperSound = useFirstDayPaperSound();
  useFirstDayPullToRefresh(book);
  const sounds = useLessonSounds(previewSounds);
  const speech = useFirstDayNarration();
  const narrator = { ...speech, play(clips: readonly FirstDayVoiceClip[]) {
    paperSound.stop();
    speech.play(clips);
  } };
  const page = pages[position - 1];
  const edition = page?.part === 1;
  const mobileHeader = edition ? editionPortrait : portraitReading;
  const cleanReading = editionPortrait && usesCleanReading(page);
  const readingPage = page?.kind === "Tirinha" || page?.kind === "Explicação" ? page : undefined;
  const challenge = page?.kind === "Desafio" ? page : undefined;
  const translated = Boolean(challenge && attempts[challenge.id]?.translated);
  const instruction = challenge?.instruction[translated ? "pt" : "en"];
  const caption = page && "caption" in page ? page.caption
    : readingPage?.kind === "Tirinha" ? readingPage.description
    : readingPage?.kind === "Explicação" ? `${readingPage.lead} ${readingPage.detail}`
    : instruction ? narration[instruction].text : "";
  const captionClips = pageNarration(page, translated);
  const chair = page?.kind === "Ação" ? page.detail : undefined;
  const playingCover = narrator.playing === "cover";
  const openMenu = () => menu.current?.showModal();

  useEffect(() => {
    const requests = navigationRequest.current;
    return () => { requests.id++; };
  }, []);
  useEffect(() => imageCache.warm(savedPosition), [imageCache, savedPosition, portraitReading, editionPortrait]);
  useEffect(() => {
    if (savedPosition >= 0) title.current?.focus({ preventScroll: true });
  }, [savedPosition]);
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

  function go(next: number) {
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
    const pageClips = pageNarration(nextPage, nextPage && attempts[nextPage.id]?.translated);
    const clips = next === 0 ? coverNarration
      : nextPage?.kind === "Reação" ? [...pageClips, nextPage.reply.voice] : pageClips;
    if (sound && clips.length) {
      narrator.play(clips);
    }
    if (sound && !document.hidden) {
      paperSound.play(clips.length > 0);
    }
    progress.update(previous => ({ ...previous, position: next }));
    window.scrollTo(0, 0);
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
    progress.update(previous => ({ ...previous, position: 0, sound: enabled }));
    setChangingAudio(false);
  }

  function changeInstructionLanguage() {
    if (!challenge) return;
    progress.update(previous => ({
      ...previous,
      attempts: { ...previous.attempts, [challenge.id]: { ...emptyAttempt, ...previous.attempts[challenge.id], translated: !translated } },
    }));
    if (sound) narrator.play([challenge.instruction[translated ? "en" : "pt"]]);
  }

  function turnTo(next: number) {
    menu.current?.close();
    if (sound) paperSound.prepare();
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
    data-fd-edition={edition || undefined} data-fd-study={readingPage ? "" : undefined} data-fd-mobile-header={mobileHeader || undefined}
    data-ui-sound-scope="local" data-first-day-part={page?.part} data-first-day-page={page?.id ?? "cover"}>
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
      <Link href="/" className="lo-secondary" onClick={() => { menu.current?.close(); narrator.stop(); paperSound.stop(); }}>
        <ArrowLeft size={16} aria-hidden="true" /> Voltar ao painel
      </Link>
      <button type="button" onClick={() => turnTo(0)} aria-current={position === 0 ? "page" : undefined}>Capa</button>
      <ol>{pages.map((item, index) => <li key={item.id}>
        <button type="button" onClick={() => turnTo(index + 1)} aria-current={position === index + 1 ? "page" : undefined}>
          {item.kind === "Em preparação" ? item.moment : item.kind} · {item.title}
        </button>
      </li>)}</ol>
    </dialog>
    {(savedPosition < 0 || changingAudio) && <FirstDayAudioChoice
      required={savedPosition < 0} shouldOpen={() => changingAudio || progress.getSnapshot().position < 0}
      onChoose={chooseAudio} onDismiss={() => { setChangingAudio(false); audioMode.current?.focus({ preventScroll: true }); }}
    />}
    {savedPosition < 0 ? null : !page ? <section className="fd-cover" aria-labelledby="fd-cover-title">
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
          <button type="button" className="lo-secondary" ref={audioMode} aria-label="Trocar modo de áudio" aria-haspopup="dialog" aria-controls="fd-audio-options" onClick={openAudioOptions}>Modo de áudio</button>
          <LessonButton onClick={() => turnTo(1)}>{coverCopy.start} <ArrowRight size={18} aria-hidden="true" /></LessonButton>
        </div>
      </div>
    </section> : <section className={edition ? "fd1-page" : "fd-page"} aria-labelledby="fd-page-title">
      <div className={edition ? "fd1-progress" : "fd-progress"}>
        <span>Parte {page.part} de 4 · {page.kind === "Em preparação" ? page.moment : page.kind}</span><span>{position} / {pages.length}</span>
        <progress aria-label="Etapa no percurso" value={position} max={pages.length} />
      </div>
      {edition ? <div className="fd1-heading">
        <div className="fd1-headline">
          <h1 id="fd-page-title" ref={title} tabIndex={-1}>{page.title}</h1>
          {chair && !editionPortrait && <Image src={chair.src} width={chair.width} height={chair.height} className="fd1-chair" alt={chair.alt} unoptimized />}
        </div>
        <div className="fd1-caption">
          <p lang={challenge && !translated ? "en" : undefined}>{caption}</p>
          <div className="fd1-listen">
            {sound && captionClips.length > 0 && <NarrationButton clips={captionClips} player={narrator} language={readingPage || translated ? "pt" : "en"} />}
            {challenge && <button type="button" className="fd1-language" aria-label={translated ? "Voltar à instrução em inglês" : "Ver tradução da instrução em português"} onClick={changeInstructionLanguage}>{translated ? "EN" : "PT"}</button>}
          </div>
        </div>
      </div> : <div className="fd-page-heading"><div className="fd-page-title">
        <h1 id="fd-page-title" ref={title} tabIndex={-1}>{page.title}</h1>
      </div></div>}
      <div key={page.id} className="fd-workspace">{renderMoment()}</div>
      <nav className={edition ? "fd1-nav" : "fd-nav"} aria-label="Navegação da página">
        <button type="button" className="lo-secondary" onClick={() => turnTo(position - 1)}><ArrowLeft size={19} aria-hidden="true" /> Anterior</button>
        <LessonButton onClick={() => turnTo(position < pages.length ? position + 1 : 0)}>
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

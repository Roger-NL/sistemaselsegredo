"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  ArrowUp,
  LoaderCircle,
  Menu,
  Play,
  Square,
  X,
  Volume2,
  VolumeX,
} from "lucide-react";
import { ROUTES } from "@/lib/routes";
import {
  conversationReducer,
  getChoices,
  createConversation,
  type Message,
} from "./conversation";
import { useTypingSound } from "./use-typing-sound";
import {
  useVisitorName,
  saveVisitorName,
} from "@/lib/welcome/use-visitor-name";
import {
  normalizeVisitorName,
  visitorNameError,
} from "@/lib/welcome/visitor-name";
import { VisitorNameSettings } from "@/components/welcome/VisitorNameSettings";
import { languageLabel, type LearningLanguage } from "./language";
import { saveLearningLanguage, useLearningLanguage } from "@/lib/welcome/use-learning-language";
import styles from "./welcome.module.css";

function TypedMessage({
  message,
  active,
  onFinish,
  onLetter,
  playback,
  onPlay,
}: {
  message: Message;
  active: boolean;
  onFinish: (id: number) => void;
  onLetter: () => void;
  playback: SpeechPlayback;
  onPlay: (phrase: string) => void;
}) {
  const [length, setLength] = useState(0);
  const lengthRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setTimeout>;
    let disposed = false;
    function finish() {
      if (!disposed) onFinish(message.id);
    }
    function type() {
      if (disposed) return;
      if (reducedMotion.matches) {
        finish();
        return;
      }
      // Pause in background tabs instead of queuing clicks or flashing text on return.
      if (document.hidden) {
        timer = setTimeout(type, 100);
        return;
      }
      const index = lengthRef.current;
      if (index >= message.text.length) {
        finish();
        return;
      }
      lengthRef.current = index + 1;
      setLength(index + 1);
      if (/\S/u.test(message.text[index])) onLetter();
      timer = setTimeout(type, /[.!?\n]/u.test(message.text[index]) ? 24 : 7);
    }
    timer = setTimeout(type, 0);
    return () => {
      disposed = true;
      clearTimeout(timer);
    };
  }, [active, message.id, message.text, onFinish, onLetter]);

  if (!active && message.lesson?.length) {
    return (
      <div className={styles.messageText}>
        <LessonCards
          cards={message.lesson}
          title={message.lessonTitle}
          hint={message.lessonHint}
          playback={playback}
          onPlay={onPlay}
        />
      </div>
    );
  }

  if (!active && message.recap) {
    return (
      <div className={styles.messageText}>
        <p className={styles.recapLead}>{message.text}</p>
        <ConversationRecapCard
          recap={message.recap}
          playback={playback}
          onPlay={onPlay}
        />
      </div>
    );
  }

  return (
    <p className={styles.messageText}>
      {active ? (
        message.text.slice(0, length)
      ) : message.speech?.length ? (
        <InlineSpeechText
          text={message.text}
          phrases={message.speech}
          playback={playback}
          onPlay={onPlay}
        />
      ) : (
        message.text
      )}
      {active && <span className={styles.cursor} aria-hidden="true" />}
    </p>
  );
}

function ConversationRecapCard({
  recap,
  playback,
  onPlay,
}: {
  recap: NonNullable<Message["recap"]>;
  playback: SpeechPlayback;
  onPlay: (phrase: string) => void;
}) {
  return (
    <section className={styles.recap} aria-label="Resumo da conversa">
      <div className={styles.recapContext}>
      <span className={styles.recapContextLabel}>{recap.contextLabel}</span>
        <span className={styles.recapContextPhrase}>{recap.context.phrase}</span>
        <span className={styles.recapTranslation}>{recap.context.translation}</span>
      </div>
      <div className={styles.recapTurns}>
        {recap.turns.map((turn) => {
          const loading = playback.phrase === turn.phrase && playback.status === "loading";
          const playing = playback.phrase === turn.phrase && playback.status === "playing";
          const error = playback.phrase === turn.phrase && playback.status === "error";
          return (
            <div className={styles.recapTurn} key={`${turn.speaker}-${turn.phrase}`}>
              <span className={styles.recapSpeaker}>{turn.speaker}</span>
              <div className={styles.recapWords}>
                <span className={styles.recapPhrase}>{turn.phrase}</span>
                <span className={styles.recapTranslation}>{turn.translation}</span>
                {error && <span className={styles.speechError} role="alert">Não foi possível tocar o áudio agora.</span>}
              </div>
              <button
                className={styles.speechInlineButton}
                type="button"
                onClick={() => onPlay(turn.phrase)}
                aria-label={`${playing ? "Parar" : "Ouvir"}: ${turn.phrase}`}
                title={playing ? "Parar áudio" : "Ouvir em inglês"}
              >
                {loading ? <LoaderCircle className={styles.speechSpinner} size={14} aria-hidden="true" /> : playing ? <Square size={11} fill="currentColor" aria-hidden="true" /> : <Play size={14} fill="currentColor" aria-hidden="true" />}
              </button>
            </div>
          );
        })}
      </div>
      <div className={styles.recapProgress}>
        <span className={styles.recapProgressMark} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <div>
          <span className={styles.recapProgressLabel}>{recap.progressLabel}</span>
          <strong>{recap.progress}</strong>
        </div>
      </div>
    </section>
  );
}

function LessonCards({
  cards,
  title,
  hint,
  playback,
  onPlay,
}: {
  cards: NonNullable<Message["lesson"]>;
  title?: string;
  hint?: string;
  playback: SpeechPlayback;
  onPlay: (phrase: string) => void;
}) {
  return (
    <section className={styles.lesson} aria-label="A frase em três partes">
      <div className={styles.lessonHeading}>
        <span className={styles.lessonEyebrow}>{title ?? "MINI MISSÃO"}</span>
        <span className={styles.lessonHint}>
          {hint ?? "Toque em cada parte para ouvir"}
        </span>
      </div>
      <div className={styles.lessonCards}>
        {cards.map((card, index) => {
          const isLoading =
            playback.phrase === card.phrase && playback.status === "loading";
          const isPlaying =
            playback.phrase === card.phrase && playback.status === "playing";
          const isError =
            playback.phrase === card.phrase && playback.status === "error";
          return (
            <article className={styles.lessonCard} key={card.phrase}>
              <div className={styles.lessonCardTop}>
                <span className={styles.lessonNumber}>{index + 1}</span>
                <span className={styles.lessonPhrase}>{card.phrase}</span>
                <button
                  className={styles.speechInlineButton}
                  type="button"
                  onClick={() => onPlay(card.phrase)}
                  aria-label={`${isPlaying ? "Parar" : "Ouvir"}: ${card.phrase}`}
                  title={isPlaying ? "Parar áudio" : "Ouvir em inglês"}
                >
                  {isLoading ? (
                    <LoaderCircle
                      className={styles.speechSpinner}
                      size={14}
                      aria-hidden="true"
                    />
                  ) : isPlaying ? (
                    <Square size={11} fill="currentColor" aria-hidden="true" />
                  ) : (
                    <Play size={14} fill="currentColor" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className={styles.lessonTranslation}>{card.translation}</p>
              <div className={styles.lessonClues} aria-label="Palavras e sentidos">
                {card.clues.map((clue) => (
                  <span className={styles.lessonClue} key={clue.english}>
                    <strong>{clue.english}</strong>
                    <span>{clue.meaning}</span>
                  </span>
                ))}
              </div>
              <p className={styles.lessonNote}>{card.note}</p>
              {isError && (
                <span className={styles.speechError} role="alert">
                  Não foi possível tocar o áudio agora.
                </span>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

type SpeechPlayback = {
  phrase?: string;
  status: "idle" | "loading" | "playing" | "error";
};

function useSpeechPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playback, setPlayback] = useState<SpeechPlayback>({ status: "idle" });

  const stop = useCallback(() => {
    const audio = audioRef.current;
    audioRef.current = null;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    setPlayback({ status: "idle" });
  }, []);

  useEffect(() => stop, [stop]);

  const toggle = useCallback(
    (phrase: string) => {
      if (
        playback.phrase === phrase &&
        (playback.status === "loading" || playback.status === "playing")
      ) {
        stop();
        return;
      }

      const previousAudio = audioRef.current;
      if (previousAudio) {
        audioRef.current = null;
        previousAudio.pause();
        previousAudio.removeAttribute("src");
        previousAudio.load();
      }

      const audio = new Audio(`/api/speech?text=${encodeURIComponent(phrase)}`);
      audio.preload = "auto";
      audioRef.current = audio;
      setPlayback({ phrase, status: "loading" });

      audio.onplaying = () => {
        if (audioRef.current === audio) {
          setPlayback({ phrase, status: "playing" });
        }
      };
      audio.onended = () => {
        if (audioRef.current === audio) {
          audioRef.current = null;
          setPlayback({ status: "idle" });
        }
      };
      audio.onerror = () => {
        if (audioRef.current === audio) {
          audioRef.current = null;
          setPlayback({ phrase, status: "error" });
        }
      };

      void audio.play().catch(() => {
        if (audioRef.current === audio) {
          audioRef.current = null;
          setPlayback({ phrase, status: "error" });
        }
      });
    },
    [playback.phrase, playback.status, stop],
  );

  return { playback, toggle };
}

function InlineSpeechText({
  text,
  phrases,
  playback,
  onPlay,
}: {
  text: string;
  phrases: string[];
  playback: SpeechPlayback;
  onPlay: (phrase: string) => void;
}) {
  const lines = text.split("\n");

  return (
    <>
      {lines.map((line, index) => {
        const matches = phrases.filter((candidate) => line.includes(candidate));
        const phrase = matches.length === 1 ? matches[0] : undefined;
        const position = phrase ? line.indexOf(phrase) : -1;
        const current = phrase === playback.phrase;
        const loading = current && playback.status === "loading";
        const playing = current && playback.status === "playing";
        const error = current && playback.status === "error";

        return (
          <span key={`${line}-${index}`}>
            {phrase && position >= 0 ? (
              <>
                {line.slice(0, position)}
                {phrase}
                <button
                  type="button"
                  className={styles.speechInlineButton}
                  data-sound-control
                  onClick={() => onPlay(phrase)}
                  aria-label={`${playing || loading ? "Parar" : "Ouvir"}: ${phrase}`}
                  title={error ? "Não foi possível tocar o áudio" : phrase}
                >
                  {loading ? (
                    <LoaderCircle
                      size={15}
                      className={styles.speechSpinner}
                      aria-hidden="true"
                    />
                  ) : playing ? (
                    <Square size={11} fill="currentColor" aria-hidden="true" />
                  ) : (
                    <Play size={14} fill="currentColor" aria-hidden="true" />
                  )}
                </button>
                {line.slice(position + phrase.length)}
                {error && (
                  <span className={styles.speechError} role="alert">
                    Não foi possível tocar o áudio agora.
                  </span>
                )}
              </>
            ) : (
              line
            )}
            {index < lines.length - 1 && <br />}
          </span>
        );
      })}
    </>
  );
}

export default function WelcomeExperience() {
  const rememberedName = useVisitorName();
  const savedLanguage = useLearningLanguage();
  const [entryLanguageOverride, setEntryLanguageOverride] = useState<LearningLanguage | null>(null);
  const [entryRequested, setEntryRequested] = useState(false);
  const entryLanguage = entryLanguageOverride ?? savedLanguage ?? "pt";

  if (!entryRequested || rememberedName === undefined) {
    return (
      <LanguagePicker
        selected={entryLanguageOverride ?? savedLanguage ?? null}
        onSelect={(language) => {
          setEntryLanguageOverride(language);
          saveLearningLanguage(language);
          setEntryRequested(true);
        }}
      />
    );
  }

  return <ConversationExperience rememberedName={rememberedName} initialLanguage={entryLanguage} />;
}

function LanguagePicker({
  selected,
  onSelect,
}: {
  selected: LearningLanguage | null;
  onSelect: (language: LearningLanguage) => void;
}) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href={ROUTES.home} className={styles.brand} aria-label="BasedSpeak — início">
          <span className={styles.brandMark} aria-hidden="true"><span /><span /><span /><span /></span>
          based<span className={styles.brandLight}>speak</span>.
        </Link>
      </header>
      <div className={styles.content}>
        <main className={styles.languageEntryMain}>
          <div className={styles.languageOptions} role="group" aria-label="Escolha o idioma de apoio para aprender inglês">
            {(["pt", "es", "de"] as const).map((language) => (
              <button
                className={`${styles.languageOption} ${selected === language ? styles.languageOptionDefault : ""}`}
                type="button"
                key={language}
                onClick={() => onSelect(language)}
              >
                {languageLabel(language)}
                <ArrowUpRight size={17} aria-hidden="true" />
              </button>
            ))}
          </div>
        </main>
      </div>
      <footer className={styles.footer}>
        <span>BasedSpeak · Uma conversa de cada vez.</span>
        <nav aria-label="Informações do site">
          <Link href="/termos">Termos</Link>
          <Link href="/privacidade">Privacidade</Link>
        </nav>
      </footer>
    </div>
  );
}

function ConversationExperience({
  rememberedName,
  initialLanguage,
}: {
  rememberedName: string | null;
  initialLanguage: LearningLanguage;
}) {
  const [conversation, dispatch] = useReducer(
    conversationReducer,
    { rememberedName, language: initialLanguage },
    (initial) => createConversation(initial.rememberedName, initial.language),
  );
  const [nameDraft, setNameDraft] = useState("");
  const [nameError, setNameError] = useState("");
  const [storageNotice, setStorageNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [completedId, setCompletedId] = useState(-1);
  const [showLatest, setShowLatest] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const followRef = useRef(true);
  const lastScrollTopRef = useRef(0);
  const lastAnsweredMessageRef = useRef<number | null>(null);
  const soundStartedRef = useRef(false);
  const sound = useTypingSound();
  const speech = useSpeechPlayer();
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const latestMessageIdRef = useRef(lastMessage.id);
  const isTyping = completedId !== lastMessage.id;
  const choices = getChoices(conversation);
  const namePlaceholder = conversation.language === "de" ? "Dein Name" : conversation.language === "es" ? "Tu nombre" : "Digite seu nome";
  const nameHint = conversation.language === "de"
    ? "Ich merke mir deinen Namen in diesem Browser. Du kannst ihn in den Einstellungen ändern."
    : conversation.language === "es"
      ? "Recordaré tu nombre en este navegador. Puedes cambiarlo en Configuración."
      : "Vou lembrar neste navegador. Você pode mudar em Configurações.";
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const feedbackCopy = conversation.language === "de"
    ? { title: "Danke fürs Ausprobieren!", question: "Wie bewertest du die Benutzerfreundlichkeit?", comment: "Was können wir verbessern? (optional)", send: "Bewertung senden", thanks: "Danke für deine Rückmeldung." }
    : conversation.language === "es"
      ? { title: "¡Gracias por probarlo!", question: "¿Cómo calificarías la facilidad de uso?", comment: "¿Qué podríamos mejorar? (opcional)", send: "Enviar opinión", thanks: "Gracias por compartir tu opinión." }
      : { title: "Obrigado por testar!", question: "De 1 a 10, como você avalia a facilidade de uso?", comment: "O que poderíamos melhorar? (opcional)", send: "Enviar avaliação", thanks: "Obrigado por compartilhar sua opinião." };

  useEffect(() => {
    if (rememberedName && rememberedName !== conversation.name) {
      dispatch({ type: "rename", name: rememberedName });
    } else if (!rememberedName && conversation.name && !storageNotice) {
      dispatch({ type: "forget-name" });
    }
  }, [rememberedName, conversation.name, storageNotice]);

  useLayoutEffect(() => {
    latestMessageIdRef.current = lastMessage.id;
  }, [lastMessage.id]);

  function openSettings() {
    setMenuOpen(false);
    setSettingsOpen(true);
    dialogRef.current?.showModal();
  }

  function submitName(event: FormEvent) {
    event.preventDefault();
    if (lastAnsweredMessageRef.current === lastMessage.id) return;
    const error = visitorNameError(nameDraft);
    if (error) {
      setNameError(error);
      return;
    }
    const name = normalizeVisitorName(nameDraft);
    lastAnsweredMessageRef.current = lastMessage.id;
    setCompletedId(lastMessage.id);
    followRef.current = true;
    setShowLatest(false);
    setNameError("");
    const saved = saveVisitorName(name);
    setStorageNotice(
      saved
        ? ""
        : "Seu nome será usado nesta conversa. O navegador não permitiu salvá-lo para as próximas visitas.",
    );
    dispatch({ type: "name", name });
  }

  const finishTyping = useCallback((id: number) => {
    if (latestMessageIdRef.current !== id) return;
    setCompletedId(id);
  }, []);

  const scrollToLatest = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    followRef.current = true;
    container.scrollTop = container.scrollHeight;
    lastScrollTopRef.current = container.scrollTop;
    setShowLatest(false);
  }, []);

  // Follow growing messages only while the reader is already near the bottom.
  useLayoutEffect(() => {
    const container = scrollRef.current;
    const content = contentRef.current;
    if (!container || !content) return;
    const observer = new ResizeObserver(() => {
      if (followRef.current) {
        container.scrollTop = container.scrollHeight;
        lastScrollTopRef.current = container.scrollTop;
      }
    });
    observer.observe(content);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (container && followRef.current) {
      container.scrollTop = container.scrollHeight;
      lastScrollTopRef.current = container.scrollTop;
    }
  }, [lastMessage.id]);

  function answer(choiceId: string) {
    if (lastAnsweredMessageRef.current === lastMessage.id) return;
    lastAnsweredMessageRef.current = lastMessage.id;
    if (isTyping) setCompletedId(lastMessage.id);
    if (!soundStartedRef.current) {
      soundStartedRef.current = true;
      sound.unlock();
    }
    followRef.current = true;
    setShowLatest(false);
    dispatch({ stage: conversation.stage, choiceId });
  }

  function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!feedbackRating) return;
    try {
      const key = "basedspeak-orbita-feedback-v1";
      const previous = JSON.parse(window.localStorage.getItem(key) ?? "[]") as unknown[];
      const record = {
        rating: feedbackRating,
        comment: feedbackComment.trim(),
        language: conversation.language,
        submittedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(key, JSON.stringify([...previous, record]));
    } catch {
      // The thank-you state still works if browser storage is unavailable.
    }
    setFeedbackSent(true);
  }

  const soundLabel = conversation.language === "de"
    ? sound.enabled ? "Tippgeräusch ausschalten" : "Tippgeräusch einschalten"
    : conversation.language === "es"
      ? sound.enabled ? "Desactivar sonido de escritura" : "Activar sonido de escritura"
      : sound.enabled ? "Desativar som da digitação" : "Ativar som da digitação";
  const soundStatus = conversation.language === "de"
    ? sound.enabled ? "Tippgeräusch an" : "Tippgeräusch aus"
    : conversation.language === "es"
      ? sound.enabled ? "Sonido de escritura activado" : "Sonido de escritura desactivado"
      : sound.enabled ? "Digitação ligada" : "Digitação desligada";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link
          href={ROUTES.home}
          className={styles.brand}
          aria-label="BasedSpeak — início"
        >
          <span className={styles.brandMark} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
          based<span className={styles.brandLight}>speak</span>.
        </Link>
        <nav className={styles.desktopNav} aria-label="Menu principal">
          <a href="#como-funciona">Como funciona</a>
          <button onClick={openSettings}>Configurações</button>
        </nav>
        <div className={styles.headerActions}>
          <button
            className={styles.menuButton}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            aria-controls="welcome-menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>
      {menuOpen && (
        <nav
          id="welcome-menu"
          className={styles.mobileNav}
          aria-label="Menu principal no celular"
        >
          <a href="#como-funciona" onClick={() => setMenuOpen(false)}>
            Como funciona
          </a>
          <button onClick={openSettings}>Configurações</button>
        </nav>
      )}

      <div className={styles.content}>
        <main className={styles.main}>
          <div className={styles.chatHeader}>
            <div>
              <span className={styles.eyebrow}>BOAS-VINDAS À BASEDSPEAK</span>
              <h1>Um começo com a sua cara.</h1>
            </div>
            <button
              data-sound-control
              className={styles.sound}
              onClick={sound.toggle}
              aria-label={soundLabel}
              aria-pressed={sound.enabled}
              title={soundLabel}
            >
              {sound.enabled ? (
                <Volume2 size={17} />
              ) : (
                <VolumeX size={17} />
              )}
              <span>
                {soundStatus}
              </span>
            </button>
          </div>
          <div className={styles.transcript}>
            <div
              ref={scrollRef}
              className={styles.history}
              tabIndex={0}
              role="region"
              aria-label="Histórico da conversa"
              onScroll={() => {
                const container = scrollRef.current;
                if (!container) return;
                const nearBottom =
                  container.scrollHeight -
                    container.scrollTop -
                    container.clientHeight <
                  80;
                // Content growth can fire a scroll event before ResizeObserver.
                // Stop following only when the reader actually scrolls upward.
                if (nearBottom) followRef.current = true;
                else if (container.scrollTop < lastScrollTopRef.current - 2) {
                  followRef.current = false;
                }
                lastScrollTopRef.current = container.scrollTop;
                setShowLatest(!nearBottom && !followRef.current);
              }}
            >
              <div ref={contentRef} className={styles.messages}>
                <ol
                  className={styles.messageList}
                  aria-label="Mensagens"
                  aria-live="off"
                >
                  {conversation.messages.map((message) => (
                    <li
                      key={`${message.id}-${message.text}`}
                      className={
                        message.role === "user"
                          ? styles.userMessage
                          : styles.assistantMessage
                      }
                    >
                      <span className={styles.srOnly}>
                        {message.role === "user" ? "Você: " : "BasedSpeak: "}
                      </span>
                      {message.role === "assistant" && (
                        <span className={styles.avatar} aria-hidden="true">
                          b.
                        </span>
                      )}
                      {message.role === "assistant" ? (
                        <div className={styles.assistantContent}>
                          <TypedMessage
                            message={message}
                            active={message.id === lastMessage.id && isTyping}
                            onFinish={finishTyping}
                            onLetter={sound.tick}
                            playback={speech.playback}
                            onPlay={speech.toggle}
                          />
                        </div>
                      ) : (
                        <p className={styles.messageText}>{message.text}</p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {showLatest && (
              <button
                className={styles.latest}
                onClick={scrollToLatest}
                aria-label="Ir para a mensagem mais recente"
              >
                <ArrowDown size={17} />
              </button>
            )}
          </div>
          <div
            className={styles.composer}
            aria-label="Respostas disponíveis"
          >
            {conversation.stage === "name" ? (
              <form className={styles.nameForm} onSubmit={submitName}>
                <label htmlFor="welcome-name" className={styles.srOnly}>
                  Como você quer ser chamado?
                </label>
                <div className={styles.inputRow}>
                  <input
                    id="welcome-name"
                    name="givenName"
                    autoComplete="given-name"
                  placeholder={namePlaceholder}
                    maxLength={60}
                    value={nameDraft}
                    onChange={(event) => {
                      setNameDraft(event.target.value);
                      setNameError("");
                    }}
                    aria-invalid={!!nameError}
                    aria-describedby="name-hint name-error"
                    required
                  />
                  <button
                    type="submit"
                    aria-label="Enviar meu nome"
                    disabled={!nameDraft.trim()}
                  >
                    <ArrowUp size={19} />
                  </button>
                </div>
                <p id="name-hint" className={styles.inputHint}>
                  {nameHint}
                </p>
                <p id="name-error" className={styles.error} role="alert">
                  {nameError}
                </p>
              </form>
            ) : conversation.stage === "done" ? (
              feedbackSent ? (
                <div className={styles.feedbackThanks} role="status">{feedbackCopy.thanks}</div>
              ) : (
                <form className={styles.feedbackForm} onSubmit={submitFeedback}>
                  <strong>{feedbackCopy.title}</strong>
                  <label>{feedbackCopy.question}</label>
                  <div className={styles.ratingChoices} role="group" aria-label={feedbackCopy.question}>
                    {Array.from({ length: 10 }, (_, index) => index + 1).map((rating) => (
                      <button
                        type="button"
                        key={rating}
                        className={`${styles.ratingChoice} ${feedbackRating === rating ? styles.ratingChoiceSelected : ""}`}
                        aria-pressed={feedbackRating === rating}
                        onClick={() => setFeedbackRating(rating)}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                  <div className={styles.ratingScale} aria-hidden="true"><span>1</span><span>10</span></div>
                  <label className={styles.feedbackCommentLabel} htmlFor="orbita-feedback-comment">{feedbackCopy.comment}</label>
                  <textarea
                    id="orbita-feedback-comment"
                    className={styles.feedbackComment}
                    value={feedbackComment}
                    onChange={(event) => setFeedbackComment(event.target.value)}
                    maxLength={1000}
                    rows={2}
                  />
                  <button className={styles.feedbackSubmit} type="submit" disabled={!feedbackRating}>
                    {feedbackCopy.send} <ArrowUpRight size={15} />
                  </button>
                </form>
              )
            ) : (
              <div
                className={styles.options}
                role="group"
                aria-label="Escolha sua resposta"
              >
                {choices.map((choice) => (
                  <button
                    key={choice.id}
                    className={styles.option}
                    onClick={() => answer(choice.id)}
                  >
                    {choice.label}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}
          </div>
          {storageNotice && (
            <p className={styles.storageNotice} role="status">
              {storageNotice}
            </p>
          )}
          <div
            className={styles.srOnly}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {!isTyping ? lastMessage.text : ""}
          </div>
        </main>
        <section
          id="como-funciona"
          className={styles.support}
          aria-label="Como funciona a BasedSpeak"
        >
          <div>
            <h2>Inglês para a vida real.</h2>
            <p>Pratique conversas que fazem sentido para você.</p>
          </div>
          <div>
            <h2>Um passo por vez.</h2>
            <p>Um caminho guiado, com espaço para tentar de novo.</p>
          </div>
          <div>
            <h2>No seu ritmo.</h2>
            <p>Comece de onde está e avance com a prática.</p>
          </div>
        </section>
      </div>
      <footer className={styles.footer}>
        <span>BasedSpeak · Uma conversa de cada vez.</span>
        <nav aria-label="Informações do site">
          <Link href="/termos">Termos</Link>
          <Link href="/privacidade">Privacidade</Link>
          <button onClick={openSettings}>Configurações</button>
        </nav>
      </footer>
      <dialog
        ref={dialogRef}
        className={styles.settingsDialog}
        aria-labelledby="welcome-settings-title"
        onClose={() => setSettingsOpen(false)}
      >
        <div className={styles.dialogHeader}>
          <h2 id="welcome-settings-title">Configurações das boas-vindas</h2>
          <button
            onClick={() => dialogRef.current?.close()}
            aria-label="Fechar configurações"
          >
            <X size={20} />
          </button>
        </div>
        {settingsOpen && (
          <>
            <div className={styles.languageSetting}>
              <label htmlFor="welcome-learning-language">Idioma de apoio</label>
              <p>As frases continuam em inglês; traduções e explicações usam este idioma.</p>
              <select
                id="welcome-learning-language"
                value={conversation.language}
                onChange={(event) => {
                  const language = event.target.value as LearningLanguage;
                  saveLearningLanguage(language);
                  lastAnsweredMessageRef.current = null;
                  followRef.current = true;
                  setShowLatest(false);
                  setCompletedId(-1);
                  dispatch({ type: "set-language", language });
                  setStorageNotice("");
                }}
              >
                {(["pt", "es", "de"] as const).map((language) => (
                  <option key={language} value={language}>{languageLabel(language)}</option>
                ))}
              </select>
              <span className={styles.languageHint}>A troca reinicia esta conversa para aplicar o idioma escolhido.</span>
            </div>
            <VisitorNameSettings
              onSaved={(name) => {
                dispatch({
                  type: conversation.stage === "name" ? "name" : "rename",
                  name,
                });
                setStorageNotice("");
              }}
              onRestart={() => {
                lastAnsweredMessageRef.current = null;
                followRef.current = true;
                setShowLatest(false);
                setCompletedId(-1);
                dispatch({ type: "restart" });
                dialogRef.current?.close();
              }}
            />
          </>
        )}
      </dialog>
    </div>
  );
}

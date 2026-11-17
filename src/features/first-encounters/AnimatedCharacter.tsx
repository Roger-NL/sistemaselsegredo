"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Alignment, Fit, Layout, RuntimeLoader, useRive } from "@rive-app/react-webgl2";
import type { LessonSpeechDriver, LessonSpeechFrame } from "./lesson-audio";
import styles from "./AnimatedCharacter.module.css";

export type CharacterPerson = "ana" | "leo" | "maya" | "sam" | "nina";
export type CharacterCue = "idle" | "wave" | "self-point" | "yes" | "no" | "receive-badge" | "thinking";

export type AnimatedCharacterProps = {
  person: CharacterPerson;
  cue?: CharacterCue;
  /** Increment to replay the same gesture from the beginning. */
  cueKey?: number;
  onReady?: () => void;
  className?: string;
  pause?: boolean;
  /** A stable imperative audio clock; no React render is needed for speech frames. */
  speech?: LessonSpeechDriver;
  speechListenerSide?: "left" | "right";
};

// The matching binaries are served with the lesson, including the compatibility build.
// Configure both before the first useRive instance starts loading the runtime.
RuntimeLoader.setWasmUrl("/first-encounters/rive.wasm");
RuntimeLoader.setWasmFallbackUrl("/first-encounters/rive-fallback.wasm");

const ARTBOARD = "Character";
const LAYOUT = new Layout({ fit: Fit.Contain, alignment: Alignment.BottomCenter });
const NAMES: Record<CharacterPerson, string> = { ana: "Ana", leo: "Leo", maya: "Maya", sam: "Sam", nina: "Nina" };
// Times are authored poses inside the local one-shot timelines, not an elapsed-time delay.
const STATIC_POSE_SECONDS: Record<CharacterCue, number> = {
  idle: 0,
  wave: 0.7,
  "self-point": 0.65,
  yes: 14 / 60,
  no: 13 / 60,
  "receive-badge": 0.75,
  thinking: 0.7,
};

function subscribeReducedMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getReducedMotion() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}
function getPageVisibility() { return document.visibilityState !== "hidden"; }
function getServerReducedMotion() { return true; }
function getServerVisibility() { return false; }

/** Decorative canvas; the surrounding activity supplies its semantic button and label. */
export function AnimatedCharacter(props: AnimatedCharacterProps) {
  // A new person gets a new runtime, so old load callbacks and poses cannot leak across people.
  return <CharacterCanvas key={props.person} {...props} />;
}

type SpeechGesture = "speech-self" | "speech-listener-left" | "speech-listener-right" | "speech-team";

function speechGesture(text: string | null, side?: "left" | "right"): SpeechGesture {
  if (/^I\b/i.test(text ?? "")) return "speech-self";
  if (/^You\b/i.test(text ?? "") && side) return `speech-listener-${side}`;
  // A frontal presentation avoids indicating the wrong listener if the scene
  // has not supplied a direction.
  return "speech-team";
}

function unit(value: number) { return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0; }

function CharacterCanvas({ person, cue = "idle", cueKey = 0, onReady, className, pause = false, speech, speechListenerSide }: AnimatedCharacterProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  const announcedReady = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [painted, setPainted] = useState(false);
  const [inView, setInView] = useState(true);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getServerReducedMotion);
  const pageVisible = useSyncExternalStore(subscribeVisibility, getPageVisibility, getServerVisibility);
  const active = !pause && inView && pageVisible && !reducedMotion;
  const previousRequest = useRef<{ cue: CharacterCue; key: number; reducedMotion: boolean } | null>(null);
  const resumeAnimation = useRef(false);
  const speaking = useRef<{ playbackId: number; gesture: SpeechGesture } | null>(null);

  useEffect(() => { onReadyRef.current = onReady; }, [onReady]);

  const onLoadError = useCallback(() => {
    setError("Não foi possível carregar o personagem.");
  }, []);

  const { rive, canvas, setCanvasRef, setContainerRef } = useRive({
    src: `/first-encounters/characters/${person}.riv`,
    artboard: ARTBOARD,
    animations: "idle",
    autoplay: false,
    layout: LAYOUT,
    enableRiveAssetCDN: false,
    shouldDisableRiveListeners: true,
    onLoadError,
  }, {
    useOffscreenRenderer: true,
    // One owner resizes and repaints the actual surface below. The hook's
    // resizeToCanvas path can clear a paused canvas without forcing a redraw.
    shouldResizeCanvasToContainer: false,
    // Visibility is coordinated below with pause/reduced motion, so it cannot restart a frozen pose.
    shouldUseIntersectionObserver: false,
  });

  useEffect(() => {
    const container = canvas?.parentElement;
    if (!rive || !canvas || !container) return;
    let disposed = false;
    let previousSize = "";
    const resize = () => {
      if (disposed || !canvas.isConnected || document.visibilityState === "hidden") return;
      const { width, height } = canvas.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      const dpr = Math.min(3, Math.max(1, window.devicePixelRatio || 1));
      const size = `${width}:${height}:${dpr}`;
      if (size === previousSize && canvas.width === Math.floor(width * dpr) && canvas.height === Math.floor(height * dpr)) return;
      previousSize = size;
      // This API updates layout AND marks the surface dirty. It draws the
      // current native pose without resetting a timeline or starting a loop.
      rive.resizeDrawingSurfaceToCanvas(dpr);
    };
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
    observer?.observe(container);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", resize);
    resize();
    return () => {
      disposed = true;
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", resize);
    };
  }, [rive, canvas]);

  useEffect(() => {
    const element = rootRef.current;
    if (!element || !window.IntersectionObserver) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0]) setInView(entries[0].isIntersecting);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (rive || error) return;
    const timeout = window.setTimeout(() => setError("O personagem está indisponível neste momento."), 12000);
    return () => window.clearTimeout(timeout);
  }, [rive, error]);

  useEffect(() => {
    if (!rive) return;
    let cancelled = false;
    let failed = false;
    let unsubscribe: (() => void) | undefined;
    const setSpeechData = (isSpeaking: boolean, gesture = "none", level = 0) => {
      const element = rootRef.current;
      if (!element) return;
      element.dataset.speechActive = String(isSpeaking);
      element.dataset.speechGesture = gesture;
      element.dataset.speechMouthLevel = level.toFixed(3);
    };
    const reportFailure = () => {
      if (cancelled || failed) return;
      failed = true;
      rive.pause();
      rive.stopRendering();
      speaking.current = null;
      setSpeechData(false);
      queueMicrotask(() => { if (!cancelled) setError("O personagem está indisponível neste momento."); });
    };
    const frameBelongsToCharacter = (frame?: LessonSpeechFrame) => Boolean(
      active && frame?.playing && frame.role === "character" && frame.person === person,
    );
    const applySpeechFrame = (frame?: LessonSpeechFrame) => {
      if (cancelled || failed) return;
      try {
        if (!frame || !frameBelongsToCharacter(frame)) {
          if (!speaking.current) return;
          // End, pause, hidden tab, or a new speaker closes the actual rig.
          rive.stopRendering();
          rive.reset({ artboard: ARTBOARD, animations: "idle", autoplay: false });
          rive.volume = 0;
          rive.stopRendering();
          rive.scrub("idle", 0);
          rive.pause();
          rive.stopRendering();
          speaking.current = null;
          previousRequest.current = { cue, key: cueKey, reducedMotion };
          resumeAnimation.current = false;
          setSpeechData(false);
          return;
        }

        const gesture = speechGesture(frame.text, speechListenerSide);
        const previous = speaking.current;
        if (!previous || previous.playbackId !== frame.playbackId || previous.gesture !== gesture) {
          if (![gesture, "speech-mouth"].every(name => rive.animationNames.includes(name))) {
            throw new Error("O arquivo do personagem não contém as poses de fala.");
          }
          rive.stopRendering();
          // Both timelines stay paused. Only the real media clock and decoded
          // amplitude scrub them; there is no independent Rive/React clock.
          rive.reset({ artboard: ARTBOARD, animations: [gesture, "speech-mouth"], autoplay: false });
          rive.volume = 0;
          rive.stopRendering();
          speaking.current = { playbackId: frame.playbackId, gesture };
          previousRequest.current = null;
          resumeAnimation.current = false;
        }
        const progress = frame.duration > 0 ? unit(frame.time / frame.duration) : 0;
        const level = unit(frame.level);
        // The native body and mouth timelines own disjoint properties.
        rive.scrub(gesture, progress);
        rive.scrub("speech-mouth", level);
        setSpeechData(true, gesture, level);
      } catch {
        reportFailure();
      }
    };
    try {
      if (rive.activeArtboard !== ARTBOARD || !rive.animationNames.includes(cue)) {
        throw new Error("O arquivo do personagem não contém o gesto solicitado.");
      }
      const currentSpeech = speech?.getFrame();
      const previous = previousRequest.current;
      const changed = !previous || previous.cue !== cue || previous.key !== cueKey || previous.reducedMotion !== reducedMotion;
      if (!frameBelongsToCharacter(currentSpeech) && !speaking.current && changed) {
        // stop() alone retains keyed properties. Recreate the artboard before applying another clip.
        rive.stopRendering();
        rive.reset({ artboard: ARTBOARD, animations: cue, autoplay: false });
        rive.volume = 0;
        rive.stopRendering();
        rive.scrub(cue, active ? 0 : STATIC_POSE_SECONDS[cue]);
        previousRequest.current = { cue, key: cueKey, reducedMotion };
        resumeAnimation.current = true;
      }

      if (frameBelongsToCharacter(currentSpeech)) {
        applySpeechFrame(currentSpeech!);
      } else if (speaking.current) {
        applySpeechFrame(currentSpeech);
      } else if (active) {
        // Resume a paused clip without replaying a completed one when the tab becomes visible.
        if (changed || resumeAnimation.current) {
          rive.play(cue);
          rive.startRendering();
          resumeAnimation.current = false;
        }
      } else {
        if (rive.isPlaying) resumeAnimation.current = true;
        rive.pause();
        rive.stopRendering();
      }
      if (speech) unsubscribe = speech.subscribeFrame(applySpeechFrame);

      queueMicrotask(() => {
        if (cancelled || failed) return;
        setPainted(true);
        setError(null);
        if (!announcedReady.current) {
          announcedReady.current = true;
          onReadyRef.current?.();
        }
      });
    } catch {
      reportFailure();
    }
    return () => { cancelled = true; unsubscribe?.(); };
  }, [rive, cue, cueKey, reducedMotion, active, speech, person, speechListenerSide]);

  const status = error ? "error" : painted ? "ready" : "loading";
  return <div ref={rootRef} className={`${styles.character}${className ? ` ${className}` : ""}`}
    data-character={person} data-character-status={status} data-character-cue={cue} data-cue-key={cueKey}
    data-reduced-motion={reducedMotion} data-motion-active={active && status === "ready"}
    data-speech-active="false" data-speech-gesture="none" data-speech-mouth-level="0.000">
    <div ref={setContainerRef} className={styles.canvasContainer} aria-hidden="true" style={{ visibility: status === "ready" ? "visible" : "hidden" }}>
      <canvas ref={setCanvasRef} className={styles.canvas} aria-hidden="true" tabIndex={-1} />
    </div>
    {status !== "ready" ? <div className={styles.fallback} role={status === "error" ? "status" : undefined}>
      <div className={styles.silhouette} aria-hidden="true"><span className={styles.head} /><span className={styles.body} /></div>
      <span className={styles.fallbackName}>{NAMES[person]}</span>
      <span className={styles.fallbackMessage}>{error ?? "Carregando personagem…"}</span>
    </div> : null}
  </div>;
}

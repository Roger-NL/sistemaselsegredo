"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { getMotionPreference } from "@/features/dashboard/preferences";
import { decodeSceneImage } from "./scene-ready";

type StartOptions = { resume?: boolean; prepare?: () => void };
type Journey = { start: (options?: StartOptions) => void; ready: (element: HTMLElement) => () => void; cancel: () => void; pending: boolean; headerTone: "paper" | "immersive"; reducedMotion: boolean };
const JourneyContext = createContext<Journey>({ start: () => {}, ready: () => () => {}, cancel: () => {}, pending:false, headerTone:"paper", reducedMotion:false });
type Cover = { phase:"cover" | "reveal" | "error"; resume:boolean; reduced:boolean };

export function JourneyTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [cover, setCover] = useState<Cover | null>(null);
  const operation = useRef(0);
  const active = useRef(false);
  const startedAt = useRef(0);
  const origin = useRef("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lockedContent = useRef(new Set<HTMLElement>());
  const cancel = useCallback(() => {
    const wasActive = active.current;
    operation.current++; active.current = false;
    timers.current.forEach(clearTimeout); timers.current = [];
    lockedContent.current.forEach(element => { element.inert = false; }); lockedContent.current.clear();
    setCover(null);
    if (wasActive && window.location.pathname === "/demo") document.querySelector<HTMLElement>(".experience h1[tabindex='-1']")?.focus({ preventScroll:true });
  }, []);
  const start = useCallback((options: StartOptions = {}) => {
    if (active.current) return;
    active.current = true; operation.current++; startedAt.current = performance.now(); origin.current = window.location.pathname;
    const reduced = getMotionPreference() || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const originContent = document.querySelector<HTMLElement>("#meu-painel");
    if (originContent) { originContent.inert = true; lockedContent.current.add(originContent); }
    flushSync(() => setCover({ phase:"cover", resume:Boolean(options.resume), reduced }));
    timers.current.push(setTimeout(() => { options.prepare?.(); if (window.location.pathname !== "/demo") router.push("/demo"); }, reduced ? 0 : 320));
    timers.current.push(setTimeout(() => { if (active.current) setCover(current => current ? { ...current, phase:"error" } : null); }, 10000));
  }, [router]);

  const ready = useCallback((element: HTMLElement) => {
    if (!active.current) return () => {};
    const token = operation.current;
    let disposed = false;
    const content = element.querySelector<HTMLElement>(".experience, .entry-stage, .resume");
    if (content) { content.inert = true; lockedContent.current.add(content); }
    const frame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    void (async () => {
      try {
        // Let SceneFrame's responsive sizing and picture selection settle first.
        await frame(); await frame();
        const image = element.querySelector<HTMLImageElement>(".scene-art img, .entry-art img");
        if (image) await decodeSceneImage(image);
        await frame(); await frame();
        if (disposed || token !== operation.current) return;
        const reduced = getMotionPreference() || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        timers.current.push(setTimeout(() => {
          if (disposed || token !== operation.current) return;
          setCover(current => current ? { ...current, phase:"reveal" } : null);
          timers.current.push(setTimeout(cancel, reduced ? 0 : 750));
        }, reduced ? 0 : Math.max(0, 1100 - (performance.now() - startedAt.current))));
      } catch {
        if (!disposed && token === operation.current) setCover(current => current ? { ...current, phase:"error" } : null);
      }
    })();
    return () => { disposed = true; if (content) { content.inert = false; lockedContent.current.delete(content); } };
  }, [cancel]);

  useEffect(() => {
    if (active.current && pathname !== "/demo" && pathname !== origin.current) queueMicrotask(cancel);
  }, [pathname, cancel]);
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  return <JourneyContext.Provider value={{ start, ready, cancel, pending:cover !== null, headerTone:cover && cover.phase !== "reveal" ? "immersive" : "paper", reducedMotion:cover?.reduced ?? false }}>{children}
    {cover && <section className="journey-transition" data-phase={cover.phase} data-reduced={cover.reduced} aria-label="Entrada na conversa" role="status" aria-live="polite">
      <div className="journey-transition-content"><small>História 01 · A cafeteria</small><h2>{cover.resume ? <>De volta<br />à conversa.</> : <>Sua vez<br />na história.</>}</h2><div className="journey-line" aria-hidden="true" />
        {cover.phase === "error" ? <><p>Não foi possível preparar a cena. Você pode tentar novamente.</p><a href="/demo">Tentar novamente</a><button type="button" onClick={cancel}>Voltar</button></> : <p>{cover.resume ? "Continuando de onde você parou." : "Um encontro. Uma resposta de cada vez."}</p>}
      </div>
    </section>}
  </JourneyContext.Provider>;
}
export const useJourneyTransition = () => useContext(JourneyContext);

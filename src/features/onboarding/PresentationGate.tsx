"use client";

import Link from "next/link";
import { Brand } from "@/components/ui/Brand";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Presentation } from "./Presentation";

type Status = { uid: string; completed: boolean };
export function parsePresentationStatus(value: unknown): Status {
  if (!value || typeof value !== "object" || !("uid" in value) || typeof value.uid !== "string" || !value.uid || !("completed" in value) || typeof value.completed !== "boolean") throw new Error("INVALID_PRESENTATION_STATUS");
  return { uid: value.uid, completed: value.completed };
}

export function PresentationGate({ children }: { children: (review: () => void) => ReactNode }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthenticated, setUnauthenticated] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState(false);
  const dashboard = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const saving = useRef(false);
  const returnScroll = useRef(0);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError(""); setUnauthenticated(false);
    try {
      const response = await fetch("/api/student/presentation", { credentials: "same-origin", cache: "no-store", signal });
      if (response.status === 401) { setUnauthenticated(true); throw new Error("SESSION_EXPIRED"); }
      if (!response.ok) throw new Error("PRESENTATION_UNAVAILABLE");
      const value = parsePresentationStatus(await response.json());
      if (!signal?.aborted) setStatus(value);
    } catch {
      if (!signal?.aborted) setError("Não foi possível carregar sua apresentação. Confira sua conexão e tente novamente.");
    } finally { if (!signal?.aborted) setLoading(false); }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  async function finish() {
    if (review) {
      setReview(false);
      requestAnimationFrame(() => {
        window.scrollTo({ top: returnScroll.current, behavior: "instant" });
        returnFocus.current?.focus({ preventScroll: true });
      });
      return;
    }
    if (!status || saving.current) return;
    saving.current = true; setBusy(true); setError("");
    try {
      const response = await fetch("/api/student/presentation", {
        method: "POST", credentials: "same-origin", cache: "no-store",
        headers: { "Content-Type": "application/json", "X-Presentation-Uid": status.uid },
        body: JSON.stringify({ completed: true }),
      });
      if (response.status === 401 || response.status === 409) { setUnauthenticated(true); throw new Error("SESSION_CHANGED"); }
      if (!response.ok) throw new Error("PRESENTATION_SAVE_FAILED");
      const saved = parsePresentationStatus(await response.json());
      if (saved.uid !== status.uid || !saved.completed) throw new Error("PRESENTATION_SAVE_UNCONFIRMED");
      setStatus(saved);
      requestAnimationFrame(() => dashboard.current?.querySelector<HTMLElement>("h1")?.focus());
    } catch {
      setError("Não foi possível confirmar o salvamento. Confira sua conexão e tente novamente.");
    } finally { saving.current = false; setBusy(false); }
  }

  if (unauthenticated) return <main className="presentation-state"><p>Sua sessão mudou. Entre novamente para abrir a apresentação da sua conta.</p><Link href="/comecar?modo=entrar">Entrar novamente</Link></main>;
  if (loading || !status) return <main className="presentation-state" aria-busy={loading}><Brand />{loading ? <p role="status">Preparando seu espaço…</p> : <><p role="alert">{error}</p><button type="button" onClick={() => void load()}>Tentar novamente</button><Link href="/comecar?modo=entrar">Voltar para a entrada</Link></>}</main>;
  if (!status.completed) return <Presentation busy={busy} error={error} onFinish={() => void finish()} />;
  return <><div ref={dashboard} hidden={review}>{children(() => { returnFocus.current = document.activeElement as HTMLElement | null; returnScroll.current = window.scrollY; setReview(true); })}</div>{review && <Presentation review onFinish={() => void finish()} />}</>;
}

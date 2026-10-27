"use client";

import { useEffect, useRef, useState } from "react";
import { studentWorkspace } from "@/features/dashboard/workspace-store";

const options = ["Gostei", "Mais ou menos", "Não gostei"] as const;
type Draft = { option: string; comment: string };
export function Feedback({ onFinish }: { runId: string; onFinish: () => void }) {
  const [draft, setDraft] = useState<Draft>({ option: "", comment: "" });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (sending || sent || (!draft.option && !draft.comment.trim())) return;
    setSending(true); setError("");
    try {
      await studentWorkspace.sendMessage("Avaliação da conversa da cafeteria", [draft.option, draft.comment.trim()].filter(Boolean).join("\n\n"));
      setSent(true); setNotice("Avaliação enviada ao professor. Você pode acompanhar a conversa no seu painel.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível enviar sua avaliação. Tente novamente."); }
    finally { setSending(false); }
  }
  return <form className="feedback-form" onSubmit={submit} aria-busy={sending}>
    <h2 ref={heading} tabIndex={-1}>Como foi a experiência para você?</h2>
    <p>Avaliar é opcional. Sua avaliação será enviada ao professor e ficará no seu painel.</p>
    <fieldset className="feedback-options" disabled={sending || sent}><legend>Sua impressão</legend>{options.map(option => <label key={option}>
      <input type="radio" name="feedback" checked={draft.option === option} onChange={() => setDraft({ ...draft, option })} /> {option}
    </label>)}</fieldset>
    <label className="comment-label" htmlFor="feedback-comment">O que funcionou bem ou poderia melhorar? <span>(opcional)</span></label>
    <textarea id="feedback-comment" disabled={sending || sent} value={draft.comment} maxLength={2000} rows={4} onChange={event => setDraft({ ...draft, comment: event.target.value })} />
    {error && <p role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}
    <div className="actions">{sent ? <button type="button" className="primary" onClick={onFinish}>Concluir</button> : <><button className="primary" disabled={sending || (!draft.option && !draft.comment.trim())} type="submit">{sending ? "Enviando…" : "Enviar avaliação"}</button><button type="button" disabled={sending} onClick={onFinish}>Terminar sem enviar</button></>}</div>
  </form>;
}

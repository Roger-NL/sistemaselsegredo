"use client";

import { useEffect, useRef, useState } from "react";
import { STORAGE_KEY } from "../session/storage";

const options = ["Gostei", "Mais ou menos", "Não gostei"] as const;
type Draft = { option: string; comment: string };
function readDraft(runId: string): Draft {
  try {
    const data = JSON.parse(localStorage.getItem(`${STORAGE_KEY}.feedback`) ?? "null");
    if (data?.runId === runId) return { option: options.includes(data.option) ? data.option : "", comment: typeof data.comment === "string" ? data.comment.slice(0, 2000) : "" };
  } catch { /* Memory-only is supported. */ }
  return { option: "", comment: "" };
}
export function Feedback({ runId, onFinish }: { runId: string; onFinish: () => void }) {
  const [draft, setDraft] = useState(() => readDraft(runId));
  const [notice, setNotice] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  function update(next: Draft) {
    setDraft(next);
    try { localStorage.setItem(`${STORAGE_KEY}.feedback`, JSON.stringify({ runId, ...next })); }
    catch { setNotice("O navegador não conseguiu guardar seu rascunho. Você pode continuar sem enviar."); }
  }
  return <form className="feedback-form" onSubmit={event => { event.preventDefault(); setNotice("O envio desta prévia ainda não foi ativado. Sua avaliação não foi enviada; o rascunho foi mantido para você tentar depois."); }}>
    <h2 ref={heading} tabIndex={-1}>Como foi a experiência para você?</h2>
    <p>Avaliar é opcional. Nesta prévia, a coleta remota está desativada.</p>
    <fieldset className="feedback-options"><legend>Sua impressão</legend>{options.map(option => <label key={option}>
      <input type="radio" name="feedback" checked={draft.option === option} onChange={() => update({ ...draft, option })} /> {option}
    </label>)}</fieldset>
    <label className="comment-label" htmlFor="feedback-comment">O que funcionou bem ou poderia melhorar? <span>(opcional)</span></label>
    <textarea id="feedback-comment" value={draft.comment} maxLength={2000} rows={4} onChange={event => update({ ...draft, comment: event.target.value })} />
    {notice && <p role="status">{notice}</p>}
    <div className="actions"><button className="primary" disabled={!draft.option && !draft.comment.trim()} type="submit">Enviar avaliação</button><button type="button" onClick={onFinish}>Terminar sem enviar</button></div>
  </form>;
}

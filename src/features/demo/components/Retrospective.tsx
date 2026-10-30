"use client";

import { useEffect, useRef, useState } from "react";
import { audio } from "../content/media";
import { ConversationHistory } from "./ConversationHistory";
import { ending, retrospective } from "../model/retrospective";
import type { DemoState, ReviewView } from "../model/types";
import { Feedback } from "./Feedback";
import { AudioButton } from "./AudioButton";
import { ConversationReplay } from "./ConversationReplay";
import "./conversation-replay.css";
import Link from "next/link";

function StudyInvitation() {
  return <aside className="study-invitation"><p>O inglês por trás da conversa</p><h2>Agora, entenda as peças.</h2><p>Explore as palavras e as estruturas da cafeteria, com explicações simples e pequenas práticas.</p><Link className="primary button-link" href="/demo/estudo">Entender minha conversa →</Link></aside>;
}

export function Retrospective({ state, setView, replaying, onReplayChange }: { state: DemoState; setView: (view: ReviewView) => void; replaying: boolean; onReplayChange: (open: boolean) => void }) {
  const view = state.reviewView;
  const [moment, setMoment] = useState(0);
  const section = useRef<HTMLElement>(null);
  useEffect(() => { section.current?.querySelector("h1")?.focus({ preventScroll: true }); }, [view, replaying]);
  const highlights = retrospective(state);
  const hasResponses = state.transcript.some(line => line.role === "you");
  const replayButton = state.transcript.length > 0 ? <button className="primary replay-start" onClick={() => onReplayChange(true)}>Rever cenas e áudios</button> : null;
  if (replaying) return <ConversationReplay state={state} onClose={() => onReplayChange(false)} />;
  if (view === "done") return <section ref={section} className="ending"><p className="eyebrow">Até a próxima conversa</p><h1 tabIndex={-1}>Obrigado por experimentar<br />o BasedSpeak.</h1><p>Sua conversa continua disponível na sua conta.</p><StudyInvitation /><div className="replay-entry-actions">{replayButton}<button onClick={() => setView("moments")}>Ver resumo da conversa</button></div></section>;
  if (view === "feedback") return <Feedback runId={state.runId} onFinish={() => setView("done")} />;
  if (view === "thanks") return <section ref={section} className="ending"><p className="eyebrow">Fim do percurso</p><h1 tabIndex={-1}>Obrigado por experimentar<br />o BasedSpeak.</h1><StudyInvitation /><div className="replay-entry-actions">{replayButton}</div><p>Se quiser, conte como foi para você.</p><div className="actions"><button onClick={() => setView("feedback")}>Avaliar a experiência</button><button onClick={() => setView("done")}>Terminar sem avaliar</button></div></section>;
  if (view === "end") return <section ref={section} className="ending"><p className="eyebrow">Um encontro, do começo ao fim</p><h1 tabIndex={-1}>{hasResponses ? <>Você participou desta<br />conversa em inglês.</> : <>Você chegou ao fim<br />deste percurso.</>}</h1><p className="lead">{hasResponses ? ending(state) : "Esta tentativa não tem respostas suas registradas. Você pode rever o histórico ou voltar para participar das atividades."}</p><div className="replay-entry-actions">{replayButton}<button onClick={() => setView("moments")}>Ver resumo da conversa</button></div></section>;
  const item = highlights[Math.min(moment, highlights.length - 1)];
  return <section ref={section} className="review-stage"><div className="review-reading"><p className="eyebrow">Sua conversa</p><h1 tabIndex={-1}>O caminho que você fez.</h1>
    {item && <article className="moment-card">
      <small>{item.beforeRole === "you" ? item.beforeEvidenceKind === "supported" ? "Você disse com apoio" : "Você disse" : "Você encontrou na conversa"}</small><p lang="en">{item.beforeWritten ?? audio[item.before].text}</p>
      <small>{item.afterEvidenceKind === "supported" ? "Você disse com apoio" : "Você disse"}</small><p lang="en">{item.afterWritten ?? audio[item.after].text}</p><p>{item.description}</p><AudioButton key={moment} audio={item.after}>{item.afterWritten === undefined ? "Ouvir trecho" : "Ouvir modelo"}</AudioButton>
    </article>}
    {highlights.length ? <nav className="pager" aria-label="Percorrer momentos"><button disabled={moment === 0} onClick={() => setMoment(moment - 1)}>← Anterior</button><span role="status">Momento {moment + 1} de {highlights.length}</span><button disabled={moment >= highlights.length - 1} onClick={() => setMoment(moment + 1)}>Próximo →</button></nav>
      : <p className="muted">{hasResponses ? "Ainda não há pares de expressões para destacar. Você pode rever suas respostas no histórico." : "Esta tentativa não tem respostas suas registradas. O histórico conserva as falas presentes no percurso."}</p>}
    <p className="practice-summary">{[
      ["written", "resposta escrita", "respostas escritas"], ["recognized", "expressão escolhida", "expressões escolhidas"], ["blocks", "montagem", "montagens"], ["recombined", "adaptação", "adaptações"], ["supported", "resposta com apoio", "respostas com apoio"],
    ].map(([kind, singular, plural]) => { const count = state.evidence.filter(e => e.kind === kind).length; return count ? `${count} ${count === 1 ? singular : plural}` : null; }).filter(Boolean).join(" · ")}</p>
    <p className="muted">Esta conversa não comprova domínio ou memorização.</p></div>
    <div className="review-actions">{replayButton}<ConversationHistory state={state} lines={state.transcript} label="Ver histórico em texto" fromStart /><button onClick={() => setView("thanks")}>Concluir demo</button></div>
  </section>;
}

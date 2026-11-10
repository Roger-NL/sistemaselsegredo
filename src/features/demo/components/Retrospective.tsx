"use client";
import { SpeakerLabel } from "./SpeakerLabel";
import { InterfaceIcon } from "@/components/ui/InterfaceIcon";

import { BrowserText } from "@/components/i18n/BrowserText";
import { AutoFit } from "@/components/core/AutoFit";


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
  return <aside className="study-invitation"><p>O inglês por trás da conversa</p><h2>Agora, entenda as peças.</h2><p>Explore as palavras e as estruturas da cafeteria, com explicações simples e pequenas práticas.</p><Link className="primary button-link" href="/demo/estudo">Entender minha conversa <InterfaceIcon name="arrow-right" /></Link></aside>;
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
  if (view === "done") return <section ref={section} className="ending"><AutoFit className="ending-reading"><p className="eyebrow">Até a próxima conversa</p><h1 tabIndex={-1}>Obrigado por experimentar<br />o BasedSpeak.</h1><p>Sua conversa continua disponível para você.</p><StudyInvitation /></AutoFit><div className="replay-entry-actions">{replayButton}<button onClick={() => setView("moments")}>Ver resumo da conversa</button></div></section>;
  if (view === "feedback") return <Feedback runId={state.runId} onFinish={() => setView("done")} />;
  if (view === "thanks") return <section ref={section} className="ending"><AutoFit className="ending-reading"><p className="eyebrow">Fim do percurso</p><h1 tabIndex={-1}>Obrigado por experimentar<br />o BasedSpeak.</h1><StudyInvitation /></AutoFit><div className="replay-entry-actions">{replayButton}</div><p>Se quiser, conte como foi para você.</p><div className="actions"><button onClick={() => setView("feedback")}>Avaliar a experiência</button><button onClick={() => setView("done")}>Terminar sem avaliar</button></div></section>;
  if (view === "end") return <section ref={section} className="ending"><AutoFit className="ending-reading"><p className="eyebrow">Um encontro, do começo ao fim</p><h1 tabIndex={-1}>{hasResponses ? <><BrowserText>Você participou desta</BrowserText><br /><BrowserText>conversa em inglês.</BrowserText></> : <><BrowserText>Você chegou ao fim</BrowserText><br /><BrowserText>deste percurso.</BrowserText></>}</h1><p className="lead">{hasResponses ? <BrowserText>{ending(state)}</BrowserText> : <BrowserText>{"Esta tentativa não tem respostas suas registradas. Você pode rever o histórico ou voltar para participar das atividades."}</BrowserText>}</p></AutoFit><div className="replay-entry-actions">{replayButton}<button onClick={() => setView("moments")}>Ver resumo da conversa</button></div></section>;
  const item = highlights[Math.min(moment, highlights.length - 1)];
  return <section ref={section} className="review-stage"><AutoFit className="review-reading"><p className="eyebrow">Sua conversa</p><h1 tabIndex={-1}>O caminho que você fez.</h1>
    {item && <article className="moment-card"><SpeakerLabel role={item.beforeRole} />
      <small>{item.beforeRole === "you" ? item.beforeEvidenceKind === "supported" ? <BrowserText>{"Você disse com apoio"}</BrowserText> : <BrowserText>{"Você disse"}</BrowserText> : <BrowserText>{"Lucas disse"}</BrowserText>}</small><p lang="en">{item.beforeWritten ?? <BrowserText>{audio[item.before].text}</BrowserText>}</p>
      <SpeakerLabel role="you" model /><small>{item.afterEvidenceKind === "supported" ? <BrowserText>{"Você disse com apoio"}</BrowserText> : <BrowserText>{"Você disse"}</BrowserText>}</small><p lang="en">{item.afterWritten ?? <BrowserText>{audio[item.after].text}</BrowserText>}</p><p><BrowserText>{item.description}</BrowserText></p><AudioButton key={moment} audio={item.after}>{item.afterWritten === undefined ? <BrowserText>{"Ouvir trecho"}</BrowserText> : <BrowserText>{"Ouvir modelo"}</BrowserText>}</AudioButton>
    </article>}
    {highlights.length ? <nav className="pager" aria-label="Percorrer momentos"><button disabled={moment === 0} onClick={() => setMoment(moment - 1)}><InterfaceIcon name="arrow-left" /> Anterior</button><span role="status"><BrowserText>Momento </BrowserText>{<BrowserText>{moment + 1}</BrowserText>} <BrowserText>de </BrowserText><BrowserText>{highlights.length}</BrowserText></span><button disabled={moment >= highlights.length - 1} onClick={() => setMoment(moment + 1)}>Próximo <InterfaceIcon name="arrow-right" /></button></nav>
      : <p className="muted">{hasResponses ? <BrowserText>{"Ainda não há pares de expressões para destacar. Você pode rever suas respostas no histórico."}</BrowserText> : <BrowserText>{"Esta tentativa não tem respostas suas registradas. O histórico conserva as falas presentes no percurso."}</BrowserText>}</p>}
    <p className="practice-summary"><BrowserText>{[
      ["written", "resposta escrita", "respostas escritas"], ["recognized", "expressão escolhida", "expressões escolhidas"], ["blocks", "montagem", "montagens"], ["recombined", "adaptação", "adaptações"], ["supported", "resposta com apoio", "respostas com apoio"],
    ].map(([kind, singular, plural]) => { const count = state.evidence.filter(e => e.kind === kind).length; return count ? `${count} ${count === 1 ? singular : plural}` : null; }).filter(Boolean).join(" · ")}</BrowserText></p>
    <p className="muted">Esta conversa não comprova domínio ou memorização.</p></AutoFit>
    <div className="review-actions">{replayButton}<ConversationHistory state={state} lines={state.transcript} label="Ver histórico em texto" fromStart /><button onClick={() => setView("thanks")}>Concluir demo</button></div>
  </section>;
}

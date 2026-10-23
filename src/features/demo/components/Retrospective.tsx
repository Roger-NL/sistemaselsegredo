"use client";

import { useState } from "react";
import { audio } from "../content/media";
import { conversation } from "../model/history";
import { ending, retrospective } from "../model/retrospective";
import type { AudioId, DemoState, ReviewView } from "../model/types";
import { Feedback } from "./Feedback";

export function Retrospective({ state, onReplay, setView }: { state: DemoState; onReplay: (id: AudioId) => void; setView: (view: ReviewView) => void }) {
  const view = state.reviewView;
  const [all, setAll] = useState(false);
  const highlights = retrospective(state);
  if (view === "done") return <section className="ending"><p className="eyebrow">Até a próxima conversa</p><h1>Obrigado por experimentar<br />o BasedSpeak.</h1><p>Sua conversa continua disponível neste dispositivo.</p><button onClick={() => setView("moments")}>Rever minha conversa</button></section>;
  if (view === "feedback") return <Feedback runId={state.runId} onFinish={() => setView("done")} />;
  if (view === "thanks") return <section className="ending"><p className="eyebrow">Demo concluída</p><h1>Obrigado por experimentar<br />o BasedSpeak.</h1><p>Se quiser, conte como foi para você.</p><div className="actions"><button className="primary" onClick={() => setView("feedback")}>Avaliar a experiência</button><button onClick={() => setView("done")}>Terminar sem avaliar</button></div></section>;
  if (view === "end") return <section className="ending"><p className="eyebrow">Um encontro, do começo ao fim</p><h1>Você participou desta<br />conversa em inglês.</h1><p className="lead">{ending(state)}</p><button className="primary" onClick={() => setView("moments")}>Ver minha conversa</button></section>;
  return <section><p className="eyebrow">Sua conversa</p><h1>Veja o caminho que você fez.</h1><p>Você usou inglês para responder, expressar preferências, avisar alguém e decidir como terminar o encontro.</p>
    <div className="highlights">{highlights.slice(0, all ? undefined : 3).map(item => <article key={item.after}>
      <small>{item.beforeRole === "you" ? "Você disse" : "Você encontrou na conversa"}</small><p lang="en">{audio[item.before].text}</p><span aria-hidden>↓</span><small>Você disse</small><p lang="en">{audio[item.after].text}</p><p>{item.description}</p><button onClick={() => onReplay(item.after)}>Ouvir trecho</button>
    </article>)}</div>
    {highlights.length > 3 && !all && <button onClick={() => setAll(true)}>Ver mais momentos</button>}
    <details className="transcript"><summary>Ver conversa completa</summary><ol>{conversation(state).map(line => <li key={line.id} className={line.role === "you" ? "your-line" : ""}>
      <small>{line.role === "you" ? "Você" : "Personagem"} · Parte {line.part}</small><p lang="en">{line.text}</p><p className="muted">{line.meaning}</p><button onClick={() => onReplay(line.audioId)}>Ouvir</button>
    </li>)}</ol></details>
    <p className="muted">Você construiu respostas com blocos, recombinou peças disponíveis e usou expressões com apoio. Esta conversa não é uma prova de domínio ou de memorização.</p>
    <button className="primary" onClick={() => setView("thanks")}>Concluir demo</button>
  </section>;
}

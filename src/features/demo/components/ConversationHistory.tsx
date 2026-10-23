import { audio } from "../content/media";
import type { DemoState, TranscriptLine } from "../model/types";

export function ConversationHistory({ state, lines, onReplay }: {
  state: DemoState; lines: TranscriptLine[]; onReplay: (id: TranscriptLine["audioId"]) => void;
}) {
  if (!lines.length) return null;
  return <details className="conversation-history" open={state.phase !== "recall"}>
    <summary>Conversa até aqui{state.phase === "recall" ? " · consultar com apoio" : ""}</summary>
    <ol aria-label="Falas anteriores desta conversa">{lines.map(line => <li key={line.id} className={line.role === "you" ? "history-you" : "history-character"}>
      <small>{line.role === "you" ? "Você" : "Personagem"} · Parte {line.part}</small>
      <p lang="en">{audio[line.audioId].text}</p>
      <div className="history-tools"><button className="text-button" onClick={() => onReplay(line.audioId)}>Ouvir</button>
        {!(line.audioId === "C01" && state.nodeId === "p2.question") && <details><summary>Ver significado</summary><p>{audio[line.audioId].meaning}</p></details>}
      </div>
    </li>)}</ol>
  </details>;
}

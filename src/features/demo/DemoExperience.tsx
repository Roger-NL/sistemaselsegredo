"use client";

import Image from "next/image";
import { useEffect, useReducer, useRef } from "react";
import { catalog } from "./content/catalog";
import { audio, images } from "./content/media";
import { profiles } from "./content/copy.pt-BR";
import { transition } from "./model/reducer";
import { expressionHistory } from "./model/history";
import { remember } from "./session/browser";
import { DemoAudioPlayer } from "./audio/player";
import { Retrospective } from "./components/Retrospective";
import type { AudioId, DemoEvent, DemoState } from "./model/types";

export function DemoExperience({ initial }: { initial: DemoState }) {
  const [state, dispatch] = useReducer(transition, initial);
  const node = catalog[state.nodeId];
  const image = images[node.image];
  const heading = useRef<HTMLHeadingElement>(null);
  const audioNotice = useRef<HTMLParagraphElement>(null);
  const storageNotice = useRef<HTMLParagraphElement>(null);
  const player = useRef<DemoAudioPlayer | null>(null);
  const event = (type: DemoEvent["type"]) => dispatch({ at: node.id, type } as DemoEvent);
  useEffect(() => {
    if (!remember(state) && storageNotice.current) storageNotice.current.textContent = "O navegador não está guardando esta tentativa. Você pode concluir, mas sair desta página pode perder a retomada.";
  }, [state]);
  useEffect(() => {
    heading.current?.focus();
    return () => { player.current?.cancel(); };
  }, [state.nodeId, state.phase]);
  async function replay(id: AudioId) {
    if (!audio[id].ready) {
      if (audioNotice.current) audioNotice.current.textContent = "Este áudio ainda está em produção. O texto e a conversa continuam disponíveis.";
      return;
    }
    player.current ??= new DemoAudioPlayer();
    const ok = await player.current.play(audio[id].path);
    if (audioNotice.current) audioNotice.current.textContent = ok ? "" : "Não foi possível tocar o áudio. Você pode continuar pelo texto ou tentar ouvir novamente.";
  }
  const response = node.kind === "response" ? audio[node.response] : null;
  const helpLevel = state.help[node.id] ?? 0;
  const previous = [...state.transcript].reverse().find(line => line.role === "you");
  const previousNode = previous ? catalog[previous.nodeId] : null;
  const justSent = previousNode && "next" in previousNode && previousNode.next === node.id ? previous : null;
  const modelVisible = state.phase === "present" || state.phase === "ready" || (node.kind === "response" && helpLevel === node.help.length);
  return <div className="experience">
    <div className="experience-bar"><span>Parte {node.part} de 10</span><progress max={10} value={node.part} aria-label="Parte da conversa" /><details className="support-control"><summary>Ajustar apoio</summary><fieldset><legend>Como prefere continuar?</legend>{profiles.map(profile => <label key={profile.id}><input type="radio" name="change-support" checked={state.profile === profile.id} onChange={() => dispatch({ at: node.id, type: "PROFILE", profile: profile.id })} /> {profile.label}</label>)}</fieldset></details></div>
    <p ref={storageNotice} className="notice" role="status" />
    <p ref={audioNotice} className="notice" role="status" />
    {node.kind === "end" ? <Retrospective state={state} onReplay={replay} setView={view => dispatch({ at: node.id, type: "REVIEW", view })} /> : <div className="scene-grid">
      <aside className="scene-column"><figure className="scene-art"><Image width={1536} height={1024} sizes="(max-width: 760px) 100vw, 45vw" src={image.ready ? image.path : image.preview} alt={image.description} /><figcaption>{image.description}<span>Ilustração conceitual · arte final em produção</span></figcaption></figure>
        <details className="order" open={node.image === "V02" || node.image === "V05"}><summary>Seu pedido · #24</summary><p lang="en">Your order · #24 · Iced coffee</p>{node.image === "V02" && <p>Copo apresentado: <strong>SARAH / #18</strong></p>}{node.image === "V05" && <p>Pedido que acaba de chegar: <strong>#24</strong></p>}</details>
      </aside>
      <section className="conversation-panel">
        <p className="eyebrow">Um encontro na cafeteria</p><h1 ref={heading} tabIndex={-1}>{node.kind === "choice" ? node.prompt : node.kind === "comprehension" ? "O que ela está perguntando?" : node.id === "p6.safe" ? "Ela segura o copo a tempo." : node.id === "p2.send" ? "Agora responda à personagem." : "A conversa continua."}</h1>
        {node.id === "p10.contact" && state.decisions["p9.pause"] === "stay" && <p>Depois de mais alguns minutos, chega a hora de se despedir.</p>}
        <p className="context">{node.context}</p>
        {justSent && <article className="speech sent"><small>Você · fala enviada</small><p lang="en">{audio[justSent.audioId].text}</p><button className="text-button" onClick={() => replay(justSent.audioId)}>Ouvir resposta</button></article>}
        {(node.heard ?? (node.kind === "comprehension" ? ["C01" as AudioId] : [])).map(id => <article className="speech" key={id}><small>Personagem</small><p lang="en">{audio[id].text}</p>{state.profile === "beginner" && node.part > 2 && <p className="meaning">{audio[id].meaning}</p>}<button className="text-button" onClick={() => replay(id)}>Ouvir fala</button></article>)}
        {node.kind === "scene" && ["p2.model", "p2.meaning"].includes(node.id) && <article className="expression"><small>Expressão apresentada · ainda não enviada</small><p lang="en">{audio.U01.text}</p><p>{audio.U01.meaning}</p><button onClick={() => replay("U01")}>Ouvir</button></article>}
        {node.kind === "scene" && <button className="primary" onClick={() => event("NEXT")}>{node.button}</button>}
        {node.kind === "comprehension" && <div className="choices"><button onClick={() => dispatch({ at: node.id, type: "UNDERSTAND", correct: true })}>Esse café é seu?</button><button onClick={() => dispatch({ at: node.id, type: "UNDERSTAND", correct: false })}>Você quer um café?</button></div>}
        {node.kind === "choice" && <div className="choices">{node.choices.map(choice => <button key={choice.id} onClick={() => dispatch({ at: node.id, type: "CHOOSE", choice: choice.id })}>{choice.label}<span aria-hidden>↗</span></button>)}</div>}
        {node.kind === "response" && response && <>
          {state.phase === "recall" && <div className="recall"><p>{expressionHistory(state, node.response) === "used" ? "Você já usou uma expressão para isso. Tente lembrar antes de conferir." : "Você encontrou uma expressão para isso na conversa. Tente lembrar antes de conferir."}</p><button className="primary" onClick={() => event("CHECK")}>Conferir a expressão</button></div>}
          {modelVisible && <article className="expression"><small>Expressão apresentada · ainda não enviada</small><p lang="en">{response.text}</p>{(state.profile !== "less" || node.id === "p6.warn" || helpLevel > 0) && <p>{response.meaning}</p>}<button onClick={() => replay(node.response)}>Ouvir</button></article>}
          {state.phase === "present" && <button className="primary" onClick={() => event("PREPARE")}>Preparar resposta</button>}
          {state.phase === "build" && <div className="construction">
            {node.skeleton && <p className="skeleton" lang="en">{node.skeleton}</p>}
            <p>{node.mode === "recombine" ? "Complete com a peça disponível." : "Monte a resposta, selecionando os blocos na ordem."}</p>
            <div className="answer" aria-label="Sua resposta"><ol>{state.selected.map((id, index) => <li key={id}><button onClick={() => dispatch({ at: node.id, type: "REMOVE_BLOCK", index })} aria-label={`Retirar ${node.blocks?.find(b => b.id === id)?.text}`}><span lang="en">{node.blocks?.find(b => b.id === id)?.text}</span> <span aria-hidden>×</span></button></li>)}</ol>{!state.selected.length && <span className="muted">Sua resposta aparece aqui</span>}</div>
            <div className="blocks" aria-label="Blocos disponíveis">{node.blocks?.map(block => <button lang="en" key={block.id} disabled={state.selected.includes(block.id)} onClick={() => dispatch({ at: node.id, type: "BLOCK", block: block.id })}>{block.text}</button>)}</div>
            <div className="actions"><button className="primary" onClick={() => event("SUBMIT")}>Responder</button><button disabled={!state.selected.length} onClick={() => event("CLEAR")}>Limpar montagem</button></div>
          </div>}
          {state.phase === "ready" && <button className="primary" onClick={() => event("SUBMIT")}>{node.button ?? "Responder"}</button>}
        </>}
        <p role="status" className="notice">{state.notice}</p>
        {!!node.help.length && <aside className="help"><button onClick={() => event("HELP")} disabled={helpLevel === node.help.length}>{helpLevel === 0 ? "Preciso de ajuda" : helpLevel < node.help.length ? "Mais uma pista" : "Ajuda aberta"}</button>
          {node.help.slice(0, helpLevel).map((text, index) => <p key={index}>{text}</p>)}
          {node.kind === "response" && state.phase === "build" && helpLevel === node.help.length && <div className="actions"><button onClick={() => event("USE_SUPPORT")}>Usar com apoio</button><span className="muted">Ou continue com sua montagem.</span></div>}
        </aside>}
      </section>
    </div>}
  </div>;
}

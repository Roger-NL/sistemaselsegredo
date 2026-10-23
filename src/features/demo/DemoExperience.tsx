"use client";

import Image from "next/image";
import { useEffect, useReducer, useRef, useState } from "react";
import { catalog } from "./content/catalog";
import { audio, images } from "./content/media";
import { profiles } from "./content/copy.pt-BR";
import { transition } from "./model/reducer";
import { expressionHistory } from "./model/history";
import { remember } from "./session/browser";
import { DemoAudioPlayer } from "./audio/player";
import { Retrospective } from "./components/Retrospective";
import { requestCatalogAudio } from "./services/audio-client";
import { ConversationHistory } from "./components/ConversationHistory";
import type { AudioId, DemoEvent, DemoState } from "./model/types";

export function DemoExperience({ initial }: { initial: DemoState }) {
  const [state, dispatch] = useReducer(transition, initial);
  const node = catalog[state.nodeId];
  const image = images[node.image];
  const heading = useRef<HTMLHeadingElement>(null);
  const audioNotice = useRef<HTMLParagraphElement>(null);
  const storageNotice = useRef<HTMLParagraphElement>(null);
  const player = useRef<DemoAudioPlayer | null>(null);
  const supportMenu = useRef<HTMLDetailsElement>(null);
  const [draftProfile, setDraftProfile] = useState(initial.profile);
  const pendingAudio = useRef<AbortController | null>(null);
  const audioOperation = useRef({ version: 0, rate: 1 });
  const [playbackRate, setPlaybackRate] = useState(1);
  const event = (type: DemoEvent["type"]) => dispatch({ at: node.id, type } as DemoEvent);
  useEffect(() => {
    if (!remember(state) && storageNotice.current) storageNotice.current.textContent = "O navegador não está guardando esta tentativa. Você pode concluir, mas sair desta página pode perder a retomada.";
  }, [state]);
  useEffect(() => {
    heading.current?.focus();
    const operation = audioOperation.current;
    const notice = audioNotice.current;
    return () => {
      operation.version++;
      pendingAudio.current?.abort();
      player.current?.cancel();
      if (notice) notice.textContent = "";
    };
  }, [state.nodeId, state.phase, state.reviewView]);
  async function replay(id: AudioId) {
    const version = ++audioOperation.current.version;
    pendingAudio.current?.abort();
    player.current?.cancel();
    const controller = new AbortController(); pendingAudio.current = controller;
    if (audioNotice.current) audioNotice.current.textContent = "Preparando o áudio… Você pode continuar pelo texto.";
    try {
      const url = await requestCatalogAudio(id, controller.signal);
      if (version !== audioOperation.current.version) return;
      pendingAudio.current = null;
      player.current ??= new DemoAudioPlayer();
      player.current.setPlaybackRate(audioOperation.current.rate);
      if (audioNotice.current) audioNotice.current.textContent = "Reproduzindo áudio.";
      const ok = await player.current.playSequence([url]);
      if (version === audioOperation.current.version && audioNotice.current) audioNotice.current.textContent = ok ? "" : "Não foi possível tocar o áudio. Você pode continuar pelo texto ou tentar ouvir novamente.";
    } catch {
      if (version === audioOperation.current.version && !controller.signal.aborted && audioNotice.current) audioNotice.current.textContent = "O áudio está indisponível agora. O texto e sua conversa continuam disponíveis.";
    }
  }
  const response = node.kind === "response" ? audio[node.response] : null;
  const helpLevel = state.help[node.id] ?? 0;
  const previous = [...state.transcript].reverse().find(line => line.role === "you");
  const previousNode = previous ? catalog[previous.nodeId] : null;
  const justSent = previousNode && "next" in previousNode && previousNode.next === node.id ? previous : null;
  const history = state.transcript.filter(line => line.id !== justSent?.id && line.nodeId !== node.id
    && !(node.kind === "comprehension" && line.audioId === "C01"));
  const modelVisible = state.phase === "present" || state.phase === "ready" || (node.kind === "response" && helpLevel === node.help.length && !state.modelHidden);
  return <div className="experience">
    <div className="experience-bar"><span>Parte {node.part} de 10</span><progress max={10} value={node.part} aria-label="Parte da conversa" /><details ref={supportMenu} className="support-control"><summary>Ajustar apoio</summary><fieldset><legend>Como prefere continuar?</legend>{profiles.map(profile => <label key={profile.id}><input type="radio" name="change-support" checked={draftProfile === profile.id} onChange={() => setDraftProfile(profile.id)} /> {profile.label}</label>)}<div className="actions"><button onClick={() => { dispatch({ at: node.id, type: "PROFILE", profile: draftProfile }); if (supportMenu.current) supportMenu.current.open = false; }}>Aplicar</button><button onClick={() => { setDraftProfile(state.profile); if (supportMenu.current) supportMenu.current.open = false; }}>Voltar sem alterar</button></div></fieldset></details></div>
    <p ref={storageNotice} className="notice" role="status" />
    <p ref={audioNotice} className="notice" role="status" />
    <div className="audio-controls" aria-label="Controles de áudio">
      <label>Velocidade <select aria-label="Velocidade de reprodução" value={playbackRate} onChange={event => { const rate = Number(event.target.value); setPlaybackRate(rate); audioOperation.current.rate = rate; player.current?.setPlaybackRate(rate); }}><option value={1}>Padrão</option><option value={0.9}>Mais lenta</option></select></label>
      <button className="text-button" onClick={() => { if (pendingAudio.current) { audioOperation.current.version++; pendingAudio.current.abort(); pendingAudio.current = null; } player.current?.pause(); if (audioNotice.current) audioNotice.current.textContent = "Áudio pausado."; }}>Pausar áudio</button>
      <button className="text-button" onClick={async () => { const version = audioOperation.current.version; const ok = await player.current?.resume(); if (version !== audioOperation.current.version) return; if (audioNotice.current) audioNotice.current.textContent = ok ? "Reproduzindo áudio." : "Selecione Ouvir junto de uma fala para começar."; }}>Continuar áudio</button>
      <button className="text-button" onClick={() => { audioOperation.current.version++; pendingAudio.current?.abort(); player.current?.cancel(); if (audioNotice.current) audioNotice.current.textContent = ""; }}>Parar áudio</button>
    </div>
    {node.kind === "end" ? <Retrospective state={state} onReplay={replay} setView={view => dispatch({ at: node.id, type: "REVIEW", view })} /> : <div className="scene-grid">
      <aside className="scene-column"><figure className="scene-art"><Image width={1536} height={1024} sizes="(max-width: 760px) 100vw, 45vw" src={image.ready ? image.path : image.preview} alt={image.description} /><figcaption>{image.description}<span>Ilustração conceitual · arte final em produção</span></figcaption></figure>
        <details className="order" open={node.image === "V02" || node.image === "V05"}><summary>Seu pedido · #24</summary><p lang="en">Your order · #24 · Iced coffee</p>{node.image === "V02" && <p>Copo apresentado: <strong>SARAH / #18</strong></p>}{node.image === "V05" && <p>Pedido que acaba de chegar: <strong>#24</strong></p>}</details>
      </aside>
      <section className="conversation-panel">
        <ConversationHistory key={`${node.id}:${state.phase}`} state={state} lines={history} onReplay={replay} />
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
          {node.help.slice(0, helpLevel).filter((_, index) => !state.modelHidden || index < node.help.length - 1).map((text, index) => <p key={index}>{text}</p>)}
          {node.kind === "response" && state.phase === "build" && helpLevel === node.help.length && <div className="actions"><button onClick={() => event("TOGGLE_MODEL")}>{state.modelHidden ? "Consultar o modelo" : "Tentar sem o modelo"}</button><button onClick={() => event("USE_SUPPORT")}>Usar com apoio</button></div>}
        </aside>}
      </section>
    </div>}
  </div>;
}

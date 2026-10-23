"use client";

import Image from "next/image";
import { useEffect, useReducer, useRef, useState } from "react";
import { catalog } from "./content/catalog";
import { audio, images } from "./content/media";
import { profiles } from "./content/copy.pt-BR";
import { practice, recognitionOptions } from "./model/practice";
import { transition } from "./model/reducer";
import { expressionHistory } from "./model/history";
import { remember } from "./session/browser";
import { DemoAudioPlayer } from "./audio/player";
import { Retrospective } from "./components/Retrospective";
import { requestCatalogAudio } from "./services/audio-client";
import { HelpPanel } from "./components/HelpPanel";
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
    heading.current?.focus({ preventScroll: true });
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
  const exercise = node.kind === "response" ? practice(node, state.assistedBlocks ? "some" : state.activityProfile) : null;
  const response = node.kind === "response" ? audio[node.response] : null;
  const helpLevel = state.help[node.id] ?? 0;
  const previous = [...state.transcript].reverse().find(line => line.role === "you");
  const previousNode = previous ? catalog[previous.nodeId] : null;
  const justSent = previousNode && "next" in previousNode && previousNode.next === node.id ? previous : null;
  const history = state.transcript.filter(line => line.id !== justSent?.id && line.nodeId !== node.id
    && !(node.kind === "comprehension" && line.audioId === "C01"));
  const modelVisible = state.phase === "present" || state.phase === "ready";
  return <div className="experience">
    <div className="experience-bar"><span>Parte {node.part} de 10</span><progress max={10} value={node.part} aria-label="Parte da conversa" /><details ref={supportMenu} className="support-control"><summary>Ajustar apoio</summary><fieldset><legend>Como prefere continuar?</legend>{profiles.map(profile => <label key={profile.id}><input type="radio" name="change-support" checked={draftProfile === profile.id} onChange={() => setDraftProfile(profile.id)} /> {profile.label}</label>)}<div className="actions"><button onClick={() => { dispatch({ at: node.id, type: "PROFILE", profile: draftProfile }); if (supportMenu.current) supportMenu.current.open = false; }}>Aplicar</button><button onClick={() => { setDraftProfile(state.profile); if (supportMenu.current) supportMenu.current.open = false; }}>Voltar sem alterar</button></div></fieldset></details></div>
    <div className="session-notices"><p ref={storageNotice} className="notice" role="status" />
    <p ref={audioNotice} className="notice" role="status" /></div>
    <div className="audio-controls" aria-label="Controles de áudio">
      <label>Velocidade <select aria-label="Velocidade de reprodução" value={playbackRate} onChange={event => { const rate = Number(event.target.value); setPlaybackRate(rate); audioOperation.current.rate = rate; player.current?.setPlaybackRate(rate); }}><option value={1}>Padrão</option><option value={0.9}>Mais lenta</option></select></label>
      <button className="text-button" onClick={() => { if (pendingAudio.current) { audioOperation.current.version++; pendingAudio.current.abort(); pendingAudio.current = null; } player.current?.pause(); if (audioNotice.current) audioNotice.current.textContent = "Áudio pausado."; }} aria-label="Pausar áudio">Pausar<span className="audio-label"> áudio</span></button>
      <button className="text-button" onClick={async () => { const version = audioOperation.current.version; const ok = await player.current?.resume(); if (version !== audioOperation.current.version) return; if (audioNotice.current) audioNotice.current.textContent = ok ? "Reproduzindo áudio." : "Selecione Ouvir junto de uma fala para começar."; }} aria-label="Continuar áudio">Continuar<span className="audio-label"> áudio</span></button>
      <button className="text-button" onClick={() => { audioOperation.current.version++; pendingAudio.current?.abort(); player.current?.cancel(); if (audioNotice.current) audioNotice.current.textContent = ""; }} aria-label="Parar áudio">Parar<span className="audio-label"> áudio</span></button>
    </div>
    {node.kind === "end" ? <Retrospective state={state} onReplay={replay} setView={view => dispatch({ at: node.id, type: "REVIEW", view })} /> : <div className="scene-grid">
      <aside className="scene-column"><figure className="scene-art"><picture><source media="(max-width: 760px)" srcSet={image.mobile} /><Image unoptimized width={960} height={640} src={image.path} alt={image.description} /></picture><figcaption>{image.description}</figcaption></figure>
        <details className="order" open={node.image === "V02" || node.image === "V04"}><summary>Seu pedido · BASEDSPEAK · Iced coffee</summary>{node.image === "V02" && <p>Copo apresentado: <strong>LUCAS</strong></p>}{node.image === "V04" && <p>Copo apresentado: <strong>BASEDSPEAK</strong></p>}</details>
      </aside>
      <section className="conversation-panel">
        <div className="conversation-tools"><ConversationHistory key={`${node.id}:${state.phase}`} state={state} lines={history} onReplay={replay} /><HelpPanel key={node.id} node={node} level={helpLevel} modelHidden={state.modelHidden} building={["build", "write", "select"].includes(state.phase)} onHelp={() => event("HELP")} onToggleModel={() => event("TOGGLE_MODEL")} onUseSupport={() => event("USE_SUPPORT")} onReplay={replay} /></div>
        <h1 ref={heading} tabIndex={-1}>{node.kind === "choice" ? node.prompt : node.kind === "comprehension" ? "O que ele está perguntando?" : node.id === "p6.safe" ? "Ele segura o copo a tempo." : node.id === "p2.send" ? "Agora responda a Lucas." : state.phase === "write" ? "Escreva sua resposta." : state.phase === "select" ? "Escolha sua expressão." : state.phase === "build" ? node.kind === "response" && node.mode === "recombine" ? "Complete a resposta." : "Monte a resposta." : "A conversa continua."}</h1>
        {node.id === "p10.contact" && state.decisions["p9.pause"] === "stay" && <p>Depois de mais alguns minutos, chega a hora de se despedir.</p>}
        <p className="context">{node.context}</p>
        {justSent && <article className="speech sent"><small>Você · fala enviada</small><p lang="en">{justSent.written ?? audio[justSent.audioId].text}</p><button className="text-button" onClick={() => replay(justSent.audioId)}>{justSent.written ? "Ouvir modelo" : "Ouvir resposta"}</button></article>}
        {(node.heard ?? (node.kind === "comprehension" ? ["C01" as AudioId] : [])).map(id => <article className="speech" key={id}><small>Lucas</small><p lang="en">{audio[id].text}</p>{state.activityProfile === "beginner" && node.part > 2 && <p className="meaning">{audio[id].meaning}</p>}<button className="text-button" onClick={() => replay(id)}>Ouvir fala</button></article>)}
        {node.kind === "scene" && (node.id === "p2.meaning" || node.id === "p2.model" && state.activityProfile === "beginner") && <article className="expression"><small>Expressão apresentada · ainda não enviada</small><p lang="en">{audio.U01.text}</p><p>{audio.U01.meaning}</p><button onClick={() => replay("U01")}>Ouvir</button></article>}
        {node.kind === "scene" && <button className="primary" onClick={() => event("NEXT")}>{node.button}</button>}
        {node.kind === "comprehension" && <div className="choices"><button onClick={() => dispatch({ at: node.id, type: "UNDERSTAND", correct: true })}>Esse café é seu?</button><button onClick={() => dispatch({ at: node.id, type: "UNDERSTAND", correct: false })}>Você quer um café?</button></div>}
        {node.kind === "choice" && <div className="choices">{node.choices.map(choice => <button key={choice.id} onClick={() => dispatch({ at: node.id, type: "CHOOSE", choice: choice.id })}>{choice.label}<span aria-hidden>↗</span></button>)}</div>}
        {node.kind === "response" && response && <>
          {state.phase === "recall" && <div className="recall"><p>{expressionHistory(state, node.response) === "used" ? "Você já usou uma expressão para isso. Tente lembrar antes de conferir." : "Você encontrou uma expressão para isso na conversa. Tente lembrar antes de conferir."}</p><button className="primary" onClick={() => event("CHECK")}>{state.activityProfile === "less" ? "Escrever minha resposta" : "Tentar com opções"}</button></div>}
          {modelVisible && <article className="expression"><small>Expressão apresentada · ainda não enviada</small><p lang="en">{response.text}</p>{(state.activityProfile !== "less" || node.id === "p6.warn" || helpLevel > 0) && <p>{response.meaning}</p>}<button onClick={() => replay(node.response)}>Ouvir</button></article>}
          {state.phase === "present" && <button className="primary" onClick={() => event("PREPARE")}>Preparar resposta</button>}
          {state.phase === "build" && <div className="construction">
            {exercise?.skeleton && <p className="skeleton" lang="en">{exercise.skeleton}</p>}
            <div className="answer" aria-label="Sua resposta"><ol>{state.selected.map((id, index) => <li key={id}><button onClick={() => dispatch({ at: node.id, type: "REMOVE_BLOCK", index })} aria-label={`Retirar ${exercise?.blocks.find(b => b.id === id)?.text}`}><span lang="en">{exercise?.blocks.find(b => b.id === id)?.text}</span> <span aria-hidden>×</span></button></li>)}</ol>{!state.selected.length && <span className="muted">Sua resposta aparece aqui</span>}</div>
            <div className="blocks" aria-label="Blocos disponíveis">{exercise?.blocks.map(block => <button lang="en" key={block.id} disabled={state.selected.includes(block.id)} onClick={() => dispatch({ at: node.id, type: "BLOCK", block: block.id })}>{block.text}</button>)}</div>
            <div className="actions"><button className="primary" onClick={() => event("SUBMIT")}>Responder</button><button disabled={!state.selected.length} onClick={() => event("CLEAR")}>Limpar montagem</button>{state.assistedBlocks && <button onClick={() => event("WRITE_AGAIN")}>Voltar à escrita</button>}</div>
          </div>}
          {state.phase === "write" && <form className="written-response" onSubmit={event => { event.preventDefault(); dispatch({ at: node.id, type: "SUBMIT" }); }}>
            <label htmlFor="written-answer">Sua resposta em inglês</label>
            <input id="written-answer" lang="en" value={state.draft} maxLength={240} autoComplete="off" spellCheck={false} autoCapitalize="sentences" onChange={event => dispatch({ at: node.id, type: "TYPE", text: event.target.value })} />
            <div className="actions"><button className="primary" disabled={!state.draft.trim()} type="submit">Responder</button><button type="button" onClick={() => event("USE_BLOCKS")}>Tentar com peças</button></div>
          </form>}
          {state.phase === "select" && <div className="recognition-response"><p>Qual expressão combina com o que você quer dizer?</p><div className="choices">{recognitionOptions(node).map(id => <button key={id} lang="en" aria-pressed={state.recognized === id} onClick={() => dispatch({ at: node.id, type: "RECOGNIZE", response: id })}>{audio[id].text}</button>)}</div><button className="primary" disabled={!state.recognized} onClick={() => event("SUBMIT")}>Responder</button></div>}
          {state.phase === "ready" && <button className="primary" onClick={() => event("SUBMIT")}>{node.button ?? "Responder"}</button>}
        </>}
        <p role="status" className="notice">{state.notice}</p>
      </section>
    </div>}
  </div>;
}

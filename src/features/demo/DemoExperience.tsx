"use client";

import Image from "next/image";
import { useEffect, useReducer, useRef, useState } from "react";
import { catalog } from "./content/catalog";
import { audio, images } from "./content/media";
import { mobileContext } from "./content/mobile-copy";
import { profiles } from "./content/copy.pt-BR";
import { practice, recognitionOptions } from "./model/practice";
import { transition } from "./model/reducer";
import { expressionHistory } from "./model/history";
import { remember } from "./session/browser";
import { DemoAudioContext, useDemoAudio } from "./audio/use-demo-audio";
import { AudioButton } from "./components/AudioButton";
import { Retrospective } from "./components/Retrospective";
import { HelpPanel } from "./components/HelpPanel";
import { SceneFrame } from "./components/SceneFrame";
import { ConversationHistory } from "./components/ConversationHistory";
import type { AudioId, DemoEvent, DemoState } from "./model/types";
import type { PublishedAudioCatalog } from "@/contracts/demo-audio";

export function DemoExperience({ initial, publishedAudio = {} }: { initial: DemoState; publishedAudio?: PublishedAudioCatalog }) {
  const [state, dispatch] = useReducer(transition, initial);
  const node = catalog[state.nodeId];
  const image = images[node.image];
  const heading = useRef<HTMLHeadingElement>(null);
  const storageNotice = useRef<HTMLParagraphElement>(null);
  const supportMenu = useRef<HTMLDialogElement>(null);
  const audioMenu = useRef<HTMLDialogElement>(null);
  const [draftProfile, setDraftProfile] = useState(initial.profile);
  const demoAudio = useDemoAudio(`${state.nodeId}:${state.phase}:${state.reviewView}`, publishedAudio);
  const [playbackRate, setPlaybackRate] = useState(1);
  const event = (type: DemoEvent["type"]) => dispatch({ at: node.id, type } as DemoEvent);
  useEffect(() => {
    if (!remember(state) && storageNotice.current) storageNotice.current.textContent = "O navegador não está guardando esta tentativa. Você pode concluir, mas sair desta página pode perder a retomada.";
  }, [state]);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [state.nodeId, state.phase, state.reviewView]);
  const exercise = node.kind === "response" ? practice(node, state.assistedBlocks ? "some" : state.activityProfile) : null;
  const response = node.kind === "response" ? audio[node.response] : null;
  const helpLevel = state.help[node.id] ?? 0;
  const previous = [...state.transcript].reverse().find(line => line.role === "you");
  const previousNode = previous ? catalog[previous.nodeId] : null;
  const justSent = previousNode && "next" in previousNode && previousNode.next === node.id ? previous : null;
  const history = state.transcript.filter(line => line.nodeId !== node.id
    && !(node.kind === "comprehension" && line.audioId === "C01"));
  const heard = node.heard ?? (node.kind === "comprehension" ? ["C01" as AudioId] : []);
  const modelVisible = state.phase === "present" || state.phase === "ready";
  const activityActions = node.kind === "scene" ? <button className="primary" onClick={() => event("NEXT")}>{node.button}</button>
    : node.kind === "comprehension" ? <div className="choices"><button onClick={() => dispatch({ at: node.id, type: "UNDERSTAND", correct: true })}>Esse café é seu?</button><button onClick={() => dispatch({ at: node.id, type: "UNDERSTAND", correct: false })}>Você quer um café?</button></div>
    : node.kind === "choice" ? <div className="choices">{node.choices.map(choice => <button key={choice.id} onClick={() => dispatch({ at: node.id, type: "CHOOSE", choice: choice.id })}>{choice.label}<span aria-hidden>↗</span></button>)}</div>
    : node.kind === "response" ? <>
      {state.phase === "recall" && <button className="primary" onClick={() => event("CHECK")}>{state.activityProfile === "less" ? "Escrever minha resposta" : "Tentar com opções"}</button>}
      {state.phase === "present" && <button className="primary" onClick={() => event("PREPARE")}>Tentar responder</button>}
      {state.phase === "build" && <div className="actions"><button className="primary" onClick={() => event("SUBMIT")} aria-label="Enviar resposta">Enviar</button><button disabled={!state.selected.length} onClick={() => event("CLEAR")} aria-label="Limpar montagem">Limpar</button>{state.assistedBlocks && <button onClick={() => event("WRITE_AGAIN")} aria-label="Voltar à escrita">Escrever</button>}</div>}
      {state.phase === "write" && <div className="actions"><button className="primary" disabled={!state.draft.trim()} type="submit" form="written-response-form" aria-label="Enviar resposta">Enviar</button><button type="button" onClick={() => event("USE_BLOCKS")}>Tentar com peças</button></div>}
      {state.phase === "select" && <button className="primary" disabled={!state.recognized} onClick={() => event("SUBMIT")} aria-label="Enviar resposta">Enviar</button>}
      {state.phase === "ready" && <button className="primary" onClick={() => event("SUBMIT")}>{node.button ?? "Responder"}</button>}
    </> : null;
  return <DemoAudioContext.Provider value={demoAudio}><div className="experience">
    <div className="experience-bar"><span>Parte {node.part} de 10</span><progress max={10} value={node.part} aria-label="Parte da conversa" />
      <button className="text-button" aria-haspopup="dialog" onClick={() => audioMenu.current?.showModal()}>Áudio</button>
      <button className="text-button" aria-haspopup="dialog" onClick={() => { setDraftProfile(state.profile); supportMenu.current?.showModal(); }}>Apoio</button>
      <dialog ref={supportMenu} className="demo-dialog support-dialog" aria-labelledby="support-title">
        <div className="dialog-heading"><h2 id="support-title">Como prefere continuar?</h2><button autoFocus onClick={() => supportMenu.current?.close()} aria-label="Fechar ajustes de apoio">Fechar ×</button></div>
        <fieldset><legend>Nível de apoio</legend>{profiles.map(profile => <label key={profile.id}><input type="radio" name="change-support" checked={draftProfile === profile.id} onChange={() => setDraftProfile(profile.id)} /><span>{profile.label}<small>{profile.description}</small></span></label>)}</fieldset>
        <p className="muted">A mudança começa na próxima atividade. Sua resposta atual será mantida.</p>
        <div className="actions"><button className="primary" onClick={() => { dispatch({ at: node.id, type: "PROFILE", profile: draftProfile }); supportMenu.current?.close(); }}>Aplicar apoio</button><button onClick={() => supportMenu.current?.close()}>Voltar sem alterar</button></div>
      </dialog>
      <dialog ref={audioMenu} className="demo-dialog audio-dialog" aria-labelledby="audio-title">
        <div className="dialog-heading"><h2 id="audio-title">Áudio e velocidade</h2><button autoFocus onClick={() => audioMenu.current?.close()} aria-label="Fechar ajustes de áudio">Fechar ×</button></div>
        <div className="audio-controls" aria-label="Controles de áudio">
          <label>Velocidade <select aria-label="Velocidade de reprodução" value={playbackRate} onChange={event => { const rate = Number(event.target.value); setPlaybackRate(rate); demoAudio.setPlaybackRate(rate); }}><option value={1}>Padrão</option><option value={0.9}>Mais lenta</option></select></label>
          <button className="text-button" onClick={demoAudio.pause} aria-label="Pausar áudio">Pausar<span className="audio-label"> áudio</span></button>
          <button className="text-button" onClick={demoAudio.resume} aria-label="Continuar áudio">Continuar<span className="audio-label"> áudio</span></button>
          <button className="text-button" onClick={demoAudio.stop} aria-label="Parar áudio">Parar<span className="audio-label"> áudio</span></button>
        </div>
        <p className="muted">A velocidade muda a reprodução do mesmo áudio. Para ouvir uma frase, volte à conversa e toque em Ouvir.</p>
      </dialog>
    </div>
    <div className="session-notices"><p ref={storageNotice} className="notice" role="status" /></div>
    {node.kind === "end" ? <Retrospective state={state} setView={view => dispatch({ at: node.id, type: "REVIEW", view })} /> : <SceneFrame key={node.id} activityKey={state.phase}
      intro={<header className="scene-intro">
        <h1 ref={heading} tabIndex={-1}>{node.id === "p1.first" ? "Um encontro na cafeteria." : node.kind === "choice" ? node.prompt : node.kind === "comprehension" ? "O que ele está perguntando?" : node.id === "p6.safe" ? "Ele segura o copo a tempo." : node.id === "p2.send" ? "Agora responda a Lucas." : state.phase === "write" ? "Escreva sua resposta." : state.phase === "select" ? "Escolha sua expressão." : state.phase === "build" ? node.kind === "response" && node.mode === "recombine" ? "Complete a resposta." : "Monte a resposta." : "A conversa continua."}</h1>
        {node.id === "p10.contact" && state.decisions["p9.pause"] === "stay" && <p>Depois de mais alguns minutos, chega a hora de se despedir.</p>}
        <p className="context">{mobileContext[node.id] ? <><span className="desktop-context">{node.context}</span><span className="mobile-context">{mobileContext[node.id]}</span></> : node.context}</p>
        {(node.image === "V02" || node.image === "V04") && <p className="cup-clue">Seu café: based · iced coffee. Copo: {node.image === "V02" ? "lucas" : "based"}.</p>}
      </header>}
      artwork={<aside className="scene-column"><figure className="scene-art"><picture><source media="(max-width: 760px)" srcSet={image.mobile} /><Image unoptimized width={960} height={640} src={image.path} alt={image.description} /></picture></figure></aside>}>
      <div className="activity-body"><div className="activity-content">
        <div className="conversation-tools"><ConversationHistory label="Histórico" key={`${node.id}:${state.phase}`} state={state} lines={history} /><HelpPanel key={node.id} node={node} level={helpLevel} modelHidden={state.modelHidden} building={["build", "write", "select"].includes(state.phase)} onHelp={() => event("HELP")} onToggleModel={() => event("TOGGLE_MODEL")} onUseSupport={() => event("USE_SUPPORT")} /></div>
        {justSent && <article className="speech sent"><small>Você<span className="sent-detail"> · fala enviada</span></small><p lang="en">{justSent.written ?? audio[justSent.audioId].text}</p><AudioButton key={justSent.id} audio={justSent.audioId}>{justSent.written ? "Ouvir modelo" : "Ouvir resposta"}</AudioButton></article>}
        {heard.length > 0 && <article className="speech heard"><small>Lucas</small><div className="heard-line"><div><p lang="en">{heard.map(id => audio[id].text).join(" ")}</p>{state.activityProfile === "beginner" && node.part > 2 && <p className="meaning">{heard.map(id => audio[id].meaning).join(" ")}</p>}</div><AudioButton audio={heard} label="Ouvir fala de Lucas" /></div></article>}
        {node.kind === "response" && response && <>
          {state.phase === "recall" && <div className="recall"><p>{expressionHistory(state, node.response) === "used" ? "Você já usou esta expressão. Tente lembrar antes de consultar." : "Você já encontrou esta expressão. Tente lembrar antes de consultar."}</p></div>}
          {modelVisible && <article className="expression"><small>Você pode dizer</small><p lang="en">{response.text}</p>{(state.activityProfile !== "less" || node.id === "p6.warn" || helpLevel > 0) && <p>{response.meaning}</p>}<AudioButton audio={node.response} /></article>}
          {state.phase === "build" && <div className="construction">
            {exercise?.skeleton && <p className="skeleton" lang="en">{exercise.skeleton}</p>}
            <div className="answer" aria-label="Sua resposta"><ol>{state.selected.map((id, index) => <li key={id}><button onClick={() => dispatch({ at: node.id, type: "REMOVE_BLOCK", index })} aria-label={`Retirar ${exercise?.blocks.find(b => b.id === id)?.text}`}><span lang="en">{exercise?.blocks.find(b => b.id === id)?.text}</span> <span aria-hidden>×</span></button></li>)}</ol>{!state.selected.length && <span className="muted">Sua resposta aparece aqui</span>}</div>
            <div className="blocks" aria-label="Blocos disponíveis">{exercise?.blocks.map(block => <button lang="en" key={block.id} disabled={state.selected.includes(block.id)} onClick={() => dispatch({ at: node.id, type: "BLOCK", block: block.id })}>{block.text}</button>)}</div>
          </div>}
          {state.phase === "write" && <form id="written-response-form" className="written-response" onSubmit={event => { event.preventDefault(); dispatch({ at: node.id, type: "SUBMIT" }); }}>
            <label htmlFor="written-answer">Sua resposta em inglês</label>
            <input id="written-answer" type="text" enterKeyHint="send" lang="en" value={state.draft} maxLength={240} autoComplete="off" spellCheck={false} autoCapitalize="sentences" onChange={event => dispatch({ at: node.id, type: "TYPE", text: event.target.value })} />
          </form>}
          {state.phase === "select" && <div className="recognition-response"><div className="choices" aria-label="Expressões para responder">{recognitionOptions(node).map(id => <button key={id} lang="en" aria-pressed={state.recognized === id} onClick={() => dispatch({ at: node.id, type: "RECOGNIZE", response: id })}>{audio[id].text}</button>)}</div></div>}
        </>}
        <p role="status" className="notice">{state.notice}</p>

      </div></div>
      <div className="activity-actions">{activityActions}</div>
    </SceneFrame>}
  </div></DemoAudioContext.Provider>;
}

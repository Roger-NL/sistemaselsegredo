"use client";
import { sceneConversation, sceneReadingGroup } from "./model/scene-conversation";
import { SceneArtwork } from "./components/SceneArtwork";
import { SpeakerLabel } from "./components/SpeakerLabel";
import { InterfaceIcon } from "@/components/ui/InterfaceIcon";

import { BrowserText } from "@/components/i18n/BrowserText";
import { AutoFit } from "@/components/core/AutoFit";


import { useEffect, useImperativeHandle, useReducer, useRef, useState, type Ref } from "react";
import { catalog } from "./content/catalog";
import { audio } from "./content/media";
import { mobileContext } from "./content/mobile-copy";
import { nextSceneLabels } from "./content/presentation";
import { profiles } from "./content/copy.pt-BR";
import { constructionView, practice, recognitionOptions, writtenRepertoire } from "./model/practice";
import { transition } from "./model/reducer";
import { ResponseCue } from "./components/ResponseCue";
import { ResponseConstruction } from "./components/ResponseConstruction";
import { listeningTarget, lucasKey, type AudioAccess } from "./model/listening";
import { expressionHistory } from "./model/history";
import { remember } from "./session/browser";
import { DemoAudioContext, useDemoAudio } from "./audio/use-demo-audio";
import { AudioButton } from "./components/AudioButton";
import { OpeningCard } from "./components/OpeningCard";
import { Retrospective } from "./components/Retrospective";
import { HelpPanel } from "./components/HelpPanel";
import { SceneFrame } from "./components/SceneFrame";
import { useConversationMotion } from "./components/use-conversation-motion";
import { ConversationHistory } from "./components/ConversationHistory";
import type { AudioId, DemoEvent, DemoState, SceneNode } from "./model/types";
import type { PublishedAudioCatalog } from "@/contracts/demo-audio";

export type DemoNavigation = { back: () => void };
export function DemoExperience({ initial, generation = -1, publishedAudio = {}, navigationRef, onBackAvailabilityChange }: {
  initial: DemoState; generation?: number; publishedAudio?: PublishedAudioCatalog; navigationRef?: Ref<DemoNavigation>; onBackAvailabilityChange?: (available: boolean) => void;
}) {
  const [state, commit] = useReducer(transition, initial);
  const dispatch = useConversationMotion(state, commit);
  const node = catalog[state.nodeId];
  const openingNode = node.kind === "scene" && node.presentation ? node : null;
  const sequenced = (node.part >= 3 && !openingNode) || node.kind === "response";
  const card = sceneReadingGroup(state)?.card;
  const readingNode: SceneNode | null = card ? { ...node, kind: "scene", next: node.id, ...card }
    : openingNode ?? (node.kind === "scene" && (sequenced || Boolean(node.heard?.length)) ? { ...node, context: "", presentation: "dialogue" } : null);
  const target = listeningTarget(state);
  // Listening changes access evidence, never replaces a card with its duplicate.
  const modelCue = target?.kind === "model" ? target : null;
  const accessAudio = (key: string, mode: AudioAccess) => dispatch({ at: node.id, type: "AUDIO_ACCESS", key, mode });
  const balloon = sceneConversation(state);
  const heading = useRef<HTMLHeadingElement>(null);
  const storageNotice = useRef<HTMLParagraphElement>(null);
  const supportMenu = useRef<HTMLDialogElement>(null);
  const audioMenu = useRef<HTMLDialogElement>(null);
  const [replaying, setReplaying] = useState(()=>initial.nodeId === "end" && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("replay") === "1");
  const [draftProfile, setDraftProfile] = useState(initial.profile);
  const demoAudio = useDemoAudio(`${state.nodeId}:${state.presentationStep}:${state.phase}:${state.reviewView}:${replaying}`, publishedAudio);
  const [playbackRate, setPlaybackRate] = useState(1);
  const event = (type: DemoEvent["type"]) => dispatch({ at: node.id, type } as DemoEvent);
  useImperativeHandle(navigationRef, () => ({ back: () => replaying ? setReplaying(false) : dispatch({ at: node.id, type: "BACK_SCENE" }) }), [node.id, dispatch, replaying]);
  useEffect(() => { onBackAvailabilityChange?.(state.journal.length > 0); }, [state.journal.length, onBackAvailabilityChange]);
  useEffect(() => {
    if (!remember(state, generation) && storageNotice.current) storageNotice.current.textContent = "Não foi possível sincronizar. Atualize seu painel antes de continuar.";
  }, [state, generation]);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [state.nodeId, state.presentationStep, state.phase, state.reviewView]);
  const exercise = node.kind === "response" ? practice(node, state.assistedBlocks ? "some" : state.activityProfile) : null;
  const construction = node.kind === "response" ? constructionView(node, state.assistedBlocks ? "some" : state.activityProfile, state.selected) : null;
  const response = node.kind === "response" ? audio[node.response] : null;
  const responseSituation = node.id === "p2.send" ? "A bebida de que Lucas está falando é dele, não sua."
    : node.id === "p4.mine" ? "Desta vez, Lucas está perguntando sobre a sua bebida." : undefined;
  const helpLevel = state.help[node.id] ?? 0;
  const previous = [...state.transcript].reverse().find(line => line.role === "you");
  const previousNode = previous ? catalog[previous.nodeId] : null;
  const justSent = previousNode && "next" in previousNode && previousNode.next === node.id ? previous : null;
  const history = state.transcript.filter(line => (line.role === "you" || state.audioAccess[lucasKey(line.nodeId)]) && line.nodeId !== node.id
    && !(node.kind === "comprehension" && line.audioId === "C01"));
  const heard = node.heard ?? (node.kind === "comprehension" ? ["C01" as AudioId] : []);
  const activityActions = modelCue ? <button className="primary" onClick={() => event(state.phase === "ready" ? "SEND_RESPONSE" : "CONTINUE_SCENE")}>{state.phase === "ready" ? "Avisar Lucas" : "Responder em inglês"}</button> : card ? <button className="primary" onClick={() => event("CONTINUE_SCENE")}><BrowserText>{card.button}</BrowserText></button>
    : node.kind === "scene" ? <button className="primary" onClick={() => event("CONTINUE_SCENE")}>{nextSceneLabels[node.id] ?? <BrowserText>{node.button}</BrowserText>}</button>
    : node.kind === "comprehension" ? <div className="choices"><button data-ui-sound="none" onClick={() => dispatch({ at: node.id, type: "ANSWER_MEANING", correct: true })}>Se essa bebida é sua.</button><button data-ui-sound="none" onClick={() => dispatch({ at: node.id, type: "ANSWER_MEANING", correct: false, option: "lucas" })}>Se essa bebida é dele.</button><button data-ui-sound="none" onClick={() => dispatch({ at: node.id, type: "ANSWER_MEANING", correct: false, option: "order" })}>Qual bebida você pediu.</button></div>
    : node.kind === "choice" ? <div className="choices">{node.choices.map(choice => <button key={choice.id} onClick={() => dispatch({ at: node.id, type: "CHOOSE", choice: choice.id })}><BrowserText>{choice.label}</BrowserText><InterfaceIcon name="arrow-up-right" /></button>)}</div>
    : node.kind === "response" ? <>
      {state.phase === "recall" && <button className="primary" onClick={() => event("CHECK")}>{state.activityProfile === "less" ? <BrowserText>{"Escrever minha resposta"}</BrowserText> : <BrowserText>{"Tentar com opções"}</BrowserText>}</button>}
      {state.phase === "present" && <button className="primary" onClick={() => event("PREPARE")}>Responder em inglês</button>}
      {state.phase === "build" && <div className="actions"><button className="primary" disabled={state.selected.length !== exercise?.answer.length} onClick={() => event("SEND_RESPONSE")} data-ui-sound="none" aria-label="Enviar resposta">Enviar</button><button disabled={!construction?.selected.length} onClick={() => event("CLEAR")} aria-label="Limpar montagem">Limpar</button>{state.assistedBlocks && <button onClick={() => event("WRITE_AGAIN")} aria-label="Voltar à escrita">Escrever</button>}</div>}
      {state.phase === "write" && <div className="actions"><button className="primary" disabled={!state.draft.trim()} type="submit" form="written-response-form" data-ui-sound="none" aria-label="Enviar resposta">Enviar</button><button type="button" onClick={() => event("USE_BLOCKS")}>Tentar com peças</button></div>}
      {state.phase === "select" && <button className="primary" disabled={!state.recognized} onClick={() => event("SEND_RESPONSE")} data-ui-sound="none" aria-label="Enviar resposta">Enviar</button>}
      {state.phase === "ready" && <button className="primary" onClick={() => event("SEND_RESPONSE")}>{node.button ?? <BrowserText>{"Responder"}</BrowserText>}</button>}
    </> : null;
  return <DemoAudioContext.Provider value={demoAudio}><div className="experience">
    <div className="experience-bar"><span><BrowserText>Parte </BrowserText><BrowserText>{node.part}</BrowserText> <BrowserText>de 10</BrowserText></span><progress max={10} value={node.part} aria-label="Parte da conversa" />
      <button className="text-button" aria-haspopup="dialog" onClick={() => audioMenu.current?.showModal()}>Áudio</button>
      <button className="text-button" aria-haspopup="dialog" onClick={() => { setDraftProfile(state.profile); supportMenu.current?.showModal(); }}>Apoio</button>
      <dialog ref={supportMenu} className="demo-dialog support-dialog" aria-labelledby="support-title">
        <div className="dialog-heading"><h2 id="support-title">Como prefere continuar?</h2><button autoFocus onClick={() => supportMenu.current?.close()} aria-label="Fechar ajustes de apoio">Fechar <InterfaceIcon name="close" /></button></div>
        <fieldset><legend>Nível de apoio</legend>{profiles.map(profile => <label key={profile.id}><input type="radio" name="change-support" checked={draftProfile === profile.id} onChange={() => setDraftProfile(profile.id)} /><span><BrowserText>{profile.label}</BrowserText><small><BrowserText>{profile.mobileDescription}</BrowserText></small></span></label>)}</fieldset>
        <p className="muted">A mudança começa na próxima atividade. Sua resposta atual será mantida.</p>
        <div className="actions"><button className="primary" onClick={() => { dispatch({ at: node.id, type: "PROFILE", profile: draftProfile }); supportMenu.current?.close(); }}>Aplicar apoio</button><button onClick={() => supportMenu.current?.close()}>Manter atual</button></div>
      </dialog>
      <dialog ref={audioMenu} className="demo-dialog audio-dialog" aria-labelledby="audio-title">
        <div className="dialog-heading"><h2 id="audio-title">Áudio e velocidade</h2><button autoFocus onClick={() => audioMenu.current?.close()} aria-label="Fechar ajustes de áudio">Fechar <InterfaceIcon name="close" /></button></div>
        <div className="audio-controls" aria-label="Controles de áudio">
          <label>Velocidade <select aria-label="Velocidade de reprodução" value={playbackRate} onChange={event => { const rate = Number(event.target.value); setPlaybackRate(rate); demoAudio.setPlaybackRate(rate); }}><option value={1}>Lento (padrão)</option><option value={0.8}>Ainda mais lento</option></select></label>
          <button className="text-button" onClick={demoAudio.pause} aria-label="Pausar áudio">Pausar<span className="audio-label"> áudio</span></button>
          <button className="text-button" onClick={demoAudio.resume} aria-label="Continuar áudio">Continuar<span className="audio-label"> áudio</span></button>
          <button className="text-button" onClick={demoAudio.stop} aria-label="Parar áudio">Parar<span className="audio-label"> áudio</span></button>
        </div>
        <p className="muted">As gravações já têm ritmo lento. A opção adicional deixa o mesmo áudio ainda mais devagar, sem gerar outra gravação. Para ouvir uma frase, volte à conversa e toque em Ouvir.</p>
      </dialog>
    </div>
    <div className="session-notices"><p ref={storageNotice} className="notice" role="status" /></div>
    {node.kind === "end" ? <Retrospective state={state} replaying={replaying} onReplayChange={setReplaying} setView={view => dispatch({ at: node.id, type: "REVIEW", view })} /> : <SceneFrame activityKey={`${node.id}:${state.presentationStep}:${state.phase}`} opening={Boolean(readingNode) || sequenced || Boolean(modelCue)}
      intro={modelCue || readingNode || sequenced ? null : <header className={`scene-intro${node.part <= 3 ? " opening-instructions" : ""}`}>
        <h1 ref={heading} tabIndex={-1}>{node.kind === "comprehension" ? <BrowserText>{"Escolha o significado."}</BrowserText> : <BrowserText>{"A conversa continua."}</BrowserText>}</h1>
        <p className="context">{mobileContext[node.id] ? <><span className="desktop-context"><BrowserText>{node.context}</BrowserText></span><span className="mobile-context"><BrowserText>{mobileContext[node.id]}</BrowserText></span></> : <BrowserText>{node.context}</BrowserText>}</p>
        {node.kind !== "comprehension" && (node.image === "V02" || node.image === "V04") && <p className="cup-clue"><BrowserText>Seu café: BASEDSPEAK · iced coffee. Copo: </BrowserText>{node.image === "V02" ? <BrowserText>{"LUCAS"}</BrowserText> : <BrowserText>{"BASEDSPEAK"}</BrowserText>}<BrowserText>.</BrowserText></p>}
      </header>}
      artwork={<SceneArtwork image={node.image} conversation={balloon} />} actions={activityActions}>
      <AutoFit className="activity-body"><div className="activity-content">
        {modelCue && node.kind === "response" ? <ResponseCue response={node.response} context={responseSituation} headingRef={heading} onAccess={mode => accessAudio(modelCue.key, mode)} /> : readingNode ? <OpeningCard node={readingNode} headingRef={heading} onAudioEnded={target?.kind === "lucas" ? () => accessAudio(target.key, "heard") : undefined} /> : <>
        {sequenced && <h1 className={node.kind === "choice" ? "scene-choice-prompt" : "audio-sr-only"} ref={heading} tabIndex={-1}>{node.kind === "choice" ? <BrowserText>{node.prompt}</BrowserText> : state.phase === "present" ? <BrowserText>{"Uma forma de responder"}</BrowserText> : <BrowserText>{"Sua resposta"}</BrowserText>}</h1>}
        {response && <div className="activity-intent"><SpeakerLabel role="you" model />{responseSituation && <p className="response-context"><BrowserText>{responseSituation}</BrowserText></p>}<p><BrowserText>{response.meaning}</BrowserText></p></div>}
        <div className={`conversation-tools${response ? " response-tools" : ""}`}><ConversationHistory label="Histórico" key={`${node.id}:${state.phase}`} state={state} lines={history} />{node.kind === "response" && <AudioButton audio={node.response} label="Ouvir modelo em inglês">Ouvir modelo</AudioButton>}<HelpPanel key={node.id} node={node} level={helpLevel} onHelp={() => event("HELP")} onReveal={() => event("REVEAL_MODEL")} /></div>
        {!sequenced && justSent && <article className="speech sent"><SpeakerLabel role="you" /><p lang="en">{justSent.written ?? <BrowserText>{audio[justSent.audioId].text}</BrowserText>}</p><AudioButton key={justSent.id} audio={justSent.audioId}>{justSent.written ? <BrowserText>{"Ouvir modelo"}</BrowserText> : <BrowserText>{"Ouvir resposta"}</BrowserText>}</AudioButton></article>}
        {!sequenced && heard.length > 0 && <article className="speech heard scene-dialogue-controls"><SpeakerLabel role="character" /><div className="heard-line"><div><p className="scene-utterance" lang="en"><BrowserText>{heard.map(id => audio[id].text).join(" ")}</BrowserText></p>{state.activityProfile === "beginner" && node.part > 2 && <p className="meaning"><BrowserText>{heard.map(id => audio[id].meaning).join(" ")}</BrowserText></p>}</div><AudioButton audio={heard} label="Ouvir fala de Lucas" /></div></article>}
        {node.kind === "response" && response && <>
          {state.phase === "recall" && <div className="recall"><p>{expressionHistory(state, node.response) === "used" ? <BrowserText>{"Você já usou esta expressão. Tente lembrar antes de consultar."}</BrowserText> : <BrowserText>{"Você já encontrou esta expressão. Tente lembrar antes de consultar."}</BrowserText>}</p></div>}
          {state.phase === "build" && <ResponseConstruction node={node} state={state} dispatch={dispatch} />}
          {state.phase === "write" && <form id="written-response-form" className="written-response" onSubmit={event => { event.preventDefault(); dispatch({ at: node.id, type: "SEND_RESPONSE" }); }}>
            <label htmlFor="written-answer">Sua resposta em inglês</label>
            <p className="writing-scope">Use uma expressão curta deste passo. O repertório é limitado; outras formas podem ser inglês válido. Consultar as alternativas conta como apoio.</p>
            <details className="writing-repertoire" onToggle={event => { if (event.currentTarget.open && helpLevel < node.help.length) dispatch({ at: node.id, type: "REVEAL_MODEL" }); }}><summary>Consultar expressões aceitas</summary><ul>{writtenRepertoire(node).map(text => <li key={text} lang="en"><BrowserText>{text}</BrowserText></li>)}</ul></details>
            <input id="written-answer" type="text" enterKeyHint="send" lang="en" value={state.draft} maxLength={240} autoComplete="off" spellCheck={false} autoCapitalize="sentences" onChange={event => dispatch({ at: node.id, type: "TYPE", text: event.target.value })} />
          </form>}
          {state.phase === "select" && <div className="recognition-response"><div className="choices" aria-label="Expressões para responder">{recognitionOptions(node).map(id => <button key={id} lang="en" aria-pressed={state.recognized === id} onClick={() => dispatch({ at: node.id, type: "RECOGNIZE", response: id })}><BrowserText>{audio[id].text}</BrowserText></button>)}</div></div>}
        </>}
        <p role="status" className="notice">{state.notice.trim() ? <BrowserText>{state.notice}</BrowserText> : null}</p>
        </>}
      </div></AutoFit>
    </SceneFrame>}
  </div></DemoAudioContext.Provider>;
}

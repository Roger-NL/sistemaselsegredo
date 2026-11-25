"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Bookmark, Check, CircleHelp, Clock3, Lightbulb, MapPin, MessageCircle, PencilLine, RotateCcw, X } from "lucide-react";
import { appendEvent, chosenPhrase, freshSnapshot, gestureFor, responseFor, restoreSnapshot, scenes, storageKey, type JourneyEvent, type Snapshot } from "./content";
import { BookshopOnboarding } from "./BookshopOnboarding";
import { freshGuide, guideSteps, guideStorageKey, restoreGuide, type GuideSnapshot } from "./onboarding";
import { ViewportFit } from "./ViewportFit";
import { BookshopSpeech } from "./BookshopSpeech";
import { BookshopAudioButton } from "./BookshopAudioButton";
import { BookshopTheory } from "./BookshopTheory";

const subscribeHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
const pieces = [{ en: "See you", pt: "Até mais" }, { en: "tomorrow!", pt: "amanhã!" }];

function readSaved(): Snapshot {
  if (typeof window === "undefined") return freshSnapshot();
  try { return restoreSnapshot(window.localStorage.getItem(storageKey)); }
  catch { return freshSnapshot(); }
}

function readSavedGuide(): GuideSnapshot {
  if (typeof window === "undefined") return freshGuide();
  try { return restoreGuide(window.localStorage.getItem(guideStorageKey)); }
  catch { return freshGuide(); }
}

const Line = BookshopSpeech;

export function BookshopPrototype() {
  const ready = useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);
  const [snapshot, setSnapshot] = useState<Snapshot>(readSaved);
  const [guide, setGuide] = useState<GuideSnapshot>(readSavedGuide);
  const [guideReplay, setGuideReplay] = useState(false);
  const [view, setView] = useState<"story" | "theory">("story");
  const [feedback, setFeedback] = useState("");
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);
  const historyRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const index = snapshot.events.length;
  const complete = index === scenes.length;
  const scene = scenes[index];
  const lastEvent = snapshot.events[index - 1];
  const lastScene = scenes[index - 1];
  const started = snapshot.started;
  const showGuide = ready && (!guide.dismissed || guideReplay);
  const progressItems = showGuide ? guideSteps : scenes;
  const progressIndex = showGuide ? guide.step : index;
  const progressActive = showGuide || started;

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(storageKey, JSON.stringify(snapshot)); }
    catch { queueMicrotask(() => setStorageUnavailable(true)); }
  }, [snapshot, ready]);

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(guideStorageKey, JSON.stringify(guide)); }
    catch { queueMicrotask(() => setStorageUnavailable(true)); }
  }, [guide, ready]);

  useEffect(() => {
    if (!ready || !started || showGuide) return;
    headingRef.current?.focus({ preventScroll: true });
  }, [index, view, ready, started, showGuide]);

  function openGuide() {
    setGuide(current => ({ ...current, step: 0 }));
    setGuideReplay(true);
  }

  function finishGuide() {
    setGuide(current => ({ ...current, dismissed: true }));
    setGuideReplay(false);
    setSnapshot(current => current.started ? current : { ...current, started: true });
  }

  function finish(event: JourneyEvent) {
    setFeedback("");
    setSnapshot(current => appendEvent(current, event));
  }

  function restart() {
    if (started && !window.confirm("Recomeçar apenas este teste da livraria? As escolhas deste percurso serão substituídas.")) return;
    setSnapshot(freshSnapshot());
    setFeedback("");
    setView("story");
  }

  function addPiece(piece: number) {
    setFeedback("");
    setSnapshot(current => current.noteDraft.includes(piece) ? current : { ...current, noteDraft: [...current.noteDraft, piece] });
  }

  function sendNote() {
    if (snapshot.noteDraft[0] === 0 && snapshot.noteDraft[1] === 1) {
      finish({ sceneId: "note", assisted: false });
    } else {
      setFeedback("Use “See you tomorrow!” para dizer “Até amanhã!”.");
    }
  }

  function openHistory() {
    setHistoryPage(Math.max(0, snapshot.events.length - 1));
    historyRef.current?.showModal();
  }

  function previousExchange() {
    if (!lastEvent || !lastScene) return null;
    return (
      <div className="bs-last-exchange" key={lastEvent.sceneId}>
        <p className="bs-gesture">{gestureFor(lastScene, lastEvent)}</p>
        <Line speaker="Lara" phrase={responseFor(lastScene, lastEvent)} />
      </div>
    );
  }

  function renderStory() {
    if (!scene) return null;
    const noteReply = scene.kind === "note" && scene.incoming && lastScene && lastEvent
      ? { en: responseFor(lastScene, lastEvent).en + " " + scene.incoming.en, pt: responseFor(lastScene, lastEvent).pt + " " + scene.incoming.pt }
      : null;
    return (
      <>
        {noteReply ? <Line speaker="Lara" phrase={noteReply} /> : previousExchange()}
        <h2 className="bs-scene-heading" ref={headingRef} tabIndex={-1}>{scene.title}</h2>
        <p className="bs-context">{scene.context}</p>
        {scene.id === "invitation" && (
          <div className="bs-poster">
            <BookOpen aria-hidden="true" size={22} />
            <div><span className="bs-poster-label">Tarde de histórias · nesta livraria</span><strong className="bs-poster-time">Domingo, 16h</strong></div>
          </div>
        )}
        {scene.incoming && !noteReply && <Line speaker="Lara" phrase={scene.incoming} />}
        <p className="bs-question" id="bs-current-question">{scene.question}</p>
        {scene.kind === "choice" && (
          <div className="bs-options" role="group" aria-labelledby="bs-current-question">
            {scene.options.map((option, optionIndex) => (
              <div className="bs-option-row" key={option.en}>
                <button type="button" className="bs-option" onClick={() => finish({ sceneId: scene.id, option: optionIndex as 0 | 1 })}>
                  <span className="bs-option-number">0{optionIndex + 1}</span>
                  <span className="bs-option-copy">
                    <span className="bs-option-en" lang="en" translate="no">{option.en}</span>
                    <span className="bs-option-pt">{option.pt}</span>
                  </span>
                  <ArrowUpRight className="bs-option-arrow" aria-hidden="true" size={22} />
                </button>
                <BookshopAudioButton text={option.en} speaker="ben" compact />
              </div>
            ))}
          </div>
        )}
        {scene.kind === "bookmark" && (
          <>
            <div className="bs-object-options" role="group" aria-labelledby="bs-current-question">
              {(["blue", "red"] as const).map(color => (
                <button type="button" className="bs-object" key={color} onClick={() => color === "blue" ? finish({ sceneId: "bookmark", assisted: false }) : setFeedback("Esse é o vermelho. Lara apontou para o azul. Confira o pedido e escolha de novo, ou siga com apoio.")}>
                  <span className={"bs-bookmark " + (color === "blue" ? "is-blue" : "is-red")} aria-hidden="true"><Bookmark size={30} strokeWidth={1.7} /></span>
                  <span className="bs-option-copy">
                    <span className="bs-option-en" lang="en" translate="no">{color} bookmark</span>
                    <span className="bs-option-pt">Marcador {color === "blue" ? "azul" : "vermelho"}</span>
                  </span>
                </button>
              ))}
            </div>
            {feedback && <p className="bs-game-feedback" role="status">{feedback}</p>}
            <button type="button" className="bs-skip" onClick={() => finish({ sceneId: "bookmark", assisted: true })}>Continuar com apoio <ArrowRight size={16} aria-hidden="true" /></button>
          </>
        )}
        {scene.kind === "note" && (
          <>
            <div className="bs-note">
              <p className="bs-note-time"><Clock3 size={17} aria-hidden="true" /> Domingo, 15h30 · Livraria</p>
              <div className="bs-note-slots" aria-label="Sua despedida no bilhete">
                {[0, 1].map(slot => (
                  <button type="button" className="bs-note-slot" key={slot} disabled={snapshot.noteDraft[slot] === undefined} aria-label={snapshot.noteDraft[slot] === undefined ? "Espaço " + (slot + 1) : "Remover " + pieces[snapshot.noteDraft[slot]].en} onClick={() => { setFeedback(""); setSnapshot(current => ({ ...current, noteDraft: current.noteDraft.filter((_, i) => i !== slot) })); }}>
                    {snapshot.noteDraft[slot] === undefined ? <span aria-hidden="true">…</span> : <span lang="en" translate="no">{pieces[snapshot.noteDraft[slot]].en}</span>}
                  </button>
                ))}
              </div>
              <p className="bs-translation">Até amanhã!</p>
            </div>
            <div className="bs-note-pieces" role="group" aria-label="Partes para o bilhete">
              {[1, 0].filter(piece => !snapshot.noteDraft.includes(piece)).map(piece => (
                <button type="button" className="bs-piece" key={piece} onClick={() => addPiece(piece)}>
                  <span lang="en" translate="no">{pieces[piece].en}</span>
                  <small>{pieces[piece].pt}</small>
                </button>
              ))}
            </div>
            {feedback && <p className="bs-game-feedback" role="status">{feedback}</p>}
          </>
        )}
        <div className="bs-hint"><Lightbulb size={17} aria-hidden="true" /><span>{scene.hint}</span></div>
      </>
    );
  }

  function renderEnd() {
    return (
      <div className="bs-end">
        {lastScene && lastEvent && <Line speaker="Lara" phrase={responseFor(lastScene, lastEvent)} />}
        <p className="bs-eyebrow">Fim deste encontro · Parte 1</p>
        <h2 className="bs-scene-heading" ref={headingRef} tabIndex={-1}>Amanhã tem mais uma página.</h2>
        <p className="bs-context">Antes de você sair, Lara mostra as primeiras linhas do caderno.</p>
        <blockquote className="bs-ending-quote">
          <Line phrase={{ en: "Anna has a train ticket. But she doesn't want to leave.", pt: "Anna tem uma passagem de trem. Mas não quer ir embora." }} speaker="Modelo" label="No caderno de Lara" />
        </blockquote>
        <p className="bs-context">Anna fica ou vai embora? Lara fecha o caderno, sorrindo. Você ouvirá o resto amanhã.</p>
        <div className="bs-poster"><Clock3 size={23} aria-hidden="true" /><div><span className="bs-poster-label">Seu reencontro com Lara</span><strong className="bs-poster-time">Domingo, 15h30 · Livraria</strong></div></div>
        <p className="bs-translation">Fim deste teste. Explore sua conversa quando quiser.</p>
      </div>
    );
  }

  function renderStoryFooter() {
    if (!started) return <footer className="bs-story-footer">
      <button type="button" className="bs-secondary" onClick={openGuide}><CircleHelp size={18} aria-hidden="true" /> Ver apresentação guiada</button>
      <button type="button" className="bs-primary" onClick={() => setSnapshot(current => ({ ...current, started: true }))}>Entrar na história <ArrowRight size={20} aria-hidden="true" /></button>
    </footer>;
    if (complete) return <footer className="bs-story-footer">
      <button type="button" className="bs-secondary" onClick={openHistory}><MessageCircle size={18} aria-hidden="true" /> Minha conversa</button>
      <button type="button" className="bs-primary" onClick={() => setView("theory")}>Entender o inglês que usei <ArrowRight size={19} aria-hidden="true" /></button>
    </footer>;
    if (scene?.kind === "note") return <footer className="bs-story-footer">
      <button type="button" className="bs-secondary" onClick={() => finish({ sceneId: "note", assisted: true })}>Usar modelo</button>
      <button type="button" className="bs-primary" disabled={snapshot.noteDraft.length !== 2} onClick={sendNote}>Deixar o bilhete <ArrowRight size={18} aria-hidden="true" /></button>
    </footer>;
    return null;
  }

  return (
    <div className="bs-bookshop" data-guide={showGuide}>
      <header className="bs-topbar">
        <a className="bs-brand" href="/dev/livraria" aria-label="BasedSpeak, teste da livraria"><span className="bs-brand-mark"><BookOpen size={23} aria-hidden="true" /></span><span className="bs-brand-name">BasedSpeak</span><span className="bs-tag">Teste local</span></a>
        <nav className="bs-top-actions" aria-label="Controles da história">
          <button type="button" className="bs-text-button" disabled={!ready} aria-pressed={showGuide} onClick={showGuide ? finishGuide : openGuide}><CircleHelp size={18} aria-hidden="true" /><span>{showGuide ? "Fechar guia" : "Como funciona"}</span></button>
          <button type="button" className="bs-text-button" disabled={!ready || index === 0 || showGuide} onClick={openHistory}><MessageCircle size={18} aria-hidden="true" /><span>Minha conversa</span></button>
          <button type="button" className="bs-text-button" disabled={!ready || !started || showGuide} onClick={restart}><RotateCcw size={17} aria-hidden="true" /><span>Recomeçar</span></button>
        </nav>
      </header>
      <div className="bs-layout">
        <aside className="bs-sidebar" aria-label="Sua história">
          <p className="bs-eyebrow">{showGuide ? "Conheça seu modo de aprender" : "Uma história para participar"}</p>
          <h1 className="bs-story-title">Um lugar<br />na história.</h1>
          <p className="bs-description">Uma livraria. Uma cadeira vazia. Uma conversa que pode continuar amanhã.</p>
          <div className="bs-role"><span className="bs-role-avatar">B</span><span><small className="bs-role-label">Nesta história, você é</small><strong>Ben</strong></span></div>
          <ol className="bs-progress" aria-label={showGuide ? "Passos da apresentação" : "Momentos da história"}>
            {progressItems.map((item, i) => (
              <li key={item.id} className={"bs-progress-item" + (ready && i < progressIndex ? " is-done" : "") + (ready && progressActive && i === progressIndex ? " is-current" : "")} aria-current={ready && progressActive && i === progressIndex ? "step" : undefined}>
                <span className="bs-progress-dot">{ready && i < progressIndex ? <Check size={14} aria-hidden="true" /> : String(i + 1).padStart(2, "0")}</span><span className="bs-progress-label">{item.label}</span>
              </li>
            ))}
          </ol>
          <div className="bs-sidebar-footer"><MapPin size={16} aria-hidden="true" /><span>Maple Books<br />Sábado à tarde · Parte 1</span></div>
        </aside>
        <main className="bs-stage" ref={stageRef} id="bs-story-main">
          <div className="bs-stage-top"><span className="bs-chapter-label"><BookOpen size={16} aria-hidden="true" /> {showGuide ? "Antes de entrar na história" : view === "theory" && complete ? "Depois da conversa" : "O livro entre nós"}</span><span className="bs-moment-count">{showGuide ? "Guia " + (guide.step + 1) + " de " + guideSteps.length : ready && started ? complete ? "6 / 6 momentos" : String(index + 1).padStart(2, "0") + " / 06" : "Seu primeiro encontro"}</span></div>
          <div className="bs-stage-body">
            {!ready ? <p className="bs-context">Preparando sua história…</p> : showGuide ? (
              <BookshopOnboarding step={guide.step} returning={started} canSave={!storageUnavailable} onStepChange={step => setGuide(current => ({ ...current, step }))} onFinish={finishGuide} />
            ) : complete && view === "theory" ? <BookshopTheory events={snapshot.events} onBack={() => setView("story")} onHistory={openHistory} /> : <>
              <ViewportFit>{!started ? <div className="bs-welcome">
                <p className="bs-eyebrow">Bem-vindo à BasedSpeak</p>
                <h2 className="bs-welcome-title">Uma conversa começa.<br />Você faz parte dela.</h2>
                <p className="bs-lead">Você é Ben. Chegou à cidade há poucos dias e entra numa livraria para conhecer o lugar. Uma cadeira vazia pode ser o começo de uma amizade.</p>
                <div className="bs-start-notes">
                  <div className="bs-start-note"><MessageCircle size={22} aria-hidden="true" /><div><strong>Escolha como quer falar.</strong><p>Duas formas em inglês, com o significado em português junto de cada uma.</p></div></div>
                  <div className="bs-start-note"><PencilLine size={22} aria-hidden="true" /><div><strong>Participe do que acontece.</strong><p>Suas falas e pequenas ações fazem a conversa seguir.</p></div></div>
                  <div className="bs-start-note"><Lightbulb size={22} aria-hidden="true" /><div><strong>Entenda os detalhes depois.</strong><p>A teoria retoma a conversa quando a história terminar.</p></div></div>
                </div>
                <p className="bs-translation">{storageUnavailable ? "O navegador não permite salvar; você pode fazer este percurso nesta aba." : "Seu avanço neste teste fica salvo neste navegador."}</p>
              </div> : complete ? renderEnd() : renderStory()}</ViewportFit>
              {renderStoryFooter()}
            </>}
          </div>
        </main>
      </div>
      <dialog className="bs-dialog" ref={historyRef} aria-labelledby="bs-history-title">
        <div className="bs-dialog-heading"><div><p className="bs-eyebrow">Seu percurso até aqui</p><h2 id="bs-history-title">Minha conversa</h2></div><button type="button" className="bs-text-button" onClick={() => historyRef.current?.close()} aria-label="Fechar conversa"><X size={22} aria-hidden="true" /></button></div>
        <div className="bs-dialog-body">
          <ViewportFit>{!ready || snapshot.events.length === 0 ? <p className="bs-empty">Suas escolhas aparecem aqui assim que a conversa começa.</p> : (() => {
            const i = Math.min(historyPage, snapshot.events.length - 1);
            const event = snapshot.events[i];
            const item = scenes[i];
            const chosen = chosenPhrase(item, event);
            return (
              <article className="bs-history-item" key={event.sceneId}>
                <p className="bs-eyebrow">0{i + 1} · {item.label}</p>
                {item.incoming && <Line speaker="Lara" phrase={item.incoming} />}
                {chosen && <Line speaker="Ben" phrase={chosen} />}
                {item.kind === "bookmark" && !event.assisted && <p className="bs-gesture">Você entrega o marcador azul.</p>}
                {event.assisted && <p className="bs-chosen-tag">Você seguiu com apoio nesta atividade.</p>}
                <p className="bs-gesture">{gestureFor(item, event)}</p>
                <Line speaker="Lara" phrase={responseFor(item, event)} />
              </article>
            );
          })()}</ViewportFit>
        </div>
        <nav className="bs-page-navigation" aria-label="Páginas da minha conversa">
          <button type="button" className="bs-secondary" disabled={!ready || historyPage === 0} onClick={() => setHistoryPage(page => page - 1)}><ArrowLeft size={17} aria-hidden="true" /> Anterior</button>
          <span>{ready ? Math.min(historyPage + 1, Math.max(1, index)) : 1} de {ready ? Math.max(1, index) : 1}</span>
          <button type="button" className="bs-secondary" disabled={!ready || historyPage >= index - 1} onClick={() => setHistoryPage(page => page + 1)}>Próximo <ArrowRight size={17} aria-hidden="true" /></button>
        </nav>
      </dialog>
    </div>
  );
}

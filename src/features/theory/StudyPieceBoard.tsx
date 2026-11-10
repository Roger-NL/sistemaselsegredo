"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { GripVertical, MoveUp, X } from "lucide-react";
import { BrowserText } from "@/components/i18n/BrowserText";
import { playInteractionSound } from "@/components/interaction/sounds";
import "./study-pieces.css";

type Destination = { kind: "slot"; index: number } | { kind: "bank" };
type Gesture = { token: number; source: "bank" | "slot"; pointerId: number; startX: number; startY: number; dragging: boolean; element: HTMLButtonElement };
type DragView = { token: number; x: number; y: number; destination: Destination | null };
export type StudyPieceBoardProps = {
  tokens: string[]; selected: number[]; onChange: (next: number[]) => void;
  slots: number; locked: boolean; mode?: "sequence" | "reply"; cue?: string;
};

/** A piece index keeps repeated words distinct. This board never grades or submits. */
export function StudyPieceBoard({ tokens, selected, onChange, slots, locked, mode = "sequence", cue }: StudyPieceBoardProps) {
  const capacity = mode === "reply" ? 1 : Math.max(0, slots);
  const board = useRef<HTMLDivElement>(null);
  const instruction = useId();
  const gesture = useRef<Gesture | null>(null);
  const keyboardFocus = useRef<{ token: number; placed: boolean } | null>(null);
  const suppressClick = useRef(false);
  const latest = useRef({ tokens, selected, onChange, capacity, locked, mode });
  const [drag, setDrag] = useState<DragView | null>(null);
  useLayoutEffect(() => { latest.current = { tokens, selected, onChange, capacity, locked, mode }; }, [tokens, selected, onChange, capacity, locked, mode]);
  useLayoutEffect(() => {
    const pending = keyboardFocus.current;
    if (!pending) return;
    keyboardFocus.current = null;
    const selector = pending.placed ? ".study-piece-placed" : ".study-piece-option";
    board.current?.querySelector<HTMLButtonElement>(selector + '[data-piece-token="' + pending.token + '"]')?.focus({ preventScroll: true });
  }, [selected]);

  function commit(next: number[]) {
    const current = latest.current;
    if (current.locked || next.length > current.capacity || next.length === current.selected.length && next.every((value, index) => value === current.selected[index])) return;
    current.onChange(next);
    void playInteractionSound("click");
  }
  function activate(token: number) {
    const current = latest.current;
    if (current.locked) return;
    if (current.selected.includes(token)) commit(current.selected.filter(value => value !== token));
    else if (current.mode === "reply") commit([token]);
    else if (current.selected.length < current.capacity) commit([...current.selected, token]);
  }
  function pointerDown(event: PointerEvent<HTMLButtonElement>, token: number, source: Gesture["source"]) {
    if (latest.current.locked || event.button !== 0 || event.isPrimary === false) return;
    suppressClick.current = false;
    gesture.current = { token, source, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, dragging: false, element: event.currentTarget };
    // Leave tap/click intact. Start capture only after movement crosses the
    // threshold; touch-action:none reserves the tile gesture for dragging.
  }
  function click(event: MouseEvent<HTMLButtonElement>, token: number) {
    if (suppressClick.current && event.detail > 0) { suppressClick.current = false; event.preventDefault(); return; }
    // Virtual clicks from keyboards or assistive technology have detail=0.
    suppressClick.current = false;
    activate(token);
  }
  function keyDown(event: KeyboardEvent<HTMLButtonElement>, token: number) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    suppressClick.current = false;
    keyboardFocus.current = { token, placed: !latest.current.selected.includes(token) };
    activate(token);
  }

  useEffect(() => {
    const release = (pending: Gesture) => {
      if (!pending.dragging) return;
      try { pending.element.releasePointerCapture?.(pending.pointerId); } catch { /* Capture may already have ended. */ }
    };
    const clear = () => {
      const pending = gesture.current;
      gesture.current = null;
      if (pending) release(pending);
      setDrag(null);
    };
    const destinationAt = (x: number, y: number): Destination | null => {
      const element = typeof document.elementFromPoint === "function" ? document.elementFromPoint(x, y) : null;
      if (!element || !board.current?.contains(element)) return null;
      const slot = element.closest<HTMLElement>("[data-study-drop-slot]");
      if (slot) {
        const index = Number(slot.dataset.studyDropSlot);
        return Number.isInteger(index) && index >= 0 && index < latest.current.capacity ? { kind: "slot", index } : null;
      }
      return element.closest("[data-study-piece-bank]") ? { kind: "bank" } : null;
    };
    const move = (event: globalThis.PointerEvent) => {
      const pending = gesture.current;
      if (!pending || event.pointerId !== pending.pointerId || latest.current.locked) return;
      if (!pending.dragging) {
        if (Math.hypot(event.clientX - pending.startX, event.clientY - pending.startY) < 8) return;
        pending.dragging = true;
        try { pending.element.setPointerCapture?.(pending.pointerId); } catch { /* Document listeners also support browsers without capture. */ }
      }
      event.preventDefault();
      setDrag({ token: pending.token, x: event.clientX, y: event.clientY, destination: destinationAt(event.clientX, event.clientY) });
    };
    const up = (event: globalThis.PointerEvent) => {
      const pending = gesture.current;
      if (!pending || event.pointerId !== pending.pointerId) return;
      if (!pending.dragging) { clear(); return; } // The browser still delivers the ordinary tap click.
      event.preventDefault();
      suppressClick.current = true;
      const destination = destinationAt(event.clientX, event.clientY);
      clear();
      const current = latest.current;
      if (!destination || current.locked) return;
      const wasPlaced = current.selected.includes(pending.token);
      if (destination.kind === "bank") {
        if (wasPlaced) commit(current.selected.filter(value => value !== pending.token));
        return;
      }
      if (current.mode === "reply") { commit([pending.token]); return; }
      if (!wasPlaced && current.selected.length >= current.capacity) return;
      const next = current.selected.filter(value => value !== pending.token);
      // Empty later slots append to the dense answer instead of creating holes.
      next.splice(Math.min(destination.index, next.length), 0, pending.token);
      commit(next);
    };
    const cancel = (event: globalThis.PointerEvent) => {
      if (gesture.current?.pointerId !== event.pointerId) return;
      if (gesture.current.dragging) suppressClick.current = true;
      clear();
    };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape" || !gesture.current) return;
      if (gesture.current.dragging) suppressClick.current = true;
      clear();
    };
    const lost = (event: globalThis.PointerEvent) => {
      if (gesture.current?.dragging && gesture.current.pointerId === event.pointerId) cancel(event);
    };
    document.addEventListener("pointermove", move, { passive: false });
    document.addEventListener("pointerup", up);
    document.addEventListener("pointercancel", cancel);
    document.addEventListener("lostpointercapture", lost);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up);
      document.removeEventListener("pointercancel", cancel); document.removeEventListener("lostpointercapture", lost);
      document.removeEventListener("keydown", escape);
      const pending = gesture.current; gesture.current = null;
      if (pending) release(pending);
    };
    // The gesture reads current props through latest; listeners stay stable while
    // the ghost moves and across the parent's controlled selection updates.
  }, []);

  const isDragging = (token: number) => !locked && drag?.token === token;
  const dialogue = cue?.match(/^([^:]+):\s*“(.+)”$/);
  const instructionText = mode === "reply" ? "Arraste a resposta" : "Arraste as palavras";
  const spare = tokens.length - capacity;
  return <div className="study-piece-board" ref={board} data-mode={mode} data-locked={locked}>
    {cue && <div className="study-piece-cue" data-dialogue={Boolean(dialogue)}>
      {dialogue && <span className="study-piece-avatar" aria-hidden="true">{dialogue[1].slice(0, 1)}</span>}
      <p>{dialogue ? <><span className="study-piece-speaker"><BrowserText>{dialogue[1]}</BrowserText></span><span lang="en" translate="no"><BrowserText>{dialogue[2]}</BrowserText></span></> : <BrowserText>{cue}</BrowserText>}</p>
    </div>}
    <p id={instruction} className="study-sr-only"><BrowserText>{locked ? "Resposta preenchida." : "Arraste ou toque para colocar. Use Tab e Enter pelo teclado. Toque na peça colocada para devolver; arraste para mudar a ordem."}</BrowserText></p>
    <div className="study-piece-answer" aria-label={mode === "reply" ? "Sua fala" : "Sua frase"} data-empty={selected.length === 0}>
      {mode === "sequence" && <div className="study-piece-answer-meta"><span>Sua frase</span><span aria-hidden="true">{selected.length}/{capacity}</span></div>}
      <ol className="study-piece-slots">
        {Array.from({ length: capacity }, (_, index) => {
          const token = selected[index];
          const placed = token !== undefined;
          return <li key={index} className="study-piece-slot" data-study-drop-slot={index} data-next={!locked && index === selected.length} data-drag-over={!locked && drag?.destination?.kind === "slot" && drag.destination.index === index}>
            {placed ? <button type="button" className="study-piece-button study-piece-placed" data-piece-token={token} lang="en" translate="no" data-ui-sound="none" data-dragging={isDragging(token)} disabled={locked} aria-label={`Devolver ${tokens[token]} ao banco`} aria-describedby={instruction} onPointerDown={event => pointerDown(event, token, "slot")} onClick={event => click(event, token)} onKeyDown={event => keyDown(event, token)}><BrowserText>{tokens[token]}</BrowserText>{!locked && <X className="study-piece-return" size={15} aria-hidden="true" />}</button>
              : <span className="study-piece-empty">{mode === "reply" ? <><MoveUp size={20} aria-hidden="true" /><BrowserText>{drag?.destination?.kind === "slot" ? "Pode soltar" : "Solte aqui"}</BrowserText></> : <span className="study-piece-number" aria-hidden="true">{index + 1}</span>}</span>}
          </li>;
        })}
      </ol>
    </div>
    <div className="study-piece-bank" hidden={locked} data-study-piece-bank="" data-drag-over={!locked && drag?.destination?.kind === "bank"} role="group" aria-label={mode === "reply" ? "Respostas disponíveis" : "Peças disponíveis"}>
      <p className="study-piece-instruction"><GripVertical size={17} aria-hidden="true" /><strong><BrowserText>{instructionText}</BrowserText></strong><span>ou toque</span></p>
      <div className="study-piece-options">{tokens.map((token, index) => <button key={index} type="button" className="study-piece-button study-piece-option" data-piece-token={index} lang="en" translate="no" data-ui-sound="none" hidden={selected.includes(index)} data-used={selected.includes(index)} data-dragging={isDragging(index)} disabled={locked || selected.includes(index) || mode === "sequence" && selected.length >= capacity} aria-label={`Usar ${token}`} aria-describedby={instruction} onPointerDown={event => pointerDown(event, index, "bank")} onClick={event => click(event, index)} onKeyDown={event => keyDown(event, index)}><GripVertical className="study-piece-grip" size={17} aria-hidden="true" /><BrowserText>{token}</BrowserText></button>)}</div>
      {mode === "sequence" && spare > 0 && <p className="study-piece-spare"><BrowserText>{spare === 1 ? "1 palavra sobra." : `${spare} palavras sobram.`}</BrowserText></p>}
    </div>
    <p className="study-piece-progress study-sr-only" role="status" aria-live="polite" aria-atomic="true"><BrowserText>{locked ? mode === "reply" ? "Resposta pronta. Continue no botão abaixo." : "Frase pronta. Continue no botão abaixo." : mode === "reply" ? selected.length ? "Resposta escolhida. Você pode conferir ou trocar." : "Escolha uma resposta para levar à conversa." : `${selected.length} de ${capacity} peças na frase.${selected.length < capacity ? ` Próximo espaço: ${selected.length + 1}.` : " Você pode conferir ou devolver uma peça para trocar."}`}</BrowserText></p>
    {!locked && drag && typeof document !== "undefined" && createPortal(<div className="study-piece-ghost" aria-hidden="true" lang="en" translate="no" style={{ left: drag.x, top: drag.y }}><GripVertical size={17} /><BrowserText>{tokens[drag.token]}</BrowserText></div>, document.body)}
  </div>;
}

"use client";

import {
  createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState,
  type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent, type ReactNode,
} from "react";
import "./lesson-drag.css";

export type DragItem = { id: string; kind: "phrase" | "person" | "word"; value: string; label: string };
type Target = { id: string; label: string; element: HTMLElement; accept?: DragItem["kind"][]; disabled?: boolean };
type Session = {
  item: DragItem; source: HTMLElement; pointerId: number; startX: number; startY: number;
  x: number; y: number; time: number; velocityX: number; velocityY: number;
  rect: DOMRect; active: boolean; ghost: HTMLDivElement | null; target: Target | null;
};
type DragContext = {
  selected: DragItem | null;
  cancel: () => void;
  providerId: string;
  instructionsId: string;
  select: (item: DragItem, source: HTMLElement) => void;
  begin: (event: ReactPointerEvent<HTMLElement>, item: DragItem) => void;
  suppressClick: (event: ReactMouseEvent<HTMLElement>) => boolean;
  register: (target: Target) => () => void;
  activate: (id: string) => void;
  removeSource: (element: HTMLElement) => void;
};

const Context = createContext<DragContext | null>(null);
const INTERACTIVE = 'button,a[href],input,select,textarea,summary,[role="button"],[role="link"],[contenteditable="true"],[tabindex]:not([tabindex="-1"])';
const THRESHOLD = 6;

function accepts(target: Target, item: DragItem) {
  return !target.disabled && target.element.isConnected && (!target.accept || target.accept.includes(item.kind));
}

function makeGhost(source: HTMLElement, rect: DOMRect) {
  const ghost = document.createElement("div");
  ghost.className = "lesson-drag-ghost";
  ghost.setAttribute("aria-hidden", "true");
  ghost.inert = true;
  ghost.style.width = `${rect.width}px`;
  ghost.style.height = `${rect.height}px`;
  const clone = source.cloneNode(true) as HTMLElement;
  for (const element of [clone, ...clone.querySelectorAll<HTMLElement>("*")]) {
    element.removeAttribute("id");
    element.removeAttribute("aria-describedby");
    element.removeAttribute("data-lesson-drag-source");
    element.removeAttribute("data-lesson-drop");
    if (element.matches(INTERACTIVE)) element.tabIndex = -1;
  }
  const style = getComputedStyle(source);
  Object.assign(clone.style, {
    width: "100%", height: "100%", minWidth: "0", margin: "0", transform: "none", opacity: "1",
    font: style.font, color: style.color, background: style.background, borderRadius: style.borderRadius,
    border: style.border, padding: style.padding, boxSizing: "border-box",
  });
  const originals = source.querySelectorAll("canvas");
  clone.querySelectorAll("canvas").forEach((canvas, index) => {
    const original = originals[index];
    if (!original) return;
    canvas.width = original.width;
    canvas.height = original.height;
    try { canvas.getContext("2d")?.drawImage(original, 0, 0); } catch { /* A restricted canvas keeps the item's label. */ }
  });
  ghost.append(clone);
  // A body portal is painted underneath a modal dialog, regardless of z-index.
  // Keep fixed viewport coordinates, but render in the source's top layer.
  (source.closest<HTMLDialogElement>("dialog[open]") ?? document.body).append(ghost);
  return ghost;
}

function moveGhost(session: Session, clientX: number, clientY: number) {
  const x = session.rect.left + clientX - session.startX;
  const y = session.rect.top + clientY - session.startY;
  if (session.ghost) session.ghost.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

export function LessonDragProvider({ onDrop, onSelect, children }: { onDrop: (item: DragItem, targetId: string) => void; onSelect?: (item: DragItem) => void; children?: ReactNode }) {
  const providerId = useId();
  const instructionsId = `${providerId}-instructions`;
  const onDropRef = useRef(onDrop);
  const onSelectRef = useRef(onSelect);
  const mounted = useRef(true);
  const targets = useRef(new Map<string, Target>());
  const session = useRef<Session | null>(null);
  const selection = useRef<{ item: DragItem; source: HTMLElement } | null>(null);
  const suppressed = useRef<{ source: HTMLElement; until: number } | null>(null);
  const settling = useRef<{ ghost: HTMLElement; frame: number } | null>(null);
  const [selected, setSelected] = useState<DragItem | null>(null);
  const [announcement, setAnnouncement] = useState("");

  useLayoutEffect(() => { onDropRef.current = onDrop; }, [onDrop]);
  useLayoutEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  const stopSettling = useCallback(() => {
    if (!settling.current) return;
    cancelAnimationFrame(settling.current.frame);
    settling.current.ghost.remove();
    settling.current = null;
  }, []);

  const setSelection = useCallback((next: { item: DragItem; source: HTMLElement } | null) => {
    selection.current = next;
    if (mounted.current) setSelected(next?.item ?? null);
  }, []);

  const detach = useCallback((keepGhost = false) => {
    const current = session.current;
    session.current = null;
    if (!current) return null;
    current.source.removeAttribute("data-lesson-dragging");
    current.target?.element.removeAttribute("data-lesson-drop-active");
    try {
      if (current.source.hasPointerCapture?.(current.pointerId)) current.source.releasePointerCapture(current.pointerId);
    } catch { /* The source may have unmounted during a round change. */ }
    if (!keepGhost) current.ghost?.remove();
    return current;
  }, []);

  const cancel = useCallback(() => {
    const current = detach();
    if (current?.active) suppressed.current = { source: current.source, until: Date.now() + 700 };
    stopSettling();
    const hadSelection = Boolean(selection.current || current);
    setSelection(null);
    if (mounted.current && hadSelection) setAnnouncement("Seleção cancelada.");
  }, [detach, setSelection, stopSettling]);

  const hitTarget = useCallback((x: number, y: number, item: DragItem) => {
    const elements = document.elementsFromPoint ? document.elementsFromPoint(x, y) : [document.elementFromPoint?.(x, y)].filter(Boolean) as Element[];
    for (const element of elements) {
      const candidate = element.closest<HTMLElement>("[data-lesson-drop]");
      if (!candidate || candidate.dataset.lessonDragProvider !== providerId) continue;
      const target = targets.current.get(candidate.dataset.lessonDrop ?? "");
      if (target && target.element === candidate && accepts(target, item)) return target;
    }
    return null;
  }, [providerId]);

  const finishDrop = useCallback((item: DragItem, target: Target) => {
    // Clear selection and pointer state before a callback can synchronously change the round.
    detach();
    stopSettling();
    setSelection(null);
    if (mounted.current) setAnnouncement(`${item.label} colocado em ${target.label}.`);
    onDropRef.current(item, target.id);
  }, [detach, setSelection, stopSettling]);

  const returnGhost = useCallback((current: Session) => {
    const ghost = current.ghost;
    if (!ghost) return;
    if (!current.source.isConnected || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      ghost.remove();
      return;
    }
    const home = current.source.getBoundingClientRect();
    let x = current.rect.left + current.x - current.startX;
    let y = current.rect.top + current.y - current.startY;
    let velocityX = current.velocityX, velocityY = current.velocityY;
    let last = performance.now(), elapsed = 0;
    const spring = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.025);
      last = now; elapsed += dt;
      velocityX += (-440 * (x - home.left) - 36 * velocityX) * dt;
      velocityY += (-440 * (y - home.top) - 36 * velocityY) * dt;
      x += velocityX * dt; y += velocityY * dt;
      ghost.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (elapsed > 0.5 || Math.hypot(x - home.left, y - home.top) < 0.5 && Math.hypot(velocityX, velocityY) < 6) {
        ghost.remove(); settling.current = null;
      } else if (settling.current) settling.current.frame = requestAnimationFrame(spring);
    };
    stopSettling();
    settling.current = { ghost, frame: requestAnimationFrame(spring) };
  }, [stopSettling]);

  const select = useCallback((item: DragItem, source: HTMLElement) => {
    stopSettling();
    if (selection.current?.source === source) { cancel(); onSelectRef.current?.(item); return; }
    setSelection({ item: { ...item }, source });
    setAnnouncement(`${item.label} selecionado. Escolha um destino ou pressione Esc para cancelar.`);
    onSelectRef.current?.(item);
  }, [cancel, setSelection, stopSettling]);

  const begin = useCallback((event: ReactPointerEvent<HTMLElement>, item: DragItem) => {
    if (event.button !== 0 || event.isPrimary === false) return;
    detach(); stopSettling();
    const source = event.currentTarget;
    const rect = source.getBoundingClientRect();
    session.current = {
      item: { ...item }, source, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY,
      x: event.clientX, y: event.clientY, time: event.timeStamp, velocityX: 0, velocityY: 0,
      rect, active: false, ghost: null, target: null,
    };
    try { source.setPointerCapture(event.pointerId); } catch { /* Document listeners retain delivery in older test/DOM environments. */ }
  }, [detach, stopSettling]);

  const suppressClick = useCallback((event: ReactMouseEvent<HTMLElement>) => {
    const block = suppressed.current;
    if (!block || Date.now() > block.until || event.detail === 0 || !block.source.contains(event.target as Node)) return false;
    suppressed.current = null;
    event.preventDefault(); event.stopPropagation();
    return true;
  }, []);

  const register = useCallback((target: Target) => {
    targets.current.set(target.id, target);
    return () => {
      if (targets.current.get(target.id)?.element === target.element) targets.current.delete(target.id);
      if (session.current?.target?.element === target.element) {
        target.element.removeAttribute("data-lesson-drop-active");
        session.current.target = null;
      }
    };
  }, []);

  const activate = useCallback((id: string) => {
    const current = selection.current;
    const target = targets.current.get(id);
    if (!target || target.disabled) return;
    if (!current) { setAnnouncement("Primeiro selecione um item para colocar aqui."); return; }
    if (!accepts(target, current.item)) { setAnnouncement("Esse destino não recebe este item. Escolha outro destino."); return; }
    finishDrop(current.item, target);
  }, [finishDrop]);

  const removeSource = useCallback((element: HTMLElement) => {
    if (session.current?.source === element || selection.current?.source === element) cancel();
  }, [cancel]);

  useEffect(() => {
    mounted.current = true;
    const move = (event: PointerEvent) => {
      const current = session.current;
      if (!current || event.pointerId !== current.pointerId) return;
      if (!current.source.isConnected || current.source.matches(":disabled")) { cancel(); return; }
      if (!current.active && Math.hypot(event.clientX - current.startX, event.clientY - current.startY) < THRESHOLD) return;
      if (!current.active) {
        current.active = true;
        current.ghost = makeGhost(current.source, current.rect);
        current.source.setAttribute("data-lesson-dragging", "true");
        setSelection({ item: current.item, source: current.source });
        setAnnouncement(`Arrastando ${current.item.label}. Solte sobre um destino.`);
      }
      const seconds = Math.max((event.timeStamp - current.time) / 1000, 0.001);
      current.velocityX = (event.clientX - current.x) / seconds;
      current.velocityY = (event.clientY - current.y) / seconds;
      current.x = event.clientX; current.y = event.clientY; current.time = event.timeStamp;
      moveGhost(current, event.clientX, event.clientY);
      const target = hitTarget(event.clientX, event.clientY, current.item);
      if (current.target?.element !== target?.element) {
        current.target?.element.removeAttribute("data-lesson-drop-active");
        target?.element.setAttribute("data-lesson-drop-active", "true");
        current.target = target;
      }
      if (event.cancelable) event.preventDefault();
    };
    const end = (event: PointerEvent) => {
      const current = session.current;
      if (!current || event.pointerId !== current.pointerId) return;
      if (!current.source.isConnected || current.source.matches(":disabled")) { cancel(); return; }
      if (!current.active) { detach(); return; }
      current.x = event.clientX; current.y = event.clientY;
      suppressed.current = { source: current.source, until: Date.now() + 700 };
      const target = hitTarget(event.clientX, event.clientY, current.item);
      if (target) finishDrop(current.item, target);
      else {
        detach(true); setSelection(null); returnGhost(current);
        setAnnouncement("O item voltou à origem. Você pode tentar outro destino.");
      }
    };
    const pointerCancel = (event: PointerEvent) => { if (session.current?.pointerId === event.pointerId) cancel(); };
    const keyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && (selection.current || session.current)) {
        event.preventDefault(); cancel();
      }
    };
    const blur = () => { if (session.current) cancel(); };
    // iOS may start rubber-banding before PointerEvent movement is delivered.
    // Only this provider's interaction surfaces consume touch gestures.
    const protectedTouch = (event: TouchEvent) => {
      if (!(event.target instanceof Element) || event.target.closest("input,textarea,select,[contenteditable=true]")) return;
      const source = event.target.closest<HTMLElement>("[data-lesson-drag-source]");
      const ownsSource = source?.dataset.lessonDragProvider === providerId;
      if ((ownsSource || session.current) && event.cancelable) event.preventDefault();
    };
    document.addEventListener("touchmove", protectedTouch, { capture: true, passive: false });
    document.addEventListener("pointermove", move, { capture: true, passive: false });
    document.addEventListener("pointerup", end, true);
    document.addEventListener("pointercancel", pointerCancel, true);
    document.addEventListener("keydown", keyDown);
    window.addEventListener("blur", blur);
    return () => {
      mounted.current = false;
      document.removeEventListener("touchmove", protectedTouch, true);
      document.removeEventListener("pointermove", move, true);
      document.removeEventListener("pointerup", end, true);
      document.removeEventListener("pointercancel", pointerCancel, true);
      document.removeEventListener("keydown", keyDown);
      window.removeEventListener("blur", blur);
      detach(); stopSettling();
    };
  }, [cancel, detach, finishDrop, hitTarget, returnGhost, setSelection, stopSettling, providerId]);

  const value = useMemo(() => ({ selected, cancel, providerId, instructionsId, select, begin, suppressClick, register, activate, removeSource }),
    [selected, cancel, providerId, instructionsId, select, begin, suppressClick, register, activate, removeSource]);
  return <Context.Provider value={value}>
    {children}
    <span id={instructionsId} className="lesson-drag-sr-only">Arraste até um destino ou selecione o item e depois o destino. Enter e Espaço também selecionam. Esc cancela.</span>
    <div className="lesson-drag-sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>
  </Context.Provider>;
}

function useDragContext() {
  const context = useContext(Context);
  if (!context) throw new Error("Os controles da lição precisam de LessonDragProvider.");
  return context;
}

export function useLessonDrag(): { selected: DragItem | null; cancel: () => void } {
  const { selected, cancel } = useDragContext();
  return { selected, cancel };
}

export function DragSource({ item, children, className, disabled = false, onClick }: {
  item: DragItem; children?: ReactNode; className?: string; disabled?: boolean; onClick?: () => void;
}) {
  const { selected, providerId, instructionsId, select, begin, suppressClick, removeSource } = useDragContext();
  const ref = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    if (disabled && element) removeSource(element);
    return () => { if (element) removeSource(element); };
  }, [item.id, item.kind, item.value, disabled, removeSource]);
  return <button ref={ref} type="button" className={`lesson-drag-source${className ? ` ${className}` : ""}`}
    data-lesson-drag-source={item.id} data-lesson-drag-provider={providerId} data-drag-kind={item.kind} aria-label={item.label} aria-describedby={instructionsId}
    aria-pressed={selected?.id === item.id && selected.kind === item.kind} disabled={disabled} draggable={false}
    onDragStart={event => event.preventDefault()}
    onPointerDown={event => { if (!disabled) begin(event, item); }}
    onClick={event => {
      if (disabled || event.defaultPrevented || suppressClick(event)) return;
      select(item, event.currentTarget); onClick?.();
    }}>{children}</button>;
}

export function DropTarget({ id, accept, label, children, className, disabled = false }: {
  id: string; accept?: DragItem["kind"][]; label: string; children?: ReactNode; className?: string; disabled?: boolean;
}) {
  const { selected, providerId, instructionsId, register, activate } = useDragContext();
  const ref = useRef<HTMLDivElement>(null);
  const [hasInteractiveChild, setHasInteractiveChild] = useState(true);
  const setRef = useCallback((element: HTMLDivElement | null) => {
    ref.current = element;
    if (element) setHasInteractiveChild(Boolean(element.querySelector(INTERACTIVE)));
  }, []);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    return register({ id, label, element, accept, disabled });
  }, [id, label, accept, disabled, register]);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new MutationObserver(() => setHasInteractiveChild(Boolean(element.querySelector(INTERACTIVE))));
    observer.observe(element, { childList: true, subtree: true, attributes: true, attributeFilter: ["role", "tabindex", "href"] });
    return () => observer.disconnect();
  }, []);
  const unavailable = disabled || Boolean(selected && accept && !accept.includes(selected.kind));
  function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || !["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    if (!disabled) activate(id);
  }
  return <div ref={setRef} className={`lesson-drop-target${className ? ` ${className}` : ""}`}
    data-lesson-drop={id} data-lesson-drag-provider={providerId} data-drop-accept={accept?.join(" ")}
    role={hasInteractiveChild ? "group" : "button"} tabIndex={hasInteractiveChild || disabled ? undefined : 0}
    aria-label={label} aria-describedby={hasInteractiveChild ? undefined : instructionsId} aria-disabled={hasInteractiveChild ? undefined : unavailable}
    data-drop-disabled={disabled}
    data-drop-available={Boolean(selected && !unavailable)} onKeyDown={onKeyDown}
    onClick={event => {
      if (disabled || event.defaultPrevented) return;
      const control = (event.target as Element).closest('a,input,select,textarea,[contenteditable="true"]');
      if (!control) activate(id);
    }}>{children}</div>;
}

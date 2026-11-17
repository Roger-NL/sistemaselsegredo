"use client";

import dynamic from "next/dynamic";
import { Ear, MessageCircle, Users } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import type { CharacterCue } from "./AnimatedCharacter";
import type { LessonSpeechDriver } from "./lesson-audio";
import { DragSource, DropTarget, useLessonDrag } from "./LessonDrag";
import type { PersonId, Round } from "./lesson-one";
import "./lesson-stage.css";

const Character = dynamic(() => import("./AnimatedCharacter").then(module => module.AnimatedCharacter), { ssr: false });

const NAMES: Record<PersonId, string> = { ana: "Ana", leo: "Leo", maya: "Maya", sam: "Sam", nina: "Nina" };
const PEOPLE: PersonId[] = ["ana", "leo", "maya", "nina", "sam"];

export type LessonStageProps = {
  round: Round;
  children?: ReactNode;
  /** Public speech is anchored above its speaker; neutral puzzles stay unowned. */
  speechContent?: ReactNode;
  teamOverride?: PersonId[];
  speakerOverride?: PersonId;
  onPersonClick?: (person: PersonId) => void;
  cue?: { person: PersonId; name: CharacterCue; key: number } | null;
  selectedPerson?: PersonId;
  compact?: boolean;
  speech?: LessonSpeechDriver;
  onCharacterReady?: (person: PersonId) => void;
  phraseRecipients?: PersonId[];
  tutorialCuePerson?: PersonId;
  /** A free reaction only; lesson choices and phrase delivery keep their own handlers. */
  allowIdleTaps?: boolean;
};

type IdleTapCue = { name: "yes" | "idle"; key: number };
type IdleTapState = { scope: string; people: Partial<Record<PersonId, IdleTapCue>> };

/**
 * The scene shows facts, never the expected grammatical answer. In speaker
 * puzzles there is no speaker until the learner chooses one. Anonymous
 * messages likewise have no link to the typed placeholder speaker.
 */
export function LessonStage({ round, children, speechContent, teamOverride, speakerOverride, onPersonClick, cue, selectedPerson, compact = false, speech, onCharacterReady, phraseRecipients, tutorialCuePerson, allowIdleTaps = false }: LessonStageProps) {
  const { selected: dragSelection } = useLessonDrag();
  const tapScope = `${round.id}:${allowIdleTaps}:${cue?.person ?? ""}:${cue?.name ?? ""}:${cue?.key ?? ""}`;
  const [tapState, setTapState] = useState<IdleTapState>(() => ({ scope: tapScope, people: {} }));
  const tapTimers = useRef(new Map<PersonId, number>());
  const activeTaps = useRef(new Map<PersonId, number>());
  const lastTapAt = useRef(new Map<PersonId, number>());
  const tapSequence = useRef(0);
  const stageRef = useRef<HTMLElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const tailRef = useRef<SVGPathElement>(null);
  const peopleMarkerRef = useRef<HTMLDivElement>(null);

  // Reset this interaction state before committing a different activity or a
  // new externally authored cue. This preserves the existing Rive instance.
  if (tapState.scope !== tapScope) setTapState({ scope: tapScope, people: {} });

  useEffect(() => {
    const timers = tapTimers.current, taps = activeTaps.current, cooldowns = lastTapAt.current;
    function clearTimers() { for (const timer of timers.values()) window.clearTimeout(timer); timers.clear(); }
    const unsubscribe = speech?.subscribeFrame(frame => {
      if (!frame.playing || !taps.size) return;
      const cancelled = [...taps.keys()];
      taps.clear(); clearTimers();
      setTapState(previous => {
        if (previous.scope !== tapScope) return previous;
        const people = { ...previous.people };
        for (const person of cancelled) if (people[person]) people[person] = { ...people[person]!, name: "idle" };
        return { scope: tapScope, people };
      });
    });
    return () => { unsubscribe?.(); clearTimers(); taps.clear(); cooldowns.clear(); };
  }, [speech, tapScope]);

  function clickPerson(person: PersonId, event: MouseEvent<HTMLButtonElement>) {
    // Preserve the course's existing click even when a free reaction is refused.
    onPersonClick?.(person);
    if (!allowIdleTaps || dragSelection || event.defaultPrevented || speech?.getFrame().playing
      || event.currentTarget.closest('[data-drop-available="true"]')) return;
    const now = Date.now(), previous = lastTapAt.current.get(person);
    if (previous !== undefined && now - previous < 200) return;
    lastTapAt.current.set(person, now);
    const previousTimer = tapTimers.current.get(person);
    if (previousTimer !== undefined) window.clearTimeout(previousTimer);
    // Negative keys distinguish free taps from the positive lesson cue counter.
    const key = -(++tapSequence.current);
    activeTaps.current.set(person, key);
    setTapState(state => ({ scope: tapScope, people: { ...(state.scope === tapScope ? state.people : {}), [person]: { name: "yes", key } } }));
    const timer = window.setTimeout(() => {
      if (activeTaps.current.get(person) !== key) return;
      activeTaps.current.delete(person); tapTimers.current.delete(person);
      setTapState(state => state.scope === tapScope && state.people[person]?.key === key
        ? { scope: tapScope, people: { ...state.people, [person]: { name: "idle", key } } } : state);
    }, 1100);
    tapTimers.current.set(person, timer);
  }
  const team = PEOPLE.filter(person => (teamOverride ?? round.team).includes(person));
  const speaker = round.anonymous ? undefined : speakerOverride ?? (round.kind === "speaker" ? undefined : round.speaker);
  const listener = round.listener;
  const showTeam = team.length > 0 || round.kind === "join";
  const active = new Set<PersonId>([listener, ...team, ...(round.candidateSpeakers ?? [])]);
  if (speaker) active.add(speaker);
  if (!round.anonymous && round.referent !== "team") active.add(round.referent);
  const outside = PEOPLE.filter(person => active.has(person) && !team.includes(person));
  const allPeople = PEOPLE.filter(person => active.has(person));
  const visualOrder = [...team, ...outside];
  const draggablePeople = round.kind === "join" || round.kind === "messages" ? round.candidateSpeakers ?? [] : [];
  const canReceivePhrase = ["bubbles", "build", "verb"].includes(round.kind);
  const teamNames = team.map(person => NAMES[person]).join(", ");
  const description = round.anonymous
    ? `${NAMES[listener]} recebe as mensagens. ${teamNames ? `A equipe é formada por ${teamNames}.` : ""}`
    : speaker
      ? `${NAMES[speaker]} fala com ${NAMES[listener]}.${teamNames ? ` A equipe é formada por ${teamNames}.` : ""}`
      : `Escolha quem fala com ${NAMES[listener]}.${teamNames ? ` A equipe é formada por ${teamNames}.` : ""}`;
  const anchorPeopleKey = (round.candidateSpeakers?.length ? round.candidateSpeakers : allPeople).join(",");

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let disposed = false;
    const observed = new Set<Element>();
    const observe = (element: Element | null) => {
      if (element && !observed.has(element)) { observed.add(element); observer?.observe(element); }
    };
    const layout = () => {
      if (disposed) return;
      const stageRect = stage.getBoundingClientRect();
      if (stageRect.width <= 0 || stageRect.height <= 0) return;
      const candidates = anchorPeopleKey.split(",") as PersonId[];
      const people = [...stage.querySelectorAll<HTMLElement>("[data-stage-person]")].filter(element => candidates.includes(element.dataset.stagePerson as PersonId));
      const rects = people.map(element => { observe(element); return element.getBoundingClientRect(); }).filter(rect => rect.width > 0 && rect.height > 0);
      const marker = peopleMarkerRef.current;
      if (marker && rects.length) {
        const left = Math.min(...rects.map(rect => rect.left)), top = Math.min(...rects.map(rect => rect.top));
        Object.assign(marker.style, { left: `${left - stageRect.left}px`, top: `${top - stageRect.top}px`, width: `${Math.max(...rects.map(rect => rect.right)) - left}px`, height: `${Math.max(...rects.map(rect => rect.bottom)) - top}px` });
      }
      const anchor = anchorRef.current, bubble = bubbleRef.current;
      if (!speechContent || !anchor || !bubble) return;
      observe(bubble);
      const world = stage.querySelector<HTMLElement>(".ls-world");
      observe(world);
      const worldRect = world?.getBoundingClientRect() ?? stageRect;
      const worldLeft = worldRect.left - stageRect.left;
      const maxWidth = Math.max(160, Math.min(340, worldRect.width - 24));
      if (anchor.style.maxWidth !== `${maxWidth}px`) anchor.style.maxWidth = `${maxWidth}px`;
      const bubbleRect = bubble.getBoundingClientRect();
      if (bubbleRect.width <= 0 || bubbleRect.height <= 0) return;
      const header = stage.querySelector<HTMLElement>(".ls-stage-content")?.getBoundingClientRect();
      const guideBesideWorld = header && (header.right <= worldRect.left + 1 || worldRect.right <= header.left + 1);
      const topLimit = guideBesideWorld ? worldRect.top - stageRect.top + 8 : (header?.bottom ?? stageRect.top) - stageRect.top + 6;
      const canvas = speaker ? stage.querySelector<HTMLCanvasElement>(`[data-stage-person="${speaker}"] canvas`) : null;
      observe(canvas);
      const previousReserve = Number.parseFloat(stage.style.getPropertyValue("--ls-speech-height")) || 0;
      const canvases = canvas ? [canvas] : [...stage.querySelectorAll<HTMLCanvasElement>("[data-stage-person] canvas")];
      const requiredHeadTop = topLimit + bubbleRect.height + 12;
      const requiredReserves = canvases.map(element => {
        observe(element);
        const rect = element.getBoundingClientRect();
        const naturalHeight = rect.height + previousReserve;
        const fixedBottom = rect.bottom - stageRect.top;
        const naturalHeadTop = fixedBottom - 415 * Math.min(rect.width / 360, naturalHeight / 460);
        if (naturalHeadTop >= requiredHeadTop) return 0;
        // Bottom-aligned contain fit: headTop = bottom - 415 * scale.
        // Reserve only the space that this specific head actually needs.
        const maximumReserve = Math.max(0, naturalHeight - 100);
        return Math.max(0, Math.min(maximumReserve, Math.ceil(naturalHeight - 460 * (fixedBottom - requiredHeadTop) / 415 - .01)));
      });
      const reserve = requiredReserves.length ? Math.max(...requiredReserves) : Math.ceil(bubbleRect.height + 14);
      if (stage.style.getPropertyValue("--ls-speech-height") !== `${reserve}px`) stage.style.setProperty("--ls-speech-height", `${reserve}px`);
      const character = canvas?.getBoundingClientRect();
      const width = bubbleRect.width, height = bubbleRect.height;
      let x = worldLeft + (worldRect.width - width) / 2, y = topLimit;
      if (speaker && character && character.height > 0 && character.width > 0) {
        // The authored Character artboard is 360×460, contained and bottom
        // aligned. All five native rigs share head-top y45 and mouth y161.
        const scale = Math.min(character.width / 360, character.height / 460);
        const mouthX = character.left - stageRect.left + character.width / 2;
        const mouthY = character.top - stageRect.top + character.height - (460 - 161) * scale;
        const headTop = character.top - stageRect.top + character.height - (460 - 45) * scale;
        x = Math.max(worldLeft + 12, Math.min(worldLeft + worldRect.width - width - 12, mouthX - width / 2));
        y = Math.max(topLimit, headTop - height - 12);
        const startX = Math.max(14, Math.min(width - 14, mouthX - x));
        const gap = Math.max(5, Math.min(22, headTop - y - height - 3));
        const tipX = startX + (mouthX - x - startX) * gap / Math.max(1, mouthY - y - height);
        tailRef.current?.setAttribute("d", `M ${startX - 8} -1 L ${tipX} ${gap} L ${startX + 8} -1`);
        anchor.dataset.speechMode = "anchored";
        anchor.dataset.speechOwner = speaker;
        anchor.dataset.speechMouthX = (stageRect.left + mouthX).toFixed(2);
        anchor.dataset.speechMouthY = (stageRect.top + mouthY).toFixed(2);
        anchor.dataset.speechTailX = (stageRect.left + x + tipX).toFixed(2);
        anchor.dataset.speechTailY = (stageRect.top + y + height + gap).toFixed(2);
      } else {
        anchor.dataset.speechMode = "neutral";
        delete anchor.dataset.speechOwner;
        delete anchor.dataset.speechMouthX;
        delete anchor.dataset.speechMouthY;
        delete anchor.dataset.speechTailX;
        delete anchor.dataset.speechTailY;
      }
      anchor.style.left = `${x}px`;
      anchor.style.top = `${y}px`;
      anchor.dataset.speechReady = "true";
    };
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(layout) : null;
    observe(stage);
    const mutations = new MutationObserver(layout);
    mutations.observe(stage, { childList: true, subtree: true });
    window.addEventListener("resize", layout);
    layout();
    return () => { disposed = true; observer?.disconnect(); mutations.disconnect(); window.removeEventListener("resize", layout); };
    // Dependencies identify public layout facts, never speech frames or amplitudes.
  }, [round.id, speaker, speechContent, anchorPeopleKey]);

  function personView(person: PersonId) {
    const speaking = person === speaker;
    const listening = person === listener;
    const selected = person === selectedPerson;
    const role = speaking ? "Fala" : listening ? "Escuta" : "";
    const label = `${NAMES[person]}${role ? `, ${role.toLowerCase()}` : ""}${team.includes(person) ? ", pertence à equipe" : ""}`;
    const className = `ls-person${speaking ? " ls-person--speaking" : ""}${listening ? " ls-person--listening" : ""}${selected ? " ls-person--selected" : ""}`;
    const reaction = allowIdleTaps && tapState.scope === tapScope ? tapState.people[person] : undefined;
    const content = <>
      <span className="ls-role" aria-hidden="true">
        {speaking ? <MessageCircle size={13} strokeWidth={2} /> : listening ? <Ear size={14} strokeWidth={2} /> : null}
        {role}
      </span>
      <span className="ls-character-wrap" aria-hidden="true" data-stage-person={person}>
        <span className="ls-person-shadow" />
        <Character person={person} cue={reaction?.name ?? (cue?.person === person ? cue.name : "idle")} cueKey={reaction?.key ?? (cue?.person === person ? cue.key : 0)} className="ls-character"
          speech={speech} speechListenerSide={visualOrder.indexOf(listener) < visualOrder.indexOf(person) ? "left" : "right"} onReady={() => onCharacterReady?.(person)} />
      </span>
      <span className="ls-person-name"><span className="ls-name-dot" aria-hidden="true" />{NAMES[person]}</span>
    </>;

    return <DropTarget key={person} id={`person:${person}`} accept={["phrase"]} label={`Entregar a fala para ${NAMES[person]}`} disabled={!canReceivePhrase || Boolean(phraseRecipients && !phraseRecipients.includes(person))} className="ls-person-target">
      {draggablePeople.includes(person)
        ? <DragSource item={{ id: `person:${person}`, kind: "person", value: person, label: NAMES[person] }} className={className} onClick={() => onPersonClick?.(person)}>
          {content}
        </DragSource>
        : <button type="button" className={className} onClick={event => clickPerson(person, event)} aria-label={label} aria-pressed={selectedPerson === undefined ? undefined : selected} data-person={person} data-tutorial-cue={tutorialCuePerson === person ? person : undefined}>
          {content}
        </button>}
    </DropTarget>;
  }

  return <section ref={stageRef} className={`ls-stage${compact ? " ls-stage--compact" : ""}${showTeam ? " ls-stage--with-team" : ""}${round.anonymous ? " ls-stage--anonymous" : ""}${speechContent ? " ls-stage--speech" : ""}`} data-round={round.id} data-stage-kind={round.kind} aria-label={description}>
    <div className="ls-stage-backdrop" aria-hidden="true"><span /><i /></div>
    {children ? <div className="ls-stage-content">{children}</div> : null}
    {speechContent ? <div ref={anchorRef} className="ls-speech-anchor" data-speech-mode="neutral" data-speech-ready="false">
      <div ref={bubbleRef} className="ls-speech-bubble">{speechContent}</div>
      <svg className="ls-speech-tail" aria-hidden="true" data-speech-tail="true"><path ref={tailRef}/></svg>
    </div> : null}
    <div ref={peopleMarkerRef} className="ls-mechanic-people" data-tutorial-cue="people" aria-hidden="true"/>
    <div className="ls-world" style={{ "--ls-people": allPeople.length } as CSSProperties}>
      {showTeam ? <>
        <DropTarget id="team" accept={["person"]} label="Colocar na equipe" disabled={round.kind !== "join"} className="ls-team-target">
          <div className="ls-team" data-tutorial-cue="team" style={{ "--ls-members": Math.max(team.length, 1) } as CSSProperties}>
            <div className="ls-team-boundary" aria-hidden="true" />
            <div className="ls-people ls-team-people">{team.map(personView)}</div>
            <span className="ls-team-label"><Users size={14} strokeWidth={1.8} aria-hidden="true" />Equipe</span>
          </div>
        </DropTarget>
        {outside.length > 0 ? <div className="ls-outside" style={{ "--ls-outsiders": outside.length } as CSSProperties}>
          <div className="ls-people">{outside.map(personView)}</div>
        </div> : null}
      </> : <div className="ls-people ls-conversation">{allPeople.map(personView)}</div>}
    </div>
  </section>;
}

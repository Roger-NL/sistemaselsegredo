"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { Menu, Volume2, VolumeX } from "lucide-react";
import { BrowserText } from "@/components/i18n/BrowserText";
import { getEffectsMuted, getClicksMuted, getSoundMuted, getServerSoundsMuted, interactionSoundFor, playInteractionSound, saveSoundMuted, type SoundChannel, stopInteractionSounds, subscribeInteractionSounds } from "./sounds";

/** Capture runs before the action so its later correct/retry signal takes priority. */
export function InteractionSounds() {
  useEffect(() => {
    const click = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const sound = interactionSoundFor(event.target);
      if (sound) {
        const explicit = event.target.closest("[data-ui-sound]")?.getAttribute("data-ui-sound");
        if (explicit && explicit !== "click") {
          if (getSoundMuted("effects")) void playInteractionSound("click");
          else void playInteractionSound(sound);
        } else if (sound === "click") void playInteractionSound(sound);
        else void playInteractionSound(sound, "clicks");
      }
    };
    document.addEventListener("click", click, true);
    return () => { document.removeEventListener("click", click, true); stopInteractionSounds(); };
  }, []);
  return null;
}
function SoundOption({ channel }: { channel: SoundChannel }) {
  const muted = useSyncExternalStore(subscribeInteractionSounds, channel === "effects" ? getEffectsMuted : getClicksMuted, getServerSoundsMuted);
  const label = channel === "effects" ? "efeitos sonoros" : "som de clique";
  return <button type="button" className="app-menu-action sound-option" data-ui-sound="none" data-keep-menu-open="true" aria-pressed={muted} onClick={() => saveSoundMuted(channel, !muted)}>
    {muted ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
    <BrowserText>{`${muted ? "Ativar" : "Desativar"} ${label}`}</BrowserText>
  </button>;
}
export function SoundToggle() {
  return <div className="sound-options"><SoundOption channel="effects" /><SoundOption channel="clicks" /></div>;
}
/** Public and presentation headers share the same persisted choices as the app menu. */
export function SoundMenu() {
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (menu.current && !menu.current.contains(event.target as Node)) menu.current.open = false;
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  return <details className="sound-menu" ref={menu} onBlur={event => {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
  }} onKeyDown={event => {
    if (event.key === "Escape") { event.preventDefault(); event.currentTarget.open = false; event.currentTarget.querySelector("summary")?.focus(); }
  }}>
    <summary aria-label="Menu de som"><Menu size={18} aria-hidden="true" /><span>Menu</span></summary>
    <div className="sound-menu-panel" aria-label="Opções de som"><SoundToggle /></div>
  </details>;
}

"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { BrowserText } from "@/components/i18n/BrowserText";
import { getInteractionSoundsMuted, getServerSoundsMuted, interactionSoundFor, playInteractionSound, saveInteractionSoundsMuted, stopInteractionSounds, subscribeInteractionSounds } from "./sounds";

/** Capture runs before the action so its later correct/retry signal takes priority. */
export function InteractionSounds() {
  useEffect(() => {
    const click = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const sound = interactionSoundFor(event.target);
      if (sound) void playInteractionSound(sound);
    };
    document.addEventListener("click", click, true);
    return () => { document.removeEventListener("click", click, true); stopInteractionSounds(); };
  }, []);
  return null;
}
export function SoundToggle() {
  const muted = useSyncExternalStore(subscribeInteractionSounds, getInteractionSoundsMuted, getServerSoundsMuted);
  return <button type="button" className="app-menu-action" data-ui-sound="none" onClick={() => {
    saveInteractionSoundsMuted(!muted);
    if (muted) void playInteractionSound("click");
  }}>{muted ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}<BrowserText>{muted ? "Ativar efeitos sonoros" : "Silenciar efeitos sonoros"}</BrowserText></button>;
}

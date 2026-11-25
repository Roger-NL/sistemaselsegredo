"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { createFirstDayProgressStore } from "./first-day-progress";
import { FIRST_DAY_AUDIO_RATE, firstDayVoiceUrl } from "./narration";

let pending: HTMLAudioElement | null = null;

export function takeCoverAudio() {
  const player = pending;
  pending = null;
  return player;
}

export function FirstDayLink({ onClick, ...props }: Omit<ComponentProps<typeof Link>, "href">) {
  function enter(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const { position, sound } = createFirstDayProgressStore().getSnapshot();
    pending?.pause();
    pending = null;
    if (position > 0 || !sound) return;
    const player = pending = new Audio(firstDayVoiceUrl("cover"));
    player.playbackRate = FIRST_DAY_AUDIO_RATE;
    void player.play()?.catch(() => {});
  }
  return <Link {...props} href="/first-day" onClick={enter} />;
}

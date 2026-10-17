"use client";

import { useSyncExternalStore } from "react";
import {
  readVisitorName,
  VISITOR_NAME_KEY,
  writeVisitorName,
} from "./visitor-name";

const CHANGED_EVENT = "basedspeak:visitor-name-changed";
function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === VISITOR_NAME_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGED_EVENT, listener);
  };
}
function getSnapshot(): string | null {
  try {
    return readVisitorName(window.localStorage);
  } catch {
    return null;
  }
}
function getServerSnapshot(): undefined {
  return undefined;
}

export function useVisitorName() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function saveVisitorName(value: string): boolean {
  try {
    const saved = writeVisitorName(window.localStorage, value);
    if (saved) window.dispatchEvent(new Event(CHANGED_EVENT));
    return saved;
  } catch {
    return false;
  }
}

export function forgetVisitorName(): boolean {
  try {
    window.localStorage.removeItem(VISITOR_NAME_KEY);
    window.dispatchEvent(new Event(CHANGED_EVENT));
    return true;
  } catch {
    return false;
  }
}

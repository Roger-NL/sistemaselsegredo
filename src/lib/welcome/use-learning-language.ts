"use client";

import { useSyncExternalStore } from "react";
import { isLearningLanguage, type LearningLanguage } from "@/app/inicio-orbita-7k3/language";

export const LEARNING_LANGUAGE_KEY = "basedspeak-orbita-learning-language";
const CHANGED_EVENT = "basedspeak:learning-language-changed";

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === LEARNING_LANGUAGE_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGED_EVENT, listener);
  };
}

function getSnapshot(): LearningLanguage {
  try {
    const value = window.localStorage.getItem(LEARNING_LANGUAGE_KEY);
    return isLearningLanguage(value) ? value : "pt";
  } catch {
    return "pt";
  }
}

function getServerSnapshot(): undefined {
  return undefined;
}

export function useLearningLanguage() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function saveLearningLanguage(language: LearningLanguage): boolean {
  try {
    window.localStorage.setItem(LEARNING_LANGUAGE_KEY, language);
    window.dispatchEvent(new Event(CHANGED_EVENT));
    return true;
  } catch {
    return false;
  }
}

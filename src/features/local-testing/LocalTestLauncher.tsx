"use client";
import { BrowserText } from "@/components/i18n/BrowserText";

import Link from "next/link";
import { useSyncExternalStore, type MouseEvent } from "react";
import { localTestingActive, localTestingAvailable, subscribeLocalTests } from "./sandbox";
import "./local-testing.css";
export function LocalTestLauncher({ onNavigate }: { onNavigate?: (event: MouseEvent<HTMLAnchorElement>) => void }) {
  const available = useSyncExternalStore(subscribeLocalTests, localTestingAvailable, () => false);
  const active = useSyncExternalStore(subscribeLocalTests, localTestingActive, () => false);
  return available ? <Link className="local-test-launcher" href="/dev/testes" onClick={onNavigate}>{active ? <BrowserText>{"Dados de teste · controles"}</BrowserText> : <BrowserText>{"Testes locais"}</BrowserText>}</Link> : null;
}

export function LocalTestStatus() {
  const active = useSyncExternalStore(subscribeLocalTests, localTestingActive, () => false);
  return active ? <small className="local-test-status">Teste</small> : null;
}

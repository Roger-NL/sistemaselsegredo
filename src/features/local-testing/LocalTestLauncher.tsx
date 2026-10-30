"use client";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { localTestingActive, localTestingAvailable, subscribeLocalTests } from "./sandbox";
import "./local-testing.css";
export function LocalTestLauncher() {
  const available = useSyncExternalStore(subscribeLocalTests, localTestingAvailable, () => false);
  const active = useSyncExternalStore(subscribeLocalTests, localTestingActive, () => false);
  return available ? <Link className="local-test-launcher" href="/dev/testes">{active ? "Dados de teste · controles" : "Testes locais"}</Link> : null;
}

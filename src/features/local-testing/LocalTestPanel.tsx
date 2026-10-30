"use client";
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { readGuestLearning, writeGuestLearning } from "@/features/dashboard/guest-learning";
import { studentWorkspace } from "@/features/dashboard/workspace-store";
import { decodeSnapshot } from "@/features/demo/session/storage";
import { catalog } from "@/features/demo/content/catalog";
import type { SupportProfile } from "@/features/demo/model/types";
import { studySteps } from "@/features/theory/progress";
import { changeTestProgress, type LocalProgressAction } from "./progress";
import { localTestingActive, localTestingAvailable, setLocalTesting, testStorage, subscribeLocalTests, readLocalTestData } from "./sandbox";
import "./local-testing.css";
export function LocalTestPanel() {
  const available = useSyncExternalStore(subscribeLocalTests, localTestingAvailable, () => false);
  const stored = useSyncExternalStore(subscribeLocalTests, readLocalTestData, () => null);
  const learning = readGuestLearning({ getItem: () => stored, setItem: () => {}, removeItem: () => {} });
  const [profile, setProfile] = useState<SupportProfile>("beginner");
  const [part, setPart] = useState(1);
  const [notice, setNotice] = useState("");
  const initialActive = useSyncExternalStore(subscribeLocalTests, localTestingActive, () => false);
  const enabled = initialActive;
  const demo = learning.demoSnapshot ? decodeSnapshot(learning.demoSnapshot) : null;
  function openTest() { setLocalTesting(true); studentWorkspace.reset(); }
  function apply(action: LocalProgressAction) {
    try {
      if (!available) return;
      const next = changeTestProgress(learning, action, profile, part);
      writeGuestLearning(testStorage(window.localStorage), next);
      setLocalTesting(true); studentWorkspace.reset();
      setNotice("Dados de teste atualizados. Abra a conversa ou o estudo para conferir.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Não foi possível salvar os dados de teste."); }
  }
  return <main className="local-test-panel"><header><Link href="/">← BasedSpeak</Link><span>Só no desenvolvimento local</span></header>
    <h1>Controles de teste</h1><p>Avance a conversa e o estudo sem refazer as atividades. As respostas e conclusões abaixo são simuladas.</p>
    <aside><strong>{enabled ? "Ambiente de teste ativo" : "Ambiente separado da sua conta"}</strong><p>Os controles ficam ativos só nesta aba, com dados exclusivos de teste. Seu progresso normal e o banco de dados da conta ficam preservados.</p>{enabled && <button disabled={!available} onClick={() => { setLocalTesting(false); window.location.assign("/demo"); }}>Sair dos testes e voltar ao meu progresso</button>}</aside>
    <section aria-labelledby="test-demo"><h2 id="test-demo">Conversa da demo</h2><p role="status">{demo ? catalog[demo.nodeId].kind === "end" ? "Demo concluída para teste." : `Parte ${catalog[demo.nodeId].part} de 10.` : "Demo ainda não iniciada."}</p>
      <label>Apoio para uma nova simulação<select disabled={!available} value={profile} onChange={e => setProfile(e.target.value as SupportProfile)}><option value="beginner">Iniciante</option><option value="some">Com pistas</option><option value="less">Menos apoio</option></select></label>
      <div className="local-test-actions"><button disabled={!available} onClick={() => apply("advance-demo")}>Avançar uma parte</button><button disabled={!available} onClick={() => apply("complete-demo")}>Completar demo</button><button disabled={!available} onClick={() => apply("reset-demo")}>Zerar demo</button></div>
      <div className="local-test-jump"><label>Ir direto para a parte<select disabled={!available} value={part} onChange={e => setPart(Number(e.target.value))}>{Array.from({length:10}, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select></label><button disabled={!available} onClick={() => apply("jump-demo")}>Preparar esta parte</button></div>
      <Link href="/demo" onClick={openTest}>Abrir conversa →</Link>
    </section>
    <section aria-labelledby="test-study"><h2 id="test-study">Estudo depois da demo</h2><p role="status">{learning.studyCompleted} de {studySteps.length} práticas concluídas para teste.</p><div className="local-test-actions"><button disabled={!available} onClick={() => apply("advance-study")}>Concluir próxima prática</button><button disabled={!available} onClick={() => apply("complete-study")}>Completar estudo</button><button disabled={!available} onClick={() => apply("reset-study")}>Zerar estudo</button></div><Link href="/demo/estudo" onClick={openTest}>Abrir estudo →</Link></section>
    <footer><button disabled={!available} onClick={() => apply("reset-all")}>Zerar todos os dados de teste</button><p role="status" aria-live="polite">{notice}</p></footer>
  </main>;
}

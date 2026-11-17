"use client";

import { InterfaceIcon } from "@/components/ui/InterfaceIcon";
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { readGuestLearning, writeGuestLearning } from "@/features/dashboard/guest-learning";
import { studentWorkspace } from "@/features/dashboard/workspace-store";
import { LESSON_SCENES } from "@/features/first-encounters/lesson-one";
import { decodeLessonAccountSnapshot } from "@/features/first-encounters/lesson-account-snapshot";
import { EMPTY_LESSON_DASHBOARD_INPUT, getLessonDashboardSnapshot } from "@/features/first-encounters/lesson-dashboard";
import { changeTestProgress, type LocalProgressAction } from "./progress";
import { localTestingActive, localTestingAvailable, setLocalTesting, testStorage, subscribeLocalTests, readLocalTestData } from "./sandbox";
import "./local-testing.css";

export function LocalTestPanel() {
  const available = useSyncExternalStore(subscribeLocalTests, localTestingAvailable, () => false);
  const stored = useSyncExternalStore(subscribeLocalTests, readLocalTestData, () => null);
  const learning = readGuestLearning({ getItem: () => stored, setItem: () => {}, removeItem: () => {} });
  const [part, setPart] = useState(1);
  const [notice, setNotice] = useState("");
  const enabled = useSyncExternalStore(subscribeLocalTests, localTestingActive, () => false);
  const snapshot = getLessonDashboardSnapshot(decodeLessonAccountSnapshot(learning.lessonSnapshot ?? null)?.progress ?? EMPTY_LESSON_DASHBOARD_INPUT);
  const activities = LESSON_SCENES.filter(scene => scene.mode === "game");
  function openTest() { setLocalTesting(true); studentWorkspace.reset(); }
  function apply(action: LocalProgressAction) {
    try {
      if (!available) return;
      const next = changeTestProgress(learning, action, undefined, part);
      writeGuestLearning(testStorage(window.localStorage), next);
      setLocalTesting(true); studentWorkspace.reset();
      setNotice("Dados de teste atualizados. Abra a aula para conferir.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Não foi possível salvar os dados de teste."); }
  }
  return <main className="local-test-panel"><header><Link href="/"><InterfaceIcon name="arrow-left"/>BasedSpeak</Link><span>Só no desenvolvimento local</span></header>
    <h1>Controles de teste</h1><p>Experimente a apresentação, as seis atividades, a teoria e o teste sem refazer o percurso. As conclusões abaixo são simuladas.</p>
    <aside><strong>{enabled ? "Ambiente de teste ativo" : "Ambiente separado da sua conta"}</strong><p>Estes controles usam dados exclusivos desta aba. Seu progresso normal e os dados da conta ficam separados.</p>{enabled && <button disabled={!available} onClick={() => { setLocalTesting(false); window.location.assign("/demo"); }}>Sair dos testes e voltar ao meu progresso</button>}</aside>
    <section aria-labelledby="test-lesson"><h2 id="test-lesson">Aula visual</h2><p role="status">{snapshot.percent}% do percurso · {snapshot.completedUnits} de 49 etapas</p>
      <div className="local-test-actions"><button disabled={!available} onClick={() => apply("advance-demo")}>Avançar uma atividade</button><button disabled={!available} onClick={() => apply("complete-demo")}>Completar atividades</button><button disabled={!available} onClick={() => apply("reset-demo")}>Recomeçar atividades</button></div>
      <div className="local-test-jump"><label>Ir para a atividade<select disabled={!available} value={part} onChange={event => setPart(Number(event.target.value))}>{activities.map(scene => <option key={scene.id} value={scene.game}>{scene.game}. {scene.title}</option>)}</select></label><button disabled={!available} onClick={() => apply("jump-demo")}>Preparar esta atividade</button></div>
      <Link href="/demo" onClick={openTest}>Abrir aula<InterfaceIcon name="arrow-right"/></Link>
    </section>
    <section aria-labelledby="test-conclusion"><h2 id="test-conclusion">Teoria e teste</h2><p>5 páginas de teoria e 6 perguntas na conclusão da aula.</p><div className="local-test-actions"><button disabled={!available} onClick={() => apply("advance-study")}>Concluir próxima etapa</button><button disabled={!available} onClick={() => apply("complete-study")}>Completar teoria e teste</button><button disabled={!available} onClick={() => apply("reset-study")}>Recomeçar teoria e teste</button></div><Link href="/demo?retomar=conclusao" onClick={openTest}>Abrir teoria e teste<InterfaceIcon name="arrow-right"/></Link></section>
    <footer><button disabled={!available} onClick={() => apply("reset-all")}>Zerar os dados desta simulação</button><p role="status" aria-live="polite">{notice}</p></footer>
  </main>;
}

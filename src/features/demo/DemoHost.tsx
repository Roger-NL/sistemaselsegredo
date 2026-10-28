"use client";


import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AppHeader } from "@/components/navigation/AppHeader";
import { useJourneyTransition } from "@/components/navigation/JourneyTransition";
import { DemoEntry } from "./DemoEntry";
import { DemoExperience, type DemoNavigation } from "./DemoExperience";
import { createDemo } from "./model/reducer";
import { visibleAppSize } from "./model/layout";
import { getBrowserSnapshot, getServerSnapshot, remember, restart, subscribe } from "./session/browser";
import type { PublishedAudioCatalog } from "@/contracts/demo-audio";
import { useStudentWorkspace } from "@/features/dashboard/use-student-workspace";
import { PracticeAccess } from "@/features/dashboard/PracticeAccess";
import { canPractice } from "@/features/dashboard/practice-access";
import { GuestProgressImport } from "@/features/dashboard/GuestProgressImport";

export function DemoHost({ experience = false, publishedAudio = {}, accountName }: { experience?: boolean; publishedAudio?: PublishedAudioCatalog; accountName?: string }) {
  const snapshot = useSyncExternalStore(subscribe, getBrowserSnapshot, getServerSnapshot);
  const workspaceState = useStudentWorkspace();
  const allowed = canPractice(workspaceState);
  const guest = !workspaceState.workspace && Boolean(workspaceState.guestLearning);
  const router = useRouter();
  const { ready, start, cancel, pending } = useJourneyTransition();
  const shell = useRef<HTMLElement>(null);
  const navigation = useRef<DemoNavigation>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  useEffect(() => {
    if (snapshot.status === "loading" || !shell.current) return;
    return ready(shell.current);
  }, [ready, snapshot.status, snapshot.state?.runId]);
  useEffect(() => {
    const viewport = window.visualViewport;
    const update = () => {
      const { width, height } = visibleAppSize({ width: document.documentElement.clientWidth || window.innerWidth, height: window.innerHeight }, viewport);
      shell.current?.style.setProperty("--app-width", `${width}px`);
      shell.current?.style.setProperty("--app-height", `${Math.floor(height)}px`);
      if (shell.current) shell.current.dataset.shortViewport = String(height < 540);
    };
    update();
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => { viewport?.removeEventListener("resize", update); viewport?.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  function reset() {
    if (snapshot.state && !window.confirm(`Recomeçar substitui a tentativa atual da história ${guest ? "neste navegador" : "na sua conta"}. Deseja continuar?`)) return;
    restart(workspaceState.generation); router.push("/demo");
  }
  return <main ref={shell} className="demo-shell app-shell">
    <AppHeader current="demo" guest={guest} name={workspaceState.workspace?.account.name || accountName} onNavigate={cancel}>{allowed && snapshot.state && <>{experience && <button disabled={pending || !canGoBack} onClick={() => navigation.current?.back()}>Voltar</button>}<button disabled={pending} aria-label="Recomeçar" onClick={reset}>Recomeçar</button></>}</AppHeader>
    <GuestProgressImport state={workspaceState} />
    {!allowed ? <PracticeAccess state={workspaceState} retry={workspaceState.refresh} />
      : snapshot.state && experience ? <DemoExperience key={`${workspaceState.generation}:${snapshot.state.runId}`} generation={workspaceState.generation} initial={snapshot.state} publishedAudio={publishedAudio} navigationRef={navigation} onBackAvailabilityChange={setCanGoBack} />
      : snapshot.state ? <section className="resume"><p className="eyebrow">Sua conversa está aqui</p><h1>Vamos continuar?</h1><p>Você pode retomar do ponto em que parou, sem repetir as falas já enviadas.</p><div className="actions"><Link className="primary button-link" href="/demo">Retomar conversa</Link><button onClick={reset}>Começar de novo</button></div></section>
      : <div className="entry-stage">{snapshot.status === "invalid" && <p role="status">Não foi possível retomar a tentativa anterior. Comece uma nova conversa.</p>}<DemoEntry onStart={profile => { const generation = workspaceState.generation; start({ prepare:() => remember(createDemo(profile, crypto.randomUUID(), Date.now()), generation) }); }} /></div>}
    <footer><span>BasedSpeak · Um encontro de cada vez.<span className="demo-sync-status" role="status">{workspaceState.notice || (allowed ? guest ? "Demo livre. Seu avanço fica neste navegador." : workspaceState.saving ? "Salvando sua conversa…" : snapshot.state ? "Conversa sincronizada com sua conta." : "Sua conta está conectada." : "")}</span></span><nav aria-label="Informações legais"><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos</Link></nav></footer>
  </main>;
}

"use client";


import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Brand } from "@/components/ui/Brand";
import { DemoEntry } from "./DemoEntry";
import { DemoExperience, type DemoNavigation } from "./DemoExperience";
import { createDemo } from "./model/reducer";
import { getBrowserSnapshot, getServerSnapshot, remember, restart, subscribe } from "./session/browser";
import type { PublishedAudioCatalog } from "@/contracts/demo-audio";

export function DemoHost({ experience = false, publishedAudio = {} }: { experience?: boolean; publishedAudio?: PublishedAudioCatalog }) {
  const snapshot = useSyncExternalStore(subscribe, getBrowserSnapshot, getServerSnapshot);
  const router = useRouter();
  const shell = useRef<HTMLElement>(null);
  const navigation = useRef<DemoNavigation>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  useEffect(() => {
    const viewport = window.visualViewport;
    const update = () => {
      const height = viewport?.height ?? window.innerHeight;
      shell.current?.style.setProperty("--app-height", `${Math.floor(height)}px`);
      if (shell.current) shell.current.dataset.shortViewport = String(height < 540);
    };
    update();
    viewport?.addEventListener("resize", update);
    window.addEventListener("resize", update);
    return () => { viewport?.removeEventListener("resize", update); window.removeEventListener("resize", update); };
  }, []);
  function reset() {
    if (snapshot.state && !window.confirm("Recomeçar descarta esta tentativa e a avaliação guardada neste dispositivo. Deseja continuar?")) return;
    restart(); router.push("/");
  }
  return <main ref={shell} className="demo-shell app-shell">
    <header className="site-header"><Brand /><nav aria-label="Navegação principal"><span className="public-label">Uma conversa em inglês</span>{snapshot.state && <>{experience && <button className="text-button" disabled={!canGoBack} onClick={() => navigation.current?.back()}>Voltar</button>}<button className="text-button" onClick={reset}>Recomeçar</button></>}</nav></header>
    {snapshot.status === "loading" ? <p role="status">Preparando a conversa…</p>
      : snapshot.state && experience ? <DemoExperience key={snapshot.state.runId} initial={snapshot.state} publishedAudio={publishedAudio} navigationRef={navigation} onBackAvailabilityChange={setCanGoBack} />
      : snapshot.state ? <section className="resume"><p className="eyebrow">Sua conversa está aqui</p><h1>Vamos continuar?</h1><p>Você pode retomar do ponto em que parou, sem repetir as falas já enviadas.</p><div className="actions"><Link className="primary button-link" href="/demo">Retomar conversa</Link><button onClick={reset}>Começar de novo</button></div></section>
      : <div className="entry-stage">{snapshot.status === "invalid" && <p role="status">Não foi possível retomar a tentativa anterior. Comece uma nova conversa.</p>}{snapshot.status === "unavailable" && <p role="status">O armazenamento está indisponível. Você pode fazer a demo, mas talvez não consiga retomá-la depois de sair.</p>}<DemoEntry onStart={profile => { remember(createDemo(profile, crypto.randomUUID(), Date.now()), true); router.push("/demo"); }} /></div>}
    <footer><span>BasedSpeak · Um encontro de cada vez.</span><nav aria-label="Informações legais"><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos</Link></nav></footer>
  </main>;
}

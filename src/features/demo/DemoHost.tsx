"use client";


import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Brand } from "@/components/ui/Brand";
import { DemoEntry } from "./DemoEntry";
import { DemoExperience } from "./DemoExperience";
import { createDemo } from "./model/reducer";
import { getBrowserSnapshot, getServerSnapshot, remember, restart, subscribe } from "./session/browser";

export function DemoHost({ experience = false }: { experience?: boolean }) {
  const snapshot = useSyncExternalStore(subscribe, getBrowserSnapshot, getServerSnapshot);
  const router = useRouter();
  function reset() {
    if (snapshot.state && !window.confirm("Recomeçar descarta esta tentativa e a avaliação guardada neste dispositivo. Deseja continuar?")) return;
    restart(); router.push("/");
  }
  return <main className="demo-shell app-shell">
    <header className="site-header"><Brand /><nav aria-label="Navegação principal"><span className="public-label">Uma conversa em inglês</span>{snapshot.state && <button className="text-button" onClick={reset}>Recomeçar</button>}</nav></header>
    <p className="preview-notice">Uma conversa com Lucas · 12 cenas ilustradas.</p>
    {snapshot.status === "loading" ? <p role="status">Preparando a conversa…</p>
      : snapshot.state && experience ? <DemoExperience key={snapshot.state.runId} initial={snapshot.state} />
      : snapshot.state ? <section className="resume"><p className="eyebrow">Sua conversa está aqui</p><h1>Vamos continuar?</h1><p>Você pode retomar do ponto em que parou, sem repetir as falas já enviadas.</p><div className="actions"><Link className="primary button-link" href="/demo">Retomar conversa</Link><button onClick={reset}>Começar de novo</button></div></section>
      : <>{snapshot.status === "invalid" && <p role="status">A tentativa guardada não é compatível com esta versão ou não pôde ser recuperada. Comece uma nova conversa abaixo.</p>}{snapshot.status === "unavailable" && <p role="status">O armazenamento está indisponível. Você pode fazer a demo, mas talvez não consiga retomá-la depois de sair.</p>}<DemoEntry onStart={profile => { remember(createDemo(profile, crypto.randomUUID(), Date.now()), true); router.push("/demo"); }} /></>}
    <footer><span>BasedSpeak · Um encontro de cada vez.</span><nav aria-label="Informações legais"><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos</Link></nav></footer>
  </main>;
}

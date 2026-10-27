"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { ArrowLeft, ArrowUpRight, Headphones, LoaderCircle, LogOut, MicOff, Route, Sparkles, X } from "lucide-react";
import { AppHeader } from "@/components/navigation/AppHeader";
import { useJourneyTransition } from "@/components/navigation/JourneyTransition";
import { displayAccountName, type DashboardAccount } from "@/contracts/dashboard";
import { getBrowserSnapshot, getServerSnapshot, subscribe } from "@/features/demo/session/browser";
import { visibleViewportSize } from "@/lib/ui/viewport";
import { getMotionPreference, getServerPreference, saveMotionPreference, subscribePreferences } from "./preferences";

type Panel = "account" | "settings" | "help";

export function Dashboard({ account }: { account: DashboardAccount }) {
  const router = useRouter();
  const journey = useJourneyTransition();
  const shell = useRef<HTMLDivElement>(null);
  const accountDialog = useRef<HTMLDialogElement>(null);
  const settingsDialog = useRef<HTMLDialogElement>(null);
  const helpDialog = useRef<HTMLDialogElement>(null);
  const introDialog = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(account.name);
  const [draftName, setDraftName] = useState(account.name);
  const [busy, setBusy] = useState<"save" | "logout" | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [animating, setAnimating] = useState(false);
  const reduced = useSyncExternalStore(subscribePreferences, getMotionPreference, getServerPreference);
  const snapshot = useSyncExternalStore(subscribe, getBrowserSnapshot, getServerSnapshot);
  const firstName = displayAccountName(name).split(/\s+/, 1)[0];
  const completed = snapshot.state?.nodeId === "end";
  const started = Boolean(snapshot.state);
  const action = completed ? "Rever." : started ? "Continuar." : "Começar.";
  const actionLabel = completed ? "Rever minha conversa" : started ? "Continuar a história" : "Acessar sua demo";

  useLayoutEffect(() => {
    const element = shell.current;
    if (!element) return;
    const viewport = window.visualViewport;
    const update = () => {
      const size = visibleViewportSize({ width: document.documentElement.clientWidth || window.innerWidth, height: window.innerHeight }, viewport);
      element.style.setProperty("--dashboard-width", `${size.width}px`);
      element.style.setProperty("--dashboard-height", `${size.height}px`);
    };
    update();
    viewport?.addEventListener("resize", update);
    window.addEventListener("resize", update);
    return () => { viewport?.removeEventListener("resize", update); window.removeEventListener("resize", update); };
  }, []);

  useEffect(() => {
    if (!animating) return;
    const timeout = window.setTimeout(() => setAnimating(false), 1650);
    return () => window.clearTimeout(timeout);
  }, [animating]);

  useEffect(() => {
    const panel = new URL(window.location.href).searchParams.get("painel");
    if (panel === "conta") accountDialog.current?.showModal();
    if (panel === "configuracoes") settingsDialog.current?.showModal();
  }, []);

  function openPanel(panel: Panel) {
    setError(""); setMessage("");
    if (panel === "account") {
      setDraftName(name);
      accountDialog.current?.showModal();
    } else if (panel === "settings") settingsDialog.current?.showModal();
    else helpDialog.current?.showModal();
  }

  function openStory() {
    setAnimating(!reduced && !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    introDialog.current?.showModal();
  }

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy("save"); setError(""); setMessage("");
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: draftName.trim() }),
      });
      const result = await response.json().catch(() => null) as { error?: unknown; name?: unknown } | null;
      if (!response.ok) { setError(typeof result?.error === "string" ? result.error : "Não foi possível salvar seu nome. Tente novamente."); return; }
      if (typeof result?.name !== "string") { setError("Não foi possível confirmar seu nome. Tente novamente."); return; }
      setName(result.name); setDraftName(result.name); setMessage("Nome atualizado.");
    } catch {
      setError("Não foi possível conectar. Confira sua conexão e tente novamente.");
    } finally { setBusy(null); }
  }

  async function signOut() {
    if (busy) return;
    setBusy("logout"); setError(""); setMessage("");
    try {
      const response = await fetch("/api/auth/session", { method: "DELETE", credentials: "same-origin" });
      if (!response.ok) throw new Error("Não foi possível sair. Tente novamente.");
      // Load the browser SDK only for this explicit action; the server cookie is already cleared.
      try { const { logout } = await import("@/client/auth/service"); await logout(); } catch { /* Server access has ended. */ }
      accountDialog.current?.close();
      router.replace("/comecar?modo=entrar"); router.refresh();
    } catch {
      setError("Não foi possível sair. Confira sua conexão e tente novamente.");
      setBusy(null);
    }
  }

  return <div ref={shell} className="dashboard" data-reduced-motion={reduced}>
    <a className="dashboard-skip" href="#meu-painel">Pular para o conteúdo</a>
    <AppHeader current="dashboard" name={firstName} onAccount={() => openPanel("account")} onSettings={() => openPanel("settings")} onNavigate={journey.cancel} />

    <main id="meu-painel" className="dashboard-main dashboard-wrap">
      <div className="dashboard-welcome"><div><p className="dashboard-overline">{firstName ? `Olá, ${firstName}.` : "Bom ter você por aqui."}</p><h1>Seu espaço.</h1><p className="dashboard-subtitle">Um encontro de cada vez.</p></div><span className="dashboard-aside">Inglês por histórias.</span></div>
      <article className="dashboard-journey" aria-labelledby="journey-title">
        <header className="dashboard-card-header"><h2 id="journey-title"><Route size={18} aria-hidden="true" />Sua jornada</h2><span className="dashboard-availability">{completed ? "Fim do percurso" : started ? "Você já começou" : "Pronta para começar"}</span></header>
        <div className="dashboard-card-body"><div className="dashboard-access-area">
          <button type="button" className="dashboard-access" onClick={openStory} aria-label={actionLabel} aria-haspopup="dialog"><span className="dashboard-access-word">{action}</span><span className="dashboard-access-arrow"><ArrowUpRight size={25} aria-hidden="true" /></span></button>
          <p className="dashboard-access-copy"><strong>{completed ? "Sua conversa está aqui." : started ? "Vamos continuar sua história?" : "Acesse sua demo."}</strong><br />{started ? "Tentativa guardada neste navegador." : "O primeiro encontro com o inglês está aqui."}</p>
        </div><div className="dashboard-path" aria-hidden="true"><span className="dashboard-path-line" /><span className="dashboard-path-dot" /><span className="dashboard-path-number">01</span><span className="dashboard-path-label">O seu primeiro encontro</span></div></div>
        <footer className="dashboard-card-footer"><span><Sparkles size={14} aria-hidden="true" />Primeira história · Demo gratuita</span><span>No seu ritmo. Com apoio.</span></footer>
      </article>
      <div className="dashboard-after"><p><Headphones size={15} aria-hidden="true" />Você pode ouvir, tentar e pedir ajuda.</p><button type="button" onClick={() => openPanel("help")}>Como funciona minha jornada?<ArrowUpRight size={14} aria-hidden="true" /></button></div>
      {(snapshot.status === "invalid" || snapshot.status === "unavailable") && <p className="dashboard-storage-note" role="status">{snapshot.status === "invalid" ? "Não foi possível retomar a tentativa anterior. Você pode começar uma nova conversa na demo." : "O armazenamento está indisponível. Você pode fazer a demo, mas talvez não consiga retomá-la depois de sair."}</p>}
    </main>

    <footer className="dashboard-footer dashboard-wrap"><span>BasedSpeak · Um encontro de cada vez.</span><nav aria-label="Informações legais"><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos</Link></nav></footer>

    <dialog ref={accountDialog} className="dashboard-dialog" aria-labelledby="dashboard-account-title" aria-busy={Boolean(busy)}>
      <div className="dashboard-dialog-heading"><h2 id="dashboard-account-title">Minha conta.</h2><button className="dashboard-icon-button" type="button" onClick={() => accountDialog.current?.close()} aria-label="Fechar conta"><X size={19} aria-hidden="true" /></button></div>
      <form onSubmit={saveName}><fieldset disabled={Boolean(busy)}><legend className="dashboard-sr-only">Dados da conta</legend><label className="dashboard-field">Como quer ser chamado?<input name="name" autoComplete="given-name" value={draftName} onChange={event => setDraftName(event.target.value)} maxLength={120} required /></label><label className="dashboard-field">E-mail<input type="email" value={account.email} readOnly aria-describedby="dashboard-email-note" /></label><p className="dashboard-dialog-note" id="dashboard-email-note">E-mail usado para entrar na sua conta.</p><button type="submit" className="dashboard-primary">{busy === "save" ? <><LoaderCircle size={16} className="dashboard-spinner" aria-hidden="true" />Salvando…</> : "Salvar nome"}</button></fieldset></form>
      {error && <p className="dashboard-form-error" role="alert">{error}</p>}{message && <p className="dashboard-dialog-note" role="status">{message}</p>}
      <button className="dashboard-signout" type="button" disabled={Boolean(busy)} onClick={() => void signOut()}><LogOut size={16} aria-hidden="true" />{busy === "logout" ? "Saindo…" : "Sair da conta"}</button>
    </dialog>

    <dialog ref={settingsDialog} className="dashboard-dialog" aria-labelledby="dashboard-settings-title"><div className="dashboard-dialog-heading"><h2 id="dashboard-settings-title">Do seu jeito.</h2><button className="dashboard-icon-button" type="button" onClick={() => settingsDialog.current?.close()} aria-label="Fechar configurações"><X size={19} aria-hidden="true" /></button></div><label className="dashboard-toggle"><span>Reduzir animações</span><input type="checkbox" checked={reduced} onChange={event => saveMotionPreference(event.target.checked)} /></label><p className="dashboard-dialog-note">Deixa a entrada da história mais discreta. A preferência fica neste navegador. As configurações de movimento do seu dispositivo também são respeitadas.</p></dialog>

    <dialog ref={helpDialog} className="dashboard-dialog" aria-labelledby="dashboard-help-title"><div className="dashboard-dialog-heading"><h2 id="dashboard-help-title">Um passo por vez.</h2><button className="dashboard-icon-button" type="button" onClick={() => helpDialog.current?.close()} aria-label="Fechar explicação"><X size={19} aria-hidden="true" /></button></div><p className="dashboard-help-copy">Sua jornada começa com uma história. Na demo, você participa de uma conversa em inglês e escolhe o apoio que prefere.</p><p className="dashboard-help-copy">O aprofundamento e as próximas histórias estão em preparação.</p><p className="dashboard-dialog-note">A tentativa fica neste navegador. Sua conta ainda não sincroniza o progresso entre dispositivos.</p></dialog>

    <dialog ref={introDialog} className="dashboard-intro" aria-label="Entrada da história da cafeteria" data-animating={animating} onClose={() => setAnimating(false)} onCancel={journey.cancel}>
      <AppHeader current="dashboard" tone="immersive" name={firstName} onNavigate={() => introDialog.current?.close()} onAccount={() => { introDialog.current?.close(); openPanel("account"); }} onSettings={() => { introDialog.current?.close(); openPanel("settings"); }} />
      <header className="dashboard-intro-header"><button type="button" onClick={() => { journey.cancel(); introDialog.current?.close(); }}><ArrowLeft size={15} aria-hidden="true" />Voltar ao painel</button>{animating && <button type="button" onClick={() => setAnimating(false)}>Pular abertura<ArrowUpRight size={14} aria-hidden="true" /></button>}</header>
      <div className="dashboard-intro-center">
        {animating ? <p className="dashboard-cinematic-word" lang="en" aria-hidden="true">Let’s talk.</p> : <div className="dashboard-reveal">
          <figure><Image src="/demo/cafe/v2/images/V01-960.webp" width={960} height={640} sizes="(max-width: 580px) 85vw, 45vw" alt="Lucas e based no balcão da cafeteria, com seus nomes nos copos." /></figure>
          <div><p className="dashboard-overline">História 01 · A cafeteria</p><h2>Toda conversa<br />tem um começo.</h2><p className="dashboard-intro-description">Conheça Lucas. Escolha o que dizer e construa suas respostas com apoio no seu ritmo.</p><Link href="/demo" prefetch={false} className="dashboard-intro-cta" onClick={event => { if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); journey.start({ resume:started, prepare:() => introDialog.current?.close() }); }}>{completed ? "Rever minha conversa" : started ? "Retomar conversa" : "Escolher meu apoio"}<ArrowUpRight size={18} aria-hidden="true" /></Link></div>
        </div>}
      </div>
      <footer className="dashboard-intro-footer"><span><MicOff size={14} aria-hidden="true" />Sem microfone. Uma resposta por vez.</span><span>{started ? "Tentativa neste navegador" : "Demo gratuita"}</span></footer>
    </dialog>
  </div>;
}

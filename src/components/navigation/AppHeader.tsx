"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode, type MouseEvent } from "react";
import { ArrowUpRight, CalendarDays, BookOpen, LayoutDashboard, Menu, MessageCircle, Settings2, TrendingUp, UserRound } from "lucide-react";
import { Brand } from "@/components/ui/Brand";
import { useJourneyTransition } from "./JourneyTransition";
import { DASHBOARD_SECTION_EVENT } from "@/features/dashboard/use-dashboard-section";
import { studentWorkspace } from "@/features/dashboard/workspace-store";

export function AppHeader({ current, name, tone = "paper", guest = false, onAccount, onSettings, onNavigate, children }: {
  current: "dashboard" | "demo" | "study"; name?: string; guest?: boolean; tone?: "paper" | "immersive"; onAccount?: () => void; onSettings?: () => void; onNavigate?: () => void; children?: ReactNode;
}) {
  const { headerTone, reducedMotion } = useJourneyTransition();
  const menu = useRef<HTMLDetailsElement>(null);
  const close = () => { if (menu.current) menu.current.open = false; };
  const navigate = (event: MouseEvent<HTMLAnchorElement>) => {
    close(); onNavigate?.();
    void studentWorkspace.flush();
    const target = event.currentTarget;
    const hash = target.hash.slice(1);
    const plainClick = event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
    if (hash && plainClick) {
      // These are sections of the current panel, not another server page.
      // Replace the previous fragment and scroll after closing the dialog/menu.
      if (target.pathname === window.location.pathname) {
        event.preventDefault();
        window.history.pushState(null, "", target.href);
      }
      window.dispatchEvent(new CustomEvent(DASHBOARD_SECTION_EVENT, { detail:hash }));
    }
  };
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (menu.current && !menu.current.contains(event.target as Node)) menu.current.open = false; };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  return <header className="app-header" data-tone={headerTone === "immersive" ? headerTone : tone} data-reduced-motion={reducedMotion}>
    <Brand href={guest ? "/" : "/dashboard"} onClick={navigate} />
    <Link href={guest ? "/comecar?modo=entrar" : "/dashboard"} prefetch={true} className="app-header-panel" aria-current={current === "dashboard" ? "page" : undefined} onClick={navigate}><LayoutDashboard size={15} aria-hidden="true" />{guest ? "Entrar" : "Meu painel"}</Link>
    <div className="app-header-tools">{name && <span className="app-header-name">{name}</span>}
      <details ref={menu} className="app-header-menu" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }} onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); close(); menu.current?.querySelector("summary")?.focus(); } }}>
        <summary aria-label="Menu de navegação"><Menu size={18} aria-hidden="true" /><span>Menu</span></summary>
        <nav className="app-menu-panel" aria-label="Menu do BasedSpeak">
          <p>{guest ? "Explore a demo gratuita" : "Seu espaço no BasedSpeak"}</p>
          {!guest && <>
          <Link href="/dashboard" prefetch={true} onClick={navigate}><LayoutDashboard size={17} aria-hidden="true" />Meu painel<ArrowUpRight size={14} aria-hidden="true" /></Link>
          <Link href="/dashboard#atividades" prefetch={true} onClick={navigate}><BookOpen size={17} aria-hidden="true" />Minhas atividades<ArrowUpRight size={14} aria-hidden="true" /></Link>
          <Link href="/dashboard#avanco" prefetch={true} onClick={navigate}><TrendingUp size={17} aria-hidden="true" />Meu avanço<ArrowUpRight size={14} aria-hidden="true" /></Link>
          <Link href="/dashboard#contato" prefetch={true} onClick={navigate}><MessageCircle size={17} aria-hidden="true" />Falar com o professor<ArrowUpRight size={14} aria-hidden="true" /></Link>
          </>}
          <Link href="/demo" prefetch={true} onClick={navigate}><BookOpen size={17} aria-hidden="true" />Conversa da cafeteria<ArrowUpRight size={14} aria-hidden="true" /></Link>
          <Link href="/demo/estudo" prefetch={true} onClick={navigate}><BookOpen size={17} aria-hidden="true" />Área de estudo<ArrowUpRight size={14} aria-hidden="true" /></Link>
          <Link href={guest ? "/comecar" : "/dashboard#aula-ao-vivo"} prefetch={true} onClick={navigate}><CalendarDays size={17} aria-hidden="true" />{guest ? "Minha aula gratuita" : "Minha aula ao vivo"}<ArrowUpRight size={14} aria-hidden="true" /></Link>
          <div className="app-menu-divider" />
          {guest ? <><Link href="/comecar" onClick={navigate}><UserRound size={17} aria-hidden="true" />Criar minha conta</Link><Link href="/comecar?modo=entrar" onClick={navigate}>Já tenho conta</Link></> : <>{onAccount ? <button className="app-menu-action" type="button" onClick={() => { close(); onAccount(); }}><UserRound size={17} aria-hidden="true" />Minha conta</button> : <Link href="/dashboard?painel=conta" prefetch={true} onClick={navigate}><UserRound size={17} aria-hidden="true" />Minha conta</Link>}
          {onSettings ? <button className="app-menu-action" type="button" onClick={() => { close(); onSettings(); }}><Settings2 size={17} aria-hidden="true" />Configurações</button> : <Link href="/dashboard?painel=configuracoes" prefetch={true} onClick={navigate}><Settings2 size={17} aria-hidden="true" />Configurações</Link>}</>}
          {children && <div className="app-menu-story"><p>Controles da história</p>{children}</div>}
        </nav>
      </details>
    </div>
  </header>;
}

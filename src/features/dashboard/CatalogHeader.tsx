"use client";

import { Menu } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Brand } from "@/components/ui/Brand";
import "./catalog-header.css";

export function CatalogHeader({ home, children }: { home: string; children: ReactNode }) {
  const menu = useRef<HTMLDetailsElement>(null);
  const trigger = useRef<HTMLElement>(null);

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (menu.current?.open && !menu.current.contains(event.target as Node)) menu.current.open = false;
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  function closeAndFocus() {
    if (!menu.current?.open) return;
    menu.current.open = false;
    trigger.current?.focus({ preventScroll: true });
  }

  return <header className="app-header catalog-masthead" data-tone="paper">
    <Brand href={home}/>
    <details ref={menu} className="app-header-menu"
      onBlur={event => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
      }}
      onKeyDown={event => {
        if (event.key === "Escape" && event.currentTarget.open) {
          event.preventDefault();
          closeAndFocus();
        }
      }}>
      <summary ref={trigger} aria-label="Menu de navegação"><Menu size={22} aria-hidden="true"/></summary>
      <nav className="app-menu-panel" aria-label="Menu do BasedSpeak" onClickCapture={event => {
        if (event.target instanceof Element && event.target.closest("a[href],button:enabled")) closeAndFocus();
      }}>
        {children}
      </nav>
    </details>
  </header>;
}

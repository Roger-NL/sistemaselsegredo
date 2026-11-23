"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { art, pages } from "@/features/first-day/content";
import { createFirstDayProgressStore } from "@/features/first-day/first-day-progress";
import "./first-day-catalog.css";

const FIRST_DAY_HREF = "/first-day";
const coverArt = { ...art.cover, src: "/first-day/art-v1/capa-gibi-desktop.webp", width: 1440, height: 810 };

const upcoming = [
  { id: "coffee", title: "Um café, por favor", accent: "#f2c76a", ink: "#272c24" },
  { id: "city", title: "Do outro lado da rua", accent: "#84aebd", ink: "#182e3a" },
  { id: "rain", title: "Um dia de chuva", accent: "#283f65", ink: "#f9f2d8" },
  { id: "music", title: "A nossa música", accent: "#d9846b", ink: "#342a25" },
  { id: "party", title: "Planos para sábado", accent: "#bcabd4", ink: "#342940" },
  { id: "bye", title: "Até amanhã", accent: "#396d5e", ink: "#fff4c7" },
] as const;

export function useFirstDayReading() {
  const [store] = useState(createFirstDayProgressStore);
  const progress = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);

  useEffect(() => {
    const refresh = () => store.refresh();
    window.addEventListener("pageshow", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("pageshow", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [store]);

  return {
    progress,
    refresh: store.refresh,
    clear: () => store.update(current => ({ ...store.getServerSnapshot(), position: 0, sound: current.sound })),
  };
}

export function FirstDayCatalog({ position, primary = false }: {
  position: number;
  primary?: boolean;
}) {
  const scene = pages[position - 1];
  const image = scene && "image" in scene ? scene.image
    : scene?.kind === "Tirinha" ? scene.panels[0].image
    : scene?.kind === "Explicação" ? scene.examples[0]?.image ?? coverArt
    : coverArt;
  const Heading = primary ? "h1" : "h2";
  const action = scene ? "Continuar leitura" : "Começar a ler";

  return <>
    <article className="catalog-feature" aria-labelledby="first-day-catalog-title">
      <div className="catalog-feature-art" data-cover={image === coverArt ? "" : undefined}>
        <Image src={image.src} width={image.width} height={image.height} alt={image.alt} loading="eager" unoptimized />
      </div>
      <div className="catalog-feature-copy">
        {scene ? <p className="catalog-feature-note">Página {position} de {pages.length}</p> : null}
        <Heading id="first-day-catalog-title" data-resuming={scene ? "" : undefined} tabIndex={primary ? undefined : -1}>
          {scene ? <>Continue <span lang="en">First Day</span></> : <span lang="en">First Day</span>}
        </Heading>
        <p className="catalog-description">{scene ? `Parte ${scene.part} · ${scene.title}` : "Uma cadeira livre. Uma primeira conversa em inglês."}</p>
        {scene ? <progress className="catalog-progress" value={position} max={pages.length} aria-label="Página atual de First Day" /> : null}
        <Link className="catalog-cta" href={FIRST_DAY_HREF} prefetch={false}>{action}<ArrowRight size={19} aria-hidden="true"/></Link>
      </div>
    </article>
    <section className="catalog-upcoming" aria-labelledby="catalog-upcoming-title">
      <h2 id="catalog-upcoming-title">Em breve</h2>
      <ol className="catalog-shelf" tabIndex={0}>
        {upcoming.map(book => <li key={book.id} className="catalog-book">
          <div className="catalog-cover" data-edition={book.id} style={{ backgroundColor: book.accent, color: book.ink }}>
            <span className="catalog-cover-illustration" aria-hidden="true" />
            <span className="catalog-cover-title">{book.title}</span>
          </div>
        </li>)}
      </ol>
    </section>
  </>;
}

export function PublicCatalogContent() {
  const { progress } = useFirstDayReading();
  return <FirstDayCatalog position={progress.position} primary />;
}

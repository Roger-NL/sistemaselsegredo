"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { pages } from "@/features/first-day/content";
import { createFirstDayProgressStore } from "@/features/first-day/first-day-progress";
import "./first-day-catalog.css";

const FIRST_DAY_HREF = "/first-day";
const upcoming = [
  { art: "/dashboard/coffee.webp", title: "Um café, por favor" },
  { art: "/dashboard/city.webp", title: "Do outro lado da rua" },
  { art: "/dashboard/rain.webp", title: "Um dia de chuva" },
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
  const Heading = primary ? "h1" : "h2";
  const action = scene ? "Continuar leitura" : "Começar a ler";

  return <>
    <article className="catalog-feature" aria-labelledby="first-day-catalog-title">
      <picture className="catalog-feature-art">
        <source media="(min-width: 768px)" srcSet="/dashboard/first-day-wide.webp" />
        <Image src="/dashboard/first-day.webp" alt="Ana lê um gibi na cafeteria, ao lado de uma cadeira amarela livre." fill loading="eager" fetchPriority="high" unoptimized />
      </picture>
      <div className="catalog-feature-copy">
        {scene ? <p className="catalog-feature-note">Página {position} de {pages.length}</p> : null}
        <Heading id="first-day-catalog-title" lang="en" tabIndex={primary ? undefined : -1}>First Day</Heading>
        <p className="catalog-description">{scene ? `Parte ${scene.part} · ${scene.title}` : "Uma cadeira livre. Uma primeira conversa em inglês."}</p>
        {scene ? <progress className="catalog-progress" value={position} max={pages.length} aria-label="Página atual de First Day" /> : null}
        <Link className="catalog-cta" href={FIRST_DAY_HREF} prefetch={false}>{action}<ArrowRight size={19} aria-hidden="true"/></Link>
      </div>
    </article>
    <section className="catalog-upcoming" aria-labelledby="catalog-upcoming-title">
      <h2 id="catalog-upcoming-title">Em breve</h2>
      <ol className="catalog-shelf" tabIndex={0} aria-labelledby="catalog-upcoming-title">
        {upcoming.map(book => <li key={book.art} className="catalog-book">
          <Image src={book.art} alt="" fill sizes="(min-width: 768px) 390px, 39vw"/>
          <span className="catalog-cover-title">{book.title}</span>
        </li>)}
      </ol>
    </section>
  </>;
}

export function PublicCatalogContent() {
  const { progress } = useFirstDayReading();
  return <FirstDayCatalog position={progress.position} primary />;
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { FirstDayLink } from "@/features/first-day/cover-entry";
import { ArrowRight, BookOpenCheck, RotateCcw } from "lucide-react";
import { useEffect, useState, useSyncExternalStore, type PointerEvent } from "react";
import { pages } from "@/features/first-day/content";
import { createFirstDayProgressStore, firstDayReviewHref, resetFirstDayProgress } from "@/features/first-day/first-day-progress";
import "./first-day-catalog.css";

const upcoming = [
  { art: "/dashboard/coffee.webp", title: "Um café, por favor" },
  { art: "/dashboard/city.webp", title: "Do outro lado da rua" },
  { art: "/dashboard/rain.webp", title: "Um dia de chuva" },
] as const;

const chapterCount = new Set(pages.map(page => page.part)).size;

function CatalogMedal({ icon: Icon }: { icon: typeof BookOpenCheck }) {
  return <span className="catalog-achievement-medal" aria-hidden="true">
    <span className="catalog-achievement-face"><Icon strokeWidth={1.75}/></span>
  </span>;
}

function pressCover(event: PointerEvent<HTMLLIElement>) {
  if (event.isPrimary && event.button === 0) event.currentTarget.dataset.pressed = "";
}

function releaseCover(event: PointerEvent<HTMLLIElement>) {
  if (event.isPrimary) delete event.currentTarget.dataset.pressed;
}

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
    clear: () => store.update(current => resetFirstDayProgress(current, "all")),
  };
}

export function FirstDayCatalog({ position, demoCompleted = false, primary = false }: {
  position: number;
  demoCompleted?: boolean;
  primary?: boolean;
}) {
  const scene = pages[position - 1];
  const Heading = primary ? "h1" : "h2";
  const action = scene ? "Continuar leitura" : "Começar a ler";

  return <>
    <article className="catalog-feature" data-demo-completed={demoCompleted || undefined} aria-labelledby="first-day-catalog-title">
      <picture className="catalog-feature-art">
        <source media="(min-width: 768px)" srcSet="/dashboard/first-day-wide.webp" />
        <Image src="/dashboard/first-day.webp" alt="Ana lê um gibi na cafeteria, ao lado de uma cadeira amarela livre." fill loading="eager" fetchPriority="high" unoptimized />
      </picture>
      <div className="catalog-feature-copy">
        {scene && !demoCompleted && <p className="catalog-feature-note">Página {position} de {pages.length}</p>}
        <Heading id="first-day-catalog-title" lang="en" tabIndex={primary ? undefined : -1}>First Day</Heading>
        <p className="catalog-description">{scene && !demoCompleted ? `Parte ${scene.part} · ${scene.title}` : "Uma cadeira livre. Uma primeira conversa em inglês."}</p>
        {demoCompleted ? <>
          <Link className="catalog-achievement catalog-review" href={firstDayReviewHref} prefetch={false}>
            <CatalogMedal icon={RotateCcw}/>
            <span className="catalog-achievement-label">Rever a aula</span>
            <ArrowRight className="catalog-review-arrow" size={18} aria-hidden="true"/>
          </Link>
          <div className="catalog-achievement catalog-complete-award">
            <CatalogMedal icon={BookOpenCheck}/>
            <p className="catalog-achievement-label catalog-feature-completed">Demo completa</p>
          </div>
        </> : <>
          {scene ? <progress className="catalog-progress" value={position} max={pages.length} aria-label="Página atual de First Day" />
            : <p className="catalog-edition-details">{chapterCount} partes <span aria-hidden="true">·</span> {pages.length} páginas</p>}
          <FirstDayLink className="catalog-cta" prefetch={false}>{action}<ArrowRight size={19} aria-hidden="true"/></FirstDayLink>
        </>}
      </div>
    </article>
    <section className="catalog-upcoming" aria-labelledby="catalog-upcoming-title">
      <h2 id="catalog-upcoming-title">Em breve</h2>
      <ol className="catalog-shelf" tabIndex={0} aria-labelledby="catalog-upcoming-title">
        {upcoming.map(book => <li key={book.art} className="catalog-book" onPointerDown={pressCover}
          onPointerUp={releaseCover} onPointerCancel={releaseCover} onPointerLeave={releaseCover} onLostPointerCapture={releaseCover}>
          <div className="catalog-book-cover">
            <Image src={book.art} alt="" fill loading="eager" fetchPriority="low" draggable={false} unoptimized/>
            <span className="catalog-cover-title">{book.title}</span>
          </div>
        </li>)}
      </ol>
    </section>
  </>;
}

export function PublicCatalogContent() {
  const { progress } = useFirstDayReading();
  return <FirstDayCatalog position={progress.position} demoCompleted={progress.demoCompleted} primary />;
}

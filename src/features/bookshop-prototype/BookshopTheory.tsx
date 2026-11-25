"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, MessageCircle } from "lucide-react";
import { BookshopSpeech } from "./BookshopSpeech";
import { ViewportFit } from "./ViewportFit";
import { chosenPhrase, gestureFor, responseFor, scenes, type JourneyEvent, type Part, type Phrase } from "./content";

type TheoryPage = {
  id: string;
  label: string;
  title: string;
  phrase?: Phrase;
  speaker?: "Ben" | "Lara" | "Modelo";
  description?: string;
  notice?: string;
  parts: Part[];
};

function addPartPages(pages: TheoryPage[], page: Pick<TheoryPage, "id" | "label" | "title">, parts: Part[]) {
  for (let index = 0; index < parts.length; index += 2) {
    const section = index / 2 + 1;
    const total = Math.ceil(parts.length / 2);
    pages.push({
      ...page,
      id: `${page.id}-${section}`,
      label: `${page.label} · Trechos${total > 1 ? ` ${section} de ${total}` : ""}`,
      parts: parts.slice(index, index + 2),
    });
  }
}

function addSpeechPages(pages: TheoryPage[], page: Omit<TheoryPage, "parts">, parts: Part[]) {
  pages.push({ ...page, parts: parts.slice(0, 2) });
  addPartPages(pages, {
    id: `${page.id}-parts`, label: page.label, title: "Mais um trecho da fala",
  }, parts.slice(2));
}

function makePages(events: JourneyEvent[]): TheoryPage[] {
  const pages: TheoryPage[] = [];

  for (const event of events) {
    const scene = scenes.find(item => item.id === event.sceneId);
    if (!scene) continue;
    const label = `${String(scenes.indexOf(scene) + 1).padStart(2, "0")} · ${scene.label}`;

    if (scene.kind === "choice") {
      const chosen = chosenPhrase(scene, event);
      if (!chosen || event.option === undefined) continue;
      const invitation = scene.id === "invitation";

      if (invitation && scene.incoming) {
        addSpeechPages(pages, {
          id: `${scene.id}-incoming`, label, title: "O que Lara contou",
          phrase: scene.incoming, speaker: "Lara",
        }, scene.responseParts.slice(0, 2));
      }

      pages.push({
        id: `${scene.id}-choice`, label, title: "A fala que você escolheu",
        phrase: chosen, speaker: "Ben", description: scene.why,
        parts: [],
      });
      addPartPages(pages, {
        id: `${scene.id}-choice-parts`, label, title: "Sua fala, por partes",
      }, scene.parts[event.option]);
      pages.push({
        id: `${scene.id}-alternative`, label, title: "Outra forma que funcionava",
        phrase: scene.options[event.option === 0 ? 1 : 0], speaker: "Modelo", parts: [],
      });
      addSpeechPages(pages, {
        id: `${scene.id}-response`, label, title: "A resposta de Lara",
        phrase: responseFor(scene, event), speaker: "Lara",
      }, invitation ? scene.responseParts.slice(2) : scene.responseParts);
      continue;
    }

    if (scene.kind === "bookmark") {
      if (scene.incoming) {
        addSpeechPages(pages, {
          id: `${scene.id}-request`, label, title: "O pedido do marcador",
          phrase: scene.incoming, speaker: "Lara",
          notice: event.assisted ? "Você continuou com apoio nesta atividade." : undefined,
        }, scene.responseParts.filter(part => part.en !== "Thanks!"));
      }
      addSpeechPages(pages, {
        id: `${scene.id}-response`, label, title: "Como a cena continuou",
        phrase: responseFor(scene, event), speaker: "Lara",
        description: event.assisted ? gestureFor(scene, event) : "Você entregou o marcador azul. Lara agradeceu e guardou a página.",
      }, event.assisted
          ? [{ en: "Here it is.", pt: "Aqui está. Lara encontra o marcador e continua a cena." }]
          : scene.responseParts.filter(part => part.en === "Thanks!"));
      continue;
    }

    const note = chosenPhrase(scene, event);
    if (scene.incoming) {
      pages.push({
        id: `${scene.id}-note`, label, title: "A despedida do bilhete",
        phrase: note ?? scene.incoming, speaker: note ? "Ben" : "Modelo",
        description: event.assisted
          ? "Vocês usaram o modelo de Lara para a despedida do bilhete."
          : "Você montou a despedida no bilhete usando o modelo apresentado por Lara.",
        notice: event.assisted ? "Você continuou com apoio nesta atividade." : undefined,
        parts: [],
      });
      addPartPages(pages, {
        id: `${scene.id}-note-parts`, label, title: "A despedida, por partes",
      }, scene.responseParts);
    }
    pages.push({
      id: `${scene.id}-response`, label, title: "O encontro ficou combinado",
      phrase: responseFor(scene, event), speaker: "Lara",
      description: "Vocês combinaram se encontrar no domingo, às 15h30. O evento da livraria começa às 16h.",
      parts: [],
    });
  }

  pages.push({
    id: "anna", label: "A primeira frase do caderno", title: "A história que continua amanhã",
    phrase: {
      en: "Anna has a train ticket. But she doesn't want to leave.",
      pt: "Anna tem uma passagem de trem. Mas não quer ir embora.",
    },
    speaker: "Modelo",
    parts: [],
  });
  addPartPages(pages, {
    id: "anna-parts", label: "A primeira frase do caderno", title: "O começo da história de Anna",
  }, [
      { en: "Anna has a train ticket.", pt: "Anna tem uma passagem de trem. “Has” é a forma de “have” usada aqui com Anna." },
      { en: "But", pt: "Mas: introduz uma ideia que contrasta com a anterior." },
      { en: "she doesn't want to leave", pt: "Ela não quer ir embora. “She” retoma Anna; “doesn't want to” indica o que ela não quer fazer." },
  ]);

  return pages;
}

export function BookshopTheory({ events, onBack, onHistory }: {
  events: JourneyEvent[];
  onBack: () => void;
  onHistory: () => void;
}) {
  const pages = useMemo(() => makePages(events), [events]);
  const [pageIndex, setPageIndex] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const currentIndex = Math.min(pageIndex, pages.length - 1);
  const page = pages[currentIndex];
  const lastPage = currentIndex === pages.length - 1;

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [currentIndex]);

  return (
    <section className="bs-theory-page" aria-label="Consulta das expressões da história">
      <header className="bs-theory-header">
        <div className="bs-theory-actions">
          <button type="button" className="bs-text-button" onClick={onBack} style={{ minHeight: 44 }}>
            <ArrowLeft size={17} aria-hidden="true" /> Voltar ao final
          </button>
          <button type="button" className="bs-text-button" onClick={onHistory} style={{ minHeight: 44 }}>
            <MessageCircle size={17} aria-hidden="true" /> Minha conversa
          </button>
        </div>
        <p className="bs-eyebrow">Consulta das suas falas · Uma explicação por página</p>
      </header>

      <ViewportFit className="bs-theory-fit">
        <article
          className="bs-theory-card"
          data-layout={page.phrase ? page.parts.length ? "speech-parts" : "speech" : "parts"}
          key={page.id}
          aria-labelledby="bs-theory-page-title"
        >
          <p className="bs-eyebrow">{page.label}</p>
          <h2 className="bs-theory-title" id="bs-theory-page-title" ref={headingRef} tabIndex={-1}>{page.title}</h2>
          {page.notice && <p className="bs-chosen-tag">{page.notice}</p>}
          {page.phrase && <BookshopSpeech speaker={page.speaker ?? "Modelo"} phrase={page.phrase} />}
          {page.description && <p>{page.description}</p>}
          {page.parts.length > 0 && <div className="bs-theory-parts">
            {page.parts.map((part, index) => (
              <div className="bs-theory-part" key={`${part.en}-${index}`}>
                <strong lang="en" translate="no">{part.en}</strong>
                <span>{part.pt}</span>
              </div>
            ))}
          </div>}
        </article>
      </ViewportFit>

      <nav className="bs-page-navigation" aria-label="Páginas da consulta">
        <button type="button" className="bs-secondary" disabled={currentIndex === 0} onClick={() => setPageIndex(currentIndex - 1)}>
          <ArrowLeft size={17} aria-hidden="true" /> Anterior
        </button>
        <span role="status" aria-live="polite" aria-atomic="true">{currentIndex + 1} de {pages.length}</span>
        <button type="button" className="bs-primary" onClick={lastPage ? onBack : () => setPageIndex(currentIndex + 1)}>
          {lastPage ? "Concluir consulta" : "Próximo"} <ArrowRight size={17} aria-hidden="true" />
        </button>
      </nav>
    </section>
  );
}

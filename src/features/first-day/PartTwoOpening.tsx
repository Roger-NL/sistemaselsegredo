import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { RefObject } from "react";
import { LessonButton } from "../first-encounters/LessonButton";
import { firstDayPartCount } from "./content";
import type { ComicChapter } from "./first-day-progress";
import "./part-two-opening.css";

const copy = {
  2: { title: "O desenho no gibi", description: "Ana está com um gibi aberto na mesa." },
  3: { title: "Conhecendo Léo", description: "Léo chega à mesa de Ana e Rafael." },
  4: { title: "O gibi emprestado", description: "Rafael descobre de quem é o gibi." },
  5: { title: "Até amanhã", description: "Antes de se despedir, os amigos combinam de se ver de novo." },
};

type SheetProps = { titleRef: RefObject<HTMLHeadingElement | null> };

export function ChapterOpening({ chapter, titleRef, onBack, onOpen }: SheetProps & {
  chapter: ComicChapter;
  onBack: () => void;
  onOpen: () => void;
}) {
  const { title, description } = copy[chapter];

  return <section className="fd-chapter-page" aria-labelledby="fd-chapter-title">
    <div className="fd-chapter-sheet">
      <div className="fd-chapter-copy">
        <div className="fd-chapter-top">
          <span>Parte {chapter} de {firstDayPartCount}</span>
        </div>
        <h1 id="fd-chapter-title" ref={titleRef} tabIndex={-1} lang="pt-BR">{title}</h1>
        <p lang="pt-BR">{description}</p>
      </div>
    </div>
    <nav className="fd1-nav" aria-label="Navegação da página">
      <button type="button" className="lo-secondary" onClick={onBack}><ArrowLeft size={19} aria-hidden="true"/> Anterior</button>
      <LessonButton onClick={onOpen}>{chapter === 2 ? "Abrir o gibi" : `Começar a Parte ${chapter}`} <ArrowRight size={19} aria-hidden="true"/></LessonButton>
    </nav>
  </section>;
}

export function LessonEnding({ titleRef, onBack, onLeave }: SheetProps & {
  onBack: () => void;
  onLeave: () => void;
}) {
  return <section className="fd-chapter-page" aria-labelledby="fd-chapter-title">
    <div className="fd-chapter-sheet">
      <div className="fd-chapter-copy">
        <div className="fd-chapter-top"><span lang="en">First Day</span></div>
        <h1 id="fd-chapter-title" ref={titleRef} tabIndex={-1} lang="pt-BR">Aula concluída!</h1>
        <p lang="pt-BR">Você conheceu Ana e Léo. Amanhã, no almoço, vocês se encontram de novo na mesma mesa.</p>
      </div>
    </div>
    <nav className="fd1-nav" aria-label="Navegação da página">
      <button type="button" className="lo-secondary" onClick={onBack}><ArrowLeft size={19} aria-hidden="true"/> Rever atividade</button>
      <Link href="/" className="lo-secondary fd-ending-exit" onClick={onLeave}>Voltar ao painel <ArrowRight size={19} aria-hidden="true"/></Link>
    </nav>
  </section>;
}

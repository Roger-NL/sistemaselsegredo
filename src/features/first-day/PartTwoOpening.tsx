import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode, RefObject } from "react";
import { LessonButton } from "../first-encounters/LessonButton";
import type { ComicChapter } from "./first-day-progress";
import "./part-two-opening.css";

const copy = {
  2: {
    en: { title: "Ana’s comic", description: "A picture in the comic Ana is reading catches Rafael’s eye." },
    "pt-BR": { title: "O gibi da Ana", description: "Um desenho no gibi que Ana está lendo chama a atenção de Rafael." },
  },
  3: {
    en: { title: "Meeting Leo", description: "Leo joins Ana and Rafael at the table." },
    "pt-BR": { title: "Conhecendo Leo", description: "Leo chega à mesa de Ana e Rafael." },
  },
  4: {
    en: { title: "See you next time", description: "Before they leave, the friends make a plan to meet again." },
    "pt-BR": { title: "Até a próxima", description: "Antes de se despedir, os amigos combinam de se ver de novo." },
  },
};

type Language = "en" | "pt-BR";
type SheetProps = { language: Language; titleRef: RefObject<HTMLHeadingElement | null> };

export function ChapterOpening({ chapter, language, titleRef, languageButton, onBack, onOpen }: SheetProps & {
  chapter: ComicChapter;
  languageButton: ReactNode;
  onBack: () => void;
  onOpen: () => void;
}) {
  const { title, description } = copy[chapter][language];

  return <section className="fd-chapter-page" aria-labelledby="fd-chapter-title">
    <div className="fd-chapter-sheet">
      <div className="fd-chapter-copy">
        <div className="fd-chapter-top">
          <span>Parte {chapter} de 4</span>
          <div className="fd1-listen">{languageButton}</div>
        </div>
        <h1 id="fd-chapter-title" ref={titleRef} tabIndex={-1} lang={language}>{title}</h1>
        <p lang={language}>{description}</p>
      </div>
    </div>
    <nav className="fd1-nav" aria-label="Navegação da página">
      <button type="button" className="lo-secondary" onClick={onBack}><ArrowLeft size={19} aria-hidden="true"/> Anterior</button>
      <LessonButton onClick={onOpen}>{chapter === 2 ? "Abrir o gibi" : `Começar a Parte ${chapter}`} <ArrowRight size={19} aria-hidden="true"/></LessonButton>
    </nav>
  </section>;
}

export function LessonEnding({ language, titleRef, onBack, onLeave }: SheetProps & {
  onBack: () => void;
  onLeave: () => void;
}) {
  return <section className="fd-chapter-page" aria-labelledby="fd-chapter-title">
    <div className="fd-chapter-sheet">
      <div className="fd-chapter-copy">
        <div className="fd-chapter-top"><span>First Day</span></div>
        <h1 id="fd-chapter-title" ref={titleRef} tabIndex={-1} lang={language}>
          {language === "en" ? "Lesson complete!" : "Aula concluída!"}
        </h1>
        <p lang={language}>{language === "en"
          ? "You met Ana and Leo. You’ll meet them again at the same table tomorrow at lunch."
          : "Você conheceu Ana e Leo. Amanhã, no almoço, vocês se encontram de novo na mesma mesa."}</p>
      </div>
    </div>
    <nav className="fd1-nav" aria-label="Navegação da página">
      <button type="button" className="lo-secondary" onClick={onBack}><ArrowLeft size={19} aria-hidden="true"/> Rever atividade</button>
      <Link href="/" className="lo-secondary fd-ending-exit" onClick={onLeave}>Voltar ao painel <ArrowRight size={19} aria-hidden="true"/></Link>
    </nav>
  </section>;
}

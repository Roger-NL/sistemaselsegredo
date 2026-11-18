"use client";

import { useLessonViewport } from "./useLessonViewport";
import { Brand } from "@/components/ui/Brand";
import { COMIC_LESSON_STYLE } from "./lesson-comic-theme";
import { LessonConclusion } from "./LessonConclusion";
import "./lesson-one.css";
import "./lesson-comic-theme.css";
import "./lesson-mobile.css";

/** Standalone practice never mounts the account progress bridge. */
export function LessonReview({ section, fontClassName }: { section: "teoria" | "teste" | "extras"; fontClassName: string }) {
  useLessonViewport();
  return <div className={`lo-app ${fontClassName}`} style={COMIC_LESSON_STYLE} data-lesson-theme="comic" data-ui-sound-scope="local">
    <header className="lo-header"><Brand href="/dashboard"/><a className="lc-review-exit" href="/dashboard">Voltar ao painel</a></header>
    <LessonConclusion key={section} section={section} onReturnToPractice={() => window.location.assign("/dashboard")}/>
  </div>;
}

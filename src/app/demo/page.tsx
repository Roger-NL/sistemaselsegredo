import type { Metadata } from "next";
import { LessonOne } from "@/features/first-encounters/LessonOne";
import { lessonFont } from "@/features/first-encounters/lesson-font";

export const metadata: Metadata = {
  title: "Primeiros encontros · Aula gratuita",
  description: "Aprenda I am, you are, we are e they are em cenas visuais. Apresentação, guia, prática, teoria e teste gratuitos, sem microfone.",
  alternates: { canonical: "/demo" },
};

/** The lesson is public; its bridge handles verified account progress. */
export default function DemoPage() { return <LessonOne fontClassName={lessonFont.variable}/>; }

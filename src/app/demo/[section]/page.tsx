import { notFound } from "next/navigation";
import { LessonReview } from "@/features/first-encounters/LessonReview";
import { lessonFont } from "@/features/first-encounters/lesson-font";

export const dynamicParams = false;
export const generateStaticParams = () => ["teoria", "teste", "extras"].map(section => ({ section }));

export default async function ReviewPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (section !== "teoria" && section !== "teste" && section !== "extras") notFound();
  return <LessonReview section={section} fontClassName={lessonFont.variable}/>;
}

import { notFound, redirect } from "next/navigation";

export const dynamicParams = false;
export const generateStaticParams = () => ["teoria", "teste", "extras"].map(section => ({ section }));

export default async function DemoSectionAlias({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (section !== "teoria" && section !== "teste" && section !== "extras") notFound();
  redirect("/first-day");
}

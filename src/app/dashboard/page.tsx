import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LessonDashboard } from "@/features/first-encounters/LessonDashboard";
import { getDashboardAccount } from "@/server/dashboard/account";

export const metadata: Metadata = {
  title: "Meu painel",
  description: "Seu espaço no BasedSpeak. Continue a aula, acompanhe seu avanço e acesse sua conta.",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const account = await getDashboardAccount();
  if (!account) redirect("/comecar?modo=entrar");
  return <LessonDashboard account={account} />;
}

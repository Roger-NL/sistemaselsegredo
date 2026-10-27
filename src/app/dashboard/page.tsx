import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Dashboard } from "@/features/dashboard/Dashboard";
import { getDashboardAccount } from "@/server/dashboard/account";
import "@/features/dashboard/dashboard.css";

export const metadata: Metadata = {
  title: "Meu painel",
  description: "Seu espaço no BasedSpeak. Acesse sua jornada e continue sua história.",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const account = await getDashboardAccount();
  if (!account) redirect("/comecar?modo=entrar");
  return <Dashboard account={account} />;
}

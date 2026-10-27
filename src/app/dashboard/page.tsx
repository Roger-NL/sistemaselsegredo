import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Dashboard } from "@/features/dashboard/Dashboard";
import { isVisualAccessMode, VISUAL_ACCOUNT } from "@/config/access";
import { getDashboardAccount } from "@/server/dashboard/account";
import "@/features/dashboard/dashboard.css";

export const metadata: Metadata = {
  title: "Meu painel",
  description: "Seu espaço no BasedSpeak. Acesse sua jornada e continue sua história.",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  if (isVisualAccessMode()) return <Dashboard account={VISUAL_ACCOUNT} visual />;
  const account = await getDashboardAccount();
  if (!account) redirect("/comecar?modo=entrar");
  return <Dashboard account={account} />;
}

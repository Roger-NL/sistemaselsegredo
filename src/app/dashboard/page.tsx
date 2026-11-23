import type { Metadata } from "next";
import { Dashboard } from "@/features/dashboard/Dashboard";
import { PublicDashboard } from "@/features/dashboard/PublicDashboard";
import { getDashboardAccount } from "@/server/dashboard/account";

export const metadata: Metadata = {
  title: "Meu painel",
  description: "Seu espaço no BasedSpeak. Continue a leitura, acompanhe seu avanço e acesse sua conta.",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const account = await getDashboardAccount();
  return account ? <Dashboard account={account} /> : <PublicDashboard />;
}

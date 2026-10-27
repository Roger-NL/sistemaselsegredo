import { AppHeader } from "@/components/navigation/AppHeader";
import "@/features/dashboard/dashboard.css";

export default function DashboardLoading() {
  return <div className="dashboard"><AppHeader current="dashboard" /><main className="dashboard-main dashboard-wrap" aria-busy="true"><p className="dashboard-overline">Seu espaço</p><h1>Meu painel.</h1><p className="dashboard-subtitle" role="status">Abrindo seu painel…</p></main></div>;
}

import type { Metadata } from "next";
import { PublicDashboard } from "@/features/dashboard/PublicDashboard";

export const metadata: Metadata = {
  title: { absolute: "BasedSpeak | Inglês em quadrinhos" },
  description: "Aprenda inglês dentro de um gibi. Comece com First Day e monte suas primeiras falas na história.",
  alternates: { canonical: "/" },
};

export default function HomePage() { return <PublicDashboard />; }

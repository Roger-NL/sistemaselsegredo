import type { Metadata } from "next";
import { AdminWorkspace } from "@/features/admin/AdminWorkspace";
import "@/features/admin/admin.css";
import { getRequestPrincipal } from "@/server/auth/principal";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Administração",
  description: "Área de gestão do BasedSpeak.",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const principal = await getRequestPrincipal();
  if (!principal || principal.role !== "admin" || (principal.accountStatus && principal.accountStatus !== "active")) redirect("/adm/entrar");
  return <AdminWorkspace />;
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getRequestPrincipal } from "@/server/auth/principal";
import { AdminLogin } from "@/features/admin/AdminLogin";
import "@/features/admin/admin.css";

export const metadata: Metadata = { title: "Acesso de manager", robots: { index: false, follow: false } };
export default async function AdminLoginPage() {
  const principal = await getRequestPrincipal();
  if (principal?.role === "admin" && (!principal.accountStatus || principal.accountStatus === "active")) redirect("/adm");
  return <AdminLogin />;
}

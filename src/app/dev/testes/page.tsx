import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { localToolsAllowed } from "@/features/local-testing/environment";
import { LocalTestPanel } from "@/features/local-testing/LocalTestPanel";
export const metadata = { title: "Testes locais", robots: { index: false, follow: false } };
export default async function LocalTestsPage() {
  if (!localToolsAllowed((await headers()).get("host") ?? "")) notFound();
  return <LocalTestPanel />;
}

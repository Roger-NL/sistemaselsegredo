import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { localToolsAllowed } from "@/features/local-testing/environment";
import { BookshopPrototype } from "@/features/bookshop-prototype/BookshopPrototype";
import "@/features/bookshop-prototype/bookshop-prototype.css";

export const metadata = {
  title: "Uma conversa na livraria | Teste local",
  robots: { index: false, follow: false },
};

export default async function BookshopTestPage() {
  if (!localToolsAllowed((await headers()).get("host") ?? "")) notFound();
  return <BookshopPrototype />;
}

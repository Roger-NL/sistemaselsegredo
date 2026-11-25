import { FirstDayLink } from "@/features/first-day/cover-entry";
import Link from "next/link";
import { CatalogHeader } from "./CatalogHeader";
import { PublicCatalogContent } from "./FirstDayCatalog";

export function PublicDashboard() {
  return <div className="dashboard dashboard-catalog dashboard-catalog-public">
    <a className="catalog-skip" href="#meu-painel">Pular para o conteúdo</a>
    <CatalogHeader home="/">
      <FirstDayLink  prefetch={false} lang="en">First Day</FirstDayLink>
      <a href="#catalog-upcoming-title">Em breve</a>
    </CatalogHeader>
    <main id="meu-painel" className="catalog-main catalog-wrap">
      <PublicCatalogContent />
    </main>
    <footer className="catalog-footer catalog-wrap">
      <nav aria-label="Informações legais"><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos</Link></nav>
    </footer>
  </div>;
}

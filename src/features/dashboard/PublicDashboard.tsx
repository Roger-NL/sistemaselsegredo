import Link from "next/link";
import { Brand } from "@/components/ui/Brand";
import { PublicCatalogContent } from "./FirstDayCatalog";

export function PublicDashboard() {
  return <div className="dashboard dashboard-catalog dashboard-catalog-public">
    <a className="catalog-skip" href="#meu-painel">Pular para o conteúdo</a>
    <header className="catalog-header">
      <div className="catalog-wrap">
        <Brand href="/"/>
      </div>
    </header>
    <main id="meu-painel" className="catalog-main catalog-wrap">
      <PublicCatalogContent />
    </main>
    <footer className="catalog-footer catalog-wrap">
      <nav aria-label="Informações legais"><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos</Link></nav>
    </footer>
  </div>;
}

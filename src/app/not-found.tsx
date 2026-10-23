import Link from "next/link";
export default function NotFound() {
  return <main className="demo-shell"><section className="ending"><p className="eyebrow">404</p><h1>Esta página não foi encontrada.</h1><p>A conversa da cafeteria começa na página inicial.</p><Link className="primary button-link" href="/">Ir para o início</Link></section></main>;
}

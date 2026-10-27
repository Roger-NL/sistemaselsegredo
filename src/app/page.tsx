import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check, MicOff } from "lucide-react";
import { Brand } from "@/components/ui/Brand";
import { ConversationPreview } from "@/features/landing/ConversationPreview";
import { MoreInformation } from "@/features/landing/MoreInformation";
import { ViewportFrame } from "@/features/landing/ViewportFrame";
import "@/features/landing/landing.css";

export const metadata: Metadata = {
  title: "BasedSpeak | Inglês é pra participar",
  description: "Entre na história, escolha o que dizer e construa sua resposta com apoio. Crie sua conta e experimente a demo gratuita, sem microfone.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Inglês é pra participar. | BasedSpeak",
    description: "Entre na história. Escolha o que dizer. Experimente a demo gratuita.",
    locale: "pt_BR", type: "website", url: "/", siteName: "BasedSpeak",
  },
};

export default function HomePage() {
  return <ViewportFrame className="landing">
    <a className="landing-skip" href="#conteudo">Pular para o conteúdo</a>
    <header className="landing-header landing-wrap">
      <Brand />
      <Link href="/comecar?modo=entrar" prefetch={false} className="landing-login">Entrar<ArrowUpRight size={15} aria-hidden="true" /></Link>
    </header>
    <main id="conteudo" className="landing-main landing-wrap">
      <div className="landing-hero-copy">
        <p className="landing-eyebrow"><span className="landing-small-mark" aria-hidden="true" />INGLÊS POR HISTÓRIAS</p>
        <h1>Inglês é pra<br /><span>participar.</span></h1>
        <p className="landing-lead">Entre na história. Escolha o que dizer.<br className="landing-desktop-break" /> Construa sua resposta, com apoio.</p>
        <div className="landing-hero-actions">
          <Link href="/comecar" prefetch={false} className="landing-cta">Criar conta e experimentar<ArrowUpRight size={19} aria-hidden="true" /></Link>
          <MoreInformation />
        </div>
        <p className="landing-assurance"><span><Check size={14} aria-hidden="true" />Demo gratuita</span><span><MicOff size={14} aria-hidden="true" />Sem microfone</span></p>
      </div>
      <ConversationPreview />
    </main>
    <footer className="landing-footer landing-wrap"><span>Um encontro de cada vez.</span><nav aria-label="Informações legais"><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos</Link></nav></footer>
  </ViewportFrame>;
}

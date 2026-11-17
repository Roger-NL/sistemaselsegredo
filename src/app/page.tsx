import { SoundMenu } from "@/components/interaction/InteractionSounds";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getDashboardIdentity } from "@/server/dashboard/account";
import { ArrowUpRight, Check, MicOff } from "lucide-react";
import { Brand } from "@/components/ui/Brand";
import { ConversationPreview } from "@/features/landing/ConversationPreview";
import { MoreInformation } from "@/features/landing/MoreInformation";
import { ViewportFrame } from "@/features/landing/ViewportFrame";
import "@/features/landing/landing.css";

export const metadata: Metadata = {
  title: "BasedSpeak | Inglês na prática",
  description: "Aprenda inglês em cenas visuais: apresentação, guia, prática, teoria e teste. Experimente a aula gratuita, sem cadastro e sem microfone.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Inglês na prática. | BasedSpeak",
    description: "Escute, explore as cenas e construa suas primeiras falas. Experimente a aula gratuita.",
    locale: "pt_BR", type: "website", url: "/", siteName: "BasedSpeak",
  },
};

export default async function HomePage() {
  if (await getDashboardIdentity()) redirect("/dashboard");
  return <ViewportFrame className="landing">
    <a className="landing-skip" href="#conteudo">Pular para o conteúdo</a>
    <header className="landing-header landing-wrap">
      <Brand />
      <div className="public-header-actions"><Link href="/comecar?modo=entrar" prefetch={false} className="landing-login">Entrar<ArrowUpRight size={15} aria-hidden="true" /></Link><SoundMenu /></div>
    </header>
    <main id="conteudo" className="landing-main landing-wrap">
      <div className="landing-hero-copy">
        <p className="landing-eyebrow"><span className="landing-small-mark" aria-hidden="true" />APRENDA FAZENDO</p>
        <h1>Inglês na<br /><span>prática.</span></h1>
        <p className="landing-lead">Explore as cenas. Escolha o que dizer.<br className="landing-desktop-break" /> Construa sua resposta, com apoio.</p>
        <div className="landing-hero-actions">
          <Link href="/demo" prefetch={false} className="landing-cta">Começar a aula<ArrowUpRight size={19} aria-hidden="true" /></Link>
          <MoreInformation />
        </div>
        <p className="landing-assurance"><span><Check size={14} aria-hidden="true" />Demo gratuita</span><span><MicOff size={14} aria-hidden="true" />Sem microfone</span></p>
      </div>
      <ConversationPreview />
    </main>
    <footer className="landing-footer landing-wrap"><span>Aprenda fazendo.</span><nav aria-label="Informações legais"><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos</Link></nav></footer>
  </ViewportFrame>;
}

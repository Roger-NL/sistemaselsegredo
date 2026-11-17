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

const pageTitle = "Inglês na prática para quem começa do zero | BasedSpeak";
const description = "Aprenda inglês do zero com a Nina. Ouça os personagens, monte frases e pratique a escrita em Primeiros encontros, a primeira aula gratuita da BasedSpeak.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.basedspeak.com"),
  title: { absolute: pageTitle },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: pageTitle, description,
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
        <h1>Inglês na <br /><span>prática.</span></h1>
        <p className="landing-lead">Comece do zero com a Nina. Ouça os personagens, arraste balões e monte suas primeiras frases.</p>
        <div className="landing-hero-actions">
          <Link href="/demo" prefetch={false} className="landing-cta">Começar a aula gratuita<ArrowUpRight size={19} aria-hidden="true" /></Link>
          <MoreInformation />
        </div>
        <p className="landing-assurance"><span><Check size={14} aria-hidden="true" />Sem cadastro</span><span><MicOff size={14} aria-hidden="true" />Sem microfone</span></p>
      </div>
      <ConversationPreview />
    </main>
    <footer className="landing-footer landing-wrap"><span>Aprenda fazendo.</span><nav aria-label="Informações legais"><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos</Link></nav></footer>
  </ViewportFrame>;
}

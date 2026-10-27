import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { Brand } from "@/components/ui/Brand";
import { SignupForm } from "@/features/landing/SignupForm";
import { AUTH_SESSION_COOKIE_NAME } from "@/server/auth/session-cookie";
import { getAdminAuth } from "@/server/firebase";
import "@/features/landing/landing.css";
import "@/features/landing/signup.css";

export const metadata: Metadata = { title: "Começar", description: "Crie sua conta e experimente a conversa guiada BasedSpeak.", robots: { index: false, follow: true } };

export default async function StartPage({ searchParams }: { searchParams: Promise<{ modo?: string }> }) {
  const cookie = (await cookies()).get(AUTH_SESSION_COOKIE_NAME)?.value;
  let authenticated = false;
  if (cookie) {
    try { await getAdminAuth().verifySessionCookie(cookie, true); authenticated = true; }
    catch { /* An expired cookie must not prevent signing in again. */ }
  }
  if (authenticated) redirect("/demo");
  const { modo } = await searchParams;
  return <div className="start-page">
    <header className="start-header landing-wrap"><Brand /><Link href="/" className="start-back"><ArrowLeft size={15} aria-hidden="true" />Voltar</Link></header>
    <main className="start-main landing-wrap">
      <div className="start-story"><p className="landing-eyebrow">SEU PRIMEIRO ENCONTRO COM O INGLÊS.</p><h2>Tem uma conversa<br />esperando por você.</h2><p>Escolha o que dizer. Construa com apoio.<br />Descubra o jeito BasedSpeak de aprender.</p><div className="start-type" aria-hidden="true"><span>Think it.</span><span>Build it.</span><span>Say it. ↗</span></div><p className="start-free"><Check size={15} aria-hidden="true" />Demo gratuita. Sem cartão. Sem microfone.</p></div>
      <SignupForm initialMode={modo === "entrar" ? "login" : "signup"} />
    </main>
    <footer className="start-footer landing-wrap"><span>BasedSpeak · Um encontro de cada vez.</span><nav aria-label="Informações legais"><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos</Link></nav></footer>
  </div>;
}

"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="demo-shell"><section className="ending"><h1>Não foi possível abrir esta parte.</h1><p>Você pode tentar novamente ou voltar ao início para retomar sua conversa.</p><div className="actions"><Button onClick={reset}>Tentar novamente</Button><Link href="/">Voltar ao início</Link></div></section></main>;
}

"use client";
import "./globals.css";
import "./product-base.css";
import "./comic-theme.css";
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="pt-BR" translate="yes"><body><main className="demo-shell"><section className="ending"><h1>Não foi possível abrir a aula.</h1><p>Tente novamente. Seu progresso salvo continua disponível.</p><button className="primary" onClick={reset}>Tentar novamente</button></section></main></body></html>;
}

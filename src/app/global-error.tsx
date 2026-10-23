"use client";
import "./globals.css";
import "@/features/demo/demo.css";
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="pt-BR"><body><main className="demo-shell"><section className="ending"><h1>Não foi possível abrir a conversa.</h1><p>Tente novamente. Sua tentativa guardada neste navegador não foi descartada.</p><button className="primary" onClick={reset}>Tentar novamente</button></section></main></body></html>;
}

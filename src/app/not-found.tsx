"use client";

import Link from "next/link";
import { TubesBackground } from "@/components/ui/neon-flow";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <TubesBackground className="min-h-screen flex items-center justify-center">
            <div className="text-center z-10 px-4">
                <h1 className="text-9xl font-black text-[#EEF4D4] mb-4 tracking-tighter shadow-glow">
                    404
                </h1>
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-6 uppercase tracking-widest">
                    Sinal Perdido
                </h2>
                <p className="text-white/60 mb-8 max-w-md mx-auto">
                    Aparentemente você navegou para uma região desconhecida do cosmos.
                    Retorne à base antes que o oxigênio acabe.
                </p>
                <Link href="/">
                    <Button variant="outline" className="border-[#EEF4D4] text-[#EEF4D4] hover:bg-[#EEF4D4] hover:text-black transition-all">
                        RETORNAR À BASE
                    </Button>
                </Link>
            </div>
        </TubesBackground>
    );
}

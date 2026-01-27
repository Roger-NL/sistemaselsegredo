"use client";

import { useEffect } from "react";
import { TubesBackground } from "@/components/ui/neon-flow";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <TubesBackground className="min-h-screen flex items-center justify-center">
            <div className="text-center z-10 px-4">
                <h1 className="text-6xl md:text-8xl font-black text-red-500 mb-4 tracking-tighter">
                    ERRO
                </h1>
                <h2 className="text-xl md:text-3xl font-bold text-white mb-6 uppercase tracking-widest">
                    Falha no Sistema
                </h2>
                <p className="text-white/60 mb-8 max-w-md mx-auto">
                    Detectamos uma anomalia nos sistemas de navegação.
                    Nossos engenheiros já foram notificados.
                </p>
                <div className="flex gap-4 justify-center">
                    <Button
                        onClick={() => reset()}
                        variant="default"
                        className="bg-red-500 hover:bg-red-600 text-white border-none"
                    >
                        REINICIAR SISTEMAS
                    </Button>
                    <Button
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                        onClick={() => window.location.href = '/'}
                    >
                        VOLTAR AO INÍCIO
                    </Button>
                </div>
            </div>
        </TubesBackground>
    );
}

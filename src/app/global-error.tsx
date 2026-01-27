"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html lang="pt-BR">
            <body className="bg-black text-white flex items-center justify-center min-h-screen">
                <div className="text-center px-4">
                    <h1 className="text-4xl font-bold text-red-500 mb-4">Falha Crítica do Sistema</h1>
                    <p className="mb-6 text-white/50">O núcleo do sistema encontrou um erro irrecuperável.</p>
                    <button
                        onClick={() => reset()}
                        className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                        Reiniciar Núcleo
                    </button>
                </div>
            </body>
        </html>
    );
}

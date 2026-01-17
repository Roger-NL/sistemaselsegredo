"use client";

import { SolarSystem } from "@/components/solar/SolarSystem";
import { useProgress } from "@/context/ProgressContext";
import { RefreshCcw } from "lucide-react";

// ============================================================================
// DASHBOARD PAGE
// A tela principal do Sistema Solar onde o aluno visualiza seu progresso
// ============================================================================

export default function DashboardPage() {
    const { getCompletedCount, areAllPillarsComplete, resetProgress } = useProgress();
    const completedCount = getCompletedCount();
    const allComplete = areAllPillarsComplete();

    return (
        <main className="min-h-screen bg-[#050505] text-white overflow-hidden">
            {/* Header simples - Responsivo Compacto */}
            <header className="fixed top-0 left-0 right-0 z-[100] px-4 py-2 bg-black/80 backdrop-blur-md border-b border-[#d4af37]/20">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
                    {/* Logo Mobile: Esquerda, menor */}
                    <h1 className="text-lg font-bold tracking-tight flex flex-col leading-none">
                        <span><span className="text-[#d4af37]">ES</span> English</span>
                        <span className="text-xs text-zinc-500 font-normal tracking-widest">Academy</span>
                    </h1>

                    <div className="flex items-center gap-3">
                        {/* Progresso Compacto */}
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1.5">
                                <span className="text-white font-serif font-black text-lg tracking-tight">{completedCount}/9</span>
                                {allComplete ? (
                                    <span className="bg-[#d4af37] text-black text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                                        Max
                                    </span>
                                ) : (
                                    <span className="text-[#d4af37] text-[10px] uppercase tracking-wider">Pilares</span>
                                )}
                            </div>
                        </div>

                        {/* Botão de Reset Ícone Apenas no Mobile */}
                        <div className="w-px h-6 bg-[#d4af37]/20"></div>

                        <button
                            onClick={resetProgress}
                            className="flex items-center justify-center bg-red-900/10 hover:bg-red-900/20 text-red-500 w-8 h-8 rounded-full border border-red-900/30 active:scale-90"
                            title="Resetar"
                        >
                            <RefreshCcw className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Área do Sistema Solar */}
            <div className="pt-20 px-4">
                {/* Título da seção */}
                <div className="text-center mb-4 md:mb-8">
                    <h2 className="text-3xl md:text-5xl font-serif font-black mb-2 text-white">
                        O SEU <span className="text-[#d4af37] text-bevel">IMPÉRIO</span>
                    </h2>
                    <p className="text-zinc-500 max-w-md mx-auto uppercase tracking-widest text-xs">
                        {allComplete
                            ? "Domínio Total Conquistado. Escolha sua Especialização."
                            : "Acesse o Núcleo de Energia (Sol) para expandir seu território."
                        }
                    </p>
                </div>

                {/* O Sistema Solar */}
                <SolarSystem />
            </div>
        </main>
    );
}

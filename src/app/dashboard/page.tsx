"use client";

import { SolarSystem } from "@/components/solar/SolarSystem";
import { useProgress } from "@/context/ProgressContext";
import { RefreshCcw } from "lucide-react";
import { getRank } from "@/utils/ranks";

export default function DashboardPage() {
    const { getCompletedCount, areAllPillarsComplete, resetProgress } = useProgress();
    const completedCount = getCompletedCount();
    const allComplete = areAllPillarsComplete();
    const currentRank = getRank(completedCount);

    return (
        <main className="h-screen w-screen text-white overflow-hidden flex flex-col">
            {/* Header simples - Responsivo Compacto */}
            <header className="flex-none px-4 py-3 bg-black/80 backdrop-blur-md border-b border-[#d4af37]/20 z-[100]">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 w-full">
                    {/* Logo Mobile: Esquerda, menor */}
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold tracking-tight flex flex-col leading-none">
                            <span><span className="text-[#d4af37]">ES</span> English</span>
                            <span className="text-xs text-zinc-500 font-normal tracking-widest">Academy</span>
                        </h1>
                        {/* Rank Display Mobile */}
                        <span className="text-[10px] text-[#d4af37] font-mono uppercase tracking-widest mt-1 md:hidden">
                            {currentRank}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Rank Display Desktop */}
                        <div className="hidden md:flex flex-col items-end mr-4 border-r border-[#d4af37]/20 pr-4">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Patente Atual</span>
                            <span className="text-sm text-[#d4af37] font-bold uppercase tracking-wider">{currentRank}</span>
                        </div>

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

            {/* Área do Sistema Solar - Flex Grow para ocupar o resto */}
            <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
                {/* Título da seção (Estilo HUD Tático Premium) */}
                <div className="absolute top-8 left-0 right-0 flex flex-col items-center justify-center z-10 pointer-events-none select-none">
                    <div className="flex items-center gap-4 opacity-80">
                        {/* Linha Decorativa Esquerda */}
                        <div className="h-px w-16 md:w-32 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-[#d4af37]" />

                        <div className="relative px-4 py-1">
                            {/* Bordas do HUD */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#d4af37]" />
                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#d4af37]" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#d4af37]" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#d4af37]" />

                            <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-[0.25em] text-center">
                                Mapa de <span className="text-[#d4af37]">Conquista</span>
                            </h2>
                        </div>

                        {/* Linha Decorativa Direita */}
                        <div className="h-px w-16 md:w-32 bg-gradient-to-l from-transparent via-[#d4af37]/50 to-[#d4af37]" />
                    </div>

                    {/* Subtítulo Técnico */}
                    <p className="text-[10px] text-[#d4af37]/60 font-mono tracking-[0.4em] mt-2 uppercase">
                        Sistema Operacional V4.0
                    </p>
                </div>

                {/* O Sistema Solar */}
                <div className="w-full h-full flex items-center justify-center z-0">
                    <SolarSystem />
                </div>
            </div>
        </main>
    );
}

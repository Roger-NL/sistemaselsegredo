"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { PLANETS } from "@/data/curriculum";
import { notFound } from "next/navigation";
import { useProgress } from "@/context/ProgressContext";

// ============================================================================
// SPECIALIZATION PAGE (PLANETAS)
// Página de especializações - só acessível se todos os pilares estiverem completos
// E se for a especialização escolhida!
// ============================================================================

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function SpecPage({ params }: PageProps) {
    const { id } = use(params); // React.use() para desembrulhar props em client components (Next 15+)
    const planet = PLANETS.find((p) => p.id === id);

    // Contexto de progresso (Client-side)
    const { areAllPillarsComplete, chosenSpecialization } = useProgress();

    // Estado local para evitar hydration mismatch
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!planet) {
        notFound();
    }

    // Regras de desbloqueio:
    // 1. Todos os pilares completos
    // 2. Esta é a especialização escolhida
    const pillarsComplete = areAllPillarsComplete();
    const isChosen = chosenSpecialization === id;
    const isUnlocked = pillarsComplete && isChosen;

    // Loading state enquanto hidrata
    if (!isClient) {
        return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-500">Carregando dados da missão...</div>;
    }

    return (
        <main className="min-h-screen bg-[#050505] text-white">
            {/* Header */}
            <header className="px-6 py-4 border-b border-zinc-800">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-bold flex items-center gap-2">
                            <span className="text-2xl">{planet.icon}</span>
                            {planet.title}
                        </h1>
                        <p className="text-xs text-zinc-500">Especialização</p>
                    </div>
                </div>
            </header>

            {/* Conteúdo */}
            <div className="px-6 py-12">
                <div className="max-w-2xl mx-auto text-center">
                    {isUnlocked ? (
                        /* Estado desbloqueado */
                        <div className="animate-in fade-in zoom-in duration-500">
                            <div
                                className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-5xl"
                                style={{
                                    background: `linear-gradient(135deg, ${planet.color}40, ${planet.color})`,
                                    boxShadow: `0 0 40px ${planet.color}60`,
                                }}
                            >
                                {planet.icon}
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold mb-4">
                                Bem-vindo à especialização
                            </h2>
                            <p className="text-zinc-400 mb-8">
                                Aqui você vai dominar técnicas avançadas de {planet.title.toLowerCase()}.
                                Este conteúdo foi criado para quem já completou todos os 9 pilares.
                            </p>
                            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                                <p className="text-zinc-500">
                                    Conteúdo da especialização será carregado aqui.
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Estado bloqueado */
                        <div className="animate-in fade-in duration-500">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-zinc-800 flex items-center justify-center">
                                <Lock className="w-10 h-10 text-zinc-600" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-zinc-400">
                                Especialização Bloqueada
                            </h2>
                            <p className="text-zinc-500 mb-8 max-w-md mx-auto">
                                {!pillarsComplete
                                    ? "Complete todos os 9 pilares do Sistema Solar para acessar esta área."
                                    : "Você escolheu outra especialização. Fique nesta trilha por enquanto!"
                                }
                            </p>
                            <Link
                                href="/dashboard"
                                className="inline-block px-6 py-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors"
                            >
                                Voltar ao Sistema Solar
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

"use client";

import { useRouter, useParams } from "next/navigation";
import { useProgress } from "@/context/ProgressContext";
import { PILLARS } from "@/data/curriculum";
import { TubesBackground } from "@/components/ui/neon-flow";
import { TacticalCard, TacticalButton } from "@/components/ui/TacticalCard";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Lock } from "lucide-react";
import { PILLARS_CONTENT } from "@/data/pillars-content";
import { StudyViewer } from "@/components/features/study/StudyViewer";

export default function PilarPage() {
    const router = useRouter();
    const params = useParams();
    const pillarId = Number(params.id) || 1;

    const { isPillarUnlocked, getCurrentPillarNumber } = useProgress();

    const pillar = PILLARS[pillarId - 1];
    const isUnlocked = isPillarUnlocked(pillarId);
    const currentPillarNumber = getCurrentPillarNumber();
    const isCompleted = pillarId < currentPillarNumber;
    const isCurrent = pillarId === currentPillarNumber;

    const handleStartQuiz = () => {
        router.push("/quiz");
    };

    const handleBack = () => {
        router.push("/");
    };

    // Se o pilar não existe
    if (!pillar) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <TacticalCard variant="danger" className="p-8 text-center max-w-md">
                    <h1 className="text-2xl font-bold text-[#EEF4D4] mb-4">Pilar não encontrado</h1>
                    <TacticalButton onClick={() => router.push("/")}>
                        <ArrowLeft className="w-4 h-4 mr-2 inline" />
                        Voltar ao Dashboard
                    </TacticalButton>
                </TacticalCard>
            </div>
        );
    }

    // Se o pilar está bloqueado
    if (!isUnlocked) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <TacticalCard variant="default" className="p-8 text-center max-w-md">
                    <Lock className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-[#EEF4D4] mb-2">{pillar.title}</h1>
                    <p className="text-white/50 mb-6">
                        Complete o Pilar {pillarId - 1} primeiro para desbloquear este conteúdo.
                    </p>
                    <TacticalButton variant="neon" onClick={() => router.push(`/pilar/${currentPillarNumber}`)}>
                        Ir para Pilar {currentPillarNumber}
                        <ArrowRight className="w-4 h-4 ml-2 inline" />
                    </TacticalButton>
                </TacticalCard>
            </div>
        );
    }

    // Selecionar conteúdo baseado no ID do Map
    const activeContent = PILLARS_CONTENT[pillarId] || null;

    return (
        <TubesBackground className="min-h-screen">
            <div className="min-h-screen w-full overflow-y-auto pointer-events-auto">
                <main className="w-full p-4 md:p-8 pb-20">
                    <div className="max-w-4xl mx-auto">

                        {/* Header Navigation */}
                        <div className="flex items-center justify-between mb-8 relative z-50">
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 text-white/50 hover:text-white transition-colors py-2 px-3 -ml-3 rounded-md hover:bg-white/5"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden md:inline">Global Command</span>
                            </button>

                            {/* Progresso Visual */}
                            <div className="flex gap-1.5">
                                {PILLARS.map((_, idx) => {
                                    const num = idx + 1;
                                    const done = num < currentPillarNumber;
                                    const current = num === pillarId;

                                    return (
                                        <div
                                            key={num}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                                current ? "w-8 bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" : 
                                                done ? "w-4 bg-emerald-500/50" : "w-2 bg-white/10"
                                            }`}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        {/* ÁREA DE ESTUDO */}
                        {activeContent ? (
                            <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">
                                <StudyViewer data={activeContent} />
                                
                                {/* Ação Final do Pilar */}
                                <div className="mt-12 flex justify-center pb-20">
                                    <TacticalButton
                                        variant="neon"
                                        onClick={handleStartQuiz}
                                        className="py-4 px-8 text-lg"
                                    >
                                        <span className="flex items-center gap-3">
                                            <CheckCircle2 className="w-6 h-6" />
                                            Confirmar Leitura e Iniciar Missão
                                            <ArrowRight className="w-5 h-5" />
                                        </span>
                                    </TacticalButton>
                                </div>
                            </div>
                        ) : (
                            // Fallback para pilares sem conteúdo ainda
                            <TacticalCard
                                systemId={`PILAR-${pillarId.toString().padStart(2, "0")}`}
                                status="CONSTRUCTION"
                                variant="neon"
                                className="mb-6 min-h-[50vh] flex flex-col items-center justify-center text-center p-12"
                            >
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                    <BookOpen className="w-10 h-10 text-white/20" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Conteúdo em Descriptografia</h2>
                                <p className="text-white/50 max-w-md mx-auto">
                                    Os dados deste pilar estão sendo processados pelo sistema central.
                                    O Pilar 1 já está totalmente operacional.
                                </p>
                            </TacticalCard>
                        )}

                        {/* Navegação de Rodapé */}
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-md border-t border-white/10 z-40 md:static md:bg-transparent md:border-0 md:p-0 flex justify-between items-center mt-12">
                            {pillarId > 1 ? (
                                <button
                                    onClick={() => router.push(`/pilar/${pillarId - 1}`)}
                                    className="text-white/40 hover:text-white/70 transition-colors text-sm flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Anterior
                                </button>
                            ) : <div />}

                            {pillarId < 9 && isPillarUnlocked(pillarId + 1) && (
                                <button
                                    onClick={() => router.push(`/pilar/${pillarId + 1}`)}
                                    className="text-white/40 hover:text-white/70 transition-colors text-sm flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5"
                                >
                                    Próximo
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </TubesBackground>
    );
}

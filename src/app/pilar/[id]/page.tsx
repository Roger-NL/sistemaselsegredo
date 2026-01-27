"use client";

import { useRouter, useParams } from "next/navigation";
import { useProgress } from "@/context/ProgressContext";
import { PILLARS } from "@/data/curriculum";
import { TubesBackground } from "@/components/ui/neon-flow";
import { TacticalCard, TacticalButton } from "@/components/ui/TacticalCard";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Lock, PlayCircle } from "lucide-react";

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

    return (
        <TubesBackground className="min-h-screen">
            <div className="min-h-screen w-full overflow-y-auto pointer-events-auto">
                <main className="w-full p-4 md:p-8 pb-20">
                    <div className="max-w-3xl mx-auto">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6 relative z-50">
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 text-white/50 hover:text-white transition-colors py-2 px-3 -ml-3 rounded-md hover:bg-white/5"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Dashboard
                            </button>

                            {/* Progresso */}
                            <div className="flex gap-1">
                                {PILLARS.map((_, idx) => {
                                    const num = idx + 1;
                                    const done = num < currentPillarNumber;
                                    const current = num === pillarId;

                                    return (
                                        <div
                                            key={num}
                                            className={`w-3 h-3 rounded-sm ${done
                                                ? "bg-emerald-500/50"
                                                : current
                                                    ? "bg-violet-500"
                                                    : "bg-white/10"
                                                }`}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        {/* Card do Pilar */}
                        <TacticalCard
                            systemId={`PILAR-${pillarId.toString().padStart(2, "0")}`}
                            status={isCompleted ? "SECURE" : isCurrent ? "LIVE" : "ENCRYPTED"}
                            variant={isCompleted ? "success" : "neon"}
                            className="mb-6"
                        >
                            {/* Status badge */}
                            {isCompleted && (
                                <div className="px-6 py-3 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    <span className="text-emerald-400 text-sm font-medium">Pilar Concluído com sucesso</span>
                                </div>
                            )}

                            <div className="p-6">
                                {/* Título */}
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                                        <BookOpen className="w-6 h-6 text-violet-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h1 className="text-xl md:text-2xl font-bold text-[#EEF4D4] mb-1">
                                            {pillar.title}
                                        </h1>
                                        <p className="text-white/50 text-sm">{pillar.description}</p>
                                    </div>
                                </div>

                                {/* Conteúdo do Pilar */}
                                <div className="bg-black/30 rounded-lg p-4 mb-6 border border-white/5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <PlayCircle className="w-5 h-5 text-violet-400" />
                                        <div className="flex flex-col">
                                            <span className="text-white/70 text-sm font-medium uppercase tracking-wider">
                                                Conteúdo do Pilar
                                            </span>
                                            <span className="text-[10px] text-white/40 font-mono">
                                                Este pilar desenvolve fundamentos essenciais para sua evolução no idioma.
                                            </span>
                                        </div>
                                    </div>

                                    {/* Placeholder para vídeo */}
                                    <div className="aspect-video bg-slate-900/50 rounded-lg flex items-center justify-center border border-white/10 mb-4">
                                        <div className="text-center">
                                            <PlayCircle className="w-12 h-12 text-violet-400/50 mx-auto mb-2" />
                                            <p className="text-white/30 text-sm">Vídeo do Pilar {pillarId}</p>
                                        </div>
                                    </div>

                                    {/* Texto */}
                                    <p className="text-white/60 text-sm">
                                        Estude o conteúdo acima. Quando estiver pronto, clique abaixo para testar seus conhecimentos.
                                    </p>
                                </div>

                                {/* Ação: Fazer Quiz */}
                                {isCurrent && (
                                    <TacticalButton
                                        variant="neon"
                                        onClick={handleStartQuiz}
                                        className="w-full justify-center py-3"
                                    >
                                        <span className="flex items-center gap-2">
                                            Estou Pronto - Fazer Avaliação
                                            <ArrowRight className="w-5 h-5" />
                                        </span>
                                    </TacticalButton>
                                )}

                                {isCompleted && (
                                    <div className="text-center text-emerald-400/70 text-sm py-2">
                                        ✓ Você já completou este pilar
                                    </div>
                                )}
                            </div>
                        </TacticalCard>

                        {/* Navegação entre pilares */}
                        <div className="flex justify-between items-center">
                            {pillarId > 1 ? (
                                <button
                                    onClick={() => router.push(`/pilar/${pillarId - 1}`)}
                                    className="text-white/40 hover:text-white/70 transition-colors text-sm flex items-center gap-1"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Pilar {pillarId - 1}
                                </button>
                            ) : <div />}

                            {pillarId < 9 && isPillarUnlocked(pillarId + 1) && (
                                <button
                                    onClick={() => router.push(`/pilar/${pillarId + 1}`)}
                                    className="text-white/40 hover:text-white/70 transition-colors text-sm flex items-center gap-1"
                                >
                                    Pilar {pillarId + 1}
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

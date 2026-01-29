"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QuizInterface } from "@/components/features/quiz";
import { TubesBackground } from "@/components/ui/neon-flow";
import { TacticalCard } from "@/components/ui/TacticalCard";
import { useProgress } from "@/context/ProgressContext";
import { PILLARS } from "@/data/curriculum";
import { CheckCircle2, Lock, ArrowLeft, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DecisionMatrix } from "@/components/features/decision/DecisionMatrix";

export default function QuizPage() {
    const router = useRouter();
    const {
        getCurrentPillarNumber,
        getCompletedCount,
        completePillar,
        areAllPillarsComplete,
        isPillarUnlocked,
        chosenSpecialization,
        canChooseSpecialization
    } = useProgress();

    // Estado local para forçar re-render após completar pilar
    const [activePillar, setActivePillar] = useState<number | null>(null);
    const [showTransition, setShowTransition] = useState(false);
    const [showDecisionMatrix, setShowDecisionMatrix] = useState(false);
    const [key, setKey] = useState(0); // Para forçar remount do QuizInterface

    // Inicializa com o pilar atual
    useEffect(() => {
        const current = getCurrentPillarNumber();
        setActivePillar(current);
    }, [getCurrentPillarNumber]);

    // Redireciona para dashboard se todos pilares completos E já tem especialização em andamento
    // MAS NÃO redireciona se estamos mostrando o DecisionMatrix
    const allComplete = areAllPillarsComplete();
    const shouldRedirect = allComplete && !canChooseSpecialization() && !showDecisionMatrix;

    useEffect(() => {
        if (shouldRedirect) {
            router.push("/");
        }
    }, [shouldRedirect, router]);

    const completedCount = getCompletedCount();
    const currentPillar = activePillar ? PILLARS[activePillar - 1] : null;

    const handleQuizComplete = useCallback((score: number, total: number) => {
        const passed = score >= Math.ceil(total * 0.7);

        if (passed && activePillar) {
            // Marca pilar como completado
            completePillar(activePillar);

            // Mostra transição
            setShowTransition(true);

            // Após 1.5s, executa a ação de conclusão
            setTimeout(() => {
                if (activePillar >= 9) {
                    // Era o último - mostrar DecisionMatrix para escolher especialização
                    setShowTransition(false);
                    setShowDecisionMatrix(true);
                } else {
                    // Avança para o próximo pilar automaticamente
                    router.push(`/pilar/${activePillar + 1}`);
                }
            }, 1500);
        }
    }, [activePillar, completePillar]);

    const handleBack = () => {
        // Voltar para a página de estudo do pilar atual
        if (activePillar) {
            router.push(`/pilar/${activePillar}`);
        } else {
            router.push("/");
        }
    };

    const handleGoToMenu = () => {
        router.push("/");
    };

    // Tela de transição entre pilares
    if (showTransition && activePillar) {
        const nextPillar = activePillar < 9 ? PILLARS[activePillar] : null;

        return (
            <TubesBackground className="h-screen">
                <main className="h-screen w-full flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, ease: "linear" }}
                            className="mb-6"
                        >
                            <Rocket className="w-16 h-16 text-violet-400 mx-auto" />
                        </motion.div>

                        <h2 className="text-2xl font-bold text-[#EEF4D4] mb-2">
                            Pilar {activePillar} Completo!
                        </h2>

                        {nextPillar ? (
                            <p className="text-white/50">
                                Carregando Pilar {activePillar + 1}: {nextPillar.title}...
                            </p>
                        ) : (
                            <p className="text-emerald-400">Todos os pilares completados!</p>
                        )}
                    </motion.div>
                </main>
            </TubesBackground>
        );
    }

    // Mostra o DecisionMatrix quando pilar 9 foi completado (via estado local)
    // OU quando todos pilares completos E pode escolher nova especialização
    if (showDecisionMatrix || (allComplete && canChooseSpecialization())) {
        return (
            <TubesBackground className="h-screen">
                <DecisionMatrix />
            </TubesBackground>
        );
    }

    // Se todos os pilares estão completos MAS já tem especialização em andamento
    // Mostra loading enquanto o useEffect redireciona
    if (shouldRedirect) {
        return (
            <TubesBackground className="h-screen">
                <main className="h-screen w-full flex items-center justify-center">
                    <div className="text-white/50">Redirecionando...</div>
                </main>
            </TubesBackground>
        );
    }

    // Aguardando inicialização
    if (!activePillar) {
        return (
            <TubesBackground className="h-screen">
                <main className="h-screen w-full flex items-center justify-center">
                    <div className="text-white/50">Carregando...</div>
                </main>
            </TubesBackground>
        );
    }

    return (
        <TubesBackground className="h-screen">
            <main className="h-screen w-full flex flex-col items-center justify-center p-4 pointer-events-none overflow-y-auto">
                <div className="w-full max-w-2xl pointer-events-auto relative z-50 my-auto">

                    {/* Header com navegação */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm bg-white/5 px-3 py-2 rounded border border-white/10 hover:border-white/30"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Voltar
                            </button>
                            <button
                                type="button"
                                onClick={handleGoToMenu}
                                className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-xs"
                            >
                                Menu Principal
                            </button>
                        </div>

                        <div className="flex items-center gap-2 md:gap-3">
                            <span className="text-white/40 text-[10px] md:text-xs font-mono uppercase hidden sm:inline">Progresso</span>
                            <div className="flex gap-0.5 md:gap-1">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                                    const isComplete = num < activePillar;
                                    const isCurrent = num === activePillar;
                                    const isLocked = num > activePillar;

                                    return (
                                        <div
                                            key={num}
                                            className={`w-5 h-5 md:w-6 md:h-6 rounded-sm flex items-center justify-center text-[10px] md:text-xs font-mono border transition-all ${isComplete
                                                ? "bg-emerald-500/30 border-emerald-500/50 text-emerald-400"
                                                : isCurrent
                                                    ? "bg-violet-500/30 border-violet-500/50 text-violet-400 animate-pulse"
                                                    : "bg-white/5 border-white/10 text-white/30"
                                                }`}
                                        >
                                            {isComplete ? (
                                                <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                            ) : isLocked ? (
                                                <Lock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                            ) : (
                                                num
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Info do pilar atual */}
                    <div className="mb-4 text-center">
                        <span className="text-violet-400 text-xs font-mono uppercase tracking-widest">
                            Pilar {activePillar} de 9
                        </span>
                        <h2 className="text-xl md:text-2xl font-bold text-[#EEF4D4] mt-1">
                            {currentPillar?.title || `Pilar ${activePillar}`}
                        </h2>
                    </div>

                    {/* Quiz Interface - key força remount */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <QuizInterface
                                pillarNumber={activePillar}
                                onComplete={handleQuizComplete}
                                onClose={handleBack}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </TubesBackground>
    );
}

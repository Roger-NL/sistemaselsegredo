"use client";

import { useRouter } from "next/navigation";
import { useProgress } from "@/context/ProgressContext";
import { PILLARS } from "@/data/curriculum";
import { useAuth } from "@/context/AuthContext";
import { PremiumWall } from "@/components/features/subscription/PremiumWall";
import { FlightCard, FlightButton } from "@/components/ui/FlightCard";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Lock, X, ShieldCheck } from "lucide-react";
import { StudyViewer } from "@/components/features/study/StudyViewer";
import { PillarOperationalView } from "@/components/features/study/PillarOperationalView";
import { getUserExamStatus, PillarExam } from "@/lib/exam-service";
import { PillarExamModal } from "@/components/features/study/exam/PillarExamModal";
import { useState, useEffect } from "react";
import { PillarData } from "@/types/study";

interface PillarPageClientProps {
    pillarId: number;
    initialContent: PillarData | null; // Content passed from server
}

export default function PillarPageClient({ pillarId, initialContent }: PillarPageClientProps) {
    const router = useRouter();

    // Note: pillarId is passed as prop, no need to read params

    const { isPillarUnlocked, getCurrentPillarNumber, isPillarModuleCompleted, completePillar } = useProgress();
    const { user, subscriptionStatus, isLoading: authLoading } = useAuth(); // Auth Check

    const pillar = PILLARS[pillarId - 1];
    const isUnlocked = isPillarUnlocked(pillarId);
    const currentPillarNumber = getCurrentPillarNumber();

    // Access Control & Exam State
    const [exam, setExam] = useState<PillarExam | null>(null);
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [isCheckingExam, setIsCheckingExam] = useState(true);

    const refreshExamStatus = async () => {
        if (user) {
            const currentExam = await getUserExamStatus(user.id, pillarId);
            setExam(currentExam);
            setIsCheckingExam(false);
        }
    };

    useEffect(() => {
        refreshExamStatus();
    }, [user, pillarId]);

    // Helper functions
    const handleAction = async () => {
        const nextPillar = pillarId + 1;
        const approvedLevel = user?.approvedPillar || 1;

        // Caso 1: Já está aprovado para o próximo -> Apenas avança
        if (approvedLevel >= nextPillar) {

            // NEW: Intercept Pillar 1
            if (pillarId === 1 && subscriptionStatus !== 'premium') {
                router.push('/pagamento');
                return;
            }

            completePillar(pillarId);
            if (pillarId < 9) {
                router.push(`/pilar/${nextPillar}`);
            } else {
                router.push("/dashboard");
            }
            return;
        }

        // Caso 2: Não está aprovado -> Abre Modal de Prova
        setIsExamModalOpen(true);
    };

    const handleBack = () => {
        router.back();
    };

    const handleGoToMenu = () => {
        router.push("/");
    };

    // 1. Loading State
    if (authLoading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white">Carregando...</div>;
    }

    // 2. Premium Lock (Pillar > 1 requires Premium)
    // Client-side visual check (Server side should have sent null content anyway)
    if (pillarId > 1 && subscriptionStatus !== 'premium') {
        return <PremiumWall />;
    }

    // 3. Invalid Pillar
    if (!pillar) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <FlightCard variant="danger" className="p-8 text-center max-w-md">
                    <h1 className="text-2xl font-bold text-[#EEF4D4] mb-4">Pilar não encontrado</h1>
                    <FlightButton onClick={() => router.push("/")}>
                        <ArrowLeft className="w-4 h-4 mr-2 inline" />
                        Voltar ao Dashboard
                    </FlightButton>
                </FlightCard>
            </div>
        );
    }

    // 4. Sequential Lock (Must complete previous pillars)
    if (!isUnlocked) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <FlightCard variant="default" className="p-8 text-center max-w-md">
                    <Lock className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-[#EEF4D4] mb-2">{pillar.title}</h1>
                    <p className="text-white/50 mb-6">
                        Complete o Pilar {pillarId - 1} primeiro para desbloquear este conteúdo.
                    </p>
                    <FlightButton variant="neon" onClick={() => router.push(`/pilar/${currentPillarNumber}`)}>
                        Ir para Pilar {currentPillarNumber}
                        <ArrowRight className="w-4 h-4 ml-2 inline" />
                    </FlightButton>
                </FlightCard>
            </div>
        );
    }

    // Selecionar conteúdo baseado no ID do Map (Passed from Server now)
    const activeContent = initialContent;

    // Verificar se todos os módulos (se houver) foram completados
    const areAllModulesCompleted = activeContent?.modules
        ? activeContent.modules.every(m => isPillarModuleCompleted(m.id))
        : true;

    return (
        <div className="min-h-screen min-h-[100dvh] w-full overflow-y-auto pointer-events-auto">
            <main className="w-full p-4 md:p-8 pb-24 md:pb-8">
                <div className="max-w-4xl mx-auto">

                    {/* Header Navigation */}
                    <div className="flex items-center justify-between mb-8 relative z-50">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex items-center gap-2 text-white/50 hover:text-white transition-colors py-2 px-3 rounded-md hover:bg-white/5 border border-white/10 hover:border-white/30"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden md:inline">Voltar</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleGoToMenu}
                                className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-xs"
                            >
                                Menu Principal
                            </button>
                        </div>

                        {/* Progresso Visual */}
                        <div className="flex gap-1.5">
                            {PILLARS.map((_, idx) => {
                                const num = idx + 1;
                                const done = num < currentPillarNumber;
                                const current = num === pillarId;

                                return (
                                    <div
                                        key={num}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${current ? "w-8 bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" :
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
                            {activeContent.modules ? (
                                <PillarOperationalView data={activeContent} />
                            ) : (
                                <StudyViewer data={activeContent} />
                            )}

                            {/* Ação Final do Pilar */}
                            <div className="mt-12 flex justify-center pb-20">
                                <FlightButton
                                    variant={areAllModulesCompleted ? (exam?.status === 'pending' ? "ghost" : "neon") : "ghost"}
                                    onClick={areAllModulesCompleted && exam?.status !== 'pending' ? handleAction : undefined}
                                    disabled={!areAllModulesCompleted || exam?.status === 'pending' || isCheckingExam}
                                    className={`py-4 px-8 text-lg ${(!areAllModulesCompleted || exam?.status === 'pending') ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span className="flex items-center gap-3">
                                        {!areAllModulesCompleted ? (
                                            <>
                                                <Lock className="w-6 h-6" />
                                                Complete todos os módulos para avançar
                                            </>
                                        ) : (user?.approvedPillar || 1) >= pillarId + 1 ? (
                                            // Lógica específica para o Pilar 1 (Conversão Premium)
                                            pillarId === 1 && subscriptionStatus !== 'premium' ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-xs font-normal text-emerald-300 normal-case tracking-normal">
                                                        Feedback enviado para seu WhatsApp!
                                                    </span>
                                                    <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-yellow-400">
                                                        <span>QUERO SER PREMIUM AGORA</span>
                                                        <ArrowRight className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-6 h-6" />
                                                    Concluir e Avançar
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )
                                        ) : exam?.status === 'pending' ? (
                                            <>
                                                <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full mr-2" />
                                                Aguardando Aprovação do Comando...
                                            </>
                                        ) : exam?.status === 'rejected' ? (
                                            <>
                                                <X className="w-6 h-6 text-red-500" />
                                                Missão Reprovada. Tentar Novamente?
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck className="w-6 h-6" />
                                                Iniciar Missão Final do Pilar {pillarId}
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </span>
                                </FlightButton>
                            </div>

                            {/* Modal de Avaliação Híbrida */}
                            <PillarExamModal
                                pillarId={pillarId}
                                isOpen={isExamModalOpen}
                                onClose={() => setIsExamModalOpen(false)}
                                onSuccess={refreshExamStatus}
                            />
                        </div>
                    ) : (
                        // Fallback para pilares sem conteúdo ainda OR LOCKED by Server
                        <FlightCard
                            flightId={`PILAR-${pillarId.toString().padStart(2, "0")}`}
                            status="RESTRICTED"
                            variant={pillarId > 1 && subscriptionStatus !== 'premium' ? "danger" : "neon"}
                            className="mb-6 min-h-[50vh] flex flex-col items-center justify-center text-center p-12"
                        >
                            {pillarId > 1 && subscriptionStatus !== 'premium' ? (
                                <>
                                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/30">
                                        <Lock className="w-10 h-10 text-red-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h2>
                                    <p className="text-white/50 max-w-md mx-auto mb-6">
                                        Este conteúdo está disponível apenas para membros do comando Premium.
                                    </p>
                                    <FlightButton variant="neon" onClick={() => router.push('/pagamento')}>
                                        Desbloquear Acesso Agora
                                    </FlightButton>
                                </>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                        <BookOpen className="w-10 h-10 text-white/20" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Conteúdo em Descriptografia</h2>
                                    <p className="text-white/50 max-w-md mx-auto">
                                        Os dados deste pilar estão sendo processados pelo sistema central.
                                        O Pilar 1 já está totalmente operacional.
                                    </p>
                                </>
                            )}
                        </FlightCard>
                    )}

                    {/* Navegação de Rodapé - Mobile: fixed, Desktop: inline */}
                    <div className="fixed bottom-0 left-0 right-0 p-3 bg-black/90 backdrop-blur-md border-t border-white/10 z-40 md:relative md:bg-transparent md:border-0 md:p-0 md:mt-12 flex justify-between items-center">
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
    );
}

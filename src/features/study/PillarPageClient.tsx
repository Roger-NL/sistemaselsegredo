"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useProgress } from "@/context/ProgressContext";
import { PILLARS } from "@/data/curriculum";
import { useAuth } from "@/context/AuthContext";
import { PremiumWall } from "@/features/subscription/PremiumWall";
import { FlightCard, FlightButton } from "@/components/ui/FlightCard";
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, CheckCircle2, Lock, X, ShieldCheck, MessageSquare } from "lucide-react";
import { StudyViewer } from "@/features/study/StudyViewer";
import { PillarOperationalView } from "@/features/study/PillarOperationalView";
import { getUserExamStatus, PillarExam } from "@/lib/exam/service";
import { PillarExamModal } from "@/features/study/exam/PillarExamModal";
import { PillarExamViewModal } from "@/features/study/exam/PillarExamViewModal";
import { useState, useEffect, useCallback } from "react";
import { PillarData } from "@/types/study";
import { ROUTES } from "@/lib/routes";

interface PillarPageClientProps {
    pillarId: number;
    initialContent: PillarData | null; // Content passed from server
}

const ADMIN_EMAILS = ["roger@esacademy.com", "admin@esacademy.com", "raugerac@gmail.com"];

export default function PillarPageClient({ pillarId, initialContent }: PillarPageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Note: pillarId is passed as prop, no need to read params

    const { isPillarUnlocked, getCurrentPillarNumber, isPillarModuleCompleted } = useProgress();
    const { user, subscriptionStatus, isLoading: authLoading } = useAuth(); // Auth Check
    const isAdminUser = !!user?.email && ADMIN_EMAILS.includes(user.email);
    const isPremiumLike = subscriptionStatus === "premium" || isAdminUser;

    const pillar = PILLARS[pillarId - 1];
    const isUnlocked = isPillarUnlocked(pillarId);
    const currentPillarNumber = getCurrentPillarNumber();

    // Access Control & Exam State
    const [exam, setExam] = useState<PillarExam | null>(null);
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [isViewExamModalOpen, setIsViewExamModalOpen] = useState(false);
    const [isCheckingExam, setIsCheckingExam] = useState(true);

    const refreshExamStatus = useCallback(async () => {
        if (user) {
            const currentExam = await getUserExamStatus(user.id, pillarId);
            setExam(currentExam);
        }
        setIsCheckingExam(false);
    }, [pillarId, user]);

    const hasFeedbackQuery = searchParams?.get("feedback") === "true";

    // Poll para mudanças na prova (upsell/correção)
    useEffect(() => {
        if (!exam) return;
        const interval = setInterval(() => {
            refreshExamStatus();
        }, 5000);
        return () => clearInterval(interval);
    }, [exam, refreshExamStatus]);

    // Memory Card: Restaurar modal aberto caso ele recarregue a página
    useEffect(() => {
        const savedState = localStorage.getItem(`exam-progress-pilar-${pillarId}`);
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                if (parsed.isOpen && parsed.step !== 'success') {
                    window.setTimeout(() => setIsExamModalOpen(true), 0);
                }
            } catch {}
        }
    }, [pillarId]);

    useEffect(() => {
        let isMounted = true;

        const loadExamStatus = async () => {
            await refreshExamStatus();
            if (!isMounted) return;
        };

        loadExamStatus();

        return () => {
            isMounted = false;
        };
    }, [refreshExamStatus]);

    useEffect(() => {
        if (hasFeedbackQuery) {
            // Remove the query param to avoid looping or reopening on refresh
            router.replace(pathname, { scroll: false });
        }
    }, [hasFeedbackQuery, pathname, router]);

    // Helper functions
    const handleAction = async () => {
        // Intercept Pillar 1 (Premium Logic) - FLOW
        if (pillarId === 1 && !isPremiumLike) {
            // Se já fez a prova (está aguardando correção ou já foi aprovado), joga pro pagamento (Upsell)
            if ((user?.approvedPillar || 1) >= 2 || exam?.status === 'pending') {
                router.push(ROUTES.public.payment);
                return;
            }
            // Se ainda não fez a prova, continua o fluxo normal e abre o modal da prova
        }

        const nextPillar = pillarId + 1;

        if (pillarId === 1 && isPremiumLike && exam?.status === "pending") {
            router.push(`${ROUTES.app.pillar}/2`);
            return;
        }

        if (pillarId === 2 && exam?.status === "approved" && (user?.approvedPillar || 1) < 3) {
            router.push(ROUTES.app.scheduling);
            return;
        }

        // Caso 1: Já está aprovado pelo Comando (Server Authority) -> Apenas avança
        if ((user?.approvedPillar || 1) >= nextPillar) {
            if (pillarId < 9) {
                router.push(`${ROUTES.app.pillar}/${nextPillar}`);
            } else {
                router.push(ROUTES.app.dashboard);
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
        router.push(ROUTES.home);
    };

    // 1. Loading State
    if (authLoading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white">Carregando...</div>;
    }

    // 2. Premium Lock (Pillar > 1 requires Premium)
    // Client-side visual check (Server side should have sent null content anyway)
    if (pillarId > 1 && subscriptionStatus !== 'premium' && !isAdminUser) {
        return <PremiumWall />;
    }

    // 3. Invalid Pillar
    if (!pillar) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <FlightCard variant="danger" className="p-8 text-center max-w-md">
                    <h1 className="text-2xl font-bold text-[#EEF4D4] mb-4">Pilar não encontrado</h1>
                    <FlightButton onClick={() => router.push(ROUTES.home)}>
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
                    <FlightButton variant="neon" onClick={() => router.push(`${ROUTES.app.pillar}/${currentPillarNumber}`)}>
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
    const isPendingReview = exam?.status === "pending";
    const canAdvanceWithPendingReview = pillarId === 1 && isPremiumLike;
    const canContinueToPaymentWhilePending = pillarId === 1 && !isPremiumLike;
    const isActionBlockedByPendingReview =
        isPendingReview && !canAdvanceWithPendingReview && !canContinueToPaymentWhilePending;

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

                    {/* Feedback Alert if Exists */}
                    {exam?.adminFeedback && (
                        <div className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-4">
                            <div className="mt-1">
                                <MessageSquare className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-wider mb-1">Feedback do Comando</h3>
                                <p className="text-emerald-100/80 text-sm leading-relaxed">
                                    &quot;{exam.adminFeedback}&quot;
                                </p>
                            </div>
                        </div>
                    )}

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
                                    variant={areAllModulesCompleted ? (isPendingReview && !canAdvanceWithPendingReview ? "ghost" : "neon") : "ghost"}
                                    onClick={areAllModulesCompleted && !isActionBlockedByPendingReview ? handleAction : undefined}
                                    disabled={!areAllModulesCompleted || isCheckingExam || isActionBlockedByPendingReview}
                                    className={`py-4 px-8 text-lg ${(!areAllModulesCompleted || isActionBlockedByPendingReview) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span className="flex items-center gap-3">
                                        {!areAllModulesCompleted ? (
                                            <>
                                                <Lock className="w-6 h-6" />
                                                Complete todos os módulos para avançar
                                            </>
                                        ) : (user?.approvedPillar || 1) >= pillarId + 1 ? (
                                            // === CASO: APROVADO ===
                                            pillarId === 1 && !isPremiumLike ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-xs font-normal text-emerald-300 normal-case tracking-normal">
                                                        Missão Cumprida!
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
                                            // === CASO: PENDENTE ===
                                            pillarId === 1 && !isPremiumLike ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-[10px] font-medium text-white/70 uppercase tracking-widest">
                                                        Avaliação em Andamento
                                                    </span>
                                                    <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors">
                                                        <span>Continuar para a próxima etapa</span>
                                                        <ArrowRight className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            ) : pillarId === 1 && isPremiumLike ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-[10px] font-medium text-emerald-300 uppercase tracking-widest">
                                                        Pilar 2 liberado
                                                    </span>
                                                    <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-emerald-400">
                                                        <span>Concluir e Avançar</span>
                                                        <ArrowRight className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full mr-2" />
                                                    Avaliação em breve
                                                </>
                                            )
                                        ) : exam?.status === 'approved' && pillarId === 2 && (user?.approvedPillar || 1) < 3 ? (
                                            <>
                                                <CalendarDays className="w-6 h-6" />
                                                Ir para meus agendamentos
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        ) : exam?.status === 'rejected' ? (
                                            // === CASO: REPROVADO ===
                                            <>
                                                <X className="w-6 h-6 text-red-500" />
                                                Missão Reprovada. Tentar Novamente?
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        ) : (
                                            // === CASO: NÃO INICIADO ===
                                            <>
                                                <ShieldCheck className="w-6 h-6" />
                                                {pillarId === 1 ? "Fazer minha primeira avaliação" : `Iniciar Missão Final do Pilar ${pillarId}`}
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </span>
                                </FlightButton>

                                {/* Botão Secundário para ver Missão (Aparece se tiver exame) */}
                                {exam && (
                                    <button
                                        onClick={() => setIsViewExamModalOpen(true)}
                                        className="absolute -bottom-8 text-[10px] text-white/30 hover:text-white uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <MessageSquare className="w-3 h-3" />
                                        Ver meu Relatório
                                    </button>
                                )}
                            </div>

                            {areAllModulesCompleted && pillarId >= 2 && exam?.status === "pending" && (
                                <div className="mx-auto mb-16 mt-4 max-w-2xl rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-4 text-center">
                                    <p className="text-sm font-medium text-amber-200">
                                        Sua prova será avaliada em breve para liberar o próximo pilar.
                                    </p>
                                    <p className="mt-2 text-sm leading-relaxed text-white/65">
                                        Se a equipe achar necessário, você poderá refazer essa etapa com os ajustes indicados.
                                    </p>
                                </div>
                            )}

                            {areAllModulesCompleted && pillarId === 2 && exam?.status === "approved" && (user?.approvedPillar || 1) < 3 && (
                                <div className="mx-auto mb-16 mt-4 max-w-2xl rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-5 py-4 text-center">
                                    <p className="text-sm font-medium text-cyan-200">
                                        Sua prova foi aprovada. Agora a primeira aula ao vivo foi liberada para marcação.
                                    </p>
                                    <p className="mt-2 text-sm leading-relaxed text-white/65">
                                        Assim que o tutor confirmar esse horário pelo calendário, o Pilar 3 abre automaticamente para você.
                                    </p>
                                </div>
                            )}

                            {/* Modal de Avaliação Híbrida (Prova) */}
                            <PillarExamModal
                                pillarId={pillarId}
                                isOpen={isExamModalOpen}
                                onClose={() => {
                                    setIsExamModalOpen(false);
                                    // Limpa o estado se ele fechar a prova no X
                                    localStorage.removeItem(`exam-progress-pilar-${pillarId}`);
                                }}
                                onSuccess={() => {
                                    refreshExamStatus();
                                    // Limpa o estado após completar
                                    localStorage.removeItem(`exam-progress-pilar-${pillarId}`);
                                }}
                            />

                            {/* Modal de Visualização (Leitura) */}
                            <PillarExamViewModal
                                pillarId={pillarId}
                                exam={exam}
                                isOpen={isViewExamModalOpen || hasFeedbackQuery}
                                onClose={() => setIsViewExamModalOpen(false)}
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
                                    <FlightButton variant="neon" onClick={() => router.push(ROUTES.public.payment)}>
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
                                onClick={() => router.push(`${ROUTES.app.pillar}/${pillarId - 1}`)}
                                className="text-white/40 hover:text-white/70 transition-colors text-sm flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Anterior
                            </button>
                        ) : <div />}

                        {pillarId < 9 && isPillarUnlocked(pillarId + 1) && (
                            <button
                                onClick={() => router.push(`${ROUTES.app.pillar}/${pillarId + 1}`)}
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

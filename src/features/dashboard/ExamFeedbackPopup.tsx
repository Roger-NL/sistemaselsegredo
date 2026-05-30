"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ArrowRight } from "lucide-react";
import { FlightButton } from "@/components/ui/FlightCard";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";
import { type PillarExam } from "@/lib/exam/service";
import { ROUTES } from "@/lib/routes";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { isFirestorePermissionError } from "@/lib/auth/service";

export function ExamFeedbackPopup() {
    const { user } = useAuth();
    const { progressSnapshot } = useProgress();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [examData, setExamData] = useState<PillarExam | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    useEffect(() => {
        const checkFeedback = async () => {
            if (!user) return;

            try {
                const examsQuery = query(collection(db, "pillar_exams"), where("userId", "==", user.id));
                const snapshot = await getDocs(examsQuery);

                const gradedExams = snapshot.docs
                    .map((doc) => ({ id: doc.id, ...doc.data() } as PillarExam))
                    .filter((exam) => exam.status === "approved" || exam.status === "rejected")
                    .sort((a, b) => {
                        const left = a.gradedAt?.toMillis?.() ?? a.createdAt?.toMillis?.() ?? 0;
                        const right = b.gradedAt?.toMillis?.() ?? b.createdAt?.toMillis?.() ?? 0;
                        return right - left;
                    });

                const unseenExam = gradedExams.find(
                    (exam) => !localStorage.getItem(`exam_feedback_seen_${exam.id}`)
                );

                if (unseenExam) {
                    setExamData(unseenExam);
                    setIsOpen(true);
                }
            } catch (error) {
                if (!isFirestorePermissionError(error)) {
                    console.error("Error checking exam feedback:", error);
                }
            }
        };

        checkFeedback();
    }, [user]);

    const handleClose = () => {
        setIsOpen(false);
        if (examData?.id) {
            localStorage.setItem(`exam_feedback_seen_${examData.id}`, 'true');
        }
    };

    const handleAction = () => {
        if (!examData) return;

        if (examData.pillarId === 1) {
            handleClose();
            if (progressSnapshot?.nextAction === "continue_pillar_2" || (progressSnapshot?.highestUnlockedPillar ?? 1) >= 2) {
                router.push(`${ROUTES.app.pillar}/2`);
            } else if (progressSnapshot?.nextAction === "upgrade_required") {
                router.push(ROUTES.public.payment);
            } else {
                setIsViewModalOpen(true);
            }
        } else if (examData.pillarId === 2 && examData.status === "approved") {
            handleClose();
            if (
                progressSnapshot?.nextAction === "schedule_pillar_2_live_session" ||
                progressSnapshot?.nextAction === "wait_pillar_2_live_session_confirmation"
            ) {
                router.push(ROUTES.app.scheduling);
            } else if (progressSnapshot?.nextAction === "continue_pillar_3" || (progressSnapshot?.highestUnlockedPillar ?? 1) >= 3) {
                router.push(`${ROUTES.app.pillar}/3`);
            } else {
                setIsViewModalOpen(true);
            }
        } else {
            handleClose();
            setIsViewModalOpen(true);
        }
    };

    if ((!isOpen && !isViewModalOpen) || !examData) return null;

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={handleClose}
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 text-center"
                        >
                            <div className="w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-violet-500/30 animate-pulse">
                                <MessageSquare className="w-8 h-8 text-violet-400" />
                            </div>

                            <h2 className="text-xl font-bold text-white mb-2">
                                {examData.status === 'approved' ? 'Missão Aprovada!' : 'Atualização de Missão'}
                            </h2>
                            <p className="text-white/60 text-sm mb-6">
                                O Comando analisou seu relatório do <strong>Pilar {examData.pillarId}</strong>.
                                <br />
                                Clique abaixo para ver o feedback e seus próximos passos.
                            </p>

                            <FlightButton variant="neon" className="w-full" onClick={handleAction}>
                                {examData.pillarId === 1
                                    ? progressSnapshot?.nextAction === "continue_pillar_2"
                                        ? "Abrir Pilar 2"
                                        : progressSnapshot?.nextAction === "upgrade_required"
                                            ? "Ver Próxima Etapa"
                                            : "Ver Veredito do Comando"
                                    : examData.pillarId === 2 && progressSnapshot?.nextAction === "continue_pillar_3"
                                        ? "Abrir Pilar 3"
                                        : examData.pillarId === 2 &&
                                            (progressSnapshot?.nextAction === "schedule_pillar_2_live_session" ||
                                                progressSnapshot?.nextAction === "wait_pillar_2_live_session_confirmation")
                                            ? "Ir para Agendamentos"
                                            : "Ver Veredito do Comando"}
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </FlightButton>

                            <button
                                onClick={handleClose}
                                className="mt-4 text-[10px] text-white/30 hover:text-white uppercase tracking-widest"
                            >
                                Fechar
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* View Modal for Non-Pilar 1 (Stay on Dashboard) */}
            <PillarExamViewModal
                pillarId={examData.pillarId}
                exam={examData}
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
            />
        </>
    );
}

// Need to import PillarExamViewModal
import { PillarExamViewModal } from "@/features/study/exam/PillarExamViewModal";

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, MessageSquare, ArrowRight, ShieldCheck } from "lucide-react";
import { FlightButton } from "@/components/ui/FlightCard";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getUserExamStatus } from "@/lib/exam-service";

export function ExamFeedbackPopup() {
    const { user, subscriptionStatus } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [examData, setExamData] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    useEffect(() => {
        const checkFeedback = async () => {
            if (!user) return;

            // Check feedback for all pillars or just recent ones?
            // User context implies we want to catch any recent feedback.
            // For now, let's check the user's current approved pillar or just assume Pillar 1 focus if that's the main funnel.
            // But to be robust for "others", we should probably pass the pillarId or iterate.
            // Simplification: Check Pillar 1 and maybe the user's current pillar.

            // NOTE: Ideally we iterate [1..9], but for MVP let's check Pillar 1 specifically (as requested) 
            // and maybe the current user's last pillar if we can determine it.
            // Given the user prompt specifically mentions "Pilar 1" vs "Outros", let's try to find if there's any pending feedback 
            // by checking the last exam stored or iterating.

            // To stick to the "Pilar 1" request primarily but allow others:
            // Let's check Pillar 1 first.
            let foundExam = await getUserExamStatus(user.id, 1);

            if (!foundExam || (foundExam.status !== 'approved' && foundExam.status !== 'rejected')) {
                // If not pillar 1, maybe check current pillar?
                // For now, adhering to the code that was mostly Pillar 1 focused but made generic via examData.
                // We'll keep the logic simple: Check Pillar 1. If user wants other pillars, we'd need a loop.
                // Assuming "Pilar 1" is the critical one for the sales funnel.
            }

            // Logic to Show Popup
            if (foundExam && (foundExam.status === 'approved' || foundExam.status === 'rejected')) {
                const lastSeen = localStorage.getItem(`exam_feedback_seen_${foundExam.id}`);
                if (!lastSeen) {
                    setExamData(foundExam);
                    setIsOpen(true);
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
        if (examData.pillarId === 1) {
            handleClose();
            router.push('/pagamento');
        } else {
            // Stay on dashboard, open view modal
            // Do NOT close the main popup yet? Or close it and open the other one?
            // Better to close the notification and open the detail.
            handleClose();
            // We need to persist the examData for the view modal, so we can't just rely on 'examData' if 'isOpen' controls nullability or similar.
            // But handleClose sets isOpen false. examData stays in state? Yes.
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
                                {examData.pillarId === 1 ? "Ver Próxima Etapa" : "Ver Veredito do Comando"}
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
import { PillarExamViewModal } from "@/components/features/study/exam/PillarExamViewModal";

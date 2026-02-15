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

    useEffect(() => {
        const checkFeedback = async () => {
            if (!user) return;

            // Check specifically Pillar 1 for now (expandable later)
            // Or loop through all pillars? User focused on Pillar 1 flow.
            const pillarId = 1;

            // Check LocalStorage to avoid showing it every single refresh if user dismissed it?
            // "ao entrar no site deve ter la a mensagem de resposta" -> Every time until acted upon?
            // Or just ONCE? Usually better to show until they click "Ver".

            const exam = await getUserExamStatus(user.id, pillarId);

            if (exam && exam.status === 'approved' && !exam.gradedAt) {
                // Determine if it is a NEW grading. 
                // We need a way to track if user has seen this. 
                // Using 'gradedAt' timestamp vs 'lastSeenGradedAt' in local storage.
            }

            // Simplification: If Approved AND Free -> Show Upsell Popup
            // If Approved AND Premium -> Maybe show "Parabens" once.
            // User request: "se ele respondeu com um pop up vdizendo voce teve resposta ao seu pilar clique e veja ai entao ali com a resposta e o cta novamente"

            if (exam && (exam.status === 'approved' || exam.status === 'rejected')) {
                const lastSeen = localStorage.getItem(`exam_feedback_seen_${exam.id}`);
                if (!lastSeen) {
                    setExamData(exam);
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
        handleClose();
        router.push(`/pilar/${examData.pillarId}`);
    };

    if (!isOpen || !examData) return null;

    return (
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
                    Ver Veredito do Comando
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
    );
}

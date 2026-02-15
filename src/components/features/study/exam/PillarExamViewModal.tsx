"use client";

import { motion } from "framer-motion";
import { X, CheckCircle2, ShieldCheck, MessageSquare, AlertCircle } from "lucide-react";
import { PillarExam } from "@/lib/exam-service";
import { FlightButton } from "@/components/ui/FlightCard";

interface PillarExamViewModalProps {
    pillarId: number;
    exam: PillarExam | null;
    isOpen: boolean;
    onClose: () => void;
}

export function PillarExamViewModal({ pillarId, exam, isOpen, onClose }: PillarExamViewModalProps) {
    if (!isOpen || !exam) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-violet-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Registro de Missão: Pilar {pillarId}</h2>
                            <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">
                                Status: <span className={exam.status === 'approved' ? 'text-emerald-400' : exam.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}>
                                    {exam.status === 'approved' ? 'APROVADO' : exam.status === 'rejected' ? 'REPROVADO' : 'PENDENTE'}
                                </span>
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Score */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                        <div>
                            <span className="text-xs text-white/50 uppercase tracking-wider block mb-1">Nota Técnica</span>
                            <span className="text-2xl font-bold text-white">{exam.quizScore}%</span>
                        </div>
                        <div className="h-10 w-[1px] bg-white/10" />
                        <div>
                            <span className="text-xs text-white/50 uppercase tracking-wider block mb-1">Data de Envio</span>
                            <span className="text-sm text-white">
                                {exam.createdAt?.toDate ? exam.createdAt.toDate().toLocaleDateString('pt-BR') : 'Recente'}
                            </span>
                        </div>
                    </div>

                    {/* Sua Resposta */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-white/80">
                            <MessageSquare className="w-4 h-4 text-violet-400" />
                            <h3 className="font-medium">Seu Relatório de Campo</h3>
                        </div>
                        <div className="p-4 bg-black/50 border border-white/10 rounded-xl text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                            {exam.writtenAnswer}
                        </div>
                    </div>

                    {/* Feedback do Admin (Se houver) */}
                    {exam.adminFeedback && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-white/80">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <h3 className="font-medium">Feedback do Comando</h3>
                            </div>
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-100 text-sm leading-relaxed whitespace-pre-wrap">
                                {exam.adminFeedback}
                            </div>
                        </div>
                    )}

                    {/* Botão Fechar */}
                    <FlightButton variant="ghost" onClick={onClose} className="w-full">
                        Fechar Registro
                    </FlightButton>
                </div>
            </motion.div>
        </div>
    );
}

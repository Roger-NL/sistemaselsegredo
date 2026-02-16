"use client";

import { useEffect, useState } from "react";
import { X, User, Mail, Phone, Calendar, Star, TrendingUp, ShieldCheck, CheckCircle2, AlertCircle, Clock, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { PillarExam } from "@/lib/exam-service";

interface StudentDetailModalProps {
    user: any | null; // Tipar melhor se tiver interface User global
    isOpen: boolean;
    onClose: () => void;
}

export function StudentDetailModal({ user, isOpen, onClose }: StudentDetailModalProps) {
    const [exams, setExams] = useState<PillarExam[]>([]);
    const [loadingExams, setLoadingExams] = useState(false);
    const [expandedExam, setExpandedExam] = useState<string | null>(null);

    useEffect(() => {
        if (user && isOpen) {
            fetchExams();
        } else {
            setExams([]);
            setExpandedExam(null);
        }
    }, [user, isOpen]);

    const fetchExams = async () => {
        if (!user) return;
        setLoadingExams(true);
        try {
            const q = query(
                collection(db, "pillar_exams"),
                where("userId", "==", user.id),
                // orderBy("createdAt", "desc") // Requires index, might fail if not indexed, so sort in memory
            );

            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PillarExam));

            // Sort in memory
            data.sort((a, b) => {
                const timeA = a.createdAt?.seconds || 0;
                const timeB = b.createdAt?.seconds || 0;
                return timeB - timeA;
            });

            setExams(data);
        } catch (error) {
            console.error("Erro ao buscar exames:", error);
        } finally {
            setLoadingExams(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-[50] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shadow-inner">
                            <User className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">{user.name || "Sem Nome"}</h2>
                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${user.subscriptionStatus === 'active' || user.subscriptionStatus === 'premium'
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-slate-100 text-slate-500 border-slate-200"
                                    }`}>
                                    {user.subscriptionStatus === 'active' || user.subscriptionStatus === 'premium' ? "Premium" : "Free"}
                                </span>
                                <span>•</span>
                                <span className="font-mono text-xs">ID: {user.id}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto p-6 space-y-8 flex-1">

                    {/* User Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                                <Mail className="w-4 h-4" /> E-mail
                            </div>
                            <div className="font-medium text-slate-900 truncate" title={user.email}>{user.email}</div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                                <Phone className="w-4 h-4" /> Telefone
                            </div>
                            <div className="font-medium text-slate-900">{user.phone || "Não informado"}</div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                                <Calendar className="w-4 h-4" /> Cadastro
                            </div>
                            <div className="font-medium text-slate-900">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : "-"}
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                                <TrendingUp className="w-4 h-4" /> Sequência (Streak)
                            </div>
                            <div className="font-medium text-slate-900 flex items-center gap-1">
                                {user.currentStreak || 0} dias <span className="text-orange-500">🔥</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-violet-600" />
                                Progresso & Missões (Desafios)
                            </h3>
                            <div className="px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-bold uppercase tracking-wider border border-violet-100">
                                Nível Atual: Pilar {user.approvedPillar || 1}
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            {loadingExams ? (
                                <div className="p-8 text-center text-slate-400">
                                    <div className="inline-block animate-spin mr-2">⏳</div> Carregando histórico de missões...
                                </div>
                            ) : exams.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <BookOpen className="w-8 h-8" />
                                    </div>
                                    <p className="text-slate-500 font-medium">Nenhuma missão realizada ainda.</p>
                                    <p className="text-slate-400 text-sm mt-1">Este aluno ainda não enviou nenhuma prova de pilar.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {exams.map((exam) => (
                                        <div key={exam.id} className="group">
                                            {/* Exam Summary Row */}
                                            <div
                                                className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between"
                                                onClick={() => setExpandedExam(expandedExam === exam.id ? null : exam.id!)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`
                                                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border
                                                        ${exam.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                            exam.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                                                                'bg-amber-50 text-amber-600 border-amber-200'}
                                                    `}>
                                                        P{exam.pillarId}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-slate-900">Missão Final: Pilar {exam.pillarId}</h4>
                                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                                            <span>Nota Quiz: <strong>{exam.quizScore}%</strong></span>
                                                            <span>•</span>
                                                            <span>{exam.createdAt?.seconds ? new Date(exam.createdAt.seconds * 1000).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : "Data desconhecida"}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5
                                                        ${exam.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                            exam.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                'bg-amber-50 text-amber-700 border-amber-200'}
                                                    `}>
                                                        {exam.status === 'approved' ? <CheckCircle2 className="w-3 h-3" /> :
                                                            exam.status === 'rejected' ? <AlertCircle className="w-3 h-3" /> :
                                                                <Clock className="w-3 h-3" />}

                                                        {exam.status === 'approved' ? 'Aprovado' :
                                                            exam.status === 'rejected' ? 'Reprovado' :
                                                                'Pendente'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Details */}
                                            <AnimatePresence>
                                                {expandedExam === exam.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden bg-slate-50/50"
                                                    >
                                                        <div className="p-6 border-t border-slate-100 flex flex-col gap-6">
                                                            {/* Quiz Score Detail */}
                                                            <div className="flex gap-4">
                                                                <div className="w-1/3">
                                                                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Desempenho no Quiz</div>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                                                            <div
                                                                                className={`h-full rounded-full ${exam.quizScore >= 70 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                                                                style={{ width: `${exam.quizScore}%` }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-sm font-bold text-slate-700">{exam.quizScore}%</span>
                                                                    </div>
                                                                </div>

                                                                {exam.adminFeedback && (
                                                                    <div className="w-2/3 pl-4 border-l border-slate-200">
                                                                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Feedback do Instrutor</div>
                                                                        <p className="text-sm text-slate-600 italic">"{exam.adminFeedback}"</p>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Written Answer */}
                                                            <div>
                                                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Relatório de Campo (Resposta do Aluno)</div>
                                                                <div className="p-4 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                                                                    {exam.writtenAnswer}
                                                                </div>
                                                            </div>

                                                            {/* Actions (if pending) could go here but this is view-only detailed modal, 
                                                                actions are usually on the list/kanban view, but we could add quick evaluate here */}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
                    >
                        Fechar Visualização
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

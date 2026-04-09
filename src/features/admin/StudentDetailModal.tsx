"use client";

import { useCallback, useEffect, useState } from "react";
import { X, User, Mail, Phone, Calendar, TrendingUp, ShieldCheck, CheckCircle2, AlertCircle, Clock, BookOpen, RotateCcw, Loader2, Crown, CalendarClock, ArrowUpRight, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc, deleteField } from "firebase/firestore";
import { PillarExam } from "@/lib/exam/service";
import { resetUserCourseProgress } from "@/lib/admin/reset-user-course-progress";
import type { LiveSessionBooking } from "@/lib/scheduling/types";

interface StudentSummary {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    currentStreak?: number;
    subscriptionStatus?: string;
    approvedPillar?: number;
    inviteCodeUsed?: string;
    createdAt?: string | Date;
}

interface StudentDetailModalProps {
    user: StudentSummary | null;
    isOpen: boolean;
    onClose: () => void;
}

export function StudentDetailModal({ user, isOpen, onClose }: StudentDetailModalProps) {
    const [exams, setExams] = useState<PillarExam[]>([]);
    const [liveSession, setLiveSession] = useState<LiveSessionBooking | null>(null);
    const [loadingExams, setLoadingExams] = useState(false);
    const [expandedExam, setExpandedExam] = useState<string | null>(null);
    const [currentPillarLevel, setCurrentPillarLevel] = useState(1);
    const [isResettingProgress, setIsResettingProgress] = useState(false);
    const [isUpdatingPremium, setIsUpdatingPremium] = useState(false);
    const { user: currentUser, refreshUser } = useAuth();

    const fetchExams = useCallback(async () => {
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

            const liveSessionQuery = query(
                collection(db, "live_sessions"),
                where("userId", "==", user.id),
            );

            const liveSessionSnapshot = await getDocs(liveSessionQuery);
            const liveSessionData = liveSessionSnapshot.docs
                .map((sessionDoc) => ({ id: sessionDoc.id, ...sessionDoc.data() } as LiveSessionBooking))
                .sort((a, b) => {
                    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
                    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
                    return timeB - timeA;
                });

            setLiveSession(liveSessionData[0] ?? null);
        } catch (error) {
            console.error("Erro ao buscar exames:", error);
        } finally {
            setLoadingExams(false);
        }
    }, [user]);

    useEffect(() => {
        if (user && isOpen) {
            setCurrentPillarLevel(user.approvedPillar || 1);
            fetchExams();
        } else {
            setExams([]);
            setLiveSession(null);
            setExpandedExam(null);
            setCurrentPillarLevel(1);
        }
    }, [fetchExams, isOpen, user]);

    const handleResetProgress = async () => {
        if (!user || isResettingProgress) return;

        const confirmed = window.confirm(
            `Tem certeza que deseja resetar a conta de ${user.name || "este aluno"}?\n\n` +
            `Isso vai apagar:\n` +
            `• progresso dos pilares\n` +
            `• módulos concluídos\n` +
            `• provas e respostas enviadas\n` +
            `• histórico acadêmico do curso\n\n` +
            `O status Premium será mantido.`
        );

        if (!confirmed) return;

        setIsResettingProgress(true);

        try {
            const result = await resetUserCourseProgress(user.id);
            user.approvedPillar = 1;
            setCurrentPillarLevel(1);
            setExams([]);
            setLiveSession(null);
            setExpandedExam(null);

            if (currentUser?.id === user.id) {
                await refreshUser();
            }

            window.alert(`Conta resetada com sucesso. ${result.deletedExams} prova(s) e ${result.deletedSessions || 0} sessão(ões) apagada(s).`);
        } catch (error) {
            console.error(error);
            window.alert("Nao foi possivel resetar a conta agora.");
        } finally {
            setIsResettingProgress(false);
        }
    };

    const handleTogglePremium = async () => {
        if (!user || isUpdatingPremium) return;

        const isPremium = user.subscriptionStatus === "premium";
        const confirmed = window.confirm(
            isPremium
                ? `Tem certeza que deseja remover o Premium de ${user.name || "este aluno"}?\n\nO acesso volta para o modo free imediatamente.`
                : `Tem certeza que deseja liberar o Premium para ${user.name || "este aluno"}?\n\nO acesso premium será liberado imediatamente.`
        );

        if (!confirmed) return;

        setIsUpdatingPremium(true);

        try {
            const userRef = doc(db, "users", user.id);

            if (isPremium) {
                await updateDoc(userRef, {
                    subscriptionStatus: "free",
                    subscriptionExpiresAt: deleteField(),
                    premiumActivatedAt: deleteField(),
                    purchasedPlan: deleteField(),
                    paymentId: deleteField(),
                    pendingPixPayment: deleteField(),
                });
                user.subscriptionStatus = "free";
            } else {
                await updateDoc(userRef, {
                    subscriptionStatus: "premium",
                    premiumActivatedAt: new Date().toISOString(),
                    purchasedPlan: "lifetime",
                });
                user.subscriptionStatus = "premium";
            }

            if (currentUser?.id === user.id) {
                await refreshUser();
            }

            window.alert(
                isPremium
                    ? "Premium removido com sucesso."
                    : "Premium liberado com sucesso."
            );
        } catch (error) {
            console.error(error);
            window.alert("Nao foi possivel atualizar o status premium agora.");
        } finally {
            setIsUpdatingPremium(false);
        }
    };

    if (!isOpen || !user) return null;

    const schedulingTone = liveSession?.status === "confirmed"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : liveSession?.status === "pending_confirmation"
            ? "bg-cyan-50 text-cyan-700 border-cyan-200"
            : liveSession?.status === "ready_to_schedule"
                ? "bg-violet-50 text-violet-700 border-violet-200"
                : "bg-slate-100 text-slate-600 border-slate-200";

    const schedulingLabel = liveSession?.status === "confirmed"
        ? "Confirmada"
        : liveSession?.status === "pending_confirmation"
            ? "Pedido enviado"
            : liveSession?.status === "ready_to_schedule"
                ? "Liberada para marcar"
                : liveSession?.status === "awaiting_release_window"
                    ? "Aguardando janela"
                    : liveSession?.status === "awaiting_pillar_approval"
                        ? "Aguardando aprovação"
                        : "Sem sessão ativa";

    const currentStageLabel = liveSession
        ? liveSession.status === "confirmed"
            ? "Sessão já integrada ao progresso"
            : liveSession.status === "pending_confirmation"
                ? "Tutor ainda precisa confirmar"
                : liveSession.status === "ready_to_schedule"
                    ? "Aluno já pode escolher horário"
                    : "Fluxo ao vivo aguardando o momento certo"
        : "Ainda sem sessão liberada";

    const formatDate = (value?: string | Date | null) => {
        if (!value) return "—";
        return new Date(value).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

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
                            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mt-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${user.subscriptionStatus === 'premium'
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-slate-100 text-slate-500 border-slate-200"
                                    }`}>
                                    {user.subscriptionStatus === 'premium' ? "Premium" : "Free"}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleTogglePremium}
                                    disabled={isUpdatingPremium}
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${user.subscriptionStatus === 'premium'
                                        ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                        : "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
                                        } disabled:cursor-not-allowed disabled:opacity-60`}
                                >
                                    {isUpdatingPremium ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Crown className="w-3.5 h-3.5" />
                                    )}
                                    {user.subscriptionStatus === 'premium' ? "Remover Premium" : "Liberar Premium"}
                                </button>
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

                    <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(248,250,252,0.98),rgba(244,255,251,0.98))] p-5 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="max-w-2xl">
                                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-700">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Fluxo premium ao vivo
                                </div>
                                <h3 className="mt-4 text-xl font-bold text-slate-900">
                                    Leitura rápida da jornada deste aluno
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    Aqui você enxerga de forma direta em que ponto a pessoa está: acesso premium, avanço acadêmico, provas enviadas e status da sessão ao vivo ligada ao Pilar 2.
                                </p>
                            </div>

                            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${schedulingTone}`}>
                                <CalendarClock className="w-4 h-4" />
                                {schedulingLabel}
                            </div>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-3">
                            <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
                                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Etapa atual</p>
                                <p className="mt-2 text-sm font-semibold text-slate-900">{currentStageLabel}</p>
                                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                                    {liveSession?.lastActionMessage || "Quando a sessão existir, este bloco mostra o momento mais recente da jornada ao vivo."}
                                </p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
                                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Próximo horário</p>
                                <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(liveSession?.requestedSlotStart || liveSession?.earliestScheduleAt)}</p>
                                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                                    {liveSession?.requestedSlotStart
                                        ? "Esse é o horário atualmente preso ao pedido ou à sessão confirmada."
                                        : "Se ainda não houver pedido, aparece aqui a primeira janela útil da conta premium."}
                                </p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
                                <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Acesso liberado</p>
                                <p className="mt-2 text-sm font-semibold text-slate-900">Até Pilar {currentPillarLevel}</p>
                                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                                    Esse painel continua servindo como controle rápido para testar travas, progresso e liberação premium sem sair do contexto do aluno.
                                </p>
                            </div>
                        </div>

                        {liveSession?.calendarHtmlLink && (
                            <a
                                href={liveSession.calendarHtmlLink}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                Abrir sessão no Google Calendar
                                <ArrowUpRight className="w-4 h-4" />
                            </a>
                        )}
                    </div>

                    {/* Progress Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-violet-600" />
                                Progresso & Missões (Desafios)
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nível Liberado:</span>
                                <select
                                    className="bg-white border border-violet-200 text-violet-700 text-xs font-bold rounded-lg p-1 pr-6 focus:ring-violet-500 focus:border-violet-500 cursor-pointer outline-none shadow-sm"
                                    value={currentPillarLevel}
                                    onChange={async (e) => {
                                        const newVal = parseInt(e.target.value);
                                        if (confirm(`DESEJA ALTERAR O NÍVEL DO ALUNO PARA O PILAR ${newVal}?\n\nIsso pode bloquear ou desbloquear conteúdos para o aluno imediatamente.`)) {
                                            try {
                                                await updateDoc(doc(db, "users", user.id), {
                                                    approvedPillar: newVal
                                                });
                                                user.approvedPillar = newVal;
                                                setCurrentPillarLevel(newVal);

                                                if (currentUser?.id === user.id) {
                                                    await refreshUser();
                                                }

                                                alert("Nível atualizado! O aluno agora tem acesso até o Pilar " + newVal);
                                            } catch (error) {
                                                console.error(error);
                                                alert("Erro ao atualizar.");
                                            }
                                        }
                                    }}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                        <option key={num} value={num}>Pilar {num}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={handleResetProgress}
                                    disabled={isResettingProgress}
                                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isResettingProgress ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Resetando...
                                        </>
                                    ) : (
                                        <>
                                            <RotateCcw className="w-4 h-4" />
                                            Resetar conta
                                        </>
                                    )}
                                </button>
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
                                                                        <p className="text-sm text-slate-600 italic">&quot;{exam.adminFeedback}&quot;</p>
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

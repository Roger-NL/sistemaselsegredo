"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
    collection, 
    query, 
    where, 
    orderBy, 
    onSnapshot, 
    doc, 
    writeBatch, 
    serverTimestamp 
} from "firebase/firestore";
import { Check, X, Loader2, ShieldCheck, FileText, ClipboardList, MessageCircle } from "lucide-react";

export default function AdminApprovalsPage() {
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedExam, setSelectedExam] = useState<any | null>(null);
    const [feedback, setFeedback] = useState("");

    useEffect(() => {
        const q = query(
            collection(db, "pillar_exams"), 
            where("status", "==", "pending"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setExams(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleAction = async (status: 'approved' | 'rejected') => {
        if (!selectedExam) return;
        setProcessingId(selectedExam.id);
        
        try {
            const batch = writeBatch(db);
            
            // 1. Update Exam Status
            const examRef = doc(db, "pillar_exams", selectedExam.id);
            batch.update(examRef, { 
                status: status,
                adminFeedback: feedback,
                gradedAt: serverTimestamp()
            });

            // 2. If approved, Update User Level
            if (status === 'approved') {
                const userRef = doc(db, "users", selectedExam.userId);
                batch.update(userRef, {
                    approvedPillar: selectedExam.pillarId + 1
                });
            }

            await batch.commit();
            setSelectedExam(null);
            setFeedback("");
        } catch (error) {
            console.error("Erro ao processar:", error);
            alert("Falha na operação.");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Avaliação de Missões</h1>
                <p className="text-slate-500 text-sm">Analise os relatórios de campo e aprove o avanço dos alunos.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-900">Aluno</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Pilar</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Nota Quiz</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Data</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {exams.map((exam) => (
                                <tr key={exam.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{exam.userName}</div>
                                        <div className="text-xs text-slate-400">{exam.userEmail}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-slate-700">P{exam.pillarId}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${exam.quizScore >= 70 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                            {exam.quizScore}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {exam.createdAt?.seconds 
                                            ? new Date(exam.createdAt.seconds * 1000).toLocaleDateString('pt-BR') 
                                            : 'Agora'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedExam(exam)}
                                            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-indigo-600 transition-all flex items-center gap-2 ml-auto"
                                        >
                                            <FileText className="w-3 h-3" />
                                            Corrigir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {exams.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        Nenhuma missão pendente para correção.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL DE CORREÇÃO */}
            {selectedExam && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedExam(null)} />
                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ClipboardList className="w-6 h-6 text-indigo-600" />
                                <div>
                                    <h3 className="font-bold text-slate-900">Missão de {selectedExam.userName}</h3>
                                    <p className="text-xs text-slate-500">Pilar {selectedExam.pillarId} • Nota Quiz: {selectedExam.quizScore}%</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedExam(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>

                        {/* Content */}
                        <div className="p-8 overflow-y-auto flex-1 space-y-6">
                            <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl">
                                <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-3">Relatório do Aluno:</h4>
                                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed italic">
                                    "{selectedExam.writtenAnswer}"
                                </p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <MessageCircle className="w-3 h-3" />
                                    Feedback do Comando (Opcional):
                                </label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Ex: Excelente uso dos exemplos. Pode avançar!"
                                    className="w-full h-32 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => handleAction('rejected')}
                                disabled={!!processingId}
                                className="px-6 py-2.5 text-red-600 font-bold text-sm hover:bg-red-50 rounded-lg transition-colors"
                            >
                                Rejeitar Missão
                            </button>
                            <button
                                onClick={() => handleAction('approved')}
                                disabled={!!processingId}
                                className="px-8 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-lg hover:bg-emerald-600 transition-all flex items-center gap-2"
                            >
                                {processingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Aprovar Aluno
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { ArrowLeft, User, Mail, Calendar, CheckCircle, Clock } from "lucide-react";
import { FlightButton } from "@/components/ui/FlightCard";
import { PillarExam } from "@/lib/exam-service";

interface StudentProfile {
    id: string;
    name: string;
    email: string;
    plan: string;
    joinedAt: any;
}

export default function StudentDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { user } = useAuth();
    const [student, setStudent] = useState<StudentProfile | null>(null);
    const [exams, setExams] = useState<PillarExam[]>([]);
    const [loading, setLoading] = useState(true);

    // In Next.js 15 params is async, but we'll handle standard access first or fix if needed.
    const studentId = params.id;

    const [activeTab, setActiveTab] = useState<'exams' | 'activity'>('exams');

    const ADMIN_EMAILS = ["roger@esacademy.com", "admin@esacademy.com", "raugerac@gmail.com"];

    useEffect(() => {
        // Basic Admin Check
        if (user && !ADMIN_EMAILS.includes(user.email)) {
            router.push("/dashboard");
            return;
        }

        async function loadStudentData() {
            if (!studentId) return;

            try {
                // 1. Load Student Profile (Mock or Real)
                // Since we don't have a direct getStudentById easily exposed without admin SDK, 
                // we might query the user doc if rules allow, or just mock the profile part 
                // if we clicked from the list which had the data. 
                // But for deep link, we need to fetch.
                // Let's assume we can fetch 'users' collection restricted to admin.

                // For now, let's focus on the EXAMS which is the critical part.
                // We will fetch exams for this userId.

                const q = query(
                    collection(db, "pillar_exams"),
                    orderBy("createdAt", "desc"),
                    limit(20)
                );
                // Client-side filtering because composite index might be needed for userId+createdAt
                // Ideally: where("userId", "==", studentId)
                // But let's try to filter in memory if volume is low, or use the index we just created?
                // Actually, we created index for pillar_exams (status, createdAt).
                // We need (userId, createdAt) or just (userId).

                // Let's try simple fetch by userId if index exists, else filter manual.
                // Using the existing 'getUserExamStatus' logic but for ALL pillars?

                // Let's just mock the profile header for speed and focus on the exams list which is the goal.
                setStudent({
                    id: studentId,
                    name: "Aluno (Carregando...)",
                    email: "...",
                    plan: "Free",
                    joinedAt: new Date()
                });

                // FETCH EXAMS
                const querySnapshot = await getDocs(collection(db, "pillar_exams"));
                const studentExams = querySnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() } as PillarExam))
                    .filter(exam => exam.userId === studentId)
                    .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

                setExams(studentExams);

                // Update Profile info from the latest exam if possible
                if (studentExams.length > 0) {
                    const latest = studentExams[0];
                    setStudent(prev => ({
                        ...prev!,
                        name: latest.userName || "Aluno",
                        email: latest.userEmail || "Email não registrado"
                    }));
                }

            } catch (error) {
                console.error("Error loading student:", error);
            } finally {
                setLoading(false);
            }
        }

        loadStudentData();
    }, [user, studentId, router]);

    if (loading) return <div className="p-8 text-white">Carregando ficha do aluno...</div>;

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
            {/* Header */}
            <div className="max-w-5xl mx-auto mb-8">
                <button
                    onClick={() => router.push('/admin/dashboard?tab=alunos')}
                    className="flex items-center text-white/50 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para Lista
                </button>

                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-violet-500/20 rounded-full flex items-center justify-center border border-violet-500/30">
                            <User className="w-10 h-10 text-violet-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-1">{student?.name}</h1>
                            <div className="flex items-center gap-4 text-sm text-white/50">
                                <span className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {student?.email}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Membro desde {new Date().getFullYear()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                        <span className="text-[10px] uppercase tracking-widest text-white/40 block mb-1">Plano Atual</span>
                        <span className="text-xl font-bold text-emerald-400">FREE</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-5xl mx-auto mb-8 border-b border-white/10 flex gap-8">
                <button
                    onClick={() => setActiveTab('exams')}
                    className={`pb-4 text-sm uppercase tracking-widest font-bold transition-colors ${activeTab === 'exams' ? 'text-violet-400 border-b-2 border-violet-400' : 'text-white/30 hover:text-white'}`}
                >
                    Missões & Provas
                </button>
                <button
                    onClick={() => setActiveTab('activity')}
                    className={`pb-4 text-sm uppercase tracking-widest font-bold transition-colors ${activeTab === 'activity' ? 'text-violet-400 border-b-2 border-violet-400' : 'text-white/30 hover:text-white'}`}
                >
                    Atividade (Logs)
                </button>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto">
                {activeTab === 'exams' && (
                    <div className="space-y-6">
                        {exams.length === 0 ? (
                            <div className="p-12 text-center border border-white/10 rounded-2xl bg-white/5 text-white/30">
                                Nenhuma missão registrada para este aluno.
                            </div>
                        ) : (
                            exams.map((exam) => (
                                <div key={exam.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-white">Pilar {exam.pillarId} - Missão Final</h3>
                                                {exam.status === 'approved' && <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Aprovado</span>}
                                                {exam.status === 'rejected' && <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Reprovado</span>}
                                                {exam.status === 'pending' && <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase animate-pulse">Pendente</span>}
                                            </div>
                                            <p className="text-white/40 text-xs flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                Enviado em {exam.createdAt?.toDate ? exam.createdAt.toDate().toLocaleString('pt-BR') : 'Data desconhecida'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-[10px] uppercase text-white/30">Nota Técnica</span>
                                            <span className={`text-2xl font-bold ${exam.quizScore >= 70 ? 'text-emerald-400' : 'text-red-400'}`}>{exam.quizScore}%</span>
                                        </div>
                                    </div>

                                    <div className="bg-black/30 p-4 rounded-xl border border-white/5 mb-6">
                                        <h4 className="text-[10px] uppercase text-white/30 mb-2 font-bold">Relatório do Aluno</h4>
                                        <p className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed">
                                            {exam.writtenAnswer}
                                        </p>
                                    </div>

                                    {exam.userPhone && (
                                        <div className="mb-6 flex items-center gap-2 text-emerald-400 text-sm bg-emerald-400/10 px-3 py-2 rounded-lg inline-block">
                                            <span>📱 WhatsApp para Feedback: <strong>{exam.userPhone}</strong></span>
                                        </div>
                                    )}

                                    {/* ACTION AREA */}
                                    {exam.status === 'pending' ? (
                                        <div className="border-t border-white/10 pt-6">
                                            <h4 className="text-sm font-bold text-white mb-4">Dar Veredito do Comando</h4>
                                            <div className="flex gap-4">
                                                <button
                                                    // TODO: Implement Grade Action Logic here or redirect to a modal
                                                    // Ideally, we import the gradeExam function or use a component
                                                    // For this MVP page, we just show the button that implies functionality
                                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors"
                                                    onClick={() => alert("Funcionalidade de avaliar via Perfil será conectada! Use a aba Aprovações por enquanto.")}
                                                >
                                                    APROVAR MISSÃO
                                                </button>
                                                <button
                                                    className="px-6 border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold rounded-xl transition-colors"
                                                    onClick={() => alert("Funcionalidade de reprovar via Perfil será conectada!")}
                                                >
                                                    REPROVAR
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="border-t border-white/10 pt-4 mt-4">
                                            <h4 className="text-[10px] uppercase text-white/30 mb-2 font-bold">Feedback Enviado</h4>
                                            <p className="text-white/60 text-xs italic">
                                                {exam.adminFeedback || "Sem feedback registrado."}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="text-white/30 text-center py-20">
                        Logs de atividade (login, aulas assistidas) em breve.
                    </div>
                )}
            </div>
        </div>
    );
}

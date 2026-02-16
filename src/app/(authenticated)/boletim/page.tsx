"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { PillarExam } from "@/lib/exam-service";
import { PILLARS } from "@/data/curriculum";
import { motion } from "framer-motion";
import {
    CheckCircle2,
    Clock,
    XCircle,
    Lock,
    ChevronRight,
    Trophy,
    Target,
    BarChart3,
    Search,
    ArrowLeft
} from "lucide-react";
import { FlightCard, FlightButton } from "@/components/ui/FlightCard";
import { PillarExamViewModal } from "@/components/features/study/exam/PillarExamViewModal";

export default function BoletimPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [exams, setExams] = useState<Record<number, PillarExam>>({});
    const [loading, setLoading] = useState(true);
    const [selectedExam, setSelectedExam] = useState<PillarExam | null>(null);

    useEffect(() => {
        const fetchExams = async () => {
            if (!user) return;

            try {
                // Fetch all exams for user
                const q = query(
                    collection(db, "pillar_exams"),
                    where("userId", "==", user.id)
                );

                const snapshot = await getDocs(q);
                const examsMap: Record<number, PillarExam> = {};

                snapshot.docs.forEach(doc => {
                    const data = { id: doc.id, ...doc.data() } as PillarExam;
                    // Keep the latest if multiple (though UI usually enforces one active)
                    // Or keep the one with highest status?
                    // Simple logic: if exists, overwrite if newer.
                    // Actually, let's just use the one found.
                    if (!examsMap[data.pillarId] || (data.createdAt?.seconds > (examsMap[data.pillarId]?.createdAt?.seconds || 0))) {
                        examsMap[data.pillarId] = data;
                    }
                });

                setExams(examsMap);
            } catch (error) {
                console.error("Erro ao buscar boletim:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExams();
    }, [user]);

    // Calculate stats
    const updatedPillars = PILLARS.map((p, idx) => {
        const pillarId = idx + 1;
        const exam = exams[pillarId];
        return {
            ...p,
            id: pillarId,
            exam
        };
    });

    const completed = Object.values(exams).filter(e => e.status === 'approved').length;
    const averageScore = Object.values(exams).reduce((acc, curr) => acc + (curr.quizScore || 0), 0) / (Object.values(exams).length || 1);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-white/50 animate-pulse flex items-center gap-3">
                    <Search className="w-5 h-5" />
                    Carregando histórico escolar...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full p-4 md:p-8 pb-32">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Back Button */}
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center text-white/50 hover:text-white transition-colors mb-4 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Voltar ao Dashboard
                </button>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                            <Trophy className="w-8 h-8 text-yellow-500" />
                            Boletim de Desempenho
                        </h1>
                        <p className="text-white/60">
                            Acompanhe suas notas, feedbacks e evolução no treinamento.
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{completed}/9</div>
                                <div className="text-[10px] text-white/40 uppercase tracking-wider">Missões Concluídas</div>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                                <Target className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{Math.round(averageScore)}%</div>
                                <div className="text-[10px] text-white/40 uppercase tracking-wider">Média Geral</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters/List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {updatedPillars.map((pillar) => {
                        const exam = pillar.exam;
                        const status = exam?.status || 'locked';
                        // logic for locked: if no exam and previous not approved? 
                        // actually just use 'exam' existence. If no exam, check if unlocked?
                        // For this view, let's just show exam status if exists, else 'Not Started'.

                        return (
                            <motion.div
                                key={pillar.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: pillar.id * 0.05 }}
                            >
                                <FlightCard
                                    variant="default" // always default for list, internal styling varies
                                    className={`h-full group relative overflow-hidden transition-all duration-300 hover:border-violet-500/30 ${!exam ? 'opacity-50 grayscale-[0.5]' : ''}`}
                                >
                                    <div className="p-6 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-white/50 border border-white/10">
                                                {pillar.id}
                                            </div>
                                            {exam ? (
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${exam.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    exam.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                    }`}>
                                                    {exam.status === 'approved' ? 'Aprovado' :
                                                        exam.status === 'rejected' ? 'Reprovado' : 'Em Análise'}
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border bg-white/5 text-white/30 border-white/10">
                                                    Não Iniciado
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{pillar.title}</h3>
                                        <p className="text-sm text-white/40 mb-6 line-clamp-2 min-h-[2.5rem]">
                                            {pillar.description}
                                        </p>

                                        <div className="mt-auto">
                                            {exam ? (
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-white/40">Nota Quiz</span>
                                                        <span className={`font-mono font-bold ${exam.quizScore >= 70 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                            {exam.quizScore}%
                                                        </span>
                                                    </div>

                                                    {/* Progress Bar for Score */}
                                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${exam.quizScore >= 70 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                                            style={{ width: `${exam.quizScore}%` }}
                                                        />
                                                    </div>

                                                    <button
                                                        onClick={() => setSelectedExam(exam)}
                                                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-xs uppercase tracking-widest"
                                                    >
                                                        Ver Detalhes
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-12 text-white/20 text-sm italic">
                                                    --
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </FlightCard>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Detail Modal */}
            <PillarExamViewModal
                pillarId={selectedExam?.pillarId || 0}
                exam={selectedExam}
                isOpen={!!selectedExam}
                onClose={() => setSelectedExam(null)}
            />
        </div>
    );
}

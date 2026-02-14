"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, ArrowRight, Loader2, ClipboardCheck, MessageSquare, AlertCircle, ShieldCheck } from "lucide-react";
import { FlightCard, FlightButton } from "@/components/ui/FlightCard";
import { getQuizByPillarNumber } from "@/data/quizzes";
import { submitExam } from "@/lib/exam-service";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, writeBatch, serverTimestamp } from "firebase/firestore";

interface PillarExamModalProps {
    pillarId: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type Step = 'intro' | 'quiz' | 'written' | 'sending' | 'success';

export function PillarExamModal({ pillarId, isOpen, onClose, onSuccess }: PillarExamModalProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState<Step>('intro');
    const [quizIndex, setQuizIndex] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [writtenText, setWrittenAnswer] = useState("");
    const [error, setError] = useState("");
    
    const quiz = getQuizByPillarNumber(pillarId);
    const questions = quiz?.questions || [];

    const handleNextStep = () => {
        if (step === 'intro') setStep('quiz');
        else if (step === 'quiz') setStep('written');
    };

    const handleAnswer = (optionIdx: number) => {
        const newAnswers = [...answers, optionIdx];
        setAnswers(newAnswers);

        if (quizIndex < questions.length - 1) {
            setQuizIndex(quizIndex + 1);
        } else {
            setStep('written');
        }
    };

    const calculateScore = () => {
        let correct = 0;
        answers.forEach((ans, idx) => {
            if (ans === questions[idx].correctAnswer) correct++;
        });
        return Math.round((correct / questions.length) * 100);
    };

    const handleSubmit = async () => {
        if (writtenText.length < 50) {
            setError("Por favor, escreva um pouco mais sobre sua experiência e os exemplos (mínimo 50 caracteres).");
            return;
        }

        setStep('sending');
        setError("");

        const score = calculateScore();
        
        const result = await submitExam({
            userId: user!.id,
            userEmail: user!.email,
            userName: user!.name,
            pillarId: pillarId,
            quizScore: score,
            quizAttempts: 1,
            writtenAnswer: writtenText
        });

        if (result.success) {
            setStep('success');
        } else {
            setError(result.error || "Erro ao enviar missão.");
            setStep('written');
        }
    };

    if (!isOpen) return null;

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
                            <h2 className="text-xl font-bold text-white">Missão Final: Pilar {pillarId}</h2>
                            <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Validação de Competência</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {/* INTRO */}
                        {step === 'intro' && (
                            <motion.div key="intro" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: -20 }} className="space-y-6">
                                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-xl">
                                    <h3 className="text-lg font-medium text-white mb-4">Você chegou ao final do treinamento.</h3>
                                    <p className="text-white/60 leading-relaxed">
                                        Para avançar para a próxima etapa, o Comando exige uma validação dupla:
                                    </p>
                                    <ul className="mt-4 space-y-3 text-sm text-white/50">
                                        <li className="flex gap-3"><ClipboardCheck className="w-4 h-4 text-emerald-400 shrink-0" /> <strong>Check-in Técnico:</strong> Um rápido quiz sobre os conceitos chave.</li>
                                        <li className="flex gap-3"><MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" /> <strong>Relatório de Campo:</strong> Feedback escrito e 3 exemplos práticos de uso.</li>
                                    </ul>
                                </div>
                                <FlightButton variant="neon" className="w-full py-4 text-lg" onClick={handleNextStep}>
                                    Iniciar Missão
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </FlightButton>
                            </motion.div>
                        )}

                        {/* QUIZ */}
                        {step === 'quiz' && questions.length > 0 && (
                            <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-mono text-violet-400 uppercase tracking-widest">Questão {quizIndex + 1} de {questions.length}</span>
                                    <div className="h-1 bg-white/5 w-32 rounded-full overflow-hidden">
                                        <div className="h-full bg-violet-500 transition-all duration-500" style={{ width: `${((quizIndex + 1) / questions.length) * 100}%` }} />
                                    </div>
                                </div>

                                <h3 className="text-xl font-serif text-white leading-snug">
                                    {questions[quizIndex].question}
                                </h3>

                                <div className="grid gap-3">
                                    {questions[quizIndex].options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(idx)}
                                            className="w-full p-4 text-left bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-violet-500/50 transition-all text-sm group"
                                        >
                                            <span className="inline-block w-6 h-6 rounded-full bg-white/5 border border-white/10 text-center leading-6 text-[10px] mr-3 group-hover:bg-violet-500 group-hover:text-white transition-colors">{idx + 1}</span>
                                            <span className="text-white/80 group-hover:text-white">{opt}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* WRITTEN MISSION */}
                        {step === 'written' && (
                            <motion.div key="written" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-white mb-2">Relatório de Campo</h3>
                                    <p className="text-sm text-white/50 mb-4">
                                        Descreva brevemente o que mais te marcou neste pilar e liste **3 exemplos reais** de como você aplicará este conhecimento na sua rotina.
                                    </p>
                                    <textarea
                                        value={writtenText}
                                        onChange={(e) => setWrittenAnswer(e.target.value)}
                                        placeholder="Minha experiência foi... Usarei o inglês para..."
                                        className="w-full h-48 bg-black border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                                    />
                                    <div className="flex justify-between mt-2">
                                        <span className={`text-[10px] font-mono ${writtenText.length < 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                                            Caracteres: {writtenText.length} (mín. 50)
                                        </span>
                                        <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Correção Humana em 24h</span>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-xs">
                                        <AlertCircle size={14} />
                                        {error}
                                    </div>
                                )}

                                <FlightButton variant="neon" className="w-full py-4" onClick={handleSubmit}>
                                    Enviar para o Comando
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </FlightButton>
                            </motion.div>
                        )}

                        {/* SENDING */}
                        {step === 'sending' && (
                            <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
                                <p className="text-white/60 font-mono text-sm animate-pulse">Sincronizando dados com o Quartel General...</p>
                            </div>
                        )}

                        {/* SUCCESS */}
                        {step === 'success' && (
                            <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-10 text-center space-y-6">
                                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                                </div>
                                
                                {pillarId === 1 ? (
                                    <>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-2">Relatório Registrado</h3>
                                            <p className="text-white/50 text-sm max-w-sm mx-auto leading-relaxed">
                                                Sua missão foi salva e está na <span className="text-white font-bold text-emerald-400">fila de correção prioritária</span>. <br /><br />
                                                Para receber o veredito do Comando, seu feedback personalizado e desbloquear os próximos 8 destinos, ative sua licença Premium.
                                            </p>
                                        </div>
                                        <div className="space-y-3">
                                            <FlightButton variant="neon" className="w-full py-4 text-lg" onClick={() => { router.push('/pagamento'); onClose(); }}>
                                                Ativar Licença Premium
                                                <ArrowRight className="ml-2 w-5 h-5" />
                                            </FlightButton>
                                            <button 
                                                onClick={() => { onSuccess(); onClose(); }}
                                                className="text-white/30 text-xs hover:text-white transition-colors uppercase tracking-widest"
                                            >
                                                Ver Dashboard (Acesso Limitado)
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-2">Relatório Recebido</h3>
                                            <p className="text-white/50 text-sm max-w-sm mx-auto">
                                                Sua missão foi registrada. Nossa equipe de instrutores analisará seu relatório em até 24h. Você receberá o desbloqueio assim que aprovado.
                                            </p>
                                        </div>
                                        <FlightButton variant="ghost" className="w-full" onClick={() => { onSuccess(); onClose(); }}>
                                            Voltar ao Dashboard
                                        </FlightButton>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}

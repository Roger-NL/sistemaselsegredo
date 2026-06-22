"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, ArrowRight, Loader2, ClipboardCheck, MessageSquare, AlertCircle, ShieldCheck, Phone } from "lucide-react";
import { getQuizByPillarNumber } from "@/data/quizzes";
import { submitExam } from "@/lib/exam/service";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

interface PillarExamModalProps {
    pillarId: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type Step = 'intro' | 'quiz' | 'written' | 'whatsapp' | 'sending' | 'success';

export function PillarExamModal({ pillarId, isOpen, onClose, onSuccess }: PillarExamModalProps) {
    const { user, updateProfile, refreshUser, subscriptionStatus } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState<Step>('intro');
    const [quizIndex, setQuizIndex] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [writtenText, setWrittenAnswer] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [error, setError] = useState("");

    const quiz = getQuizByPillarNumber(pillarId);
    const questions = quiz?.questions || [];
    const storageKey = `exam-progress-pilar-${pillarId}`;
    const isPillarOne = pillarId === 1;
    const isPremiumPillarOne = isPillarOne && subscriptionStatus === "premium";

    // Memory Card: Restore State
    useEffect(() => {
        if (!isOpen) return; // Only process if opened
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.step) setStep(parsed.step);
                if (parsed.quizIndex) setQuizIndex(parsed.quizIndex);
                if (parsed.answers) setAnswers(parsed.answers);
                if (parsed.writtenText) setWrittenAnswer(parsed.writtenText);
                if (parsed.whatsapp) setWhatsapp(parsed.whatsapp);
            } catch (e) { console.error("Error parsing memory card state", e); }
        }
    }, [isOpen, pillarId, storageKey]);

    // Memory Card: Save State
    useEffect(() => {
        if (!isOpen) return;
        if (step !== 'success' && step !== 'sending') {
            localStorage.setItem(storageKey, JSON.stringify({
                isOpen: true,
                step,
                quizIndex,
                answers,
                writtenText,
                whatsapp
            }));
        }
    }, [isOpen, step, quizIndex, answers, writtenText, whatsapp, storageKey]);

    const handleNextStep = () => {
        if (step === 'intro') setStep('quiz');
        else if (step === 'quiz') setStep('written');
        else if (step === 'written') {
            if (writtenText.length < 50) {
                setError("Por favor, escreva um pouco mais sobre sua experiência e os exemplos (mínimo 50 caracteres).");
                return;
            }

            // Check if user already has a phone number
            if (user?.phone && user.phone.length > 8) {
                // If phone exists, skip the step and submit directly using profile phone
                handleSubmit(user.phone);
            } else {
                setStep('whatsapp');
            }
            setError("");
        }
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

    const handleSubmit = async (phoneOverride?: string) => {
        // Validation for WhatsApp (Optional or Mandatory? User said "se ela nao por ficala aguardando a resposta")
        // implying it might be optional, BUT "ficala aguardando a resposta" might mean "on platform only".
        // Let's make it look mandatory but allow skip if they really want? Or just mandatory for better conversion.
        // Given "nao deve ter fricsao", maybe optional is better?
        // But user said "solicitar o wpp novamente se ela nao por".
        // Let's make it mandatory for Pillar 1 to ensure delivery promise? 
        // No, friction kills conversion. Let's make it optional but highly recommended.

        // Actually, user said: "se ela nao por ficala aguardando a resposta" -> If she doesn't put it, she stays waiting for response (on platform).
        // This implies IT IS OPTIONAL.

        setStep('sending');
        setError("");

        const score = calculateScore();
        const finalPhone = phoneOverride || whatsapp;

        // SYNC PHONE TO PROFILE IF NEW
        // This ensures next time we skip the step
        if (finalPhone && finalPhone.length > 8 && (!user?.phone || user.phone.length < 8)) {
            try {
                // Update profile in AuthContext and Firestore
                // We use existing name/email, just update phone
                await updateProfile(user!.name, user!.email, finalPhone);
            } catch (err) {
                console.error("Failed to sync phone to profile:", err);
                // Continue with exam submission anyway
            }
        }

        const result = await submitExam({
            userId: user!.id,
            userEmail: user!.email,
            userName: user!.name,
            userPhone: finalPhone, // NEW
            pillarId: pillarId,
            quizScore: score,
            quizAttempts: 1,
            writtenAnswer: writtenText
        });

        if (result.success) {
            if (subscriptionStatus === "premium") {
                await refreshUser();
            }
            setStep('success');
            // Check if Pillar 1, aim for immediate upsell logic
        } else {
            setError(result.error || "Erro ao enviar missão.");
            setStep('whatsapp');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/80 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative w-full max-w-xl overflow-y-auto rounded-[28px] border border-zinc-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.16)] max-h-[90vh] lg:max-w-5xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50">
                            <ShieldCheck className="h-5 w-5 text-zinc-950" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-zinc-950">Missão Final: Pilar {pillarId}</h2>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Validação de competência</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-950 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-5 md:p-6 lg:p-8">
                    <AnimatePresence mode="wait">
                        {/* INTRO */}
                        {step === 'intro' && (
                            <motion.div key="intro" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: -20 }} className="space-y-5 lg:space-y-6">
                                <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
                                <div className="rounded-[24px] border border-zinc-200 bg-zinc-50 p-5 md:p-6 lg:p-8">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-zinc-700 shadow-sm">
                                        {isPillarOne ? "Fim da etapa gratuita" : "Validação da etapa"}
                                    </div>
                                    <h3 className="mt-4 text-2xl font-black tracking-tight text-zinc-950 md:text-[2rem] lg:text-5xl lg:leading-tight">
                                        {isPillarOne ? "Você chegou até aqui com base real." : "Fechamento do pilar."}
                                    </h3>
                                    <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-600 md:text-[15px] lg:text-base">
                                        {isPillarOne
                                            ? "Uma checagem curta para registrar seu ponto atual e seguir com direção."
                                            : "Agora entra uma checagem curta para confirmar o que ficou sólido antes da próxima etapa."}
                                    </p>
                                    <div className="mt-5 grid gap-2 sm:grid-cols-3">
                                        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
                                            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Formato</p>
                                            <p className="mt-2 text-sm font-semibold text-zinc-950">2 etapas</p>
                                        </div>
                                        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
                                            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Objetivo</p>
                                            <p className="mt-2 text-sm font-semibold text-zinc-950">Validar progresso</p>
                                        </div>
                                        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
                                            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Estilo</p>
                                            <p className="mt-2 text-sm font-semibold text-zinc-950">Resposta real</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-3 lg:grid-rows-[1fr_1fr]">
                                    <div className="rounded-[24px] border border-zinc-200 bg-white p-4 shadow-sm lg:p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950">
                                                <ClipboardCheck className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-zinc-950">Parte 1</p>
                                                <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Perguntas rápidas</p>
                                            </div>
                                        </div>
                                        <p className="mt-3 text-sm leading-relaxed text-zinc-600 lg:max-w-sm">
                                            Confirma os pontos centrais do pilar.
                                        </p>
                                    </div>

                                    <div className="rounded-[24px] border border-zinc-200 bg-white p-4 shadow-sm lg:p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950">
                                                <MessageSquare className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-zinc-950">Parte 2</p>
                                                <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Resposta escrita</p>
                                            </div>
                                        </div>
                                        <p className="mt-3 text-sm leading-relaxed text-zinc-600 lg:max-w-sm">
                                            Mostra seu raciocínio com exemplos reais.
                                        </p>
                                    </div>
                                </div>
                                </div>

                                <div className={`grid gap-3 ${isPillarOne ? "lg:grid-cols-[1fr_1fr]" : ""}`}>
                                    <div className="rounded-[24px] border border-zinc-200 bg-white p-4 shadow-sm">
                                        <h4 className="mb-3 text-sm font-semibold text-zinc-950">Para ir bem</h4>
                                        <div className="grid gap-2 lg:grid-cols-3">
                                            <div className="flex gap-3 text-sm text-zinc-600">
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-zinc-950" />
                                                <span>Suas palavras.</span>
                                            </div>
                                            <div className="flex gap-3 text-sm text-zinc-600">
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-zinc-950" />
                                                <span>Inglês simples.</span>
                                            </div>
                                            <div className="flex gap-3 text-sm text-zinc-600">
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-zinc-950" />
                                                <span>Nível real.</span>
                                            </div>
                                        </div>
                                    </div>

                                    {isPillarOne && (
                                        <div className="rounded-[24px] border border-zinc-200 bg-zinc-50 p-4">
                                            <h4 className="mb-2 text-sm font-semibold text-zinc-950">Depois daqui</h4>
                                            <p className="text-sm leading-relaxed text-zinc-600">
                                                Seu mapa indica o próximo treino: escuta guiada no Pilar 2.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-zinc-950 px-6 py-4 text-base font-black uppercase tracking-[0.18em] text-white shadow-[0_18px_44px_rgba(0,0,0,0.18)] transition hover:bg-zinc-800 md:text-lg lg:py-5"
                                >
                                    {isPillarOne ? "Começar avaliação" : "Iniciar avaliação"}
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </motion.div>
                        )}

                        {/* QUIZ */}
                        {step === 'quiz' && questions.length > 0 && (
                            <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Questão {quizIndex + 1} de {questions.length}</span>
                                    <div className="h-1 bg-zinc-100 w-32 rounded-full overflow-hidden">
                                        <div className="h-full bg-zinc-950 transition-all duration-500" style={{ width: `${((quizIndex + 1) / questions.length) * 100}%` }} />
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-zinc-950 leading-snug">
                                    {questions[quizIndex].question}
                                </h3>

                                <div className="grid gap-3">
                                    {questions[quizIndex].options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(idx)}
                                            className="w-full p-4 text-left bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 hover:border-zinc-950 transition-all text-sm group"
                                        >
                                            <span className="inline-block w-6 h-6 rounded-full bg-zinc-50 border border-zinc-200 text-center leading-6 text-[10px] mr-3 text-zinc-500 group-hover:bg-zinc-950 group-hover:text-white transition-colors">{idx + 1}</span>
                                            <span className="text-zinc-700 group-hover:text-zinc-950">{opt}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* WRITTEN MISSION */}
                        {step === 'written' && (
                            <motion.div key="written" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-zinc-950 mb-2">Sua resposta final</h3>
                                    <p className="text-sm text-zinc-600 mb-4">
                                        Conte o que mais mexeu com você neste pilar e traga **3 exemplos reais** de como isso pode aparecer na sua rotina. Não precisa soar bonito. Precisa soar seu.
                                    </p>
                                    <textarea
                                        value={writtenText}
                                        onChange={(e) => setWrittenAnswer(e.target.value)}
                                        placeholder="O que mais me marcou foi... Na prática, eu usaria isso quando..."
                                        className="w-full h-48 bg-white border border-zinc-200 rounded-xl p-4 text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 transition-colors resize-none"
                                    />
                                    <div className="flex justify-between mt-2">
                                        <span className={`text-[10px] font-mono ${writtenText.length < 50 ? 'text-red-600' : 'text-emerald-700'}`}>
                                            Caracteres: {writtenText.length} (mín. 50)
                                        </span>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-xs">
                                        <AlertCircle size={14} />
                                        {error}
                                    </div>
                                )}

                                <button type="button" className="flex w-full items-center justify-center gap-3 rounded-2xl bg-zinc-950 px-6 py-4 text-base font-black uppercase tracking-[0.18em] text-white transition hover:bg-zinc-800" onClick={handleNextStep}>
                                    Continuar
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </motion.div>
                        )}

                        {/* WHATSAPP INPUT (NEW STEP) */}
                        {step === 'whatsapp' && (
                            <motion.div key="whatsapp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-xl text-center">
                                    <div className="w-16 h-16 bg-zinc-950 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Phone className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-950 mb-2">Se quiser, deixe seu WhatsApp</h3>
                                    <p className="text-zinc-600 text-sm mb-6 max-w-sm mx-auto">
                                        Assim o retorno da sua avaliação pode chegar mais rápido. Se preferir não colocar, tudo bem: você ainda consegue acompanhar a resposta por aqui.
                                    </p>

                                    <div className="max-w-xs mx-auto">
                                        <input
                                            type="tel"
                                            value={whatsapp}
                                            onChange={(e) => setWhatsapp(e.target.value)}
                                            placeholder="(XX) 9XXXX-XXXX"
                                            className="w-full bg-white border border-zinc-200 rounded-lg p-3 text-center text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 transition-colors mb-2"
                                        />
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                                            {whatsapp ? "Número registrado" : "Opcional (Resposta ficará no site)"}
                                        </p>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-xs">
                                        <AlertCircle size={14} />
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <button type="button" className="flex w-full items-center justify-center gap-3 rounded-2xl bg-zinc-950 px-6 py-4 text-base font-black uppercase tracking-[0.18em] text-white transition hover:bg-zinc-800" onClick={() => handleSubmit()}>
                                        Enviar Missão Final
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* SENDING */}
                        {step === 'sending' && (
                            <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="w-12 h-12 text-zinc-950 animate-spin" />
                                <p className="text-zinc-600 font-mono text-sm animate-pulse">Sincronizando dados com o Quartel General...</p>
                            </div>
                        )}

                        {/* SUCCESS */}
                        {step === 'success' && (
                            <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-12 bg-white rounded-2xl text-center space-y-6 px-4 -m-8 mt-0 border-t border-white/10">
                                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                </div>

                                {pillarId === 1 ? (
                                    <>
                                        {isPremiumPillarOne ? (
                                            <>
                                                <div>
                                                    <h3 className="text-3xl font-bold text-neutral-900 mb-3 tracking-tight">Pilar 2 já está liberado</h3>
                                                    <p className="text-neutral-600 text-base max-w-[560px] mx-auto leading-relaxed">
                                                        Sua avaliação foi recebida e segue para leitura da equipe, mas você não precisa esperar para continuar. Se aparecer algum ajuste importante, a gente te sinaliza depois.
                                                    </p>
                                                </div>
                                                <div className="space-y-4 pt-6 max-w-sm mx-auto">
                                                    <button
                                                        className="w-full py-4 text-base font-bold rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-[0_4px_20px_rgba(124,58,237,0.4)] transition-all flex items-center justify-center hover:-translate-y-1"
                                                        onClick={() => {
                                                            onSuccess();
                                                            onClose();
                                                            router.push(`${ROUTES.app.pillar}/2`);
                                                        }}
                                                    >
                                                        Ir para o Pilar 2
                                                        <ArrowRight className="ml-2 w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => { onSuccess(); onClose(); }}
                                                        className="text-neutral-400 text-xs hover:text-neutral-700 transition-colors uppercase tracking-widest font-semibold block mx-auto underline decoration-neutral-200 underline-offset-4"
                                                    >
                                                        Ficar por aqui por enquanto
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <h3 className="text-3xl font-bold text-neutral-900 mb-3 tracking-tight">Avaliação recebida</h3>
                                                    <p className="text-neutral-600 text-base max-w-[500px] mx-auto leading-relaxed">
                                                        Sua resposta foi salva com sucesso. Você concluiu a parte gratuita e já viu a lógica do método funcionando por dentro. A próxima etapa aprofunda isso com sequência completa, correção humana e continuidade guiada.
                                                    </p>
                                                </div>
                                                <div className="space-y-4 pt-6 max-w-sm mx-auto">
                                                    <button
                                                        className="w-full py-4 text-base font-bold rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-[0_4px_20px_rgba(124,58,237,0.4)] transition-all flex items-center justify-center hover:-translate-y-1"
                                                        onClick={() => { router.push(ROUTES.public.payment); onClose(); }}
                                                    >
                                                        Continuar para a próxima etapa
                                                        <ArrowRight className="ml-2 w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => { onSuccess(); onClose(); }}
                                                        className="text-neutral-400 text-xs hover:text-neutral-700 transition-colors uppercase tracking-widest font-semibold block mx-auto underline decoration-neutral-200 underline-offset-4"
                                                    >
                                                        Ficar por aqui por enquanto
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : pillarId === 2 ? (
                                    <>
                                        <div>
                                            <h3 className="text-2xl font-bold text-neutral-900 mb-2">Avaliação recebida</h3>
                                            <p className="text-neutral-600 text-sm max-w-[520px] mx-auto leading-relaxed">
                                                Sua prova do Pilar 2 entrou para avaliação humana. Quando a equipe aprovar esta etapa, a sua primeira aula ao vivo aparece na área de agendamentos para você pedir um horário válido.
                                            </p>
                                        </div>
                                        <button 
                                            className="mt-6 px-8 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-lg font-medium transition-colors"
                                            onClick={() => { onSuccess(); onClose(); }}
                                        >
                                            Voltar ao Dashboard
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <h3 className="text-2xl font-bold text-neutral-900 mb-2">Avaliação recebida</h3>
                                            <p className="text-neutral-600 text-sm max-w-[460px] mx-auto leading-relaxed">
                                                Sua prova será avaliada em breve para liberar o próximo pilar. Se a equipe achar necessário, você poderá refazer essa etapa com os ajustes indicados.
                                            </p>
                                        </div>
                                        <button 
                                            className="mt-6 px-8 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-lg font-medium transition-colors"
                                            onClick={() => { onSuccess(); onClose(); }}
                                        >
                                            Voltar ao Dashboard
                                        </button>
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

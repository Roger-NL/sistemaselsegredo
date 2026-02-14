"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    FlightCard,
    FlightButton,
    FlightProgress
} from "@/components/ui/FlightCard";
import {
    Question,
    getQuizByPillarNumber
} from "@/data/quizzes";
import { X, ChevronRight, RotateCcw, CheckCircle2, AlertTriangle } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

// ============================================================================
// QUIZ INTERFACE - Cosmos Wireframe Design (Compacto, sem scroll)
// ============================================================================

interface QuizInterfaceProps {
    pillarNumber: number;
    onComplete: (score: number, total: number) => void;
    onClose: () => void;
}

type FeedbackState = "idle" | "correct" | "incorrect";

export function QuizInterface({
    pillarNumber,
    onComplete,
    onClose
}: QuizInterfaceProps) {
    const quiz = getQuizByPillarNumber(pillarNumber);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<FeedbackState>("idle");
    const [score, setScore] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    if (!quiz) {
        return (
            <FlightCard
                variant="danger"
                flightId="ERR-404"
                status="PRIVATE_JET"
                className="p-8 text-center"
            >
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-[#EEF4D4] text-lg font-medium">Quiz não encontrado</p>
                <p className="text-white/40 text-sm mt-2">Pilar {pillarNumber}</p>
            </FlightCard>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const totalQuestions = quiz.questions.length;

    const handleSelectAnswer = useCallback((answerIndex: number) => {
        if (feedback !== "idle") return;
        setSelectedAnswer(answerIndex);
    }, [feedback]);

    const handleConfirmAnswer = useCallback(() => {
        if (selectedAnswer === null) return;
        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
        setFeedback(isCorrect ? "correct" : "incorrect");
        if (isCorrect) setScore(prev => prev + 1);
    }, [selectedAnswer, currentQuestion]);

    const handleNextQuestion = useCallback(() => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setFeedback("idle");
        } else {
            setIsComplete(true);
        }
    }, [currentQuestionIndex, totalQuestions]);

    const handleRestart = useCallback(() => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setFeedback("idle");
        setScore(0);
        setIsComplete(false);
    }, []);

    const handleFinish = useCallback(() => {
        onComplete(score, totalQuestions);
    }, [onComplete, score, totalQuestions]);

    // ========== TELA DE RESULTADO (Compacta) ==========
    if (isComplete) {
        const percentage = Math.round((score / totalQuestions) * 100);
        const passed = percentage >= 70;

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <FlightCard
                    variant={passed ? "success" : "danger"}
                    flightId={`RESULT-${pillarNumber}`}
                    status={passed ? "CLEARED" : "IN_FLIGHT"}
                    className="p-6 overflow-hidden relative"
                >
                    {/* Background Glow */}
                    <div className={cn(
                        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20 blur-[100px] rounded-full pointer-events-none transition-colors duration-1000",
                        passed ? "bg-emerald-500/20" : "bg-red-500/20"
                    )} />

                    <div className="relative text-center z-10 flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
                            className="mb-4 relative"
                        >
                            {/* Animated Rings */}
                            <div className={cn(
                                "absolute -inset-4 rounded-full border border-dashed opacity-30 animate-[spin_10s_linear_infinite]",
                                passed ? "border-emerald-500" : "border-red-500"
                            )} />
                            <div className={cn(
                                "absolute -inset-2 rounded-full border opacity-50 animate-[spin_5s_linear_infinite_reverse]",
                                passed ? "border-emerald-500/30" : "border-red-500/30"
                            )} />

                            {/* Icon Container */}
                            <div className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-xl border-2 shadow-[0_0_20px_rgba(0,0,0,0.3)]",
                                passed
                                    ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                                    : "bg-red-500/10 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
                            )}>
                                {passed ? (
                                    <CheckCircle2 className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                ) : (
                                    <AlertTriangle className="w-6 h-6 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                )}
                            </div>
                        </motion.div>

                        <h2 className="text-xl md:text-2xl font-bold text-[#EEF4D4] mb-1 tracking-widest uppercase">
                            {passed ? "Access Granted" : "Access Denied"}
                        </h2>
                        <p className={cn(
                            "text-xs font-mono uppercase tracking-[0.2em] mb-6",
                            passed ? "text-emerald-400/80" : "text-red-400/80"
                        )}>
                            {passed ? "Protocolo de Pilar Concluído" : "Falha na Verificação de Conhecimento"}
                        </p>

                        <div className="relative mb-6 w-full max-w-[200px] mx-auto">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 opacity-50" />
                            <div className="bg-black/60 border border-white/10 rounded-lg p-4 backdrop-blur-md relative overflow-hidden">
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-1">Score Analysis</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className={cn("text-4xl font-bold tracking-tighter tabular-nums", passed ? "text-white" : "text-red-100")}>
                                            {score}
                                        </span>
                                        <span className="text-lg text-white/30">/{totalQuestions}</span>
                                    </div>
                                    <div className={cn(
                                        "w-full h-1 mt-4 rounded-full overflow-hidden bg-white/5",
                                    )}>
                                        <div
                                            className={cn("h-full transition-all duration-1000", passed ? "bg-emerald-500" : "bg-red-500")}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <div className={cn("mt-2 text-[10px] font-bold tracking-widest", passed ? "text-emerald-500" : "text-red-500")}>
                                        {percentage}% EFFICIENCY
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
                            {!passed && (
                                <FlightButton
                                    variant="default"
                                    onClick={handleRestart}
                                    className="w-full justify-center py-6 border-white/10 hover:border-white/30 text-white/60 hover:text-white [&>span>span]:hidden [&>span]:w-full [&>span]:justify-center"
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    REINICIAR PROTOCOLO
                                </FlightButton>
                            )}
                            <FlightButton
                                variant={passed ? "success" : "default"}
                                onClick={handleFinish}
                                className={cn(
                                    "w-full justify-center py-6 text-sm font-bold tracking-[0.2em] shadow-lg transition-all duration-300 [&>span>span]:hidden [&>span]:w-full [&>span]:justify-center",
                                    passed
                                        ? "bg-emerald-500/20 border-emerald-500/50 hover:bg-emerald-500/30 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                                        : ""
                                )}
                            >
                                {passed ? "CONTINUAR OPERAÇÃO" : "SAIR DO SISTEMA"}
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </FlightButton>
                        </div>
                    </div>
                </FlightCard>
            </motion.div>
        );
    }

    // ========== INTERFACE DO QUIZ (Compacta) ==========
    return (
        <FlightCard
            flightId={`PILAR-${pillarNumber}`}
            status="BOARDING"
            variant={
                feedback === "correct" ? "success" :
                    feedback === "incorrect" ? "danger" :
                        "neon"
            }
            className="relative"
            animate={false}
        >
            {/* Botão X */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-1 text-white/40 hover:text-white transition-colors"
            >
                <X className="w-5 h-5" />
            </button>

            {/* Progresso */}
            <div className="px-4 pt-3 pb-2 border-b border-white/10 flex items-center justify-between">
                <span className="text-white/50 text-sm font-medium">
                    Questão {currentQuestionIndex + 1} de {totalQuestions}
                </span>
                <FlightProgress
                    current={currentQuestionIndex + 1}
                    total={totalQuestions}
                    variant="neon"
                />
            </div>

            {/* Pergunta e Opções */}
            <div className="p-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion.id}
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Pergunta */}
                        <h3 className="text-base md:text-lg font-medium text-[#EEF4D4] leading-snug mb-4">
                            {currentQuestion.question}
                        </h3>

                        {/* Opções - 2 colunas em desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {currentQuestion.options.map((option, index) => {
                                const isSelected = selectedAnswer === index;
                                const isCorrect = index === currentQuestion.correctAnswer;
                                const showFeedback = feedback !== "idle";

                                let state: "idle" | "selected" | "correct" | "incorrect" = "idle";
                                if (showFeedback) {
                                    if (isCorrect) state = "correct";
                                    else if (isSelected) state = "incorrect";
                                } else if (isSelected) {
                                    state = "selected";
                                }

                                return (
                                    <div
                                        key={index}
                                        onClick={() => !showFeedback && handleSelectAnswer(index)}
                                        className={cn(
                                            "relative rounded-xl border-[0.75px] p-1 cursor-pointer transition-all duration-300",
                                            state === "idle" && "border-white/10 hover:border-white/30",
                                            state === "selected" && "border-violet-500/50 bg-violet-500/5",
                                            state === "correct" && "border-emerald-500/50 bg-emerald-500/5",
                                            state === "incorrect" && "border-red-500/50 bg-red-500/5",
                                            showFeedback && !isCorrect && !isSelected && "opacity-50 blur-[1px]",
                                            !showFeedback && "hover:shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                                        )}
                                    >
                                        <GlowingEffect
                                            spread={40}
                                            glow={!showFeedback}
                                            disabled={showFeedback}
                                            proximity={64}
                                            inactiveZone={0.01}
                                            borderWidth={2}
                                            variant={state === "correct" ? "white" : "default"}
                                            className={cn(
                                                state === "correct" && "[--glow-color:theme(colors.emerald.500)]",
                                                state === "incorrect" && "[--glow-color:theme(colors.red.500)]",
                                                state === "selected" && "[--glow-color:theme(colors.violet.500)]"
                                            )}
                                        />
                                        <div className={cn(
                                            "relative flex items-center gap-4 overflow-hidden rounded-lg border-[0.75px] bg-[#050505] p-4 shadow-sm transition-colors",
                                            state === "selected" && "border-violet-500/30",
                                            state === "correct" && "border-emerald-500/30 bg-emerald-950/20",
                                            state === "incorrect" && "border-red-500/30 bg-red-950/20",
                                            state === "idle" && "border-white/5"
                                        )}>
                                            <div className={cn(
                                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-[0.75px] bg-white/5 font-mono text-sm transition-colors",
                                                state === "selected" && "border-violet-500 text-violet-300 bg-violet-500/10",
                                                state === "correct" && "border-emerald-500 text-emerald-300 bg-emerald-500/10",
                                                state === "incorrect" && "border-red-500 text-red-300 bg-red-500/10",
                                                state === "idle" && "border-white/10 text-white/40"
                                            )}>
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <div className={cn(
                                                "font-sans text-sm md:text-base leading-snug transition-colors",
                                                state === "selected" && "text-white font-medium",
                                                state === "correct" && "text-emerald-100",
                                                state === "incorrect" && "text-red-100",
                                                state === "idle" && "text-white/70"
                                            )}>
                                                {option}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Feedback inline */}
                <AnimatePresence>
                    {feedback !== "idle" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className={cn(
                                "mt-4 p-3 rounded border text-sm flex items-center gap-2",
                                feedback === "correct"
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                    : "bg-red-500/10 border-red-500/30 text-red-400"
                            )}
                        >
                            {feedback === "correct" ? (
                                <><CheckCircle2 className="w-4 h-4" /> Correto!</>
                            ) : (
                                <><AlertTriangle className="w-4 h-4" /> Incorreto</>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Botão de ação */}
            <div className="px-6 pb-5 pt-2 border-t border-white/5 flex justify-end">
                {feedback === "idle" ? (
                    <FlightButton
                        variant="neon"
                        disabled={selectedAnswer === null}
                        onClick={handleConfirmAnswer}
                        className="px-6"
                    >
                        Confirmar
                        <ChevronRight className="w-4 h-4 ml-1 inline" />
                    </FlightButton>
                ) : (
                    <FlightButton
                        variant={feedback === "correct" ? "success" : "default"}
                        onClick={handleNextQuestion}
                        className="px-6"
                    >
                        {currentQuestionIndex < totalQuestions - 1 ? "Próxima" : "Ver Resultado"}
                        <ChevronRight className="w-4 h-4 ml-1 inline" />
                    </FlightButton>
                )}
            </div>
        </FlightCard>
    );
}

export default QuizInterface;

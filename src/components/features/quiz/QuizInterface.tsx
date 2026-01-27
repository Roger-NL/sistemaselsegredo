"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    TacticalCard,
    TacticalButton,
    SegmentedProgress
} from "@/components/ui/TacticalCard";
import {
    Question,
    getQuizByPillarNumber
} from "@/data/quizzes";
import { X, ChevronRight, RotateCcw, CheckCircle2, AlertTriangle } from "lucide-react";

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
            <TacticalCard
                variant="danger"
                systemId="ERR-404"
                status="CLASSIFIED"
                className="p-8 text-center"
            >
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-[#EEF4D4] text-lg font-medium">Quiz não encontrado</p>
                <p className="text-white/40 text-sm mt-2">Pilar {pillarNumber}</p>
            </TacticalCard>
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
                <TacticalCard
                    variant={passed ? "success" : "danger"}
                    systemId={`RESULT-${pillarNumber}`}
                    status={passed ? "SECURE" : "PROCESSING"}
                    className="p-8"
                >
                    <div className="text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: "spring" }}
                            className="mb-4"
                        >
                            {passed ? (
                                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
                            ) : (
                                <AlertTriangle className="w-16 h-16 text-red-400 mx-auto" />
                            )}
                        </motion.div>

                        <h2 className="text-2xl font-bold text-[#EEF4D4] mb-1">
                            {passed ? "ACCESS GRANTED" : "ACCESS DENIED"}
                        </h2>
                        <p className="text-white/40 text-sm mb-6">
                            {passed ? "Pilar concluído com sucesso" : "Tente novamente"}
                        </p>

                        {/* Score */}
                        <div className="bg-black/40 rounded-lg p-4 mb-6 inline-block">
                            <div className="text-4xl font-bold text-[#EEF4D4]">
                                {score}<span className="text-white/30">/{totalQuestions}</span>
                            </div>
                            <div className={cn(
                                "text-lg font-medium mt-1",
                                passed ? "text-emerald-400" : "text-red-400"
                            )}>
                                {percentage}%
                            </div>
                        </div>

                        {/* Botões */}
                        <div className="flex gap-3 justify-center">
                            {!passed && (
                                <TacticalButton variant="default" onClick={handleRestart} className="px-6">
                                    <RotateCcw className="w-4 h-4 mr-2 inline" />
                                    Tentar Novamente
                                </TacticalButton>
                            )}
                            <TacticalButton
                                variant={passed ? "success" : "default"}
                                onClick={handleFinish}
                                className="px-6"
                            >
                                {passed ? "Continuar" : "Sair"}
                                <ChevronRight className="w-4 h-4 ml-2 inline" />
                            </TacticalButton>
                        </div>
                    </div>
                </TacticalCard>
            </motion.div>
        );
    }

    // ========== INTERFACE DO QUIZ (Compacta) ==========
    return (
        <TacticalCard
            systemId={`PILAR-${pillarNumber}`}
            status="LIVE"
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
            <div className="px-6 pt-5 pb-3 border-b border-white/10 flex items-center justify-between">
                <span className="text-white/50 text-sm font-medium">
                    Questão {currentQuestionIndex + 1} de {totalQuestions}
                </span>
                <SegmentedProgress
                    current={currentQuestionIndex + 1}
                    total={totalQuestions}
                    variant="neon"
                />
            </div>

            {/* Pergunta e Opções */}
            <div className="p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion.id}
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Pergunta */}
                        <h3 className="text-lg md:text-xl font-medium text-[#EEF4D4] leading-relaxed mb-5">
                            {currentQuestion.question}
                        </h3>

                        {/* Opções - mais compactas */}
                        <div className="space-y-2">
                            {currentQuestion.options.map((option, index) => {
                                const isSelected = selectedAnswer === index;
                                const isCorrect = index === currentQuestion.correctAnswer;

                                let buttonVariant: "default" | "success" | "danger" = "default";
                                if (feedback !== "idle") {
                                    if (isCorrect) buttonVariant = "success";
                                    else if (isSelected && !isCorrect) buttonVariant = "danger";
                                }

                                return (
                                    <TacticalButton
                                        key={index}
                                        variant={feedback !== "idle" ? buttonVariant : "default"}
                                        selected={isSelected && feedback === "idle"}
                                        disabled={feedback !== "idle"}
                                        onClick={() => handleSelectAnswer(index)}
                                        className="text-sm py-2.5"
                                    >
                                        <span className="text-white/40 mr-2 font-mono">
                                            {String.fromCharCode(65 + index)}.
                                        </span>
                                        {option}
                                    </TacticalButton>
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
                    <TacticalButton
                        variant="neon"
                        disabled={selectedAnswer === null}
                        onClick={handleConfirmAnswer}
                        className="px-6"
                    >
                        Confirmar
                        <ChevronRight className="w-4 h-4 ml-1 inline" />
                    </TacticalButton>
                ) : (
                    <TacticalButton
                        variant={feedback === "correct" ? "success" : "default"}
                        onClick={handleNextQuestion}
                        className="px-6"
                    >
                        {currentQuestionIndex < totalQuestions - 1 ? "Próxima" : "Ver Resultado"}
                        <ChevronRight className="w-4 h-4 ml-1 inline" />
                    </TacticalButton>
                )}
            </div>
        </TacticalCard>
    );
}

export default QuizInterface;

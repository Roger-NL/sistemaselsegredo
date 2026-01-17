"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { useProgress } from "@/context/ProgressContext";
import { getQuizByPillarNumber } from "@/data/quizzes";
import { SlotMachineJackpot } from "@/components/ui/SlotMachineJackpot";
import { DecisionMatrix } from "@/components/quiz/DecisionMatrix";

// ============================================================================
// QUIZ PAGE - FULL IMPLEMENTATION
// Interface completa para responder perguntas do pilar com feedback e recompensa
// Usa ProgressContext para atualizar progresso após completar
// ============================================================================

interface QuizClientProps {
    pillarId: string;
}

export function QuizClient({ pillarId }: QuizClientProps) {
    const router = useRouter();
    const pillarNumber = parseInt(pillarId);
    const { getPillarsWithStatus, completePillar, isPillarUnlocked, unlockSpecialization } = useProgress();

    const pillars = getPillarsWithStatus();
    const pillar = pillars[pillarNumber - 1];
    const quiz = getQuizByPillarNumber(pillarNumber);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [showSlotMachine, setShowSlotMachine] = useState(false);
    const [showDecisionMatrix, setShowDecisionMatrix] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    // Verifica se pilar está desbloqueado
    const isUnlocked = isPillarUnlocked(pillarNumber);

    // Se não encontrar o pilar, quiz, ou não está desbloqueado
    if (!pillar || !quiz) {
        return (
            <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Quiz não encontrado</h1>
                    <Link href="/dashboard" className="text-amber-400 hover:underline">
                        Voltar ao Dashboard
                    </Link>
                </div>
            </main>
        );
    }

    if (!isUnlocked) {
        return (
            <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">🔒 Pilar Bloqueado</h1>
                    <p className="text-zinc-400 mb-4">Complete os pilares anteriores primeiro.</p>
                    <Link href="/dashboard" className="text-amber-400 hover:underline">
                        Voltar ao Dashboard
                    </Link>
                </div>
            </main>
        );
    }

    const questions = quiz.questions;
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    // Função para selecionar resposta
    const handleSelectAnswer = (answerIndex: number) => {
        if (isAnswered) return;

        setSelectedAnswer(answerIndex);
        setIsAnswered(true);

        if (answerIndex === currentQuestion.correctAnswer) {
            setCorrectAnswers((prev) => prev + 1);
        }
    };

    // Função para ir para próxima pergunta
    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            // Quiz completado!
            setQuizCompleted(true);

            // Calcula se passou (precisa da resposta atual também)
            const finalCorrect = selectedAnswer === currentQuestion.correctAnswer
                ? correctAnswers + 1
                : correctAnswers;

            // Mostra slot machine se acertou mais da metade
            if (finalCorrect >= questions.length / 2) {
                // Marca pilar como completado ANTES de mostrar slot machine
                completePillar(pillarNumber);
                setShowSlotMachine(true);
            }
        }
    };

    // Função chamada quando slot machine completa
    const handleSlotMachineComplete = () => {
        // NÃO fecha o modal visualmente para evitar flash da tela de fundo
        // setShowSlotMachine(false); 

        // Se for o Pilar 9, abre a Matrix de Decisão
        if (pillarNumber === 9) {
            setShowSlotMachine(false); // Aqui fechamos para mostrar a Matrix
            setShowDecisionMatrix(true);
            return;
        }

        setIsNavigating(true); // Mostra loading

        // Redireciona para o próximo pilar ou dashboard
        if (pillarNumber < 9) {
            router.push(`/pilar/${pillarNumber + 1}`);
        } else {
            router.push("/dashboard");
        }
    };

    // Função de escolha da Matrix
    const handleDecisionMade = (planetId: string) => {
        setIsNavigating(true); // Mostra loading

        // SEGURANÇA: Garante que o Pilar 9 seja marcado como completado
        // Caso a chamada no quiz tenha falhado ou o estado não tenha persistido
        if (pillarNumber === 9) {
            completePillar(9);
        }

        // Salva a especialização e desbloqueia
        unlockSpecialization(planetId);

        // Pequeno delay para garantir que o estado propague antes do redirect
        setTimeout(() => {
            router.push("/dashboard");
        }, 300);
    };

    // Se estiver navegando, mostra loading simples
    if (isNavigating) {
        return (
            <main className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-pulse text-xl font-bold text-amber-500">Viajando...</div>
            </main>
        );
    }

    // Se for para mostrar a Matrix (Pilar 9), mostra ELA como tela principal
    if (showDecisionMatrix) {
        return <DecisionMatrix onSelect={handleDecisionMade} />;
    }

    // Tela de resultado final (se não passou OU se passou mas fechou a roleta sem ação - fallback)
    if (quizCompleted && !showSlotMachine) {
        const finalCorrect = correctAnswers;
        const passed = finalCorrect >= questions.length / 2;

        // Se passou mas slot machine já fechou, redireciona
        if (passed) {
            return (
                <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md w-full text-center"
                    >
                        <div className="w-24 h-24 mx-auto mb-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-12 h-12 text-emerald-500" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2 text-emerald-400">
                            Parabéns!
                        </h2>
                        <p className="text-zinc-400 mb-4">
                            Você completou o {pillar.title}
                        </p>

                        <div className="bg-zinc-900/50 rounded-2xl p-6 mb-6 border border-zinc-800">
                            <p className="text-4xl font-bold text-white mb-2">
                                {finalCorrect}/{questions.length}
                            </p>
                            <p className="text-zinc-500 text-sm">Respostas corretas</p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => setShowSlotMachine(true)}
                                className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-xl flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-5 h-5" />
                                Ver Recompensa
                            </button>
                            <Link
                                href="/dashboard"
                                className="block w-full py-3 px-6 border border-zinc-700 text-zinc-400 rounded-xl text-center hover:bg-zinc-800 transition-colors"
                            >
                                Voltar ao Dashboard
                            </Link>
                        </div>
                    </motion.div>
                </main>
            );
        }

        // Não passou
        return (
            <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full text-center"
                >
                    <div className="w-24 h-24 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
                        <XCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-red-400">
                        Quase lá!
                    </h2>
                    <p className="text-zinc-400 mb-4">
                        Revise o conteúdo e tente novamente
                    </p>

                    <div className="bg-zinc-900/50 rounded-2xl p-6 mb-6 border border-zinc-800">
                        <p className="text-4xl font-bold text-white mb-2">
                            {finalCorrect}/{questions.length}
                        </p>
                        <p className="text-zinc-500 text-sm">Respostas corretas</p>
                    </div>

                    <div className="space-y-3">
                        <Link
                            href={`/pilar/${pillarId}`}
                            className="block w-full py-4 px-6 bg-gradient-to-r from-zinc-700 to-zinc-800 text-white font-bold rounded-xl text-center"
                        >
                            Revisar Conteúdo
                        </Link>
                        <Link
                            href="/dashboard"
                            className="block w-full py-3 px-6 border border-zinc-700 text-zinc-400 rounded-xl text-center hover:bg-zinc-800 transition-colors"
                        >
                            Voltar ao Dashboard
                        </Link>
                    </div>
                </motion.div>
            </main>
        );
    }

    return (
        <>
            {/* Decision Matrix - Só aparece p/ Pilar 9 */}
            {showDecisionMatrix && (
                <DecisionMatrix onSelect={handleDecisionMade} />
            )}

            {/* Slot Machine Jackpot - Experiência Vegas */}
            <SlotMachineJackpot
                isVisible={showSlotMachine}
                completedPillarNumber={pillarNumber}
                onComplete={handleSlotMachineComplete}
            />

            <main className="min-h-screen bg-[#050505] text-white">
                {/* Header */}
                <header className="px-6 py-4 border-b border-zinc-800">
                    <div className="max-w-2xl mx-auto flex items-center gap-4">
                        <Link
                            href={`/pilar/${pillarId}`}
                            className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex-1">
                            <h1 className="font-bold">Desafio: {pillar.title}</h1>
                            <p className="text-xs text-zinc-500">
                                Acerte para desbloquear o próximo pilar
                            </p>
                        </div>
                    </div>
                </header>

                {/* Progresso */}
                <div className="px-6 py-4 border-b border-zinc-800/50">
                    <div className="max-w-2xl mx-auto">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-zinc-400">
                                Questão {currentQuestionIndex + 1} de {questions.length}
                            </span>
                            <span className="text-sm text-emerald-400">
                                {correctAnswers} corretas
                            </span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-amber-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Questão atual */}
                <div className="px-6 py-8">
                    <div className="max-w-2xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentQuestionIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-xl md:text-2xl font-bold mb-8">
                                    {currentQuestion.question}
                                </h2>

                                <div className="space-y-3">
                                    {currentQuestion.options.map((option, index) => {
                                        const isCorrect = index === currentQuestion.correctAnswer;
                                        const isSelected = index === selectedAnswer;

                                        let buttonClass = "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-700";

                                        if (isAnswered) {
                                            if (isCorrect) {
                                                buttonClass = "border-emerald-500 bg-emerald-500/20";
                                            } else if (isSelected && !isCorrect) {
                                                buttonClass = "border-red-500 bg-red-500/20";
                                            } else {
                                                buttonClass = "border-zinc-800/50 bg-zinc-900/30 opacity-50";
                                            }
                                        } else if (isSelected) {
                                            buttonClass = "border-amber-500 bg-amber-500/10";
                                        }

                                        return (
                                            <motion.button
                                                key={index}
                                                onClick={() => handleSelectAnswer(index)}
                                                disabled={isAnswered}
                                                whileHover={!isAnswered ? { scale: 1.01 } : {}}
                                                whileTap={!isAnswered ? { scale: 0.99 } : {}}
                                                className={`w-full text-left p-4 rounded-xl border transition-all ${buttonClass}`}
                                            >
                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium mr-3 ${isAnswered && isCorrect
                                                    ? "bg-emerald-500 text-black"
                                                    : isAnswered && isSelected && !isCorrect
                                                        ? "bg-red-500 text-white"
                                                        : "bg-zinc-800"
                                                    }`}>
                                                    {isAnswered && isCorrect ? (
                                                        <CheckCircle className="w-4 h-4" />
                                                    ) : isAnswered && isSelected && !isCorrect ? (
                                                        <XCircle className="w-4 h-4" />
                                                    ) : (
                                                        String.fromCharCode(65 + index)
                                                    )}
                                                </span>
                                                {option}
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Feedback e botão próximo */}
                                <AnimatePresence>
                                    {isAnswered && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-8"
                                        >
                                            <div className={`p-4 rounded-xl mb-4 ${selectedAnswer === currentQuestion.correctAnswer
                                                ? "bg-emerald-500/10 border border-emerald-500/30"
                                                : "bg-red-500/10 border border-red-500/30"
                                                }`}>
                                                <p className={`font-medium ${selectedAnswer === currentQuestion.correctAnswer
                                                    ? "text-emerald-400"
                                                    : "text-red-400"
                                                    }`}>
                                                    {selectedAnswer === currentQuestion.correctAnswer
                                                        ? "✓ Correto! Muito bem!"
                                                        : `✗ Incorreto. A resposta certa é: ${currentQuestion.options[currentQuestion.correctAnswer]}`
                                                    }
                                                </p>
                                            </div>

                                            <button
                                                onClick={handleNextQuestion}
                                                className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-xl"
                                            >
                                                {currentQuestionIndex < questions.length - 1
                                                    ? "Próxima Pergunta →"
                                                    : "Ver Resultado"}
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </>
    );
}

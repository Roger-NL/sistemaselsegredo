"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// SLOT MACHINE COMPONENT
// Recompensa gamificada após completar um pilar
// Animação de caça-níquel com resultado garantido
// ============================================================================

interface SlotMachineProps {
    onComplete: (reward: string) => void;
    isVisible: boolean;
}

// Símbolos do slot machine com seus valores
const SYMBOLS = ["⭐", "💎", "🔥", "🎯", "🚀", "💡", "🏆", "✨"];

// Recompensas possíveis (exibidas após o spin)
const REWARDS = [
    { message: "+50 XP Bônus!", type: "xp" },
    { message: "Distintivo Desbloqueado!", type: "badge" },
    { message: "+100 XP Jackpot!", type: "jackpot" },
    { message: "Acesso Antecipado!", type: "special" },
    { message: "+25 XP", type: "xp-small" },
];

export function SlotMachine({ onComplete, isVisible }: SlotMachineProps) {
    const [isSpinning, setIsSpinning] = useState(false);
    const [slots, setSlots] = useState(["⭐", "⭐", "⭐"]);
    const [reward, setReward] = useState<typeof REWARDS[0] | null>(null);
    const [showReward, setShowReward] = useState(false);

    // Função para girar o slot machine
    const spin = useCallback(() => {
        if (isSpinning) return;

        setIsSpinning(true);
        setShowReward(false);
        setReward(null);

        // Animação de spin - muda os símbolos rapidamente
        let spinCount = 0;
        const maxSpins = 20;

        const spinInterval = setInterval(() => {
            setSlots([
                SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
                SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
                SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            ]);

            spinCount++;

            if (spinCount >= maxSpins) {
                clearInterval(spinInterval);

                // Resultado final - sempre uma combinação vencedora para feedback positivo
                const winningSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                setSlots([winningSymbol, winningSymbol, winningSymbol]);

                // Escolhe recompensa aleatória
                const randomReward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
                setReward(randomReward);

                setIsSpinning(false);

                // Mostra a recompensa após pequeno delay
                setTimeout(() => {
                    setShowReward(true);
                }, 500);
            }
        }, 80); // Velocidade do spin
    }, [isSpinning]);

    // Auto-spin assim que fica visível
    useEffect(() => {
        if (isVisible && !isSpinning && !reward) {
            const timer = setTimeout(spin, 800);
            return () => clearTimeout(timer);
        }
    }, [isVisible, isSpinning, reward, spin]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

                    {/* Container do Slot Machine */}
                    <motion.div
                        initial={{ y: 50 }}
                        animate={{ y: 0 }}
                        className="relative z-10 w-full max-w-md"
                    >
                        {/* Título */}
                        <motion.h2
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl md:text-3xl font-bold text-center text-white mb-6"
                        >
                            🎰 Sua Recompensa! 🎰
                        </motion.h2>

                        {/* Slot Machine Frame */}
                        <div className="bg-gradient-to-b from-amber-600 to-amber-800 p-2 rounded-2xl shadow-2xl">
                            <div className="bg-zinc-900 rounded-xl p-6">
                                {/* Display dos slots */}
                                <div className="flex justify-center gap-2 mb-6">
                                    {slots.map((symbol, index) => (
                                        <motion.div
                                            key={index}
                                            animate={isSpinning ? { y: [0, -10, 0] } : {}}
                                            transition={{
                                                duration: 0.1,
                                                repeat: isSpinning ? Infinity : 0,
                                                delay: index * 0.05
                                            }}
                                            className="w-20 h-24 bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-lg border-2 border-amber-500/50 flex items-center justify-center text-5xl shadow-inner"
                                        >
                                            <motion.span
                                                key={symbol}
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ duration: 0.1 }}
                                            >
                                                {symbol}
                                            </motion.span>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Recompensa */}
                                <AnimatePresence>
                                    {showReward && reward && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="text-center mb-6"
                                        >
                                            <div className="text-4xl mb-2">🎉</div>
                                            <p className="text-xl md:text-2xl font-bold text-amber-400">
                                                {reward.message}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Botões */}
                                <div className="space-y-3">
                                    {!showReward ? (
                                        <motion.div
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="text-center text-zinc-400 text-sm"
                                        >
                                            {isSpinning ? "Girando..." : "Preparando sua recompensa..."}
                                        </motion.div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={spin}
                                                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-xl hover:from-purple-500 hover:to-purple-600 transition-all"
                                            >
                                                🎰 Girar Novamente
                                            </button>
                                            <button
                                                onClick={() => onComplete(reward?.message || "")}
                                                className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all"
                                            >
                                                Continuar Jornada →
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Decoração */}
                        <div className="absolute -top-4 -left-4 text-4xl animate-bounce">✨</div>
                        <div className="absolute -top-4 -right-4 text-4xl animate-bounce delay-100">✨</div>
                        <div className="absolute -bottom-4 -left-4 text-4xl animate-bounce delay-200">🌟</div>
                        <div className="absolute -bottom-4 -right-4 text-4xl animate-bounce delay-300">🌟</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

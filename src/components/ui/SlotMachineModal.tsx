"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Lock, Unlock, Sparkles, Star } from "lucide-react";
import { PILLARS, PLANETS, type Pillar } from "@/data/curriculum";

// ============================================================================
// SLOT MACHINE MODAL
// Experiência gamificada de transição entre pilares
// Animação de roleta vertical com física realística
// ============================================================================

interface SlotMachineModalProps {
    /** ID do pilar que foi completado (ex: 1, 2, 3...) */
    completedPillarNumber: number;
    /** Callback quando o desbloqueio completa */
    onUnlockComplete: () => void;
    /** Se true, mostra o modal */
    isVisible: boolean;
}

// Constantes de timing
const SPIN_DURATION = 3500; // 3.5 segundos de animação
const ITEM_HEIGHT = 120; // Altura de cada item na roleta (px)

// Criar array expandido para efeito de loop na roleta
function createReelItems(nextPillarNumber: number, isLastPillar: boolean) {
    // Se é o último pilar, mostra planetas no final
    if (isLastPillar) {
        const reelItems = [];
        // Adiciona pilares embaralhados primeiro
        for (let i = 0; i < 15; i++) {
            const randomPillar = PILLARS[Math.floor(Math.random() * PILLARS.length)];
            reelItems.push({
                type: "pillar" as const,
                title: randomPillar.title,
                icon: `0${Math.floor(Math.random() * 9) + 1}`,
                isTarget: false,
            });
        }
        // Termina com indicador especial de "Sistema Solar Completo"
        reelItems.push({
            type: "special" as const,
            title: "Sistema Solar Completo!",
            icon: "🌟",
            isTarget: true,
        });
        return reelItems;
    }

    // Caso normal: próximo pilar
    const nextPillar = PILLARS[nextPillarNumber - 1];
    const reelItems = [];

    // Cria 15-20 itens aleatórios para a roleta girar
    for (let i = 0; i < 18; i++) {
        const randomPillar = PILLARS[Math.floor(Math.random() * PILLARS.length)];
        reelItems.push({
            type: "pillar" as const,
            title: randomPillar.title,
            icon: randomPillar.title.substring(0, 2),
            isTarget: false,
        });
    }

    // O último item é o alvo (próximo pilar)
    reelItems.push({
        type: "pillar" as const,
        title: nextPillar?.title || "Próximo Pilar",
        icon: nextPillar?.title.substring(0, 2) || "??",
        isTarget: true,
    });

    return reelItems;
}

export function SlotMachineModal({
    completedPillarNumber,
    onUnlockComplete,
    isVisible,
}: SlotMachineModalProps) {
    const [phase, setPhase] = useState<"intro" | "spinning" | "unlocking" | "complete">("intro");
    const [showUnlockEffect, setShowUnlockEffect] = useState(false);
    const controls = useAnimation();
    const hasStarted = useRef(false);

    // Determina o próximo pilar ou se é o final
    const isLastPillar = completedPillarNumber >= 9;
    const nextPillarNumber = isLastPillar ? 9 : completedPillarNumber + 1;
    const nextPillar = PILLARS[nextPillarNumber - 1];

    // Gera os itens da roleta
    const reelItems = createReelItems(nextPillarNumber, isLastPillar);

    // Calcula a posição final da roleta (parar no último item - o alvo)
    const totalItems = reelItems.length;
    const finalPosition = -(totalItems - 1) * ITEM_HEIGHT;

    // Inicia a animação quando fica visível
    const startAnimation = useCallback(async () => {
        if (hasStarted.current) return;
        hasStarted.current = true;

        // Fase 1: Intro (flash de sucesso)
        setPhase("intro");
        await new Promise((r) => setTimeout(r, 800));

        // Fase 2: Spinning
        setPhase("spinning");

        // Animação da roleta com física realística
        // Começa rápido, desacelera com easing cúbico
        await controls.start({
            y: finalPosition,
            transition: {
                duration: SPIN_DURATION / 1000,
                ease: [0.15, 0.85, 0.35, 1.0], // Cubic easing: rápido início, freio suave
            },
        });

        // Fase 3: Unlocking (efeito de desbloqueio)
        setPhase("unlocking");
        setShowUnlockEffect(true);

        // Som/vibração de impacto (visual)
        await new Promise((r) => setTimeout(r, 600));

        // Fase 4: Complete
        setPhase("complete");
    }, [controls, finalPosition]);

    // Trigger da animação
    useEffect(() => {
        if (isVisible && !hasStarted.current) {
            startAnimation();
        }
    }, [isVisible, startAnimation]);

    // Reset quando fecha
    useEffect(() => {
        if (!isVisible) {
            hasStarted.current = false;
            setPhase("intro");
            setShowUnlockEffect(false);
            controls.set({ y: 0 });
        }
    }, [isVisible, controls]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    {/* Backdrop com blur */}
                    <motion.div
                        initial={{ backdropFilter: "blur(0px)" }}
                        animate={{ backdropFilter: "blur(12px)" }}
                        className="absolute inset-0 bg-black/90"
                    />

                    {/* Container principal */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", damping: 20 }}
                        className="relative z-10 w-full max-w-md"
                    >
                        {/* Intro Flash - "Pilar Dominado!" */}
                        <AnimatePresence>
                            {phase === "intro" && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.2 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center"
                                >
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            rotate: [0, 5, -5, 0],
                                        }}
                                        transition={{ duration: 0.5 }}
                                        className="text-6xl mb-4"
                                    >
                                        ✓
                                    </motion.div>
                                    <motion.h2
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-2xl md:text-3xl font-bold text-emerald-400"
                                    >
                                        Pilar {completedPillarNumber} Dominado!
                                    </motion.h2>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Slot Machine Frame */}
                        <AnimatePresence>
                            {phase !== "intro" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {/* Título */}
                                    <motion.h2
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center text-xl md:text-2xl font-bold text-white mb-6"
                                    >
                                        {isLastPillar ? (
                                            <span className="text-amber-400">Currículo Base Finalizado!</span>
                                        ) : (
                                            <>Desbloqueando <span className="text-amber-400">Próximo Pilar</span>...</>
                                        )}
                                    </motion.h2>

                                    {/* Frame do Slot (Estilo Casino/Sci-Fi) */}
                                    <div className="relative mx-auto">
                                        {/* Borda externa dourada */}
                                        <div className="absolute -inset-1 bg-gradient-to-b from-amber-400 via-amber-600 to-amber-400 rounded-2xl opacity-80" />

                                        {/* Container da roleta */}
                                        <div className="relative bg-zinc-950 rounded-xl p-1 overflow-hidden">
                                            {/* Janela de visualização da roleta */}
                                            <div
                                                className="relative overflow-hidden rounded-lg"
                                                style={{ height: ITEM_HEIGHT }}
                                            >
                                                {/* Gradiente de fade nas bordas */}
                                                <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950" />

                                                {/* A roleta em si */}
                                                <motion.div
                                                    animate={controls}
                                                    className="flex flex-col"
                                                    style={{ y: 0 }}
                                                >
                                                    {reelItems.map((item, index) => (
                                                        <motion.div
                                                            key={index}
                                                            className={`flex items-center justify-center gap-4 px-6 ${item.isTarget && showUnlockEffect
                                                                    ? "bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-amber-500/20"
                                                                    : ""
                                                                }`}
                                                            style={{ height: ITEM_HEIGHT }}
                                                        >
                                                            {/* Ícone */}
                                                            <div
                                                                className={`relative w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold ${item.isTarget && showUnlockEffect
                                                                        ? "bg-gradient-to-br from-amber-400 to-amber-600 text-black"
                                                                        : "bg-zinc-800 text-zinc-400"
                                                                    }`}
                                                            >
                                                                {item.type === "special" ? (
                                                                    <span className="text-3xl">{item.icon}</span>
                                                                ) : (
                                                                    item.icon
                                                                )}

                                                                {/* Cadeado/Desbloqueio */}
                                                                {item.isTarget && (
                                                                    <motion.div
                                                                        initial={{ scale: 1, opacity: 1 }}
                                                                        animate={
                                                                            showUnlockEffect
                                                                                ? {
                                                                                    scale: [1, 1.5, 0],
                                                                                    opacity: [1, 1, 0],
                                                                                    rotate: [0, 15, -15, 0],
                                                                                }
                                                                                : {}
                                                                        }
                                                                        transition={{ duration: 0.4 }}
                                                                        className="absolute -top-2 -right-2"
                                                                    >
                                                                        {!showUnlockEffect && (
                                                                            <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center">
                                                                                <Lock className="w-3 h-3 text-zinc-400" />
                                                                            </div>
                                                                        )}
                                                                    </motion.div>
                                                                )}
                                                            </div>

                                                            {/* Título */}
                                                            <div className="flex-1 text-left">
                                                                <p
                                                                    className={`font-bold text-lg ${item.isTarget && showUnlockEffect
                                                                            ? "text-amber-400"
                                                                            : "text-zinc-300"
                                                                        }`}
                                                                >
                                                                    {item.title}
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </motion.div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Efeito de unlock - partículas/explosão */}
                                    <AnimatePresence>
                                        {showUnlockEffect && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 pointer-events-none flex items-center justify-center"
                                            >
                                                {/* Partículas animadas */}
                                                {[...Array(12)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{
                                                            opacity: 1,
                                                            scale: 0,
                                                            x: 0,
                                                            y: 0,
                                                        }}
                                                        animate={{
                                                            opacity: [1, 1, 0],
                                                            scale: [0, 1, 0.5],
                                                            x: Math.cos((i * Math.PI * 2) / 12) * 100,
                                                            y: Math.sin((i * Math.PI * 2) / 12) * 100,
                                                        }}
                                                        transition={{
                                                            duration: 0.8,
                                                            delay: i * 0.02,
                                                        }}
                                                        className="absolute text-2xl"
                                                    >
                                                        {i % 2 === 0 ? "✨" : "⭐"}
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Botões de ação */}
                                    <AnimatePresence>
                                        {phase === "complete" && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                                className="mt-8 space-y-3"
                                            >
                                                <motion.button
                                                    onClick={onUnlockComplete}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    animate={{
                                                        boxShadow: [
                                                            "0 0 20px rgba(251, 191, 36, 0.3)",
                                                            "0 0 40px rgba(251, 191, 36, 0.5)",
                                                            "0 0 20px rgba(251, 191, 36, 0.3)",
                                                        ],
                                                    }}
                                                    transition={{
                                                        boxShadow: { duration: 1.5, repeat: Infinity },
                                                    }}
                                                    className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg rounded-xl flex items-center justify-center gap-2"
                                                >
                                                    {isLastPillar ? (
                                                        <>
                                                            <Star className="w-5 h-5" />
                                                            Explorar Especializações
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="w-5 h-5" />
                                                            Iniciar Pilar {nextPillarNumber}
                                                        </>
                                                    )}
                                                </motion.button>

                                                <button
                                                    onClick={onUnlockComplete}
                                                    className="w-full py-3 px-6 border border-zinc-700 text-zinc-400 rounded-xl hover:bg-zinc-800 transition-colors"
                                                >
                                                    Ir para o Painel
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Decorações de fundo */}
                        <div className="absolute -top-8 -left-8 text-4xl opacity-50 animate-pulse">✨</div>
                        <div className="absolute -top-8 -right-8 text-4xl opacity-50 animate-pulse delay-100">✨</div>
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-4xl opacity-50 animate-pulse delay-200">🌟</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

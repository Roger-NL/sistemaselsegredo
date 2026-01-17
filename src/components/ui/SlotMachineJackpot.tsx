"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import Confetti from "react-confetti";
import { Sparkles, Zap, Trophy, Coins, Star } from "lucide-react";
import { PILLARS } from "@/data/curriculum";

// ============================================================================
// SLOT MACHINE JACKPOT - HIGH STAKES CINEMATIC EDITION
// Reference: "Massive Golden Explosion", "God Rays", "3D Coins", "Chamfered Gold"
// ============================================================================

interface SlotMachineJackpotProps {
    completedPillarNumber: number;
    onComplete: () => void;
    isVisible: boolean;
}

const SPIN_DURATION = 4000;
const SLOT_ITEM_HEIGHT = 120; // Taller
const BONUS_CHANCE = 0.8;

// High Stakes Symbols
const SLOT_SYMBOLS = [
    { icon: "💎", label: "Diamond", type: "symbol" },
    { icon: "7️⃣", label: "Seven", type: "symbol" },
    { icon: "👑", label: "Crown", type: "symbol" },
    { icon: "🎰", label: "Jackpot", type: "symbol" },
    { icon: "⚜️", label: "Elite", type: "symbol" },
    { icon: "💰", label: "Cash", type: "symbol" },
];

const BONUS_QUESTIONS = [
    { question: "Quick! What's the past tense of 'go'?", options: ["goed", "went", "gone", "going"], correct: 1 },
    { question: "Complete: 'I ___ been waiting for you.'", options: ["has", "have", "am", "was"], correct: 1 },
];

function generateReelItems(nextPillarNumber: number, landOnBonus: boolean, isSpecialMode: boolean, count: number) {
    const items = [];
    // ... generation logic same as before ...
    for (let i = 0; i < count - 1; i++) {
        const s = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
        items.push({ icon: s.icon, label: s.label, type: "symbol" as const, isWinner: false });
    }
    if (landOnBonus) items.push({ icon: "❓", label: "Bonus", type: "bonus", isWinner: true });
    else items.push({ icon: "🌟", label: "Complete", type: "pillar", isWinner: true });
    return items;
}

export function SlotMachineJackpot({ completedPillarNumber, onComplete, isVisible }: SlotMachineJackpotProps) {
    const isSpecialPillar9 = completedPillarNumber === 9;

    const [phase, setPhase] = useState<"win" | "ready" | "spinning" | "bonus" | "answering" | "jackpot" | "resgate">("win");
    const [showConfetti, setShowConfetti] = useState(false);
    const [screenShake, setScreenShake] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    const [hasHadBonusSpin, setHasHadBonusSpin] = useState(false);
    const [landOnBonus, setLandOnBonus] = useState(false);
    const [bonusQuestion, setBonusQuestion] = useState(BONUS_QUESTIONS[0]);
    const [selectedBonusAnswer, setSelectedBonusAnswer] = useState<number | null>(null);
    const [bonusAnswered, setBonusAnswered] = useState(false);

    const controls1 = useAnimation();
    const controls2 = useAnimation();
    const controls3 = useAnimation();
    const hasStarted = useRef(false);

    const reel1Items = useMemo(() => generateReelItems(9, landOnBonus, isSpecialPillar9, 20), [landOnBonus]);
    const reel2Items = useMemo(() => generateReelItems(9, landOnBonus, isSpecialPillar9, 23), [landOnBonus]);
    const reel3Items = useMemo(() => generateReelItems(9, landOnBonus, isSpecialPillar9, 26), [landOnBonus]);

    useEffect(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener("resize", () => setWindowSize({ width: window.innerWidth, height: window.innerHeight }));
    }, []);

    useEffect(() => {
        if (isVisible && !hasStarted.current) {
            hasStarted.current = true;
            // Removed initial confetti: setShowConfetti(true);
            setPhase("win");
            setLandOnBonus(!isSpecialPillar9 && !hasHadBonusSpin && Math.random() < BONUS_CHANCE);
        }
    }, [isVisible]);

    useEffect(() => {
        if (!isVisible) {
            hasStarted.current = false;
            setPhase("win");
            setShowConfetti(false);
            setScreenShake(false);
            controls1.set({ y: 0 }); controls2.set({ y: 0 }); controls3.set({ y: 0 });
        }
    }, [isVisible]);

    const spinReels = useCallback(async () => {
        setPhase("spinning");
        const h = SLOT_ITEM_HEIGHT;
        controls1.start({ y: -((reel1Items.length - 1) * h), transition: { duration: 2.5, ease: [0.1, 0.9, 0.2, 1] } });
        setTimeout(() => controls2.start({ y: -((reel2Items.length - 1) * h), transition: { duration: 2.8, ease: [0.1, 0.9, 0.2, 1] } }), 200);
        setTimeout(() => controls3.start({ y: -((reel3Items.length - 1) * h), transition: { duration: 3.2, ease: [0.1, 0.9, 0.2, 1] } }), 400);

        setTimeout(() => {
            setScreenShake(true); setTimeout(() => setScreenShake(false), 500);
            if (landOnBonus) { setPhase("bonus"); setTimeout(() => setPhase("answering"), 1500); }
            else { setShowConfetti(true); setPhase("jackpot"); setTimeout(() => setPhase("resgate"), 3000); }
        }, 3400);
    }, [controls1, controls2, controls3, reel1Items, reel2Items, reel3Items, landOnBonus]);

    const renderReel = (items: typeof reel1Items, controls: typeof controls1, delay: number) => (
        <div className="relative overflow-hidden bg-black rounded-lg border-2 border-[#d4af37] shadow-[inset_0_0_20px_rgba(0,0,0,1)]" style={{ height: SLOT_ITEM_HEIGHT }}>
            {/* Glossy Overlay */}
            <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-b from-black/80 via-transparent to-black/80" />
            <div className="absolute inset-0 z-20 pointer-events-none bg-[linear-gradient(45deg,transparent_40%,rgba(255,255,255,0.05)_50%,transparent_60%)]" />

            <motion.div animate={controls} className="flex flex-col items-center">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-center w-full relative" style={{ height: SLOT_ITEM_HEIGHT }}>
                        {item.isWinner && (phase === "jackpot" || phase === "resgate") && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1.5 }}
                                className="absolute inset-0 bg-[#f1c40f]/30 blur-xl rounded-full"
                            />
                        )}
                        <span className="text-6xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] z-10">{item.icon}</span>
                    </div>
                ))}
            </motion.div>
        </div>
    );

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-black"
                >
                    {/* GOD RAYS BACKGROUND */}
                    {(phase === "jackpot" || phase === "resgate") && (
                        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-50">
                            <div className="w-[200vmax] h-[200vmax] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(212,175,55,0.2)_15deg,transparent_30deg,rgba(212,175,55,0.2)_45deg,transparent_60deg)] animate-[spin_20s_linear_infinite]" />
                        </div>
                    )}

                    {/* CONFETTI & PARTICLES */}
                    {/* CONFETTI & PARTICLES (Radial Explosion) */}
                    {showConfetti && (
                        <>
                            <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} colors={['#FFD700', '#F1C40F', '#FFFFFF']} gravity={0.2} />
                            {/* Explosion of Coins and Stars */}
                            {[...Array(50)].map((_, i) => {
                                const angle = Math.random() * 360;
                                const distance = 100 + Math.random() * 1500; // Explode far out
                                const x = Math.cos(angle * (Math.PI / 180)) * distance;
                                const y = Math.sin(angle * (Math.PI / 180)) * distance;

                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                                        animate={{ x, y, scale: [0, 1.5, 1], opacity: [1, 1, 0] }}
                                        transition={{ duration: 1.5 + Math.random(), ease: "easeOut", repeat: Infinity, repeatDelay: Math.random() * 2 }}
                                        className="absolute top-1/2 left-1/2 text-4xl z-20 text-[#f1c40f] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]"
                                    >
                                        {Math.random() > 0.6 ? '🪙' : Math.random() > 0.5 ? '✨' : '⭐'}
                                    </motion.div>
                                );
                            })}
                        </>
                    )}

                    <div className="relative z-10 w-full max-w-4xl flex flex-col items-center p-4">

                        {/* HEADER */}
                        <AnimatePresence mode="wait">
                            {phase === "win" && (
                                <motion.div key="win" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }} className="text-center mb-6 md:mb-12">
                                    <motion.h1
                                        animate={{ textShadow: ["0 0 20px #d4af37", "0 0 50px #d4af37", "0 0 20px #d4af37"] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="text-5xl md:text-7xl lg:text-9xl font-serif font-black text-[#d4af37] tracking-tighter mb-4"
                                    >
                                        LEVEL UP!
                                    </motion.h1>
                                    <p className="text-xl md:text-2xl text-[#f1c40f]/60 font-mono tracking-[0.3em] uppercase mb-12">Pilar {completedPillarNumber} Conquistado</p>

                                    <motion.button
                                        onClick={() => setPhase("ready")}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="group relative px-12 py-6 bg-transparent overflow-hidden rounded-full"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37] via-[#f1c40f] to-[#d4af37] opacity-100 group-hover:opacity-90 transition-opacity" />
                                        <div className="absolute inset-0 blur-md bg-[#d4af37] opacity-50" />
                                        <span className="relative z-10 text-black font-black text-2xl uppercase tracking-widest flex items-center gap-4">
                                            <Trophy className="w-8 h-8" /> Reivindicar <Trophy className="w-8 h-8" />
                                        </span>
                                    </motion.button>
                                </motion.div>
                            )}

                            {(phase === "jackpot" || phase === "resgate") && (
                                <motion.div
                                    key="jackpot"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", damping: 20 }}
                                    className="w-full max-w-sm md:max-w-md mx-auto px-2"
                                >
                                    {/* Single Unified Box */}
                                    <div className="bg-gradient-to-b from-[#1c1c1c] to-[#0a0a0a] border-4 border-[#d4af37] rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(212,175,55,0.15)]">

                                        {/* Title Section */}
                                        <div className="bg-gradient-to-b from-[#d4af37]/20 to-transparent pt-6 pb-4 px-4 relative">
                                            {/* Glow Effect */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[200%] bg-[#f1c40f]/20 blur-[60px] pointer-events-none" />

                                            <h1 className="text-3xl md:text-5xl font-black text-center leading-tight relative z-10">
                                                <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#fff] to-[#f1c40f] drop-shadow-[0_0_20px_rgba(241,196,15,0.5)]">NÍVEL</span>
                                                <br />
                                                <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#f1c40f] to-[#b45309] drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]">DOMINADO!</span>
                                            </h1>
                                        </div>

                                        {/* Module Info Section */}
                                        <div className="px-4 pb-4">
                                            <div className="bg-black/50 border border-[#d4af37]/40 rounded-xl p-3 mb-4">
                                                <p className="text-[9px] md:text-[10px] text-[#d4af37]/60 tracking-[0.15em] uppercase text-center mb-2">
                                                    ES ENGLISH ACADEMY
                                                </p>
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="text-xs md:text-sm text-[#d4af37] font-bold tracking-wider uppercase">MÓDULO</span>
                                                    <span className="text-4xl md:text-5xl font-black text-[#f1c40f] drop-shadow-[0_0_10px_rgba(241,196,15,0.5)]">
                                                        {String(completedPillarNumber).padStart(2, '0')}
                                                    </span>
                                                    <span className="text-xs md:text-sm text-[#d4af37] font-bold tracking-wider uppercase">CONCLUÍDO</span>
                                                </div>
                                            </div>

                                            {/* Button */}
                                            {phase === "resgate" && (
                                                <motion.button
                                                    onClick={onComplete}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="w-full py-3 md:py-4 rounded-xl bg-[#d4af37] text-black font-black text-base md:text-lg uppercase tracking-widest"
                                                >
                                                    PRÓXIMO NÍVEL →
                                                </motion.button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* SLOT MACHINE CHASSIS - Hidden during jackpot/resgate */}
                        {["ready", "spinning", "bonus", "answering"].includes(phase) && (
                            <motion.div
                                initial={{ y: 100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1, scale: screenShake ? [1, 1.02, 0.98, 1] : 1 }}
                                transition={{
                                    y: { type: "spring", damping: 15 },
                                    opacity: { duration: 0.5 },
                                    scale: { duration: 0.3, ease: "easeInOut" } // Keyframes (shake) cannot use spring
                                }}
                                className="relative bg-gradient-to-b from-[#1a1a1a] to-black p-4 md:p-8 rounded-[24px] md:rounded-[40px] border-[4px] md:border-[12px] border-[#d4af37] shadow-[0_10px_40px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.8)] w-full max-w-3xl mx-auto"
                            >
                                {/* CHAMFERED GOLD FRAME DECORATIONS */}
                                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50" />
                                <div className="absolute -top-8 md:-top-10 left-1/2 -translate-x-1/2 bg-black border-2 border-[#d4af37] px-4 py-1 md:px-8 md:py-2 rounded-full shadow-[0_0_30px_#d4af37]">
                                    <span className="text-[#d4af37] font-bold tracking-[0.2em] text-[10px] md:text-sm whitespace-nowrap">HIGH STAKES ZONE</span>
                                </div>

                                {/* TRIPLE WINDOW DISPLAY */}
                                <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-[#0a0a0a] rounded-2xl border border-white/5 shadow-inner">
                                    {renderReel(reel1Items, controls1, 0)}
                                    {renderReel(reel2Items, controls2, 0.1)}
                                    {renderReel(reel3Items, controls3, 0.2)}
                                </div>

                                {/* CONTROLS */}
                                <div className="flex justify-center relative z-20">
                                    {phase === "ready" && (
                                        <motion.button onClick={spinReels} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full py-6 rounded-2xl bg-gradient-to-b from-[#f1c40f] to-[#b45309] border-t-2 border-[#ffe066] shadow-[0_10px_0_#92400e,0_20px_20px_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-2 transition-all">
                                            <span className="text-3xl font-black text-black uppercase tracking-widest drop-shadow-sm">GIRAR AGORA</span>
                                        </motion.button>
                                    )}
                                    {phase === "spinning" && <div className="text-[#d4af37] text-2xl font-black animate-pulse tracking-widest">SORTEANDO...</div>}
                                    {phase === "resgate" && (
                                        <motion.button onClick={onComplete} animate={{ boxShadow: ["0 0 20px #d4af37", "0 0 50px #d4af37"] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-full py-6 rounded-2xl bg-[#d4af37] text-black font-black text-2xl uppercase tracking-widest">
                                            PRÓXIMO NÍVEL →
                                        </motion.button>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* BONUS OVERLAY */}
                        {phase === "answering" && (
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-8 rounded-3xl border border-[#d4af37]/30">
                                <h3 className="text-3xl text-[#d4af37] font-bold mb-6 text-center">{bonusQuestion.question}</h3>
                                <div className="w-full grid gap-4">
                                    {bonusQuestion.options.map((opt, i) => (
                                        <button key={i} onClick={() => { if (!bonusAnswered) { setSelectedBonusAnswer(i); setBonusAnswered(true); } }} className={`p-6 text-xl font-bold rounded-xl border-2 transition-all ${bonusAnswered ? (i === bonusQuestion.correct ? 'border-green-500 bg-green-900/30' : 'border-red-500 bg-red-900/30') : 'border-[#d4af37]/30 hover:border-[#d4af37] hover:bg-[#d4af37]/10'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                                {bonusAnswered && <button onClick={() => { setPhase("ready"); setHasHadBonusSpin(true); setLandOnBonus(false); controls1.set({ y: 0 }); controls2.set({ y: 0 }); controls3.set({ y: 0 }); setBonusAnswered(false); }} className="mt-8 px-8 py-4 bg-[#d4af37] text-black font-bold rounded-xl">CONTINUAR</button>}
                            </motion.div>
                        )}

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

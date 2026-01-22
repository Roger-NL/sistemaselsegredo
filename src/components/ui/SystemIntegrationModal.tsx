"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { ShieldCheck, Cpu, Lock, Unlock, AlertTriangle, Terminal, CheckCircle } from "lucide-react";
import { getRank } from "@/utils/ranks";

// ============================================================================
// SYSTEM DECRYPTION INTERFACE - V1
// Theme: Hacker / System Architect / "The Secret"
// ============================================================================

interface SystemIntegrationModalProps {
    completedPillarNumber: number;
    onComplete: () => void;
    isVisible: boolean;
}

const BONUS_CHANCE = 0.3; // 30% chance of "Anomaly" (Bonus)

const BONUS_QUESTIONS = [
    { question: "Decodifique: Past tense of 'go'?", options: ["goed", "went", "gone", "going"], correct: 1 },
    { question: "Complete o algoritmo: 'I ___ been waiting.'", options: ["has", "have", "am", "was"], correct: 1 },
    { question: "Sintaxe correta: 'She ___ work here.'", options: ["doesn't", "don't", "not", "no"], correct: 0 },
];

// Matrix/Cipher text effect helper
const CipherText = ({ text, active }: { text: string; active: boolean }) => {
    const [display, setDisplay] = useState(text);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

    useEffect(() => {
        if (!active) {
            setDisplay(text);
            return;
        }
        let iterations = 0;
        const interval = setInterval(() => {
            setDisplay(
                text
                    .split("")
                    .map((char, index) => {
                        if (index < iterations) return text[index];
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join("")
            );
            if (iterations >= text.length) clearInterval(interval);
            iterations += 1 / 3;
        }, 30);
        return () => clearInterval(interval);
    }, [text, active]);

    return <span className="font-mono">{display}</span>;
};

export function SystemIntegrationModal({ completedPillarNumber, onComplete, isVisible }: SystemIntegrationModalProps) {
    const [status, setStatus] = useState<"idle" | "decrypting" | "success" | "anomaly" | "anomaly_solved">("idle");
    const [progress, setProgress] = useState(0);
    const [log, setLog] = useState<string[]>([]);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const [mounted, setMounted] = useState(false);

    // Bonus Logic
    const [bonusQuestion, setBonusQuestion] = useState(BONUS_QUESTIONS[0]);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isBonus, setIsBonus] = useState(false);

    // Rank Logic
    const newRank = getRank(completedPillarNumber);

    useEffect(() => {
        setMounted(true);
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }, []);

    useEffect(() => {
        if (isVisible) {
            resetSystem();
        }
    }, [isVisible]);

    const addLog = (msg: string) => setLog(prev => [...prev.slice(-4), `> ${msg}`]);

    const resetSystem = () => {
        setStatus("idle");
        setProgress(0);
        setLog(["> SISTEMA PRONTO", "> AGUARDANDO COMANDO..."]);
        setSelectedAnswer(null);
        setIsBonus(Math.random() < BONUS_CHANCE);
        setBonusQuestion(BONUS_QUESTIONS[Math.floor(Math.random() * BONUS_QUESTIONS.length)]);
    };

    const startDecryption = () => {
        setStatus("decrypting");
        let p = 0;
        addLog("INICIANDO PROTOCOLO DE SINCRONIZAÇÃO...");

        const interval = setInterval(() => {
            p += Math.random() * 5;
            if (p > 100) p = 100;
            setProgress(p);

            // Random logs
            if (Math.random() > 0.7) {
                const logs = ["BYPASSING FIREWALL...", "OPTIMIZING NEURAL NET...", "ALLOCATING MEMORY...", "DECRYPTING KEY..."];
                addLog(logs[Math.floor(Math.random() * logs.length)]);
            }

            if (p >= 100) {
                clearInterval(interval);
                if (isBonus) {
                    setTimeout(() => {
                        setStatus("anomaly");
                        addLog("ALERTA: ANOMALIA DETECTADA");
                        addLog("INTERVENÇÃO MANUAL NECESSÁRIA");
                    }, 500);
                } else {
                    setTimeout(() => {
                        setStatus("success");
                        addLog("SUCESSO: MÓDULO INTEGRADO");
                    }, 500);
                }
            }
        }, 100);
    };

    const handleAnswer = (idx: number) => {
        setSelectedAnswer(idx);
        if (idx === bonusQuestion.correct) {
            setTimeout(() => {
                setStatus("anomaly_solved");
                addLog("ANOMALIA CORRIGIDA. DADOS RECUPERADOS.");
            }, 1000);
        } else {
            // Wrong answer logic - for now we just proceed to success but maybe with a warning?
            // Or we let them try again? Let's just proceed to success to not block them, but 'glitched'.
            setTimeout(() => {
                setStatus("success"); // Fallback to normal success
                addLog("BYPASS DE EMERGÊNCIA ATIVADO.");
            }, 1000);
        }
    };

    if (!mounted || !isVisible) return null;

    // Portal target (document.body)
    if (typeof document === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 font-mono"
            >
                {/* Background Grid */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(212,175,55,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

                {/* Main Container */}
                <motion.div
                    layout
                    className="relative z-10 w-full max-w-2xl bg-[#0a0a0a] border border-[#d4af37]/30 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.1)]"
                >
                    {/* Header Bar */}
                    <div className="h-12 bg-[#111] border-b border-[#d4af37]/20 flex items-center justify-between px-4">
                        <div className="flex items-center gap-2 text-[#d4af37]/60 text-xs font-mono">
                            <Terminal size={14} />
                            <span>SYSTEM_V1.0.4</span>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/20" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                            <div className="w-3 h-3 rounded-full bg-green-500/20" />
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-8 md:p-12 flex flex-col items-center justify-center min-h-[400px]">

                        {/* IDLE STATE */}
                        {status === "idle" && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center space-y-8"
                            >
                                <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 border-2 border-dashed border-[#d4af37]/30 rounded-full"
                                    />
                                    <Lock className="w-12 h-12 text-[#d4af37]" />
                                </div>

                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                        MÓDULO {completedPillarNumber} CONCLUÍDO
                                    </h2>
                                    <p className="text-[#d4af37]/60 font-mono text-sm">
                                        INICIAR SINCRONIZAÇÃO DE DADOS?
                                    </p>
                                </div>

                                <button
                                    onClick={startDecryption}
                                    className="group relative px-8 py-4 bg-[#d4af37] text-black font-bold tracking-widest hover:bg-[#f1c40f] transition-colors rounded-sm overflow-hidden"
                                >
                                    <span className="relative z-10">PROCESSAR</span>
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                                </button>
                            </motion.div>
                        )}

                        {/* DECRYPTING STATE */}
                        {status === "decrypting" && (
                            <div className="w-full max-w-md space-y-6">
                                <div className="flex justify-between text-[#d4af37] font-mono text-sm mb-1">
                                    <span>PROCESSANDO...</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-[#d4af37]"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>

                                <div className="bg-black/50 p-4 rounded border border-[#d4af37]/10 font-mono text-xs text-green-500/80 h-32 overflow-hidden flex flex-col justify-end">
                                    {log.map((l, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                            {l}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ANOMALY (BONUS) STATE */}
                        {status === "anomaly" && (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-full max-w-md text-center space-y-6"
                            >
                                <div className="flex justify-center mb-4">
                                    <AlertTriangle className="w-16 h-16 text-red-500 animate-pulse" />
                                </div>
                                <h3 className="text-xl font-bold text-red-500 tracking-widest">ANOMALIA DE SEGURANÇA</h3>
                                <p className="text-gray-400 text-sm">Responda para estabilizar o sistema:</p>

                                <div className="bg-[#1a1a1a] p-6 rounded border border-red-500/30 mb-4">
                                    <p className="text-lg text-white font-mono mb-6">{bonusQuestion.question}</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {bonusQuestion.options.map((opt, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleAnswer(i)}
                                                className="p-3 border border-white/10 hover:border-red-500 hover:bg-red-500/10 text-sm font-mono transition-all rounded"
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* SUCCESS / SOLVED STATE */}
                        {(status === "success" || status === "anomaly_solved") && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center space-y-8"
                            >
                                <Confetti
                                    width={windowSize.width}
                                    height={windowSize.height}
                                    recycle={false}
                                    numberOfPieces={200}
                                    colors={['#d4af37', '#ffffff']}
                                />

                                <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring" }}
                                        className="absolute inset-0 bg-[#d4af37]/10 rounded-full blur-xl"
                                    />
                                    <CheckCircle className="w-20 h-20 text-[#d4af37]" />
                                </div>

                                <div>
                                    <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">
                                        <CipherText text="MÓDULO INTEGRADO" active={true} />
                                    </h2>
                                    <div className="flex flex-col items-center gap-2">
                                        <p className="text-[#d4af37] font-mono tracking-[0.3em] uppercase">
                                            {status === "anomaly_solved" ? "BÔNUS DE RECUPERAÇÃO ATIVO" : "SISTEMA ATUALIZADO"}
                                        </p>

                                        {/* Rank Promotion Badge */}
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                            className="mt-4 px-6 py-2 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-full"
                                        >
                                            <span className="text-zinc-400 text-xs uppercase tracking-widest mr-2">PROMOÇÃO:</span>
                                            <span className="text-[#d4af37] font-bold uppercase tracking-wider">{newRank}</span>
                                        </motion.div>
                                    </div>
                                </div>

                                <button
                                    onClick={onComplete}
                                    className="px-12 py-4 border border-[#d4af37] text-[#d4af37] font-bold hover:bg-[#d4af37] hover:text-black transition-all rounded-sm uppercase tracking-widest"
                                >
                                    Continuar
                                </button>
                            </motion.div>
                        )}

                    </div>

                    {/* Footer Status */}
                    <div className="h-8 bg-[#111] border-t border-[#d4af37]/20 flex items-center justify-between px-4 text-[10px] text-gray-500 font-mono">
                        <span>MEM: 64TB OK</span>
                        <span>ENC: AES-256</span>
                        <span className={status === "anomaly" ? "text-red-500 animate-pulse" : "text-green-500"}>
                            STATUS: {status.toUpperCase()}
                        </span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}

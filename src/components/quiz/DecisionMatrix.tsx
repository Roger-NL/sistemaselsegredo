"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PLANETS, type Planet } from "@/data/curriculum";
import { ChevronRight, Terminal, Cpu, ShieldCheck, AlertTriangle, CheckCircle } from "lucide-react";

// ============================================================================
// DECISION MATRIX - SYSTEM PROTOCOL EDITION
// Tela de escolha final (Pilar 9) ou "Chapéu Seletor"
// ============================================================================

interface DecisionMatrixProps {
    onSelect: (planetId: string) => void;
}

// Helper para texto criptografado
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

export function DecisionMatrix({ onSelect }: DecisionMatrixProps) {
    const [mode, setMode] = useState<"initial" | "quiz" | "analyzing" | "result" | "revelation">("initial");
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [analyzingProgress, setAnalyzingProgress] = useState(0);
    const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(null);
    const [selectionMethod, setSelectionMethod] = useState<"manual" | "auto">("manual");
    const [log, setLog] = useState<string[]>([]);

    // Perguntas fake para o "Chapéu Seletor"
    const questions = [
        "Qual seu objetivo mais urgente?",
        "Quanto tempo você tem por dia?",
        "Você se sente travado ao falar?",
        "Prefere aprender lendo ou ouvindo?",
        "Precisa usar inglês no trabalho hoje?",
        "Qual seu maior sonho com inglês?",
    ];

    // Opções genéricas (apenas visual)
    const options = ["Opção A", "Opção B", "Opção C"];

    const addLog = (msg: string) => setLog(prev => [...prev.slice(-4), `> ${msg}`]);

    const handleHelpMe = () => {
        setMode("quiz");
        addLog("INICIANDO PROTOCOLO DE DIAGNÓSTICO...");
    };

    const handleAnswer = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            startAnalysis();
        }
    };

    const startAnalysis = () => {
        setMode("analyzing");
        let progress = 0;
        addLog("PROCESSANDO DADOS BIOMÉTRICOS...");

        const interval = setInterval(() => {
            progress += 2;
            setAnalyzingProgress(progress);

            if (Math.random() > 0.8) {
                const logs = ["CALIBRANDO ALGORITMO...", "VERIFICANDO COMPATIBILIDADE...", "OTIMIZANDO ROTAS..."];
                addLog(logs[Math.floor(Math.random() * logs.length)]);
            }

            if (progress >= 100) {
                clearInterval(interval);
                setMode("result");
            }
        }, 50);
    };

    // Seleção via "Matrix" (Random MVP)
    const handleMatrixResult = () => {
        const randomPlanet = PLANETS[Math.floor(Math.random() * PLANETS.length)];
        setSelectedPlanetId(randomPlanet.id);
        setSelectionMethod("auto");
        setMode("revelation");
    };

    // Seleção Manual
    const handleManualSelect = (planetId: string) => {
        setSelectedPlanetId(planetId);
        setSelectionMethod("manual");
        setMode("revelation");
    };

    // --------------------------------------------------------------------------
    // RENDER: INITIAL (Escolha Manual ou Ajuda)
    // --------------------------------------------------------------------------
    if (mode === "initial") {
        return (
            <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 overflow-y-auto">
                {/* Background Grid */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(212,175,55,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

                <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-center mb-8 md:mb-12"
                    >
                        <div className="inline-flex items-center gap-2 text-[#d4af37] border border-[#d4af37]/30 px-3 py-1 rounded-full text-xs font-mono mb-4">
                            <Terminal size={12} />
                            <span>SYSTEM_ACCESS_GRANTED</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-4 uppercase tracking-tighter">
                            <CipherText text="DESTINO FINAL" active={true} />
                        </h2>
                        <p className="text-[#d4af37]/60 max-w-xl mx-auto text-sm md:text-base font-mono">
                            Base de dados completa. Selecione o protocolo de especialização para continuar a evolução.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
                        {PLANETS.map((planet, idx) => (
                            <motion.div
                                key={planet.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ scale: 1.02, borderColor: planet.color }}
                                className="relative bg-[#0a0a0a] border border-[#d4af37]/20 rounded-xl p-6 cursor-pointer flex flex-col items-center gap-6 group overflow-hidden"
                                onClick={() => handleManualSelect(planet.id)}
                            >
                                {/* Hover Glow */}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#d4af37]/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div
                                    className="relative w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-2xl z-10 group-hover:scale-110 transition-transform duration-500"
                                    style={{
                                        background: `linear-gradient(135deg, ${planet.color}20, ${planet.color}10)`,
                                        border: `1px solid ${planet.color}40`,
                                        boxShadow: `0 0 30px ${planet.color}20`
                                    }}
                                >
                                    {planet.icon}
                                </div>

                                <div className="text-center z-10">
                                    <h3 className="text-xl font-bold text-white group-hover:text-[#d4af37] transition-colors mb-2">{planet.title}</h3>
                                    <div className="h-px w-12 bg-[#d4af37]/30 mx-auto mb-2" />
                                    <p className="text-[10px] text-[#d4af37]/60 uppercase tracking-widest font-mono">
                                        Protocolo Manual
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="relative w-full max-w-md mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#d4af37]/20"></div>
                        </div>
                        <div className="relative flex justify-center text-xs font-mono">
                            <span className="px-4 bg-black text-[#d4af37]/60">OU</span>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleHelpMe}
                        className="group relative px-8 py-4 bg-transparent overflow-hidden rounded border border-[#d4af37]/50 hover:border-[#d4af37] transition-colors"
                    >
                        <div className="absolute inset-0 bg-[#d4af37]/10 group-hover:bg-[#d4af37]/20 transition-colors" />
                        <span className="relative z-10 text-[#d4af37] font-bold text-sm md:text-base uppercase tracking-widest flex items-center gap-3">
                            <Cpu size={18} />
                            Iniciar Diagnóstico por IA
                        </span>
                    </motion.button>
                </div>
            </div>
        );
    }

    // --------------------------------------------------------------------------
    // RENDER: QUIZ (Diagnóstico)
    // --------------------------------------------------------------------------
    if (mode === "quiz") {
        return (
            <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6">
                {/* Background Grid */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(212,175,55,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

                <div className="w-full max-w-2xl relative z-10">
                    {/* Header Terminal Style */}
                    <div className="flex items-center justify-between mb-8 border-b border-[#d4af37]/20 pb-4">
                        <div className="flex items-center gap-2 text-[#d4af37] font-mono text-xs">
                            <Terminal size={14} />
                            <span>DIAGNOSTIC_PROTOCOL_V2.0</span>
                        </div>
                        <div className="text-[#d4af37]/60 font-mono text-xs">
                            STEP {currentQuestion + 1}/{questions.length}
                        </div>
                    </div>

                    {/* Barra de progresso */}
                    <div className="w-full h-1 bg-[#1a1a1a] rounded-full mb-12 overflow-hidden">
                        <motion.div
                            className="h-full bg-[#d4af37]"
                            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        />
                    </div>

                    <motion.h2
                        key={currentQuestion}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-2xl md:text-3xl font-bold text-white mb-12 font-mono leading-tight"
                    >
                        {questions[currentQuestion]}
                        <span className="animate-pulse text-[#d4af37]">_</span>
                    </motion.h2>

                    <div className="grid gap-4">
                        {options.map((opt, i) => (
                            <motion.button
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={handleAnswer}
                                className="w-full p-5 bg-[#0a0a0a] border border-[#d4af37]/20 hover:border-[#d4af37] hover:bg-[#d4af37]/10 text-left rounded transition-all flex items-center justify-between group"
                            >
                                <span className="text-zinc-400 group-hover:text-[#d4af37] font-mono text-sm before:content-['>_'] before:mr-2 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity">
                                    {opt}
                                </span>
                                <ChevronRight className="text-[#d4af37]/40 group-hover:text-[#d4af37] transition-colors" size={16} />
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // --------------------------------------------------------------------------
    // RENDER: ANALYZING (Matrix Effect)
    // --------------------------------------------------------------------------
    if (mode === "analyzing") {
        return (
            <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center font-mono p-6">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-[#d4af37] text-4xl md:text-6xl mb-8 font-black tracking-tighter text-center">
                        <CipherText text="PROCESSANDO" active={true} />
                    </div>

                    <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#d4af37]/20">
                        <motion.div
                            className="h-full bg-[#d4af37]"
                            style={{ width: `${analyzingProgress}%` }}
                        />
                    </div>

                    <div className="flex justify-between text-[#d4af37]/60 text-xs">
                        <span>CPU: {(analyzingProgress * 0.8).toFixed(1)}%</span>
                        <span>RAM: {(analyzingProgress * 1.2).toFixed(1)}GB</span>
                    </div>

                    <div className="bg-black/50 p-4 rounded border border-[#d4af37]/10 text-xs text-green-500/80 h-32 overflow-hidden flex flex-col justify-end font-mono">
                        {log.map((l, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                {l}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // --------------------------------------------------------------------------
    // RENDER: RESULT (Trigger para auto-seleção)
    // --------------------------------------------------------------------------
    if (mode === "result") {
        // Auto-executa o resultado após renderizar
        setTimeout(handleMatrixResult, 100);
        return null;
    }

    // --------------------------------------------------------------------------
    // RENDER: REVELATION (A Grande Revelação)
    // --------------------------------------------------------------------------
    if (mode === "revelation" && selectedPlanetId) {
        const planet = PLANETS.find(p => p.id === selectedPlanetId)!;

        return (
            <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 text-center">
                {/* Background Grid */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(212,175,55,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 1.5 }}
                    className="relative z-10 w-full max-w-2xl bg-[#0a0a0a] border border-[#d4af37] rounded-2xl p-8 md:p-12 shadow-[0_0_100px_rgba(212,175,55,0.1)]"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border border-[#d4af37] px-6 py-2 rounded-full">
                        <span className="text-[#d4af37] font-bold tracking-[0.2em] text-xs uppercase">
                            {selectionMethod === 'manual' ? "CONFIRMAÇÃO MANUAL" : "RESULTADO DA ANÁLISE"}
                        </span>
                    </div>

                    <div className="mb-8 flex justify-center">
                        <div
                            className="w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center text-6xl shadow-2xl animate-pulse"
                            style={{
                                background: `linear-gradient(135deg, ${planet.color}20, ${planet.color}10)`,
                                border: `2px solid ${planet.color}`,
                                boxShadow: `0 0 50px ${planet.color}30`
                            }}
                        >
                            {planet.icon}
                        </div>
                    </div>

                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter"
                    >
                        {planet.title}
                    </motion.h2>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-lg text-[#d4af37]/80 font-mono mb-12"
                    >
                        {selectionMethod === 'manual'
                            ? "Protocolo manual aceito. Iniciando sequência de especialização."
                            : "Algoritmo identificou compatibilidade de 99.9% com este perfil."
                        }
                    </motion.p>

                    <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        onClick={() => onSelect(selectedPlanetId)}
                        className="w-full py-5 bg-[#d4af37] text-black font-black text-lg uppercase tracking-widest rounded hover:bg-[#f1c40f] transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                    >
                        INICIAR MISSÃO
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return null;
}

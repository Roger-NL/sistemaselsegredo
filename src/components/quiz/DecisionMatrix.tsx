"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PLANETS, type Planet } from "@/data/curriculum";
import { ChevronRight } from "lucide-react";

// ============================================================================
// DECISION MATRIX
// Tela de escolha final (Pilar 9) ou "Chapéu Seletor"
// ============================================================================

interface DecisionMatrixProps {
    onSelect: (planetId: string) => void;
}

export function DecisionMatrix({ onSelect }: DecisionMatrixProps) {
    const [mode, setMode] = useState<"initial" | "quiz" | "analyzing" | "result" | "revelation">("initial");
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [analyzingProgress, setAnalyzingProgress] = useState(0);
    const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(null);
    const [selectionMethod, setSelectionMethod] = useState<"manual" | "auto">("manual");

    // Perguntas fake para o "Chapéu Seletor"
    const questions = [
        "Qual seu objetivo mais urgente?",
        "Quanto tempo você tem por dia?",
        "Você se sente travado ao falar?",
        "Prefere aprender lendo ou ouvindo?",
        "Precisa usar inglês no trabalho hoje?",
        "Qual seu maior sonho com inglês?",
    ];

    // Opções genéricas (apenas görsel)
    const options = ["Opção A", "Opção B", "Opção C"];

    const handleHelpMe = () => {
        setMode("quiz");
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
        // Simula análise (3s)
        let progress = 0;
        const interval = setInterval(() => {
            progress += 2;
            setAnalyzingProgress(progress);
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
        if (confirm(`Confirmar destino para: ${PLANETS.find(p => p.id === planetId)?.title}?`)) {
            setSelectedPlanetId(planetId);
            setSelectionMethod("manual");
            setMode("revelation");
        }
    };

    // --------------------------------------------------------------------------
    // RENDER: INITIAL (Escolha Manual ou Ajuda)
    // --------------------------------------------------------------------------
    if (mode === "initial") {
        return (
            <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                <motion.h2
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-4xl md:text-5xl font-black text-amber-500 mb-4 uppercase tracking-tighter"
                >
                    Destino Final
                </motion.h2>
                <p className="text-zinc-400 mb-12 max-w-xl text-lg">
                    Você completou a base. Agora, deve escolher sua especialização para continuar a jornada.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-12">
                    {PLANETS.map((planet) => (
                        <motion.div
                            key={planet.id}
                            whileHover={{ scale: 1.05, borderColor: planet.color }}
                            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 cursor-pointer flex flex-col items-center gap-4 transition-colors group"
                            onClick={() => handleManualSelect(planet.id)}
                            style={{ boxShadow: `0 0 20px ${planet.color}10` }}
                        >
                            <div
                                className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-2xl mb-2"
                                style={{
                                    background: `linear-gradient(135deg, ${planet.color}40, ${planet.color})`,
                                    boxShadow: `0 0 30px ${planet.color}40`
                                }}
                            >
                                {planet.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">{planet.title}</h3>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Selecionar Manualmente</p>
                        </motion.div>
                    ))}
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-800"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-black text-zinc-500">OU</span>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleHelpMe}
                    className="mt-8 px-8 py-4 bg-white text-black font-black text-lg uppercase tracking-widest rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] transition-shadow"
                >
                    Não sei qual escolher. Me ajude! 🧙‍♂️
                </motion.button>
            </div>
        );
    }

    // --------------------------------------------------------------------------
    // RENDER: QUIZ (Diagnóstico)
    // --------------------------------------------------------------------------
    if (mode === "quiz") {
        return (
            <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 text-center">
                <div className="w-full max-w-2xl">
                    <div className="mb-8 flex justify-between text-xs text-zinc-500 uppercase tracking-widest">
                        <span>Diagnóstico de Perfil</span>
                        <span>{currentQuestion + 1} / {questions.length}</span>
                    </div>

                    {/* Barra de progresso */}
                    <div className="w-full h-1 bg-zinc-800 rounded-full mb-12">
                        <motion.div
                            className="h-full bg-amber-500 rounded-full"
                            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        />
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-12">{questions[currentQuestion]}</h2>

                    <div className="grid gap-4">
                        {options.map((opt, i) => (
                            <button
                                key={i}
                                onClick={handleAnswer}
                                className="w-full p-4 bg-zinc-900 border border-zinc-800 hover:border-amber-500 hover:bg-zinc-800 text-left rounded-xl transition-all flex items-center justify-between group"
                            >
                                <span className="text-zinc-300 group-hover:text-white">{opt}</span>
                                <ChevronRight className="text-zinc-600 group-hover:text-amber-500" />
                            </button>
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
            <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center font-mono">
                <div className="text-emerald-500 text-6xl mb-8 animate-pulse font-black tracking-tighter">
                    ANALISANDO DADOS...
                </div>
                <div className="w-64 h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${analyzingProgress}%` }}
                    />
                </div>
                <div className="mt-4 text-emerald-900 text-xs">
                    {analyzingProgress}% COMPLETE
                </div>
                {/* Matrix background effect (simulado visualmente com texto random) */}
                <div className="absolute inset-0 pointer-events-none opacity-10 flex flex-wrap overflow-hidden text-[10px] text-emerald-500 leading-none z-[-1]">
                    {Array(500).fill(0).map((_, i) => (
                        <span key={i} style={{ opacity: Math.random() }}>{Math.random() > 0.5 ? '1' : '0'}</span>
                    ))}
                </div>
            </div>
        );
    }

    // --------------------------------------------------------------------------
    // RENDER: RESULT (Resultado Final)
    // --------------------------------------------------------------------------
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
            <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 1.5 }}
                    className="relative mb-8"
                >
                    <div
                        className="w-40 h-40 md:w-56 md:h-56 rounded-full flex items-center justify-center text-7xl shadow-[0_0_100px_currentColor]"
                        style={{
                            background: `linear-gradient(135deg, ${planet.color}, ${planet.color}50)`,
                            color: planet.color,
                            border: `4px solid ${planet.color}`
                        }}
                    >
                        <span className="drop-shadow-2xl grayscale-0">{planet.icon}</span>
                    </div>
                </motion.div>

                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-4xl md:text-6xl font-black text-white mb-4 uppercase tracking-tighter"
                >
                    {selectionMethod === 'manual' ? "SUPER ESCOLHA!" : "RESULTADO DEFINITIVO"}
                </motion.h2>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-xl md:text-2xl text-zinc-300 max-w-2xl mb-12"
                >
                    {selectionMethod === 'manual'
                        ? `Você assumiu o comando do seu futuro. O destino ${planet.title} é perfeito para sua jornada.`
                        : `Nossos algoritmos analisaram seu perfil. O melhor caminho para sua evolução é: ${planet.title}.`
                    }
                </motion.p>

                <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    onClick={() => onSelect(selectedPlanetId)}
                    className="px-12 py-6 bg-[#d4af37] text-black font-black text-xl md:text-2xl uppercase tracking-widest rounded-full shadow-[0_0_50px_rgba(212,175,55,0.5)] hover:bg-[#f1c40f] hover:scale-105 transition-all text-bevel"
                >
                    INICIAR ESPECIALIZAÇÃO 🚀
                </motion.button>
            </div>
        );
    }

    return null;
}

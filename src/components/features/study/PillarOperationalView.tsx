"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertCircle, CheckCircle2, Lightbulb, Target, Zap, Play,
    Table as TableIcon, MessageSquare, Terminal, Cpu, HelpCircle,
    Eye, ChevronDown, Lock, Unlock, ArrowRight, Brain, Crosshair, Volume2
} from "lucide-react";
import { ContentBlock, PillarData, PillarModule } from "@/types/study";
import { cn } from "@/lib/utils";
import { TranslatablePhrase } from "@/components/ui/TranslatablePhrase";

interface PillarOperationalViewProps {
    data: PillarData;
}

// ============================================================================
// TRANSLATION PARSER - Detects {{english|portuguese}} syntax
// ============================================================================

/**
 * Parses text containing {{english|portuguese}} markers and returns
 * React elements with TranslatablePhrase components.
 */
const parseTranslatable = (text: string): React.ReactNode => {
    // Regex to match {{english|portuguese}} pattern
    const regex = /\{\{([^|]+)\|([^}]+)\}\}/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        // Add TranslatablePhrase component
        const [, english, portuguese] = match;
        parts.push(
            <TranslatablePhrase
                key={`trans-${match.index}`}
                english={english}
                portuguese={portuguese}
            />
        );

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last match
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    // If no matches found, return original text
    if (parts.length === 0) {
        return text;
    }

    return <>{parts}</>;
};

/**
 * Parses text with both **bold** markers and {{en|pt}} translation markers
 */
const parseTextWithTranslations = (text: string): React.ReactNode => {
    // First, split by bold markers
    const boldParts = text.split(/(\*\*.*?\*\*)/);

    return boldParts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            // Bold text - also parse for translations inside
            const innerText = part.slice(2, -2);
            return (
                <strong key={i} className="text-slate-200 font-bold">
                    {parseTranslatable(innerText)}
                </strong>
            );
        }
        // Regular text - parse for translations
        return <React.Fragment key={i}>{parseTranslatable(part)}</React.Fragment>;
    });
};
// ============================================================================
// DARK MODE BLOCK RENDERER
// ============================================================================

const BoxIcon = ({ type }: { type: string }) => {
    switch (type) {
        case "box-goal": return <Target className="w-5 h-5 text-emerald-400" />;
        case "box-insight": return <Lightbulb className="w-5 h-5 text-cyan-400" />;
        case "box-warning": return <AlertCircle className="w-5 h-5 text-amber-400" />;
        case "box-action": return <Zap className="w-5 h-5 text-violet-400" />;
        case "pillar-end": return <CheckCircle2 className="w-8 h-8 text-emerald-400" />;
        default: return null;
    }
};

const BoxStyles = {
    "box-goal": "bg-emerald-950/30 border-emerald-500/30 text-emerald-100",
    "box-insight": "bg-cyan-950/30 border-cyan-500/30 text-cyan-100",
    "box-warning": "bg-amber-950/30 border-amber-500/30 text-amber-100",
    "box-action": "bg-violet-950/30 border-violet-500/30 text-violet-100",
    "pillar-end": "bg-emerald-950/20 border-emerald-500/50 text-emerald-50 text-center py-6 md:py-10",
};

const InteractiveQuiz = ({ question, options, answer }: { question: string, options: string[], answer: number }) => {
    const [selected, setSelected] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);

    const handleSelect = (idx: number) => {
        setSelected(idx);
        setShowResult(true);
    };

    return (
        <div className="my-6 bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 md:p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <h4 className="font-bold text-slate-200 font-mono text-xs md:text-sm tracking-wider">TACTICAL QUIZ</h4>
            </div>
            <p className="text-base md:text-lg text-slate-300 mb-6 leading-relaxed">{parseTextWithTranslations(question)}</p>
            <div className="grid gap-3">
                {options.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        disabled={showResult}
                        className={cn(
                            "w-full text-left px-4 py-3 md:py-4 rounded border transition-all duration-200 flex justify-between items-center text-sm md:text-base",
                            showResult && idx === answer
                                ? "bg-emerald-900/40 border-emerald-500/50 text-emerald-100"
                                : showResult && idx === selected && idx !== answer
                                    ? "bg-red-900/40 border-red-500/50 text-red-100"
                                    : "bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-400"
                        )}
                    >
                        <span className="flex-1 mr-2">{parseTextWithTranslations(opt)}</span>
                        {showResult && idx === answer && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                        {showResult && idx === selected && idx !== answer && <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
                    </button>
                ))}
            </div>
        </div>
    );
};

const RevealBox = ({ title, children }: { title: string, children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="my-6 border border-dashed border-slate-700 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-slate-900/50 hover:bg-slate-800/50 transition-colors text-left"
            >
                <span className="font-semibold text-slate-300 flex items-center gap-2 font-mono text-xs md:text-sm">
                    <Eye className="w-4 h-4 text-cyan-500" />
                    {parseTextWithTranslations(title)}
                </span>
                <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", isOpen && "rotate-180")} />
            </button>
            {isOpen && (
                <div className="p-4 md:p-6 bg-slate-950/50 border-t border-slate-800 animate-in fade-in slide-in-from-top-2 text-slate-300 text-sm md:text-base">
                    {children}
                </div>
            )}
        </div>
    )
}

// ============================================================================
// NEW INTERACTIVE COMPONENTS FOR PILAR 1
// ============================================================================

const BrainDiagram = ({ data }: { data: { title: string; steps: string[] } }) => {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <div className="my-8 bg-gradient-to-br from-slate-900 via-slate-950 to-black rounded-xl border border-cyan-500/20 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-slate-900/80 px-4 py-3 md:px-6 md:py-4 border-b border-cyan-500/20 flex items-center gap-3">
                <Brain className="w-5 h-5 md:w-6 md:h-6 text-cyan-400 animate-pulse" />
                <h3 className="font-bold text-cyan-400 font-mono text-sm md:text-base tracking-wider">{parseTextWithTranslations(data.title)}</h3>
            </div>

            {/* Diagram Area */}
            <div className="p-4 md:p-8 relative">
                {/* Animated Brain Visual - Kept Identical */}
                <div className="flex flex-col md:flex-row items-center justify-center mb-8 gap-6 md:gap-0">
                    <div className="relative">
                        <div className="w-24 h-24 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border-2 border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.3)] animate-pulse">
                            <Brain className="w-12 h-12 md:w-20 md:h-20 text-cyan-400" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-red-500/50 rounded-full animate-ping" />
                        <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                            ⚡
                        </div>
                    </div>
                    <div className="hidden md:flex items-center mx-6">
                        <div className="w-16 h-0.5 bg-gradient-to-r from-red-500 to-yellow-500 animate-pulse" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500 animate-ping" />
                        <div className="w-16 h-0.5 bg-gradient-to-r from-yellow-500 to-emerald-500" />
                    </div>
                    <div className="relative mt-4 md:mt-0">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center justify-center">
                            <span className="text-2xl md:text-3xl">🔒</span>
                        </div>
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] md:text-xs text-slate-500 font-mono whitespace-nowrap">CÓRTEX BLOQUEADO</span>
                    </div>
                </div>

                {/* Steps Navigation */}
                <div className="space-y-3">
                    {data.steps.map((step, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveStep(idx)}
                            className={cn(
                                "w-full text-left p-3 md:p-4 rounded-lg border transition-all duration-300 flex gap-3 md:gap-4 items-start",
                                activeStep === idx
                                    ? "bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                                    : "bg-slate-900/50 border-slate-700 hover:border-slate-500"
                            )}
                        >
                            <div className={cn(
                                "w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-mono text-xs md:text-sm font-bold flex-shrink-0 mt-0.5",
                                activeStep === idx ? "bg-cyan-500 text-slate-900" : "bg-slate-700 text-slate-400"
                            )}>
                                {idx + 1}
                            </div>
                            <p className={cn(
                                "text-sm leading-relaxed",
                                activeStep === idx ? "text-slate-200" : "text-slate-500"
                            )}>
                                {parseTextWithTranslations(step)}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ComparisonTable = ({ data }: { data: { headers: string[]; rows: string[][] } }) => {
    return (
        <div className="my-8 rounded-xl border border-slate-700/50 overflow-hidden bg-slate-900/30 backdrop-blur">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 md:px-6 md:py-4 border-b border-slate-700/50 flex items-center gap-3">
                <TableIcon className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-slate-200 font-mono text-xs md:text-sm tracking-wider">ANÁLISE COMPARATIVA</span>
            </div>
            <div className="overflow-x-auto pb-2">
                <table className="w-full min-w-[600px]">
                    <thead>
                        <tr className="bg-slate-800/50">
                            {data.headers.map((header, i) => (
                                <th key={i} className="px-4 py-3 md:px-6 md:py-4 text-left text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-700 whitespace-nowrap">
                                    {parseTextWithTranslations(header)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {data.rows.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-800/30 transition-colors group">
                                {row.map((cell, j) => (
                                    <td key={j} className={cn(
                                        "px-4 py-3 md:px-6 md:py-4 text-xs md:text-sm",
                                        j === 0 ? "font-semibold text-slate-200 whitespace-nowrap" : "text-slate-400 group-hover:text-slate-300 min-w-[150px]"
                                    )}>
                                        {parseTextWithTranslations(cell)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ScenarioCard = ({ data }: { data: { context: string; situation: string; wrong: { action: string; result: string }; right: { action: string; result: string } } }) => {
    const [showSolution, setShowSolution] = useState(false);

    return (
        <div className="my-8 rounded-xl border border-amber-500/30 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-black shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-900/40 to-orange-900/30 px-4 py-3 md:px-6 md:py-4 border-b border-amber-500/30 flex items-center gap-3">
                <Crosshair className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-amber-400 font-mono text-xs md:text-sm tracking-wider">⚔️ CENÁRIO DE COMBATE</span>
                <span className="ml-auto text-[10px] md:text-xs bg-red-500/20 text-red-400 px-2 py-0.5 md:px-3 md:py-1 rounded-full font-mono">STRESS: HIGH</span>
            </div>

            {/* Context */}
            <div className="p-4 md:p-6 border-b border-slate-800">
                <h4 className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">📍 CONTEXTO</h4>
                <p className="text-sm md:text-base text-slate-300 leading-relaxed">{parseTextWithTranslations(data.context)}</p>
            </div>

            {/* Situation */}
            <div className="p-4 md:p-6 bg-slate-900/50 border-b border-slate-800">
                <h4 className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">🎯 SITUAÇÃO</h4>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 font-mono text-cyan-300 text-sm md:text-base">
                    "{parseTextWithTranslations(data.situation)}"
                </div>
            </div>

            {/* Toggle Button */}
            <div className="p-4 md:p-6">
                <button
                    onClick={() => setShowSolution(!showSolution)}
                    className={cn(
                        "w-full py-3 md:py-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base",
                        showSolution
                            ? "bg-slate-800 text-slate-400 border border-slate-700"
                            : "bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)]"
                    )}
                >
                    {showSolution ? "OCULTAR ANÁLISE" : "REVELAR ANÁLISE TÁTICA"}
                    <ChevronDown className={cn("w-5 h-5 transition-transform", showSolution && "rotate-180")} />
                </button>

                <AnimatePresence>
                    {showSolution && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                {/* Wrong Approach */}
                                <div className="bg-red-950/20 border border-red-500/30 rounded-lg p-4 md:p-5">
                                    <h5 className="font-bold text-red-400 text-xs md:text-sm mb-3 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        ❌ O TRAVAMENTO
                                    </h5>
                                    <p className="text-slate-400 text-sm mb-3 leading-relaxed">{parseTextWithTranslations(data.wrong.action)}</p>
                                    <div className="bg-red-900/20 p-3 rounded text-red-300 text-xs md:text-sm font-mono leading-relaxed">
                                        → {parseTextWithTranslations(data.wrong.result)}
                                    </div>
                                </div>

                                {/* Right Approach */}
                                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-4 md:p-5">
                                    <h5 className="font-bold text-emerald-400 text-xs md:text-sm mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        ✅ RESPOSTA DE ELITE
                                    </h5>
                                    <p className="text-slate-400 text-sm mb-3 leading-relaxed">{parseTextWithTranslations(data.right.action)}</p>
                                    <div className="bg-emerald-900/20 p-3 rounded text-emerald-300 text-xs md:text-sm font-mono leading-relaxed">
                                        → {parseTextWithTranslations(data.right.result)}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const PhoneticBreakdown = ({ data }: { data: { formal: { text: string; analysis: string }; combat: { text: string; analysis: string }; explanation: string } }) => {
    return (
        <div className="my-8 rounded-xl border border-violet-500/30 overflow-hidden bg-gradient-to-br from-slate-900 to-violet-950/20">
            <div className="bg-gradient-to-r from-violet-900/40 to-purple-900/30 px-4 py-3 md:px-6 md:py-4 border-b border-violet-500/30 flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-violet-400" />
                <span className="font-bold text-violet-400 font-mono text-xs md:text-sm tracking-wider">🛠️ ENGENHARIA REVERSA</span>
            </div>

            <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                    {/* Formal */}
                    <div className="bg-slate-800/30 rounded-lg p-4 md:p-5 border border-slate-700">
                        <h4 className="text-[10px] md:text-xs font-bold text-red-400 uppercase tracking-wider mb-3">📚 FORMA DE LIVRO</h4>
                        <div className="bg-slate-900/50 p-3 md:p-4 rounded font-mono text-xl md:text-2xl text-slate-300 text-center mb-3">
                            {parseTextWithTranslations(data.formal.text)}
                        </div>
                        <p className="text-[10px] md:text-xs text-slate-500 text-center">{parseTextWithTranslations(data.formal.analysis)}</p>
                    </div>

                    {/* Combat */}
                    <div className="bg-cyan-950/20 rounded-lg p-4 md:p-5 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                        <h4 className="text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">⚔️ FORMA DE COMBATE</h4>
                        <div className="bg-slate-900/50 p-3 md:p-4 rounded font-mono text-xl md:text-2xl text-cyan-300 text-center mb-3">
                            {parseTextWithTranslations(data.combat.text)}
                        </div>
                        <p className="text-[10px] md:text-xs text-cyan-500 text-center">{parseTextWithTranslations(data.combat.analysis)}</p>
                    </div>
                </div>

                <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
                    <p className="text-sm text-slate-400 leading-relaxed">{parseTextWithTranslations(data.explanation)}</p>
                </div>
            </div>
        </div>
    );
};

const EliteInsight = ({ title, content }: { title: string; content: string }) => {
    return (
        <div className="my-8 relative overflow-hidden rounded-xl">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 via-purple-600/10 to-cyan-600/10 animate-gradient-x" />

            <div className="relative bg-slate-900/80 backdrop-blur border border-cyan-500/30 rounded-xl p-4 md:p-6 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                        <Brain className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                        <h4 className="font-bold text-cyan-400 font-mono text-xs md:text-sm tracking-wider mb-2">{parseTextWithTranslations(title)}</h4>
                        <p className="text-sm md:text-base text-slate-300 leading-relaxed">{parseTextWithTranslations(content)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ================================================================
// PART 2 COMPONENTS
// ================================================================

// Memory Diagram - Declarative vs Procedural Memory
const MemoryDiagram = ({ data }: { data: { title: string; declarative: { title: string; description: string; icon: string }; procedural: { title: string; description: string; icon: string }; diagnosis: string } }) => {
    const [activePanel, setActivePanel] = useState<'declarative' | 'procedural' | null>(null);

    return (
        <div className="my-8 bg-slate-900/50 rounded-xl border border-cyan-500/30 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-900/50 to-purple-900/50 p-4 border-b border-cyan-500/20">
                <h3 className="text-base md:text-lg font-bold text-cyan-400 font-mono flex items-center gap-2">
                    <Brain className="w-4 h-4 md:w-5 md:h-5" />
                    {parseTextWithTranslations(data.title)}
                </h3>
            </div>

            <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Declarative Memory */}
                <button
                    onClick={() => setActivePanel(activePanel === 'declarative' ? null : 'declarative')}
                    className={cn(
                        "text-left p-4 md:p-5 rounded-lg border transition-all duration-300",
                        activePanel === 'declarative'
                            ? "bg-red-500/20 border-red-500/50"
                            : "bg-slate-800/50 border-slate-700 hover:border-red-500/30"
                    )}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-xl md:text-2xl">{data.declarative.icon}</span>
                        <span className="font-bold text-red-400 text-sm md:text-base">{parseTextWithTranslations(data.declarative.title)}</span>
                        <span className="ml-auto text-[10px] md:text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">O ERRO</span>
                    </div>
                    <AnimatePresence>
                        {activePanel === 'declarative' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-slate-400 text-sm leading-relaxed"
                            >
                                {parseTextWithTranslations(data.declarative.description)}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {activePanel !== 'declarative' && (
                        <p className="text-slate-500 text-[10px] md:text-xs italic mt-2">Toque para ver detalhes</p>
                    )}
                </button>

                {/* Procedural Memory */}
                <button
                    onClick={() => setActivePanel(activePanel === 'procedural' ? null : 'procedural')}
                    className={cn(
                        "text-left p-4 md:p-5 rounded-lg border transition-all duration-300",
                        activePanel === 'procedural'
                            ? "bg-emerald-500/20 border-emerald-500/50"
                            : "bg-slate-800/50 border-slate-700 hover:border-emerald-500/30"
                    )}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-xl md:text-2xl">{data.procedural.icon}</span>
                        <span className="font-bold text-emerald-400 text-sm md:text-base">{parseTextWithTranslations(data.procedural.title)}</span>
                        <span className="ml-auto text-[10px] md:text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">A SOLUÇÃO</span>
                    </div>
                    <AnimatePresence>
                        {activePanel === 'procedural' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-slate-400 text-sm leading-relaxed"
                            >
                                {parseTextWithTranslations(data.procedural.description)}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {activePanel !== 'procedural' && (
                        <p className="text-slate-500 text-[10px] md:text-xs italic mt-2">Toque para ver detalhes</p>
                    )}
                </button>
            </div>

            {/* Diagnosis */}
            <div className="mx-4 md:mx-6 mb-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs md:text-sm font-bold mb-2">
                    <Crosshair className="w-4 h-4" />
                    DIAGNÓSTICO DE ELITE
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{parseTextWithTranslations(data.diagnosis)}</p>
            </div>
        </div>
    );
};

// Baby Learning - 4 Phase Acquisition Process
const BabyLearning = ({ data }: { data: { title: string; phases: { name: string; icon: string; description: string }[] } }) => {
    const [activePhase, setActivePhase] = useState(0);

    return (
        <div className="my-8 bg-slate-900/50 rounded-xl border border-violet-500/30 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-900/50 to-pink-900/50 p-4 border-b border-violet-500/20">
                <h3 className="text-base md:text-lg font-bold text-violet-400 font-mono flex items-center gap-2">
                    🛠️ {parseTextWithTranslations(data.title)}
                </h3>
            </div>

            {/* Phase Navigation */}
            <div className="flex border-b border-slate-700/50 overflow-x-auto no-scrollbar">
                {data.phases.map((phase, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActivePhase(idx)}
                        className={cn(
                            "flex-1 min-w-[100px] md:min-w-[120px] px-2 md:px-4 py-3 text-center text-xs md:text-sm font-medium transition-all relative whitespace-nowrap",
                            activePhase === idx
                                ? "text-violet-300 bg-violet-500/10"
                                : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                        )}
                    >
                        <span className="mr-1 md:mr-2">{phase.icon}</span>
                        <span className="hidden md:inline">{parseTextWithTranslations(phase.name)}</span>
                        <span className="md:hidden font-bold">FASE {idx + 1}</span>
                        {activePhase === idx && (
                            <motion.div
                                layoutId="activePhaseIndicator"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-pink-500"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Active Phase Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activePhase}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 md:p-6"
                >
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/30 flex items-center justify-center text-3xl flex-shrink-0 mb-2 md:mb-0">
                            {data.phases[activePhase].icon}
                        </div>
                        <div>
                            <h4 className="font-bold text-violet-300 text-base md:text-lg mb-2">
                                Fase {activePhase + 1}: {parseTextWithTranslations(data.phases[activePhase].name)}
                            </h4>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {parseTextWithTranslations(data.phases[activePhase].description)}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 pb-4">
                {data.phases.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActivePhase(idx)}
                        className={cn(
                            "w-2 h-2 md:w-3 md:h-3 rounded-full transition-all",
                            activePhase === idx
                                ? "bg-violet-500 scale-125 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                                : "bg-slate-600 hover:bg-slate-500"
                        )}
                    />
                ))}
            </div>
        </div>
    );
};

// Phrase Analysis - Tactical breakdown of a phrase
const PhraseAnalysis = ({ data }: { data: { phrase: string; phonetic: string; grammarNote: string } }) => {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="my-6 bg-slate-900/50 rounded-xl border border-cyan-500/30 overflow-hidden">
            <div className="p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] md:text-xs font-bold text-cyan-400 font-mono tracking-wider">ANÁLISE DE FRASE TÁTICA</span>
                    <Volume2 className="w-4 h-4 text-cyan-500 cursor-pointer hover:text-cyan-400" />
                </div>

                <p className="text-xl md:text-2xl font-bold text-white mb-3 font-serif">
                    "{parseTextWithTranslations(data.phrase)}"
                </p>

                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-xs md:text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
                >
                    {showDetails ? "Esconder análise" : "Ver análise completa"}
                    <ChevronDown className={cn("w-4 h-4 transition-transform", showDetails && "rotate-180")} />
                </button>

                <AnimatePresence>
                    {showDetails && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 space-y-3 border-t border-slate-700/50 pt-4"
                        >
                            <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-3">
                                <span className="text-[10px] md:text-xs font-bold text-emerald-400 font-mono w-24 flex-shrink-0">FONÉTICA:</span>
                                <span className="text-slate-400 text-sm font-mono">{parseTextWithTranslations(data.phonetic)}</span>
                            </div>
                            <div className="flex flex-col md:flex-row md:items-start gap-1 md:gap-3">
                                <span className="text-[10px] md:text-xs font-bold text-amber-400 font-mono w-24 flex-shrink-0">GRAMÁTICA:</span>
                                <span className="text-slate-400 text-sm">{parseTextWithTranslations(data.grammarNote)}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const RenderBlock = ({ block }: { block: ContentBlock }) => {
    if (block.type.startsWith("box-") || block.type === "pillar-end") {
        const boxClass = BoxStyles[block.type as keyof typeof BoxStyles] || "";
        return (
            <div className={cn("rounded border-l-2 p-6 my-6 relative overflow-hidden backdrop-blur-sm", boxClass)}>
                <div className="flex items-start gap-4 relative z-10">
                    {block.type !== "pillar-end" && <div className="mt-1 flex-shrink-0"><BoxIcon type={block.type} /></div>}

                    <div className={cn("flex-1", block.type === "pillar-end" && "flex flex-col items-center")}>
                        {block.type === "pillar-end" && <div className="mb-4"><BoxIcon type={block.type} /></div>}
                        {block.title && (
                            <h4 className={cn("font-bold text-sm font-mono tracking-wider mb-2 opacity-90", block.type === "pillar-end" && "text-xl")}>
                                {block.title.toUpperCase()}
                            </h4>
                        )}
                        <div className="text-base leading-relaxed opacity-90">
                            {Array.isArray(block.content) ? (
                                block.content.map((line, i) => <p key={i} className="mb-2 last:mb-0">{parseTextWithTranslations(line)}</p>)
                            ) : (
                                <p>{parseTextWithTranslations(block.content as string)}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    switch (block.type) {
        case "h2":
            return (
                <h2 className="text-2xl md:text-3xl font-bold text-white mt-12 mb-6 flex items-center gap-3">
                    <span className="w-1 h-8 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></span>
                    {parseTranslatable(block.content as string)}
                </h2>
            );
        case "h3":
            return <h3 className="text-xl font-bold text-slate-200 mt-8 mb-4">{block.content}</h3>;
        case "paragraph":
            return (
                <p className="text-lg text-slate-400 leading-relaxed mb-6 font-sans">
                    {parseTextWithTranslations(block.content as string)}
                </p>
            );
        case "list":
            return (
                <ul className="space-y-3 my-6 pl-2">
                    {(block.content as string[]).map((item, i) => {
                        const parts = item.split(':');
                        const title = parts.length > 1 ? parts[0] : null;
                        const desc = parts.length > 1 ? parts.slice(1).join(':') : item;
                        return (
                            <li key={i} className="flex items-start gap-3 text-slate-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2.5 flex-shrink-0 shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
                                <span className="text-lg">
                                    {title ? <><strong className="text-slate-200">{title}:</strong>{desc}</> : <>{desc}</>}
                                </span>
                            </li>
                        )
                    })}
                </ul>
            );
        case "system-status":
            return (
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 bg-slate-950 text-emerald-500 p-4 rounded border border-emerald-900/50 my-6 font-mono text-sm shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                        <span className="uppercase tracking-widest font-bold">SYSTEM STATUS:</span>
                    </div>
                    <span className="text-emerald-500/80">{parseTranslatable(block.content as string)}</span>
                </div>
            );
        case "terminal-view":
            return (
                <div className="my-8 rounded overflow-hidden bg-[#050505] border border-white/10 shadow-2xl font-mono text-sm group hover:border-cyan-500/30 transition-colors">
                    <div className="bg-white/5 px-4 py-2 flex items-center gap-2 border-b border-white/5">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                        </div>
                        <span className="text-white/20 text-xs ml-2">secure_uplink.sh</span>
                    </div>
                    <div className="p-4 text-emerald-400/90 leading-relaxed font-mono overflow-x-auto">
                        <div className="min-w-[300px]">
                            {Array.isArray(block.content) ? block.content.map((line, i) => (
                                <div key={i} className="mb-1"><span className="text-white/30 mr-2">$</span>{line}</div>
                            )) : <div>{block.content}</div>}
                            <div className="animate-pulse text-cyan-500 mt-2">_</div>
                        </div>
                    </div>
                </div>
            );
        case "interactive-quiz":
            const [q, opts, ans] = (block.content as string).split('|');
            return <InteractiveQuiz question={q} options={opts ? opts.split(',') : []} answer={parseInt(ans) || 0} />;
        case "reveal-box":
            return <RevealBox title={block.title || "ENCRYPTED DATA"}>{block.content}</RevealBox>;
        case "audio-player":
            return (
                <div className="my-6 p-4 bg-slate-900/50 border border-slate-700 rounded-lg flex items-center gap-4 hover:border-cyan-500/50 transition-colors group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-cyan-900/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform flex-shrink-0">
                        <Play className="w-5 h-5 ml-1 fill-current" />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Audio Log</div>
                        <div className="text-slate-300 font-medium text-sm md:text-base">{block.content}</div>
                    </div>
                </div>
            );
        case "cards-grid":
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
                    {(block.content as string[]).map((card, i) => {
                        const [title, desc] = card.split('|');
                        return (
                            <div key={i} className="bg-slate-900/40 p-4 md:p-6 rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-all group backdrop-blur-sm">
                                <h4 className="font-bold text-slate-200 mb-2 group-hover:text-cyan-400 transition-colors flex items-center gap-2 font-mono text-sm md:text-base">
                                    <Cpu className="w-4 h-4 text-slate-500" />
                                    {title}
                                </h4>
                                <p className="text-xs md:text-sm text-slate-400">{desc}</p>
                            </div>
                        )
                    })}
                </div>
            );
        case "video":
            return (
                <div className="my-8 md:my-10 rounded overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 bg-black">
                    <div className="bg-slate-900/80 backdrop-blur px-4 py-3 flex items-center justify-between border-b border-white/10">
                        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest">
                            <Play className="w-4 h-4 fill-current" />
                            <span>Visual Intel</span>
                        </div>
                        <span className="text-white/40 text-[10px] md:text-xs font-mono">{block.title}</span>
                    </div>
                    <div className="aspect-video w-full bg-black relative">
                        <iframe width="100%" height="100%" src={block.content as string} title={block.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="absolute inset-0" />
                    </div>
                </div>
            );
        case "table":
            return (
                <div className="my-8 md:my-10 rounded border border-slate-700/50 overflow-hidden bg-slate-900/20 backdrop-blur">
                    <div className="bg-slate-900/50 px-4 py-3 border-b border-slate-700/50 flex items-center gap-2">
                        <TableIcon className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{block.title || "Reference Data"}</span>
                    </div>
                    <div className="overflow-x-auto pb-2">
                        <table className="w-full text-sm text-left min-w-[500px]">
                            <tbody className="divide-y divide-slate-800">
                                {(block.content as string[]).map((row, i) => {
                                    const cols = row.split('|');
                                    return (
                                        <tr key={i} className={i === 0 ? "bg-slate-900/80 font-bold text-cyan-400 font-mono text-xs uppercase" : "hover:bg-white/5 transition-colors"}>
                                            {cols.map((col, j) => (
                                                <td key={j} className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-slate-400 first:text-slate-200 text-xs md:text-sm">
                                                    {col}
                                                </td>
                                            ))}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        case "dialogue":
            return (
                <div className="my-10 bg-slate-900/30 rounded border border-slate-700 overflow-hidden">
                    <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-cyan-500" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Intercepted Comms: {block.title}</span>
                    </div>
                    <div className="p-6 space-y-4">
                        {(block.content as string[]).map((line, i) => {
                            const [speaker, text] = line.split(':');
                            const isMe = ["You", "Você", "Eu", "Me"].includes(speaker.trim());
                            return (
                                <div key={i} className={cn("flex flex-col max-w-[85%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                                    <span className="text-[10px] uppercase font-bold text-slate-500 mb-1 px-1 font-mono">{speaker}</span>
                                    <div className={cn(
                                        "px-4 py-3 rounded text-sm leading-relaxed shadow-lg border relative",
                                        isMe ? "bg-cyan-900/20 border-cyan-500/30 text-cyan-100" : "bg-slate-800/40 border-slate-700 text-slate-300"
                                    )}>
                                        {text}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            );
        // ================================================================
        // NEW INTERACTIVE BLOCK TYPES FOR PILAR 1
        // ================================================================
        case "brain-diagram": {
            const brainData = typeof block.content === 'string' ? JSON.parse(block.content) : block.content;
            return <BrainDiagram data={brainData} />;
        }
        case "comparison-table": {
            const tableData = typeof block.content === 'string' ? JSON.parse(block.content) : block.content;
            return <ComparisonTable data={tableData} />;
        }
        case "scenario-card": {
            const scenarioData = typeof block.content === 'string' ? JSON.parse(block.content) : block.content;
            return <ScenarioCard data={scenarioData} />;
        }
        case "phonetic-breakdown": {
            const phoneticData = typeof block.content === 'string' ? JSON.parse(block.content) : block.content;
            return <PhoneticBreakdown data={phoneticData} />;
        }
        case "elite-insight":
            return <EliteInsight title={block.title || "INSIGHT DE ELITE"} content={block.content as string} />;
        // ================================================================
        // PART 2 COMPONENT RENDERS
        // ================================================================
        case "memory-diagram": {
            const memoryData = typeof block.content === 'string' ? JSON.parse(block.content) : block.content;
            return <MemoryDiagram data={memoryData} />;
        }
        case "baby-learning": {
            const learningData = typeof block.content === 'string' ? JSON.parse(block.content) : block.content;
            return <BabyLearning data={learningData} />;
        }
        case "phrase-analysis": {
            const phraseData = typeof block.content === 'string' ? JSON.parse(block.content) : block.content;
            return <PhraseAnalysis data={phraseData} />;
        }
        default:
            return null;
    }
};

// ============================================================================
// MAIN COMPONENT: CASCADING DRAWER (ACCORDION)
// ============================================================================

export const PillarOperationalView = ({ data }: PillarOperationalViewProps) => {
    const [activeModuleId, setActiveModuleId] = useState<string | null>(
        data.modules?.[0]?.id || null
    );

    // Track completed modules locally (in real app, this would come from context/API)
    const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());

    // If no modules, fallback (or handle legacy blocks) - ideally we migrate all
    if (!data.modules) {
        return (
            <div className="text-center p-10 text-white">
                <h2 className="text-xl text-red-400">Legacy Data Detected</h2>
                <p className="text-white/60">Please migrate this pillar to the new Module System.</p>
            </div>
        );
    }

    const handleModuleClick = (moduleId: string, status: string | undefined, index: number) => {
        // Allow clicking on completed or active modules
        const isCompleted = completedModules.has(moduleId);
        const isUnlocked = index === 0 || completedModules.has(data.modules![index - 1]?.id);

        if (status === 'locked' && !isCompleted && !isUnlocked) return;

        const newActiveId = activeModuleId === moduleId ? null : moduleId;
        setActiveModuleId(newActiveId);

        // Scroll to module if opening
        if (newActiveId) {
            setTimeout(() => {
                const element = document.getElementById(`module-anchor-${moduleId}`);
                if (element) {
                    const yOffset = -20; // Scroll slightly above
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }, 100);
        }
    };

    // Track which module should blink
    const [highlightedModuleId, setHighlightedModuleId] = useState<string | null>(null);

    const handleCompleteModule = (currentModuleId: string, currentIndex: number) => {
        // Mark as completed
        setCompletedModules(prev => new Set([...prev, currentModuleId]));

        // Close current module
        setActiveModuleId(null);

        // Scroll to the CURRENT module (which is consistent/stable at the top)
        // Scroll to the CURRENT module logic removed to favor Next Module focus
        // setTimeout(() => {
        //     const currentAnchor = document.getElementById(`module-anchor-${currentModuleId}`);
        //     if (currentAnchor) {
        //         currentAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        //     }
        // }, 10);

        // Find next module
        const nextModule = data.modules![currentIndex + 1];

        if (nextModule) {
            setHighlightedModuleId(nextModule.id);

            // Scroll to the NEXT module to encourage flow
            setTimeout(() => {
                const nextAnchor = document.getElementById(`module-anchor-${nextModule.id}`);
                if (nextAnchor) {
                    const yOffset = -20;
                    const y = nextAnchor.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }, 100);

            // Stop blinking after 3 seconds
            setTimeout(() => {
                setHighlightedModuleId(null);
            }, 3000);
        } else {
            // If no next module, scroll to current to show completion state clearly
            setTimeout(() => {
                const currentAnchor = document.getElementById(`module-anchor-${currentModuleId}`);
                if (currentAnchor) {
                    currentAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto pb-32">
            {/* HEADER */}
            <div className="mb-12 relative">
                <div className="absolute top-0 left-0 w-20 h-1 bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tighter pt-8">
                    {data.title}
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl font-light leading-relaxed">
                    {data.subtitle}
                </p>
            </div>

            {/* CASCADING MODULES */}
            <div className="space-y-4">
                {data.modules.map((module, index) => {
                    const isActive = activeModuleId === module.id;
                    const isCompleted = completedModules.has(module.id);
                    const isFirstUnlockedIncomplete = index === 0 || completedModules.has(data.modules![index - 1]?.id);
                    const isLocked = module.status === 'locked' && !isCompleted && !isFirstUnlockedIncomplete;
                    const isHighlighted = highlightedModuleId === module.id;

                    return (
                        <div key={module.id} className="relative">
                            {/* Scroll Anchor - positioned above module */}
                            <div
                                id={`module-anchor-${module.id}`}
                                className="absolute -top-24"
                                aria-hidden="true"
                            />
                            <motion.div
                                id={`module-${module.id}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                    "relative overflow-hidden rounded-lg border transition-all duration-300",
                                    isActive
                                        ? "bg-slate-900/80 border-cyan-500/50 shadow-[0_0_30px_rgba(8,145,178,0.1)]"
                                        : isHighlighted
                                            ? "bg-cyan-950/40 border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.6)] animate-pulse"
                                            : isCompleted
                                                ? "bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50"
                                                : isLocked
                                                    ? "bg-slate-950/30 border-slate-800 opacity-60"
                                                    : "bg-slate-900/40 border-slate-700 hover:border-slate-500"
                                )}
                            >
                                {/* Module Header / Trigger */}
                                <button
                                    onClick={() => handleModuleClick(module.id, module.status, index)}
                                    className="w-full flex items-center justify-between p-6 text-left relative z-10"
                                    disabled={isLocked}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded flex items-center justify-center border font-mono text-lg font-bold transition-colors",
                                            isCompleted
                                                ? "bg-emerald-950 text-emerald-400 border-emerald-500/50"
                                                : isActive
                                                    ? "bg-cyan-950 text-cyan-400 border-cyan-500/50"
                                                    : isLocked
                                                        ? "bg-slate-900 text-slate-600 border-slate-800"
                                                        : "bg-slate-800 text-slate-300 border-slate-600 group-hover:bg-slate-700"
                                        )}>
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                            ) : (
                                                index + 1
                                            )}
                                        </div>
                                        <div>
                                            <h3 className={cn(
                                                "font-bold text-base md:text-lg transition-colors flex items-center gap-2",
                                                isCompleted ? "text-emerald-300" : isActive ? "text-white" : isLocked ? "text-slate-600" : "text-slate-300"
                                            )}>
                                                {module.title}
                                                {isCompleted && (
                                                    <span className="text-[10px] md:text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded font-mono">COMPLETO</span>
                                                )}
                                            </h3>
                                            {module.subtitle && (
                                                <p className="text-sm text-slate-500 hidden md:block">
                                                    {module.subtitle}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {isLocked ? (
                                            <Lock className="w-5 h-5 text-slate-600" />
                                        ) : isCompleted && !isActive ? (
                                            <span className="text-xs text-emerald-400/60 font-mono hidden md:block">Clique para rever</span>
                                        ) : (
                                            <div className={cn(
                                                "flex items-center gap-2 text-xs md:text-sm font-mono tracking-widest transition-opacity",
                                                isActive ? "opacity-100 text-cyan-400" : "opacity-0"
                                            )}>
                                                <span className="hidden md:inline">ACCESSING</span>
                                                <span className="md:hidden">OPEN</span>
                                                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-cyan-400 rounded-full animate-pulse" />
                                            </div>
                                        )}
                                        <ChevronDown className={cn(
                                            "w-5 h-5 transition-transform duration-300",
                                            isActive ? "rotate-180 text-cyan-500" : isCompleted ? "text-emerald-500" : "text-slate-500"
                                        )} />
                                    </div>
                                </button>

                                {/* Module Content (Drawer) */}
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                        >
                                            <div className="px-4 pb-8 md:px-20 md:pb-12 border-t border-white/5 relative">
                                                {/* Decorative Sidebar Line */}
                                                <div className={cn(
                                                    "absolute left-12 top-0 bottom-0 w-px bg-gradient-to-b hidden md:block",
                                                    isCompleted ? "from-emerald-500/20 to-transparent" : "from-cyan-500/20 to-transparent"
                                                )} />

                                                <div className="pt-8 space-y-2">
                                                    {module.blocks.map((block, idx) => (
                                                        <RenderBlock key={idx} block={block} />
                                                    ))}
                                                </div>

                                                {/* Module Completion Action */}
                                                <div className="mt-12 flex justify-between items-center">
                                                    {isCompleted ? (
                                                        <span className="text-emerald-400 font-mono text-sm flex items-center gap-2">
                                                            <CheckCircle2 className="w-5 h-5" />
                                                            Módulo Completado
                                                        </span>
                                                    ) : (
                                                        <span />
                                                    )}

                                                    {!isCompleted ? (
                                                        <button
                                                            onClick={() => handleCompleteModule(module.id, index)}
                                                            className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white px-6 py-3 rounded font-bold transition-all shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_30px_rgba(8,145,178,0.6)] group"
                                                        >
                                                            <span>COMPLETAR E AVANÇAR</span>
                                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                        </button>
                                                    ) : index < data.modules!.length - 1 ? (
                                                        <button
                                                            onClick={() => setActiveModuleId(data.modules![index + 1].id)}
                                                            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded font-bold transition-all"
                                                        >
                                                            <span>IR PARA PRÓXIMA PARTE</span>
                                                            <ArrowRight className="w-5 h-5" />
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

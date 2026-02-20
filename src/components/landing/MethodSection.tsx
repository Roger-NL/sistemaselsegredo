"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import {
    Brain, Headphones, BookOpen, MessageSquare, Mic,
    Users, Sparkles, PenTool, Globe, Trophy,
    TrendingUp, Zap, Target, Clock, ArrowRight, ShieldCheck
} from "lucide-react";
import { useLandingTheme } from "@/context/LandingThemeContext";

// --- METHODOLOGY STEPS ---
const METHOD_STEPS = [
    {
        id: 1,
        title: "Recepção de Missão",
        icon: Target,
        colorHex: "#f59e0b",
        stats: [
            { label: "Briefing", value: "Direto" },
            { label: "Objetivo", value: "Claro" }
        ],
        insight: "Briefing direto. Um objetivo, uma estrutura, uma habilidade.",
        visual: "pareto"
    },
    {
        id: 2,
        title: "Sessões de Alta Intensidade",
        icon: Zap,
        colorHex: "#ef4444",
        stats: [
            { label: "Tempo", value: "Curto" },
            { label: "Foco", value: "Máximo" }
        ],
        insight: "Microtreinos diários. Tempo curto e exigência altíssima.",
        visual: "brain"
    },
    {
        id: 3,
        title: "Produção Ativa e Áudio-Base",
        icon: Mic,
        colorHex: "#3b82f6",
        stats: [
            { label: "Estímulo", value: "Áudio" },
            { label: "Resposta", value: "Ativa" }
        ],
        insight: "Percepção auditiva real. Processe nativos e responda de forma ativa.",
        visual: "waves"
    },
    {
        id: 4,
        title: "Auditoria de Precisão",
        icon: ShieldCheck,
        colorHex: "#10b981",
        stats: [
            { label: "Máquinas", value: "Zero" },
            { label: "Correção", value: "Absoluta" }
        ],
        insight: "Humanos auditam sua produção. Erros mapeados e anulados. Nada de IA genérica.",
        visual: "chart"
    }
];


// Visual Widget - Auto animated
function PillarVisual({ type, colorHex }: { type: string; colorHex: string }) {
    if (type === "waves") {
        return (
            <div className="flex items-center justify-center gap-0.5 h-12 w-24">
                {[...Array(16)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            height: [4, Math.random() * 30 + 8, 4],
                        }}
                        transition={{
                            duration: 0.4 + Math.random() * 0.4,
                            repeat: Infinity,
                            delay: i * 0.03,
                            ease: "easeInOut"
                        }}
                        style={{ backgroundColor: colorHex }}
                        className="w-1 rounded-full"
                    />
                ))}
            </div>
        );
    }
    if (type === "pareto") {
        return (
            <div className="flex items-end gap-2 h-14 w-24">
                <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: 44 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ backgroundColor: colorHex }}
                    className="w-10 rounded-t relative"
                >
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold" style={{ color: colorHex }}>80%</span>
                </motion.div>
                <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: 12 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="w-10 bg-white/20 rounded-t relative"
                >
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-white/40">20%</span>
                </motion.div>
            </div>
        );
    }
    if (type === "brain") {
        return (
            <div className="relative w-14 h-14 flex items-center justify-center">
                <Brain className="w-10 h-10" style={{ color: `${colorHex}60` }} />
                <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2"
                    style={{ borderColor: colorHex }}
                />
                <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.4, repeat: Infinity, delay: 0.1 }}
                    className="absolute w-1.5 h-1.5 rounded-full top-2 left-3"
                    style={{ backgroundColor: colorHex }}
                />
                <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.4, repeat: Infinity, delay: 0.5 }}
                    className="absolute w-1.5 h-1.5 rounded-full bottom-3 right-2"
                    style={{ backgroundColor: colorHex }}
                />
            </div>
        );
    }
    return null;
}

// Single Step Row — compact version with all content
function StepRow({ step, index, isDark }: { step: typeof METHOD_STEPS[0]; index: number; isDark: boolean }) {
    const isEven = index % 2 === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
        >
            {/* Vertical Connection Line */}
            <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-green-500/30 to-transparent" />

            {/* Node Dot */}
            <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-5 w-2.5 h-2.5 rounded-full z-20"
                style={{ backgroundColor: step.colorHex, boxShadow: `0 0 15px ${step.colorHex}` }}
            >
                <motion.div
                    animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full"
                    style={{ border: `2px solid ${step.colorHex}` }}
                />
            </motion.div>

            {/* Content Row */}
            <div className={`flex items-start gap-3 py-4 pl-16 md:pl-0 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>

                {/* Level Badge — desktop only */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className={`hidden md:flex flex-shrink-0 w-28 flex-col items-center ${isEven ? 'md:items-end' : 'md:items-start'}`}
                >
                    <div
                        className="p-2.5 rounded-lg border"
                        style={{ backgroundColor: `${step.colorHex}10`, borderColor: `${step.colorHex}30` }}
                    >
                        <step.icon className="w-7 h-7" style={{ color: step.colorHex }} />
                    </div>
                    <span className={`text-[10px] font-mono mt-1.5 ${isDark ? "text-white/40" : "text-gray-500"}`}>FASE {step.id.toString().padStart(2, '0')}</span>
                </motion.div>

                {/* Content Card — compact */}
                <div className="flex-1">
                    <motion.div
                        initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className={`p-3.5 md:p-4 rounded-xl border backdrop-blur-sm ${isDark ? "bg-black/80 border-white/10" : "bg-white border-gray-200 shadow-lg"
                            }`}
                    >
                        {/* Mobile Icon */}
                        <div className="flex items-center gap-2 mb-2 md:hidden">
                            <step.icon className="w-5 h-5" style={{ color: step.colorHex }} />
                            <span className={`text-[10px] font-mono ${isDark ? "text-white/40" : "text-gray-500"}`}>FASE {step.id.toString().padStart(2, '0')}</span>
                        </div>

                        {/* Title & Insight — inline layout */}
                        <h3 className={`text-lg font-bold mb-1.5 ${isDark ? "text-white" : "text-gray-900"}`}>{step.title}</h3>
                        <p className={`text-sm font-bold leading-snug mb-3 ${isDark ? "text-white/70" : "text-gray-700"}`}>"{step.insight}"</p>

                        {/* Visual + Stats — horizontal compact */}
                        <div className="flex flex-row gap-3 items-center">
                            {/* Visual Widget — slightly smaller */}
                            <div className="flex-shrink-0">
                                <PillarVisual type={step.visual} colorHex={step.colorHex} />
                            </div>

                            {/* Stats — compact */}
                            <div className="flex-1 grid grid-cols-2 gap-2">
                                {step.stats.map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 15 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.4 + i * 0.1 }}
                                        className="flex items-center gap-2"
                                    >
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: `${step.colorHex}20` }}
                                        >
                                            <TrendingUp className="w-4 h-4" style={{ color: step.colorHex }} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold leading-tight" style={{ color: step.colorHex }}>{stat.value}</div>
                                            <div className={`text-[9px] ${isDark ? "text-white/40" : "text-gray-500"}`}>{stat.label}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

export function MethodSection() {
    // Theme - with safe fallback
    let isDark = true;
    let isLight = false;
    try {
        const theme = useLandingTheme();
        isDark = theme.isDark;
        isLight = theme.isLight;
    } catch {
        // Default to dark if outside provider
    }

    return (
        <section id="method" className={`py-16 md:py-24 px-4 relative overflow-hidden transition-colors duration-500 ${isDark ? "bg-black" : "bg-gray-50"
            }`}>
            {/* Background */}
            {isDark && <div className="absolute inset-0 bg-black" />}

            {/* Subtle Grid */}
            <div className={`absolute inset-0 bg-[size:80px_80px] ${isDark
                ? "bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]"
                : "bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)]"
                }`} />

            <div className="container mx-auto max-w-5xl relative z-10">

                {/* Subtile Geometric Decor */}
                <div className="absolute top-40 -left-64 w-[500px] h-[500px] opacity-10 mix-blend-screen pointer-events-none z-0">
                    <img src="/geometric-dark.png" alt="Geometric Shape" className="w-full h-full object-contain" />
                </div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/5 mb-6"
                    >
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="font-mono text-green-400 text-xs tracking-widest uppercase">
                            FLIGHT MANUAL
                        </span>
                    </motion.div>
                    <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold font-serif mb-4 ${isDark ? "text-white" : "text-gray-900"
                        }`}>
                        Como o sistema executa o <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-violet-400">
                            treinamento.
                        </span>
                    </h2>
                    <p className={`max-w-lg mx-auto text-sm ${isDark ? "text-white/40" : "text-gray-500"}`}>
                        Este não é um ambiente de aprendizado. É um simulador de fluência em alta densidade.
                    </p>
                </motion.div>

                {/* Timeline Journey */}
                <div className="relative">
                    {/* Steps Rows */}
                    {METHOD_STEPS.map((step, index) => (
                        <StepRow key={step.id} step={step} index={index} isDark={isDark} />
                    ))}

                    {/* Final Goal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative z-10 mt-10 flex justify-center"
                    >
                        {/* Connection to final */}
                        <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 -top-10 h-10 w-px bg-gradient-to-b from-green-500/30 to-green-500" />

                        <motion.div
                            animate={{
                                boxShadow: [
                                    "0 0 40px rgba(16,185,129,0.3)",
                                    "0 0 80px rgba(16,185,129,0.5)",
                                    "0 0 40px rgba(16,185,129,0.3)"
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="relative w-28 h-28 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center border-4 border-green-400"
                        >
                            <div className="text-center">
                                <Target className="w-9 h-9 text-white mx-auto mb-0.5" />
                                <div className="text-white font-bold text-[11px]">CAPACIDADE</div>
                                <div className="text-green-200 text-[8px]">OPERACIONAL</div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

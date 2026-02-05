"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
    Brain, Headphones, BookOpen, MessageSquare, Mic,
    Users, Sparkles, PenTool, Globe, Trophy,
    TrendingUp, Zap, Target, Clock, ArrowRight
} from "lucide-react";
import { useLandingTheme } from "@/context/LandingThemeContext";

// --- PILLAR DATA (Real Course Structure) ---
const PILLARS = [
    // FASE 1: PREPARAÇÃO & SOBREVIVÊNCIA
    {
        id: 1,
        title: "Mindset & Desprogramação",
        icon: Brain,
        colorHex: "#8b5cf6",
        phase: "PREPARAÇÃO",
        stats: [
            { label: "Método Escolar", value: "Deletado" },
            { label: "Medo de Errar", value: "Zero" }
        ],
        insight: "Desprogramação do método escolar. Você vai desaprender para aprender certo.",
        visual: "brain",
        mission: "Prova de Mindset"
    },
    {
        id: 2,
        title: "Imersão Auditiva",
        icon: Headphones,
        colorHex: "#06b6d4",
        phase: "PREPARAÇÃO",
        stats: [
            { label: "Listening Ativo", value: "Total" },
            { label: "Velocidade Nativa", value: "1.5x" }
        ],
        insight: "Técnicas de Listening que te fazem entender nativos falando rápido.",
        visual: "waves",
        mission: "Teste de Identificação de Sons"
    },
    {
        id: 3,
        title: "Sobrevivência Urbana",
        icon: Globe,
        colorHex: "#10b981",
        phase: "PREPARAÇÃO",
        stats: [
            { label: "Situações Reais", value: "50+" },
            { label: "Inglês da Rua", value: "Real" }
        ],
        insight: "O inglês que você usa para pedir comida, ajuda, e sobreviver.",
        visual: "chart",
        mission: "Simulação de Pedido Real"
    },
    // FASE 2: ESTRUTURA & EXPANSÃO
    {
        id: 4,
        title: "Fundamentos Lógicos",
        icon: BookOpen,
        colorHex: "#f59e0b",
        phase: "ESTRUTURA",
        stats: [
            { label: "Regras Úteis", value: "20%" },
            { label: "O Resto", value: "Lixo" }
        ],
        insight: "A lógica gramatical que REALMENTE importa. O resto é enfeite.",
        visual: "pareto",
        mission: "Construção de Frases Complexas"
    },
    {
        id: 5,
        title: "Números & Negócios",
        icon: TrendingUp,
        colorHex: "#ec4899",
        phase: "ESTRUTURA",
        stats: [
            { label: "Checkpoint", value: "AO VIVO" },
            { label: "Dinheiro & Tempo", value: "Fluente" }
        ],
        insight: "Dinheiro, tempo, negociação. O inglês que paga suas contas.",
        visual: "chart",
        mission: "Mentoria Ao Vivo: Calibragem"
    },
    {
        id: 6,
        title: "Produção Oral",
        icon: Mic,
        colorHex: "#3b82f6",
        phase: "ESTRUTURA",
        stats: [
            { label: "Shadowing", value: "Ativo" },
            { label: "Sotaque BR", value: "-90%" }
        ],
        insight: "Shadowing e pronúncia. Você vai soar como nativo, não turista.",
        visual: "mic",
        mission: "Envio de Áudio de Leitura"
    },
    // FASE 3: AUTONOMIA & ELITE
    {
        id: 7,
        title: "Autonomia Real",
        icon: Sparkles,
        colorHex: "#a855f7",
        phase: "AUTONOMIA",
        stats: [
            { label: "Aprender Sozinho", value: "100%" },
            { label: "Dependência", value: "0%" }
        ],
        insight: "Aprender a aprender. Você vira independente de qualquer curso.",
        visual: "arsenal",
        mission: "Pesquisa Guiada"
    },
    {
        id: 8,
        title: "Especializações",
        icon: Target,
        colorHex: "#ef4444",
        phase: "AUTONOMIA",
        stats: [
            { label: "Carreiras", value: "3+" },
            { label: "Foco Específico", value: "100%" }
        ],
        insight: "Job Hunter, Business, Travel. Escolha sua especialização.",
        visual: "email",
        mission: "Briefing de Carreira"
    },
    {
        id: 9,
        title: "Debriefing Final",
        icon: Trophy,
        colorHex: "#6366f1",
        phase: "AUTONOMIA",
        stats: [
            { label: "Checkpoint", value: "AO VIVO" },
            { label: "Fluência", value: "Aprovada" }
        ],
        insight: "Simulação final com professor. Você prova que está pronto.",
        visual: "identity",
        mission: "Roleplay Final Ao Vivo"
    }
];


// Visual Widget - Auto animated
function PillarVisual({ type, colorHex }: { type: string; colorHex: string }) {
    if (type === "waves") {
        return (
            <div className="flex items-center justify-center gap-0.5 h-16 w-32">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            height: [6, Math.random() * 40 + 10, 6],
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
            <div className="flex items-end gap-3 h-20 w-32">
                <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: 60 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ backgroundColor: colorHex }}
                    className="w-12 rounded-t relative"
                >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold" style={{ color: colorHex }}>80%</span>
                </motion.div>
                <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: 15 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="w-12 bg-white/20 rounded-t relative"
                >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white/40">20%</span>
                </motion.div>
            </div>
        );
    }
    if (type === "brain") {
        return (
            <div className="relative w-20 h-20 flex items-center justify-center">
                <Brain className="w-14 h-14" style={{ color: `${colorHex}60` }} />
                <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2"
                    style={{ borderColor: colorHex }}
                />
                <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.4, repeat: Infinity, delay: 0.1 }}
                    className="absolute w-2 h-2 rounded-full top-3 left-4"
                    style={{ backgroundColor: colorHex }}
                />
                <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.4, repeat: Infinity, delay: 0.5 }}
                    className="absolute w-2 h-2 rounded-full bottom-4 right-3"
                    style={{ backgroundColor: colorHex }}
                />
            </div>
        );
    }
    return null;
}

// Single Pillar Row with Horizontal Scroll Content
function PillarRow({ pillar, index, isDark }: { pillar: typeof PILLARS[0]; index: number; isDark: boolean }) {
    const isEven = index % 2 === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
        >
            {/* Vertical Connection Line */}
            <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-green-500/30 to-transparent" />

            {/* Node Dot */}
            <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="absolute left-8 md:left-1/2 md:-translate-x-1/2 top-8 w-4 h-4 rounded-full z-20"
                style={{ backgroundColor: pillar.colorHex, boxShadow: `0 0 20px ${pillar.colorHex}` }}
            >
                <motion.div
                    animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full"
                    style={{ border: `2px solid ${pillar.colorHex}` }}
                />
            </motion.div>

            {/* Content Row */}
            <div className={`flex items-start gap-6 py-12 pl-20 md:pl-0 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>

                {/* Level Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className={`hidden md:flex flex-shrink-0 w-32 flex-col items-center ${isEven ? 'md:items-end' : 'md:items-start'}`}
                >
                    <div
                        className="p-4 rounded-xl border"
                        style={{ backgroundColor: `${pillar.colorHex}10`, borderColor: `${pillar.colorHex}30` }}
                    >
                        <pillar.icon className="w-10 h-10" style={{ color: pillar.colorHex }} />
                    </div>
                    <span className={`text-xs font-mono mt-2 ${isDark ? "text-white/40" : "text-gray-500"}`}>NÍVEL {pillar.id.toString().padStart(2, '0')}</span>
                </motion.div>

                {/* Content Grid - All visible at once */}
                <div className="flex-1">
                    <motion.div
                        initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className={`p-6 rounded-2xl border backdrop-blur-sm ${isDark ? "bg-black/80 border-white/10" : "bg-white border-gray-200 shadow-lg"
                            }`}
                    >
                        {/* Mobile Icon */}
                        <div className="flex items-center gap-3 mb-4 md:hidden">
                            <pillar.icon className="w-6 h-6" style={{ color: pillar.colorHex }} />
                            <span className={`text-xs font-mono ${isDark ? "text-white/40" : "text-gray-500"}`}>NÍVEL {pillar.id.toString().padStart(2, '0')}</span>
                        </div>

                        {/* Title & Insight */}
                        <h3 className={`text-2xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>{pillar.title}</h3>
                        <p className={`text-sm italic leading-relaxed mb-6 ${isDark ? "text-white/50" : "text-gray-600"}`}>"{pillar.insight}"</p>

                        {/* Visual + Stats Row */}
                        <div className="flex flex-col sm:flex-row gap-6 items-center">
                            {/* Visual Widget */}
                            <div className="flex-shrink-0">
                                <PillarVisual type={pillar.visual} colorHex={pillar.colorHex} />
                            </div>

                            {/* Stats */}
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                {pillar.stats.map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.4 + i * 0.1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: `${pillar.colorHex}20` }}
                                        >
                                            <TrendingUp className="w-5 h-5" style={{ color: pillar.colorHex }} />
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold" style={{ color: pillar.colorHex }}>{stat.value}</div>
                                            <div className={`text-[10px] ${isDark ? "text-white/40" : "text-gray-500"}`}>{stat.label}</div>
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
        <section id="method" className={`py-24 px-4 relative overflow-hidden transition-colors duration-500 ${isDark ? "bg-black" : "bg-gray-50"
            }`}>
            {/* Background */}
            {isDark && <div className="absolute inset-0 bg-black" />}

            {/* Subtle Grid */}
            <div className={`absolute inset-0 bg-[size:80px_80px] ${isDark
                ? "bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]"
                : "bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)]"
                }`} />

            <div className="container mx-auto max-w-5xl relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/5 mb-6"
                    >
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="font-mono text-green-400 text-xs tracking-widest uppercase">
                            Rota de Extração Ativa
                        </span>
                    </motion.div>
                    <h2 className={`text-4xl md:text-6xl font-bold font-serif mb-4 ${isDark ? "text-white" : "text-gray-900"
                        }`}>
                        9 Níveis para <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-violet-400">
                            Fluência Total
                        </span>
                    </h2>
                    <p className={`max-w-lg mx-auto text-sm ${isDark ? "text-white/40" : "text-gray-500"}`}>
                        Domine cada nível para desbloquear a fluência total
                    </p>
                </motion.div>

                {/* Timeline Journey */}
                <div className="relative">
                    {/* Pillar Rows */}
                    {PILLARS.map((pillar, index) => (
                        <PillarRow key={pillar.id} pillar={pillar} index={index} isDark={isDark} />
                    ))}

                    {/* Final Goal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative z-10 mt-16 flex justify-center"
                    >
                        {/* Connection to final */}
                        <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 -top-16 h-16 w-px bg-gradient-to-b from-green-500/30 to-green-500" />

                        <motion.div
                            animate={{
                                boxShadow: [
                                    "0 0 40px rgba(16,185,129,0.3)",
                                    "0 0 80px rgba(16,185,129,0.5)",
                                    "0 0 40px rgba(16,185,129,0.3)"
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="relative w-36 h-36 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center border-4 border-green-400"
                        >
                            <div className="text-center">
                                <Trophy className="w-12 h-12 text-white mx-auto mb-1" />
                                <div className="text-white font-bold text-sm">OPERADOR</div>
                                <div className="text-green-200 text-[10px]">CERTIFICADO</div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

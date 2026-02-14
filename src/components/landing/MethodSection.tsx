"use client";

import { motion } from "framer-motion";
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

// Single Pillar Row — compact version with all content
function PillarRow({ pillar, index, isDark }: { pillar: typeof PILLARS[0]; index: number; isDark: boolean }) {
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
                style={{ backgroundColor: pillar.colorHex, boxShadow: `0 0 15px ${pillar.colorHex}` }}
            >
                <motion.div
                    animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full"
                    style={{ border: `2px solid ${pillar.colorHex}` }}
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
                        style={{ backgroundColor: `${pillar.colorHex}10`, borderColor: `${pillar.colorHex}30` }}
                    >
                        <pillar.icon className="w-7 h-7" style={{ color: pillar.colorHex }} />
                    </div>
                    <span className={`text-[10px] font-mono mt-1.5 ${isDark ? "text-white/40" : "text-gray-500"}`}>NÍVEL {pillar.id.toString().padStart(2, '0')}</span>
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
                            <pillar.icon className="w-5 h-5" style={{ color: pillar.colorHex }} />
                            <span className={`text-[10px] font-mono ${isDark ? "text-white/40" : "text-gray-500"}`}>NÍVEL {pillar.id.toString().padStart(2, '0')}</span>
                        </div>

                        {/* Title & Insight — inline layout */}
                        <h3 className={`text-lg font-bold mb-1.5 ${isDark ? "text-white" : "text-gray-900"}`}>{pillar.title}</h3>
                        <p className={`text-xs italic leading-snug mb-3 ${isDark ? "text-white/50" : "text-gray-600"}`}>"{pillar.insight}"</p>

                        {/* Visual + Stats — horizontal compact */}
                        <div className="flex flex-row gap-3 items-center">
                            {/* Visual Widget — slightly smaller */}
                            <div className="flex-shrink-0">
                                <PillarVisual type={pillar.visual} colorHex={pillar.colorHex} />
                            </div>

                            {/* Stats — compact */}
                            <div className="flex-1 grid grid-cols-2 gap-2">
                                {pillar.stats.map((stat, i) => (
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
                                            style={{ backgroundColor: `${pillar.colorHex}20` }}
                                        >
                                            <TrendingUp className="w-4 h-4" style={{ color: pillar.colorHex }} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold leading-tight" style={{ color: pillar.colorHex }}>{stat.value}</div>
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
                            Modelo No-Video · Escrita Ativa
                        </span>
                    </motion.div>
                    <h2 className={`text-3xl sm:text-4xl md:text-6xl font-bold font-serif mb-4 ${isDark ? "text-white" : "text-gray-900"
                        }`}>
                        9 Níveis para <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-violet-400">
                            Fluência Total
                        </span>
                    </h2>
                    <p className={`max-w-lg mx-auto text-sm ${isDark ? "text-white/40" : "text-gray-500"}`}>
                        Sem videoaula. Cada nível exige produção escrita + validação humana.
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
                                <Trophy className="w-9 h-9 text-white mx-auto mb-0.5" />
                                <div className="text-white font-bold text-[11px]">OPERADOR</div>
                                <div className="text-green-200 text-[8px]">CERTIFICADO</div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

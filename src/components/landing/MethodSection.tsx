"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
    Brain, Headphones, BookOpen, MessageSquare, Mic,
    Users, Sparkles, PenTool, Globe, Trophy,
    TrendingUp, Zap, Target, Clock, ArrowRight
} from "lucide-react";

// --- PILLAR DATA ---
const PILLARS = [
    {
        id: 1,
        title: "Mindset Reset",
        icon: Brain,
        colorHex: "#8b5cf6",
        stats: [
            { label: "Bloqueios Eliminados", value: "100%" },
            { label: "Tempo de Resposta", value: "-70%" }
        ],
        insight: "Seu cérebro não é o problema. O medo é.",
        visual: "brain"
    },
    {
        id: 2,
        title: "Deep Listening",
        icon: Headphones,
        colorHex: "#06b6d4",
        stats: [
            { label: "Compreensão Auditiva", value: "+85%" },
            { label: "Velocidade Nativa", value: "1.5x" }
        ],
        insight: "Nativos não falam devagar. Você vai aprender a ouvir rápido.",
        visual: "waves"
    },
    {
        id: 3,
        title: "Gramática Tática",
        icon: BookOpen,
        colorHex: "#10b981",
        stats: [
            { label: "Regras Necessárias", value: "20%" },
            { label: "Aplicação Prática", value: "100%" }
        ],
        insight: "Esqueça 80% da gramática. Foque no que importa.",
        visual: "chart"
    },
    {
        id: 4,
        title: "Vocabulário 80/20",
        icon: MessageSquare,
        colorHex: "#f59e0b",
        stats: [
            { label: "Palavras de Alta Frequência", value: "800" },
            { label: "Cobertura Real", value: "80%" }
        ],
        insight: "Com 800 palavras você resolve 80% das situações.",
        visual: "pareto"
    },
    {
        id: 5,
        title: "Pronúncia Elite",
        icon: Mic,
        colorHex: "#ec4899",
        stats: [
            { label: "Clareza de Fala", value: "+90%" },
            { label: "Sotaque Brasileiro", value: "-95%" }
        ],
        insight: "Pare de soar como turista. Fale como nativo.",
        visual: "mic"
    },
    {
        id: 6,
        title: "Simulação Real",
        icon: Users,
        colorHex: "#3b82f6",
        stats: [
            { label: "Cenários de Pressão", value: "50+" },
            { label: "Confiança em Crises", value: "+200%" }
        ],
        insight: "Treinamento de combate em situações reais.",
        visual: "combat"
    },
    {
        id: 7,
        title: "Arsenal Nativo",
        icon: Sparkles,
        colorHex: "#a855f7",
        stats: [
            { label: "Expressões Idiomáticas", value: "150+" },
            { label: "Phrasal Verbs", value: "100+" }
        ],
        insight: "As armas secretas que os livros não ensinam.",
        visual: "arsenal"
    },
    {
        id: 8,
        title: "Escrita de Elite",
        icon: PenTool,
        colorHex: "#ef4444",
        stats: [
            { label: "Templates Profissionais", value: "30+" },
            { label: "Emails Efetivos", value: "100%" }
        ],
        insight: "Emails que fecham negócios.",
        visual: "email"
    },
    {
        id: 9,
        title: "Identidade Final",
        icon: Globe,
        colorHex: "#6366f1",
        stats: [
            { label: "Imersão Total", value: "24/7" },
            { label: "Fluência Operacional", value: "100%" }
        ],
        insight: "Você não 'sabe' inglês. Você 'é' um falante.",
        visual: "identity"
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
function PillarRow({ pillar, index }: { pillar: typeof PILLARS[0]; index: number }) {
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
                    <span className="text-xs font-mono text-white/40 mt-2">NÍVEL {pillar.id.toString().padStart(2, '0')}</span>
                </motion.div>

                {/* Content Grid - All visible at once */}
                <div className="flex-1">
                    <motion.div
                        initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="p-6 rounded-2xl bg-black/80 border border-white/10 backdrop-blur-sm"
                    >
                        {/* Mobile Icon */}
                        <div className="flex items-center gap-3 mb-4 md:hidden">
                            <pillar.icon className="w-6 h-6" style={{ color: pillar.colorHex }} />
                            <span className="text-xs font-mono text-white/40">NÍVEL {pillar.id.toString().padStart(2, '0')}</span>
                        </div>

                        {/* Title & Insight */}
                        <h3 className="text-2xl font-bold text-white mb-3">{pillar.title}</h3>
                        <p className="text-white/50 text-sm italic leading-relaxed mb-6">"{pillar.insight}"</p>

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
                                            <div className="text-[10px] text-white/40">{stat.label}</div>
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
    return (
        <section id="method" className="py-24 px-4 bg-black relative overflow-hidden">
            {/* Pure Black Background */}
            <div className="absolute inset-0 bg-black" />

            {/* Subtle Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />

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
                    <h2 className="text-4xl md:text-6xl font-bold font-serif text-white mb-4">
                        9 Níveis para <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-violet-400">
                            Fluência Total
                        </span>
                    </h2>
                    <p className="text-white/40 max-w-lg mx-auto text-sm">
                        Domine cada nível para desbloquear a fluência total
                    </p>
                </motion.div>

                {/* Timeline Journey */}
                <div className="relative">
                    {/* Pillar Rows */}
                    {PILLARS.map((pillar, index) => (
                        <PillarRow key={pillar.id} pillar={pillar} index={index} />
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

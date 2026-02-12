"use client";

import { motion } from "framer-motion";
import {
    Clapperboard, Heart, ShoppingBag, Briefcase,
    Plane, BarChart3, Rocket, ArrowRight, Star, LucideIcon
} from "lucide-react";
import { useLandingTheme } from "@/context/LandingThemeContext";

const SPECIALTIES = [
    {
        id: "spec-popculture",
        title: "Cultura Pop",
        desc: "Domine séries, filmes, música e memes. Entenda piadas e referências culturais.",
        icon: Clapperboard,
        color: "#6366f1",
        examples: ["Entender letras de músicas", "Assistir sem legenda", "Gírias de internet"]
    },
    {
        id: "spec-health",
        title: "Inglês para Saúde",
        desc: "Vocabulário médico e hospitalar. Descreva sintomas e entenda diagnósticos.",
        icon: Heart,
        color: "#ef4444",
        examples: ["Consultas médicas", "Termos de emergência", "Leitura de bulas"]
    },
    {
        id: "spec-shopping",
        title: "Compras & Consumo",
        desc: "Negocie preços, entenda políticas de troca e navegue e-commerce internacional.",
        icon: ShoppingBag,
        color: "#10b981",
        examples: ["Compras online", "Negociação", "Devoluções e reclamações"]
    },
    {
        id: "spec-interview",
        title: "Entrevistas de Emprego",
        desc: "Prepare-se para entrevistas em inglês. Respostas matadoras para perguntas difíceis.",
        icon: Briefcase,
        color: "#06b6d4",
        examples: ["'Tell me about yourself'", "Salary negotiation", "Follow-up emails"]
    },
    {
        id: "spec-travel",
        title: "Viagens Internacionais",
        desc: "Aeroportos, hotéis, restaurantes. Viaje sem stress e sem depender de ninguém.",
        icon: Plane,
        color: "#22c55e",
        examples: ["Check-in e imigração", "Pedindo direções", "Emergências no exterior"]
    },
    {
        id: "spec-business",
        title: "Reuniões & Apresentações",
        desc: "Conduza meetings, apresente projetos e negocie contratos em inglês corporativo.",
        icon: BarChart3,
        color: "#f59e0b",
        examples: ["Conference calls", "Slides em inglês", "Email profissional"]
    }
];

// Unique animation per specialty icon
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_ANIMS: any[] = [
    { rotate: [0, -8, 8, 0], transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } },   // Clapperboard wobbles
    { scale: [1, 1.3, 1, 1.3, 1], transition: { duration: 1.2, repeat: Infinity } },                  // Heart beats
    { y: [0, -4, 0], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },               // ShoppingBag bounces
    { y: [0, -3, 0], rotate: [0, 5, -5, 0], transition: { duration: 2.5, repeat: Infinity } },        // Briefcase nods
    { x: [0, 8, 0], y: [0, -3, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } }, // Plane flies
    { scale: [1, 1.15, 1], transition: { duration: 2, repeat: Infinity } },                            // BarChart3 pulses
];

// Compact Specialty Card with animated icon
function SpecialtyCard({
    spec,
    index,
    isDark
}: {
    spec: typeof SPECIALTIES[0];
    index: number;
    isDark: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={{
                scale: 1.03,
                y: -6,
                transition: { duration: 0.2 }
            }}
            className="group relative"
        >
            {/* Glow on hover */}
            <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                style={{ backgroundColor: `${spec.color}15` }}
            />

            {/* Card */}
            <div className={`relative p-4 rounded-xl backdrop-blur-sm border transition-all h-full ${isDark
                ? "bg-white/[0.03] border-white/10 group-hover:border-white/20"
                : "bg-white border-gray-200 shadow-lg group-hover:border-violet-300"
                }`}
                style={{
                    boxShadow: isDark ? 'none' : undefined
                }}
            >
                {/* Icon — animated */}
                <div className="flex items-start gap-3 mb-3">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center border flex-shrink-0 relative"
                        style={{
                            backgroundColor: `${spec.color}12`,
                            borderColor: `${spec.color}35`
                        }}
                    >
                        <motion.div animate={ICON_ANIMS[index]}>
                            <spec.icon
                                className="w-5 h-5"
                                style={{ color: spec.color }}
                            />
                        </motion.div>

                        {/* Neon pulse dot */}
                        <motion.div
                            animate={{ scale: [1, 1.6, 1], opacity: [0.9, 0.3, 0.9] }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                            style={{ backgroundColor: spec.color }}
                        />
                    </div>

                    <div className="min-w-0">
                        <h3 className={`text-base font-bold leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>{spec.title}</h3>
                        <p className={`text-xs leading-snug mt-1 ${isDark ? "text-white/45" : "text-gray-600"}`}>{spec.desc}</p>
                    </div>
                </div>

                {/* Examples Pills — compact */}
                <div className="flex flex-wrap gap-1.5 ml-[52px]">
                    {spec.examples.map((ex, i) => (
                        <span
                            key={i}
                            className={`text-[10px] px-2 py-0.5 rounded-full border ${isDark
                                ? "bg-white/5 text-white/35 border-white/8"
                                : "bg-gray-100 text-gray-500 border-gray-200"
                                }`}
                        >
                            {ex}
                        </span>
                    ))}
                </div>

                {/* Hover Arrow */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-white/25" />
                </div>
            </div>
        </motion.div>
    );
}

export function SpecialtiesSection() {
    let isDark = true;
    try {
        const theme = useLandingTheme();
        isDark = theme.isDark;
    } catch {
        // Default to dark if outside provider
    }

    return (
        <section id="specialties" className={`py-14 px-4 relative overflow-hidden transition-colors duration-500 ${isDark ? "bg-gradient-to-b from-black via-violet-950/10 to-black" : "bg-gradient-to-b from-gray-50 via-violet-100/20 to-white"
            }`}>
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.1),transparent_70%)]" />

            <div className="container mx-auto max-w-5xl relative z-10">
                {/* Header — compact */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4 ${isDark ? "border-violet-500/30 bg-violet-500/10" : "border-violet-500/40 bg-violet-500/20"
                        }`}>
                        <motion.div
                            animate={{ y: [0, -3, 0], rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Rocket className="w-3.5 h-3.5 text-violet-500" />
                        </motion.div>
                        <span className={`font-mono text-[10px] tracking-widest uppercase ${isDark ? "text-violet-400" : "text-violet-600"}`}>
                            Depois dos 9 Pilares
                        </span>
                    </div>
                    <h2 className={`text-3xl md:text-5xl font-bold font-serif mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                        Escolha Sua <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
                            Especialidade
                        </span>
                    </h2>
                    <p className={`max-w-lg mx-auto text-sm ${isDark ? "text-white/45" : "text-gray-600"}`}>
                        Após dominar os fundamentos, você escolhe uma área de foco para se tornar um verdadeiro especialista.
                    </p>
                </motion.div>

                {/* Specialty Grid — compact */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {SPECIALTIES.map((spec, index) => (
                        <SpecialtyCard
                            key={spec.id}
                            spec={spec}
                            index={index}
                            isDark={isDark}
                        />
                    ))}
                </div>

                {/* Bottom CTA — compact */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="text-center mt-8"
                >
                    <p className={`text-xs flex items-center justify-center gap-2 ${isDark ? "text-white/25" : "text-gray-500"}`}>
                        <Star className="w-3 h-3 text-amber-400" />
                        Novas especialidades são adicionadas regularmente
                        <Star className="w-3 h-3 text-amber-400" />
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

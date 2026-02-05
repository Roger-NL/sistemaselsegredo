"use client";

import { motion } from "framer-motion";
import {
    Clapperboard, Heart, ShoppingBag, Briefcase,
    Plane, BarChart3, Rocket, ArrowRight, Star
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

export function SpecialtiesSection() {
    // Theme - with safe fallback
    let isDark = true;
    try {
        const theme = useLandingTheme();
        isDark = theme.isDark;
    } catch {
        // Default to dark if outside provider
    }

    return (
        <section id="specialties" className={`py-24 px-4 relative overflow-hidden transition-colors duration-500 ${isDark ? "bg-gradient-to-b from-black via-violet-950/10 to-black" : "bg-gradient-to-b from-gray-50 via-violet-100/20 to-white"
            }`}>
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.1),transparent_70%)]" />

            <div className="container mx-auto max-w-6xl relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-center mb-20"
                >
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 ${isDark ? "border-violet-500/30 bg-violet-500/10" : "border-violet-500/40 bg-violet-500/20"
                        }`}>
                        <Rocket className="w-4 h-4 text-violet-500" />
                        <span className={`font-mono text-xs tracking-widest uppercase ${isDark ? "text-violet-400" : "text-violet-600"}`}>
                            Depois dos 9 Pilares
                        </span>
                    </div>
                    <h2 className={`text-4xl md:text-6xl font-bold font-serif mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                        Escolha Sua <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
                            Especialidade
                        </span>
                    </h2>
                    <p className={`max-w-xl mx-auto ${isDark ? "text-white/50" : "text-gray-600"}`}>
                        Após dominar os fundamentos, você escolhe uma área de foco para se tornar um verdadeiro especialista.
                    </p>
                </motion.div>

                {/* Specialty Grid - Hexagonal Feel */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {SPECIALTIES.map((spec, index) => (
                        <motion.div
                            key={spec.id}
                            initial={{ opacity: 0, y: 50, rotateX: -15 }}
                            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                            whileHover={{
                                scale: 1.03,
                                y: -10,
                                transition: { duration: 0.2 }
                            }}
                            className="group relative"
                        >
                            {/* Glow Effect on Hover */}
                            <div
                                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                                style={{ backgroundColor: `${spec.color}20` }}
                            />

                            {/* Card */}
                            <div className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm group-hover:border-white/20 transition-all h-full">
                                {/* Icon */}
                                <div
                                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 border"
                                    style={{
                                        backgroundColor: `${spec.color}15`,
                                        borderColor: `${spec.color}40`
                                    }}
                                >
                                    <spec.icon
                                        className="w-7 h-7"
                                        style={{ color: spec.color }}
                                    />
                                </div>

                                {/* Content */}
                                <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>{spec.title}</h3>
                                <p className={`text-sm mb-4 leading-relaxed ${isDark ? "text-white/50" : "text-gray-600"}`}>{spec.desc}</p>

                                {/* Examples Pills */}
                                <div className="flex flex-wrap gap-2">
                                    {spec.examples.map((ex, i) => (
                                        <span
                                            key={i}
                                            className={`text-xs px-2 py-1 rounded-full border ${isDark
                                                    ? "bg-white/5 text-white/40 border-white/10"
                                                    : "bg-gray-100 text-gray-600 border-gray-200"
                                                }`}
                                        >
                                            {ex}
                                        </span>
                                    ))}
                                </div>

                                {/* Hover Arrow */}
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    whileHover={{ opacity: 1, x: 0 }}
                                    className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <ArrowRight className="w-5 h-5 text-white/30" />
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="text-center mt-16"
                >
                    <p className={`text-sm mb-4 flex items-center justify-center gap-2 ${isDark ? "text-white/30" : "text-gray-500"}`}>
                        <Star className="w-4 h-4 text-amber-400" />
                        Novas especialidades são adicionadas regularmente
                        <Star className="w-4 h-4 text-amber-400" />
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

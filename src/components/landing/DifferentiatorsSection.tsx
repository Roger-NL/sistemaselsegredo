"use client";

import { motion } from "framer-motion";
import { Target, Cpu, Crosshair, Fingerprint } from "lucide-react";

export function DifferentiatorsSection() {
    const differentiators = [
        {
            title: "Execução vs. Assistir",
            desc: "Sem especulação. O sistema exige produção ativa desde o minuto um.",
            icon: Target,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
            border: "border-amber-500/20 hover:border-amber-500/50",
            glow: "from-amber-500/20",
            delay: 0.2
        },
        {
            title: "Prática Real vs. Teoria",
            desc: "Foco 100% em comunicação do mundo real. Gramática inútil é descartada.",
            icon: Cpu,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
            border: "border-emerald-500/20 hover:border-emerald-500/50",
            glow: "from-emerald-500/20",
            delay: 0.3
        },
        {
            title: "Precisão vs. Volume",
            desc: "Acúmulo de horas é ilusão. Condicionamos seu reflexo neural para a fluência.",
            icon: Crosshair,
            color: "text-cyan-400",
            bg: "bg-cyan-400/10",
            border: "border-cyan-500/20 hover:border-cyan-500/50",
            glow: "from-cyan-500/20",
            delay: 0.4
        },
        {
            title: "Humano vs. IA Genérica",
            desc: "Só avança quem atinge o critério técnico validado por especialistas.",
            icon: Fingerprint,
            color: "text-fuchsia-400",
            bg: "bg-fuchsia-400/10",
            border: "border-fuchsia-500/20 hover:border-fuchsia-500/50",
            glow: "from-fuchsia-500/20",
            delay: 0.5
        }
    ];

    return (
        <section className="py-12 px-4 relative z-20 overflow-hidden">
            {/* Background elements - Blur Overlay */}
            <div className="absolute inset-0 z-0 backdrop-blur-[3px] pointer-events-none bg-black/20" />

            <div className="container mx-auto max-w-6xl relative z-10">
                {/* Section Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-10 md:mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 drop-shadow-lg">
                        O tradicional falhou.
                    </h2>
                    <p className="text-base md:text-lg font-bold text-gray-300 font-mono mb-6 max-w-2xl mx-auto leading-relaxed">
                        Cursos comuns retêm tempo. Este sistema constrói capacidade funcional imediata.
                    </p>
                    <div className="w-32 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent mx-auto opacity-70 shadow-[0_0_15px_#8b5cf6]" />
                </motion.div>

                {/* Grid of Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {differentiators.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
                            whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: item.delay }}
                            className="relative group"
                        >
                            {/* Hover Glow */}
                            <div className={`absolute inset-0 bg-gradient-to-b ${item.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl blur-xl`} />

                            <div className={`relative h-full p-6 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md hover:bg-black/60 ${item.border} transition-all duration-300 shadow-lg`}>
                                {/* Brand Icon */}
                                <div className={`w-12 h-12 rounded-lg ${item.bg} flex items-center justify-center mb-4 border border-white/5 group-hover:scale-110 transition-transform duration-300`}>
                                    <item.icon className={`w-6 h-6 ${item.color}`} />
                                </div>

                                <h3 className="text-white font-serif font-bold text-xl leading-tight mb-3">
                                    {item.title}
                                </h3>
                                <p className="text-white/80 font-mono font-bold text-sm leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

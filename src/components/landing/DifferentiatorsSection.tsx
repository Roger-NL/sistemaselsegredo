"use client";

import { motion } from "framer-motion";
import { Lock, UserCheck, Users, BrainCircuit } from "lucide-react";

export function DifferentiatorsSection() {
    const differentiators = [
        {
            title: "Você NÃO avança se não souber.",
            desc: "Cada etapa exige validação real.",
            icon: Lock,
            color: "text-rose-400",
            bg: "bg-rose-500/10",
            border: "group-hover:border-rose-500/30",
            glow: "from-rose-500/20",
            delay: 0.1
        },
        {
            title: "Professor real valida cada pilar.",
            desc: "Sem robô. Sem resposta automática.",
            icon: UserCheck,
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
            border: "group-hover:border-cyan-500/30",
            glow: "from-cyan-500/20",
            delay: 0.2
        },
        {
            title: "3 mentorias individuais incluídas.",
            desc: "Correção estratégica ao vivo.",
            icon: Users,
            color: "text-violet-400",
            bg: "bg-violet-500/10",
            border: "group-hover:border-violet-500/30",
            glow: "from-violet-500/20",
            delay: 0.3
        },
        {
            title: "Impossível fingir que aprendeu.",
            desc: "Se não dominar, você refaz.",
            icon: BrainCircuit,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "group-hover:border-emerald-500/30",
            glow: "from-emerald-500/20",
            delay: 0.4
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
                    className="text-center mb-10"
                >
                    <h2 className="text-3xl md:text-4xl font-serif text-white mb-6 drop-shadow-lg">
                        Por que aqui é diferente?
                    </h2>
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

                                <h3 className="text-white font-serif text-lg leading-tight mb-3">
                                    {item.title}
                                </h3>
                                <p className="text-white/50 font-mono text-xs leading-relaxed">
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

"use client";

import { motion } from "framer-motion";
import { RANKS } from "@/utils/ranks";
import { Quote } from "lucide-react";
import { useLandingTheme } from "@/context/LandingThemeContext";

export function RanksSection() {
    // Theme - with safe fallback
    let isDark = true;
    try {
        const theme = useLandingTheme();
        isDark = theme.isDark;
    } catch {
        // Default to dark if outside provider
    }

    return (
        <section className={`py-24 px-4 border-t relative z-20 transition-colors duration-500 ${isDark ? "border-white/5 bg-black" : "border-gray-200 bg-gray-50"
            }`}>
            <div className="container mx-auto max-w-7xl text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <h2 className={`text-3xl md:text-5xl font-serif mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>Sua Carreira de Piloto</h2>
                    <p className={`font-mono text-sm tracking-widest uppercase mb-12 ${isDark ? "text-white/40" : "text-gray-500"}`}>
                        Do check-in ao hall da fama
                    </p>
                </motion.div>

                <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto mb-24">
                    {RANKS.map((rank, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.1, rotate: index % 2 === 0 ? 3 : -3 }}
                            className={`
                                px-6 py-3 rounded-full border bg-opacity-10 backdrop-blur-sm font-mono text-xs uppercase tracking-widest cursor-default
                                ${index === RANKS.length - 1
                                    ? "border-amber-500/50 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                                    : index === 0
                                        ? "border-white/10 bg-white/5 text-white/40"
                                        : "border-violet-500/30 bg-violet-500/5 text-violet-300"
                                }
                            `}
                        >
                            {index + 1}. {rank}
                        </motion.div>
                    ))}
                </div>

                {/* Depoimento Rápido */}
                <div className="max-w-3xl mx-auto relative p-12 rounded-3xl bg-[#EEF4D4]/5 border border-[#EEF4D4]/10">
                    <Quote className="w-12 h-12 text-[#EEF4D4]/20 absolute top-8 left-8" />
                    <p className="text-xl md:text-2xl font-serif text-[#EEF4D4]/90 leading-relaxed italic mb-6 relative z-10">
                        "Comecei como um Passageiro de Janela, sem saber nada. Hoje sou Comandante e acabei de emitir minha primeira volta ao mundo de Executiva. O sistema é infalível."
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-violet-500" />
                        <div className="text-left">
                            <div className={`font-bold font-mono text-sm ${isDark ? "text-white" : "text-gray-900"}`}>RODRIGO SANTOS</div>
                            <div className="text-violet-400 text-xs font-mono uppercase tracking-widest">Patente: Ás dos Céus</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

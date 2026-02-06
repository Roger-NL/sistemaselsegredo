"use client";

import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { RANKS } from "@/utils/ranks";
import { Quote } from "lucide-react";
import { useLandingTheme } from "@/context/LandingThemeContext";
import { useRef } from "react";

// Animated Rank Badge with Spread Effect
function RankBadge({
    rank,
    index,
    distanceFromCenter,
    scrollProgress,
    totalRanks
}: {
    rank: string;
    index: number;
    distanceFromCenter: number;
    scrollProgress: MotionValue<number>;
    totalRanks: number;
}) {
    const x = useTransform(scrollProgress, [0, 0.6], [distanceFromCenter * 30, 0]);
    const y = useTransform(scrollProgress, [0, 0.6], [Math.abs(distanceFromCenter) * 15, 0]);
    const scale = useTransform(scrollProgress, [0, 0.5], [0.8, 1]);
    const opacity = useTransform(scrollProgress, [0, 0.4], [0.3, 1]);
    const rotate = useTransform(scrollProgress, [0, 0.5], [distanceFromCenter * 5, 0]);

    return (
        <motion.div
            style={{ x, y, scale, opacity, rotate }}
            whileHover={{ scale: 1.1, rotate: index % 2 === 0 ? 3 : -3 }}
            className={`
                px-6 py-3 rounded-full border bg-opacity-10 backdrop-blur-sm font-mono text-xs uppercase tracking-widest cursor-default
                ${index === totalRanks - 1
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    : index === 0
                        ? "border-white/10 bg-white/5 text-white/40"
                        : "border-violet-500/30 bg-violet-500/5 text-violet-300"
                }
            `}
        >
            {index + 1}. {rank}
        </motion.div>
    );
}

export function RanksSection() {
    // Theme - with safe fallback
    let isDark = true;
    try {
        const theme = useLandingTheme();
        isDark = theme.isDark;
    } catch {
        // Default to dark if outside provider
    }

    // Scroll animations
    const ranksRef = useRef<HTMLDivElement>(null);
    const quoteRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress: ranksScroll } = useScroll({
        target: ranksRef,
        offset: ["start end", "center center"]
    });

    const { scrollYProgress: quoteScroll } = useScroll({
        target: quoteRef,
        offset: ["start end", "center center"]
    });

    // Quote parallax
    const quoteY = useTransform(quoteScroll, [0, 1], [30, 0]);
    const quoteOpacity = useTransform(quoteScroll, [0, 0.5], [0.3, 1]);
    const quoteScale = useTransform(quoteScroll, [0, 0.5], [0.95, 1]);

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

                {/* Ranks with Spread Animation */}
                <div ref={ranksRef} className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto mb-24">
                    {RANKS.map((rank, index) => {
                        const centerIndex = Math.floor(RANKS.length / 2);
                        const distanceFromCenter = index - centerIndex;

                        return (
                            <RankBadge
                                key={index}
                                rank={rank}
                                index={index}
                                distanceFromCenter={distanceFromCenter}
                                scrollProgress={ranksScroll}
                                totalRanks={RANKS.length}
                            />
                        );
                    })}
                </div>

                {/* Quote with Parallax */}
                <motion.div
                    ref={quoteRef}
                    style={{ y: quoteY, opacity: quoteOpacity, scale: quoteScale }}
                    className="max-w-3xl mx-auto relative p-12 rounded-3xl bg-[#EEF4D4]/5 border border-[#EEF4D4]/10"
                >
                    <Quote className="w-12 h-12 text-[#EEF4D4]/20 absolute top-8 left-8" />
                    <p className="text-xl md:text-2xl font-serif text-[#EEF4D4]/90 leading-relaxed italic mb-6 relative z-10">
                        "Comecei como um Passageiro de Janela, sem saber nada. Hoje sou Comandante e acabei de emitir minha primeira volta ao mundo de Executiva. O sistema é infalível."
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <motion.div
                            className="w-10 h-10 rounded-full bg-violet-500"
                            whileHover={{ scale: 1.2, rotate: 360 }}
                            transition={{ duration: 0.5 }}
                        />
                        <div className="text-left">
                            <div className={`font-bold font-mono text-sm ${isDark ? "text-white" : "text-gray-900"}`}>RODRIGO SANTOS</div>
                            <div className="text-violet-400 text-xs font-mono uppercase tracking-widest">Patente: Ás dos Céus</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

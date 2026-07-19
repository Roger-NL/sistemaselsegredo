"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { RANKS } from "@/utils/ranks";
import { useLandingTheme } from "@/context/LandingThemeContext";

function RankBadge({ rank, index, distance, progress }: {
    rank: string;
    index: number;
    distance: number;
    progress: MotionValue<number>;
}) {
    const x = useTransform(progress, [0, 0.6], [distance * 30, 0]);
    const opacity = useTransform(progress, [0, 0.4], [0.3, 1]);

    return (
        <motion.div
            style={{ x, opacity }}
            className={`rounded-full border px-6 py-3 font-mono text-xs uppercase tracking-widest ${index === RANKS.length - 1
                ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                : "border-violet-500/30 bg-violet-500/5 text-violet-300"
            }`}
        >
            {index + 1}. {rank}
        </motion.div>
    );
}

export function RanksSection() {
    const { isDark } = useLandingTheme();
    const ranksRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ranksRef, offset: ["start end", "center center"] });

    return (
        <section className={`relative z-20 border-t px-4 py-24 ${isDark ? "border-white/5 bg-black" : "border-gray-200 bg-gray-50"}`}>
            <div className="container mx-auto max-w-7xl text-center">
                <h2 className={`mb-6 font-serif text-3xl md:text-5xl ${isDark ? "text-white" : "text-gray-900"}`}>
                    Sua progressão
                </h2>
                <p className={`mb-12 font-mono text-sm uppercase tracking-widest ${isDark ? "text-white/40" : "text-gray-500"}`}>
                    Marcos internos de estudo — não certificados profissionais
                </p>
                <div ref={ranksRef} className="mx-auto flex max-w-5xl flex-wrap justify-center gap-4">
                    {RANKS.map((rank, index) => (
                        <RankBadge
                            key={rank}
                            rank={rank}
                            index={index}
                            distance={index - Math.floor(RANKS.length / 2)}
                            progress={scrollYProgress}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

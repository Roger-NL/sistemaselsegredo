"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useProgress } from "@/context/ProgressContext";
import { ExplorerHUD } from "./ExplorerHUD";
import type { Pillar } from "@/data/curriculum";

// ============================================================================
// SUN COMPONENT - MOLTEN GOLD ENERGY CORE
// ============================================================================

export function Sun() {
    const [isOpen, setIsOpen] = useState(false);
    const { getPillarsWithStatus, getCompletedCount, getCurrentPillarNumber } = useProgress();

    const pillars = getPillarsWithStatus();
    const completedCount = getCompletedCount();
    const currentPillarNumber = getCurrentPillarNumber();

    return (
        <>
            {/* O Sol (Célula de Energia Dourada) */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className="relative w-28 h-28 md:w-40 md:h-40 rounded-full cursor-pointer z-10 flex items-center justify-center group"
                animate={{
                    boxShadow: [
                        "0 0 60px rgba(245, 158, 11, 0.4), 0 0 100px rgba(245, 158, 11, 0.0)",
                        "0 0 80px rgba(245, 158, 11, 0.6), 0 0 140px rgba(245, 158, 11, 0.2)",
                        "0 0 60px rgba(245, 158, 11, 0.4), 0 0 100px rgba(245, 158, 11, 0.0)",
                    ],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {/* SOLAR FLARES & GLOW (Organic Effect) */}
                <div className="absolute inset-0 z-[-1]">
                    {/* Breathing Glow Background */}
                    <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] rounded-full bg-amber-500/20 blur-[80px]"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />

                    {/* Random Solar Flares */}
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-500/30"
                            style={{
                                width: "100%",
                                height: "100%",
                            }}
                            animate={{
                                scale: [1, 1.5 + Math.random() * 0.5],
                                opacity: [0.4, 0],
                                rotate: [0, Math.random() * 90 - 45],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                ease: "easeOut",
                                delay: i * 1.5,
                            }}
                        />
                    ))}

                    {/* Ray Bursts (Subtle) */}
                    {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                        <motion.div
                            key={`ray-${i}`}
                            className="absolute top-1/2 left-1/2 w-1 h-[150%] bg-gradient-to-t from-transparent via-amber-400/10 to-transparent origin-bottom"
                            style={{
                                transform: `translate(-50%, -100%) rotate(${angle}deg)`,
                            }}
                            animate={{
                                height: ["120%", "160%", "120%"],
                                opacity: [0.1, 0.3, 0.1],
                            }}
                            transition={{
                                duration: 4 + Math.random(),
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}
                </div>

                {/* Núcleo de Ouro Fundido */}
                <div
                    className="absolute inset-2 rounded-full overflow-hidden shadow-inner"
                    style={{
                        background: "radial-gradient(circle at 35% 35%, #fffbeb 0%, #fbbf24 20%, #d97706 60%, #78350f 100%)",
                        boxShadow: "inset 0 0 40px rgba(0,0,0,0.5)"
                    }}
                >
                    {/* Brilho Especular */}
                    <div className="absolute top-[10%] left-[10%] w-[30%] h-[20%] bg-white/40 blur-xl rounded-[100%] transform -rotate-45" />

                    {/* Texto Central */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                        <span className="text-4xl md:text-5xl font-serif font-black text-[#451a03] text-bevel tracking-tighter"
                            style={{ textShadow: "0 2px 0 rgba(255,255,255,0.4)" }}>
                            {completedCount}<span className="text-2xl md:text-3xl">/9</span>
                        </span>
                        <span className="text-xs md:text-sm font-bold text-[#78350f] uppercase tracking-[0.2em] mt-1 border-t border-[#78350f]/30 pt-1">
                            Pilares
                        </span>
                    </div>
                </div>
            </motion.button>

            <ExplorerHUD
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                pillars={pillars}
                currentPillarNumber={currentPillarNumber}
            />
        </>
    );
}

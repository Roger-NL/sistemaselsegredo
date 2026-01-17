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
                className="relative w-40 h-40 md:w-56 md:h-56 rounded-full cursor-pointer z-10 flex items-center justify-center group"
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
                {/* GOD RAYS (Apenas se 9/9) */}
                {completedCount === 9 && (
                    <motion.div
                        className="absolute -inset-[150%] z-[-1] opacity-50 pointer-events-none"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                        <div className="w-full h-full bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(251,191,36,0.3)_15deg,transparent_30deg,rgba(251,191,36,0.3)_45deg,transparent_60deg)]" />
                    </motion.div>
                )}

                {/* Corona (Anéis Pulsantes) */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-[#fbbf24]/30"
                    animate={{ scale: [1, 1.2], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                    className="absolute inset-0 rounded-full border border-[#f59e0b]/20"
                    animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />

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

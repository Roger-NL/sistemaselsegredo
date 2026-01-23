"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useProgress } from "@/context/ProgressContext";
import { useSunSettings } from "@/context/SunSettingsContext";
import { ExplorerHUD } from "./ExplorerHUD";
import { SunShader } from "./SunShader";
import type { Pillar } from "@/data/curriculum";

// ============================================================================
// SUN COMPONENT - MOLTEN GOLD ENERGY CORE
// ============================================================================

export function Sun() {
    const [isOpen, setIsOpen] = useState(false);
    const { getPillarsWithStatus, getCompletedCount, getCurrentPillarNumber } = useProgress();
    const { settings } = useSunSettings();

    const pillars = getPillarsWithStatus();
    const completedCount = getCompletedCount();
    const currentPillarNumber = getCurrentPillarNumber();

    return (
        <>
            {/* O Sol (Célula de Energia Dourada) */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className="relative w-28 h-28 md:w-40 md:h-40 aspect-square rounded-full cursor-pointer z-10 flex items-center justify-center group"
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

                {/* Núcleo de Sol 3D com Shaders */}
                {/* Wrapper de posição - só translate */}
                <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{
                        transform: `translate(${Math.round(settings.offsetX)}px, ${Math.round(settings.offsetY)}px)`
                    }}
                >
                    {/* Wrapper de escala - só scale */}
                    <div
                        style={{
                            transform: `scale(${settings.scale})`,
                            transformOrigin: "center center"
                        }}
                    >
                        <SunShader />
                    </div>
                </div>

                {/* Pillar Counter - Static at center, clickable */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <span
                        className="text-4xl md:text-5xl font-serif font-black text-white/90 tracking-tighter drop-shadow-lg"
                        style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(251,191,36,0.5)" }}
                    >
                        {completedCount}<span className="text-2xl md:text-3xl">/9</span>
                    </span>
                    <span className="text-xs md:text-sm font-bold text-white/80 uppercase tracking-[0.2em] mt-1 border-t border-white/30 pt-1 drop-shadow-md">
                        Pilares
                    </span>
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

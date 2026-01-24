"use client";

import React, { lazy, Suspense, useState } from "react";
import { motion } from "framer-motion";
import { useProgress } from "@/context/ProgressContext";

import { useReducedMotion, useIsMobile } from "@/utils/performance";
import type { Pillar } from "@/data/curriculum";
import { SunShader } from "./SunShader";

// Lazy load heavy HUD component
const ExplorerHUD = lazy(() => import("./ExplorerHUD").then(mod => ({ default: mod.ExplorerHUD })));

// ============================================================================
// SUN COMPONENT - MOLTEN GOLD ENERGY CORE
// ============================================================================

export function Sun() {
    const [isOpen, setIsOpen] = useState(false);
    const { getPillarsWithStatus, getCompletedCount, getCurrentPillarNumber } = useProgress();
    const isMobile = useIsMobile();
    const reduced = useReducedMotion();
    const effectiveScale = 1; // Fixed scale to keep Sun perfectly circular

    const pillars = getPillarsWithStatus();
    const completedCount = getCompletedCount();
    const currentPillarNumber = getCurrentPillarNumber();

    return (
        <>
            {/* O Sol (Célula de Energia Dourada) */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className="relative w-[280px] h-[280px] md:w-[250px] md:h-[250px] rounded-full cursor-pointer z-10 flex items-center justify-center group flex-shrink-0"
                animate={(reduced || isMobile) ? {} : {
                    boxShadow: [
                        "0 0 60px rgba(245, 158, 11, 0.4), 0 0 100px rgba(245, 158, 11, 0.0)",
                        "0 0 80px rgba(245, 158, 11, 0.6), 0 0 140px rgba(245, 158, 11, 0.2)",
                        "0 0 60px rgba(245, 158, 11, 0.4), 0 0 100px rgba(245, 158, 11, 0.0)",
                    ],
                }}
                transition={reduced ? {} : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
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
                    {/* Reduce flares on reduced motion or mobile for performance */}
                    {(!reduced && !isMobile) && [...Array(3)].map((_, i) => (
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
                {/* Núcleo de Sol 3D com Shaders */}
                {/* Wrapper de posição - só translate */}
                <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{
                        transform: "translate(0, 0)"
                    }}
                >
                    {/* Wrapper de escala - PRECISA ter tamanho para os filhos w-full funcionarem */}
                    <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                            transform: "scale(1)",
                            transformOrigin: "center center"
                        }}
                    >
                        {/* Clip circular - W-FULL H-FULL relativo ao botão pai */}
                        <div className="w-full h-full rounded-full overflow-hidden will-change-transform">
                            <SunShader />
                        </div>
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

            <Suspense fallback={null}>
                <ExplorerHUD
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    pillars={pillars}
                    currentPillarNumber={currentPillarNumber}
                />
            </Suspense>
        </>
    );
}

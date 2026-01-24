"use client";

import { useProgress } from "@/context/ProgressContext";
import { Planet } from "./Planet";
import { Sun } from "./Sun";
import { useIsMobile } from "@/utils/performance";
import { motion } from "framer-motion";

export function SolarSystem() {
    const { getCompletedCount, getPillarsWithStatus, getPlanetsWithStatus } = useProgress();
    const isMobile = useIsMobile();

    // Get updated status
    const completedCount = getCompletedCount();
    const pillars = getPillarsWithStatus();
    const planets = getPlanetsWithStatus();

    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-visible">
            {/* 
               Mobile Scaling Wrapper 
               "O Sistema Solar 'encolhe' para caber na largura do celular."
             */}
            {/* 
               Mobile Scaling Wrapper REMOVED
               Now using direct size calculation for better quality and no distortion
             */}
            <div className="w-full h-full flex items-center justify-center">

                {/* LAYER 1: Orbit Rings (Background) - Z-INDEX 10 */}
                {planets.map((planet, index) => {
                    // Add gap booster: increased spacing per orbit level
                    // Increased base distance (+80) so the first planet clears the sun
                    // Increased index spacing (+50) to spread lines out more
                    const baseOffset = 80 + (index * 50);
                    const mobileOffset = isMobile ? 30 : 0;
                    const adjustedDistance = planet.orbitDistance + baseOffset + mobileOffset;
                    const size = (adjustedDistance * 2) * 0.45;

                    return (
                        <div
                            key={`ring-${planet.id}`}
                            className="absolute rounded-full border border-[#d4af37]/20 shadow-[0_0_15px_rgba(212,175,55,0.05)] pointer-events-none z-10"
                            style={{
                                width: size,
                                height: size,
                            }}
                        />
                    );
                })}

                {/* LAYER 2: Sun (Middle) - Z-INDEX 20 */}
                <div className="absolute z-20 flex items-center justify-center">
                    <Sun />
                </div>

                {/* LAYER 3: Planets (Foreground) - Z-INDEX 30 */}
                {planets.map((planet, index) => {
                    const duration = 30 + index * 15;
                    // Match the same distance calc
                    const baseOffset = 80 + (index * 50);
                    const mobileOffset = isMobile ? 30 : 0;
                    const adjustedDistance = planet.orbitDistance + baseOffset + mobileOffset;
                    const size = (adjustedDistance * 2) * 0.45;

                    return (
                        <motion.div
                            key={`planet-${planet.id}`}
                            className="absolute flex items-start justify-center pointer-events-none z-30"
                            style={{
                                width: size,
                                height: size,
                            }}
                            animate={{ rotate: 360 }}
                            transition={{
                                duration: duration,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        >
                            {/* Planet anchored to top of the ring */}
                            <div className="absolute -top-0 -translate-y-1/2 pointer-events-auto">
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{
                                        duration: duration,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                >
                                    <div className="transform scale-[0.6]">
                                        <Planet planet={planet} index={index} />
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Background Gold Dust Particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(isMobile ? 15 : 30)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            background: "radial-gradient(circle, #fde047 0%, transparent 70%)",
                            width: Math.random() * 4 + 1,
                            height: Math.random() * 4 + 1,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.5 + 0.1,
                        }}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.2, 0.6, 0.2]
                        }}
                        transition={{
                            duration: Math.random() * 5 + 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

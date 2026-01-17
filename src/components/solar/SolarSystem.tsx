"use client";

import { useProgress } from "@/context/ProgressContext";
import { Planet } from "./Planet";
import { Sun } from "./Sun";
import { motion } from "framer-motion";

export function SolarSystem() {
    const { getCompletedCount, getPillarsWithStatus, getPlanetsWithStatus } = useProgress();

    // Get updated status
    const completedCount = getCompletedCount();
    const pillars = getPillarsWithStatus();
    const planets = getPlanetsWithStatus();

    return (
        <div className="relative w-full h-[600px] md:h-[800px] flex items-center justify-center overflow-hidden">
            {/* 
               Mobile Scaling Wrapper 
               "O Sistema Solar 'encolhe' (Scale 0.55) para caber na largura do celular."
             */}
            <div className="md:scale-100 scale-[0.55] origin-center w-full h-full flex items-center justify-center">

                {/* Orbital Rings (Golden Optical Fiber) */}
                {planets.map((planet) => (
                    <div
                        key={`orbit-${planet.id}`}
                        className="absolute rounded-full border border-[#d4af37]/20 shadow-[0_0_15px_rgba(212,175,55,0.05)]"
                        style={{
                            width: planet.orbitDistance * 2,
                            height: planet.orbitDistance * 2,
                        }}
                    />
                ))}

                {/* Sun (Center) */}
                <div className="absolute z-20">
                    <Sun />
                </div>

                {/* Planets (Orbiting) */}
                {planets.map((planet, index) => (
                    <Planet key={planet.id} planet={planet} index={index} />
                ))}
            </div>

            {/* Background Gold Dust Particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(30)].map((_, i) => (
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

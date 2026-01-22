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
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* 
               Mobile Scaling Wrapper 
               "O Sistema Solar 'encolhe' para caber na largura do celular."
             */}
            <div className="w-full h-full flex items-center justify-center transform scale-[0.45] md:scale-65 lg:scale-75 transition-transform duration-500">

                {/* Sun (Center) - Z-Index alto para ficar por cima das órbitas internas se sobreporem */}
                <div className="absolute z-20">
                    <Sun />
                </div>

                {/* Rotating Rings with Planets attached */}
                {planets.map((planet, index) => {
                    // Cada planeta tem sua própria órbita (anel)
                    // O anel gira, carregando o planeta
                    const duration = 30 + index * 15; // Mais lento para órbitas externas
                    const size = planet.orbitDistance * 2;

                    return (
                        <motion.div
                            key={planet.id}
                            className="absolute rounded-full border border-[#d4af37]/20 shadow-[0_0_15px_rgba(212,175,55,0.05)] flex items-start justify-center pointer-events-none"
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
                            {/* O Planeta - Fixado no topo do anel (top-0) */}
                            {/* Precisamos de um wrapper para contra-rotacionar o planeta para ele ficar em pé */}
                            <div className="absolute -top-0 -translate-y-1/2 pointer-events-auto z-30">
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{
                                        duration: duration,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                >
                                    <Planet planet={planet} index={index} />
                                </motion.div>
                            </div>
                        </motion.div>
                    );
                })}
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

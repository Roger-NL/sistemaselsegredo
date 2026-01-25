"use client";

import { useProgress } from "@/context/ProgressContext";
import { Planet } from "./Planet";
import { Sun } from "./Sun";
import { useIsMobile } from "@/utils/performance";
import { motion, useTime, useTransform } from "framer-motion";
import React from "react";

export function SolarSystem() {
    const { getCompletedCount, getPillarsWithStatus, getPlanetsWithStatus } = useProgress();
    const isMobile = useIsMobile();

    // Get updated status
    const planets = getPlanetsWithStatus();

    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-visible">
            <div className="w-full h-full flex items-center justify-center">

                {/* LAYER 1: Shared Orbit Rings (Background) - 2 Rings Only */}
                {[0, 1].map((orbitIndex) => {
                    // Visual sizes for the orbit rings
                    // Inner Ring (0): 350px Mobile / 330px Desktop (Tighter)
                    // Outer Ring (1): 480px Mobile / 460px Desktop (Much Tighter)
                    const visualSize = orbitIndex === 0 ? (isMobile ? 350 : 330) : (isMobile ? 480 : 460);

                    return (
                        <div key={`orbit-ring-${orbitIndex}`} className="absolute flex items-center justify-center">
                            {/* Base Solid Ring */}
                            <div
                                className="absolute rounded-full border-[3px] border-[#d4af37]/30 shadow-[0_0_20px_rgba(212,175,55,0.2)] pointer-events-none z-10"
                                style={{ width: visualSize, height: visualSize }}
                            />
                            {/* Decorative 'Tech' Dashes */}
                            <div
                                className="absolute rounded-full border-[2px] border-amber-500/20 pointer-events-none z-10"
                                style={{
                                    width: visualSize + 6,
                                    height: visualSize + 6,
                                    borderStyle: "dashed",
                                    opacity: 0.5
                                }}
                            />
                        </div>
                    );
                })}

                {/* LAYER 1.5: Inner Counter-Rotating Ring */}
                <motion.div
                    className="absolute z-[15] pointer-events-none flex items-center justify-center"
                    style={{
                        width: isMobile ? "290px" : "270px", // Adjusted for tighter inner ring
                        height: isMobile ? "290px" : "270px",
                    }}
                    animate={{ rotate: -360 }}
                    transition={{
                        duration: 80,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    <svg className="w-full h-full" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
                        <circle cx="50" cy="50" r="48" fill="none" stroke="#78350f" strokeWidth="1" opacity="0.3" />
                        <circle
                            cx="50" cy="50" r="48" fill="none" stroke="#f59e0b" strokeWidth="4"
                            strokeLinecap="round" strokeDasharray="25 75"
                            style={{ filter: "drop-shadow(0 0 8px rgba(245, 158, 11, 0.8))" }}
                        />
                        <circle
                            cx="50" cy="50" r="48" fill="none" stroke="#fbbf24" strokeWidth="6"
                            strokeDasharray="0.5 99.5" strokeDashoffset="12" opacity="0.8"
                        />
                    </svg>
                </motion.div>

                {/* LAYER 2: Sun (Middle) - Z-INDEX 20 */}
                <div className="absolute z-20 flex items-center justify-center">
                    <Sun />
                </div>

                {/* LAYER 3: Planets (Grouped on 2 Rings - Trigonometric Positioning) */}
                {planets.map((planet, index) => {
                    // Determine which ring this planet belongs to (0 or 1)
                    // First 3 planets go to Inner Ring (0)
                    // Next 3 planets go to Outer Ring (1)
                    const orbitIndex = index < 3 ? 0 : 1;

                    // Match the visual diameter defined above
                    const ringDiameter = orbitIndex === 0 ? (isMobile ? 350 : 330) : (isMobile ? 480 : 460);
                    const radius = ringDiameter / 2;

                    // Speed: UNIFIED Speed so they never overlap
                    const durationSeconds = 50;

                    // Starting Angle
                    // Inner Ring: 0, 120, 240
                    // Outer Ring: 60, 180, 300 (Offset by 60deg to sit "between" inner planets)
                    let angleOffsetDeg = (index % 3) * 120;
                    if (orbitIndex === 1) {
                        angleOffsetDeg += 60;
                    }

                    // Convert to Radians for Math.cos/sin
                    const angleOffsetRad = (angleOffsetDeg * Math.PI) / 180;

                    return (
                        <OrbitingPlanet
                            key={`planet-orbiter-${planet.id}`}
                            radius={radius}
                            duration={durationSeconds}
                            initialAngle={angleOffsetRad}
                        >
                            <div className="flex items-center justify-center pointer-events-auto transform scale-[0.6]">
                                <Planet planet={planet} index={index} />
                            </div>
                        </OrbitingPlanet>
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
        </div >
    );
}

// Helper Component for Trigonometric Orbiting (Ferris Wheel Movement)
// This moves the CENTER of the component in a circle, but DOES NOT rotate the component itself.
// This solves the "upside down text" issue completely.
function OrbitingPlanet({
    radius,
    duration,
    initialAngle, // Radians
    children
}: {
    radius: number;
    duration: number; // Seconds
    initialAngle: number;
    children: React.ReactNode;
}) {
    const time = useTime();

    // Calculate X and Y based on time
    // angle = (time / duration) * 2PI + initialAngle
    const x = useTransform(time, (t) => {
        // t is in ms, convert to seconds
        const timeSeconds = t / 1000;
        // Full circle (2PI) is completed in 'duration' seconds
        const angle = (timeSeconds / duration) * (2 * Math.PI) + initialAngle;
        return radius * Math.cos(angle);
    });

    const y = useTransform(time, (t) => {
        const timeSeconds = t / 1000;
        const angle = (timeSeconds / duration) * (2 * Math.PI) + initialAngle;
        return radius * Math.sin(angle);
    });

    return (
        <motion.div
            className="absolute z-30 flex items-center justify-center"
            style={{ x, y }}
        >
            {children}
        </motion.div>
    );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Lock } from "lucide-react";
import { type Planet as PlanetType } from "@/data/curriculum";

interface PlanetProps {
    planet: PlanetType;
    index: number; // Used for staggering animations
}

export function Planet({ planet, index }: PlanetProps) {
    const isUnlocked = planet.status === "unlocked";

    return (
        <div className="relative group flex flex-col items-center gap-2">
            <Link
                href={isUnlocked ? `/spec/${planet.id}` : "#"}
                className={`
                    relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full transition-all duration-500
                    ${!isUnlocked && "cursor-not-allowed"}
                `}
            >
                {/* 
                   PLANET VISUALS 
                */}
                {isUnlocked ? (
                    // UNLOCKED: Premium Apple Aero Glass (Vibrant)
                    <div
                        className="absolute inset-0 rounded-full overflow-hidden"
                        style={{
                            // More vibrant gradient (60% to 10%) for better visibility
                            background: `linear-gradient(135deg, ${planet.color}99 0%, ${planet.color}20 100%)`,
                            backdropFilter: "blur(6px)",
                            boxShadow: `
                                0 4px 15px 0 rgba(0, 0, 0, 0.4),                 /* Deep soft shadow */
                                inset 0 0 0 1px rgba(255, 255, 255, 0.4),        /* Stronger sharp rim */
                                inset 0 0 20px ${planet.color}60                 /* Strong inner color glow */
                            `
                        }}
                    >
                        {/* Stronger Specular Highlight */}
                        <div className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent opacity-100 rounded-t-full" />

                        {/* Inner subtle pulse */}
                        <motion.div
                            className="absolute inset-0 bg-white/10"
                            animate={{ opacity: [0, 0.2, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>
                ) : (
                    // LOCKED: Frosted White/Gray Glass (Clean, No Inner Lock)
                    <div
                        className="absolute inset-0 rounded-full overflow-hidden"
                        style={{
                            background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 100%)",
                            backdropFilter: "blur(6px)", // Less blur to avoid artifacts
                            border: "1px solid rgba(255,255,255,0.15)",
                            boxShadow: "inset 0 0 15px rgba(0,0,0,0.5)"
                        }}
                    >
                        {/* Metallic sheen */}
                        <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/10 to-transparent rounded-t-full" />
                    </div>
                )}

                {/* ICON (Floating inside) */}
                <div className={`
                    relative z-10 text-3xl md:text-4xl 
                    transform transition-transform group-hover:scale-110 
                    ${isUnlocked
                        ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" // Bright glow for unlocked
                        : "opacity-40 grayscale text-zinc-400" // Dim for locked
                    }
                `}>
                    {planet.icon}
                </div>
            </Link>

            {/* LABEL (Floating below) */}
            <span className={`text-xs md:text-sm font-bold uppercase tracking-wider text-bevel px-2 py-1 rounded bg-black/40 backdrop-blur-sm border border-white/5 
                ${isUnlocked ? "text-white" : "text-zinc-600"}`}>
                {planet.title}
            </span>
        </div>
    );
}

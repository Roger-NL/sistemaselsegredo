"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
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
                   PLANET ICONS ONLY (No backgrounds, radial fade, glow) 
                */}
                <div
                    className="relative w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
                >
                    {/* Neon Blue Ring Container */}
                    <div
                        className="relative w-full h-full flex items-center justify-center rounded-full overflow-hidden"
                        style={{
                            // Neon Blue Border & Glow - EXTRA BOLD
                            border: "4px solid rgba(6, 182, 212, 1)", // Solid Cyan
                            boxShadow: `
                                0 0 25px rgba(6, 182, 212, 0.9),     /* Intense Outer Glow */
                                inset 0 0 15px rgba(6, 182, 212, 0.5) /* Inner Glow */
                            `,
                            backgroundColor: "#000" // Black background to prevent bleeding
                        }}
                    >
                        {planet.imagePath ? (
                            <div
                                className="w-full h-full relative"
                                style={{
                                    // Keep the inner color glow for the icon itself if unlocked
                                    filter: isUnlocked ? `drop-shadow(0 0 10px ${planet.color})` : "none"
                                }}
                            >
                                <Image
                                    src={planet.imagePath}
                                    alt={planet.title}
                                    fill
                                    className="object-cover rounded-full transition-all duration-500"
                                    style={{
                                        // Force strict grayscale/darkness for locked state via inline style
                                        filter: !isUnlocked ? "grayscale(100%) brightness(30%)" : "none"
                                    }}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </div>
                        ) : (
                            <span
                                className={`text-3xl md:text-4xl transition-all duration-500 ${!isUnlocked ? "opacity-40 grayscale" : ""}`}
                                style={{
                                    color: "white",
                                    textShadow: !isUnlocked ? "none" : `0 0 15px ${planet.color}, 0 0 30px ${planet.color}`
                                }}
                            >
                                {planet.icon}
                            </span>
                        )}
                    </div>
                </div>
            </Link>

            {/* LABEL (Floating below) */}
            {/* LABEL (Floating below) */}
            <div className={`
                mt-3 px-3 py-1.5 rounded-lg
                bg-black/80 backdrop-blur-md border border-white/10 shadow-xl
                flex flex-col items-center justify-center
                transform transition-all duration-300
                group-hover:scale-105 group-hover:border-amber-500/30
            `}>
                <span className={`
                    text-[10px] md:text-xs font-black uppercase tracking-widest leading-tight text-center
                    ${isUnlocked
                        ? "text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
                        : "text-zinc-500"
                    }
                    max-w-[120px]
                `}>
                    {planet.title}
                </span>
            </div>
        </div>
    );
}

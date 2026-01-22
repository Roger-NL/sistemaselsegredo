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
                    // UNLOCKED: Sphere of Crystal/Energy
                    <div
                        className="absolute inset-0 rounded-full glass-elite overflow-hidden"
                        style={{
                            boxShadow: `0 0 20px ${planet.color}40, inset 0 0 20px ${planet.color}20`,
                            border: `1px solid ${planet.color}60`
                        }}
                    >
                        {/* Inner glow pulse */}
                        <motion.div
                            className="absolute inset-0 bg-white/10"
                            animate={{ opacity: [0.1, 0.3, 0.1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />
                    </div>
                ) : (
                    // LOCKED: Onyx Sphere
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: "radial-gradient(circle at 30% 30%, #3f3f46 0%, #09090b 60%, #000000 100%)",
                            boxShadow: "inset 0 2px 10px rgba(255,255,255,0.1), 0 10px 20px rgba(0,0,0,0.8)"
                        }}
                    >
                        {/* Metallic sheen */}
                        <div className="absolute top-2 left-4 w-6 h-3 bg-white/5 blur-sm rounded-full rotate-[-20deg]" />

                        {/* Embossed Lock */}
                        <div className="absolute inset-0 flex items-center justify-center text-black/50 drop-shadow-[0_1px_0_rgba(255,255,255,0.1)]">
                            <Lock className="w-8 h-8 opacity-40 mix-blend-overlay" />
                        </div>
                    </div>
                )}

                {/* ICON (Floating inside) */}
                <div className={`relative z-10 text-4xl filter drop-shadow-lg transform transition-transform group-hover:scale-110 ${!isUnlocked && "opacity-20 grayscale"}`}>
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

"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Lock, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";
import { type Pillar } from "@/data/curriculum";

interface ExplorerHUDProps {
    isOpen: boolean;
    onClose: () => void;
    pillars: Pillar[];
    currentPillarNumber: number;
}

export function ExplorerHUD({ isOpen, onClose, pillars, currentPillarNumber }: ExplorerHUDProps) {
    // Use Portal to render outside the scaled/overflow-hidden container
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    // Portal target (document.body)
    if (typeof document === "undefined") return null;

    // Lógica de Ranks Militares
    const completedCount = pillars.filter(p => p.status === "completed").length;

    const getRank = (count: number) => {
        const ranks = [
            "Recruta",          // 0
            "Cadete",           // 1
            "Soldado",          // 2
            "Cabo",             // 3
            "Sargento",         // 4
            "Tenente",          // 5
            "Capitão",          // 6
            "Major",            // 7
            "Coronel",          // 8
            "General de Exército" // 9
        ];
        return ranks[count] || "Recruta";
    };

    const currentRank = getRank(completedCount);

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    {/* Backdrop (Onyx Blur) */}
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(40px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        className="absolute inset-0 bg-black/95 z-0"
                        onClick={onClose}
                    />

                    {/* The HUD Panel */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative z-10 w-full max-w-2xl bg-[#0a0a0a] border border-[#d4af37]/40 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            boxShadow: "0 0 80px rgba(0,0,0,0.9), 0 0 30px rgba(212, 175, 55, 0.15)"
                        }}
                    >
                        {/* Decorative Corner Accents */}
                        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#d4af37] rounded-tl-xl pointer-events-none opacity-50" />
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#d4af37] rounded-br-xl pointer-events-none opacity-50" />

                        {/* Header: Imperial Style */}
                        <div className="relative bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border-b border-[#d4af37]/20 p-6 flex items-center justify-between z-10 shrink-0">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-serif font-black text-white uppercase tracking-tight text-bevel">
                                    Arquivos do <span className="text-[#d4af37]">Império</span>
                                </h2>
                                <p className="text-xs text-[#d4af37]/60 font-mono tracking-[0.2em] uppercase mt-1">
                                    Patente Atual: <span className="text-[#d4af37] font-bold">{currentRank}</span>
                                </p>
                            </div>

                            {/* Close Button - Minimalist */}
                            <button
                                onClick={onClose}
                                className="group relative w-8 h-8 flex items-center justify-center rounded-full border border-[#d4af37]/20 hover:bg-[#d4af37] hover:text-black hover:border-[#d4af37] transition-all"
                            >
                                <X className="w-4 h-4 text-[#d4af37] group-hover:text-black transition-colors" />
                            </button>
                        </div>

                        {/* Body: Module Grid */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 custom-scrollbar">
                            {pillars.map((pillar, index) => (
                                <HUDModule
                                    key={pillar.id}
                                    pillar={pillar}
                                    index={index}
                                    isActive={index + 1 === currentPillarNumber}
                                    onClose={onClose}
                                />
                            ))}
                        </div>

                        {/* Footer: Status line */}
                        <div className="bg-[#050505] border-t border-[#d4af37]/10 p-3 flex justify-between items-center text-[10px] text-zinc-600 font-mono uppercase px-6 shrink-0">
                            <span className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
                                Sistema Operacional V4.0
                            </span>
                            <span className="opacity-50">
                                ES ACADEMY SECURE PROTOCOL
                            </span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}

function HUDModule({ pillar, index, isActive, onClose }: { pillar: Pillar, index: number, isActive: boolean, onClose: () => void }) {
    const isLocked = pillar.status === "locked";
    const isCompleted = pillar.status === "completed";

    return (
        <Wrapper href={isLocked ? undefined : pillar.routerPath} onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                    relative group flex items-center gap-5 p-5 rounded-lg border transition-all duration-300 overflow-hidden
                    ${isLocked
                        ? "bg-zinc-900/20 border-zinc-800 opacity-50 grayscale"
                        : isCompleted
                            ? "bg-gradient-to-r from-[#d4af37]/10 to-transparent border-[#d4af37]/30 hover:border-[#d4af37]/60"
                            : isActive
                                ? "bg-[#d4af37] border-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.2)]"
                                : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-600"
                    }
                `}
            >
                {/* Background Pattern for Active/Completed */}
                {!isLocked && (
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                )}

                {/* Number Indicator */}
                <div className={`
                    relative w-12 h-12 flex items-center justify-center rounded border-2 font-black text-lg shrink-0
                    ${isActive
                        ? "bg-black text-[#d4af37] border-black"
                        : isCompleted
                            ? "bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]"
                            : "bg-transparent text-zinc-600 border-zinc-800"
                    }
                `}>
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : (index + 1).toString().padStart(2, '0')}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-bold text-base uppercase tracking-wide truncate
                            ${isActive ? "text-black" : isCompleted ? "text-[#d4af37]" : isLocked ? "text-zinc-500" : "text-zinc-200"}
                        `}>
                            {pillar.title}
                        </h3>
                        {isLocked && <Lock className="w-3 h-3 text-zinc-600" />}
                    </div>

                    <p className={`text-xs truncate font-medium
                        ${isActive ? "text-black/70" : "text-zinc-500"}
                    `}>
                        {pillar.description}
                    </p>
                </div>

                {/* Arrow Action */}
                {!isLocked && (
                    <div className={`
                        w-8 h-8 flex items-center justify-center rounded-full transition-transform group-hover:translate-x-1
                        ${isActive ? "bg-black/10 text-black" : "bg-zinc-800 text-zinc-400 group-hover:bg-[#d4af37] group-hover:text-black"}
                    `}>
                        <ArrowRight className="w-4 h-4" />
                    </div>
                )}
            </motion.div>
        </Wrapper>
    );
}

function Wrapper({ href, children, onClick }: { href?: string, children: React.ReactNode, onClick: () => void }) {
    if (!href) return <div className="cursor-not-allowed">{children}</div>;
    return <Link href={href} onClick={onClick} className="block">{children}</Link>;
}

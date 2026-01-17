"use client";

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
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    {/* Backdrop (Onyx Blur) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#050505]/90 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* The HUD Panel */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="relative w-full max-w-2xl bg-black border border-[#d4af37]/30 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            boxShadow: "0 0 50px rgba(0,0,0,0.8), 0 0 20px rgba(212, 175, 55, 0.1)"
                        }}
                    >
                        {/* Header: Tech Bar */}
                        <div className="relative bg-gradient-to-r from-zinc-900 via-black to-zinc-900 border-b border-[#d4af37]/20 p-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-8 bg-[#d4af37] rounded-full shadow-[0_0_10px_#d4af37]" />
                                <div>
                                    <h2 className="text-xl font-bold text-white uppercase tracking-[0.2em] text-bevel">
                                        Navegação
                                    </h2>
                                    <p className="text-[10px] text-[#d4af37] font-mono tracking-widest uppercase opacity-80">
                                        Sistema Tático V3.0
                                    </p>
                                </div>
                            </div>

                            {/* Close Button "Emergency" style */}
                            <button
                                onClick={onClose}
                                className="group relative w-12 h-12 flex items-center justify-center rounded bg-red-600/20 border border-red-500/50 shadow-[inset_0_0_15px_rgba(239,68,68,0.3),0_0_10px_rgba(239,68,68,0.2)] backdrop-blur-sm hover:bg-red-600/30 transition-all active:scale-95"
                            >
                                <X className="w-6 h-6 text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
                                <div className="absolute inset-0 rounded bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                            </button>
                        </div>

                        {/* Body: Module Grid */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/50 via-black to-black">
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
                        <div className="bg-zinc-950 border-t border-white/5 p-2 flex justify-between items-center text-[10px] text-zinc-600 font-mono uppercase px-4">
                            <span>Conexão Segura</span>
                            <span className="flex items-center gap-2">
                                <Activity className="w-3 h-3 text-emerald-500" />
                                Online
                            </span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function HUDModule({ pillar, index, isActive, onClose }: { pillar: Pillar, index: number, isActive: boolean, onClose: () => void }) {
    const isLocked = pillar.status === "locked";
    const isCompleted = pillar.status === "completed";

    return (
        <Wrapper href={isLocked ? undefined : pillar.routerPath} onClick={onClose}>
            <div
                className={`
                    relative group flex items-center gap-4 p-4 rounded border transition-all duration-300
                    ${isLocked
                        ? "bg-zinc-900/50 border-zinc-800 opacity-60 grayscale"
                        : isCompleted
                            ? "bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:bg-emerald-900/30"
                            : isActive
                                ? "bg-[#d4af37]/5 border-[#d4af37]/40 hover:bg-[#d4af37]/10"
                                : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700"
                    }
                `}
            >
                {/* Active Indicator Line */}
                {isActive && (
                    <motion.div
                        layoutId="active-glow"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-[#d4af37] shadow-[0_0_15px_#d4af37]"
                    />
                )}

                {/* Number / Status Icon */}
                <div className={`
                    w-12 h-12 flex items-center justify-center rounded bg-black border
                    ${isLocked ? "border-zinc-800 text-zinc-600" :
                        isCompleted ? "border-emerald-500/30 text-emerald-400 bg-emerald-950/30" :
                            isActive ? "border-[#d4af37]/50 text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)]" :
                                "border-zinc-700 text-zinc-400"}
                `}>
                    {isLocked ? <Lock className="w-5 h-5" /> :
                        isCompleted ? <CheckCircle2 className="w-6 h-6" /> :
                            <span className="text-xl font-bold font-mono">{(index + 1).toString().padStart(2, '0')}</span>}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h3 className={`font-bold text-sm uppercase tracking-wide mb-1
                        ${isLocked ? "text-zinc-500" : isCompleted ? "text-emerald-400" : isActive ? "text-[#d4af37]" : "text-zinc-300"}
                    `}>
                        {pillar.title}
                    </h3>
                    {!isLocked && (
                        <p className="text-xs text-zinc-500 line-clamp-1">{pillar.description}</p>
                    )}
                </div>

                {/* Arrow */}
                {!isLocked && (
                    <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1
                        ${isActive ? "text-[#d4af37]" : "text-zinc-600"}
                    `} />
                )}
            </div>
        </Wrapper>
    );
}

function Wrapper({ href, children, onClick }: { href?: string, children: React.ReactNode, onClick: () => void }) {
    if (!href) return <div className="cursor-not-allowed">{children}</div>;
    return <Link href={href} onClick={onClick} className="block">{children}</Link>;
}

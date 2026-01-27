"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, ChevronRight, Check, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type Pillar } from "@/data/curriculum";
import { getRank } from "@/utils/ranks";
import { useProgress } from "@/context/ProgressContext";

interface TheHUDProps {
    isOpen: boolean;
    onClose: () => void;
    pillars: Pillar[];
    completedCount: number;
}

export function TheHUD({ isOpen, onClose, pillars, completedCount }: TheHUDProps) {
    const [mounted, setMounted] = useState(false);
    const currentRank = getRank(completedCount);
    const router = useRouter();
    const { areAllPillarsComplete, canChooseSpecialization } = useProgress();

    const allComplete = areAllPillarsComplete();
    const canSelectSpecialization = canChooseSpecialization();

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted || typeof document === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-8">
                    {/* Backdrop Técnico */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/95 backdrop-blur-md z-0"
                        onClick={onClose}
                    >
                        {/* Grid de fundo sutil */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(238,244,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(238,244,212,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                    </motion.div>

                    {/* HUD Container */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", damping: 30, stiffness: 400 }}
                        className="relative z-10 w-full max-w-4xl bg-black border border-[#EEF4D4]/30 shadow-[0_0_50px_rgba(238,244,212,0.1)] flex flex-col max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Decorative Corners */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#EEF4D4]" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#EEF4D4]" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#EEF4D4]" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#EEF4D4]" />

                        {/* Header Técnico */}
                        <div className="flex items-start justify-between p-8 border-b border-[#EEF4D4]/10 bg-[#EEF4D4]/5">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="w-2 h-2 bg-[#EEF4D4] animate-pulse" />
                                    <span className="text-[10px] font-mono tracking-[0.3em] text-[#EEF4D4]/60 uppercase">System Access</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-serif text-[#EEF4D4] tracking-tight">
                                    Matriz de <span className="italic opacity-50">Conhecimento</span>
                                </h2>
                            </div>

                            <div className="flex flex-col items-end gap-4">
                                <button
                                    onClick={onClose}
                                    className="group flex items-center gap-2 text-[#EEF4D4]/60 hover:text-[#EEF4D4] transition-colors"
                                >
                                    <span className="text-[10px] font-mono uppercase tracking-widest group-hover:tracking-[0.2em] transition-all">Close</span>
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="text-right">
                                    <div className="text-[10px] text-[#EEF4D4]/40 font-mono uppercase tracking-widest">Patente</div>
                                    <div className="text-sm font-bold text-[#EEF4D4] uppercase tracking-wider border border-[#EEF4D4]/20 px-3 py-1 mt-1 bg-black">
                                        {currentRank}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lista de Pilares Grid */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pillars.map((pillar, index) => {
                                    const isLocked = pillar.status === "locked";
                                    const isCompleted = pillar.status === "completed";
                                    const isActive = !isLocked && !isCompleted;
                                    const pillarNum = (index + 1).toString().padStart(2, '0');

                                    if (isLocked) {
                                        return (
                                            <div
                                                key={pillar.id}
                                                className="group relative p-6 border border-[#EEF4D4]/10 bg-[#EEF4D4]/[0.02] flex items-center justify-between opacity-50 grayscale cursor-not-allowed overflow-hidden"
                                            >
                                                {/* Scanline effect */}
                                                <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(0,0,0,0.8)_50%,transparent_100%)] bg-[size:100%_4px] opacity-20" />

                                                <div className="flex items-center gap-6">
                                                    <span className="text-2xl font-mono text-[#EEF4D4]/20 font-bold tracking-tighter">
                                                        {pillarNum}
                                                    </span>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#EEF4D4]/30 mb-1">
                                                            Bloqueado
                                                        </span>
                                                        <span className="font-serif text-lg text-[#EEF4D4]/40">
                                                            {pillar.title}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Lock className="w-4 h-4 text-[#EEF4D4]/20" />
                                            </div>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={pillar.id}
                                            href={`/pilar/${index + 1}`}
                                            onClick={onClose}
                                            className="group relative block overflow-hidden"
                                        >
                                            <div className={`
                                                relative p-6 border transition-all duration-300 flex items-center justify-between
                                                ${isActive
                                                    ? "bg-[#EEF4D4] border-[#EEF4D4]"
                                                    : "bg-black border-[#EEF4D4]/40 hover:border-[#EEF4D4] hover:bg-[#EEF4D4]/5"}
                                            `}>
                                                <div className="flex items-center gap-6 z-10">
                                                    <span className={`
                                                        text-2xl font-mono font-bold tracking-tighter transition-colors
                                                        ${isActive ? "text-black" : "text-[#EEF4D4] group-hover:text-[#EEF4D4]"}
                                                    `}>
                                                        {pillarNum}
                                                    </span>

                                                    <div className="flex flex-col">
                                                        <span className={`
                                                            text-[10px] font-mono uppercase tracking-[0.2em] mb-1 transition-colors
                                                            ${isActive ? "text-black/60" : "text-[#EEF4D4]/60"}
                                                        `}>
                                                            {isCompleted ? "Completado" : "Disponível"}
                                                        </span>
                                                        <span className={`
                                                            font-serif text-lg tracking-wide transition-colors
                                                            ${isActive ? "text-black font-medium" : "text-[#EEF4D4]"}
                                                        `}>
                                                            {pillar.title}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="z-10">
                                                    {isCompleted ? (
                                                        <div className="w-8 h-8 rounded-full border border-[#EEF4D4]/40 flex items-center justify-center bg-[#EEF4D4]/10">
                                                            <Check className="w-4 h-4 text-[#EEF4D4]" />
                                                        </div>
                                                    ) : (
                                                        <ChevronRight className={`
                                                            w-5 h-5 transition-transform duration-300 group-hover:translate-x-1
                                                            ${isActive ? "text-black" : "text-[#EEF4D4]"}
                                                        `} />
                                                    )}
                                                </div>

                                                {/* Efeito Glow para Active */}
                                                {isActive && (
                                                    <div className="absolute inset-0 bg-[#EEF4D4] blur-[2px] opacity-20 pointer-events-none" />
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })}

                                {/* Pilar 10 - Especialidades (Sempre desbloqueado, seleção interna é que é controlada) */}
                                <div
                                    onClick={() => {
                                        onClose();
                                        router.push("/especialidades");
                                    }}
                                    className="group relative p-6 border transition-all duration-300 flex items-center justify-between overflow-hidden bg-gradient-to-r from-violet-500/20 to-purple-500/20 border-violet-500/50 hover:border-violet-400 hover:from-violet-500/30 hover:to-purple-500/30 cursor-pointer"
                                >
                                    <div className="flex items-center gap-6 z-10">
                                        <span className="text-2xl font-mono font-bold tracking-tighter text-violet-400">
                                            10
                                        </span>

                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-mono uppercase tracking-[0.2em] mb-1 text-violet-400">
                                                {allComplete ? "Disponível" : "Visualizar"}
                                            </span>
                                            <span className="font-serif text-lg tracking-wide text-violet-300 font-medium">
                                                Especialidades
                                            </span>
                                        </div>
                                    </div>

                                    <div className="z-10">
                                        <Star className="w-5 h-5 text-violet-400 group-hover:scale-110 transition-transform" />
                                    </div>

                                    {/* Efeito Glow */}
                                    <div className="absolute inset-0 bg-violet-500 blur-[2px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity" />
                                </div>
                            </div>
                        </div>

                        {/* Footer Status */}
                        <div className="border-t border-[#EEF4D4]/10 p-4 bg-[#EEF4D4]/5 flex justify-between items-center text-[10px] font-mono text-[#EEF4D4]/40 uppercase tracking-widest">
                            <span>ES Academy v4.0</span>
                            <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                Online
                            </span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}

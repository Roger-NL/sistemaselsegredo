"use client";

import { useProgress } from "@/context/ProgressContext";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Activity, Globe2, ShieldCheck, Star } from "lucide-react";

export const GlobalStatusPanel = () => {
    const { getGlobalProgress, isCourseFullyComplete, getCompletedCount } = useProgress();
    const progress = getGlobalProgress();
    const isComplete = isCourseFullyComplete();
    const completedCount = getCompletedCount();
    const lockedCount = 9 - completedCount;

    return (
        <>
            {/* Desktop progress panel removed - no longer needed */}

            {/* Overlay de Status (Mobile/Desktop) */}
            <AnimatePresence>
                {/* Visual Scarcity Indicator (Quando não completo) */}
                {!isComplete && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: 1 }}
                        className="fixed top-20 md:top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full flex justify-center px-4"
                    >
                        <div className="bg-black/60 backdrop-blur-md border border-red-500/20 rounded-full pl-4 pr-6 py-2 flex items-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-emerald-100 font-bold text-xs tracking-widest uppercase">
                                    {completedCount}/9 Liberado
                                </span>
                            </div>
                            <div className="w-px h-4 bg-white/10" />
                            <div className="flex items-center gap-2">
                                <span className="text-red-400 font-bold text-xs tracking-widest uppercase flex items-center gap-1">
                                    <span className="text-[10px]">🔒</span>
                                    {lockedCount} Destinos Bloqueados
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Mission Accomplished Overlay */}
                {isComplete && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="fixed top-20 md:top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full flex justify-center px-4"
                    >
                        <div className="bg-black/80 backdrop-blur-xl border border-emerald-500/30 rounded-full pl-2 pr-6 py-2 flex items-center gap-4 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                            <div className="bg-emerald-500/20 p-2 rounded-full">
                                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-emerald-100 font-bold text-xs tracking-widest uppercase">
                                    Status: Operativo de Elite
                                </h3>
                                <p className="text-emerald-500/60 text-[10px] font-mono">
                                    Todas as missões concluídas com sucesso.
                                </p>
                            </div>
                            <div className="flex gap-1 ml-2">
                                {[1, 2, 3].map(i => (
                                    <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

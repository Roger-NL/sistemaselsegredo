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
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: 1, duration: 0.5 }}
                        className="absolute left-1/2 -translate-x-1/2 z-20 w-[300px] md:w-[500px] flex justify-between items-center px-2 py-2 border-b border-white/10 top-1/2 -mt-[170px] md:-mt-[290px]"
                    >
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-2 text-[#EEF4D4] font-mono text-[10px] md:text-xs tracking-widest uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#EEF4D4] animate-pulse" />
                                <span className="font-bold">{completedCount}/9</span> Liberado
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-2 text-white/40 font-mono text-[10px] md:text-xs tracking-widest uppercase">
                                <span className="text-[10px]">🔒</span>
                                <span className="font-bold text-white/60">{lockedCount}</span> Bloqueados
                            </span>
                        </div>
                    </motion.div>
                )}

                {/* Mission Accomplished Overlay - Consistent Tech Design */}
                {isComplete && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute left-1/2 -translate-x-1/2 z-20 w-[300px] md:w-[500px] flex flex-col items-center justify-center p-4 border border-emerald-500/30 bg-emerald-950/20 backdrop-blur-sm rounded-lg"
                        style={{
                            top: "50%",
                            marginTop: "-300px", // Higher up for the big badge
                        }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                            <h3 className="text-emerald-100 font-bold text-xs md:text-sm tracking-[0.2em] uppercase">
                                Status: Operativo de Elite
                            </h3>
                        </div>
                        <div className="w-full h-px bg-emerald-500/20 mb-2" />
                        <div className="flex gap-1">
                            {[1, 2, 3].map(i => (
                                <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence >
        </>
    );
};

"use client";

import { useProgress } from "@/context/ProgressContext";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Activity, Globe2, ShieldCheck, Star } from "lucide-react";

export const GlobalStatusPanel = () => {
    const { getGlobalProgress, isCourseFullyComplete } = useProgress();
    const progress = getGlobalProgress();
    const isComplete = isCourseFullyComplete();

    return (
        <>
            {/* Painel Flutuante Lateral (Desktop) */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:block"
            >
                <div className="flex flex-col items-center gap-6">
                    {/* Barra de Progresso Vertical */}
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full p-3 py-6 flex flex-col items-center shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                        <div className="text-[10px] font-mono text-white/40 mb-4 [writing-mode:vertical-rl] rotate-180 tracking-[0.2em] uppercase h-24 flex items-center justify-center">
                            Global Progress
                        </div>
                        
                        <div className="w-2 h-32 bg-white/5 rounded-full relative overflow-hidden mb-2">
                            <motion.div 
                                className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-violet-600 via-fuchsia-500 to-cyan-400"
                                initial={{ height: 0 }}
                                animate={{ height: `${progress}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            >
                                <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/noise.png')] opacity-20"></div>
                            </motion.div>
                        </div>

                        <div className="text-sm font-bold font-mono text-cyan-400 tabular-nums">
                            {progress}%
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`p-4 rounded-2xl border backdrop-blur-md transition-all duration-500 ${
                        isComplete 
                            ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
                            : "bg-white/5 border-white/10"
                    }`}>
                        {isComplete ? (
                            <Trophy className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                        ) : (
                            <Activity className="w-6 h-6 text-violet-400" />
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Overlay de Missão Cumprida (Mobile/Desktop) */}
            <AnimatePresence>
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
                                {[1,2,3].map(i => (
                                    <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

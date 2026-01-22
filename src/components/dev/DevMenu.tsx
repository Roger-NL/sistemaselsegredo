"use client";

import { useState, useEffect } from "react";
import { useProgress } from "@/context/ProgressContext";
import { Wrench, ChevronUp, ChevronDown, RefreshCw, Unlock, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SystemIntegrationModal } from "@/components/ui/SystemIntegrationModal";

export function DevMenu() {
    const { resetProgress, setPillarLevel, getCurrentPillarNumber, completePillar } = useProgress();
    const [isOpen, setIsOpen] = useState(false);
    const [showSystemIntegration, setShowSystemIntegration] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    // Only show in development (or if specifically enabled)
    // For now we show it always as requested

    return (
        <>
            {/* Floating Toggle Button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed bottom-4 right-4 z-[9999] p-3 bg-black/80 border border-[#d4af37]/50 text-[#d4af37] rounded-full shadow-lg hover:bg-[#d4af37] hover:text-black transition-all"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Wrench size={24} />
            </motion.button>

            {/* Menu Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-20 right-4 z-[9999] w-80 bg-[#0a0a0a] border border-[#d4af37] rounded-xl shadow-2xl p-4 overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-4 border-b border-[#d4af37]/20 pb-2">
                            <h3 className="text-[#d4af37] font-bold font-mono flex items-center gap-2">
                                <Wrench size={16} /> DEV TOOLS
                            </h3>
                            <span className="text-xs text-gray-500">v1.0</span>
                        </div>

                        <div className="space-y-4">
                            {/* Level Selector */}
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400 uppercase tracking-wider">Set Level</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setPillarLevel(level)}
                                            className={`p-2 text-xs font-bold rounded border ${getCurrentPillarNumber() === level
                                                ? "bg-[#d4af37] text-black border-[#d4af37]"
                                                : "bg-black text-gray-400 border-gray-800 hover:border-[#d4af37]"
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400 uppercase tracking-wider">Actions</label>

                                <button
                                    onClick={() => setShowSystemIntegration(true)}
                                    className="w-full flex items-center justify-center gap-2 p-2 bg-blue-900/30 border border-blue-500/50 text-blue-400 rounded hover:bg-blue-900/50 transition-all text-sm font-mono"
                                >
                                    <Play size={14} /> TEST ANIMATION
                                </button>

                                <button
                                    onClick={() => {
                                        const current = getCurrentPillarNumber();
                                        if (current < 9) completePillar(current);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 p-2 bg-green-900/30 border border-green-500/50 text-green-400 rounded hover:bg-green-900/50 transition-all text-sm font-mono"
                                >
                                    <Unlock size={14} /> COMPLETE CURRENT
                                </button>

                                <button
                                    onClick={resetProgress}
                                    className="w-full flex items-center justify-center gap-2 p-2 bg-red-900/30 border border-red-500/50 text-red-400 rounded hover:bg-red-900/50 transition-all text-sm font-mono"
                                >
                                    <RefreshCw size={14} /> RESET ALL
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Jackpot Test Overlay */}
            <SystemIntegrationModal
                isVisible={showSystemIntegration}
                completedPillarNumber={getCurrentPillarNumber()}
                onComplete={() => setShowSystemIntegration(false)}
            />
        </>
    );
}

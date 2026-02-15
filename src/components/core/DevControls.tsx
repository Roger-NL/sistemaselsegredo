"use client";

import { useProgress } from "@/context/ProgressContext";
import { useState } from "react";
import { Settings, ShieldAlert } from "lucide-react";

interface DevControlsProps {
    isAdmin: boolean;
}

export function DevControls({ isAdmin }: DevControlsProps) {
    const { setPillarLevel, resetProgress, completePillar } = useProgress();
    const [isOpen, setIsOpen] = useState(false);

    if (!isAdmin) return null;

    const handleCompleteAll = () => {
        // Completa todos os 9 pilares
        for (let i = 1; i <= 9; i++) {
            completePillar(i);
        }
    };

    return (
        <div className="fixed bottom-4 left-4 z-[99999] pointer-events-auto">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-black/80 text-white p-2 rounded-full border border-white/20 hover:bg-white/20 transition-all hover:rotate-90"
            >
                <Settings size={20} />
            </button>

            {isOpen && (
                <div className="absolute bottom-12 left-0 bg-black/90 border border-white/20 p-4 rounded-lg w-56 space-y-3 backdrop-blur-md shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">Dev Tools</h3>
                        <span className="text-[10px] text-emerald-500 font-mono">v4.0</span>
                    </div>

                    <div>
                        <span className="text-[10px] text-white/30 uppercase block mb-1">Set Level (Unlock)</span>
                        <div className="grid grid-cols-5 gap-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                                <button
                                    key={lvl}
                                    onClick={() => setPillarLevel(lvl)}
                                    className="bg-white/5 text-white/70 text-[10px] py-1 hover:bg-[#EEF4D4] hover:text-black transition-colors rounded border border-white/5"
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/10">
                        <button
                            onClick={handleCompleteAll}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs py-2 rounded hover:bg-emerald-500 hover:text-white transition-colors uppercase font-bold tracking-wider"
                        >
                            <ShieldAlert size={12} />
                            Complete All
                        </button>

                        <button
                            onClick={resetProgress}
                            className="w-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs py-1 rounded hover:bg-red-500 hover:text-white transition-colors uppercase"
                        >
                            Reset Progress
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
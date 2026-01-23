"use client";

import { useState, useEffect, useRef } from "react";
import { useProgress } from "@/context/ProgressContext";
import { useSunSettings } from "@/context/SunSettingsContext";
import { Wrench, ChevronUp, ChevronDown, RefreshCw, Unlock, Play, Sun, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SystemIntegrationModal } from "@/components/ui/SystemIntegrationModal";

// ============================================================================
// SUN CONTROLS COMPONENT - Joystick + Size Slider
// ============================================================================

function SunControls() {
    const { settings, setOffsetX, setOffsetY, setScale, resetSettings } = useSunSettings();
    const joystickRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleJoystickMove = (clientX: number, clientY: number) => {
        if (!joystickRef.current) return;
        const rect = joystickRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate offset from center (-50 to 50)
        let offsetX = ((clientX - centerX) / (rect.width / 2)) * 50;
        let offsetY = ((clientY - centerY) / (rect.height / 2)) * 50;

        // Clamp values
        offsetX = Math.max(-50, Math.min(50, offsetX));
        offsetY = Math.max(-50, Math.min(50, offsetY));

        setOffsetX(offsetX);
        setOffsetY(offsetY);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        handleJoystickMove(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            handleJoystickMove(e.clientX, e.clientY);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
            return () => {
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("mouseup", handleMouseUp);
            };
        }
    }, [isDragging]);

    // Calculate knob position based on current offset
    const knobX = (settings.offsetX / 50) * 35; // 35px max from center
    const knobY = (settings.offsetY / 50) * 35;

    return (
        <div className="space-y-3 pt-3 border-t border-[#d4af37]/20">
            <label className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Sun size={12} /> Sun Controls
            </label>

            {/* Joystick Pad */}
            <div className="flex items-center gap-4">
                <div
                    ref={joystickRef}
                    onMouseDown={handleMouseDown}
                    className="relative w-20 h-20 bg-black border border-[#d4af37]/50 rounded-full cursor-crosshair select-none"
                    style={{ touchAction: "none" }}
                >
                    {/* Center lines */}
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-[#d4af37]/20" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#d4af37]/20" />

                    {/* Knob */}
                    <div
                        className="absolute w-6 h-6 bg-[#d4af37] rounded-full shadow-lg border-2 border-white/30 transition-transform duration-75"
                        style={{
                            left: `calc(50% + ${knobX}px - 12px)`,
                            top: `calc(50% + ${knobY}px - 12px)`,
                        }}
                    />
                </div>

                <div className="flex-1 text-xs text-gray-500 font-mono">
                    <div>X: {settings.offsetX.toFixed(0)}px</div>
                    <div>Y: {settings.offsetY.toFixed(0)}px</div>
                </div>
            </div>

            {/* Size Slider */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                    <span>Size</span>
                    <span className="font-mono">{settings.scale.toFixed(2)}x</span>
                </div>
                <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.05"
                    value={settings.scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
                />
            </div>

            {/* Reset Button */}
            <button
                onClick={resetSettings}
                className="w-full flex items-center justify-center gap-2 p-2 bg-gray-900/50 border border-gray-700 text-gray-400 rounded hover:border-[#d4af37]/50 hover:text-[#d4af37] transition-all text-xs font-mono"
            >
                <RotateCcw size={12} /> RESET SUN
            </button>
        </div>
    );
}

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

                            {/* Sun Controls */}
                            <SunControls />
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

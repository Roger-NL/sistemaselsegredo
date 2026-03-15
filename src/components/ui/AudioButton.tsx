"use client";

import React from "react";
import { Volume2, Volume1, Square } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { useTTS } from "@/hooks/useTTS";

interface AudioButtonProps {
    text: string;
    className?: string;
    size?: "sm" | "md" | "lg";
}

export const AudioButton: React.FC<AudioButtonProps> = ({
    text,
    className,
    size = "sm",
}) => {
    const { speak, stop, toggleSpeed, speed, isPlaying } = useTTS();

    const sizeClasses = {
        sm: "w-6 h-6 p-1",
        md: "w-8 h-8 p-1.5",
        lg: "w-10 h-10 p-2",
    };

    const iconClasses = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5",
    };

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isPlaying) {
            stop();
        } else {
            speak(text);
        }
    };

    const handleRightClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSpeed();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            if (isPlaying) {
                stop();
            } else {
                speak(text);
            }
        }
    };

    // If it's playing, show stop icon.
    // If it's not playing, show volume icon.
    // Differentiate icon slightly based on speed setting.
    const VolumeIcon = speed === 1.0 ? Volume2 : Volume1;

    return (
        <span
            role="button"
            tabIndex={0}
            aria-label={
                isPlaying
                    ? "Parar audio"
                    : `Ouvir em ingles (Velocidade: ${speed}x. Clique com botao direito para alterar a velocidade)`
            }
            onClick={handleClick}
            onContextMenu={handleRightClick}
            onKeyDown={handleKeyDown}
            className={cn(
                "relative rounded-full transition-all inline-flex items-center justify-center border cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:ring-offset-0",
                isPlaying
                    ? "bg-cyan-500/20 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] text-cyan-400"
                    : speed === 0.8
                        ? "bg-amber-950/30 border-amber-500/30 text-amber-500 hover:text-amber-400 hover:border-amber-400/50"
                        : "bg-slate-800/80 border-slate-700/80 text-cyan-500 hover:text-cyan-400 hover:border-cyan-500/50",
                sizeClasses[size],
                className
            )}
            title={
                isPlaying
                    ? "Parar áudio"
                    : `Ouvir em inglês (Velocidade: ${speed}x. Clique com botão direito para alterar a velocidade)`
            }
        >
            {isPlaying ? (
                <Square className={cn("fill-current animate-pulse", iconClasses[size])} />
            ) : (
                <VolumeIcon className={cn("fill-current", iconClasses[size])} />
            )}

            {/* Speed indicator dot for 0.8x */}
            {!isPlaying && speed === 0.8 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full border border-black shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
            )}
        </span>
    );
};

"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================================================
// TACTICAL CARD - Cosmos Wireframe UI Component
// Moldura estilo "Intelligence Agency" com glassmorphism e cantos HUD
// ============================================================================

interface TacticalCardProps {
    children: React.ReactNode;
    className?: string;

    // Header técnico opcional
    systemId?: string;
    status?: "ENCRYPTED" | "LIVE" | "PROCESSING" | "SECURE" | "CLASSIFIED";

    // Variante visual
    variant?: "default" | "neon" | "danger" | "success";

    // Interatividade
    onClick?: () => void;
    hoverable?: boolean;

    // Animate on mount
    animate?: boolean;
}

// Cores das variantes
const variantColors = {
    default: {
        border: "border-white/10",
        corner: "#EEF4D4",
        glow: "rgba(238, 244, 212, 0.3)",
        status: "text-[#EEF4D4]",
    },
    neon: {
        border: "border-violet-500/30",
        corner: "#8b5cf6",
        glow: "rgba(139, 92, 246, 0.4)",
        status: "text-violet-400",
    },
    danger: {
        border: "border-red-500/30",
        corner: "#ef4444",
        glow: "rgba(239, 68, 68, 0.4)",
        status: "text-red-400",
    },
    success: {
        border: "border-emerald-500/30",
        corner: "#10b981",
        glow: "rgba(16, 185, 129, 0.4)",
        status: "text-emerald-400",
    },
};

// Componente dos cantos táticos
function TacticalCorner({
    position,
    color
}: {
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    color: string;
}) {
    const positionClasses = {
        "top-left": "top-0 left-0",
        "top-right": "top-0 right-0",
        "bottom-left": "bottom-0 left-0",
        "bottom-right": "bottom-0 right-0",
    };

    const cornerSymbol = {
        "top-left": "┌",
        "top-right": "┐",
        "bottom-left": "└",
        "bottom-right": "┘",
    };

    return (
        <span
            className={cn(
                "absolute text-lg font-mono select-none pointer-events-none z-10",
                "opacity-60 transition-opacity duration-300 group-hover:opacity-100",
                positionClasses[position]
            )}
            style={{ color }}
        >
            {cornerSymbol[position]}
        </span>
    );
}

export function TacticalCard({
    children,
    className,
    systemId,
    status,
    variant = "default",
    onClick,
    hoverable = false,
    animate = true,
}: TacticalCardProps) {
    const colors = variantColors[variant];

    const cardContent = (
        <div
            className={cn(
                // Base
                "relative group",
                // Glassmorphism - mais escuro para melhor contraste
                "bg-slate-950/80 backdrop-blur-xl",
                // Bordas
                "border",
                colors.border,
                // Layout
                "rounded-lg overflow-hidden",
                // Hover effects
                hoverable && "cursor-pointer transition-all duration-300",
                hoverable && "hover:bg-slate-900/90",
                className
            )}
            onClick={onClick}
            style={{
                boxShadow: hoverable
                    ? `0 0 0 0 ${colors.glow}`
                    : undefined,
            }}
        >
            {/* Tactical Corners */}
            <TacticalCorner position="top-left" color={colors.corner} />
            <TacticalCorner position="top-right" color={colors.corner} />
            <TacticalCorner position="bottom-left" color={colors.corner} />
            <TacticalCorner position="bottom-right" color={colors.corner} />

            {/* Header Técnico (Opcional) */}
            {(systemId || status) && (
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
                    {systemId && (
                        <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
                            SYSTEM_ID // {systemId}
                        </span>
                    )}
                    {status && (
                        <span className={cn(
                            "font-mono text-[10px] uppercase tracking-wider",
                            "flex items-center gap-1.5",
                            colors.status
                        )}>
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            {status}
                        </span>
                    )}
                </div>
            )}

            {/* Conteúdo */}
            <div className="relative z-0">
                {children}
            </div>

            {/* Hover Glow Effect */}
            {hoverable && (
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                        boxShadow: `inset 0 0 30px ${colors.glow}, 0 0 20px ${colors.glow}`,
                    }}
                />
            )}
        </div>
    );

    if (animate) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                {cardContent}
            </motion.div>
        );
    }

    return cardContent;
}

// ============================================================================
// TACTICAL BUTTON - Botão estilo painel de controle
// ============================================================================

interface TacticalButtonProps {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "neon" | "danger" | "success";
    selected?: boolean;
    disabled?: boolean;
    onClick?: () => void;
}

export function TacticalButton({
    children,
    className,
    variant = "default",
    selected = false,
    disabled = false,
    onClick,
}: TacticalButtonProps) {
    const colors = variantColors[variant];

    return (
        <motion.button
            className={cn(
                // Base
                "relative w-full text-left",
                "font-mono text-sm",
                // Layout
                "px-4 py-3 rounded-sm",
                // Bordas
                "border transition-all duration-200",
                colors.border,
                // Estados
                !disabled && !selected && "hover:bg-white/5 hover:border-white/20",
                selected && "border-opacity-100",
                disabled && "opacity-40 cursor-not-allowed",
                // Texto
                "text-[#EEF4D4]",
                className
            )}
            onClick={disabled ? undefined : onClick}
            whileHover={!disabled ? { scale: 1.01 } : undefined}
            whileTap={!disabled ? { scale: 0.99 } : undefined}
            style={{
                backgroundColor: selected ? `${colors.glow}` : "transparent",
                boxShadow: selected ? `0 0 20px ${colors.glow}, inset 0 0 20px ${colors.glow}` : undefined,
            }}
        >
            {/* Prefixo de seleção */}
            <span className="inline-flex items-center gap-3">
                <span className={cn(
                    "w-2 h-2 border transition-colors duration-200",
                    selected ? "bg-current" : "bg-transparent",
                    colors.border.replace("border-", "border-")
                )} />
                {children}
            </span>
        </motion.button>
    );
}

// ============================================================================
// SEGMENTED PROGRESS - Barra de progresso em blocos
// ============================================================================

interface SegmentedProgressProps {
    current: number;
    total: number;
    className?: string;
    variant?: "default" | "neon" | "success";
}

export function SegmentedProgress({
    current,
    total,
    className,
    variant = "neon",
}: SegmentedProgressProps) {
    const colors = variantColors[variant];

    return (
        <div className={cn("flex items-center gap-1 font-mono text-xs", className)}>
            <span className="text-white/40 mr-2">[</span>
            {Array.from({ length: total }).map((_, i) => (
                <span
                    key={i}
                    className="transition-colors duration-200"
                    style={{
                        color: i < current ? colors.corner : "rgba(255,255,255,0.2)",
                    }}
                >
                    {i < current ? "■" : "□"}
                </span>
            ))}
            <span className="text-white/40 ml-2">]</span>
            <span className="text-white/50 ml-2">
                {current}/{total}
            </span>
        </div>
    );
}

export default TacticalCard;

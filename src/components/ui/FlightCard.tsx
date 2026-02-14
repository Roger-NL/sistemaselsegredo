"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================================================
// FLIGHT CARD - Aero Premium UI Component
// Moldura estilo "Civil Aviation Dashboard" com glassmorphism e indicadores de voo
// ============================================================================

interface FlightCardProps {
    children: React.ReactNode;
    className?: string;

    // Header técnico opcional
    flightId?: string; // Ex: FLIGHT-001
    status?: "RESTRICTED" | "BOARDING" | "IN_FLIGHT" | "CLEARED" | "PRIVATE_JET" | "MAINTENANCE" | "LANDED" | "SECURE" | "LIVE" | "COMPLETED"; // Mantendo antigos temporariamente para compatibilidade

    // Variante visual
    variant?: "default" | "neon" | "danger" | "success" | "ghost";

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
    ghost: {
        border: "border-white/5",
        corner: "#94a3b8",
        glow: "rgba(255, 255, 255, 0.05)",
        status: "text-slate-400",
    },
};

// Componente dos indicadores de canto (Aero Markers)
function FlightCorner({
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

    // Símbolos mais sutis, estilo HUD de avião
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

export function FlightCard({
    children,
    className,
    flightId,
    status,
    variant = "default",
    onClick,
    hoverable = false,
    animate = true,
}: FlightCardProps) {
    const colors = variantColors[variant];

    // Mapeamento de compatibilidade para status antigos (se necessário)
    let displayStatus = status;
    if (status === "LIVE") displayStatus = "BOARDING";
    if (status === "SECURE") displayStatus = "CLEARED";
    if (status === "COMPLETED") displayStatus = "LANDED";

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
            {/* Flight Corners */}
            <FlightCorner position="top-left" color={colors.corner} />
            <FlightCorner position="top-right" color={colors.corner} />
            <FlightCorner position="bottom-left" color={colors.corner} />
            <FlightCorner position="bottom-right" color={colors.corner} />

            {/* Header Técnico (Opcional) */}
            {(flightId || displayStatus) && (
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
                    {flightId && (
                        <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
                            FLIGHT // {flightId}
                        </span>
                    )}
                    {displayStatus && (
                        <span className={cn(
                            "font-mono text-[10px] uppercase tracking-wider",
                            "flex items-center gap-1.5",
                            colors.status
                        )}>
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            {displayStatus}
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
// FLIGHT BUTTON - Botão estilo painel de controle
// ============================================================================

interface FlightButtonProps {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "neon" | "danger" | "success" | "ghost";
    selected?: boolean;
    disabled?: boolean;
    onClick?: (e: React.MouseEvent) => void;
}

export function FlightButton({
    children,
    className,
    variant = "default",
    selected = false,
    disabled = false,
    onClick,
}: FlightButtonProps) {
    const colors = variantColors[variant];

    return (
        <motion.button
            className={cn(
                // Base
                "relative w-full text-left",
                "font-mono text-sm",
                // Layout
                "px-4 py-3 rounded-sm min-h-[44px]",
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
// FLIGHT PROGRESS - Barra de progresso segmentada
// ============================================================================

interface FlightProgressProps {
    current: number;
    total: number;
    className?: string;
    variant?: "default" | "neon" | "success";
}

export function FlightProgress({
    current,
    total,
    className,
    variant = "neon",
}: FlightProgressProps) {
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

export default FlightCard;

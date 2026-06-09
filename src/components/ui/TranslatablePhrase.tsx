"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AudioButton } from "./AudioButton";

interface TranslatablePhraseProps {
    english: string;
    portuguese: string;
}

/**
 * TranslatablePhrase Component
 * Displays English text with a neon underline glow and an Audio button.
 * Shows Portuguese translation on hover/tap.
 */
export const TranslatablePhrase: React.FC<TranslatablePhraseProps> = ({
    english,
    portuguese,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
    const textRef = useRef<HTMLSpanElement | null>(null);
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearCloseTimer = () => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    };

    const scheduleAutoClose = () => {
        clearCloseTimer();
        closeTimerRef.current = setTimeout(() => {
            setIsOpen(false);
            setTooltipPosition(null);
            closeTimerRef.current = null;
        }, 3500);
    };

    const updateTooltipPosition = () => {
        if (!textRef.current || typeof window === "undefined") return;

        const rect = textRef.current.getBoundingClientRect();
        const viewportPadding = 14;
        const left = Math.min(
            Math.max(rect.left + rect.width / 2, viewportPadding),
            window.innerWidth - viewportPadding
        );

        setTooltipPosition({
            top: Math.max(rect.top, viewportPadding),
            left,
        });
    };

    useEffect(() => {
        return clearCloseTimer;
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        updateTooltipPosition();
        window.addEventListener("scroll", updateTooltipPosition, true);
        window.addEventListener("resize", updateTooltipPosition);

        return () => {
            window.removeEventListener("scroll", updateTooltipPosition, true);
            window.removeEventListener("resize", updateTooltipPosition);
        };
    }, [isOpen]);

    const toggleOpen = (event?: React.SyntheticEvent) => {
        event?.preventDefault();
        event?.stopPropagation();
        updateTooltipPosition();
        setIsOpen(true);
        scheduleAutoClose();
    };

    return (
        <span className="inline-flex items-center gap-1.5 align-bottom">
            <span className="translatable-phrase">
                <span
                    ref={textRef}
                    role="button"
                    tabIndex={0}
                    onClick={toggleOpen}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            toggleOpen(event);
                        }
                    }}
                    className="translatable-text rounded-sm border-0 bg-transparent p-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                    style={{
                        color: "#1d4ed8",
                        fontWeight: 700,
                        textShadow: "none",
                        backgroundImage: "linear-gradient(90deg, #2563eb, #2563eb)",
                    }}
                >
                    {english}
                </span>
                {isOpen && tooltipPosition && typeof document !== "undefined" && createPortal(
                    <span
                        className="translatable-tooltip translatable-tooltip-fixed"
                        style={{
                            top: tooltipPosition.top,
                            left: tooltipPosition.left,
                        }}
                    >
                        <span className="tooltip-label">PT</span>
                        <span className="tooltip-text">{portuguese}</span>
                    </span>,
                    document.body
                )}
            </span>
            <AudioButton text={english} size="sm" />
        </span>
    );
};

export default TranslatablePhrase;

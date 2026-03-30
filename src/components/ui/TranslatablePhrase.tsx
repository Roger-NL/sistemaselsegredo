"use client";

import React from "react";
import { AudioButton } from "./AudioButton";
import { cn } from "@/lib/ui/cn";

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
    return (
        <span className="inline-flex items-center gap-1.5 align-bottom">
            <span className="translatable-phrase">
                <span className="translatable-text">{english}</span>
                <span className={cn("translatable-tooltip", "always-visible")}>
                    <span className="tooltip-label">PT</span>
                    <span className="tooltip-text">{portuguese}</span>
                </span>
            </span>
            <AudioButton text={english} size="sm" />
        </span>
    );
};

export default TranslatablePhrase;

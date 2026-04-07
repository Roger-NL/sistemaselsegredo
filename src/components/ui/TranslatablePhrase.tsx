"use client";

import React, { useState } from "react";
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
    const toggleOpen = (event?: React.SyntheticEvent) => {
        event?.preventDefault();
        event?.stopPropagation();
        setIsOpen((prev) => !prev);
    };

    return (
        <span className="inline-flex items-center gap-1.5 align-bottom">
            <span className="translatable-phrase">
                <span
                    role="button"
                    tabIndex={0}
                    onClick={toggleOpen}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            toggleOpen(event);
                        }
                    }}
                    className="translatable-text bg-transparent border-0 p-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60 rounded-sm"
                >
                    {english}
                </span>
                {isOpen && (
                    <span className="translatable-tooltip">
                        <span className="tooltip-label">PT</span>
                        <span className="tooltip-text">{portuguese}</span>
                    </span>
                )}
            </span>
            <AudioButton text={english} size="sm" />
        </span>
    );
};

export default TranslatablePhrase;

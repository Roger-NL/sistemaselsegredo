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

    return (
        <span className="inline-flex items-center gap-1.5 align-bottom">
            <span className="translatable-phrase">
                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="translatable-text bg-transparent border-0 p-0"
                >
                    {english}
                </button>
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

"use client";

import React, { useState } from "react";

interface TranslatablePhraseProps {
    english: string;
    portuguese: string;
}

/**
 * TranslatablePhrase Component
 * Displays English text with a neon underline glow.
 * Shows Portuguese translation on hover/tap.
 */
export const TranslatablePhrase: React.FC<TranslatablePhraseProps> = ({
    english,
    portuguese,
}) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <span
            className="translatable-phrase"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onTouchStart={() => setShowTooltip(!showTooltip)}
        >
            <span className="translatable-text">{english}</span>
            {showTooltip && (
                <span className="translatable-tooltip">
                    <span className="tooltip-label">PT</span>
                    <span className="tooltip-text">{portuguese}</span>
                </span>
            )}
        </span>
    );
};

export default TranslatablePhrase;

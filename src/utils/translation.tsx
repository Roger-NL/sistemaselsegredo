import React from "react";
import { TranslatablePhrase } from "@/components/ui/TranslatablePhrase";

/**
 * Parses text containing {{english|portuguese}} markers and returns
 * React elements with TranslatablePhrase components.
 */
export const parseTranslatable = (text: string): React.ReactNode => {
    if (typeof text !== 'string') return text;
    if (!text) return "";

    // Regex to match {{english|portuguese}} pattern
    const regex = /\{\{([^|]+)\|([^}]+)\}\}/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        // Add TranslatablePhrase component
        const [, english, portuguese] = match;
        parts.push(
            <TranslatablePhrase
                key={`trans-${match.index}`}
                english={english}
                portuguese={portuguese}
            />
        );

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last match
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    // If no matches found, return original text
    if (parts.length === 0) {
        return text;
    }

    return <React.Fragment>{parts}</React.Fragment>;
};

/**
 * Extracts display text from {{english|portuguese}} markers.
 * Returns the english text by default (strips the translation markers).
 * Used when we need plain text (e.g., for character-by-character rendering).
 */
export const extractTranslatableText = (text: string): string => {
    if (typeof text !== 'string') return text || "";
    if (!text) return "";
    return text.replace(/\{\{([^|]+)\|([^}]+)\}\}/g, '$1');
};

/**
 * Parses text with both **bold** markers and {{en|pt}} translation markers
 */
export const parseTextWithTranslations = (text: string): React.ReactNode => {
    if (typeof text !== 'string') return text;
    if (!text) return "";

    // First, split by bold markers
    const boldParts = text.split(/(\*\*.*?\*\*)/);

    return boldParts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            // Bold text - also parse for translations inside
            const innerText = part.slice(2, -2);
            return (
                <strong key={i} className="text-slate-200 font-bold">
                    {parseTranslatable(innerText)}
                </strong>
            );
        }
        // Regular text - parse for translations
        return <React.Fragment key={i}>{parseTranslatable(part)}</React.Fragment>;
    });
};

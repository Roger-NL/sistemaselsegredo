"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ============================================================================
// SUN SETTINGS CONTEXT
// ============================================================================

interface SunSettings {
    offsetX: number;  // -50 to 50 (pixels)
    offsetY: number;  // -50 to 50 (pixels)
    scale: number;    // 0.5 to 2.0
}

interface SunSettingsContextType {
    settings: SunSettings;
    setOffsetX: (value: number) => void;
    setOffsetY: (value: number) => void;
    setScale: (value: number) => void;
    resetSettings: () => void;
}

const DEFAULT_SETTINGS: SunSettings = {
    offsetX: 0,
    offsetY: 0,
    scale: 1,
};

const STORAGE_KEY = "sun-settings";

const SunSettingsContext = createContext<SunSettingsContextType | null>(null);

export function SunSettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<SunSettings>(DEFAULT_SETTINGS);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setSettings({
                    offsetX: parsed.offsetX ?? 0,
                    offsetY: parsed.offsetY ?? 0,
                    scale: parsed.scale ?? 1,
                });
            }
        } catch {
            // Ignore parse errors
        }
        setIsHydrated(true);
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        }
    }, [settings, isHydrated]);

    const setOffsetX = (value: number) => {
        setSettings((prev) => ({ ...prev, offsetX: Math.max(-50, Math.min(50, value)) }));
    };

    const setOffsetY = (value: number) => {
        setSettings((prev) => ({ ...prev, offsetY: Math.max(-50, Math.min(50, value)) }));
    };

    const setScale = (value: number) => {
        setSettings((prev) => ({ ...prev, scale: Math.max(0.5, Math.min(2, value)) }));
    };

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
    };

    return (
        <SunSettingsContext.Provider
            value={{ settings, setOffsetX, setOffsetY, setScale, resetSettings }}
        >
            {children}
        </SunSettingsContext.Provider>
    );
}

export function useSunSettings() {
    const context = useContext(SunSettingsContext);
    if (!context) {
        throw new Error("useSunSettings must be used within a SunSettingsProvider");
    }
    return context;
}

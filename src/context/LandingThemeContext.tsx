"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "dark" | "light";

interface LandingThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    isDark: boolean;
    isLight: boolean;
}

const LandingThemeContext = createContext<LandingThemeContextType | undefined>(undefined);

export function LandingThemeProvider({ children }: { children: ReactNode }) {
    const theme = "dark";

    // Toggle is now disabled/no-op as we enforce dark mode
    const toggleTheme = () => {
        // console.log("Theme is locked to dark mode");
    };

    const value = {
        theme: "dark" as Theme,
        toggleTheme,
        isDark: true,
        isLight: false,
    };

    return (
        <LandingThemeContext.Provider value={value}>
            {children}
        </LandingThemeContext.Provider>
    );
}

export function useLandingTheme() {
    const context = useContext(LandingThemeContext);
    if (!context) {
        throw new Error("useLandingTheme must be used within a LandingThemeProvider");
    }
    return context;
}

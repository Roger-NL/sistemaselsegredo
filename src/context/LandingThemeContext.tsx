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
    const [theme, setTheme] = useState<Theme>("dark");

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    const value = {
        theme,
        toggleTheme,
        isDark: theme === "dark",
        isLight: theme === "light",
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

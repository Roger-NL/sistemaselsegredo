"use client";

import React, { createContext, useContext, useState } from 'react';

interface TranslationContextType {
    alwaysShowTranslations: boolean;
    toggleAlwaysShowTranslations: () => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

function getInitialTranslationPreference(): boolean {
    if (typeof window === "undefined") {
        return false;
    }

    const saved = localStorage.getItem("alwaysShowTranslations");
    return saved !== null ? Boolean(JSON.parse(saved)) : false;
}

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [alwaysShowTranslations, setAlwaysShowTranslations] = useState<boolean>(getInitialTranslationPreference);

    const toggleAlwaysShowTranslations = () => {
        setAlwaysShowTranslations((prev: boolean) => {
            const newValue = !prev;
            localStorage.setItem('alwaysShowTranslations', JSON.stringify(newValue));
            return newValue;
        });
    };

    return (
        <TranslationContext.Provider value={{ alwaysShowTranslations, toggleAlwaysShowTranslations }}>
            {children}
        </TranslationContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(TranslationContext);
    if (!context) {
        throw new Error('useTranslation must be used within a TranslationProvider');
    }
    return context;
};

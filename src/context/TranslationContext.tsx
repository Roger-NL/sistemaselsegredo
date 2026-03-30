"use client";

import React, { createContext, useContext } from 'react';

interface TranslationContextType {
    alwaysShowTranslations: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <TranslationContext.Provider value={{ alwaysShowTranslations: true }}>
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

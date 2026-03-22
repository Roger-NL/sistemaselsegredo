"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { TranslationProvider } from "@/context/TranslationContext";

export default function AppProviders({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <TranslationProvider>{children}</TranslationProvider>
        </AuthProvider>
    );
}

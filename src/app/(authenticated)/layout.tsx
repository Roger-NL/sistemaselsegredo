"use client";

import AppProviders from "@/app/AppProviders";
import { useAuth } from "@/context/AuthContext";
import { ProgressProvider } from "@/context/ProgressContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { TubesBackground } from "@/components/ui/neon-flow";
import { ROUTES } from "@/lib/routes";

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AppProviders>
            <AuthenticatedLayoutInner>{children}</AuthenticatedLayoutInner>
        </AppProviders>
    );
}

function AuthenticatedLayoutInner({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push(ROUTES.auth.login);
            return;
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full opacity-50"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect to login
    }

    // Freemium: no subscription check needed — all authenticated users have access

    return (
        <ProgressProvider>
            <TubesBackground className="min-h-screen min-h-[100dvh]">
                {children}
            </TubesBackground>
        </ProgressProvider>
    );
}

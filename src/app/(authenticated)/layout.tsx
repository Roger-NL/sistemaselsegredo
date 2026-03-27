"use client";

import AppProviders from "@/app/AppProviders";
import { useAuth } from "@/context/AuthContext";
import { ProgressProvider } from "@/context/ProgressContext";
import { useRouter, usePathname } from "next/navigation";
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
    const { isAuthenticated, isLoading, user, subscriptionStatus } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push(ROUTES.auth.login);
            return;
        }

        if (!isLoading && isAuthenticated && user) {
            const isAdmin = ["roger@esacademy.com", "admin@esacademy.com", "raugerac@gmail.com"].includes(user.email);
            if (subscriptionStatus !== 'premium' && !isAdmin) {
                // Permitir rotas que possuem seus próprios controles ou são grátis
                const isFreeRoute = 
                    pathname.startsWith(ROUTES.app.dashboard) ||
                    pathname.startsWith('/pilar') ||
                    pathname.startsWith(ROUTES.app.thankYou) ||
                    pathname.startsWith(ROUTES.app.profile) ||
                    pathname.startsWith(ROUTES.app.settings);

                if (!isFreeRoute) {
                    router.replace(ROUTES.public.payment);
                }
            }
        }
    }, [isAuthenticated, isLoading, router, user, subscriptionStatus, pathname]);

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

    // Proteção rigorosa de renderização (removida para permitir rotas livres)
    // As rotas premium lidam com a trava visual (PremiumWall)
    const isAdminCheck = user && ["roger@esacademy.com", "admin@esacademy.com", "raugerac@gmail.com"].includes(user.email);
    if (subscriptionStatus !== 'premium' && !isAdminCheck) {
        const isFreeRoute = 
            pathname.startsWith(ROUTES.app.dashboard) ||
            pathname.startsWith('/pilar') ||
            pathname.startsWith(ROUTES.app.thankYou) ||
            pathname.startsWith(ROUTES.app.profile) ||
            pathname.startsWith(ROUTES.app.settings);

        if (!isFreeRoute) {
            return null; // Don't render anything while redirecting
        }
    }

    return (
        <ProgressProvider>
            <TubesBackground className="min-h-screen min-h-[100dvh]">
                {children}
            </TubesBackground>
        </ProgressProvider>
    );
}

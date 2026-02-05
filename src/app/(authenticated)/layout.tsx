"use client";

import { useAuth } from "@/context/AuthContext";
import { ProgressProvider } from "@/context/ProgressContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { TubesBackground } from "@/components/ui/neon-flow";

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading, subscriptionStatus } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
            return;
        }

        // Check subscription status - redirect to payment if pending
        if (!isLoading && isAuthenticated && subscriptionStatus !== 'active') {
            // Allow access to configuracoes and perfil even if pending
            const allowedPaths = ['/configuracoes', '/perfil'];
            const isAllowed = allowedPaths.some(path => pathname?.startsWith(path));

            if (!isAllowed) {
                router.push("/pagamento");
            }
        }
    }, [isAuthenticated, isLoading, subscriptionStatus, router, pathname]);

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

    if (subscriptionStatus !== 'active') {
        // Still show loading while redirecting to payment
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-white/50 text-sm">Verificando acesso...</p>
                </div>
            </div>
        );
    }

    return (
        <ProgressProvider>
            <TubesBackground className="min-h-screen min-h-[100dvh]">
                {children}
            </TubesBackground>
        </ProgressProvider>
    );
}

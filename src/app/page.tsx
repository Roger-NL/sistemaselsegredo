"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                router.push("/dashboard");
            } else {
                router.push("/login");
            }
        }
    }, [isAuthenticated, isLoading, router]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full"></div>
                <p className="text-white/40 font-mono text-sm tracking-widest animate-pulse">
                    INITIALIZING SYSTEM...
                </p>
            </div>
        </div>
    );
}

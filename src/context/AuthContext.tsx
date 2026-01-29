"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
    isAuthenticated: boolean;
    login: (email: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check local storage on mount
        const storedAuth = localStorage.getItem("es-academy-auth");
        if (storedAuth === "true") {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string) => {
        // Mock login - accept any email
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                localStorage.setItem("es-academy-auth", "true");
                setIsAuthenticated(true);
                resolve();
            }, 800); // Fake delay for effect
        });
    };

    const logout = () => {
        localStorage.removeItem("es-academy-auth");
        setIsAuthenticated(false);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
    initAuthFull,
    login as authLogin,
    register as authRegister,
    updateProfile as authUpdateProfile,
    logout as authLogout,
    getCurrentUser,
    activateWithInvite as authActivateWithInvite,
    activateWithPayment as authActivateWithPayment,
    checkSubscriptionStatus,
    User,
    AuthResult,
    SubscriptionStatus,
} from "@/lib/auth-service";

type SafeUser = Omit<User, 'passwordHash'>;

interface AuthContextType {
    isAuthenticated: boolean;
    user: SafeUser | null;
    subscriptionStatus: SubscriptionStatus | null;
    login: (identifier: string, password: string) => Promise<AuthResult>;
    register: (name: string, email: string, password: string, confirmPassword: string) => Promise<AuthResult>;
    updateProfile: (name: string, email: string) => Promise<AuthResult>;
    activateWithInvite: (code: string) => Promise<AuthResult>;
    activateWithPayment: (paymentId: string) => Promise<AuthResult>;
    logout: () => void;
    refreshUser: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<SafeUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const refreshUser = () => {
        const currentUser = getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
    };

    useEffect(() => {
        // Initialize database and invite codes
        initAuthFull();
        refreshUser();
        setIsLoading(false);
    }, []);

    const login = async (identifier: string, password: string): Promise<AuthResult> => {
        const result = await authLogin(identifier, password);
        if (result.success && result.user) {
            setUser(result.user);
        }
        return result;
    };

    const register = async (
        name: string,
        email: string,
        password: string,
        confirmPassword: string
    ): Promise<AuthResult> => {
        const result = await authRegister(name, email, password, confirmPassword);
        if (result.success && result.user) {
            setUser(result.user);
        }
        return result;
    };

    const updateProfile = async (name: string, email: string): Promise<AuthResult> => {
        if (!user) return { success: false, error: 'Usuário não autenticado' };

        const result = await authUpdateProfile(user.id, name, email);
        if (result.success && result.user) {
            setUser(result.user);
        }
        return result;
    };

    const activateWithInvite = async (code: string): Promise<AuthResult> => {
        if (!user) return { success: false, error: 'Usuário não autenticado' };

        const result = await authActivateWithInvite(user.id, code);
        if (result.success && result.user) {
            setUser(result.user);
        }
        return result;
    };

    const activateWithPayment = async (paymentId: string): Promise<AuthResult> => {
        if (!user) return { success: false, error: 'Usuário não autenticado' };

        const result = await authActivateWithPayment(user.id, paymentId);
        if (result.success && result.user) {
            setUser(result.user);
        }
        return result;
    };

    const logout = () => {
        authLogout();
        setUser(null);
        router.push("/login");
    };

    // Calculate current subscription status
    const subscriptionStatus: SubscriptionStatus | null = user
        ? checkSubscriptionStatus(user)
        : null;

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: !!user,
                user,
                subscriptionStatus,
                login,
                register,
                updateProfile,
                activateWithInvite,
                activateWithPayment,
                logout,
                refreshUser,
                isLoading,
            }}
        >
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

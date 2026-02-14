"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Cookies from 'js-cookie';

import {
    login as authLogin,
    register as authRegister,
    updateProfile as authUpdateProfile,
    logout as authLogout,
    activateWithInvite as authActivateWithInvite,
    activateWithPayment as authActivateWithPayment,
    checkSubscriptionStatus,
    User,
    AuthResult,
    SubscriptionStatus,
} from "@/lib/auth-service";

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    subscriptionStatus: SubscriptionStatus | null;
    login: (identifier: string, password: string) => Promise<AuthResult>;
    register: (name: string, email: string, password: string, confirmPassword: string) => Promise<AuthResult>;
    updateProfile: (name: string, email: string, phone?: string) => Promise<AuthResult>;
    activateWithInvite: (code: string) => Promise<AuthResult>;
    activateWithPayment: (paymentId: string) => Promise<AuthResult>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // FIREBASE REAL-TIME LISTENER
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in, fetch Firestore data
                try {
                    const userDocRef = doc(db, "users", firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data() as User;
                        // Ensure ID is set
                        const fullUser = { ...userData, id: firebaseUser.uid };
                        setUser(fullUser);
                        
                        // Sync Cookie for Middleware
                        Cookies.set('es_session_token', firebaseUser.uid, { expires: 7, path: '/' });
                    } else {
                        // User exists in Auth but not in Firestore (Rare edge case)
                        console.error("User authenticated but no Firestore profile found.");
                        setUser(null);
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    setUser(null);
                }
            } else {
                // User is signed out
                setUser(null);
                Cookies.remove('es_session_token', { path: '/' });
            }
            setIsLoading(false);
        });

        // Cleanup subscription
        return () => unsubscribe();
    }, []);

    const login = async (identifier: string, password: string): Promise<AuthResult> => {
        const result = await authLogin(identifier, password);
        // State update happens automatically via onAuthStateChanged
        return result;
    };

    const register = async (
        name: string,
        email: string,
        password: string,
        confirmPassword: string
    ): Promise<AuthResult> => {
        const result = await authRegister(name, email, password, confirmPassword);
        // State update happens automatically via onAuthStateChanged
        return result;
    };

    const updateProfile = async (name: string, email: string, phone?: string): Promise<AuthResult> => {
        if (!user) return { success: false, error: 'Usuário não autenticado' };
        // We update Firestore, then onAuthStateChanged logic might not auto-trigger
        // unless we force a reload or update local state manually.
        // For efficiency, we update local state here too if successful.
        const result = await authUpdateProfile(user.id, name, email, phone);
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

    const logout = async () => {
        await authLogout();
        // State update happens automatically via onAuthStateChanged
        router.push("/login");
    };

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

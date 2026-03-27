"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, getDocFromServer } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Cookies from 'js-cookie';

import {
    login as authLogin,
    loginWithGoogle as authLoginWithGoogle,
    register as authRegister,
    updateProfile as authUpdateProfile,
    logout as authLogout,
    activateWithInvite as authActivateWithInvite,
    activateWithPayment as authActivateWithPayment,
    changePassword as authChangePassword,
    resetPassword as authResetPassword,
    checkSubscriptionStatus,
    User,
    AuthResult,
    SubscriptionStatus,
    isFirestorePermissionError,
} from "@/lib/auth/service";

import type { User as FirebaseUser } from "firebase/auth";

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    subscriptionStatus: SubscriptionStatus | null;
    login: (identifier: string, password: string) => Promise<AuthResult>;
    register: (name: string, email: string, password: string, confirmPassword: string) => Promise<AuthResult>;
    updateProfile: (name: string, email: string, phone?: string) => Promise<AuthResult>;
    activateWithInvite: (code: string) => Promise<AuthResult>;
    activateWithPayment: (paymentId: string) => Promise<AuthResult>;
    loginWithGoogle: () => Promise<AuthResult>;
    changePassword: (newPassword: string) => Promise<AuthResult>;
    resetPassword: (email: string) => Promise<AuthResult>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function buildFallbackUser(firebaseUser: FirebaseUser): User {
    return {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || "Usuário",
        email: firebaseUser.email || "",
        createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
        currentStreak: 0,
        subscriptionStatus: "free",
        approvedPillar: 1,
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            Cookies.remove('es_session_token', { path: '/' });
            Cookies.remove('es_user_role', { path: '/' });
            Cookies.remove('es_user_status', { path: '/' });
            return;
        }

        const role = ["roger@esacademy.com", "admin@esacademy.com", "raugerac@gmail.com"].includes(user.email)
            ? 'admin'
            : 'student';

        Cookies.set('es_session_token', user.id, { expires: 7, path: '/' });
        Cookies.set('es_user_role', role, { expires: 7, path: '/' });
        Cookies.set('es_user_status', user.subscriptionStatus, { expires: 7, path: '/' });
    }, [user]);

    // FIREBASE REAL-TIME LISTENER
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const fallbackUser = buildFallbackUser(firebaseUser);
                // User is signed in, fetch Firestore data
                try {
                    const userDocRef = doc(db, "users", firebaseUser.uid);
                    let userDoc = await getDoc(userDocRef);

                    // Retry logic for new registrations (race condition fix)
                    if (!userDoc.exists()) {
                        for (let i = 0; i < 3; i++) {
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            userDoc = await getDoc(userDocRef);
                            if (userDoc.exists()) break;
                        }
                    }

                    if (userDoc.exists()) {
                        const userData = userDoc.data() as User;
                        // Ensure ID is set
                        const fullUser = { ...userData, id: firebaseUser.uid };

                        // --- STREAK LOGIC (BRAZIL TIME) ---
                        try {
                            const now = new Date();
                            // Helper to get YYYY-MM-DD in Brazil
                            const getBrazilDate = (date: Date) => {
                                return new Intl.DateTimeFormat('en-CA', {
                                    timeZone: 'America/Sao_Paulo',
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit'
                                }).format(date);
                            };

                            const todayStr = getBrazilDate(now);
                            const lastLoginStr = fullUser.lastLoginDate
                                ? getBrazilDate(new Date(fullUser.lastLoginDate))
                                : null;

                            // Update if it's a new day OR if we just logged in for the first time
                            if (lastLoginStr !== todayStr) {
                                let newStreak = fullUser.currentStreak || 0;

                                // Check if yesterday
                                const yesterday = new Date(now);
                                yesterday.setDate(yesterday.getDate() - 1);
                                const yesterdayStr = getBrazilDate(yesterday);

                                if (lastLoginStr === yesterdayStr) {
                                    newStreak += 1;
                                } else {
                                    newStreak = 1; // Missed a day or first login
                                }

                                // Update Firestore
                                await updateDoc(userDocRef, {
                                    currentStreak: newStreak,
                                    lastLoginDate: now.toISOString()
                                });

                                // Update local state immediately
                                fullUser.currentStreak = newStreak;
                                fullUser.lastLoginDate = now.toISOString();
                            }
                        } catch (err) {
                            console.error("Streak Error:", err);
                        }
                        // -----------------------------------

                        setUser(fullUser);
                    } else {
                        setUser(fallbackUser);
                    }
                } catch (error) {
                    if (isFirestorePermissionError(error)) {
                        setUser(fallbackUser);
                    } else {
                        console.error("Error fetching user profile:", error);
                        setUser(null);
                    }
                }
            } else {
                // User is signed out
                setUser(null);
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

    const loginWithGoogle = async (): Promise<AuthResult> => {
        const result = await authLoginWithGoogle();
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

    const changePassword = async (newPassword: string): Promise<AuthResult> => {
        if (!user) return { success: false, error: 'Usuário não autenticado' };
        return await authChangePassword(newPassword);
    };

    const resetPassword = async (email: string): Promise<AuthResult> => {
        return await authResetPassword(email);
    };

    const refreshUser = async () => {
        if (!auth.currentUser) return;
        try {
            const userDocRef = doc(db, "users", auth.currentUser.uid);
            // IMPORTANTE: Forçar leitura direto do servidor para evitar ler cache antigo (caso o webhook tenha atualizado)
            const userDoc = await getDocFromServer(userDocRef);
            if (userDoc.exists()) {
                const userData = userDoc.data() as User;
                setUser({ ...userData, id: auth.currentUser.uid });
                // Atualizar cookie também para o SSR (Layouts) saber
                Cookies.set('subscriptionStatus', userData.subscriptionStatus || 'free', { expires: 30, path: '/' });
            } else {
                setUser(buildFallbackUser(auth.currentUser));
            }
        } catch (error) {
            if (isFirestorePermissionError(error)) {
                setUser(buildFallbackUser(auth.currentUser));
            } else {
                console.error("Error refreshing user profile:", error);
            }
        }
    };

    const logout = async () => {
        await authLogout();
        // State update happens automatically via onAuthStateChanged
        router.push("/");
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
                loginWithGoogle,
                register,
                updateProfile,
                activateWithInvite,
                activateWithPayment,
                changePassword,
                resetPassword,
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

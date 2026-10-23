"use client";

import { createSessionSynchronizer } from "@/client/auth/session";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, onIdTokenChanged } from "firebase/auth";
import { doc, getDoc, getDocFromServer } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

import {
    login as authLogin,
    loginWithGoogle as authLoginWithGoogle,
    register as authRegister,
    updateProfile as authUpdateProfile,
    logout as authLogout,
    activateWithInvite as authActivateWithInvite,
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
        isAdmin: false,
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const [syncServerSession] = useState(() => createSessionSynchronizer());

    // FIREBASE REAL-TIME LISTENER
    useEffect(() => {
        const unsubscribeToken = onIdTokenChanged(auth, async (firebaseUser) => {
            await syncServerSession(firebaseUser);
        });

        return () => unsubscribeToken();
    }, [syncServerSession]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const hasServerSession = await syncServerSession(firebaseUser);
                if (!hasServerSession) {
                    setUser(null);
                    setIsLoading(false);
                    return;
                }

                const fallbackUser = buildFallbackUser(firebaseUser);
                fallbackUser.isAdmin = (await firebaseUser.getIdTokenResult()).claims.admin === true;
                // User is signed in, fetch Firestore data
                try {
                    const userDocRef = doc(db, "users", firebaseUser.uid);
                    let userDoc = await getDoc(userDocRef);

                    // Retry logic for new registrations (race condition fix)
                    if (!userDoc.exists()) {
                        for (let i = 0; i < 2; i++) {
                            await new Promise(resolve => setTimeout(resolve, 250));
                            userDoc = await getDoc(userDocRef);
                            if (userDoc.exists()) break;
                        }
                    }

                    if (userDoc.exists()) {
                        const userData = userDoc.data() as User;
                        // Ensure ID is set
                        const fullUser = {
                            ...userData,
                            id: firebaseUser.uid,
                            email: firebaseUser.email || userData.email || "",
                            isAdmin: fallbackUser.isAdmin,
                        };

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
    }, [syncServerSession]);

    const login = async (identifier: string, password: string): Promise<AuthResult> => {
        const result = await authLogin(identifier, password);
        if (result.success && auth.currentUser) {
            const hasServerSession = await syncServerSession(auth.currentUser, true);
            if (!hasServerSession) {
                await authLogout();
                setUser(null);
                setIsLoading(false);
                return { success: false, error: "Não foi possível criar uma sessão segura. Tente novamente." };
            }
            if (result.user) {
                setUser(result.user);
            }
            setIsLoading(false);
        }
        return result;
    };

    const loginWithGoogle = async (): Promise<AuthResult> => {
        const result = await authLoginWithGoogle();
        if (result.success && auth.currentUser) {
            const hasServerSession = await syncServerSession(auth.currentUser, true);
            if (!hasServerSession) {
                await authLogout();
                setUser(null);
                setIsLoading(false);
                return { success: false, error: "Não foi possível criar uma sessão segura. Tente novamente." };
            }
            if (result.user) {
                setUser(result.user);
            }
            setIsLoading(false);
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
        if (result.success && auth.currentUser) {
            const hasServerSession = await syncServerSession(auth.currentUser, true);
            if (!hasServerSession) {
                await authLogout();
                setUser(null);
                setIsLoading(false);
                return { success: false, error: "Conta criada, mas a sessão segura falhou. Entre novamente." };
            }
            if (result.user) {
                setUser(result.user);
            }
            setIsLoading(false);
        }
        return result;
    };

    const updateProfile = async (name: string, email: string, phone?: string): Promise<AuthResult> => {
        if (!user) return { success: false, error: 'Usuário não autenticado' };
        // We update Firestore, then onAuthStateChanged logic might not auto-trigger
        // unless we force a reload or update local state manually.
        // For efficiency, we update local state here too if successful.
        const result = await authUpdateProfile(user.id, name, email, phone);
        if (result.success && result.user) {
            if (auth.currentUser && !(await syncServerSession(auth.currentUser, true))) {
                return { success: false, error: "Perfil atualizado. Entre novamente para renovar a sessão segura." };
            }
            setUser(result.user);
        }
        return result;
    };

    const activateWithInvite = async (code: string): Promise<AuthResult> => {
        if (!user) return { success: false, error: 'Usuário não autenticado' };
        const result = await authActivateWithInvite(user.id, code);
        if (result.success && result.user) {
            setUser(result.user);
            setIsLoading(false);
            if (auth.currentUser) {
                await syncServerSession(auth.currentUser, true);
            }
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

    const refreshUser = useCallback(async () => {
        if (!auth.currentUser) return;
        try {
            await syncServerSession(auth.currentUser, true);

            const userDocRef = doc(db, "users", auth.currentUser.uid);
            // IMPORTANTE: Forçar leitura direto do servidor para evitar ler cache antigo (caso o webhook tenha atualizado)
            const userDoc = await getDocFromServer(userDocRef);
            if (userDoc.exists()) {
                const userData = userDoc.data() as User;
                setUser({
                    ...userData,
                    id: auth.currentUser.uid,
                    email: auth.currentUser.email || userData.email || "",
                    isAdmin: (await auth.currentUser.getIdTokenResult()).claims.admin === true,
                });
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
    }, [syncServerSession]);

    useEffect(() => {
        if (!user?.id) return;

        const refreshWhenVisible = () => {
            if (document.visibilityState === "visible") {
                void refreshUser();
            }
        };

        document.addEventListener("visibilitychange", refreshWhenVisible);
        window.addEventListener("focus", refreshWhenVisible);

        return () => {
            document.removeEventListener("visibilitychange", refreshWhenVisible);
            window.removeEventListener("focus", refreshWhenVisible);
        };
    }, [refreshUser, user?.id]);

    const logout = async () => {
        await syncServerSession(null);
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

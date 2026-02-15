/**
 * Authentication Service (FIREBASE EDITION)
 * Replaces local-db with Firebase Auth + Firestore
 */

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    updateProfile as firebaseUpdateProfile,
    updatePassword,
    User as FirebaseUser
} from "firebase/auth";
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
    collection,
    query,
    where,
    getDocs,
    writeBatch
} from "firebase/firestore";
import { auth, db } from "./firebase";
import Cookies from 'js-cookie';

// ADMIN LIST (Hardcoded for MVP Phase)
const ADMIN_EMAILS = ["roger@esacademy.com", "admin@esacademy.com", "raugerac@gmail.com"];

// Types
export type SubscriptionStatus = 'free' | 'premium' | 'expired';

export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    lastLoginDate?: string;
    currentStreak: number;
    subscriptionStatus: SubscriptionStatus;
    subscriptionExpiresAt?: string;
    inviteCodeUsed?: string;
    paymentId?: string;
    phone?: string;
    approvedPillar?: number; // Controle manual de progressão
}

export interface AuthResult {
    success: boolean;
    user?: User;
    error?: string;
}

/**
 * Initialize auth service (No-op for Firebase usually)
 */
export function initAuth(): void {
    // Firebase auto-initializes via firebase.ts
}

/**
 * Convert Firebase User + Firestore Data to App User
 */
async function mapFirebaseUser(fbUser: FirebaseUser): Promise<User | null> {
    const userDocRef = doc(db, "users", fbUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        const data = userDoc.data() as User;

        // MIGRATION / COMPATIBILITY: Map 'active' (legacy) to 'free' or 'premium' based on fields?
        // For now, let's treat 'active' as 'free' unless we prove otherwise.
        // Actually, if 'active' was the default for everything, it is effectively 'free'.
        let status = data.subscriptionStatus as any;
        if (status === 'active') status = 'free';

        return { ...data, subscriptionStatus: status, id: fbUser.uid }; // Ensure ID matches
    }
    return null;
}

/**
 * Login with Google
 */
export async function loginWithGoogle(): Promise<AuthResult> {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const fbUser = result.user;

        // Check if user exists in Firestore
        const userDocRef = doc(db, "users", fbUser.uid);
        const userDoc = await getDoc(userDocRef);

        let user: User;

        if (userDoc.exists()) {
            // User exists, just update last login
            await updateDoc(userDocRef, {
                lastLoginDate: new Date().toISOString()
            });
            user = (await mapFirebaseUser(fbUser))!;
        } else {
            // New User via Google
            const newUser: User = {
                id: fbUser.uid,
                name: fbUser.displayName || "Usuário Google",
                email: fbUser.email || "",
                createdAt: new Date().toISOString(),
                currentStreak: 1,
                lastLoginDate: new Date().toISOString(),
                subscriptionStatus: 'free',
                approvedPillar: 1
            };

            await setDoc(userDocRef, newUser);
            user = newUser;
        }

        // Cookies
        Cookies.set('es_session_token', user.id, { expires: 7, path: '/' });
        const role = ADMIN_EMAILS.includes(user.email) ? 'admin' : 'student';
        Cookies.set('es_user_role', role, { expires: 7, path: '/' });
        Cookies.set('es_user_status', user.subscriptionStatus, { expires: 7, path: '/' });

        return { success: true, user };

    } catch (error: any) {
        console.error("Google Login Error:", error);
        return { success: false, error: "Erro ao entrar com Google." };
    }
}

/**
 * Login with email/password
 */
export async function login(identifier: string, password: string): Promise<AuthResult> {
    try {
        // Firebase Login
        const userCredential = await signInWithEmailAndPassword(auth, identifier, password);
        const fbUser = userCredential.user;

        // Fetch User Data from Firestore
        const user = await mapFirebaseUser(fbUser);

        if (!user) {
            return { success: false, error: 'Dados de usuário não encontrados.' };
        }

        // --- STREAK LOGIC ---
        const today = new Date().toISOString().split('T')[0];
        const lastLogin = user.lastLoginDate ? user.lastLoginDate.split('T')[0] : null;
        let newStreak = user.currentStreak || 0;

        if (lastLogin !== today) {
            if (lastLogin) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (lastLogin === yesterdayStr) {
                    newStreak += 1;
                } else {
                    newStreak = 1; // Reset
                }
            } else {
                newStreak = 1; // First login
            }

            // Update Firestore
            const userRef = doc(db, "users", user.id);
            await updateDoc(userRef, {
                currentStreak: newStreak,
                lastLoginDate: new Date().toISOString()
            });
            user.currentStreak = newStreak;
        }
        // --------------------

        // Set Middleware Cookie
        Cookies.set('es_session_token', user.id, { expires: 7, path: '/' });

        // Set Role Cookie
        const role = ADMIN_EMAILS.includes(user.email) ? 'admin' : 'student';
        Cookies.set('es_user_role', role, { expires: 7, path: '/' });
        Cookies.set('es_user_status', user.subscriptionStatus, { expires: 7, path: '/' });

        return { success: true, user };

    } catch (error: any) {
        console.error("Login Error:", error);
        let msg = "Erro ao fazer login.";
        if (error.code === 'auth/invalid-credential') msg = "E-mail ou senha incorretos.";
        if (error.code === 'auth/user-not-found') msg = "Usuário não encontrado.";
        if (error.code === 'auth/wrong-password') msg = "Senha incorreta.";
        if (error.code === 'auth/too-many-requests') msg = "Muitas tentativas. Tente mais tarde.";

        return { success: false, error: msg };
    }
}

/**
 * Register new user
 */
export async function register(
    name: string,
    email: string,
    password: string,
    confirmPassword: string
): Promise<AuthResult> {
    if (password !== confirmPassword) {
        return { success: false, error: 'Senhas não coincidem' };
    }

    try {
        // Create Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;

        // Create Firestore Document
        const newUser: User = {
            id: fbUser.uid,
            name: name,
            email: email,
            createdAt: new Date().toISOString(),
            currentStreak: 1,
            lastLoginDate: new Date().toISOString(),
            subscriptionStatus: 'free', // Freemium Start
            approvedPillar: 1, // Start at Pillar 1
        };

        // Run Firestore creation and Profile update in parallel to avoid race conditions
        await Promise.all([
            setDoc(doc(db, "users", fbUser.uid), newUser),
            firebaseUpdateProfile(fbUser, { displayName: name })
        ]);

        // Set Middleware Cookie
        Cookies.set('es_session_token', newUser.id, { expires: 7, path: '/' });
        const role = ADMIN_EMAILS.includes(email) ? 'admin' : 'student';
        Cookies.set('es_user_role', role, { expires: 7, path: '/' });
        Cookies.set('es_user_status', newUser.subscriptionStatus, { expires: 7, path: '/' });

        return { success: true, user: newUser };

    } catch (error: any) {
        console.error("Register Error:", error);
        let msg = "Erro ao criar conta.";
        if (error.code === 'auth/email-already-in-use') msg = "Este e-mail já está em uso.";
        if (error.code === 'auth/weak-password') msg = "A senha é muito fraca.";

        return { success: false, error: msg };
    }
}

/**
 * Update Profile
 */
export async function updateProfile(
    userId: string,
    name: string,
    email: string,
    phone?: string
): Promise<AuthResult> {
    try {
        const userRef = doc(db, "users", userId);
        const updateData: any = { name, email };
        if (phone) updateData.phone = phone;

        await updateDoc(userRef, updateData);

        // Fetch updated
        const user = await mapFirebaseUser(auth.currentUser!);
        return { success: true, user: user! };

    } catch (error) {
        return { success: false, error: 'Erro ao atualizar perfil.' };
    }
}

/**
 * Change Password (No old password required, but needs fresh session)
 */
export async function changePassword(newPassword: string): Promise<AuthResult> {
    try {
        const user = auth.currentUser;
        if (!user) return { success: false, error: 'Usuário não autenticado.' };

        await updatePassword(user, newPassword);
        return { success: true };
    } catch (error: any) {
        console.error("Change Password Error:", error);
        // Firebase specific errors
        if (error.code === 'auth/requires-recent-login') {
            return { success: false, error: 'Por segurança, faça login novamente antes de mudar a senha.' };
        }
        if (error.code === 'auth/weak-password') {
            return { success: false, error: 'A nova senha deve ter pelo menos 6 caracteres.' };
        }
        return { success: false, error: 'Erro ao alterar senha.' };
    }
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
    await signOut(auth);
    Cookies.remove('es_session_token', { path: '/' });
    Cookies.remove('es_user_role', { path: '/' });
}

/**
 * Get Current User (Helper for Context)
 * Note: Firebase Auth is async, so this is mostly for initial hydration if needed,
 * but real state comes from AuthContext listener.
 */
export function getCurrentUser(): User | null {
    // In Firebase, we rely on onAuthStateChanged in the context
    // This helper is kept for compatibility but returns null
    // The AuthContext will handle the real user loading.
    return null;
}

// ============================================================================
// SUBSCRIPTION ACTIVATION
// ============================================================================

import { validateCode, useCode } from './invite-codes';

export function initAuthFull(): void {
    // Firebase init
}

/**
 * Activate with Invite Code
 */
export async function activateWithInvite(userId: string, code: string): Promise<AuthResult> {
    // 1. Backdoor para Testes (Modo Deus)
    if (code === "ADMIN-TEST-KEY") {
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                subscriptionStatus: 'premium',
                subscriptionExpiresAt: expiresAt.toISOString(),
                inviteCodeUsed: 'ADMIN-TEST-KEY'
            });
            const user = await mapFirebaseUser(auth.currentUser!);
            return { success: true, user: user! };
        } catch (error) {
            return { success: false, error: 'Erro ao ativar conta de teste.' };
        }
    }

    // 2. Validação Real no Firestore
    try {
        const codesRef = collection(db, "invite_codes");
        const q = query(codesRef, where("code", "==", code), where("status", "==", "unused"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { success: false, error: 'Código inválido ou já utilizado.' };
        }

        const codeDoc = querySnapshot.docs[0];
        const codeRef = doc(db, "invite_codes", codeDoc.id);
        const userRef = doc(db, "users", userId);

        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        // Batch Write (Atomicidade: ou faz tudo ou nada)
        const batch = writeBatch(db);

        batch.update(codeRef, {
            status: 'used',
            usedBy: userId,
            usedAt: new Date().toISOString()
        });

        batch.update(userRef, {
            subscriptionStatus: 'premium',
            subscriptionExpiresAt: expiresAt.toISOString(),
            inviteCodeUsed: code
        });

        await batch.commit();

        const user = await mapFirebaseUser(auth.currentUser!);
        return { success: true, user: user! };

    } catch (error) {
        console.error("Invite Error:", error);
        return { success: false, error: 'Erro ao processar código.' };
    }
}

/**
 * Activate with Payment
 */
export async function activateWithPayment(userId: string, paymentId: string): Promise<AuthResult> {
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            subscriptionStatus: 'premium',
            subscriptionExpiresAt: expiresAt.toISOString(),
            paymentId
        });

        const user = await mapFirebaseUser(auth.currentUser!);
        return { success: true, user: user! };
    } catch (error) {
        return { success: false, error: 'Erro ao processar pagamento.' };
    }
}

/**
 * Check Subscription Status
 */
export function checkSubscriptionStatus(user: User): SubscriptionStatus | 'expired' {
    if (user.subscriptionStatus === 'free') return 'free';

    if (user.subscriptionStatus === 'premium' && user.subscriptionExpiresAt) {
        const now = new Date();
        const expires = new Date(user.subscriptionExpiresAt);
        if (now > expires) {
            return 'expired';
        }
    }

    // Legacy fallback
    if (user.subscriptionStatus === 'active' as any) return 'free';

    return user.subscriptionStatus;
}

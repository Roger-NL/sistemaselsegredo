import { createSessionSynchronizer } from "./session";
/**
 * Authentication Service (FIREBASE EDITION)
 * Firebase Auth + Firestore authentication service
 */

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    updateProfile as firebaseUpdateProfile,
    updateEmail,
    updatePassword,
    sendPasswordResetEmail,
    User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc, updateDoc, deleteField } from "firebase/firestore";
import type { FirebaseError } from "firebase/app";
import { auth, db } from "@/client/auth/firebase";


// Types
export type SubscriptionStatus = 'free' | 'premium' | 'expired';

export interface PendingPixPayment {
    paymentId: string;
    qrCode: string;
    qrCodePayload: string;
    createdAt: string;
    expiresAt: string;
    status: string;
    plan: "lifetime";
}

export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    lastLoginDate?: string;
    subscriptionStatus: SubscriptionStatus;
    subscriptionExpiresAt?: string;
    premiumActivatedAt?: string;
    inviteCodeUsed?: string;
    paymentId?: string;
    purchasedPlan?: "lifetime";
    pendingPixPayment?: PendingPixPayment | null;
    phone?: string;
    isAdmin?: boolean;
}

export interface AuthResult {
    success: boolean;
    user?: User;
    error?: string;
}

type FirestoreUserData = Partial<Omit<User, "id">> & {
    subscriptionStatus?: SubscriptionStatus | "active";
};

function buildFallbackUserFromAuth(fbUser: FirebaseUser): User {
    return {
        id: fbUser.uid,
        name: fbUser.displayName || "Usuário",
        email: fbUser.email || "",
        createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
        subscriptionStatus: "free",
        isAdmin: false,
    };
}

function isPendingPixPayment(value: unknown): value is PendingPixPayment {
    if (!value || typeof value !== "object") {
        return false;
    }

    const candidate = value as Record<string, unknown>;

    return (
        typeof candidate.paymentId === "string" &&
        typeof candidate.qrCode === "string" &&
        typeof candidate.qrCodePayload === "string" &&
        typeof candidate.createdAt === "string" &&
        typeof candidate.expiresAt === "string" &&
        typeof candidate.status === "string" &&
        candidate.plan === "lifetime"
    );
}

function getFirebaseErrorCode(error: unknown): string | null {
    if (typeof error === "object" && error !== null && "code" in error) {
        return (error as FirebaseError).code;
    }

    return null;
}

function normalizeSubscriptionStatus(status: User["subscriptionStatus"] | "active" | undefined): SubscriptionStatus {
    return status === "active" ? "free" : (status ?? "free");
}

export function isFirestorePermissionError(error: unknown): boolean {
    const errorCode = getFirebaseErrorCode(error);
    return errorCode === "permission-denied" || errorCode === "firestore/permission-denied";
}

/**
 * Convert Firebase User + Firestore Data to App User
 */
async function mapFirebaseUser(fbUser: FirebaseUser): Promise<User | null> {
    if (!(await createSessionSynchronizer()(fbUser, true))) throw new Error("SERVER_SESSION_FAILED");
    const tokenResult = await fbUser.getIdTokenResult();
    const isAdmin = tokenResult.claims.admin === true;
    const userDocRef = doc(db, "users", fbUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        const data = userDoc.data() as FirestoreUserData;

        // MIGRATION / COMPATIBILITY: Map 'active' (legacy) to 'free' or 'premium' based on fields?
        // For now, let's treat 'active' as 'free' unless we prove otherwise.
        // Actually, if 'active' was the default for everything, it is effectively 'free'.
        const status = normalizeSubscriptionStatus(data.subscriptionStatus);

        return {
            id: fbUser.uid,
            name: typeof data.name === "string" ? data.name : fbUser.displayName || "Usuário",
            email: fbUser.email || (typeof data.email === "string" ? data.email : ""),
            createdAt: typeof data.createdAt === "string" ? data.createdAt : fbUser.metadata.creationTime || new Date().toISOString(),
            lastLoginDate: typeof data.lastLoginDate === "string" ? data.lastLoginDate : undefined,
            subscriptionStatus: status,
            subscriptionExpiresAt: typeof data.subscriptionExpiresAt === "string" ? data.subscriptionExpiresAt : undefined,
            premiumActivatedAt: typeof data.premiumActivatedAt === "string" ? data.premiumActivatedAt : undefined,
            inviteCodeUsed: typeof data.inviteCodeUsed === "string" ? data.inviteCodeUsed : undefined,
            paymentId: typeof data.paymentId === "string" ? data.paymentId : undefined,
            purchasedPlan: data.purchasedPlan === "lifetime" ? data.purchasedPlan : undefined,
            pendingPixPayment: data.pendingPixPayment === null
                ? null
                : isPendingPixPayment(data.pendingPixPayment)
                    ? data.pendingPixPayment
                    : undefined,
            phone: typeof data.phone === "string" ? data.phone : undefined,
            isAdmin,
        };
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
        const fallbackUser = buildFallbackUserFromAuth(fbUser);
        fallbackUser.isAdmin = (await fbUser.getIdTokenResult()).claims.admin === true;

        const user = (await mapFirebaseUser(fbUser)) ?? fallbackUser;

        return { success: true, user };

    } catch (error: unknown) {
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
        const fallbackUser = buildFallbackUserFromAuth(fbUser);
        fallbackUser.isAdmin = (await fbUser.getIdTokenResult()).claims.admin === true;

        let user = fallbackUser;

        try {
            const firestoreUser = await mapFirebaseUser(fbUser);

            if (!firestoreUser) {
                return { success: false, error: 'Dados de usuário não encontrados.' };
            }

            user = firestoreUser;

        } catch (firestoreError) {
            if (!isFirestorePermissionError(firestoreError)) {
                throw firestoreError;
            }

            console.warn("Email login succeeded, but Firestore profile access was denied. Using auth fallback user.", firestoreError);
        }

        return { success: true, user };

    } catch (error: unknown) {
        console.error("Login Error:", error);
        let msg = "Erro ao fazer login.";
        const errorCode = getFirebaseErrorCode(error);
        if (errorCode === 'auth/invalid-credential') msg = "E-mail ou senha incorretos.";
        if (errorCode === 'auth/user-not-found') msg = "Usuário não encontrado.";
        if (errorCode === 'auth/wrong-password') msg = "Senha incorreta.";
        if (errorCode === 'auth/too-many-requests') msg = "Muitas tentativas. Tente mais tarde.";

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

        await firebaseUpdateProfile(fbUser, { displayName: name });
        const newUser = (await mapFirebaseUser(fbUser)) ?? buildFallbackUserFromAuth(fbUser);

        return { success: true, user: newUser };

    } catch (error: unknown) {
        console.error("Register Error:", error);
        let msg = "Erro ao criar conta.";
        const errorCode = getFirebaseErrorCode(error);
        if (errorCode === 'auth/email-already-in-use') msg = "Este e-mail já está em uso.";
        if (errorCode === 'auth/weak-password') msg = "A senha é muito fraca.";

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
        const currentUser = auth.currentUser;
        if (!currentUser || currentUser.uid !== userId) {
            return { success: false, error: 'Usuário não autenticado.' };
        }

        if (currentUser.email !== email) {
            await updateEmail(currentUser, email);
            // Refresh the Firebase claim before Firestore validates the profile copy.
            await currentUser.getIdToken(true);
        }

        if (currentUser.displayName !== name) {
            await firebaseUpdateProfile(currentUser, { displayName: name });
        }

        const userRef = doc(db, "users", userId);
        const updateData: Record<string, unknown> = {
            name,
            email,
            phone: phone?.trim() ? phone : deleteField(),
        };

        await updateDoc(userRef, updateData);

        // Fetch updated
        const user = await mapFirebaseUser(currentUser);
        return { success: true, user: user! };

    } catch (error: unknown) {
        const errorCode = getFirebaseErrorCode(error);
        if (errorCode === 'auth/requires-recent-login') {
            return { success: false, error: 'Por segurança, faça login novamente antes de alterar o e-mail.' };
        }
        if (errorCode === 'auth/email-already-in-use') {
            return { success: false, error: 'Este e-mail já está em uso.' };
        }
        if (errorCode === 'auth/invalid-email') {
            return { success: false, error: 'Formato de e-mail inválido.' };
        }
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
    } catch (error: unknown) {
        console.error("Change Password Error:", error);
        // Firebase specific errors
        const errorCode = getFirebaseErrorCode(error);
        if (errorCode === 'auth/requires-recent-login') {
            return { success: false, error: 'Por segurança, faça login novamente antes de mudar a senha.' };
        }
        if (errorCode === 'auth/weak-password') {
            return { success: false, error: 'A nova senha deve ter pelo menos 6 caracteres.' };
        }
        return { success: false, error: 'Erro ao alterar senha.' };
    }
}

/**
 * Reset Password (Send Email)
 */
export async function resetPassword(email: string): Promise<AuthResult> {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error: unknown) {
        console.error("Reset Password Error:", error);
        const errorCode = getFirebaseErrorCode(error);
        if (errorCode === 'auth/user-not-found') {
            return { success: false, error: 'Não há usuário cadastrado com este e-mail.' };
        }
        if (errorCode === 'auth/invalid-email') {
            return { success: false, error: 'Formato de e-mail inválido.' };
        }
        return { success: false, error: 'Erro ao enviar e-mail de recuperação.' };
    }
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
    await signOut(auth);
}

type AuthJsonResponse<T> =
    | { ok: true; data: T }
    | { ok: false; error: string };

async function postAuthenticatedAuthJson<T>(
    path: string,
    payload: Record<string, unknown>
): Promise<AuthJsonResponse<T>> {
    const currentUser = auth.currentUser;

    if (!currentUser) {
        return { ok: false, error: "Usuario nao autenticado." };
    }

    try {
        const idToken = await currentUser.getIdToken();
        const response = await fetch(path, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
            },
            credentials: "include",
            body: JSON.stringify(payload),
        });

        const data = (await response.json().catch(() => null)) as { error?: string } | null;

        if (!response.ok) {
            return {
                ok: false,
                error: typeof data?.error === "string" ? data.error : "Erro ao processar solicitacao.",
            };
        }

        return { ok: true, data: (data ?? {}) as T };
    } catch (error) {
        console.error(`Error calling ${path}:`, error);
        return { ok: false, error: "Erro de comunicacao com o servidor." };
    }
}

// ============================================================================
// SUBSCRIPTION ACTIVATION
// ============================================================================

/**
 * Activate with Invite Code
 */
export async function activateWithInvite(userId: string, code: string): Promise<AuthResult> {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            return { success: false, error: "Usuario nao autenticado." };
        }

        if (userId && currentUser.uid !== userId) {
            return { success: false, error: "Sessao divergente. Entre novamente antes de ativar o convite." };
        }

        const normalizedCode = code.trim().replace(/\s+/g, "").toUpperCase();
        if (!normalizedCode) {
            return { success: false, error: "Codigo de convite obrigatorio." };
        }

        const activationResult = await postAuthenticatedAuthJson<{ success: boolean; inviteCode: string }>(
            "/api/auth/invite",
            { code: normalizedCode }
        );

        if (!activationResult.ok) {
            return { success: false, error: activationResult.error };
        }

        const user = await mapFirebaseUser(currentUser);
        if (!user) {
            return { success: false, error: "Nao foi possivel atualizar o perfil apos a ativacao." };
        }

        return { success: true, user };

    } catch (error: unknown) {
        console.error("Invite Error:", error);
        return { success: false, error: 'Erro ao processar codigo.' };
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

    return normalizeSubscriptionStatus(user.subscriptionStatus as User["subscriptionStatus"] | "active");
}

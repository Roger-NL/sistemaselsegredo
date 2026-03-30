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
    updateEmail,
    updatePassword,
    sendPasswordResetEmail,
    User as FirebaseUser
} from "firebase/auth";
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteField,
    collection,
    query,
    where,
    getDocs,
    writeBatch
} from "firebase/firestore";
import type { FirebaseError } from "firebase/app";
import { auth, db } from "@/lib/firebase";
import Cookies from 'js-cookie';

// ADMIN LIST (Hardcoded for MVP Phase)
const ADMIN_EMAILS = ["roger@esacademy.com", "admin@esacademy.com", "raugerac@gmail.com"];

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
    currentStreak: number;
    subscriptionStatus: SubscriptionStatus;
    subscriptionExpiresAt?: string;
    inviteCodeUsed?: string;
    paymentId?: string;
    purchasedPlan?: "lifetime";
    pendingPixPayment?: PendingPixPayment | null;
    phone?: string;
    approvedPillar?: number; // Controle manual de progressão
    // New Progress Fields that persist to Firebase
    chosenSpecialization?: string | null;
    specializationStatus?: 'studying' | 'pending_approval' | 'completed' | null;
    completedSpecializations?: string[];
    completedModules?: Record<string, number[]>; // Map of specId -> [1, 2, 3]
    completedPillarModules?: string[]; // IDs of unique modules like 'p1-m1', 'p2-m1'
    hasSeenMissionComplete?: boolean;
    localPillarStatus?: Record<string, string>; // Optional: Sync the full pillar status map if desired
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
        currentStreak: 0,
        subscriptionStatus: "free",
        approvedPillar: 1,
    };
}

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isCompletedModulesMap(value: unknown): value is Record<string, number[]> {
    if (!value || typeof value !== "object") {
        return false;
    }

    return Object.values(value).every(
        (entry) => Array.isArray(entry) && entry.every((item) => typeof item === "number")
    );
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
        const data = userDoc.data() as FirestoreUserData;

        // MIGRATION / COMPATIBILITY: Map 'active' (legacy) to 'free' or 'premium' based on fields?
        // For now, let's treat 'active' as 'free' unless we prove otherwise.
        // Actually, if 'active' was the default for everything, it is effectively 'free'.
        const status = normalizeSubscriptionStatus(data.subscriptionStatus);

        return {
            id: fbUser.uid,
            name: typeof data.name === "string" ? data.name : fbUser.displayName || "Usuário",
            email: typeof data.email === "string" ? data.email : fbUser.email || "",
            createdAt: typeof data.createdAt === "string" ? data.createdAt : fbUser.metadata.creationTime || new Date().toISOString(),
            currentStreak: typeof data.currentStreak === "number" ? data.currentStreak : 0,
            lastLoginDate: typeof data.lastLoginDate === "string" ? data.lastLoginDate : undefined,
            subscriptionStatus: status,
            subscriptionExpiresAt: typeof data.subscriptionExpiresAt === "string" ? data.subscriptionExpiresAt : undefined,
            inviteCodeUsed: typeof data.inviteCodeUsed === "string" ? data.inviteCodeUsed : undefined,
            paymentId: typeof data.paymentId === "string" ? data.paymentId : undefined,
            purchasedPlan: data.purchasedPlan === "lifetime" ? data.purchasedPlan : undefined,
            pendingPixPayment: data.pendingPixPayment === null
                ? null
                : isPendingPixPayment(data.pendingPixPayment)
                    ? data.pendingPixPayment
                    : undefined,
            phone: typeof data.phone === "string" ? data.phone : undefined,
            approvedPillar: typeof data.approvedPillar === "number" ? data.approvedPillar : undefined,
            chosenSpecialization:
                typeof data.chosenSpecialization === "string" || data.chosenSpecialization === null
                    ? data.chosenSpecialization
                    : undefined,
            specializationStatus:
                data.specializationStatus === "studying" ||
                data.specializationStatus === "pending_approval" ||
                data.specializationStatus === "completed" ||
                data.specializationStatus === null
                    ? data.specializationStatus
                    : undefined,
            completedSpecializations: isStringArray(data.completedSpecializations) ? data.completedSpecializations : undefined,
            completedModules: isCompletedModulesMap(data.completedModules) ? data.completedModules : undefined,
            completedPillarModules: isStringArray(data.completedPillarModules) ? data.completedPillarModules : undefined,
            hasSeenMissionComplete:
                typeof data.hasSeenMissionComplete === "boolean" ? data.hasSeenMissionComplete : undefined,
            localPillarStatus:
                data.localPillarStatus && typeof data.localPillarStatus === "object"
                    ? Object.fromEntries(
                        Object.entries(data.localPillarStatus).filter(([, value]) => typeof value === "string")
                    )
                    : undefined,
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

        let user: User = fallbackUser;

        try {
            const userDocRef = doc(db, "users", fbUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                await updateDoc(userDocRef, {
                    lastLoginDate: new Date().toISOString()
                });
                user = (await mapFirebaseUser(fbUser)) ?? fallbackUser;
            } else {
                const newUser: User = {
                    ...fallbackUser,
                    name: fbUser.displayName || "Usuário Google",
                    currentStreak: 1,
                    lastLoginDate: new Date().toISOString(),
                };

                await setDoc(userDocRef, newUser);
                user = newUser;
            }
        } catch (firestoreError) {
            if (!isFirestorePermissionError(firestoreError)) {
                throw firestoreError;
            }

            console.warn("Google login succeeded, but Firestore profile access was denied. Using auth fallback user.", firestoreError);
        }

        // Cookies
        Cookies.set('es_session_token', user.id, { expires: 7, path: '/' });
        const role = ADMIN_EMAILS.includes(user.email) ? 'admin' : 'student';
        Cookies.set('es_user_role', role, { expires: 7, path: '/' });
        Cookies.set('es_user_status', user.subscriptionStatus, { expires: 7, path: '/' });

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

        let user = fallbackUser;

        try {
            const firestoreUser = await mapFirebaseUser(fbUser);

            if (!firestoreUser) {
                return { success: false, error: 'Dados de usuário não encontrados.' };
            }

            user = firestoreUser;

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

                const userRef = doc(db, "users", user.id);
                await updateDoc(userRef, {
                    currentStreak: newStreak,
                    lastLoginDate: new Date().toISOString()
                });
                user.currentStreak = newStreak;
            }
        } catch (firestoreError) {
            if (!isFirestorePermissionError(firestoreError)) {
                throw firestoreError;
            }

            console.warn("Email login succeeded, but Firestore profile access was denied. Using auth fallback user.", firestoreError);
        }

        // Set Middleware Cookie
        Cookies.set('es_session_token', user.id, { expires: 7, path: '/' });

        // Set Role Cookie
        const role = ADMIN_EMAILS.includes(user.email) ? 'admin' : 'student';
        Cookies.set('es_user_role', role, { expires: 7, path: '/' });
        Cookies.set('es_user_status', user.subscriptionStatus, { expires: 7, path: '/' });

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

        try {
            await Promise.all([
                setDoc(doc(db, "users", fbUser.uid), newUser),
                firebaseUpdateProfile(fbUser, { displayName: name })
            ]);
        } catch (firestoreError) {
            if (!isFirestorePermissionError(firestoreError)) {
                throw firestoreError;
            }

            console.warn("Registration succeeded, but Firestore profile creation was denied. Using auth fallback user.", firestoreError);
        }

        // Set Middleware Cookie
        Cookies.set('es_session_token', newUser.id, { expires: 7, path: '/' });
        const role = ADMIN_EMAILS.includes(email) ? 'admin' : 'student';
        Cookies.set('es_user_role', role, { expires: 7, path: '/' });
        Cookies.set('es_user_status', newUser.subscriptionStatus, { expires: 7, path: '/' });

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
        if (!currentUser) {
            return { success: false, error: 'Usuário não autenticado.' };
        }

        if (currentUser.email !== email) {
            await updateEmail(currentUser, email);
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
        } catch {
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

    } catch (error: unknown) {
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
    } catch {
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
    return normalizeSubscriptionStatus(user.subscriptionStatus as User["subscriptionStatus"] | "active");
}
/**
 * Update specifically user progress fields (without overwriting other profile data)
 * Used by ProgressContext
 */
export async function updateUserProgress(userId: string, progressData: Partial<User>): Promise<void> {
    try {
        const userRef = doc(db, "users", userId);
        // Only update fields that are actually progress related to be safe
        const safeUpdate = {
            ...(progressData.chosenSpecialization !== undefined && { chosenSpecialization: progressData.chosenSpecialization }),
            ...(progressData.specializationStatus !== undefined && { specializationStatus: progressData.specializationStatus }),
            ...(progressData.completedSpecializations !== undefined && { completedSpecializations: progressData.completedSpecializations }),
            ...(progressData.completedModules !== undefined && { completedModules: progressData.completedModules }),
            ...(progressData.completedPillarModules !== undefined && { completedPillarModules: progressData.completedPillarModules }),
            ...(progressData.hasSeenMissionComplete !== undefined && { hasSeenMissionComplete: progressData.hasSeenMissionComplete }),
            ...(progressData.localPillarStatus !== undefined && { localPillarStatus: progressData.localPillarStatus }),
            ...(progressData.approvedPillar !== undefined && { approvedPillar: progressData.approvedPillar }),
        };

        if (Object.keys(safeUpdate).length > 0) {
            await updateDoc(userRef, safeUpdate);
        }
    } catch (error) {
        if (!isFirestorePermissionError(error)) {
            console.error("Error syncing progress to Firebase:", error);
        }
        // Silently fail or retry - we don't want to block the UI for this background sync
    }
}

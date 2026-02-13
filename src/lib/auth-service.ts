/**
 * Authentication Service
 * Abstraction layer to easily swap local-db for Firebase
 */

import {
    User,
    SubscriptionStatus,
    initDB,
    getUserByIdentifier,
    getUserById,
    emailExists,
    validatePassword,
    createUser as dbCreateUser,
    updateUser as dbUpdateUser,
    createSession,
    getSession,
    clearSession,
} from './local-db';

export type { User, SubscriptionStatus } from './local-db';

export interface AuthResult {
    success: boolean;
    user?: Omit<User, 'passwordHash'>;
    error?: string;
}

/**
 * Initialize auth service
 */
export function initAuth(): void {
    initDB();
}

/**
 * Sanitize user object (remove password hash)
 */
function sanitizeUser(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
}

/**
 * Login with email/name and password
 */
export async function login(identifier: string, password: string): Promise<AuthResult> {
    // Simulate network delay for realistic UX
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!identifier || !password) {
        return { success: false, error: 'Preencha todos os campos' };
    }

    const user = getUserByIdentifier(identifier);

    if (!user) {
        return { success: false, error: 'Usuário não encontrado' };
    }

    if (!validatePassword(user, password)) {
        return { success: false, error: 'Senha incorreta' };
    }

    // UPDATE STREAK LOGIC
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const lastLogin = user.lastLoginDate ? user.lastLoginDate.split('T')[0] : null;

    let newStreak = user.currentStreak || 0;

    if (lastLogin !== today) {
        // Check if yesterday to increment, otherwise reset (or keep 1)
        if (lastLogin) {
            const yesterdayDate = new Date();
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const yesterday = yesterdayDate.toISOString().split('T')[0];

            if (lastLogin === yesterday) {
                newStreak += 1;
            } else {
                // Missed a day or more: logical reset could be 1, 
                // but user said "se entrei 200 é duzendo", implies total visits or just keeping count?
                // "se eu entrei 1 vez deixa 1 se entrei 200 é duzendo"
                // Usually this means "I want to see the count of how many times I accessed/logged in" OR "Days Streak".
                // Given "Dias Seguidos" in UI, I'll stick to Streak logic. 
                // If they miss a day, streak resets to 1 (today).
                newStreak = 1;
            }
        } else {
            // No last login date (first time post-migration), set to 1
            newStreak = 1;
        }

        // Update DB
        dbUpdateUser(user.id, {
            currentStreak: newStreak,
            lastLoginDate: new Date().toISOString()
        });

        // Update local object for return
        user.currentStreak = newStreak;
    }
    // If lastLogin === today, do nothing (streak already counted for today)

    createSession(user.id);

    return { success: true, user: sanitizeUser(user) };
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
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Validations
    if (!name || !email || !password || !confirmPassword) {
        return { success: false, error: 'Preencha todos os campos' };
    }

    if (password.length < 4) {
        return { success: false, error: 'Senha deve ter pelo menos 4 caracteres' };
    }

    if (password !== confirmPassword) {
        return { success: false, error: 'Senhas não coincidem' };
    }

    if (emailExists(email)) {
        return { success: false, error: 'Este email já está cadastrado' };
    }

    const user = dbCreateUser(name, email, password);
    createSession(user.id);

    return { success: true, user: sanitizeUser(user) };
}

/**
 * Update user profile
 */
export async function updateProfile(
    userId: string,
    name: string,
    email: string,
    phone?: string
): Promise<AuthResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!name || !email) {
        return { success: false, error: 'Nome e email são obrigatórios' };
    }

    // Check if new email conflicts with another user
    const existingUser = getUserByIdentifier(email);
    if (existingUser && existingUser.id !== userId) {
        return { success: false, error: 'Este email já está em uso por outro usuário' };
    }

    const updatedUser = dbUpdateUser(userId, { name, email, phone });

    if (!updatedUser) {
        return { success: false, error: 'Erro ao atualizar usuário' };
    }

    return { success: true, user: sanitizeUser(updatedUser) };
}


/**
 * Get currently logged in user
 */
export function getCurrentUser(): Omit<User, 'passwordHash'> | null {
    const session = getSession();
    if (!session) return null;

    const user = getUserById(session.userId);
    if (!user) {
        clearSession();
        return null;
    }

    return sanitizeUser(user);
}

/**
 * Logout current user
 */
export function logout(): void {
    clearSession();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return getCurrentUser() !== null;
}

// ============================================================================
// SUBSCRIPTION ACTIVATION
// ============================================================================

import { validateCode, useCode, initInviteCodes } from './invite-codes';

/**
 * Initialize invite codes on auth init
 */
export function initAuthFull(): void {
    initDB();
    initInviteCodes();
}

/**
 * Activate subscription with invite code
 */
export async function activateWithInvite(userId: string, code: string): Promise<AuthResult> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const validCode = validateCode(code);
    if (!validCode) {
        return { success: false, error: 'Código inválido ou expirado' };
    }

    // Use the code (increment counter)
    const used = useCode(code);
    if (!used) {
        return { success: false, error: 'Erro ao processar código' };
    }

    // Activate user subscription (1 year)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const updatedUser = dbUpdateUser(userId, {
        subscriptionStatus: 'active',
        subscriptionExpiresAt: expiresAt.toISOString(),
        inviteCodeUsed: validCode.code
    });

    if (!updatedUser) {
        return { success: false, error: 'Erro ao ativar conta' };
    }

    return { success: true, user: sanitizeUser(updatedUser) };
}

/**
 * Activate subscription with payment (placeholder for real integration)
 */
export async function activateWithPayment(userId: string, paymentId: string): Promise<AuthResult> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In production, verify payment with gateway (Stripe, Mercado Pago, etc)
    // For now, just activate

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const updatedUser = dbUpdateUser(userId, {
        subscriptionStatus: 'active',
        subscriptionExpiresAt: expiresAt.toISOString(),
        paymentId
    });

    if (!updatedUser) {
        return { success: false, error: 'Erro ao processar pagamento' };
    }

    return { success: true, user: sanitizeUser(updatedUser) };
}

/**
 * Check if subscription is still valid
 */
export function checkSubscriptionStatus(user: Omit<User, 'passwordHash'>): 'pending' | 'active' | 'expired' {
    if (user.subscriptionStatus === 'pending') return 'pending';

    if (user.subscriptionStatus === 'active' && user.subscriptionExpiresAt) {
        const now = new Date();
        const expires = new Date(user.subscriptionExpiresAt);
        if (now > expires) {
            return 'expired';
        }
    }

    return user.subscriptionStatus;
}


/**
 * Local Database using localStorage
 * Designed to be easily replaceable with Firebase
 */

import { secureStorage } from "@/lib/secure-storage";

const DB_KEY = 'es-academy-users-db';
const SESSION_KEY = 'es-academy-session';

export type SubscriptionStatus = 'pending' | 'active' | 'expired';

export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    createdAt: string;
    lastLoginDate?: string; // ISO String
    currentStreak: number;
    // Access Control
    subscriptionStatus: SubscriptionStatus;
    subscriptionExpiresAt?: string; // ISO date
    inviteCodeUsed?: string;
    paymentId?: string;
    phone?: string; // WhatsApp number
}

export interface Session {
    userId: string;
    createdAt: string;
}

// Simple hash function for local storage (NOT secure for production)
// Firebase Auth will handle proper password hashing
function simpleHash(password: string): string {
    return btoa(password + '-es-salt-2024');
}

function generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Initialize database with seed user
 */
export function initDB(): void {
    if (typeof window === 'undefined') return;

    const existing = secureStorage.getItem(DB_KEY);
    if (existing) return; // DB already exists

    // Seed with default user: roger / 1234
    // Simulate some streak for visual interest initially if desired, 
    // but based on request logic, it will start small or update on login
    const seedUser: User = {
        id: generateId(),
        name: 'roger',
        email: 'roger@esacademy.com',
        passwordHash: simpleHash('1234'),
        createdAt: new Date().toISOString(),
        currentStreak: 1,
        lastLoginDate: new Date().toISOString(),
        subscriptionStatus: 'active', // Seed user has full access
    };

    const db: User[] = [seedUser];
    secureStorage.setItem(DB_KEY, db);
    console.log('[LocalDB] Database initialized with seed user');
}

/**
 * Get all users
 */
export function getUsers(): User[] {
    if (typeof window === 'undefined') return [];

    const data = secureStorage.getItem<User[]>(DB_KEY);
    if (!data) {
        initDB();
        return getUsers();
    }
    return data;
}

/**
 * Find user by email or name
 */
export function getUserByIdentifier(identifier: string): User | null {
    const users = getUsers();
    const lowerIdentifier = identifier.toLowerCase();
    return users.find(
        u => u.email.toLowerCase() === lowerIdentifier ||
            u.name.toLowerCase() === lowerIdentifier
    ) || null;
}

/**
 * Find user by ID
 */
export function getUserById(id: string): User | null {
    const users = getUsers();
    return users.find(u => u.id === id) || null;
}

/**
 * Check if email already exists
 */
export function emailExists(email: string): boolean {
    const users = getUsers();
    return users.some(u => u.email.toLowerCase() === email.toLowerCase());
}

/**
 * Validate password for a user
 */
export function validatePassword(user: User, password: string): boolean {
    return user.passwordHash === simpleHash(password);
}

/**
 * Create new user
 */
export function createUser(name: string, email: string, password: string): User {
    const users = getUsers();

    const newUser: User = {
        id: generateId(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: simpleHash(password),
        createdAt: new Date().toISOString(),
        currentStreak: 1, // Start with streak 1
        lastLoginDate: new Date().toISOString(),
        subscriptionStatus: 'active', // Freemium: new users get immediate access
    };

    users.push(newUser);
    secureStorage.setItem(DB_KEY, users);

    return newUser;
}

/**
 * Update user data
 */
export function updateUser(userId: string, data: Partial<Omit<User, 'id' | 'passwordHash' | 'createdAt'>>): User | null {
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);

    if (index === -1) return null;

    users[index] = {
        ...users[index],
        ...data,
    };

    secureStorage.setItem(DB_KEY, users);
    return users[index];
}

/**
 * Session Management
 */
export function createSession(userId: string): void {
    if (typeof window === 'undefined') return;

    const session: Session = {
        userId,
        createdAt: new Date().toISOString(),
    };
    secureStorage.setItem(SESSION_KEY, session);
}

export function getSession(): Session | null {
    if (typeof window === 'undefined') return null;

    return secureStorage.getItem<Session>(SESSION_KEY);
}

export function clearSession(): void {
    if (typeof window === 'undefined') return;
    secureStorage.removeItem(SESSION_KEY);
}

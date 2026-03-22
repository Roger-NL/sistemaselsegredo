/**
 * Invite Codes System
 * Manages invite codes for premium access activation
 */

const INVITE_CODES_KEY = 'es-academy-invite-codes';

export interface InviteCode {
    id: string;
    code: string;
    maxUses: number;
    currentUses: number;
    createdBy: string;
    createdAt: string;
    isActive: boolean;
}

function isInviteCode(value: unknown): value is InviteCode {
    if (!value || typeof value !== "object") {
        return false;
    }

    const inviteCode = value as Partial<InviteCode>;
    return (
        typeof inviteCode.id === "string" &&
        typeof inviteCode.code === "string" &&
        typeof inviteCode.maxUses === "number" &&
        typeof inviteCode.currentUses === "number" &&
        typeof inviteCode.createdBy === "string" &&
        typeof inviteCode.createdAt === "string" &&
        typeof inviteCode.isActive === "boolean"
    );
}

function parseInviteCodes(rawData: string): InviteCode[] {
    try {
        const parsed: unknown = JSON.parse(rawData);
        return Array.isArray(parsed) ? parsed.filter(isInviteCode) : [];
    } catch (error) {
        console.error("[InviteCodes] Failed to parse stored codes:", error);
        return [];
    }
}

/**
 * Generate unique code
 */
function generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No confusing chars
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return `BS-${code}`;
}

/**
 * Initialize invite codes with some defaults
 */
export function initInviteCodes(): void {
    if (typeof window === 'undefined') return;

    const existing = localStorage.getItem(INVITE_CODES_KEY);
    if (existing) return;

    // Seed with some default codes
    const seedCodes: InviteCode[] = [
        {
            id: 'inv_1',
            code: 'BS-FRIENDS',
            maxUses: 100,
            currentUses: 0,
            createdBy: 'system',
            createdAt: new Date().toISOString(),
            isActive: true
        },
        {
            id: 'inv_2',
            code: 'BS-VIP2024',
            maxUses: 50,
            currentUses: 0,
            createdBy: 'system',
            createdAt: new Date().toISOString(),
            isActive: true
        },
        {
            id: 'inv_3',
            code: 'BS-BETA',
            maxUses: 10,
            currentUses: 0,
            createdBy: 'system',
            createdAt: new Date().toISOString(),
            isActive: true
        }
    ];

    localStorage.setItem(INVITE_CODES_KEY, JSON.stringify(seedCodes));
    console.log('[InviteCodes] Initialized with seed codes');
}

/**
 * Get all invite codes
 */
export function getAllCodes(): InviteCode[] {
    if (typeof window === 'undefined') return [];

    const data = localStorage.getItem(INVITE_CODES_KEY);
    if (!data) {
        initInviteCodes();
        return getAllCodes();
    }

    const codes = parseInviteCodes(data);
    if (codes.length === 0) {
        initInviteCodes();
        return getAllCodes();
    }

    return codes;
}

/**
 * Validate an invite code
 * Returns the code object if valid, null otherwise
 */
export function validateCode(code: string): InviteCode | null {
    const codes = getAllCodes();
    const upperCode = code.toUpperCase().trim();

    const found = codes.find(c =>
        c.code.toUpperCase() === upperCode &&
        c.isActive &&
        c.currentUses < c.maxUses
    );

    return found || null;
}

/**
 * Use an invite code (increment usage counter)
 * Returns true if successful
 */
export function useCode(code: string): boolean {
    const codes = getAllCodes();
    const upperCode = code.toUpperCase().trim();

    const index = codes.findIndex(c =>
        c.code.toUpperCase() === upperCode &&
        c.isActive &&
        c.currentUses < c.maxUses
    );

    if (index === -1) return false;

    codes[index].currentUses += 1;
    localStorage.setItem(INVITE_CODES_KEY, JSON.stringify(codes));

    return true;
}

/**
 * Create a new invite code (admin function)
 */
export function createInviteCode(maxUses: number, createdBy: string): InviteCode {
    const codes = getAllCodes();

    const newCode: InviteCode = {
        id: `inv_${Date.now()}`,
        code: generateCode(),
        maxUses,
        currentUses: 0,
        createdBy,
        createdAt: new Date().toISOString(),
        isActive: true
    };

    codes.push(newCode);
    localStorage.setItem(INVITE_CODES_KEY, JSON.stringify(codes));

    return newCode;
}

/**
 * Deactivate a code
 */
export function deactivateCode(codeId: string): boolean {
    const codes = getAllCodes();
    const index = codes.findIndex(c => c.id === codeId);

    if (index === -1) return false;

    codes[index].isActive = false;
    localStorage.setItem(INVITE_CODES_KEY, JSON.stringify(codes));

    return true;
}

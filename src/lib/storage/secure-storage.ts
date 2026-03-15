import CryptoJS from 'crypto-js';

// Secret key for obfuscation (Client-side only, so not truly secret, but stops 99% of users)
// In a real app, this would be env var, but for client-side storage, it's just a barrier.
const SECRET_KEY = "ES-ACADEMY-TOP-SECRET-PROTOCOL-V1";

export const secureStorage = {
    /**
     * Save data encrypted to localStorage
     */
    setItem: (key: string, value: any): void => {
        if (typeof window === 'undefined') return;

        try {
            const jsonString = JSON.stringify(value);
            const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
            localStorage.setItem(key, encrypted);
        } catch (error) {
            console.error("Error encrypting data for storage:", error);
            // Fallback to plain text if encryption fails (better than losing data)
            localStorage.setItem(key, JSON.stringify(value));
        }
    },

    /**
     * Get data from localStorage (Auto-decrypts or migrates plain text)
     */
    getItem: <T>(key: string): T | null => {
        if (typeof window === 'undefined') return null;

        const storedValue = localStorage.getItem(key);
        if (!storedValue) return null;

        try {
            // 1. Try to decrypt
            const bytes = CryptoJS.AES.decrypt(storedValue, SECRET_KEY);
            const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

            // 2. If decryption resulted in a valid string, parse it
            if (decryptedString) {
                return JSON.parse(decryptedString) as T;
            }

            // 3. If decryptedString is empty, it might be old plain text data
            // OR invalid ciphertext. Let's try parsing the original storedValue.
            throw new Error("Decryption failed or returned empty");

        } catch (e) {
            // 4. Fallback: Try to parse as plain JSON (Migration Strategy)
            try {
                const plainData = JSON.parse(storedValue);
                
                // If valid JSON, it's legacy data. Encrypt it immediately for next time.
                // We use a timeout to not block the current read operation.
                setTimeout(() => {
                    secureStorage.setItem(key, plainData);
                    console.log(`[SecureStorage] Migrated legacy data for key: ${key}`);
                }, 100);

                return plainData as T;
            } catch (jsonError) {
                // If it's neither encrypted nor valid JSON, it's corrupted or just a raw string
                console.error("Error parsing storage data:", jsonError);
                return null;
            }
        }
    },

    /**
     * Remove item from storage
     */
    removeItem: (key: string): void => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(key);
    }
};

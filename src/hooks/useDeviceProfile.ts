"use client";

/**
 * Shared device profile detection for performance optimizations.
 * Targets degraded Samsung Galaxy S8–S22 phones specifically.
 *
 * Uses navigator.deviceMemory, hardwareConcurrency, and pointer media query
 * to detect low-power devices at runtime. Powerful devices are unaffected.
 */

type PerformanceNavigator = Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
};

export interface DeviceProfile {
    /** True if the device is likely a degraded/low-power phone */
    isLowPower: boolean;
    /** True if the device uses touch (coarse pointer) */
    isMobile: boolean;
    /** True if the user has requested reduced motion */
    prefersReducedMotion: boolean;
}

let cachedProfile: DeviceProfile | null = null;

/**
 * Detect device profile once and cache the result.
 * Safe to call on server (returns conservative defaults).
 */
export function getDeviceProfile(): DeviceProfile {
    if (cachedProfile) return cachedProfile;

    if (typeof window === "undefined" || typeof navigator === "undefined") {
        return { isLowPower: false, isMobile: false, prefersReducedMotion: false };
    }

    const nav = navigator as PerformanceNavigator;
    const deviceMemory = typeof nav.deviceMemory === "number" ? nav.deviceMemory : 8;
    const hardwareConcurrency = nav.hardwareConcurrency ?? 8;
    const saveData = nav.connection?.saveData === true;
    const slowConnection = nav.connection?.effectiveType === "2g" || nav.connection?.effectiveType === "slow-2g";

    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Detect low-power: few cores, low memory, save-data, or slow connection
    const isLowPower =
        hardwareConcurrency <= 4 ||
        deviceMemory <= 4 ||
        saveData ||
        slowConnection ||
        prefersReducedMotion;

    cachedProfile = { isLowPower, isMobile, prefersReducedMotion };
    return cachedProfile;
}

import React from "react";
// src/utils/performance.ts

/** Detect if the user prefers reduced motion */
export const useReducedMotion = (): boolean => {
    const [reduced, setReduced] = React.useState(false);
    React.useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handler = () => setReduced(media.matches);
        handler();
        media.addEventListener('change', handler);
        return () => media.removeEventListener('change', handler);
    }, []);
    return reduced;
};

/** Simple clamp utility */
export const clamp = (v: number, min: number, max: number): number =>
    Math.max(min, Math.min(max, v));

/** Dead‑zone helper to snap tiny values to zero */
export const deadZone = (v: number, threshold = 0.5): number =>
    Math.abs(v) < threshold ? 0 : v;

/** Hook to detect mobile viewport */
export const useIsMobile = (breakpoint = 768): boolean => {
    const [isMobile, setIsMobile] = React.useState(
        typeof window !== 'undefined' ? window.innerWidth < breakpoint : false,
    );
    React.useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < breakpoint);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    return isMobile;
};

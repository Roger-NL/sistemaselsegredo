"use client";

import React, { useRef, useState, useEffect, memo, useCallback } from 'react';
import { cn } from "@/lib/ui/cn";
import { neonTubesHtml } from './neon-tubes-html';

interface TubesBackgroundProps {
    children?: React.ReactNode;
    className?: string;
    enableClickInteraction?: boolean;
}

function TubesBackgroundComponent({
    children,
    className,
}: TubesBackgroundProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [showIframe, setShowIframe] = useState(false);
    const hasActivatedIframeRef = useRef(false);
    const pendingPointerRef = useRef<{ x: number; y: number } | null>(null);
    const lastPostedPointerRef = useRef<{ x: number; y: number } | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const frameBudgetRef = useRef(1000 / 36);
    const lastPostedAtRef = useRef(0);
    const activationTimerRef = useRef<number | null>(null);
    const fallbackTimerRef = useRef<number | null>(null);

    const activateIframe = useCallback(() => {
        if (hasActivatedIframeRef.current) return;
        hasActivatedIframeRef.current = true;
        setShowIframe(true);
    }, []);

    useEffect(() => {
        const navigatorProfile = navigator as Navigator & { deviceMemory?: number };
        const connectionProfile = navigatorProfile as Navigator & {
            connection?: { saveData?: boolean };
        };
        const deviceMemory = typeof navigatorProfile.deviceMemory === "number" ? navigatorProfile.deviceMemory : 8;
        const hardwareConcurrency = navigatorProfile.hardwareConcurrency ?? 8;
        const isLowPowerDevice = hardwareConcurrency <= 4 || deviceMemory <= 4 || connectionProfile.connection?.saveData === true;
        const isMobilePointer = window.matchMedia("(pointer: coarse)").matches;
        frameBudgetRef.current = 1000 / (isLowPowerDevice ? 16 : 36);

        if (isLowPowerDevice || isMobilePointer) {
            const activateOnInteraction = () => {
                activateIframe();
            };

            window.addEventListener("pointerdown", activateOnInteraction, { passive: true, once: true });
            window.addEventListener("touchstart", activateOnInteraction, { passive: true, once: true });
            window.addEventListener("keydown", activateOnInteraction, { once: true });
            window.addEventListener("scroll", activateOnInteraction, { passive: true, once: true });

            activationTimerRef.current = window.setTimeout(() => {
                activateIframe();
            }, 4000);

            fallbackTimerRef.current = window.setTimeout(() => {
                activateIframe();
            }, 7000);

            return () => {
                if (activationTimerRef.current !== null) {
                    window.clearTimeout(activationTimerRef.current);
                }
                if (fallbackTimerRef.current !== null) {
                    window.clearTimeout(fallbackTimerRef.current);
                }

                window.removeEventListener("pointerdown", activateOnInteraction);
                window.removeEventListener("touchstart", activateOnInteraction);
                window.removeEventListener("keydown", activateOnInteraction);
                window.removeEventListener("scroll", activateOnInteraction);
            };
        }

        activationTimerRef.current = window.setTimeout(() => {
            activateIframe();
        }, 500);

        return () => {
            if (activationTimerRef.current !== null) {
                window.clearTimeout(activationTimerRef.current);
            }
        };
    }, [activateIframe]);

    useEffect(() => {
        if (!showIframe) return;

        const flushPointerUpdate = (now: number) => {
            animationFrameRef.current = null;

            if (document.visibilityState !== "visible") return;

            const pendingPointer = pendingPointerRef.current;
            const lastPostedPointer = lastPostedPointerRef.current;
            if (!pendingPointer) return;

            if (lastPostedPointer) {
                const hasMeaningfulMovement =
                    Math.abs(lastPostedPointer.x - pendingPointer.x) >= 0.5 ||
                    Math.abs(lastPostedPointer.y - pendingPointer.y) >= 0.5;

                if (!hasMeaningfulMovement) return;
            }

            const frameBudget = frameBudgetRef.current;
            if (now - lastPostedAtRef.current < frameBudget) {
                animationFrameRef.current = window.requestAnimationFrame(flushPointerUpdate);
                return;
            }

            if (iframeRef.current && iframeRef.current.contentWindow) {
                iframeRef.current.contentWindow.postMessage({
                    type: 'mousemove',
                    clientX: pendingPointer.x,
                    clientY: pendingPointer.y,
                }, '*');

                lastPostedPointerRef.current = pendingPointer;
                lastPostedAtRef.current = now;
            }
        };

        const schedulePointerSync = () => {
            if (animationFrameRef.current !== null) return;
            animationFrameRef.current = window.requestAnimationFrame(flushPointerUpdate);
        };

        const handleGlobalPointerMove = (event: PointerEvent) => {
            if (!iframeRef.current?.contentWindow) return;
            pendingPointerRef.current = { x: event.clientX, y: event.clientY };
            schedulePointerSync();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible" && pendingPointerRef.current) {
                schedulePointerSync();
            }
        };

        window.addEventListener('pointermove', handleGlobalPointerMove, { passive: true });
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (animationFrameRef.current !== null) {
                window.cancelAnimationFrame(animationFrameRef.current);
            }
            lastPostedAtRef.current = 0;
            window.removeEventListener('pointermove', handleGlobalPointerMove);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [showIframe]);

    return (
        <div className={cn("relative w-full min-h-screen min-h-[100dvh] bg-[#050505]", className)}>
            {/* Fundo gradiente fixo - Smooth luminosity */}
            <div
                className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(20,20,30,0.4)_0%,_transparent_70%)] pointer-events-none"
            />

            {/* Iframe - fixed cover, pointer-events-none */}
            {showIframe && (
                <iframe
                    ref={iframeRef}
                    srcDoc={neonTubesHtml}
                    className="fixed inset-0 w-full h-full border-0 opacity-0 animate-fade-in pointer-events-none mix-blend-screen"
                    style={{
                        animationDelay: '0.3s',
                        animationFillMode: 'forwards'
                    }}
                    title="Neon Tubes Background"
                    loading="lazy"
                />
            )}

            {/* Conteúdo - z-10 para ficar acima do fundo */}
            <div className="relative z-10 w-full min-h-screen min-h-[100dvh] pointer-events-auto">
                {/* Cada filho com pointer-events-auto pode capturar cliques */}
                {children}
            </div>
        </div>
    );
}

export const TubesBackground = memo(TubesBackgroundComponent);
export const NeonFlowBackground = TubesBackground;
export default TubesBackground;

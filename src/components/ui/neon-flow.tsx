"use client";

import React, { useRef, useState, useEffect, memo } from 'react';
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
    const pendingPointerRef = useRef<{ x: number; y: number } | null>(null);
    const lastPostedPointerRef = useRef<{ x: number; y: number } | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const frameBudgetRef = useRef(1000 / 36);
    const lastPostedAtRef = useRef(0);

    useEffect(() => {
        // Carrega iframe depois de 500ms
        const timer = setTimeout(() => {
            setShowIframe(true);
        }, 500);

        const navigatorProfile = navigator as Navigator & { deviceMemory?: number };
        const deviceMemory = typeof navigatorProfile.deviceMemory === "number" ? navigatorProfile.deviceMemory : 8;
        const hardwareConcurrency = navigatorProfile.hardwareConcurrency ?? 8;
        const isLowPowerDevice = hardwareConcurrency <= 4 || deviceMemory <= 4;
        frameBudgetRef.current = 1000 / (isLowPowerDevice ? 24 : 36);

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
            clearTimeout(timer);
            if (animationFrameRef.current !== null) {
                window.cancelAnimationFrame(animationFrameRef.current);
            }
            lastPostedAtRef.current = 0;
            window.removeEventListener('pointermove', handleGlobalPointerMove);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

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

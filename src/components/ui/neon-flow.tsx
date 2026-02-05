"use client";

import React, { useRef, useState, useEffect, memo } from 'react';
import { cn } from "@/lib/utils";

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
    const mouseRef = useRef({ x: 0, y: 0 });

    // Função para randomizar cores
    const randomizeColors = () => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'randomize'
            }, '*');
        }
    };

    useEffect(() => {
        // Carrega iframe depois de 500ms
        const timer = setTimeout(() => {
            setShowIframe(true);
        }, 500);

        // Handler do movimento do mouse - envia para o iframe
        const handleGlobalMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };

            // Envia para o iframe
            if (iframeRef.current && iframeRef.current.contentWindow) {
                iframeRef.current.contentWindow.postMessage({
                    type: 'mousemove',
                    clientX: e.clientX,
                    clientY: e.clientY,
                    pageX: e.pageX,
                    pageY: e.pageY,
                    screenX: e.screenX,
                    screenY: e.screenY,
                    movementX: e.movementX,
                    movementY: e.movementY
                }, '*');
            }
        };

        window.addEventListener('mousemove', handleGlobalMouseMove);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('mousemove', handleGlobalMouseMove);
        };
    }, []);

    return (
        <div className={cn("relative w-full min-h-screen min-h-[100dvh] bg-black", className)}>
            {/* Fundo gradiente fixo - removido a pedido para evitar escurecimento excessivo */}
            {/* <div
                className="fixed inset-0 bg-gradient-to-br from-violet-950/40 via-black to-pink-950/30 pointer-events-none"
            /> */}

            {/* Iframe - fixed cover, pointer-events-none */}
            {showIframe && (
                <iframe
                    ref={iframeRef}
                    src="/neon-tubes.html"
                    className="fixed inset-0 w-full h-full border-0 opacity-0 animate-fade-in pointer-events-none"
                    style={{
                        animationDelay: '0.3s',
                        animationFillMode: 'forwards'
                    }}
                    title="Neon Tubes Background"
                    loading="lazy"
                />
            )}

            {/* Conteúdo - z-10 para ficar acima do fundo */}
            <div className="relative z-10 w-full min-h-screen min-h-[100dvh] pointer-events-none">
                {/* Cada filho com pointer-events-auto pode capturar cliques */}
                {children}
            </div>
        </div>
    );
}

export const TubesBackground = memo(TubesBackgroundComponent);
export const NeonFlowBackground = TubesBackground;
export default TubesBackground;
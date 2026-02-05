"use client";

import { useEffect, useRef } from "react";

interface AudioWaveProps {
    className?: string;
    color?: string;
    speed?: number;
    points?: number;
    opacity?: number;
}

export function AudioWaveBackground({
    className = "",
    color = "139, 92, 246", // Violet default
    speed = 0.002,
    points = 5,
    opacity = 1
}: AudioWaveProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = 0;
        let height = 0;
        let time = 0;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener("resize", resize);
        resize();

        const drawWave = (offset: number, amplitude: number, frequency: number, opacity: number) => {
            if (!ctx) return;

            ctx.beginPath();
            ctx.moveTo(0, height / 2);

            for (let i = 0; i < width; i++) {
                const x = i;
                const y = Math.sin(x * frequency + time + offset) * amplitude * Math.sin(x / width * Math.PI) + height / 2;
                ctx.lineTo(x, y);
            }

            ctx.strokeStyle = `rgba(${color}, ${opacity})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        };

        const animate = () => {
            if (!ctx) return;

            ctx.clearRect(0, 0, width, height);

            // Multiple waves for organic look
            drawWave(0, 50, 0.01, 0.3);
            drawWave(2, 70, 0.008, 0.2);
            drawWave(4, 30, 0.015, 0.1);

            // Central "Voice" line
            drawWave(1, 100 + Math.sin(time * 5) * 20, 0.005, 0.5);

            time += speed * 20;
            requestAnimationFrame(animate);
        };

        const animationId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationId);
        };
    }, [color, speed, points]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
        />
    );
}

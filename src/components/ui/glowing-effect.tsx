"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface GlowingEffectProps {
    blur?: number;
    inactiveZone?: number;
    proximity?: number;
    spread?: number;
    variant?: "default" | "white";
    glow?: boolean;
    className?: string;
    disabled?: boolean;
    movementDuration?: number;
    borderWidth?: number;
}

export const GlowingEffect = memo(
    ({
        blur = 0,
        inactiveZone = 0.7,
        proximity = 0,
        spread = 20,
        variant = "default",
        glow = false,
        className,
        movementDuration = 2,
        borderWidth = 1,
        disabled = false,
    }: GlowingEffectProps) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const lastPosition = useRef({ x: 0, y: 0 });
        const animationFrameRef = useRef<number>(0);

        const handleMove = useCallback(
            (e?: MouseEvent | { x: number; y: number }) => {
                if (!containerRef.current) return;

                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }

                animationFrameRef.current = requestAnimationFrame(() => {
                    const element = containerRef.current;
                    if (!element) return;

                    const { left, top, width, height } = element.getBoundingClientRect();
                    const mouseX = e?.x ?? lastPosition.current.x;
                    const mouseY = e?.y ?? lastPosition.current.y;

                    if (e) {
                        lastPosition.current = { x: mouseX, y: mouseY };
                    }

                    const center = [left + width * 0.5, top + height * 0.5];
                    const distanceFromCenter = Math.hypot(
                        mouseX - center[0],
                        mouseY - center[1]
                    );
                    const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

                    if (distanceFromCenter < inactiveRadius) {
                        element.style.setProperty("--active", "0");
                        return;
                    }

                    const isActive =
                        mouseX > left - proximity &&
                        mouseX < left + width + proximity &&
                        mouseY > top - proximity &&
                        mouseY < top + height + proximity;

                    element.style.setProperty("--active", isActive ? "1" : "0");

                    if (!isActive) return;

                    const currentAngle =
                        parseFloat(element.style.getPropertyValue("--start")) || 0;
                    let targetAngle =
                        (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) /
                        Math.PI +
                        90;

                    if (targetAngle < 0) targetAngle += 360;

                    const delta = targetAngle - currentAngle;
                    let newAngle = currentAngle + delta;

                    if (Math.abs(delta) > 180) {
                        if (delta > 0) {
                            newAngle -= 360;
                        } else {
                            newAngle += 360;
                        }
                    }

                    element.style.setProperty("--start", String(newAngle));
                });
            },
            [inactiveZone, proximity, spread]
        );

        useEffect(() => {
            if (disabled) return;

            const handleResize = () => handleMove();
            const handleScroll = () => handleMove();

            window.addEventListener("resize", handleResize);
            window.addEventListener("scroll", handleScroll);

            return () => {
                window.removeEventListener("resize", handleResize);
                window.removeEventListener("scroll", handleScroll);
            };
        }, [handleMove, disabled]);

        useEffect(() => {
            if (disabled) return;

            const onMouseMove = (e: MouseEvent) => handleMove(e);

            document.body.addEventListener("mousemove", onMouseMove);

            return () => {
                document.body.removeEventListener("mousemove", onMouseMove);
            };
        }, [handleMove, disabled]);

        return (
            <div
                ref={containerRef}
                style={
                    {
                        "--blur": blur,
                        "--spread": spread,
                        "--start": "0",
                        "--active": "0",
                        "--glowing-effect-border-width": `${borderWidth}px`,
                        "--glowing-effect-movement-duration": `${movementDuration}s`,
                    } as React.CSSProperties
                }
                className={cn(
                    "pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity",
                    glow && "opacity-100",
                    blur > 0 && "blur-[var(--blur)] ",
                    className
                )}
            >
                <div
                    className={cn(
                        "glow",
                        "rounded-[inherit]",
                        'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowing-effect-border-width))] after:border-[length:var(--glowing-effect-border-width)] after:border-transparent after:origin-center after:[background-attachment:fixed] after:[background:conic-gradient(from_calc(var(--start)-var(--spread)*1deg),transparent_0,var(--glow-color)_var(--spread),transparent_var(--spread))] after:[mask:linear-gradient(black,black)_content-box,linear-gradient(black,black)] after:[mask-composite:exclude,-add] after:[animation:var(--glowing-effect-movement-duration)_rotate_linear_infinite]',
                        "before:content-[''] before:rounded-[inherit] before:absolute before:inset-[calc(-1*var(--glowing-effect-border-width))] before:border-[length:var(--glowing-effect-border-width)] before:border-transparent before:origin-center before:[background-attachment:fixed] before:[background:conic-gradient(from_calc(var(--start)-var(--spread)*1deg),transparent_0,var(--glow-color)_var(--spread),transparent_var(--spread))] before:[mask:linear-gradient(black,black)_content-box,linear-gradient(black,black)] before:[mask-composite:exclude,-add] before:[animation:var(--glowing-effect-movement-duration)_rotate_linear_infinite]",
                        variant === "white" ? "[--glow-color:white]" : "[--glow-color:hsl(var(--primary))]"
                    )}
                />
            </div>
        );
    }
);

GlowingEffect.displayName = "GlowingEffect";

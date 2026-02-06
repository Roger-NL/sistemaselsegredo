"use client";

import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef, ReactNode } from "react";

// =====================================================
// PARALLAX SECTION - Movimento mais lento que o scroll
// =====================================================
interface ParallaxProps {
    children: ReactNode;
    speed?: number; // 0.5 = metade da velocidade, 2 = dobro
    className?: string;
}

export function ParallaxSection({ children, speed = 0.5, className = "" }: ParallaxProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100]);

    return (
        <div ref={ref} className={`relative ${className}`}>
            <motion.div style={{ y }}>
                {children}
            </motion.div>
        </div>
    );
}

// =====================================================
// SCALE ON SCROLL - Elemento escala ao entrar na tela
// =====================================================
interface ScaleOnScrollProps {
    children: ReactNode;
    className?: string;
    scaleFrom?: number;
    scaleTo?: number;
}

export function ScaleOnScroll({
    children,
    className = "",
    scaleFrom = 0.8,
    scaleTo = 1
}: ScaleOnScrollProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "center center"]
    });

    const scale = useTransform(scrollYProgress, [0, 1], [scaleFrom, scaleTo]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [0.3, 1]);

    return (
        <motion.div ref={ref} style={{ scale, opacity }} className={className}>
            {children}
        </motion.div>
    );
}

// =====================================================
// FADE SLIDE - Fade + Slide baseado em scroll
// =====================================================
interface FadeSlideProps {
    children: ReactNode;
    className?: string;
    direction?: "left" | "right" | "up" | "down";
    distance?: number;
}

export function FadeSlideOnScroll({
    children,
    className = "",
    direction = "up",
    distance = 50
}: FadeSlideProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "center center"]
    });

    const directionMap = {
        left: { x: [-distance, 0], y: [0, 0] },
        right: { x: [distance, 0], y: [0, 0] },
        up: { x: [0, 0], y: [distance, 0] },
        down: { x: [0, 0], y: [-distance, 0] }
    };

    const x = useTransform(scrollYProgress, [0, 1], directionMap[direction].x);
    const y = useTransform(scrollYProgress, [0, 1], directionMap[direction].y);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

    return (
        <motion.div ref={ref} style={{ x, y, opacity }} className={className}>
            {children}
        </motion.div>
    );
}

// =====================================================
// SPREAD ITEMS - Items se espalham e depois convergem
// =====================================================
interface SpreadItemProps {
    children: ReactNode;
    index: number;
    totalItems: number;
    className?: string;
    scrollProgress: MotionValue<number>;
}

export function SpreadItem({
    children,
    index,
    totalItems,
    className = "",
    scrollProgress
}: SpreadItemProps) {
    const centerIndex = Math.floor(totalItems / 2);
    const distanceFromCenter = index - centerIndex;

    const x = useTransform(scrollProgress, [0, 0.5], [distanceFromCenter * 60, 0]);
    const scale = useTransform(scrollProgress, [0, 0.5], [0.85, 1]);
    const opacity = useTransform(scrollProgress, [0, 0.3], [0.5, 1]);
    const y = useTransform(scrollProgress, [0, 0.5], [Math.abs(distanceFromCenter) * 30, 0]);

    return (
        <motion.div
            style={{ x, scale, opacity, y }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// =====================================================
// SPREAD CONTAINER - Wrapper para SpreadItems
// =====================================================
interface SpreadContainerProps {
    children: (scrollProgress: MotionValue<number>) => ReactNode;
    className?: string;
}

export function SpreadContainer({ children, className = "" }: SpreadContainerProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "center center"]
    });

    return (
        <div ref={ref} className={className}>
            {children(scrollYProgress)}
        </div>
    );
}

// =====================================================
// ROTATE ON SCROLL - Rotação sutil no scroll
// =====================================================
interface RotateOnScrollProps {
    children: ReactNode;
    className?: string;
    rotateFrom?: number;
    rotateTo?: number;
}

export function RotateOnScroll({
    children,
    className = "",
    rotateFrom = -5,
    rotateTo = 0
}: RotateOnScrollProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const rotate = useTransform(scrollYProgress, [0, 0.5], [rotateFrom, rotateTo]);
    const opacity = useTransform(scrollYProgress, [0, 0.3], [0.6, 1]);

    return (
        <motion.div ref={ref} style={{ rotate, opacity }} className={className}>
            {children}
        </motion.div>
    );
}

// =====================================================
// TEXT REVEAL - Texto revelado caractere por caractere
// =====================================================
interface TextRevealProps {
    text: string;
    className?: string;
    charClassName?: string;
}

export function TextRevealOnScroll({ text, className = "", charClassName = "" }: TextRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "center center"]
    });

    const characters = text.split("");
    const centerIndex = Math.floor(characters.length / 2);

    return (
        <div ref={ref} className={className}>
            {characters.map((char, index) => (
                <TextRevealChar
                    key={index}
                    char={char}
                    index={index}
                    centerIndex={centerIndex}
                    scrollProgress={scrollYProgress}
                    className={charClassName}
                />
            ))}
        </div>
    );
}

interface TextRevealCharProps {
    char: string;
    index: number;
    centerIndex: number;
    scrollProgress: MotionValue<number>;
    className?: string;
}

function TextRevealChar({ char, index, centerIndex, scrollProgress, className }: TextRevealCharProps) {
    const isSpace = char === " ";
    const distanceFromCenter = index - centerIndex;

    const x = useTransform(scrollProgress, [0, 0.6], [distanceFromCenter * 30, 0]);
    const opacity = useTransform(scrollProgress, [0, 0.4], [0.3, 1]);

    return (
        <motion.span
            className={`inline-block ${isSpace ? "w-2" : ""} ${className}`}
            style={{ x, opacity }}
        >
            {char}
        </motion.span>
    );
}

// =====================================================
// STAGGER CONTAINER - Animação staggered no scroll
// =====================================================
interface StaggerContainerProps {
    children: ReactNode;
    className?: string;
    staggerDelay?: number;
}

export function StaggerOnScroll({ children, className = "", staggerDelay = 0.1 }: StaggerContainerProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "center center"]
    });

    const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

    return (
        <motion.div
            ref={ref}
            style={{ opacity }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

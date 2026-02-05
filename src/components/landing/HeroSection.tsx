"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Play, Terminal, Cpu, Shield, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { AudioWaveBackground } from "../ui/AudioWaveBackground";

// --- DECODING TEXT COMPONENT ---
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%&";

function DecodingText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
    const [displayText, setDisplayText] = useState("");
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        let iteration = 0;
        let timer: NodeJS.Timeout;

        const startDecoding = () => {
            timer = setInterval(() => {
                setDisplayText(prev =>
                    text
                        .split("")
                        .map((char, index) => {
                            if (index < iteration) return text[index];
                            return CHARS[Math.floor(Math.random() * CHARS.length)];
                        })
                        .join("")
                );

                if (iteration >= text.length) {
                    setIsComplete(true);
                    clearInterval(timer);
                }

                iteration += 1 / 3; // Slower reveal for dramatic effect
            }, 30);
        };

        const initialDelay = setTimeout(startDecoding, delay * 1000);

        return () => {
            clearInterval(timer);
            clearTimeout(initialDelay);
        };
    }, [text, delay]);

    return (
        <span className={`${className} ${isComplete ? "" : "font-mono"}`}>
            {displayText}
        </span>
    );
}

// --- MAGNETIC BUTTON COMPONENT ---
function MagneticButton({ children, onClick, variant = "primary" }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "secondary" }) {
    const ref = useRef<HTMLButtonElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;

        x.set(distanceX * 0.2);
        y.set(distanceY * 0.2);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            ref={ref}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: springX, y: springY }}
            className={`
                relative px-8 py-4 rounded-xl font-mono text-sm tracking-widest uppercase overflow-hidden group
                ${variant === "primary"
                    ? "bg-white text-black hover:text-white"
                    : "border border-white/20 text-white hover:border-white/50"
                }
            `}
        >
            {/* Liquid Background for Primary */}
            {variant === "primary" && (
                <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0" />
            )}

            {/* Content */}
            <span className="relative z-10 flex items-center gap-3">
                {children}
            </span>
        </motion.button>
    );
}

// --- ROTATING WORDS COMPONENT ---
function RotatingWords({ words, interval = 3000 }: { words: string[]; interval?: number }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, interval);
        return () => clearInterval(timer);
    }, [words, interval]);

    return (
        <DecodingText
            key={words[index]}
            text={words[index]}
            delay={0} // No initial delay for subsequent words
        />
    );
}

export function HeroSection() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const containerRef = useRef<HTMLDivElement>(null);

    // Parallax Effects
    const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    const handleCta = () => {
        router.push(isAuthenticated ? "/dashboard" : "/login");
    };

    return (
        <section ref={containerRef} className="relative h-screen flex items-center justify-center overflow-hidden">
            {/* LAYER 1: AUDIO WAVE BACKGROUND */}
            <AudioWaveBackground color="139, 92, 246" speed={0.001} opacity={0.4} />

            {/* LAYER 2: NOISE TEXTURE OVERLAY */}
            <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

            {/* LAYER 3: VIGNETTE */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/50 to-black pointer-events-none" />

            <motion.div
                style={{ y, opacity }}
                className="container mx-auto px-4 relative z-10 flex flex-col items-center justify-center text-center"
            >
                {/* SYSTEM STATUS BADGE */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-2 px-3 py-1 rounded-sm border border-violet-500/30 bg-violet-500/10 mb-8 backdrop-blur-md"
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-violet-300 tracking-[0.2em] uppercase">
                        Neural Interface v2.0 Online
                    </span>
                </motion.div>

                {/* DECODING HEADLINE */}
                {/* DECODING HEADLINE */}
                <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold font-serif text-white tracking-tighter mb-12 leading-none flex flex-col items-center gap-2">
                    <div className="overflow-hidden p-2">
                        <DecodingText text="DECODE" className="block text-violet-500" delay={0.2} />
                    </div>
                    <div className="overflow-hidden h-[1.3em] w-full flex justify-center items-center">
                        <RotatingWords words={["YOUR FLUENCY", "YOUR FUTURE", "YOUR MIND", "THE SYSTEM"]} />
                    </div>
                </h1>

                {/* SUBHEADLINE */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="max-w-2xl text-white/50 text-base md:text-lg font-mono leading-relaxed mb-16"
                >
                    Hackeie o sistema tradicional. Instale o protocolo de fala real.
                    <br />
                    Sem livros. Sem gramática. <span className="text-white">Apenas download de dados.</span>
                </motion.p>

                {/* CTAS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8 }}
                    className="flex flex-col md:flex-row gap-6"
                >
                    <MagneticButton onClick={handleCta} variant="primary">
                        {isAuthenticated ? "ACCESS MAINFRAME" : "INICIAR MISSÃO"}
                        <Zap className="w-5 h-5 text-violet-500 group-hover:text-white transition-colors" />
                    </MagneticButton>
                </motion.div>


            </motion.div>
        </section>
    );
}

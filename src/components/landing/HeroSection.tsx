"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap, Headphones, Brain, Mic, CheckCircle2, LucideIcon, ShieldCheck, Video, MessageSquare, Target, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLandingTheme } from "@/context/LandingThemeContext";
import { useEffect, useState, useRef } from "react";

// --- ROTATING WORDS ---
const ROTATING_WORDS = ["FLUÊNCIA", "CARREIRA", "LIBERDADE", "CONFIANÇA"];

function RotatingWord() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
        }, 2500);
        return () => clearInterval(timer);
    }, []);

    return (
        <AnimatePresence mode="wait">
            <motion.span
                key={ROTATING_WORDS[index]}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-violet-400"
            >
                {ROTATING_WORDS[index]}
            </motion.span>
        </AnimatePresence>
    );
}

// --- ANIMATED COUNTER ---
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const duration = 1500;
        const steps = 30;
        const increment = value / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [value]);

    return <span>{count}{suffix}</span>;
}

// --- COMPACT STAT ---
function CompactStat({ value, label, color, delay, isDark }: { value: string; label: string; color: string; delay: number; isDark: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.4 }}
            className="text-center"
        >
            <div className="text-3xl md:text-4xl font-bold font-mono" style={{ color }}>{value}</div>
            <div className={`text-[10px] md:text-xs uppercase tracking-wider ${isDark ? "text-white/50" : "text-gray-500"}`}>{label}</div>
        </motion.div>
    );
}

// --- FEATURE CHIP ---
function FeatureChip({ Icon, text, color, delay, isDark }: { Icon: LucideIcon; text: string; color: string; delay: number; isDark: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.4 }}
            whileHover={{ scale: 1.05, x: 5 }}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg backdrop-blur-sm ${isDark
                ? "bg-white/5 border-white/10"
                : "bg-white border-gray-200 shadow-sm"
                }`}
        >
            <Icon className="w-4 h-4" style={{ color }} />
            <span className={`text-xs md:text-sm font-medium ${isDark ? "text-white/80" : "text-gray-700"}`}>{text}</span>
        </motion.div>
    );
}

// --- MAGNETIC BUTTON ---
function MagneticButton({ children, onClick, variant = "primary", size = "normal", isDark }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary";
    size?: "normal" | "large";
    isDark?: boolean;
}) {
    const ref = useRef<HTMLButtonElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - rect.left - rect.width / 2) * 0.2);
        y.set((e.clientY - rect.top - rect.height / 2) * 0.2);
    };

    return (
        <motion.button
            ref={ref}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            style={{ x: springX, y: springY }}
            className={`
                relative rounded-xl font-mono tracking-widest uppercase overflow-hidden group
                ${size === "large" ? "px-10 py-5 text-base" : "px-6 py-3 text-sm"}
                ${variant === "primary"
                    ? isDark
                        ? "bg-white text-black hover:text-white"
                        : "bg-gray-900 text-white hover:bg-black"
                    : isDark
                        ? "border border-white/30 text-white hover:border-white/60"
                        : "border border-gray-300 text-gray-900 hover:border-gray-900"
                }
            `}
        >
            {variant === "primary" && (
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-green-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0" />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
        </motion.button>
    );
}

export function HeroSection() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const containerRef = useRef<HTMLDivElement>(null);

    // Theme - with safe fallback
    let isDark = true;
    let isLight = false;
    try {
        const theme = useLandingTheme();
        isDark = theme.isDark;
        isLight = theme.isLight;
    } catch {
        // Default to dark if outside provider
    }

    const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    const handleCta = () => router.push(isAuthenticated ? "/dashboard" : "/login");

    return (
        <section ref={containerRef} className={`relative min-h-screen flex items-center overflow-hidden transition-colors duration-500
            ${isLight ? "bg-gradient-to-b from-gray-50 to-white" : ""}
        `}>
            {/* FUNDO - Condicional */}
            {isDark && <div className="absolute inset-0 bg-black" />}

            {/* Grid sutil */}
            <div className={`absolute inset-0 bg-[size:50px_50px] ${isDark
                ? "bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]"
                : "bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)]"
                }`} />

            {/* Gradient sutil no topo */}
            <div className={`absolute inset-0 ${isDark
                ? "bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.08)_0%,transparent_50%)]"
                : "bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15)_0%,transparent_50%)]"
                }`} />

            <motion.div
                style={{ y, opacity }}
                className="container mx-auto px-4 relative z-10 py-20"
            >
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* COLUNA ESQUERDA - Texto e CTA */}
                    <div>
                        {/* Eyebrow */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 ${isDark ? "border-violet-500/30 bg-violet-500/10" : "border-violet-500/40 bg-violet-500/20"
                                }`}
                        >
                            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                            <span className={`text-xs md:text-sm font-medium ${isDark ? "text-violet-300" : "text-violet-600"}`}>
                                Cansou de escolas com fotos de pessoas sorrindo?
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className={`text-4xl md:text-6xl lg:text-7xl font-bold font-serif leading-[1.1] mb-4 ${isDark ? "text-white" : "text-gray-900"
                                }`}
                        >
                            DESBLOQUEIE
                            <br />
                            <span className={isDark ? "text-white/90" : "text-gray-800"}>SUA </span>
                            <RotatingWord />
                        </motion.h1>

                        {/* Subtítulo curto */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className={`text-base md:text-lg mb-6 max-w-md ${isDark ? "text-white/60" : "text-gray-600"}`}
                        >
                            <span className={isDark ? "text-white" : "text-gray-900 font-semibold"}>Ouve e fala desde o dia 1.</span> Professor real corrige você.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-wrap gap-3 mb-8"
                        >
                            <MagneticButton onClick={handleCta} variant="primary" size="large" isDark={isDark}>
                                {isAuthenticated ? "ACESSAR" : "QUERO COMEÇAR"}
                                <Zap className="w-5 h-5" />
                            </MagneticButton>
                            <MagneticButton onClick={() => document.getElementById('method')?.scrollIntoView({ behavior: 'smooth' })} variant="secondary" isDark={isDark}>
                                VER MÉTODO
                                <ArrowRight className="w-4 h-4" />
                            </MagneticButton>
                        </motion.div>

                        {/* Stats Row */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="flex gap-8"
                        >
                            <CompactStat value="9" label="Pilares" color="#8b5cf6" delay={0.9} isDark={isDark} />
                            <CompactStat value="3" label="Aulas Ao Vivo" color="#06b6d4" delay={1.0} isDark={isDark} />
                            <CompactStat value="1.5k+" label="Alunos" color="#10b981" delay={1.1} isDark={isDark} />
                        </motion.div>
                    </div>

                    {/* COLUNA DIREITA - Features Visuais */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="relative"
                    >
                        {/* Card Principal - O Diferencial */}
                        <div className={`rounded-2xl p-6 backdrop-blur-sm mb-4 border ${isDark
                            ? "bg-black/80 border-white/10"
                            : "bg-white border-gray-200 shadow-lg"
                            }`}>
                            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                                <ShieldCheck className="w-5 h-5 text-violet-500" />
                                O Diferencial: Validação Humana
                            </h3>
                            <p className={`text-sm mb-4 ${isDark ? "text-white/70" : "text-gray-600"}`}>
                                Seu avanço é <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>travado</span> até um professor aprovar você.
                                Nada de clicar &quot;próximo&quot; automático.
                            </p>

                            {/* Progress Visual */}
                            <div className="flex items-center gap-2 mb-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                                    <motion.div
                                        key={n}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.8 + n * 0.1 }}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border"
                                        style={{
                                            borderColor: n <= 3 ? '#8b5cf6' : n <= 6 ? '#06b6d4' : '#10b981',
                                            backgroundColor: n <= 3 ? 'rgba(139,92,246,0.2)' : n <= 6 ? 'rgba(6,182,212,0.2)' : 'rgba(16,185,129,0.2)',
                                            color: n <= 3 ? '#8b5cf6' : n <= 6 ? '#06b6d4' : '#10b981'
                                        }}
                                    >
                                        {n}
                                    </motion.div>
                                ))}
                            </div>
                            <div className={`flex text-[10px] uppercase tracking-wider ${isDark ? "text-white/40" : "text-gray-400"}`}>
                                <span className="flex-1 text-violet-400">Preparação</span>
                                <span className="flex-1 text-center text-cyan-400">Estrutura</span>
                                <span className="flex-1 text-right text-green-400">Autonomia</span>
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <FeatureChip Icon={Video} text="3 Mentorias Ao Vivo" color="#06b6d4" delay={1.2} isDark={isDark} />
                            <FeatureChip Icon={ShieldCheck} text="Correção Real" color="#8b5cf6" delay={1.3} isDark={isDark} />
                            <FeatureChip Icon={Headphones} text="100% Áudio" color="#ec4899" delay={1.4} isDark={isDark} />
                            <FeatureChip Icon={Mic} text="Foco na Fala" color="#10b981" delay={1.5} isDark={isDark} />
                            <FeatureChip Icon={MessageSquare} text="Suporte Direto" color="#f59e0b" delay={1.6} isDark={isDark} />
                            <FeatureChip Icon={Target} text="Especializações" color="#ef4444" delay={1.7} isDark={isDark} />
                        </div>

                        {/* Animated Ping */}
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-green-500"
                        />
                    </motion.div>
                </div>
            </motion.div>
        </section >
    );
}

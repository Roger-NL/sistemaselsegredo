"use client";

import { motion } from "framer-motion";
import { Rocket, Brain, Ear, Shield } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import GradientButton from "@/components/ui/GradientButton";

const metodoPilares = [
    {
        icon: Brain,
        label: "Mindset",
        colorClass: "text-violet-400",
        glowColor: "rgba(139,92,246,0.25)",
    },
    {
        icon: Ear,
        label: "Listening",
        colorClass: "text-emerald-400",
        glowColor: "rgba(16,185,129,0.25)",
    },
    {
        icon: Shield,
        label: "Sobrevivência",
        colorClass: "text-fuchsia-400",
        glowColor: "rgba(217,70,239,0.25)",
    },
];

export function HeroSection({ isAuthenticated }: { isAuthenticated: boolean }) {
    const router = useRouter();

    const handleCta = () => {
        router.push(isAuthenticated ? "/dashboard" : "/cadastro");
    };

    return (
        <section className="relative overflow-hidden px-5 pt-20 pb-8 md:px-8 md:pt-28 md:pb-16 min-h-[100dvh] flex flex-col justify-between">
            <div className="absolute inset-0 z-0 pointer-events-none bg-black/10" />

            {/* ── Background hero image — semi-transparent, full bleed, no visible edges ── */}
            <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
                <Image
                    src="/assets/hero-chill.png"
                    alt=""
                    fill
                    priority
                    className="object-cover opacity-[0.35] scale-[1.15]"
                    aria-hidden="true"
                />
                {/* Gradient overlays to fade edges seamlessly into dark bg */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/90 via-transparent to-[#050505]/90 z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-[#050505]/80 z-10" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#050505_75%)] z-10" />
            </div>

            <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-12 lg:gap-16">

                {/* ── Text + CTA ── */}
                <div className="relative flex flex-col items-center text-center">
                    {/* Ambient glow */}
                    <div className="pointer-events-none absolute -left-10 top-10 h-[160px] w-[160px] rounded-full bg-violet-500/12 blur-[90px]" />

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="max-w-[480px] [font-family:var(--font-inter)] text-[clamp(2.4rem,8vw,3.6rem)] font-bold leading-[1.08] tracking-[-0.03em] text-white"
                    >
                        Desbloqueie seu inglês com o{" "}
                        <span
                            style={{
                                background: "linear-gradient(to right, #6ee7b7, #34d399, #2dd4bf)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            based método.
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.08 }}
                        viewport={{ once: true }}
                        className="mt-5 max-w-[320px] [font-family:var(--font-geist-sans)] text-[1.05rem] leading-[1.55] text-white/45 md:text-[1.08rem] lg:max-w-[360px]"
                    >
                        Correção humana. Sem videoaula. Resultados em 120 dias.
                    </motion.p>

                    {/* CTA Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.16 }}
                        viewport={{ once: true }}
                        className="mt-10 w-full max-w-[280px] lg:max-w-[340px]"
                    >
                        <div className="relative">
                            <div className="pointer-events-none absolute -inset-x-3 -inset-y-3 rounded-[40px] bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.32),rgba(16,185,129,0.12),transparent_72%)] blur-xl" />
                            <GradientButton
                                onClick={handleCta}
                                className="group px-5"
                                width="100%"
                                height="58px"
                            >
                                <span className="relative z-10 flex w-full items-center gap-3 px-1.5 text-left">
                                    <span className="flex items-center gap-3">
                                        <span className="rounded-full border border-violet-400/20 bg-violet-500/10 p-2">
                                            <Rocket className="h-4 w-4 rotate-45 text-violet-300 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                        </span>
                                        <span className="[font-family:var(--font-geist-sans)] text-sm font-semibold uppercase tracking-[0.1em] text-white">
                                            começar grátis
                                        </span>
                                    </span>
                                </span>
                            </GradientButton>
                            <p className="mt-3 text-center [font-family:var(--font-geist-sans)] text-xs font-medium text-white/55">
                                Estude agora, pague só quando avançar.
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* ── System illustration (non-interactive) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.12 }}
                    viewport={{ once: true }}
                    className="relative w-full max-w-[400px]"
                >
                    <div className="pointer-events-none absolute -right-6 top-4 h-[180px] w-[180px] rounded-full bg-gradient-to-tr from-violet-500/8 via-fuchsia-500/6 to-transparent blur-[80px]" />

                    {/* System flow illustration */}
                    <div className="relative rounded-[22px] border border-white/6 bg-white/[0.02] p-5 backdrop-blur-sm md:p-6 mx-auto lg:mx-0 max-w-[360px] lg:max-w-none">
                        {/* Header */}
                        <div className="mb-5 flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
                            <span className="[font-family:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.26em] text-white/30">
                                como funciona o sistema
                            </span>
                        </div>

                        {/* 3 Pillar Illustrations — purely visual */}
                        <div className="space-y-3">
                            {metodoPilares.map((pilar, i) => {
                                const Icon = pilar.icon;
                                return (
                                    <div
                                        key={pilar.label}
                                        className="flex items-center gap-4"
                                    >
                                        {/* Step number */}
                                        <span className="[font-family:var(--font-geist-mono)] text-[11px] text-white/15 tabular-nums w-5">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>

                                        {/* Icon */}
                                        <div
                                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-white/[0.04]"
                                            style={{ boxShadow: `0 0 20px ${pilar.glowColor}` }}
                                        >
                                            <Icon className={`h-4 w-4 ${pilar.colorClass}`} />
                                        </div>

                                        {/* Label */}
                                        <span className="[font-family:var(--font-geist-sans)] text-[0.92rem] text-white/60">
                                            {pilar.label}
                                        </span>

                                        {/* Connecting line */}
                                        <div className="flex-1 border-b border-dashed border-white/6" />

                                        {/* Status dot */}
                                        <div className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-emerald-400/70" : "bg-white/12"}`} />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Flow label */}
                        <div className="mt-5 flex items-center justify-center gap-2">
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
                            <span className="[font-family:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.3em] text-white/18">
                                progressão linear
                            </span>
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

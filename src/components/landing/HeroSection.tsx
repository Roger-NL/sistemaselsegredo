"use client";

import { motion, useAnimation, useInView } from "framer-motion";
import { ArrowRight, Unlock, PlayCircle, ShieldCheck, Check, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";

// System Diagnostic Component - "The Surprising Object"
const SystemDiagnostic = () => {
    const phrases = [
        "Vergonha da pronúncia?",
        "Travado na hora de falar?",
        "Entende mas não responde?",
        "Medo de errar em público?"
    ];

    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [reverse, setReverse] = useState(false);
    const [blink, setBlink] = useState(true);

    useEffect(() => {
        const timeout2 = setInterval(() => {
            setBlink((prev) => !prev);
        }, 500);
        return () => clearInterval(timeout2);
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (subIndex === phrases[index].length + 1 && !reverse) {
                setTimeout(() => setReverse(true), 2000);
                return;
            }

            if (subIndex === 0 && reverse) {
                setReverse(false);
                setIndex((prev) => (prev + 1) % phrases.length);
                return;
            }

            setSubIndex((prev) => prev + (reverse ? -1 : 1));
        }, Math.max(reverse ? 30 : 60, parseInt((Math.random() * 50).toString())));

        return () => clearTimeout(timeout);
    }, [subIndex, index, reverse, phrases]);

    return (
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-black/40 border border-white/10 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] mb-8">
            <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-500 tracking-wider uppercase">
                    SYSTEM_CHECK:
                </span>
            </div>
            <p className="text-sm md:text-base text-gray-300 font-mono min-w-[200px] md:min-w-[240px]">
                {phrases[index].substring(0, subIndex)}
                <span className={`${blink ? "opacity-100" : "opacity-0"} ml-0.5 text-emerald-500`}>_</span>
            </p>
        </div>
    );
};

export function HeroSection() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    const handleCta = () => {
        router.push(isAuthenticated ? "/dashboard" : "/cadastro");
    };

    return (
        <section className="relative flex flex-col items-center justify-center overflow-hidden min-h-[min(100vh,800px)] py-12 md:py-20 px-4 md:px-8">
            {/* Background elements managed by parent */}
            <div className="absolute inset-0 z-0 backdrop-blur-[3px] pointer-events-none" />

            <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">

                {/* Left Column: Text & CTA */}
                {/* Left Column: Text & CTA */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left pointer-events-auto order-1 relative">

                    {/* Smoky Glow Effect - Behind Headline */}
                    <div className="absolute top-10 left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 w-[300px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none z-[-1]" />

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 border border-white/10 w-fit backdrop-blur-md mb-8 md:mb-12 mx-auto md:mx-0"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500"></span>
                        </span>
                        <span className="text-[10px] md:text-xs font-mono text-fuchsia-200 tracking-widest uppercase font-bold">
                            Sistema fechado com validação real
                        </span>
                    </motion.div>

                    {/* Headline - Clean & Impactful (Refined for Desktop) */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="flex flex-col text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-serif font-bold text-white leading-[1.1] tracking-tight mb-8 md:mb-10"
                    >
                        <span className="text-white/90">Entenda e fale</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-emerald-200">
                            inglês em até
                        </span>
                        <span className="text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]">120 dias.</span>
                    </motion.h1>

                    {/* Neural Diagnostic Pill */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="w-full flex justify-center md:justify-start mb-2 md:mb-4"
                    >
                        <SystemDiagnostic />
                    </motion.div>

                    {/* Main CTA - Kept exactly as requested */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        viewport={{ once: true }}
                        className="flex flex-col items-center md:items-start gap-4 w-full sm:w-auto"
                    >
                        {/* Exclusivity Micro-copy */}
                        <p className="text-[10px] md:text-xs font-mono font-bold text-white/50 uppercase tracking-widest pl-1">
                            Sistema fechado com validação real.
                        </p>

                        <a
                            href={isAuthenticated ? "/dashboard" : "/cadastro"}
                            className="group relative inline-flex items-center justify-center w-full sm:w-auto px-6 py-4 md:px-8 bg-white border border-emerald-400 text-black font-mono font-bold tracking-widest uppercase hover:bg-emerald-50 transition-all duration-300 transform active:scale-95 overflow-hidden text-center shadow-[0_0_20px_rgba(52,211,153,0.6)] hover:shadow-[0_0_40px_rgba(52,211,153,0.9)] no-underline cursor-pointer rounded-sm"
                        >
                            {/* Technical Corner Brackets (Emerald for High Contrast) */}
                            <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-500 transition-all duration-300 group-hover:w-full group-hover:h-full"></span>
                            <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-500 transition-all duration-300 group-hover:w-full group-hover:h-full"></span>

                            <span className="relative z-10 flex flex-row items-center justify-center gap-3 text-[10px] sm:text-xs md:text-sm leading-tight text-center drop-shadow-sm">
                                {/* Plane Icon - "Taking Off" */}
                                <Rocket className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 flex-shrink-0 rotate-45 text-emerald-600" />
                                <span className="font-black whitespace-normal max-w-[260px] sm:max-w-none">ACESSAR COCKPIT (ACESSO GRATUITO AO PILAR 1)</span>
                            </span>
                        </a>

                        {/* Conversion Boosters */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] md:text-xs font-mono font-bold text-white/40 uppercase tracking-widest pl-1">
                            <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Sem cartão de crédito</span>
                            <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-cyan-400" /> Acesso imediato</span>
                            <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-violet-400" /> Mentoria Inclusa</span>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Visual (Subtle & Supporting) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative flex justify-center items-center order-2 mt-8 md:mt-0"
                >
                    {/* Compact Glow - Multi-color Neon */}
                    <div className="absolute w-[250px] h-[250px] bg-gradient-to-tr from-violet-500/10 via-fuchsia-500/10 to-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />

                    {/* Compact Card Container - Darker, Subtle Blur */}
                    <div className="relative z-10 w-full max-w-[380px] bg-black/80 border border-white/5 backdrop-blur-[4px] rounded-2xl p-4 md:p-5 shadow-2xl transform md:rotate-1 hover:rotate-0 transition-all duration-500">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4 md:mb-6 pb-4 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500/50 animate-pulse" />
                                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Ao Vivo</span>
                            </div>
                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Plano de Voo</span>
                        </div>

                        {/* Active Pillar - Dark Theme, Low Contrast */}
                        <div className="relative mb-3 bg-white/[0.03] rounded-lg p-4 border border-white/10 hover:bg-white/[0.05] transition-colors">
                            <div className="absolute -top-2 -right-2 bg-black text-white/50 text-[9px] font-bold px-2 py-0.5 rounded overflow-hidden uppercase tracking-widest border border-white/5">
                                Atual
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-white/90 font-serif font-bold text-base md:text-lg">Pilar 01</h4>
                                <Unlock className="w-4 h-4 text-white/50" />
                            </div>
                            <p className="text-white/50 text-[10px] md:text-xs font-mono leading-tight">
                                Mindset & Inteligência. <br />
                                <span className="text-[10px] opacity-60 font-medium mt-1 block text-violet-400">STATUS: EM ANDAMENTO</span>
                            </p>
                        </div>

                        {/* Locked Pillar 2 */}
                        <div className="mb-2 bg-white/[0.02] rounded-lg p-3 border border-white/5 opacity-40 flex items-center justify-between">
                            <div>
                                <h4 className="text-white font-serif text-sm">Pilar 02</h4>
                                <p className="text-white/30 text-[10px] font-mono">Imersão Auditiva</p>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
                                <span className="text-white/20 text-[10px]">🔒</span>
                            </div>
                        </div>

                        {/* Locked Pillar 3 */}
                        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5 opacity-30 flex items-center justify-between">
                            <div>
                                <h4 className="text-white font-serif text-sm">Pilar 03</h4>
                                <p className="text-white/30 text-[10px] font-mono">Sobrevivência</p>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
                                <span className="text-white/20 text-[10px]">🔒</span>
                            </div>
                        </div>

                        {/* Validation Note */}
                        <div className="mt-6 text-center border-t border-white/5 pt-4">
                            <p className="text-white/20 text-[10px] font-mono uppercase tracking-widest">
                                *Validação obrigatória p/ avançar
                            </p>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
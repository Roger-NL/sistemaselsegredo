"use client";

import { motion, useAnimation, useInView } from "framer-motion";
import { ArrowRight, Unlock, PlayCircle, ShieldCheck, Check, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";

// Typer Effect Component
const TypewriterText = () => {
    const phrases = [
        "Você trava quando precisa falar?",
        "Já estudou anos e não conversa?",
        "Entende mas não responde?",
        "Tem vergonha da pronúncia?",
        "Aqui você não avança sem aprender."
    ];

    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [reverse, setReverse] = useState(false);

    // Blinking cursor
    const [blink, setBlink] = useState(true);

    useEffect(() => {
        const timeout2 = setInterval(() => {
            setBlink((prev) => !prev);
        }, 500);
        return () => clearInterval(timeout2);
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            // Logic to type/delete
            if (subIndex === phrases[index].length + 1 && !reverse) {
                // Wait before deleting
                setTimeout(() => setReverse(true), 2000); // 2s pause at end of phrase
                return;
            }

            if (subIndex === 0 && reverse) {
                setReverse(false);
                setIndex((prev) => (prev + 1) % phrases.length); // Loop back to start
                return;
            }

            setSubIndex((prev) => prev + (reverse ? -1 : 1));
        }, Math.max(reverse ? 30 : 80, parseInt((Math.random() * 50).toString()))); // Random typing speed

        return () => clearTimeout(timeout);
    }, [subIndex, index, reverse, phrases]);

    return (
        <div className="h-20 md:h-24 flex items-center">
            <p className="text-white text-base md:text-xl font-mono font-bold leading-relaxed">
                {phrases[index].substring(0, subIndex)}
                <span className={`${blink ? "opacity-100" : "opacity-0"} ml-1 text-emerald-400`}>|</span>
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
        <section className="relative flex flex-col items-center justify-center overflow-hidden pt-24 pb-8 px-4 md:px-8">
            {/* Background elements managed by parent */}
            <div className="absolute inset-0 z-0 backdrop-blur-[3px] pointer-events-none" />

            <div className="container mx-auto max-w-7xl grid md:grid-cols-2 gap-8 md:gap-16 items-center relative z-10">

                {/* Left Column: Text & CTA */}
                <div className="flex flex-col gap-2 text-left pointer-events-auto order-1">

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 border border-white/10 w-fit backdrop-blur-md"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500"></span>
                        </span>
                        <span className="text-[10px] md:text-xs font-mono text-fuchsia-200 tracking-widest uppercase font-bold">
                            Sistema de Validação Ativo
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-[1.1]"
                    >
                        Fale inglês com <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-300 to-emerald-300 animate-pulse-slow font-black">
                            confiança.
                        </span> <br />
                        De verdade.
                    </motion.h1>

                    {/* Subheadline + Typewriter */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <h2 className="text-lg md:text-xl text-white font-bold mb-1 text-white/90">
                            Um sistema onde você <strong className="font-black text-emerald-300">só avança se provar que aprendeu</strong>.
                        </h2>

                        <div className="border-l-4 border-fuchsia-500/50 pl-4 md:pl-6 min-h-[60px]">
                            <TypewriterText />
                        </div>
                    </motion.div>

                    {/* Main CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        viewport={{ once: true }}
                        className="flex flex-col gap-4 mt-2 w-full sm:w-auto"
                    >
                        {/* Exclusivity Micro-copy */}
                        <p className="text-[10px] md:text-xs font-mono font-bold text-white/50 uppercase tracking-widest pl-1">
                            Sistema fechado com validação humana.
                        </p>

                        <a
                            href={isAuthenticated ? "/dashboard" : "/cadastro"}
                            className="group relative px-8 py-4 bg-white text-black font-mono font-black tracking-wider uppercase hover:bg-emerald-50 transition-all transform active:scale-95 rounded-sm overflow-hidden text-center w-full sm:w-auto shadow-[0_0_30px_rgba(255,255,255,0.1)] border border-transparent hover:border-emerald-200 inline-block no-underline cursor-pointer"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3 text-sm md:text-base whitespace-nowrap">
                                <Rocket className="w-5 h-5 text-fuchsia-600 group-hover:text-fuchsia-500 transition-colors" />
                                ATIVAR MEU ACESSO IMEDIATO
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
                    className="relative flex justify-center items-center order-2 mt-12 md:mt-0"
                >
                    {/* Compact Glow - Multi-color Neon */}
                    <div className="absolute w-[250px] h-[250px] bg-gradient-to-tr from-violet-500/10 via-fuchsia-500/10 to-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />

                    {/* Compact Card Container - Darker, Subtle Blur */}
                    <div className="relative z-10 w-full max-w-[420px] bg-black/80 border border-white/5 backdrop-blur-[4px] rounded-2xl p-6 shadow-2xl transform md:rotate-1 hover:rotate-0 transition-all duration-500">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
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
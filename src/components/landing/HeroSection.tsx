"use client";

import { motion } from "framer-motion";
import { ArrowRight, Unlock, PlayCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function HeroSection() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    const handleCta = () => {
        router.push(isAuthenticated ? "/dashboard" : "/register");
    };

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 pb-12 px-4 md:px-8">
            {/* O fundo é transparente para deixar o TubesBackground aparecer */}
            
            <div className="container mx-auto max-w-7xl grid md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">

                {/* Coluna Esquerda: Texto e CTA */}
                <div className="flex flex-col gap-5 md:gap-6 text-left pointer-events-auto order-1">
                    
                    {/* Badge de Status - Mobile Compacto */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 border border-white/10 w-fit backdrop-blur-md"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EEF4D4] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EEF4D4]"></span>
                        </span>
                        <span className="text-[10px] md:text-xs font-mono text-[#EEF4D4] tracking-widest uppercase font-bold">
                            Inscrições Abertas • Freemium
                        </span>
                    </motion.div>

                    {/* Título Principal */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white leading-[1.1]"
                    >
                        Protocolo de <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-white to-violet-200">
                            Fluência Tática
                        </span>
                    </motion.h1>

                    {/* Subtítulo */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="relative pl-4 md:pl-6 border-l-2 border-[#EEF4D4]/30"
                    >
                        <p className="text-white/80 text-base md:text-xl font-light leading-relaxed">
                            Não compre agora. Acesse o <strong className="text-[#EEF4D4]">Pilar 1 (Mindset)</strong> gratuitamente e prove a eficácia do método.
                        </p>
                    </motion.div>

                    {/* Botões de Ação - Full Width no Mobile */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        viewport={{ once: true }}
                        className="flex flex-col sm:flex-row gap-4 mt-2 md:mt-4 w-full sm:w-auto"
                    >
                        <button
                            onClick={handleCta}
                            className="group relative px-6 py-4 bg-[#EEF4D4] text-black font-mono font-bold tracking-widest uppercase hover:bg-white transition-all transform active:scale-95 rounded-sm overflow-hidden text-center w-full sm:w-auto shadow-[0_0_20px_rgba(238,244,212,0.2)]"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isAuthenticated ? "ACESSAR Q.G." : "LIBERAR PILAR 1 GRÁTIS"}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                    </motion.div>

                    {/* Ícones de Confiança - Mobile Friendly */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        viewport={{ once: true }}
                        className="flex flex-wrap items-center gap-4 md:gap-6 mt-2 md:mt-6 text-white/40 text-[10px] md:text-xs font-mono uppercase tracking-widest"
                    >
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3 md:w-4 md:h-4" />
                            <span>Sem Cartão</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <PlayCircle className="w-3 h-3 md:w-4 md:h-4" />
                            <span>Acesso Imediato</span>
                        </div>
                    </motion.div>
                </div>

                {/* Coluna Direita: O "Visual" - Agora visível e otimizado para mobile */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative block mt-8 md:mt-0 order-2"
                >
                    {/* Glow adaptativo */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-violet-500/20 blur-[60px] md:blur-[100px] rounded-full pointer-events-none" />

                    {/* Card Principal - Escala no mobile */}
                    <div className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-xl p-5 md:p-8 rounded-2xl shadow-2xl transform md:rotate-3 hover:rotate-0 transition-transform duration-500 mx-auto max-w-sm md:max-w-none">
                        <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                            <span className="text-[10px] md:text-xs font-mono text-white/40 uppercase tracking-widest">Plano de Curso</span>
                            <span className="text-[10px] md:text-xs font-mono text-[#EEF4D4] uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Online
                            </span>
                        </div>

                        {/* Item 1: Liberado (Destaque) */}
                        <div className="mb-3 p-3 md:p-4 rounded-xl bg-[#EEF4D4]/10 border border-[#EEF4D4]/20 flex items-center justify-between group cursor-pointer shadow-[0_0_15px_rgba(238,244,212,0.1)]">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#EEF4D4] text-black flex items-center justify-center shadow-lg">
                                    <Unlock className="w-4 h-4 md:w-5 md:h-5" />
                                </div>
                                <div>
                                    <h3 className="text-white font-serif text-base md:text-lg leading-tight">Pilar 01</h3>
                                    <p className="text-[#EEF4D4]/70 text-[10px] md:text-xs font-mono">Mindset & Inteligência</p>
                                </div>
                            </div>
                            <div className="px-2 py-1 rounded bg-[#EEF4D4] text-black text-[9px] md:text-[10px] font-bold uppercase tracking-widest animate-pulse">
                                Grátis
                            </div>
                        </div>

                        {/* Item 2: Bloqueado (Opaco) */}
                        <div className="mb-3 p-3 md:p-4 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between opacity-50">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 text-white/20 flex items-center justify-center">
                                    <PlayCircle className="w-4 h-4 md:w-5 md:h-5" />
                                </div>
                                <div>
                                    <h3 className="text-white font-serif text-base md:text-lg leading-tight">Pilar 02</h3>
                                    <p className="text-white/30 text-[10px] md:text-xs font-mono">Imersão Auditiva</p>
                                </div>
                            </div>
                            <Unlock className="w-3 h-3 md:w-4 md:h-4 text-white/20" />
                        </div>

                        {/* Item 3: Bloqueado (Opaco) */}
                        <div className="p-3 md:p-4 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between opacity-50">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 text-white/20 flex items-center justify-center">
                                    <PlayCircle className="w-4 h-4 md:w-5 md:h-5" />
                                </div>
                                <div>
                                    <h3 className="text-white font-serif text-base md:text-lg leading-tight">Pilar 03</h3>
                                    <p className="text-white/30 text-[10px] md:text-xs font-mono">Sobrevivência</p>
                                </div>
                            </div>
                            <Unlock className="w-3 h-3 md:w-4 md:h-4 text-white/20" />
                        </div>

                        {/* Aviso */}
                        <div className="mt-6 md:mt-8 text-center">
                            <p className="text-white/40 text-[10px] md:text-xs font-mono">
                                Desbloqueie o restante após provar o método.
                            </p>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Unlock, Zap, Ear, Mic, Brain, Globe, Briefcase, Plane, ShoppingBag, Heart, Clapperboard, BarChart3, Target, ArrowRight } from "lucide-react";

export function FeaturesSection() {
    const pillars = [
        {
            title: "Pilar 1: Mindset & Inteligência",
            icon: Brain,
            desc: "Desprogramação escolar e técnicas de aprendizado acelerado.",
            status: "unlocked"
        },
        {
            title: "Pilar 2: Imersão Auditiva",
            icon: Ear,
            desc: "Como decodificar nativos falando rápido (Connected Speech).",
            status: "locked"
        },
        {
            title: "Pilar 3: Sobrevivência",
            icon: Globe,
            desc: "Inglês de rua. Vocabulário essencial para não passar fome.",
            status: "locked"
        },
        {
            title: "Pilar 4: Fundamentos",
            icon: Shield,
            desc: "Gramática tática. A lógica sem a chatice das regras.",
            status: "locked"
        },
        {
            title: "Pilar 5: Números & Negócios",
            icon: BarChart3,
            desc: "Dinheiro, horários e negociação básica.",
            status: "locked"
        },
        {
            title: "Pilar 6: Produção Oral",
            icon: Mic,
            desc: "Técnicas de Shadowing para destravar a fala.",
            status: "locked"
        },
        {
            title: "Pilar 7: Autonomia",
            icon: Zap,
            desc: "Aprenda a aprender sozinho para sempre.",
            status: "locked"
        },
        {
            title: "Pilar 8: Especializações",
            icon: Target,
            desc: "Briefing das carreiras e focos específicos.",
            status: "locked"
        },
        {
            title: "Pilar 9: O Mundo Real",
            icon: Plane,
            desc: "Simulações finais e preparação para o campo.",
            status: "locked"
        },
    ];

    const specs = [
        { title: "Cultura Pop", icon: Clapperboard },
        { title: "Saúde", icon: Heart },
        { title: "Compras", icon: ShoppingBag },
        { title: "Business", icon: BarChart3 },
        { title: "Viagens", icon: Globe },
        { title: "Carreira", icon: Briefcase },
    ];

    return (
        <section className="py-24 px-4 border-t border-white/5 relative z-20 overflow-hidden bg-black">
            <div className="absolute inset-0 bg-gradient-to-b from-black via-green-950/5 to-black pointer-events-none" />

            <div className="container mx-auto max-w-7xl relative z-10">
                {/* Header */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block mb-4"
                    >
                        <span className="px-3 py-1 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 font-mono text-xs tracking-widest uppercase">
                            MAPA DA OPERAÇÃO
                        </span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-serif text-white mb-6"
                    >
                        9 Pilares de Combate
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-white/40 font-mono text-sm md:text-base max-w-2xl mx-auto"
                    >
                        Comece pelo Pilar 1 gratuitamente. Desbloqueie o restante apenas se achar que o método funciona para você.
                    </motion.p>
                </div>

                {/* Grid de Pilares */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
                    {pillars.map((pillar, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`group p-8 rounded-xl border transition-all duration-300 relative overflow-hidden
                                ${pillar.status === 'unlocked'
                                    ? "bg-green-500/10 border-green-500/30 hover:bg-green-500/20 hover:border-green-500/50"
                                    : "bg-white/[0.02] border-white/5 hover:border-white/10 opacity-75 hover:opacity-100"
                                }
                            `}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-12 h-12 rounded flex items-center justify-center border 
                                    ${pillar.status === 'unlocked'
                                        ? "bg-green-500/20 border-green-500/30 text-green-400"
                                        : "bg-white/5 border-white/10 text-white/20"
                                    }`}>
                                    <pillar.icon className="w-6 h-6" />
                                </div>

                                {pillar.status === 'unlocked' ? (
                                    <div className="flex items-center gap-1 text-xs font-mono text-green-400 uppercase tracking-widest bg-green-900/20 px-2 py-1 rounded">
                                        <Unlock className="w-3 h-3" /> Liberado
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-xs font-mono text-white/20 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                                        <Lock className="w-3 h-3" /> Premium
                                    </div>
                                )}
                            </div>

                            <h3 className={`text-xl font-bold mb-2 font-serif ${pillar.status === 'unlocked' ? "text-white" : "text-white/60"}`}>
                                {pillar.title}
                            </h3>
                            <p className={`text-sm leading-relaxed font-mono ${pillar.status === 'unlocked' ? "text-green-100/60" : "text-white/30"}`}>
                                {pillar.desc}
                            </p>

                            {pillar.status === 'unlocked' && (
                                <div className="mt-6">
                                    <button className="text-xs font-bold text-green-400 uppercase tracking-widest hover:text-green-300 flex items-center gap-2">
                                        ACESSAR PILAR 1 <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Especializações */}
                <div className="relative p-8 md:p-12 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="text-left max-w-md">
                            <h3 className="text-2xl font-serif text-white mb-4">Especializações (Pós-Graduação)</h3>
                            <p className="text-white/50 text-sm font-mono mb-8">
                                Apenas para alunos que concluem os 9 pilares. Treinamento focado em objetivos específicos.
                            </p>
                            <ul className="grid grid-cols-2 gap-4">
                                {specs.map((spec, i) => (
                                    <li key={i} className="flex items-center gap-2 text-white/70 text-xs font-mono uppercase tracking-wide">
                                        <spec.icon className="w-4 h-4 text-purple-400" />
                                        {spec.title}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-purple-500 blur-3xl opacity-20" />
                            <Briefcase className="w-32 h-32 text-white/10 relative z-10" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
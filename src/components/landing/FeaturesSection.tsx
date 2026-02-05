"use client";

import { motion } from "framer-motion";
import { Shield, Plane, TrendingUp, Cpu, Globe, Key, Lock, Briefcase, Star, ShoppingBag, Heart, Clapperboard, BarChart3, Target } from "lucide-react";

export function FeaturesSection() {
    const pillars = [
        { title: "Fundamentos", icon: Shield, desc: "A base sólida para não cometer erros." },
        { title: "Acúmulo Turbo", icon: TrendingUp, desc: "Multiplique suas milhas x10." },
        { title: "Emissões", icon: Plane, desc: "Ache passagens com desconto massivo." },
        { title: "Hospedagem", icon: Key, desc: "Fique nos melhores hotéis de graça." },
        { title: "Cartões Black", icon: Lock, desc: "Acesse salas VIP e benefícios exclusivos." },
        { title: "Renda Extra", icon: Briefcase, desc: "Transforme pontos em dinheiro no bolso." },
    ];

    const specs = [
        { title: "Cultura Pop", icon: Clapperboard },
        { title: "Saúde", icon: Heart },
        { title: "Compras", icon: ShoppingBag },
        { title: "Business", icon: BarChart3 },
        { title: "Viagens", icon: Globe },
        { title: "Carreira", icon: Target },
    ];

    return (
        <section className="py-24 px-4 border-t border-white/5 relative z-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/10 to-black pointer-events-none" />

            <div className="container mx-auto max-w-7xl relative z-10">
                {/* Header */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block mb-4"
                    >
                        <span className="px-3 py-1 rounded-full border border-[#EEF4D4]/20 bg-[#EEF4D4]/5 text-[#EEF4D4] font-mono text-xs tracking-widest uppercase">
                            CURRICULUM VITAE
                        </span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-serif text-white mb-6"
                    >
                        O Plano de Voo Completo
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-white/40 font-mono text-sm md:text-base max-w-2xl mx-auto"
                    >
                        Uma jornada estruturada em 9 pilares essenciais + especializações táticas para você dominar cada aspecto do universo das milhas e viagens.
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
                            className="group p-8 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-violet-500/30 transition-all duration-300"
                        >
                            <div className="w-12 h-12 rounded bg-violet-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-violet-500/20 group-hover:border-violet-500/50">
                                <pillar.icon className="w-6 h-6 text-violet-300" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 font-serif">{pillar.title}</h3>
                            <p className="text-white/40 text-sm leading-relaxed font-mono">
                                {pillar.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Especializações */}
                <div className="relative p-8 md:p-12 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="text-left max-w-md">
                            <h3 className="text-2xl font-serif text-white mb-4">Especializações Táticas</h3>
                            <p className="text-white/50 text-sm font-mono mb-8">
                                Após dominar a base, escolha seu caminho. Nossas especializações permitem que você foque no que mais importa para seu estilo de vida.
                            </p>
                            <ul className="grid grid-cols-2 gap-4">
                                {specs.map((spec, i) => (
                                    <li key={i} className="flex items-center gap-2 text-white/70 text-xs font-mono uppercase tracking-wide">
                                        <spec.icon className="w-4 h-4 text-violet-400" />
                                        {spec.title}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-violet-500 blur-3xl opacity-20" />
                            <Star className="w-32 h-32 text-white/10 relative z-10 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

"use client";

import { motion } from "framer-motion";
import { ArrowRight, Shield, Clock, Zap, CheckCircle2, Sparkles, Headphones } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const BENEFITS = [
    "Acesso vitalício a todo o conteúdo",
    "9 Pilares completos + 6 Especializações",
    "Comunidade exclusiva de Operadores",
    "Atualizações semanais de conteúdo",
    "Método científico baseado em neurociência",
    "Focado em conversação real, não decoreba"
];

export function CtaSection() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    const handleCta = () => {
        router.push(isAuthenticated ? "/dashboard" : "/login");
    };

    return (
        <section className="py-32 px-4 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/20 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto max-w-4xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="p-8 md:p-16 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl relative overflow-hidden"
                >
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 text-center">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-8"
                        >
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-300 font-mono text-xs uppercase tracking-widest">
                                Vagas Limitadas
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <h2 className="text-3xl md:text-5xl font-serif text-white mb-6 leading-tight">
                            Pronto Para Destravar<br />Seu Inglês?
                        </h2>

                        <p className="text-white/50 text-base md:text-lg font-mono max-w-2xl mx-auto mb-12">
                            Junte-se a mais de 1.800 brasileiros que já abandonaram o método tradicional e agora falam inglês de verdade.
                        </p>

                        {/* Benefits grid */}
                        <div className="grid md:grid-cols-2 gap-4 text-left mb-12">
                            {BENEFITS.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    <span className="text-white/70 text-sm">{benefit}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA Button */}
                        <motion.button
                            onClick={handleCta}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative px-12 py-6 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-mono font-bold tracking-widest uppercase rounded-xl overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.5)] transition-shadow"
                        >
                            {/* Animated glow */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                            />

                            <span className="relative z-10 flex items-center justify-center gap-3 text-lg">
                                {isAuthenticated ? "ACESSAR O COCKPIT" : "INICIAR PROTOCOLO"}
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                            </span>
                        </motion.button>

                        {/* Trust elements */}
                        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-white/30 text-xs font-mono">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                <span>7 DIAS DE GARANTIA</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>ACESSO IMEDIATO</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Headphones className="w-4 h-4" />
                                <span>SUPORTE DEDICADO</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* FAQ Teaser */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="text-center mt-16"
                >
                    <p className="text-white/40 text-sm font-mono">
                        Ainda tem dúvidas?{" "}
                        <button className="text-violet-400 hover:text-violet-300 underline underline-offset-4 transition-colors">
                            Veja nossas perguntas frequentes
                        </button>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

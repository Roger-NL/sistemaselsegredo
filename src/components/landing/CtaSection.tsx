"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Shield, Clock, Zap, CheckCircle2, Sparkles, Headphones } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLandingTheme } from "@/context/LandingThemeContext";
import { useRef } from "react";

const BENEFITS = [
    "9 Pilares com Correção Humana",
    "3 Sessões Particulares 1-on-1",
    "Suporte Diário Assíncrono (Torre de Comando)",
    "6 Especializações de Carreira",
    "Acesso Vitalício + Atualizações",
    "Garantia Incondicional de 7 dias"
];

export function CtaSection() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    // Theme - with safe fallback
    let isDark = true;
    try {
        const theme = useLandingTheme();
        isDark = theme.isDark;
    } catch {
        // Default to dark if outside provider
    }

    const handleCta = () => {
        router.push(isAuthenticated ? "/dashboard" : "/login");
    };

    // Scroll animations
    const sectionRef = useRef<HTMLElement>(null);
    const benefitsRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "center center"]
    });

    const { scrollYProgress: benefitsScroll } = useScroll({
        target: benefitsRef,
        offset: ["start end", "center center"]
    });

    // Card parallax and scale
    const cardY = useTransform(scrollYProgress, [0, 0.5], [80, 0]);
    const cardOpacity = useTransform(scrollYProgress, [0, 0.4], [0.3, 1]);
    const cardScale = useTransform(scrollYProgress, [0, 0.5], [0.92, 1]);

    // Background glow animation based on scroll
    const glowScale = useTransform(scrollYProgress, [0, 1], [0.8, 1.2]);
    const glowOpacity = useTransform(scrollYProgress, [0, 0.5], [0.1, 0.3]);

    return (
        <section ref={sectionRef} className={`py-32 px-4 relative overflow-hidden transition-colors duration-500 ${isDark ? "" : "bg-white"
            }`}>
            {/* Background glow - animated with scroll */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    style={{ scale: glowScale, opacity: glowOpacity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500 rounded-full blur-[150px]"
                />
            </div>

            <div className="container mx-auto max-w-4xl relative z-10">
                <motion.div
                    style={{ y: cardY, opacity: cardOpacity, scale: cardScale }}
                    className={`p-8 md:p-16 rounded-3xl border backdrop-blur-xl relative overflow-hidden ${isDark
                        ? "border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02]"
                        : "border-gray-200 bg-white shadow-xl"
                        }`}
                >
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                    <div className="relative z-10 text-center">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-8"
                        >
                            <motion.div
                                animate={{ rotate: [0, 15, -15, 0] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            >
                                <Sparkles className="w-4 h-4 text-amber-400" />
                            </motion.div>
                            <span className="text-amber-300 font-mono text-xs uppercase tracking-widest">
                                Método No-Video · Resultado Validado
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <h2 className={`text-3xl md:text-5xl font-serif mb-6 leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                            Pronto Para Destravar<br />Seu Inglês?
                        </h2>

                        <p className={`text-base md:text-lg font-mono max-w-2xl mx-auto mb-12 ${isDark ? "text-white/50" : "text-gray-600"}`}>
                            Formato Híbrido: Textos de Elite + Escrita Ativa + Correção Humana + 3 Mentorias Ao Vivo. Tudo incluso.
                        </p>

                        {/* Benefits grid - with staggered scroll animation */}
                        <div ref={benefitsRef} className="grid md:grid-cols-2 gap-4 text-left mb-12">
                            {BENEFITS.map((benefit, index) => {
                                const isLeft = index % 2 === 0;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
                                        whileHover={{ x: 5, scale: 1.02 }}
                                        className="flex items-center gap-3"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.08 + 0.1, type: "spring", stiffness: 300 }}
                                        >
                                            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                                        </motion.div>
                                        <span className={`text-sm ${isDark ? "text-white/70" : "text-gray-700"}`}>{benefit}</span>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* CTA Button */}
                        <motion.a
                            href={isAuthenticated ? "/dashboard" : "/login"}
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative px-12 py-6 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-mono font-bold tracking-widest uppercase rounded-xl overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.5)] transition-shadow inline-block text-center cursor-pointer"
                        >
                            {/* Animated glow */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                            />

                            <span className="relative z-10 flex items-center justify-center gap-3 text-lg">
                                {isAuthenticated ? "ACESSAR O COCKPIT" : "🚀 ENTRAR NO COCKPIT"}
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                            </span>
                        </motion.a>

                        {/* Trust elements with scroll reveal */}
                        <div className={`flex flex-wrap items-center justify-center gap-6 mt-10 text-xs font-mono ${isDark ? "text-white/30" : "text-gray-400"}`}>
                            {[
                                { icon: Shield, text: "7 DIAS DE GARANTIA" },
                                { icon: Clock, text: "ACESSO IMEDIATO" },
                                { icon: Headphones, text: "SUPORTE DEDICADO" }
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    className="flex items-center gap-2"
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.text}</span>
                                </motion.div>
                            ))}
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
                    <p className={`text-sm font-mono ${isDark ? "text-white/40" : "text-gray-500"}`}>
                        Ainda tem dúvidas?{" "}
                        <button
                            onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
                            className="text-violet-400 hover:text-violet-300 underline underline-offset-4 transition-colors"
                        >
                            Veja nossas perguntas frequentes
                        </button>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

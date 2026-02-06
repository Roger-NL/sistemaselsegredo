"use client";

import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { Star, Quote, Mic, TrendingUp, Award, Headphones, LucideIcon } from "lucide-react";
import { useState, useRef } from "react";
import { useLandingTheme } from "@/context/LandingThemeContext";

const TESTIMONIALS = [
    {
        name: "Marina Oliveira",
        role: "Gerente de Projetos",
        location: "São Paulo, SP",
        image: "https://i.pravatar.cc/150?img=1",
        rank: "Comandante",
        quote: "Estudei 4 anos em franquia famosa e não conseguia conversar. Em 6 meses no ES Academy, fiz minha primeira reunião 100% em inglês com clientes dos EUA. A diferença é brutal.",
        stats: { level: "Pilar 9", months: "6 meses" }
    },
    {
        name: "Carlos Eduardo",
        role: "Desenvolvedor",
        location: "Curitiba, PR",
        image: "https://i.pravatar.cc/150?img=3",
        rank: "Ás",
        quote: "O método do Filtro Afetivo mudou minha vida. Antes eu travava completamente. Hoje faço entrevistas técnicas em inglês sem medo. Consegui um emprego remoto nos EUA.",
        stats: { level: "Especialização", months: "8 meses" }
    },
    {
        name: "Fernanda Costa",
        role: "Médica",
        location: "Rio de Janeiro, RJ",
        image: "https://i.pravatar.cc/150?img=5",
        rank: "Supersônico",
        quote: "Fiz a especialização de Inglês para Saúde. Agora leio papers científicos sem tradutor e participo de congressos internacionais com confiança. O investimento se pagou em 3 meses.",
        stats: { level: "Especialização", months: "10 meses" }
    }
];

const RESULTS = [
    { value: "89%", label: "Alcançam Fluência Funcional", icon: TrendingUp },
    { value: "6 meses", label: "Tempo Médio de Resultado", icon: Mic },
    { value: "4.9/5", label: "Avaliação Média", icon: Star },
    { value: "1.847+", label: "Operadores Ativos", icon: Award },
];

// Animated Stat Card with Spread Effect
function StatCard({
    result,
    index,
    distanceFromCenter,
    scrollProgress,
    isDark
}: {
    result: { value: string; label: string; icon: LucideIcon };
    index: number;
    distanceFromCenter: number;
    scrollProgress: MotionValue<number>;
    isDark: boolean;
}) {
    const x = useTransform(scrollProgress, [0, 0.6], [distanceFromCenter * 50, 0]);
    const y = useTransform(scrollProgress, [0, 0.6], [Math.abs(distanceFromCenter) * 20, 0]);
    const scale = useTransform(scrollProgress, [0, 0.5], [0.85, 1]);
    const opacity = useTransform(scrollProgress, [0, 0.4], [0.4, 1]);

    return (
        <motion.div
            style={{ x, y, scale, opacity }}
            whileHover={{ scale: 1.05, y: -5 }}
            className={`p-6 rounded-2xl border text-center group transition-all ${isDark
                ? "border-white/10 bg-white/[0.02] hover:border-green-500/30"
                : "border-gray-200 bg-white shadow-md hover:border-green-500/30"
                }`}
        >
            <result.icon className="w-8 h-8 text-green-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <div className={`text-2xl md:text-3xl font-bold font-mono mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                {result.value}
            </div>
            <div className={`text-xs font-mono uppercase tracking-widest ${isDark ? "text-white/40" : "text-gray-500"}`}>
                {result.label}
            </div>
        </motion.div>
    );
}

export function ResultsSection() {
    const [activeTestimonial, setActiveTestimonial] = useState(0);

    // Theme - with safe fallback
    let isDark = true;
    try {
        const theme = useLandingTheme();
        isDark = theme.isDark;
    } catch {
        // Default to dark if outside provider
    }

    // Scroll animations
    const statsRef = useRef<HTMLDivElement>(null);
    const testimonialsRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress: statsScroll } = useScroll({
        target: statsRef,
        offset: ["start end", "center center"]
    });

    const { scrollYProgress: testimonialsScroll } = useScroll({
        target: testimonialsRef,
        offset: ["start end", "center center"]
    });

    // Parallax for testimonial card
    const testimonialX = useTransform(testimonialsScroll, [0, 0.5], [60, 0]);
    const testimonialOpacity = useTransform(testimonialsScroll, [0, 0.4], [0.3, 1]);
    const testimonialScale = useTransform(testimonialsScroll, [0, 0.5], [0.95, 1]);

    return (
        <section className={`py-32 px-4 relative overflow-hidden transition-colors duration-500 ${isDark ? "bg-black" : "bg-white"
            }`}>
            {/* Background pattern */}
            <div className={`absolute inset-0 bg-[size:60px_60px] pointer-events-none ${isDark
                ? "bg-[linear-gradient(rgba(238,244,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(238,244,212,0.02)_1px,transparent_1px)]"
                : "bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)]"
                }`} />

            <div className="container mx-auto max-w-6xl relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <span className="inline-block px-4 py-2 rounded-full border border-green-500/20 bg-green-500/5 text-green-500 font-mono text-xs tracking-widest uppercase mb-6">
                        Resultados Reais
                    </span>
                    <h2 className={`text-4xl md:text-6xl font-serif mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
                        Eles Já Estão<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                            Falando de Verdade
                        </span>
                    </h2>
                </motion.div>

                {/* Stats Grid - with Spread Animation */}
                <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
                    {RESULTS.map((result, index) => {
                        const centerIndex = Math.floor(RESULTS.length / 2);
                        const distanceFromCenter = index - centerIndex;

                        return (
                            <StatCard
                                key={index}
                                result={result}
                                index={index}
                                distanceFromCenter={distanceFromCenter}
                                scrollProgress={statsScroll}
                                isDark={isDark}
                            />
                        );
                    })}
                </div>

                {/* Testimonials Carousel - with Slide Animation */}
                <div ref={testimonialsRef} className="relative">
                    <div className="flex flex-col lg:flex-row gap-8 items-center">
                        {/* Main testimonial */}
                        <motion.div
                            key={activeTestimonial}
                            style={{ x: testimonialX, opacity: testimonialOpacity, scale: testimonialScale }}
                            className={`flex-1 p-8 md:p-12 rounded-3xl border relative overflow-hidden ${isDark
                                ? "border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent"
                                : "border-gray-200 bg-white shadow-lg"
                                }`}
                        >
                            <Quote className={`absolute top-8 right-8 w-16 h-16 ${isDark ? "text-white/5" : "text-gray-100"}`} />

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="relative">
                                        <img
                                            src={TESTIMONIALS[activeTestimonial].image}
                                            alt={TESTIMONIALS[activeTestimonial].name}
                                            className="w-16 h-16 rounded-full border-2 border-violet-500"
                                        />
                                        <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-violet-500 text-[10px] font-mono text-white uppercase">
                                            {TESTIMONIALS[activeTestimonial].rank}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{TESTIMONIALS[activeTestimonial].name}</h4>
                                        <p className={`text-sm font-mono ${isDark ? "text-white/40" : "text-gray-500"}`}>{TESTIMONIALS[activeTestimonial].role} • {TESTIMONIALS[activeTestimonial].location}</p>
                                    </div>
                                </div>

                                <p className={`text-xl md:text-2xl font-serif leading-relaxed mb-8 italic ${isDark ? "text-white/90" : "text-gray-800"}`}>
                                    "{TESTIMONIALS[activeTestimonial].quote}"
                                </p>

                                <div className="flex gap-8">
                                    <div>
                                        <div className="text-2xl font-bold text-green-500 font-mono">
                                            {TESTIMONIALS[activeTestimonial].stats.level}
                                        </div>
                                        <div className={`text-xs font-mono uppercase ${isDark ? "text-white/40" : "text-gray-500"}`}>Nível Atual</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-green-500 font-mono">
                                            {TESTIMONIALS[activeTestimonial].stats.months}
                                        </div>
                                        <div className={`text-xs font-mono uppercase ${isDark ? "text-white/40" : "text-gray-500"}`}>Tempo de Estudo</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Testimonial selector with staggered animation */}
                        <div className="flex lg:flex-col gap-4">
                            {TESTIMONIALS.map((testimonial, index) => (
                                <motion.button
                                    key={index}
                                    onClick={() => setActiveTestimonial(index)}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.15 }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`relative p-1 rounded-full transition-all ${activeTestimonial === index
                                        ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-black'
                                        : 'opacity-50 hover:opacity-100'
                                        }`}
                                >
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full"
                                    />
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* 5 stars with staggered reveal */}
                    <div className="flex justify-center gap-1 mt-12">
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                            >
                                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                            </motion.div>
                        ))}
                    </div>
                    <p className={`text-center text-sm font-mono mt-4 ${isDark ? "text-white/40" : "text-gray-500"}`}>
                        Média de 4.9/5 baseado em 847 avaliações
                    </p>
                </div>
            </div>
        </section>
    );
}

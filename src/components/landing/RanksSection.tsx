"use client";

import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { RANKS } from "@/utils/ranks";
import { Quote } from "lucide-react";
import { useLandingTheme } from "@/context/LandingThemeContext";
import { useRef } from "react";
import { Star, ChevronLeft, ChevronRight, Quote as QuoteIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

// Animated Rank Badge with Spread Effect
function RankBadge({
    rank,
    index,
    distanceFromCenter,
    scrollProgress,
    totalRanks
}: {
    rank: string;
    index: number;
    distanceFromCenter: number;
    scrollProgress: MotionValue<number>;
    totalRanks: number;
}) {
    const x = useTransform(scrollProgress, [0, 0.6], [distanceFromCenter * 30, 0]);
    const y = useTransform(scrollProgress, [0, 0.6], [Math.abs(distanceFromCenter) * 15, 0]);
    const scale = useTransform(scrollProgress, [0, 0.5], [0.8, 1]);
    const opacity = useTransform(scrollProgress, [0, 0.4], [0.3, 1]);
    const rotate = useTransform(scrollProgress, [0, 0.5], [distanceFromCenter * 5, 0]);

    return (
        <motion.div
            style={{ x, y, scale, opacity, rotate }}
            whileHover={{ scale: 1.1, rotate: index % 2 === 0 ? 3 : -3 }}
            className={`
                px-6 py-3 rounded-full border bg-opacity-10 backdrop-blur-sm font-mono text-xs uppercase tracking-widest cursor-default
                ${index === totalRanks - 1
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    : index === 0
                        ? "border-white/10 bg-white/5 text-white/40"
                        : "border-violet-500/30 bg-violet-500/5 text-violet-300"
                }
            `}
        >
            {index + 1}. {rank}
        </motion.div>
    );
}

export function RanksSection() {
    // Theme - with safe fallback
    let isDark = true;
    try {
        const theme = useLandingTheme();
        isDark = theme.isDark;
    } catch {
        // Default to dark if outside provider
    }

    // Scroll animations
    const ranksRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress: ranksScroll } = useScroll({
        target: ranksRef,
        offset: ["start end", "center center"]
    });

    return (
        <section className={`py-24 px-4 border-t relative z-20 transition-colors duration-500 ${isDark ? "border-white/5 bg-black" : "border-gray-200 bg-gray-50"
            }`}>
            <div className="container mx-auto max-w-7xl text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <h2 className={`text-3xl md:text-5xl font-serif mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>Sua Carreira de Piloto</h2>
                    <p className={`font-mono text-sm tracking-widest uppercase mb-12 ${isDark ? "text-white/40" : "text-gray-500"}`}>
                        Do check-in ao hall da fama
                    </p>
                </motion.div>

                {/* Ranks with Spread Animation */}
                <div ref={ranksRef} className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto mb-24">
                    {RANKS.map((rank, index) => {
                        const centerIndex = Math.floor(RANKS.length / 2);
                        const distanceFromCenter = index - centerIndex;

                        return (
                            <RankBadge
                                key={index}
                                rank={rank}
                                index={index}
                                distanceFromCenter={distanceFromCenter}
                                scrollProgress={ranksScroll}
                                totalRanks={RANKS.length}
                            />
                        );
                    })}
                </div>

                {/* Google Reviews Carousel */}
                <ReviewsCarousel />
            </div>
        </section>
    );
}

const REVIEWS = [
    {
        name: "Carlos Mendes",
        role: "Tech Lead",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        content: "O método é insano. Eu travava muito em reuniões, agora consigo liderar calls globais. Vale cada centavo.",
        rating: 5,
        date: "2 dias atrás"
    },
    {
        name: "Fernanda Lima",
        role: "UX Designer",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        content: "Realmente diferente de tudo. A validação humana faz você estudar de verdade. Não tem como enganar o sistema.",
        rating: 5,
        date: "1 semana atrás"
    },
    {
        name: "Ricardo Souza",
        role: "Empresário",
        image: "https://randomuser.me/api/portraits/men/85.jpg",
        content: "Eu achava que era mais um curso online, mas a estrutura de gamificação te prende. Completei o Pilar 1 em 4 dias.",
        rating: 5,
        date: "2 semanas atrás"
    },
    {
        name: "Juliana Alves",
        role: "Advogada",
        image: "https://randomuser.me/api/portraits/women/68.jpg",
        content: "O suporte é rápido e as mentorias individuais ajudaram muito na minha pronúncia. Recomendo demais.",
        rating: 5,
        date: "3 semanas atrás"
    },
    {
        name: "Marcos Paulo",
        role: "Desenvolvedor",
        image: "https://randomuser.me/api/portraits/men/22.jpg",
        content: "Plataforma muito bonita e fluida. Tive um pouco de dificuldade no começo com o ritmo, mas depois engrenei. Muito bom.",
        rating: 4,
        date: "1 mês atrás"
    },
    {
        name: "Beatriz Rocha",
        role: "Marketing",
        image: "https://randomuser.me/api/portraits/women/24.jpg",
        content: "Finalmente um curso que não é chato. A sensação de 'subir de patente' vicia. Meu inglês melhorou 100%.",
        rating: 5,
        date: "1 mês atrás"
    }
];


function ReviewsCarousel() {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(0);

    const next = () => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % REVIEWS.length);
    };

    const prev = () => {
        setDirection(-1);
        setCurrent((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
    };

    // Auto-play (optional, keeps it alive)
    useEffect(() => {
        const timer = setInterval(next, 8000);
        return () => clearInterval(timer);
    }, []);

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 50 : -50,
            opacity: 0,
            scale: 0.95
        })
    };

    return (
        <div className="relative max-w-4xl mx-auto mt-20">
            {/* Carousel Container */}
            <div className="relative h-[280px] md:h-[220px] overflow-hidden">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={current}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="absolute inset-0 w-full"
                    >
                        <div className="relative p-6 md:p-8 rounded-2xl bg-[#EEF4D4]/5 border border-[#EEF4D4]/10 backdrop-blur-sm mx-4 md:mx-12 min-h-full flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">

                            <QuoteIcon className="absolute top-4 right-6 w-12 h-12 text-[#EEF4D4]/10 -z-10 rotate-180" />

                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-[2px] bg-gradient-to-tr from-violet-500 to-emerald-500">
                                    <img
                                        src={REVIEWS[current].image}
                                        alt={REVIEWS[current].name}
                                        className="w-full h-full rounded-full object-cover border-2 border-black"
                                    />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                                    <div>
                                        <h4 className="font-bold text-white text-lg">{REVIEWS[current].name}</h4>
                                        <p className="text-white/40 text-xs font-mono uppercase tracking-wider">{REVIEWS[current].role}</p>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-end gap-1 mt-1 md:mt-0">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3 h-3 ${i < REVIEWS[current].rating ? "text-[#F4B400] fill-current" : "text-white/20"}`} />
                                        ))}
                                        <span className="ml-2 text-[10px] text-white/30">{REVIEWS[current].date}</span>
                                    </div>
                                </div>
                                <p className="text-[#EEF4D4]/80 text-sm md:text-base leading-relaxed italic">
                                    "{REVIEWS[current].content}"
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4 mt-6 relative z-10">
                <button
                    onClick={prev}
                    className="p-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={next}
                    className="p-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-1.5 mt-4">
                {REVIEWS.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1 rounded-full transition-all duration-300 ${i === current ? "w-8 bg-emerald-500" : "w-2 bg-white/10"}`}
                    />
                ))}
            </div>
        </div>
    );
}

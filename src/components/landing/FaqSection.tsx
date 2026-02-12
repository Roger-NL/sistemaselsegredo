"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useLandingTheme } from "@/context/LandingThemeContext";

const FAQS = [
    {
        question: "Minha rotina é muito corrida. Vou conseguir acompanhar?",
        answer: "Exatamente por isso este sistema foi criado. Nosso protocolo Flight Manual é baseado em Micro-Doses de Inteligência (15-20 min/dia). Você estuda no trânsito, na fila ou antes de dormir. Um Briefing de leitura + uma Operação escrita. O segredo é a constância, não a duração."
    },
    {
        question: "Já tentei outros cursos e nunca aprendi. Por que este seria diferente?",
        answer: "A maioria dos cursos te coloca no 'Netflix Mode' — assistindo vídeos passivamente. Aqui, o método é Ativo e Híbrido (No-Video). Você lê, escreve, e um professor real corrige antes de você avançar. Retenção passiva: 10%. Retenção ativa (nosso modelo): até 90%. Aqui, é impossível 'fingir' que aprendeu."
    },
    {
        question: "Sem videoaula? Como funciona o dia a dia?",
        answer: "Segue o protocolo Flight Manual: 1) Briefing — Leitura estratégica de texto de alta densidade (3x mais rápido que vídeo). 2) Operação — Você resolve problemas escrevendo, forçando a criação de novas sinapses neurais. 3) Audio Support — Áudios nativos para treinar Listening. 4) Validação Humana — Um Professor Real analisa sua Missão de Campo e dá feedback detalhado."
    },
    {
        question: "As 3 sessões particulares estão inclusas?",
        answer: "Sim. São 3 Mentorias de Elite ao vivo (1-on-1): Diagnóstico (início), Calibragem (meio) e Simulação Final (fim). O foco é destravar a fala e corrigir vícios de pronúncia que a escrita não pega. Tudo incluso no pacote, sem taxas extras."
    },
    {
        question: "Como funciona o suporte se não tem vídeo?",
        answer: "Através da Torre de Comando: 1) Suporte Diário Assíncrono — Canal direto na plataforma para dúvidas de texto e gramática, com resposta humana em até 24h úteis. 2) Mentorias Ao Vivo — As 3 sessões estratégicas para treinar speaking. Não vendemos horas de aula, vendemos resultado validado."
    },
    {
        question: "Preciso ter base de inglês para começar?",
        answer: "Não. O sistema foi desenhado para levar alguém do Zero Absoluto (Recruta) ao nível de Operações Especiais. Começamos pelo pilar de Mindset e Sobrevivência, construindo sua confiança desde o primeiro dia."
    },
    {
        question: "As aulas particulares são em grupo?",
        answer: "De forma alguma. As 3 sessões de Checkpoint são 100% Individuais (1-on-1) com um Professor Internacional. É o seu momento exclusivo para tirar dúvidas, treinar pronúncia e receber feedback personalizado."
    },
    {
        question: "E se eu não me adaptar ao método?",
        answer: "O risco é todo nosso. Garantia Incondicional de 7 Dias. Se por QUALQUER motivo você achar que o curso não é para você, devolvemos 100% do seu dinheiro. Sem perguntas."
    }
];

// FAQ Item Component - handles its own state to ensure clicks work
function FaqItem({ faq, index, isDark }: { faq: { question: string; answer: string }; index: number; isDark: boolean }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className={`border rounded-lg transition-all duration-300
                ${isOpen
                    ? isDark ? "bg-white/[0.03] border-violet-500/30" : "bg-white border-violet-200 shadow-md"
                    : isDark ? "bg-transparent border-white/10 hover:border-white/20" : "bg-white/50 border-gray-200 hover:border-gray-300"
                }
            `}
        >
            {/* Question Button - using div with onClick instead of button */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsOpen(!isOpen); }}
                className="w-full flex items-center justify-between p-4 md:p-6 text-left cursor-pointer select-none"
                style={{ pointerEvents: 'auto' }}
            >
                <span className={`font-serif text-base md:text-xl pr-4 md:pr-8 transition-colors
                    ${isOpen
                        ? isDark ? "text-violet-300" : "text-violet-700"
                        : isDark ? "text-white/80" : "text-gray-800"
                    }
                `}>
                    {faq.question}
                </span>
                <div
                    className={`flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center border transition-all duration-300
                        ${isOpen
                            ? "bg-violet-500 text-white border-violet-500 rotate-180"
                            : isDark ? "border-white/20 text-white/40 hover:border-white/40" : "border-gray-200 text-gray-400 hover:border-gray-400"
                        }
                    `}
                >
                    <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
                </div>
            </div>

            {/* Answer Content - using CSS for animation instead of framer motion */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out
                    ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
                `}
            >
                <div className={`px-4 md:px-6 pb-4 md:pb-6 font-mono text-xs md:text-sm leading-relaxed border-t
                    ${isDark ? "text-white/50 border-white/5" : "text-gray-600 border-gray-100"}
                `}>
                    <div className="pt-4">
                        {faq.answer}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function FaqSection() {
    // Theme logic - safe fallback
    let isDark = true;
    try {
        const theme = useLandingTheme();
        isDark = theme.isDark;
    } catch (e) {
        // Fallback to dark
    }

    return (
        <section className={`py-16 md:py-24 px-4 border-t relative z-20 transition-colors duration-500
            ${isDark ? "bg-black border-white/5" : "bg-gray-50 border-gray-200"}
        `}>
            <div className="container mx-auto max-w-4xl">

                {/* Header */}
                <div className="text-center mb-10 md:mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-4
                            ${isDark ? "bg-violet-500/10 border-violet-500/20" : "bg-violet-100 border-violet-200"}
                        `}
                    >
                        <HelpCircle className={`w-3 h-3 ${isDark ? "text-violet-400" : "text-violet-600"}`} />
                        <span className={`text-xs font-mono tracking-widest uppercase ${isDark ? "text-violet-300" : "text-violet-700"}`}>
                            Central de Inteligência
                        </span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className={`text-2xl md:text-5xl font-serif mb-4 md:mb-6 ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                        Perguntas Frequentes
                    </motion.h2>
                    <p className={`font-mono text-xs md:text-sm max-w-xl mx-auto ${isDark ? "text-white/40" : "text-gray-500"}`}>
                        Elimine todas as dúvidas antes de iniciar sua missão.
                    </p>
                </div>

                {/* FAQ List - each item manages its own state */}
                <div className="space-y-3 md:space-y-4">
                    {FAQS.map((faq, index) => (
                        <FaqItem key={index} faq={faq} index={index} isDark={isDark} />
                    ))}
                </div>
            </div>
        </section>
    );
}

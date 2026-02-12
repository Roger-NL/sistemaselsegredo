"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, HelpCircle, ClipboardCheck, Route, PenTool, UserCheck, BarChart3 } from "lucide-react";
import { useLandingTheme } from "@/context/LandingThemeContext";

const HOW_IT_WORKS = [
    { step: "01", title: "Diagnóstico", desc: "Pilar 1 grátis para testar o método", icon: ClipboardCheck, color: "#8b5cf6" },
    { step: "02", title: "Plano Personalizado", desc: "Rota adaptada ao seu nível", icon: Route, color: "#06b6d4" },
    { step: "03", title: "Treino Diário", desc: "15-20 min: ler + escrever + áudios", icon: PenTool, color: "#10b981" },
    { step: "04", title: "Correção Humana", desc: "Professor valida cada missão", icon: UserCheck, color: "#f59e0b" },
    { step: "05", title: "Evolução Medida", desc: "Progresso por pilares e ranks", icon: BarChart3, color: "#ec4899" },
];

const FAQS = [
    {
        question: "É curso online gravado?",
        answer: "Não. Sem videoaulas. Conteúdo em texto de alta densidade + exercícios escritos + áudios nativos. Formato ativo: você produz e é corrigido, não fica assistindo passivamente."
    },
    {
        question: "É mentoria ou são aulas ao vivo?",
        answer: "Híbrido. O dia a dia é assíncrono — você estuda no seu ritmo, 15-20 min/dia. Inclui 3 mentorias ao vivo 1-on-1 em momentos estratégicos: Diagnóstico, Calibragem e Simulação Final."
    },
    {
        question: "Quantas vezes por semana preciso estudar?",
        answer: "Ideal: todos os dias, 15-20 min. Mínimo recomendado: 5x/semana. O sistema é flexível — você define seus horários. O segredo é constância, não duração."
    },
    {
        question: "Quanto tempo leva para ter resultado?",
        answer: "Depende da sua constância. Média dos alunos: 6 meses para fluência funcional. Alguns alcançam antes. O sistema mede sua evolução pilar a pilar."
    },
    {
        question: "Sem videoaula? Como funciona o dia a dia?",
        answer: "Protocolo Flight Manual: 1) Briefing — Leitura estratégica. 2) Operação — Escrita neurossensorial. 3) Audio Support — Treino auditivo. 4) Validação Humana — Correção detalhada."
    },
    {
        question: "As 3 sessões particulares estão inclusas?",
        answer: "Sim. 3 mentorias 1-on-1 ao vivo: Diagnóstico, Calibragem e Simulação Final. Foco em fala e pronúncia. Tudo incluso, sem taxas extras."
    },
    {
        question: "Como funciona o suporte?",
        answer: "Torre de Comando: canal assíncrono com resposta humana em até 24h úteis + as 3 mentorias ao vivo para treinar speaking."
    },
    {
        question: "Preciso ter base de inglês?",
        answer: "Não. Do Zero Absoluto (Recruta) ao nível Operações Especiais. Começamos pelo Mindset e Sobrevivência."
    },
    {
        question: "As sessões são em grupo?",
        answer: "Não. As 3 sessões de Checkpoint são 100% individuais (1-on-1) com Professor Internacional."
    },
    {
        question: "Já tentei outros cursos e nunca aprendi.",
        answer: "A maioria usa 'Netflix Mode' — vídeos passivos. Retenção: 10%. Aqui é No-Video: ler + escrever + correção humana. Retenção: até 90%."
    },
    {
        question: "Minha rotina é muito corrida.",
        answer: "15-20 min/dia. No trânsito, na fila ou antes de dormir. Micro-Doses de Inteligência — constância, não duração."
    },
    {
        question: "E se eu não me adaptar?",
        answer: "Garantia Incondicional de 7 Dias. Devolvemos 100% do seu dinheiro. Sem perguntas."
    },
];

// FAQ Item Component - compact version
function FaqItem({ faq, isDark }: { faq: { question: string; answer: string }; isDark: boolean }) {
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
            <div
                onClick={() => setIsOpen(!isOpen)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsOpen(!isOpen); }}
                className="w-full flex items-center justify-between p-3 md:p-4 text-left cursor-pointer select-none"
                style={{ pointerEvents: 'auto' }}
            >
                <span className={`font-serif text-sm md:text-base pr-3 md:pr-6 transition-colors leading-tight
                    ${isOpen
                        ? isDark ? "text-violet-300" : "text-violet-700"
                        : isDark ? "text-white/80" : "text-gray-800"
                    }
                `}>
                    {faq.question}
                </span>
                <div
                    className={`flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center border transition-all duration-300
                        ${isOpen
                            ? "bg-violet-500 text-white border-violet-500 rotate-180"
                            : isDark ? "border-white/20 text-white/40 hover:border-white/40" : "border-gray-200 text-gray-400 hover:border-gray-400"
                        }
                    `}
                >
                    <ChevronDown className="w-3 h-3" />
                </div>
            </div>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out
                    ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
                `}
            >
                <div className={`px-3 md:px-4 pb-3 md:pb-4 font-mono text-[11px] md:text-xs leading-relaxed border-t
                    ${isDark ? "text-white/50 border-white/5" : "text-gray-600 border-gray-100"}
                `}>
                    <div className="pt-3">
                        {faq.answer}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function FaqSection() {
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
            <div className="container mx-auto max-w-5xl">

                {/* Header */}
                <div className="text-center mb-10 md:mb-14">
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

                {/* Como Funciona — 5 Steps */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`mb-10 md:mb-14 p-4 md:p-6 rounded-xl border
                        ${isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-gray-200 shadow-sm"}
                    `}
                >
                    <h3 className={`font-serif text-lg md:text-xl mb-5 text-center ${isDark ? "text-white" : "text-gray-900"}`}>
                        Como Funciona
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                        {HOW_IT_WORKS.map((item, index) => (
                            <div key={index} className="flex flex-col items-center text-center gap-2">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: `${item.color}15` }}
                                >
                                    <item.icon className="w-5 h-5" style={{ color: item.color }} />
                                </div>
                                <div>
                                    <span className={`font-mono text-[9px] uppercase tracking-widest ${isDark ? "text-white/25" : "text-gray-400"}`}>
                                        {item.step}
                                    </span>
                                    <p className={`font-serif text-xs md:text-sm font-bold leading-tight ${isDark ? "text-white/80" : "text-gray-800"}`}>
                                        {item.title}
                                    </p>
                                    <p className={`font-mono text-[10px] leading-snug mt-0.5 ${isDark ? "text-white/35" : "text-gray-500"}`}>
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* FAQ Grid — 2 columns desktop */}
                <div className="grid md:grid-cols-2 gap-2 md:gap-3">
                    {FAQS.map((faq, index) => (
                        <FaqItem key={index} faq={faq} isDark={isDark} />
                    ))}
                </div>
            </div>
        </section>
    );
}

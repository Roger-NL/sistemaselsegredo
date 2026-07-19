"use client";

import { motion } from "framer-motion";
import { CheckCircle2, FlaskConical, MessageSquareText, ShieldCheck } from "lucide-react";
import { useLandingTheme } from "@/context/LandingThemeContext";

const BETA_SIGNALS = [
    { title: "Acesso limitado", text: "Turma inicial pequena para acompanhar cada fluxo.", icon: FlaskConical },
    { title: "Validação humana", text: "Marcos importantes incluem revisão por uma pessoa autorizada.", icon: CheckCircle2 },
    { title: "Feedback direto", text: "Problemas e sugestões do beta entram na priorização do produto.", icon: MessageSquareText },
    { title: "Resultados individuais", text: "Ritmo e evolução variam conforme prática, nível e disponibilidade.", icon: ShieldCheck },
];

export function ResultsSection() {
    const { isDark } = useLandingTheme();

    return (
        <section className={`relative overflow-hidden px-4 py-24 ${isDark ? "bg-black" : "bg-white"}`}>
            <div className="container relative z-10 mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-14 text-center"
                >
                    <span className="mb-5 inline-block rounded-full border border-green-500/20 bg-green-500/5 px-4 py-2 font-mono text-xs uppercase tracking-widest text-green-500">
                        Programa beta
                    </span>
                    <h2 className={`mb-5 font-serif text-4xl md:text-6xl ${isDark ? "text-white" : "text-gray-900"}`}>
                        Construído com evidência,<br />sem promessas inventadas
                    </h2>
                    <p className={`mx-auto max-w-2xl font-mono text-sm leading-7 ${isDark ? "text-white/55" : "text-gray-600"}`}>
                        A BasedSpeak está em validação. Ainda não publicamos taxas de sucesso,
                        avaliações ou depoimentos sem uma base verificável.
                    </p>
                </motion.div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {BETA_SIGNALS.map((item, index) => (
                        <motion.article
                            key={item.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.06 }}
                            className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-gray-200 bg-gray-50"}`}
                        >
                            <item.icon className="mb-4 h-7 w-7 text-green-500" aria-hidden="true" />
                            <h3 className={`mb-2 font-mono text-sm font-bold uppercase tracking-wide ${isDark ? "text-white" : "text-gray-900"}`}>
                                {item.title}
                            </h3>
                            <p className={`text-sm leading-6 ${isDark ? "text-white/50" : "text-gray-600"}`}>{item.text}</p>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}

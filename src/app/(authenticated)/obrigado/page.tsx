"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { Check, ArrowRight, BookOpen, Fingerprint, Award, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function ObrigadoPage() {
    const router = useRouter();

    const handleDashboard = () => {
        router.push(ROUTES.app.dashboard);
    };

    const handlePillar2 = () => {
        router.push(`${ROUTES.app.pillar}/2`);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
            
            {/* Elegant Background Glow */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[600px] bg-gradient-to-tr from-emerald-900/20 via-violet-900/10 to-transparent rounded-full blur-[100px] opacity-70 mix-blend-screen" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-2xl"
            >
                <div className="rounded-3xl bg-white/5 border border-white/10 p-6 text-center shadow-2xl backdrop-blur-2xl sm:p-8 md:p-14">
                    
                    {/* Animated Checkmark Sequence */}
                    <div className="flex justify-center mb-8 relative">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                            className="w-20 h-20 rounded-full border-2 border-emerald-500/30 flex items-center justify-center relative z-10 bg-emerald-500/10 backdrop-blur-md"
                        >
                            <motion.div
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.8, delay: 0.5, ease: "easeInOut" }}
                            >
                                <Check className="w-8 h-8 text-emerald-400 stroke-[2.5]" />
                            </motion.div>
                        </motion.div>
                        
                        {/* Ping effect behind checkmark */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }}
                            className="absolute top-0 w-20 h-20 rounded-full bg-emerald-500/20 -z-10"
                        />
                    </div>

                    <h1 className="mb-4 text-3xl font-light tracking-tight text-white md:text-4xl">
                        Acesso Liberado
                    </h1>

                    <p className="mx-auto mb-8 max-w-lg text-base leading-relaxed text-slate-400 sm:mb-10 md:text-lg">
                        Seu pagamento foi confirmado com sucesso. Você agora faz parte da <span className="text-white font-medium">elite operacional</span> e tem acesso vitalício à ferramenta.
                    </p>

                    {/* Premium Unlocked Features Grid */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="mb-8 grid grid-cols-1 gap-3 text-left sm:mb-10 sm:grid-cols-2 sm:gap-4"
                    >
                        <div className="flex min-h-[104px] items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 sm:min-h-[132px]">
                            <Fingerprint className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400/80" strokeWidth={1.5} />
                            <div className="min-w-0">
                                <p className="mb-1 text-sm font-semibold uppercase tracking-[0.14em] text-slate-200 sm:text-xs sm:tracking-wider">Manejo dos Pilares</p>
                                <p className="text-sm leading-6 text-slate-400 sm:text-xs sm:leading-5">Acesso profundo aos 9 fundamentos</p>
                            </div>
                        </div>
                        <div className="flex min-h-[104px] items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 sm:min-h-[132px]">
                            <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400/80" strokeWidth={1.5} />
                            <div className="min-w-0">
                                <p className="mb-1 text-sm font-semibold uppercase tracking-[0.14em] text-slate-200 sm:text-xs sm:tracking-wider">Especializações</p>
                                <p className="text-sm leading-6 text-slate-400 sm:text-xs sm:leading-5">Módulos avançados liberados</p>
                            </div>
                        </div>
                        <div className="flex min-h-[104px] items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 sm:min-h-[132px]">
                            <Award className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400/80" strokeWidth={1.5} />
                            <div className="min-w-0">
                                <p className="mb-1 text-sm font-semibold uppercase tracking-[0.14em] text-slate-200 sm:text-xs sm:tracking-wider">Certificações</p>
                                <p className="text-sm leading-6 text-slate-400 sm:text-xs sm:leading-5">Suporte a testes OPIc e internacionais</p>
                            </div>
                        </div>
                        <div className="flex min-h-[104px] items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 sm:min-h-[132px]">
                            <Users className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400/80" strokeWidth={1.5} />
                            <div className="min-w-0">
                                <p className="mb-1 text-sm font-semibold uppercase tracking-[0.14em] text-slate-200 sm:text-xs sm:tracking-wider">Squads e Lobbies</p>
                                <p className="text-sm leading-6 text-slate-400 sm:text-xs sm:leading-5">Acesso direto à nossa comunidade</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                        className="flex w-full flex-col items-center gap-3 sm:flex-row"
                    >
                        <button
                            onClick={handlePillar2}
                            className="group relative w-full overflow-hidden rounded-xl bg-white py-4 text-sm font-semibold text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-black/10 to-transparent skew-x-12" />
                            <span className="flex items-center justify-center gap-2">
                                INICIAR PELO PILAR 2
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        </button>
                        
                        <button
                            onClick={handleDashboard}
                            className="w-full rounded-xl border border-white/20 bg-transparent py-4 text-sm font-semibold text-white transition-all hover:bg-white/5 active:scale-[0.98]"
                        >
                            MENU PRINCIPAL
                        </button>
                    </motion.div>

                </div>
            </motion.div>
        </div>
    );
}

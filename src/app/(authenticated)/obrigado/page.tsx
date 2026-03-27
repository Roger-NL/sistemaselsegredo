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
                className="relative z-10 w-full max-w-xl"
            >
                <div className="p-10 md:p-14 text-center rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl">
                    
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

                    <h1 className="text-3xl md:text-4xl font-light text-white mb-4 tracking-tight">
                        Acesso Liberado
                    </h1>

                    <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-md mx-auto mb-10 font-light">
                        Seu pagamento foi confirmado com sucesso. Você agora faz parte da <span className="text-white font-medium">elite operacional</span> e tem acesso vitalício à ferramenta.
                    </p>

                    {/* Premium Unlocked Features Grid */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="grid grid-cols-2 gap-4 mb-10 text-left"
                    >
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                            <Fingerprint className="w-5 h-5 text-emerald-400/80 mt-0.5" strokeWidth={1.5} />
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Manejo dos Pilares</p>
                                <p className="text-[10px] text-slate-500">Acesso profundo aos 9 fundamentos</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                            <BookOpen className="w-5 h-5 text-emerald-400/80 mt-0.5" strokeWidth={1.5} />
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Especializações</p>
                                <p className="text-[10px] text-slate-500">Módulos avançados liberados</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                            <Award className="w-5 h-5 text-emerald-400/80 mt-0.5" strokeWidth={1.5} />
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Certificações</p>
                                <p className="text-[10px] text-slate-500">Suporte a testes OPIc e internacionais</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                            <Users className="w-5 h-5 text-emerald-400/80 mt-0.5" strokeWidth={1.5} />
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">Squads & Lobbies</p>
                                <p className="text-[10px] text-slate-500">Acesso à nossa comunidade</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                        className="flex flex-col sm:flex-row items-center gap-3 w-full"
                    >
                        <button
                            onClick={handlePillar2}
                            className="w-full relative group overflow-hidden rounded-xl bg-white text-black py-4 font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-black/10 to-transparent skew-x-12" />
                            <span className="flex items-center justify-center gap-2">
                                INICIAR PELO PILAR 2
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        </button>
                        
                        <button
                            onClick={handleDashboard}
                            className="w-full rounded-xl bg-transparent border border-white/20 text-white py-4 font-semibold text-sm transition-all hover:bg-white/5 active:scale-[0.98]"
                        >
                            MENU PRINCIPAL
                        </button>
                    </motion.div>

                </div>
            </motion.div>
        </div>
    );
}

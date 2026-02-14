"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TubesBackground } from "@/components/ui/neon-flow";
import { FlightCard, FlightButton } from "@/components/ui/FlightCard";
import { Check, ArrowRight, Shield, Unlock, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function ObrigadoPage() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(10);

    // Auto-redirect disabled to let user read, or enabled? 
    // User said "e depois para o dashboard". Let's give them a button and maybe a slow auto-redirect.

    const handleContinue = () => {
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Background with higher intensity */}
            <div className="absolute inset-0 z-0">
                <TubesBackground />
                <div className="absolute inset-0 bg-violet-900/10 backdrop-blur-[2px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-2xl"
            >
                <FlightCard className="p-8 md:p-12 text-center border-emerald-500/30 shadow-[0_0_100px_rgba(16,185,129,0.2)]">

                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(16,185,129,0.5)]"
                    >
                        <Check className="w-12 h-12 text-black stroke-[3]" />
                    </motion.div>

                    <h1 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-wider">
                        Acesso Confirmado
                    </h1>

                    <p className="text-white/60 text-lg mb-8 leading-relaxed max-w-lg mx-auto">
                        Bem-vindo à elite operacional. <br />
                        Todos os <span className="text-emerald-400 font-bold">9 Pilares</span> e sistemas de especialização foram desbloqueados para sua conta.
                    </p>

                    {/* Unlocked Items Visual */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 opacity-70">
                        {['PILARES 1-9', 'ESPECIALIZAÇÕES', 'CERTIFICADOS', 'COMUNIDADE'].map((item, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/5">
                                <Unlock className="w-5 h-5 text-emerald-400" />
                                <span className="text-[10px] font-mono tracking-widest">{item}</span>
                            </div>
                        ))}
                    </div>

                    <FlightButton
                        onClick={handleContinue}
                        className="w-full md:w-auto px-12 py-5 text-lg"
                        variant="success"
                    >
                        INICIAR OPERAÇÃO AGORA
                        <ArrowRight className="w-5 h-5 ml-2 inline-block" />
                    </FlightButton>

                </FlightCard>
            </motion.div>
        </div>
    );
}

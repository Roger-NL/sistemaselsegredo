"use client";

import { FlightCard, FlightButton } from "@/components/ui/FlightCard";
import { Lock, Crown, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function PremiumWall() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <FlightCard variant="neon" className="p-8 text-center max-w-md border-violet-500/50">
                <div className="w-16 h-16 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Lock className="w-8 h-8 text-violet-400" />
                </div>
                
                <h1 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h1>
                <p className="text-white/60 mb-8 text-sm leading-relaxed">
                    Este conteúdo é exclusivo para Operadores de Elite (Premium).
                    Complete sua inscrição para desbloquear o acesso total.
                </p>

                <div className="space-y-3">
                    <FlightButton 
                        variant="neon" 
                        onClick={() => router.push("/pagamento")}
                        className="w-full justify-center"
                    >
                        <Crown className="w-4 h-4 mr-2" />
                        Desbloquear Acesso
                    </FlightButton>
                    
                    <button 
                        onClick={() => router.push("/dashboard")}
                        className="text-white/40 text-xs hover:text-white transition-colors uppercase tracking-widest"
                    >
                        Voltar ao Dashboard
                    </button>
                </div>
            </FlightCard>
        </div>
    );
}

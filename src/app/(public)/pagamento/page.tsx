"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { TacticalCard, TacticalButton } from "@/components/ui/TacticalCard";
import { Ticket, CreditCard, Check, AlertCircle, ArrowLeft, Loader2, Shield } from "lucide-react";

export default function PagamentoPage() {
    const router = useRouter();
    const { user, subscriptionStatus, activateWithInvite, activateWithPayment } = useAuth();
    const [mode, setMode] = useState<'choice' | 'invite' | 'payment' | 'success'>('choice');
    const [inviteCode, setInviteCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // If already active, redirect to dashboard
    if (subscriptionStatus === 'active') {
        router.push('/dashboard');
        return null;
    }

    const handleInviteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await activateWithInvite(inviteCode);

        if (result.success) {
            setMode('success');
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        } else {
            setError(result.error || 'Erro ao validar código');
        }
        setLoading(false);
    };

    const handlePayment = async () => {
        setError('');
        setLoading(true);

        // Simulate payment processing
        // In production, integrate with Stripe/Mercado Pago
        const mockPaymentId = `pay_${Date.now()}`;

        const result = await activateWithPayment(mockPaymentId);

        if (result.success) {
            setMode('success');
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        } else {
            setError(result.error || 'Erro no pagamento');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.1),transparent_70%)]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-lg"
            >
                <TacticalCard className="p-8">
                    <AnimatePresence mode="wait">
                        {/* Choice Screen */}
                        {mode === 'choice' && (
                            <motion.div
                                key="choice"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="text-center mb-8">
                                    <Shield className="w-16 h-16 text-violet-500 mx-auto mb-4" />
                                    <h1 className="text-2xl font-bold text-white mb-2">
                                        Ativar Acesso Completo
                                    </h1>
                                    <p className="text-white/50 text-sm">
                                        Escolha como deseja liberar seu acesso à ES English Academy
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <TacticalButton
                                        onClick={() => setMode('invite')}
                                        className="w-full flex items-center justify-between gap-4 p-4"
                                        variant="ghost"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Ticket className="w-6 h-6 text-green-400" />
                                            <div className="text-left">
                                                <div className="font-bold text-white">Tenho um Código</div>
                                                <div className="text-xs text-white/50">Convite especial</div>
                                            </div>
                                        </div>
                                    </TacticalButton>

                                    <TacticalButton
                                        onClick={() => setMode('payment')}
                                        className="w-full flex items-center justify-between gap-4 p-4"
                                        variant="neon"
                                    >
                                        <div className="flex items-center gap-3">
                                            <CreditCard className="w-6 h-6" />
                                            <div className="text-left">
                                                <div className="font-bold">Pagar Agora</div>
                                                <div className="text-xs opacity-70">Acesso imediato</div>
                                            </div>
                                        </div>
                                    </TacticalButton>
                                </div>

                                <button
                                    onClick={() => router.push('/')}
                                    className="w-full mt-6 text-white/40 text-sm hover:text-white transition-colors"
                                >
                                    ← Voltar para o site
                                </button>
                            </motion.div>
                        )}

                        {/* Invite Code Screen */}
                        {mode === 'invite' && (
                            <motion.div
                                key="invite"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <button
                                    onClick={() => { setMode('choice'); setError(''); }}
                                    className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Voltar
                                </button>

                                <div className="text-center mb-8">
                                    <Ticket className="w-12 h-12 text-green-400 mx-auto mb-4" />
                                    <h2 className="text-xl font-bold text-white mb-2">
                                        Código de Convite
                                    </h2>
                                    <p className="text-white/50 text-sm">
                                        Insira seu código especial para liberar acesso
                                    </p>
                                </div>

                                <form onSubmit={handleInviteSubmit} className="space-y-4">
                                    <div>
                                        <input
                                            type="text"
                                            value={inviteCode}
                                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                            placeholder="ES-XXXXXXXX"
                                            className="w-full p-4 bg-black/50 border border-white/20 rounded-lg text-white text-center font-mono text-xl tracking-widest placeholder:text-white/30 focus:outline-none focus:border-green-500"
                                            maxLength={12}
                                        />
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 text-red-400 text-sm">
                                            <AlertCircle className="w-4 h-4" />
                                            {error}
                                        </div>
                                    )}

                                    <TacticalButton
                                        onClick={handleInviteSubmit}
                                        disabled={loading || inviteCode.length < 4}
                                        className="w-full"
                                        variant="success"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            'Validar Código'
                                        )}
                                    </TacticalButton>
                                </form>
                            </motion.div>
                        )}

                        {/* Payment Screen */}
                        {mode === 'payment' && (
                            <motion.div
                                key="payment"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <button
                                    onClick={() => { setMode('choice'); setError(''); }}
                                    className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Voltar
                                </button>

                                <div className="text-center mb-8">
                                    <CreditCard className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                                    <h2 className="text-xl font-bold text-white mb-2">
                                        Pagamento
                                    </h2>
                                    <p className="text-white/50 text-sm">
                                        Acesso completo à ES English Academy
                                    </p>
                                </div>

                                <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Plano Anual</span>
                                        <span className="text-2xl font-bold text-white">R$ 297</span>
                                    </div>
                                    <p className="text-white/40 text-xs mt-1">
                                        Acesso por 1 ano a todos os pilares e especialidades
                                    </p>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-400 text-sm mb-4">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}

                                <TacticalButton
                                    onClick={handlePayment}
                                    disabled={loading}
                                    className="w-full"
                                    variant="neon"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        'Pagar e Ativar'
                                    )}
                                </TacticalButton>

                                <p className="text-white/30 text-xs text-center mt-4">
                                    🔒 Pagamento seguro e processado via gateway confiável
                                </p>
                            </motion.div>
                        )}

                        {/* Success Screen */}
                        {mode === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                                >
                                    <Check className="w-10 h-10 text-white" />
                                </motion.div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Acesso Liberado!
                                </h2>
                                <p className="text-white/50">
                                    Redirecionando para o Dashboard...
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </TacticalCard>
            </motion.div>
        </div>
    );
}

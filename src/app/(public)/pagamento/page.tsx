"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { FlightButton } from "@/components/ui/FlightCard";
import { ROUTES } from "@/lib/routes";
import {
    Check,
    AlertCircle,
    Loader2,
    Shield,
    Play,
    Star,
    Lock,
    Zap
} from "lucide-react";

export default function PagamentoPage() {
    const router = useRouter();
    const { user, subscriptionStatus, activateWithInvite, activateWithPayment, isAuthenticated, isLoading } = useAuth();

    // UI States
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const [cpf, setCpf] = useState('');
    const [qrCodeData, setQrCodeData] = useState<{ encodedImage: string, payload: string } | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (subscriptionStatus === 'premium') {
            router.replace(ROUTES.app.thankYou);
        }
    }, [router, subscriptionStatus]);

    const redirectToLogin = () => {
        router.push(`${ROUTES.auth.login}?callbackUrl=${encodeURIComponent(ROUTES.public.payment)}`);
    };

    const handleInviteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isAuthenticated) {
            redirectToLogin();
            return;
        }

        setLoading(true);

        const result = await activateWithInvite(inviteCode);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                router.push(ROUTES.app.dashboard);
            }, 2000);
        } else {
            setError(result.error || 'Erro ao validar código');
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        setError('');

        if (!isAuthenticated || !user) {
            redirectToLogin();
            return;
        }

        if (cpf.replace(/\\D/g, '').length < 11) {
            setError('Por favor, informe um CPF válido.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: user.name || "Novo Aluno",
                    email: user.email,
                    cpfCnpj: cpf.replace(/\\D/g, ''),
                    userId: user.id
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erro ao gerar cobrança');
            }

            setQrCodeData({ encodedImage: data.qrCode, payload: data.qrCodePayload });
        } catch (err: any) {
            setError(err.message || 'Erro de comunicação com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    // Success Screen
    if (success) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(34,197,94,0.5)]">
                        <Check className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Acesso Liberado!</h2>
                    <p className="text-slate-400">Redirecionando para o QG...</p>
                </motion.div>
            </div>
        );
    }

    if (!isLoading && subscriptionStatus === 'premium') {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-violet-500/30">

            {/* Nav Simplificada */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/5 h-16 flex items-center justify-between px-6">
                <div className="font-bold tracking-tighter text-xl">
                    BASEDSPEAK <span className="text-violet-500">PRO</span>
                </div>
                <button onClick={() => router.push(ROUTES.home)} className="text-xs text-white/50 hover:text-white transition-colors uppercase tracking-widest">
                    Voltar
                </button>
            </nav>

            <main className="pt-24 pb-20">

                {/* Hero Section */}
                <div className="relative max-w-4xl mx-auto px-4 text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                            <Shield className="w-3 h-3" />
                            Missão Fase 1 Concluída
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-none">
                            VOCÊ PROVOU SEU VALOR.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-600">
                                AGORA O JOGO MUDOU.
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            Seu desempenho no Pilar 1 desbloqueou uma condição única para acessar o
                            protocolo completo de fluência da BasedSpeak.
                        </p>
                    </motion.div>
                </div>

                {/* VSL Section */}
                <div className="max-w-5xl mx-auto px-4 mb-24 relative">
                    <div className="aspect-video w-full bg-[#0A0A0A] rounded-2xl border border-white/10 shadow-[0_0_100px_rgba(139,92,246,0.15)] overflow-hidden relative group">
                        {/* Placeholder Visual */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                        {/* Grid Pattern */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none" />

                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300 cursor-pointer shadow-lg">
                                <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-2" fill="currentColor" />
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end">
                            <div>
                                <p className="text-violet-400 font-mono text-xs uppercase tracking-widest mb-2">Classified Briefing</p>
                                <h3 className="text-xl md:text-2xl font-bold">O Protocolo Secreto de Fluência</h3>
                            </div>
                            <div className="px-3 py-1 bg-black/50 backdrop-blur rounded text-xs font-mono">
                                04:20
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Proof / Testimonials */}
                <div className="border-y border-white/5 bg-white/[0.02] py-20 mb-20 overflow-hidden">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl font-bold mb-4">Agentes Ativos no Campo</h2>
                            <div className="flex justify-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" />
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { name: "Carlos M.", role: "Engenheiro de Software", text: "O método desbloqueou meu inglês em 3 meses. Consegui minha vaga internacional hoje." },
                                { name: "Juliana R.", role: "Médica", text: "Eu travava em conferências. O Pilar 3 mudou tudo. A confiança que ganhei é surreal." },
                                { name: "Pedro H.", role: "Empreendedor", text: "Não é apenas inglês. É mentalidade. O English Bible mudou minha forma de pensar." }
                            ].map((review, idx) => (
                                <div key={idx} className="bg-black/40 border border-white/10 p-6 rounded-xl hover:border-white/20 transition-colors">
                                    <p className="text-slate-300 mb-6 leading-relaxed">&quot;{review.text}&quot;</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-400">
                                            {review.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{review.name}</p>
                                            <p className="text-xs text-slate-500">{review.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Offer Section */}
                <div id="offer" className="max-w-3xl mx-auto px-4 text-center">
                    <div className="bg-[#0A0A0A] border border-violet-500/30 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-[0_0_100px_rgba(139,92,246,0.1)]">

                        {/* Glow Effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15),transparent_70%)] pointer-events-none" />

                        <div className="relative z-10">
                            <div className="inline-block px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-8 animate-pulse">
                                <Zap className="w-3 h-3 inline mr-2 text-yellow-400" fill="currentColor" />
                                Desconto por Recorde no Pilar 1
                            </div>

                            <div className="mb-8">
                                <p className="text-slate-500 text-lg line-through mb-2">De R$ 997,00 por</p>
                                <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter">
                                    <span className="text-2xl align-top text-slate-400 font-bold mr-1">R$</span>
                                    297
                                </h2>
                                <p className="text-slate-400 mt-4 text-sm uppercase tracking-widest">Acesso Vitalício • Pagamento Único</p>
                            </div>

                            <ul className="text-left max-w-md mx-auto space-y-4 mb-10 text-slate-300">
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                    <span>Sistema completo de 9 Pilares</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                    <span>Certificações Internacionais</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                    <span>Acesso à Comunidade Elite</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                    <span>Garantia de 7 dias blindada</span>
                                </li>
                            </ul>

                            {error && (
                                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center justify-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            {qrCodeData ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white rounded-xl p-6 text-black flex flex-col items-center shadow-lg"
                                >
                                    <h3 className="text-xl font-bold mb-2">Escaneie para Pagar</h3>
                                    <p className="text-sm text-slate-500 mb-4 text-center">Abra o app do seu banco e escaneie o QR Code abaixo via PIX.</p>
                                    
                                    <div className="bg-slate-100 p-2 rounded-lg mb-4">
                                        <img 
                                            src={`data:image/png;base64,${qrCodeData.encodedImage}`} 
                                            alt="PIX QR Code" 
                                            className="w-48 h-48 mix-blend-multiply"
                                        />
                                    </div>

                                    <div className="w-full">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Copia e Cola</p>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                readOnly 
                                                value={qrCodeData.payload} 
                                                className="flex-1 bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-600 focus:outline-none"
                                                onClick={(e) => e.currentTarget.select()}
                                            />
                                            <button 
                                                onClick={() => navigator.clipboard.writeText(qrCodeData.payload)}
                                                className="bg-violet-500 hover:bg-violet-600 text-white px-3 py-2 rounded text-xs font-bold transition-colors"
                                            >
                                                COPIAR
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <p className="text-xs text-center text-slate-400 mt-4 flex items-center gap-2 justify-center">
                                        <Loader2 className="w-3 h-3 animate-spin text-violet-500" />
                                        Aguardando confirmação do pagamento...
                                    </p>
                                </motion.div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-left w-full relative">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Seu CPF (Para emissão da nota)</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: 000.000.000-00"
                                            value={cpf}
                                            onChange={(e) => setCpf(e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-mono"
                                        />
                                    </div>
                                    <FlightButton
                                        onClick={handlePayment}
                                        disabled={loading}
                                        className="w-full py-6 text-xl font-bold shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)]"
                                        variant="neon"
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                GERANDO PIX...
                                            </span>
                                        ) : (
                                            "GERAR PIX DE ACESSO"
                                        )}
                                    </FlightButton>
                                </div>
                            )}

                            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider">
                                <Lock className="w-3 h-3" />
                                Ambiente Criptografado 256-bit
                            </div>
                        </div>
                    </div>

                    {/* Hidden/Subtle Code Input */}
                    <div className="mt-12">
                        {!showCodeInput ? (
                            <button
                                onClick={() => setShowCodeInput(true)}
                                className="text-xs text-slate-600 hover:text-slate-400 transition-colors underline decoration-slate-700 underline-offset-4"
                            >
                                Tenho um código de convite de parceiro
                            </button>
                        ) : (
                            <motion.form
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="max-w-xs mx-auto"
                                onSubmit={handleInviteSubmit}
                            >
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                        placeholder="CÓDIGO"
                                        className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-xs font-mono text-center focus:border-violet-500 outline-none"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 rounded transition-colors"
                                        disabled={loading}
                                    >
                                        OK
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}

"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import AuthBackground from "@/components/auth/AuthBackground";
import ConciergeModal from "@/components/core/ConciergeModal";
import { ROUTES, isSafeInternalCallbackPath } from "@/lib/routes";

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginPageFallback />}>
            <LoginPageContent />
        </Suspense>
    );
}

function LoginPageFallback() {
    return (
        <div className="relative min-h-[100dvh] w-full overflow-y-auto overflow-x-hidden bg-[#050505] px-4 py-10 md:flex md:min-h-screen md:items-center md:justify-center md:overflow-hidden md:p-4">
            <AuthBackground />
            <div className="relative z-10 mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-[#0A0A0A]/60 p-6 pb-10 shadow-2xl backdrop-blur-xl sm:p-8 sm:pb-8">
                <div className="text-center text-slate-400 text-sm">Carregando acesso...</div>
            </div>
        </div>
    );
}

function LoginPageContent() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCommsModal, setShowCommsModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetStatus, setResetStatus] = useState({ loading: false, success: false, error: "" });

    const { user, login, loginWithGoogle, isAuthenticated, isLoading, resetPassword } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleFieldFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        window.setTimeout(() => {
            event.target.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 250);
    };

    const getPostLoginTarget = useCallback((email?: string) => {
        const callbackUrl = searchParams?.get("callbackUrl") || "";
        if (isSafeInternalCallbackPath(callbackUrl)) {
            return callbackUrl;
        }

        const ADMIN_EMAILS = ["roger@esacademy.com", "admin@esacademy.com", "raugerac@gmail.com"];
        return email && ADMIN_EMAILS.includes(email) ? ROUTES.admin.dashboard : ROUTES.app.dashboard;
    }, [searchParams]);

    // Auto-redirect if already logged in
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push(getPostLoginTarget(user?.email));
        }
    }, [getPostLoginTarget, isAuthenticated, isLoading, router, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!identifier || !password) {
            setError("Preencha todos os campos");
            return;
        }

        setIsSubmitting(true);

        const result = await login(identifier, password);

        if (result.success) {
            router.push(getPostLoginTarget(result.user?.email));
        } else {
            setError(result.error || "Erro ao fazer login");
            setIsSubmitting(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetStatus({ loading: true, success: false, error: "" });
        if (!resetEmail) {
            setResetStatus({ loading: false, success: false, error: "Por favor, preencha o seu e-mail." });
            return;
        }
        const res = await resetPassword(resetEmail);
        if (res.success) {
            setResetStatus({ loading: false, success: true, error: "" });
        } else {
            setResetStatus({ loading: false, success: false, error: res.error || "Ocorreu um erro ao enviar o e-mail." });
        }
    };

    return (
        <div className="relative min-h-[100dvh] w-full overflow-y-auto overflow-x-hidden bg-[#050505] px-4 py-10 md:flex md:min-h-screen md:items-center md:justify-center md:overflow-hidden md:p-4">

            {/* Ambient Background */}
            <AuthBackground />

            {/* Back to landing */}
            <Link
                href={ROUTES.home}
                className="absolute top-6 left-6 z-30 text-xs tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-2 font-mono uppercase"
            >
                ← Voltar
            </Link>

            {/* Glassmorphism Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-[#0A0A0A]/60 p-6 pb-10 shadow-2xl backdrop-blur-xl sm:p-8 sm:pb-8"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold tracking-tighter text-white mb-2">
                        Acesse sua Conta
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Entre com seus dados para acessar.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-xs font-mono">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="identifier" className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                E-mail
                            </label>
                            <div className="relative group">
                                <input
                                    id="identifier"
                                    name="identifier"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    onFocus={handleFieldFocus}
                                    className="block w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white placeholder-slate-600 focus:border-white/30 focus:ring-0 transition-all outline-none sm:text-sm"
                                    placeholder="seu@email.com"
                                />
                                <div className="absolute inset-0 rounded-lg bg-white/5 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                Senha
                            </label>
                            <div className="relative group">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={handleFieldFocus}
                                    className="block w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white placeholder-slate-600 focus:border-white/30 focus:ring-0 transition-all outline-none sm:text-sm"
                                    placeholder="••••••••"
                                />
                                <div className="absolute inset-0 rounded-lg bg-white/5 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            type="button"
                            onClick={async () => {
                                setIsSubmitting(true);
                                const result = await loginWithGoogle();
                                if (result.success) {
                                    router.push(getPostLoginTarget(result.user?.email));
                                } else {
                                    setError(result.error || "Erro ao entrar com Google");
                                    setIsSubmitting(false);
                                }
                            }}
                            disabled={isSubmitting}
                            className="group relative flex w-full justify-center items-center gap-3 rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 focus:outline-none transition-all duration-200"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Entrar com Google
                        </button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink-0 mx-4 text-xs text-slate-500 uppercase tracking-widest">Ou email</span>
                            <div className="flex-grow border-t border-white/10"></div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded border-white/10 bg-black/40 text-white focus:ring-offset-0 focus:ring-0"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-400">
                                Lembrar sessão
                            </label>
                        </div>

                        <div className="text-xs">
                            <button
                                type="button"
                                onClick={() => setShowResetModal(true)}
                                className="font-medium text-slate-400 hover:text-white transition-colors"
                            >
                                Recuperar acesso
                            </button>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative flex w-full justify-center rounded-lg bg-white text-black px-4 py-3 text-sm font-bold hover:bg-slate-200 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    ENTRANDO...
                                </span>
                            ) : (
                                "ENTRAR"
                            )}
                        </button>
                    </div>

                    <div className="text-center text-xs text-slate-500 mt-6">
                        NÃO TEM UMA CONTA?{" "}
                        <Link href={ROUTES.auth.signup} className="text-slate-300 hover:text-white font-medium transition-colors">
                            CADASTRE-SE
                        </Link>
                    </div>
                </form>
            </motion.div>

            {/* Password Reset Modal */}
            <AnimatePresence>
                {showResetModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-sm bg-[#0A0A0A] border border-white/10 p-6 rounded-2xl shadow-2xl relative"
                        >
                            <button
                                onClick={() => {
                                    setShowResetModal(false);
                                    setResetStatus({ loading: false, success: false, error: "" });
                                    setResetEmail("");
                                }}
                                className="absolute top-4 right-4 text-slate-500 hover:text-white"
                            >
                                ✕
                            </button>
                            <h2 className="text-xl font-bold text-white mb-2">Recuperar Senha</h2>

                            {resetStatus.success ? (
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-white font-medium mb-2">E-mail Enviado!</h3>
                                    <p className="text-slate-400 text-sm">
                                        Se esse e-mail estiver cadastrado, você receberá um link para criar uma nova senha.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleReset} className="space-y-4 pt-2">
                                    <p className="text-slate-400 text-sm mb-4">
                                        Digite o seu e-mail de acesso e nós enviaremos instruções para redefinir a sua senha.
                                    </p>

                                    {resetStatus.error && (
                                        <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-xs font-mono">
                                            {resetStatus.error}
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="reset-email" className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">E-mail</label>
                                        <input
                                            id="reset-email"
                                            type="email"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            required
                                            className="block w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white placeholder-slate-600 focus:border-white/30 focus:ring-0 transition-all outline-none sm:text-sm"
                                            placeholder="seu@email.com"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={resetStatus.loading}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-black bg-white hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all disabled:opacity-50"
                                    >
                                        {resetStatus.loading ? "ENVIANDO..." : "ENVIAR LINK"}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* WhatsApp Capture Modal — Trigger 1: Login */}
            <ConciergeModal
                trigger="login"
                isOpen={showCommsModal}
                onClose={() => {
                    setShowCommsModal(false);
                    router.push(ROUTES.app.dashboard);
                }}
                onConnect={(phone) => {
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('es-concierge-v1', phone);
                    }
                    setShowCommsModal(false);
                    router.push(ROUTES.app.dashboard);
                }}
            />

            {/* Transição de Saída (Fade to Black) */}
            <AnimatePresence>
                {isSubmitting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-white font-mono text-xl tracking-widest"
                        >
                            ENTRANDO...
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

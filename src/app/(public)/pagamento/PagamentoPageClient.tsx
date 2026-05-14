"use client";

import Image from "next/image";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { FlightButton } from "@/components/ui/FlightCard";
import { ROUTES } from "@/lib/routes";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { DirectCardForm } from "@/components/payments/DirectCardForm";
import {
    buildDirectCardPayload,
    digitsOnly,
    EMPTY_DIRECT_CARD_FORM,
    getDirectCardFieldErrors
} from "@/lib/payments/direct-card";
import type { DirectCardField, DirectCardFieldErrors } from "@/lib/payments/direct-card";
import {
    Check,
    AlertCircle,
    Loader2,
    Shield,
    Play,
    Star,
    Lock,
    Zap,
    CreditCard,
    QrCode
} from "lucide-react";

const PAYMENT_AMOUNT = 297;
const SPECIALTY_TEST_PAYMENT_AMOUNT = 50;
const DEFAULT_MAX_INSTALLMENTS = 12;
const PREMIUM_MAX_INSTALLMENTS = 21;

function detectCardBrand(cardNumber: string) {
    const digits = digitsOnly(cardNumber);

    if (digits.startsWith("4")) {
        return "visa";
    }

    const firstTwo = Number(digits.slice(0, 2));
    const firstFour = Number(digits.slice(0, 4));
    if ((firstTwo >= 51 && firstTwo <= 55) || (firstFour >= 2221 && firstFour <= 2720)) {
        return "mastercard";
    }

    if (/^3[47]/.test(digits)) {
        return "amex";
    }

    if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|627780|636297|636368)/.test(digits)) {
        return "elo";
    }

    return "unknown";
}

function getInstallmentLimit(cardNumber: string) {
    const brand = detectCardBrand(cardNumber);
    return brand === "visa" || brand === "mastercard" ? PREMIUM_MAX_INSTALLMENTS : DEFAULT_MAX_INSTALLMENTS;
}

function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

async function createAuthenticatedHeaders() {
    const currentUser = auth.currentUser;

    if (!currentUser) {
        throw new Error("AUTH_REQUIRED");
    }

    const token = await currentUser.getIdToken();

    return {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
    };
}

type CheckoutField =
    | "cpf"
    | "holderName"
    | "number"
    | "expiryMonth"
    | "expiryYear"
    | "ccv"
    | "postalCode"
    | "addressNumber"
    | "addressComplement"
    | "phone";

type CheckoutFieldErrors = {
    cpf?: string;
} & DirectCardFieldErrors;

const CHECKOUT_FIELD_ORDER: CheckoutField[] = [
    "cpf",
    "holderName",
    "number",
    "expiryMonth",
    "expiryYear",
    "ccv",
    "postalCode",
    "addressNumber",
    "phone",
];

function PagamentoPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, subscriptionStatus, activateWithInvite, isAuthenticated, isLoading, refreshUser } = useAuth();
    const checkoutPlan = searchParams.get("plan") === "specialty" ? "specialty" : "lifetime";
    const isSpecialtyTestMode = checkoutPlan === "specialty";

    const [showCodeInput, setShowCodeInput] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const [cpf, setCpf] = useState('');
    const [cardForm, setCardForm] = useState(EMPTY_DIRECT_CARD_FORM);
    const [installmentCount, setInstallmentCount] = useState(1);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"PIX" | "CREDIT_CARD">("PIX");
    const [activePaymentMethod, setActivePaymentMethod] = useState<"PIX" | "CREDIT_CARD" | null>(null);
    const [qrCodeData, setQrCodeData] = useState<{ encodedImage: string, payload: string } | null>(null);
    const [paymentId, setPaymentId] = useState<string | null>(null);
    const [pixExpiresAt, setPixExpiresAt] = useState<string | null>(null);
    const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<CheckoutFieldErrors>({});
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [recoveringPix, setRecoveringPix] = useState(false);
    const [success, setSuccess] = useState(false);
    const pixExpired = Boolean(
        activePaymentMethod === "PIX" &&
        pixExpiresAt &&
        new Date(pixExpiresAt).getTime() <= Date.now()
    );
    const checkoutAmount = isSpecialtyTestMode ? SPECIALTY_TEST_PAYMENT_AMOUNT : PAYMENT_AMOUNT;
    const detectedCardBrand = detectCardBrand(cardForm.number);
    const maxInstallments = getInstallmentLimit(cardForm.number);
    const normalizedInstallmentCount = Math.min(installmentCount, maxInstallments);
    const installmentValue = checkoutAmount / normalizedInstallmentCount;
    const maskedCardNumber = cardForm.number || "0000 0000 0000 0000";
    const maskedHolderName = (cardForm.holderName || user?.name || "SEU NOME").toUpperCase();
    const maskedExpiry = `${cardForm.expiryMonth || "MM"}/${(cardForm.expiryYear || "AA").slice(-2)}`;
    const shouldAskPhone = digitsOnly(cardForm.phone || user?.phone || "").length < 10;
    const installmentOptions = Array.from({ length: maxInstallments }, (_, index) => index + 1);
    const cpfInputRef = useRef<HTMLInputElement | null>(null);
    const cardSectionRef = useRef<HTMLDivElement | null>(null);
    const fieldRefs = useRef<Partial<Record<CheckoutField, HTMLInputElement | null>>>({});
    const activeInlineError = useMemo(
        () => CHECKOUT_FIELD_ORDER.map((field) => fieldErrors[field]).find(Boolean) || "",
        [fieldErrors]
    );

    const setFieldRef = (field: CheckoutField) => (element: HTMLInputElement | null) => {
        fieldRefs.current[field] = element;
    };

    const clearFieldError = (field: CheckoutField) => {
        setFieldErrors((current) => {
            if (!current[field]) {
                return current;
            }

            const next = { ...current };
            delete next[field];
            return next;
        });
    };

    const scrollToField = (field: CheckoutField) => {
        const element = field === "cpf" ? cpfInputRef.current : fieldRefs.current[field];
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            window.setTimeout(() => {
                element.focus();
                element.select?.();
            }, 250);
            return;
        }

        if (field !== "cpf" && cardSectionRef.current) {
            cardSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    const validateCheckoutFields = (): CheckoutFieldErrors => {
        const nextErrors: CheckoutFieldErrors = {};
        const normalizedCpf = cpf.replace(/\D/g, "");

        if (normalizedCpf.length < 11) {
            nextErrors.cpf = normalizedCpf.length === 0
                ? "Informe seu CPF para emitir a cobrança."
                : "Seu CPF precisa ter 11 dígitos.";
        }

        if (selectedPaymentMethod === "CREDIT_CARD") {
            const cardErrors = getDirectCardFieldErrors(cardForm, {
                requireHolderName: !Boolean(user?.name),
                requirePhone: shouldAskPhone,
            });
            Object.assign(nextErrors, cardErrors);
        }

        return nextErrors;
    };

    useEffect(() => {
        setInstallmentCount((current) => Math.min(current, maxInstallments));
    }, [maxInstallments]);

    useEffect(() => {
        setCardForm((current) => {
            const nextHolderName = current.holderName || user?.name || "";
            const nextPhone = current.phone || user?.phone || "";

            if (nextHolderName === current.holderName && nextPhone === current.phone) {
                return current;
            }

            return {
                ...current,
                holderName: nextHolderName,
                phone: nextPhone,
            };
        });
    }, [user?.name, user?.phone]);

    useEffect(() => {
        if (!isSpecialtyTestMode && !isLoading && subscriptionStatus === 'premium') {
            router.replace(ROUTES.app.thankYou);
        }
    }, [router, subscriptionStatus, isLoading, isSpecialtyTestMode]);

    useEffect(() => {
        if (!user?.id || isLoading || paymentId || (!isSpecialtyTestMode && subscriptionStatus === 'premium')) {
            return;
        }

        let cancelled = false;

        const recoverCheckoutState = async () => {
            setRecoveringPix(true);
            try {
                const headers = await createAuthenticatedHeaders();
                const res = await fetch(`/api/checkout?plan=${checkoutPlan}`, {
                    cache: 'no-store',
                    headers,
                });
                const data = await res.json();

                if (cancelled) {
                    return;
                }

                if (data.alreadyPremium) {
                    await refreshUser();
                    if (!isSpecialtyTestMode) {
                        router.replace(ROUTES.app.thankYou);
                    }
                    return;
                }

                if (data.hasPendingPayment) {
                    setSelectedPaymentMethod(data.paymentMethod || "PIX");
                    setActivePaymentMethod(data.paymentMethod || "PIX");
                    setInstallmentCount(data.installmentCount || 1);
                    setPaymentId(data.paymentId);
                    setInvoiceUrl(data.invoiceUrl || null);
                    setPaymentStatus(data.status || null);
                    setQrCodeData(
                        data.qrCode && data.qrCodePayload
                            ? { encodedImage: data.qrCode, payload: data.qrCodePayload }
                            : null
                    );
                    setPixExpiresAt(data.expiresAt || null);
                }
            } catch {
                // silent fallback to manual generation
            } finally {
                if (!cancelled) {
                    setRecoveringPix(false);
                }
            }
        };

        void recoverCheckoutState();

        return () => {
            cancelled = true;
        };
    }, [user?.id, isLoading, paymentId, subscriptionStatus, refreshUser, router, checkoutPlan, isSpecialtyTestMode]);

    useEffect(() => {
        if (!paymentId || !user?.id || (!isSpecialtyTestMode && subscriptionStatus === 'premium')) return;

        let stopped = false;

        const checkPayment = async () => {
            if (stopped) return;
            try {
                const headers = await createAuthenticatedHeaders();
                const res = await fetch('/api/verify-payment', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ paymentId }),
                });
                const data = await res.json();
                setPaymentStatus(data.status || null);
                if (data.isPaid && !stopped) {
                    stopped = true;
                    if (!isSpecialtyTestMode) {
                        await refreshUser();
                        router.replace(ROUTES.app.thankYou);
                    }
                }
            } catch {
                // silent - will retry
            }
        };

        void checkPayment();
        const interval = setInterval(checkPayment, 5000);

        const userRef = doc(db, "users", user.id);
        const unsubscribe = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists() && snapshot.data()?.subscriptionStatus === 'premium' && !stopped) {
                if (isSpecialtyTestMode) return;
                stopped = true;
                clearInterval(interval);
                router.replace(ROUTES.app.thankYou);
            }
        });

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') void checkPayment();
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            stopped = true;
            clearInterval(interval);
            unsubscribe();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [paymentId, user?.id, subscriptionStatus, router, refreshUser, isSpecialtyTestMode]);

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

    const createPayment = async (options?: { redirectOnCard?: boolean }) => {
        const redirectOnCard = options?.redirectOnCard ?? true;
        setError('');
        setHasAttemptedSubmit(true);

        if (!isAuthenticated || !user) {
            redirectToLogin();
            return;
        }

        const validationErrors = validateCheckoutFields();
        setFieldErrors(validationErrors);

        const firstErrorField = CHECKOUT_FIELD_ORDER.find((field) => validationErrors[field]);
        if (firstErrorField) {
            setError(
                firstErrorField === "cpf"
                    ? "Revise os dados destacados antes de continuar."
                    : "Existem campos do pagamento com erro. Corrija para continuar."
            );
            scrollToField(firstErrorField);
            return;
        }

        setLoading(true);

        try {
            const headers = await createAuthenticatedHeaders();
            const endpoint = selectedPaymentMethod === "CREDIT_CARD" ? '/api/checkout/card/direct' : '/api/checkout';
            const directCardPayload = selectedPaymentMethod === "CREDIT_CARD" ? buildDirectCardPayload(cardForm) : {};
            const res = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name: user.name || "Novo Aluno",
                    email: user.email,
                    cpfCnpj: cpf.replace(/\D/g, ''),
                    plan: checkoutPlan,
                    paymentMethod: selectedPaymentMethod,
                    creditCardMode: selectedPaymentMethod === "CREDIT_CARD" ? "DIRECT" : undefined,
                    installmentCount: selectedPaymentMethod === "CREDIT_CARD" ? normalizedInstallmentCount : 1,
                    ...directCardPayload
                })
            });

            const data = await res.json();

            if (data.alreadyPremium) {
                await refreshUser();
                if (!isSpecialtyTestMode) {
                    router.replace(ROUTES.app.thankYou);
                }
                return;
            }

            if (!res.ok) {
                throw new Error(data.error || 'Erro ao gerar cobrança');
            }

            setSelectedPaymentMethod(data.paymentMethod || selectedPaymentMethod);
            setActivePaymentMethod(data.paymentMethod || selectedPaymentMethod);
            setPaymentId(data.paymentId);
            setInvoiceUrl(data.invoiceUrl || null);
            setPaymentStatus(data.status || null);
            setFieldErrors({});
            setQrCodeData(
                data.qrCode && data.qrCodePayload
                    ? { encodedImage: data.qrCode, payload: data.qrCodePayload }
                    : null
            );
            setPixExpiresAt(data.expiresAt || null);

            if (redirectOnCard && (data.paymentMethod || selectedPaymentMethod) === "CREDIT_CARD" && data.invoiceUrl) {
                window.location.href = data.invoiceUrl;
            }
        } catch (err: unknown) {
            if (err instanceof Error && err.message === "AUTH_REQUIRED") {
                redirectToLogin();
                return;
            }

            setError(err instanceof Error ? err.message : 'Erro de comunicação com o servidor.');
            if (selectedPaymentMethod === "CREDIT_CARD") {
                cardSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        await createPayment({ redirectOnCard: true });
    };

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

    if (!isSpecialtyTestMode && !isLoading && subscriptionStatus === 'premium') {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-violet-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-sm">Redirecionando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-violet-500/30">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/5 h-16 flex items-center justify-between px-6">
                <div className="font-bold tracking-tighter text-xl">
                    BASEDSPEAK <span className="text-violet-500">PRO</span>
                </div>
                <div className="flex items-center gap-2">
                    {isAuthenticated && (
                        <button
                            onClick={() => router.push(ROUTES.app.dashboard)}
                            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/10 hover:text-white uppercase tracking-[0.2em]"
                        >
                            Dashboard
                        </button>
                    )}
                    <button
                        onClick={() => router.push(isAuthenticated ? ROUTES.app.dashboard : ROUTES.home)}
                        className="text-xs text-white/50 hover:text-white transition-colors uppercase tracking-widest"
                    >
                        Voltar
                    </button>
                </div>
            </nav>

            <main className="pt-24 pb-20">
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

                <div className="max-w-5xl mx-auto px-4 mb-24 relative">
                    <div className="aspect-video w-full bg-[#0A0A0A] rounded-2xl border border-white/10 shadow-[0_0_100px_rgba(139,92,246,0.15)] overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
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

                <div id="offer" className="max-w-3xl mx-auto px-4 text-center">
                    <div className="bg-[#0A0A0A] border border-violet-500/30 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-[0_0_100px_rgba(139,92,246,0.1)]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15),transparent_70%)] pointer-events-none" />

                        <div className="relative z-10">
                            <div className="inline-block rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-yellow-400 mb-8 animate-pulse">
                                <Zap className="w-3 h-3 inline mr-2 text-yellow-400" fill="currentColor" />
                                {isSpecialtyTestMode ? "Modo de Teste • Especialidade" : "Desconto por Recorde no Pilar 1"}
                            </div>

                            <div className="mb-8">
                                <p className="text-slate-500 text-lg line-through mb-2">
                                    {isSpecialtyTestMode ? "Valor de teste" : "De R$ 997,00 por"}
                                </p>
                                <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter">
                                    <span className="text-2xl align-top text-slate-400 font-bold mr-1">R$</span>
                                    {isSpecialtyTestMode ? "50" : "297"}
                                </h2>
                                <p className="text-slate-400 mt-4 text-sm uppercase tracking-widest">
                                    {isSpecialtyTestMode ? "Compra de Especialidade • Pagamento Único" : "Acesso Vitalício • Pagamento Único"}
                                </p>
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

                            {pixExpired && !qrCodeData && (
                                <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm flex items-center justify-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Seu PIX expirou. Gere um novo para continuar.
                                </div>
                            )}

                            {error && (
                                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center justify-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            {activeInlineError && hasAttemptedSubmit && (
                                <div className="mb-6 rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 text-left text-amber-200 text-sm">
                                    <p className="font-semibold uppercase tracking-[0.18em] text-[11px] text-amber-300">
                                        Revise os campos marcados
                                    </p>
                                    <p className="mt-1 leading-relaxed">
                                        Corrija primeiro o campo destacado. Depois disso, tente finalizar novamente.
                                    </p>
                                </div>
                            )}

                            {recoveringPix && !paymentId && (
                                <div className="mb-6 p-3 bg-white/5 border border-white/10 rounded-lg text-slate-300 text-sm flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                                    Recuperando seu pagamento atual...
                                </div>
                            )}

                            {activePaymentMethod === "PIX" && qrCodeData ? (
                                <motion.div
                                    id="pix-display-card"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white rounded-xl p-6 text-black flex flex-col items-center shadow-lg"
                                >
                                    <h3 className="text-xl font-bold mb-2">Escaneie para Pagar</h3>
                                    <p className="text-sm text-slate-500 mb-4 text-center">Abra o app do seu banco e escaneie o QR Code abaixo via PIX.</p>

                                    <div className="bg-slate-100 p-2 rounded-lg mb-4">
                                        <Image
                                            src={`data:image/png;base64,${qrCodeData.encodedImage}`}
                                            alt="PIX QR Code"
                                            width={192}
                                            height={192}
                                            className="h-48 w-48 mix-blend-multiply"
                                            unoptimized
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
                                    {pixExpiresAt && (
                                        <p className="text-[11px] text-center text-slate-500 mt-2">
                                            Este Pix fica reservado para voce ate {new Date(pixExpiresAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.
                                        </p>
                                    )}
                                </motion.div>
                            ) : activePaymentMethod === "CREDIT_CARD" && (invoiceUrl || paymentId) ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-6 text-center shadow-[0_0_40px_rgba(16,185,129,0.12)]"
                                >
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10">
                                        <CreditCard className="h-6 w-6 text-emerald-300" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold text-white">
                                        {invoiceUrl ? "Pagamento por Cartão Pronto" : "Cartão enviado para processamento"}
                                    </h3>
                                    <p className="mx-auto mb-5 max-w-md text-sm leading-relaxed text-slate-300">
                                        {invoiceUrl
                                            ? "Sua cobrança por cartão já foi criada. Toque abaixo para abrir a fatura segura da Asaas e finalizar o pagamento."
                                            : "Os dados completos do cartão foram enviados para a Asaas. Acompanhe o status abaixo enquanto a confirmação é processada."}
                                    </p>
                                    {invoiceUrl ? (
                                        <FlightButton
                                            onClick={() => window.location.href = invoiceUrl}
                                            className="w-full py-5 text-lg font-bold"
                                            variant="neon"
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                <CreditCard className="h-5 w-5" />
                                                PAGAR COM CARTÃO AGORA
                                            </span>
                                        </FlightButton>
                                    ) : (
                                        <div className="rounded-2xl border border-emerald-400/20 bg-black/20 px-4 py-4 text-sm text-emerald-200">
                                            Status atual: <span className="font-bold">{paymentStatus || "PROCESSANDO"}</span>
                                        </div>
                                    )}
                                    <p className="mt-4 text-xs uppercase tracking-[0.22em] text-slate-500">
                                        {invoiceUrl ? "Fatura segura Asaas" : "Cobranca direta Asaas"}
                                    </p>
                                </motion.div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedPaymentMethod("PIX");
                                                setError("");
                                            }}
                                            className={`rounded-2xl border p-4 text-left transition-all ${
                                                selectedPaymentMethod === "PIX"
                                                    ? "border-violet-400 bg-violet-500/10 shadow-[0_0_24px_rgba(139,92,246,0.18)]"
                                                    : "border-white/10 bg-black/30 hover:border-white/20"
                                            }`}
                                        >
                                            <div className="mb-2 flex items-center gap-2">
                                                <QrCode className="h-5 w-5 text-violet-300" />
                                                <span className="text-sm font-bold uppercase tracking-[0.18em] text-white">Pix</span>
                                            </div>
                                            <p className="text-sm leading-relaxed text-slate-400">
                                                Pagamento instantaneo com QR Code e copia e cola prontos para finalizar.
                                            </p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedPaymentMethod("CREDIT_CARD");
                                                setError("");
                                            }}
                                            className={`rounded-2xl border p-4 text-left transition-all ${
                                                selectedPaymentMethod === "CREDIT_CARD"
                                                    ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_24px_rgba(16,185,129,0.18)]"
                                                    : "border-white/10 bg-black/30 hover:border-white/20"
                                            }`}
                                        >
                                            <div className="mb-2 flex items-center gap-2">
                                                <CreditCard className="h-5 w-5 text-emerald-300" />
                                                <span className="text-sm font-bold uppercase tracking-[0.18em] text-white">Cartao</span>
                                            </div>
                                            <p className="text-sm leading-relaxed text-slate-400">
                                                Checkout direto com parcelamento na fatura e confirmacao imediata quando aprovado.
                                            </p>
                                        </button>
                                    </div>

                                    <div className="text-left w-full relative">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Seu CPF (Para emissão da nota)</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: 000.000.000-00"
                                            value={cpf}
                                            onChange={(e) => {
                                                setCpf(e.target.value);
                                                clearFieldError("cpf");
                                            }}
                                            ref={cpfInputRef}
                                            aria-invalid={Boolean(fieldErrors.cpf)}
                                            className={`w-full bg-black/50 border rounded-xl p-4 text-white focus:outline-none focus:ring-1 transition-all font-mono ${
                                                fieldErrors.cpf
                                                    ? "border-rose-500 focus:border-rose-400 focus:ring-rose-400/40"
                                                    : "border-white/10 focus:border-violet-500 focus:ring-violet-500"
                                            }`}
                                        />
                                        {fieldErrors.cpf ? (
                                            <p className="mt-2 text-[11px] text-rose-300">{fieldErrors.cpf}</p>
                                        ) : (
                                            <p className="mt-2 text-[11px] text-slate-500">
                                                Digite os 11 dígitos do CPF do comprador.
                                            </p>
                                        )}
                                    </div>
                                    {selectedPaymentMethod === "CREDIT_CARD" && (
                                        <div
                                            ref={cardSectionRef}
                                            className="space-y-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-5"
                                        >
                                            <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,#0d1721_0%,#10292a_45%,#153f34_100%)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-[0.34em] text-emerald-100/55">Cartao</p>
                                                        <p className="mt-3 text-lg font-semibold tracking-[0.32em] text-white/95">
                                                            {maskedCardNumber}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/75">
                                                        {detectedCardBrand === "unknown" ? "credito" : detectedCardBrand}
                                                    </div>
                                                </div>
                                                <div className="mt-8 flex items-end justify-between gap-4">
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-[0.28em] text-white/40">Titular</p>
                                                        <p className="mt-1 text-sm font-medium tracking-[0.18em] text-white/90">
                                                            {maskedHolderName}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] uppercase tracking-[0.28em] text-white/40">Validade</p>
                                                        <p className="mt-1 text-sm font-medium tracking-[0.18em] text-white/90">
                                                            {maskedExpiry}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                                                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                                                    <label className="block text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                                                        Parcelamento
                                                        <select
                                                            value={normalizedInstallmentCount}
                                                            onChange={(event) => setInstallmentCount(Number(event.target.value))}
                                                            disabled={loading || recoveringPix}
                                                            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                                                        >
                                                            {installmentOptions.map((option) => (
                                                                <option key={option} value={option}>
                                                                    {option}x de {formatCurrency(checkoutAmount / option)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </label>
                                                    <p className="mt-3 text-xs leading-relaxed text-slate-400">
                                                        {normalizedInstallmentCount === 1
                                                            ? "Pagamento a vista com cobranca unica no cartao."
                                                            : `Sua fatura recebe ${normalizedInstallmentCount} parcelas de ${formatCurrency(installmentValue)}.`}
                                                    </p>
                                                    <p className="mt-2 text-[11px] leading-relaxed text-emerald-300/80">
                                                        Visa e Master podem chegar a 21x na Asaas. Outras bandeiras seguem ate 12x.
                                                    </p>
                                                </div>

                                                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                                                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Resumo</p>
                                                    <div className="mt-3 space-y-2 text-sm text-slate-300">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <span>Total</span>
                                                            <span className="font-semibold text-white">{formatCurrency(checkoutAmount)}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-3">
                                                            <span>Forma</span>
                                                            <span className="font-semibold text-white">Cartao de credito</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-3">
                                                            <span>Plano</span>
                                                            <span className="font-semibold text-white">{normalizedInstallmentCount}x</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-emerald-400/20 bg-black/20 p-5">
                                                <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
                                                    Dados de pagamento
                                                </p>
                                                <DirectCardForm
                                                    value={cardForm}
                                                    onChange={(nextValue) => {
                                                        setCardForm(nextValue);
                                                        clearFieldError("holderName");
                                                        clearFieldError("number");
                                                        clearFieldError("expiryMonth");
                                                        clearFieldError("expiryYear");
                                                        clearFieldError("ccv");
                                                        clearFieldError("postalCode");
                                                        clearFieldError("addressNumber");
                                                        clearFieldError("phone");
                                                    }}
                                                    disabled={loading || recoveringPix}
                                                    hideHolderName={Boolean(user?.name)}
                                                    hidePhone={!shouldAskPhone}
                                                    errors={fieldErrors}
                                                    inputRefs={{
                                                        holderName: setFieldRef("holderName"),
                                                        number: setFieldRef("number"),
                                                        expiryMonth: setFieldRef("expiryMonth"),
                                                        expiryYear: setFieldRef("expiryYear"),
                                                        ccv: setFieldRef("ccv"),
                                                        postalCode: setFieldRef("postalCode"),
                                                        addressNumber: setFieldRef("addressNumber"),
                                                        addressComplement: setFieldRef("addressComplement"),
                                                        phone: setFieldRef("phone"),
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <FlightButton
                                        onClick={handlePayment}
                                        disabled={loading || recoveringPix}
                                        className="w-full py-6 text-xl font-bold shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)]"
                                        variant="neon"
                                    >
                                        {loading || recoveringPix ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                {recoveringPix ? 'RECUPERANDO CHECKOUT...' : 'PROCESSANDO PAGAMENTO...'}
                                            </span>
                                        ) : (
                                            selectedPaymentMethod === "PIX"
                                                ? "PAGAR COM PIX"
                                                : normalizedInstallmentCount > 1
                                                    ? `PAGAR EM ${normalizedInstallmentCount}X`
                                                    : "FINALIZAR NO CARTAO"
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

function PagamentoPageFallback() {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-10 h-10 text-violet-500 animate-spin mx-auto mb-4" />
                <p className="text-slate-400 text-sm">Carregando pagamento...</p>
            </div>
        </div>
    );
}

export default function PagamentoPageClient() {
    return (
        <Suspense fallback={<PagamentoPageFallback />}>
            <PagamentoPageContent />
        </Suspense>
    );
}

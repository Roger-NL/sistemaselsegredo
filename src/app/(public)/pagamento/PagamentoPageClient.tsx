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
import {
    buildPaymentReturnTo,
    getReconciliationMessage,
    resolvePaymentMode,
    type PaymentReconciliationState,
    type VerifyPaymentApiResponse
} from "@/features/payment/payment-mode";
import { DirectCardForm } from "@/components/payments/DirectCardForm";
import {
    buildDirectCardPayload,
    digitsOnly,
    EMPTY_DIRECT_CARD_FORM,
    getDirectCardFieldErrors
} from "@/lib/payments/direct-card";
import type { DirectCardFieldErrors } from "@/lib/payments/direct-card";
import { calculateCheckoutInstallmentTotals, MAX_CHECKOUT_INSTALLMENTS } from "@/lib/payments/installments";
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
    const currentPaymentReturnTo = useMemo(
        () => buildPaymentReturnTo(searchParams.toString()),
        [searchParams]
    );

    const forceShowInvite = searchParams.get("invite") === "1" || searchParams.get("beta") === "1";
    const [showCodeInput, setShowCodeInput] = useState(forceShowInvite);
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
    const [reconciliationState, setReconciliationState] = useState<PaymentReconciliationState | null>(null);
    const [reconciliationMessage, setReconciliationMessage] = useState("");
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
    const maxInstallments = MAX_CHECKOUT_INSTALLMENTS;
    const installmentTotals = calculateCheckoutInstallmentTotals(checkoutAmount, installmentCount);
    const normalizedInstallmentCount = installmentTotals.installmentCount;
    const installmentValue = installmentTotals.installmentAmount;
    const installmentTotalAmount = installmentTotals.totalAmount;
    const installmentFeeAmount = installmentTotals.feeAmount;
    const hasInstallmentFee = installmentTotals.hasFee;
    const maskedCardNumber = cardForm.number || "0000 0000 0000 0000";
    const maskedHolderName = (cardForm.holderName || "NOME DO TITULAR").toUpperCase();
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
    const hasPendingPayment = Boolean(
        paymentId ||
        qrCodeData ||
        invoiceUrl ||
        (activePaymentMethod && paymentStatus)
    );
    const isAlreadyPremium = !isSpecialtyTestMode && subscriptionStatus === "premium";
    const paymentMode = useMemo(
        () => resolvePaymentMode({
            isAuthenticated,
            isAuthLoading: isLoading,
            isPremium: isAlreadyPremium,
            inviteRequested: showCodeInput,
            hasPendingPayment,
            isRecoveringPayment: recoveringPix && !hasPendingPayment,
            reconciliationState,
        }),
        [hasPendingPayment, isAlreadyPremium, isAuthenticated, isLoading, recoveringPix, reconciliationState, showCodeInput]
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
                requireHolderName: true,
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
            const nextPhone = current.phone || user?.phone || "";

            if (nextPhone === current.phone) {
                return current;
            }

            return {
                ...current,
                phone: nextPhone,
            };
        });
    }, [user?.phone]);

    useEffect(() => {
        if (isAlreadyPremium && !isLoading) {
            router.replace(ROUTES.app.thankYou);
        }
    }, [router, isAlreadyPremium, isLoading]);

    useEffect(() => {
        if (!user?.id || isLoading || paymentId || isAlreadyPremium) {
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
                    setReconciliationState(null);
                    setReconciliationMessage("");
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
    }, [user?.id, isLoading, paymentId, isAlreadyPremium, refreshUser, router, checkoutPlan, isSpecialtyTestMode]);

    useEffect(() => {
        if (!paymentId || !user?.id || isAlreadyPremium) return;

        let navigationCompleted = false;
        let pollingPaused = false;

        const checkPayment = async () => {
            if (navigationCompleted || pollingPaused) return;
            try {
                const headers = await createAuthenticatedHeaders();
                const res = await fetch('/api/verify-payment', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ paymentId }),
                });
                const data = (await res.json()) as Partial<VerifyPaymentApiResponse> & { error?: string };

                setPaymentStatus(typeof data.status === "string" ? data.status : null);
                setReconciliationState(data.reconciliationState ?? null);
                setReconciliationMessage(getReconciliationMessage(data.reconciliationState, data.message || data.error));

                if (data.shouldStopPolling && data.isPaid !== true) {
                    pollingPaused = true;
                    return;
                }

                if (data.isPaid && !navigationCompleted) {
                    navigationCompleted = true;
                    if (!isSpecialtyTestMode) {
                        await refreshUser();
                        router.replace(ROUTES.app.thankYou);
                    }
                }
            } catch {
                setReconciliationState("error");
                setReconciliationMessage(getReconciliationMessage("error"));
            }
        };

        void checkPayment();
        const interval = setInterval(checkPayment, 5000);

        const userRef = doc(db, "users", user.id);
        const unsubscribe = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists() && snapshot.data()?.subscriptionStatus === 'premium' && !navigationCompleted) {
                if (isSpecialtyTestMode) return;
                navigationCompleted = true;
                clearInterval(interval);
                router.replace(ROUTES.app.thankYou);
            }
        });

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') void checkPayment();
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            navigationCompleted = true;
            pollingPaused = true;
            clearInterval(interval);
            unsubscribe();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [paymentId, user?.id, isAlreadyPremium, router, refreshUser, isSpecialtyTestMode]);

    const redirectToLogin = () => {
        router.push(`${ROUTES.auth.login}?callbackUrl=${encodeURIComponent(currentPaymentReturnTo)}`);
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
        setReconciliationState(null);
        setReconciliationMessage("");

        try {
            const headers = await createAuthenticatedHeaders();
            const endpoint = selectedPaymentMethod === "CREDIT_CARD" ? '/api/checkout/card/direct' : '/api/checkout';
            const directCardPayload = selectedPaymentMethod === "CREDIT_CARD"
                ? buildDirectCardPayload(cardForm, {
                    name: user.name || "Novo Aluno",
                    email: user.email,
                    cpfCnpj: cpf.replace(/\D/g, ''),
                })
                : {};
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
            setReconciliationState(null);
            setReconciliationMessage("");
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

    const renderPendingPaymentContent = () => {
        if (activePaymentMethod === "PIX" && qrCodeData) {
            return (
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
            );
        }

        if (activePaymentMethod === "CREDIT_CARD" && (invoiceUrl || paymentId)) {
            return (
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
            );
        }

        return (
            <div className="rounded-2xl border border-white/10 bg-black/25 p-6 text-center">
                <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Pagamento em andamento</p>
                <p className="mt-3 text-base leading-relaxed text-slate-300">
                    Detectamos um checkout em aberto para esta conta. Continue por ele para evitar duplicar a cobrança.
                </p>
            </div>
        );
    };

    const renderInviteModeContent = () => (
        <motion.form
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] px-5 py-6"
            onSubmit={handleInviteSubmit}
        >
            <div className="mb-5 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                    Ativar acesso beta
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/72">
                    Digite abaixo o codigo que voce recebeu. Se ele estiver valido, seu acesso premium sera liberado sem pagamento.
                </p>
                {!isAuthenticated && (
                    <p className="mt-3 text-xs leading-relaxed text-emerald-100/75">
                        Se voce ainda nao entrou na conta, o login sera pedido no proximo passo e o contexto desta pagina sera preservado.
                    </p>
                )}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="CODIGO"
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
            <button
                type="button"
                onClick={() => setShowCodeInput(false)}
                className="mt-4 text-xs text-white/45 transition hover:text-white/70"
            >
                Voltar para o checkout
            </button>
        </motion.form>
    );

    const renderControlledReconciliationContent = () => {
        const isManual = paymentMode === "manual-reconciliation";

        return (
            <div className="rounded-2xl border border-amber-400/25 bg-amber-500/[0.06] p-6 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-amber-300" />
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-300">
                    {isManual ? "Conferencia manual necessaria" : "Checkout em analise segura"}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-200">
                    {reconciliationMessage || getReconciliationMessage(isManual ? "manual-reconciliation" : "unresolved")}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-slate-400">
                    Para evitar duplicidade, nao abra uma nova cobranca agora. Se voce ja pagou, aguarde a atualizacao da sua conta ou volte mais tarde.
                </p>
                {invoiceUrl && (
                    <FlightButton
                        onClick={() => {
                            window.location.href = invoiceUrl;
                        }}
                        className="mt-5 w-full py-4 text-base font-bold"
                        variant="neon"
                    >
                        ABRIR COBRANCA ATUAL
                    </FlightButton>
                )}
            </div>
        );
    };

    const renderUnauthenticatedContent = () => (
        <div className="rounded-2xl border border-white/10 bg-black/25 p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
                <Lock className="h-6 w-6 text-violet-300" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-300">
                Identificacao necessaria
            </p>
            <h3 className="mt-3 text-2xl font-bold text-white">Entre para continuar</h3>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-300">
                Antes de abrir um checkout novo, precisamos vincular esta etapa a uma conta. Seu caminho atual sera preservado no login.
            </p>
            <FlightButton
                onClick={redirectToLogin}
                className="mt-6 w-full py-5 text-lg font-bold"
                variant="neon"
            >
                ENTRAR E CONTINUAR
            </FlightButton>
            <button
                type="button"
                onClick={() => setShowCodeInput(true)}
                className="mt-4 text-xs uppercase tracking-[0.18em] text-emerald-200/80 transition hover:text-emerald-100"
            >
                Tenho um codigo beta
            </button>
        </div>
    );

    const renderLoadingReconciliationContent = () => (
        <div className="rounded-2xl border border-white/10 bg-black/25 p-6 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-violet-400" />
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-300">
                Conferindo seu estado atual
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Estamos verificando se ja existe um checkout em aberto ou se sua conta precisa seguir por outro caminho.
            </p>
        </div>
    );

    const renderCheckoutFormContent = () => (
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
                                {installmentOptions.map((option) => {
                                    const optionTotals = calculateCheckoutInstallmentTotals(checkoutAmount, option);

                                    return (
                                        <option key={option} value={option}>
                                            {option}x de {formatCurrency(optionTotals.installmentAmount)}{" "}
                                            {optionTotals.hasFee ? `| total ${formatCurrency(optionTotals.totalAmount)}` : "| sem acrescimo"}
                                        </option>
                                    );
                                })}
                                </select>
                            </label>
                            <p className="mt-3 text-xs leading-relaxed text-slate-400">
                                {normalizedInstallmentCount === 1
                                    ? "Pagamento a vista no cartao, sem acrescimo."
                                    : normalizedInstallmentCount === 2
                                        ? "Parcelamento em 2x sem acrescimo."
                                        : `Parcelamento em ${normalizedInstallmentCount}x com taxa da Asaas repassada ao comprador.`}
                            </p>
                            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                                Escolha entre 1x e 6x. Ate 2x sem acrescimo. De 3x a 6x, a taxa do parcelamento e somada ao total da compra.
                            </p>
                            {hasInstallmentFee ? (
                                <p className="mt-2 text-[11px] leading-relaxed text-emerald-300/80">
                                    Total no cartao: {formatCurrency(installmentTotalAmount)}. Taxa do parcelamento: {formatCurrency(installmentFeeAmount)}.
                                </p>
                            ) : (
                                <p className="mt-2 text-[11px] leading-relaxed text-emerald-300/80">
                                    Total no cartao: {formatCurrency(installmentTotalAmount)} sem taxa adicional.
                                </p>
                            )}
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Resumo</p>
                            <div className="mt-3 space-y-2 text-sm text-slate-300">
                                <div className="flex items-center justify-between gap-3">
                                    <span>Total no cartao</span>
                                    <span className="font-semibold text-white">{formatCurrency(installmentTotalAmount)}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span>Forma</span>
                                    <span className="font-semibold text-white">Cartao de credito</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span>Parcelas</span>
                                    <span className="font-semibold text-white">{normalizedInstallmentCount}x</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span>Produto</span>
                                    <span className="font-semibold text-white">{formatCurrency(checkoutAmount)}</span>
                                </div>
                                {hasInstallmentFee && (
                                    <div className="flex items-center justify-between gap-3">
                                        <span>Taxa do parcelamento</span>
                                        <span className="font-semibold text-emerald-300">{formatCurrency(installmentFeeAmount)}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between gap-3">
                                    <span>Valor por parcela</span>
                                    <span className="font-semibold text-white">{formatCurrency(installmentValue)}</span>
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
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] px-4 py-4 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                    Acesso beta por convite
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/72">
                    Recebeu um codigo de tester? Troque o modo desta pagina e ative seu acesso sem abrir um checkout novo.
                </p>
                <button
                    type="button"
                    onClick={() => setShowCodeInput(true)}
                    className="mt-4 inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100 transition hover:border-emerald-300/40 hover:bg-emerald-400/15"
                >
                    Usar codigo de acesso
                </button>
            </div>
        </div>
    );

    const renderErrorContent = () => (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-300" />
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-red-300">
                Nao foi possivel preparar esta etapa
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Recarregue a pagina ou volte ao dashboard para tentar novamente com sua conta atual.
            </p>
        </div>
    );

    const renderPaymentModeContent = () => {
        switch (paymentMode) {
            case "invite-mode":
                return renderInviteModeContent();
            case "pending-payment":
                return renderPendingPaymentContent();
            case "manual-reconciliation":
            case "unresolved-payment":
                return renderControlledReconciliationContent();
            case "unauthenticated":
                return renderUnauthenticatedContent();
            case "loading-reconciliation":
                return renderLoadingReconciliationContent();
            case "error":
                return renderErrorContent();
            case "new-checkout":
            default:
                return renderCheckoutFormContent();
        }
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

    if (paymentMode === "already-premium") {
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
                                    {isSpecialtyTestMode ? "Compra de Especialidade • Pagamento Único" : "Acesso Premium • Pagamento Único"}
                                </p>
                            </div>

                            <ul className="text-left max-w-md mx-auto space-y-4 mb-10 text-slate-300">
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                    <span>Jornada premium liberada conforme sua progressão</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                    <span>Conteúdo principal já utilizável nesta fase</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                    <span>Novas etapas adicionadas com a evolução da plataforma</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                    <span>Liberação controlada e acompanhamento do seu avanço</span>
                                </li>
                            </ul>

                            {paymentMode === "pending-payment" && pixExpired && !qrCodeData && (
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

                            {paymentMode === "loading-reconciliation" && recoveringPix && !paymentId && (
                                <div className="mb-6 p-3 bg-white/5 border border-white/10 rounded-lg text-slate-300 text-sm flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                                    Recuperando seu pagamento atual...
                                </div>
                            )}

                            {(paymentMode === "manual-reconciliation" || paymentMode === "unresolved-payment") && reconciliationMessage && (
                                <div className="mb-6 rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 text-left text-amber-100 text-sm">
                                    <p className="font-semibold uppercase tracking-[0.18em] text-[11px] text-amber-300">
                                        Checkout sob revisao
                                    </p>
                                    <p className="mt-1 leading-relaxed">
                                        {reconciliationMessage}
                                    </p>
                                </div>
                            )}
                            {renderPaymentModeContent()}

                            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider">
                                <Lock className="w-3 h-3" />
                                Ambiente Criptografado 256-bit
                            </div>
                        </div>
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

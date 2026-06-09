"use client";

import Image from "next/image";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

                if (data.isPaid) {
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
        const interval = setInterval(checkPayment, 1500);

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

    const navigateSafely = useCallback(
        (href: string) => {
            router.push(href);

            if (typeof window === "undefined") return;

            window.setTimeout(() => {
                const target = new URL(href, window.location.origin);
                const targetPath = `${target.pathname}${target.search}${target.hash}`;
                const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

                if (currentPath !== targetPath) {
                    window.location.assign(href);
                }
            }, 180);
        },
        [router]
    );

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
            await refreshUser();
            setSuccess(true);
            setTimeout(() => {
                navigateSafely(ROUTES.app.thankYou);
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

            if (data.isPaid) {
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
                    className="rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-950 shadow-sm flex flex-col items-center"
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
                                type="button"
                                onClick={() => navigator.clipboard.writeText(qrCodeData.payload)}
                                className="rounded bg-zinc-950 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-zinc-800"
                            >
                                COPIAR
                            </button>
                        </div>
                    </div>

                    <p className="text-xs text-center text-slate-400 mt-4 flex items-center gap-2 justify-center">
                        <Loader2 className="w-3 h-3 animate-spin text-zinc-700" />
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
                    className="rounded-2xl border border-zinc-200 bg-white p-6 text-center text-zinc-950 shadow-sm"
                >
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50">
                        <CreditCard className="h-6 w-6 text-zinc-800" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-zinc-950">
                        {invoiceUrl ? "Pagamento por Cartão Pronto" : "Cartão enviado para processamento"}
                    </h3>
                    <p className="mx-auto mb-5 max-w-md text-sm leading-relaxed text-zinc-600">
                        {invoiceUrl
                            ? "Sua cobrança por cartão já foi criada. Toque abaixo para abrir a fatura segura da Asaas e finalizar o pagamento."
                            : "Os dados completos do cartão foram enviados para a Asaas. Acompanhe o status abaixo enquanto a confirmação é processada."}
                    </p>
                    {invoiceUrl ? (
                        <FlightButton
                            onClick={() => window.location.href = invoiceUrl}
                            className="w-full !rounded-2xl !border-zinc-950 bg-zinc-950 py-5 text-lg font-bold text-white shadow-none hover:bg-zinc-800"
                            variant="neon"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                PAGAR COM CARTÃO AGORA
                            </span>
                        </FlightButton>
                    ) : (
                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-700">
                            Status atual: <span className="font-bold">{paymentStatus || "PROCESSANDO"}</span>
                        </div>
                    )}
                    <p className="mt-4 text-xs uppercase tracking-[0.18em] text-zinc-500">
                        {invoiceUrl ? "Fatura segura Asaas" : "Cobranca direta Asaas"}
                    </p>
                </motion.div>
            );
        }

        return (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center text-zinc-950">
                <p className="text-sm uppercase tracking-[0.18em] text-zinc-500">Pagamento em andamento</p>
                <p className="mt-3 text-base leading-relaxed text-zinc-700">
                    Detectamos um checkout em aberto para esta conta. Continue por ele para evitar duplicar a cobrança.
                </p>
            </div>
        );
    };

    const renderInviteModeContent = () => (
        <motion.form
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-zinc-200 bg-white px-5 py-6 text-zinc-950 shadow-sm"
            onSubmit={handleInviteSubmit}
        >
            <div className="mb-5 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                    Ativar acesso beta
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                    Digite abaixo o codigo que voce recebeu. Se ele estiver valido, seu acesso premium sera liberado sem pagamento.
                </p>
                {!isAuthenticated && (
                    <p className="mt-3 text-xs leading-relaxed text-zinc-500">
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
                    className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-3 text-center font-mono text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/10"
                />
                <button
                    type="submit"
                    className="rounded-xl bg-zinc-950 px-4 py-3 text-xs font-bold text-white transition-colors hover:bg-zinc-800 disabled:bg-zinc-400"
                    disabled={loading}
                >
                    OK
                </button>
            </div>
            <button
                type="button"
                onClick={() => setShowCodeInput(false)}
                className="mt-4 text-xs text-zinc-500 transition hover:text-zinc-950"
            >
                Voltar para o checkout
            </button>
        </motion.form>
    );

    const renderControlledReconciliationContent = () => {
        const isManual = paymentMode === "manual-reconciliation";

        return (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-zinc-950">
                <AlertCircle className="mx-auto h-8 w-8 text-amber-700" />
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-800">
                    {isManual ? "Conferencia manual necessaria" : "Checkout em analise segura"}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-700">
                    {reconciliationMessage || getReconciliationMessage(isManual ? "manual-reconciliation" : "unresolved")}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-zinc-500">
                    Para evitar duplicidade, nao abra uma nova cobranca agora. Se voce ja pagou, aguarde a atualizacao da sua conta ou volte mais tarde.
                </p>
                {invoiceUrl && (
                    <FlightButton
                        onClick={() => {
                            window.location.href = invoiceUrl;
                        }}
                        className="mt-5 w-full !rounded-2xl !border-zinc-950 bg-zinc-950 py-4 text-base font-bold text-white shadow-none hover:bg-zinc-800"
                        variant="neon"
                    >
                        ABRIR COBRANCA ATUAL
                    </FlightButton>
                )}
            </div>
        );
    };

    const renderUnauthenticatedContent = () => (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center text-zinc-950 shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50">
                <Lock className="h-6 w-6 text-zinc-800" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                Identificacao necessaria
            </p>
            <h3 className="mt-3 text-2xl font-bold text-zinc-950">Entre para continuar</h3>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-zinc-600">
                Antes de abrir um checkout novo, precisamos vincular esta etapa a uma conta. Seu caminho atual sera preservado no login.
            </p>
            <FlightButton
                onClick={redirectToLogin}
                className="mt-6 w-full !rounded-2xl !border-zinc-950 bg-zinc-950 py-5 text-lg font-bold text-white shadow-none hover:bg-zinc-800"
                variant="neon"
            >
                ENTRAR E CONTINUAR
            </FlightButton>
            <button
                type="button"
                onClick={() => setShowCodeInput(true)}
                className="mt-4 text-xs uppercase tracking-[0.16em] text-zinc-500 transition hover:text-zinc-950"
            >
                Tenho um codigo beta
            </button>
        </div>
    );

    const renderLoadingReconciliationContent = () => (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center text-zinc-950 shadow-sm">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-zinc-700" />
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                Conferindo seu estado atual
            </p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                Estamos verificando se ja existe um checkout em aberto ou se sua conta precisa seguir por outro caminho.
            </p>
        </div>
    );

    const renderCheckoutFormContent = () => (
        <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={() => {
                        setSelectedPaymentMethod("PIX");
                        setError("");
                    }}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                        selectedPaymentMethod === "PIX"
                            ? "border-zinc-950 bg-zinc-950 text-white shadow-[0_12px_30px_rgba(24,24,27,0.18)]"
                            : "border-zinc-200 bg-white text-zinc-950 hover:border-zinc-400"
                    }`}
                >
                    <div className="mb-2 flex items-center gap-2">
                        <QrCode className={`h-5 w-5 ${selectedPaymentMethod === "PIX" ? "text-white" : "text-zinc-700"}`} />
                        <span className="text-sm font-bold uppercase tracking-[0.18em]">Pix</span>
                    </div>
                    <p className={`text-sm leading-relaxed ${selectedPaymentMethod === "PIX" ? "text-white/70" : "text-zinc-500"}`}>
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
                            ? "border-zinc-950 bg-zinc-950 text-white shadow-[0_12px_30px_rgba(24,24,27,0.18)]"
                            : "border-zinc-200 bg-white text-zinc-950 hover:border-zinc-400"
                    }`}
                >
                    <div className="mb-2 flex items-center gap-2">
                        <CreditCard className={`h-5 w-5 ${selectedPaymentMethod === "CREDIT_CARD" ? "text-white" : "text-zinc-700"}`} />
                        <span className="text-sm font-bold uppercase tracking-[0.18em]">Cartao</span>
                    </div>
                    <p className={`text-sm leading-relaxed ${selectedPaymentMethod === "CREDIT_CARD" ? "text-white/70" : "text-zinc-500"}`}>
                        Checkout direto com parcelamento na fatura e confirmacao imediata quando aprovado.
                    </p>
                </button>
            </div>

            <div className="text-left w-full relative">
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-600">Seu CPF (Para emissão da nota)</label>
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
                    className={`w-full rounded-xl border bg-white p-4 font-mono text-base text-zinc-950 outline-none transition-all placeholder:text-zinc-400 focus:ring-4 ${
                        fieldErrors.cpf
                            ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/15"
                            : "border-zinc-200 focus:border-zinc-950 focus:ring-zinc-950/10"
                    }`}
                />
                {fieldErrors.cpf ? (
                    <p className="mt-2 text-[11px] text-rose-600">{fieldErrors.cpf}</p>
                ) : (
                    <p className="mt-2 text-[11px] text-zinc-500">
                        Digite os 11 dígitos do CPF do comprador.
                    </p>
                )}
            </div>
            {selectedPaymentMethod === "CREDIT_CARD" && (
                <div
                    ref={cardSectionRef}
                    className="space-y-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5"
                >
                    <div className="overflow-hidden rounded-[1.5rem] border border-zinc-800 bg-[linear-gradient(135deg,#111111_0%,#27272a_55%,#0a0a0a_100%)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
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
                        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-zinc-600">
                                Parcelamento
                                <select
                                    value={normalizedInstallmentCount}
                                    onChange={(event) => setInstallmentCount(Number(event.target.value))}
                                    disabled={loading || recoveringPix}
                                    className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/10"
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
                            <p className="mt-3 text-xs leading-relaxed text-zinc-600">
                                {normalizedInstallmentCount === 1
                                    ? "Pagamento a vista no cartao, sem acrescimo."
                                    : normalizedInstallmentCount === 2
                                        ? "Parcelamento em 2x sem acrescimo."
                                        : `Parcelamento em ${normalizedInstallmentCount}x com taxa da Asaas repassada ao comprador.`}
                            </p>
                            <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
                                Escolha entre 1x e 6x. Ate 2x sem acrescimo. De 3x a 6x, a taxa do parcelamento e somada ao total da compra.
                            </p>
                            {hasInstallmentFee ? (
                                <p className="mt-2 text-[11px] leading-relaxed text-zinc-900">
                                    Total no cartao: {formatCurrency(installmentTotalAmount)}. Taxa do parcelamento: {formatCurrency(installmentFeeAmount)}.
                                </p>
                            ) : (
                                <p className="mt-2 text-[11px] leading-relaxed text-zinc-900">
                                    Total no cartao: {formatCurrency(installmentTotalAmount)} sem taxa adicional.
                                </p>
                            )}
                        </div>

                        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-600">Resumo</p>
                            <div className="mt-3 space-y-2 text-sm text-zinc-600">
                                <div className="flex items-center justify-between gap-3">
                                    <span>Total no cartao</span>
                                    <span className="font-semibold text-zinc-950">{formatCurrency(installmentTotalAmount)}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span>Forma</span>
                                    <span className="font-semibold text-zinc-950">Cartao de credito</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span>Parcelas</span>
                                    <span className="font-semibold text-zinc-950">{normalizedInstallmentCount}x</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span>Produto</span>
                                    <span className="font-semibold text-zinc-950">{formatCurrency(checkoutAmount)}</span>
                                </div>
                                {hasInstallmentFee && (
                                    <div className="flex items-center justify-between gap-3">
                                        <span>Taxa do parcelamento</span>
                                        <span className="font-semibold text-zinc-950">{formatCurrency(installmentFeeAmount)}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between gap-3">
                                    <span>Valor por parcela</span>
                                    <span className="font-semibold text-zinc-950">{formatCurrency(installmentValue)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                        <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-zinc-600">
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
            <button
                type="button"
                onClick={handlePayment}
                disabled={loading || recoveringPix}
                className="w-full touch-manipulation rounded-2xl bg-zinc-950 px-6 py-5 text-base font-black uppercase tracking-[0.12em] text-white shadow-[0_16px_36px_rgba(24,24,27,0.24)] transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
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
            </button>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                    Acesso beta por convite
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                    Recebeu um codigo de tester? Troque o modo desta pagina e ative seu acesso sem abrir um checkout novo.
                </p>
                <button
                    type="button"
                    onClick={() => setShowCodeInput(true)}
                    className="mt-4 inline-flex touch-manipulation items-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-800 transition hover:border-zinc-950"
                >
                    Usar codigo de acesso
                </button>
            </div>
        </div>
    );

    const renderErrorContent = () => (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-zinc-950">
            <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-red-700">
                Nao foi possivel preparar esta etapa
            </p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-700">
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
            <div className="mobile-safe-screen flex items-center justify-center bg-zinc-50 p-6 text-zinc-950">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm"
                >
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-950">
                        <Check className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="mb-2 text-3xl font-bold text-zinc-950">Acesso Liberado!</h2>
                    <p className="text-zinc-500">Redirecionando para o QG...</p>
                </motion.div>
            </div>
        );
    }

    if (paymentMode === "already-premium") {
        return (
            <div className="mobile-safe-screen flex items-center justify-center bg-zinc-50 p-6">
                <div className="text-center">
                    <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-zinc-700" />
                    <p className="text-sm text-zinc-500">Redirecionando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mobile-safe-screen overflow-x-hidden bg-zinc-50 text-zinc-950 selection:bg-zinc-950 selection:text-white">
            <nav className="sticky top-0 z-50 flex min-h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur-md sm:px-6">
                <div className="font-bold tracking-tight text-lg text-zinc-950">
                    BASEDSPEAK <span className="text-zinc-500">PRO</span>
                </div>
                <div className="flex items-center gap-2">
                    {isAuthenticated && (
                        <button
                            type="button"
                            onClick={() => navigateSafely(ROUTES.app.dashboard)}
                            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950"
                        >
                            Dashboard
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => navigateSafely(isAuthenticated ? ROUTES.app.dashboard : ROUTES.home)}
                        className="rounded-full px-3 py-2 text-xs uppercase tracking-[0.14em] text-zinc-500 transition hover:text-zinc-950"
                    >
                        Voltar
                    </button>
                </div>
            </nav>

            <main className="px-4 py-8 pb-[max(3rem,env(safe-area-inset-bottom))] sm:px-6 lg:py-12">
                <div className="relative mx-auto mb-8 max-w-4xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-700">
                            <Shield className="w-3 h-3" />
                            Missão Fase 1 Concluída
                        </div>

                        <h1 className="mb-4 text-3xl font-black leading-tight tracking-tight text-zinc-950 md:text-5xl">
                            VOCÊ PROVOU SEU VALOR.<br />
                            <span className="text-zinc-500">
                                AGORA O JOGO MUDOU.
                            </span>
                        </h1>

                        <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-600 md:text-lg">
                            Seu desempenho no Pilar 1 desbloqueou uma condição única para acessar o
                            protocolo completo de fluência da BasedSpeak.
                        </p>
                    </motion.div>
                </div>

                <div className="hidden">
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

                <div className="hidden">
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

                <div id="offer" className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
                    <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5 text-left shadow-sm sm:p-8 md:p-10">
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-zinc-950/10" />

                        <div className="relative z-10">
                            <div className="mb-6 inline-block rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-700">
                                <Zap className="mr-2 inline h-3 w-3 text-zinc-700" fill="currentColor" />
                                {isSpecialtyTestMode ? "Modo de Teste • Especialidade" : "Desconto por Recorde no Pilar 1"}
                            </div>

                            <div className="mb-8 lg:hidden">
                                <p className="mb-2 text-lg text-zinc-500 line-through">
                                    {isSpecialtyTestMode ? "Valor de teste" : "De R$ 997,00 por"}
                                </p>
                                <h2 className="text-6xl font-black tracking-tighter text-zinc-950 md:text-8xl">
                                    <span className="mr-1 align-top text-2xl font-bold text-zinc-500">R$</span>
                                    {isSpecialtyTestMode ? "50" : "297"}
                                </h2>
                                <p className="mt-4 text-sm uppercase tracking-[0.14em] text-zinc-500">
                                    {isSpecialtyTestMode ? "Compra de Especialidade • Pagamento Único" : "Acesso Premium • Pagamento Único"}
                                </p>
                            </div>

                            <ul className="mb-8 max-w-md space-y-4 text-left text-zinc-700 lg:hidden">
                                <li className="flex items-center gap-3">
                                    <Check className="h-5 w-5 flex-shrink-0 text-zinc-950" />
                                    <span>Jornada premium liberada conforme sua progressão</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="h-5 w-5 flex-shrink-0 text-zinc-950" />
                                    <span>Conteúdo principal já utilizável nesta fase</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="h-5 w-5 flex-shrink-0 text-zinc-950" />
                                    <span>Novas etapas adicionadas com a evolução da plataforma</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="h-5 w-5 flex-shrink-0 text-zinc-950" />
                                    <span>Liberação controlada e acompanhamento do seu avanço</span>
                                </li>
                            </ul>

                            {paymentMode === "pending-payment" && pixExpired && !qrCodeData && (
                                <div className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                                    <AlertCircle className="w-4 h-4" />
                                    Seu PIX expirou. Gere um novo para continuar.
                                </div>
                            )}

                            {error && (
                                <div className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            {activeInlineError && hasAttemptedSubmit && (
                                <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-left text-sm text-amber-800">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-900">
                                        Revise os campos marcados
                                    </p>
                                    <p className="mt-1 leading-relaxed">
                                        Corrija primeiro o campo destacado. Depois disso, tente finalizar novamente.
                                    </p>
                                </div>
                            )}

                            {paymentMode === "loading-reconciliation" && recoveringPix && !paymentId && (
                                <div className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600">
                                    <Loader2 className="w-4 h-4 animate-spin text-zinc-700" />
                                    Recuperando seu pagamento atual...
                                </div>
                            )}

                            {(paymentMode === "manual-reconciliation" || paymentMode === "unresolved-payment") && reconciliationMessage && (
                                <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-left text-sm text-amber-800">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-900">
                                        Checkout sob revisao
                                    </p>
                                    <p className="mt-1 leading-relaxed">
                                        {reconciliationMessage}
                                    </p>
                                </div>
                            )}
                            {renderPaymentModeContent()}

                            <div className="mt-4 flex flex-col items-center justify-center gap-2 text-[10px] uppercase tracking-[0.14em] text-zinc-500 sm:flex-row">
                                <Lock className="w-3 h-3" />
                                Ambiente Criptografado 256-bit
                            </div>
                        </div>
	                    </div>
	
	                    <aside className="hidden lg:block lg:sticky lg:top-24">
	                        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
	                            <p className="text-sm text-zinc-500 line-through">
	                                {isSpecialtyTestMode ? "Valor de teste" : "De R$ 997,00 por"}
	                            </p>
	                            <div className="mt-2 flex items-end gap-1">
	                                <span className="pb-2 text-lg font-bold text-zinc-500">R$</span>
	                                <span className="text-6xl font-black tracking-tight text-zinc-950">
	                                    {isSpecialtyTestMode ? "50" : "297"}
	                                </span>
	                            </div>
	                            <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
	                                {isSpecialtyTestMode ? "Compra de Especialidade • Pagamento Único" : "Acesso Premium • Pagamento Único"}
	                            </p>
	
	                            <ul className="mt-6 space-y-4 text-sm leading-relaxed text-zinc-700">
	                                <li className="flex items-start gap-3">
	                                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-zinc-950" />
	                                    <span>Jornada premium liberada conforme sua progressão</span>
	                                </li>
	                                <li className="flex items-start gap-3">
	                                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-zinc-950" />
	                                    <span>Conteúdo principal já utilizável nesta fase</span>
	                                </li>
	                                <li className="flex items-start gap-3">
	                                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-zinc-950" />
	                                    <span>Novas etapas adicionadas com a evolução da plataforma</span>
	                                </li>
	                                <li className="flex items-start gap-3">
	                                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-zinc-950" />
	                                    <span>Liberação controlada e acompanhamento do seu avanço</span>
	                                </li>
	                            </ul>
	
	                            <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
	                                <div className="flex items-center gap-3">
	                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-sm font-bold text-white">C</div>
	                                    <div>
	                                        <p className="text-sm font-bold text-zinc-950">Carlos M.</p>
	                                        <p className="text-xs text-zinc-500">Engenheiro de Software</p>
	                                    </div>
	                                </div>
	                                <p className="mt-3 text-sm leading-relaxed text-zinc-600">
	                                    &quot;O método desbloqueou meu inglês em 3 meses. Consegui minha vaga internacional hoje.&quot;
	                                </p>
	                                <div className="mt-3 flex gap-1">
	                                    {[...Array(5)].map((_, i) => (
	                                        <Star key={i} className="h-4 w-4 text-zinc-950" fill="currentColor" />
	                                    ))}
	                                </div>
	                            </div>
	                        </div>
	                    </aside>
	
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

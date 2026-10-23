export type PaymentMode =
    | "unauthenticated"
    | "invite-mode"
    | "pending-payment"
    | "manual-reconciliation"
    | "unresolved-payment"
    | "new-checkout"
    | "already-premium"
    | "loading-reconciliation"
    | "error";

import type { PaymentReconciliationState } from "@/contracts/payments";
export type { PaymentReconciliationState, VerifyPaymentApiResponse } from "@/contracts/payments";

export type ResolvePaymentModeInput = {
    isAuthenticated: boolean;
    isAuthLoading: boolean;
    isPremium: boolean;
    inviteRequested: boolean;
    hasPendingPayment: boolean;
    isRecoveringPayment: boolean;
    reconciliationState?: PaymentReconciliationState | null;
    hasFatalError?: boolean;
};

export function resolvePaymentMode({
    isAuthenticated,
    isAuthLoading,
    isPremium,
    inviteRequested,
    hasPendingPayment,
    isRecoveringPayment,
    reconciliationState,
    hasFatalError = false,
}: ResolvePaymentModeInput): PaymentMode {
    if (isPremium) {
        return "already-premium";
    }

    if (hasFatalError) {
        return "error";
    }

    if (reconciliationState === "manual-reconciliation") {
        return "manual-reconciliation";
    }

    if (reconciliationState === "unresolved") {
        return "unresolved-payment";
    }

    if (inviteRequested) {
        return "invite-mode";
    }

    if (hasPendingPayment) {
        return "pending-payment";
    }

    if (isAuthLoading || isRecoveringPayment) {
        return "loading-reconciliation";
    }

    if (!isAuthenticated) {
        return "unauthenticated";
    }

    return "new-checkout";
}

export function buildPaymentReturnTo(search: string | null | undefined) {
    const normalizedSearch = search?.trim();

    return normalizedSearch ? `/pagamento?${normalizedSearch}` : "/pagamento";
}

export function getReconciliationMessage(
    state: PaymentReconciliationState | null | undefined,
    message?: string
) {
    if (message?.trim()) {
        return message.trim();
    }

    switch (state) {
        case "manual-reconciliation":
            return "Identificamos um pagamento que precisa de conferencia manual. Nao abra uma nova cobranca agora. Volte mais tarde ou acompanhe com o time.";
        case "unresolved":
            return "Nao foi possivel confirmar esta cobranca com seguranca. Mantivemos o checkout em analise para evitar duplicidade.";
        case "error":
            return "Nao foi possivel consultar o estado do pagamento agora. Tente novamente em instantes.";
        default:
            return "";
    }
}

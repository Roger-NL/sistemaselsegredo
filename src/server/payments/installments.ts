export const MAX_CHECKOUT_INSTALLMENTS = 6;
export const FREE_INSTALLMENT_LIMIT = 2;
export const CARD_FIXED_FEE = 0.49;

type InstallmentRateTier = {
  maxInstallments: number;
  rate: number;
};

const INSTALLMENT_RATE_TIERS: InstallmentRateTier[] = [
  { maxInstallments: 6, rate: 0.0349 },
  { maxInstallments: 12, rate: 0.0399 },
];

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function getInstallmentRate(installmentCount: number) {
  if (installmentCount <= FREE_INSTALLMENT_LIMIT) {
    return 0;
  }

  const tier = INSTALLMENT_RATE_TIERS.find(({ maxInstallments }) => installmentCount <= maxInstallments);
  return tier?.rate ?? INSTALLMENT_RATE_TIERS[INSTALLMENT_RATE_TIERS.length - 1].rate;
}

export function calculateCheckoutInstallmentTotals(baseAmount: number, installmentCount: number) {
  const normalizedInstallmentCount = Math.min(
    MAX_CHECKOUT_INSTALLMENTS,
    Math.max(1, Math.trunc(installmentCount))
  );
  const feeRate = getInstallmentRate(normalizedInstallmentCount);
  const hasFee = normalizedInstallmentCount > FREE_INSTALLMENT_LIMIT && feeRate > 0;
  const totalAmount = hasFee
    ? roundCurrency((baseAmount + CARD_FIXED_FEE) / (1 - feeRate))
    : roundCurrency(baseAmount);
  const feeAmount = roundCurrency(totalAmount - baseAmount);
  const installmentAmount = roundCurrency(totalAmount / normalizedInstallmentCount);

  return {
    installmentCount: normalizedInstallmentCount,
    installmentAmount,
    totalAmount,
    feeAmount,
    feeRate,
    hasFee,
  };
}

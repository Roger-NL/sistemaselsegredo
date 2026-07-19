export const PAYMENTS_DISABLED_DURING_BETA = "PAYMENTS_DISABLED_DURING_BETA";

export class PaymentsDisabledError extends Error {
  status = 403;
  code = PAYMENTS_DISABLED_DURING_BETA;

  constructor() {
    super(PAYMENTS_DISABLED_DURING_BETA);
    this.name = "PaymentsDisabledError";
  }
}

/**
 * Fail closed: paid flows are enabled only through the explicit value `false`.
 */
export function isBetaFreeMode() {
  return process.env.BETA_FREE_MODE?.trim().toLowerCase() !== "false";
}

export function assertPaymentsEnabled() {
  if (isBetaFreeMode()) {
    throw new PaymentsDisabledError();
  }
}

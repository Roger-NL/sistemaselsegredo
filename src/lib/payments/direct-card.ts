export interface DirectCardFormData {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
  postalCode: string;
  addressNumber: string;
  addressComplement: string;
  phone: string;
}

export const EMPTY_DIRECT_CARD_FORM: DirectCardFormData = {
  holderName: "",
  number: "",
  expiryMonth: "",
  expiryYear: "",
  ccv: "",
  postalCode: "",
  addressNumber: "",
  addressComplement: "",
  phone: "",
};

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function formatCardNumber(value: string) {
  return digitsOnly(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

export function formatExpiryMonth(value: string) {
  return digitsOnly(value).slice(0, 2);
}

export function formatExpiryYear(value: string) {
  return digitsOnly(value).slice(0, 4);
}

export function formatCvv(value: string) {
  return digitsOnly(value).slice(0, 4);
}

export function formatPostalCode(value: string) {
  const digits = digitsOnly(value).slice(0, 8);
  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function formatPhone(value: string) {
  const digits = digitsOnly(value).slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function getDirectCardValidationError(form: DirectCardFormData) {
  if (form.holderName.trim().length < 3) {
    return "Informe o nome impresso no cartao.";
  }

  if (digitsOnly(form.number).length < 13) {
    return "Informe um numero de cartao valido.";
  }

  if (digitsOnly(form.expiryMonth).length !== 2) {
    return "Informe o mes de validade com 2 digitos.";
  }

  const month = Number(digitsOnly(form.expiryMonth));
  if (!Number.isFinite(month) || month < 1 || month > 12) {
    return "Mes de validade invalido.";
  }

  if (digitsOnly(form.expiryYear).length < 2) {
    return "Informe o ano de validade.";
  }

  if (digitsOnly(form.ccv).length < 3) {
    return "Informe o codigo de seguranca do cartao.";
  }

  if (digitsOnly(form.postalCode).length !== 8) {
    return "Informe um CEP valido.";
  }

  if (!form.addressNumber.trim()) {
    return "Informe o numero do endereco.";
  }

  if (digitsOnly(form.phone).length < 10) {
    return "Informe um telefone com DDD.";
  }

  return null;
}

export function buildDirectCardPayload(form: DirectCardFormData) {
  const expiryYearDigits = digitsOnly(form.expiryYear);
  const normalizedExpiryYear =
    expiryYearDigits.length === 2 ? `20${expiryYearDigits}` : expiryYearDigits.slice(0, 4);
  const normalizedPhone = digitsOnly(form.phone);

  return {
    card: {
      holderName: form.holderName.trim(),
      number: digitsOnly(form.number),
      expiryMonth: digitsOnly(form.expiryMonth).slice(0, 2),
      expiryYear: normalizedExpiryYear,
      ccv: digitsOnly(form.ccv).slice(0, 4),
    },
    postalCode: digitsOnly(form.postalCode).slice(0, 8),
    addressNumber: form.addressNumber.trim(),
    addressComplement: form.addressComplement.trim() || null,
    phone: normalizedPhone || undefined,
    mobilePhone: normalizedPhone || undefined,
  };
}

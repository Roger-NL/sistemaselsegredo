"use client";

import type { DirectCardFormData } from "@/lib/payments/direct-card";
import {
  formatCardNumber,
  formatCvv,
  formatExpiryMonth,
  formatExpiryYear,
  formatPhone,
  formatPostalCode,
} from "@/lib/payments/direct-card";

interface DirectCardFormProps {
  value: DirectCardFormData;
  onChange: (value: DirectCardFormData) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function DirectCardForm({ value, onChange, disabled = false, compact = false }: DirectCardFormProps) {
  const inputClassName = compact
    ? "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
    : "w-full rounded-xl border border-white/10 bg-black/40 p-4 text-white outline-none transition-all focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400";
  const labelClassName = compact
    ? "block text-xs uppercase tracking-[0.22em] text-slate-400"
    : "block text-xs font-bold uppercase tracking-widest text-slate-400";

  const updateField = <K extends keyof DirectCardFormData>(field: K, nextValue: DirectCardFormData[K]) => {
    onChange({ ...value, [field]: nextValue });
  };

  return (
    <div className="space-y-4">
      <label className={labelClassName}>
        Nome no cartao
        <input
          value={value.holderName}
          onChange={(event) => updateField("holderName", event.target.value)}
          className={inputClassName}
          placeholder="Nome como aparece no cartao"
          disabled={disabled}
        />
      </label>

      <label className={labelClassName}>
        Numero do cartao
        <input
          value={value.number}
          onChange={(event) => updateField("number", formatCardNumber(event.target.value))}
          className={inputClassName}
          placeholder="0000 0000 0000 0000"
          inputMode="numeric"
          autoComplete="cc-number"
          disabled={disabled}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className={labelClassName}>
          Mes
          <input
            value={value.expiryMonth}
            onChange={(event) => updateField("expiryMonth", formatExpiryMonth(event.target.value))}
            className={inputClassName}
            placeholder="MM"
            inputMode="numeric"
            autoComplete="cc-exp-month"
            disabled={disabled}
          />
        </label>

        <label className={labelClassName}>
          Ano
          <input
            value={value.expiryYear}
            onChange={(event) => updateField("expiryYear", formatExpiryYear(event.target.value))}
            className={inputClassName}
            placeholder="AAAA"
            inputMode="numeric"
            autoComplete="cc-exp-year"
            disabled={disabled}
          />
        </label>

        <label className={labelClassName}>
          CVV
          <input
            value={value.ccv}
            onChange={(event) => updateField("ccv", formatCvv(event.target.value))}
            className={inputClassName}
            placeholder="123"
            inputMode="numeric"
            autoComplete="cc-csc"
            disabled={disabled}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClassName}>
          CEP
          <input
            value={value.postalCode}
            onChange={(event) => updateField("postalCode", formatPostalCode(event.target.value))}
            className={inputClassName}
            placeholder="00000-000"
            inputMode="numeric"
            autoComplete="postal-code"
            disabled={disabled}
          />
        </label>

        <label className={labelClassName}>
          Numero
          <input
            value={value.addressNumber}
            onChange={(event) => updateField("addressNumber", event.target.value)}
            className={inputClassName}
            placeholder="123"
            autoComplete="address-line2"
            disabled={disabled}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClassName}>
          Complemento
          <input
            value={value.addressComplement}
            onChange={(event) => updateField("addressComplement", event.target.value)}
            className={inputClassName}
            placeholder="Apto, bloco, sala"
            autoComplete="address-line2"
            disabled={disabled}
          />
        </label>

        <label className={labelClassName}>
          Telefone
          <input
            value={value.phone}
            onChange={(event) => updateField("phone", formatPhone(event.target.value))}
            className={inputClassName}
            placeholder="(11) 99999-9999"
            inputMode="tel"
            autoComplete="tel"
            disabled={disabled}
          />
        </label>
      </div>
    </div>
  );
}

"use client";

import type { DirectCardField, DirectCardFieldErrors, DirectCardFormData } from "@/lib/payments/direct-card";
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
  hideHolderName?: boolean;
  hidePhone?: boolean;
  errors?: DirectCardFieldErrors;
  inputRefs?: Partial<Record<DirectCardField, (element: HTMLInputElement | null) => void>>;
}

export function DirectCardForm({
  value,
  onChange,
  disabled = false,
  compact = false,
  hideHolderName = false,
  hidePhone = false,
  errors = {},
  inputRefs,
}: DirectCardFormProps) {
  const baseInputClassName = compact
    ? "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
    : "w-full rounded-xl border border-white/10 bg-black/40 p-4 text-white outline-none transition-all focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400";
  const labelClassName = compact
    ? "block text-xs uppercase tracking-[0.22em] text-slate-400"
    : "block text-xs font-bold uppercase tracking-widest text-slate-400";

  const getInputClassName = (field: DirectCardField) =>
    `${baseInputClassName} ${errors[field] ? "border-rose-500 focus:border-rose-400 focus:ring-rose-400/40" : ""}`;

  const updateField = <K extends keyof DirectCardFormData>(field: K, nextValue: DirectCardFormData[K]) => {
    onChange({ ...value, [field]: nextValue });
  };

  return (
    <div className="space-y-4">
      {!hideHolderName && (
        <label className={labelClassName}>
          Nome no cartao
          <input
            value={value.holderName}
            onChange={(event) => updateField("holderName", event.target.value)}
            className={getInputClassName("holderName")}
            placeholder="Nome como aparece no cartao"
            autoComplete="cc-name"
            disabled={disabled}
            ref={inputRefs?.holderName}
          />
          {errors.holderName && <p className="mt-2 text-[11px] text-rose-300">{errors.holderName}</p>}
        </label>
      )}

      <label className={labelClassName}>
        Numero do cartao
        <input
          value={value.number}
          onChange={(event) => updateField("number", formatCardNumber(event.target.value))}
          className={getInputClassName("number")}
          placeholder="0000 0000 0000 0000"
          inputMode="numeric"
          autoComplete="cc-number"
          disabled={disabled}
          ref={inputRefs?.number}
        />
        {errors.number && <p className="mt-2 text-[11px] text-rose-300">{errors.number}</p>}
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className={labelClassName}>
          Mes
          <input
            value={value.expiryMonth}
            onChange={(event) => updateField("expiryMonth", formatExpiryMonth(event.target.value))}
            className={getInputClassName("expiryMonth")}
            placeholder="MM"
            inputMode="numeric"
            autoComplete="cc-exp-month"
            disabled={disabled}
            ref={inputRefs?.expiryMonth}
          />
          {errors.expiryMonth && <p className="mt-2 text-[11px] text-rose-300">{errors.expiryMonth}</p>}
        </label>

        <label className={labelClassName}>
          Ano
          <input
            value={value.expiryYear}
            onChange={(event) => updateField("expiryYear", formatExpiryYear(event.target.value))}
            className={getInputClassName("expiryYear")}
            placeholder="AAAA"
            inputMode="numeric"
            autoComplete="cc-exp-year"
            disabled={disabled}
            ref={inputRefs?.expiryYear}
          />
          {errors.expiryYear && <p className="mt-2 text-[11px] text-rose-300">{errors.expiryYear}</p>}
        </label>

        <label className={labelClassName}>
          CVV
          <input
            value={value.ccv}
            onChange={(event) => updateField("ccv", formatCvv(event.target.value))}
            className={getInputClassName("ccv")}
            placeholder="123"
            inputMode="numeric"
            autoComplete="cc-csc"
            disabled={disabled}
            ref={inputRefs?.ccv}
          />
          {errors.ccv && <p className="mt-2 text-[11px] text-rose-300">{errors.ccv}</p>}
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClassName}>
          CEP
          <input
            value={value.postalCode}
            onChange={(event) => updateField("postalCode", formatPostalCode(event.target.value))}
            className={getInputClassName("postalCode")}
            placeholder="00000-000"
            inputMode="numeric"
            autoComplete="postal-code"
            disabled={disabled}
            ref={inputRefs?.postalCode}
          />
          {errors.postalCode && <p className="mt-2 text-[11px] text-rose-300">{errors.postalCode}</p>}
        </label>

        <label className={labelClassName}>
          Numero
          <input
            value={value.addressNumber}
            onChange={(event) => updateField("addressNumber", event.target.value)}
            className={getInputClassName("addressNumber")}
            placeholder="123"
            autoComplete="address-line2"
            disabled={disabled}
            ref={inputRefs?.addressNumber}
          />
          {errors.addressNumber && <p className="mt-2 text-[11px] text-rose-300">{errors.addressNumber}</p>}
        </label>
      </div>

      <div className={`grid gap-4 ${hidePhone ? "" : "sm:grid-cols-2"}`}>
        <label className={labelClassName}>
          Complemento
          <input
            value={value.addressComplement}
            onChange={(event) => updateField("addressComplement", event.target.value)}
            className={getInputClassName("addressComplement")}
            placeholder="Apto, bloco, sala"
            autoComplete="address-line2"
            disabled={disabled}
            ref={inputRefs?.addressComplement}
          />
          {errors.addressComplement && <p className="mt-2 text-[11px] text-rose-300">{errors.addressComplement}</p>}
        </label>

        {!hidePhone && (
          <label className={labelClassName}>
            Telefone
            <input
              value={value.phone}
              onChange={(event) => updateField("phone", formatPhone(event.target.value))}
              className={getInputClassName("phone")}
              placeholder="(11) 99999-9999"
              inputMode="tel"
              autoComplete="tel"
              disabled={disabled}
              ref={inputRefs?.phone}
            />
            {errors.phone && <p className="mt-2 text-[11px] text-rose-300">{errors.phone}</p>}
          </label>
        )}
      </div>
    </div>
  );
}

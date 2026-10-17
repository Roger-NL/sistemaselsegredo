"use client";

import { useId, useState, type FormEvent } from "react";
import {
  useVisitorName,
  saveVisitorName,
  forgetVisitorName,
} from "@/lib/welcome/use-visitor-name";
import {
  normalizeVisitorName,
  visitorNameError,
} from "@/lib/welcome/visitor-name";
import { getOrbitUiCopy } from "@/app/inicio-orbita-7k3/ui-copy";
import type { LearningLanguage } from "@/app/inicio-orbita-7k3/language";

export function VisitorNameSettings({
  language = "pt",
  onSaved,
  onRestart,
}: {
  language?: LearningLanguage;
  onSaved?: (name: string) => void;
  onRestart?: () => void;
}) {
  const copy = getOrbitUiCopy(language);
  const rememberedName = useVisitorName();
  const [notice, setNotice] = useState("");
  if (rememberedName === undefined)
    return <p className="text-sm text-stone-500">{copy.nameSettingsLoading}</p>;
  return (
    <>
      <NameForm
        key={rememberedName ?? "new"}
        initialName={rememberedName ?? ""}
        copy={copy}
        onEditing={() => setNotice("")}
        onSaved={(name) => {
          setNotice(copy.nameSaved);
          onSaved?.(name);
        }}
      />
      <div className="mt-6 border-t border-stone-200 pt-5">
        <p className="text-sm font-medium text-stone-900">{copy.otherPath}</p>
        <p className="mt-1 text-xs leading-relaxed text-stone-500">
          {copy.restartDescription}
        </p>
        <button
          type="button"
          className="mt-3 min-h-11 rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-900 hover:bg-stone-50"
          onClick={onRestart}
        >
          {copy.restart}
        </button>
      </div>
      {rememberedName && (
        <button
          type="button"
          className="mt-4 min-h-11 text-xs text-stone-500 underline underline-offset-4"
          onClick={() =>
            setNotice(
              forgetVisitorName()
                ? copy.nameRemoved
                : copy.nameRemoveError,
            )
          }
        >
          {copy.forget}
        </button>
      )}
      <p role="status" className="mt-3 text-sm text-stone-600">
        {notice}
      </p>
    </>
  );
}

function NameForm({
  initialName,
  copy,
  onSaved,
  onEditing,
}: {
  initialName: string;
  copy: ReturnType<typeof getOrbitUiCopy>;
  onEditing: () => void;
  onSaved?: (name: string) => void;
}) {
  const id = useId();
  const [value, setValue] = useState(initialName);
  const [error, setError] = useState("");
  function submit(event: FormEvent) {
    event.preventDefault();
    const invalid = visitorNameError(value);
    if (invalid) {
      setError(!value.trim() ? copy.nameRequired : value.length > 60 ? copy.nameTooLong : copy.nameInvalid);
      return;
    }
    const name = normalizeVisitorName(value);
    if (!saveVisitorName(name)) {
      setError(
        copy.nameSettingsError,
      );
      return;
    }
    setError("");
    onSaved?.(name);
  }
  return (
    <form onSubmit={submit} className="space-y-4 text-stone-900">
      <div>
        <label htmlFor={id} className="mb-2 block text-sm font-medium">
          {copy.nameLabelSettings}
        </label>
        <input
          id={id}
          name="preferredName"
          autoComplete="given-name"
          maxLength={60}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError("");
            onEditing();
          }}
          aria-invalid={!!error}
          aria-describedby={`${id}-hint ${id}-status`}
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900"
          placeholder={copy.yourName}
          required
        />
        <p
          id={`${id}-hint`}
          className="mt-2 text-xs leading-relaxed text-stone-500"
        >
          {copy.nameSettingsHint}
        </p>
      </div>
      <button
        type="submit"
        className="min-h-11 rounded-xl bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700"
      >
        {copy.saveName}
      </button>
      <p
        id={`${id}-status`}
        role="status"
        className={`text-sm ${error ? "text-red-700" : "text-stone-600"}`}
      >
        {error}
      </p>
    </form>
  );
}

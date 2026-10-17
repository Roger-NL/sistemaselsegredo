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

export function VisitorNameSettings({
  onSaved,
  onRestart,
}: {
  onSaved?: (name: string) => void;
  onRestart?: () => void;
}) {
  const rememberedName = useVisitorName();
  const [notice, setNotice] = useState("");
  if (rememberedName === undefined)
    return <p className="text-sm text-stone-500">Carregando preferências…</p>;
  return (
    <>
      <NameForm
        key={rememberedName ?? "new"}
        initialName={rememberedName ?? ""}
        onEditing={() => setNotice("")}
        onSaved={(name) => {
          setNotice("Nome salvo.");
          onSaved?.(name);
        }}
      />
      <div className="mt-6 border-t border-stone-200 pt-5">
        <p className="text-sm font-medium text-stone-900">Outro caminho?</p>
        <p className="mt-1 text-xs leading-relaxed text-stone-500">
          Recomece esta conversa para escolher outra situação ou dificuldade. O nome salvo neste navegador será mantido.
        </p>
        <button
          type="button"
          className="mt-3 min-h-11 rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-900 hover:bg-stone-50"
          onClick={onRestart}
        >
          Recomeçar conversa
        </button>
      </div>
      {rememberedName && (
        <button
          type="button"
          className="mt-4 min-h-11 text-xs text-stone-500 underline underline-offset-4"
          onClick={() =>
            setNotice(
              forgetVisitorName()
                ? "Nome removido. Na próxima visita, vou perguntar novamente."
                : "Não foi possível remover o nome neste navegador.",
            )
          }
        >
          Esquecer nome neste navegador
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
  onSaved,
  onEditing,
}: {
  initialName: string;
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
      setError(invalid);
      return;
    }
    const name = normalizeVisitorName(value);
    if (!saveVisitorName(name)) {
      setError(
        "Não foi possível salvar neste navegador. Verifique as permissões de armazenamento e tente novamente.",
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
          Como você quer ser chamado?
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
          placeholder="Seu nome"
          required
        />
        <p
          id={`${id}-hint`}
          className="mt-2 text-xs leading-relaxed text-stone-500"
        >
          Usado nas boas-vindas e salvo neste navegador. Você pode mudar quando
          quiser.
        </p>
      </div>
      <button
        type="submit"
        className="min-h-11 rounded-xl bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700"
      >
        Salvar nome
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

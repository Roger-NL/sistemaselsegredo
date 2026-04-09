"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CalendarX2,
  CheckCircle2,
  Clock3,
  Crown,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/lib/routes";
import type {
  LiveSessionAvailabilitySlot,
  LiveSessionStatusPayload,
} from "@/lib/scheduling/types";
import { PremiumWall } from "@/features/subscription/PremiumWall";

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SchedulingPageClient() {
  const router = useRouter();
  const { user, subscriptionStatus, isLoading, refreshUser } = useAuth();
  const [status, setStatus] = useState<LiveSessionStatusPayload | null>(null);
  const [slots, setSlots] = useState<LiveSessionAvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] =
    useState<LiveSessionAvailabilitySlot | null>(null);
  const [notes, setNotes] = useState("");
  const [loadingState, setLoadingState] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadStatus = useCallback(async () => {
    if (!user?.id) return;

    setLoadingState(true);
    setError("");

    try {
      const response = await fetch(`/api/scheduling/status?userId=${user.id}`, {
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Falha ao carregar agendamento.");
      }

      setStatus(payload);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Falha ao carregar agendamento.";
      setError(message);
    } finally {
      setLoadingState(false);
    }
  }, [user?.id]);

  const loadSlots = useCallback(async () => {
    if (!user?.id) return;

    setLoadingSlots(true);

    try {
      const response = await fetch(
        `/api/scheduling/availability?userId=${user.id}`,
        { cache: "no-store" }
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Falha ao carregar horários.");
      }

      setSlots(payload.slots || []);
    } catch (slotError) {
      const message =
        slotError instanceof Error
          ? slotError.message
          : "Falha ao carregar horários.";
      setError(message);
    } finally {
      setLoadingSlots(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    if (status?.canRequestScheduling) {
      loadSlots();
    } else {
      setSlots([]);
      setSelectedSlot(null);
    }
  }, [loadSlots, status?.canRequestScheduling]);

  useEffect(() => {
    if (
      !status?.session ||
      !["pending_confirmation", "confirmed"].includes(status.session.status)
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      loadStatus();
      refreshUser();
    }, 15000);

    return () => window.clearInterval(timer);
  }, [loadStatus, refreshUser, status?.session]);

  const handleRequest = async () => {
    if (!user?.id || !selectedSlot) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/scheduling/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          slotStart: selectedSlot.start,
          slotEnd: selectedSlot.end,
          notes,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Falha ao enviar pedido.");
      }

      setSelectedSlot(null);
      setNotes("");
      await loadStatus();
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Falha ao enviar pedido.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!user?.id) return;

    const confirmed = window.confirm(
      "Deseja cancelar esse agendamento e voltar para a escolha de horário?"
    );

    if (!confirmed) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/scheduling/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Falha ao cancelar agendamento.");
      }

      await loadStatus();
    } catch (cancelError) {
      const message =
        cancelError instanceof Error
          ? cancelError.message
          : "Falha ao cancelar agendamento.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const headline = useMemo(() => {
    if (!status?.session) return "Sua área de agendamentos já está pronta";

    switch (status.session.status) {
      case "awaiting_release_window":
        return "A sessão já foi liberada, mas os horários abrem no momento certo";
      case "ready_to_schedule":
        return "Sua primeira aula ao vivo já pode ser pedida";
      case "pending_confirmation":
        return "Seu pedido foi enviado para confirmação";
      case "confirmed":
        return "Sua aula ao vivo está confirmada";
      default:
        return "Acompanhe sua sessão ao vivo";
    }
  }, [status?.session]);

  if (isLoading || loadingState) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (subscriptionStatus !== "premium") {
    return <PremiumWall />;
  }

  return (
    <div className="min-h-screen min-h-[100dvh] p-4 md:p-8 text-white">
      <div className="max-w-5xl mx-auto space-y-6 pb-24">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-emerald-200">
              <Crown className="w-3.5 h-3.5" />
              Premium
            </div>
            <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
              Agendamentos
            </h1>
            <p className="mt-2 max-w-3xl text-white/65 leading-relaxed">
              Aqui você acompanha a sessão ao vivo da sua jornada, vê quando ela
              libera, pede horário e confere tudo o que já ficou marcado.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push(ROUTES.app.dashboard)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Voltar ao dashboard
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(12,12,18,0.96),rgba(14,23,34,0.94),rgba(9,34,28,0.92))] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                <CalendarClock className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-200/80">
                  Sua próxima etapa ao vivo
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  {headline}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  {status?.waitingReason ||
                    "Assim que a etapa certa for aprovada, essa área deixa de ser passiva e vira o seu painel real de acompanhamento."}
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                  Status atual
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {status?.session
                    ? status.session.status.replaceAll("_", " ")
                    : "aguardando aprovação do Pilar 2"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                  Primeira janela possível
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {formatDateTime(status?.earliestScheduleAt || undefined)}
                </p>
              </div>
            </div>

            {status?.session?.requestedSlotStart && (
              <div className="mt-5 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-violet-200">
                      Horário atual
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {formatDateTime(status.session.requestedSlotStart)}
                    </p>
                    <p className="mt-1 text-sm text-white/60">
                      até {formatDateTime(status.session.requestedSlotEnd)}
                    </p>
                  </div>

                  {status.session.calendarHtmlLink && (
                    <a
                      href={status.session.calendarHtmlLink}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-violet-300/20 bg-white/5 px-4 py-3 text-sm text-violet-100 transition hover:bg-white/10"
                    >
                      Abrir no Google Calendar
                    </a>
                  )}
                </div>
              </div>
            )}

            {status?.canManageCurrentBooking && (
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/15 disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CalendarX2 className="w-4 h-4" />
                  )}
                  Cancelar / remarcar
                </button>

                <button
                  type="button"
                  onClick={loadStatus}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75 transition hover:bg-white/10"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Atualizar status
                </button>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-white/10 bg-black/25 p-6">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">
              O que acontece daqui para frente
            </p>
            <div className="mt-5 space-y-4">
              {[
                "Você conclui o Pilar 2 e a equipe aprova sua etapa.",
                "A primeira aula ao vivo fica liberada na sua conta.",
                "Você escolhe um horário válido já dentro da janela segura da compra.",
                "O tutor confirma esse horário pelo Google Calendar.",
                "Depois da confirmação, o Pilar 3 segue liberado para você continuar.",
              ].map((item, index) => (
                <div key={item} className="flex gap-3 text-sm text-white/70">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[11px] font-bold text-white/60">
                    {index + 1}
                  </div>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {status?.canRequestScheduling && (
          <section className="rounded-3xl border border-white/10 bg-black/25 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-200/80">
                  Escolha seu horário
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  Horários válidos para a sua conta
                </h2>
                <p className="mt-2 text-sm text-white/60">
                  Você vê só os horários que realmente estão livres e já obedecem
                  a janela segura da compra.
                </p>
              </div>

              <button
                type="button"
                onClick={loadSlots}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75 transition hover:bg-white/10"
              >
                <RefreshCcw
                  className={`w-4 h-4 ${loadingSlots ? "animate-spin" : ""}`}
                />
                Atualizar horários
              </button>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {slots.map((slot) => {
                const selected = selectedSlot?.start === slot.start;

                return (
                  <button
                    key={slot.start}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-emerald-300/50 bg-emerald-400/10 shadow-[0_0_30px_rgba(16,185,129,0.12)]"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {slot.label}
                        </p>
                        <p className="mt-1 text-xs text-white/45">
                          {slot.timezone}
                        </p>
                      </div>
                      {selected ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                      ) : (
                        <CalendarDays className="w-5 h-5 text-white/35" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {!loadingSlots && slots.length === 0 && (
              <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-100">
                Ainda não encontramos horários disponíveis para esta janela. Se a
                integração do Google Calendar ainda não estiver configurada, esse
                bloco permanece vazio até a operação liberar a agenda real.
              </div>
            )}

            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <label className="text-[10px] uppercase tracking-[0.24em] text-white/35">
                  Observação opcional
                </label>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Se quiser, deixe um recado curto sobre sua disponibilidade ou contexto."
                  className="mt-2 h-28 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-emerald-400/40"
                />
              </div>

              <button
                type="button"
                onClick={handleRequest}
                disabled={!selectedSlot || submitting}
                className="inline-flex h-fit items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
                Solicitar este horário
              </button>
            </div>
          </section>
        )}

        {status?.session?.status === "confirmed" && (
          <section className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-400/15 text-emerald-200">
                <Clock3 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-emerald-200">
                  Próxima fase liberada
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  Seu Pilar 3 pode continuar
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
                  A sessão ao vivo já ficou integrada ao seu progresso. Você não
                  precisa esperar a aula acontecer para seguir estudando.
                </p>
                <button
                  type="button"
                  onClick={() => router.push(`${ROUTES.app.pillar}/3`)}
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-bold text-black transition hover:bg-white/90"
                >
                  Ir para o Pilar 3
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

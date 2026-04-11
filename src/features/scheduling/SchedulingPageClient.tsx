"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Sparkles,
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

function formatGoogleCalendarDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function buildStudentGoogleCalendarLink(session?: LiveSessionStatusPayload["session"]) {
  if (!session?.requestedSlotStart || !session?.requestedSlotEnd) return null;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `BasedSpeak • Sessão ao vivo • Pilar ${session.sourcePillarId}`,
    dates: `${formatGoogleCalendarDate(session.requestedSlotStart)}/${formatGoogleCalendarDate(session.requestedSlotEnd)}`,
    details: [
      "Sua sessão ao vivo do BasedSpeak foi confirmada.",
      `Pilar de origem: ${session.sourcePillarId}`,
      session.adminDecisionReason ? `Observação: ${session.adminDecisionReason}` : null,
      session.notes ? `Notas do pedido: ${session.notes}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function formatSlotDayKey(slot: LiveSessionAvailabilitySlot) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: slot.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(slot.start));
}

function formatSlotDayLabel(slot: LiveSessionAvailabilitySlot) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: slot.timezone,
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(slot.start));
}

function formatSlotTimeLabel(slot: LiveSessionAvailabilitySlot) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: slot.timezone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(slot.start));
}

function getSessionTone(status?: string | null) {
  switch (status) {
    case "awaiting_release_window":
      return {
        badge: "Aguardando janela",
        classes:
          "border-amber-400/25 bg-amber-500/10 text-amber-100",
      };
    case "ready_to_schedule":
      return {
        badge: "Pronta para marcar",
        classes:
          "border-emerald-400/25 bg-emerald-500/10 text-emerald-100",
      };
    case "pending_confirmation":
      return {
        badge: "Pedido enviado",
        classes: "border-cyan-400/25 bg-cyan-500/10 text-cyan-100",
      };
    case "confirmed":
      return {
        badge: "Confirmada",
        classes:
          "border-violet-400/25 bg-violet-500/10 text-violet-100",
      };
    default:
      return {
        badge: "Aguardando etapa",
        classes: "border-white/10 bg-white/5 text-white/80",
      };
  }
}

function getSessionStatusLabel(status?: string | null) {
  switch (status) {
    case "awaiting_release_window":
      return "janela de agendamento aguardando abertura";
    case "ready_to_schedule":
      return "aguardando sua escolha de horário";
    case "pending_confirmation":
      return "pedido aguardando confirmação do tutor";
    case "confirmed":
      return "sessão confirmada no calendário";
    default:
      return "aguardando aprovação do Pilar 2";
  }
}

function getTimelineStepState(
  currentStatus: string | null | undefined,
  step: "approval" | "release" | "request" | "confirmation"
) {
  const order = {
    awaiting_pillar_approval: 0,
    awaiting_release_window: 1,
    ready_to_schedule: 2,
    pending_confirmation: 3,
    confirmed: 4,
    cancelled: 2,
    completed: 4,
  } as const;

  const stepIndex = {
    approval: 0,
    release: 1,
    request: 2,
    confirmation: 3,
  } as const;

  const current = order[(currentStatus || "awaiting_pillar_approval") as keyof typeof order] ?? 0;
  const target = stepIndex[step];

  if (current > target) return "done";
  if (current === target) return "current";
  return "upcoming";
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
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const previousSessionStatusRef = useRef<string | null>(null);
  const isLocalDev =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  const loadStatus = useCallback(async () => {
    if (!user?.id) return;

    setLoadingState(true);
    setError("");

    try {
      const query = isLocalDev ? `?userId=${user.id}` : "";
      const response = await fetch(`/api/scheduling/status${query}`, {
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
  }, [isLocalDev, user?.id]);

  const loadSlots = useCallback(async () => {
    if (!user?.id) return;

    setLoadingSlots(true);

    try {
      const query = isLocalDev ? `?userId=${user.id}` : "";
      const response = await fetch(
        `/api/scheduling/availability${query}`,
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
  }, [isLocalDev, user?.id]);

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
    }, 15000);

    return () => window.clearInterval(timer);
  }, [loadStatus, status?.session]);

  useEffect(() => {
    const nextStatus = status?.session?.status || null;
    const previousStatus = previousSessionStatusRef.current;

    if (nextStatus === "confirmed" && previousStatus !== "confirmed") {
      refreshUser();
    }

    previousSessionStatusRef.current = nextStatus;
  }, [refreshUser, status?.session?.status]);

  const handleRequest = async () => {
    if (!user?.id || !selectedSlot) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/scheduling/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isLocalDev ? { userId: user.id } : {}),
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
        body: JSON.stringify(isLocalDev ? { userId: user.id } : {}),
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

  const sessionTone = getSessionTone(status?.session?.status);
  const sessionStatusLabel = getSessionStatusLabel(status?.session?.status);
  const availableSlotsCount = slots.length;
  const hasRequestedSlot = Boolean(status?.session?.requestedSlotStart);
  const slotsByDay = useMemo(() => {
    const grouped = new Map<string, { key: string; label: string; timezone: string; slots: LiveSessionAvailabilitySlot[] }>();

    for (const slot of slots) {
      const key = formatSlotDayKey(slot);
      const existing = grouped.get(key);

      if (existing) {
        existing.slots.push(slot);
      } else {
        grouped.set(key, {
          key,
          label: formatSlotDayLabel(slot),
          timezone: slot.timezone,
          slots: [slot],
        });
      }
    }

    return Array.from(grouped.values());
  }, [slots]);

  const selectedDay = slotsByDay.find((day) => day.key === selectedDayKey) ?? slotsByDay[0] ?? null;
  const visibleSlots = selectedDay?.slots ?? [];
  const studentCalendarLink = useMemo(
    () => buildStudentGoogleCalendarLink(status?.session),
    [status?.session]
  );

  useEffect(() => {
    if (!slotsByDay.length) {
      setSelectedDayKey(null);
      return;
    }

    setSelectedDayKey((current) => {
      if (current && slotsByDay.some((day) => day.key === current)) {
        return current;
      }

      return slotsByDay[0].key;
    });
  }, [slotsByDay]);

  useEffect(() => {
    if (!selectedSlot || !selectedDay) return;

    const stillVisible = selectedDay.slots.some((slot) => slot.start === selectedSlot.start);
    if (!stillVisible) {
      setSelectedSlot(null);
    }
  }, [selectedDay, selectedSlot]);

  const timelineSteps = [
    {
      id: "approval",
      label: "Aprovação da etapa",
      description: "A equipe valida o fechamento do Pilar 2 para abrir o fluxo ao vivo.",
    },
    {
      id: "release",
      label: "Liberação da sessão",
      description: "A área de agendamento entra em modo prático no momento certo.",
    },
    {
      id: "request",
      label: "Escolha do horário",
      description: "Você manda um pedido real com os horários válidos para a sua conta.",
    },
    {
      id: "confirmation",
      label: "Confirmação final",
      description: "O tutor confirma pelo calendário e sua jornada segue aberta.",
    },
  ] as const;

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
    <div className="min-h-screen min-h-[100dvh] bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_30%),radial-gradient(circle_at_right,rgba(34,211,238,0.08),transparent_28%),linear-gradient(180deg,rgba(4,6,12,0.98),rgba(7,10,16,1))] p-4 md:p-8 text-white">
      <div className="max-w-5xl mx-auto space-y-6 pb-24">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white md:self-start"
          >
            Voltar ao dashboard
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
              Estado da sessão
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${sessionTone.classes}`}>
                {sessionTone.badge}
              </div>
            </div>
            <p className="mt-3 text-sm text-white/55">
              {status?.session
                ? "Seu acompanhamento ao vivo já faz parte da jornada."
                : "A área já existe na sua conta e entra em ação no momento certo."}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
              Próxima data útil
            </p>
            <p className="mt-3 text-lg font-semibold text-white">
              {formatDateTime(status?.earliestScheduleAt || undefined)}
            </p>
            <p className="mt-2 text-sm text-white/55">
              O sistema só mostra horários que já estão dentro da janela certa para você.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
              Horários visíveis agora
            </p>
            <p className="mt-3 text-lg font-semibold text-white">
              {status?.canRequestScheduling ? availableSlotsCount : 0}
            </p>
            <p className="mt-2 text-sm text-white/55">
              {status?.canRequestScheduling
                ? "Você pode escolher um horário real e mandar para confirmação."
                : "Assim que a etapa abrir, esta área passa a mostrar os horários disponíveis."}
            </p>
          </div>
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
                <div className={`mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${sessionTone.classes}`}>
                  {sessionTone.badge}
                </div>
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

            {status?.session?.adminDecisionReason && !hasRequestedSlot && (
              <div className="mt-5 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-4 text-sm text-amber-100">
                <p className="text-[10px] uppercase tracking-[0.22em] text-amber-200/80">
                  Retorno do agendamento
                </p>
                <p className="mt-2 leading-relaxed">
                  {status.session.adminDecisionReason}
                </p>
              </div>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                  Status atual
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {sessionStatusLabel}
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

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-200" />
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">
                  Linha da etapa
                </p>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {timelineSteps.map((step, index) => {
                  const stepState = getTimelineStepState(status?.session?.status, step.id);
                  const tone =
                    stepState === "done"
                      ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
                      : stepState === "current"
                        ? "border-cyan-400/25 bg-cyan-500/10 text-cyan-100"
                        : "border-white/10 bg-black/20 text-white/55";

                  return (
                    <div
                      key={step.id}
                      className={`rounded-2xl border p-4 transition-colors ${tone}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold ${
                          stepState === "done"
                            ? "border-emerald-300/30 bg-emerald-400/20 text-emerald-100"
                            : stepState === "current"
                              ? "border-cyan-300/30 bg-cyan-400/20 text-cyan-100"
                              : "border-white/10 bg-white/5 text-white/45"
                        }`}>
                          {index + 1}
                        </div>
                        <p className="text-sm font-semibold">{step.label}</p>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed opacity-80">
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {hasRequestedSlot && (
              <div className="mt-5 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-violet-200">
                      Horário atual
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {formatDateTime(status?.session?.requestedSlotStart)}
                    </p>
                    <p className="mt-1 text-sm text-white/60">
                      até {formatDateTime(status?.session?.requestedSlotEnd)}
                    </p>
                  </div>

                  {status?.session?.status === "confirmed" && studentCalendarLink && (
                    <a
                      href={studentCalendarLink}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-violet-300/20 bg-white/5 px-4 py-3 text-sm text-violet-100 transition hover:bg-white/10"
                    >
                      Adicionar na minha agenda
                    </a>
                  )}
                </div>
                <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/65">
                  Esse horário fica salvo aqui para você acompanhar, cancelar ou remarcar dentro das regras da etapa.
                </div>
              </div>
            )}

            {status?.canManageCurrentBooking && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                      Gerenciar pedido
                    </p>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/65">
                      Se precisar ajustar o horário, você pode cancelar este pedido e voltar para a seleção de slots. O painel continua mostrando tudo o que já ficou registrado.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
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
                </div>
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

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                Leitura rápida
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                A sessão ao vivo não existe para te travar. Ela entra como parte do acompanhamento. Quando estiver pronta para marcar, você escolhe um horário real. Quando o tutor confirmar, sua jornada segue aberta.
              </p>
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

            {slotsByDay.length > 0 && (
              <div className="mt-6">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                  Escolha o dia
                </p>
                <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                  {slotsByDay.map((day) => {
                    const isSelectedDay = day.key === selectedDay?.key;

                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => setSelectedDayKey(day.key)}
                        className={`min-w-[160px] rounded-2xl border px-4 py-3 text-left transition ${
                          isSelectedDay
                            ? "border-cyan-300/45 bg-cyan-400/10 shadow-[0_0_24px_rgba(34,211,238,0.12)]"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <p className="text-sm font-semibold text-white">
                          {day.label}
                        </p>
                        <p className="mt-1 text-xs text-white/45">
                          {day.slots.length} horario{day.slots.length > 1 ? "s" : ""} disponivel
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                  Horarios do dia
                </p>
                <p className="mt-1 text-sm text-white/60">
                  {selectedDay
                    ? `Selecione um horario em ${selectedDay.label}.`
                    : "Escolha um dia para ver os horarios disponiveis."}
                </p>
              </div>
              {selectedDay && (
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/55">
                  {selectedDay.timezone}
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {visibleSlots.map((slot) => {
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
                          {formatSlotTimeLabel(slot)}
                        </p>
                        <p className="mt-1 text-xs text-white/45">
                          {selectedDay?.label}
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
                Ainda não encontramos horários livres para esta janela. Se a agenda ainda não estiver conectada, esse bloco fica vazio até a operação liberar os horários reais.
              </div>
            )}

            {!loadingSlots && slots.length > 0 && visibleSlots.length === 0 && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/65">
                Esse dia nao tem horarios disponiveis no momento. Escolha outro dia acima.
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
                Pedir este horário
              </button>
            </div>
          </section>
        )}

        {status?.session?.status === "confirmed" && (
          <section className="relative overflow-hidden rounded-[28px] border border-emerald-400/20 bg-[linear-gradient(135deg,rgba(10,25,20,0.96),rgba(14,44,37,0.94),rgba(42,25,70,0.92))] p-6 shadow-[0_20px_80px_rgba(16,185,129,0.16)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.16),transparent_35%)]" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-emerald-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  Sessão confirmada
                </div>
                <h2 className="mt-4 text-3xl font-bold text-white">
                  Seu Pilar 3 já está destravado
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-emerald-50/80">
                  A sessão ao vivo já ficou integrada ao seu progresso. Agora você tem as duas coisas ao mesmo tempo: o acompanhamento marcado e a continuação da trilha liberada.
                </p>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                      Sessão marcada
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {formatDateTime(status?.session?.requestedSlotStart)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                      Estado da jornada
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      Você já pode seguir estudando
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => router.push(`${ROUTES.app.pillar}/3`)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-bold text-black transition hover:bg-white/90"
                  >
                    Ir para o Pilar 3
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  {status?.session?.calendarHtmlLink && (
                    <a
                      href={status.session.calendarHtmlLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      Abrir sessão no calendário
                      <Clock3 className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

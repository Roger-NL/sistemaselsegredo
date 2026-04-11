import { CalendarClock, CheckCircle2, ExternalLink, Sparkles } from "lucide-react";
import { getAdminSchedulingSnapshot } from "@/lib/scheduling/service";

function formatDate(value?: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusMeta(status?: string | null) {
  switch (status) {
    case "pending_confirmation":
      return {
        label: "Pedido enviado",
        classes: "border-cyan-200 bg-cyan-50 text-cyan-700",
      };
    case "confirmed":
      return {
        label: "Confirmada",
        classes: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    case "ready_to_schedule":
      return {
        label: "Liberada para marcar",
        classes: "border-violet-200 bg-violet-50 text-violet-700",
      };
    case "awaiting_release_window":
      return {
        label: "Aguardando janela",
        classes: "border-amber-200 bg-amber-50 text-amber-700",
      };
    case "awaiting_pillar_approval":
      return {
        label: "Aguardando aprovação",
        classes: "border-slate-200 bg-slate-100 text-slate-700",
      };
    case "cancelled":
      return {
        label: "Cancelada",
        classes: "border-rose-200 bg-rose-50 text-rose-700",
      };
    case "completed":
      return {
        label: "Concluída",
        classes: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    default:
      return {
        label: "Sem status",
        classes: "border-slate-200 bg-slate-100 text-slate-600",
      };
  }
}

export const dynamic = "force-dynamic";

export default async function AdminSchedulingPage() {
  const snapshot = await getAdminSchedulingSnapshot();
  const sessions = [...snapshot.sessions].sort((a, b) => {
    const left = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const right = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return right - left;
  });

  const bookedSessions = sessions.filter((session) => Boolean(session.requestedSlotStart));
  const recentRequests = bookedSessions.filter((session) =>
    ["pending_confirmation", "confirmed", "completed"].includes(session.status)
  );

  const cards = [
    { title: "Total de sessões", value: snapshot.total, tone: "text-slate-900 bg-slate-100" },
    { title: "Pedidos aguardando tutor", value: snapshot.pendingConfirmation, tone: "text-cyan-700 bg-cyan-50" },
    { title: "Sessões confirmadas", value: snapshot.confirmed, tone: "text-emerald-700 bg-emerald-50" },
    { title: "Já liberadas para marcar", value: snapshot.readyToSchedule, tone: "text-violet-700 bg-violet-50" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agendamentos</h1>
          <p className="text-sm text-slate-500">
            Aqui você acompanha o fluxo ao vivo inteiro: liberação, pedido, confirmação e o que já foi marcado pelos alunos.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
          <Sparkles className="h-3.5 w-3.5" />
          operação premium
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`inline-flex rounded-xl px-3 py-2 text-sm font-semibold ${card.tone}`}>
              {card.value}
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500">{card.title}</p>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Pedidos já marcados pelos alunos</h2>
            <p className="text-sm text-slate-500">
              Esta área mostra somente quem já escolheu um horário real e entrou no fluxo prático de agendamento.
            </p>
          </div>
        </div>

        {recentRequests.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Ainda não existe nenhum pedido de horário enviado pelos alunos.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {recentRequests.map((session) => {
              const statusMeta = getStatusMeta(session.status);

              return (
                <div key={session.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold text-slate-900">
                        {session.studentName || "Aluno sem nome"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {session.studentEmail || "E-mail não informado"}
                      </p>
                    </div>

                    <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.classes}`}>
                      {statusMeta.label}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-white bg-white p-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Horário pedido</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {formatDate(session.requestedSlotStart)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white bg-white p-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Próximo passo</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {session.status === "pending_confirmation"
                          ? "Confirmar ou remarcar no calendário"
                          : session.status === "confirmed"
                            ? "Sessão já integrada à jornada"
                            : "Acompanhar atualização"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span>Pilar {session.sourcePillarId}</span>
                    <span>•</span>
                    <span>Atualizado em {formatDate(session.updatedAt || session.createdAt)}</span>
                  </div>

                  {session.calendarHtmlLink && (
                    <a
                      href={session.calendarHtmlLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      Abrir no Google Calendar
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Todas as sessões</h2>
            <p className="text-sm text-slate-500">
              Visão completa da operação, inclusive sessões ainda aguardando aprovação ou janela de liberação.
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr] bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid">
            <span>Aluno</span>
            <span>Status</span>
            <span>Horário</span>
            <span>Calendário</span>
          </div>

          {sessions.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">
              Nenhuma sessão criada ainda.
            </div>
          ) : (
            sessions.map((session) => {
              const statusMeta = getStatusMeta(session.status);

              return (
                <div key={session.id} className="grid gap-3 border-t border-slate-200 px-5 py-4 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:items-center">
                  <div>
                    <p className="font-semibold text-slate-900">{session.studentName || "Aluno sem nome"}</p>
                    <p className="text-sm text-slate-500">{session.studentEmail || "E-mail não informado"}</p>
                  </div>

                  <div>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.classes}`}>
                      {statusMeta.label}
                    </span>
                  </div>

                  <div className="text-sm text-slate-700">
                    {session.requestedSlotStart ? formatDate(session.requestedSlotStart) : "Ainda não marcado"}
                  </div>

                  <div>
                    {session.calendarHtmlLink ? (
                      <a
                        href={session.calendarHtmlLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-violet-700 hover:text-violet-900"
                      >
                        Abrir evento
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-sm text-slate-400">Sem link ainda</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

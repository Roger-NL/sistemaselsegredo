"use client";

import { useState } from "react";
import ConciergeModal from "@/components/core/ConciergeModal";
import { LeaderboardModal } from "@/features/dashboard/LeaderboardModal";
import { PillarExamViewModal } from "@/features/study/exam/PillarExamViewModal";
import type { PillarExam } from "@/lib/exam/service";

const mockExamApproved: PillarExam = {
  id: "mock-approved-1",
  userId: "mock-user",
  userEmail: "mock@esacademy.com",
  userName: "Mock User",
  userPhone: "+351912345678",
  pillarId: 2,
  quizScore: 92,
  quizAttempts: 1,
  writtenAnswer:
    "No pilar 2, consolidei o uso de perguntas no presente. Vou usar em reunioes, praticar em audios curtos e aplicar em atendimento com clientes.",
  status: "approved",
  adminFeedback:
    "Excelente aplicacao pratica. Continue com consistencia e avance para o proximo modulo.",
  createdAt: { toDate: () => new Date("2026-03-10T14:30:00Z") },
};

const mockExamRejected: PillarExam = {
  ...mockExamApproved,
  id: "mock-rejected-1",
  pillarId: 3,
  status: "rejected",
  quizScore: 61,
  adminFeedback:
    "Precisa reforcar os exemplos de uso em contexto real. Refaça com foco em clareza e aplicacao no dia a dia.",
  createdAt: { toDate: () => new Date("2026-03-12T09:20:00Z") },
};

export default function DevModalsPage() {
  const [isConciergeLoginOpen, setConciergeLoginOpen] = useState(false);
  const [isConciergePilarOpen, setConciergePilarOpen] = useState(false);
  const [isLeaderboardOpen, setLeaderboardOpen] = useState(false);
  const [isExamApprovedOpen, setExamApprovedOpen] = useState(false);
  const [isExamRejectedOpen, setExamRejectedOpen] = useState(false);

  const resetConciergeStorage = () => {
    localStorage.removeItem("es-concierge-v1");
    localStorage.removeItem("es-concierge-dismissed-login");
    localStorage.removeItem("es-concierge-dismissed-pilar");
    alert("Estado do concierge resetado para novos testes.");
  };

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
          Modal Lab
        </p>
        <h2 className="text-3xl font-semibold text-white">
          Playground isolado de modais e overlays
        </h2>
        <p className="max-w-3xl text-slate-300">
          Aqui testamos comportamento, fechamento, backdrop e visual dos modais
          sem navegar nas rotas principais do produto.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <button
          onClick={() => setConciergeLoginOpen(true)}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-left text-sm text-white transition hover:border-emerald-400"
        >
          Abrir Concierge (trigger: login)
        </button>

        <button
          onClick={() => setConciergePilarOpen(true)}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-left text-sm text-white transition hover:border-emerald-400"
        >
          Abrir Concierge (trigger: pilar1)
        </button>

        <button
          onClick={() => setLeaderboardOpen(true)}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-left text-sm text-white transition hover:border-emerald-400"
        >
          Abrir Ranking Global
        </button>

        <button
          onClick={() => setExamApprovedOpen(true)}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-left text-sm text-white transition hover:border-emerald-400"
        >
          Abrir Registro de Missao (Aprovado)
        </button>

        <button
          onClick={() => setExamRejectedOpen(true)}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-left text-sm text-white transition hover:border-emerald-400"
        >
          Abrir Registro de Missao (Reprovado)
        </button>

        <button
          onClick={resetConciergeStorage}
          className="rounded-xl border border-amber-600/60 bg-amber-950/30 px-4 py-3 text-left text-sm text-amber-200 transition hover:border-amber-400"
        >
          Resetar estado local do Concierge
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-300">
        Nota: o modal de ranking consulta dados reais do Firestore. Os demais
        exemplos desta tela usam estado local ou dados mockados.
      </div>

      <ConciergeModal
        trigger="login"
        isOpen={isConciergeLoginOpen}
        onClose={() => setConciergeLoginOpen(false)}
        onConnect={() => setConciergeLoginOpen(false)}
      />

      <ConciergeModal
        trigger="pilar1"
        isOpen={isConciergePilarOpen}
        onClose={() => setConciergePilarOpen(false)}
        onConnect={() => setConciergePilarOpen(false)}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
      />

      <PillarExamViewModal
        pillarId={mockExamApproved.pillarId}
        exam={mockExamApproved}
        isOpen={isExamApprovedOpen}
        onClose={() => setExamApprovedOpen(false)}
      />

      <PillarExamViewModal
        pillarId={mockExamRejected.pillarId}
        exam={mockExamRejected}
        isOpen={isExamRejectedOpen}
        onClose={() => setExamRejectedOpen(false)}
      />
    </section>
  );
}

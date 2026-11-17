"use client";

import { useCallback, useEffect, useMemo } from "react";
import { studentWorkspace } from "@/features/dashboard/workspace-store";
import { readGuestLearning, type GuestStorage } from "@/features/dashboard/guest-learning";
import { workspaceFetch, workspaceStorage } from "@/features/local-testing/sandbox";
import type { StudentWorkspace } from "@/contracts/workspace";
import { useStudentWorkspace } from "@/features/dashboard/use-student-workspace";
import { EMPTY_LESSON_DASHBOARD_INPUT, getLessonDashboardSnapshot } from "./lesson-dashboard";
import { restoreConclusionState } from "./lesson-conclusion";
import { decodeLessonAccountSnapshot, encodeLessonAccountSnapshot } from "./lesson-account-snapshot";
import { createLessonStorage } from "./lesson-storage";

type ResetStore = Pick<typeof studentWorkspace, "getSnapshot" | "stage" | "flush">;
export type LessonCompletionReceipt = "account" | "guest-local" | "guest-session";
type CompletionStore = Pick<typeof studentWorkspace, "getSnapshot" | "flush" | "refresh" | "hasPendingChanges">;

function completedLesson(raw?: string | null) {
  const progress = decodeLessonAccountSnapshot(raw ?? null)?.progress;
  if (!progress || restoreConclusionState(progress.conclusion).phase !== "summary") return false;
  const { completedUnits, totalUnits } = getLessonDashboardSnapshot(progress);
  return completedUnits === totalUnits;
}

export async function verifyLessonCompletion(store: CompletionStore, generation: number, guestStorage: () => GuestStorage, fetcher: typeof workspaceFetch): Promise<LessonCompletionReceipt> {
  const owner = store.getSnapshot();
  const changed = "Seu percurso mudou. Confira o progresso atual antes de sair.";
  if (owner.generation !== generation || owner.conflict) throw new Error(changed);
  if (!owner.workspace && owner.status === "unauthenticated") {
    const raw = owner.guestLearning?.lessonSnapshot;
    if (!completedLesson(raw)) throw new Error("Não foi possível confirmar as 49 etapas nesta sessão.");
    try {
      return readGuestLearning(guestStorage()).lessonSnapshot === raw ? "guest-local" : "guest-session";
    } catch { return "guest-session"; }
  }
  const account = owner.workspace;
  if (!account || !["active", "pending"].includes(account.account.status)) throw new Error(changed);
  const uid = account.account.id, revision = account.learning.revision;
  if (owner.status === "error" && !store.hasPendingChanges()) await store.refresh();
  else await store.flush();
  function currentAccount() {
    const state = store.getSnapshot(), current = state.workspace;
    if (!current || state.generation !== generation || current.account.id !== uid || current.learning.revision !== revision || state.conflict) throw new Error(changed);
    if (state.status !== "ready" || state.error || store.hasPendingChanges()) throw new Error("Não foi possível confirmar seu avanço na conta. Tente novamente.");
    return current;
  }
  currentAccount();
  const response = await fetcher("/api/student/workspace", { credentials: "same-origin", cache: "no-store" });
  if (response.status === 401) {
    currentAccount();
    await store.refresh();
    throw new Error(changed);
  }
  if (!response.ok) throw new Error("Não foi possível confirmar seu avanço na conta. Tente novamente.");
  const saved = await response.json() as StudentWorkspace;
  const current = currentAccount();
  if (saved.account.id !== current.account.id || !["active", "pending"].includes(saved.account.status) || saved.learning.revision !== current.learning.revision
    || saved.learning.saveVersion !== current.learning.saveVersion || saved.learning.lessonSnapshot !== current.learning.lessonSnapshot) {
    await store.refresh(); throw new Error(changed);
  }
  if (!completedLesson(saved.learning.lessonSnapshot)) throw new Error("Não foi possível confirmar as 49 etapas na sua conta.");
  return "account";
}

export async function resetLessonAccountProgress(store: ResetStore, expectedGeneration: number) {
  const owner = store.getSnapshot();
  if (owner.generation !== expectedGeneration || !store.stage("lessonSnapshot", encodeLessonAccountSnapshot(EMPTY_LESSON_DASHBOARD_INPUT), expectedGeneration)) throw new Error("Atualize seu percurso antes de recomeçar.");
  await store.flush();
  const result = store.getSnapshot();
  if (result.generation !== expectedGeneration || result.workspace?.account.id !== owner.workspace?.account.id || result.workspace?.learning.revision !== owner.workspace?.learning.revision) throw new Error("Sua conta ou percurso mudou. Confira o estado atual antes de recomeçar.");
  if (result.error || result.conflict) throw new Error(result.error || "Confira as versões do percurso antes de recomeçar.");
}

/** Shared source for the dashboard and all five phases of the lesson. */
export function useLessonAccountProgress() {
  const state = useStudentWorkspace();
  useEffect(() => { void studentWorkspace.load(); }, []);
  const raw = (state.workspace?.learning ?? state.guestLearning)?.lessonSnapshot ?? null;
  const input = useMemo(() => decodeLessonAccountSnapshot(raw)?.progress ?? EMPTY_LESSON_DASHBOARD_INPUT, [raw]);
  const storage = useMemo(() => createLessonStorage(studentWorkspace, state.generation), [state.generation]);
  const permitted = !state.workspace || ["active", "pending"].includes(state.workspace.account.status);
  const ready = !state.conflict && permitted && (state.status === "ready" || state.status === "unauthenticated");
  const retryingCompletion = !state.conflict && permitted && state.status === "error" && !!state.workspace && restoreConclusionState(input.conclusion).phase === "summary";
  const verifyCompletion = useCallback(() => verifyLessonCompletion(studentWorkspace, state.generation, workspaceStorage, workspaceFetch), [state.generation]);
  const refresh = useCallback(() => { void studentWorkspace.refresh(); }, []);
  const reset = useCallback(() => resetLessonAccountProgress(studentWorkspace, state.generation), [state.generation]);
  const beginEdit = useCallback(() => { studentWorkspace.beginEdit(state.generation); }, [state.generation]);
  const endEdit = useCallback(() => { studentWorkspace.endEdit(state.generation); }, [state.generation]);
  return { ready, retryingCompletion, input, storage, scopeKey: `${state.workspace?.account.id ?? "guest"}:${state.workspace?.learning.revision ?? 0}:${state.generation}`,
    verifyCompletion, completionVersion: state.workspace?.learning.saveVersion ?? 0, hasAccount: !!state.workspace,
    storageAvailable: !state.notice.includes("navegador não permitiu"), refresh, reset, beginEdit, endEdit, saving: state.saving,
    error: !permitted ? "Seu acesso à aula está indisponível. Fale com o professor." : state.error, notice: state.notice };
}

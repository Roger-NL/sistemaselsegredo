"use client";

import { useCallback, useEffect, useMemo } from "react";
import { studentWorkspace } from "@/features/dashboard/workspace-store";
import { useStudentWorkspace } from "@/features/dashboard/use-student-workspace";
import { EMPTY_LESSON_DASHBOARD_INPUT } from "./lesson-dashboard";
import { decodeLessonAccountSnapshot, encodeLessonAccountSnapshot } from "./lesson-account-snapshot";
import { createLessonStorage } from "./lesson-storage";

type ResetStore = Pick<typeof studentWorkspace, "getSnapshot" | "stage" | "flush">;
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
  const refresh = useCallback(() => { void studentWorkspace.refresh(); }, []);
  const reset = useCallback(() => resetLessonAccountProgress(studentWorkspace, state.generation), [state.generation]);
  const beginEdit = useCallback(() => { studentWorkspace.beginEdit(state.generation); }, [state.generation]);
  const endEdit = useCallback(() => { studentWorkspace.endEdit(state.generation); }, [state.generation]);
  return { ready, input, storage, scopeKey: `${state.workspace?.account.id ?? "guest"}:${state.workspace?.learning.revision ?? 0}:${state.generation}`,
    storageAvailable: !state.notice.includes("navegador não permitiu"), refresh, reset, beginEdit, endEdit, saving: state.saving,
    error: !permitted ? "Seu acesso à aula está indisponível. Fale com o professor." : state.error, notice: state.notice };
}

"use client";

import { useSyncExternalStore } from "react";
import { studentWorkspace } from "./workspace-store";

export function useStudentWorkspace() {
  const state = useSyncExternalStore(studentWorkspace.subscribe, studentWorkspace.getSnapshot, studentWorkspace.getServerSnapshot);
  return { ...state, refresh: studentWorkspace.load };
}

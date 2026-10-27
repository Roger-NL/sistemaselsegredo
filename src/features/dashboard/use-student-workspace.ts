"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { studentWorkspace } from "./workspace-store";

export function useStudentWorkspace() {
  const state = useSyncExternalStore(studentWorkspace.subscribe, studentWorkspace.getSnapshot, studentWorkspace.getServerSnapshot);
  const [validated, setValidated] = useState(false);
  useEffect(() => {
    let mounted = true;
    void studentWorkspace.load().finally(() => { if (mounted) setValidated(true); });
    const refresh = () => { if (document.visibilityState !== "hidden") void studentWorkspace.load(); };
    const flush = () => { void studentWorkspace.flush(); };
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (studentWorkspace.hasPendingChanges()) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("online", refresh);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", beforeUnload);
    return () => { mounted = false; window.removeEventListener("focus", refresh); window.removeEventListener("online", refresh); document.removeEventListener("visibilitychange", refresh); window.removeEventListener("pagehide", flush); window.removeEventListener("beforeunload", beforeUnload); };
  }, []);
  return { ...(validated ? state : studentWorkspace.getServerSnapshot()), refresh: studentWorkspace.load };
}

"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { studentWorkspace } from "./workspace-store";

/** One validated session shared by the panel, conversation and study. */
export function StudentWorkspaceSession() {
  const pathname = usePathname();
  const learning = pathname === "/dashboard" || pathname === "/demo" || pathname === "/demo/estudo";
  const authentication = pathname === "/comecar" || pathname === "/adm/entrar";
  const previous = useRef("");

  useEffect(() => { if (authentication) studentWorkspace.reset(); }, [authentication]);

  useEffect(() => {
    if (!learning) return;
    void studentWorkspace.load();
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
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [learning]);

  useEffect(() => {
    const wasLearning = ["/dashboard", "/demo", "/demo/estudo"].includes(previous.current);
    previous.current = pathname;
    if (learning && wasLearning) void studentWorkspace.refresh();
  }, [pathname, learning]);
  return null;
}

"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { studentWorkspace } from "./workspace-store";
import { subscribeWorkspaceRefresh } from "./workspace-refresh";

/** One validated session shared by the panel, conversation and study. */
export function StudentWorkspaceSession() {
  const pathname = usePathname();
  const learning = pathname === "/dashboard" || pathname === "/demo" || pathname === "/demo/estudo";
  const authentication = pathname === "/comecar" || pathname === "/adm/entrar";
  const previous = useRef("");

  useEffect(() => { if (authentication) studentWorkspace.reset(); }, [authentication]);

  useEffect(() => {
    if (!learning) return;
    void studentWorkspace.load(true);
    const stopRefresh = subscribeWorkspaceRefresh(() => { void studentWorkspace.load(true); }, pathname === "/dashboard");
    const flush = () => { void studentWorkspace.flush(); };
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (studentWorkspace.hasPendingChanges()) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      stopRefresh();
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [learning, pathname]);

  useEffect(() => {
    const wasLearning = ["/dashboard", "/demo", "/demo/estudo"].includes(previous.current);
    previous.current = pathname;
    if (learning && wasLearning) void studentWorkspace.refresh();
  }, [pathname, learning]);
  return null;
}

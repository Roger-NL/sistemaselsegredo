"use client";

import { TestControlsOverlay } from "@/features/superuser/TestControls";
import { LearningConflict } from "./LearningConflict";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { studentWorkspace } from "./workspace-store";
import { shouldPollWorkspace, subscribeWorkspaceRefresh } from "./workspace-refresh";
import { useStudentWorkspace } from "./use-student-workspace";

/** One validated session shared by the panel, conversation and study. */
export function StudentWorkspaceSession() {
  const pathname = usePathname();
  const { workspace } = useStudentWorkspace();
  const poll = shouldPollWorkspace(pathname, workspace?.account.status);
  const learning = pathname === "/dashboard" || pathname === "/demo" || pathname === "/demo/estudo" || pathname === "/adm";
  const authentication = pathname === "/comecar" || pathname === "/adm/entrar";
  const previous = useRef("");

  useEffect(() => { if (authentication) studentWorkspace.reset(); }, [authentication]);

  useEffect(() => {
    if (!learning) return;
    void studentWorkspace.load();
    const flush = () => { void studentWorkspace.flush(); };
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (studentWorkspace.hasPendingChanges()) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [learning]);

  useEffect(() => {
    if (!learning) return;
    return subscribeWorkspaceRefresh(() => { void studentWorkspace.load(true); }, poll);
  }, [learning, poll]);

  useEffect(() => {
    const changed = (event:StorageEvent) => {
      if (event.key !== "basedspeak.test-progress.changed") return;
      // This signal is only a refresh hint; identity and revision come from the server.
      studentWorkspace.reset(); void studentWorkspace.load();
    };
    window.addEventListener("storage",changed);
    return ()=>window.removeEventListener("storage",changed);
  },[]);

  useEffect(() => {
    const wasLearning = ["/dashboard", "/demo", "/demo/estudo"].includes(previous.current);
    previous.current = pathname;
    if (learning && wasLearning) void studentWorkspace.refresh();
  }, [pathname, learning]);
  return <><TestControlsOverlay /><LearningConflict /></>;
}

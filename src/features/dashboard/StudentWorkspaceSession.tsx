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
  const { workspace, status } = useStudentWorkspace();
  const owner = workspace?.account.canTest === true;
  const poll = shouldPollWorkspace(pathname, workspace?.account.status, owner);
  const pollInterval = owner ? 5_000 : 30_000;
  const learning = pathname === "/dashboard" || pathname === "/demo" || pathname === "/demo/estudo" || pathname === "/adm";
  const authentication = pathname === "/comecar" || pathname === "/adm/entrar";
  const previous = useRef("");
  const previousOwner = useRef<{ uid: string; revision: number } | null>(null);

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
    return subscribeWorkspaceRefresh(() => {
      if (owner) void studentWorkspace.checkForReset();
      else void studentWorkspace.load(true);
    }, poll, window, document, pollInterval);
  }, [learning, poll, owner, pollInterval]);

  useEffect(() => {
    const changed = (event:StorageEvent) => {
      if (event.key !== "basedspeak.test-progress.changed") return;
      // This signal is only a refresh hint; identity and revision come from the server.
      void studentWorkspace.checkForReset();
    };
    window.addEventListener("storage",changed);
    return ()=>window.removeEventListener("storage",changed);
  },[]);

  useEffect(() => {
    if (!workspace) {
      if (status === "unauthenticated") previousOwner.current = null;
      return;
    }
    const before = previousOwner.current;
    previousOwner.current = owner && workspace ? { uid: workspace.account.id, revision: workspace.learning.revision } : null;
    if (owner && workspace && before?.uid === workspace.account.id && before.revision !== workspace.learning.revision) {
      window.dispatchEvent(new Event("basedspeak.presentation.changed"));
    }
  }, [owner, workspace, status]);

  useEffect(() => {
    const wasLearning = ["/dashboard", "/demo", "/demo/estudo"].includes(previous.current);
    previous.current = pathname;
    if (learning && wasLearning) void studentWorkspace.refresh();
  }, [pathname, learning]);
  return <><TestControlsOverlay /><LearningConflict /></>;
}

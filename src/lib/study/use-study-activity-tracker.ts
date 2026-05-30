"use client";

import { useEffect, useMemo, useRef } from "react";
import { buildStudyModuleKey } from "@/lib/study/stats";

const IDLE_THRESHOLD_MS = 60_000;
const HEARTBEAT_INTERVAL_MS = 15_000;

interface UseStudyActivityTrackerOptions {
  pillarId: number;
  moduleId?: string | null;
  enabled: boolean;
}

export function useStudyActivityTracker({
  pillarId,
  moduleId,
  enabled,
}: UseStudyActivityTrackerOptions) {
  const moduleKey = useMemo(() => buildStudyModuleKey(pillarId, moduleId), [moduleId, pillarId]);
  const currentModuleRef = useRef(moduleKey);
  const lastInteractionAtRef = useRef(0);
  const lastTickAtRef = useRef(0);
  const bufferedSecondsRef = useRef(0);

  useEffect(() => {
    currentModuleRef.current = moduleKey;
  }, [moduleKey]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    let disposed = false;

    const flush = async (reason: "interval" | "visibility" | "module-change" | "unmount") => {
      const seconds = bufferedSecondsRef.current;
      if (seconds <= 0) {
        return;
      }

      bufferedSecondsRef.current = 0;

      try {
        await fetch("/api/study/heartbeat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          keepalive: reason !== "interval",
          body: JSON.stringify({
            pillarId,
            moduleId: currentModuleRef.current,
            activeSeconds: seconds,
          }),
        });
      } catch (error) {
        console.error("Failed to flush study heartbeat:", error);
      }
    };

    const markInteraction = () => {
      lastInteractionAtRef.current = Date.now();
    };

    const interval = window.setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - lastTickAtRef.current;
      lastTickAtRef.current = now;

      if (document.hidden) {
        return;
      }

      if (now - lastInteractionAtRef.current >= IDLE_THRESHOLD_MS) {
        return;
      }

      bufferedSecondsRef.current += Math.floor(elapsedMs / 1000);

      if (bufferedSecondsRef.current >= HEARTBEAT_INTERVAL_MS / 1000) {
        void flush("interval");
      }
    }, HEARTBEAT_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        void flush("visibility");
        return;
      }

      markInteraction();
      lastTickAtRef.current = Date.now();
    };

    const handlePageHide = () => {
      if (!disposed) {
        void flush("unmount");
      }
    };

    markInteraction();
    lastTickAtRef.current = Date.now();

    window.addEventListener("pointerdown", markInteraction, { passive: true });
    window.addEventListener("touchstart", markInteraction, { passive: true });
    window.addEventListener("keydown", markInteraction);
    window.addEventListener("scroll", markInteraction, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      disposed = true;
      window.clearInterval(interval);
      window.removeEventListener("pointerdown", markInteraction);
      window.removeEventListener("touchstart", markInteraction);
      window.removeEventListener("keydown", markInteraction);
      window.removeEventListener("scroll", markInteraction);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      void flush("module-change");
    };
  }, [enabled, moduleKey, pillarId]);
}

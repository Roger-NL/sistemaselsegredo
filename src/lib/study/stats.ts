export interface StudyStats {
  totalActiveSeconds: number;
  byPillar?: Record<string, number>;
  byModule?: Record<string, number>;
  lastStudiedAt?: string;
}

export function normalizeStudyStats(value: unknown): StudyStats | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const candidate = value as {
    totalActiveSeconds?: unknown;
    byPillar?: unknown;
    byModule?: unknown;
    lastStudiedAt?: unknown;
  };

  const normalizeNumericMap = (map: unknown) => {
    if (!map || typeof map !== "object") {
      return undefined;
    }

    const entries = Object.entries(map).filter(([, item]) => typeof item === "number" && Number.isFinite(item));
    return entries.length ? Object.fromEntries(entries) : undefined;
  };

  return {
    totalActiveSeconds:
      typeof candidate.totalActiveSeconds === "number" && Number.isFinite(candidate.totalActiveSeconds)
        ? candidate.totalActiveSeconds
        : 0,
    byPillar: normalizeNumericMap(candidate.byPillar),
    byModule: normalizeNumericMap(candidate.byModule),
    lastStudiedAt: typeof candidate.lastStudiedAt === "string" ? candidate.lastStudiedAt : undefined,
  };
}

export function formatStudyDuration(totalActiveSeconds?: number) {
  const safeSeconds = Math.max(0, Math.trunc(totalActiveSeconds ?? 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  return `${hours}h ${minutes.toString().padStart(2, "0")}min`;
}

export function buildStudyModuleKey(pillarId: number, moduleId?: string | null) {
  const raw = moduleId?.trim() || `pillar-${pillarId}-overview`;
  return raw.replace(/[.[\]#/]/g, "_");
}

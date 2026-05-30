import { redirect } from "next/navigation";
import { PLANETS } from "@/data/curriculum";
import { SPECIALIZATIONS_CONTENT } from "@/data/specializations-content";
import { SpecializationStudyPage } from "@/features/decision/SpecializationStudyPage";
import { getRequestPrincipal } from "@/lib/auth/principal";
import { adminDb } from "@/lib/firebase-admin";
import { ROUTES } from "@/lib/routes";

type StoredProgressSnapshot = {
  eligibleForSpecialization?: boolean;
  completedPillars?: number[];
};

function hasCompletedAllPillars(localPillarStatus: Record<string, unknown> | undefined) {
  if (!localPillarStatus) {
    return false;
  }

  return Array.from({ length: 9 }, (_, index) => `pilar-${index + 1}`).every(
    (pillarId) => localPillarStatus[pillarId] === "completed"
  );
}

function canAccessSpecialization(progressSnapshot: StoredProgressSnapshot | undefined, localPillarStatus: Record<string, unknown> | undefined) {
  if (progressSnapshot?.eligibleForSpecialization === true) {
    return true;
  }

  if (Array.isArray(progressSnapshot?.completedPillars) && progressSnapshot.completedPillars.length >= 9) {
    return true;
  }

  return hasCompletedAllPillars(localPillarStatus);
}

interface EspecialidadePageProps {
  params: Promise<{ id: string }>;
}

export default async function EspecialidadePage({ params }: EspecialidadePageProps) {
  const { id: specId } = await params;
  const principal = await getRequestPrincipal(undefined, {
    allowBearer: false,
    allowSessionCookie: true,
    allowLegacyCookie: true,
  });

  if (!principal) {
    redirect(ROUTES.app.specialties);
  }

  const specExists = PLANETS.some((planet) => planet.id === specId) && Boolean(SPECIALIZATIONS_CONTENT[specId]);

  if (!specExists) {
    redirect(ROUTES.app.specialties);
  }

  const userSnapshot = await adminDb.collection("users").doc(principal.uid).get();
  const userData = userSnapshot.data() as {
    localPillarStatus?: Record<string, unknown>;
    progressSnapshot?: StoredProgressSnapshot;
  } | undefined;

  if (!canAccessSpecialization(userData?.progressSnapshot, userData?.localPillarStatus)) {
    redirect(ROUTES.app.specialties);
  }

  return <SpecializationStudyPage specId={specId} />;
}

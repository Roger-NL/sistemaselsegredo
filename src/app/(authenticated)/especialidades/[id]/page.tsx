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

function canAccessSpecialization(progressSnapshot: StoredProgressSnapshot | undefined) {
  if (progressSnapshot?.eligibleForSpecialization === true) {
    return true;
  }

  if (Array.isArray(progressSnapshot?.completedPillars) && progressSnapshot.completedPillars.length >= 9) {
    return true;
  }

  return false;
}

interface EspecialidadePageProps {
  params: Promise<{ id: string }>;
}

export default async function EspecialidadePage({ params }: EspecialidadePageProps) {
  const { id: specId } = await params;
  const principal = await getRequestPrincipal(undefined, {
    allowBearer: false,
    allowSessionCookie: true,
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
    progressSnapshot?: StoredProgressSnapshot;
  } | undefined;

  if (principal.role !== "admin" && !canAccessSpecialization(userData?.progressSnapshot)) {
    redirect(ROUTES.app.specialties);
  }

  return <SpecializationStudyPage specId={specId} />;
}

import { redirect } from "next/navigation";
import { PLANETS } from "@/data/curriculum";
import { SPECIALIZATIONS_CONTENT } from "@/data/specializations-content";
import { SpecializationStudyPage } from "@/features/decision/SpecializationStudyPage";
import { getRequestUserContext } from "@/lib/auth/request-user";
import { adminDb } from "@/lib/firebase-admin";
import { ROUTES } from "@/lib/routes";

function hasCompletedAllPillars(localPillarStatus: Record<string, unknown> | undefined) {
  if (!localPillarStatus) {
    return false;
  }

  return Array.from({ length: 9 }, (_, index) => `pilar-${index + 1}`).every(
    (pillarId) => localPillarStatus[pillarId] === "completed"
  );
}

interface EspecialidadePageProps {
  params: Promise<{ id: string }>;
}

export default async function EspecialidadePage({ params }: EspecialidadePageProps) {
  const { id: specId } = await params;
  const { sessionUserId } = await getRequestUserContext();

  if (!sessionUserId) {
    redirect(ROUTES.app.specialties);
  }

  const specExists = PLANETS.some((planet) => planet.id === specId) && Boolean(SPECIALIZATIONS_CONTENT[specId]);

  if (!specExists) {
    redirect(ROUTES.app.specialties);
  }

  const userSnapshot = await adminDb.collection("users").doc(sessionUserId).get();
  const userData = userSnapshot.data() as { localPillarStatus?: Record<string, unknown> } | undefined;

  if (!hasCompletedAllPillars(userData?.localPillarStatus)) {
    redirect(ROUTES.app.specialties);
  }

  return <SpecializationStudyPage specId={specId} />;
}

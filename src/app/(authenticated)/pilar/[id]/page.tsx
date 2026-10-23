import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PILLARS_CONTENT } from "@/data/pillars-content";
import PillarPageClient from "@/features/study/PillarPageClient";
import { getRequestPrincipal } from "@/lib/auth/principal";
import { getAdminDb } from "@/server/firebase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PillarPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const pillarId = Number(id);
    if (!Number.isInteger(pillarId) || pillarId < 1 || pillarId > 9 || !PILLARS_CONTENT[pillarId]) {
        notFound();
    }
    const principal = await getRequestPrincipal(undefined, {
        allowBearer: false,
        allowSessionCookie: true,
    });

    // Authorization Logic
    const isAdmin = principal?.role === 'admin';
    const isPremium = principal?.subscriptionStatus === 'premium';
    const isFreePillar = pillarId === 1;
    let highestUnlockedPillar = 1;

    if (principal && !isAdmin && isPremium) {
        const profile = await getAdminDb().collection("users").doc(principal.uid).get();
        const profileData = profile.data() as {
            approvedPillar?: number;
            progressSnapshot?: { highestUnlockedPillar?: number };
        } | undefined;
        highestUnlockedPillar =
            typeof profileData?.progressSnapshot?.highestUnlockedPillar === "number"
                ? profileData.progressSnapshot.highestUnlockedPillar
                : typeof profileData?.approvedPillar === "number"
                    ? profileData.approvedPillar
                    : 1;
    }

    let pillarData = null;

    if (isFreePillar || isAdmin || (isPremium && pillarId <= highestUnlockedPillar)) {
        // User is authorized to see the content
        pillarData = PILLARS_CONTENT[pillarId] || null;
    } else {
        // User is NOT authorized.
        // We pass NULL. The text is physically NOT sent to the client.
        pillarData = null;
    }

    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Carregando...</div>}>
            <PillarPageClient
                pillarId={pillarId}
                initialContent={pillarData}
            />
        </Suspense>
    );
}

import { Suspense } from "react";
import { PILLARS_CONTENT } from "@/data/pillars-content";
import PillarPageClient from "@/features/study/PillarPageClient";
import { getRequestPrincipal } from "@/lib/auth/principal";

export default async function PillarPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const pillarId = Number(id) || 1;
    const principal = await getRequestPrincipal(undefined, {
        allowBearer: false,
        allowSessionCookie: true,
        allowLegacyCookie: true,
    });

    // Authorization Logic
    const isPremium = principal?.subscriptionStatus === 'premium' || principal?.role === 'admin';
    const isFreePillar = pillarId === 1;

    let pillarData = null;

    if (isFreePillar || isPremium) {
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

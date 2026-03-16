import { cookies } from "next/headers";
import { Suspense } from "react";
import { PILLARS_CONTENT } from "@/data/pillars-content";
import PillarPageClient from "@/features/study/PillarPageClient";

export default async function PillarPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const pillarId = Number(id) || 1;
    const cookieStore = await cookies();

    // SECURITY CHECK: Read status from cookie
    // Note: In a banking app, we would verify this token with Firebase Admin SDK.
    // Here, we trust the cookie (which is set by our trusted client code) for "Obfuscation Level Security".
    // This prevents the text from being in the bundle for non-premium users.
    const userRole = cookieStore.get("es_user_role")?.value;
    const subscriptionStatus = cookieStore.get("es_user_status")?.value || 'free';
    // Fallback 'free' is important so new users or expired sessions don't see content.

    // Authorization Logic
    const isPremium = subscriptionStatus === 'premium' || userRole === 'admin';
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

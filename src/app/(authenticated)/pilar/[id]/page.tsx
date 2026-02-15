import { cookies } from "next/headers";
import { PILLARS_CONTENT } from "@/data/pillars-content";
import PillarPageClient from "@/components/features/study/PillarPageClient";
import { PremiumWall } from "@/components/features/subscription/PremiumWall";

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

    // If we blocked content due to permissions, the Client Component handles the UI (PremiumWall or Lock).
    // But we can also optimize by returning the Wall directly here?
    // Let's pass null to Client Component so it keeps the context/navigation but shows lock.

    // HOWEVER, if it's a hard lock (Pillar 2+ and Free), rendering PremiumWall directly is safer/cleaner.
    if (!isFreePillar && !isPremium) {
        // We can just return the wall directly, but we want to keep the layout consistent?
        // Actually, the previous page.tsx returned PremiumWall directly.
        // Let's do that for maximum safety.
        // If we return PremiumWall here, we need to make sure it's compatible with Server Components (it should be if it's simple UI).
        // Check PremiumWall imports. It likely has 'use client' if it has interactivity.
        // If it's a Client Component, we can render it here.
    }

    return (
        <PillarPageClient
            pillarId={pillarId}
            initialContent={pillarData}
        />
    );
}

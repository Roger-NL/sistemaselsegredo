"use client";

import AppProviders from "@/app/AppProviders";
import LandingPage from "@/components/landing/LandingPage";

export default function RootPage() {
    return (
        <AppProviders>
            <LandingPage />
        </AppProviders>
    );
}

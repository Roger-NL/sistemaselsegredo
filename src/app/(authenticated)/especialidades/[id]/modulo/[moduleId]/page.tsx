"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default function ModulePage() {
    const router = useRouter();
    const params = useParams();
    const specId = params.id as string;

    useEffect(() => {
        router.replace(`${ROUTES.app.specialties}/${specId}`);
    }, [router, specId]);

    return null;
}

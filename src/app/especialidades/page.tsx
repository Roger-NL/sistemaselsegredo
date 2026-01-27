"use client";

import { TubesBackground } from "@/components/ui/neon-flow";
import { DecisionMatrix } from "@/components/features/decision/DecisionMatrix";

export default function EspecialidadesPage() {
    return (
        <TubesBackground className="h-screen">
            <DecisionMatrix />
        </TubesBackground>
    );
}

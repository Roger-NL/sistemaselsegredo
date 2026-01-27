"use client";
import { WavyBackground } from "@/components/ui/wavy-background";

export function TheUniverse() {
  return (
    <div className="fixed inset-0 z-0">
      <WavyBackground 
        containerClassName="h-full w-full"
        backgroundFill="#050505"
        colors={[
          "#1C0B19", // Dark Purple Base
          "#2E933C", // Sci-Fi Green
          "#EEF4D4", // Pale Green (Text Match)
          "#D4AF37"  // Gold (Sun Match)
        ]}
        waveOpacity={0.3}
        blur={30}
        speed="slow"
        waveWidth={100}
      />
    </div>
  );
}
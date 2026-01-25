"use client";

import React from "react";

// Simple CSS based Sun fallback with radial gradient and subtle pulsating animation
export function LightSun() {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Pulsating radial gradient */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 opacity-70 animate-pulse" />
            {/* Core circle */}
            <div className="relative w-[60%] h-[60%] rounded-full bg-amber-500 shadow-[0_0_30px_10px_rgba(245,158,11,0.6)]" />
        </div>
    );
}

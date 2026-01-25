'use client';

import { useEffect, useRef, useState } from 'react';

const FRAME_COUNT = 192;
const FRAME_RATE = 24; // Standard Cinematic FPS
const FRAME_INTERVAL = 1000 / FRAME_RATE;
const PATH_PREFIX = '/ceularanja/frame_';

export function BackgroundVideo() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const requestRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);
    const frameIndexRef = useRef(0);

    // 1. Preload Images
    useEffect(() => {
        // Start loading all images
        const loadedImages: HTMLImageElement[] = new Array(FRAME_COUNT);

        for (let i = 0; i < FRAME_COUNT; i++) {
            const img = new Image();
            const num = i.toString().padStart(3, '0');
            img.src = `${PATH_PREFIX}${num}.jpg`;
            loadedImages[i] = img;
        }

        setImages(loadedImages);

        // Cleanup not really needed for Image objects unless we want to stop loading
    }, []);

    // 2. Animation Loop

    const CROSSFADE_FRAMES = 64; // Increased overlap (approx 2.6s) for imperceptible loop

    const animate = (time: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = time;
        const deltaTime = time - lastTimeRef.current;

        // Only update if enough time has passed for the next frame
        if (deltaTime >= FRAME_INTERVAL) {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');

            if (canvas && ctx && images.length > 0) {
                const w = canvas.width;
                const h = canvas.height;
                const totalFrames = FRAME_COUNT;
                const loopStartFrame = CROSSFADE_FRAMES; // 64
                const blendStartFrame = totalFrames - CROSSFADE_FRAMES; // 128

                // Helper to draw an image covering the canvas
                const drawFrame = (img: HTMLImageElement, opacity: number = 1) => {
                    if (!img || !img.complete || img.naturalHeight === 0) return;

                    const iw = img.width;
                    const ih = img.height;
                    const scale = Math.max(w / iw, h / ih);
                    const sw = iw * scale;
                    const sh = ih * scale;
                    const dx = (w - sw) / 2;
                    const dy = (h - sh) / 2;

                    ctx.globalAlpha = opacity;
                    ctx.drawImage(img, dx, dy, sw, sh);
                    ctx.globalAlpha = 1.0; // Reset
                };

                // Clear
                ctx.fillStyle = '#050505';
                ctx.fillRect(0, 0, w, h);

                const currentFrameIdx = frameIndexRef.current;

                // Draw base frame
                drawFrame(images[currentFrameIdx]);

                // Handle Blending
                if (currentFrameIdx >= blendStartFrame) {
                    // We are in the end zone
                    // We want to fade in frames 0 to CROSSFADE_FRAMES
                    const overlayFrameIdx = currentFrameIdx - blendStartFrame;
                    // Smoothstep Interpolation: t * t * (3 - 2 * t)
                    const t = (overlayFrameIdx + 1) / CROSSFADE_FRAMES;
                    const alpha = t * t * (3 - 2 * t);

                    if (images[overlayFrameIdx]) {
                        drawFrame(images[overlayFrameIdx], alpha);
                    }
                }

                // Advance Frame
                let nextFrame = currentFrameIdx + 1;

                // Loop Logic
                if (nextFrame >= totalFrames) {
                    // We have finished blending. Seamless jump.
                    nextFrame = loopStartFrame;
                }

                frameIndexRef.current = nextFrame;
                lastTimeRef.current = time;
            }
        }

        requestRef.current = requestAnimationFrame(animate);
    };

    // 3. Handle Resize
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                // Set actual canvas size to avoid blurring (High DPI support)
                const dpr = window.devicePixelRatio || 1;
                canvasRef.current.width = window.innerWidth * dpr;
                canvasRef.current.height = window.innerHeight * dpr;

                // Ensure the context knows we want sharp images if downscaling, or smooth if upscaling
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                }
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial size

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 4. Start Animation
    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [images]); // Re-bind if images array reference changes (though we only set it once)

    return (
        <div className="fixed top-0 left-0 w-full h-full -z-50 overflow-hidden bg-[#050505]">
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full object-cover"
                style={{
                    // Cinematic Color Grading - DARKENED
                    // Contrast pulls details out.
                    // Saturation makes it look 'expensive'.
                    // Brightness reduced to 0.7 for darker ambiance.
                    filter: 'contrast(1.2) saturate(1.2) brightness(0.7)'
                }}
            />
            {/* 
               GLASS FILM OVERLAY 
               Separates the busy background from content.
               - backdrop-blur-sm: Subtle blur to reduce high-frequency noise.
               - bg-black/60: Darkened significantly (was 20%) to dim the bright orange sky.
            */}
            <div className="absolute inset-0 backdrop-blur-[3px] bg-black/60 pointer-events-none" />

            {/* Vignette Overlay for Depth and Focus */}
            <div
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.4) 100%)'
                }}
            />
        </div>
    );
}

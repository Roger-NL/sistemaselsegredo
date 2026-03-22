export const neonTubesHtml = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nebula Effect</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html,
        body {
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #000;
        }

        canvas {
            display: block;
            width: 100%;
            height: 100%;
        }
    </style>
</head>

<body>
    <canvas id="tubes-canvas"></canvas>

    <script type="module">
        import TubesCursor from 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js';

        const canvas = document.getElementById('tubes-canvas');

        // Helper for random colors (nebula palette)
        const randomColors = (count) => {
            const nebulaPalette = [
                "#d4af37", "#c9a227", "#b8860b",
                "#8b5cf6", "#7c3aed", "#6d28d9",
                "#ec4899", "#db2777", "#be185d",
                "#3b82f6", "#2563eb", "#1d4ed8",
                "#14b8a6", "#0d9488", "#0f766e",
            ];
            return new Array(count)
                .fill(0)
                .map(() => nebulaPalette[Math.floor(Math.random() * nebulaPalette.length)]);
        };

        const navigatorProfile = navigator;
        const deviceMemory = typeof navigatorProfile.deviceMemory === 'number' ? navigatorProfile.deviceMemory : 8;
        const hardwareConcurrency = navigatorProfile.hardwareConcurrency || 8;
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const isLowPowerDevice = hardwareConcurrency <= 4 || deviceMemory <= 4;
        const useLowerQuality = isLowPowerDevice || pixelRatio > 1.75;
        const interactionFrameInterval = 1000 / (isLowPowerDevice ? 20 : 30);
        const idleFrameInterval = 1000 / (isLowPowerDevice ? 10 : 16);
        const tubesPreset = useLowerQuality
            ? {
                count: 8,
                radius: 0.07,
                radiusSegments: 6,
                tubularSegments: 120,
                length: 32,
                spread: { x: 3.2, y: 0.7, z: 1.8 },
                flow: 0.35,
                rotation: 0.08,
                lightIntensity: 100,
            }
            : {
                count: 12,
                radius: 0.08,
                radiusSegments: 8,
                tubularSegments: 200,
                length: 40,
                spread: { x: 3.5, y: 0.8, z: 2.0 },
                flow: 0.4,
                rotation: 0.1,
                lightIntensity: 150,
            };

        // Initialize TubesCursor
        const app = TubesCursor(canvas, {
            tubes: {
                count: tubesPreset.count,
                colors: ["#d4af37", "#8b5cf6", "#ec4899", "#3b82f6", "#14b8a6", "#f59e0b"],
                geometry: {
                    radius: tubesPreset.radius,
                    radiusSegments: tubesPreset.radiusSegments,
                    tubularSegments: tubesPreset.tubularSegments,
                    length: tubesPreset.length,
                    spread: tubesPreset.spread
                },
                speed: { flow: tubesPreset.flow, rotation: tubesPreset.rotation },
                lights: {
                    intensity: tubesPreset.lightIntensity,
                    colors: ["#d4af37", "#8b5cf6", "#ec4899", "#3b82f6", "#14b8a6"]
                }
            }
        });

        const randomizeColors = () => {
            const colors = randomColors(6);
            const lightsColors = randomColors(5);
            try {
                app.tubes.setColors(colors);
                app.tubes.setLightsColors(lightsColors);
            } catch (e) { }
        };

        let isIdle = true;
        let idleAnimationId = null;
        let idleStartTimeoutId = null;
        let interactionAnimationId = null;
        let lastInteractionFrame = 0;
        let lastIdleFrame = 0;
        let pendingPointer = null;
        let currentPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

        const scheduleIdleStart = (delay = 2000) => {
            if (idleStartTimeoutId) {
                clearTimeout(idleStartTimeoutId);
            }

            idleStartTimeoutId = window.setTimeout(() => {
                if (document.visibilityState !== 'visible') return;
                if (isIdle) return;

                isIdle = true;
                lastIdleFrame = 0;
                if (idleAnimationId === null) {
                    idleAnimationId = requestAnimationFrame(runIdleAnimation);
                }
            }, delay);
        };

        const stopIdle = () => {
            if (idleStartTimeoutId) {
                clearTimeout(idleStartTimeoutId);
                idleStartTimeoutId = null;
            }

            if (isIdle) {
                isIdle = false;
            }

            if (idleAnimationId !== null) {
                cancelAnimationFrame(idleAnimationId);
                idleAnimationId = null;
            }

            scheduleIdleStart(2000);
        };

        const dispatchSyntheticMove = (x, y) => {
            const rect = canvas.getBoundingClientRect();
            const offsetX = x - rect.left;
            const offsetY = y - rect.top;
            const movementX = x - currentPos.x;
            const movementY = y - currentPos.y;
            if (Math.abs(movementX) < 0.2 && Math.abs(movementY) < 0.2) return;

            const eventInit = {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: x,
                clientY: y,
                pageX: x,
                pageY: y,
                screenX: x,
                screenY: y,
                movementX,
                movementY
            };

            const mouseEvent = new MouseEvent('mousemove', eventInit);
            Object.defineProperty(mouseEvent, 'offsetX', { value: offsetX });
            Object.defineProperty(mouseEvent, 'offsetY', { value: offsetY });
            canvas.dispatchEvent(mouseEvent);

            if (typeof PointerEvent === 'function') {
                const pointerEvent = new PointerEvent('pointermove', {
                    ...eventInit,
                    pointerId: 1,
                    pointerType: 'mouse',
                    isPrimary: true
                });

                Object.defineProperty(pointerEvent, 'offsetX', { value: offsetX });
                Object.defineProperty(pointerEvent, 'offsetY', { value: offsetY });
                canvas.dispatchEvent(pointerEvent);
            }

            window.dispatchEvent(new MouseEvent('mousemove', eventInit));

            currentPos = { x, y };
        };

        const flushInteraction = (now = performance.now()) => {
            interactionAnimationId = null;
            if (!pendingPointer || document.visibilityState !== 'visible') return;

            if (now - lastInteractionFrame < interactionFrameInterval) {
                interactionAnimationId = requestAnimationFrame(flushInteraction);
                return;
            }

            lastInteractionFrame = now;
            const { x, y } = pendingPointer;
            pendingPointer = null;
            dispatchSyntheticMove(x, y);
        };

        const queueInteraction = (x, y) => {
            pendingPointer = { x, y };
            if (interactionAnimationId === null) {
                interactionAnimationId = requestAnimationFrame(flushInteraction);
            }
        };

        const runIdleAnimation = (now = performance.now()) => {
            if (!isIdle || document.visibilityState !== 'visible') {
                idleAnimationId = null;
                return;
            }

            idleAnimationId = requestAnimationFrame(runIdleAnimation);
            if (now - lastIdleFrame < idleFrameInterval) return;
            lastIdleFrame = now;

            const time = now * 0.0003;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const radiusX = window.innerWidth * 0.4;
            const radiusY = window.innerHeight * 0.3;

            const x = centerX + Math.sin(time) * radiusX * Math.cos(time * 0.5);
            const y = centerY + Math.sin(time * 1.3) * radiusY * 0.7 + Math.cos(time * 0.4) * radiusY * 0.3;

            queueInteraction(x, y);
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                if (isIdle && idleAnimationId === null) {
                    lastIdleFrame = 0;
                    idleAnimationId = requestAnimationFrame(runIdleAnimation);
                }
                if (pendingPointer && interactionAnimationId === null) {
                    interactionAnimationId = requestAnimationFrame(flushInteraction);
                }
                return;
            }

            if (idleAnimationId !== null) {
                cancelAnimationFrame(idleAnimationId);
                idleAnimationId = null;
            }
            if (interactionAnimationId !== null) {
                cancelAnimationFrame(interactionAnimationId);
                interactionAnimationId = null;
            }
        };

        window.addEventListener('message', (event) => {
            if (!event || !event.data) return;

            if (event.data.type === 'randomize') {
                randomizeColors();
                return;
            }

            if (event.data.type !== 'mousemove') return;

            stopIdle();
            queueInteraction(event.data.clientX, event.data.clientY);
        });

        document.addEventListener('visibilitychange', handleVisibilityChange);

        idleAnimationId = requestAnimationFrame(runIdleAnimation);
    </script>
</body>

</html>`;

"use client"

import { useEffect, useRef, useState, memo } from "react"
import type { Feature, FeatureCollection, GeoJsonProperties, MultiPolygon, Polygon, Position } from "geojson"
import * as d3 from "d3"

interface RotatingEarthProps {
    width?: number
    height?: number
    className?: string
    onClick?: () => void
}

type LandFeature = Feature<Polygon | MultiPolygon, GeoJsonProperties>
type LandData = FeatureCollection<Polygon | MultiPolygon, GeoJsonProperties>
type GlobeDot = { lng: number; lat: number }
type GlobeCache = { landData: LandData; dots: GlobeDot[] }
type PerformanceNavigator = Navigator & { deviceMemory?: number }

const FULL_ROTATION_SPEED = 12
const TWO_PI = Math.PI * 2

// Cache em memória
let memoryCache: GlobeCache | null = null
let memoryCachePromise: Promise<GlobeCache | null> | null = null

function isLandData(value: unknown): value is LandData {
    if (!value || typeof value !== "object") return false

    const candidate = value as { type?: unknown; features?: unknown[] }
    return candidate.type === "FeatureCollection" && Array.isArray(candidate.features)
}

function isGlobeCache(value: unknown): value is GlobeCache {
    if (!value || typeof value !== "object") return false

    const candidate = value as { landData?: unknown; dots?: unknown[] }
    return isLandData(candidate.landData) && Array.isArray(candidate.dots)
}

// Tenta carregar do localStorage
function loadFromStorage(): typeof memoryCache {
    if (typeof window === 'undefined') return null
    try {
        const stored = localStorage.getItem('globe-cache')
        if (stored) {
            const parsed: unknown = JSON.parse(stored)
            return isGlobeCache(parsed) ? parsed : null
        }
    } catch {
        // Ignora erros de parse
    }
    return null
}

// Salva no localStorage
function saveToStorage(data: typeof memoryCache) {
    if (typeof window === 'undefined' || !data) return
    try {
        localStorage.setItem('globe-cache', JSON.stringify(data))
    } catch {
        // Ignora erros de storage
    }
}

function getGlobePerformanceProfile() {
    if (typeof navigator === "undefined") {
        return { maxDpr: 2, targetFps: 45 }
    }

    const navigatorProfile = navigator as PerformanceNavigator
    const deviceMemory = typeof navigatorProfile.deviceMemory === "number" ? navigatorProfile.deviceMemory : 8
    const hardwareConcurrency = navigatorProfile.hardwareConcurrency ?? 8
    const isLowPowerDevice = hardwareConcurrency <= 4 || deviceMemory <= 4

    return {
        maxDpr: isLowPowerDevice ? 1.5 : 2,
        targetFps: isLowPowerDevice ? 30 : 45,
    }
}

async function loadGlobeCache(): Promise<GlobeCache | null> {
    if (memoryCache) return memoryCache

    const storedCache = loadFromStorage()
    if (storedCache) {
        memoryCache = storedCache
        return storedCache
    }

    if (!memoryCachePromise) {
        memoryCachePromise = (async () => {
            try {
                const response = await fetch(
                    "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/physical/ne_110m_land.json"
                )
                if (!response.ok) throw new Error("Failed")

                const data: unknown = await response.json()
                if (!isLandData(data)) {
                    throw new Error("Invalid globe data format")
                }

                const dots = generateDots(data)
                const cache = { landData: data, dots }
                saveToStorage(cache)
                memoryCache = cache
                return cache
            } catch (error) {
                console.error("Failed to load globe data:", error)
                return null
            } finally {
                memoryCachePromise = null
            }
        })()
    }

    return memoryCachePromise
}

function pointInPolygon(point: [number, number], polygon: Position[]): boolean {
    const [x, y] = point
    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i]
        const [xj, yj] = polygon[j]
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
            inside = !inside
        }
    }
    return inside
}

function pointInFeature(point: [number, number], feature: LandFeature): boolean {
    const geometry = feature.geometry
    if (geometry.type === "Polygon") {
        if (!pointInPolygon(point, geometry.coordinates[0])) return false
        for (let i = 1; i < geometry.coordinates.length; i++) {
            if (pointInPolygon(point, geometry.coordinates[i])) return false
        }
        return true
    }

    if (geometry.type === "MultiPolygon") {
        for (const polygon of geometry.coordinates) {
            if (pointInPolygon(point, polygon[0])) {
                let inHole = false
                for (let i = 1; i < polygon.length; i++) {
                    if (pointInPolygon(point, polygon[i])) {
                        inHole = true
                        break
                    }
                }
                if (!inHole) return true
            }
        }
    }

    return false
}

function generateDots(features: LandData) {
    const dots: GlobeDot[] = []
    const step = 1.5

    features.features.forEach((feature) => {
        const bounds = d3.geoBounds(feature)
        const [[minLng, minLat], [maxLng, maxLat]] = bounds

        for (let lng = minLng; lng <= maxLng; lng += step) {
            for (let lat = minLat; lat <= maxLat; lat += step) {
                if (pointInFeature([lng, lat], feature)) {
                    dots.push({ lng, lat })
                }
            }
        }
    })

    return dots
}

function RotatingEarthComponent({
    width = 500,
    height = 500,
    className = "",
    onClick
}: RotatingEarthProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [size, setSize] = useState(Math.min(width, height))

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const updateSize = () => {
            const { width: nextWidth, height: nextHeight } = container.getBoundingClientRect()
            if (nextWidth === 0 || nextHeight === 0) return

            const nextSize = Math.floor(Math.min(nextWidth, nextHeight))
            setSize((currentSize) => (currentSize === nextSize ? currentSize : nextSize))
        }

        updateSize()

        window.addEventListener("resize", updateSize)

        const observer =
            typeof ResizeObserver === "undefined"
                ? null
                : new ResizeObserver(() => {
                    updateSize()
                })

        observer?.observe(container)

        return () => {
            window.removeEventListener("resize", updateSize)
            observer?.disconnect()
        }
    }, [])

    useEffect(() => {
        if (!canvasRef.current || size === 0) return

        const canvas = canvasRef.current
        const context = canvas.getContext("2d", { alpha: true, desynchronized: true })
        if (!context) return

        const containerWidth = size
        const containerHeight = size
        const radius = size / 2.5
        const { maxDpr, targetFps } = getGlobePerformanceProfile()
        const frameInterval = 1000 / targetFps

        const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
        canvas.width = size * dpr
        canvas.height = size * dpr
        canvas.style.width = "100%"
        canvas.style.height = "100%"
        canvas.style.aspectRatio = "1 / 1"
        context.setTransform(dpr, 0, 0, dpr, 0, 0)

        const projection = d3
            .geoOrthographic()
            .scale(radius)
            .translate([size / 2, size / 2])
            .clipAngle(90)

        const path = d3.geoPath().projection(projection).context(context)
        const graticule = d3.geoGraticule()

        let landFeatures: LandData | null = null
        let allDots: GlobeDot[] = []
        let animationId = 0
        let lastFrameTime = 0
        let isDisposed = false
        const rotation: [number, number, number] = [0, -15, 0]

        const render = () => {
            context.clearRect(0, 0, containerWidth, containerHeight)
            const currentScale = projection.scale()
            const scaleFactor = currentScale / radius

            // Globo
            context.beginPath()
            context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI)
            context.fillStyle = "rgba(4, 5, 8, 0.94)"
            context.fill()
            context.strokeStyle = "#EEF4D4"
            context.lineWidth = 1.5 * scaleFactor
            context.stroke()

            if (landFeatures) {
                // Graticule
                context.beginPath()
                path(graticule())
                context.strokeStyle = "#EEF4D4"
                context.lineWidth = 0.4 * scaleFactor
                context.globalAlpha = 0.12
                context.stroke()
                context.globalAlpha = 1

                // Contornos dos continentes
                context.beginPath()
                landFeatures.features.forEach((feature) => path(feature))
                context.strokeStyle = "#EEF4D4"
                context.lineWidth = 0.7 * scaleFactor
                context.globalAlpha = 0.5
                context.stroke()
                context.globalAlpha = 1

                // Pontos
                context.fillStyle = "#EEF4D4"
                context.globalAlpha = 0.6
                context.beginPath()
                allDots.forEach((dot) => {
                    const projected = projection([dot.lng, dot.lat])
                    if (projected) {
                        context.moveTo(projected[0] + 1.0 * scaleFactor, projected[1])
                        context.arc(projected[0], projected[1], 1.0 * scaleFactor, 0, TWO_PI)
                    }
                })
                context.fill()
                context.globalAlpha = 1
            }
        }

        const stopAnimation = () => {
            if (animationId !== 0) {
                cancelAnimationFrame(animationId)
                animationId = 0
            }
        }

        const animate = (now: number) => {
            if (isDisposed) return

            if (document.visibilityState !== "visible") {
                stopAnimation()
                return
            }

            if (lastFrameTime !== 0 && now - lastFrameTime < frameInterval) {
                animationId = requestAnimationFrame(animate)
                return
            }

            const elapsed = lastFrameTime === 0 ? frameInterval : now - lastFrameTime
            lastFrameTime = now
            rotation[0] = (rotation[0] + (FULL_ROTATION_SPEED * elapsed) / 1000) % 360
            projection.rotate(rotation)
            render()
            animationId = requestAnimationFrame(animate)
        }

        const startAnimation = () => {
            if (animationId !== 0 || isDisposed) return
            lastFrameTime = 0
            render()
            animationId = requestAnimationFrame(animate)
        }

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                startAnimation()
                return
            }
            stopAnimation()
        }

        const init = async () => {
            const cache = await loadGlobeCache()
            if (isDisposed) return

            if (cache) {
                landFeatures = cache.landData
                allDots = cache.dots
            }

            setIsLoading(false)
            startAnimation()
        }

        document.addEventListener("visibilitychange", handleVisibilityChange)
        init()

        return () => {
            isDisposed = true
            document.removeEventListener("visibilitychange", handleVisibilityChange)
            stopAnimation()
        }
    }, [height, size, width])

    return (
        <div ref={containerRef} className={`relative cursor-pointer ${className}`} onClick={onClick}>
            <canvas
                ref={canvasRef}
                className="block h-full w-full"
                style={{ background: "transparent", objectFit: "contain" }}
            />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#EEF4D4]/50 border-t-[#EEF4D4] rounded-full animate-spin" />
                </div>
            )}
        </div>
    )
}

const RotatingEarth = memo(RotatingEarthComponent)
export default RotatingEarth
export { RotatingEarth }

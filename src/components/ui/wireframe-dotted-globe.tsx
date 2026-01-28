"use client"

import { useEffect, useRef, useState, memo } from "react"
import * as d3 from "d3"

interface RotatingEarthProps {
    width?: number
    height?: number
    className?: string
    onClick?: () => void
}

// Cache em memória
let memoryCache: { landData: any; dots: { lng: number; lat: number }[] } | null = null

// Tenta carregar do localStorage
function loadFromStorage(): typeof memoryCache {
    if (typeof window === 'undefined') return null
    try {
        const stored = localStorage.getItem('globe-cache')
        if (stored) {
            return JSON.parse(stored)
        }
    } catch (e) {
        // Ignora erros de parse
    }
    return null
}

// Salva no localStorage
function saveToStorage(data: typeof memoryCache) {
    if (typeof window === 'undefined' || !data) return
    try {
        localStorage.setItem('globe-cache', JSON.stringify(data))
    } catch (e) {
        // Ignora erros de storage
    }
}

function RotatingEarthComponent({
    width = 500,
    height = 500,
    className = "",
    onClick
}: RotatingEarthProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!canvasRef.current) return

        const canvas = canvasRef.current
        const context = canvas.getContext("2d")
        if (!context) return

        const size = Math.min(width, height, window.innerWidth - 40, window.innerHeight - 100)

        // Force square to prevent distortion
        const containerWidth = size
        const containerHeight = size
        const radius = size / 2.5

        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        canvas.width = size * dpr
        canvas.height = size * dpr
        canvas.style.width = `${size}px`
        canvas.style.height = `${size}px`
        context.scale(dpr, dpr)

        const projection = d3
            .geoOrthographic()
            .scale(radius)
            .translate([size / 2, size / 2])
            .clipAngle(90)

        const path = d3.geoPath().projection(projection).context(context)

        let landFeatures: any = null
        let allDots: { lng: number; lat: number }[] = []
        let animationId: number
        const rotation: [number, number, number] = [0, -15, 0]

        const render = () => {
            context.clearRect(0, 0, containerWidth, containerHeight)
            const currentScale = projection.scale()
            const scaleFactor = currentScale / radius

            // Globo
            context.beginPath()
            context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI)
            context.fillStyle = "rgba(0, 0, 0, 0.3)"
            context.fill()
            context.strokeStyle = "#EEF4D4"
            context.lineWidth = 1.5 * scaleFactor
            context.stroke()

            if (landFeatures) {
                // Graticule
                const graticule = d3.geoGraticule()
                context.beginPath()
                path(graticule())
                context.strokeStyle = "#EEF4D4"
                context.lineWidth = 0.4 * scaleFactor
                context.globalAlpha = 0.12
                context.stroke()
                context.globalAlpha = 1

                // Contornos dos continentes
                context.beginPath()
                landFeatures.features.forEach((feature: any) => path(feature))
                context.strokeStyle = "#EEF4D4"
                context.lineWidth = 0.7 * scaleFactor
                context.globalAlpha = 0.5
                context.stroke()
                context.globalAlpha = 1

                // Pontos
                context.fillStyle = "#EEF4D4"
                allDots.forEach((dot) => {
                    const projected = projection([dot.lng, dot.lat])
                    if (projected && projected[0] >= 0 && projected[0] <= containerWidth &&
                        projected[1] >= 0 && projected[1] <= containerHeight) {
                        context.beginPath()
                        context.arc(projected[0], projected[1], 1.0 * scaleFactor, 0, 2 * Math.PI)
                        context.globalAlpha = 0.6
                        context.fill()
                    }
                })
                context.globalAlpha = 1
            }
        }

        const animate = () => {
            rotation[0] += 0.2
            projection.rotate(rotation)
            render()
            animationId = requestAnimationFrame(animate)
        }

        const pointInPolygon = (point: [number, number], polygon: number[][]): boolean => {
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

        const pointInFeature = (point: [number, number], feature: any): boolean => {
            const geometry = feature.geometry
            if (geometry.type === "Polygon") {
                if (!pointInPolygon(point, geometry.coordinates[0])) return false
                for (let i = 1; i < geometry.coordinates.length; i++) {
                    if (pointInPolygon(point, geometry.coordinates[i])) return false
                }
                return true
            } else if (geometry.type === "MultiPolygon") {
                for (const polygon of geometry.coordinates) {
                    if (pointInPolygon(point, polygon[0])) {
                        let inHole = false
                        for (let i = 1; i < polygon.length; i++) {
                            if (pointInPolygon(point, polygon[i])) { inHole = true; break }
                        }
                        if (!inHole) return true
                    }
                }
            }
            return false
        }

        const generateDots = (features: any) => {
            const dots: { lng: number; lat: number }[] = []
            const step = 1.5 // Espaçamento entre pontos

            features.features.forEach((feature: any) => {
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

        const init = async () => {
            // Tenta cache
            if (!memoryCache) {
                memoryCache = loadFromStorage()
            }

            if (memoryCache) {
                landFeatures = memoryCache.landData
                allDots = memoryCache.dots
                setIsLoading(false)
                animate()
                return
            }

            // Carrega da internet
            try {
                const response = await fetch(
                    "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/physical/ne_110m_land.json"
                )
                if (!response.ok) throw new Error("Failed")

                landFeatures = await response.json()
                allDots = generateDots(landFeatures)

                // Salva cache
                memoryCache = { landData: landFeatures, dots: allDots }
                saveToStorage(memoryCache)

                setIsLoading(false)
                animate()
            } catch (e) {
                console.error("Failed to load globe data:", e)
                setIsLoading(false)
                animate() // Roda mesmo sem dados
            }
        }

        init()

        return () => {
            if (animationId) cancelAnimationFrame(animationId)
        }
    }, [width, height])

    return (
        <div className={`relative cursor-pointer ${className}`} onClick={onClick}>
            <canvas
                ref={canvasRef}
                className="w-full h-auto"
                style={{ maxWidth: "100%", height: "auto", background: "transparent" }}
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

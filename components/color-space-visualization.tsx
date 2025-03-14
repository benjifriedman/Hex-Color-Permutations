"use client"

import { useEffect, useRef } from "react"

interface ColorSpaceVisualizationProps {
  colors: string[]
  width?: number
  height?: number
}

export function ColorSpaceVisualization({ colors, width = 800, height = 200 }: ColorSpaceVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const r = Number.parseInt(hex.slice(0, 2), 16)
    const g = Number.parseInt(hex.slice(2, 4), 16)
    const b = Number.parseInt(hex.slice(4, 6), 16)
    return { r, g, b }
  }

  // Get color brightness (0-255)
  const getBrightness = (r: number, g: number, b: number) => {
    return (r * 299 + g * 587 + b * 114) / 1000
  }

  // Get hue from RGB (0-360)
  const getHue = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0

    if (max === min) {
      return 0 // grayscale
    }

    const d = max - min
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }

    return h * 60
  }

  // Draw the visualization
  useEffect(() => {
    if (!canvasRef.current || colors.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Sample colors if there are too many
    const sampleSize = Math.min(colors.length, 2000)
    const sampleStep = Math.max(1, Math.floor(colors.length / sampleSize))
    const sampledColors = []

    for (let i = 0; i < colors.length; i += sampleStep) {
      sampledColors.push(colors[i])
    }

    // Sort colors by hue for a more pleasing visualization
    const colorData = sampledColors
      .map((color) => {
        const rgb = hexToRgb(color)
        return {
          color,
          hue: getHue(rgb.r, rgb.g, rgb.b),
          brightness: getBrightness(rgb.r, rgb.g, rgb.b),
        }
      })
      .sort((a, b) => a.hue - b.hue)

    // Draw color spectrum
    const barWidth = width / colorData.length

    colorData.forEach((data, i) => {
      ctx.fillStyle = `#${data.color}`
      ctx.fillRect(i * barWidth, 0, barWidth + 1, height) // +1 to avoid gaps
    })

    // Add a subtle gradient overlay for depth
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.1)")
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.1)")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }, [colors, width, height])

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border">
      <canvas ref={canvasRef} width={width} height={height} className="w-full h-auto" />
    </div>
  )
}

